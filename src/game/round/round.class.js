import { Player } from "../player/player.class";

export class Round {
    constructor(word) {
        this.word = word
        this.player = new Player()
        this.wordState = ''
        this.roundStartTimestamp = Date.now()
    }

    async start() {
        const roundElements = []
        const roundResult = await new Promise(async resolve => {
            console.log(this.word)

            const container = document.querySelector('.container')
            const header = document.createElement('h1')
            header.textContent = `Guess the word with ${this.word.length} letters`
            container.appendChild(header)

            const wordPlaceholder = await this.createWordPlaceHolder()
            const inputField = await this.createInput()
            const submitBtn = await this.createSubmitBtn(inputField, wordPlaceholder, resolve)
            roundElements.push(header, wordPlaceholder, inputField, submitBtn)
            header.append(wordPlaceholder, inputField, submitBtn)
        })

        roundElements.map(e => e.remove())
        return roundResult;
    }

    async createWordPlaceHolder() {
        let wordEncrypted = ''
        for (let i = 0; i < this.word.length; i++) {
            wordEncrypted += '*'
        }

        const wordPlaceholder = document.createElement('h3')
        wordPlaceholder.textContent = wordEncrypted
        this.wordState = wordEncrypted
        return wordPlaceholder
    }

    async createInput() {
        const inputField = document.createElement('input')
        inputField.type = 'text'
        inputField.placeholder = 'Enter a letter or an entire word'
        inputField.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
        });
        return inputField
    }

    async createSubmitBtn(inputField, wordPlaceholder, resolve) {
        const submitBtn = document.createElement('button')
        submitBtn.textContent = 'Submit'
        submitBtn.addEventListener('click', () => {
            const input = inputField.value.trim().toLowerCase();
            inputField.value = ''

            if (input.length === 0) return;

            if (input.length > 1) {
                if (input !== this.word) {
                    this.player.dieOnce();
                    if (this.player.lives === 0) {
                        resolve({
                            success: false,
                            time: Date.now() - this.roundStartTimestamp
                        })
                        return;
                    }

                    inputField.placeholder = `Whoops, wrong word. You have ${this.player.lives} lives left`
                    return;
                }

                resolve({
                    success: true,
                    time: Date.now() - this.roundStartTimestamp
                })
                return;
            }

            const matches = [...this.word.matchAll(new RegExp(input, 'g'))]
            if (!matches.length) {
                this.player.dieOnce();
                if (this.player.lives === 0) {
                    resolve({
                        success: false,
                        time: Date.now() - this.roundStartTimestamp
                    })
                    return;
                }

                inputField.placeholder = `No such letters in the word. You have ${this.player.lives} lives left`
                return;
            }

            const intState = this.wordState.split('')
            for (const { index } of matches) {
                intState[index] = input
            }

            this.wordState = intState.join('');
            wordPlaceholder.textContent = this.wordState
            inputField.placeholder = 'Enter a letter or an entire word'

            !this.wordState.includes('*') && resolve({
                success: true,
                time: Date.now() - this.roundStartTimestamp
            })
        })

        return submitBtn
    }
}