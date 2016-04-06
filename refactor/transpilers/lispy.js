var part = require("lib/lib/functional/partialApplication.js");
var defer = part["defer"];

var browserify = require("browserify");
var Path = require("path");
var fs = require("fs");

var print = console.log.bind(console);

var browserIndexJS = /static\/.*index\.js/;
var browserJSCheck = /static\/.*\.js/;
function compile(path) {
    var replacement = Path.basename(path,".ls");
    replacement = Path.dirname(path) + "/"+ replacement + ".js";

    if ((Path.extname(path) === ".ls")) {
        print("lispy file changed", path);
        print("lispy replacement file",replacement)
        exec("lispy " + path)
            .then(defer(console.log, ["successful compile"]))
            .catch(defer(console.log, ["compile fail"]));
    }
}
dir.on("change", compile);
