const chai            = require('chai'),
      expect          = chai.expect,
      {Parser, Command, Validator} = require('./index');

// Tester

describe('micromand', function(){
    describe('simple run', function(){
        it('should run in sync', function(done){
            let p = new Parser();

            p.use(new Command('ping', {
                usage : "ping"
            }, function(){
                done();
            }));

            p.run("ping");
        });

        it('should run async', function(done){
            let p = new Parser();

            p.use(new Command('ping', {
                usage : "ping"
            }, function(){
                return new Promise((res, rej)=>{
                    setTimeout(function () {
                        res();
                    }, 50);
                });
            }));

            p.run("ping").then(done);
        });

        it('should run sync with async bindings', function(done){
            let p = new Parser();

            p.use(new Command('ping', {
                usage : "ping"
            }, function(){
                // Nothing
            }));

            p.run("ping").then(done);
        });
    });

    describe('simple arguments', function(){
        it('should handle one string arg', function(done){
            let p = new Parser();

            p.use(new Command('ping', {
                usage : "ping [test]"
            }, function(runtime){
                expect(runtime.args.test).to.equal("hello");

                done();
            }));

            p.run("ping hello");
        });

        it('should not handle multy without plus', function(done){
            let p = new Parser();

            p.use(new Command('ping', {
                usage : "ping [test]"
            }, function(runtime){
                expect(runtime.args.test).to.equal("hello");

                done();
            }));

            p.run("ping hello world");
        });

        it('should handle multy with plus', function(done){
            let p = new Parser();

            p.use(new Command('ping', {
                usage : "ping [test+]"
            }, function(runtime){
                expect(runtime.args.test).to.equal("hello world");

                done();
            }));

            p.run("ping hello world");
        });

        it('should handle quotes', function(done){
            let p = new Parser();

            p.use(new Command('ping', {
                usage : "ping [test]"
            }, function(runtime){
                expect(runtime.args.test).to.equal("hello world");

                done();
            }));

            p.run("ping \"hello world\"");
        });
    });

    describe('typed arguments', function(){
        it('should handle passing validation', function(done){
            let p = new Parser();

            p.use(new Validator('yes', function(str){
                return str;
            }));

            p.use(new Command('ping', {
                usage : "ping [yes:test]"
            }, function(runtime){
                expect(runtime.args.test).to.equal("foo");
            }));

            p.run("ping foo").then(done);
        });

        it('should handle validation rejects', function(done){
            let p = new Parser();

            p.use(new Validator('no', function(str){
                throw new Error('Invalid arg');
            }));

            p.use(new Command('ping', {
                usage : "ping [no:test]"
            }, function(runtime){
                // Nothing
            }));

            p.run("ping foo").catch(e=>{
                //expect(e.message).to.equal('Invalid arg');

                done();
            });
        });
    });
});

// let p = new Parser();
//
// p.use(new Command('ping', {
//     usage : "ping"
// }, function(runtime){
//     console.log("pong "+runtime.stuff);
// }));
//
// p.use(new Command('test', {
//     usage : "test [bool:stuff]",
//     description : "use this command with stuff"
// }, function(runtime){
//     console.log("testing "+runtime.args.stuff);
// }));
//
// p.use(new Validator('string', function(str){
//     return str;
// }));
//
// p.use(new Validator('bool', function(str){
//     if(str === "true"){
//         return true;
//     }
//     if(str === "false"){
//         return false;
//     }
//     throw new Error("Invalid Bool given");
// }));
//
// p.run("ping", {stuff:"hello"});
//
// p.run("test \"cool cool2\"", {stuff:"hello"});
//p.run("test", {stuff:"hello"});
