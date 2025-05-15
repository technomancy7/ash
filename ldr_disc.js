import { AshContext } from './ash';

let ashClient = new AshContext();
await ashClient.load_config()
ashClient.context.commandPrefix = ashClient.get_config("discord.prefix", ".");
ashClient.context.owner_id = 206903283090980864;
ashClient.contextDisable("aim", "appman", "system", "games", "quests", "rpg", "codex")
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
        if(line == "") { return await api.reply(a.context.message, ashClient.context.whitelist.join(" "))}
        if(!ashClient.context.whitelist.includes(line)) {
            ashClient.context.whitelist.push(line)
            ashClient.set_config("discord.whitelist", ashClient.context.whitelist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
    },
    "unwhitelist": async function(a, line) {
        if(line == "") { return await api.reply(a.context.message, "No changes made.")}
        if(ashClient.context.whitelist.includes(line)) {
            ashClient.context.whitelist = ashClient.removeItemAll(ashClient.context.whitelist, line)
            ashClient.set_config("discord.whitelist", ashClient.context.whitelist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
    },
    "blacklist": async function(a, line) {
        if(line == "") { return await api.reply(a.context.message, ashClient.context.blacklist.join(" "))}
        if(!ashClient.context.blacklist.includes(line)) {
            ashClient.context.blacklist.push(line)
            ashClient.set_config("discord.blacklist", ashClient.context.blacklist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
    },
    "unblacklist": async function(a, line) {
        if(line == "") { return await api.reply(a.context.message, "No changes made.")}
        if(ashClient.context.blacklist.includes(line)) {
            ashClient.context.blacklist = ashClient.removeItemAll(ashClient.context.blacklist, line)
            ashClient.set_config("discord.blacklist", ashClient.context.blacklist)
            await ashClient.save_config();
            await api.reply(a.context.message, "List updated.")
        } else await api.reply(a.context.message, "No change made.")
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

            if(ashClient.context.whitelist.length > 0 && d.author.id != ashClient.context.owner_id) {
                if(!ashClient.context.whitelist.includes(d.author.id)) return await api.reply(d, "Command rejected due to whitelist rule.")
            }

            if(ashClient.context.blacklist.length > 0 && d.author.id != ashClient.context.owner_id) {
                if(ashClient.context.blacklist.includes(d.author.id)) return await api.reply(d, "Command rejected due to blacklist rule.")
            }

            if(commands[d.content.split(" ")[0].slice(1)]) {
                let lcmdCtx = passContext("message", d, ashClient.clone());
                commands[d.content.split(" ")[0].slice(1)](lcmdCtx, d.content.split(" ").slice(1).join(" "))

            } else if(d.content.startsWith(ashClient.context.commandPrefix)) {
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
