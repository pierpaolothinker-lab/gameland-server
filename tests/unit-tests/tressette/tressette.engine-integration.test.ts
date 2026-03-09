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
        jest.spyOn(Math, 'random').mockReturnValue(0)
        tressetteTableStore.reset()
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    test('start initializes engine session for table', () => {
        const { tableId, started } = setupStartedTable()

        expect(started.status).toBe('in_game')
        expect(tressetteGameEngineAdapter.isInitialized(tableId)).toBe(true)
        expect(tressetteTableStore.getCurrentTurn(tableId)).toEqual({
            trickNumber: 1,
            turnPlayer: 'Pierpaolo'
        })
    })

    test('deal gives exactly 10 cards per player at start', () => {
        const { tableId, started } = setupStartedTable()

        started.players.forEach((player) => {
            const hand = tressetteTableStore.getPlayerHand(tableId, player.username)
            expect(hand).toHaveLength(10)
        })
    })

    test('manual play removes selected card from player hand', () => {
        const { tableId } = setupStartedTable()

        const handBefore = tressetteTableStore.getPlayerHand(tableId, 'Pierpaolo')
        const selectedCard = handBefore[0]

        const result = tressetteTableStore.playCard({
            tableId,
            username: 'Pierpaolo',
            source: 'manual',
            card: selectedCard
        })

        const handAfter = tressetteTableStore.getPlayerHand(tableId, 'Pierpaolo')
        expect(handAfter).toHaveLength(handBefore.length - 1)
        expect(handAfter.some((card) => card.suit === selectedCard.suit && card.value === selectedCard.value)).toBe(false)
        expect(result.play.card).toEqual(selectedCard)
        expect(result.play.currentTrick).toHaveLength(1)
        expect(result.play.currentTrick[0].card).toEqual(selectedCard)
        expect(handAfter.some((card) => card.suit === result.play.currentTrick[0].card.suit && card.value === result.play.currentTrick[0].card.value)).toBe(false)
    })

    test('manual card not in player hand returns CARD_NOT_OWNED', () => {
        const { tableId } = setupStartedTable()
        const cardOwnedByOtherPlayer = tressetteTableStore.getPlayerHand(tableId, 'Vito')[0]

        try {
            tressetteTableStore.playCard({
                tableId,
                username: 'Pierpaolo',
                source: 'manual',
                card: cardOwnedByOtherPlayer
            })
            fail('expected playCard to throw CARD_NOT_OWNED')
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(TressetteStoreError)
            const typedError = error as TressetteStoreError
            expect(typedError.code).toBe('CARD_NOT_OWNED')
        }
    })

    test('playCard happy path delegates to engine and advances turn order', () => {
        const { tableId } = setupStartedTable()

        const result = tressetteTableStore.playCard({
            tableId,
            username: 'Pierpaolo',
            source: 'manual'
        })

        expect(result.table.tableId).toBe(tableId)
        expect(result.table.status).toBe('in_game')
        expect(result.play.source).toBe('manual')
        expect(result.play.trickNumber).toBe(1)
        expect(result.play.trickEnded).toBeNull()
        expect(result.play.nextTurn?.turnPlayer).toBe('Tonino')
    })

    test('playCard timeout auto mode is accepted for current turn player', () => {
        const { tableId } = setupStartedTable()

        const result = tressetteTableStore.playCard({
            tableId,
            username: 'Pierpaolo',
            source: 'timeout_auto'
        })

        expect(result.play.source).toBe('timeout_auto')
        expect(result.play.card).toEqual(
            expect.objectContaining({
                suit: expect.any(Number),
                value: expect.any(Number)
            })
        )
    })

    test('four plays close trick and reset currentTrick', () => {
        const { tableId } = setupStartedTable()

        tressetteTableStore.playCard({ tableId, username: 'Pierpaolo', source: 'manual' })
        tressetteTableStore.playCard({ tableId, username: 'Tonino', source: 'manual' })
        tressetteTableStore.playCard({ tableId, username: 'Vito', source: 'manual' })
        const fourthPlay = tressetteTableStore.playCard({ tableId, username: 'Paolo', source: 'manual' })

        expect(fourthPlay.play.trickEnded).toEqual(
            expect.objectContaining({
                trickNumber: 1,
                winner: expect.any(String),
                trickPoints: expect.any(Number),
                scoreSN: expect.any(Number),
                scoreEO: expect.any(Number)
            })
        )
        expect(fourthPlay.play.currentTrick).toEqual([])
        expect(tressetteTableStore.getCurrentTrick(tableId)).toEqual([])
        expect(fourthPlay.play.nextTurn).toEqual(
            expect.objectContaining({
                trickNumber: 2,
                turnPlayer: expect.any(String)
            })
        )
    })

    test('anticlockwise order includes Paolo -> Marta case', () => {
        const created = tressetteTableStore.create({ owner: 'Marta' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

        ;(Math.random as jest.Mock).mockReturnValue(0.99)
        tressetteTableStore.start({ tableId: created.tableId, username: 'Marta' })

        const play = tressetteTableStore.playCard({ tableId: created.tableId, username: 'Paolo', source: 'manual' })
        expect(play.play.nextTurn?.turnPlayer).toBe('Marta')
    })

    test('playCard returns domain error when player is not on turn', () => {
        const { tableId } = setupStartedTable()

        try {
            tressetteTableStore.playCard({
                tableId,
                username: 'Vito',
                source: 'manual'
            })
            fail('expected playCard to throw')
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(TressetteStoreError)
            const typedError = error as TressetteStoreError
            expect(typedError.code).toBe('NOT_PLAYER_TURN')
            expect(typedError.httpStatus).toBe(409)
        }
    })
})


