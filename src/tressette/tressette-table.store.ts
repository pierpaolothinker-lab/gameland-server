import { randomUUID } from 'crypto'
import {
    CreateTressetteTableInput,
    JoinTressetteTableInput,
    LeaveTressetteTableInput,
    StartTressetteGameInput,
    TressetteTable,
    TressetteTableStatus
} from './tressette.types'

export class TressetteStoreError extends Error {
    readonly code: string
    readonly httpStatus: number

    constructor(code: string, message: string, httpStatus: number) {
        super(message)
        this.code = code
        this.httpStatus = httpStatus
    }
}

class TressetteTableStore {
    private readonly tables = new Map<string, TressetteTable>()

    create(input: CreateTressetteTableInput): TressetteTable {
        const table: TressetteTable = {
            tableId: this.buildTableId(),
            owner: input.owner,
            players: [{ username: input.owner, position: 'SUD' }],
            isComplete: false,
            points: { teamSN: 0, teamEO: 0 },
            status: 'waiting'
        }

        this.tables.set(table.tableId, table)
        return this.clone(table)
    }

    list(): TressetteTable[] {
        return Array.from(this.tables.values())
            .sort((a, b) => this.getStatusRank(a.status) - this.getStatusRank(b.status))
            .map((table) => this.clone(table))
    }

    getById(tableId: string): TressetteTable {
        const table = this.requireTable(tableId)
        return this.clone(table)
    }

    join(input: JoinTressetteTableInput): TressetteTable {
        const table = this.requireTable(input.tableId)

        if (table.status !== 'waiting') {
            throw new TressetteStoreError('TABLE_NOT_JOINABLE', 'table is not joinable', 409)
        }

        if (table.isComplete || table.players.length >= 4) {
            throw new TressetteStoreError('TABLE_FULL', 'table is already complete', 409)
        }

        if (table.players.some((player) => player.username === input.username)) {
            throw new TressetteStoreError('PLAYER_ALREADY_JOINED', 'player already joined table', 409)
        }

        if (table.players.some((player) => player.position === input.position)) {
            throw new TressetteStoreError('POSITION_NOT_AVAILABLE', 'position is not available', 409)
        }

        table.players.push({ username: input.username, position: input.position })
        table.isComplete = table.players.length === 4

        return this.clone(table)
    }

    leave(input: LeaveTressetteTableInput): TressetteTable {
        const table = this.requireTable(input.tableId)

        if (table.status !== 'waiting') {
            throw new TressetteStoreError('TABLE_NOT_LEAVABLE', 'cannot leave table after game start', 409)
        }

        if (input.username === table.owner) {
            throw new TressetteStoreError('OWNER_CANNOT_LEAVE', 'owner cannot leave table', 409)
        }

        const playerIndex = table.players.findIndex((player) => player.username === input.username)
        if (playerIndex < 0) {
            throw new TressetteStoreError('PLAYER_NOT_FOUND', 'player not found at table', 404)
        }

        table.players.splice(playerIndex, 1)
        table.isComplete = false

        return this.clone(table)
    }

    start(input: StartTressetteGameInput): TressetteTable {
        const table = this.requireTable(input.tableId)

        if (table.owner !== input.username) {
            throw new TressetteStoreError('FORBIDDEN_START', 'only owner can start game', 403)
        }

        if (!table.isComplete || table.players.length !== 4) {
            throw new TressetteStoreError('TABLE_NOT_COMPLETE', 'table must have 4 players to start', 409)
        }

        if (table.status !== 'waiting') {
            throw new TressetteStoreError('TABLE_ALREADY_STARTED', 'game already started', 409)
        }

        table.status = 'in_game'
        return this.clone(table)
    }

    reset(): void {
        this.tables.clear()
    }

    private requireTable(tableId: string): TressetteTable {
        const table = this.tables.get(tableId)
        if (!table) {
            throw new TressetteStoreError('TABLE_NOT_FOUND', 'table not found', 404)
        }

        return table
    }

    private buildTableId(): string {
        return randomUUID()
    }

    private clone(table: TressetteTable): TressetteTable {
        return {
            ...table,
            players: table.players.map((player) => ({ ...player })),
            points: { ...table.points }
        }
    }

    private getStatusRank(status: TressetteTableStatus): number {
        switch (status) {
            case 'waiting':
                return 0
            case 'in_game':
                return 1
            case 'ended':
                return 2
            default:
                return 3
        }
    }
}

export const tressetteTableStore = new TressetteTableStore()
