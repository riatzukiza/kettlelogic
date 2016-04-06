"use strict";
var EventInterface = require("./EventInterface.js");
var prom = require("../wrappers/promise.js");
function eventedMethod() {
    var args = [...arguments];
    var s = args.pop();
    var v = args.pop();

    return prom.resolve(v)
        .then((x) => {
            return (this.emit(s,x,...args),x)
        })
        .catch((e) => {
            this.emit("error",e,args);
            throw e;
        });
}
function createEventedInterface(m,c) {
    return EventInterface.extend(m,function()  {
        EventInterface.call(this);
        c.call(this,...arguments);
    })
    .afterAllOwn(eventedMethod)
    .static({
        eventedMethod:function(name,fn) {
            return this
                .methodsAfter({
                    [name]:fn
                },eventedMethod);
        },
        evented:function(obj) {
            return this
                .methodsAfter(obj,eventedMethod);
        }
    });
}
module.exports = createEventedInterface;
