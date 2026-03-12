import 'jest'
import {
    isAllowedOrigin,
    LOCAL_TRESSETTE_ALLOWED_ORIGINS,
    resolveAllowedHttpOrigins,
    resolveAllowedSocketOrigins
} from '../../../src/origin-config'

describe('Tressette origin config', () => {
    const previousHttpOrigins = process.env.ALLOWED_HTTP_ORIGINS
    const previousSocketOrigins = process.env.ALLOWED_SOCKET_ORIGINS

    afterEach(() => {
        process.env.ALLOWED_HTTP_ORIGINS = previousHttpOrigins
        process.env.ALLOWED_SOCKET_ORIGINS = previousSocketOrigins
    })

    test('falls back to local origins when env vars are missing', () => {
        delete process.env.ALLOWED_HTTP_ORIGINS
        delete process.env.ALLOWED_SOCKET_ORIGINS

        expect(resolveAllowedHttpOrigins()).toEqual(LOCAL_TRESSETTE_ALLOWED_ORIGINS)
        expect(resolveAllowedSocketOrigins()).toEqual(LOCAL_TRESSETTE_ALLOWED_ORIGINS)
    })

    test('reads comma-separated origins with trim and empty filtering', () => {
        process.env.ALLOWED_HTTP_ORIGINS = ' https://app.example.com , , https://preview.example.com '
        process.env.ALLOWED_SOCKET_ORIGINS = 'https://app.example.com, https://socket.example.com, https://app.example.com'

        expect(resolveAllowedHttpOrigins()).toEqual([
            'https://app.example.com',
            'https://preview.example.com'
        ])
        expect(resolveAllowedSocketOrigins()).toEqual([
            'https://app.example.com',
            'https://socket.example.com'
        ])
    })

    test('treats empty env values as fallback', () => {
        process.env.ALLOWED_HTTP_ORIGINS = ' , '
        process.env.ALLOWED_SOCKET_ORIGINS = ''

        expect(resolveAllowedHttpOrigins()).toEqual(LOCAL_TRESSETTE_ALLOWED_ORIGINS)
        expect(resolveAllowedSocketOrigins()).toEqual(LOCAL_TRESSETTE_ALLOWED_ORIGINS)
    })

    test('allows missing origin and configured origins only', () => {
        const allowedOrigins = ['https://app.example.com']

        expect(isAllowedOrigin(undefined, allowedOrigins)).toBe(true)
        expect(isAllowedOrigin('https://app.example.com', allowedOrigins)).toBe(true)
        expect(isAllowedOrigin('https://blocked.example.com', allowedOrigins)).toBe(false)
    })
})
