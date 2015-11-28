'use strict';
var List = require('./list');

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
        return new List.InfiniteList(f, list);
    },

    filterList(f, list) {
        return new List.FilteredList(f, list);
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
