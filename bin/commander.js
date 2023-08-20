class wCommand {
    id;
    body;
    callbacks;
    http;
    args;
    constructor(id, body = null) {
        this.id = id
        this.body = body
        this.http = []
        this.callbacks = {}
    }
    arguments(obj) {
        this.args = obj
    }
    callback(body, trigger) {
        this.callbacks[body] = trigger
    }
    request(store, opts) {
        this.http.push({
            store, opts
        })
    }
    wildcard(trigger) {
        this.callback("_*_", trigger)
    }
}
class wCommands {
    constructor() {
        this.cmd = {}
    }
    /**
     * Callback for executing command.
     * @callback executeCommandCallback
     * @param {wCommand} command - The command object.
     */
    /**
     * Register a new command and its callback.
     * @param {string} match - The match identifier for command.
     * @param {executeCommandCallback} cb - The callback to execute the command.
     * @returns {object} - Returns the current instance for chaining.
     */
    command(match, cb) {
        this.cmd[match] = new wCommand(match)
        cb(this.cmd[match])
        return this
    }
    get() {
        return this.cmd
    }
}

module.exports = wCommands