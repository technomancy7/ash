import { AshContext } from './ash';
import { Commands } from './discord/commands';

// Setup ash client as the backend for the discord bot
let ashClient = new AshContext();
await ashClient.load_config()
ashClient.context.commandPrefix = ashClient.get_config("discord.prefix", ".");
ashClient.context.owner_id = 206903283090980864;
ashClient.contextDisable("aim", "auto", "appman", "system", "games", "quests", "rpg", "codex", "scriptchu")
ashClient.context.whitelist = ashClient.get_config("discord.whitelist", [])
ashClient.context.blacklist = ashClient.get_config("discord.blacklist", [])
ashClient.context.interface_version = "25.7.28"
ashClient.context.interface_name = "discord"
ashClient.context.threads = {}

// Define global constants
const LDR_VERSION = ashClient.context.interface_version
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

class DiscordEmbed {
    constructor(title = undefined, description = undefined) {
        this.type = "rich";

        this.title = title;
        this.description = description;
        this.url = undefined;
        this.timestamp = undefined;
        this.color = undefined;
        this.colour = undefined;
        this.footer = undefined;

        this.image = undefined;
        this.thumbnail = undefined;
        this.video = undefined;
        this.provider = undefined;
        this.author = undefined;

        this.fields = []
    }

    set_color(colName) { this.setColour(colName); }

    set_colour(colName) {
        this.colour = Bun.color(colName, "number");
        this.color = this.colour
    }

    json() {
        return {
            "title": this.title,
            "type": this.type,
            "description": this.description,
            "url": this.url,
            "timestamp": this.timestamp,
            "color": this.color || this.colour,
            "footer": this.footer,
            "image": this.image,
            "thumbnail": this.thumbnail,
            "video": this.video,
            "provider": this.provider,
            "author": this.author,
            "author": this.fields,
        }
    }
}

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

    "delete_message": async function(message) {
        try {
            const response = await fetch(`${api_base}
/channels/${message.channel_id}/messages/${message.id}`, { method: "DELETE", headers: headers });

            if (!response.ok) console.error(`Error deleting object: [${object_id}]`, response.status, response.statusText);
            const js = await response.json();
            return js
        } catch (error) { console.error("Error deleting object:", error); }
    },

    "edit_message": async function(message, new_content, embed = undefined) {
        try {
            const response = await fetch(`${api_base}channels/${message.channel_id}/messages/${message.id}`, {
                method: "PATCH",
                headers: headers,
                body: JSON.stringify({ content: new_content })
            });

            if (!response.ok) console.error(`Error sending message: [${new_content}]`, response.status, response.statusText);
            return response.json()
        } catch (error) { console.error("Error sending message:", error); }
    },

    "send_message": async function(channel, text, embed = undefined) {
        if(!text) return;

        if(typeof channel == "object") channel = channel.id;

        try {
            const response = await fetch(`${api_base}channels/${channel_id}/messages`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ content: text })
            });

            if (!response.ok) console.error(`Error sending message: [${text}]`, response.status, response.statusText);
            return response.json()
        } catch (error) { console.error("Error sending message:", error); }
    },

    "reply": async function(message, text, embed = undefined) {
        if(!text) return;

        try {
            const response = await fetch(`${api_base}channels/${message.channel_id}/messages`, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({ content: text, message_reference: { type: 0, message_id: message.id } })
            });

            if (!response.ok) console.error(`Error sending message: [${text}]`, response.status, response.statusText);

            return response.json()

        } catch (error) { console.error("Error sending message:", error); }
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

            client.context.gateway = gatewayURL;
            client.context.api_base = api_base;


            client.context.get_channel = async function(id) {
                if(id == undefined) id = client.context.channel_id;
                let c = await api.get("channel", id)
                return c;
            }

            client.context.send = async function(text) {
                let msg = await api.send_message(message.channel_id, text)
                return msg
            }

            client.context.reply = async function(text) {
                let msg = await api.reply(client.context.message, text)
                return msg
            }

            client.context.createThread = async function(threadId, fn, delay = 1000) {
                client.context.threads[threadId] = {
                    id: setInterval(fn, delay),
                    delay: delay,
                    created: client.dayjs().format()
                }
            }

            client.context.stopThread = async function(threadId) {
                clearInterval(client.context.threads[threadId].id);
                delete client.context.threads[threadId];
            }

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
            console.log(op, d, t)
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

            if(Commands[d.content.split(" ")[0].slice(1)]) {
                let lcmdCtx = passContext("message", d, ashClient.clone());

                await Commands[d.content.split(" ")[0].slice(1)](lcmdCtx, d.content.split(" ").slice(1).join(" "))

                if(lcmdCtx.context.output && lcmdCtx.context.output.length > 0) {
                    await lcmdCtx.context.api.reply(lcmdCtx.context.message, lcmdCtx.context.output.join("\n"))
                }

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
