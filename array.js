(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
    var getRealArity = base.getRealArity;

    var object = require('./object');
    var extract = object.extract;
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;

    var utils = require('./utils');
    var checkPositiveIntegral = utils.checkPositiveIntegral;
    var isArrayLike = utils.isArrayLike;

    var pair = require('./pair');
    var Pair = pair.Pair;


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
      i = checkPositiveIntegral(i);
      if (i >= a.length)
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
      l = checkPositiveIntegral(l);

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
     * maximum: Returns the largest element of the given array or string. Throws if the array or string is empty, or if the value is
     *          not an array or string.
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
     * minimum: Returns the smallest element of the given array or string. Throws if the array or string is empty, or if the value is
     *          not an array or string.
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


    /*
     * sum: Returns the sum of the elements of the given array. Throws if given a value that is not an array.
     *
     * Note: this function is intended to be used with arrays of numeric data. You are of course free to abuse this, but it won't
     * end well.
     *
     */

    var sumFn = function(soFar, current) {
      // Hack to prevent execution with strings
      if (typeof(current) === 'string')
        throw new TypeError('sum called on non-array value');

      return soFar + current;
    };

    var sum = foldl(sumFn, 0);


    /*
     * product: Returns the product of the elements of the given array. Throws if given a value that is not an array.
     *
     * Note: this function is intended to be used with arrays of numeric data. You are of course free to abuse this, but it won't
     * end well.
     *
     */

    var productFn = function(soFar, current) {
      // Hack to prevent execution with strings
      if (typeof(current) === 'string')
        throw new TypeError('sum called on non-array value');

      return soFar * current;
    };

    var product = foldl(productFn, 1);


    /*
     * element: Takes a value and an array or string. Returns true if the value is in the array or string (checked with strict
     *          identity) and false otherwise. Throws if the second argument is not an array or string.
     *
     */

    var element = curry(function(val, arr) {
      return some(base.strictEquals(val), arr);
    });


    /*
     * elementWith: A generalised version of element. Takes a predicate function p of one argument,  and an array or string. Returns true
     *              if there is an element in the array or string for which p returns true, and returns false otherwise. Throws if the first
     *              argument is not a function of arity 1, or the second argument is not an array or string.
     *
     */

    var elementWith = curry(function(p, arr) {
      return some(p, arr);
    });


    /*
     * range: Takes two numbers, a and b. Returns an array containing the arithmetic sequence of elements from a up to but not including b,
     *        each element increasing by 1. Throws a TypeError if b < a.
     *
     */

    var range = curry(function(a, b) {
      if (b < a)
        throw new TypeError('Incorrect bounds for range');

      var result = [];
      for (var i = a; i < b; i++)
        result.push(i);

      return result;
    });


    /*
     * rangeStep: Takes three numbers, a, step and b. Returns an array containing the arithmetic sequence of elements from a up to but not
     *            including b, the difference between each element being step. Throws a TypeError if the sequence will not terminate.
     *
     */

    var rangeStep = curry(function(a, step, b) {
      if ((step > 0 && b < a) || (step < 0 && b > a) || (step === 0 && b !== a))
        throw new TypeError('Incorrect bounds for range');

      var result = [];
      for (var i = a; a < b ? i < b : i > b; i += step)
        result.push(i);

      return result;
    });


    /*
     * take: Takes a count, and an array or string. Returns an array or string containing the first count elements of the given array or string.
     *       Throws if the last argument is not an array or string.
     *
     */

    var take = curry(function(count, arr) {
      count = checkPositiveIntegral(count);

      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      var wasString = typeof(arr) === 'string';
      if (wasString)
        arr = arr.split('');

      var result = arr.slice(0, count);
      if (wasString)
        result = result.join('');

      return result;
    });


    /*
     * drop: Takes a count, and an array or string. Returns an array or string with the first count elements of the given array or string removed.
     *       Throws if the last argument is not an array or string.
     *
     */

    var drop = curry(function(count, arr) {
      count = checkPositiveIntegral(count);

      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      var wasString = typeof(arr) === 'string';
      if (wasString)
        arr = arr.split('');

      var result = arr.slice(count);
      if (wasString)
        result = result.join('');

      return result;
    });


    /*
     * init: takes an array or string. Returns an array or string containing every element except the last. Throws if the array or string is empty,
     *       or if the argument is not an array or string.
     *
     */

    var init = curry(function(arr) {
      return take(length(arr) - 1, arr);
    });


    /*
     * tail: takes an array or string. Returns an array or string containing every element except the first. Throws if the array or string is empty,
     *       or if the argument is not an array or string.
     *
     */

    var tail = curry(function(arr) {
      if (arr.length === 0)
        throw new TypeError('Cannot take tail of empty array/string');

      return drop(1, arr);
    });


    /*
     * inits: Takes an array or string. Returns all the prefixes of the given array or string. Throws if the given value is not an array or
     *        string.
     *
     */

    var inits = curry(function(arr) {
      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      var r = range(0, length(arr) + 1);

      return map(function(v) {return take(v, arr);}, r);
    });


    /*
     * tails: Takes an array or string. Returns all the suffixes of the given array or string. Throws if the given value is not an array or
     *        string.
     *
     */

    var tails = curry(function(arr) {
      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      var r = range(0, length(arr) + 1);

      return map(function(v) {return drop(v, arr);}, r);
    });


    /*
     * copy: Takes an array, and returns a shallow copy. Throws a TypeError if the given value is not an array.
     *
     */

    var copy = callProp('slice');


    /*
     * slice: Takes two numbers, from and to, and an array or string. Returns the subarray or string containing the elements between these
     *        two points (inclusive at from, exclusive at to). If to is greater than the length of the object, then all values from from will
     *        be returned. Throws a TypeError if from or to are not positive integers, or if the last argument is not an array or string.
     *
     */

    var slice = curry(function(from, to, arr) {
      from = checkPositiveIntegral(from);
      to = checkPositiveIntegral(to);

      return take(to - from, drop(from, arr));
    });


    /*
     * takeWhile: Takes a predicate function p, and an array or string. Returns a new array or string containing the initial members of the
     *            given array/string for which the predicate returned true. Throws a TypeError if p is not a function of arity 1, or if the
     *            given value is not an array or string.
     *
     */

    var takeWhile = curry(function(p, arr) {
      if (typeof(p) !== 'function' || getRealArity(p) !== 1)
        throw new TypeError('Value is not a predicate function');

      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      var result = [];
      var wasString = typeof(arr) === 'string';
      var l = arr.length;
      var done = false;

      for (var i = 0; !done && i < l; i++) {
        if (p(arr[i]))
          result.push(arr[i]);
        else
          done = true;
      }

      if (wasString)
        result = result.join('');
      return result;
    });


    /*
     * dropWhile: Takes a predicate function p, and an array or string. Returns a new array or string containing the members of the array/string
     *            after the initial members for which the predicate returned true have been removed. Throws a TypeError if p is not a function
     *            of arity 1, or if the given value is not an array or string.
     *
     */

    var dropWhile = curry(function(p, arr) {
      if (typeof(p) !== 'function' || getRealArity(p) !== 1)
        throw new TypeError('Value is not a predicate function');

      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      var l = arr.length;
      var done = false;

      var i = 0;
      while (i < arr.length && p(arr[i]))
        i += 1;

      return arr.slice(i);
    });


    /*
     * prepend: takes a value, and an array or string, and returns a new array or string with the given value prepended. Throws if the second
     *          argument is not an array/string. Note: if the second argument is a string and the first is not, the value will be coerced to
     *          a string; you may not get the result you expect.
     *
     */

    var prepend = curry(function(v, arr) {
      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      if (Array.isArray(arr))
        return [v].concat(arr);

      return '' + v + arr;
    });


    /*
     * append: takes a value, and an array or string, and returns a new array or string with the given value appended. Throws if the second
     *         argument is not an array/string. Note: if the second argument is a string and the first is not, the value will be coerced to
     *         a string; you may not get the result you expect.
     *
     */

    var append = curry(function(v, arr) {
      if (!Array.isArray(arr) && typeof(arr) !== 'string')
        throw new TypeError('Value is not an array or string');

      if (Array.isArray(arr))
        return arr.concat([v]);

      return '' + arr + v;
    });


    /*
     * concat: Takes two arrays or strings, and returns their concatenation. Throws a TypeError if either argument is not an array/string.
     *         If both arguments are the same type, then the result will be the same type, otherwise it will be an array.
     *
     */

    var concat = curry(function(left, right) {
      if (!Array.isArray(left) && typeof(left) !== 'string')
        throw new TypeError('Value is not an array or string');

      if (!Array.isArray(right) && typeof(right) !== 'string')
        throw new TypeError('Value is not an array or string');

      if (typeof(left) !== typeof(right)) {
        if (Array.isArray(left))
          right = right.split('');
        else
          left = left.split('');
      }

      return left.concat(right);
    });


    /*
     * isEmpty: Returns true if the given array or string is empty, and false if not. Throws if the argument is not an array/string.
     *
     */

    var isEmpty = curry(function(val) {
      if (!isArrayLike(val))
        throw new TypeError('Value is not an array or string');

      return val.length === 0;
    });


    /*
     * intersperse: Takes a value, and an array or string, and returns a new array or string with the value in between each pair
     *              of elements of the original. Throws if the second argument is not an array/string.
     *
     * Note: if the second parameter is a string, the first parameter will be coerced to a string.
     */

    var intersperse = curry(function(val, arr) {
      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      var wasString = false;
      if (typeof(arr) === 'string') {
        wasString = true;
        val = '' + val;
      }

      var result = wasString ? '' : [];
      if (arr.length > 0)
        result = result.concat(wasString ? arr[0] : [arr[0]]);
      for (var i = 1, l = arr.length; i < l; i++)
        result = result.concat(wasString ? val + arr[i] : [val, arr[i]]);

      return result;
    });


    /*
     * reverse: Takes an array or string, and returns a new array or string that is the reverse of the original.
     *          Throws if the argument is not an array/string.
     *
     */

    var reverseFn = function(soFar, current) {
      return soFar.concat(Array.isArray(soFar) ? [current] : current);
    };


    var reverse = curry(function(arr) {
      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      return foldr(reverseFn, Array.isArray(arr) ? [] : '', arr);
    });


    /*
     * find: Takes a value, and an array or string. Searches for the value—tested for strict equality—and returns the
     *       index of the first match, or -1 if the value is not present. Throws if the second parameter is not an array
     *       or string.
     *
     */

    var find = callPropWithArity('indexOf', 1);


    /*
     * findFrom: Takes a value, an index, and an array or string. Searches for the value—tested for strict equality—starting
     *           the search at the given index, and returns the index of the first match, or -1 if the value is not present.
     *           Throws if the last parameter is not an array or string.
     *
     */

    var findFrom = callPropWithArity('indexOf', 2);


    /*
     * findWith: Takes a predicate function p of arity 1, and an array or string. Searches for the value—tested using the given
     *           function—and returns the index of the first match, or -1 if the value is not present. Throws if the first
     *           parameter is not a predicate function of arity 1, or the last parameter is not an array or string.
     *
     */

    var findWith = curry(function(p, arr) {
      if (typeof(p) !== 'function' || getRealArity(p) !== 1)
        throw new TypeError('Value is not a predicate function');

      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      var found = false;
      for (var i = 0, l = arr.length; !found && i < l; i++)
        found = p(arr[i]);

      return found ? i - 1 : -1;
    });


    /*
     * findFromWith: Takes a predicate function p of arity 1, and an array or string. Searches for the value—tested using
     *               the given function—from the given index, and returns the index of the first match, or -1 if the value
     *               is not present. Throws if the first parameter is not a predicate function of arity 1, or the last
     *               parameter is not an array or string.
     *
     */

    var findFromWith = curry(function(p, index, arr) {
      if (typeof(p) !== 'function' || getRealArity(p) !== 1)
        throw new TypeError('Value is not a predicate function');

      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      var found = false;
      for (var i = index, l = arr.length; !found && i < l; i++)
        found = p(arr[i]);

      return found ? i - 1 : -1;
    });


    /*
     * occurrences: Takes a value, and an array or string. Searches for all occurrences of the value—tested using strict
     *              equality—and returns an array containing all indices into the array/string where the value can be found.
     *              Throws if the last parameter is not an array/string.
     *
     */

    var occurrences = curry(function(val, arr) {
      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      var result = [];
      for (var i = 0, l = arr.length; i < l; i++)
        if (arr[i] === val)
          result.push(i);

      return result;
    });


    /*
     * occurrencesWith: Takes a predicate function p, and an array or string. Searches for all occurrences of the value—tested
     *                  using the given predicate—and returns an array containing all indices into the array/string where the
     *                  value can be found. Throws if the first parameter is not a predicate function of arity 1, or if the last
     *                  parameter is not an array/string.
     *
     */

    var occurrencesWith = curry(function(p, arr) {
      if (typeof(p) !== 'function' || getRealArity(p) !== 1)
        throw new TypeError('Value is not a predicate function');

      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      var result = [];
      for (var i = 0, l = arr.length; i < l; i++)
        if (p(arr[i]))
          result.push(i);

      return result;
    });


    /*
     * zipWith: Takes a function of arity 2, and a two arrays/strings, a and b, and returns a new array. The new array
     *          has the same length as the smaller of the two arguments. Each element is the result of calling the
     *          supplied function with the elements at the corresponding position in the original arrays/strings.
     *          Throws if the first argument is not an argument of arity at least 2, or if neither of the last two arguments
     *          is an array.
     *
     */

    var zipWith = curry(function(f, a, b) {
      if (typeof(f) !== 'function' || getRealArity(f) < 2)
        throw new TypeError('Value is not a function of arity 2');

      if (!isArrayLike(a) || !isArrayLike(b))
        throw new TypeError('Value is not an array or string');

      var len = Math.min(a.length, b.length);

      var result = [];
      for (var i = 0; i < len; i++)
        result.push(f(a[i], b[i]));

      return result;
    });


    /*
     * zip: Takes two arrays/strings, a and b, and returns a new array. The new array has the same length as the
     *      smaller of the two arguments. Each element is a Pair p, such that fst(p) === a[i] and snd(p) === b[i]
     *      for each position i in the result. Throws if neither argument is an array or string.
     *
     */

    var zip = zipWith(Pair);


    /*
     * nub: Takes an array or string. Returns a new array/string, with all duplicate elements—tested for strict
     *      equality—removed. The order of elements is preserved. Throws if the given argument is not an array
     *      or string.
     *
     */

    var nubFn = function(soFar, current) {
      return soFar.indexOf(current) !== -1 ? soFar :
             soFar.concat(Array.isArray(soFar) ? [current] : current);
    };


    var nub = curry(function(arr) {
      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      return foldl(nubFn, Array.isArray(arr) ? [] : '', arr);
    });


    /*
     * nubBy: Takes a predicate function of arity 2, and an array or string. Returns a new array/string, with
     *        all duplicate elements removed. A duplicate is defined as a value for which the predicate function
     *        returned true when called with a previously encountered element and the element under consideration.
     *        The order of elements is preserved. Throws if the first argument is not a function, or has an arity
     *        other than 2, or if the last argument is not an array/string.
     *
     */

    var nubWithFn = curry(function(p, soFar, current) {
      var isDuplicate = some(base.flip(p)(current), soFar);

      return isDuplicate ? soFar :
             soFar.concat(Array.isArray(soFar) ? [current] : current);
    });


    var nubWith = curry(function(f, arr) {
      if (typeof(f) !== 'function' || getRealArity(f) !== 2)
        throw new TypeError('Value is not a function of arity 2');

      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      var fn = nubWithFn(f);
      return foldl(fn, Array.isArray(arr) ? [] : '', arr);
    });


    /*
     * sort: Takes an array/string, and returns a new array, sorted in lexicographical order. Throws if the given argument
     *       is not an array/string.
     *
     */

    var sort = curry(function(arr) {
      if (!isArrayLike(arr))
        throw new TypeError('Value is not an array or string');

      arr = arr.slice();

      var wasString = false;
      if (typeof(arr) === 'string') {
        wasString = true;
        arr = arr.split('');
      }

      arr.sort();
      if (wasString)
        arr = arr.join('');

      return arr;
    });


    var exported = {
      append: append,
      concat: concat,
      copy: copy,
      drop: drop,
      dropWhile: dropWhile,
      each: each,
      element: element,
      elementWith: elementWith,
      every: every,
      filter: filter,
      find: find,
      findFrom: findFrom,
      findFromWith: findFromWith,
      findWith: findWith,
      foldl: foldl,
      foldl1: foldl1,
      foldr: foldr,
      foldr1: foldr1,
      getIndex: getIndex,
      head: head,
      init: init,
      inits: inits,
      intersperse: intersperse,
      isEmpty: isEmpty,
      last: last,
      length: length,
      map: map,
      maximum: maximum,
      minimum: minimum,
      nub: nub,
      nubWith: nubWith,
      occurrences: occurrences,
      occurrencesWith: occurrencesWith,
      prepend: prepend,
      product: product,
      range: range,
      rangeStep: rangeStep,
      repeat: repeat,
      reverse: reverse,
      slice: slice,
      some: some,
      sort: sort,
      sum: sum,
      tail: tail,
      tails: tails,
      take: take,
      takeWhile: takeWhile,
      uniq: nub,
      uniqWith: nubWith,
      zip: zip,
      zipWith: zipWith
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
