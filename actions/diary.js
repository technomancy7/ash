/*
 * new > opens editor
 *
 * markup for input: today is a good day {dinner:pizza and chips} [[test]]
 *
 * {tagname[:value]} -> defines a tag for this entry, value is `true` if not specified
 * [[codex.entry]] -> links to a codex object
 *
 * links are dynamic, stored as a name, and when the entry is called to be printed to the user, it pulls in the objects values
 */


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
        let ctx = this.ctx;
        const cmd = this.ctx.line[0];
        const params = this.ctx.line.slice(1)
        const line = params.join(" ")

        switch(cmd) {
            case "write":
                function extractTags(inputString) {
                    const regex = /({{[!a-zA-Z0-9_]+(:[\w\d\s]+)?}}|(\[\[[a-zA-Z0-9_]+\]\]))/g;
                    const matches = inputString.match(regex) || [];
                    const cleanedString = inputString.replace(regex, '').trim();
                    return {"tags": matches, "cleaned": cleanedString};
                }

                let new_entry = await ctx.edit_file(ctx.home+"edit.txt")
                let r = extractTags(new_entry)
                ctx.writeln(`Entry done: ${r.cleaned}`)
                console.log(r.tags)
                for(let tag of r.tags) {
                    if(tag.startsWith("[[")) && tag.endsWith("]]")) { //link

                    }
                }

                let entry_data = {
                    "raw": new_entry,
                    "text": r.cleaned,
                    "properties": {},
                    "links": []
                }
                //await ctx.delete_file(ctx.home+"edit.txt")
                break;

            default:
                console.log("Unknown command")
                break;
        }
    }
}
