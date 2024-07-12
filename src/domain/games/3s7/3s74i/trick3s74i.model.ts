import { Play } from "../../../play.type";
import { Player } from "../../../player.model";
import { Card3s7 } from "../card3s7.model";

export type Play3s7 = {
    player: Player,
    card: Card3s7
}

export class Trick3s4i {
    private plays: Play3s7[] = []
    private isComplete = false

    constructor() { }

    addPlay(play: Play): void {
        if (!this.isComplete)
            this.plays.push({
                player: play.player,
                card: new Card3s7(play.card.suit, play.card.value)
            })
        if (this.plays.length == 4)
            this.isComplete = true
    }

    selectWinningPlayer(): Player {
        if (!this.isComplete) {
            throw new Error('Cannot select winning player. The play is not complete')
        }
        const masterSuit = this.plays[0].card.suit
        const possibileWinners = this.plays
            .filter(x => x.card.suit == masterSuit)
            .sort((a,b) => b.card.getCardSovranity() - a.card.getCardSovranity())
        return possibileWinners[0].player
    }
}