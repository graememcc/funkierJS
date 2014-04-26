(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
    var getRealArity = base.getRealArity;

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
    var makeArrayPropCaller = function(arity, prop, fArity, options) {
      options = options || {};

      return curryWithArity(arity, function() {
        var args = [].slice.call(arguments);
        var f = args[0];
        var arr = last(args);
        var wasString = false;

        if (typeof(f) !== 'function' || (!Array.isArray(arr) && typeof(arr) !== 'string'))
          throw new TypeError('Called with invalid arguments');

        if (typeof(arr) === 'string') {
          wasString = true;
          arr = arr.split('');
        }

        if ('fixedArity' in options && getRealArity(f) !== options.fixedArity)
          throw new TypeError('Called with invalid arguments');
        else if ('minimumArity' in options && getRealArity(f) < options.minimumArity)
          throw new TypeError('Called with invalid arguments');

        args[0] = curryWithArity(fArity, f);
        var result = arr[prop].apply(arr, args.slice(0, args.length - 1));

        if ('returnSameType' in options && wasString)
          result = result.join('');

        return result;
      });
    };


    /*
     * map: Takes a function f, and an array or string arr. Returns an array, a, where for
     *      each element a[i], we have a[i] === f(arr[i]). Throws if the first argument is not
     *      a function, if the function does not have an arity of at least 1, or if the last argument
     *      is not an array or string.
     *
     */

    var map = makeArrayPropCaller(2, 'map', 1, {minimumArity : 1});


    /*
     * each: Takes a function f, and an array or string arr. Calls f with each member of the array
     *       in sequence, and returns undefined. Throws if the first argument is not a function,
     *       or if the second is not an array or string.
     *
     */

    var each = makeArrayPropCaller(2, 'forEach', 1);


    /*
     * filter: Takes a predicate function f, and an array or string arr. Returns an array or string containing
     *         those members of arr—in the same order as the original array—for which the predicate function
     *         returned true. Throws if f does not have arity 1.
     *
     */

    var filter = makeArrayPropCaller(2, 'filter', 1, {fixedArity: 1, returnSameType: true});


    /*
     * foldl: Takes three parameters: a function f of two arguments, an initial value, and an array or string.
     *        Traverses the array or string from left to right, calling the function with two arguments: the current
     *        accumulation value, and the current element. The value returned will form the next accumulation value,
     *        and foldl returns the value returned by the final call. The first call's accumulation parameter will
     *        be the given initial value. Throws if the first parameter is not a function of arity 2, or if the last
     *        parameter is not an array or string.
     *
     */

    var foldl = makeArrayPropCaller(3, 'reduce', 2, {fixedArity: 2});


    /*
     * foldl1: Takes two parameters: a function f of two arguments, and an array or string. Traverses the array from
     *         left to right from the second element, calling the function with two arguments: the current acccumulation
     *         value, and the current element. The value returned will form the next accumulation value, and foldl1 returns
     *         returns the value returned by the final call. The first call's accumulation parameter will be the first
     *         element of the array or string. Throws if the first parameter is not a function of arity 2, if the last
     *         parameter is not an array or string, or if the array or string is empty.
     *
     */

    var foldl1 = makeArrayPropCaller(2, 'reduce', 2, {fixedArity: 2});


    /*
     * foldr: Takes three parameters: a function f of two arguments, an initial value, and an array or string.
     *        Traverses the array or string from right to left, calling the function with two arguments: the current
     *        accumulation value, and the current element. The value returned will form the next accumulation value,
     *        and foldr returns the value returned by the final call. The first call's accumulation parameter will
     *        be the given initial value. Throws if the first parameter is not a function of arity 2, or if the last
     *        parameter is not an array or string.
     *
     */

    var foldr = makeArrayPropCaller(3, 'reduceRight', 2, {fixedArity: 2});


    /*
     * foldr1: Takes two parameters: a function f of two arguments, and an array or string. Traverses the array from
     *         right to left from the penultimate element, calling the function with two arguments: the current acccumulation
     *         value, and the current element. The value returned will form the next accumulation value, and foldr1 returns
     *         returns the value returned by the final call. The first call's accumulation parameter will be the last
     *         element of the array or string. Throws if the first parameter is not a function of arity 2, if the last
     *         parameter is not an array or string, or if the array or string is empty.
     *
     */

    var foldr1 = makeArrayPropCaller(2, 'reduceRight', 2, {fixedArity: 2});


    /*
     * every: Takes two parameters: a predicate function p that takes one argument, and an array or string. Calls the predicate
     *        with every element of the array or string, until either the predicate function returns false, or the end of the array
     *        or string is reached. Returns the last value returned by the predicate function. Throws if p is not a function of arity
     *        1, or if the second argument is not an array or string.
     */

    var every = makeArrayPropCaller(2, 'every', 1, {fixedArity: 1});


    /*
     * some: Takes two parameters: a predicate function p that takes one argument, and an array or string. Calls the predicate
     *       with every element of the array or string, until either the predicate function returns true, or the end of the array
     *       or string is reached. Returns the last value returned by the predicate function. Throws if p is not a function of arity
     *       1, or if the second argument is not an array or string.
     */

    var some = makeArrayPropCaller(2, 'some', 1, {fixedArity: 1});


    /*
     * maximum: Returns the largest element of the given array or string. Throws if the array or string is empty.
     *
     * Note: this function is intended to be used with arrays of numeric or character data. You are of course free to abuse
     * it, but it will likely not do what you expect.
     *
     */

    var maxFn = function(soFar, current) {
      if (current > soFar)
        return current;
      return soFar;
    };

    var maximum = foldl1(maxFn);


    /*
     * minimum: Returns the smallest element of the given array or string. Throws if the array or string is empty.
     *
     * Note: this function is intended to be used with arrays of numeric or character data. You are of course free to abuse
     * it, but it will likely not do what you expect.
     *
     */

    var minFn = function(soFar, current) {
      if (current < soFar)
        return current;
      return soFar;
    };

    var minimum = foldl1(minFn);


    var exported = {
      each: each,
      every: every,
      filter: filter,
      foldl: foldl,
      foldl1: foldl1,
      foldr: foldr,
      foldr1: foldr1,
      getIndex: getIndex,
      head: head,
      map: map,
      maximum: maximum,
      minimum: minimum,
      last: last,
      length: length,
      repeat: repeat,
      some: some
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
