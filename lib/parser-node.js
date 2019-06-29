const Validator = require("./validator");
const Command = require("./command");
const {arrayify} = require("./utils");

class ParserNode{
    constructor({validators = [], commands = [], parent} = {}){
        this.parent = parent;
        this.validators = new Map(validators.map(v=>[v.name, v]));
        this.commands = new Map(commands.map(v=>[v.name, v]));
    }
    setParent(parent){
        this.parent = parent;
    }
    removeParent(){
        this.parent = undefined;
    }
    getParent(){
        return this.parent;
    }
    hasParent(){
        return this.parent && this.parent instanceof ParserNode;
    }
    useValidator(validator){
        if(this.hasValidator(validator.name)){
            throw new Error(`Validator '${validator.name}' already defined`);
        }
        this.validators.set(validator.name, validator);
    }
    removeValidator(name){
        return this.validators.delete(name);
    }
    getValidator(name, traverse = false){
        let validator = this.validators.get(name);
        if(validator === undefined && traverse && this.hasParent()){
            validator = this.parent.getValidator(name, true);
        }
        return validator;
    }
    hasValidator(name, traverse = false){
        return this.validators.has(name) || (traverse && this.hasParent() && this.parent.hasValidator(name));
    }
    useCommand(command){
        if(this.hasCommand(command.name)){
            throw new Error(`Command '${command.name}' already defined`);
        }
        this.commands.set(command.name, command);
    }
    removeCommand(name){
        return this.commands.delete(name);
    }
    getCommand(name, traverse = false){
        let command = this.commands.get(name);
        if(command === undefined && traverse && this.hasParent()){
            command = this.parent.getCommand(name, true);
        }
        return command;
    }
    hasCommand(name, traverse = false){
        return this.commands.has(name) || (traverse && this.hasParent() && this.parent.hasCommand(name));
    }
    use(obj){
        arrayify(obj).forEach(o=>{
            if(o instanceof Validator){
                this.useValidator(o);
            }else if(o instanceof Command){
                this.useCommand(o);
            }
        });
    }
}

module.exports = ParserNode;
