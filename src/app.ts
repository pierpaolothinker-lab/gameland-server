import express from 'express';
import bodyParse from 'body-parser';
import cors from 'cors';
import mongoose from 'mongoose';
import 'dotenv/config';
import { isAllowedOrigin, resolveAllowedHttpOrigins } from './origin-config';
import { tressetteRouter } from './tressette/tressette.routes';

class App {
    public express: express.Application

    constructor() {
        this.express = express()

        this.setBodyParserMiddlewares()
        this.handleCORSErrors()
        this.registerHealthRoute()
        this.registerRoutes()
        this.connectToMongoDb()
    }

    private setBodyParserMiddlewares(): void {
        this.express.use(bodyParse.urlencoded({ extended: false }));
        this.express.use(bodyParse.json());
    }

    private handleCORSErrors() {
        const allowedOrigins = resolveAllowedHttpOrigins()
        const corsOptions: cors.CorsOptions = {
            origin: (origin, callback) => {
                if (isAllowedOrigin(origin, allowedOrigins)) {
                    callback(null, true)
                    return
                }

                callback(new Error('CORS not allowed'))
            },
            optionsSuccessStatus: 200
        };
        this.express.use(cors(corsOptions));
    }

    private connectToMongoDb(): void {
        const mongoUrl = process.env.MONGO_URL
        if (!mongoUrl) {
            console.warn('MONGO_URL is not set. Starting without MongoDB connection.')
            return
        }

        mongoose
            .connect(mongoUrl)
            .then(() => console.log('Connected to Mongo DB'))
            .catch((error: Error) => {
                console.error('MongoDB connection error', error)
            })
    }

    private registerHealthRoute(): void {
        this.express.get('/health', (_req: express.Request, res: express.Response) => {
            res.status(200).json({ status: 'ok' })
        })
    }

    private registerRoutes(): void {
        this.express.use('/api/tressette', tressetteRouter)
    }
}

export default new App();
