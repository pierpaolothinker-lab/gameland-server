import { Server } from 'socket.io'
import * as http from 'http'
import { TressettePlayCardStoreResult, TressetteStoreError } from './tressette/tressette-table.store'
import {
    TRESSETTE_POSITIONS,
    TressetteCard,
    TressetteCurrentTrickPlay,
    TressettePosition,
    TressetteTable,
    TressetteTablePlayer,
    TressetteTurnState
} from './tressette/tressette.types'
import { getStoreForMode } from './tressette/tressette-mode.store'
import { resolveModeFromSocketHandshake, TressetteMode } from './tressette/tressette.mode'
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

type WatchTablePayload = {
    tableId?: unknown
    username?: unknown
}

type WatchBootstrapSocket = {
    join: (room: string) => void
    emit: (event: string, payload: unknown) => void
}

type PlayerStatePayload = {
    tableId: string
    mode: TressetteMode
    myHand: TressetteCard[] | null
    currentTrick: TressetteCurrentTrickPlay[]
    currentTurn: {
        username: string
        position: TressettePosition | null
    } | null
    turnDeadlineMs: number | null
    secondsRemaining: number
    timeoutSeconds: number
    status: TressetteTable['status']
    points: TressetteTable['points']
}
export type TurnBootstrapPayload = {
    tableId: string
    mode: TressetteMode
    trickNumber: number
    currentPlayer: {
        username: string
        position: TressettePosition | null
    }
    currentTrick: TressetteCurrentTrickPlay[]
    myHand: TressetteCard[] | null
    turnDeadlineMs: number
    secondsRemaining: number
    timeoutSeconds: number
}

export const resolveTurnTimeoutSeconds = (): number => {
    const raw = process.env.TRESSETTE_TURN_TIMEOUT_SECONDS
    if (raw) {
        const parsed = Number(raw)
        if (Number.isInteger(parsed) && parsed > 0) {
            return parsed
        }
    }

    return process.env.NODE_ENV === 'production' ? 20 : 5
}

export const TURN_TIMEOUT_SECONDS = resolveTurnTimeoutSeconds()
const TURN_TIMEOUT_MS = TURN_TIMEOUT_SECONDS * 1000

const ALLOWED_SOCKET_ORIGINS = ['http://localhost:4200', 'http://localhost:4400', 'http://localhost:8100']

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

const tableRoom = (mode: TressetteMode, tableId: string): string => `tressette:table:${mode}:${tableId}`
const turnKey = (mode: TressetteMode, tableId: string): string => `${mode}:${tableId}`

const resolveCurrentPlayer = (table: TressetteTable, turnPlayer: string): TressetteTablePlayer | null => {
    return table.players.find((player) => player.username === turnPlayer) ?? null
}

const readCurrentTrickSafe = (mode: TressetteMode, tableId: string): TressetteCurrentTrickPlay[] => {
    try {
        return getStoreForMode(mode).getCurrentTrick(tableId)
    } catch (_error: unknown) {
        return []
    }
}

const readMyHandSafe = (mode: TressetteMode, tableId: string, username: string | null): TressetteCard[] | null => {
    if (!username) {
        return null
    }

    try {
        return getStoreForMode(mode).getPlayerHand(tableId, username)
    } catch (_error: unknown) {
        return null
    }
}


const getSocketTableUsersMap = (socket: any): Map<string, string> => {
    if (!socket.data.__tressetteTableUsers) {
        socket.data.__tressetteTableUsers = new Map<string, string>()
    }

    return socket.data.__tressetteTableUsers as Map<string, string>
}

const setSocketTableUsername = (socket: any, mode: TressetteMode, tableId: string, username: string | null): void => {
    if (!username) {
        return
    }

    getSocketTableUsersMap(socket).set(turnKey(mode, tableId), username)
}

const getSocketTableUsername = (socket: any, mode: TressetteMode, tableId: string): string | null => {
    return getSocketTableUsersMap(socket).get(turnKey(mode, tableId)) ?? null
}
const buildTurnBootstrapPayload = (
    mode: TressetteMode,
    table: TressetteTable,
    turn: TressetteTurnState,
    currentPlayer: TressetteTablePlayer | null,
    turnDeadlineMs: number,
    currentTrick: TressetteCurrentTrickPlay[],
    myHand: TressetteCard[] | null
): TurnBootstrapPayload => {
    return {
        tableId: table.tableId,
        mode,
        trickNumber: turn.trickNumber,
        currentPlayer: {
            username: turn.turnPlayer,
            position: currentPlayer?.position ?? null
        },
        currentTrick,
        myHand,
        turnDeadlineMs,
        secondsRemaining: Math.max(0, Math.ceil((turnDeadlineMs - Date.now()) / 1000)),
        timeoutSeconds: TURN_TIMEOUT_SECONDS
    }
}


export const buildPlayerStatePayload = (
    mode: TressetteMode,
    tableId: string,
    username: string,
    turnDeadlines: Map<string, number>
): PlayerStatePayload | null => {
    try {
        const store = getStoreForMode(mode)
        const table = store.getById(tableId)
        const currentTrick = readCurrentTrickSafe(mode, tableId)
        const myHand = readMyHandSafe(mode, tableId, username)
        const currentTurn = store.getCurrentTurn(tableId)
        const currentTurnPlayer = currentTurn
            ? resolveCurrentPlayer(table, currentTurn.turnPlayer)
            : null

        const deadline = currentTurn
            ? (turnDeadlines.get(turnKey(mode, tableId)) ?? (Date.now() + TURN_TIMEOUT_MS))
            : null

        return {
            tableId,
            mode,
            myHand,
            currentTrick,
            currentTurn: currentTurn
                ? {
                    username: currentTurn.turnPlayer,
                    position: currentTurnPlayer?.position ?? null
                }
                : null,
            turnDeadlineMs: deadline,
            secondsRemaining: deadline ? Math.max(0, Math.ceil((deadline - Date.now()) / 1000)) : 0,
            timeoutSeconds: TURN_TIMEOUT_SECONDS,
            status: table.status,
            points: table.points
        }
    } catch (_error: unknown) {
        return null
    }
}

const emitPlayerStateToSocket = (
    socket: any,
    mode: TressetteMode,
    tableId: string,
    turnDeadlines: Map<string, number>,
    username: string | null
): void => {
    if (!username) {
        return
    }

    const payload = buildPlayerStatePayload(mode, tableId, username, turnDeadlines)
    if (!payload) {
        return
    }

    socket.emit('tressette:player-state', payload)
}
export const emitWatchTableBootstrap = (
    mode: TressetteMode,
    tableId: string,
    socket: WatchBootstrapSocket,
    turnDeadlines: Map<string, number>,
    username: string | null = null
): void => {
    const store = getStoreForMode(mode)
    const table = store.getById(tableId)
    const currentTrick = readCurrentTrickSafe(mode, tableId)

    socket.join(tableRoom(mode, tableId))
    socket.emit('tressette:table-updated', {
        ...table,
        mode,
        currentTrick
    })
    emitPlayerStateToSocket(socket, mode, tableId, turnDeadlines, username)

    if (table.status !== 'in_game') {
        return
    }

    const currentTurn = store.getCurrentTurn(tableId)
    if (!currentTurn) {
        return
    }

    const currentPlayer = resolveCurrentPlayer(table, currentTurn.turnPlayer)
    const turnDeadlineMs = turnDeadlines.get(turnKey(mode, table.tableId)) ?? (Date.now() + TURN_TIMEOUT_MS)
    const myHand = readMyHandSafe(mode, tableId, username)

    socket.emit(
        'tressette:turn-bootstrap',
        buildTurnBootstrapPayload(mode, table, currentTurn, currentPlayer, turnDeadlineMs, currentTrick, myHand)
    )
}

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

const emitStoreErrorToRoom = (io: Server, mode: TressetteMode, tableId: string, error: unknown) => {
    if (error instanceof TressetteStoreError) {
        io.to(tableRoom(mode, tableId)).emit('tressette:error', {
            error: {
                code: error.code,
                message: error.message
            }
        })
        return
    }

    io.to(tableRoom(mode, tableId)).emit('tressette:error', {
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
        mode: context.mode,
        owner: context.owner,
        trigger: context.trigger,
        statusBefore: context.statusBefore,
        statusAfter: context.table.status,
        currentPlayer,
        deadlineMs
    })
}

const getTableStatusSafe = (mode: TressetteMode, tableId: string): 'waiting' | 'in_game' | 'ended' | null => {
    try {
        return getStoreForMode(mode).getById(tableId).status
    } catch (_error: unknown) {
        return null
    }
}

export const createIo = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (process.env.NODE_ENV === 'production') {
                    callback(null, false)
                    return
                }

                if (!origin || ALLOWED_SOCKET_ORIGINS.includes(origin)) {
                    callback(null, true)
                    return
                }

                callback(new Error('CORS not allowed'))
            }
        }
    })

    const turnTimeouts = new Map<string, NodeJS.Timeout>()
    const turnTickers = new Map<string, NodeJS.Timeout>()
    const turnDeadlines = new Map<string, number>()

    const clearTurnTimeout = (mode: TressetteMode, tableId: string) => {
        const key = turnKey(mode, tableId)
        const existing = turnTimeouts.get(key)
        if (!existing) {
            return
        }

        clearTimeout(existing)
        turnTimeouts.delete(key)
    }

    const clearTurnTicker = (mode: TressetteMode, tableId: string) => {
        const key = turnKey(mode, tableId)
        const existing = turnTickers.get(key)
        if (!existing) {
            return
        }

        clearInterval(existing)
        turnTickers.delete(key)
    }

    const emitPerUserStateRefresh = (mode: TressetteMode, tableId: string) => {
        const room = io.sockets.adapter.rooms.get(tableRoom(mode, tableId))
        if (!room) {
            return
        }

        room.forEach((socketId) => {
            const roomSocket = io.sockets.sockets.get(socketId)
            if (!roomSocket) {
                return
            }

            const username = getSocketTableUsername(roomSocket, mode, tableId)
            emitPlayerStateToSocket(roomSocket, mode, tableId, turnDeadlines, username)
        })
    }

    const emitTurnUpdated = (
        mode: TressetteMode,
        table: TressetteTable,
        turn: TressetteTurnState,
        currentPlayer: TressetteTablePlayer | null,
        turnDeadlineMs: number
    ) => {
        const currentTrick = readCurrentTrickSafe(mode, table.tableId)
        io.to(tableRoom(mode, table.tableId)).emit(
            'tressette:turn-updated',
            buildTurnBootstrapPayload(mode, table, turn, currentPlayer, turnDeadlineMs, currentTrick, null)
        )
    }

    const startTurnTicker = (
        mode: TressetteMode,
        table: TressetteTable,
        turn: TressetteTurnState,
        currentPlayer: TressetteTablePlayer | null,
        turnDeadlineMs: number
    ) => {
        clearTurnTicker(mode, table.tableId)

        emitTurnUpdated(mode, table, turn, currentPlayer, turnDeadlineMs)

        const interval = setInterval(() => {
            emitTurnUpdated(mode, table, turn, currentPlayer, turnDeadlineMs)

            if (Date.now() >= turnDeadlineMs) {
                clearTurnTicker(mode, table.tableId)
            }
        }, 1000)

        turnTickers.set(turnKey(mode, table.tableId), interval)
    }

    const emitTurnStarted = (mode: TressetteMode, table: TressetteTable, turn: TressetteTurnState): number => {
        clearTurnTimeout(mode, table.tableId)
        clearTurnTicker(mode, table.tableId)

        const currentPlayer = resolveCurrentPlayer(table, turn.turnPlayer)
        const turnDeadlineMs = Date.now() + TURN_TIMEOUT_MS
        turnDeadlines.set(turnKey(mode, table.tableId), turnDeadlineMs)
        const currentTrick = readCurrentTrickSafe(mode, table.tableId)

        io.to(tableRoom(mode, table.tableId)).emit(
            'tressette:turn-started',
            buildTurnBootstrapPayload(mode, table, turn, currentPlayer, turnDeadlineMs, currentTrick, null)
        )

        startTurnTicker(mode, table, turn, currentPlayer, turnDeadlineMs)

        const timeoutHandle = setTimeout(() => {
            clearTurnTicker(mode, table.tableId)

            try {
                const result = getStoreForMode(mode).playCard({
                    tableId: table.tableId,
                    username: turn.turnPlayer,
                    source: 'timeout_auto'
                })

                emitPlayFlow(mode, result)
            } catch (error: unknown) {
                clearTurnTimeout(mode, table.tableId)
                turnDeadlines.delete(turnKey(mode, table.tableId))
                emitStoreErrorToRoom(io, mode, table.tableId, error)
            }
        }, TURN_TIMEOUT_MS)

        turnTimeouts.set(turnKey(mode, table.tableId), timeoutHandle)
        return turnDeadlineMs
    }

    const emitPlayFlow = (mode: TressetteMode, result: TressettePlayCardStoreResult) => {
        const { table, play } = result

        clearTurnTimeout(mode, table.tableId)
        clearTurnTicker(mode, table.tableId)

        io.to(tableRoom(mode, table.tableId)).emit('tressette:card-played', {
            tableId: play.tableId,
            trickNumber: play.trickNumber,
            mode,
            username: play.username,
            card: play.card,
            source: play.source,
            currentTrick: play.currentTrick
        })

        if (play.trickEnded) {
            io.to(tableRoom(mode, table.tableId)).emit('tressette:trick-ended', {
                tableId: table.tableId,
                trickNumber: play.trickEnded.trickNumber,
                mode,
                winner: play.trickEnded.winner,
                winnerPosition: table.players.find((player) => player.username === play.trickEnded?.winner)?.position ?? null,
                trickCards: play.trickEnded.trickCards,
                trickPoints: play.trickEnded.trickPoints,
                scoreSN: play.trickEnded.scoreSN,
                scoreEO: play.trickEnded.scoreEO
            })
        }

        io.to(tableRoom(mode, table.tableId)).emit('tressette:table-updated', {
            ...table,
            mode,
            currentTrick: readCurrentTrickSafe(mode, table.tableId)
        })

        if (play.nextTurn && table.status === 'in_game') {
            emitTurnStarted(mode, table, play.nextTurn)
        } else {
            turnDeadlines.delete(turnKey(mode, table.tableId))
        }

        emitPerUserStateRefresh(mode, table.tableId)
    }

    const emitStartPipeline = (context: StartPipelineContext) => {
        const table = context.table

        io.to(tableRoom(context.mode, table.tableId)).emit('tressette:table-updated', {
            ...table,
            mode: context.mode,
            currentTrick: readCurrentTrickSafe(context.mode, table.tableId)
        })
        io.to(tableRoom(context.mode, table.tableId)).emit('tressette:hand-started', {
            tableId: table.tableId,
            mode: context.mode,
            status: table.status
        })

        const currentTurn = getStoreForMode(context.mode).getCurrentTurn(table.tableId)
        if (!currentTurn) {
            debugStartPipeline(context, null, null)
            return
        }

        const deadlineMs = emitTurnStarted(context.mode, table, currentTurn)
        debugStartPipeline(context, currentTurn.turnPlayer, deadlineMs)
    }

    registerStartPipelineDispatcher(emitStartPipeline)

    io.on('connection', (socket) => {
        const socketMode = resolveModeFromSocketHandshake(socket.handshake)
        const store = getStoreForMode(socketMode)

        console.log(`User ${socket.id} connected`)

        socket.emit('message', 'Welcome to Game Land!')
        socket.emit('tressette:mode-selected', { mode: socketMode })
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
                const table = store.join({ tableId, username, position })
                setSocketTableUsername(socket, socketMode, tableId, username)
                socket.join(tableRoom(socketMode, tableId))
                io.to(tableRoom(socketMode, tableId)).emit('tressette:table-updated', {
                    ...table,
                    mode: socketMode,
                    currentTrick: readCurrentTrickSafe(socketMode, tableId)
                })
            } catch (error: unknown) {
                emitStoreError(socket, error)
            }
        })

        const watchTableHandler = (payload: WatchTablePayload) => {
            const tableId = readNonEmptyString(payload?.tableId)
            const username = readNonEmptyString(payload?.username)

            if (!tableId) {
                socket.emit('tressette:error', {
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: 'tableId is required'
                    }
                })
                return
            }

            try {
                setSocketTableUsername(socket, socketMode, tableId, username)
                emitWatchTableBootstrap(socketMode, tableId, socket, turnDeadlines, username)
            } catch (error: unknown) {
                emitStoreError(socket, error)
            }
        }

        socket.on('tressette:watch-table', watchTableHandler)
        socket.on('tressette:bootstrap-table', watchTableHandler)

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
                const table = store.leave({ tableId, username })
                io.to(tableRoom(socketMode, tableId)).emit('tressette:table-updated', {
                    ...table,
                    mode: socketMode,
                    currentTrick: readCurrentTrickSafe(socketMode, tableId)
                })
                socket.leave(tableRoom(socketMode, tableId))
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

            const statusBefore = getTableStatusSafe(socketMode, tableId)

            try {
                const table = store.start({ tableId, username })
                setSocketTableUsername(socket, socketMode, tableId, username)
                socket.join(tableRoom(socketMode, tableId))

                emitStartPipeline({
                    mode: socketMode,
                    table,
                    owner: username,
                    statusBefore: statusBefore ?? 'waiting',
                    trigger: 'socket'
                })

                emitWatchTableBootstrap(socketMode, tableId, socket, turnDeadlines, username)
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
                const result = store.playCard({
                    tableId,
                    username,
                    source: 'manual',
                    card
                })

                setSocketTableUsername(socket, socketMode, tableId, username)
                socket.join(tableRoom(socketMode, tableId))
                emitPlayFlow(socketMode, result)
                emitWatchTableBootstrap(socketMode, tableId, socket, turnDeadlines, username)
            } catch (error: unknown) {
                emitStoreError(socket, error)
            }
        })
    })

    return io
}















