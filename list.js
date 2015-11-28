'use strict';

class InfiniteList {
    constructor(f, subList, baseCase) {
        this.f = f !== undefined ? f.bind(this) : i => i;
        this.subList = subList !== undefined ? subList : {get: i => () => i};
        this.sparceArray = {};
        for (let key in baseCase) {
            this.sparceArray[key] = () => baseCase[key];
        }
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
            };
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

    take(n) {
        return new Array(n).fill().map((_, i) => this.get(i));
    }

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
                        this.sparceArray[Object.keys(this.sparceArray).length] = () => cur;
                    }
                }
                return this.get(i)();
            };
        }
    }
}


var List = {
    InfiniteList: InfiniteList,
    FilteredList: FilteredList
};

module.exports = List;
