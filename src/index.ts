import { Table3s74i } from "./domain/games/3s7/3s74i/table3s74i.model";
import { DeckIT } from "./domain/decks/deckIt.model";
import { Trick3s4i } from "./domain/games/3s7/3s74i/trick3s74i.model";
import { Play } from "./domain/play.type";
import { Player } from "./domain/player.model";
import { Position3s74i } from "./domain/games/3s7/3s74i/player3s74i.model";

const deck = new DeckIT()

const mainPlayer = new Player('Pierpaolo')

const table = new Table3s74i(mainPlayer, deck, {})

table.join(new Player('Tonino'), Position3s74i.Est)
table.join(new Player('Vito'), Position3s74i.Nord)
table.join(new Player('Paolo'), Position3s74i.Ovest)

table.startGame(mainPlayer)


// deck.shuffleFY()

// const player1 = new Player('Pierpaolo')
// const player2 = new Player('Tonino')
// const player3 = new Player('Vito')
// const player4 = new Player('Paolo')

// const trick = new Trick3s4i()

// const play1: Play = {
//     player: player1,
//     card: deck.remove(0)
// }

// const play2: Play = {
//     player: player2,
//     card: deck.remove(0)
// }

// const play3: Play = {
//     player: player3,
//     card: deck.remove(0)
// }

// const play4: Play = {
//     player: player4,
//     card: deck.remove(0)
// }

// trick.addPlay(play1)
// trick.addPlay(play2)
// trick.addPlay(play3)
// trick.addPlay(play4)

// console.dir(trick, { depth: null })
// const winner = trick.selectWinningPlayer()
// console.dir(winner, { depth: null })

// const promise1 = new Promise((resolve) => setTimeout(resolve, 500, 'one'));
// const promise2 = new Promise((resolve) => setTimeout(resolve, 100, 'two'));

// Promise.race([promise1, promise2]).then((value) => {
//   console.log(value); // "two" - promise2 si risolve per prima
// });