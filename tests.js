'use strict';
// Feel free to write proper tests.
// I'd rather have a parser than unit test though.


var Lang = require('./func');
var List = require('./List');

/**
 * Synchronously block execution for a given amount of time.
 * Used to simulate expensive functions to help debug laziness.
 * @param  {Number} time Time in miliseconds to sleep.
 */
function sleep(time) {
    var stop = new Date().getTime();
    while(new Date().getTime() < stop + time) {}
}

// name f = \(i -> i * i)
// each print take 5 map \(sqrt i) filter \(i % 2 is 0) map f [..]
// compiles to:
var f = function(i) { return i * i; };
var ls1 = Lang.takeList(5, Lang.mapList(i => Math.sqrt(i), Lang.filterList(i => i % 10 === 0, Lang.mapList(f, new List.InfiniteList()))));

/*
Chain syntax
name x = chain [..]
    map \(i * i)
    filter \(i % 10 is 0)
    take 5
    reduce add 0
*/

var infLs = new List.InfiniteList();
var squared = Lang.mapList(i => i * i, infLs);
var filtered = Lang.filterList(i => i % 10 === 0, squared);
var rooted = Lang.mapList(i => Math.sqrt(i), filtered);
var ls = rooted.take(5);
console.log(ls.map(x => x()));
console.log(ls1.map(x => x()));
