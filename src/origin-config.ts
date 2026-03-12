const LOCAL_ALLOWED_ORIGINS = ['http://localhost:4200', 'http://localhost:4400', 'http://localhost:8100'] as const

const parseAllowedOrigins = (value: string | undefined, fallback: readonly string[]): string[] => {
    if (!value) {
        return [...fallback]
    }

    const parsed = value
        .split(',')
        .map((origin) => origin.trim())
        .filter((origin) => origin.length > 0)

    return parsed.length > 0 ? [...new Set(parsed)] : [...fallback]
}

export const resolveAllowedHttpOrigins = (): string[] => {
    return parseAllowedOrigins(process.env.ALLOWED_HTTP_ORIGINS, LOCAL_ALLOWED_ORIGINS)
}

export const resolveAllowedSocketOrigins = (): string[] => {
    return parseAllowedOrigins(process.env.ALLOWED_SOCKET_ORIGINS, LOCAL_ALLOWED_ORIGINS)
}

export const isAllowedOrigin = (origin: string | undefined, allowedOrigins: readonly string[]): boolean => {
    if (!origin) {
        return true
    }

    return allowedOrigins.includes(origin)
}

export const LOCAL_TRESSETTE_ALLOWED_ORIGINS = [...LOCAL_ALLOWED_ORIGINS]
