var Path = require("path");
var logi = require("lib/lib/functional/logical");
var part = require("lib/lib/functional/partialApplication");
import {
    Component
} from "../app/ui/component.js";
import {
    MenuBar
} from "../app/ui/menu/bar.js";
import {
    DropDown
} from "../app/ui/menu/dropdown.js";
import {
    MenuItem
} from "../app/ui/menu/item.js";
import {
    ControlIcon
} from "../app/ui/icon/icon.js";
import {
    Panels
} from "../app/ui/panel/panels.js";
import {
    mouse
} from "../app/lib/mouse.js";
function getDocumentHeight() {
    return Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    );
}
function getDocumentWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.clientWidth,
        document.documentElement.scrollWidth,
        document.documentElement.offsetWidth
    );
}
function getApp(name,fn) {
    socket.emit("readFile",Path.join("apps",name,"index.html"),
                function(err,f) {
                    if(err)fn(err);
                    f = `<script src='${Path.join("/apps",name,"index.js")}'></script>`+f;
                    fn(null,f);
                });
}
window.onload = function() {
    var apps = new Set();
    var socket = io.connect("/files");
    var panel =  Component.create(Panels)({
        x: 0,
        y: 0,
        margin: 16,
        width: getDocumentWidth(),
        height: getDocumentHeight(),
        snap:8
    });
    function insertAppV(p,text) {
        var split = p.splitv();
        apps.add(split);
        split.innerHTML = text;
        return split;
    }
    function insertAppV(p,text) {
        var split = p.split();
        apps.add(split);
        split.innerHTML = text;
        return split;
    }
    document.body.appendChild(panel);
    var d = window.mainPanel =panel.defaultpanel();
    getApp("login",function(err,app) {
        if(err)throw err;
        $(d).append($(app));
    });
}
