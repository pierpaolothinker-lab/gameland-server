export const TRESSETTE_POSITIONS = ['SUD', 'NORD', 'EST', 'OVEST'] as const

export type TressettePosition = (typeof TRESSETTE_POSITIONS)[number]

export type TressetteTablePlayer = {
    username: string
    position: TressettePosition
}

export type TressetteTablePoints = {
    teamSN: number
    teamEO: number
}

export type TressetteTableStatus = 'waiting' | 'in_game' | 'ended'

export type TressetteTable = {
    tableId: string
    owner: string
    players: TressetteTablePlayer[]
    isComplete: boolean
    points: TressetteTablePoints
    status: TressetteTableStatus
}

export type CreateTressetteTableInput = {
    owner: string
}

export type JoinTressetteTableInput = {
    tableId: string
    username: string
    position: TressettePosition
}

export type LeaveTressetteTableInput = {
    tableId: string
    username: string
}

export type StartTressetteGameInput = {
    tableId: string
    username: string
}

export type PlayCardTressetteInput = {
    tableId: string
    username: string
}

export type TressettePlayCardOutcome = {
    winner: string
    nextPlayer: string
    tricksPlayed: number
    nextStatus: TressetteTableStatus
}
