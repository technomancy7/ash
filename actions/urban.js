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
        const line = encodeURI(this.ctx.line.join(" "))
        
        const data = await fetch(`https://api.urbandictionary.com/v0/define?term=${line}`)
        const js = await data.json()
        if(this.ctx.args.json) return console.log(JSON.stringify(js));
        
        for(const definition of js.list) {
            this.ctx.writeln(`---------------------------------------------\n:link: ${definition.permalink}\n:speech_bubble: ${definition.definition}\n[yellow]${definition.example}[reset]\n:thumbs_up: [green]${definition.thumbs_up}[reset] / :thumbs_down: [red]${definition.thumbs_down}[reset] (${definition.author})`)
        }
        this.ctx.writeln("---------------------------------------------")
    }
}
