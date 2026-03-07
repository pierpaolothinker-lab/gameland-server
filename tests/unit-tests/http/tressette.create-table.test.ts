import { AddressInfo } from 'net'
import { createServer, Server } from 'http'
import app from '../../../src/app'

describe('POST /api/tressette/tables', () => {
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
})
