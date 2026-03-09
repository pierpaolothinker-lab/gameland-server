import 'jest'
import { emitWatchTableBootstrap, TURN_TIMEOUT_SECONDS } from '../../../src/sockets'
import { getStoreForMode, resetStoresForTests } from '../../../src/tressette/tressette-mode.store'

describe('Tressette watch-table bootstrap', () => {
    beforeEach(() => {
        resetStoresForTests()
    })

    test('watch-table on in_game emits turn-bootstrap and private player-state', () => {
        const store = getStoreForMode('live')
        const created = store.create({ owner: 'Pierpaolo' })
        store.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        store.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        store.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })
        store.start({ tableId: created.tableId, username: 'Pierpaolo' })

        const turnDeadlines = new Map<string, number>([[`live:${created.tableId}`, Date.now() + TURN_TIMEOUT_SECONDS * 1000]])
        const socket = {
            join: jest.fn(),
            emit: jest.fn()
        }

        emitWatchTableBootstrap('live', created.tableId, socket, turnDeadlines, new Map(), 'Pierpaolo')

        expect(socket.join).toHaveBeenCalledWith(`tressette:table:live:${created.tableId}`)

        const tableUpdatedCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:table-updated')
        expect(tableUpdatedCall).toBeDefined()
        expect(tableUpdatedCall[1]).toEqual(expect.objectContaining({
            tableId: created.tableId,
            mode: 'live',
            status: 'in_game',
            currentTrick: []
        }))

        const turnBootstrapCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:turn-bootstrap')
        expect(turnBootstrapCall).toBeDefined()
        expect(turnBootstrapCall[1]).toEqual(expect.objectContaining({
            tableId: created.tableId,
            mode: 'live',
            trickNumber: 1,
            timeoutSeconds: TURN_TIMEOUT_SECONDS,
            currentPlayer: expect.objectContaining({
                username: expect.any(String),
                position: expect.any(String)
            }),
            turnDeadlineMs: expect.any(Number),
            secondsRemaining: expect.any(Number),
            currentTrick: [],
            myHand: expect.any(Array)
        }))
        expect(turnBootstrapCall[1].myHand).toHaveLength(10)

        const playerStateCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:player-state')
        expect(playerStateCall).toBeDefined()
        expect(playerStateCall[1]).toEqual(expect.objectContaining({
            tableId: created.tableId,
            mode: 'live',
            myHand: expect.any(Array),
            currentTrick: [],
            currentTurn: expect.objectContaining({
                username: expect.any(String)
            }),
            timeoutSeconds: TURN_TIMEOUT_SECONDS,
            status: 'in_game'
        }))
    })

    test('watch-table on waiting emits table-updated and player-state without turn-bootstrap', () => {
        const store = getStoreForMode('live')
        const created = store.create({ owner: 'Pierpaolo' })

        const socket = {
            join: jest.fn(),
            emit: jest.fn()
        }

        emitWatchTableBootstrap('live', created.tableId, socket, new Map<string, number>(), new Map(), 'Pierpaolo')

        const tableUpdatedCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:table-updated')
        expect(tableUpdatedCall).toBeDefined()
        expect(tableUpdatedCall[1].status).toBe('waiting')
        expect(tableUpdatedCall[1].currentTrick).toEqual([])

        const playerStateCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:player-state')
        expect(playerStateCall).toBeDefined()
        expect(playerStateCall[1]).toEqual(expect.objectContaining({
            tableId: created.tableId,
            status: 'waiting',
            currentTurn: null
        }))

        const turnBootstrapCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:turn-bootstrap')
        expect(turnBootstrapCall).toBeUndefined()
    })

    test('watch-table bootstrap does not schedule duplicate timers', () => {
        const store = getStoreForMode('live')
        const created = store.create({ owner: 'Pierpaolo' })
        store.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        store.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        store.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })
        store.start({ tableId: created.tableId, username: 'Pierpaolo' })

        const timeoutSpy = jest.spyOn(global, 'setTimeout')
        const intervalSpy = jest.spyOn(global, 'setInterval')

        try {
            const socket = {
                join: jest.fn(),
                emit: jest.fn()
            }

            emitWatchTableBootstrap('live', created.tableId, socket, new Map<string, number>(), new Map(), 'Pierpaolo')

            expect(timeoutSpy).not.toHaveBeenCalled()
            expect(intervalSpy).not.toHaveBeenCalled()
        } finally {
            intervalSpy.mockRestore()
            timeoutSpy.mockRestore()
        }
    })
})

