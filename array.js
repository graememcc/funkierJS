(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var object = require('./object');
    var extract = object.extract;


    /*
     * length: Takes an array or string, and returns its length
     *
     */

    var length = extract('length');


    /*
     * getIndex: Takes an index and an array or string, and returns the element at
     *           the given index. Throws if the index is outside the range for the
     *           given object.
     *
     */

    var getIndex = curry(function(i, a) {
      if (i < 0 || i >= a.length)
        throw new TypeError('Index out of bounds');

      return a[i];
    });


    /*
     * head: Takes an array or string, and returns the first element. Throws when given
     *       an empty array or string.
     *
     */

    var head = getIndex(0);


    /*
     * last: Takes an array or string, and returns the last element. Throws when given
     *       an empty array or string.
     *
     */

    var last = curry(function(a) {
      return getIndex(a.length - 1, a);
    });


    var exported = {
      getIndex: getIndex,
      head: head,
      last: last,
      length: length
    };


    module.exports = exported;
  };


  // AMD/CommonJS foo
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      makeModule(require, exports, module);
    });
  } else {
    makeModule(require, exports, module);
  }
})();
