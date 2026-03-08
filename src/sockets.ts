import { Server } from 'socket.io'
import * as http from 'http'
import { tressetteTableStore, TressetteStoreError, TressettePlayCardStoreResult } from './tressette/tressette-table.store'
import {
    TRESSETTE_POSITIONS,
    TressetteCard,
    TressettePosition,
    TressetteTable,
    TressetteTablePlayer,
    TressetteTurnState
} from './tressette/tressette.types'
import { registerStartPipelineDispatcher, StartPipelineContext } from './tressette/tressette-start.pipeline'

type JoinTablePayload = {
    tableId?: unknown
    username?: unknown
    position?: unknown
}

type LeaveTablePayload = {
    tableId?: unknown
    username?: unknown
}

type StartGamePayload = {
    tableId?: unknown
    username?: unknown
}

type PlayCardPayload = {
    tableId?: unknown
    username?: unknown
    card?: unknown
}

export const TURN_TIMEOUT_SECONDS = 20
const TURN_TIMEOUT_MS = TURN_TIMEOUT_SECONDS * 1000

const readNonEmptyString = (value: unknown): string | null => {
    if (typeof value !== 'string') {
        return null
    }

    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
}

const readPosition = (value: unknown): TressettePosition | null => {
    if (typeof value !== 'string') {
        return null
    }

    if ((TRESSETTE_POSITIONS as readonly string[]).includes(value)) {
        return value as TressettePosition
    }

    return null
}

const readCard = (value: unknown): TressetteCard | null => {
    if (typeof value !== 'object' || value === null) {
        return null
    }

    const maybeCard = value as { suit?: unknown, value?: unknown }
    if (!Number.isInteger(maybeCard.suit) || !Number.isInteger(maybeCard.value)) {
        return null
    }

    return {
        suit: maybeCard.suit as number,
        value: maybeCard.value as number
    }
}

const tableRoom = (tableId: string): string => `tressette:table:${tableId}`

const emitStoreError = (socket: any, error: unknown) => {
    if (error instanceof TressetteStoreError) {
        socket.emit('tressette:error', {
            error: {
                code: error.code,
                message: error.message
            }
        })
        return
    }

    socket.emit('tressette:error', {
        error: {
            code: 'INTERNAL_ERROR',
            message: 'internal server error'
        }
    })
}

const emitStoreErrorToRoom = (io: Server, tableId: string, error: unknown) => {
    if (error instanceof TressetteStoreError) {
        io.to(tableRoom(tableId)).emit('tressette:error', {
            error: {
                code: error.code,
                message: error.message
            }
        })
        return
    }

    io.to(tableRoom(tableId)).emit('tressette:error', {
        error: {
            code: 'INTERNAL_ERROR',
            message: 'internal server error'
        }
    })
}

const debugStartPipeline = (
    context: StartPipelineContext,
    currentPlayer: string | null,
    deadlineMs: number | null
): void => {
    if (process.env.LOG_LEVEL !== 'debug') {
        return
    }

    console.debug('[tressette:start-pipeline]', {
        tableId: context.table.tableId,
        owner: context.owner,
        trigger: context.trigger,
        statusBefore: context.statusBefore,
        statusAfter: context.table.status,
        currentPlayer,
        deadlineMs
    })
}

const getTableStatusSafe = (tableId: string): 'waiting' | 'in_game' | 'ended' | null => {
    try {
        return tressetteTableStore.getById(tableId).status
    } catch (_error: unknown) {
        return null
    }
}

const resolveCurrentPlayer = (table: TressetteTable, turnPlayer: string): TressetteTablePlayer | null => {
    return table.players.find((player) => player.username === turnPlayer) ?? null
}

export const createIo = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production' ? false : true
        }
    })

    const turnTimeouts = new Map<string, NodeJS.Timeout>()

    const clearTurnTimeout = (tableId: string) => {
        const existing = turnTimeouts.get(tableId)
        if (!existing) {
            return
        }

        clearTimeout(existing)
        turnTimeouts.delete(tableId)
    }

    const emitTurnStarted = (table: TressetteTable, turn: TressetteTurnState): number => {
        clearTurnTimeout(table.tableId)

        const currentPlayer = resolveCurrentPlayer(table, turn.turnPlayer)
        const turnDeadlineMs = Date.now() + TURN_TIMEOUT_MS

        io.to(tableRoom(table.tableId)).emit('tressette:turn-started', {
            tableId: table.tableId,
            trickNumber: turn.trickNumber,
            currentPlayer: {
                username: turn.turnPlayer,
                position: currentPlayer?.position ?? null
            },
            turnDeadlineMs,
            secondsRemaining: TURN_TIMEOUT_SECONDS,
            timeoutSeconds: TURN_TIMEOUT_SECONDS
        })

        const timeoutHandle = setTimeout(() => {
            try {
                const result = tressetteTableStore.playCard({
                    tableId: table.tableId,
                    username: turn.turnPlayer,
                    source: 'timeout_auto'
                })

                emitPlayFlow(result)
            } catch (error: unknown) {
                clearTurnTimeout(table.tableId)
                emitStoreErrorToRoom(io, table.tableId, error)
            }
        }, TURN_TIMEOUT_MS)

        turnTimeouts.set(table.tableId, timeoutHandle)
        return turnDeadlineMs
    }

    const emitPlayFlow = (result: TressettePlayCardStoreResult) => {
        const { table, play } = result

        clearTurnTimeout(table.tableId)

        io.to(tableRoom(table.tableId)).emit('tressette:card-played', {
            tableId: play.tableId,
            trickNumber: play.trickNumber,
            username: play.username,
            card: play.card,
            source: play.source
        })

        if (play.trickEnded) {
            io.to(tableRoom(table.tableId)).emit('tressette:trick-ended', {
                tableId: table.tableId,
                trickNumber: play.trickEnded.trickNumber,
                winner: play.trickEnded.winner,
                trickPoints: play.trickEnded.trickPoints,
                scoreSN: play.trickEnded.scoreSN,
                scoreEO: play.trickEnded.scoreEO
            })
        }

        io.to(tableRoom(table.tableId)).emit('tressette:table-updated', table)

        if (play.nextTurn && table.status === 'in_game') {
            emitTurnStarted(table, play.nextTurn)
        }
    }

    const emitStartPipeline = (context: StartPipelineContext) => {
        const table = context.table

        io.to(tableRoom(table.tableId)).emit('tressette:table-updated', table)
        io.to(tableRoom(table.tableId)).emit('tressette:hand-started', {
            tableId: table.tableId,
            status: table.status
        })

        const currentTurn = tressetteTableStore.getCurrentTurn(table.tableId)
        if (!currentTurn) {
            debugStartPipeline(context, null, null)
            return
        }

        const deadlineMs = emitTurnStarted(table, currentTurn)
        debugStartPipeline(context, currentTurn.turnPlayer, deadlineMs)
    }

    registerStartPipelineDispatcher(emitStartPipeline)

    io.on('connection', (socket) => {
        console.log(`User ${socket.id} connected`)

        socket.emit('message', 'Welcome to Game Land!')
        socket.broadcast.emit('message', `${socket.id.substring(0, 5)} si e\' connesso!`)

        socket.on('message', (data) => {
            io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
        })

        socket.on('disconnect', () => {
            console.log(`User ${socket.id} disconnected`)
            socket.broadcast.emit('message', `${socket.id.substring(0, 5)} si ha abbandonato...`)
        })

        socket.on('activity', (name) => {
            console.log('activity', name)
            socket.broadcast.emit('activity', name)
        })

        socket.on('tressette:join-table', (payload: JoinTablePayload) => {
            const tableId = readNonEmptyString(payload?.tableId)
            const username = readNonEmptyString(payload?.username)
            const position = readPosition(payload?.position)

            if (!tableId || !username || !position) {
                socket.emit('tressette:error', {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'tableId, username and position are required'
                    }
                })
                return
            }

            try {
                const table = tressetteTableStore.join({ tableId, username, position })
                socket.join(tableRoom(tableId))
                io.to(tableRoom(tableId)).emit('tressette:table-updated', table)
            } catch (error: unknown) {
                emitStoreError(socket, error)
            }
        })

        socket.on('tressette:leave-table', (payload: LeaveTablePayload) => {
            const tableId = readNonEmptyString(payload?.tableId)
            const username = readNonEmptyString(payload?.username)

            if (!tableId || !username) {
                socket.emit('tressette:error', {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'tableId and username are required'
                    }
                })
                return
            }

            try {
                const table = tressetteTableStore.leave({ tableId, username })
                io.to(tableRoom(tableId)).emit('tressette:table-updated', table)
                socket.leave(tableRoom(tableId))
            } catch (error: unknown) {
                emitStoreError(socket, error)
            }
        })

        socket.on('tressette:start-game', (payload: StartGamePayload) => {
            const tableId = readNonEmptyString(payload?.tableId)
            const username = readNonEmptyString(payload?.username)

            if (!tableId || !username) {
                socket.emit('tressette:error', {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'tableId and username are required'
                    }
                })
                return
            }

            const statusBefore = getTableStatusSafe(tableId)

            try {
                const table = tressetteTableStore.start({ tableId, username })
                socket.join(tableRoom(tableId))

                emitStartPipeline({
                    table,
                    owner: username,
                    statusBefore: statusBefore ?? 'waiting',
                    trigger: 'socket'
                })
            } catch (error: unknown) {
                emitStoreError(socket, error)
            }
        })

        socket.on('tressette:play-card', (payload: PlayCardPayload) => {
            const tableId = readNonEmptyString(payload?.tableId)
            const username = readNonEmptyString(payload?.username)

            if (!tableId || !username) {
                socket.emit('tressette:error', {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'tableId and username are required'
                    }
                })
                return
            }

            const hasCardPayload = payload?.card !== undefined
            const card = hasCardPayload ? readCard(payload.card) : undefined
            if (hasCardPayload && !card) {
                socket.emit('tressette:error', {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'card must contain integer suit and value'
                    }
                })
                return
            }

            try {
                const result = tressetteTableStore.playCard({
                    tableId,
                    username,
                    source: 'manual',
                    card
                })

                socket.join(tableRoom(tableId))
                emitPlayFlow(result)
            } catch (error: unknown) {
                emitStoreError(socket, error)
            }
        })
    })

    return io
}
