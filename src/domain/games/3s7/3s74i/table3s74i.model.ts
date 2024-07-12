import { Player } from  "./../../../player.model";
import { DeckIT } from "../../../decks/deckIt.model";
import { Player3s74i } from "./Player3s74i.model";

export type Table3s74iSettings = {
    buongioco: boolean,
    chiamataFuori: boolean,
    tempoGiocata: 5 | 10 | 20,
    password: string | undefined,
    ammessiOsservatori: boolean,
    riservaPosti: {
        nord: string | undefined ,
        est: string | undefined,
        ovest: string | undefined
    },
    rate: {
        filtroRate: boolean,
        min: number,
        max: number
    }
}

export class Table3s74i {
    players: Player3s74i[]
    private readonly settings: Table3s74iSettings
    deck: DeckIT
    owner: Player
    isComplete: boolean = false
    
    constructor(player: Player, deck: DeckIT, settings: Table3s74iSettings) {  
        this.deck = deck
        this.settings = settings
        this.owner = player
    }
}