export type TressetteMode = 'demo' | 'live'

type ModeResolution = {
    mode: TressetteMode
    isValid: boolean
}

const DEFAULT_MODE: TressetteMode = 'demo'

const parseMode = (value: unknown): TressetteMode | null => {
    if (typeof value !== 'string') {
        return null
    }

    const normalized = value.trim().toLowerCase()
    if (normalized === 'demo' || normalized === 'live') {
        return normalized
    }

    return null
}

export const resolveModeFromHttp = (input: {
    query?: { mode?: unknown }
    header?: (name: string) => string | undefined
}): ModeResolution => {
    const queryMode = parseMode(input.query?.mode)
    if (queryMode) {
        return { mode: queryMode, isValid: true }
    }

    const headerModeRaw = input.header?.('x-mode') ?? input.header?.('x-tressette-mode')
    const headerMode = parseMode(headerModeRaw)
    if (headerMode) {
        return { mode: headerMode, isValid: true }
    }

    const explicitMode = input.query?.mode ?? headerModeRaw
    if (explicitMode !== undefined) {
        return { mode: DEFAULT_MODE, isValid: false }
    }

    return { mode: DEFAULT_MODE, isValid: true }
}

export const resolveModeFromSocketHandshake = (handshake: {
    auth?: { mode?: unknown }
    query?: { mode?: unknown }
    headers?: { [key: string]: unknown }
}): TressetteMode => {
    const fromAuth = parseMode(handshake.auth?.mode)
    if (fromAuth) {
        return fromAuth
    }

    const fromQuery = parseMode(handshake.query?.mode)
    if (fromQuery) {
        return fromQuery
    }

    const headerModeRaw = handshake.headers?.['x-mode'] ?? handshake.headers?.['x-tressette-mode']
    const fromHeader = parseMode(headerModeRaw)
    if (fromHeader) {
        return fromHeader
    }

    return DEFAULT_MODE
}
