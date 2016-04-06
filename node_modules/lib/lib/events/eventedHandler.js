var evented = require("./eventedInterface.js");
var interface = require("../interface.js").createInterface;
function eventedHandler(e,handlers) {
    return interface()
        .methods(handlers)
        .contructor(function() {
            this.emitter = e;
        })
        .modAll(function(f,name) {
            return function() {
                this.emitter.on(name,f)
            }
        })
}
