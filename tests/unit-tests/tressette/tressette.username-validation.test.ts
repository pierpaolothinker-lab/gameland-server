import 'jest'
import { validateTressetteUsername } from '../../../src/tressette/tressette-username.validation'

describe('Tressette username validation', () => {
    test('rejects missing username', () => {
        expect(validateTressetteUsername(undefined)).toEqual({
            value: null,
            error: 'is required'
        })
    })

    test('rejects empty/space-only username', () => {
        expect(validateTressetteUsername('   ')).toEqual({
            value: null,
            error: 'is required'
        })
    })

    test('rejects too long username', () => {
        expect(validateTressetteUsername('A'.repeat(33))).toEqual({
            value: null,
            error: 'must be at most 32 characters'
        })
    })

    test('accepts and trims valid username', () => {
        expect(validateTressetteUsername('  Luca  ')).toEqual({
            value: 'Luca',
            error: null
        })
    })
})
