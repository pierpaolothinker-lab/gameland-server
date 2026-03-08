import { Player } from '../domain/player.model'
import { DeckIT } from '../domain/decks/deckIt.model'
import { Position3s74i, Player3s74i } from '../domain/games/3s7/3s74i/player3s74i.model'
import { Table3s74i } from '../domain/games/3s7/3s74i/table3s74i.model'
import { Card3s7 } from '../domain/games/3s7/card3s7.model'
import {
    TressetteCard,
    PlayCardTressetteInput,
    TressettePlayCardOutcome,
    TressettePosition,
    TressetteTable,
    TressetteTurnState
} from './tressette.types'
import { Trick3s4i } from '../domain/games/3s7/3s74i/trick3s74i.model'
import { Play } from '../domain/play.type'
import { getRandomInteger } from '../helpers/math.helper'

export class TressetteGameEngineError extends Error {
    readonly code: string
    readonly httpStatus: number

    constructor(code: string, message: string, httpStatus: number) {
        super(message)
        this.code = code
        this.httpStatus = httpStatus
    }
}

type EngineSession = {
    table: Table3s74i
    trickNumber: number
    cardsInCurrentTrick: number
    currentTurnIndex: number
    currentTrick: Trick3s4i
    leadCard: Card3s7 | null
    scoreSN: number
    scoreEO: number
    handEnded: boolean
}

// 4 Incrociato turn order aligned with FE seats (example: Paolo -> Marta).
const TURN_ORDER: Position3s74i[] = [
    Position3s74i.Sud,
    Position3s74i.Est,
    Position3s74i.Nord,
    Position3s74i.Ovest
]

class TressetteGameEngineAdapter {
    private readonly sessions = new Map<string, EngineSession>()

    initialize(tableSnapshot: TressetteTable): TressetteTurnState {
        if (tableSnapshot.players.length !== 4 || !tableSnapshot.isComplete) {
            throw new TressetteGameEngineError('TABLE_NOT_COMPLETE', 'table must have 4 players to start', 409)
        }

        const ownerPlayer = new Player(tableSnapshot.owner)
        const engineTable = new Table3s74i(ownerPlayer, new DeckIT(), { finalPoins: 31 })

        const playersToJoin = tableSnapshot.players.filter((player) => player.username !== tableSnapshot.owner)
        playersToJoin.forEach((player) => {
            engineTable.join(new Player(player.username), this.toEnginePosition(player.position))
        })

        engineTable.deck.italianShuffle()
        const openerIndex = getRandomInteger(0, 3)
        engineTable.handOpenerIndex = openerIndex
        engineTable.distribuiteCards()

        const session: EngineSession = {
            table: engineTable,
            trickNumber: 1,
            cardsInCurrentTrick: 0,
            currentTurnIndex: openerIndex,
            currentTrick: new Trick3s4i(),
            leadCard: null,
            scoreSN: 0,
            scoreEO: 0,
            handEnded: false
        }

        this.sessions.set(tableSnapshot.tableId, session)
        return this.getCurrentTurn(tableSnapshot.tableId) as TressetteTurnState
    }

    getCurrentTurn(tableId: string): TressetteTurnState | null {
        const session = this.sessions.get(tableId)
        if (!session || session.handEnded) {
            return null
        }

        const turnPlayer = session.table.players[session.currentTurnIndex]
        if (!turnPlayer) {
            return null
        }

        return {
            trickNumber: session.trickNumber,
            turnPlayer: turnPlayer.username
        }
    }

    playCard(tableSnapshot: TressetteTable, input: Omit<PlayCardTressetteInput, 'tableId'>): TressettePlayCardOutcome {
        const session = this.sessions.get(tableSnapshot.tableId)
        if (!session) {
            throw new TressetteGameEngineError('ENGINE_NOT_INITIALIZED', 'game engine session not initialized', 409)
        }

        if (tableSnapshot.status !== 'in_game') {
            throw new TressetteGameEngineError('TABLE_NOT_IN_GAME', 'table is not in game', 409)
        }

        if (session.handEnded) {
            throw new TressetteGameEngineError('HAND_ALREADY_COMPLETED', 'current hand is already completed', 409)
        }

        const currentPlayer = session.table.players[session.currentTurnIndex]
        if (!currentPlayer || currentPlayer.username !== input.username) {
            throw new TressetteGameEngineError('NOT_PLAYER_TURN', 'it is not the player turn', 409)
        }

        const card = this.resolveCardToPlay(session, currentPlayer, input)
        const play: Play = {
            player: currentPlayer,
            card
        }
        session.currentTrick.addPlay(play)

        if (session.cardsInCurrentTrick === 0) {
            session.leadCard = card
        }

        session.cardsInCurrentTrick += 1

        const outcomeBase = {
            tableId: tableSnapshot.tableId,
            trickNumber: session.trickNumber,
            username: input.username,
            card: this.toPlainCard(card),
            source: input.source
        }

        if (session.cardsInCurrentTrick < 4) {
            session.currentTurnIndex = this.nextTurnIndex(session, session.currentTurnIndex)
            return {
                ...outcomeBase,
                nextTurn: this.getCurrentTurn(tableSnapshot.tableId),
                trickEnded: null,
                handEnded: false,
                nextStatus: 'in_game'
            }
        }

        session.currentTrick.setWinner()
        const winner = session.currentTrick.getWinner()

        let trickPoints = session.currentTrick.getTotalScore()
        if (session.trickNumber === 10) {
            trickPoints += 3
        }

        const winnerSeat = session.table.players.find((player: Player3s74i) => player.username === winner.username)
        if (!winnerSeat) {
            throw new TressetteGameEngineError('ENGINE_PLAY_FAILED', 'unable to evaluate trick winner', 500)
        }

        if (winnerSeat.position === Position3s74i.Sud || winnerSeat.position === Position3s74i.Nord) {
            session.scoreSN += Math.floor(trickPoints / 3)
        } else {
            session.scoreEO += Math.floor(trickPoints / 3)
        }

        const winnerIndex = session.table.players.findIndex((player: Player3s74i) => player.username === winner.username)
        session.currentTurnIndex = winnerIndex

        const trickEnded = {
            trickNumber: session.trickNumber,
            winner: winner.username,
            trickPoints,
            scoreSN: session.scoreSN,
            scoreEO: session.scoreEO
        }

        session.trickNumber += 1
        session.cardsInCurrentTrick = 0
        session.currentTrick = new Trick3s4i()
        session.leadCard = null

        if (trickEnded.trickNumber >= 10) {
            session.handEnded = true
            return {
                ...outcomeBase,
                nextTurn: null,
                trickEnded,
                handEnded: true,
                nextStatus: 'ended'
            }
        }

        return {
            ...outcomeBase,
            nextTurn: this.getCurrentTurn(tableSnapshot.tableId),
            trickEnded,
            handEnded: false,
            nextStatus: 'in_game'
        }
    }

    isInitialized(tableId: string): boolean {
        return this.sessions.has(tableId)
    }

    reset(): void {
        this.sessions.clear()
    }

    private resolveCardToPlay(session: EngineSession, currentPlayer: Player3s74i, input: Omit<PlayCardTressetteInput, 'tableId'>): Card3s7 {
        if (input.card) {
            const card = this.parseManualCard(input.card)
            try {
                currentPlayer.playCard(card)
                return card
            } catch (_error: unknown) {
                throw new TressetteGameEngineError('CARD_NOT_OWNED', 'selected card is not owned by player', 409)
            }
        }

        if (session.cardsInCurrentTrick === 0 || !session.leadCard) {
            return currentPlayer.playCardRandom()
        }

        return currentPlayer.respondToCardRandom(session.leadCard)
    }

    private parseManualCard(inputCard: TressetteCard): Card3s7 {
        if (
            !Number.isInteger(inputCard.suit) ||
            !Number.isInteger(inputCard.value) ||
            inputCard.suit < 0 ||
            inputCard.suit > 3
        ) {
            throw new TressetteGameEngineError('INVALID_CARD', 'invalid card payload', 400)
        }

        try {
            return new Card3s7(inputCard.suit, inputCard.value)
        } catch (_error: unknown) {
            throw new TressetteGameEngineError('INVALID_CARD', 'invalid card payload', 400)
        }
    }

    private toPlainCard(card: Card3s7): TressetteCard {
        return {
            suit: card.suit,
            value: card.value
        }
    }

    private nextTurnIndex(session: EngineSession, currentTurnIndex: number): number {
        const currentPlayer = session.table.players[currentTurnIndex]
        if (!currentPlayer) {
            return (currentTurnIndex + 1) % TURN_ORDER.length
        }

        const currentOrderIndex = TURN_ORDER.indexOf(currentPlayer.position)
        const nextPosition = TURN_ORDER[(currentOrderIndex + 1) % TURN_ORDER.length]
        const nextPlayerIndex = session.table.players.findIndex((player) => player.position === nextPosition)

        return nextPlayerIndex >= 0 ? nextPlayerIndex : (currentTurnIndex + 1) % TURN_ORDER.length
    }

    private toEnginePosition(position: TressettePosition): Position3s74i {
        switch (position) {
            case 'SUD':
                return Position3s74i.Sud
            case 'NORD':
                return Position3s74i.Nord
            case 'EST':
                return Position3s74i.Est
            case 'OVEST':
                return Position3s74i.Ovest
            default:
                throw new TressetteGameEngineError('POSITION_NOT_AVAILABLE', 'position is not available', 409)
        }
    }
}

export const tressetteGameEngineAdapter = new TressetteGameEngineAdapter()


