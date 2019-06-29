class Validator{
    constructor(name, validator){
        this.name = name;
        this.validator = validator;
    }
    validate(token, ...args){
        return this.validator(token, ...args);
    }
}

module.exports = Validator;
