import { $ } from "bun";

// OVERHAUL TODO
// Rewrite codex to all use one db file instead of being spread across more

export class Action {
    constructor(ctx) {
        this.ctx = ctx;
        this.help = {
            "title": "Codex",
            "text": "Generic data storage and retrieval.",
            "commands": ["list", "set,Format: parent.key value", "get,Format: entry_name[.key]", "edit,Opens given database file in default editor.", "append,Format: parent.key entry", "unappend,Format: parent.key entry"],
            "parameters": ["--json,Changes output to json instead of formatting", "--filter [key==value or key!=value]", "--open [key],If used on get, opens key in browser.", "--db <database file>,Decides which database file to focus on."],
            "author": "Techno",
            "version": "0.4"
        }
    }

    async format_entry(data) {
        if(this.ctx.args.json)
            console.log(`${JSON.stringify(data)}`)
        else {
            let output = [];
            for(let [key, val] of Object.entries(data)){
                if(typeof val == "string") {
                    val = val.trim()
                    if(key.startsWith("_") && key.endsWith("_")) continue;
                    if(val.includes("\n")) {
                        let i = 0;
                        for(const line of val.split("\n")) {
                            output.push(`[green]${key}[reset][${i}] = [yellow]"${line}"[reset]`);
                            i = i + 1;
                        }
                    } else {
                        if(val.startsWith("@ ")) {
                            let ts = this.ctx.dayjs(val.slice(2), "DD-MM-YYYY")
                            output.push(`[green]${key}[reset] = [cyan]"${ts.fromNow()}"[reset] (${val.slice(2)})`)
                        } else {
                            output.push(`[green]${key}[reset] = [yellow]"${val}"[reset]`)
                        }

                    }
                } else if(typeof val == "number" || typeof val == "boolean") {
                    output.push(`[green]${key}[reset] = [yellow]${val}[reset]`)

                } else if(typeof val == "object" && val.constructor == Array) {
                    output.push(`[green]${key}[reset]:`)
                    for(const line of val) {
                        if(line.startsWith("x ")) {
                            output.push(` - [[green]X[reset]] [yellow]"${line.slice(2)}"[reset]`);
                        } else {
                            output.push(` - [ ] [yellow]"${line}"[reset]`);
                        }

                    }
                } else if(typeof val == "object") {
                    output.push(`[green]${key}[reset]:`)

                    for(const [key, objv] of Object.entries(val)) {
                        if(typeof objv == "string" && objv.includes("\n")) {
                            let i = 0;
                            for(const line of objv.split("\n")) {
                                output.push(` [orange]${key}[reset][${i}] = [yellow]"${line}"[reset]`);
                                i = i + 1;
                            }

                        } else if(typeof objv == "string" && objv.startsWith("@ ")) {
                            let ts = this.ctx.dayjs(objv.slice(2), "DD-MM-YYYY")
                            output.push(` [orange]${key}[reset] = [cyan]"${ts.fromNow()}"[reset] (${objv.slice(2)})`)

                        } else if(typeof objv == "object" && objv.constructor == Array) {
                            output.push(` [orange]${key}[reset]:`)
                            for(const line of objv) {
                                if(line.startsWith("x ")) {
                                    output.push(`   - [[green]X[reset]] [yellow]"${line.slice(2)}"[reset]`);
                                } else {
                                    output.push(`   - [ ] [yellow]"${line}"[reset]`);
                                }

                            }
                        } else if(typeof objv == "number" || typeof objv == "boolean") {
                            output.push(` [orange]${key}[reset] = [yellow]${objv}[reset]`)

                        } else {
                            output.push(` [orange]${key}[reset] = [yellow]"${objv}"[reset]`);
                        }



                    }
                }
            }

            this.ctx.write_panel(data._key_, output.join("\n"))
        }
    }

    checkFilter(data) {
        let filter = this.ctx.args.filter;
        if(!filter) return true;
        let filter_type = "";
        let filter_key = "";
        let filter_value = "";

        if(filter.includes("==")) {
            filter_type = "==";
            filter_key = filter.split("==")[0].trim();
            filter_value = filter.split("==")[1].trim();
        }

        if(filter.includes("!=")) {
            filter_type = "!=";
            filter_key = filter.split("!=")[0].trim();
            filter_value = filter.split("!=")[1].trim();
        }

        if(filter_type == "=="){
            return data[filter_key] == filter_value;
        }

        if(filter_type == "!="){
            return data[filter_key] != filter_value;
        }
    }

    async on_execute() {
        const cmd = this.ctx.line[0] || "ls";
        const params = this.ctx.line.slice(1)
        const line = params.join(" ")
        let db = this.ctx.args.db || "data";
        let data = {}

        function char_count(str, letter) {
            var letter_Count = 0;
            for (var position = 0; position < str.length; position++) { if (str.charAt(position) == letter) letter_Count += 1 }
            return letter_Count;
        }

        switch (cmd) {
            case 'list':
            case 'ls':
                data = await this.ctx.load_data("codex", db)
                if(this.ctx.args.json) return console.log(`${JSON.stringify(data)}`)
                if(db && typeof db == "string") {
                    for (const [key, value] of Object.entries(data)) {
                        if(!this.checkFilter(value)) continue;
                        if(!value.hidden) {
                            value._key_ = key;
                            await this.format_entry(value);
                        }
                    }
                }

                break;

            case 'get':
                data = await this.ctx.load_data("codex", db);
                if(char_count(line, ".") == 0) {
                    let entry = data[line];
                    entry._key_ = line;
                    await this.format_entry(entry)

                } else if(char_count(line, ".") == 1) {
                    let entry = data[line.split(".")[0]];
                    let sub = entry[line.split(".")[1]]
                    if(typeof sub == "object") {
                        sub._key_ = line;
                        await this.format_entry(sub)
                    } else { this.ctx.writeln(sub) }

                } else if(char_count(line, ".") == 2) {
                    let entry = data[line.split(".")[0]];
                    let sub = entry[line.split(".")[1]]
                    let final_sub = sub[line.split(".")[2]]
                    if(typeof final_sub == "object") {
                        final_sub._key_ = line;
                        await this.format_entry(final_sub)
                    } else { this.ctx.writeln(final_sub) }

                } else if(char_count(line, ".") == 3) {
                    let entry = data[line.split(".")[0]];
                    let sub = entry[line.split(".")[1]]
                    let final_sub = sub[line.split(".")[2]]
                    let final_value = final_sub[line.split(".")[3]]

                    this.ctx.writeln(`${final_value}`)
                }

                break;

            case "append":
                let value = line.split(" ").slice(1).join(" ");
                let appendline = line.split(" ")[0];
                data = await this.ctx.load_data("codex", db);
                if(char_count(appendline, ".") == 1) {
                    let entry = data[appendline.split(".")[0]];
                    let sub = entry[appendline.split(".")[1]]

                    if(typeof sub == "object" && sub.constructor == Array) {
                        data[appendline.split(".")[0]][appendline.split(".")[1]].push(value)
                        await this.ctx.save_data(data, "codex", db)
                        this.ctx.writeln(`Appended.`)
                    } else { this.ctx.writeln("Entry can't be appended.") }

                } else if(char_count(appendline, ".") == 2) {
                    let entry = data[appendline.split(".")[0]];
                    let sub = entry[appendline.split(".")[1]]
                    let final_sub = sub[appendline.split(".")[2]]

                    if(typeof final_sub == "object" && final_sub.constructor == Array) {
                        data[appendline.split(".")[0]][appendline.split(".")[1]][appendline.split(".")[2]].push(value)
                        await this.ctx.save_data(data, "codex", db)
                        this.ctx.writeln(`Appended.`)
                    } else { this.ctx.writeln("Entry can't be appended.") }

                }
                break;

            case "unappend":
                let unvalue = line.split(" ").slice(1).join(" ");
                let unappendline = line.split(" ")[0];
                data = await this.ctx.load_data("codex", db);
                if(char_count(unappendline, ".") == 1) {
                    let entry = data[unappendline.split(".")[0]];
                    let sub = entry[unappendline.split(".")[1]]

                    if(typeof sub == "object" && sub.constructor == Array) {
                        data[unappendline.split(".")[0]][unappendline.split(".")[1]] = this.ctx.removeItemOnce(data[unappendline.split(".")[0]][unappendline.split(".")[1]], unvalue)
                        await this.ctx.save_data(data, "codex", db)
                        this.ctx.writeln(`Unappended.`)
                    } else { this.ctx.writeln("Entry can't be appended.") }

                } else if(char_count(unappendline, ".") == 2) {
                    let entry = data[unappendline.split(".")[0]];
                    let sub = entry[unappendline.split(".")[1]]
                    let final_sub = sub[unappendline.split(".")[2]]

                    if(typeof final_sub == "object" && final_sub.constructor == Array) {
                        data[unappendline.split(".")[0]][unappendline.split(".")[1]][unappendline.split(".")[2]] = this.ctx.removeItemOnce(data[unappendline.split(".")[0]][unappendline.split(".")[1]][unappendline.split(".")[2]], unvalue);
                        await this.ctx.save_data(data, "codex", db)
                        this.ctx.writeln(`Unappended.`)
                    } else { this.ctx.writeln("Entry can't be appended.") }

                }
                break;

            case "set":
                let setvalue = this.ctx.coerce_type(line.split(" ").slice(1).join(" "));
                let setine = line.split(" ")[0];
                data = await this.ctx.load_data("codex", db);
                if(char_count(setine, ".") == 1) {
                    let entry = data[setine.split(".")[0]];
                    let sub = entry[setine.split(".")[1]]

                    data[setine.split(".")[0]][setine.split(".")[1]] = setvalue
                    await this.ctx.save_data(data, "codex", db)
                    this.ctx.writeln(`Set.`)


                } else if(char_count(setine, ".") == 2) {
                    let entry = data[setine.split(".")[0]];
                    let sub = entry[setine.split(".")[1]]
                    let final_sub = sub[setine.split(".")[2]]

                    if(typeof sub == "object") {
                        data[setine.split(".")[0]][setine.split(".")[1]][setine.split(".")[2]] = setvalue
                        await this.ctx.save_data(data, "codex", db)
                        this.ctx.writeln(`Set.`)
                    } else { this.ctx.writeln("Entry can't be modified.") }

                }
                break;

            case "unset":
                data = await this.ctx.load_data("codex", db);
                if(char_count(line, ".") == 0) {
                    delete data[line]
                    await this.ctx.save_data(data, "codex", db)
                    this.ctx.writeln(`Unset.`)

                } else if(char_count(line, ".") == 1) {
                    let entry = data[line.split(".")[0]];
                    let sub = entry[line.split(".")[1]]

                    delete data[line.split(".")[0]][line.split(".")[1]];
                    await this.ctx.save_data(data, "codex", db)
                    this.ctx.writeln(`Unset.`)


                }
                break;

            case "edit":
                await this.ctx.edit_file(this.ctx.data_dir+"/codex/"+db+".toml")
                break

            default:
                this.ctx.write_panel(':right_arrow: [strike_through]Unknown [red]command[reset].');
        }

    }
}
