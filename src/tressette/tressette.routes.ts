import { Request, Response, Router } from 'express'
import { tressetteTableStore } from './tressette-table.store'

export const tressetteRouter = Router()

tressetteRouter.post('/tables', (req: Request, res: Response) => {
    const owner = typeof req.body?.owner === 'string' ? req.body.owner.trim() : ''

    if (!owner) {
        return res.status(400).json({
            error: {
                code: 'VALIDATION_ERROR',
                message: 'owner is required'
            }
        })
    }

    const table = tressetteTableStore.create({ owner })
    return res.status(201).json(table)
})
