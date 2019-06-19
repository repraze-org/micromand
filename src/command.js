const Usage = require("./usage");

const {arrayify} = require("./utils");

class Command{
    constructor(name, settings, run){
        this.name = name;

        this.settings = Object.assign(
            {
                usage: undefined,
                run:   ()=>{
                    console.log(`No run found for ${this.name}`);
                },
                description: `No description provided for ${this.name}`
            },
            settings
        );

        this.settings.usage = arrayify(this.settings.usage).map(uStr=>new Usage(uStr));

        if(run && run instanceof Function){
            this.settings.run = run;
        }
    }
    usage(){
        return this.settings.description;
    }
    match(tokens, runtime){
        return this.settings.usage.some(u=>u.match(tokens.slice(), runtime));
    }
    async run(runtime, environment){
        await this.settings.run(runtime, environment);
    }
}

module.exports = Command;
