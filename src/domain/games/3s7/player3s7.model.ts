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

    playCard(card: Card3s7): void {
        if (!card) {
            throw new Error('Card is undefined')
        }
        const index = this.cards.findLastIndex(x => x.suit == card.suit && x.value == card.value)
        if (index == -1) {
            throw new Error('No card to play')
        }
        this.cards.splice(index, 1)
    }
}