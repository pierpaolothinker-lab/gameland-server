import 'jest';
import { DeckIT } from '../../../../src/domain/decks/deckIt.model'
import { ICardIT, Suit } from '../../../../src/domain/cards/cardIT.model'
import { getRandomInteger } from './../../../../src/helpers/math.helper'

describe('"@@DECKIT CLASS"', () => {
    let instance: DeckIT;

    beforeEach(() => {
        instance = new DeckIT()
    })

    describe("@constructor", () => {
        it('new should be new', () => {
            expect(instance['_isNew']).toBeTruthy
        })

        it('new should have 40 cards', async () => {
            expect(instance).toBeInstanceOf(DeckIT)
            expect(instance['_cards'].length).toEqual(40)
        })

        it('new should have 4 Suits', () => {
            const nSuits = Array.from<Suit>(new Set(instance['_cards'].map(x => x.suit))).length
            expect(nSuits).toEqual(4)
        })

        it('new should have 10 cards for suit', () => {
            const cardsDenari = instance['_cards'].filter(x => x.suit === Suit.Denari)
            expect(cardsDenari.length).toEqual(10)

            const cardsSpade = instance['_cards'].filter(x => x.suit === Suit.Spade)
            expect(cardsSpade.length).toEqual(10)

            const cardsCoppe = instance['_cards'].filter(x => x.suit === Suit.Coppe)
            expect(cardsCoppe.length).toEqual(10)

            const cardsBastoni = instance['_cards'].filter(x => x.suit === Suit.Bastoni)
            expect(cardsBastoni.length).toEqual(10)
        })

    })

    describe("@getters", () => {
        it('getIsNew should return if the deck is new', () => {
            expect(instance.isNew()).toEqual(instance['_isNew'])
        })

        it('getAllCards should return all the card of the deck', () => {
            expect(instance.getAllCards()).toEqual(instance['_cards'])
        })

        it('getCount should return the number of the cards of the deck', () => {
            expect(instance.getCount()).toEqual(instance['_cards'].length)
        })
    })

    describe('empty method', () => {
        it('if empty the number of card should be 0', () => {
            instance.empty()
            expect(instance['_cards'].length).toEqual(0)
        })
        it('if empty should not have cards', () => {
            instance.empty()
            expect(instance['_cards']).toEqual([])
        })
        it('if empty should be not new', () => { 
            instance.empty()
            expect(instance['_isNew']).toBeFalsy()
        })
    })

    describe('isCardInDeck method', () => {
        let card: ICardIT

        beforeEach(() => {
            card = instance.getRandomCard()
        })

        it('if empty the card can not be in the deck', () => {
            instance['_cards'] = []
            expect(instance.isCardInDeck(card)).toBeFalsy
        })

        it('if full every a random card should be in the deck', () => {
            expect(instance.isCardInDeck(card)).toBeTruthy
        })
    })

    describe('add method', () => {

        let randomCard: ICardIT;

        beforeEach(() => {
            randomCard = instance.getRandomCard()
        })

        it('can not add a card if deck is new', () => {
            expect(() => instance.add(randomCard)).toThrow()
        })

        it('can not add a card when deck is full', () => {
            instance.shuffleFY()
            expect(() => instance.add(randomCard)).toThrow()
        })

        it('cant add a new card if is already in the deck', () => {
            const index = getRandomInteger(0, 39)
            const removedCard = instance.remove(index)
            if (randomCard.isEqual(removedCard)) {
                randomCard = instance.getRandomCard()
            }
            expect(() => instance.add(randomCard)).toThrow()
        })

        it('can add a card if is not in the deck', () => {
            const index = getRandomInteger(0, 39)
            const card = instance.remove(index)
            expect(instance.add(card)).toBe(card)
        })
    })

    describe('remove method', () => {
        let index: number

        beforeEach(() => {
            index = getRandomInteger(1, 39)
        })

        it('cant remove a card if deck is empy', () => {
            instance.empty()
            expect(() => instance.remove(index)).toThrow('Deck empty')
        })

        it('cant remove a card if index is out of bounds', () => {
            expect(() => instance.remove(-index)).toThrow('Index out of bounds')
            expect(() => instance.remove(index + instance.getCount())).toThrow('Index out of bounds')
        })

        it('if a card is removed the number of card should decrease by 1', () => {
            const nCardsPre = instance['_cards'].length
            instance.remove(index)
            const nCardsPost = instance['_cards'].length
            expect(nCardsPre).toEqual(nCardsPost + 1)
        })

        it('should return a removed card', () => {
            expect(instance.remove(index)).not.toBeNull
        })
    })

    describe('shuffle methods', () => {

        it('shuffleFY should shuffle the cards', () => {
            const originalDeck = new DeckIT();
            const originalCards = [...instance['_cards']];

            instance.shuffleFY();
            const shuffledCards = [...instance['_cards']];

            // Check that the deck has the same cards but in different order
            instance.sort();
            originalDeck.sort();
            expect(instance.isEqual(originalDeck)).toBe(true);
            expect(originalCards).not.toEqual(shuffledCards);
        });

        it('shuffleRG should shuffle the cards', () => {
            const originalDeck = new DeckIT();
            const originalCards = [...instance['_cards']];

            instance.shuffleRG();
            const shuffledCards = [...instance['_cards']];

            // Check that the deck has the same cards but in different order
            instance.sort();
            originalDeck.sort();
            expect(instance.isEqual(originalDeck)).toBe(true);
            expect(originalCards).not.toEqual(shuffledCards);
        })

        it('if shuffleFY the deck should be not new', () => {
            instance.shuffleFY()
            expect(instance['_isNew']).not.toBeTruthy()
        })

        it('if shuffleRG the deck should be not new', () => {
            instance.shuffleRG()
            expect(instance['_isNew']).not.toBeTruthy()
        })
    })

    describe('getCardsSlice method', () => {
        it('should return a slice of the deck for valid indices', () => {
            const slice = instance.getCardsSlice(0, 4)
            expect(slice.length).toBe(5)
            expect(slice).toEqual(instance['_cards'].slice(0, 5));
        })
        it('should throw an error for invalid indices', () => {
            expect(() => instance.getCardsSlice(-1, 4)).toThrow('Invalid indices')
            expect(() => instance.getCardsSlice(0, instance['_cards'].length)).toThrow('Invalid indices')
            expect(() => instance.getCardsSlice(4, 0)).toThrow('Invalid indices')
        })
    })

    describe('split method', () => {
        it('should split the deck correctly', () => {
            jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.5); // Mock random integer
            const index = Math.floor(0.5 * (instance['_cards'].length - 10)) + 5; // Mock calculation
            const expectedSplit = instance.getCardsSlice(index, instance['_cards'].length - 1).concat(instance.getCardsSlice(0, index))

            const splitDeck = instance.split()
            expect(splitDeck).toEqual(expectedSplit);

            // Ripristina il valore originale di Math.random
            (global.Math.random as jest.Mock).mockRestore()
        })

        it('if the deck is to small should not spit', () => {
            const deck = new DeckIT()
            deck.empty()
            instance.shuffleFY()        
            for (let index = 0; index < 4; index++) {
                deck.add(instance.remove(0))               
            }
            expect(() => deck.split()).toThrow('Deck too small')
        })

        it('should be not new', () => {
            instance.split()
            expect(instance['_isNew']).not.toBeTruthy()
        })
    })

    describe('getRandomCard', () => {
        it('should return a random card from the deck', () => {
            jest.spyOn(global.Math, 'random').mockReturnValueOnce(0.5); // Mock random integer
            const expectedCard = instance['_cards'][Math.floor(0.5 * instance['_cards'].length)];

            const randomCard = instance.getRandomCard();
            expect(randomCard).toEqual(expectedCard);

            // Ripristina il valore originale di Math.random
            (global.Math.random as jest.Mock).mockRestore();
        });

        it('should throw an error when trying to get a random card from an empty deck', () => {
            instance['_cards'] = [];
            expect(() => instance.getRandomCard()).toThrow('No cards in the deck');
        });
    })

    describe('sort method', () => {
        it('should sort the cards', () => {
            instance.shuffleFY()
            instance.sort()
            const sortedCards = [...instance['_cards']].sort((a, b) => (a.suit === b.suit ? a.value - b.value : a.suit - b.suit))

            expect(instance['_cards']).toEqual(sortedCards)
        })

        it('if the deck is full when sorted should be new', () => {
            instance.shuffleFY()
            instance.sort()

            expect(instance.isNew()).toBeTruthy()
        })
    })

    describe('isEqual Method', () => {
        let deck: DeckIT

        beforeEach(() => {
            deck = new DeckIT()
        })

        it('should return true if two deck are new', () => {
            expect(instance.isEqual(deck)).toBeTruthy()
        })

        it('should return true if two decks are equal', () => {
            instance.shuffleFY()
            deck.shuffleRG()

            expect(instance.isEqual(deck)).toBe(true)
        })

        it('should return false if two decks are not equal', () => {
            instance.shuffleFY()
            deck.shuffleFY()

            const index = getRandomInteger(0, 39)
            deck.remove(index)

            expect(instance.isEqual(deck)).toBe(false)
        })

    })
})
