"use strict";
var lib = require('lib');
var prom = require("lib/lib/wrappers/promise.js");
var obj = require("lib/lib/wrappers/object.js");

var maybe = (require("lib/lib/functional/logical.js")).maybe;
var is = require("lib/lib/functional/predicates.js");
var functors = require("lib/lib/functional/functors.js");
var part = require("lib/lib/functional/partialApplication.js");
var curry = part["curry"];
var defer = part["defer"];

var Path = require("path");
var Dir = require("lib/lib/filesystem/Dir.js");
var Inode = require("lib/lib/filesystem/Inode.js");
var JSFile = require("lib/lib/filesystem/JavaScript")


var express = require("express");
var app = express();
var http = (require('http')).Server(app);
var io = require("socket.io")(http);
var child_process = require("child_process");
var browserify = require("browserify");


var print = console.log.bind(console);

io.on("connection",function(socket) {
    socket.on("/chat",function() {
        console.log("hi");
    })
})

var handleExec = curry(function handleExec(s, f, e, stdout, stderr) {
    print(stderr.toString());
    return maybe.binary(function() {
        return f(e.stack);
    }, function() {
        return s(stdout.toString());
    }, e);
})
function exec(c) {
    return prom.create(function(success, fail) {
        return child_process.exec(c, handleExec(success, fail));
    });
}

function Monad() {
    var args = [...arguments];
    return function unit(mf) {
        return function bind() {
            return mf.call(bind, ...args, ...arguments);
        }
    }
}
function DoMonad() {
    var fns = [...arguments];
    return function(bind) {
        return ((fns).map(bind)).reduce(function(scope, m) {
            m(scope);
            return scope;
        }, {
            io:io,
        });
    };
}

function defPrint() {
    return defer(print, [...arguments]);
}


function startHttpServer(dir, scope) {
    console.log("starting http server");
    app.use("/*",function(req,res) {

    });
    return http.listen(8080, defPrint("http server listening on port 8080"));
}
function watchInode(dir, scope) {
    return dir.watch();
}

var browserIndexJS = /static\/.*index\.js/;
var browserJSCheck = /static\/.*\.js/;
process.on("exit", function() {
    return (http).close();
});
var transpilers = obj.mask({
    browser:JSFile.get("./refactor/transpilers/browserify.js",
                       ["require","dir","scope"]),
    wisp:JSFile.get("./refactor/transpilers/wisp.js",
                    ["require","dir","scope"]),
    lispy:JSFile.get("./refactor/transpilers/lispy.js",
                     ["require","exec","dir","scope"])
});
var ioHandlers = obj.mask({
    chat:JSFile.get("./refactor/io/chat.js",
                    ["require","dir","scope"]),
    file:JSFile.get("./refactor/io/file.js",
                    ["require","dir","scope"]),
    user:JSFile.get("./refactor/io/user.js",
                    ["require","dir","scope"])
});
transpilers
    .map(trans => trans.compileClosedScope())
    .promiseAll()
    .then(t => {
        var steps = {
            transpilers:t,
        };
        return ioHandlers
            .map(trans => trans.compileClosedScope())
            .promiseAll()
            .then(h => {
                steps.ioHandlers = h;
                return steps;
            });

    })
    .then((steps => {
        console.log(steps.ioHandlers)
        return Inode
            .get("./static")
            .then(Monad)
            .then(DoMonad(
                curry(steps.ioHandlers.chat)(require),
                watchInode,
                curry(steps.transpilers.browser)(require),
                curry(steps.ioHandlers.file)(require),
                curry(steps.transpilers.lispy)(require,exec),//curry is the functional
                                                     //way of dependency injection :p
                curry(steps.transpilers.wisp)(require),
                curry(steps.ioHandlers.user)(require),
                startHttpServer
            ));
    }))
