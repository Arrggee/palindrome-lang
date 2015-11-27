'use strict';

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
        return new InfiniteList(f, list);
    },

    filterList(f, list) {
        return new FilteredList(f, list);
    },

    takeList(n, list) {
        return list.take(n);
    }
}

class Name {
    constructor(f) {
        this.val = null;
        this.f = f
    }
    evaluate() {
        if (this.val === null) {
            this.val = f();
        }
        return this.val;
    }
}

class InfiniteList {
    constructor(f, subList) {
        this.f = f != null ? f : i => i;
        this.sparceArray = {};
        this.subList = subList != null ? subList : {get: i => () => i};
    }

    get(i) {
        if (this.sparceArray.hasOwnProperty(i)) {
            return this.sparceArray[i];
        }
        else {
            let val = this.subList.get(i);
            let thunk = () => {
                let evaled = this.f(val());
                this.sparceArray[i] = () => evaled;
                return evaled;
            }
            this.sparceArray[i] = thunk;
            return thunk;
        }
    }

    iterRange(min, max) {
        let par = this;
        return {
            [Symbol.iterator]: function() {
                let index = min;
                return {
                    next: () => {
                        let value = par.get(index);
                        let done = index >= max;
                        index++;
                        return { value, done };
                    }
                };
            }
        };
    }

    // Not lazy
    take(n) {
        return new Array(n).fill().map((_, i) => this.get(i));
    }

    // Not lazy
    takeRange(min, max) {
        return new Array(max - min).fill().map((_, i) => () => this.get(i + min));
    }
}

class FilteredList extends InfiniteList {
    constructor(pred, subList) {
        super(pred, subList);
        this.evaluatedSoFar = 0;
    }

    get(i) {
        if (this.sparceArray.hasOwnProperty(i)) {
            return this.sparceArray[i];
        }
        else {
            return () => {
                while (Object.keys(this.sparceArray).length <= i) {
                    let cur = this.subList.get(this.evaluatedSoFar++)();
                    if (this.f(cur)) {
                        this.sparceArray[Object.keys(this.sparceArray).length] = () => cur
                    }
                }
                return this.get(i)();
            }
        }
    }
}

function sleep(time) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {}
}
// name f = \i -> i * i
var f = i => i * i;
// each print take 5 map \i -> sqrt i filter \i -> i % 2 is 0 map f [..]
// each(print, take(5, map(\i -> sqrt(i), filter(\i -> i % 2 is 0, map(f, [..])))))
var ls1 = Language.takeList(5, Language.mapList(i => Math.sqrt(i), Language.filterList(i => i % 10 === 0, Language.mapList(f, new InfiniteList()))));

var infLs = new InfiniteList();
var squared = Language.mapList(i => i * i, infLs);
var filtered = Language.filterList(i => i % 10 === 0, squared);
var rooted = Language.mapList(i => Math.sqrt(i), filtered);
var ls = rooted.take(5);
console.log(ls.map(x => x()));
console.log(ls1.map(x => x()));
