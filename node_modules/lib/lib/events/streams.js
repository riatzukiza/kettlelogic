var evented = require("./events/eventedInterface.js");
var obj = require("./object.js")
var List = require("./DoublyLinkedList.js");
var F = require("./functional.js")
var streamProto = {
    write: function() {
        return this._stream.write(...arguments);
    },
    end: function() {
        return this._stream.end(...arguments);
    },
    read: function() {
        return this._stream.read(...arguments);
    },
    pipe: function() {
        return this._stream.pipe(...arguments);
    },
};

var buildTypedCon = function(con) {
    var c = buildCon(con);
    return function() {
        this.super(new type(...arguments));
        c.call(this, ...arguments);
    }
};

function buildCon(con) {
    return;
}

function throwTypeErr(m) {
    return () =>
        throw new TypeError(m);
};

function defer(f) {
    return function() {
        return f.call(this, ...arguments);
    }
}
var contract = curry(function(c, m, f) {
    return cond(c, f, throwTypeError(m));
})
var func = contract(is.function, "expected a function");

function buildStreamCon(con) {

    return cond(is.function, defer(buildTypedCon(con)), defer(buildCon(con)));
};


function eventedStream(m, con) {
    return evented(obj.mask(m).merge(streamProto), function(s) {
            this.super(s);
            this._stream = s;
            this._queue = new List();
            this._waiting = false;
            this._stream.bubbleTo(this);
            this.on("next", () => {
                var a = this._queue.pop_head();
                if (a != -1) {
                    a.action
                        .apply(this, a.args)
                } else {
                    this._waiting = true;
                    this.emit('waiting')
                }
            });
            con.call(this, [...arguments].slice(1));
        })
        .modAllOwn(function(f) {
            f.push_tail(function() {
                var args = [...arguments];
                var s = args.pop();
                var v = args.pop();
                return v.then(d => this.emit("next",d),d);

            })
            return function() {
                if (this._waiting) {
                    this._queue.push_tail({
                        action: f,
                        args: [...arguments]
                    });
                } else {
                    this._waiting = true;
                    f.apply(this, arguments)
                }
                return this;
            }
        });
};
module.exports = eventedStream;
