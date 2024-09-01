import { Player3s7 } from "./../player3s7.model"
import { IPlayer3s74i } from './interfaces/IPlayer3s74i'

export enum Position3s74i {
    Nord = 2,
    Sud = 0,
    Ovest = 3,
    Est = 1
}

export class Player3s74i extends Player3s7 implements IPlayer3s74i {

    position: Position3s74i

    constructor(username: string, position?: Position3s74i) {
        super(username)
        if (position !== undefined)
            this.position = position
    }
}