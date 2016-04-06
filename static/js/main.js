"use strict";

var socket = io.connect("/files");
var username;
let bind = (o, m) => (...args) => (m.call(o, ...args));
var panels = require("./panels.js");
