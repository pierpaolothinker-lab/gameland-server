import * as http from "http";
import app from "./app";
import mongoose from "mongoose";

const server: http.Server = http.createServer(app.express);

//TODO: move the PORT const in a config file
const PORT: any = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("Server listening on port", PORT, "...");
});

// mongoose.Promise = Promise
// mongoose.connect(process.env.MONGO_URL)
// mongoose.connection.on('error', (error: Error) => {
//     console.log(error)
// })