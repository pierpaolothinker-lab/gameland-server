import 'jest'
import { AddressInfo } from 'net'
import { createServer, Server as HttpServer } from 'http'
import { Server as IoServer } from 'socket.io'
import app from '../../../src/app'
import { createIo, TURN_TIMEOUT_SECONDS } from '../../../src/sockets'
import { tressetteTableStore } from '../../../src/tressette/tressette-table.store'
import { clearStartPipelineDispatcher } from '../../../src/tressette/tressette-start.pipeline'

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
        tressetteTableStore.reset()
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

        try {
            const response = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/start`, {
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

            expect(tableUpdatedIdx).toBeGreaterThanOrEqual(0)
            expect(handStartedIdx).toBeGreaterThan(tableUpdatedIdx)
            expect(turnStartedIdx).toBeGreaterThan(handStartedIdx)

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

            expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), TURN_TIMEOUT_SECONDS * 1000)
        } finally {
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

        try {
            const response = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/start`, {
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
            expect(timeoutSpy).toHaveBeenCalled()
        } finally {
            timeoutSpy.mockRestore()
            toSpy.mockRestore()
        }
    })
})
