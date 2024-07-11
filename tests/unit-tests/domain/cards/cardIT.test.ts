import { CardIT, Suit } from './../../../../src/domain/cards/cardIT.model'
import 'jest'

describe('"@@DECKIT CLASS"', () => {
    describe('@constructor', () => {
        it('it should create a instance', () => {
            const card = new CardIT(Suit.Denari, 1)
            expect(card).toBeInstanceOf(CardIT)
        })
        it('it should not create a cart with invalid value', () => {
            expect(() => new CardIT(Suit.Denari, 0)).toThrow('Invalid card value')
            expect(() => new CardIT(Suit.Denari, 11)).toThrow('Invalid card value')
        })
    })

    describe('isEqual method', () => {
        it('should return true if two cards have same value and suit', () => {
            const card1 = new CardIT(Suit.Denari, 1)
            const card2 = new CardIT(Suit.Denari, 1)
            expect(card1.isEqual(card2)).toBeTruthy()
        })
        it('should return false if two cards have different suits', () => {
            const card1 = new CardIT(Suit.Denari, 1)
            const card2 = new CardIT(Suit.Spade, 1)
            expect(card1.isEqual(card2)).toBeFalsy()
        })
        it('should return false if two cards have different values', () => {
            const card1 = new CardIT(Suit.Denari, 1)
            const card2 = new CardIT(Suit.Denari, 2)
            expect(card1.isEqual(card2)).toBeFalsy()
        })
        it('should return false if two cards have different values and suits', () => {
            const card1 = new CardIT(Suit.Denari, 1)
            const card2 = new CardIT(Suit.Spade, 2)
            expect(card1.isEqual(card2)).toBeFalsy()
        })
    })
})