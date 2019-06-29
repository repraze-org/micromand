const chai = require("chai");
const expect = chai.expect;
const {Parser, Command, Validator} = require("../");

// Tester

describe("micromand", function(){
    describe("simple run", function(){
        it("should run in sync", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping"
                    },
                    function(){
                        done();
                    }
                )
            );

            p.run("ping");
        });

        it("should run async", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping"
                    },
                    function(){
                        return new Promise((res, rej)=>{
                            setTimeout(function(){
                                res();
                            }, 50);
                        });
                    }
                )
            );

            p.run("ping").then(done);
        });

        it("should run sync with async bindings", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping"
                    },
                    function(){
                        // Nothing
                    }
                )
            );

            p.run("ping").then(done);
        });
    });

    describe("simple arguments", function(){
        it("should handle one string arg", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [test]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("hello");

                        done();
                    }
                )
            );

            p.run("ping hello");
        });

        it("should not handle multy without plus", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [test]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("hello");

                        done();
                    }
                )
            );

            p.run("ping hello world");
        });

        it("should handle multy with plus", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [test+]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("hello world");

                        done();
                    }
                )
            );

            p.run("ping hello world");
        });

        it("should handle quotes", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [test]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("hello world");

                        done();
                    }
                )
            );

            p.run('ping "hello world"');
        });
    });

    describe("multiple", function(){
        it("should handle multiple usage and run only once", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: ["ping a", "ping b", "ping c"]
                    },
                    function(runtime){
                        done();
                    }
                )
            );

            p.run("ping b");
        });
    });

    describe("typed arguments custom", function(){
        it("should handle passing validation", function(done){
            const p = new Parser();

            p.use(
                new Validator("yes", function(str){
                    return str;
                })
            );

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [yes:test]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("foo");
                    }
                )
            );

            p.run("ping foo").then(done);
        });

        it("should handle validation rejects", function(done){
            const p = new Parser();

            p.use(
                new Validator("no", function(str){
                    throw new Error("Invalid arg");
                })
            );

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [no:test]"
                    },
                    function(runtime){
                        // Nothing
                    }
                )
            );

            p.run("ping foo").catch(e=>{
                //expect(e.message).to.equal('Invalid arg');

                done();
            });
        });

        it("should handle validation reject then passing", function(done){
            const p = new Parser();

            p.use([
                new Validator("no", function(str){
                    throw new Error("Invalid arg");
                }),
                new Validator("yes", function(str){
                    return str;
                })
            ]);

            p.use(
                new Command(
                    "ping",
                    {
                        usage: ["ping [no:test]", "ping [yes:test]"]
                    },
                    function(runtime){
                        // Nothing
                    }
                )
            );

            p.run("ping foo").then(done);
        });
    });

    describe("typed arguments built in", function(){
        it("should handle base choice type", async function(){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [choice(yes,no):test]"
                    },
                    function(runtime){
                        expect(["yes", "no"]).to.include(runtime.args.test);
                    }
                )
            );

            await p.run("ping yes");
            await p.run("ping no");
            try{
                await p.run("ping other");
                throw Error("Error should have been thrown");
            }catch(e){
                expect(e).to.a("error");
            }
        });

        it("should handle base string type", async function(){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [string:test]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("randomString");
                    }
                )
            );

            await p.run("ping randomString");
        });

        it("should handle base boolean type", async function(){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [boolean:test]"
                    },
                    function(runtime){
                        expect([true, false]).to.include(runtime.args.test);
                    }
                )
            );

            await p.run("ping true");
            await p.run("ping false");
            await p.run("ping 1");
            await p.run("ping 0");
            try{
                await p.run("ping maybe");
                throw Error("Error should have been thrown");
            }catch(e){
                expect(e).to.a("error");
            }
        });

        it("should handle base number type", async function(){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [number:test]"
                    },
                    function(runtime){
                        expect([1.23, 45.6, 0.7, 0, -8.9]).to.include(runtime.args.test);
                    }
                )
            );

            await p.run("ping 1.23");
            await p.run("ping 45.6");
            await p.run("ping .7");
            await p.run("ping 0");
            await p.run("ping -0");
            await p.run("ping -8.9");
            try{
                await p.run("ping zero");
                throw Error("Error should have been thrown");
            }catch(e){
                expect(e).to.a("error");
            }
        });

        it("should handle base integer type", async function(){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [integer:test]"
                    },
                    function(runtime){
                        expect([
                            1,
                            -99999,
                            0,
                            987987987987,
                            Number.MAX_SAFE_INTEGER,
                            Number.MIN_SAFE_INTEGER
                        ]).to.include(runtime.args.test);
                    }
                )
            );

            await p.run("ping 1");
            await p.run("ping -99999");
            await p.run("ping 0");
            await p.run("ping " + Number.MAX_SAFE_INTEGER);
            await p.run("ping " + Number.MIN_SAFE_INTEGER);
            try{
                await p.run("ping 1.2");
                throw Error("Error should have been thrown");
            }catch(e){
                expect(e).to.a("error");
            }
        });
    });

    describe("routing with choice", function(){
        // shop buy item
        // shop look item

        // shop [route:action] [item]

        // shop [route(buy):action] [item]
        // shop buy:action [item]

        // shop [route:buy] [item]
        // shop [route:look] [item]

        // shop [route:look] [item]

        // ???

        it("should handle argument", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [choice(foo):test]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("foo");
                    }
                )
            );

            p.run("ping foo").then(done);
        });

        it("should handle arguments", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: "ping [choice(foo,bar):test]"
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("foo");
                    }
                )
            );

            p.run("ping foo").then(done);
        });

        it("should handle argument multi usage", function(done){
            const p = new Parser();

            p.use(
                new Command(
                    "ping",
                    {
                        usage: ["ping [choice(foo):test]", "ping [choice(bar):test]"]
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("bar");
                    }
                )
            );

            p.run("ping bar").then(done);
        });

        it("should handle argument multi usage", function(done){
            const p = new Parser();
            // TODO multiple level of choice
            p.use(
                new Command(
                    "ping",
                    {
                        usage: ["ping [choice(foo):test]", "ping [choice(bar):test]"]
                    },
                    function(runtime){
                        expect(runtime.args.test).to.equal("bar");
                    }
                )
            );

            p.run("ping bar").then(done);
        });
    });
});

// const p = new Parser();
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
