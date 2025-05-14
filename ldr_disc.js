import { AshContext } from './ash';
import { createBot } from '@discordeno/bot'
let ashClient = new AshContext();
await ashClient.load_config()
//console.log(ashClient)


const bot = createBot({
  token: ashClient.get_config("discord.token"),
  events: {
    ready: ({ shardId }) => console.log(`Shard ${shardId} ready`),
    messageCreate: (message) => {
        console.log(message)
    }
  },
})

await bot.start()
