import 'jest'
import { AddressInfo } from 'net'
import { createServer, Server as HttpServer } from 'http'
import { Server as IoServer } from 'socket.io'
import app from '../../../src/app'
import { createIo, PREGAME_COUNTDOWN_SECONDS } from '../../../src/sockets'
import { resetStoresForTests, getStoreForMode } from '../../../src/tressette/tressette-mode.store'
import { clearStartPipelineDispatcher } from '../../../src/tressette/tressette-start.pipeline'

describe('Tressette lobby realtime stabilization', () => {
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

    test('http lobby mutations broadcast mode-wide table updates and lobby snapshots', async () => {
        const emitted: Array<{ room: string, event: string, payload: any }> = []
        const toSpy = jest.spyOn(io, 'to').mockImplementation((room: string) => {
            return {
                emit: (event: string, payload: any) => {
                    emitted.push({ room, event, payload })
                }
            } as any
        })

        try {
            const createResponse = await fetch(`${baseUrl}/api/tressette/tables?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ owner: 'Pierpaolo' })
            })
            expect(createResponse.status).toBe(201)
            const created = await createResponse.json()

            const joinResponse = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/join?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'Vito', position: 'NORD' })
            })
            expect(joinResponse.status).toBe(200)

            const leaveResponse = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/leave?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'Vito' })
            })
            expect(leaveResponse.status).toBe(200)

            const modeTableUpdates = emitted.filter(
                (entry) => entry.room === 'tressette:mode:live' && entry.event === 'tressette:table-updated'
            )
            const lobbySnapshots = emitted.filter(
                (entry) => entry.room === 'tressette:mode:live' && entry.event === 'tressette:lobby-state'
            )

            expect(modeTableUpdates.length).toBeGreaterThanOrEqual(3)
            expect(lobbySnapshots.length).toBeGreaterThanOrEqual(3)
            expect(modeTableUpdates.at(-1)?.payload.players).toEqual([
                { username: 'Pierpaolo', position: 'SUD', isBot: false }
            ])
        } finally {
            toSpy.mockRestore()
        }
    })

    test('start transition broadcasts starting and in_game status to mode-wide lobby listeners', async () => {
        const store = getStoreForMode('live')
        const created = store.create({ owner: 'Pierpaolo' })
        store.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        store.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        store.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

        const emitted: Array<{ room: string, event: string, payload: any }> = []
        const toSpy = jest.spyOn(io, 'to').mockImplementation((room: string) => {
            return {
                emit: (event: string, payload: any) => {
                    emitted.push({ room, event, payload })
                }
            } as any
        })

        const timeoutSpy = jest.spyOn(global, 'setTimeout').mockImplementation(((..._args: any[]) => {
            return { mockedTimeout: true } as any
        }) as typeof setTimeout)
        const intervalSpy = jest.spyOn(global, 'setInterval').mockImplementation(((callback: TimerHandler) => {
            return { mockedInterval: true, callback } as any
        }) as typeof setInterval)

        try {
            const response = await fetch(`${baseUrl}/api/tressette/tables/${created.tableId}/start?mode=live`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'Pierpaolo' })
            })

            expect(response.status).toBe(200)

            const countdownCallback = intervalSpy.mock.calls[0][0] as () => void
            for (let index = 0; index < PREGAME_COUNTDOWN_SECONDS; index++) {
                countdownCallback()
            }

            const modeTableUpdates = emitted.filter(
                (entry) => entry.room === 'tressette:mode:live' && entry.event === 'tressette:table-updated'
            )
            const statuses = modeTableUpdates
                .filter((entry) => entry.payload.tableId === created.tableId)
                .map((entry) => entry.payload.status)

            expect(statuses).toContain('starting')
            expect(statuses).toContain('in_game')

            const lobbySnapshots = emitted.filter(
                (entry) => entry.room === 'tressette:mode:live' && entry.event === 'tressette:lobby-state'
            )
            expect(lobbySnapshots.some((entry) => (
                entry.payload.tables.some((table: { tableId: string, status: string }) => (
                    table.tableId === created.tableId && table.status === 'in_game'
                ))
            ))).toBe(true)
        } finally {
            timeoutSpy.mockRestore()
            intervalSpy.mockRestore()
            toSpy.mockRestore()
        }
    })
})
