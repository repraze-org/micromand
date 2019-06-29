const ParserNode = require("./parser-node");
const {baseValidators} = require("./base-validators");

const baseParser = new ParserNode({
    validators: baseValidators
});

class Parser extends ParserNode{
    constructor(settings){
        super(Object.assign({parent: baseParser}, settings));
    }
    run(str, environment){
        const runtime = {
            parser: this,
            args:   {}
        };

        const tokens = Parser.tokenize(str);

        const commandName = tokens[0];

        if(commandName && this.hasCommand(commandName, true)){
            const command = this.getCommand(commandName);
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
        return str.match(/(["'])(?:\\\1|(?!\1).)*\1|[^\s]+/g).map(token=>{
            // trim end of string if necessary
            if((token.startsWith('"') && token.endsWith('"')) || (token.startsWith("'") && token.endsWith("'"))){
                token = token.substring(1, token.length - 1);
            }
            // removes escaping
            return token.replace(/\\.?/g, w=>w.substring(1));
        });
    }
}

module.exports = Parser;
