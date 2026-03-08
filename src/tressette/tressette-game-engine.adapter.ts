import { Player } from '../domain/player.model'
import { DeckIT } from '../domain/decks/deckIt.model'
import { Position3s74i, Player3s74i } from '../domain/games/3s7/3s74i/player3s74i.model'
import { Table3s74i } from '../domain/games/3s7/3s74i/table3s74i.model'
import { TressettePlayCardOutcome, TressettePosition, TressetteTable } from './tressette.types'

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
    currentOpenerIndex: number
    tricksPlayed: number
}

class TressetteGameEngineAdapter {
    private readonly sessions = new Map<string, EngineSession>()

    initialize(tableSnapshot: TressetteTable): void {
        if (tableSnapshot.players.length !== 4 || !tableSnapshot.isComplete) {
            throw new TressetteGameEngineError('TABLE_NOT_COMPLETE', 'table must have 4 players to start', 409)
        }

        const ownerPlayer = new Player(tableSnapshot.owner)
        const engineTable = new Table3s74i(ownerPlayer, new DeckIT(), { finalPoins: 31 })

        const playersToJoin = tableSnapshot.players.filter((player) => player.username !== tableSnapshot.owner)
        playersToJoin.forEach((player) => {
            engineTable.join(new Player(player.username), this.toEnginePosition(player.position))
        })

        engineTable.tricks = [[[]]]
        engineTable.handOpenerIndex = 0
        engineTable.deck.italianShuffle()
        engineTable.distribuiteCards()

        this.sessions.set(tableSnapshot.tableId, {
            table: engineTable,
            currentOpenerIndex: engineTable.handOpenerIndex,
            tricksPlayed: 0
        })
    }

    playCard(tableSnapshot: TressetteTable, username: string): TressettePlayCardOutcome {
        const session = this.sessions.get(tableSnapshot.tableId)
        if (!session) {
            throw new TressetteGameEngineError('ENGINE_NOT_INITIALIZED', 'game engine session not initialized', 409)
        }

        if (tableSnapshot.status !== 'in_game') {
            throw new TressetteGameEngineError('TABLE_NOT_IN_GAME', 'table is not in game', 409)
        }

        if (session.tricksPlayed >= 10) {
            throw new TressetteGameEngineError('HAND_ALREADY_COMPLETED', 'current hand is already completed', 409)
        }

        const expectedPlayer = session.table.players[session.currentOpenerIndex]
        if (!expectedPlayer || expectedPlayer.username !== username) {
            throw new TressetteGameEngineError('NOT_PLAYER_TURN', 'it is not the player turn', 409)
        }

        const winner = session.table.playTrick(session.currentOpenerIndex, 0, 0)
        session.tricksPlayed += 1

        const nextOpenerIndex = session.table.players.findIndex((player: Player3s74i) => player.username === winner.username)
        session.currentOpenerIndex = nextOpenerIndex >= 0 ? nextOpenerIndex : session.currentOpenerIndex

        let nextStatus: 'in_game' | 'ended' = 'in_game'
        if (session.tricksPlayed >= 10) {
            session.table.calculatePoints(0, 0)
            nextStatus = session.table.isSetEnded() ? 'ended' : 'in_game'
        }

        return {
            winner: winner.username,
            nextPlayer: session.table.players[session.currentOpenerIndex].username,
            tricksPlayed: session.tricksPlayed,
            nextStatus
        }
    }

    isInitialized(tableId: string): boolean {
        return this.sessions.has(tableId)
    }

    reset(): void {
        this.sessions.clear()
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
