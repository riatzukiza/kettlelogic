var browserIndexJS = /static\/.*index\.js/;
var browserJSCheck = /static\/.*\.js/;
var browserify = require("browserify");
var Path = require("path");
var print = console.log.bind(console);
var fs = require("fs");
function changeCallback(path) {
    console.log(path, "changed");
    console.log("is index file?", browserIndexJS.test(path));
    console.log("is browser JS file?", browserJSCheck.test(path));

    if (!browserIndexJS.test(path) && browserJSCheck.test(path)) {

        console.log("index file to save", Path.join(Path.dirname(path), "..", "/index.js"));

        browserify()
            .transform("babelify", {
                presets: ["es2015", "react"]
            })
            .add(path)
            .bundle()
            .on("error", function(err) {
                console.log("There was an error when compileing", path);
                print(err.stack);
            })
            .pipe(fs.createWriteStream(Path.join(Path.dirname(path), "..", "/index.js")));

    }
}
dir.on("change", changeCallback);

