// Tester

const {Parser, Command, Validator} = require('./index');

let p = new Parser();

p.use(new Command('ping', {
    usage : "ping"
}, function(runtime){
    console.log("pong "+runtime.stuff);
}));

p.use(new Command('test', {
    usage : "test [bool:stuff]",
    description : "use this command with stuff"
}, function(runtime){
    console.log("testing "+runtime.args.stuff);
}));

p.use(new Validator('string', function(str){
    return str;
}));

p.use(new Validator('bool', function(str){
    if(str === "true"){
        return true;
    }
    if(str === "false"){
        return false;
    }
    throw new Error("Invalid Bool given");
}));

p.run("ping", {stuff:"hello"});

p.run("test \"cool cool2\"", {stuff:"hello"});
//p.run("test", {stuff:"hello"});
