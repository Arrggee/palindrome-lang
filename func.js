'use strict';
var list = require('./list');

let Language = {
    compose(f, g) {
        return function() {
            return f.call(null, g.apply(null, arguments));
        };
    },

    composeAll() {
        let out = (i) => i;
        for (let f of arguments) {
            out = this.compose(out, f);
        }
        return out;
    },

    mapList(f, list) {
        return new list.InfiniteList(f, list);
    },

    filterList(f, list) {
        return new list.FilteredList(f, list);
    },

    takeList(n, list) {
        return list.take(n);
    }
};

class Name {
    constructor(f) {
        this.val = null;
        this.f = f;
    }
    evaluate() {
        if (this.val === null) {
            this.val = this.f();
        }
        return this.val;
    }
}

module.exports = Language;

function sleep(time) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {}
}
// name f = \i -> i * i
// var f = i => i * i;
// // each print take 5 map \i -> sqrt i filter \i -> i % 2 is 0 map f [..]
// // each(print, take(5, map(\i -> sqrt(i), filter(\i -> i % 2 is 0, map(f, [..])))))
// var ls1 = Language.takeList(5, Language.mapList(i => Math.sqrt(i), Language.filterList(i => i % 10 === 0, Language.mapList(f, new InfiniteList()))));
//
// var infLs = new InfiniteList();
// var squared = Language.mapList(i => i * i, infLs);
// var filtered = Language.filterList(i => i % 10 === 0, squared);
// var rooted = Language.mapList(i => Math.sqrt(i), filtered);
// var ls = rooted.take(5);
// console.log(ls.map(x => x()));
// console.log(ls1.map(x => x()));
