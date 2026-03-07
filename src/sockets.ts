import { Server } from 'socket.io'
import * as http from 'http'
import { tressetteTableStore, TressetteStoreError } from './tressette/tressette-table.store'
import { TRESSETTE_POSITIONS, TressettePosition } from './tressette/tressette.types'

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
}

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

const tableRoom = (tableId: string): string => `tressette:table:${tableId}`

export const createIo = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:4200', 'http://localhost:8100']
        }
    })

    io.on('connection', (socket) => {
        console.log(`User ${socket.id} connected`)

        socket.emit('message', 'Welcome to Game Land!')
        socket.broadcast.emit('message', `${socket.id.substring(0, 5)} si e' connesso!`)

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

            try {
                const table = tressetteTableStore.start({ tableId, username })
                socket.join(tableRoom(tableId))
                io.to(tableRoom(tableId)).emit('tressette:table-updated', table)
                io.to(tableRoom(tableId)).emit('tressette:hand-started', {
                    tableId,
                    status: table.status
                })
            } catch (error: unknown) {
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
        })

        socket.on('tressette:play-card', (payload: PlayCardPayload) => {
            const tableId = readNonEmptyString(payload?.tableId)
            if (tableId) {
                socket.join(tableRoom(tableId))
            }

            socket.emit('tressette:error', {
                error: {
                    code: 'NOT_IMPLEMENTED',
                    message: 'play-card is not implemented yet'
                }
            })
        })
    })

    return io
}
