import { AshContext } from './ash';
import { createBot } from '@discordeno/bot'
let ashClient = new AshContext();
await ashClient.load_config()

const token = ashClient.get_config("discord.token"),

// Discord Gateway URL
const gatewayURL = "wss://gateway.discord.gg/?v=10&encoding=json";

const ws = new WebSocket(gatewayURL);

ws.onopen = () => {
  console.log("Connected to Discord Gateway!");

  // Identify with your bot token
  const identifyPayload = {
    op: 2, // Identify opcode
    d: {
      token: token,
      properties: {
        $os: "linux",
        $browser: "bun",
        $device: "bun",
      },
      intents: 513, // Adjust intents as needed (e.g., Guilds + GuildMessages)
    },
  };

  ws.send(JSON.stringify(identifyPayload));
};

let api = {
  "send_message": function(channel_id, text) {
      fetch(`https://discord.com/api/v10/channels/${channel_id}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bot ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({content: text})
      })
      .then(response => {
        if (!response.ok) console.error("Error sending message:", response.status, response.statusText);
      })
      .catch(error => console.error("Error sending message:", error));
  }

}
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  const { op, d, t } = data;

  switch (op) {
    case 10: // Hello
      const heartbeatInterval = d.heartbeat_interval;
      console.log(`Heartbeat interval: ${heartbeatInterval}`);

      // Start Heartbeat
      setInterval(() => {
        ws.send(JSON.stringify({ op: 1, d: null })); // Heartbeat opcode
      }, heartbeatInterval);
      break;

    case 0: // Dispatch (Events)
      if (t === "READY") {
        console.log("Bot is ready!");
      } else if (t === "MESSAGE_CREATE") {
        console.log(`Received message: ${d.content} from ${d.author.username}`);
        //Example of sending a message back (requires fetch)



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
