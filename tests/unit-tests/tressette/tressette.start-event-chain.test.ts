import 'jest'
import { AddressInfo } from 'net'
import { createServer, Server as HttpServer } from 'http'
import { Server as IoServer } from 'socket.io'
import app from '../../../src/app'
import { createIo, resolveTrickRevealMs, resolveTurnTimeoutSeconds, TRICK_REVEAL_MS, TURN_TIMEOUT_SECONDS } from '../../../src/sockets'
import { tressetteTableStore } from '../../../src/tressette/tressette-table.store'
import { resetStoresForTests } from '../../../src/tressette/tressette-mode.store'
import { clearStartPipelineDispatcher } from '../../../src/tressette/tressette-start.pipeline'

describe('turn timeout defaults', () => {
    const previousNodeEnv = process.env.NODE_ENV
    const previousTimeoutEnv = process.env.TRESSETTE_TURN_TIMEOUT_SECONDS
    const previousRevealEnv = process.env.TRESSETTE_TRICK_REVEAL_MS

    afterEach(() => {
        process.env.NODE_ENV = previousNodeEnv
        process.env.TRESSETTE_TURN_TIMEOUT_SECONDS = previousTimeoutEnv
        process.env.TRESSETTE_TRICK_REVEAL_MS = previousRevealEnv
    })

    test('non-production default timeout is 5 seconds', () => {
        process.env.NODE_ENV = 'development'
        delete process.env.TRESSETTE_TURN_TIMEOUT_SECONDS

        expect(resolveTurnTimeoutSeconds()).toBe(5)
    })

    test('production default timeout is 20 seconds', () => {
        process.env.NODE_ENV = 'production'
        delete process.env.TRESSETTE_TURN_TIMEOUT_SECONDS

        expect(resolveTurnTimeoutSeconds()).toBe(20)
    })

    test('env timeout override wins when valid', () => {
        process.env.NODE_ENV = 'development'
        process.env.TRESSETTE_TURN_TIMEOUT_SECONDS = '9'

        expect(resolveTurnTimeoutSeconds()).toBe(9)
    })

    test('trick reveal default is 2000ms and supports env override', () => {
        delete process.env.TRESSETTE_TRICK_REVEAL_MS
        expect(resolveTrickRevealMs()).toBe(2000)

        process.env.TRESSETTE_TRICK_REVEAL_MS = '3500'
        expect(resolveTrickRevealMs()).toBe(3500)
    })
})

describe('Tressette start event chain', () => {
    let server: HttpServer
    let io: IoServer
    let baseUrl: string

    beforeAll((done) => {
        server = createServer(app.express)
        io = createIo(server)

        server.listen(0, () => {
            const address = server.address() as AddressInfo
            baseUrl = `http://127.0.0.1:${address.port}`
            done()
        })
    })

    beforeEach(() => {
        resetStoresForTests()
    })

    afterAll((done) => {
        clearStartPipelineDispatcher()
        io.close()
        server.close(() => done())
    })

    test('start success emits hand-started + immediate turn-started and schedules timeout', async () => {
        const created = tressetteTableStore.create({ owner: 'Pierpaolo' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

        const emitted: Array<{ event: string, payload: any }> = []
        const toSpy = jest.spyOn(io, 'to').mockImplementation((_room: string) => {
            return {
                emit: (event: string, payload: any) => {
                    emitted.push({ event, payload })
                }
            } as any
        })

        const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((..._args: any[]) => {
            return { mocked: true } as any
        }) as typeof setTimeout)

        const intervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(((..._args: any[]) => {
            return { mockedInterval: true } as any
        }) as typeof setInterval)

        try {
            const response = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/start?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'Pierpaolo' })
            })

            expect(response.status).toBe(200)
            const body = await response.json()
            expect(body.status).toBe('in_game')

            const eventNames = emitted.map((x) => x.event)
            const tableUpdatedIdx = eventNames.indexOf('tressette:table-updated')
            const handStartedIdx = eventNames.indexOf('tressette:hand-started')
            const turnStartedIdx = eventNames.indexOf('tressette:turn-started')
            const turnUpdatedIdx = eventNames.indexOf('tressette:turn-updated')

            expect(tableUpdatedIdx).toBeGreaterThanOrEqual(0)
            expect(handStartedIdx).toBeGreaterThan(tableUpdatedIdx)
            expect(turnStartedIdx).toBeGreaterThan(handStartedIdx)
            expect(turnUpdatedIdx).toBeGreaterThan(turnStartedIdx)

            const turnStarted = emitted[turnStartedIdx].payload
            expect(turnStarted.tableId).toBe(created.tableId)
            expect(turnStarted.timeoutSeconds).toBe(TURN_TIMEOUT_SECONDS)
            expect(turnStarted.secondsRemaining).toBe(TURN_TIMEOUT_SECONDS)
            expect(turnStarted.currentPlayer).toEqual(
                expect.objectContaining({
                    username: expect.any(String),
                    position: expect.any(String)
                })
            )
            expect(typeof turnStarted.turnDeadlineMs).toBe('number')
            expect(turnStarted.turnDeadlineMs).toBeGreaterThan(Date.now())
            expect(turnStarted.myHand).toBeNull()

            const turnUpdated = emitted[turnUpdatedIdx].payload
            expect(turnUpdated.tableId).toBe(created.tableId)
            expect(turnUpdated.currentPlayer.username).toBe(turnStarted.currentPlayer.username)
            expect(turnUpdated.timeoutSeconds).toBe(TURN_TIMEOUT_SECONDS)
            expect(typeof turnUpdated.secondsRemaining).toBe('number')
            expect(turnUpdated.myHand).toBeNull()

            expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), TURN_TIMEOUT_SECONDS * 1000)
            expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000)
        } finally {
            intervalSpy.mockRestore()
            timeoutSpy.mockRestore()
            toSpy.mockRestore()
        }
    })

    test('timeout autoplay emits card-played and next turn-started', async () => {
        const created = tressetteTableStore.create({ owner: 'Pierpaolo' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

        const emitted: Array<{ event: string, payload: any }> = []
        const scheduledCallbacks: Array<() => void> = []

        const toSpy = jest.spyOn(io, 'to').mockImplementation((_room: string) => {
            return {
                emit: (event: string, payload: any) => {
                    emitted.push({ event, payload })
                }
            } as any
        })

        const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((callback: TimerHandler) => {
            scheduledCallbacks.push(callback as () => void)
            return { mocked: true } as any
        }) as typeof setTimeout)

        const intervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(((..._args: any[]) => {
            return { mockedInterval: true } as any
        }) as typeof setInterval)

        try {
            const response = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/start?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'Pierpaolo' })
            })

            expect(response.status).toBe(200)
            expect(scheduledCallbacks.length).toBeGreaterThan(0)

            const firstTimeout = scheduledCallbacks[0]
            firstTimeout()

            const cardPlayed = emitted.find((entry) => entry.event === 'tressette:card-played')
            expect(cardPlayed).toBeDefined()
            expect(cardPlayed?.payload.source).toBe('timeout_auto')

            const turnStartedEvents = emitted.filter((entry) => entry.event === 'tressette:turn-started')
            expect(turnStartedEvents.length).toBeGreaterThanOrEqual(2)

            const turnUpdatedEvents = emitted.filter((entry) => entry.event === 'tressette:turn-updated')
            expect(turnUpdatedEvents.length).toBeGreaterThanOrEqual(2)
            expect(timeoutSpy).toHaveBeenCalled()
            expect(intervalSpy).toHaveBeenCalled()
        } finally {
            intervalSpy.mockRestore()
            timeoutSpy.mockRestore()
            toSpy.mockRestore()
        }
    })

    test('trick-ended delays next turn-started by reveal window and does not schedule turn timeout early', async () => {
        const created = tressetteTableStore.create({ owner: 'Pierpaolo' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

        const emitted: Array<{ event: string, payload: any }> = []
        const scheduled: Array<{ callback: () => void, delay: number }> = []

        const toSpy = jest.spyOn(io, 'to').mockImplementation((_room: string) => {
            return {
                emit: (event: string, payload: any) => {
                    emitted.push({ event, payload })
                }
            } as any
        })

        const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((callback: TimerHandler, delay?: number) => {
            scheduled.push({ callback: callback as () => void, delay: Number(delay) })
            return { mocked: true } as any
        }) as typeof setTimeout)

        const intervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(((..._args: any[]) => {
            return { mockedInterval: true } as any
        }) as typeof setInterval)

        try {
            const response = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/start?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'Pierpaolo' })
            })

            expect(response.status).toBe(200)
            expect(scheduled[0].delay).toBe(TURN_TIMEOUT_SECONDS * 1000)

            const initialTurnStartedCount = emitted.filter((entry) => entry.event === 'tressette:turn-started').length

            scheduled[0].callback()
            scheduled[1].callback()
            scheduled[2].callback()
            const turnStartedBeforeFourth = emitted.filter((entry) => entry.event === 'tressette:turn-started').length
            scheduled[3].callback()

            const trickEndedIndex = emitted.findIndex((entry) => entry.event === 'tressette:trick-ended')
            const turnStartedAfterFourth = emitted.filter((entry) => entry.event === 'tressette:turn-started').length

            expect(trickEndedIndex).toBeGreaterThanOrEqual(0)
            expect(turnStartedAfterFourth).toBe(turnStartedBeforeFourth)

            const revealTimeout = scheduled.find((entry) => entry.delay === TRICK_REVEAL_MS)
            expect(revealTimeout).toBeDefined()

            const countBeforeReveal = emitted.filter((entry) => entry.event === 'tressette:turn-started').length
            revealTimeout!.callback()
            const countAfterReveal = emitted.filter((entry) => entry.event === 'tressette:turn-started').length

            expect(countAfterReveal).toBe(countBeforeReveal + 1)
            expect(countAfterReveal).toBeGreaterThan(initialTurnStartedCount)

            const latestTurnStarted = emitted
                .filter((entry) => entry.event === 'tressette:turn-started')
                .at(-1)
            expect(latestTurnStarted?.payload.turnDeadlineMs).toEqual(expect.any(Number))

            const hasPostRevealTurnTimeout = scheduled.some((entry, idx) => idx > 0 && entry.delay === TURN_TIMEOUT_SECONDS * 1000)
            expect(hasPostRevealTurnTimeout).toBe(true)
            expect(timeoutSpy).toHaveBeenCalled()
            expect(intervalSpy).toHaveBeenCalled()
        } finally {
            intervalSpy.mockRestore()
            timeoutSpy.mockRestore()
            toSpy.mockRestore()
        }
    })

    test('timeout autoplay emits private player-state with coherent hand and trick reset', async () => {
        const created = tressetteTableStore.create({ owner: 'Pierpaolo' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

        const emitted: Array<{ event: string, payload: any }> = []
        const scheduledCallbacks: Array<() => void> = []

        const toSpy = jest.spyOn(io, 'to').mockImplementation((_room: string) => {
            return {
                emit: (event: string, payload: any) => {
                    emitted.push({ event, payload })
                }
            } as any
        })

        const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((callback: TimerHandler) => {
            scheduledCallbacks.push(callback as () => void)
            return { mocked: true } as any
        }) as typeof setTimeout)

        const intervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(((..._args: any[]) => {
            return { mockedInterval: true } as any
        }) as typeof setInterval)

        const roomName = `tressette:table:live:${created.tableId}`
        const fakeSocket = {
            data: {
                __tressetteTableUsers: new Map<string, string>([[`live:${created.tableId}`, 'Pierpaolo']])
            },
            emit: jest.fn()
        }

        ;(io.sockets.adapter.rooms as unknown as Map<string, Set<string>>).set(roomName, new Set(['fake-watcher']))
        ;(io.sockets.sockets as unknown as Map<string, any>).set('fake-watcher', fakeSocket)

        try {
            const response = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/start?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'Pierpaolo' })
            })

            expect(response.status).toBe(200)
            expect(scheduledCallbacks.length).toBeGreaterThan(0)

            scheduledCallbacks[0]()

            const firstCardPlayed = emitted.find((entry) => entry.event === 'tressette:card-played')
            expect(firstCardPlayed).toBeDefined()

            const privateStatesAfterFirstPlay = fakeSocket.emit.mock.calls
                .filter((entry: any[]) => entry[0] === 'tressette:player-state')
                .map((entry: any[]) => entry[1])
            expect(privateStatesAfterFirstPlay.length).toBeGreaterThan(0)

            const firstPrivateState = privateStatesAfterFirstPlay[privateStatesAfterFirstPlay.length - 1]
            expect(firstPrivateState.myHand).toEqual(expect.any(Array))
            expect(firstPrivateState.currentTrick).toEqual(expect.any(Array))
            expect(firstPrivateState.currentTurn).toEqual(expect.objectContaining({ username: expect.any(String) }))
            expect(firstPrivateState.lastCompletedTrick).toBeUndefined()
            expect(firstPrivateState.myHand.some((card: { suit: number, value: number }) => (
                card.suit === firstCardPlayed?.payload.card.suit && card.value === firstCardPlayed?.payload.card.value
            ))).toBe(false)

            for (let i = 1; i < 4; i++) {
                const cb = scheduledCallbacks[i]
                expect(cb).toBeDefined()
                cb()
            }

            const allPrivateStates = fakeSocket.emit.mock.calls
                .filter((entry: any[]) => entry[0] === 'tressette:player-state')
                .map((entry: any[]) => entry[1])
            expect(allPrivateStates.length).toBeGreaterThanOrEqual(4)

            const lastPrivateState = allPrivateStates[allPrivateStates.length - 1]
            expect(lastPrivateState.currentTrick).toEqual([])
            expect(lastPrivateState.currentTurn).toEqual(
                expect.objectContaining({
                    username: expect.any(String)
                })
            )
            expect(lastPrivateState.lastCompletedTrick).toEqual(expect.any(Array))
            expect(lastPrivateState.lastCompletedTrick).toHaveLength(4)
            expect(lastPrivateState.lastTrickWinner).toEqual(expect.any(String))
            expect(lastPrivateState.lastTrickWinnerPosition).toEqual(expect.any(String))

            const trickEndedEvent = emitted.find((entry) => entry.event === 'tressette:trick-ended')
            expect(trickEndedEvent).toBeDefined()
            expect(trickEndedEvent?.payload).toEqual(
                expect.objectContaining({
                    tableId: created.tableId,
                    winner: expect.any(String),
                    winnerPosition: expect.any(String),
                    trickCards: expect.any(Array)
                })
            )
            expect(trickEndedEvent?.payload.trickCards).toHaveLength(4)

            const roomTurnPayloads = emitted
                .filter((entry) => entry.event === 'tressette:turn-started' || entry.event === 'tressette:turn-updated')
                .map((entry) => entry.payload)
            expect(roomTurnPayloads.every((payload) => payload.myHand === null)).toBe(true)

            const roomCardPlayedPayloads = emitted
                .filter((entry) => entry.event === 'tressette:card-played' || entry.event === 'tressette:trick-ended')
                .map((entry) => entry.payload)
            expect(roomCardPlayedPayloads.every((payload) => payload.myHand === undefined)).toBe(true)
        } finally {
            ;(io.sockets.adapter.rooms as unknown as Map<string, Set<string>>).delete(roomName)
            ;(io.sockets.sockets as unknown as Map<string, any>).delete('fake-watcher')
            intervalSpy.mockRestore()
            timeoutSpy.mockRestore()
            toSpy.mockRestore()
        }
    })
})



