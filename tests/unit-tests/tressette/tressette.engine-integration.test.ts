import 'jest'
import { tressetteGameEngineAdapter } from '../../../src/tressette/tressette-game-engine.adapter'
import { tressetteTableStore, TressetteStoreError } from '../../../src/tressette/tressette-table.store'

const setupStartedTable = () => {
    const created = tressetteTableStore.create({ owner: 'Pierpaolo' })

    tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
    tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
    tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

    const started = tressetteTableStore.start({ tableId: created.tableId, username: 'Pierpaolo' })

    return {
        tableId: created.tableId,
        started
    }
}

describe('Tressette engine integration', () => {
    beforeEach(() => {
        tressetteTableStore.reset()
    })

    test('start initializes engine session for table', () => {
        const { tableId, started } = setupStartedTable()

        expect(started.status).toBe('in_game')
        expect(tressetteGameEngineAdapter.isInitialized(tableId)).toBe(true)
    })

    test('playCard happy path delegates to engine and updates trick progress', () => {
        const { tableId } = setupStartedTable()

        const result = tressetteTableStore.playCard({ tableId, username: 'Pierpaolo' })

        expect(result.table.tableId).toBe(tableId)
        expect(result.table.status).toBe('in_game')
        expect(result.play.tricksPlayed).toBe(1)
        expect(typeof result.play.winner).toBe('string')
        expect(typeof result.play.nextPlayer).toBe('string')
    })

    test('playCard returns domain error when player is not on turn', () => {
        const { tableId } = setupStartedTable()

        try {
            tressetteTableStore.playCard({ tableId, username: 'Vito' })
            fail('expected playCard to throw')
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(TressetteStoreError)
            const typedError = error as TressetteStoreError
            expect(typedError.code).toBe('NOT_PLAYER_TURN')
            expect(typedError.httpStatus).toBe(409)
        }
    })
})
