var Files = require ("./files.js");
var Path = require ("path")
var apps = new Set()
function getApp (name,cb) {
    function handleResponse(err,file) {
        if(err)return cb(err);
        cb(null,`<script src='${Path.join("/apps",name,"index.js")}'></script>`+file);
    }
    Files.readFile (Path.join("apps",name,"index.html"),handleResponse);
};
function insertv(panel, name, cb) {
    function insertAppPanel (text) {
        var split = panel.splitv();
        apps.add(split);
        split.innerHTML = text;
        cb(split);
    }
    getApp(name,insertAppPanel);
}
function change (panel,name,cb) {
    function changeAppPanel(err,text) {
        $(panel).html($(text));
        cb(panel);
    }
    getApp(name,changeAppPanel);
}
module.exports = {
    get:getApp,
    insertv:insertv,
    change:change
}
