import { createServer } from "http";
import { createIo } from "./sockets"
import app from "./app";

const server = createServer(app.express)

const io = createIo(server)

//TODO: move the PORT const in a config file
const PORT: any = process.env.PORT || 3500

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`)
});
