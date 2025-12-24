import { Round } from './round/round.class'
import { WORDS, LEVELS } from './constants/index'
import moment from 'moment'

export class Game {
    constructor() {
        this.level = ''
        this.words = []
        this.roundResults = []
    }

    async initialize() {
        const btns = document.querySelectorAll('.container .answer-btn')
        for (const btn of btns) {
            btn.addEventListener('click', (event) => {
                btns.forEach(btn => btn.remove())
                event.currentTarget.dataset.answer === 'yes'
                    ? this.setLevel()
                    : document.querySelector('.container h1').innerText = 'Game over :('
            }, { once: true })
        }
    }

    async setLevel() {
        const container = document.querySelector('.container')
        container.querySelector('h1').innerText = 'Select difficulty level'

        const btns = []
        for (const [level, text] of Object.entries(LEVELS)) {
            const btn = document.createElement('button')
            btn.dataset.level = level
            btn.innerText = text
            btn.addEventListener('click', (event) => {
                const level = Object.keys(LEVELS).find(l => l === event.currentTarget.dataset.level)
                if (!level) throw new Error(`Incorrect level: ${level}`)
                this.level = level

                btns.forEach(btn => btn.remove())
                this.start()
            }, { once: true })
            btns.push(btn)
            container.appendChild(btn)
        }
    }

    async start() {
        this.words = WORDS[this.level]
        if (!this.words) throw new Error(`Could not get words for level: ${this.level}`)

        let playNextRound = false;
        document.querySelector('.container h1').remove()
        do {
            const word = this.extractRandomWord();
            const roundResult = await new Round(word).start()
            this.roundResults.push({ ...roundResult, word })
            playNextRound = await this.showResults()
        } while (playNextRound)
    }

    extractRandomWord() {
        const idx = Math.floor(Math.random() * this.words.length)
        const word = this.words[idx]
        if (!word) throw new Error(`Could not get random word`)
        this.words.splice(idx, 1)
        return word;
    }

    async showResults() {
        const container = document.querySelector('.container')
        const gameInfo = await this.createGameInfo()
        const roundsTable = await this.createRoundsTable()
        const els = [gameInfo, roundsTable]
        container.append(...els)

        if (this.words.length) {
            const playAgain = await this.showPlayAgainBtn()
            if (playAgain) {
                els.map(e => e.remove())
                return playAgain
            }
        }

        container.append(await this.createEndGameResults())
        return false;
    }

    async createGameInfo() {
        const gameInfo = document.createElement('h2')
        const wins = this.roundResults.filter(res => res.success).length
        gameInfo.innerText = `Level: ${LEVELS[this.level]} | Victories: ${wins} | Defeats: ${this.roundResults.length - wins}`
        return gameInfo
    }

    async createRoundsTable() {
        const table = document.createElement('table')
        const tableHead = document.createElement('thead')
        const tableBody = document.createElement('tbody')
        table.append(tableHead, tableBody)

        const tableHeadTr = document.createElement('tr')
        tableHead.appendChild(tableHeadTr)

        for (const columnName of ['Word', 'Guessed right', 'Time']) {
            const column = document.createElement('th')
            column.innerText = columnName
            tableHeadTr.appendChild(column)
        }

        for (const { word, success, time } of this.roundResults.sort((a, b) => {
            if (a.success !== b.success) return a.success ? -1 : 1
            return a.time - b.time
        })) {
            const resultCeil = document.createElement('tr')
            for (const ceilContent of [word, success, time]) {
                const ceil = document.createElement('td')
                if (typeof ceilContent === 'boolean') {
                    ceil.innerText = ceilContent ? 'Yes' : 'No'
                } else if (typeof ceilContent === 'number') {
                    ceil.innerText = await this.getDuration(ceilContent)
                } else {
                    ceil.innerText = ceilContent
                }
                resultCeil.appendChild(ceil)
            }
            tableBody.appendChild(resultCeil)
        }

        return table;
    }

    showPlayAgainBtn() {
        return new Promise(resolve => {
            const container = document.querySelector('.container')
            const playAgainHeader = document.createElement('h2')
            playAgainHeader.innerText = 'Play again?'
            container.appendChild(playAgainHeader)

            const btns = []
            for (const { text, data } of [{ text: 'Yes', data: 'yes' }, { text: 'No', data: 'no' }]) {
                const btn = document.createElement('button')
                btn.innerText = text;
                btn.dataset.answer = data
                btn.addEventListener('click', (event) => {
                    const answer = event.currentTarget.dataset.answer
                    if (answer !== 'yes' && answer !== 'no') throw new Error(`Incorrect dataset`)
                    playAgainHeader.remove()
                    btns.forEach(btn => btn.remove())
                    resolve(answer === 'yes')
                }, { once: true })
                btns.push(btn)
                container.appendChild(btn)
            }
        })
    }

    async createEndGameResults() {
        const wins = this.roundResults.filter(res => res.success).length
        const defeats = this.roundResults.length - wins
        const resultsHeader = document.createElement('h2')
        resultsHeader.innerText = wins > defeats
            ? 'You did good!'
            : 'You did good, better luck next time!'

        return resultsHeader
    }

    async getDuration(ms) {
        const duration = moment.duration(ms);
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}