export class Action {
    constructor(ctx) {
        this.ctx = ctx;
        this.help = {
            "title": "",
            "text": "",
            "commands": [],
            "parameters": [],
            "author": "",
            "version": "0.1"
        }
    }
    generateVowelString(length) {
        if (length <= 0) {
            return '';
        }

        const vowels = 'aeiou';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * vowels.length);
            result += vowels[randomIndex];
        }

        return result;
    }
    generateConsonantString(length) {
        if (length <= 0) {
            return '';
        }

        const consonants = 'bcdfghjklmnpqrstvwxyz';
        let result = '';

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * consonants.length);
            result += consonants[randomIndex];
        }

        return result;
    }

    shuffle(word) {
        let arr = word.split("")
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.join(" ")
    }

    async on_execute() {
        const cmd = this.ctx.line[0];
        const params = this.ctx.line.slice(1)
        const line = params.join(" ")

        switch(cmd) {
            case "unscramble":
                let time_left = this.ctx.args.t || 30;
                let cons = this.ctx.args.c || 5;
                let vows = this.ctx.args.v || 5;
                let max_word_size = cons + vows;
                let letters = this.shuffle(this.generateConsonantString(cons) + this.generateVowelString(vows));
                let guesses = [];

                let quit_game = async function() {
                    this.ctx.writeln("\n\n == Results ==")
                    for(let guess of guesses) {
                        this.ctx.writeln(`${guess} (${guess.length})`)
                    }
                    process.exit()
                }

                this.ctx.writeln(`Starting with ${time_left}s limit, ${cons} consonants and ${vows} vowels.`)
                this.ctx.writeln(`{ ${letters} }`)
                setInterval(async function(){
                    time_left = time_left - 1;
                    if(time_left <= 0) {await quit_game()}
                }, 1000)

                process.on("SIGINT", async () => {await quit_game()});

                async function getUserInput(){
                    while(true) {
                        try {
                            const prompt = "(> ";
                            process.stdout.write(prompt);
                            for await (const line of console) {
                                //let u = line.strip()
                                guesses.push(line)

                                if(line == ".q") {console.log("Goodbye.");await cleanup();}
                                process.stdout.write(prompt);
                            }

                        } catch (e) {
                            console.error(`Exited. ${e.name} ${e.message}`);
                            process.exit()
                        }
                    }
                    console.log("Ended")
                }
                await getUserInput()
                break;

            default:
                console.log("Unknown command")
                break;
        }
    }
}
