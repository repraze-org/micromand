const Validator = require("./validator");
const Command = require("./command");
const {baseValidators} = require("./base-validators");

const {arrayify} = require("./utils");

class Parser{
    constructor(){
        this.validators = {};
        this.commands = {};

        this.use(baseValidators);
    }
    use(obj){
        arrayify(obj).forEach(o=>{
            if(o instanceof Validator){
                this.validators[o.name] = o;
            }else if(o instanceof Command){
                this.commands[o.name] = o;
            }
        });
    }
    run(str, environment){
        const runtime = {
            parser: this,
            args:   {}
        };

        const tokens = Parser.tokenize(str);

        const commandName = tokens[0];

        if(commandName && this.commands[commandName]){
            const command = this.commands[commandName];
            try{
                if(command.match(tokens, runtime)){
                    return command.run(runtime, environment);
                }else{
                    return Promise.reject(new Error(command.usage()));
                }
            }catch(e){
                return Promise.reject(new Error(command.usage()));
            }
        }else{
            return Promise.reject(new Error("Command not found"));
        }
    }
    static tokenize(str){
        return str.match(/"([^"]*)"|\S+/g).map(token=>{
            if(token.startsWith('"') && token.endsWith('"')){
                return token.substring(1, token.length - 1);
            }
            return token;
        });
    }
}

module.exports = Parser;
