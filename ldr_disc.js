import { AshContext } from './ash';
//import { createBot } from '@discordeno/bot'
let ashClient = new AshContext();
await ashClient.load_config()
ashClient.context.commandPrefix = ashClient.get_config("discord.prefix", ".");
ashClient.context.owner_id = 206903283090980864;
ashClient.contextDisable("aim", "appman", "system", "games", "quests", "rpg", "codex")
const token = ashClient.get_config("discord.token")

// Discord Gateway URL
const gatewayURL = "wss://gateway.discord.gg/?v=10&encoding=json";

const ws = new WebSocket(gatewayURL);

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

const headers = { "Authorization": `Bot ${token}`, "Content-Type": "application/json" }
const api_base = "https://discord.com/api/v10/"

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

ws.onmessage = async (event) => {
  const data = JSON.parse(event.data);
  const { op, d, t } = data;

  switch (op) {
    case 10: // Hello
      const heartbeatInterval = d.heartbeat_interval;
      console.log(`Heartbeat interval: ${heartbeatInterval}`);

      setInterval(() => {
        ws.send(JSON.stringify({ op: 1, d: null })); // Heartbeat opcode
      }, heartbeatInterval);
      break;

    case 0: // Dispatch (Events)
      if (t === "READY") {
        console.log("Bot is ready!");

      } else if (t === "MESSAGE_CREATE") {
        if(d.content == ".msg") await api.send_message(d.channel_id, "you are tested")
        else if(d.content == ".test") await api.reply(d, "you are tested")
        else if(d.content.startsWith(ashClient.context.commandPrefix)) {
          let cmd = d.content.slice(ashClient.context.commandPrefix.length);

          let newCtx = ashClient.clone();
          //console.log(d)
          newCtx.context.session = "discord";
          newCtx.context.member = d.member;
          newCtx.context.author = d.author;
          newCtx.context.author_id = d.author.id;
          newCtx.context.api = api;
          newCtx.context.message = d;
          newCtx.context.id = d.id;
          newCtx.context.message_id = d.id;
          newCtx.context.channel_id = d.channel_id;

          newCtx.writeln = async function(text) {
              if(!this.context.output) this.context.output = [];
              this.context.output.push(this.format_text(this.strip_formatting(text)))
          }

          newCtx.write_panel = async function(title, text) {
              if(!this.context.output) this.context.output = [];
              this.context.output.push("```ini\n["+title+"]\n"+text+"\n```")
          }
          await newCtx.execute(cmd);

          if(newCtx.context.output && newCtx.context.output.length > 0) {
              await newCtx.context.api.reply(newCtx.context.message, newCtx.context.output.join("\n"))
              newCtx.context.output = [];
          }
          //newCtx = null;
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
