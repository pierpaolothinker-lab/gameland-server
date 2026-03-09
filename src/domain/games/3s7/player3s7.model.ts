import { getRandomInteger } from "./../../../helpers/math.helper";
import { Player } from "./../../player.model";
import { Card3s7 } from "./card3s7.model";

export class Player3s7 extends Player {
    private cards: Card3s7[]

    constructor(username: string) {
        super(username)
        this.cards = []
    }

    addCard(card: Card3s7): void {
        if (!card) {
            throw new Error('Card is undefined')
        }
        this.cards.push(card)
    }

    hasCard(card: Card3s7): boolean {
        return this.cards.some((x) => x.suit === card.suit && x.value === card.value)
    }

    getCardsSnapshot(): Card3s7[] {
        return this.cards.map((card) => new Card3s7(card.suit, card.value))
    }

    playCard(card: Card3s7): void {
        this.playCardAndReturn(card)
    }

    playCardAndReturn(card: Card3s7): Card3s7 {
        if (!card) {
            throw new Error('Card is undefined')
        }

        const index = this.cards.findIndex((x) => x.suit === card.suit && x.value === card.value)
        if (index === -1) {
            throw new Error('No card to play')
        }

        const [playedCard] = this.cards.splice(index, 1)
        return playedCard
    }

    playCardRandom(): Card3s7 {
        if (this.cards.length <= 0) {
            throw new Error('No card to play')
        }
        const index = getRandomInteger(0, this.cards.length - 1)
        const [cardToPlay] = this.cards.splice(index, 1)
        return cardToPlay
    }

    respondToCardRandom(card: Card3s7): Card3s7 {
        if (!card) {
            throw new Error('Invalid input card')
        }
        if (this.cards.length <= 0) {
            throw new Error('No card to play')
        }
        const responses = this.cards.filter((x) => x.suit === card.suit)
        if (responses.length > 0) {
            const index = getRandomInteger(0, responses.length - 1)
            const [cardToPlay] = responses.splice(index, 1)
            this.cards = this.cards.filter((x) => x !== cardToPlay)
            return cardToPlay
        }
        return this.playCardRandom()
    }
}
