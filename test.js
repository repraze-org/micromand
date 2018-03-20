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

        it('should handle validation reject then passing', function(done){
            let p = new Parser();

            p.use([
                new Validator('no', function(str){
                    throw new Error('Invalid arg');
                }),
                new Validator('yes', function(str){
                    return str;
                })
            ]);


            p.use(new Command('ping', {
                usage : [
                    "ping [no:test]",
                    "ping [yes:test]"
                ]
            }, function(runtime){
                // Nothing
            }));

            p.run("ping foo").then(done);
        });
    });

    describe('routing', function(){
        // shop buy item
        // shop look item

        // shop [route:action] [item]

        // shop [route(buy):action] [item]
        // shop buy:action [item]

        // shop [route:buy] [item]
        // shop [route:look] [item]

        // shop [route:look] [item]

        // ???


        it('should handle argument', function(done){
            let p = new Parser();

            p.use(new Validator('route', function(str, target){
                if(str != target){
                    throw new Error('Invalid routing');
                }
                return str;
            }));

            p.use(new Command('ping', {
                usage : "ping [route(foo):test]"
            }, function(runtime){
                expect(runtime.args.test).to.equal("foo");
            }));

            p.run("ping foo").then(done);
        });

        it('should handle arguments', function(done){
            let p = new Parser();

            p.use(new Validator('route', function(str, foo, bar){
                if(foo != "foo" || bar != "bar"){
                    throw new Error('Invalid routing');
                }
                return str;
            }));

            p.use(new Command('ping', {
                usage : "ping [route(foo,bar):test]"
            }, function(runtime){
                expect(runtime.args.test).to.equal("foo");
            }));

            p.run("ping foo").then(done);
        });

        it('should handle argument multi usage', function(done){
            let p = new Parser();

            p.use(new Validator('route', function(str, target){
                if(str != target){
                    throw new Error('Invalid routing');
                }
                return str;
            }));

            p.use(new Command('ping', {
                usage : [
                    "ping [route(foo):test]",
                    "ping [route(bar):test]"
                ]
            }, function(runtime){
                expect(runtime.args.test).to.equal("bar");
            }));

            p.run("ping bar").then(done);
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
