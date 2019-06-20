// test foo [name] [type:name] [type:name+]
// test foo name1 typedname2 name3 peiswjfgiwj
class Usage{
    constructor(str){
        this.syntax = str.split(/\s+/g).map(def=>{
            if(def.startsWith("[")){
                let [, type, name, multy] = def.match(/\[(?:([^:+]*):)?([^+]*)(\+)?\]/);
                let valArgs;
                if(type){
                    [, type, valArgs] = type.match(/([^(]+)(?:\(([^)]*)\))?/);
                    if(valArgs){
                        valArgs = valArgs.split(",");
                    }else{
                        valArgs = [];
                    }
                }
                // console.log(type,name,multy);
                return {
                    multy: !!multy,
                    match: (token, runtime, args)=>{
                        if(type){
                            const validator = runtime.parser.getValidator(type, true);
                            if(validator){
                                try{
                                    const parsedToken = validator.validate(token, ...valArgs);
                                    args[name] = parsedToken;
                                    return true;
                                }catch(ve){
                                    return false;
                                }
                            }else{
                                console.log("Validator not found");
                                return false;
                            }
                        }else{
                            args[name] = token;
                            return true;
                        }
                    }
                };
            }
            return {
                multy: false,
                match: token=>token === def
            };
        });
    }
    // tokens can be left
    match(tokens, runtime){
        if(tokens.length < this.syntax.length){
            return false;
        }

        return this.syntax.every(s=>{
            if(s.multy){
                return s.match(tokens.join(" "), runtime, runtime.args);
            }else{
                return s.match(tokens.shift(), runtime, runtime.args);
            }
        });
    }
}

module.exports = Usage;
