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

export type TressetteCard = {
    suit: number
    value: number
}

export type TressetteCurrentTrickPlay = {
    username: string
    position: TressettePosition | null
    card: TressetteCard
}

export type TressettePlayCardSource = 'manual' | 'timeout_auto'

export type PlayCardTressetteInput = {
    tableId: string
    username: string
    source: TressettePlayCardSource
    card?: TressetteCard
}

export type TressetteTurnState = {
    trickNumber: number
    turnPlayer: string
}

export type TressetteTrickEnded = {
    trickNumber: number
    winner: string
    winnerPosition: TressettePosition | null
    trickCards: TressetteCurrentTrickPlay[]
    trickPoints: number
    scoreSN: number
    scoreEO: number
}

export type TressetteHandTransition = {
    handEnded: boolean
    handNumber: number
    handScore: TressetteTablePoints | null
    nextHandNumber: number | null
    gameEnded: boolean
}

export type TressettePlayCardOutcome = {
    tableId: string
    trickNumber: number
    username: string
    card: TressetteCard
    source: TressettePlayCardSource
    currentTrick: TressetteCurrentTrickPlay[]
    completedTrick: TressetteCurrentTrickPlay[] | null
    nextTurn: TressetteTurnState | null
    trickEnded: TressetteTrickEnded | null
    handEnded: boolean
    handTransition: TressetteHandTransition
    nextStatus: TressetteTableStatus
}

