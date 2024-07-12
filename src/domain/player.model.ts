export class Player {
    username: string
    /**
     *
     */
    constructor(name: string) {
        if(name)
            this.username = name     
    }
}