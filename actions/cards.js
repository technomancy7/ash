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

    generate_deck() {
        let _deck = [];

        for(let i = 1;i<=13;i++) {
            let values = i;
            if(values == 1) values = "ace"
            if(values == 11) values = "jack"
            if(values == 12) values = "queen"
            if(values == 13) values = "king"
            _deck.push({"value": i, "values": values, "suit": "♣️", "suits": "clubs"})
            _deck.push({"value": i, "values": values, "suit": "♦️", "suits": "diamonds"})
            _deck.push({"value": i, "values": values, "suit": "♠️", "suits": "spades"})
            _deck.push({"value": i, "values": values, "suit": "♥️", "suits": "hearts"})
        }
        return _deck
    }

    async on_execute() {
        const cmd = this.ctx.line[0];
        const params = this.ctx.line.slice(1)
        const line = params.join(" ")

        switch(cmd) {
            case "json":
                let _deck = this.generate_deck();
                console.log(JSON.stringify(_deck))
                break;

            case "open":
                let deck = this.generate_deck();

                async function getUserInput(ctx){
                    while(true) {
                        try {
                            const prompt = "(> ";
                            process.stdout.write(prompt);
                            for await (const line of console) {
                                //let u = line.strip()
                                console.log(`?: ${line}`);

                                if(line == "draw") {
                                    let _card = deck.pop();
                                    ctx.writeln(JSON.stringify(_card))
                                }
                                if(line == "quit") {console.log("Goodbye."); process.exit();}
                                process.stdout.write(prompt);
                            }

                        } catch (e) {
                            console.error(`Exited. ${e.name} ${e.message}`);
                            process.exit()
                        }
                    }
                }
                await getUserInput(this.ctx)
                break;

            default:
                console.log("Unknown command")
                break;
        }
    }
}
