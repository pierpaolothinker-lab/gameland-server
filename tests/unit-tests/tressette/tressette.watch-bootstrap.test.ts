import 'jest'
import { emitWatchTableBootstrap, TURN_TIMEOUT_SECONDS } from '../../../src/sockets'
import { getStoreForMode, resetStoresForTests } from '../../../src/tressette/tressette-mode.store'

describe('Tressette watch-table bootstrap', () => {
    beforeEach(() => {
        resetStoresForTests()
    })

    test('watch-table on in_game emits immediate turn-bootstrap payload', () => {
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

        emitWatchTableBootstrap('live', created.tableId, socket, turnDeadlines)

        expect(socket.join).toHaveBeenCalledWith(`tressette:table:live:${created.tableId}`)

        const tableUpdatedCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:table-updated')
        expect(tableUpdatedCall).toBeDefined()
        expect(tableUpdatedCall[1]).toEqual(expect.objectContaining({
            tableId: created.tableId,
            mode: 'live',
            status: 'in_game'
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
            secondsRemaining: expect.any(Number)
        }))
    })

    test('watch-table on waiting emits table-updated only', () => {
        const store = getStoreForMode('live')
        const created = store.create({ owner: 'Pierpaolo' })

        const socket = {
            join: jest.fn(),
            emit: jest.fn()
        }

        emitWatchTableBootstrap('live', created.tableId, socket, new Map<string, number>())

        const tableUpdatedCall = socket.emit.mock.calls.find((entry: any[]) => entry[0] === 'tressette:table-updated')
        expect(tableUpdatedCall).toBeDefined()
        expect(tableUpdatedCall[1].status).toBe('waiting')

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

            emitWatchTableBootstrap('live', created.tableId, socket, new Map<string, number>())

            expect(timeoutSpy).not.toHaveBeenCalled()
            expect(intervalSpy).not.toHaveBeenCalled()
        } finally {
            intervalSpy.mockRestore()
            timeoutSpy.mockRestore()
        }
    })
})
