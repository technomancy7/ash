const argParser = require('yargs-parser')
//var tk = require( 'terminal-kit' ).terminal;
var blessed = require('blessed');

import TOML from 'smol-toml';
import { Glob } from "bun";
import { $ } from "bun";

const dayjs = require('dayjs')
var relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime)
var customParseFormat = require("dayjs/plugin/customParseFormat");
dayjs.extend(customParseFormat);
var duration = require("dayjs/plugin/duration");
dayjs.extend(duration);
var updateLocale = require('dayjs/plugin/updateLocale')


dayjs.extend(updateLocale, {
  thresholds: [
    { l: 's', r: 1 }, { l: 'm', r: 1 }, { l: 'mm', r: 59, d: 'minute' }, { l: 'h', r: 1 }, { l: 'hh', r: 23, d: 'hour' },
    { l: 'd', r: 1 }, { l: 'dd', r: 29, d: 'day' }, { l: 'M', r: 1 }, { l: 'MM', r: 11, d: 'month' },  { l: 'y', r: 1 }, { l: 'yy', d: 'year' }
  ]
})

dayjs.updateLocale('en', {
  relativeTime: {
    future: "in %s", past: "%s ago", s: 'a few seconds', m: "a minute", mm: "%d minutes", h: "an hour", hh: "%d hours", d: "a day",
    dd: "%d days", M: "a month", MM: "%d months", y: "a year", yy: "%d years"
  }
})

const ASH_VERSION = "25.5.15"

export class AshContext {
    constructor(parent = null) {
        this.context = {} // A table for storing arbitrary values that may or may not be used for functionality
        this.version = ASH_VERSION;
        this.parent = parent;
        this.dayjs = dayjs;
        //this.tk = tk;
        this.tui = blessed;
        this.args = {}
        this.command = ""
        this.line = []
        this.config = {}
        this.argParser = argParser;
        this.home = process.env.OVERRIDE_HOME || process.env.HOME+"/.ash/";
        this.data_dir = this.home+"/data/"
        this.glob = new Glob("*");
        this.fmt = {
            "reset": '\033[0m',
            "red": Bun.color("red", "ansi"),
            "green": Bun.color("green", "ansi"),
            "blue": Bun.color("blue", "ansi"),
            "cyan":Bun.color("cyan", "ansi"),
            "orange":Bun.color("orange", "ansi"),
            "yellow": Bun.color("yellow", "ansi"),
            "bold": "\u001b[1m",
            "dim": "\u001b[2m",
            "italic": "\u001b[3m",
            "underline": "\u001b[4m",
            "blink": "\u001b[5m",
            "reverse": "\u001b[7m",
            "hidden": "\u001b[8m",
            "strike_through": "\u001b[9m",
        }
        this.emojis = {
            "right_arrow": "➡️",
            "loop_arrow": "↪",
            "smile": "😊",
            "heart": "❤️",
            "thumbs_up": "👍",
            "thumbs_down": "👎",
            "link": "🔗",
            "speech_bubble": "💬",
            "clap": "👏",
            "fire": "🔥",
            "star": "⭐",
            "check_mark": "✔️",
            "wave": "👋",
            "laugh": "😂",
            "wink": "😉",
            "cry": "😢",
            "angry": "😡",
            "party": "🥳",
            "thinking": "🤔",
            "sunglasses": "😎",
            "kiss": "😘",
            "hug": "🤗",
            "sleepy": "😴",
            "poop": "💩",
            "rocket": "🚀",
            "clubs": "♣️",
            "diamonds": "♦️",
            "spades": "♠️",
            "hearts": "♥️"
        }
    }

    async ocr(image_path) {
        const proc = Bun.spawn(["tesseract", image_path, "-"]);
        const text = await new Response(proc.stdout).text();

        return text
    }

    async send_message(sender, message) {
        let messages = await Bun.file(this.home+"/messages.toml").text()
        let md = TOML.parse(messages)

        if(!md[sender]) md[sender] = {};
        let key = this.randomAlphaNumeric(5)
        while(Object.keys(md[sender]).includes(key)) this.randomAlphaNumeric(5)

        md[sender][key] = message;

        await Bun.write(this.home+"/messages.toml", TOML.stringify(md));
    }

    async get_messages(sender) {
        let messages = await Bun.file(this.home+"/messages.toml").text()
        let md = TOML.parse(messages)
        if(!md[sender]) return null;
        return md[sender];
    }

    randomAlphaNumeric(length) {
        let s = '';
        Array.from({ length }).some(() => {
            s += Math.random().toString(36).slice(2);
            return s.length >= length;
        });
        return s.slice(0, length);
    };

    async download_file(url, out_path) {
        let filename = url.split("/").slice(-1)[0];
        console.log(`Downloading ${filename} to ${out_path}`)

        for await (let line of $`curl --skip-existing --output ${out_path+filename} "${url}"`.lines()) {
            console.log(line);
        }


        return out_path+filename, filename
    }


    async edit_file(path) {
        let editor = this.get_config("tools.editor")
        console.log("Opening", path, "in tools.editor: ", editor)
        await $`${editor} ${path}`;
        let edittxt = Bun.file(path)
        let editsaved = await edittxt.exists();
        if(editsaved) {
            let text = await edittxt.text();
            return text
        }
    }

    async delete_file(path) {
        await Bun.file(path).delete();
    }

    coerce_type(input) {
        console.log("Coercing", input)
        // Trim the input to remove extra whitespace
        const trimmedInput = input.trim();

        // Check for boolean values
        if (trimmedInput.toLowerCase() === "true") {
            return true;
        }
        if (trimmedInput.toLowerCase() === "false") {
            return false;
        }

        // Check for numeric values
        if (!isNaN(trimmedInput) && trimmedInput !== "") {
            return parseFloat(trimmedInput); // Converts to number (integer or float)
        }

        // Check for quoted strings
        if (
            (trimmedInput.startsWith('"') && trimmedInput.endsWith('"')) ||
            (trimmedInput.startsWith("'") && trimmedInput.endsWith("'"))
        ) {
            return trimmedInput.slice(1, -1); // Remove surrounding quotes
        }

        // Check for arrays
        if(trimmedInput.startsWith("[") && trimmedInput.endsWith("]")) {
            return this.xeval(trimmedInput)
        }
        // Default to returning the original string
        return trimmedInput;
    }

    removeItemOnce(arr, value) {
        var index = arr.indexOf(value);
        if (index > -1) {
            arr.splice(index, 1);
        }
        return arr;
    }

    removeItemAll(arr, value) {
        var i = 0;
        while (i < arr.length) {
            if (arr[i] === value) {
                arr.splice(i, 1);
            } else {
                ++i;
            }
        }
        return arr;
    }

    xeval(obj) { return eval?.(`"use strict";(${obj})`); }

    strip_formatting(text) {
        for(const [name, colour] of Object.entries(this.fmt)) {
           text = text.replaceAll(`[${name}]`, "");
        }
        return text;
    }

    format_text(text) {
        for(const [name, colour] of Object.entries(this.fmt)) {
           text = text.replaceAll(`[${name}]`, colour);
        }

        for(const [name, emoji] of Object.entries(this.emojis)) {
           text = text.replaceAll(`:${name}:`, emoji);
        }

        return text;
    }

    async gfmt(text) {
        let o = await $`echo '${text}' | gum format -t emoji | gum format -t template`.text()
        return o
    }

    writeln(text) {
        text = this.format_text(text);
        console.log(text);
    }

    async filter_choice(choices) {
        /*if(choices.length == 1) return choices[0]
        let fmt = [];
        for(const choice of choices){
            fmt.push(`"${choice}"`)
        }*/

        //const res = await $`gum filter ${{ raw: fmt.join(" ") }}`;
        //res.text().trim();
        const proc = Bun.spawn(["gum", "filter", ...choices]);
        const text = await new Response(proc.stdout).text();

        return text
    }

    async get_choice(choices) {
        /*if(choices.length == 1) return choices[0]
        let fmt = [];
        for(const choice of choices){
            fmt.push(`"${choice}"`)
        }
        const res = await $`gum choose ${{ raw: fmt.join(" ") }}`;
        return res.text().trim();*/
        const proc = Bun.spawn(["gum", "choose", ...choices]);
        const text = await new Response(proc.stdout).text();

        return text
    }


    async get_input(placeholder) {
        const proc = Bun.spawn(["gum", "input", "--placeholder", placeholder]);
        const text = await new Response(proc.stdout).text();

        return text
    }

    question(prompt) {
        this.tk( `${prompt} [Y|n]\n` ) ;

        this.tk.yesOrNo( { yes: [ 'y' , 'ENTER' ] , no: [ 'n' ] } , function( error , result ) {
            return result;
        });
    }

    async write_panel(title, text) {
        text = this.format_text(text);
        await $`gum style --border double "${this.fmt.bold}[${title}]${this.fmt.reset}" "${text}"`

        //const proc = Bun.spawn(["gum", "style", "--border", "double", "--width", 50, `${this.fmt.bold}[${title}]${this.fmt.reset}`, text ]);
        //const out = await new Response(proc.stdout).text();
        //console.log(out)
    }

    async load_all_data(directory) {
        let output = {}

        for (const file of this.glob.scanSync(this.data_dir+directory)) {
            let key = file.split(".")[0];
            output[key] = await this.load_data(directory, key)
        }
        return output;
    }

    async load_data(directory, filename = "data") {
        let confile = Bun.file(this.home+"/data/"+directory+"/"+filename+".toml")
        let exists = await confile.exists();
        if(exists) {
            let text = await confile.text();
            return TOML.parse(text)
        } else return {}
    }

    async save_data(store, directory, filename = "data") {
        await Bun.write(this.home+"/data/"+directory+"/"+filename+".toml", TOML.stringify(store));
    }

    async save_config() {
        await Bun.write(this.home+"/ash.toml", TOML.stringify(this.config));
    }

    async get_package_config() {
        let c = await Bun.file(this.home+"/package.json").text()
        return JSON.parse(c)
    }

    async load_config() {
        let c = await Bun.file(this.home+"/ash.toml").text()
        this.config = TOML.parse(c)
    }

    set_config(key, value) {
        if(this.parent) {
            this.parent.set_config(key, value)
        }

        if(key.includes(".")) {
            let parent = key.split(".")[0];
            let sub = key.split(".")[1];

            if(this.config[parent] == undefined) this.config[parent] = {}
            this.config[parent][sub] = value;

        } else {
            this.config[key] = value;
        }
    }

    get_config(key, default_value = undefined) {
        if(key.includes(".")) {
            let parent = key.split(".")[0];
            let sub = key.split(".")[1];

            if(this.config[parent] == undefined) return default_value
            if(this.config[parent][sub] == undefined) return default_value
            return this.config[parent][sub];

        } else {
            return this.config[key] || default_value;
        }
    }

    incr(key, m = 1) {
        let v = this.get_config(key, 1);
        this.set_config(key, v + m);
        return v + m;
    }

    decr(key, m = 1) {
        let v = this.get_config(key, 1);
        this.set_config(key, v - m);
        return v - m;
    }

    process_args(args) {
        this.args = argParser(args)
        this.command = this.args._[0]
        this.line = this.args._.slice(1)

        if(this.get_config("self.always_json") == true) this.args.json = true
    }

    get_action(name) {
        const cmd_path = this.home+"/actions/"+name+".js";
        const action = require(cmd_path);
        let act = new action.Action(this);
        return act;
    }

    clone(inheritContext = true) {
        let ctx = new AshContext(this)
        ctx.config = this.config;
        if(inheritContext) {
            for(let key of Object.keys(this.context)) {
                ctx.context[key] = this.context[key]
            }
        }
        return ctx;
    }

    say(text, tts = false) {
        //TTS NOT YET IMPLEMENTED
        let name = this.get_config("self.name", "Athena");
        this.writeln(`([green]${name}[reset])> ${text}`)
    }

    async get_user_name() {
        //let codex = await this.load_data("codex", "addrbook")
        //return codex.self["Display Name"] || codex.self.name || "self.user";
        return this.get_config("user.name", "User")
    }

    async repl() {
        let all_actions = [];
        for (const file of this.glob.scanSync(this.home+"actions")) {
            let key = file.split(".")[0].toLowerCase();
            all_actions.push(key)
        }

        this.writeln = async function(text) {
              tk(this.format_text(text))
              tk("\n")
        }

        this.write_panel = async function(title, text) {
              tk("["+title+"]\n"+this.format_text(text))
              tk("\n")
        }

        tk.on( 'key' , function( name , matches , data ) {
            if ( name === 'CTRL_C' ) { process.exit() }
        });

        const use_fallback = this.get_config("repl.fallback_enabled", false)
        const username = await this.get_user_name();
        this.say(`Interactive mode activated. What is your request, ${username}?`)
        process.on("SIGINT", async () => { process.exit() });

        async function cleanup() { process.exit() }

        async function repl_loop(client){
            try {
                const prompt = "\n(> ";
                tk(prompt);
                var line = await tk.inputField().promise;

                client.writeln(`\n([blue]${username}[reset])> ${line}\n`);

                if(line == ".q" || line == "quit") {client.say("Goodbye.");await cleanup();}

                if(all_actions.includes(line.split(" ")[0])) {
                    await client.execute(line)
                } else if(use_fallback == true){
                    if(line.split(" ")[0] == "cd") {
                        await $.cwd(line.split(" ").slice(1).join(" "));
                    } else {
                        let shell = client.get_config("repl.fallback_shell", "bash -c")
                       // let cmd = `${shell} ${line}`
                        await $`${{raw: shell}}" ${line}`.env({ ...process.env});
                        //client.writeln(resp)
                    }

                }
                await repl_loop(client);

            } catch (e) { console.error(`Error: ${e.name} ${e.message}`); await repl_loop(client); }
        }
        await repl_loop(this)
        console.log("Ended")
    }

    contextEnable(...commands) {
        if(!this.context.disabled) return;
        for (const arg of commands) {
            if(this.context.disabled.includes(arg)) {
                this.context.disabled = this.removeItemAll(this.context.disabled, arg);
            }
        }
    }

    contextDisable(...commands) {
        if(!this.context.disabled) this.context.disabled = [];
        for (const arg of commands) {
            if(!this.context.disabled.includes(arg)) {
                this.context.disabled.push(arg);
            }
        }
    }

    async globalEnable(...commands) {
        let disabled = this.get_config("self.disabled", [])
        for (const arg of commands) {
            if(disabled.includes(arg)) {
                disabled = this.removeItemAll(disabled, arg);
            }
        }
        this.set_config("self.disabled", disabled)
        await this.save_config()
    }

    async globalDisable(...commands) {
        let disabled = this.get_config("self.disabled", [])
        for (const arg of commands) {
            if(!disabled.includes(arg)) {
                this.disabled.push(arg);
            }
        }
        this.set_config("self.disabled", disabled)
        await this.save_config()
    }

    async execute(new_command = undefined) {
        if(new_command) { this.process_args(new_command.split(" ")) }

        let bypassDisabled = false;

        if(this.args.override) {
            console.log(`${this.context.author.username} ${this.context.author_id} is trying to override...`)
            if(this.context.session == "discord") {
                console.log(`In discord session... Testing: ${this.context.owner_id}`)
                if(this.context.author_id == this.context.owner_id) {
                    console.log(`Bypass successful for ${this.context.author_id}`)
                    bypassDisabled = true;
                } else {
                    return this.writeln("Authentication failed.")
                }
            } else {
                bypassDisabled = true;
            }

        }

        let disabled = this.get_config("self.disabled", [])

        if(disabled.includes(this.command)) {
            if(!bypassDisabled) return this.writeln("This command is globally disabled.")
        }

        if(this.context.disabled && this.context.disabled.includes(this.command)) {
            if(!bypassDisabled) return this.writeln("This command is not available in this context.")
        }


        if(this.command == undefined) { this.args.help = true; }

        const alias = await this.get_config("aliases."+this.command)
        if(alias) this.command = alias;
        if(this.command == "repl"){
            await this.repl();
            return;
        }

        const cmd_path = this.home+"/actions/"+this.command+".js";
        const file = Bun.file(cmd_path);
        const cmd_exists = await file.exists();

        if(this.command && !cmd_exists) { return this.writeln("Command does not exist.") }

        if(this.args.help) {
            if(this.command) {
                const action = require(cmd_path);
                let act = new action.Action(this)
                this.writeln(`[bold]${act.help.title || this.command}[reset] (v${act.help.version} by ${act.help.author})`)
                if(act.help.text) this.writeln(act.help.text);
                if(act.help.commands && act.help.commands.length >= 1){
                    this.writeln("\nCommands:")
                    for(const com of act.help.commands) {
                        if(com.includes(",")){
                            this.writeln("\t"+com.split(",")[0])
                            let help_line = com.split(",").slice(1).join(",");
                            this.writeln("\t  ↪ "+help_line)
                        } else {
                            this.writeln("\t"+com)
                        }

                    }
                }

                if(act.help.parameters && act.help.parameters.length >= 1){
                    this.writeln("\nParameters:")
                    for(const parm of act.help.parameters) {
                        if(parm.includes(",")){
                            this.writeln("\t"+parm.split(",")[0])
                            let help_line = parm.split(",").slice(1).join(",");
                            this.writeln("\t  ↪ "+help_line)
                        } else {
                            this.writeln("\t"+parm)
                        }
                    }
                }

                return;
            }else{
                this.writeln("ASH.CLI."+ASH_VERSION)
                this.writeln("\nActions:")
                for (const file of this.glob.scanSync(this.home+"actions")) {
                    let key = file.split(".")[0].toLowerCase();
                    this.writeln("\t"+key)
                }
                return;
            }

        }


        const action = require(cmd_path);
        let act = new action.Action(this)
        await act.on_execute()
        return this;
    }
}

if(import.meta.main) {
    let ctx = new AshContext()
    await ctx.load_config()
    ctx.process_args(process.argv.slice(2))
    await ctx.execute()
}
