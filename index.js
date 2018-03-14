let arrayify = function(obj){
    if(!Array.isArray(obj)){
        if(obj === undefined){
            return [];
        }
        return [obj];
    }
    return obj;
};

class Parser{
    constructor(){
        this.validators = {};
        this.commands = {};
    }
    use(obj){
        arrayify(obj).forEach(o=>{
            if(obj instanceof Validator){
                this.validators[obj.name] = obj;
            } else if(obj instanceof Command){
                this.commands[obj.name] = obj;
            }
        });
    }
    run(str, runtime){
        runtime = Object.assign({
            parser : this,
            args : {}
        }, runtime);

        let tockens = Parser.tokenize(str);

        let commandName = tockens[0];

        if(commandName && this.commands[commandName]){
            let command = this.commands[commandName];
            try{
                if(command.match(tockens, runtime)){
                    return command.run(runtime);
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
        return str
            .match(/"([^"]*)"|\S+/g)
            .map(tocken=>{
                if(tocken.startsWith('"') && tocken.endsWith('"')){
                    return tocken.substring(1, tocken.length-1);
                }
                return tocken;
            });
    }
}

class Command{
    constructor(name, settings, run){
        this.name = name;

        this.settings = Object.assign({
            usage       : undefined,
            run         : ()=>{console.log(`No run found for ${this.name}`);},
            description : `No description provided for ${this.name}`,
        }, settings);

        this.settings.usage = arrayify(this.settings.usage)
            .map(uStr=>new Usage(uStr));

        if(run && run instanceof Function){
            this.settings.run = run;
        }
    }
    usage(){
        return this.settings.description;
    }
    match(tockens, runtime){
        for(let i = 0; i < this.settings.usage.length; ++i){
            if(this.settings.usage[i].match(tockens.slice(), runtime)){
                return true;
            }
        }
        return false;
    }
    async run(runtime){
        await this.settings.run(runtime);
    }
}

// test foo [name] [type:name] [type:name+]
// test foo name1 typedname2 name3 peiswjfgiwj
class Usage{
    constructor(str){
        this.syntax = str
            .split(/\s+/g)
            .map(def=>{
                if(def.startsWith("[")){
                    let [,type,name,multy] = def.match(/\[(?:([^:\+]*):)?([^\+]*)(\+)?\]/);
                    let valArgs;
                    if(type){
                        [,type,valArgs] = type.match(/([^(]+)(?:\(([^)]*)\))?/);
                        if(valArgs){
                            valArgs = valArgs.split(',');
                        }else{
                            valArgs = [];
                        }
                    }
                    // console.log(type,name,multy);
                    return {
                        multy : !!multy,
                        match : (tocken, runtime, args)=>{
                            if(type){
                                let validator = runtime.parser.validators[type];
                                if(validator){
                                    let parsedTocken = validator.validate(tocken, ...valArgs);
                                    args[name] = parsedTocken;
                                    return true;
                                }else{
                                    console.log("Validator not found");
                                    return false;
                                }
                            }else{
                                args[name] = tocken;
                                return true;
                            }
                            return false;
                        }
                    };
                }
                return {
                    multy : false,
                    match : (tocken)=>{
                        return tocken === def;
                    }
                }
            });

    }
    // tockens can be left
    match(tockens, runtime){
        if(tockens.length < this.syntax.length){
            return false;
        }

        return this.syntax
            .every(s=>{
                if(s.multy){
                    return s.match(tockens.join(' '), runtime, runtime.args);
                }else{
                    return s.match(tockens.shift(), runtime, runtime.args);
                }
            });
    }
}

class Validator{
    constructor(name, validator){
        this.name = name;
        this.validator = validator;
    }
    validate(tocken, ...args){
        return this.validator(tocken, ...args);
    }
}

module.exports = {
    Parser,
    Command,
    Validator
};
