const fs = require("fs")
const { Client } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require("axios").default

const wpp = new Client({
    puppeteer: {
        args: ['--no-sandbox'],
        userDataDir: "./cache"
    }
});

wpp.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

wpp.on('ready', () => {
    console.log('Client is ready!');
});

class wClient {
    constructor(id) {
        this.id = id
        this.state = "default"
    }
    setState(state) {
        this.state = state
    }
}

class wBot {
    #wpp;
    constructor(wpp) {
        this.#wpp = wpp
    }
    async triggerCommand(client, command, _args) {
        console.log("triggerCommand", command, _args.join(' '))
        let args = {
            id: client.id
        }
        let http = {}
        if ('args' in command) {
            let index = 0
            for (const argName in command.args) {
                // console.log("argName", argName)
                // console.log("type", command.args[argName])
                args[argName] = _args[index]
                index++
            }
        }
        if ('http' in command) {
            for (const request of command.http) {
                let cfg = request.opts
                // cfg.url = this.parseURL(args, cfg.url)
                cfg = this.parseBody(args, http, JSON.stringify(cfg))
                cfg = JSON.parse(cfg)
                console.log(cfg)
                try {
                    const { data } = await axios(cfg)
                    console.log(data)
                    http[request.store] = { ...data }
                } catch (error) {
                    console.log(error.response.data)
                    http[request.store] = { ...error.response.data }
                }
            }
        }
        let msgs = command.body
        if (typeof command.body === "string") msgs = [command.body]
        for (let id = 0; id < msgs.length; id++) {
            const msg = msgs[id];
            this.#wpp.sendMessage(client.id, this.parseBody(args, http, msg));
        }
        client.setState(command.id)
    }
    parseURL(args, url) {
        // console.log(args)
        let u = url
        for (const arg in args) {
            const element = args[arg];
            u = u.replaceAll("{args." + arg + "}", element)
        }
        return u
    }
    parseBody(args, http, body) {
        let b = body
        for (const arg in args) {
            const element = args[arg];
            b = b.replaceAll("{args." + arg + "}", element)
        }
        for (const storeName in http) {
            const store = http[storeName]
            for (const arg in store) {
                const element = store[arg];
                b = b.replaceAll("{" + storeName + "." + arg + "}", element)
            }
        }
        return b
    }
    parseCommand(text = "/teste", prefix = "/") {
        if (prefix && text[0] != prefix) return []
        if (prefix) text = text.substring(1)
        let args = text.split(" ")
        return args
    }
}

const clients = {}
const $bot = new wBot(wpp);

wpp.on('message', async message => {
    const commands = JSON.parse(fs.readFileSync("./commands.json", { encoding: "utf-8" }))
    const { from, body } = message
    const [cmd, ...args] = $bot.parseCommand(body)
    // console.log("command", cmd)
    // console.log("args", args)
    // from.includes("@c.us")
    /*
        add new client
    */
    if (!(from in clients) && cmd) {
        console.log("new client", from)
        clients[from] = new wClient(from)
    }
    /**
     * @type {wClient}
     */
    const client = clients[from]
    // TODO: this only works for commands with prefix
    if (cmd) {
        // check command
        if (cmd in commands) {
            await $bot.triggerCommand(client, commands[cmd], args)
        } else {
            await $bot.triggerCommand(client, commands.default, args)
        }
    } else {
        if (from in clients) {
            const { state } = client
            console.log("client state", state)
            if (!commands[state].callbacks) {
                console.log("callbacks not found")
            } else if (body in commands[state].callbacks) {
                let cb = commands[state].callbacks[body]
                const [_cmd, ..._args] = $bot.parseCommand(cb, false)
                if (_cmd in commands)
                    await $bot.triggerCommand(client, commands[_cmd], _args)
                else console.log(cb + " not found")
            } else {
                console.log("message not triggered, searching wildcard _*_ callback")
                if (commands[state].callbacks["_*_"]) {
                    let _cmd = commands[state].callbacks["_*_"]
                    await $bot.triggerCommand(client, commands[_cmd], $bot.parseCommand(body, false))
                } else {
                    console.log(state + " _*_ not found")
                }
            }
        } else {
            console.log("message not triggered, client not found")
        }
    }
});


wpp.initialize();
