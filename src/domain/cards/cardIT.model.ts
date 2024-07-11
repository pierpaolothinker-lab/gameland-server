export enum Suit {
    Denari = 0,
    Spade = 1,
    Coppe = 2,
    Bastoni = 3
}

export interface ICardIT {
    suit: Suit
    value: number
    isEqual(card:ICardIT) : boolean
}

export class CardIT implements ICardIT {
    suit: Suit
    value: number = 0

    /**
     *
     */
    constructor(suit: Suit, value: number) {
        if (value <= 0 || value > 10) {
            throw new Error('Invalid card value');
        }
        this.suit = suit;
        this.value = value;
    }

    isEqual(card: CardIT): boolean {
        if (card.suit === this.suit && card.value === this.value)
            return true
        return false
    }

}