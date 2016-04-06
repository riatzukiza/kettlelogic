(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var socket = io.connect("/chat");
var username;
var bind = function bind(o, m) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return m.call.apply(m, [o].concat(args));
    };
};
function pushMessage(u, d, t) {
    console.log("message recieved");
    $("#messages").append("<div>" + t + ":(" + u + ") " + d + "</div>");
}
function login(u) {
    socket.emit("user connect", u);
    username = u;
    location.hash = u;
}
if (location.hash == "") {
    console.log("no username given in hash");
    login(prompt("Enter a username", "Bob"));
} else {
    console.log("user name was in hash");
    login(location.hash.split("").slice(1).join(""));
}
socket.on("broadcast message", pushMessage).on("user exists", function () {
    login(prompt("user already exists, pick another name", "bill"));
});
window.sendMessage = function sendMessage(e) {
    var key = e.which || e.keyCode;
    if (key === 13) {
        console.log("ENTER PRESSED");
        socket.emit("transmit message", username, $("#message-box").val(), Date.now(), function () {
            console.log("message transmitted");
            $("#message-box").val("");
        });
    }
    return false;
};

},{}]},{},[1]);
