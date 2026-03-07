import { Request, Response, Router } from 'express'
import { tressetteTableStore, TressetteStoreError } from './tressette-table.store'
import { TRESSETTE_POSITIONS, TressettePosition } from './tressette.types'

export const tressetteRouter = Router()

tressetteRouter.post('/tables', (req: Request, res: Response) => {
    const owner = readNonEmptyString(req.body?.owner)
    if (!owner) {
        return sendValidationError(res, 'owner is required')
    }

    const table = tressetteTableStore.create({ owner })
    return res.status(201).json(table)
})

tressetteRouter.get('/tables/:tableId', (req: Request, res: Response) => {
    try {
        const table = tressetteTableStore.getById(req.params.tableId)
        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

tressetteRouter.post('/tables/:tableId/join', (req: Request, res: Response) => {
    const username = readNonEmptyString(req.body?.username)
    const position = readPosition(req.body?.position)

    if (!username) {
        return sendValidationError(res, 'username is required')
    }

    if (!position) {
        return sendValidationError(res, 'position must be one of SUD,NORD,EST,OVEST')
    }

    try {
        const table = tressetteTableStore.join({
            tableId: req.params.tableId,
            username,
            position
        })

        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

tressetteRouter.post('/tables/:tableId/leave', (req: Request, res: Response) => {
    const username = readNonEmptyString(req.body?.username)
    if (!username) {
        return sendValidationError(res, 'username is required')
    }

    try {
        const table = tressetteTableStore.leave({
            tableId: req.params.tableId,
            username
        })

        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

tressetteRouter.post('/tables/:tableId/start', (req: Request, res: Response) => {
    const username = readNonEmptyString(req.body?.username)
    if (!username) {
        return sendValidationError(res, 'username is required')
    }

    try {
        const table = tressetteTableStore.start({
            tableId: req.params.tableId,
            username
        })

        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

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

const sendValidationError = (res: Response, message: string) => {
    return res.status(400).json({
        error: {
            code: 'VALIDATION_ERROR',
            message
        }
    })
}

const sendStoreError = (res: Response, error: unknown) => {
    if (error instanceof TressetteStoreError) {
        return res.status(error.httpStatus).json({
            error: {
                code: error.code,
                message: error.message
            }
        })
    }

    return res.status(500).json({
        error: {
            code: 'INTERNAL_ERROR',
            message: 'internal server error'
        }
    })
}
