const Validator = require("./validator");

// utils

const choiceValidator = new Validator("choice", function(str, ...values){
    if(values.includes(str)){
        return str;
    }
    throw new Error("Invalid Choice Value given");
});

// types

const stringValidator = new Validator("string", function(str){
    return str;
});

const booleanValidator = new Validator("boolean", function(str){
    if(str === "true" || str === "1" || str === "yes" || str === "y"){
        return true;
    }
    if(str === "false" || str === "0" || str === "no" || str === "n"){
        return false;
    }
    throw new Error("Invalid Bool given");
});

const numberValidator = new Validator("number", function(str){
    if(!isNaN(parseFloat(str)) && isFinite(str)){
        return parseFloat(str);
    }
    throw new Error("Invalid Number given");
});

const integerValidator = new Validator("integer", function(str){
    const int = parseInt(str, 10);
    if(!isNaN(int) && str == int && str.toString() == int.toString()){
        return int;
    }
    throw new Error("Invalid Integer given");
});

const baseValidators = [choiceValidator, stringValidator, booleanValidator, numberValidator, integerValidator];

module.exports = {
    choiceValidator,

    stringValidator,
    booleanValidator,
    numberValidator,
    integerValidator,

    baseValidators
};
