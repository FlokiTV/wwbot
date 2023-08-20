const wCommands = require("./commander.js")
const fs = require('fs');
const path = require('path');

const directoryPath = "./src/"
const commandsArray = []

const files = fs.readdirSync(directoryPath);

files.forEach(function (file) {
    if (path.extname(file).toLowerCase() === '.js') {
        let name = file.split(".");
        delete name[name.length - 1]
        name = name.filter(e => e)
        name = name.join(".")
        commandsArray.push(name)
    }
});

const c = new wCommands()
for (let index = 0; index < commandsArray.length; index++) {
    const cmdName = commandsArray[index];
    let cmd = require(process.cwd() + "/src/" + cmdName + ".js")
    c.command(cmdName, cmd)
}

fs.writeFileSync("commands.json", JSON.stringify(c.get(), null, 4), {
    encoding: "utf-8"
})