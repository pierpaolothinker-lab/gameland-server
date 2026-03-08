import { TressetteTable } from './tressette.types'

export const buildDemoTables = (): TressetteTable[] => {
    return [
        {
            tableId: 'demo-wait-ready-001',
            owner: 'Luca',
            players: [
                { username: 'Luca', position: 'SUD' },
                { username: 'Marta', position: 'NORD' },
                { username: 'Paolo', position: 'EST' },
                { username: 'Sara', position: 'OVEST' }
            ],
            isComplete: true,
            points: { teamSN: 0, teamEO: 0 },
            status: 'waiting'
        },
        {
            tableId: 'demo-wait-002',
            owner: 'Sofia',
            players: [
                { username: 'Sofia', position: 'SUD' },
                { username: 'Gino', position: 'NORD' }
            ],
            isComplete: false,
            points: { teamSN: 0, teamEO: 0 },
            status: 'waiting'
        },
        {
            tableId: 'demo-ended-001',
            owner: 'Gianni',
            players: [
                { username: 'Gianni', position: 'SUD' },
                { username: 'Franco', position: 'NORD' },
                { username: 'Elena', position: 'EST' },
                { username: 'Pino', position: 'OVEST' }
            ],
            isComplete: true,
            points: { teamSN: 31, teamEO: 24 },
            status: 'ended'
        }
    ]
}
