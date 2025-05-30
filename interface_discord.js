import { AshContext } from './ash';
const LDR_VERSION = "25.5.16"
let ashClient = new AshContext();
await ashClient.load_config()
ashClient.context.commandPrefix = ashClient.get_config("discord.prefix", ".");
ashClient.context.owner_id = 206903283090980864;
ashClient.contextDisable("aim", "appman", "system", "games", "quests", "rpg", "codex", "scriptchu")
ashClient.context.whitelist = ashClient.get_config("discord.whitelist", [])
ashClient.context.blacklist = ashClient.get_config("discord.blacklist", [])

const token = ashClient.get_config("discord.token")
const gatewayURL = "wss://gateway.discord.gg/?v=10&encoding=json";
const ws = new WebSocket(gatewayURL);
const headers = { "Authorization": `Bot ${token}`, "Content-Type": "application/json" }
const api_base = "https://discord.com/api/v10/"

ws.onopen = () => {
    console.log("Connected to Discord Gateway!");
    const identifyPayload = {
        op: 2,
        d: {
            token: token,
            properties: { $os: "linux", $browser: "bun", $device: "bun" },
            intents: 53608447
        },
    };

    ws.send(JSON.stringify(identifyPayload));
};


let api = {
    "get": async function(type, object_id) {
        if(type == "channel") type = "channels";
        if(type == "guild") type = "guilds";

        try {
            const response = await fetch(`${api_base}${type}/${object_id}`, { method: "GET", headers: headers });

            if (!response.ok) console.error(`Error getting object: [${object_id}]`, response.status, response.statusText);
            const js = await response.json();
            return js
        } catch (error) { console.error("Error getting object:", error); }
    },
    "send_message": async function(channel_id, text) {
        if(!text) return;
        try {
            const response = await fetch(`${api_base}channels/${channel_id}/messages`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ content: text })
            });

            if (!response.ok) console.error(`Error sending message: [${text}]`, response.status, response.statusText);
        } catch (error) { console.error("Error sending message:", error); }
    },

    "reply": async function(message, text) {
        if(!text) return;
        try {
            const response = await fetch(`${api_base}channels/${message.channel_id}/messages`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ content: text, message_reference: { type: 0, message_id: message.id } })
            });

            if (!response.ok) console.error(`Error sending message: [${text}]`, response.status, response.statusText);
        } catch (error) { console.error("Error sending message:", error); }
    }
}

let commands = {
    "whitelist": async function(a, line) {
        if(a.author.id != ashClient.context.owner_id) return await api.reply(a.context.message, "Command rejected: developer access required")
        if(line == "") { return await api.reply(a.context.message, ashClient.context.whitelist.join(" "))}
        if(!ashClient.context.whitelist.includes(line)) {
            ashClient.context.whitelist.push(line)
            ashClient.set_config("discord.whitelist", ashClient.context.whitelist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
    },
    "unwhitelist": async function(a, line) {
        if(a.author.id != ashClient.context.owner_id) return await api.reply(a.context.message, "Command rejected: developer access required")
        if(line == "") { return await api.reply(a.context.message, "No changes made.")}
        if(ashClient.context.whitelist.includes(line)) {
            ashClient.context.whitelist = ashClient.removeItemAll(ashClient.context.whitelist, line)
            ashClient.set_config("discord.whitelist", ashClient.context.whitelist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
    },
    "blacklist": async function(a, line) {
        if(a.author.id != ashClient.context.owner_id) return await api.reply(a.context.message, "Command rejected: developer access required")
        if(line == "") { return await api.reply(a.context.message, ashClient.context.blacklist.join(" "))}
        if(!ashClient.context.blacklist.includes(line)) {
            ashClient.context.blacklist.push(line)
            ashClient.set_config("discord.blacklist", ashClient.context.blacklist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
    },
    "unblacklist": async function(a, line) {
        if(a.author.id != ashClient.context.owner_id) return await api.reply(a.context.message, "Command rejected: developer access required")
        if(line == "") { return await api.reply(a.context.message, "No changes made.") }

        if(ashClient.context.blacklist.includes(line)) {
            ashClient.context.blacklist = ashClient.removeItemAll(ashClient.context.blacklist, line)
            ashClient.set_config("discord.blacklist", ashClient.context.blacklist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
    },
    "devmode": async function(a, line) {
        if(a.author.id != ashClient.context.owner_id) return await api.reply(a.context.message, "Command rejected: developer access required")
        if(line == "") { return await api.reply(a.context.message, `discord.developer = ${ashClient.get_config('discord.developer')}`) }

        if(["y", "yes", "true", "on"].includes(line)) {
            await ashClient.set_config("discord.developer", true);
            await ashClient.save_config();
            await api.reply(a.context.message, "Developer mode enabled.")
        } else if(["n", "no", "false", "off"].includes(line)) {
            await ashClient.set_config("discord.developer", false);
            await ashClient.save_config();
            await api.reply(a.context.message, "Developer mode disabled.")
        } else {
            await api.reply(a.context.message, "Unknown request.")
        }

    },
    "self": async function(a, line) {
        let packageConf = await ashClient.get_package_config()
        let deps = [];

        for(const packageName of Object.keys(packageConf.dependencies)){
            deps.push(`${packageName} = "${packageConf.dependencies[packageName]}"`)
        }
        await api.reply(a.context.message, `\`\`\`toml\n[core]\nversion = "${ashClient.version}"\n\n[core.dependencies]\n${deps.join("\n")}\n\n[interface.discord]\nversion = "${LDR_VERSION}"\napi = "${api_base}"\ngateway = "${gatewayURL}"\n\n[javascript]\nruntime = "bun ${Bun.version}"\n\`\`\``)
    },
    "quit": async function(a, line) {
        if(a.author.id != ashClient.context.owner_id) return await api.reply(a.context.message, "Command rejected: developer access required")
        await api.reply(a.context.message, "Closing connection: 3001 Administrator shutdown.")
        await Bun.sleep(1000)
        ws.close(3001, "Administrator shutdown.");
        await Bun.sleep(1000)
        process.exit()
    }
}

function passContext(contextType, message, client) {
    if(contextType == "message") {
          client.context.session = "discord";
          client.context.member = message.member;
          client.context.author = message.author;
          client.context.author_id = message.author.id;
          client.context.api = api;
          client.context.message = message;
          client.context.content = message.content;
          client.context.id = message.id;
          client.context.message_id = message.id;
          client.context.channel_id = message.channel_id;

          client.writeln = async function(text) {
              if(!this.context.output) this.context.output = [];
              this.context.output.push(this.format_text(this.strip_formatting(text)))
          }

          client.write_panel = async function(title, text) {
              if(!this.context.output) this.context.output = [];
              this.context.output.push("```ini\n["+title+"]\n"+text+"\n```")
          }
          return client
    }
}
ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);
    const { op, d, t } = data;

    switch (op) {
      case 10: // Hello
        const heartbeatInterval = d.heartbeat_interval;
        console.log(`Heartbeat interval: ${heartbeatInterval}`);

        setInterval(() => { ws.send(JSON.stringify({ op: 1, d: null })); }, heartbeatInterval);
        break;

      case 0: // Dispatch (Events)
        if (t === "READY") {
            console.log("Bot is ready!");

        } else if (t === "MESSAGE_CREATE") {
            if(d.author.bot == true) return;
            if(!d.content.startsWith(ashClient.context.commandPrefix)) return;

            if(ashClient.get_config("discord.developer") == true && d.author.id != ashClient.context.owner_id) {
                return await api.reply(d, "Command rejected: developer-only access mode")
            }

            if(ashClient.context.whitelist.length > 0 && d.author.id != ashClient.context.owner_id) {
                if(!ashClient.context.whitelist.includes(d.author.id)) return await api.reply(d, "Command rejected: user not in whitelist")
            }

            if(ashClient.context.blacklist.length > 0 && d.author.id != ashClient.context.owner_id) {
                if(ashClient.context.blacklist.includes(d.author.id)) return await api.reply(d, "Command rejected: user blacklisted")
            }

            if(commands[d.content.split(" ")[0].slice(1)]) {
                let lcmdCtx = passContext("message", d, ashClient.clone());
                commands[d.content.split(" ")[0].slice(1)](lcmdCtx, d.content.split(" ").slice(1).join(" "))

            } else {
                let cmd = d.content.slice(ashClient.context.commandPrefix.length);

                let newCtx = passContext("message", d, ashClient.clone());

                await newCtx.execute(cmd);

                if(newCtx.context.output && newCtx.context.output.length > 0) {
                    await newCtx.context.api.reply(newCtx.context.message, newCtx.context.output.join("\n"))
                }
            }
        }
        break;
    }
};

ws.onerror = (error) => {
    console.error("WebSocket error:", error);
};

ws.onclose = (event) => {
    console.log("WebSocket connection closed:", event.code, event.reason);
};
