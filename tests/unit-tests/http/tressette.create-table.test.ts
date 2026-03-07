import { AddressInfo } from 'net'
import { createServer, Server } from 'http'
import app from '../../../src/app'
import { tressetteTableStore } from '../../../src/tressette/tressette-table.store'

describe('Tressette table HTTP API', () => {
    let server: Server
    let baseUrl: string

    beforeAll((done) => {
        server = createServer(app.express)
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
        server.close(() => done())
    })

    test('creates a table with owner and defaults', async () => {
        const response = await fetch(`${baseUrl}/api/tressette/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner: 'Pierpaolo' })
        })

        expect(response.status).toBe(201)
        const body = await response.json()

        expect(typeof body.tableId).toBe('string')
        expect(body.owner).toBe('Pierpaolo')
        expect(body.status).toBe('waiting')
        expect(body.isComplete).toBe(false)
        expect(body.points).toEqual({ teamSN: 0, teamEO: 0 })
        expect(body.players).toEqual([{ username: 'Pierpaolo', position: 'SUD' }])
    })

    test('returns validation error when owner is missing', async () => {
        const response = await fetch(`${baseUrl}/api/tressette/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner: ' ' })
        })

        expect(response.status).toBe(400)
        const body = await response.json()

        expect(body).toEqual({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'owner is required'
            }
        })
    })

    test('join/get/start flow works for full table', async () => {
        const createResponse = await fetch(`${baseUrl}/api/tressette/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner: 'Pierpaolo' })
        })
        const createdTable = await createResponse.json()
        const tableId = createdTable.tableId

        const joinNorth = await fetch(`${baseUrl}/api/tressette/tables/${tableId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Vito', position: 'NORD' })
        })
        expect(joinNorth.status).toBe(200)

        const joinEast = await fetch(`${baseUrl}/api/tressette/tables/${tableId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Tonino', position: 'EST' })
        })
        expect(joinEast.status).toBe(200)

        const joinWest = await fetch(`${baseUrl}/api/tressette/tables/${tableId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Paolo', position: 'OVEST' })
        })
        expect(joinWest.status).toBe(200)
        const fullTable = await joinWest.json()
        expect(fullTable.isComplete).toBe(true)
        expect(fullTable.players).toHaveLength(4)

        const getResponse = await fetch(`${baseUrl}/api/tressette/tables/${tableId}`)
        expect(getResponse.status).toBe(200)
        const snapshot = await getResponse.json()
        expect(snapshot.tableId).toBe(tableId)
        expect(snapshot.status).toBe('waiting')

        const startResponse = await fetch(`${baseUrl}/api/tressette/tables/${tableId}/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Pierpaolo' })
        })

        expect(startResponse.status).toBe(200)
        const started = await startResponse.json()
        expect(started.status).toBe('in_game')
    })

    test('leave removes non-owner player from waiting table', async () => {
        const createResponse = await fetch(`${baseUrl}/api/tressette/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner: 'Pierpaolo' })
        })
        const createdTable = await createResponse.json()
        const tableId = createdTable.tableId

        await fetch(`${baseUrl}/api/tressette/tables/${tableId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Vito', position: 'NORD' })
        })

        const leaveResponse = await fetch(`${baseUrl}/api/tressette/tables/${tableId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Vito' })
        })

        expect(leaveResponse.status).toBe(200)
        const table = await leaveResponse.json()
        expect(table.players).toEqual([{ username: 'Pierpaolo', position: 'SUD' }])
        expect(table.isComplete).toBe(false)
    })

    test('returns contract error for invalid join position', async () => {
        const createResponse = await fetch(`${baseUrl}/api/tressette/tables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ owner: 'Pierpaolo' })
        })
        const createdTable = await createResponse.json()
        const tableId = createdTable.tableId

        const response = await fetch(`${baseUrl}/api/tressette/tables/${tableId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'Vito', position: 'NORTH' })
        })

        expect(response.status).toBe(400)
        const body = await response.json()
        expect(body.error.code).toBe('VALIDATION_ERROR')
    })

    test('returns contract error for table not found', async () => {
        const response = await fetch(`${baseUrl}/api/tressette/tables/does-not-exist`)

        expect(response.status).toBe(404)
        const body = await response.json()
        expect(body).toEqual({
            error: {
                code: 'TABLE_NOT_FOUND',
                message: 'table not found'
            }
        })
    })
})
