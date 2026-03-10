export const TRESSETTE_USERNAME_MAX_LENGTH = 32

export type UsernameValidationResult = {
    value: string | null
    error: string | null
}

export const validateTressetteUsername = (value: unknown): UsernameValidationResult => {
    if (typeof value !== 'string') {
        return { value: null, error: 'is required' }
    }

    const normalized = value.trim()
    if (normalized.length === 0) {
        return { value: null, error: 'is required' }
    }

    if (normalized.length > TRESSETTE_USERNAME_MAX_LENGTH) {
        return { value: null, error: `must be at most ${TRESSETTE_USERNAME_MAX_LENGTH} characters` }
    }

    return { value: normalized, error: null }
}
