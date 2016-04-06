var part = require("lib/lib/functional/partialApplication.js");
var defer = part["defer"];

var Path = require("path");

var print = console.log.bind(console);

function compile(path) {
    var replacement = Path.basename(path,".wisp");
    replacement = Path.dirname(path) + "/"+ replacement + ".js";

    if ((Path.extname(path) === ".wisp")) {
        print("wisp file changed", path);
        print("wisp replacement file",replacement)
        exec("cat "+ path+ " | wisp > "+ replacement)
            .then(defer(console.log, ["successful compile"]))
            .catch(defer(console.log, ["compile fail"]));
    }
}
dir.on("change", compile);
