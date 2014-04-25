(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
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
      if (isNaN(i) || i < 0 || i >= a.length)
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


    /*
     * repeat: Takes a length and a value, and returns an array of the given length, where
     *         each element is the given value. Throws if the given length is negative.
     *
     */

    var repeat = curry(function(l, value) {
      if (isNaN(l) || l < 0)
        throw new TypeError('Invalid length');

      var result = [];

      for (var i = 0; i < l; i++)
        result.push(value);

      return result;
    });


    // Utility function for generating functions
    var makeArrayPropCaller = function(arity, prop, fArity) {
      return curryWithArity(arity, function() {
        var args = [].slice.call(arguments);
        var f = args[0];
        var arr = last(args);

        if (typeof(f) !== 'function' || (!Array.isArray(arr) && typeof(arr) !== 'string'))
          throw new TypeError('map called with invalid arguments');

        if (typeof(arr) === 'string')
          arr = arr.split('');

        args[0] = curryWithArity(fArity, f);
        return arr[prop].apply(arr, args.slice(0, args.length - 1));
      });
    };


    /*
     * map: Takes a function f, and an array or string arr. Returns an array, a, where for
     *      each element a[i], we have a[i] === f(arr[i]). Throws if the first argument is not
     *      a function, or if the second is not an array or string.
     *
     */

    var map = makeArrayPropCaller(2, 'map', 1);


    /*
     * each: Takes a function f, and an array or string arr. Calls f with each member of the array
     *       in sequence, and returns undefined. Throws if the first argument is not a function,
     *       or if the second is not an array or string.
     *
     */

    var each = makeArrayPropCaller(2, 'forEach', 1);


    var exported = {
      each: each,
      getIndex: getIndex,
      head: head,
      map: map,
      last: last,
      length: length,
      repeat: repeat
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
