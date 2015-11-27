'use strict';

var lang = require('./func');
var list = require('./list');



console.log(typeof list.InfiniteList);
console.log(lang.compose(i => i*2, i => i*i)(5));
console.log(lang.take(5, lang.mapList(i => 2*i, new list.InfiniteList())).map(i => i()));
