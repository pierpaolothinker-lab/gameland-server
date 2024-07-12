import 'jest'
import { Card3s7 } from '../../../../src/domain/games/3s7/card3s7.model'
import { Suit } from './../../../../src/domain/cards/cardIT.model'


describe('@@Card3s7 CLASS', () => {
    describe('@Constructor', () => {
        it('should create a card with valid values', () => {
            const card = new Card3s7(Suit.Coppe, 1);
            expect(card.getCardScore()).toBe(3);
            expect(card.getCardSovranity()).toBe(8);
        });

        it('should throw an error for invalid values', () => {
            expect(() => new Card3s7(Suit.Coppe, 0)).toThrow('Invalid card value');
            expect(() => new Card3s7(Suit.Coppe, 11)).toThrow('Invalid card value');
        });
    });

    describe('getCardScore', () => {
        it('should return correct score for value 1', () => {
            const card = new Card3s7(Suit.Coppe, 1);
            expect(card.getCardScore()).toBe(3);
        });

        it('should return correct score for value 2', () => {
            const card = new Card3s7(Suit.Coppe, 2);
            expect(card.getCardScore()).toBe(1);
        });

        it('should return correct score for value 3', () => {
            const card = new Card3s7(Suit.Coppe, 3);
            expect(card.getCardScore()).toBe(1);
        });

        it('should return correct score for values 4-7', () => {
            for (let value = 4; value <= 7; value++) {
                const card = new Card3s7(Suit.Coppe, value);
                expect(card.getCardScore()).toBe(0);
            }
        });

        it('should return correct score for values 8-10', () => {
            for (let value = 8; value <= 10; value++) {
                const card = new Card3s7(Suit.Coppe, value);
                expect(card.getCardScore()).toBe(1);
            }
        });
    });

    describe('getCardSovranity', () => {
        it('should return correct sovranity for value 1', () => {
            const card = new Card3s7(Suit.Coppe, 1);
            expect(card.getCardSovranity()).toBe(8);
        });

        it('should return correct sovranity for value 2', () => {
            const card = new Card3s7(Suit.Coppe, 2);
            expect(card.getCardSovranity()).toBe(9);
        });

        it('should return correct sovranity for value 3', () => {
            const card = new Card3s7(Suit.Coppe, 3);
            expect(card.getCardSovranity()).toBe(10);
        });

        it('should return correct sovranity for values 4-7', () => {
            for (let value = 4; value <= 7; value++) {
                const card = new Card3s7(Suit.Coppe, value);
                expect(card.getCardSovranity()).toBe(value - 3);
            }
        });

        it('should return correct sovranity for values 8-10', () => {
            for (let value = 8; value <= 10; value++) {
                const card = new Card3s7(Suit.Coppe, value);
                expect(card.getCardSovranity()).toBe(value - 3);
            }
        });
    });
});
