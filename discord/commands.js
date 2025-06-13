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
        let api = a.context.api;
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
        let api = a.context.api;
        let packageConf = await a.get_package_config()
        let deps = [];

        for(const packageName of Object.keys(packageConf.dependencies)){
            deps.push(`${packageName} = "${packageConf.dependencies[packageName]}"`)
        }
        await api.reply(a.context.message, `\`\`\`toml\n[core]\nversion = "${a.version}"\n\n[core.dependencies]\n${deps.join("\n")}\n\n[interface.discord]\nversion = "${a.context.interface_version}"\napi = "${a.context.api_base}"\ngateway = "${a.context.gateway}"\n\n[javascript]\nruntime = "bun ${Bun.version}"\n\`\`\``)
    },
    "testthread": async function(a, line) {
        await a.writeln("Creating new thread")
        await a.context.createThread("test", function() { console.log("test") }, 1000)
    },
    "threads": async function(a, line) {
        let api = a.context.api;
        if(Object.keys(a.context.threads).length == 0) {
            return await api.reply(a.context.message, "No threads running.")
        }
        let text = [];
        for(let thread of Object.keys(a.context.threads)) {
            text.push(`${thread}: ${a.context.threads[thread].delay}`)
        }
        await api.reply(a.context.message, text.join(" "))
    },
    "stop": async function(a, line) {
        await a.writeln("Stopping thread")
        await a.context.stopThread(line)
    },
    "quit": async function(a, line) {
        let api = a.context.api;
        if(a.author.id != a.context.owner_id) return await api.reply(a.context.message, "Command rejected: developer access required")
        await api.reply(a.context.message, "Closing connection: 3001 Administrator shutdown.")
        await Bun.sleep(1000)
        ws.close(3001, "Administrator shutdown.");
        await Bun.sleep(1000)
        process.exit()
    }
}

export { commands as Commands };
