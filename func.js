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
        return new Array(n).fill().map((_, i) => () => this.get(i));
    }

    // Not lazy
    takeRange(min, max) {
        return new Array(max - min).fill().map((_, i) => () => this.f(i + min));
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

var infLs = new InfiniteList();

// infLs.f = Language.composeAll(
//     i => i * i,
//     i => {sleep(500); return i;}
// );
//
// for (let k of infLs.iterRange(2, 8)) {
//     console.log(k());
// }
// console.log(infLs.sparceArray)
//
// let ls2 = Language.mapList(i => {console.log("Evaluating map");return i}, infLs)

var ls1 = Language.mapList(i => { sleep(500); return i }, infLs);

var filtered = new FilteredList(i => i % 2 === 0, ls1);
// for (let k of [0,1,2,3,4]) {
//     console.log(filtered.get(k)());
// }
// console.log(filtered.get(5)());
// console.log(filtered.get(2)());
// console.log(filtered.get(10)());

var thenMap = Language.mapList(i => i * i, filtered);
console.log(thenMap.get(3))
