import { CardIT, Suit } from "../../cards/cardIT.model"

export class Card3s7 extends CardIT {
    private readonly score: number = 0
    private readonly sovranity: number = 0

    constructor(suit: Suit, value: number) {
        super(suit, value);

        switch (value) {
            case 1:
                this.score = 3
                this.sovranity = 8
                break;
            case 2:
                this.score = 1
                this.sovranity = 9
                break;
            case 3:
                this.score = 1
                this.sovranity = 10
                break;
            case 4:
            case 5:
            case 6:
            case 7:
                this.score = 0
                this.sovranity = value - 3
                break;
            case 8:
            case 9:
            case 10:
                this.score = 1
                this.sovranity = value - 3
                break
        }
    }

    getCardScore() {
        return this.score
    }

    getCardSovranity() {
        return this.sovranity
    }

}