import express from 'express';
import bodyParse from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';

class App {
    public express: express.Application

    constructor() {
        this.express = express()

        this.connectToMongoDb()
        this.setBodyParserMiddlewares()
        this.handleCORSErrors()
    }

    private setBodyParserMiddlewares(): void {
        this.express.use(bodyParse.urlencoded({ extended: false }));
        this.express.use(bodyParse.json());
    }

    private handleCORSErrors() {
        const corsOptions: cors.CorsOptions = {
            // Set origin into production
            // origin: 'http://example.com',
            optionsSuccessStatus: 200
        };
        this.express.use(cors(corsOptions));
    }

    private connectToMongoDb(): void {
        mongoose.Promise = Promise
        mongoose.connect(process.env.MONGO_URL)
            .then(() => console.log("Connectd to Mongo DB"))
        mongoose.connection.on('error', (error: Error) => {
            console.log(error)
        })
    }
}

export default new App();