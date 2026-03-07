import { randomUUID } from 'crypto'
import { CreateTressetteTableInput, TressetteTable } from './tressette.types'

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
        return table
    }

    private buildTableId(): string {
        return randomUUID()
    }
}

export const tressetteTableStore = new TressetteTableStore()
