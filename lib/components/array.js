module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;
  var arityOf = curryModule.arityOf;

  var base = require('./base');

  var types = require('./types');
  var strictEquals = types.strictEquals;

  var object = require('./object');
  var callPropWithArity = object.callPropWithArity;

  var internalUtilities = require('../internalUtilities');
  var checkIntegral = internalUtilities.checkIntegral;
  var checkPositiveIntegral = internalUtilities.checkPositiveIntegral;
  var checkArrayLike = internalUtilities.checkArrayLike;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;

  var pair = require('./pair');
  var Pair = pair.Pair;
  var fst = pair.fst;
  var snd = pair.snd;

  var logical = require('./logical');
  var notPred = logical.notPred;


  /*
   * <apifunction>
   *
   *
   * length
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: number
   *
   * Takes an array, string or other arrayLike value, and returns its length. Throws a TypeError if the given value is not an arrayLike.
   *
   * Examples:
   *   funkierJS.length([1, 2, 3]); // => 3
   *
   */

  var length = curry(function(arr) {
    arr = checkArrayLike(arr, {message: 'Value must be arrayLike'});

    return arr.length;
  });


  /*
   * <apifunction>
   *
   * getIndex
   *
   * Category: array
   *
   * Parameter: index: number
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Takes an index and an array, string or other arrayLike value and returns the element at the given index. Throws a
   * TypeError if the index is outside the range for the given object.
   *
   * Examples:
   *   funkierJS.getIndex(1, "abcd"); 1
   *
   */

  var getIndex = curry(function(i, a) {
    a = checkArrayLike(a);
    i = checkPositiveIntegral(i, {errorMessage: 'Index out of bounds'});
    if (i >= a.length)
      throw new TypeError('Index out of bounds');

    return a[i];
  });


  /*
   * <apifunction>
   *
   * head
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Takes an array, string or other arrayLike value and returns the first element. Throws a TypeError when given an
   * empty arrayLike.
   *
   * Examples:
   *   funkierJS.head([1, 2, 3]); // => 1
   *
   */

  var head = getIndex(0);


  /*
   * <apifunction>
   *
   * last
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Takes an array, string or other arrayLike value, and returns the last element. Throws a TypeError when given an
   * empty arrayLike.
   *
   * Examples:
   *   funkierJS.last([1, 2, 3]); // => 3
   *
   */

  var last = curry(function(a) {
    return getIndex(a.length - 1, a);
  });


  /*
   * <apifunction>
   *
   * replicate
   *
   * Category: array
   *
   * Parameter: length: natural
   * Parameter: arr: arrayLike
   * Returns: array
   *
   * Takes a length and a value, and returns an array of the given length, where each element is the given value. Throws
   * a TypeError if the given length is negative.
   *
   * Examples:
   *   funkierJS.replicate(5, 42); // => [42, 42, 42, 42, 42]
   *
   */

  var replicate = curry(function(l, value) {
    l = checkPositiveIntegral(l, {errorMessage: 'Replicate count invalid'});

    var result = [];

    for (var i = 0; i < l; i++)
      result.push(value);

    return result;
  });


  /*
   * A number of functions are essentially wrappers around array primitives that take a function.
   * All these functions would, if written separately, have a similar blueprint:
   *
   * - Check the first argument is a function of the correct arity
   * - Check the last argument is an array or string, and split it if it was a string
   * - Call the array primitive with the last argument as execution context, with the other arguments as parameters
   * - Optionally put the string back together
   *
   * This function encapsulates this boilerplate. It takes the following parameters:
   * - arity: How many arguments the prop should be called with (this allows creation of versions
   *          that call the prop with or without optional arguments - e.g. reduce
   * - primitive: The primitive to call
   * - options: Whether the function should be a fixed arity, a minimum arity, the exception messages etc.
   *
   */

  var makeArrayPropCaller = function(arity, primitive, options) {
    options = options || {};

    return curryWithArity(arity, function() {
      var args = [].slice.call(arguments);
      var f = args[0];
      f = curryWithConsistentStyle(f, f, arityOf(f));
      var arr = last(args);
      var wasString = false;

      // Is the array really an array
      var arrCheckOptions = {};
      if ('aMessage' in options)
        arrCheckOptions.message = options.aMessage;
      arr = checkArrayLike(arr, arrCheckOptions);

      // Is the function really a suitable function?
      var fArity = 0;
      var fCheckOptions = {};
      if ('fixedArity' in options) {
        fCheckOptions.arity = options.fixedArity;
        fArity = options.fixedArity;
      } else if ('minimumArity' in options) {
        fCheckOptions.arity = options.minimumArity;
        fCheckOptions.minimum = true;
        fArity = options.minimumArity;
      }
      if ('fMessage' in options)
        fCheckOptions.message = options.fMessage;

      f = checkFunction(f, fCheckOptions);

      if (typeof(arr) === 'string') {
        wasString = true;
        arr = arr.split('');
      }

      // Ensure the function only gets called with as many parameters as were specified
      var fn = curryWithArity(fArity, function() {
        var args = [].slice.call(arguments);
        return f.apply(null, args);
      });
      args[0] = fn;

      var result = primitive.apply(arr, args.slice(0, args.length - 1));

      if ('returnSameType' in options && wasString)
        result = result.join('');

      return result;
    });
  };


  /*
   * <apifunction>
   *
   * map
   *
   * Category: array
   *
   * Parameter: f: function
   * Parameter: arr: arrayLike
   * Returns: array
   *
   * Takes a function f, and an array,string or other arrayLike. Returns an array arr2 where, for each element arr2[i],
   * we have arr2[i] === f(arr[i]). Throws a TypeError if the first argument is not a function, if the function does not
   * have an arity of at least 1, or if the last argument is not an arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `map` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied to
   * this function.
   *
   * Examples:
   *   funkierJS.map(plus(1), [2, 3, 4]); // => [3, 4, 5]
   *
   */

   var map = makeArrayPropCaller(2, Array.prototype.map,
                                 {minimumArity : 1, aMessage: 'Value to be mapped over is not an array/string',
                                                    fMessage: 'Mapping function must be a function with arity at least 1'});


  /*
   * <apifunction>
   *
   * each
   *
   * Category: array
   *
   * Parameter: f: function
   * Parameter: arr: arrayLike
   *
   * Takes a function f, and an array, string or arrayLike arr. Calls f with each member of the array in sequence, and
   * returns undefined.
   *
   * Throws a TypeError if the first argument is not a function, or if the second is not an arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `each` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.each(function(e) {console.log(e);}, [1, 2]); // => Logs 1 then 2 to the console
   *
   */

  var each = makeArrayPropCaller(2, Array.prototype.forEach,
                                 {minimumArity : 1, aMessage: 'Value to be iterated over is not an array/string',
                                  fMessage: 'forEach function must be a function with arity at least 1'});


  /*
   * <apifunction>
   *
   * filter
   *
   * Category: array
   *
   * Parameter: pred: function
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a predicate function pred, and an array, string or arrayLike arr. Returns an array or string containing
   * those members of arr—in the same order as the original array—for which the predicate function returned true.
   *
   * Throws a TypeError if pred does not have arity 1, or if arr is not an arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `filter` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.filter(even, [2, 3, 4, 5, 6]); // => [2, 4, 6]
   *
   */

  var filter =  makeArrayPropCaller(2, Array.prototype.filter,
                                    {aMessage: 'Value to be filtered is not an array/string',
                                     fMessage: 'Predicate must be a function of arity 1',
                                     fixedArity: 1, returnSameType: true});


  /*
   * <apifunction>
   *
   * foldl
   *
   * Category: array
   *
   * Synonyms: reduce
   *
   * Parameter: f: function
   * Parameter: initial: any
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Takes three parameters: a function f of two arguments, an initial value, and an array, string or arrayLike.
   * Traverses the array or string from left to right, calling the function with two arguments: the current accumulation
   * value, and the current element. The value returned will form the next accumulation value, and `foldl` returns the
   * value returned by the final call. The first call's accumulation parameter will be the given initial value.
   *
   * Throws a TypeError if the first parameter is not a function of arity 2, or if the last parameter is not an array or
   * string.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `foldl` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.foldl(function(soFar, current) {return soFar*10 + (current - 0);}, 0, '123'); // 123
   *
   */

  var foldl = makeArrayPropCaller(3, Array.prototype.reduce,
                                 {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                                  fMessage: 'Accumulator must be a function of arity 2'});


  /*
   * <apifunction>
   *
   * foldl1
   *
   * Category: array
   *
   * Synonyms: reduce1
   *
   * Parameter: f: function
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Takes two parameters: a function f of two arguments, and an array, string or arrayLike value. Traverses the array
   * from left to right from the second element, calling the function with two arguments: the current accumulation
   * value, and the current element. The value returned will form the next accumulation value, and foldl1 returns
   * returns the value returned by the final call. The first call's accumulation parameter will be the first element of
   * the array or string.
   *
   * Throws a TypeError if the first parameter is not a function of arity 2, if the last parameter is not an arrayLike,
   * or if the arrayLike is empty.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `foldl1` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.foldl1(multiply, [2, 3, 4]); // => 24
   *
   */

  var foldl1 = makeArrayPropCaller(2, Array.prototype.reduce,
                                   {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                                    fMessage: 'Accumulator must be a function of arity 2'});


  /*
   * <apifunction>
   *
   * foldr
   *
   * Category: array
   *
   * Synonyms: reduceRight
   *
   * Parameter: f: function
   * Parameter: initial: any
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Takes three parameters: a function f of two arguments, an initial value, and an array, string or arrayLike value.
   * Traverses the array or string from right to left, calling the function with two arguments: the current accumulation
   * value, and the current element. The value returned will form the next accumulation value, and foldr returns the
   * value returned by the final call. The first call's accumulation parameter willbe the given initial value.
   *
   * Throws a TypeError if the first parameter is not a function of arity 2, or if the last parameter is not an
   * arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `foldr` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.foldr(subtract, 0, [2, 3, 4]); // => -9
   *
   */

  var foldr = makeArrayPropCaller(3, Array.prototype.reduceRight,
                                 {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                                  fMessage: 'Accumulator must be a function of arity 2'});


  /*
   * <apifunction>
   *
   * foldr1
   *
   * Category: array
   *
   * Synonyms: reduceRight1
   *
   * Parameter: f: function
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Takes two parameters: a function f of two arguments, and an array, string or arrayLike. Traverses the array from
   * right to left from the penultimate element, calling the function with two arguments: the current accumulation
   * value, and the current element. The value returned will form the next accumulation value, and foldr1 returns
   * returns the value returned by the final call. The first call's accumulation parameter will be the last element of
   * the array or string.
   *
   * Throws a TypeError if the first parameter is not a function of arity 2, if the last parameter is not an array or
   * string, or if the array or string is empty.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `foldr1` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.foldr1(function(soFar, current) {return current + soFar;}, "banana"); // => ananab
   *
   */

  var foldr1 = makeArrayPropCaller(2, Array.prototype.reduceRight,
                                   {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                                    fMessage: 'Accumulator must be a function of arity 2'});


  /*
   * <apifunction>
   *
   * every
   *
   * Category: array
   *
   * Parameter: pred: function
   * Parameter: arr: arrayLike
   * Returns: boolean
   *
   * Synonyms: all
   *
   * Takes two parameters: a predicate function p that takes one argument, and an array, string or arrayLike. Calls the
   * predicate with every element of the array or string, until either the predicate function returns false, or the end
   * of the array or string is reached.
   *
   * Returns the last value returned by the predicate function.
   *
   * Throws a TypeError if p is not a function of arity 1, or if the second argument is not an arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `every` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.every(even, [2, 4, 6]); // => true
   *
   */

  var every = makeArrayPropCaller(2, Array.prototype.every,
                                  {fixedArity : 1, aMessage: 'Value to be iterated over is not an array/string',
                                   fMessage: 'Predicate must be a function of arity 1'});


  /*
   * <apifunction>
   *
   * some
   *
   * Category: array
   *
   * Parameter: pred: function
   * Parameter: arr: arrayLike
   * Returns: boolean
   *
   * Synonyms: any
   *
   * Takes two parameters: a predicate function p that takes one argument, and an array, string or arrayLike. Calls the
   * predicate with every element of the array or string, until either the predicate function returns true, or the end
   * of the array or string is reached.
   *
   * Returns the last value returned by the predicate function.
   *
   * Throws a TypeError if p is not a function of arity 1, or if the second argument is not an array or string.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `some` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   funkierJS.some(odd, [2, 4, 5, 6]; // => true
   *
   */

  var some = makeArrayPropCaller(2, Array.prototype.some,
                                 {fixedArity : 1, aMessage: 'Value to be iterated over is not an array/string',
                                  fMessage: 'Predicate must be a function of arity 1'});


  /*
   * <apifunction>
   *
   * maximum
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Returns the largest element of the given array, string or arrayLike.
   *
   * Throws a TypeError if the value is not an arrayLike, or it is empty.
   *
   * Note: this function is intended to be used with arrays containing numeric or character data. You are of course free
   * to abuse it, but it will likely not do what you expect.
   *
   * Examples:
   *   funkierJS.maximum([20, 10]); // => 20
   *
   */

  var maxFn = function(soFar, current) {
    if (current > soFar)
      return current;
    return soFar;
  };

  var maximum = foldl1(maxFn);


  /*
   * <apifunction>
   *
   * minimum
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: any
   *
   * Returns the smallest element of the given array, string or arrayLike. Throws a TypeError if the value is not an
   * arrayLike, or it is empty.
   *
   * Note: this function is intended to be used with arrays containing numeric or character data. You are of course
   * free to abuse it, but it will likely not do what you expect.
   *
   * Examples:
   *   funkierJS.minimum([20, 10]); // => 10
   *
   */

  var minFn = function(soFar, current) {
    if (current < soFar)
      return current;
    return soFar;
  };

  var minimum = foldl1(minFn);


  /*
   * <apifunction>
   *
   * sum
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: number
   *
   * Returns the sum of the elements of the given array, or arrayLike. Throws a TypeError if the value is not an
   * arrayLike, or it is empty.
   *
   * Note: this function is intended to be used with arrays containing numeric data. You are of course free to abuse it,
   * but it will likely not do what you expect.
   *
   * Examples:
   *   funkierJS.sum([20, 10]); // => 30
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
   * <apifunction>
   *
   * product
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: number
   *
   * Returns the product of the elements of the given array, or arrayLike. Throws a TypeError if the value is not an
   * arrayLike, or it is empty.
   *
   * Note: this function is intended to be used with arrays containing numeric data. You are of course free to abuse it,
   * but it will likely not do what you expect.
   *
   * Examples:
   *   funkierJS.product([20, 10]); // => 200
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
   * <apifunction>
   *
   * element
   *
   * Category: array
   *
   * Parameter: val: any
   * Parameter: arr: arrayLike
   * Returns: boolean
   *
   * Takes a value and an array, string or arrayLike. Returns true if the value is in the arrayLike (checked for strict
   * identity) and false otherwise.
   *
   * Throws a TypeError if the second argument is not an arrayLike.
   *
   * Examples:
   *   funkierJS.element('a', 'cable'); // => true
   *
   */

  var element = curry(function(val, arr) {
    return some(strictEquals(val), arr);
  });


  /*
   *
   * <apifunction>
   *
   * elementWith
   *
   * Category: array
   *
   * Parameter: pred: function
   * Parameter: arr: arrayLike
   * Returns: boolean
   *
   * A generalised version of element. Takes a predicate function p of one argument, and an array, string or arrayLike.
   * Returns true if there is an element in the arrayLike for which p returns true, and returns false otherwise.
   *
   * Throws a TypeError if the first argument is not a function of arity 1, or the second argument is not an arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `element` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   var p = function(e) {return e.foo = 42;};
   *   funkierJS.elementWith(p, [{foo: 1}, {foo: 42}]); // => true
   *
   */

  var elementWith = curry(function(p, arr) {
    return some(p, arr);
  });


  /*
   * <apifunction>
   *
   * range
   *
   * Category: array
   *
   * Parameter: a: number
   * Parameter: b: number
   * Returns: array
   *
   * Takes two numbers, a and b. Returns an array containing the arithmetic sequence of elements from a up to but not
   * including b, each element increasing by 1.
   *
   * Throws a TypeError if b < a.
   *
   * Examples:
   *   funkierJS.range(2, 7); // => [2, 3, 4, 5, 6]
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
   * <apifunction>
   *
   * rangeStride
   *
   * Category: array
   *
   * Synonyms: rangeStep
   *
   * Parameter: a: number
   * Parameter: stride: number
   * Parameter: b: number
   * Returns: array
   *
   * Takes three numbers, a stride and b. Returns an array containing the arithmetic sequence of elements from a up to
   * but not including b, each element increasing by stride.
   *
   * Throws a TypeError if the sequence will not terminate.
   *
   * Examples:
   *   funkierJS.rangeStep(2, 2, 7); // => [2, 4, 6]
   *
   */

  var rangeStride = curry(function(a, stride, b) {
    if ((stride > 0 && b < a) || (stride < 0 && b > a) || (stride === 0 && b !== a))
      throw new TypeError('Incorrect bounds for range');

    if (!isFinite(stride))
      throw new TypeError('stride must be finite');

    var result = [];
    for (var i = a; a < b ? i < b : i > b; i += stride)
      result.push(i);

    return result;
  });


  /*
   * <apifunction>
   *
   * take
   *
   * Category: array
   *
   * Parameter: count: number
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a count, and an array, string or arrayLike. Returns an array or string containing the first count elements
   * of the given arrayLike.
   *
   * Throws a TypeError if the count is not integral, or if the last argument is not an arrayLike.
   *
   * Examples:
   *   funkierJS.take(3, 'banana'); // => 'ban'
   *
   */

  var take = curry(function(count, arr) {
    count = checkIntegral(count, 'Invalid count for take');
    if (count < 0)
      count = 0;

    arr = checkArrayLike(arr);

    var wasString = typeof(arr) === 'string';
    if (wasString)
      arr = arr.split('');

    var result = arr.slice(0, count);
    if (wasString)
      result = result.join('');

    return result;
  });


  /*
   * <apifunction>
   *
   * drop
   *
   * Category: array
   *
   * Parameter: count: number
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a count, and an array, string or arrayLike. Returns an array or string containing the first count elements
   * removed from the given arrayLike.
   *
   * Throws a TypeError if the count is not integral, or if the last argument is not an array or string.
   *
   * Examples:
   *   funkierJS.drop(3, 'banana'); // => 'anana'
   *
   */

  var drop = curry(function(count, arr) {
    count = checkIntegral(count, 'Invalid count for drop');
    if (count < 0)
      count = 0;

    arr = checkArrayLike(arr);

    var wasString = typeof(arr) === 'string';
    if (wasString)
    arr = arr.split('');

    var result = arr.slice(count);
    if (wasString)
      result = result.join('');

    return result;
  });


  /*
   * <apifunction>
   *
   * init
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes an array, string or arrayLike. Returns an array or string containing every element except the last.
   *
   * Throws a TypeError if the arrayLike is empty, or if the given value is not an arrayLike.
   *
   * Examples:
   *   funkierJS.init([2, 3, 4, 5]); // => [2, 3, 4]
   *
   */

  var init = curry(function(arr) {
    if (arr.length === 0)
      throw new TypeError('Cannot take init of empty array/string');

    return take(length(arr) - 1, arr);
  });


  /*
   * <apifunction>
   *
   * tail
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes an array, string or arrayLike. Returns an array or string containing every element except the first.
   *
   * Throws a TypeError if the arrayLike is empty, or if the given value is not an arrayLike.
   *
   * Examples:
   *   funkierJS.tail('banana'); // => 'anana'
   *
   */

  var tail = curry(function(arr) {
    if (arr.length === 0)
      throw new TypeError('Cannot take tail of empty array/string');

    return drop(1, arr);
  });


  /*
   * <apifunction>
   *
   * inits
   *
   * Category: array
   *
   * Synonyms: prefixes
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes an array, string or arrayLike. Returns all the prefixes of the given arrayLike.
   *
   * Throws a TypeError if the given value is not an arrayLike.
   *
   * Examples:
   *   funkierJS.inits([2, 3]); // => [[], [2], [2, 3]]
   *
   */

  var inits = curry(function(arr) {
    arr = checkArrayLike(arr);
    var r = range(0, length(arr) + 1);

    return map(function(v) {return take(v, arr);}, r);
  });


  /*
   * <apifunction>
   *
   * tails
   *
   * Category: array
   *
   * Synonyms: suffixes
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes an array, string or arrayLike. Returns all the suffixes of the given arrayLike.
   *
   * Throws a TypeError if the given value is not an arrayLike.
   *
   * Examples:
   *   funkierJS.tails([2, 3]); // => [[2, 3], [3], []]
   *
   */

  var tails = curry(function(arr) {
    arr = checkArrayLike(arr);
    var r = range(0, length(arr) + 1);

    return map(function(v) {return drop(v, arr);}, r);
  });


  /*
   * <apifunction>
   *
   * copy
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes an arrayLike, and returns a new array which is a shallow copy.
   *
   * Throws a TypeError if the given value is not an arrayLike.
   *
   * Examples:
   *   var a = [1, 2, 3];]
   *   var b = funkierJS.copy(a); // => [1, 2, 3]
   *   b === a; // => false
   *
   */

  var copy = curry(function(arr) {
    arr = checkArrayLike(arr);

    return arr.slice();
  });


  /*
   * <apifunction>
   *
   * slice
   *
   * Category: array
   *
   * Parameter: from: number
   * Parameter: to: number
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes two numbers, from and to, and an array, string or arrayLike. Returns the subarray or string containing the
   * elements between these two points (inclusive at from, exclusive at to). If to is greater than the length of the
   * object, then all values from 'from' will be returned.
   *
   * Throws a TypeError if from or to are not positive integers, or if the last argument is not an arrayLike.
   *
   * Examples:
   *   funkierJS.slice(1, 3, [1, 2, 3, 4, 5]; // => [2, 3]
   *
   */

  var slice = curry(function(from, to, arr) {
    from = checkPositiveIntegral(from, {errorMessage: 'Invalid from position for slice'});
    to = checkPositiveIntegral(to, {errorMessage: 'Invalid to position for slice'});

    return take(to - from, drop(from, arr));
  });


  /*
   * <apifunction>
   *
   * takeWhile
   *
   * Category: array
   *
   * Parameter: pred: function
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a predicate function pred, and source, which should be an array, string or arrayLike. Returns a new array or
   * string containing the initial members of the given arrayLike for which the predicate returned true.
   *
   * Throws a TypeError if pred is not a function of arity 1, or if the source value is not an arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `takeWhile` is `null`, so it cannot supply a useful execution context to any object-curried functions
   * supplied to this function.
   *
   * Examples:
   *   funkierJS.takeWhile(even, [2, 4, 3, 5, 7]; // => [2, 4]
   *
   */

  var takeWhile = curry(function(p, source) {
    p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});

    source = checkArrayLike(source, {message: 'takeWhile: source is not an array/string'});

    var result = [];
    var wasString = typeof(source) === 'string';
    var l = source.length;
    var done = false;

    for (var i = 0; !done && i < l; i++) {
      if (p(source[i]))
        result.push(source[i]);
      else
        done = true;
    }

    if (wasString)
      result = result.join('');
    return result;
  });


  /*
   * <apifunction>
   *
   * dropWhile
   *
   * Category: array
   *
   * Parameter: pred: function
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a predicate function p, and source, an array, string or arrayLike. Returns a new array or string containing
   * the remaining members our source upon removing the initial elements for which the predicate function returned true.
   *
   * Throws a TypeError if p is not a function of arity 1, or if the given value is not an arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `dropWhile` is `null`, so it cannot supply a useful execution context to any object-curried functions
   * supplied to this function.
   *
   * Examples:
   *   funkierJS.dropWhile(even, [2, 4, 3, 5, 7]; // => [3, 5, 7
   *
   */

  var dropWhile = curry(function(p, source) {
    p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});

    source = checkArrayLike(source, {message: 'dropWhile: source is not an array/string'});

    var l = source.length;
    var done = false;

    var i = 0;
    while (i < source.length && p(source[i]))
      i += 1;

    return source.slice(i);
  });


  /*
   * <apifunction>
   *
   * prepend
   *
   * Category: array
   *
   * Parameter: value: any
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a value, and an array, string or arrayLike, and returns a new array or string with the given value prepended.
   *
   * Throws a TypeError if the second argument is not an arrayLike.
   *
   * Note: if the second argument is a string and the first is not, the value will be coerced to a string; you may not
   * get the result you expect.
   *
   * Examples:
   *   var a = [1, 2, 3];
   *   funkierJS.prepend(4, a); // => [4, 1, 2, 3]
   *   a; // => [1, 2, 3] (a is not changed)
   *
   */

  var prepend = curry(function(v, arr) {
    arr = checkArrayLike(arr);

    if (Array.isArray(arr))
      return [v].concat(arr);

    return '' + v + arr;
  });


  /*
   * <apifunction>
   *
   * append
   *
   * Category: array
   *
   * Parameter: value: any
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a value, and an array, string or arrayLike, and returns a new array or string with the given value appended.
   *
   * Throws a TypeError if the second argument is not an arrayLike.
   *
   * Note: if the second argument is a string and the first is not, the value will be coerced to a string; you may not
   * get the result you expect.
   *
   * Examples:
   *   var a = [1, 2, 3];
   *   funkierJS.append(4, a); // => [1, 2, 3, 4]
   *   a; // => [1, 2, 3] (a is not changed)
   *
   */

  var append = curry(function(v, arr) {
    arr = checkArrayLike(arr);

    if (Array.isArray(arr))
      return arr.concat([v]);

    return '' + arr + v;
  });


  /*
   * <apifunction>
   *
   * concat
   *
   * Category: array
   *
   * Parameter: arr1: arrayLike
   * Parameter: arr2: arrayLike
   * Returns: arrayLike
   *
   * Takes two arrays, arrayLikes or strings, and returns their concatenation.
   *
   * Throws a TypeError if either argument is not an arrayLike.
   *
   * If both arguments are the same type and are either arrays or strings, then the result will be the same type,
   * otherwise it will be an array.
   *
   * Examples:
   *   funkierJS.concat([1, 2], [3, 4, 5]); // => [1, 2, 3, 4, 5]
   *   funkierJS.concat('abc', 'def'); // => 'abcdef'
   *   funkierJS.concat('abc', [1, 2, 3]); // => ['a', 'b', 'c', 1, 2, 3]
   *
   */

  var concat = curry(function(left, right) {
    left = checkArrayLike(left, {message: 'concat: First value is not arrayLike'});
    right = checkArrayLike(right, {message: 'concat: Second value is not arrayLike'});

    if (typeof(left) !== typeof(right)) {
      if (Array.isArray(left))
        right = right.split('');
      else
        left = left.split('');
    }

    return left.concat(right);
  });


  /*
   * <apifunction>
   *
   * isEmpty
   *
   * Category: array
   *
   * Parameter: arr: arraLike
   * Returns: boolean
   *
   * Returns true if the given array, arrayLike or string is empty, and false if not.
   *
   * Throws a TypeError if the argument is not arrayLike.
   *
   * Examples:
   *   funkierJS.isEmpty([]); // => true
   *
   */

  var isEmpty = curry(function(val) {
    val = checkArrayLike(val);

    return val.length === 0;
  });


  /*
   *
   * <apifunction>
   *
   * intersperse
   *
   * Category: array
   *
   * Parameter: val: any
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a value, and an array, string or arrayLike, and returns a new array or string with the value in between each
   * pair of elements of the original.
   *
   * Note: if the second parameter is a string, the first parameter will be coerced to a string.
   *
   * Throws a TypeError if the second argument is not arrayLike.
   *
   * Examples:
   *   funkierJS.intersperse(1, [2, 3, 4]); // => [2, 1, 3, 1, 4]
   *
   */

  var intersperse = curry(function(val, arr) {
    arr = checkArrayLike(arr, {message: 'intersperse: Cannot operate on non-arrayLike value'});

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
   *
   * <apifunction>
   *
   * reverse
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes an array, string or arrayLike, and returns a new array or string that is the reverse of the original.
   *
   * Throws a TypeError if the argument is not arrayLike.
   *
   * Examples:
   *   funkierJS.reverse('banana'); 'ananab'
   *
   */

  var reverseFn = function(soFar, current) {
    return soFar.concat(Array.isArray(soFar) ? [current] : current);
  };

  var reverse = curry(function(arr) {
    arr = checkArrayLike(arr);

    return foldr(reverseFn, Array.isArray(arr) ? [] : '', arr);
  });


  /*
   * The search and replace functions are not yet ready, and are under API review.

  var find = defineValue(
   *
   * find
   *
   * Category: array
   *
   * Parameter: val: any
   * Parameter: arr: arrayLike
   * Returns: number
   *
   * Takes a value, and an array, string or arrayLike. Searches for the value—tested for strict equality—and returns the
   * index of the first match, or -1 if the value is not present.
   *
   * Throws a TypeError if the second parameter is not arrayLike.
   *
   * Examples:
   *   funkierJS.find(2, [1, 2, 3]); // => 1
   *
  var find = callPropWithArity('indexOf', 1);


  //var findFrom = defineValue(
   *
   * findFrom
   *
   * Category: array
    *
   * signature: value: any, index: number, arr: arrayLike
   * classification: array
   *
   * Takes a value, an index, and an array, string or arrayLike. Searches for the
   * value—tested for strict equality—starting the search at the given index, and
   * returns the index of the first match, or -1 if the value is not present.
   *
   * Throws a TypeError if the last parameter is not arrayLike.
   *
   * Examples:
   *
   * funkierJS.findFrom(2, 2, [1, 2, 3]); -1
   *
    curry(function(val, from, arr) {
      arr = checkArrayLike(arr);
      from = checkPositiveIntegral(from, {message: 'Index must be a positive integer'});

      return arr.indexOf(val, from);
    })
  );


  var findWith = defineValue(
   *
   * findWith
   *
   * Category: array
    *
   * signature: pred: function, haystack: arrayLike
   * classification: array
   *
   * Takes a predicate function pred of arity 1, and haystack, an array, arrayLike
   * or string. Searches for the value—tested by the given function—and returns the
   * index of the first match, or -1 if the value is not present.
   *
   * Throws a TypeError if the first parameter is not a predicate function of arity 1,
   * or if the haystack parameter is not arrayLike.
   *
   * Examples:
   *
   * var pred = function(e) {return e.foo === 42;};
   * var arr = [{foo: 1}, {foo: 2}, {foo: 42}, {foo: 3}];
   * funkierJS.findWith(pred, arr); // 2
   *
    curry(function(p, haystack) {
      haystack = checkArrayLike(haystack, {message: 'Haystack must be an array/string'});
      p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});

      var found = false;
      for (var i = 0, l = haystack.length; !found && i < l; i++)
        found = p(haystack[i]);

      return found ? i - 1 : -1;
    })
  );


  var findFromWith = defineValue(
   *
   * findFromWith
   *
   * Category: array
    *
   * signature: pred: function, index: number, haystack: arrayLike
   * classification: array
   *
   *
   * Examples:
   *
   * Takes a predicate function pred of arity 1, and haystack, an array, arrayLike
   * or string. Searches for the value—tested by the given function—from the given
   * index, and returns the index of the first match, or -1 if the value is not
   * present.
   *
   * Throws a TypeError if the first parameter is not a predicate function of arity
   * 1, or the haystack parameter is not arrayLike.
   *
   * Examples:
   *
   * var pred = function(e) {return e.foo === 42;};
   * var arr = [{foo: 1}, {foo: 2}, {foo: 42}, {foo: 3}];
   * funkierJS.findFromWith(pred, 3, arr); // -1
   *
    curry(function(p, index, haystack) {
      haystack = checkArrayLike(haystack, {message: 'Haystack must be an array/string'});
      index = checkPositiveIntegral(index, {message: 'Index must be a non-negative integer'});
      p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});

      var found = false;
      for (var i = index, l = haystack.length; !found && i < l; i++)
        found = p(haystack[i]);

      return found ? i - 1 : -1;
    })
  );
*/


  /*
   * <apifunction>
   *
   * occurrences
   *
   * Category: array
   *
   * Parameter: needle: any,
   * Parameter: haystack: arrayLike
   * Returns: array
   *
   * Takes a value—needle—and haystack, an array, arrayLike or string. Searches for all occurrences of the value—tested
   * for strict equality—and returns an array containing all the indices into haystack where the values may be found.
   *
   * Throws a TypeError if the haystack parameter is not arrayLike.
   *
   * Examples:
   *   funkierJS.occurrences(2, [1, 2, 2, 3, 2, 4]; // => [1, 2, 4]
   *
   */

  var occurrences = curry(function(val, haystack) {
    haystack = checkArrayLike(haystack, {message: 'occurrences: haystack must be an array/string'});

    var result = [];
    for (var i = 0, l = haystack.length; i < l; i++)
      if (haystack[i] === val)
        result.push(i);

    return result;
  });


  /*
   * <apifunction>
   *
   * occurrencesWith
   *
   * Category: array
   *
   * Parameter: needle: any,
   * Parameter: haystack: arrayLike
   * Returns: array
   *
   * Takes a predicate function pred, and haystack, an array, arrayLike or string. Searches for all occurrences of the
   * value—tested by the given predicate—and returns an array containing all the indices into haystack where the
   * predicate holds.
   *
   * Throws a TypeError if pred is not a predicate function of arity 1, or if the haystack parameter is not arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `occurrences` is `null`, so it cannot supply a useful execution context to any object-curried functions
   * supplied to this function.
   *
   * Examples:
   *   var pred = function(e) {return e.foo === 42;};
   *   var arr = [{foo: 1}, {foo: 42}, {foo: 42}, {foo: 3}];
   *   funkierJS.occurrencesWith(pred, arr); // => [1, 2]
   *
   */

  var occurrencesWith = curry(function(p, haystack) {
    haystack = checkArrayLike(haystack, {message: 'occurrencesWith: haystack must be an array/string'});
    p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});

    var result = [];
    for (var i = 0, l = haystack.length; i < l; i++)
      if (p(haystack[i]))
        result.push(i);

    return result;
  });


  /*
   * <apifunction>
   *
   * zipWith
   *
   * Category: array
   *
   * Parameter: f: function
   * Parameter: a: arrayLike
   * Parameter: b: arrayLike
   * Returns array
   *
   * Takes a function of arity 2, and a two arrays/arrayLikes/strings, a and b, and returns a new array. The new array
   * has the same length as the smaller of the two arguments. Each element is the result of calling the supplied
   * function with the elements at the corresponding position in the original arrayLikes.
   *
   * Throws a TypeError if the first argument is not an argument of arity at least 2, or if neither of the last two
   * arguments is arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `zipWith` is `null`, so it cannot supply a useful execution context to any object-curried functions
   * supplied to this function.
   *
   * Examples:
   *   var f = function(a, b) {return a + b;};
   *   funkierJS.zipWith(f, 'apple', 'banana'); // => ['ab', 'pa', 'pn', 'la', 'en']
   *
   */

  var zipWith = curry(function(f, a, b) {
    a = checkArrayLike(a, {message: 'First source value is not an array/string'});
    b = checkArrayLike(b, {message: 'Second source value is not an array/string'});

    f = checkFunction(f, {arity: 2, minimum: true, message: 'Constructor must be a function with arity at least 2'});

    var len = Math.min(a.length, b.length);

    var result = [];
    for (var i = 0; i < len; i++)
      result.push(f(a[i], b[i]));

    return result;
  });


  /*
   * <apifunction>
   *
   * zip
   *
   * Category: array
   *
   * Parameter: a: arrayLike
   * Parameter: b: arrayLike
   * Returns: array
   *
   * Takes two arrayLikes, a and b, and returns a new array. The new array has the same length as the smaller of the two
   * arguments. Each element is a [`Pair`](#Pair) p, such that `fst(p) === a[i]` and `snd(p) === b[i]` for each position
   * i in the result.
   *
   * Throws a TypeError if neither argument is arrayLike.
   *
   * Examples:
   *   funkierJS.zip([1, 2], [3, 4]); // => [Pair(1, 3), Pair(2, 4)]
   *
   */

  var zip = zipWith(Pair);


  /*
   *
   * <apifunction>
   *
   * unzip
   *
   * Category: array
   *
   * Parameter: source: array
   * Returns: Pair
   *
   * Takes an array of Pairs, and returns a [`Pair`](#Pair). The first element is an array containing the first element from each
   * pair, and likewise the second element is an array containing the second elements.
   *
   * Throws a TypeError if the given argument is not an array, or if any element is not a Pair.
   *
   * Examples:
   *   funkierJS.unzip([Pair(1, 2), Pair(3, 4)]); // =>  Pair([1, 3], [2, 4])
   *
   */

  var unzip = curry(function(source) {
    source = checkArrayLike(source, {noStrings: true, message: 'Source value is not an array'});

    return Pair(map(fst, source), map(snd, source));
  });


  /*
   * <apifunction>
   *
   * nub
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Synonyms: uniq
   *
   * Takes an array, string or arrayLike. Returns a new array/string, with all duplicate elements—tested for strict
   * equality—removed. The order of elements is preserved.
   *
   * Throws a TypeError if the given argument is not arrayLike.
   *
   * Examples:
   *   funkierJS.nub('banana'); // 'ban'
   *
   */

  var nubFn = function(soFar, current) {
    return soFar.indexOf(current) !== -1 ? soFar :
           soFar.concat(Array.isArray(soFar) ? [current] : current);
  };

  var nub = curry(function(arr) {
    arr = checkArrayLike(arr);

    return foldl(nubFn, Array.isArray(arr) ? [] : '', arr);
  });


  /*
   * <apifunction>
   *
   * nubWith
   *
   * Category: array
   *
   * Synonyms: uniqWith
   *
   * Parameter: pred: function
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a predicate function of arity 2, and an array, string or arrayLike. Returns a new array/string, with all
   * duplicate elements removed. A duplicate is defined as a value for which the predicate function returned true when
   * called with a previously encountered element and the element under consideration. The order of elements is
   * preserved.
   *
   * Throws a TypeError if the first argument is not a function, or has an arity other than 2, or if the last argument
   * is not arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `nubWith` is `null`, so it cannot supply a useful execution context to any object-curried functions supplied
   * to this function.
   *
   * Examples:
   *   var pred = function(x, y) { return x.foo === y.foo; };
   *   funkierJS.nubWith(pred, [{foo: 12}, {foo: 42}, {foo: 42}, {foo: 12}]);
   *   // => [{foo: 12}, {foo: 42}]
   *
   */

  var nubWithFn = curry(function(p, soFar, current) {
    var isDuplicate = some(base.flip(p)(current), soFar);

    return isDuplicate ? soFar :
           soFar.concat(Array.isArray(soFar) ? [current] : current);
  });

  var nubWith = curry(function(p, arr) {
    arr = checkArrayLike(arr);
    p = checkFunction(p, {arity: 2, message: 'Predicate must be a function of arity 2'});

    var fn = nubWithFn(p);
    return foldl(fn, Array.isArray(arr) ? [] : '', arr);
  });


  /*
   * <apifunction>
   *
   * sort
   *
   * Category: array
   *
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes an array, string or arrayLike, and returns a new array, sorted in lexicographical order.
   *
   * Throws a TypeError if the given argument is not arrayLike.
   *
   * Examples:
   *   funkierJS.sort([10, 1, 21, 2]); // => [1, 10, 2, 21]
   *
   */

  var sort = curry(function(arr) {
    arr = checkArrayLike(arr);
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


  /*
   * <apifunction>
   *
   * sortWith
   *
   * Category: array
   *
   * Parameter: f: function
   * Parameter: arr: arrayLike
   * Returns: arrayLike
   *
   * Takes a function of two arguments, and an array, string or arrayLike. Returns a new array/string, sorted per the
   * given function. The function should return a negative number if the first argument is "less than" the second, 0 if
   * the two arguments are "equal", and a positive number if the first argument is greater than the second.
   *
   * Throws a TypeError if the first argument is not a function of arity 2, or if the second is not arrayLike.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `sortWith` is `null`, so it cannot supply a useful execution context to any object-curried functions
   * supplied to this function.
   *
   * Examples:
   *   var sortFn = function(x, y) {return x - y;};
   *   funkierJS.sortWith(sortFn, [10, 1, 21, 2]); // => [1, 2, 10, 21]
   *
   */

  var sortWith = makeArrayPropCaller(2, Array.prototype.sort, {fixedArity: 2, returnSameType: true});


  /*
   * The modification functions are not yet ready, and are under API review.
   *
   *
  // XXX Argument order consistency with other funcs that take val and index?
  //var insert = defineValue(
   *
   *
   * insert
   *
   * Category: array
    *
   * signature: index: number, value: any, arr: arrayLike
   * classification: array
   *
   * Takes an index, a value, and an array, string or arrayLike. Returns a new
   * array/string with the value inserted at the given index, and later elements
   * shuffled one place to the right. The index argument should be a number between
   * 0 and the length of the given array/string; a value equal to the length will
   * insert the new value at the end of the array/string. If passed a string, the
   * value will be coerced to a string if necessary.
   *
   * Throws a TypeError if the index is out of bounds, or otherwise invalid, or if
   * the last argument is not arrayLike.
   *
   * Examples:
   *
   * var a = [1, 2, 3];
   * funkierJS.insert(1, 10, a); // Returns [1, 10, 2, 3]; a is unchanged
   *
    curry(function(index, val, arr) {
      arr = checkArrayLike(arr, {message: 'insert: Recipient is not arrayLike'});
      index = checkPositiveIntegral(index, 'Index out of bounds');
      if (index > arr.length)
        throw new TypeError('Index out of bounds');

      if (Array.isArray(arr))
        return arr.slice(0, index).concat([val]).concat(arr.slice(index));

      return arr.slice(0, index) + val + arr.slice(index);
    })
  );


  // XXX Argument order consistency with other funcs that take val and index?
  var remove = defineValue(
   *
   * remove
   *
   * Category: array
    *
   * signature: index: number, value: any, arr: arrayLike
   * classification: array
   *
   * Takes an index, and an array, string or arrayLike. Returns a new array/string
   * with the value at the given index removed, and later elements shuffled one place
   * to the left. The index argument should be a number between 0 and one less than
   * the length of the given array/string.
   *
   * Throws a TypeError if the index is out of bounds, or otherwise invalid, or if
   * the last argument is not arrayLike.
   *
   * Examples:
   *
   * var a = [1, 10, 2];
   * funkierJS.remove(1, a); // Returns [1, 2]; a is unchanged
   *
    curry(function(index, arr) {
      arr = checkArrayLike(arr, {message: 'remove: Value to be modified is not arrayLike'});
      index = checkPositiveIntegral(index, 'Index out of bounds');
      if (index >= arr.length)
        throw new TypeError('Index out of bounds');


      return arr.slice(0, index).concat(arr.slice(index + 1));
    })
  );


  // XXX Argument order consistency with other funcs that take val and index?
  // XXX Also, need to look over this wrt strings
  var replace = defineValue(
   *
   * replace
   *
   * Category: array
    *
   * signature: index: number, value: any, arr: arrayLike
   * classification: array
   *
   * Takes an index, a value, and an array, string or arrayLike. Returns a new
   * array/string with the value replacing the value at the given index. The index
   * argument should be a number between 0 and one less than the length of the given
   *  array/string. If passed a string, the value will be coerced to a string if
   * necessary.
   *
   * Throws a TypeError if the index is out of bounds, or otherwise invalid, or if
   * the last argument is not arrayLike.
   *
   * Examples:
   *
   * var a = [1, 10, 3];
   * funkierJS.replace(1, 2, a); // Returns [1, 2, 3]; a is unchanged
   *
    curry(function(index, val, arr) {
      arr = checkArrayLike(arr, {message: 'replace: Value to be modified is not arrayLike'});
      index = checkPositiveIntegral(index, 'Index out of bounds');
      if (index >= arr.length)
        throw new TypeError('Index out of bounds');

      arr = arr.slice();

      if (Array.isArray(arr)) {
        arr[index] = val;
        return arr;
      }

      val = val.toString();
      return arr.slice(0, index) + val + arr.slice(index + 1);
    })
  );


  // XXX Also, need to look over this wrt strings
  var removeOneWith = defineValue(
   *
   * removeOneWith
   *
   * Category: array
    *
   * signature: pred: function, arr: arrayLike
   * classification: array
   *
   * Takes a predicate function of arity 1, and an array. Returns a new array with the
   * first value for which the function returns true removed from the array.
   *
   * Throws a TypeError if the given predicate is not a function, or does not have
   * arity 1, or if the last parameter is not an array.
   *
   * Examples:
   *
   * var pred = function(x) {return x.foo === 42;};
   * funkierJS.removeOne(pred, [{foo: 1}, {foo: 42}, {foo: 3}]); // Returns [{foo: 1}, {foo: 3}]
   *
    curry(function(p, arr) {
      p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
      arr = checkArrayLike(arr, {message:   * Value to be modified is not an array noStrings: true});

      var found = false;
      var i = 0;
      while (!found && i < arr.length) {
        if (p(arr[i])) {
          found = true;
        } else {
          i++;
        }
      }

      if (!found)
        return arr.slice();

      return arr.slice(0, i).concat(arr.slice(i + 1));
    })
  );


  var removeOne = defineValue(
   *
   * removeOne
   *
   * Category: array
    *
   * signature: value: any, arr: arrayLike
   * classification: array
   *
   * Takes a value, and an array. Returns a new array with the first occurrence of the
   *  value—checked for strict equality— removed from the array.
   *
   * Throws a TypeError if the last argument is not an array.
   *
   * Examples:
   *
   * funkierJS.removeOne(2, [1, 2, 2, 3]); // Returns [1, 2, 3]
   *
    compose(removeOneWith, strictEquals)
  );


  var removeAll = defineValue(
   *
   * removeAll
   *
   * Category: array
    *
   * signature: value: any, arr: arrayLike
   * classification: array
   *
   * Takes a value, and an array. Returns a new array with all occurrences of the
   * given value—checked for strict equality—removed from the array.
   *
   * Throws a TypeError if the last argument is not an array.
   *
   * Examples:
   *
   * funkierJS.removeAll(2, [1, 2, 2, 3]); // Returns [1, 3]
   *
    curry(function(val, arr) {
      arr = checkArrayLike(arr, {noStrings: true});

      var pred = notPred(strictEquals(val));
      return filter(pred, arr);
    })
  );


  var removeAllWith = defineValue(
   *
   * removeAllWith
   *
   * Category: array
    *
   * signature: pred: function, arr: arrayLike
   * classification: array
   *
   * Takes a predicate function of arity 1, and an array. Returns a new array with
   * values for which the function returns true removed from the array.
   *
   * Throws a TypeError if the first argument is not a predicate function of arity 1,
   * or if the last parameter is not an array.
   *
   * Examples:
   *
   * var pred = function(x) {return x.foo === 42;};
   * funkierJS.removeAllWith(pred [{foo: 42}, {foo: 12}, {foo: 1}, {foo: 42}]);
   * // returns [{foo: 12}, {foo: 1}]
   *
    curry(function(pred, arr) {
      arr = checkArrayLike(arr, {noStrings: true});

      pred = notPred(pred);
      return filter(pred, arr);
    })
  );


  var replaceOneWith = defineValue(
   *
   * replaceOneWith
   *
   * Category: array
    *
   * signature: pred: function, value: any, arr: array
   * classification: array
   *
   * Takes a predicate function of arity 1, a replacement value, and an array.
   * Returns a new array where the first value for which the given predicate returned
   * true has been replaced with the given replacement.
   *
   * Throws a TypeError if the first argument is not a function, if the function does
   * not have arity 1, or if the last parameter is not an array.
   *
   * Examples:
   *
   * var pred = function(x) {return x.foo === 42;};
   * funkierJS.replaceOneWith(pred {bar: 10}, [{foo: 42}, {foo: 12}, {foo: 1}, {foo: 42}]);
   * // returns [{bar: 10}, {foo: 12}, {foo: 1}, {foo: 42}]
   *
    curry(function(p, replacement, arr) {
      p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
      arr = checkArrayLike(arr, {message:   * Value to be modified is not arrayLike noStrings: true});
      replacement = [replacement];

      var found = false;
      var i = 0;
      while (!found && i < arr.length) {
        if (p(arr[i]))
          found = true;
        else
        i++;
      }

      if (!found)
        return arr.slice();

      return arr.slice(0, i).concat(replacement).concat(arr.slice(i + 1));
    })
  );


  var replaceOne = defineValue(
   *
   * replaceOne
   *
   * Category: array
    *
   * signature: value: any, newValue: any, arr: arrayLike
   * classification: array
   *
   * Takes a value, a replacement value, and an array. Returns a new array where the
   * first occurrence of the given value—checked for strict equality—is replaced with
   * the given replacement.
   *
   * Throws a TypeError if the last parameter is not an array.
   *
   * Examples:
   *
   * funkierJS.replaceOne(2, 42, [1, 2, 3]); // [1, 42, 3]
   *
    curry(function(val, replacement, arr) {
      return replaceOneWith(base.strictEquals(val), replacement, arr);
    })
  );


  var replaceAllWith = defineValue(
   *
   * replaceAllWith
   *
   * Category: array
    *
   * signature: pred: function, newValue: any, arr: array
   * classification: array
   *
   * Takes a predicate function of arity 1, a replacement value, and an array.
   * Returns a new array/string where all values for which the predicate returned true
   * have been replaced with the given replacement.
   * Throws a TypeError if the first parameter is not a function of arity 1, or if the
   * last parameter is not an array.
   *
   * Examples:
   *
   * var pred = function(x) {return x.foo === 42;};
   * funkierJS.replaceAllWith(pred {bar: 10}, [{foo: 42}, {foo: 12}, {foo: 1}, {foo: 42}]);
   * // returns [{bar: 10}, {foo: 12}, {foo: 1}, {bar: 10}]
   *
    curry(function(p, replacement, arr) {
      p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
      arr = checkArrayLike(arr, {message:   * Value to be modified is not an array noStrings: true});
      replacement = [replacement];

      var result = arr.slice();
      var i = 0;

      while (i < arr.length) {
        if (!p(result[i])) {
          i += 1;
          continue;
        }

        result = result.slice(0, i).concat(replacement).concat(result.slice(i + 1));
        i += 1;
      }

      return result;
    })
  );


  var replaceAll = defineValue(
   *
   * replaceAll
   *
   * Category: array
    *
   * signature: value: any, newValue: any, arr: array
   * classification: array
   *
   * Takes a value, a replacement value, and an array. Returns a new array where all
   * occurrences of the given value—checked for strict equality—have been replaced
   * with the given replacement.
   *
   * Throws a TypeError if the last parameter is not an array.
   *
   * Examples:
   *
   *
    curry(function(val, replacement, arr) {
      return replaceAllWith(strictEquals(val), replacement, arr);
    })
  );
*/


  /*
   * <apifunction>
   *
   * join
   *
   * Category: array
   *
   * Parameter: separator: any
   * Parameter: arr: array
   * Returns: string
   *
   * Takes a separator value that can be coerced to a string, and an array. Returns a string, containing the toString
   * of each element in the array, separated by the toString of the given separator.
   *
   * Throws a TypeError if the last element is not an array.
   *
   * Examples:
   *   funkierJS.join('-', [1, 2, 3]); // => '1-2-3'
   *
   */

  var join = curry(function(sep, arr) {
    arr = checkArrayLike(arr, {noStrings: true, message: 'join: Value to be joined is not an array'});

    return arr.join(sep);
  });


  /*
   * <apifunction>
   *
   * flatten
   *
   * Category: array
   *
   * Parameter: arr: array
   * Returns: array
   *
   * Takes an array containing arrays or strings. Returns an array containing the concatenation of those arrays/strings.
   * Note that flatten only strips off one layer.
   *
   * Throws a TypeError if the supplied value is not arrayLike, or if any of the values within it are not arrayLike.
   *
   * Examples:
   *   funkierJS.flatten([[1, 2], [3, 4]]); // => [1, 2, 3, 4]
   *
   */

  var flattenFn = function(soFar, current) {
    current = checkArrayLike(current);

    return concat(soFar, current);
  };

  var flatten = curry(function(arr) {
    arr = checkArrayLike(arr, {noStrings: true, message: 'Value to be flattened is not an array'});

    return foldl(flattenFn, [], arr);
  });


  /*
   * <apifunction>
   *
   * flattenMap
   *
   * Category: array
   *
   * Parameter: f: function
   * Parameter: arr: arrayLike
   * Returns: array
   *
   * Takes a function of arity 1, and an array, string or arrayLike. Maps the function over the array/string and
   * flattens the result. The supplied function must be of arity 1, as it is expected to return an array or string; a
   * TypeError is thrown if this is not the case.
   *
   * A TypeError will also be thrown if the last argument is not arrayLike, or if the first argument is not a function.
   *
   * Note that, if required, the function must already have its execution context set. Internally, the execution context
   * within `flattenWith` is `null`, so it cannot supply a useful execution context to any object-curried functions
   * supplied to this function.
   *
   * Examples:
   *   var fn = function(n) {return [n, n * n];};
   *   funkierJS.flattenMap(fn, [1, 2, 3]); // => Returns [1, 1, 2, 4, 3, 9]
   *
   */

  var flattenMap = curry(function(f, arr) {
    return flatten(map(f, arr));
  });


  return {
    all: every,
    any: some,
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
/*
    find: find,
    findFrom: findFrom,
    findFromWith: findFromWith,
    findWith: findWith,
*/
    flatten: flatten,
    flattenMap: flattenMap,
    foldl: foldl,
    foldl1: foldl1,
    foldr: foldr,
    foldr1: foldr1,
    getIndex: getIndex,
    head: head,
    init: init,
    inits: inits,
 //   insert: insert,
    intersperse: intersperse,
    isEmpty: isEmpty,
    join: join,
    last: last,
    length: length,
    map: map,
    maximum: maximum,
    minimum: minimum,
    nub: nub,
    nubWith: nubWith,
    occurrences: occurrences,
    occurrencesWith: occurrencesWith,
    prefixes: inits,
    prepend: prepend,
    product: product,
    range: range,
    rangeStep: rangeStride,
    rangeStride: rangeStride,
    reduce: foldl,
    reduce1: foldl1,
    reduceRight: foldr,
    reduceRight1: foldr1,
/*
    remove: remove,
    removeAll: removeAll,
    removeAllWith: removeAllWith,
    removeOne: removeOne,
    removeOneWith: removeOneWith,
    replace: replace,
    replaceAll: replaceAll,
    replaceAllWith: replaceAllWith,
    replaceOne: replaceOne,
    replaceOneWith: replaceOneWith,
*/
    replicate: replicate,
    reverse: reverse,
    slice: slice,
    some: some,
    sort: sort,
    sortWith: sortWith,
    suffixes: tails,
    sum: sum,
    tail: tail,
    tails: tails,
    take: take,
    takeWhile: takeWhile,
    uniq: nub,
    uniqWith: nubWith,
    unzip: unzip,
    zip: zip,
    zipWith: zipWith
  };
})();
