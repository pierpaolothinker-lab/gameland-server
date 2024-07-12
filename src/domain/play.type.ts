import { CardIT } from "./cards/cardIT.model"
import { Player } from "./player.model"

/**
 * The card game played
 */
export type Play = {
    /**
     * The player who made the play
     */
    player: Player,
    
    /**
     * The card played
     */
    card: CardIT
}