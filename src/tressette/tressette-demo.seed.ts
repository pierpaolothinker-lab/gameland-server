import { TressetteTable } from './tressette.types'

export const buildDemoTables = (): TressetteTable[] => {
    return [
        {
            tableId: 'demo-wait-ready-001',
            owner: 'Luca',
            players: [
                { username: 'Luca', position: 'SUD', isBot: false },
                { username: 'Marta', position: 'NORD', isBot: false },
                { username: 'Paolo', position: 'EST', isBot: false },
                { username: 'Sara', position: 'OVEST', isBot: false }
            ],
            isComplete: true,
            points: { teamSN: 0, teamEO: 0 },
            status: 'waiting'
        },
        {
            tableId: 'demo-wait-002',
            owner: 'Sofia',
            players: [
                { username: 'Sofia', position: 'SUD', isBot: false },
                { username: 'Gino', position: 'NORD', isBot: false }
            ],
            isComplete: false,
            points: { teamSN: 0, teamEO: 0 },
            status: 'waiting'
        },
        {
            tableId: 'demo-ended-001',
            owner: 'Gianni',
            players: [
                { username: 'Gianni', position: 'SUD', isBot: false },
                { username: 'Franco', position: 'NORD', isBot: false },
                { username: 'Elena', position: 'EST', isBot: false },
                { username: 'Pino', position: 'OVEST', isBot: false }
            ],
            isComplete: true,
            points: { teamSN: 31, teamEO: 24 },
            status: 'ended'
        }
    ]
}

