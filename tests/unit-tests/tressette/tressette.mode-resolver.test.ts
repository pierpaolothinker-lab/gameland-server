import 'jest'
import { resolveModeFromHttp, resolveModeFromSocketHandshake } from '../../../src/tressette/tressette.mode'

describe('Tressette mode resolver', () => {
    test('HTTP defaults to demo when mode not provided', () => {
        const resolved = resolveModeFromHttp({
            query: {},
            header: () => undefined
        })

        expect(resolved.mode).toBe('demo')
        expect(resolved.isValid).toBe(true)
    })

    test('HTTP reads mode from query and validates invalid values', () => {
        const demo = resolveModeFromHttp({
            query: { mode: 'demo' },
            header: () => undefined
        })
        expect(demo).toEqual({ mode: 'demo', isValid: true })

        const invalid = resolveModeFromHttp({
            query: { mode: 'staging' },
            header: () => undefined
        })
        expect(invalid).toEqual({ mode: 'demo', isValid: false })
    })

    test('Socket mode resolver uses auth/query/header and defaults to demo', () => {
        expect(resolveModeFromSocketHandshake({ auth: { mode: 'live' } })).toBe('live')
        expect(resolveModeFromSocketHandshake({ query: { mode: 'live' } })).toBe('live')
        expect(resolveModeFromSocketHandshake({ headers: { 'x-mode': 'live' } })).toBe('live')
        expect(resolveModeFromSocketHandshake({})).toBe('demo')
    })
})
