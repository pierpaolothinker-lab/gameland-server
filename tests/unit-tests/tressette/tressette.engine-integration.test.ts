import 'jest'
import { tressetteGameEngineAdapter } from '../../../src/tressette/tressette-game-engine.adapter'
import { tressetteTableStore, TressetteStoreError } from '../../../src/tressette/tressette-table.store'

const setupStartedTable = () => {
    const created = tressetteTableStore.create({ owner: 'Pierpaolo' })

    tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
    tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
    tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

    tressetteTableStore.start({ tableId: created.tableId, username: 'Pierpaolo' })
    const started = tressetteTableStore.activateStartedGame(created.tableId)

    return {
        tableId: created.tableId,
        started
    }
}


const findPlayableSuitConstraint = (
    leaderHand: Array<{ suit: number, value: number }>,
    responderHand: Array<{ suit: number, value: number }>
) => {
    for (const leadCard of leaderHand) {
        const sameSuitCard = responderHand.find((card) => card.suit === leadCard.suit)
        const offSuitCard = responderHand.find((card) => card.suit !== leadCard.suit)
        if (sameSuitCard && offSuitCard) {
            return { leadCard, sameSuitCard, offSuitCard }
        }
    }

    return null
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

    test('manual off-suit play is rejected when player has lead suit card', () => {
        const { tableId } = setupStartedTable()
        const leaderHand = tressetteTableStore.getPlayerHand(tableId, 'Pierpaolo')
        const responderHand = tressetteTableStore.getPlayerHand(tableId, 'Tonino')
        const suitConstraint = findPlayableSuitConstraint(leaderHand, responderHand)

        if (!suitConstraint) {
            throw new Error('expected setup to contain a lead-suit constraint scenario')
        }

        tressetteTableStore.playCard({
            tableId,
            username: 'Pierpaolo',
            source: 'manual',
            card: suitConstraint!.leadCard
        })

        try {
            tressetteTableStore.playCard({
                tableId,
                username: 'Tonino',
                source: 'manual',
                card: suitConstraint!.offSuitCard
            })
            fail('expected playCard to throw INVALID_SUIT_RESPONSE')
        } catch (error: unknown) {
            expect(error).toBeInstanceOf(TressetteStoreError)
            const typedError = error as TressetteStoreError
            expect(typedError.code).toBe('INVALID_SUIT_RESPONSE')
            expect(typedError.httpStatus).toBe(409)
        }
    })

    test('manual same-suit response is accepted', () => {
        const { tableId } = setupStartedTable()
        const leaderHand = tressetteTableStore.getPlayerHand(tableId, 'Pierpaolo')
        const responderHand = tressetteTableStore.getPlayerHand(tableId, 'Tonino')
        const suitConstraint = findPlayableSuitConstraint(leaderHand, responderHand)

        if (!suitConstraint) {
            throw new Error('expected setup to contain a lead-suit constraint scenario')
        }

        tressetteTableStore.playCard({
            tableId,
            username: 'Pierpaolo',
            source: 'manual',
            card: suitConstraint!.leadCard
        })

        const responsePlay = tressetteTableStore.playCard({
            tableId,
            username: 'Tonino',
            source: 'manual',
            card: suitConstraint!.sameSuitCard
        })

        expect(responsePlay.play.card.suit).toBe(suitConstraint!.leadCard.suit)
    })

    test('manual off-suit is accepted when player has no lead suit cards', () => {
        const { tableId } = setupStartedTable()
        const leaderHand = tressetteTableStore.getPlayerHand(tableId, 'Pierpaolo')
        const leadCard = leaderHand[0]

        const sessions = (tressetteGameEngineAdapter as unknown as { sessions: Map<string, any> }).sessions
        const session = sessions.get(tableId)
        const responder = session?.table?.players?.find((player: any) => player.username === 'Tonino')

        if (!leadCard || !responder) {
            throw new Error('expected valid table session for follow-suit test setup')
        }

        const responderCards = responder.getCardsSnapshot()
        const withoutLeadSuit = responderCards.filter((card: { suit: number }) => card.suit !== leadCard.suit)
        if (withoutLeadSuit.length === 0) {
            throw new Error('expected responder to have at least one off-suit card in setup')
        }

        responder.cards = withoutLeadSuit

        tressetteTableStore.playCard({
            tableId,
            username: 'Pierpaolo',
            source: 'manual',
            card: leadCard
        })

        const offSuitCard = tressetteTableStore.getPlayerHand(tableId, 'Tonino')[0]

        const result = tressetteTableStore.playCard({
            tableId,
            username: 'Tonino',
            source: 'manual',
            card: offSuitCard
        })

        expect(result.play.card).toEqual(offSuitCard)
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
                winnerPosition: expect.any(String),
                trickCards: expect.any(Array),
                trickPoints: expect.any(Number),
                scoreSN: expect.any(Number),
                scoreEO: expect.any(Number)
            })
        )
        expect(fourthPlay.play.trickEnded?.trickCards).toHaveLength(4)
        expect(fourthPlay.play.completedTrick).toEqual(fourthPlay.play.trickEnded?.trickCards)
        expect(fourthPlay.play.currentTrick).toEqual([])
        expect(tressetteTableStore.getCurrentTrick(tableId)).toEqual([])
        expect(fourthPlay.play.nextTurn).toEqual(
            expect.objectContaining({
                trickNumber: 2,
                turnPlayer: expect.any(String)
            })
        )
    })
    test('hand closes after 10 tricks and immediately starts next hand with rotated opener', () => {
        const { tableId, started } = setupStartedTable()
        const initialTurn = tressetteTableStore.getCurrentTurn(tableId)

        if (!initialTurn) {
            throw new Error('expected current turn at hand start')
        }

        const playersByPosition = new Map(started.players.map((player) => [player.position, player.username]))
        const openerPosition = started.players.find((player) => player.username === initialTurn.turnPlayer)?.position

        if (!openerPosition) {
            throw new Error('expected opener position in table snapshot')
        }

        const nextPositionByOrder = {
            SUD: 'EST',
            EST: 'NORD',
            NORD: 'OVEST',
            OVEST: 'SUD'
        } as const

        const expectedNextOpener = playersByPosition.get(nextPositionByOrder[openerPosition])
        if (!expectedNextOpener) {
            throw new Error('expected next opener from anticlockwise rotation')
        }

        let trickClosedCount = 0
        let lastResult: ReturnType<typeof tressetteTableStore.playCard> | null = null

        for (let index = 0; index < 80; index++) {
            const turn = tressetteTableStore.getCurrentTurn(tableId)
            if (!turn) {
                throw new Error('expected turn while game is in progress')
            }

            const result = tressetteTableStore.playCard({
                tableId,
                username: turn.turnPlayer,
                source: 'timeout_auto'
            })

            if (result.play.trickEnded) {
                trickClosedCount += 1
            }

            if (result.play.handTransition.handEnded) {
                lastResult = result
                break
            }
        }

        if (!lastResult) {
            throw new Error('expected hand end transition within first 10 tricks')
        }

        expect(trickClosedCount).toBe(10)
        expect(lastResult.table.status).toBe('in_game')
        expect(lastResult.play.handTransition.handEnded).toBe(true)
        expect(lastResult.play.handTransition.handNumber).toBe(1)
        expect(lastResult.play.handTransition.nextHandNumber).toBe(2)
        expect(lastResult.play.nextTurn).toEqual(
            expect.objectContaining({
                trickNumber: 1,
                turnPlayer: expectedNextOpener
            })
        )

        lastResult.table.players.forEach((player) => {
            const hand = tressetteTableStore.getPlayerHand(tableId, player.username)
            expect(hand).toHaveLength(10)
        })
    })

    test('team score updates are applied at hand-end with historical floor logic', () => {
        const { tableId } = setupStartedTable()

        let rawHandSN = 0
        let rawHandEO = 0
        let lastResult: ReturnType<typeof tressetteTableStore.playCard> | null = null

        for (let index = 0; index < 80; index++) {
            const turn = tressetteTableStore.getCurrentTurn(tableId)
            if (!turn) {
                throw new Error('expected current turn while hand is running')
            }

            const result = tressetteTableStore.playCard({
                tableId,
                username: turn.turnPlayer,
                source: 'timeout_auto'
            })

            if (result.play.trickEnded) {
                if (result.play.trickEnded.winnerPosition === 'SUD' || result.play.trickEnded.winnerPosition === 'NORD') {
                    rawHandSN += result.play.trickEnded.trickPoints
                } else {
                    rawHandEO += result.play.trickEnded.trickPoints
                }

                if (result.play.trickEnded.trickNumber < 10) {
                    expect(result.play.trickEnded.scoreSN).toBe(0)
                    expect(result.play.trickEnded.scoreEO).toBe(0)
                }
            }

            if (result.play.handTransition.handEnded) {
                lastResult = result
                break
            }
        }

        if (!lastResult || !lastResult.play.trickEnded) {
            throw new Error('expected trick-ended payload at hand transition')
        }

        expect(lastResult.play.trickEnded.trickNumber).toBe(10)
        expect(lastResult.play.trickEnded.scoreSN).toBe(Math.floor(rawHandSN / 3))
        expect(lastResult.play.trickEnded.scoreEO).toBe(Math.floor(rawHandEO / 3))
        expect(lastResult.play.handTransition.handScore).toEqual({
            teamSN: Math.floor(rawHandSN / 3),
            teamEO: Math.floor(rawHandEO / 3)
        })
    })

    test('game continues across hands until final score condition is reached', () => {
        const { tableId } = setupStartedTable()

        let handEndedCount = 0
        let status: 'waiting' | 'starting' | 'in_game' | 'ended' = 'in_game'

        for (let index = 0; index < 2000; index++) {
            const turn = tressetteTableStore.getCurrentTurn(tableId)
            if (!turn) {
                break
            }

            const result = tressetteTableStore.playCard({
                tableId,
                username: turn.turnPlayer,
                source: 'timeout_auto'
            })

            if (result.play.handTransition.handEnded) {
                handEndedCount += 1
            }

            status = result.table.status
            if (status === 'ended') {
                break
            }
        }

        expect(handEndedCount).toBeGreaterThan(1)
        expect(status).toBe('ended')
    })
    test('anticlockwise order includes Paolo -> Marta case', () => {
        const created = tressetteTableStore.create({ owner: 'Marta' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Vito', position: 'NORD' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Tonino', position: 'EST' })
        tressetteTableStore.join({ tableId: created.tableId, username: 'Paolo', position: 'OVEST' })

        ;(Math.random as jest.Mock).mockReturnValue(0.99)
        tressetteTableStore.start({ tableId: created.tableId, username: 'Marta' })
        tressetteTableStore.activateStartedGame(created.tableId)

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



