(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;
    var curryWithArity = curryModule.curryWithArity;
    var getRealArity = curryModule.getRealArity;

    var base = require('./base');
    var compose = base.compose;
    var strictEquals = base.strictEquals;

    var object = require('./object');
    var extract = object.extract;
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;

    var utils = require('./utils');
    var checkIntegral = utils.checkIntegral;
    var checkPositiveIntegral = utils.checkPositiveIntegral;
    var checkArrayLike = utils.checkArrayLike;
    var defineValue = utils.defineValue;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;

    var pair = require('./pair');
    var Pair = pair.Pair;
    var fst = pair.fst;
    var snd = pair.snd;

    var logical = require('./logical');
    var notPred = logical.notPred;


    var length = defineValue(
      'name: length',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or other arraylike value, and returns its length',
      '',
      'Throws a TypeError if the given value is not an arraylike',
      '--',
      'length([1, 2, 3]); // 3',
      curry(function(arr) {
        arr = checkArrayLike(arr, {message: 'Value must be arraylike'});

        return arr.length;
      })
    );


    var getIndex = defineValue(
      'name: getIndex',
      'signature: index: number, arr: arraylike',
      'classification: array',
      '',
      'Takes an index and an array, string or other arraylike value and returns the',
      'element at the given index.',
      '',
      'Throws a TypeError if the index is outside the range for the given object.',
      '--',
      'getIndex(1, "abcd"); 1',
      curry(function(i, a) {
        a = checkArrayLike(a);
        i = checkPositiveIntegral(i, 'Index out of bounds');
        if (i >= a.length)
          throw new TypeError('Index out of bounds');

        return a[i];
      })
    );


    var head = defineValue(
      'name: head',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or other arraylike value and returns the first element.',
      '',
      'Throws a TypeError when given an empty arraylike.',
      '--',
      'head([1, 2, 3]); // 1',
      getIndex(0)
    );


    var last = defineValue(
      'name: last',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or other arraylike value, and returns the last element.',
      '',
      'Throws a TypeError when given an empty arraylike.',
      '--',
      'last([1, 2, 3]); // 3',
      curry(function(a) {
        return getIndex(a.length - 1, a);
      })
    );


    var replicate = defineValue(
      'name: replicate',
      'signature: length: number, arr: arraylike',
      'classification: array',
      '',
      'Takes a length and a value, and returns an array of the given length, where',
      'each element is the given value.',
      '',
      'Throws a TypeError if the given length is negative.',
      '--',
      'replicate(5, 42); // [42, 42, 42, 42, 42]',
      curry(function(l, value) {
        l = checkPositiveIntegral(l, 'Replicate count invalid');

        var result = [];

        for (var i = 0; i < l; i++)
          result.push(value);

        return result;
      })
    );


    /*
     * A number of functions are essentially wrappers around array primitives that take a function.
     * All these functions would, if written seperately, have a similar blueprint:
     *
     * - Check the first argument is a function of the correct arity
     * - Check the last argument is an array or string, and split it if it was a string
     * - Call the prop of the last argument, with the other arguments as parameters
     * - Optionally put the string back together
     *
     * This function encapsulates this boilerplate. It takes the following parameters:
     * - arity: How many arguments the prop should be called with (this allows creation of versions
     *          that call the prop with or without optional arguments - e.g. reduce
     * - prop: The string name of the property to call
     * - options: Whether the function should be a fixed arity, a minimum arity, the exception messages etc.
     *
     */

    var makeArrayPropCaller = function(arity, prop, options) {
      options = options || {};

      return curryWithArity(arity, function() {
        var args = [].slice.call(arguments);
        var f = curry(args[0]);
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

        var result = arr[prop].apply(arr, args.slice(0, args.length - 1));

        if ('returnSameType' in options && wasString)
          result = result.join('');

        return result;
      });
    };


    var map = defineValue(
      'name: map',
      'signature: f: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a function f, and an array,string or other arraylike. Returns an array',
      'arr2 where, for each element arr2[i], we have arr2[i] === f(arr[i]).',
      '',
      'Throws a TypeError if the first argument is not a function, if the function',
      'does not have an arity of at least 1, or if the last argument is not an',
      'arraylike.',
      '--',
      'map(plus(1), [2, 3, 4]); // [3, 4, 5]',
      makeArrayPropCaller(2, 'map',
        {minimumArity : 1, aMessage: 'Value to be mapped over is not an array/string',
                           fMessage: 'Mapping function must be a function with arity at least 1'})
    );


    var each = defineValue(
      'name: each',
      'signature: f: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a function f, and an array, string or arraylike arr. Calls f with each',
      'member of the array in sequence, and returns undefined.',
      '',
      'Throws a TypeError if the first argument is not a function, or if the second is',
      'not an arraylike.',
      '--',
      '// Logs 1 then 2 to the console',
      'each(function(e) {console.log(e);}, [1, 2]);',
      makeArrayPropCaller(2, 'forEach',
        {minimumArity : 1, aMessage: 'Value to be iterated over is not an array/string',
                           fMessage: 'forEach function must be a function with arity at least 1'})
    );


    var filter = defineValue(
      'name: filter',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a predicate function pred, and an array, string or arraylike arr. Returns',
      'an array or string containing those members of arr—in the same order as the',
      'original array—for which the predicate function returned true.',
      '',
      'Throws a TypeError if pred does not have arity 1, or if arr is not an arraylike.',
      '--',
      'filter(even, [2, 3, 4, 5, 6]); // [2, 4, 6]',
      makeArrayPropCaller(2, 'filter',
        {aMessage: 'Value to be filtered is not an array/string',
         fMessage: 'Predicate must be a function of arity 1', fixedArity: 1, returnSameType: true})
    );


    var foldl = defineValue(
      'name: foldl',
      'signature: f: function, initial: any, arr: arraylike',
      'classification: array',
      '',
      'Takes three parameters: a function f of two arguments, an initial value, and an',
      'array, string or arraylike. Traverses the array or string from left to right,',
      'calling the function with two arguments: the current accumulation value, and the',
      'current element. The value returned will form the next accumulation value, and',
      'foldl returns the value returned by the final call. The first call\'s',
      'accumulation parameter will be the given initial value.',
      '',
      'Throws a TypeError if the first parameter is not a function of arity 2, or if',
      'the last parameter is not an array or string.',
      '--',
      '// Returns the number 123',
      'foldl(function(soFar, current) {return soFar*10 + (current - 0);}, 0, \'123\');',
      makeArrayPropCaller(3, 'reduce',
        {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                         fMessage: 'Accumulator must be a function of arity 2'})
    );


    var foldl1 = defineValue(
      'name: foldl1',
      'signature: f: function, arr: arraylike',
      'classification: array',
      '',
      'Takes two parameters: a function f of two arguments, and an array, string or',
      'arraylike value. Traverses the array from left to right from the second element,',
      'calling the function with two arguments: the current acccumulation value, and the',
      'current element. The value returned will form the next accumulation value, and',
      'foldl1 returns returns the value returned by the final call. The first call\'s',
      'accumulation parameter will be the first element of the array or string.',
      '',
      'Throws a TypeError if the first parameter is not a function of arity 2, if the',
      'last parameter is not an arraylike, or if the arraylike is empty.',
      '--',
      'foldl1(multiply, [2, 3, 4]); // 24',
      makeArrayPropCaller(2, 'reduce',
        {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                         fMessage: 'Accumulator must be a function of arity 2'})
    );


    var foldr = defineValue(
      'name: foldr',
      'signature: f: function, initial: any, arr: arraylike',
      'classification: array',
      '',
      'Takes three parameters: a function f of two arguments, an initial value, and an',
      'array, string or arraylike value. Traverses the array or string from right to',
      'left, calling the function with two arguments: the current accumulation value,',
      'and the current element. The value returned will form the next accumulation',
      'value, and foldr returns the value returned by the final call. The first call\'s',
      'accumulation parameter willbe the given initial value.',
      '',
      'Throws a TypeError if the first parameter is not a function of arity 2, or if the',
      'last parameter is not an arraylike.',
      '--',
      'foldr(subtract, 0, [2, 3, 4]); // -9',
      makeArrayPropCaller(3, 'reduceRight',
        {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                         fMessage: 'Accumulator must be a function of arity 2'})
    );


    var foldr1 = defineValue(
      'name: foldr1',
      'signature: f:function, arr: arraylike',
      'classification: array',
      '',
      'Takes two parameters: a function f of two arguments, and an array, string or',
      'arraylike. Traverses the array from right to left from the penultimate element,',
      'calling the function with two arguments: the current acccumulation value, and the',
      'current element. The value returned will form the next accumulation value, and',
      'foldr1 returns returns the value returned by the final call. The first call\'s',
      'accumulation parameter will be the last element of the array or string.',
      '',
      'Throws a TypeError if the first parameter is not a function of arity 2, if the',
      'last parameter is not an array or string, or if the array or string is empty.',
      '--',
      'foldr1(function(soFar, current) {return current + soFar;}, "banana"); // ananab',
      makeArrayPropCaller(2, 'reduceRight',
                 {fixedArity : 2, aMessage: 'Value to be iterated over is not an array/string',
                                  fMessage: 'Accumulator must be a function of arity 2'})
    );


    var every = defineValue(
      'name: every',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes two parameters: a predicate function p that takes one argument, and an',
      'array, string or arraylike. Calls the predicate with every element of the array',
      'or string, until either the predicate function returns false, or the end of the',
      'array or string is reached.',
      '',
      'Returns the last value returned by the predicate function.',
      '',
      'Throws a TypeError if p is not a function of arity 1, or if the second argument',
      'is not an arraylike.',
      '--',
      'every(even, [2, 4, 6]); // true',
      makeArrayPropCaller(2, 'every',
                 {fixedArity : 1, aMessage: 'Value to be iterated over is not an array/string',
                                  fMessage: 'Predicate must be a function of arity 1'})
    );


    var some = defineValue(
      'name: some',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes two parameters: a predicate function p that takes one argument, and an',
      'array, string or arraylike. Calls the predicate with every element of the array',
      'or string, until either the predicate function returns true, or the end of the',
      'array or string is reached.',
      '',
      'Returns the last value returned by the predicate function.',
      '',
      'Throws a TypeError if p is not a function of arity 1, or if the second argument',
      'is not an array or string.',
      '--',
      'some(odd, [2, 4, 5, 6]; // true',
      makeArrayPropCaller(2, 'some',
                 {fixedArity : 1, aMessage: 'Value to be iterated over is not an array/string',
                                  fMessage: 'Predicate must be a function of arity 1'})
    );


    var maxFn = function(soFar, current) {
      if (current > soFar)
        return current;
      return soFar;
    };

    var maximum = defineValue(
      'name: maximum',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Returns the largest element of the given array, string or arraylike.',
      '',
      'Throws a TypeError if the value is not an arraylike, or it is empty.',
      '',
      'Note: this function is intended to be used with arrays containing numeric or',
      'character data. You are of course free to abuse it, but it will likely not do',
      'what you expect.',
      '--',
      'maximum([20, 10]); // 20',
      foldl1(maxFn)
    );


    var minFn = function(soFar, current) {
      if (current < soFar)
        return current;
      return soFar;
    };

    var minimum = defineValue(
      'name: minimum',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Returns the smallest element of the given array, string or arraylike.',
      '',
      'Throws a TypeError if the value is not an arraylike, or it is empty.',
      '',
      'Note: this function is intended to be used with arrays containing numeric or',
      'character data. You are of course free to abuse it, but it will likely not do',
      'what you expect.',
      '--',
      'minimum([20, 10]); // 10',
      foldl1(minFn)
    );


    var sumFn = function(soFar, current) {
      // Hack to prevent execution with strings
      if (typeof(current) === 'string')
        throw new TypeError('sum called on non-array value');

      return soFar + current;
    };

    var sum = defineValue(
      'name: sum',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Returns the sum of the elements of the given array, or arraylike.',
      '',
      'Throws a TypeError if the value is not an arraylike, or it is empty.',
      '',
      'Note: this function is intended to be used with arrays containing numeric data.',
      'You are of course free to abuse it, but it will likely not do what you expect.',
      '--',
      'sum([20, 10]); // 30',
      foldl(sumFn, 0)
    );


    var productFn = function(soFar, current) {
      // Hack to prevent execution with strings
      if (typeof(current) === 'string')
        throw new TypeError('sum called on non-array value');

      return soFar * current;
    };

    var product = defineValue(
      'name: product',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Returns the product of the elements of the given array, or arraylike.',
      '',
      'Throws a TypeError if the value is not an arraylike, or it is empty.',
      '',
      'Note: this function is intended to be used with arrays containing numeric data.',
      'You are of course free to abuse it, but it will likely not do what you expect.',
      '--',
      'product([20, 10]); // 200',
      foldl(productFn, 1)
    );


    var element = defineValue(
      'name: element',
      'signature: value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes a value and an array, string or arraylike. Returns true if the value is in',
      'the arraylike (checked for strict identity) and false otherwise.',
      '',
      'Throws a TypeError if the second argument is not an arraylike.',
      '--',
      'element(\'a\', \'cable\'); // true',
      curry(function(val, arr) {
        return some(base.strictEquals(val), arr);
      })
    );


    var elementWith = defineValue(
      'name: elementWith',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'A generalised version of element. Takes a predicate function p of one argument,',
      'and an array, string or arraylike. Returns true if there is an element in the',
      'arraylike for which p returns true, and returns false otherwise.',
      '',
      'Throws a TypeError if the first argument is not a function of arity 1, or the',
      'second argument is not an arraylike.',
      '--',
      'var p = function(e) {return e.foo = 42;};',
      'elementWith(p, [{foo: 1}, {foo: 42}]); // true',
      curry(function(p, arr) {
        return some(p, arr);
      })
    );


    var range = defineValue(
      'name: range',
      'signature: a: number, b: number',
      'classification: array',
      '',
      'Takes two numbers, a and b. Returns an array containing the arithmetic sequence',
      'of elements from a up to but not including b, each element increasing by 1.',
      '',
      'Throws a TypeError if b < a.',
      '--',
      'range(2, 7); [2, 3, 4, 5, 6]',
      curry(function(a, b) {
        if (b < a)
          throw new TypeError('Incorrect bounds for range');

        var result = [];
        for (var i = a; i < b; i++)
          result.push(i);

        return result;
      })
    );


    var rangeStep = defineValue(
      'name: rangeStep',
      'signature: a: number, step: number, b: number',
      'classification: array',
      '',
      'Takes three numbers, a step and b. Returns an array containing the arithmetic',
      'sequence of elements from a up to but not including b, each element increasing',
      'by step.',
      '',
      'Throws a TypeError if the sequence will not terminate.',
      '--',
      'rangeStep(2, 2, 7); [2, 4, 6]',
      curry(function(a, step, b) {
        if ((step > 0 && b < a) || (step < 0 && b > a) || (step === 0 && b !== a))
          throw new TypeError('Incorrect bounds for range');

        if (!isFinite(step))
          throw new TypeError('step must be finite');

        var result = [];
        for (var i = a; a < b ? i < b : i > b; i += step)
          result.push(i);

        return result;
      })
    );


    var take = defineValue(
      'name: take',
      'signature: count: number, arr: arraylike',
      'classification: array',
      '',
      'Takes a count, and an array, string or arraylike. Returns an array or string',
      'containing the first count elements of the given arraylike.',
      '',
      'Throws a TypeError if the count is not integral, or if the last argument is not',
      'an arraylike.',
      '--',
      'take(3, \'banana\'); // \'ban\'',
      curry(function(count, arr) {
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
      })
    );


    var drop = defineValue(
      'name: drop',
      'signature: count: number, arr: arraylike',
      'classification: array',
      '',
      'Takes a count, and an array, string or arraylike. Returns an array or string',
      'containing the first count elements removed from the given arraylike.',
      '',
      'Throws a TypeError if the count is not integral, or if the last argument is not',
      'an array or string.',
      '--',
      'drop(3, \'banana\'); // \'anana\'',
      curry(function(count, arr) {
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
      })
    );


    var init = defineValue(
      'name: init',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or arraylike. Returns an array or string containing every',
      'element except the last.',
      '',
      'Throws a TypeError if the arraylike is empty, or if the given value is not an',
      'arraylike.',
      '--',
      'init([2, 3, 4, 5]); // [2, 3, 4]',
      curry(function(arr) {
      if (arr.length === 0)
        throw new TypeError('Cannot take init of empty array/string');

      return take(length(arr) - 1, arr);
      })
    );


    var tail = defineValue(
      'name: tail',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or arraylike. Returns an array or string containing every',
      'element except the first.',
      '',
      'Throws a TypeError if the arraylike is empty, or if the given value is not an',
      'arraylike.',
      '--',
      'tail(\'banana\'); // \'anana\'',
      curry(function(arr) {
        if (arr.length === 0)
          throw new TypeError('Cannot take tail of empty array/string');

        return drop(1, arr);
      })
    );


    var inits = defineValue(
      'name: inits',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or arraylike. Returns all the prefixes of the given',
      'arraylike.',
      '',
      'Throws a TypeError if the given value is not an arraylike.',
      '--',
      'inits([2, 3]); // [[], [2], [2, 3]]',
      curry(function(arr) {
        arr = checkArrayLike(arr);
        var r = range(0, length(arr) + 1);

        return map(function(v) {return take(v, arr);}, r);
      })
    );


    var tails = defineValue(
      'name: tails',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or arraylike. Returns all the suffixes of the given',
      'arraylike.',
      '',
      'Throws a TypeError if the given value is not an arraylike.',
      '--',
      'tails([2, 3]); // [[2, 3], [3], []]',
      curry(function(arr) {
        arr = checkArrayLike(arr);
        var r = range(0, length(arr) + 1);

        return map(function(v) {return drop(v, arr);}, r);
      })
    );


    var copy = defineValue(
      'name: copy',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an arraylike, and returns a new array which is a shallow copy.',
      '',
      'Throws a TypeError if the given value is not an arraylike.',
      '--',
      'var a = [1, 2, 3];]',
      'var b = copy(a); // [1, 2, 3]',
      'b === a; // false',
      curry(function(arr) {
        arr = checkArrayLike(arr);

        return arr.slice();
      })
    );



    var slice = defineValue(
      'name: slice',
      'signature: from: number, to: number, arr: arraylike',
      'classification: array',
      '',
      'Takes two numbers, from and to, and an array, string or arraylike. Returns the',
      'subarray or string containing the elements between these two points (inclusive at',
      'from, exclusive at to). If to is greater than the length of the object, then all',
      'values from \'from\' will be returned.',
      '',
      'Throws a TypeError if from or to are not positive integers, or if the last',
      'argument is not an arraylike.',
      '--',
      'slice(1, 3, [1, 2, 3, 4, 5]; // [2, 3]',
      curry(function(from, to, arr) {
        from = checkPositiveIntegral(from, 'Invalid from position for slice');
        to = checkPositiveIntegral(to, 'Invalid to position for slice');

        return take(to - from, drop(from, arr));
      })
    );


    var takeWhile = defineValue(
      'name: takeWhile',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a predicate function pred, and source, which should be an array, string or',
      'arraylike. Returns a new array or string containing the initial members of the',
      'given arraylike for which the predicate returned true.',
      '',
      'Throws a TypeError if pred is not a function of arity 1, or if the source value',
      'is not an arraylike.',
      '--',
      'takeWhile(even, [2, 4, 3, 5, 7]; // [2, 4]',
      curry(function(p, source) {
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
      })
    );


    var dropWhile = defineValue(
      'name: dropWhile',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a predicate function p, and source, an array, string or arraylike. Returns',
      'a new array or string containing the remaining members our source upon removing',
      'the initial elements for which the predicate function returned true.',
      '',
      'Throws a TypeError if p is not a function of arity 1, or if the given value is',
      'not an arraylike.',
      '--',
      'dropWhile(even, [2, 4, 3, 5, 7]; // [3, 5, 7',
      curry(function(p, source) {
        p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});

        source = checkArrayLike(source, {message: 'dropWhile: source is not an array/string'});

        var l = source.length;
        var done = false;

        var i = 0;
        while (i < source.length && p(source[i]))
          i += 1;

        return source.slice(i);
      })
    );


    var prepend = defineValue(
      'name: prepend',
      'signature: value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes a value, and an array, string or arraylike, and returns a new array or',
      'string with the given value prepended.',
      '',
      'Throws a TypeError if the second argument is not an arraylike.',
      '',
      'Note: if the second argument is a string and the first is not, the value will be',
      'coerced to a string; you may not get the result you expect.',
      '--',
      'var a = [1, 2, 3];',
      'prepend(4, a); // [4, 1, 2, 3]',
      'a; // [1, 2, 3] (a is not changed)',
      curry(function(v, arr) {
        arr = checkArrayLike(arr);

        if (Array.isArray(arr))
          return [v].concat(arr);

        return '' + v + arr;
      })
    );


    var append = defineValue(
      'name: append',
      'signature: value: any, arr: arraylike',
      'classification: array',
      '',
      '--',
      'Takes a value, and an array, string or arraylike, and returns a new array or',
      'string with the given value appended.',
      '',
      'Throws a TypeError if the second argument is not an arraylike.',
      '',
      'Note: if the second argument is a string and the first is not, the value will be',
      'coerced to a string; you may not get the result you expect.',
      '--',
      'var a = [1, 2, 3];',
      'append(4, a); // [1, 2, 3, 4]',
      'a; // [1, 2, 3] (a is not changed)',
      curry(function(v, arr) {
        arr = checkArrayLike(arr);

        if (Array.isArray(arr))
          return arr.concat([v]);

        return '' + arr + v;
      })
    );


    var concat = defineValue(
      'name: concat',
      'signature: arr1: arraylike, arr2: arraylike',
      'classification: array',
      '',
      '--',
      'Takes two arrays, arraylikes or strings, and returns their concatenation.',
      '',
      'Throws a TypeError if either argument is not an arraylike.',
      '',
      'If both arguments are the same type and are either arrays or strings, then the',
      'result will be the same type, otherwise it will be an array.',
      '--',
      'concat([1, 2], [3, 4, 5]); // [1, 2, 3, 4, 5]',
      'concat(\'abc\', \'def\'); // \'abcdef\'',
      'concat(\'abc\', [1, 2, 3]); // [\'a\', \'b\', \'c\', 1, 2, 3]',
      curry(function(left, right) {
        left = checkArrayLike(left, {message: 'concat: First value is not arraylike'});
        right = checkArrayLike(right, {message: 'concat: Second value is not arraylike'});

        if (typeof(left) !== typeof(right)) {
          if (Array.isArray(left))
            right = right.split('');
          else
            left = left.split('');
        }

        return left.concat(right);
      })
    );


    var isEmpty = defineValue(
      'name: isEmpty',
      'signature: arr: arraylike',
      'classification: array',
      '',
      '--',
      'Returns true if the given array, arraylike or string is empty, and false if not.',
      '',
      'Throws a TypeError if the argument is not arraylike.',
      '--',
      'isEmpty([]); // true',
      curry(function(val) {
        val = checkArrayLike(val);

        return val.length === 0;
      })
    );


    var intersperse = defineValue(
      'name: intersperse',
      'signature: value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes a value, and an array, string or arraylike, and returns a new array or',
      'string with the value in between each pair of elements of the original.',
      '',
      'Note: if the second parameter is a string, the first parameter will be coerced',
      'to a string.',
      '',
      'Throws a TypeError if the second argument is not arraylike.',
      '--',
      'intersperse(1, [2, 3, 4]); // [2, 1, 3, 1, 4]',
      curry(function(val, arr) {
        arr = checkArrayLike(arr, {message: 'intersperse: Cannot operate on non-arraylike value'});

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
      })
    );


    var reverseFn = function(soFar, current) {
      return soFar.concat(Array.isArray(soFar) ? [current] : current);
    };


    var reverse = defineValue(
      'name: reverse',
      'signature: arr: arraylike',
      'classification: array',
      '',
      '--',
      'Takes an array, string or arraylike, and returns a new array or string that is',
      'the reverse of the original.',
      '',
      'Throws a TypeError if the argument is not arraylike.',
      '--',
      'reverse(\'banana\'); \'ananab\'',
      curry(function(arr) {
        arr = checkArrayLike(arr);

        return foldr(reverseFn, Array.isArray(arr) ? [] : '', arr);
      })
    );


    var find = defineValue(
      'name: find',
      'signature: value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes a value, and an array, string or arraylike. Searches for the value—tested',
      'for strict equality—and returns the index of the first match, or -1 if the value',
      'is not present.',
      '',
      'Throws a TypeError if the second parameter is not arraylike.',
      '--',
      'find(2, [1, 2, 3]); // 1',
      callPropWithArity('indexOf', 1)
    );


    var findFrom = defineValue(
      'name: findFrom',
      'signature: value: any, index: number, arr: arraylike',
      'classification: array',
      '',
      'Takes a value, an index, and an array, string or arraylike. Searches for the',
      'value—tested for strict equality—starting the search at the given index, and',
      'returns the index of the first match, or -1 if the value is not present.',
      '',
      'Throws a TypeError if the last parameter is not arraylike.',
      '--',
      'findFrom(2, 2, [1, 2, 3]); -1',
      curry(function(val, from, arr) {
        arr = checkArrayLike(arr);
        from = checkPositiveIntegral(from, {message: 'Index must be a positive integer'});

        return arr.indexOf(val, from);
      })
    );


    var findWith = defineValue(
      'name: findWith',
      'signature: pred: function, haystack: arraylike',
      'classification: array',
      '',
      'Takes a predicate function pred of arity 1, and haystack, an array, arraylike',
      'or string. Searches for the value—tested by the given function—and returns the',
      'index of the first match, or -1 if the value is not present.',
      '',
      'Throws a TypeError if the first parameter is not a predicate function of arity 1,',
      'or if the haystack parameter is not arraylike.',
      '--',
      'var pred = function(e) {return e.foo === 42;};',
      'var arr = [{foo: 1}, {foo: 2}, {foo: 42}, {foo: 3}];',
      'findWith(pred, arr); // 2',
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
      'name: findFromWith',
      'signature: pred: function, index: number, haystack: arraylike',
      'classification: array',
      '',
      '--',
      'Takes a predicate function pred of arity 1, and haystack, an array, arraylike',
      'or string. Searches for the value—tested by the given function—from the given',
      'index, and returns the index of the first match, or -1 if the value is not',
      'present.',
      '',
      'Throws a TypeError if the first parameter is not a predicate function of arity',
      '1, or the haystack parameter is not arraylike.',
      '--',
      'var pred = function(e) {return e.foo === 42;};',
      'var arr = [{foo: 1}, {foo: 2}, {foo: 42}, {foo: 3}];',
      'findFromWith(pred, 3, arr); // -1',
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


    var occurrences = defineValue(
      'name: occurrences',
      'signature: needle: any, haystack: arraylike',
      'classification: array',
      '',
      'Takes a value—needle—and haystack, an array, arraylike or string. Searches for',
      'all occurrences of the value—tested for strict equality—and returns an array',
      'containing all the indices into haystack where the values may be found.',
      '',
      'Throws a TypeError if the haystack parameter is not arraylike.',
      '--',
      'occurrences(2, [1, 2, 2, 3, 2, 4]; // [1, 2, 4]',
      curry(function(val, haystack) {
        haystack = checkArrayLike(haystack, {message: 'occurrences: haystack must be an array/string'});

        var result = [];
        for (var i = 0, l = haystack.length; i < l; i++)
          if (haystack[i] === val)
            result.push(i);

        return result;
      })
    );


    var occurrencesWith = defineValue(
      'name: occurrencesWith',
      'signature: pred: function, haystack: arraylike',
      'classification: array',
      '',
      'Takes a predicate function pred, and haystack, an array, arraylike or string.',
      'Searches for all occurrences of the value—tested by the given predicate—and',
      'returns an array containing all the indices into haystack where the predicate',
      'holds.',
      '',
      'Throws a TypeError if pred is not a predicate function of arity 1, or if the',
      'haystack parameter is not arraylike.',
      '--',
      'var pred = function(e) {return e.foo === 42;};',
      'var arr = [{foo: 1}, {foo: 42}, {foo: 42}, {foo: 3}];',
      'findFromWith(pred, arr); // [1, 2]',
      curry(function(p, haystack) {
        haystack = checkArrayLike(haystack, {message: 'occurrencesWith: haystack must be an array/string'});
        p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});

        var result = [];
        for (var i = 0, l = haystack.length; i < l; i++)
          if (p(haystack[i]))
            result.push(i);

        return result;
      })
    );


    var zipWith = defineValue(
      'name: zipWith',
      'signature: f: function, arr1: arraylike, arr2: arraylike',
      'classification: array',
      '',
      '--',
      'Takes a function of arity 2, and a two arrays/arraylikes/strings, a and b, and',
      'returns a new array. The new array has the same length as the smaller of the two',
      'arguments. Each element is the result of calling the supplied function with the',
      'elements at the corresponding position in the original arraylikes.',
      '',
      'Throws a TypeError if the first argument is not an argument of arity at least 2,',
      'or if neither of the last two arguments is arraylike.',
      '--',
      'var f = function(a, b) {return a + b;};',
      'zipWith(f, \'apple\', \'banana\'); // [\'ab\', \'pa\', \'pn\', \'la\', \'en\']',
      curry(function(f, a, b) {
        a = checkArrayLike(a, {message: 'First source value is not an array/string'});
        b = checkArrayLike(b, {message: 'Second source value is not an array/string'});

        f = checkFunction(f, {arity: 2, minimum: true, message: 'Constructor must be a function with arity at least 2'});

        var len = Math.min(a.length, b.length);

        var result = [];
        for (var i = 0; i < len; i++)
          result.push(f(a[i], b[i]));

        return result;
      })
    );


    var zip = defineValue(
      'name: zip',
      'signature: a: arraylike, b: arraylike',
      'classification: array',
      '',
      'Takes two arraylikes, a and b, and returns a new array. The new array has the',
      'same length as the smaller of the two arguments. Each element is a Pair p, such',
      'that fst(p) === a[i] and snd(p) === b[i] for each position i in the result.',
      '',
      'Throws a TypeError if neither argument is arraylike.',
      '--',
      'zip([1, 2], [3, 4]); // [Pair(1, 3), Pair(2, 4)]',
      zipWith(Pair)
    );


    var unzip = defineValue(
      'name: unzip',
      'signature: arr: array',
      'classification: array',
      '',
      '--',
      'Takes an array of Pairs, and returns a Pair. The first element is an array',
      'containing the first element from each pair, and likewise the second element is',
      'an array containing the second elements.',
      '',
      'Throws a TypeError if the given argument is not an array, or if any element is',
      'not a Pair.',
      '--',
      'unzip([Pair(1, 2), Pair(3, 4)]); // Pair([1, 3], [2, 4])',
      curry(function(source) {
        source = checkArrayLike(source, {noStrings: true, message: 'Source value is not an array'});

        return Pair(map(fst, source), map(snd, source));
      })
    );


    var nubFn = function(soFar, current) {
      return soFar.indexOf(current) !== -1 ? soFar :
             soFar.concat(Array.isArray(soFar) ? [current] : current);
    };


    var nub = defineValue(
      'name: nub',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or arraylike. Returns a new array/string, with all',
      'duplicate elements—tested for strict equality—removed. The order of elements',
      'is preserved.',
      '',
      'Throws a TypeError if the given argument is not arraylike.',
      '--',
      'nub(\'banana\'); // \'ban\'',
      curry(function(arr) {
        arr = checkArrayLike(arr);

        return foldl(nubFn, Array.isArray(arr) ? [] : '', arr);
      })
    );


    var nubWithFn = curry(function(p, soFar, current) {
      var isDuplicate = some(base.flip(p)(current), soFar);

      return isDuplicate ? soFar :
             soFar.concat(Array.isArray(soFar) ? [current] : current);
    });


    var nubWith = defineValue(
      'name: nubWith',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a predicate function of arity 2, and an array, string or arraylike.',
      'Returns a new array/string, with all duplicate elements removed. A duplicate is',
      'defined as a value for which the predicate function returned true when called',
      'with a previously encountered element and the element under consideration. The',
      'order of elements is preserved.',
      '',
      'Throws a TypeError if the first argument is not a function, or has an arity',
      'other than 2, or if the last argument is not arraylike.',
      '--',
      'var pred = function(x, y) {return x.foo === y.foo;};',
      'nubWith(pred, [{foo: 12}, {foo: 42}, {foo: 42}, {foo: 12}]);',
      '// returns [{foo: 12}, {foo: 42}]',
      curry(function(p, arr) {
        arr = checkArrayLike(arr);
        p = checkFunction(p, {arity: 2, message: 'Predicate must be a function of arity 2'});

        var fn = nubWithFn(p);
        return foldl(fn, Array.isArray(arr) ? [] : '', arr);
      })
    );


    var sort = defineValue(
      'name: sort',
      'signature: arr: arraylike',
      'classification: array',
      '',
      'Takes an array, string or arraylike, and returns a new array, sorted in',
      'lexicographical order.',
      '',
      'Throws a TypeError if the given argument is not arraylike.',
      '--',
      'sort([10, 1, 21, 2]); // [1, 10, 2, 21]',
      curry(function(arr) {
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
      })
    );


    var sortWith = defineValue(
      'name: sortWith',
      'signature: f: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a function of two arguments, and an array, string or arraylike. Returns a',
      'new array/string, sorted per the given function. The function should return a',
      'negative number if the first argument is "less than" the second, 0 if the two',
      'arguments are "equal", and a positive number if the first argument is greater',
      'than the second.',
      '',
      'Throws a TypeError if the first argument is not a function of arity 2, or if the',
      'second is not arraylike.',
      '--',
      'var sortFn = function(x, y) {return x - y;};',
      'sortWith(sortFn, [10, 1, 21, 2]); // [1, 2, 10, 21]',
      makeArrayPropCaller(2, 'sort', {fixedArity: 2, returnSameType: true})
    );


    // XXX Argument order consistency with other funcs that take val and index?
    var insert = defineValue(
      'name: insert',
      'signature: index: number, value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes an index, a value, and an array, string or arraylike. Returns a new',
      'array/string with the value inserted at the given index, and later elements',
      'shuffled one place to the right. The index argument should be a number between',
      '0 and the length of the given array/string; a value equal to the length will',
      'insert the new value at the end of the array/string. If passed a string, the',
      'value will be coerced to a string if necessary.',
      '',
      'Throws a TypeError if the index is out of bounds, or otherwise invalid, or if',
      'the last argument is not arraylike.',
      '--',
      'var a = [1, 2, 3];',
      'insert(1, 10, a); // Returns [1, 10, 2, 3]; a is unchanged',
      curry(function(index, val, arr) {
        arr = checkArrayLike(arr, {message: 'insert: Recipient is not arraylike'});
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
      'name: remove',
      'signature: index: number, value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes an index, and an array, string or arraylike. Returns a new array/string',
      'with the value at the given index removed, and later elements shuffled one place',
      'to the left. The index argument should be a number between 0 and one less than',
      'the length of the given array/string.',
      '',
      'Throws a TypeError if the index is out of bounds, or otherwise invalid, or if',
      'the last argument is not arraylike.',
      '--',
      'var a = [1, 10, 2];',
      'remove(1, a); // Returns [1, 2]; a is unchanged',
      curry(function(index, arr) {
        arr = checkArrayLike(arr, {message: 'remove: Value to be modified is not arraylike'});
        index = checkPositiveIntegral(index, 'Index out of bounds');
        if (index >= arr.length)
          throw new TypeError('Index out of bounds');


        return arr.slice(0, index).concat(arr.slice(index + 1));
      })
    );


    // XXX Argument order consistency with other funcs that take val and index?
    // XXX Also, need to look over this wrt strings
    var replace = defineValue(
      'name: replace',
      'signature: index: number, value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes an index, a value, and an array, string or arraylike. Returns a new',
      'array/string with the value replacing the value at the given index. The index',
      'argument should be a number between 0 and one less than the length of the given',
      ' array/string. If passed a string, the value will be coerced to a string if',
      'necessary.',
      '',
      'Throws a TypeError if the index is out of bounds, or otherwise invalid, or if',
      'the last argument is not arraylike.',
      '--',
      'var a = [1, 10, 3];',
      'replace(1, 2, a); // Returns [1, 2, 3]; a is unchanged',
      curry(function(index, val, arr) {
        arr = checkArrayLike(arr, {message: 'replace: Value to be modified is not arraylike'});
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
      'name: removeOneWith',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a predicate function of arity 1, and an array. Returns a new array with the',
      'first value for which the function returns true removed from the array.',
      '',
      'Throws a TypeError if the given predicate is not a function, or does not have',
      'arity 1, or if the last parameter is not an array.',
      '--',
      'var pred = function(x) {return x.foo === 42;};',
      'removeOne(pred, [{foo: 1}, {foo: 42}, {foo: 3}]); // Returns [{foo: 1}, {foo: 3}]',
      curry(function(p, arr) {
        p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
        arr = checkArrayLike(arr, {message: 'Value to be modified is not an array', noStrings: true});

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
      'name: removeOne',
      'signature: value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes a value, and an array. Returns a new array with the first occurrence of the',
      ' value—checked for strict equality— removed from the array.',
      '',
      'Throws a TypeError if the last argument is not an array.',
      '--',
      'removeOne(2, [1, 2, 2, 3]); // Returns [1, 2, 3]',
      compose(removeOneWith, strictEquals)
    );


    var removeAll = defineValue(
      'name: removeAll',
      'signature: value: any, arr: arraylike',
      'classification: array',
      '',
      'Takes a value, and an array. Returns a new array with all occurrences of the',
      'given value—checked for strict equality—removed from the array.',
      '',
      'Throws a TypeError if the last argument is not an array.',
      '--',
      'removeAll(2, [1, 2, 2, 3]); // Returns [1, 3]',
      curry(function(val, arr) {
        arr = checkArrayLike(arr, {noStrings: true});

        var pred = notPred(strictEquals(val));
        return filter(pred, arr);
      })
    );


    var removeAllWith = defineValue(
      'name: removeAllWith',
      'signature: pred: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a predicate function of arity 1, and an array. Returns a new array with',
      'values for which the function returns true removed from the array.',
      '',
      'Throws a TypeError if the first argument is not a predicate function of arity 1,',
      'or if the last parameter is not an array.',
      '--',
      'var pred = function(x) {return x.foo === 42;};',
      'removeAllWith(pred [{foo: 42}, {foo: 12}, {foo: 1}, {foo: 42}]);',
      '// returns [{foo: 12}, {foo: 1}]',
      curry(function(pred, arr) {
        arr = checkArrayLike(arr, {noStrings: true});

        var pred = notPred(pred);
        return filter(pred, arr);
      })
    );


    var replaceOneWith = defineValue(
      'name: replaceOneWith',
      'signature: pred: function, value: any, arr: array',
      'classification: array',
      '',
      'Takes a predicate function of arity 1, a replacement value, and an array.',
      'Returns a new array where the first value for which the given predicate returned',
      'true has been replaced with the given replacement.',
      '',
      'Throws a TypeError if the first argument is not a function, if the function does',
      'not have arity 1, or if the last parameter is not an array.',
      '--',
      'var pred = function(x) {return x.foo === 42;};',
      'replaceOneWith(pred {bar: 10}, [{foo: 42}, {foo: 12}, {foo: 1}, {foo: 42}]);',
      '// returns [{bar: 10}, {foo: 12}, {foo: 1}, {foo: 42}]',
      curry(function(p, replacement, arr) {
        p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
        arr = checkArrayLike(arr, {message: 'Value to be modified is not arraylike', noStrings: true});
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
      'name: replaceOne',
      'signature: value: any, newValue: any, arr: arraylike',
      'classification: array',
      '',
      'Takes a value, a replacement value, and an array. Returns a new array where the',
      'first occurrence of the given value—checked for strict equality—is replaced with',
      'the given replacement.',
      '',
      'Throws a TypeError if the last parameter is not an array.',
      '--',
      'replaceOne(2, 42, [1, 2, 3]); // [1, 42, 3]',
      curry(function(val, replacement, arr) {
        return replaceOneWith(base.strictEquals(val), replacement, arr);
      })
    );


    var replaceAllWith = defineValue(
      'name: replaceAllWith',
      'signature: pred: function, newValue: any, arr: array',
      'classification: array',
      '',
      'Takes a predicate function of arity 1, a replacement value, and an array.',
      'Returns a new array/string where all values for which the predicate returned true',
      'have been replaced with the given replacement.',
      'Throws a TypeError if the first parameter is not a function of arity 1, or if the',
      'last parameter is not an array.',
      '--',
      'var pred = function(x) {return x.foo === 42;};',
      'replaceAllWith(pred {bar: 10}, [{foo: 42}, {foo: 12}, {foo: 1}, {foo: 42}]);',
      '// returns [{bar: 10}, {foo: 12}, {foo: 1}, {bar: 10}]',
      curry(function(p, replacement, arr) {
        p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
        arr = checkArrayLike(arr, {message: 'Value to be modified is not an array', noStrings: true});
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
      'name: replaceAll',
      'signature: value: any, newValue: any, arr: array',
      'classification: array',
      '',
      'Takes a value, a replacement value, and an array. Returns a new array where all',
      'occurrences of the given value—checked for strict equality—have been replaced',
      'with the given replacement.',
      '',
      'Throws a TypeError if the last parameter is not an array.',
      '--',
      curry(function(val, replacement, arr) {
        return replaceAllWith(strictEquals(val), replacement, arr);
      })
    );


    var join = defineValue(
      'name: join',
      'signature: separator: string, arr: array',
      'classification: array',
      '',
      'Takes a separator value that can be coerced to a string, and an array. Returns a',
      'string, containing the toString of each element in the array, separated by the',
      'toString of the given separator.',
      '',
      'Throws a TypeError if the last element is not an array.',
      '--',
      'join(\'-\', [1, 2, 3]); // \'1-2-3\'',
      curry(function(sep, arr) {
        arr = checkArrayLike(arr, {noStrings: true, message: 'join: Value to be joined is not an array'});

        return arr.join(sep);
      })
    );


    var flattenFn = function(soFar, current) {
      current = checkArrayLike(current);

      return concat(soFar, current);
    };


    var flatten = defineValue(
      'name: flatten',
      'signature: arr: array',
      'classification: array',
      '',
      'Takes an array containing arrays or strings. Returns an array containing the',
      'concatenation of those arrays/strings. Note that flatten only strips off one',
      'layer.',
      '',
      'Throws a TypeError if the supplied value is not arraylike, or if any of the',
      'values within it are not arraylike.',
      '--',
      'flatten([[1, 2], [3, 4]]); // [1, 2, 3, 4]',
      curry(function(arr) {
        arr = checkArrayLike(arr, {noStrings: true, message: 'Value to be flattened is not an array'});

        return foldl(flattenFn, [], arr);
      })
    );


    var flattenMap = defineValue(
      'name: flattenMap',
      'signature: f: function, arr: arraylike',
      'classification: array',
      '',
      'Takes a function of arity 1, and an array, string or arraylike. Maps the function',
      'over the array/string and flattens the result. The supplied function must be of',
      'arity 1, as it is expected to return an array or string; a TypeError is thrown if',
      'this is not the case.',
      '',
      'A TypeError will also be thrown if the last argument is not',
      'arraylike, or if the first argument is not a function.',
      '--',
      'var fn = function(n) {return [n, n * n];};',
      'flattenMap(fn, [1, 2, 3]); // Returns [1, 1, 2, 4, 3, 9]',
      curry(function(f, arr) {
        return flatten(map(f, arr));
      })
    );


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
      insert: insert,
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
      prepend: prepend,
      product: product,
      range: range,
      rangeStep: rangeStep,
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
      replicate: replicate,
      reverse: reverse,
      slice: slice,
      some: some,
      sort: sort,
      sortWith: sortWith,
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
