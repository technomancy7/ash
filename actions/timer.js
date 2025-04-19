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
            case "daemon": //TODO read config on loop
                break
            case "ls":

                break
                
            case "countdown":
                let m = this.ctx.args.m || 0;
                let h = this.ctx.args.h || 0;
                let d = this.ctx.args.d || 0;
                let text = this.ctx.args.text || "Timer";
                
                let now = this.ctx.dayjs();
                
                if(m) now = now.add(this.ctx.dayjs.duration(parseInt(m), "minutes"))
                if(h) now = now.add(this.ctx.dayjs.duration(parseInt(h), "hours"))
                if(d) now = now.add(this.ctx.dayjs.duration(parseInt(d), "days"))
                console.log(typeof now, now.format())
                //TODO change to straight config
                await this.ctx.send_message("timer", {"operation": "insert", "text": text, "ts": now.format()})
                break;
            
            default:
                console.log("Unknown command")
                break;
        }
    }
}
