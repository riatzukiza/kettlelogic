var Inode = require("lib/lib/filesystem");
var Dir = require("lib/lib/filesystem/Dir.js");
var part = require("lib/lib/functional/partialApplication.js");
var defer = part["defer"];
var print = console.log.bind(console);
function promToNode(p,fn) {
    p
        .then((v) => fn(null,v))
        .catch((err) => fn({
            message:err.message,
            stack:err.stack
        }));
}
var io = scope.io;
function saveJSON(path, obj, fn) {
    dir.setChildFile(path,JSON.stringify(obj))
        .then(fn);
}

function loadJSON(path, fn) {
    promToNode(dir.getChildFile(path)
                .then((d) => {
                    return d.getContent("utf8");
                })
                .then(JSON.parse),fn);

}
function listDir(path, fn) {
    promToNode(Dir.list(path),fn);
}
function readFile (path,fn) {
    promToNode(dir.getChildFile(path)
                .then((d) => {
                    return d.getContent("utf8");
                }),fn);
}
function writeFile(path,data,fn) {
    promToNode(dir.setChildFile(path,data),fn)
}
scope.sessions = {};
var fileIo = scope.fileIo = io.of("/files");
fileIo
    .on("connection", function(socket) {
        print("user connected to filesystem");
        var emit = socket.emit.bind(socket);
        scope.sessions[socket.id] = socket;
        socket
            .on("readFile",readFile)
            .on("listDir", listDir)
            .on("saveJSON", saveJSON)
            .on("loadJSON", loadJSON);
        socket.once("disconnect",
                    defer(print,
                            ["user disconnected"]));
        return dir.on("*", function(name) {
            socket.emit(...arguments);
        });
    });
