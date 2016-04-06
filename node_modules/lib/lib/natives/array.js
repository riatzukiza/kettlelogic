var fun = require("../functional");
var map = fun.functors.object.map;
var merge = fun.functors.object.merge;
var firstArgThis = map(fun.functors.array, (x,k) => {
    return function() {
        return x(this,...arguments)
    }
})
merge(Object.prototype,firstArgThis);
