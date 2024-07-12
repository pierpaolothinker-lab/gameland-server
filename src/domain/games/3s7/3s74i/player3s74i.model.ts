import { Player3s7 } from "./../player3s7.model";

export enum Position3s74i {
    Nord,
    Sud,
    ovest,
    Est
}

export class Player3s74i extends Player3s7 {

    position: Position3s74i

    constructor(username: string) {
        super(username)
        
    }
}