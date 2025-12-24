export class Player {
    constructor() {
        this.lives = 3
    }

    dieOnce() {
        --this.lives
    }
}