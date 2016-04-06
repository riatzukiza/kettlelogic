(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var curry = require("./partialApplication.js").curry;
////////////////////////////////////////////////////////////////////////////////
function conditional(cond, success,  x) {
    /*if (!is.function(g) || is.undefined(x)) {
        g = (x) => x;
    }*/
    return cond(x) ? success(x) : false;
}
function biConditional (cond, success,fail,x) {
    return cond(x) ? success(x) : fail(x);
}
conditional.binary = biConditional;
conditional.unary = conditional;
function maybe(f,x) {
    return conditional(
        ((x) => ((x !== null && x!== undefined) )),
        f, x);
};
function biMaybe(f,g,x) {
    return biConditional(
        ((x) => ((x !== null && x!== undefined) )),
        f,
        g || (() => (null)), x);
};
maybe.unary = maybe;
maybe.binary = biMaybe;
maybe.not = curry(biMaybe)(x => x);
maybe.not = function (f,x) {
    return biMaybe((x) => x,f,x);
}
function either(x, a, b) {
    return x ? a : b;
}
module.exports = {
    conditional:conditional,
    maybe:maybe,
    either:either,
    biMaybe:biMaybe
}

},{"./partialApplication.js":2}],2:[function(require,module,exports){
"use strict";
////////////////////////////////////////////////////////////////////////////////
function curry(f, n, a) {
    a = a || [];
    if (a.length >= (n || f.length)) {
        return f(...a);
    }

    function curry_continue() {
        return curry(f, n, [...a, ...arguments]);
    }
    curry_continue.f = f;
    curry_continue.n = n;
    curry_continue.a = a;
    return curry_continue;
}
////////////////////////////////////////////////////////////////////////////////
function defer(f, a, n) {
    a = a || [];
    n = n || f.length;
    let l = a.length;
    return function() {
        if (l >= n) {
            return f(...a);
        }
        return defer(f, [...a, ...arguments], n);
    };
}
////////////////////////////////////////////////////////////////////////////////
function bind(object, method) {
    return function bind_call() {
        return method.call(object, ...arguments);
    };
}
//bind(obj,obj.func)(...p) === obj.func(...p)
////////////////////////////////////////////////////////////////////////////////
function partial(f) {
    return function partial_args() {
        let a = arguments;
        return function partial_call() {
            return f(...a, ...arguments);
        };
    };
}
// partial(func)(...pa)(...pb) === func(...pa,...pb)
////////////////////////////////////////////////////////////////////////////////
function post_partial(f) {
    return function post_partial_args(f) {
        let a = arguments;
        return function post_partial_call() {
            return f(...arguments, ...a);
        };
    };
}
module.exports = {
    post:post_partial,
    pre:partial,
    defer:defer,
    curry:curry,
    bind:bind
}

},{}],3:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":4}],4:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
"use strict";
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DomEventEmitter = exports.EventEmitter = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.throttle = throttle;
exports.debounce = debounce;

var _functional = require("./functional.js");

var _typeset = require("./typeset.js");

var _list = require("./list.js");

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////////////

var EventEmitter = exports.EventEmitter = function () {
    function EventEmitter() {
        _classCallCheck(this, EventEmitter);

        this._listeners = new _typeset.TypeSet(_list.List);
    }

    _createClass(EventEmitter, [{
        key: "on",
        value: function on(event, callback) {
            this._listeners.get(event).push(callback);
            return this;
        }
        //once( event, callback )
        //{
        //    //return this.on(event, callback, context).limit(1);
        //}

    }, {
        key: "remove",
        value: function remove(event, callback) {
            this._listeners.get(event).remove(callback);
            return this;
        }
    }, {
        key: "clear",
        value: function clear(event, callback) {
            if (event) {
                if (callback) this.remove(event, callback);else this._listeners.get(event).clear();
            } else this._listeners.clear();
            return this;
        }
    }, {
        key: "has",
        value: function has(event, callback) {
            if (event && this._listeners.has(event)) if (callback) return this._listeners.get(event).has(callback);else return true;
            return false;
        }
    }, {
        key: "listeners",
        value: function listeners(event) {
            if (event) return this._listeners.get(event);
            return this._listeners;
        }
    }, {
        key: "emit",
        value: function emit(event) {
            for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
            }

            this._listeners.get(event).each(function (f) {
                return f.apply(undefined, args);
            });
            return this;
        }
    }]);

    return EventEmitter;
}();
////////////////////////////////////////////////////////////////////////////////

var DOM_EVENTS = ["mouseenter", "mouseleave", "mouseover", "mouseout", "mousedown", "mouseup", "click"];
var _is_dom_event = function _is_dom_event(e) {
    return DOM_EVENTS.includes(e);
};

////////////////////////////////////////////////////////////////////////////////

var DomEventEmitter = exports.DomEventEmitter = function (_EventEmitter) {
    _inherits(DomEventEmitter, _EventEmitter);

    function DomEventEmitter(el) {
        _classCallCheck(this, DomEventEmitter);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(DomEventEmitter).call(this));

        _this._events = {};
        _this._el = el;
        return _this;
    }

    _createClass(DomEventEmitter, [{
        key: "on",
        value: function on(event, callback) {
            var _this2 = this;

            _get(Object.getPrototypeOf(DomEventEmitter.prototype), "on", this).call(this, event, callback);

            if (_is_dom_event(event) && !_functional.is.defined(this._events[event])) {
                this._events[event] = function () {
                    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                        args[_key2] = arguments[_key2];
                    }

                    return _this2.emit.apply(_this2, [event].concat(args));
                };
                this._el.addEventListener(event, this._events[event]);
            }
            return this;
        }
    }, {
        key: "remove",
        value: function remove(event, callback) {
            _get(Object.getPrototypeOf(DomEventEmitter.prototype), "remove", this).call(this, event, callback);

            if (_is_dom_event(event) && this._listeners.get(event).empty) {
                this._el.removeEventListener(event, this._events[event]);
                this._events[event] = undefined;
            }
            return this;
        }
    }]);

    return DomEventEmitter;
}(EventEmitter);
////////////////////////////////////////////////////////////////////////////////


function throttle(fn, threshhold, scope) {
    threshhold || (threshhold = 250);
    var last, deferTimer;
    return function () {
        var context = scope || this;
        var now = +new Date(),
            args = arguments;
        if (last && now < last + threshhold) {
            // hold on to it
            clearTimeout(deferTimer);
            deferTimer = setTimeout(function () {
                last = now;
                fn.apply(context, args);
            }, threshhold);
        } else {
            last = now;
            fn.apply(context, args);
        }
    };
}
////////////////////////////////////////////////////////////////////////////////
function debounce(fn, delay) {
    var timer = null;
    return function () {
        var context = this,
            args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

},{"./functional.js":6,"./list.js":7,"./typeset.js":10}],6:[function(require,module,exports){
"use strict";
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

exports.same = same;
exports.memoize = memoize;
exports.curry = curry;
exports.bind = bind;
exports.partial = partial;
exports.post_partial = post_partial;
exports.compose = compose;
exports.is_type = is_type;
exports.or = or;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function same() {
    return arguments.length > 0 ? ![].concat(Array.prototype.slice.call(arguments)).some(function (v, i, a) {
        return v !== a[0];
    }) : false;
}
////////////////////////////////////////////////////////////////////////////////
function memoize(fn) {
    var cache = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    return function memoize_call(param) {
        var key = JSON.stringify(param);
        return cache[key] ? cache[key] : cache[key] = fn(param);
    };
}
////////////////////////////////////////////////////////////////////////////////
function curry(f) {
    var a = [].concat(Array.prototype.slice.call(arguments));
    if (a.length >= f.length + 1) return f.apply(undefined, _toConsumableArray(a.slice(1)));
    return function curry_call() {
        return curry.apply(undefined, _toConsumableArray(a).concat(Array.prototype.slice.call(arguments)));
    };
}
////////////////////////////////////////////////////////////////////////////////
function bind(object, method) {
    return function bind_call() {
        return method.call.apply(method, [object].concat(Array.prototype.slice.call(arguments)));
    };
}
//bind(obj,obj.func)(...p) === obj.func(...p)
////////////////////////////////////////////////////////////////////////////////
function partial(f) {
    return function partial_args() {
        var a = arguments;
        return function partial_call() {
            return f.apply(undefined, _toConsumableArray(a).concat(Array.prototype.slice.call(arguments)));
        };
    };
}
// partial(func)(...pa)(...pb) === func(...pa,...pb)
////////////////////////////////////////////////////////////////////////////////
function post_partial(f) {
    return function post_partial_args(f) {
        var a = arguments;
        return function post_partial_call() {
            return f.apply(undefined, Array.prototype.slice.call(arguments).concat(_toConsumableArray(a)));
        };
    };
}
// post_partial(func)(...pa)(...pb) === func(...pb,...pa)
////////////////////////////////////////////////////////////////////////////////
function conditional_application(cond, f, x) {
    return cond(x) ? f(x) : x;
}
////////////////////////////////////////////////////////////////////////////////
function compose(a, b) {
    return function (c) {
        return a(b(c));
    };
}
////////////////////////////////////////////////////////////////////////////////
function is_type(type, x) {
    return (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === type;
}
////////////////////////////////////////////////////////////////////////////////
function is_instance_of(proto, x) {
    return x instanceof proto;
}
////////////////////////////////////////////////////////////////////////////////
function defined(v) {
    return v !== undefined;
}
////////////////////////////////////////////////////////////////////////////////
function is_array(a) {
    return Array.isArray(a);
}
////////////////////////////////////////////////////////////////////////////////
function is_truthy(v) {
    return v === true || v > 0 || defined(v);
}
////////////////////////////////////////////////////////////////////////////////
function is_false(v) {
    return v === false || v === null || v === undefined || v === 0;
}
////////////////////////////////////////////////////////////////////////////////
function or(cond, a, b) {
    return cond ? a : b;
}
var conditional = exports.conditional = curry(conditional_application);
////////////////////////////////////////////////////////////////////////////////
var is = exports.is = {
    'boolean': curry(is_type, 'boolean'),
    'function': curry(is_type, 'function'),
    'number': curry(is_type, 'number'),
    'object': curry(is_type, 'object'),
    'string': curry(is_type, 'string'),
    'symbol': curry(is_type, 'symbol'),
    'array': is_array,
    'truthy': is_truthy,
    'falsey': is_false,
    'undefined': curry(is_type, 'undefined'),
    'defined': defined,
    'instance': curry(is_instance_of)
};
////////////////////////////////////////////////////////////////////////////////
//import { bind, compose, conditional, curry, is, partial, post_partial } from '../lib/functional.js';

},{}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Node = exports.Node = function () {
    function Node(list, data, next, prev) {
        _classCallCheck(this, Node);

        this.list = list || null;
        this.data = data || null;
        this.next = next || null;
        this.prev = prev || null;
    }

    _createClass(Node, [{
        key: 'unshift',
        value: function unshift(node) {
            node.next = this;
            return this.prev = node;
        }
    }, {
        key: 'insert',
        value: function insert(node) {
            node.next = this.next;
            node.prev = this;
            this.next = node;
            if (node.next) node.next.prev = node;
            return node;
        }
    }, {
        key: 'push',
        value: function push(node) {
            node.prev = this;
            return this.next = node;
        }
    }, {
        key: 'remove',
        value: function remove() {
            this.list.size--;

            if (this.isHead) this.list.head = this.next;
            if (this.isTail) this.list.tail = this.prev;

            if (this.next) this.next.perv = this.prev;
            if (this.prev) this.prev.next = this.next;

            return this.data;
        }
    }, {
        key: 'isHead',
        get: function get() {
            return this.prev === null;
        }
    }, {
        key: 'isTail',
        get: function get() {
            return this.next === null;
        }
    }]);

    return Node;
}();

var List = exports.List = function () {
    function List() {
        _classCallCheck(this, List);

        this.head = null;
        this.tail = null;
        this.size = 0;
    }

    _createClass(List, [{
        key: 'clear',
        value: function clear() {
            this.head = this.tail = null;
            this.size = 0;
        }
    }, {
        key: 'find',
        value: function find(condition, all, ruturn_node, run_on_node) {
            var result = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

            if (this.empty) return [];
            if (all && !result) result = [];
            var node = this.head;
            while (node) {
                if (condition(run_on_node ? node : node.data)) if (all) result.push(ruturn_node ? node : node.data);else return ruturn_node ? node : node.data;
                node = node.next;
            }
            return result;
        }
    }, {
        key: 'has',
        value: function has(data) {
            var node = this.head;
            while (node) {
                if (node.data === data) return true;
            }return false;
        }
    }, {
        key: 'each',
        value: function each(action, run_on_node) {
            var node = this.head;
            while (node) {
                action(run_on_node ? node : node.data);
                node = node.next;
            }
            return this;
        }
    }, {
        key: 'push',
        value: function push(data) {
            if (this.empty) {
                this.size++;return this.head = this.tail = new Node(this, data);
            } else {
                this.size++;return this.tail = this.tail.push(new Node(this, data, null, this.tail));
            }
        }
    }, {
        key: 'pop',
        value: function pop() {
            return this.tail.remove();
        }
    }, {
        key: 'unshift',
        value: function unshift(data) {
            if (this.empty) {
                this.size++;return this.head = this.tail = new Node(this, data);
            } else {
                this.size++;return this.head = this.head.unshift(new Node(this, data, this.head, null));
            }
        }
    }, {
        key: 'shift',
        value: function shift() {
            return this.head.remove();
        }
    }, {
        key: 'remove',
        value: function remove(data) {
            var node = this.head;
            while (node) {
                if (node.data === data) {
                    node.remove();
                    return true;
                }
                node = node.next;
            }
            return false;
        }
    }, {
        key: 'empty',
        get: function get() {
            return this.size === 0;
        }
    }]);

    return List;
}();

},{}],8:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.nearest = exports.limit = exports.idenity = exports.scale = exports.tan = exports.sqrt = exports.sin = exports.round = exports.rand = exports.pow = exports.min = exports.max = exports.log = exports.floor = exports.exp = exports.cos = exports.ceil = exports.atan2 = exports.atan = exports.asin = exports.acos = exports.abs = exports.SQRT2 = exports.SQRT1_2 = exports.PI = exports.LOG10E = exports.LOG2E = exports.LN10 = exports.LN2 = exports.E = undefined;

var _functional = require('./functional.js');

////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////
var E = exports.E = Math.E; // Returns Euler's number (approx. 2.718)
var LN2 = exports.LN2 = Math.LN2; // Returns the natural logarithm of 2 (approx. 0.693)
var LN10 = exports.LN10 = Math.LN10; // Returns the natural logarithm of 10 (approx. 2.302)
var LOG2E = exports.LOG2E = Math.LOG2E; // Returns the base-2 logarithm of E (approx. 1.442)
var LOG10E = exports.LOG10E = Math.LOG10E; // Returns the base-10 logarithm of E (approx. 0.434)
var PI = exports.PI = Math.PI; // Returns PI (approx. 3.14)
var SQRT1_2 = exports.SQRT1_2 = Math.SQRT1_2; // Returns the square root of 1/2 (approx. 0.707)
var SQRT2 = exports.SQRT2 = Math.SQRT2; // Returns the square root of 2 (approx. 1.414)
////////////////////////////////////////////////////////////////////////////////
var abs = exports.abs = Math.abs; // f(x)	    Returns the absolute value of x
var acos = exports.acos = Math.acos; // f(x)	    Returns the arccosine of x, in radians
var asin = exports.asin = Math.asin; // f(x)	    Returns the arcsine of x, in radians
var atan = exports.atan = Math.atan; // f(x)	    Returns the arctangent of x as a numeric value between -PI/2 and PI/2 radians
var atan2 = exports.atan2 = Math.atan2; // f(y,x)	Returns the arctangent of the quotient of its arguments
var ceil = exports.ceil = Math.ceil; // f(x)	    Returns x, rounded upwards to the nearest integer
var cos = exports.cos = Math.cos; // f(x)	    Returns the cosine of x (x is in radians)
var exp = exports.exp = Math.exp; // f(x)	    Returns the value of Ex
var floor = exports.floor = Math.floor; // f(x)	    Returns x, rounded downwards to the nearest integer
var log = exports.log = Math.log; // f(x)	    Returns the natural logarithm (base E) of x
var max = exports.max = Math.max; // f(x,y,z,...,n)	Returns the number with the highest value
var min = exports.min = Math.min; // f(x,y,z,...,n)	Returns the number with the lowest value
var pow = exports.pow = Math.pow; // f(x,y)	Returns the value of x to the power of y
var rand = exports.rand = Math.random; // f()	    Returns a random number between 0 and 1
var round = exports.round = Math.round; // f(x)	    Rounds x to the nearest integer
var sin = exports.sin = Math.sin; // f(x)     Returns the sine of x (x is in radians)
var sqrt = exports.sqrt = Math.sqrt; // f(x)     Returns the square root of x
var tan = exports.tan = Math.tan; // f(x)     Returns the tangent of an angle
////////////////////////////////////////////////////////////////////////////////
function _limit(lower, upper, value) {
    return max(lower, min(value, upper));
}
// nearest multiple of increment to value;
function _nearest(increment, value) {
    return round(value / increment) * increment;
}
function _idenity(v) {
    return v;
}
// 1d scaling
function _scale(_old, _new, value) {
    return value * _new / _old;
}
////////////////////////////////////////////////////////////////////////////////
var scale = exports.scale = (0, _functional.curry)(_scale);
var idenity = exports.idenity = _idenity;
var limit = exports.limit = (0, _functional.curry)(_limit); // limit(0,256)(value);
var nearest = exports.nearest = (0, _functional.curry)(_nearest); // nearest(32)(value);

},{"./functional.js":6}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.mouse = exports.Mouse = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _event = require("./event.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Mouse = exports.Mouse = function (_EventEmitter) {
    _inherits(Mouse, _EventEmitter);

    function Mouse() {
        var interval = arguments.length <= 0 || arguments[0] === undefined ? 250 : arguments[0];

        _classCallCheck(this, Mouse);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Mouse).call(this));

        _this._x = 0;
        _this._y = 0;
        _this._interval = interval;
        _this._watchers = 0;
        _this._timer = null;
        _this._callback = {
            pos: _this._position.bind(_this),
            move: _this._move.bind(_this),
            up: _this._up.bind(_this),
            down: _this._down.bind(_this)
        };

        return _this;
    }

    _createClass(Mouse, [{
        key: "start",
        value: function start() {
            if (!this.tracking) {
                document.addEventListener("mousedown", this._callback.down);
                document.addEventListener("mouseup", this._callback.up);
                document.addEventListener("mousemove", this._callback.pos);
                this._timer = setInterval(this._callback.move, this._interval);
                this.emit("start");
            }
            this._watchers += 1;
            return this;
        }
    }, {
        key: "stop",
        value: function stop() {
            this._watchers -= 1;
            if (!this.tracking) {
                document.removeEventListener("mousedown", this._callback.down);
                document.removeEventListener("mouseup", this._callback.up);
                document.removeEventListener("mousemove", this._callback.pos);
                if (this._timer) clearInterval(this._timer);
                this.emit("stop");
            }
            return this;
        }
    }, {
        key: "_position",
        value: function _position(e) {
            if (e) {
                ;
                var _ref = [e.clientX, e.clientY];
                this._x = _ref[0];
                this._y = _ref[1];
            }
        }
    }, {
        key: "_move",
        value: function _move(e) {
            this.emit("move", { x: this._x, y: this._y });
        }
    }, {
        key: "_up",
        value: function _up(e) {
            this.emit("up");
        }
    }, {
        key: "_down",
        value: function _down(e) {
            this._position(e);
            this.emit("down");
        }
    }, {
        key: "tracking",
        get: function get() {
            return this._watchers > 0;
        }
    }]);

    return Mouse;
}(_event.EventEmitter);

var mouse = exports.mouse = new Mouse(100);

},{"./event.js":5}],10:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TypeSet = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _functional = require('./functional.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////////////

var TypeSet = exports.TypeSet = function () {
    function TypeSet(type) {
        _classCallCheck(this, TypeSet);

        this._type = type;
        this._items = {};
        this._size = 0;
    }

    _createClass(TypeSet, [{
        key: 'clear',
        value: function clear() {
            this._items = {};
            this._size = 0;
            return this;
        }
    }, {
        key: 'has',
        value: function has(key) {
            return _functional.is.defined(this._items[key]);
        }
    }, {
        key: 'add',
        value: function add(key) {
            if (!this.has(key)) {
                this.size++;

                for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                    args[_key - 1] = arguments[_key];
                }

                return this._items[key] = new (Function.prototype.bind.apply(this._type, [null].concat(args)))();
            }
            return this._items[key];
        }
    }, {
        key: 'del',
        value: function del(key) {
            if (this.has(key)) {
                var item = this._items[key];
                delete this._items[key];
                this.size--;
                return item;
            }
            return false;
        }
    }, {
        key: 'get',
        value: function get(key) {
            if (this.has(key)) return this._items[key];
            return this.add(key);
        }
    }, {
        key: 'each',
        value: function each(func) {
            Object.keys(this._items).forEach(function (x) {
                return func(x);
            });
            return this;
        }
    }, {
        key: 'keys',
        get: function get() {
            return Object.keys(this._items);
        }
    }, {
        key: 'values',
        get: function get() {
            var _this = this;

            return Object.keys(this._items).map(function (x) {
                return _this._items[x];
            });
        }
    }, {
        key: 'entries',
        get: function get() {
            var _this2 = this;

            return Object.keys(this._items).map(function (x) {
                return { key: x, value: _this2._items[x] };
            });
        }
    }]);

    return TypeSet;
}();

},{"./functional.js":6}],11:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Component = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _functional = require('../lib/functional.js');

var _typeset = require('../lib/typeset.js');

var _list = require('../lib/list.js');

var _event = require('../lib/event.js');

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////////////
var TAGS = {};
var TYPES = {};
var COUNT = 0;

var TypeIndex = function TypeIndex(type) {
    _classCallCheck(this, TypeIndex);

    this.type = type;
    this.index = COUNT++;
    this.ctor = document.registerElement(type.tag, type);
    this.count = 0;
};
////////////////////////////////////////////////////////////////////////////////


var Component = exports.Component = function (_HTMLElement) {
    _inherits(Component, _HTMLElement);

    function Component() {
        _classCallCheck(this, Component);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Component).apply(this, arguments));
    }

    _createClass(Component, [{
        key: 'initialize',
        value: function initialize() {
            var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            var id = _ref.id;

            this.id = id ? id : Component.generateId(this);
            this.event = new _event.DomEventEmitter(this);
            return this;
        }
    }, {
        key: 'createdCallback',

        ////////////////////////////////////////////////////////////////////////////

        // LIFECYCLE CALLBACKS /////////////////////////////////////////////////////
        value: function createdCallback() {
            this.created();
        }
    }, {
        key: 'created',
        value: function created() {
            if (this.shadow) {
                this.root = this.createShadowRoot();
            } else {
                this.root = this;
            }

            //this.render();
        }
    }, {
        key: 'attachedCallback',
        value: function attachedCallback() {
            this.attached();
        }
    }, {
        key: 'attached',
        value: function attached() {
            this.render();
        }
    }, {
        key: 'detachedCallback',
        value: function detachedCallback() {
            this.detached();
        }
    }, {
        key: 'detached',
        value: function detached() {}
    }, {
        key: 'attributeChangedCallback',
        value: function attributeChangedCallback(n, a, b) {
            this.attribute(n, a, b);
        }
    }, {
        key: 'attribute',
        value: function attribute(n, a, b) {}
        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: 'render',
        value: function render() {}

        // SUB-DOM MANIPULATION ////////////////////////////////////////////////////

    }, {
        key: 'clear',
        value: function clear() {
            var last = void 0;
            while (last = this.lastChild) {
                this.removeChild(last);
            }return this;
        }
    }, {
        key: 'append',
        value: function append(el) {
            this.appendChild(el);
            return el;
        }
    }, {
        key: 'insertAfter',
        value: function insertAfter(el) {
            this.parentNode.insertBefore(el, this.nextSibling);
            return el;
        }
    }, {
        key: 'insertBefore',
        value: function insertBefore(el) {
            this.parentNode.insertBefore(el, this);
            return el;
        }
    }, {
        key: 'find',
        value: function find(selector) {
            return this.root.querySelector(selector);
        }
    }, {
        key: 'findAll',
        value: function findAll(selector) {
            return this.root.querySelectorAll(selector);
        }
        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: 'type',


        // UNIVERSAL ATTRIBUTES ////////////////////////////////////////////////////
        get: function get() {
            return TAGS[this.tag].type;
        }
    }, {
        key: 'tag',
        get: function get() {
            return this.constructor.name;
        }
    }, {
        key: 'id',
        get: function get() {
            return this.getAttribute('id');
        },
        set: function set(value) {
            this.setAttribute('id', value);
        }
    }, {
        key: 'tooltip',
        get: function get() {
            return this.getAttribute('title');
        },
        set: function set(v) {
            this.setAttribute('title', v);
        }
    }, {
        key: 'name',
        get: function get() {
            return this.getAttribute('name');
        },
        set: function set(v) {
            this.setAttribute('name', v);
        }
    }, {
        key: 'shadow',
        get: function get() {
            return this.getAttribute('shadow');
        },
        set: function set(v) {
            this.setAttribute('shadow', v);
        }
    }, {
        key: 'empty',
        get: function get() {
            return this.hasChildNodes();
        }
    }], [{
        key: 'create',
        value: function create(type) {
            var o = new TAGS[type.tag].ctor();
            return o.initialize ? (0, _functional.bind)(o, o.initialize) : o;
        }
    }, {
        key: 'register',
        value: function register() {
            console.log("register:", this.name, this.tag);
            return TYPES[this.name] = TAGS[this.tag] = new TypeIndex(this);
        }
    }, {
        key: 'generateId',
        value: function generateId(instance) {
            var tag = TAGS[instance.tag];
            return 'T' + tag.index + 'I' + tag.count++;
            //return `${instance.tag}_${TAGS[instance.tag].count++}`;
        }
    }, {
        key: 'build',
        value: function build(json, prev) {
            var result = null;

            if (_functional.is.array(json)) result = json.map(function (x) {
                return Component.build(x);
            });else {
                result = Component.create(TYPES[json.type].type)(json.options);
                if (json.children) Component.build(json.children).forEach(function (y) {
                    return result.append(y);
                });
            }
            return result;
        }
    }, {
        key: 'tag',
        get: function get() {
            return 'ui-' + this.name.split(/(?=[A-Z])/).join('-').toLowerCase();
        }
    }]);

    return Component;
}(HTMLElement);

},{"../lib/event.js":5,"../lib/functional.js":6,"../lib/list.js":7,"../lib/typeset.js":10}],12:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CSSComponent = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _functional = require('../lib/functional.js');

var _component = require('./component.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

////////////////////////////////////////////////////////////////////////////////
var TAGS = {};
////////////////////////////////////////////////////////////////////////////////
function strip_unit(value) {
  return Number(value.slice(0, -2));
}
////////////////////////////////////////////////////////////////////////////////

var CSSComponent = exports.CSSComponent = function (_Component) {
  _inherits(CSSComponent, _Component);

  function CSSComponent() {
    _classCallCheck(this, CSSComponent);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(CSSComponent).apply(this, arguments));
  }

  _createClass(CSSComponent, [{
    key: 'initialize',
    value: function initialize(_ref) {
      var parent = _ref.parent;

      _get(Object.getPrototypeOf(CSSComponent.prototype), 'initialize', this).apply(this, arguments);
      this.stylesheet = parent && parent.stylesheet ? parent.stylesheet : CSSComponent.createStyleSheet();
      this.rule = CSSComponent.createStyleRule(this);
      this.css = this.rule.style;
      return this;
    }

    // CSS MULTI PROPERTIES ////////////////////////////////////////////////////

  }, {
    key: 'position',
    value: function position(x, y) {
      this.x = x;
      this.y = y;
      return this;
    }
  }, {
    key: 'size',
    value: function size(w, h) {
      this.width = w;
      this.height = h;
      return this;
    }
  }, {
    key: 'minSize',
    value: function minSize(x, y) {
      this.minWidth = x;
      this.minHeight = y;
      return this;
    }
  }, {
    key: 'maxSize',
    value: function maxSize(x, y) {
      this.maxWidth = x;
      this.maxHeight = y;
      return this;
    }
    ////////////////////////////////////////////////////////////////////////////

    // CSS SINGLE PROEPRTIES ///////////////////////////////////////////////////

  }, {
    key: 'selector',
    get: function get() {
      return '#' + this.id;
    }
  }, {
    key: 'x',
    get: function get() {
      return strip_unit(this.css.left);
    },
    set: function set(v) {
      this.css.left = v + 'px';
    }
  }, {
    key: 'y',
    get: function get() {
      return strip_unit(this.css.top);
    },
    set: function set(v) {
      this.css.top = v + 'px';
    }
  }, {
    key: 'maxWidth',
    get: function get() {
      return strip_unit(this.css.maxWidth);
    },
    set: function set(v) {
      this.css.maxWidth = v + 'px';
    }
  }, {
    key: 'minWidth',
    get: function get() {
      return strip_unit(this.css.minWidth);
    },
    set: function set(v) {
      this.css.minWidth = v + 'px';
    }
  }, {
    key: 'width',
    get: function get() {
      return strip_unit(this.css.width);
    },
    set: function set(v) {
      this.css.width = v + 'px';
    }
  }, {
    key: 'maxHeight',
    get: function get() {
      return strip_unit(this.css.maxHeight);
    },
    set: function set(v) {
      this.css.maxHeight = v + 'px';
    }
  }, {
    key: 'minHeight',
    get: function get() {
      return strip_unit(this.css.minHeight);
    },
    set: function set(v) {
      this.css.minHeight = v + 'px';
    }
  }, {
    key: 'height',
    get: function get() {
      return strip_unit(this.css.height);
    },
    set: function set(v) {
      this.css.height = v + 'px';
    }
  }, {
    key: 'top',
    get: function get() {
      return strip_unit(this.css.top);
    },
    set: function set(v) {
      this.css.top = v + 'px';
    }
  }, {
    key: 'bottom',
    get: function get() {
      return strip_unit(this.css.top) + strip_unit(this.css.height);
    },
    set: function set(v) {
      this.css.bottom = v + 'px';
    }
  }, {
    key: 'left',
    get: function get() {
      return strip_unit(this.css.left);
    },
    set: function set(v) {
      this.css.left = v + 'px';
    }
  }, {
    key: 'right',
    get: function get() {
      return strip_unit(this.css.left) + strip_unit(this.css.width);
    },
    set: function set(v) {
      this.css.right = v + 'px';
    }
    ////////////////////////////////////////////////////////////////////////////

    ////////////////////////////////////////////////////////////////////////////

  }], [{
    key: 'createStyleSheet',
    value: function createStyleSheet() {
      document.head.appendChild(document.createElement('style')).type = 'text/css';
      return document.styleSheets[document.styleSheets.length - 1];
    }
  }, {
    key: 'createStyleRule',
    value: function createStyleRule(el) {
      var i = el.stylesheet.rules.length;
      el.stylesheet.insertRule(el.selector + '{}', i);

      return el.stylesheet.rules[i];
    }
  }]);

  return CSSComponent;
}(_component.Component);

},{"../lib/functional.js":6,"./component.js":11}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ControlIcon = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _component = require('../component.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function bind(o, m) {
    return function () {
        return m.call.apply(m, [o].concat(Array.prototype.slice.call(arguments)));
    };
}

var template = '<i></i>';

var ControlIcon = exports.ControlIcon = function (_Component) {
    _inherits(ControlIcon, _Component);

    function ControlIcon() {
        _classCallCheck(this, ControlIcon);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ControlIcon).apply(this, arguments));
    }

    _createClass(ControlIcon, [{
        key: 'initialize',
        value: function initialize(options) {
            _get(Object.getPrototypeOf(ControlIcon.prototype), 'initialize', this).call(this, options);
            this.root.innerHTML = template;

            this._icon = this.root.querySelector('i');
            this._callback = options.action;
            this.addEventListener('click', this._callback);
            this.type = options.icon;

            return this;
        }
    }, {
        key: 'type',
        get: function get() {
            return this.getAttribute('type');
        },
        set: function set(v) {
            this.setAttribute('type', v);
            this._icon.setAttribute('type', v);
        }
    }, {
        key: 'callback',
        get: function get() {
            return this._callback;
        },
        set: function set(v) {
            this.removeEventListener('click', this._callback);
            this._callback = v;
            this.addEventListener('click', this._callback);
        }
    }]);

    return ControlIcon;
}(_component.Component);

ControlIcon.register();

},{"../component.js":11}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MenuBar = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _component = require("../component.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function bind(o, m) {
    return function () {
        return m.call.apply(m, [o].concat(Array.prototype.slice.call(arguments)));
    };
}

var MenuBar = exports.MenuBar = function (_Component) {
    _inherits(MenuBar, _Component);

    function MenuBar() {
        _classCallCheck(this, MenuBar);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MenuBar).apply(this, arguments));
    }

    _createClass(MenuBar, [{
        key: "initialize",
        value: function initialize() {
            _get(Object.getPrototypeOf(MenuBar.prototype), "initialize", this).call(this);
            return this;
        }
    }, {
        key: "get",
        value: function get(name) {
            return this.find("#" + this.id + ">*[name=" + name + "]");
        }
    }, {
        key: "all",
        value: function all() {
            return this.findAll("#" + this.id + ">*");
        }
    }]);

    return MenuBar;
}(_component.Component);

MenuBar.register();

/*
    Component.create( MenuBar )()
        .add( DropDown, 'file' )
            .add( 'new'   )
            .add( 'open'  )
            .add( 'save'  )
            .add( 'close' )
            .add( 'exit'  );
            
    <menu-bar shadow=true>
        <div class="container">
            <drop-down name="file"></drop-down>
            <drop-down name="edit"></drop-down>
            <drop-down name="view"></drop-down>
        </div>
    </menu-bar>
*/

},{"../component.js":11}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.DropDown = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _component = require('../component.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function bind(o, m) {
    return function () {
        return m.call.apply(m, [o].concat(Array.prototype.slice.call(arguments)));
    };
}

var template = '<div class="label"></div><div class="list"></div>';

var DropDown = exports.DropDown = function (_Component) {
    _inherits(DropDown, _Component);

    function DropDown() {
        _classCallCheck(this, DropDown);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(DropDown).apply(this, arguments));
    }

    _createClass(DropDown, [{
        key: 'initialize',
        value: function initialize(_ref) {
            var name = _ref.name;

            _get(Object.getPrototypeOf(DropDown.prototype), 'initialize', this).apply(this, arguments);

            this.root.innerHTML = template;
            this.label = this.root.querySelector('.label');
            this.list = this.root.querySelector('.list');

            this.name = name || "";
            return this;
        }
    }, {
        key: 'attribute',
        value: function attribute(n, a, b) {
            switch (n) {
                case 'name':
                    this.label.innerHTML = b;break;
            }
        }
    }, {
        key: 'render',
        value: function render() {}
    }, {
        key: 'get',
        value: function get(name) {
            return this.find('#' + this.id + '>*[name=' + name + ']');
        }
    }, {
        key: 'all',
        value: function all() {
            return this.findAll('#' + this.id + '>*');
        }
    }, {
        key: 'append',
        value: function append(el) {
            return this.list.appendChild(el);
        }
    }, {
        key: 'add',
        value: function add(name) {
            if (!this.get(name)) {
                var li = document.createElement("div");
                li.appendChild(document.createTextNode(name));

                this.list.appendChild(li);
                return li;
            }
            return this.get(name);
        }
    }]);

    return DropDown;
}(_component.Component);

DropDown.register();

},{"../component.js":11}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MenuItem = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _component = require('../component.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var template = '<i></i></div><div class="label"></div><div class="shortcut"></div>';

var MenuItem = exports.MenuItem = function (_Component) {
    _inherits(MenuItem, _Component);

    function MenuItem() {
        _classCallCheck(this, MenuItem);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(MenuItem).apply(this, arguments));
    }

    _createClass(MenuItem, [{
        key: 'initialize',

        //    initialize( callback, name, shortcut )
        value: function initialize(_ref) {
            var _this2 = this;

            var action = _ref.action;
            var name = _ref.name;
            var icon = _ref.icon;
            var shortcut = _ref.shortcut;

            _get(Object.getPrototypeOf(MenuItem.prototype), 'initialize', this).apply(this, arguments);
            this.template = template;
            this.root.innerHTML = this.template;

            this._icon = this.root.querySelector('i');
            this._label = this.root.querySelector('.label');
            this._shortcut = this.root.querySelector('.shortcut');

            this._callback = action || function () {
                return console.log(_this2);
            };
            this.icon = icon || name;
            this.name = name;
            this.shortcut = (shortcut || '').toUpperCase();

            this.addEventListener('click', this._callback);

            return this;
        }
    }, {
        key: 'attribute',
        value: function attribute(n, a, b) {
            switch (n) {
                case 'name':
                    this._label.innerHTML = b;break;
                case 'icon':
                    this._icon.setAttribute('type', b);break;
                case 'shortcut':
                    this._shortcut.innerHTML = b;break;
            }
        }
    }, {
        key: 'icon',
        get: function get() {
            return this.getAttribute('icon');
        },
        set: function set(v) {
            this.setAttribute('icon', v);
        }
    }, {
        key: 'shortcut',
        get: function get() {
            return this.getAttribute('shortcut');
        },
        set: function set(v) {
            this.setAttribute('shortcut', v);
        }
    }]);

    return MenuItem;
}(_component.Component);

MenuItem.register();

},{"../component.js":11}],17:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Corner = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _functional = require('../../lib/functional.js');

var _csscomponent = require('../csscomponent.js');

var _neighbors = require('./neighbors.js');

var _graph = require('./graph.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////

var Corner = exports.Corner = function (_CSSComponent) {
    _inherits(Corner, _CSSComponent);

    function Corner() {
        _classCallCheck(this, Corner);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Corner).apply(this, arguments));
    }

    _createClass(Corner, [{
        key: 'initialize',
        value: function initialize(_ref) {
            var _this2 = this;

            var parent = _ref.parent;
            var x = _ref.x;
            var y = _ref.y;

            _get(Object.getPrototypeOf(Corner.prototype), 'initialize', this).apply(this, arguments);

            this.set = parent;
            this.neighbors = new _neighbors.Neighbors(this);
            this.graph = new _graph.Graph(this);
            this.callback = {
                resize: (0, _functional.bind)(this, this.render)
            };

            this.position(x, y);
            this.size(parent._margin, parent._margin);

            parent.append(this);

            this.addEventListener("click", function () {
                console.log(_this2.neighbors);
                console.log();
            });

            return this;
        }
    }, {
        key: 'position',
        value: function position(x, y) {
            _get(Object.getPrototypeOf(Corner.prototype), 'position', this).call(this, x, y);
            this.event.emit('move');
        }
    }, {
        key: 'is',
        value: function is(x, y) {
            return this.x === x && this.y === y;
        }
    }, {
        key: 'setup_events',
        value: function setup_events() {
            this.set.event.on('resize', this.callback.resize);
            return this;
        }
    }, {
        key: 'clear_events',
        value: function clear_events() {
            this.set.event.clear('resize', this.callback.resize);
            return this;
        }
    }, {
        key: 'render',
        value: function render() {
            //this.position( this.set.scaleX(this.x), this.set.scaleY(this.y) );
            this.event.emit('move');
        }
    }, {
        key: 'attached',
        value: function attached() {
            _get(Object.getPrototypeOf(Corner.prototype), 'attached', this).call(this);
            this.setup_events();
            this.graph.setup_events();
        }
    }, {
        key: 'detached',
        value: function detached() {
            _get(Object.getPrototypeOf(Corner.prototype), 'detached', this).call(this);
            this.clear_events();
            this.graph.clear_events();
        }

        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: 'isExterior',
        get: function get() {
            return this.left === this.set.left || this.right === this.set.right || this.top === this.set.top || this.bottom === this.set.bottom;
        }
    }], [{
        key: 'lesserOf',
        value: function lesserOf(a, b) {
            //if( a.x === b.x )
            //    return a.y > b.y ? b : a;
            //if( a.y === b.y )
            //    return a.x > b.x ? b : a;
            return a;
        }
    }, {
        key: 'greaterOf',
        value: function greaterOf(a, b) {
            //if( a.x === b.x )
            //    return a.y < b.y ? b : a;
            //if( a.y === b.y )
            //    return a.x < b.x ? b : a;
            return b;
        }
    }, {
        key: 'distance',
        value: function distance(a, b) {
            if (!a && !b) return NaN;
            if (!a || !b) return Infinity;
            if (a.x === b.x) return Math.abs(b.y - a.y);
            return Math.abs(b.x - a.x);
        }
        ////////////////////////////////////////////////////////////////////////////

    }]);

    return Corner;
}(_csscomponent.CSSComponent);
////////////////////////////////////////////////////////////////////////////////


Corner.register();
////////////////////////////////////////////////////////////////////////////////

},{"../../lib/functional.js":6,"../csscomponent.js":12,"./graph.js":19,"./neighbors.js":20}],18:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Edge = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _functional = require('../../lib/functional.js');

var _csscomponent = require('../csscomponent.js');

var _corner = require('./corner.js');

var _graph = require('./graph.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////
var ORIENT = {
    VERTICAL: 0,
    HORIZONTAL: 1
};
////////////////////////////////////////////////////////////////////////////////

var Edge = exports.Edge = function (_CSSComponent) {
    _inherits(Edge, _CSSComponent);

    function Edge() {
        _classCallCheck(this, Edge);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Edge).apply(this, arguments));
    }

    _createClass(Edge, [{
        key: 'initialize',
        value: function initialize(_ref) {
            var _this2 = this;

            var parent = _ref.parent;
            var a = _ref.a;
            var b = _ref.b;

            _get(Object.getPrototypeOf(Edge.prototype), 'initialize', this).apply(this, arguments);
            this.set = parent;
            this.graph = new _graph.Graph(this);
            this.orientation = a.x === b.x ? ORIENT.VERTICAL : ORIENT.HORIZONTAL;
            this.corner = {
                first: a, //Corner.lesserOf(a,b),
                last: b //Corner.greaterOf(a,b)
            };
            this.callback = {
                reposition: (0, _functional.bind)(this, this.render)
            };
            parent.append(this);
            this.addEventListener("click", function () {
                return console.log(_this2.corner);
            });

            //this.setup_events();
            return this;
        }
    }, {
        key: 'is',
        value: function is(f, l) {
            return this.first.id === f.id && this.last.id === l.id;
        }
    }, {
        key: 'setup_events',
        value: function setup_events() {
            this.corner.first.event.on('move', this.callback.reposition);
            this.corner.last.event.on('move', this.callback.reposition);
            return this;
        }
    }, {
        key: 'clear_events',
        value: function clear_events() {
            this.corner.first.event.clear('move', this.callback.reposition);
            this.corner.last.event.clear('move', this.callback.reposition);
            return this;
        }
    }, {
        key: 'attached',
        value: function attached() {
            _get(Object.getPrototypeOf(Edge.prototype), 'attached', this).call(this);
            this.setup_events();
            this.graph.setup_events();
        }
    }, {
        key: 'render',
        value: function render() {

            var f = void 0,
                l = void 0,
                h = void 0,
                v = void 0;
            f = this.corner.first;
            l = this.corner.last;
            h = this.horizontal ? 1 : 0;
            v = this.vertical ? 1 : 0;


            this.x = h * f.right + v * f.left;
            this.y = h * f.top + v * f.bottom;
            this.width = h * (l.left - f.right) + v * this.set._margin;
            this.height = h * this.set._margin + v * (l.top - f.bottom);

            return this;
        }
    }, {
        key: 'split',
        value: function split() {
            var l = this.corner.last,
                m = this.set._margin;

            if (this.vertical) {
                this.last = this.set.corner(this.left, (this.bottom - this.top - m) * 0.5);
                return { prev: this, midpoint: this.last, next: this.set.edge(this.last, l) };
            }
            if (this.horizontal) {
                this.last = this.set.corner((this.right - this.left - m) * 0.5, this.top);
                return { prev: this, midpoint: this.last, next: this.set.edge(this.last, l) };
            }
            return { prev: this, midpoint: null, next: null };
        }
    }, {
        key: 'isExterior',
        get: function get() {
            return this.corner.first.isExterior && this.corner.last.isExterior;
        }
    }, {
        key: 'first',
        get: function get() {
            return this.corner.first;
        },
        set: function set(c) {
            this.clear_events();
            this.corner.first = c;
            this.setup_events();
            this.render();
        }
    }, {
        key: 'last',
        get: function get() {
            return this.corner.last;
        },
        set: function set(c) {
            this.clear_events();
            this.corner.last = c;
            this.setup_events();
            this.render();
        }
    }, {
        key: 'vertical',
        get: function get() {
            return this.orientation === ORIENT.VERTICAL;
        }
    }, {
        key: 'horizontal',
        get: function get() {
            return this.orientation === ORIENT.HORIZONTAL;
        }
    }]);

    return Edge;
}(_csscomponent.CSSComponent);
////////////////////////////////////////////////////////////////////////////////


Edge.register();

},{"../../lib/functional.js":6,"../csscomponent.js":12,"./corner.js":17,"./graph.js":19}],19:[function(require,module,exports){
"use strict";
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Graph = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
////////////////////////////////////////////////////////////////////////////////


var _functional = require("../../lib/functional.js");

var _mouse = require("../../lib/mouse.js");

var _csscomponent = require("../csscomponent.js");

var _corner = require("./corner.js");

var _edge = require("./edge.js");

var _panel = require("./panel.js");

var _panels = require("./panels.js");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////////////

var move = {
    up: function up(c) {
        return c.neighbors.up.corner;
    },
    down: function down(c) {
        return c.neighbors.down.corner;
    },
    left: function left(c) {
        return c.neighbors.left.corner;
    },
    right: function right(c) {
        return c.neighbors.right.corner;
    }
};
var add = {
    up: function up(g, c) {
        g.push(c, c.neighbors.up.edge);
    },
    down: function down(g, c) {
        g.push(c, c.neighbors.down.edge);
    },
    left: function left(g, c) {
        g.push(c, c.neighbors.left.edge);
    },
    right: function right(g, c) {
        g.push(c, c.neighbors.right.edge);
    }
};

var Graph = exports.Graph = function () {
    function Graph(origin) {
        _classCallCheck(this, Graph);

        this.origin = origin;

        this.corners = [];
        this.edges = [];

        this.built = false;
        this.callback = {
            enter: this._enter.bind(this),
            exit: this._exit.bind(this),
            drag_start: this._drag_start.bind(this),
            drag_end: this._drag_end.bind(this),
            drag: this._drag.bind(this)
        };
    }
    ////////////////////////////////////////////////////////////////////////////


    _createClass(Graph, [{
        key: "build",
        value: function build() {
            this.corners = [];
            this.edges = [];
            switch (this.origin.type) {
                case _corner.Corner:
                    this.push(this.origin);
                    this.search_from_corner(this.origin);
                    break;
                case _edge.Edge:
                    this.push(this.origin);
                    this.search_from_edge(this.origin);
                    break;
                case _panel.Panel:
                    //this.search_panel_perimeter(this.origin);
                    break;
            }
            this.built = true;
            return this;
        }
        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: "mark",
        value: function mark(prop) {
            if (!this.built) this.build();
            this.corners.forEach(function (e) {
                return e.setAttribute(prop, "");
            });
            this.edges.forEach(function (e) {
                return e.setAttribute(prop, "");
            });
        }
    }, {
        key: "unmark",
        value: function unmark(prop) {
            this.corners.forEach(function (e) {
                return e.removeAttribute(prop);
            });
            this.edges.forEach(function (e) {
                return e.removeAttribute(prop);
            });
        }
        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: "push",
        value: function push(e) {
            if (e) switch (e.type) {
                case _corner.Corner:
                    this.corners.push(e);
                    break;
                case _edge.Edge:
                    this.edges.push(e);
                    break;
                case _panel.Panel:
                    //this.search_panel_perimeter(this.origin);
                    break;
            }

            for (var _len = arguments.length, rest = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                rest[_key - 1] = arguments[_key];
            }

            if (rest.length && rest[0]) {
                this.push.apply(this, rest);
            }
        }

        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: "setup_events",
        value: function setup_events() {
            this.origin.event.on("mousedown", this.callback.drag_start);
            //this.origin.event.on( "mouseup",    this.callback.drag_end );
            this.origin.event.on("mouseenter", this.callback.enter);
            this.origin.event.on("mouseleave", this.callback.exit);
        }
    }, {
        key: "clear_events",
        value: function clear_events() {
            this.origin.event.clear("mousedown", this.callback.drag_start);
            //this.origin.event.clear( "mouseup",    this.callback.drag_end );
            this.origin.event.clear("mouseenter", this.callback.enter);
            this.origin.event.clear("mouseleave", this.callback.exit);
        }
    }, {
        key: "_enter",
        value: function _enter() {
            this.mark("active");
        }
    }, {
        key: "_exit",
        value: function _exit() {
            this.unmark("active");
        }
    }, {
        key: "_drag_start",
        value: function _drag_start() {
            this.unmark("active");
            this.mark("drag");
            this.origin.event.clear("mouseenter", this.callback.enter);
            this.origin.event.clear("mouseleave", this.callback.exit);
            _mouse.mouse.on("move", this.callback.drag);
            _mouse.mouse.on("up", this.callback.drag_end);
            _mouse.mouse.start();
        }
    }, {
        key: "_drag_end",
        value: function _drag_end() {

            this.unmark("drag");
            //this.mark("active");
            this.origin.event.on("mouseenter", this.callback.enter);
            this.origin.event.on("mouseleave", this.callback.exit);

            _mouse.mouse.clear("move", this.callback.drag).clear("up", this.callback.drag_end).stop();
        }
    }, {
        key: "_drag",
        value: function _drag(p) {
            if (this.origin.type === _panel.Panel) return;
            var s = this.origin.set;
            var o = this.corner;
            var distance = _corner.Corner.distance;
            var S = s._snap.func;
            var nx = S(p.x);
            var ny = S(p.y);
            var ox = this.origin.x;
            var oy = this.origin.y;
            var dx = nx - ox;
            var dy = ny - oy;
            var U = move.up;
            var D = move.down;
            var L = move.left;
            var R = move.right;
            var V = Graph.vertical_check;
            var H = Graph.horizontal_check;


            if (nx !== ox && this.horizontalMove) {
                if (dx > 0 && V(o, function (x) {
                    return distance(x, R(x)) > s.snap;
                }) || dx < 0 && V(o, function (x) {
                    return distance(x, L(x)) > s.snap;
                })) {
                    Graph.vertical_apply(o, function (x) {
                        return x.position(nx, x.y);
                    });
                }
            }
            if (ny !== oy && this.verticalMove) {
                if (dy > 0 && H(o, function (x) {
                    return distance(x, D(x)) > s.snap;
                }) || dy < 0 && H(o, function (x) {
                    return distance(x, U(x)) > s.snap;
                })) {
                    Graph.horizontal_apply(o, function (x) {
                        return x.position(x.x, ny);
                    });
                }
            }
        }

        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: "search_panel_perimeter",
        value: function search_panel_perimeter(p, func) {
            if (p) {
                Graph.apply(p.corners.a, move.right, func || (0, _functional.partial)(add.right)(this), p.corners.b);
                Graph.apply(p.corners.b, move.down, func || (0, _functional.partial)(add.down)(this), p.corners.c);
                Graph.apply(p.corners.c, move.left, func || (0, _functional.partial)(add.left)(this), p.corners.d);
                Graph.apply(p.corners.d, move.up, func || (0, _functional.partial)(add.up)(this), p.corners.a);
            }
        }
    }, {
        key: "search_from_corner",
        value: function search_from_corner(c, func) {
            var stop = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            if (c) {
                Graph.apply(c, move.up, func || (0, _functional.partial)(add.up)(this), stop);
                Graph.apply(c, move.down, func || (0, _functional.partial)(add.down)(this), stop);
                Graph.apply(c, move.left, func || (0, _functional.partial)(add.left)(this), stop);
                Graph.apply(c, move.right, func || (0, _functional.partial)(add.right)(this), stop);
            }
        }
    }, {
        key: "search_from_edge",
        value: function search_from_edge(e, func) {
            var stop = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

            if (e) {
                if (e.vertical) {
                    Graph.apply(e.first, move.up, func || (0, _functional.partial)(add.up)(this), stop);
                    Graph.apply(e.last, move.down, func || (0, _functional.partial)(add.down)(this), stop);
                }
                if (e.horizontal) {
                    Graph.apply(e.first, move.left, func || (0, _functional.partial)(add.left)(this), stop);
                    Graph.apply(e.last, move.right, func || (0, _functional.partial)(add.right)(this), stop);
                }
            }
        }
        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: "corner",
        get: function get() {
            switch (this.origin.type) {
                case _corner.Corner:
                    return this.origin;
                case _edge.Edge:
                    return this.origin.first;
                case _panel.Panel:
                    return this.origin.corners.a;
            }
            return null;
        }
    }, {
        key: "verticalMove",
        get: function get() {
            var O = this.origin;
            var T = this.origin.type;
            return T === _corner.Corner || T === _edge.Edge && O.horizontal;
        }
    }, {
        key: "horizontalMove",
        get: function get() {
            var O = this.origin;
            var T = this.origin.type;
            return T === _corner.Corner || T === _edge.Edge && O.vertical;
        }
    }], [{
        key: "apply",
        value: function apply(c, next, func) {
            var stop = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

            if (c && c !== stop) {
                func(c);
                Graph.apply(next(c), next, func, stop);
            }
        }
    }, {
        key: "vertical_apply",
        value: function vertical_apply(c, func) {
            var su = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var sd = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

            Graph.apply(c, move.up, func, su);
            Graph.apply(move.down(c), move.down, func, su);
        }
    }, {
        key: "horizontal_apply",
        value: function horizontal_apply(c, func) {
            var sl = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var sr = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

            Graph.apply(c, move.left, func, sl);
            Graph.apply(move.right(c), move.right, func, sr);
        }
        ////////////////////////////////////////////////////////////////////////////

    }, {
        key: "check",
        value: function check(c, next, cond) {
            var stop = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];

            if (c && c !== stop) {
                return cond(c) && Graph.check(next(c), next, cond, stop);
            }
            return true;
        }
    }, {
        key: "vertical_check",
        value: function vertical_check(c, cond) {
            var su = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var sd = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
            var u = move.up;
            var d = move.down;
            var l = move.left;
            var r = move.right;

            return Graph.check(c, u, cond, su) && Graph.check(d(c), d, cond, sd);
        }
    }, {
        key: "horizontal_check",
        value: function horizontal_check(c, cond) {
            var sl = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var sr = arguments.length <= 3 || arguments[3] === undefined ? null : arguments[3];
            var u = move.up;
            var d = move.down;
            var l = move.left;
            var r = move.right;

            return Graph.check(c, l, cond, sl) && Graph.check(r(c), r, cond, sr);
        }
        ////////////////////////////////////////////////////////////////////////////

    }]);

    return Graph;
}();

////////////////////////////////////////////////////////////////////////////////

},{"../../lib/functional.js":6,"../../lib/mouse.js":9,"../csscomponent.js":12,"./corner.js":17,"./edge.js":18,"./panel.js":21,"./panels.js":22}],20:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Neighbors = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _functional = require('../../lib/functional.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////////////

var Neighbors = exports.Neighbors = function () {
    function Neighbors(parent) {
        _classCallCheck(this, Neighbors);

        this.parent = parent;
        this._u = {
            edge: null,
            corner: null
        };
        this._d = {
            edge: null,
            corner: null
        };
        this._l = {
            edge: null,
            corner: null
        };
        this._r = {
            edge: null,
            corner: null
        };
    }

    _createClass(Neighbors, [{
        key: 'up',
        get: function get() {
            return this._u;
        },
        set: function set(new_corner) {
            /*let current_corner  = this.parent;
            let existing_corner = this._u.corner;
            let existing_edge   = this._u.edge;
            
            if( existing_corner ) existing_corner.neighbors._d.corner = new_corner;
            //new_corner.neighbors._u.corner      = existing_corner;
            new_corner.neighbors._d.corner      = current_corner;
            current_corner.neighbors._u.corner  = new_corner;
            
            if( existing_edge   ) existing_edge.last = new_corner;
            let edge = this.parent.set.edge( new_corner, current_corner );
            current_corner.neighbors._u.edge = edge;
            new_corner.neighbors._d.edge     = edge;
            */
            this._u.corner = new_corner;
        }
    }, {
        key: 'down',
        get: function get() {
            return this._d;
        },
        set: function set(new_corner) {
            var current_corner = this.parent;
            var existing_corner = this._d.corner;
            var existing_edge = this._d.edge;

            if (existing_corner) existing_corner.neighbors._u.corner = new_corner;
            //new_corner.neighbors._d.corner      = existing_corner;
            new_corner.neighbors._u.corner = current_corner;
            current_corner.neighbors._d.corner = new_corner;

            if (existing_edge) existing_edge.last = new_corner;

            var edge = this.parent.set.edge(current_corner, new_corner);
            current_corner.neighbors._d.edge = edge;
            new_corner.neighbors._u.edge = edge;
            this._d.corner = new_corner;
        }
    }, {
        key: 'left',
        get: function get() {
            return this._l;
        },
        set: function set(new_corner) {
            /*
               let current_corner  = this.parent;
               let existing_corner = this._l.corner;
               let existing_edge   = this._l.edge;
               
               if( existing_corner ) existing_corner.neighbors._r.corner = new_corner;
               new_corner.neighbors._l.corner      = existing_corner;
               new_corner.neighbors._r.corner      = current_corner;
               current_corner.neighbors._l.corner  = new_corner;
               
               if( existing_edge   ) existing_edge.last = new_corner;
               let edge = this.parent.set.edge( new_corner,current_corner );
               current_corner.neighbors._l.edge = edge;
               new_corner.neighbors._r.edge     = edge;*/
            this._l.corner = new_corner;
        }
    }, {
        key: 'right',
        get: function get() {
            return this._r;
        },
        set: function set(new_corner) {

            var current_corner = this.parent;
            var existing_corner = this._r.corner;
            var existing_edge = this._r.edge;

            if (existing_corner) existing_corner.neighbors._l.corner = new_corner;

            //new_corner.neighbors._r.corner      = existing_corner;
            new_corner.neighbors._l.corner = current_corner;
            current_corner.neighbors._r.corner = new_corner;

            if (existing_edge) existing_edge.last = new_corner;
            var edge = this.parent.set.edge(current_corner, new_corner);
            current_corner.neighbors._r.edge = edge;
            new_corner.neighbors._l.edge = edge;

            this._r.corner = new_corner;
        }
    }]);

    return Neighbors;
}();
////////////////////////////////////////////////////////////////////////////////

},{"../../lib/functional.js":6}],21:[function(require,module,exports){
"use strict";
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Panel = undefined;

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
////////////////////////////////////////////////////////////////////////////////


var _functional = require("../../lib/functional.js");

var _csscomponent = require("../csscomponent.js");

var _corner = require("./corner.js");

var _graph = require("./graph.js");

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

////////////////////////////////////////////////////////////////////////////////

var Corners = function () {
    function Corners(parent) {
        _classCallCheck(this, Corners);

        this.panel = parent;
        this._a = this._b = null;
        this._c = this._d = null;
    }

    _createClass(Corners, [{
        key: "bind",
        value: function bind(_ref) {
            var a = _ref.a;
            var b = _ref.b;
            var c = _ref.c;
            var d = _ref.d;

            this.top(a, b, true);
            this.right(b, c, true);
            this.bottom(c, d, true);
            this.left(a, d, true);
            return this.link();
        }
    }, {
        key: "render",
        value: function render() {
            if (this._a) this._a.render();
            if (this._b) this._b.render();
            if (this._c) this._c.render();
            if (this._d) this._d.render();
        }
    }, {
        key: "replace",
        value: function replace(source, target) {
            if (source) {
                target.neighbors._r.corner = source.neighbors._r.corner;
                target.neighbors._l.corner = source.neighbors._l.corner;
                target.neighbors._u.corner = source.neighbors._u.corner;
                target.neighbors._d.corner = source.neighbors._d.corner;

                target.neighbors._r.edge = source.neighbors._r.edge;
                target.neighbors._l.edge = source.neighbors._l.edge;
                target.neighbors._u.edge = source.neighbors._u.edge;
                target.neighbors._d.edge = source.neighbors._d.edge;
            }
            return target;
        }
    }, {
        key: "top",
        value: function top(a, b, l) {
            this._a = a;
            this._b = b;
            //a.neighbors._r.corner = b;
            //b.neighbors._l.corner = a;

            return this.link(l);
        }
    }, {
        key: "bottom",
        value: function bottom(c, d, l) {
            this._c = c;
            this._d = d;
            //d.neighbors._r.corner = c;
            //c.neighbors._l.corner = d;
            return this.link(l);
        }
    }, {
        key: "left",
        value: function left(a, d, l) {
            this._a = a;
            this._d = d;
            //a.neighbors._d.corner = d;
            //d.neighbors._u.corner  = a;
            return this.link(l);
        }
    }, {
        key: "right",
        value: function right(b, c, l) {
            this._b = b;
            this._c = c;
            //b.neighbors._d.corner = c;
            //c.neighbors._u.corner = b;
            return this.link(l);
        }
    }, {
        key: "link",
        value: function link(abort) {
            if (abort) return this;

            var a = this._a;
            var b = this._b;
            var c = this._c;
            var d = this._d;
            var _ref2 = [b, d];
            a.neighbors.right = _ref2[0];
            a.neighbors.down = _ref2[1];
            var _ref3 = [a, c];
            b.neighbors.left = _ref3[0];
            b.neighbors.down = _ref3[1];
            var _ref4 = [d, b];
            c.neighbors.left = _ref4[0];
            c.neighbors.up = _ref4[1];
            var _ref5 = [c, a];
            d.neighbors.right = _ref5[0];
            d.neighbors.up = _ref5[1];


            return this;
        }
    }, {
        key: "a",
        get: function get() {
            return this._a;
        },
        set: function set(c) {
            this._a = this.repalce(this._a, c);
        }
    }, {
        key: "b",
        get: function get() {
            return this._b;
        },
        set: function set(c) {
            this._b = this.repalce(this._b, c);
        }
    }, {
        key: "c",
        get: function get() {
            return this._c;
        },
        set: function set(c) {
            this._c = this.repalce(this._c, c);
        }
    }, {
        key: "d",
        get: function get() {
            return this._d;
        },
        set: function set(c) {
            this._d = this.repalce(this._d, c);
        }
    }]);

    return Corners;
}();

var Panel = exports.Panel = function (_CSSComponent) {
    _inherits(Panel, _CSSComponent);

    function Panel() {
        _classCallCheck(this, Panel);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Panel).apply(this, arguments));
    }

    _createClass(Panel, [{
        key: "initialize",
        value: function initialize(_ref6) {
            var _ref7,
                _this2 = this;

            var parent = _ref6.parent;
            var a = _ref6.a;
            var b = _ref6.b;
            var c = _ref6.c;
            var d = _ref6.d;

            _get(Object.getPrototypeOf(Panel.prototype), "initialize", this).apply(this, arguments);
            this.set = parent;
            this.graph = new _graph.Graph(this);
            this.corners = (_ref7 = new Corners(this)).bind.apply(_ref7, arguments);
            this.callback = {
                resize: (0, _functional.bind)(this, this.render)
            };

            this.position(a.right, a.bottom);
            this.size(c.left - a.right, c.top - a.bottom);

            parent.append(this);
            this.addEventListener("click", function () {
                return console.log(_this2.corners);
            });
            return this;
        }
    }, {
        key: "setup_events",
        value: function setup_events() {
            this.event.on("split", this.callback.resize);
            this.corners.a.event.on("move", this.callback.resize);
            this.corners.b.event.on("move", this.callback.resize);
            this.corners.c.event.on("move", this.callback.resize);
            this.corners.d.event.on("move", this.callback.resize);
            return this;
        }
    }, {
        key: "clear_events",
        value: function clear_events() {
            this.event.clear("split", this.callback.resize);
            this.corners.a.event.clear("move", this.callback.resize);
            this.corners.b.event.clear("move", this.callback.resize);
            this.corners.c.event.clear("move", this.callback.resize);
            this.corners.d.event.clear("move", this.callback.resize);
            return this;
        }
    }, {
        key: "render",
        value: function render() {
            var a = this.corners.a;
            var c = this.corners.c;


            this.position(a.right, a.bottom);
            this.size(c.left - a.right, c.top - a.bottom);

            return this;
        }
    }, {
        key: "attached",
        value: function attached() {
            _get(Object.getPrototypeOf(Panel.prototype), "attached", this).call(this);
            this.setup_events();
            this.graph.setup_events();
        }
    }, {
        key: "split",
        value: function split() {
            var a = this.corners.a;
            var b = this.corners.b;
            var c = this.corners.c;
            var d = this.corners.d;

            var x = a.right + (this.width - this.set._margin) / 2;

            var ab = this.set.corner(x, a.top);
            var dc = this.set.corner(x, d.top);

            this.clear_events();
            this.corners.right(ab, dc);
            this.setup_events();

            this.event.emit("split");

            return this.set.panel(ab, b, c, dc).render();
        }
    }, {
        key: "splitv",
        value: function splitv() {
            var a = this.corners.a;
            var b = this.corners.b;
            var c = this.corners.c;
            var d = this.corners.d;

            var y = a.bottom + (this.height - this.set._margin) / 2;

            var ad = this.set.corner(a.left, y);
            var bc = this.set.corner(b.left, y);

            this.clear_events();
            this.corners.bottom(bc, ad);
            this.setup_events();

            this.event.emit("split");

            return this.set.panel(ad, bc, c, d).render();
        }
    }]);

    return Panel;
}(_csscomponent.CSSComponent);
////////////////////////////////////////////////////////////////////////////////


Panel.register();

},{"../../lib/functional.js":6,"../csscomponent.js":12,"./corner.js":17,"./graph.js":19}],22:[function(require,module,exports){
'use strict';
////////////////////////////////////////////////////////////////////////////////

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Panels = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _functional = require('../../lib/functional.js');

var _math = require('../../lib/math.js');

var _component = require('../component.js');

var _csscomponent = require('../csscomponent.js');

var _corner = require('./corner.js');

var _edge = require('./edge.js');

var _panel = require('./panel.js');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
////////////////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////

var Panels = exports.Panels = function (_CSSComponent) {
    _inherits(Panels, _CSSComponent);

    function Panels() {
        _classCallCheck(this, Panels);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(Panels).apply(this, arguments));
    }

    _createClass(Panels, [{
        key: 'initialize',
        value: function initialize(_ref) {
            var x = _ref.x;
            var y = _ref.y;
            var width = _ref.width;
            var height = _ref.height;
            var margin = _ref.margin;
            var snap = _ref.snap;

            _get(Object.getPrototypeOf(Panels.prototype), 'initialize', this).apply(this, arguments);

            this._dirty = false;
            this._snap = null;

            this._snap = { value: null, func: null };
            this._scale = { x: (0, _functional.memoize)((0, _math.scale)(width, width)), y: (0, _functional.memoize)((0, _math.scale)(height, height)) };
            this._limit = { x: (0, _functional.memoize)((0, _math.limit)(x, x + width - margin)), y: (0, _functional.memoize)((0, _math.limit)(y, y + height - margin)) };

            this._edges = [];
            this._corners = [];
            this._panels = [];
            this._margin = margin || 1;

            this.size(width, height);
            this.position(x, y);
            this.snap = snap || 1;

            return this;
        }
    }, {
        key: 'render',
        value: function render() {}
    }, {
        key: 'size',
        value: function size(w, h) {
            var m = this._margin;
            this._scale.x = (0, _functional.memoize)((0, _math.scale)((this.width || w) - m, w - m));
            this._scale.y = (0, _functional.memoize)((0, _math.scale)((this.height || h) - m, h - m));

            _get(Object.getPrototypeOf(Panels.prototype), 'size', this).call(this, w, h);

            this._limit.x = (0, _functional.memoize)((0, _math.limit)(this.x, this.x + w));
            this._limit.y = (0, _functional.memoize)((0, _math.limit)(this.y, this.y + h));

            return this.event.emit('resize');
        }

        // for scaling corner positions when set size changes

    }, {
        key: 'scaleX',
        value: function scaleX(value) {
            var limit = this._limit.x;
            var snap = this._snap.func;
            var scale = this._scale.x;

            var x = limit(snap(scale(value)));
            return x;
        }
    }, {
        key: 'scaleY',
        value: function scaleY(value) {
            var limit = this._limit.y;
            var snap = this._snap.func;
            var scale = this._scale.y;

            return limit(snap(scale(value)));
        }
    }, {
        key: 'corner',
        value: function corner(x, y) {
            x = this._snap.func(x);
            y = this._snap.func(y);
            return this._corners.find(function (c) {
                return c.is(x, y);
            }) || this._corners[this._corners.push(_component.Component.create(_corner.Corner)({ parent: this, x: x, y: y })) - 1];
        }
    }, {
        key: 'edge',
        value: function edge(a, b) {
            return this._edges.find(function (e) {
                return e.is(a, b);
            }) || this._edges[this._edges.push(_component.Component.create(_edge.Edge)({ parent: this, a: a, b: b })) - 1];
        }
    }, {
        key: 'panel',
        value: function panel(a, b, c, d) {
            return this._panels[this._panels.push(_component.Component.create(_panel.Panel)({ parent: this, a: a, b: b, c: c, d: d })) - 1];
        }
    }, {
        key: 'defaultpanel',
        value: function defaultpanel() {
            var m = this._margin;
            var x = this.x;
            var y = this.y;
            var w = this.width - m;
            var h = this.height - m;
            var a = this.corner(x, y);
            var b = this.corner(x + w, y);
            var c = this.corner(x + w, y + h);
            var d = this.corner(x, y + h);

            return this.panel(a, b, c, d);
        }
    }, {
        key: 'snap',
        get: function get() {
            return this._snap.value;
        },
        set: function set(v) {
            this._snap.value = v;
            this._snap.func = (0, _functional.memoize)((0, _math.nearest)(this.snap));
        }
    }]);

    return Panels;
}(_csscomponent.CSSComponent);
////////////////////////////////////////////////////////////////////////////////


Panels.register();
////////////////////////////////////////////////////////////////////////////////
//  let p = Component.create( Panels )({ x:0, y:0, margin:8, width: 800, height:800, snap: 64 });

},{"../../lib/functional.js":6,"../../lib/math.js":8,"../component.js":11,"../csscomponent.js":12,"./corner.js":17,"./edge.js":18,"./panel.js":21}],23:[function(require,module,exports){
"use strict";

var _component = require("../app/ui/component.js");

var _bar = require("../app/ui/menu/bar.js");

var _dropdown = require("../app/ui/menu/dropdown.js");

var _item = require("../app/ui/menu/item.js");

var _icon = require("../app/ui/icon/icon.js");

var _panels = require("../app/ui/panel/panels.js");

var _mouse = require("../app/lib/mouse.js");

var Path = require("path");
var logi = require("lib/lib/functional/logical");
var part = require("lib/lib/functional/partialApplication");

function getDocumentHeight() {
    return Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
}
function getDocumentWidth() {
    return Math.max(document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);
}
function getApp(name, fn) {
    socket.emit("readFile", Path.join("apps", name, "index.html"), function (err, f) {
        if (err) fn(err);
        f = "<script src='" + Path.join("/apps", name, "index.js") + "'></script>" + f;
        fn(null, f);
    });
}
window.onload = function () {
    var apps = new Set();
    var socket = io.connect("/files");
    var panel = _component.Component.create(_panels.Panels)({
        x: 0,
        y: 0,
        margin: 16,
        width: getDocumentWidth(),
        height: getDocumentHeight(),
        snap: 8
    });
    function insertAppV(p, text) {
        var split = p.splitv();
        apps.add(split);
        split.innerHTML = text;
        return split;
    }
    function insertAppV(p, text) {
        var split = p.split();
        apps.add(split);
        split.innerHTML = text;
        return split;
    }
    document.body.appendChild(panel);
    var d = window.mainPanel = panel.defaultpanel();
    getApp("login", function (err, app) {
        if (err) throw err;
        $(d).append($(app));
    });
};

},{"../app/lib/mouse.js":9,"../app/ui/component.js":11,"../app/ui/icon/icon.js":13,"../app/ui/menu/bar.js":14,"../app/ui/menu/dropdown.js":15,"../app/ui/menu/item.js":16,"../app/ui/panel/panels.js":22,"lib/lib/functional/logical":1,"lib/lib/functional/partialApplication":2,"path":3}]},{},[23]);
