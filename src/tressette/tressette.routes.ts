import { Request, Response, Router } from 'express'
import { dispatchStartPipeline } from './tressette-start.pipeline'
import { getStoreForMode } from './tressette-mode.store'
import { resolveModeFromHttp } from './tressette.mode'
import { TRESSETTE_POSITIONS, TressettePosition, TressetteTableStatus } from './tressette.types'
import { TressetteStoreError } from './tressette-table.store'

export const tressetteRouter = Router()

const USERNAME_MAX_LENGTH = 32

tressetteRouter.post('/tables', (req: Request, res: Response) => {
    const modeResolution = resolveModeFromHttp(req)
    if (!modeResolution.isValid) {
        return sendValidationError(res, 'mode must be demo or live')
    }

    const ownerResult = readUsernameInput(req, 'owner')
    if (ownerResult.error) {
        return sendValidationError(res, ownerResult.error)
    }

    const table = getStoreForMode(modeResolution.mode).create({ owner: ownerResult.value as string })
    return res.status(201).json(table)
})

tressetteRouter.get('/tables', (req: Request, res: Response) => {
    const modeResolution = resolveModeFromHttp(req)
    if (!modeResolution.isValid) {
        return sendValidationError(res, 'mode must be demo or live')
    }

    const tables = getStoreForMode(modeResolution.mode).list()
    return res.status(200).json(tables)
})

tressetteRouter.get('/tables/:tableId', (req: Request, res: Response) => {
    const modeResolution = resolveModeFromHttp(req)
    if (!modeResolution.isValid) {
        return sendValidationError(res, 'mode must be demo or live')
    }

    try {
        const table = getStoreForMode(modeResolution.mode).getById(req.params.tableId)
        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

tressetteRouter.post('/tables/:tableId/join', (req: Request, res: Response) => {
    const modeResolution = resolveModeFromHttp(req)
    if (!modeResolution.isValid) {
        return sendValidationError(res, 'mode must be demo or live')
    }

    const usernameResult = readUsernameInput(req, 'username')
    const position = readPosition(req.body?.position)

    if (usernameResult.error) {
        return sendValidationError(res, usernameResult.error)
    }

    if (!position) {
        return sendValidationError(res, 'position must be one of SUD,NORD,EST,OVEST')
    }

    try {
        const table = getStoreForMode(modeResolution.mode).join({
            tableId: req.params.tableId,
            username: usernameResult.value as string,
            position
        })

        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

tressetteRouter.post('/tables/:tableId/leave', (req: Request, res: Response) => {
    const modeResolution = resolveModeFromHttp(req)
    if (!modeResolution.isValid) {
        return sendValidationError(res, 'mode must be demo or live')
    }

    const username = readNonEmptyString(req.body?.username)
    if (!username) {
        return sendValidationError(res, 'username is required')
    }

    try {
        const table = getStoreForMode(modeResolution.mode).leave({
            tableId: req.params.tableId,
            username
        })

        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

tressetteRouter.post('/tables/:tableId/start', (req: Request, res: Response) => {
    const modeResolution = resolveModeFromHttp(req)
    if (!modeResolution.isValid) {
        return sendValidationError(res, 'mode must be demo or live')
    }

    const username = readNonEmptyString(req.body?.username)
    if (!username) {
        return sendValidationError(res, 'username is required')
    }

    const store = getStoreForMode(modeResolution.mode)
    const statusBefore = readStatusBeforeStart(store, req.params.tableId)

    try {
        const table = store.start({
            tableId: req.params.tableId,
            username
        })

        dispatchStartPipeline({
            mode: modeResolution.mode,
            table,
            owner: username,
            statusBefore,
            trigger: 'http'
        })

        return res.status(200).json(table)
    } catch (error: unknown) {
        return sendStoreError(res, error)
    }
})

const readUsernameInput = (
    req: Request,
    fieldName: 'owner' | 'username'
): { value: string | null, error: string | null } => {
    const mockHeader = req.header('x-mock-username')

    if (isMockUsernameOverrideEnabled() && mockHeader !== undefined) {
        const headerValidation = validateUsernameValue(mockHeader)
        if (headerValidation.error) {
            return {
                value: null,
                error: `x-mock-username ${headerValidation.error}`
            }
        }

        return { value: headerValidation.value as string, error: null }
    }

    const bodyValidation = validateUsernameValue(req.body?.[fieldName])
    if (bodyValidation.error) {
        return {
            value: null,
            error: fieldName === 'owner'
                ? `owner ${bodyValidation.error}`
                : `username ${bodyValidation.error}`
        }
    }

    return { value: bodyValidation.value as string, error: null }
}

const validateUsernameValue = (value: unknown): { value: string | null, error: string | null } => {
    if (typeof value !== 'string') {
        return { value: null, error: 'is required' }
    }

    const normalized = value.trim()
    if (normalized.length === 0) {
        return { value: null, error: 'is required' }
    }

    if (normalized.length > USERNAME_MAX_LENGTH) {
        return { value: null, error: `must be at most ${USERNAME_MAX_LENGTH} characters` }
    }

    return { value: normalized, error: null }
}

const isMockUsernameOverrideEnabled = (): boolean => {
    return process.env.NODE_ENV !== 'production'
}

const readNonEmptyString = (value: unknown): string | null => {
    if (typeof value !== 'string') {
        return null
    }

    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
}

const readStatusBeforeStart = (
    store: { getById: (tableId: string) => { status: TressetteTableStatus } },
    tableId: string
): TressetteTableStatus => {
    try {
        return store.getById(tableId).status
    } catch (_error: unknown) {
        return 'waiting'
    }
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
