import { Server } from "socket.io";
import * as http from 'http'

export const createIo = (server: http.Server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:8100"]
        }
    })
    io.on('connection', socket => {
        console.log(`User ${socket.id} connected`)

        socket.on('message', data => {
            io.emit('message', `${socket.id.substring(0,5)}: ${data}`)
        })
    })
    return io
}