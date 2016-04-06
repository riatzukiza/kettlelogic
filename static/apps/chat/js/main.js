"use strict";
var socket = io.connect("/chat");
var username;
let bind = (o, m) => (...args) => (m.call(o, ...args));
function pushMessage(u,d,t) {
    console.log("message recieved");
    $("#messages").append("<div>"+t+":("+u+") "+d+"</div>")
}
function login(u) {
    socket.emit("user connect",u);
    username = u;
    location.hash = u;
}
if(location.hash == "") {
    console.log("no username given in hash");
    login(prompt("Enter a username","Bob"));

} else {
    console.log("user name was in hash");
    login(location.hash.split("").slice(1).join(""));
}
socket
    .on("broadcast message",pushMessage)
    .on("user exists",function() {
        login(prompt("user already exists, pick another name","bill"));
    });
window.sendMessage = function sendMessage(e) {
    var key  = e.which || e.keyCode;
    if(key === 13) {
        console.log("ENTER PRESSED");
        socket.emit("transmit message",username,$("#message-box").val(),Date.now(),function() {
            console.log("message transmitted");
            $("#message-box").val("")
        });
    }
    return false;
}
