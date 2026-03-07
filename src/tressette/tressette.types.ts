export type TressettePosition = 'SUD' | 'NORD' | 'EST' | 'OVEST'

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
