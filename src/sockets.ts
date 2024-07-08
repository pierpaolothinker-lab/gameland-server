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

        // Upon Connection - only to the user
        socket.emit('message','Welcome to Game Land!')
        
        // Upon Connection - to all other users
        socket.broadcast.emit('message', `${socket.id.substring(0,5)} si e' connesso!`)

        // Listening for a message event
        socket.on('message', data => {
            io.emit('message', `${socket.id.substring(0,5)}: ${data}`)
        })

        // When User Disconnect = to all other users
        socket.on('disconnect', () => {
            console.log(`User ${socket.id} disconnected`)
            socket.broadcast.emit('message', `${socket.id.substring(0,5)} si ha abbandonato...`)
        })

        // Listen for activity
        socket.on('activity', (name) => {
            console.log('activity', name)
            socket.broadcast.emit('activity', name)
        })
    })
    return io
}