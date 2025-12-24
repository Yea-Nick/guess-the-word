import { Game } from './game/game.class'

async function start() {
    const game = new Game()
    await game.initialize()
}

start()