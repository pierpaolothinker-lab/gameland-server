import { Player } from "./../../../player.model";
import { DeckIT } from "../../../decks/deckIt.model";
import { Player3s74i, Position3s74i } from "./player3s74i.model";
import { getRandomInteger } from "./../../../../helpers/math.helper";
import { Card3s7 } from "../card3s7.model";
import { Trick3s4i } from "./trick3s74i.model";
import { Play } from "./../../../play.type";

export type Table3s74iSettings = {
    // buongioco: boolean,
    // chiamataFuori: boolean,
    // tempoGiocata: 5 | 10 | 20,
    // password: string | undefined,
    // ammessiOsservatori: boolean,
    // riservaPosti: {
    //     nord: string | undefined,
    //     est: string | undefined,
    //     ovest: string | undefined
    // },
    // rate: {
    //     filtroRate: boolean,
    //     min: number,
    //     max: number
    // }
    finalPoins: 21 | 31 | 41
}

type tablePoints = {
    teamSN: number,
    teamEO: number,
    games?: {
        teamSN: number,
        teamEO: number
    }
}

export class Table3s74i {
    players: Player3s74i[] = []

    private readonly settings: Table3s74iSettings
    deck: DeckIT
    owner: Player
    isComplete: boolean = false
    handOpenerIndex: number = 0
    tricks: Trick3s4i[][][]
    points: tablePoints = { teamEO: 0, teamSN: 0 }

    constructor(player: Player, deck: DeckIT, settings: Table3s74iSettings) {
        this.deck = deck
        this.settings = settings
        this.owner = player
        this.players.push(new Player3s74i(player.username, Position3s74i.Sud))
    }

    join(player: Player, position: Position3s74i): void {
        if (this.isComplete) {
            throw new Error('Impossible to join a complete table')
        }
        if (!player) {
            throw new Error('No valid player input')
        }
        const index = this.players.findIndex(x => x.position == position)
        if (index >= 0) {
            throw new Error('No position avaible')
        }
        //TODO: aggiungere il controllo per i posti riservati
        this.players.push(new Player3s74i(player.username, position))
        if (this.players.length === 4) {
            this.isComplete = true
            //Ordino l'array in modo tale da rispettare i turni di gioco
            this.players.sort((a, b) => a.position - b.position)
        }
    }

    leave(player: Player): void {
        if (!player) {
            throw new Error('No valid player input')
        }
        const index = this.players.findIndex(x => x.username === player.username)
        if (index === -1) {
            throw new Error('No valid player input')
        }
        this.players.splice(index, -1)
        this.isComplete = false
    }

    startGame(player: Player): void {
        if (!player) {
            throw new Error('No valid player input')
        }
        if (player.username !== this.owner.username) {
            throw new Error('Only owner can start a game')
        }
        this.tricks = []
        this.handOpenerIndex = getRandomInteger(0, 3)
        this.startSet(0) //indice deve essere dinamico
    }

    startSet(setIndex: number): void {
        if (setIndex < 0)
            throw new Error("Invalid Set Index")

        this.tricks[setIndex] = []

        let handIndex = 0
        while (!this.isSetEnded()) {
            if (handIndex > 0)
                this.collectCardsFromTricks(this.tricks[setIndex][handIndex - 1])
            this.startHand(setIndex, handIndex)
            handIndex++
        }
    }

    isSetEnded(): boolean {
        return (
            this.points.teamEO >= this.settings.finalPoins ||
            this.points.teamSN >= this.settings.finalPoins)
            &&
            this.points.teamEO !== this.points.teamSN
    }

    collectCardsFromTricks(tricks: Trick3s4i[]): void {
        if (!tricks || tricks.length <= 0)
            return

        tricks.forEach(trick => {
            trick.getCards().forEach(card => this.deck.add(card))
        })
    }

    startHand(setIndex: number, handIndex: number): void {
        if (setIndex < 0)
            throw new Error("Invalid Set Index")

        if (handIndex < 0)
            throw new Error("Invalid Hand Index")

        this.deck.italianShuffle()
        this.distribuiteCards()
        this.playHand(setIndex, handIndex)
        this.handOpenerIndex = (this.handOpenerIndex + 1) % 4
        this.calculatePoints(setIndex, handIndex)
    }

    playHand(setIndex: number, handIndex: number): void {
        // console.dir(this.players, { depth: null })

        this.tricks[setIndex][handIndex] = []

        let openerIndex = this.handOpenerIndex

        for (let index = 0; index < 10; index++) {
            console.log(`-----------trick ${index + 1}--------------`)
            const winner = this.playTrick(openerIndex, setIndex, handIndex)
            console.log(`@@@ Raccoglie ${winner.username} @@@`)
            openerIndex = this.players.findIndex(x => x.username === winner.username)
        }
    }

    playTrick(openerIndex: number, setIndex: number, handIndex: number): Player {
        const trick = new Trick3s4i()
        let card: Card3s7

        for (let i = 0; i < 4; i++) {
            const player = this.players[openerIndex]
            card = i == 0 ? player.playCardRandom() : player.respondToCardRandom(card)
            const play: Play = { player, card }
            trick.addPlay(play)
            openerIndex = (openerIndex + 1) % 4
            console.log(player.username)
            // console.dir(card, { depth: null })
        }

        trick.setWinner()
        this.tricks[setIndex][handIndex].push(trick)
        return trick.getWinner()
    }

    distribuiteCards(): void {
        let distrIndex = this.handOpenerIndex
        while (this.deck.getCount() > 0) {
            for (let index = 0; index < 5; index++) {
                const card = this.deck.remove(0)
                this.players[distrIndex].addCard(new Card3s7(card.suit, card.value))
            }
            distrIndex = (distrIndex + 1) % 4
        }
    }

    calculatePoints(setIndex: number, handIndex: number) {
        //FIXME: le mani devono essere separati o per lo meno calcolati in modo separato

        let teamNS: number = 0
        let teamEO: number = 0
        // let teamNSString: string = ""
        // let teamEOString: string = ""
        let index = 0
        this.tricks[setIndex][handIndex].forEach(trick => {
            index++
            const winner = this.players.find(x => x.username === trick.getWinner().username)
            // console.log("position",winner.position)
            let points = trick.getTotalScore()
            // Aggiungo i punti dell'ultima mano
            if (index % 10 === 0) points += 3
            if (winner.position == Position3s74i.Nord || winner.position == Position3s74i.Sud) {
                teamNS += points
                // teamNSString += trick.getTotalScore() + " "
            }
            else {
                teamEO += points
                // teamEOString += trick.getTotalScore() + " " 
            }

        });
        this.points.teamSN += Math.floor(teamNS / 3)
        console.log("La squadra SN: ", this.points.teamSN)
        // console.log("La squadra SN: ", teamNSString)

        this.points.teamEO += Math.floor(teamEO / 3)
        console.log("La squadra EO: ", this.points.teamEO)
        // console.log("La squadra EO: ", teamEOString)
    }
}