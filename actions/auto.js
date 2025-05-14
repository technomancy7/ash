import { bindKey, bindKeyCombo } from '@rwh/keystrokes'

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

    async on_execute() {
        const cmd = this.ctx.line[0];
        const params = this.ctx.line.slice(1)
        const line = params.join(" ")

        switch(cmd) {
            case "run":
                process.stdin.setRawMode(true);
                process.stdin.resume();
                process.stdin.on('data', (key) => {
                    if (key.toString() === '\u0003') { // Ctrl+C to exit
                        process.exit();
                    }
                console.log('Key pressed:', key.toString());
                });
                break;

            default:
                console.log("Unknown command")
                break;
        }
    }
}
