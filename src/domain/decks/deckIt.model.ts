import { CardIT, ICardIT, Suit } from "./../cards/cardIT.model";
import { getRandomInteger } from "./../../helpers/math.helper";

//TODO: aggiungere la funzione PickCard
export class DeckIT {
    private _cards: ICardIT[] = []
    private readonly _cardNumber: number = 40
    private _isNew: boolean = true

    /**
     *
     */
    constructor() {
        for (let suit in Suit) {
            if (isNaN(Number(suit))) continue; // Skip non-numeric enum members
            for (let value = 1; value <= 10; value++) {
                this._cards.push(new CardIT(Number(suit), value));
            }
        }
    }

    public isNew(): boolean {
        return this._isNew
    }

    public getAllCards(): ICardIT[] {
        return this._cards;
    }

    public getCount(): number {
        return this._cards.length;
    }

    public empty(): void {
        this._cards = []
        this._isNew = false
    }

    public isCardInDeck(card: ICardIT): boolean {
        if (this._cards.length == 0)
            return false

        const selected = this._cards.filter(x => x.suit == card.suit && x.value == card.value)
        if (selected && selected.length > 0)
            return true

        return false
    }

    public add(card: ICardIT): ICardIT {
        if (this._isNew) {
            throw new Error(`Cannot add a card if the deck is new`);
        }
        if (this._cards.length >= this._cardNumber) {
            throw new Error(`Cannot add more than ${this._cardNumber} cards`);
        }

        if (this.isCardInDeck(card)) {
            throw new Error(`Cannot add a card that is already in the deck`);
        }

        this._cards.push(card);
        return card;
    }

    public remove(index: number): ICardIT {
        if (this.getCount() == 0) {
            throw new Error('Deck empty')
        }
        if (index < 0 || index >= this._cards.length) {
            throw new Error('Index out of bounds')
        }
        const [removedCard] = this._cards.splice(index, 1);
        this._isNew = false
        return removedCard;
    }

    // Shaffle using Fisher–Yates shuffle Algorithm method
    public shuffleFY(): void {
        for (let i = this._cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this._cards[i], this._cards[j]] = [this._cards[j], this._cards[i]];
        }
        this._isNew = false
    }

    // Using sorting and random number generator
    public shuffleRG(): void {
        this._cards.sort(() => Math.random() - 0.5);
        this._isNew = false
    }

    public getCardsSlice(startIndex: number, endIndex: number): ICardIT[] {
        if (startIndex < 0 || endIndex >= this._cards.length || startIndex > endIndex) {
            throw new Error('Invalid indices')
        }
        return this._cards.slice(startIndex, endIndex + 1); // +1 perché slice non include l'elemento finale
    }

    public split(): ICardIT[] {
        const min = 5
        const max = this._cards.length - 5
        if (max - min <= 0)
            throw new Error('Deck too small')
        const index = getRandomInteger(min, max)
        this._isNew = false
        this._cards = this.getCardsSlice(index, this._cards.length - 1)
            .concat(this.getCardsSlice(0, index))
        return this._cards
    }

    public getRandomCard(): ICardIT {
        if (this._cards.length === 0) {
            throw new Error('No cards in the deck');
        }
        const randomIndex = Math.floor(Math.random() * this._cards.length);
        return this._cards[randomIndex];
    }

    public sort(): void {
        this.sortCards(this._cards)
        if (this._cards.length == this._cardNumber) {
            this._isNew = true
        }
    }

    public isEqual(deck: DeckIT): boolean {
        if (deck.isNew() && this.isNew())
            return true
        if (deck.getCount() != this.getCount())
            return false

        const thisCards = [...this._cards]
        const deckCards = [...deck.getAllCards()]
        this.sortCards(thisCards)
        this.sortCards(deckCards)
        return thisCards.every((card, index) => card.suit === deckCards[index].suit && card.value === deckCards[index].value)
    }

    private sortCards(cards: ICardIT[]): void {
        if (!cards)
            return
        cards.sort((a, b) => (a.suit === b.suit ? a.value - b.value : a.suit - b.suit))
    }
    
}