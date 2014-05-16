(function() {
  "use strict";

  var utils = require('./utils');
  var checkPositiveIntegral = utils.checkPositiveIntegral;


  var makeModule = function(require, exports) {
    // Property that will be installed on all curried functions reflecting 'real' arity.
    // When we attach this property to the curried functions, we will use Object.defineProperty.
    // This is a minor hack to prevent the property showing up when the functions are logged
    // to the console (enumerable will be false).
    var arityProp = '_trueArity';


    /*
     * curry: Takes a function fn, and curries it up to the function's arity, as defined by the
     *        function's length property. The curried function returned will have length 1,
     *        unless the original function had length 0, in which case the returned function
     *        will have length 0 too. Arguments are curried left to right. Throws if fn is not a function.
     *
     * curry will ultimately call the underlying function with a null execution context. Use
     * Function.prototype.bind beforehand if you need to curry with a specific context.
     *
     * Each curried function will have an arity of 1, but will accept > 1 arguments. If the number
     * of arguments supplied is equal to the number of outstanding arguments, the
     * underlying function will be called. For example,
     *   var f = curry(function(a, b) {...});
     *   f(1); // returns a function that awaits a value for the b parameter
     *   f(1, 2); // calls the original function with a=1, b=2
     *
     * If the curried function is called with superfluous arguments, they will be discarded.
     * This avoids unexpected behaviour triggered by supplying optional arguments. Functions accepting
     * optional arguments effectively represent a family of functions with different type-signatures,
     * so each variant should be treated seperately.
     *
     * If you need a function to accept a specific number of arguments, where that number is different
     * from the function's length property, use curryWithArity instead.
     *
     */

    var curry = function(fn) {
      var desiredLength = fn.hasOwnProperty(arityProp) ? fn[arityProp] : fn.length;
      return curryWithArity(desiredLength, fn);
    };


    /*
     * curryWithArity: take an arity and a function fn, and curry up to the specified arity, regardless of the
     *                 function's length. Note in particular, a function can be curried to a length greater
     *                 than its arity. Arguments are curried left to right. The returned function will have
     *                 length 1, unless the arity requested was 0, in which case the length will be zero. Throws if
     *                 fn is not a function, or if length is not a non-negative integer.
     *
     * curryWithArity will ultimately call the underlying function with a null execution context. Use
     * Function.prototype.bind beforehand if you need to curry with a specific context.
     *
     * Each curried function will have an arity of 1, but will accept > 1 arguments. If the number
     * of arguments supplied is equal to the number of outstanding arguments, the
     * underlying function will be called. For example,
     *   var f = curryWithArity(2, function(a, b) {...});
     *   f(1); // returns a function that awaits a value for the b parameter
     *   f(1, 2); // calls the original function with a=1, b=2
     *
     * If the curried function is called with superfluous arguments, they will be discarded.
     * This avoids unexpected behaviour triggered by supplying optional arguments. Functions accepting
     * optional arguments effectively represent a family of functions with different type-signatures,
     * so each variant should be treated seperately.
     *
     */

    var curryWithArity = function(length, fn) {
      length = checkPositiveIntegral(length);

      // We can't use checkFunction from funcUtils here: it depends on base; it would introduce a circular dependency
      if (typeof(fn) !== 'function')
        throw new TypeError('Value to be curried is not a function');

      if (fn.hasOwnProperty(arityProp) && fn[arityProp] === length)
        return fn;

      // Handle the special case of length 0
      if (length === 0) {
        var result = function() {
          // Don't simply return fn: need to discard any arguments
          return fn.apply(this);
        };

        Object.defineProperty(result, arityProp, {value: 0});
        return result;
      }

      var curried = function(a) {
        var args = [].slice.call(arguments);
        var argsNeeded = length - args.length;

        // If we have more args than expected, trim down to the expected length
        // (the function will be called when we fall through to the next conditional)
        if (args.length > length)
          args = args.slice(0, length);

        // If we have enough arguments, call the underlying function
        if (args.length === length)
          return fn.apply(this, args);

        // We don't have enough arguments. Bind those that we already have
        var newFn = fn.bind.apply(fn, [this].concat(args));
        var argsNeeded = length - args.length;

        // Continue currying if we can't yet return a function of length 1
        if (argsNeeded > 1)
          return curryWithArity(argsNeeded, newFn);

        // The trivial case
        var trivial = function(b) {
          return newFn(b);
        };

        Object.defineProperty(trivial, arityProp, {value: 1});
        return trivial;
      };

      Object.defineProperty(curried, arityProp, {value: length});
      return curried;
    };

    // curryWithArity should itself be curried
    curryWithArity = curry(curryWithArity);


    /*
     * getRealArity: reports the real arity of a function. If the function has not been curried by funkier.js
     *               this simply returns the function's length property. For a function that has been curried,
     *               the arity of the original function will be reported (the function's length property will
     *               always be 0 or 1 in this case). For a partially applied function, the amount of arguments
     *               not yet supplied will be returned.
     *
     * For example:
     *   function(x) {}.length == 1;
     *   getRealArity(function(x) {}) == 1;
     *   function(x, y) {}.length == 2;
     *   getRealArity(function(x, y) {}) == 2;
     *   curry(function(x, y) {}).length == 1;
     *   getRealArity(curry(function(x, y) {})) == 2;
     *   getRealArity(curry(function(x, y, z) {})) == 3;
     *   getRealArity(curry(function(x, y, z) {})(1)) == 2;
     *
     */

    var getRealArity = function(f) {
      return f.hasOwnProperty(arityProp) ? f[arityProp] : f.length;
    };


    /*
     * compose: Composes the two functions f and g, returning a new function that will return f(g(<arguments>)).
     *          The function g must have arity 0 or 1. A TypeError will be thrown when this is not the case.
     *          Likewise, g must have arity >= 1. A TypeError will be thrown when this is not the case.
     *          If f has arity > 1, it will be curried, and partially applied when an argument is supplied to the
     *          composed function.
     *
     * For example:
     *
     * var f1 = function(a) {return a + 1;};
     * var f2 = function(b) {return b * 2;};
     * var f = compose(f1, f2); // f(x) = 2(x + 1)
     *
     * As usual, superfluous arguments supplied to the returned function will be discarded.
     *
     */

    var compose = curry(function(f, g) {
      var gLen = g.hasOwnProperty(arityProp) ? g[arityProp] : g.length;
      var fLen = f.hasOwnProperty(arityProp) ? f[arityProp] : f.length;

      if (fLen === 0)
        throw new TypeError('compose called with function of arity 0');

      f = curry(f);
      g = curry(g);

      // If g has arity > 0, then we accept one argument for g, and f.length - 1 arguments for f
      // Otherwise, we accept fLen - 1 arguments.
      var curryTo = fLen - (gLen > 0 ? 0 : 1);

      return curryWithArity(curryTo, function() {
        var args = [].slice.call(arguments);

        var gArgs = gLen > 0 ? [args[0]] : [];
        var fArgs = gLen > 0 ? args.slice(1) : args;
        return f.apply(null, [g.apply(null, gArgs)].concat(fArgs));
      });
    });


    /*
     * id: Returns the value passed in
     *
     * Satisfies id(x) === x.
     *
     * Superfluous arguments supplied will be discarded.
     *
     */

    var id = function(x) {
      return x;
    };


    /*
     * constant: Takes a value x, and returns a function of one parameter that, when called, returns x
     *           regardless of input
     *
     * constant(x)(y) === x for all x, y
     *
     * Superfluous arguments supplied to the returned function will be discarded.
     *
     */

    var constant = curry(function(x, y) {
      return x;
    });


    /*
     * constant0: Similar to constant, but returns a function of arity 0.
     *
     * constant0(x)() === x for all x
     *
     * Superfluous arguments supplied to the returned function will be discarded.
     *
     */

    var constant0 = compose(curryWithArity(0), constant);


    /*
     * flip: takes a binary function f, and returns a curried function that flips the arguments.
     *       Throws if called with a function of arity > 2
     *
     * i.e. flip(f)(a, b) == f(b, a);
     *
     */

    var flip = function(f) {
      // XXX Use funcUtils when curry bits split out
      if (typeof(f) !== 'function')
        throw new TypeError('Value to be flipped is not a function');

      var fLen = f.hasOwnProperty(arityProp) ? f[arityProp] : f.length;

      if (fLen < 2)
        return curry(f);

      if (fLen > 2)
        throw new TypeError('flip called with function of arity > 2');

      return curry(function(a, b) {
        return f(b, a);
      });
    };


    /*
     * composeMany: repeatedly composes the given array of functions, from right to left
     *
     * composeMany([f1, f2, f3]) behaves like f1(f2(f3(x)));
     * All functions are curried when necessary.
     *
     */

    // XXX should we supply a vararg variant of composeMany?

    var composeMany = function(fnArray) {
      if (fnArray.length === 0)
        throw new TypeError('composeMany called with empty array');

      if (fnArray.length === 1)
        return curry(fnArray[0]);

      // We don't use foldr to avoid creating a circular dependency
      return fnArray.reduceRight(flip(compose));
    };


    /*
     * applyFunc: apply the given function f with the given argument x, returning the result.
     *            The given function will be curried if it has arity > 1
     *
     * Thus, applyFunc(f, x) = f(x)
     *
     */

    var applyFunc = curry(function(f, x) {
      f = curry(f);
      return f(x);
    });


    /*
     * sectionLeft: sectionLeft is a synonym for applyFunc.
     *
     */

    var sectionLeft = applyFunc;


    /*
     * sectionRight: partially applies the binary function f with the given argument x, with x being supplied as
     *               the second argument to f. Throws if f is not a binary function.
     *
     * sectionRight satisfies the equation sectionRight(f, x) = applyFunc(flip(f), x);
     *
     */

    var sectionRight = curry(function(f, x) {
      var fLen = f.hasOwnProperty(arityProp) ? f[arityProp] : f.length;
      if (fLen !== 2)
        throw new TypeError('sectionRight called with function of arity ' + fLen);

      return sectionLeft(flip(f), x);
    });


    /*
     * equals: tests non-strict equality (==) on its two arguments
     *
     */

    var equals = curry(function(x, y) {
      return x == y;
    });


    /*
     * strictEquals: tests strict equality (===) on its two arguments
     *
     */

    var strictEquals = curry(function(x, y) {
      return x === y;
    });


    /*
     * notEqual: tests non-identity (!=) on its two arguments
     *
     */

    var notEqual = curry(function(x, y) {
      return x != y;
    });


    /*
     * strictNotEqual: tests strict non-identity (!==) on its two arguments
     *
     */

    var strictNotEqual = curry(function(x, y) {
      return x !== y;
    });


    // Helper function for deepEqual. Assumes both objects are arrays.
    var deepEqualArr = function(a, b) {
      if (a.length !== b.length)
        return false;

      return a.every(function(val, i) {
        return deepEqual(val, b[i]);
      });
    };


    // Helper function for deepEqual. Assumes identity has already been checked, and
    // that a check has been made for both objects being arrays.
    var deepEqualObj = function(a, b) {
      // Identity should have already been checked (ie a ==== b === null)
      if (a === null || b === null)
        return false;

      // Likewise, we should already have checked for arrays
      if (Array.isArray(a) || Array.isArray(b))
        return false;

      if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
        return false;

      var aKeys = Object.keys(a);
      var bKeys = Object.keys(b);
      aKeys.sort();
      bKeys.sort();

      if (!deepEqualArr(aKeys, bKeys))
        return false;

      return aKeys.every(function(k) {
        return deepEqual(a[k], b[k]);
      });
    };


    /*
     * deepEqual: check two values for deep equality. Deep equality holds if any
     *            of the following hold:
     *            - strictEquals(a, b) is true i.e. identity.
     *            - Both values are objects with the same prototype, same enumerable
     *              properties, and those properties are deepEqual. Non-enumerable properties
     *              are not checked.
     *            - Both values are arrays with the same length, and the items at each
     *              index are themselves deepEqual.
     *
     */

    var deepEqual = curry(function(a, b) {
      if (strictEquals(a, b))
        return true;

      if (typeof(a) !== typeof(b))
        return false;

      if (typeof(a) !== 'object')
        return false;

      if (Array.isArray(a) && Array.isArray(b))
        return deepEqualArr(a, b);

      return deepEqualObj(a, b);
    });


    /*
     * permuteLeft: takes a function, returns a curried function of the same arity
     *              which takes the same parameters, except in a different position.
     *              The first parameter of the original function will be the last parameter
     *              of the new function, the second parameter of the original will be the first
     *              parameter of the new function and so on. This function is essentially a no-op
     *              for functions of arity 0 and 1, and equivalent to flip for functions of arity 2.
     *
     * For example, if:
     *  f = function(x, y, z) {...};
     *  g = permuteLeft(f);
     * then f(a, b, c) and g(b, c, a) are equivalent.
     *
     */

    var permuteLeft = curry(function(f) {
      var fLen = getRealArity(f);
      f = curry(f);

      if (fLen < 2)
        return f;

      return curryWithArity(fLen, function() {
        var args = [].slice.call(arguments);
        var newArgs = [args[fLen - 1]].concat(args.slice(0, fLen - 1));
        return f.apply(null, newArgs);
      });
    });


    /*
     * permuteRight: takes a function, returns a curried function of the same arity
     *               which takes the same parameters, except in a different position.
     *               The last parameter of the original function will be the first parameter
     *               of the new function, the first parameter of the original will be the second
     *               parameter of the new function and so on. This function is essentially a no-op
     *               for functions of arity 0 and 1, and equivalent to flip for functions of arity 2.
     *
     * For example, if:
     *  f = function(x, y, z) {...};
     *  g = permuteLeft(f);
     * then f(a, b, c) and g(c, a, b) are equivalent.
     *
     */

    var permuteRight = curry(function(f) {
      var fLen = getRealArity(f);
      f = curry(f);

      if (fLen < 2)
        return f;

      return curryWithArity(fLen, function() {
        var args = [].slice.call(arguments);
        var newArgs = args.slice(1).concat([args[0]]);
        return f.apply(null, newArgs);
      });
    });


    /*
     * is: a curried wrapper around typeof. Takes a string that could be returned by the typeof operator,
     *     and an object. Returns true if the type of the given object equals the given string. Throws if the first
     *     argument is not a string.
     *
     * For example,
     *   is('object', {}); // true
     *
     */

    var is = curry(function(s, obj) {
      if (typeof(s) !== 'string')
        throw new TypeError('Type to be checked is not a string');

      return typeof(obj) === s;
    });


    /*
     * isNumber: Returns true if typeof the given object returns 'number'.
     *
     */

    var isNumber = is('number');


    /*
     * isString: Returns true if typeof the given object returns 'string'.
     *
     */

    var isString = is('string');


    /*
     * isBoolean: Returns true if typeof the given object returns 'boolean'.
     *
     */

    var isBoolean = is('boolean');


    /*
     * isUndefined: Returns true if typeof the given object returns 'undefined'.
     *
     */

    var isUndefined = is('undefined');


    /*
     * isObject: Returns true if typeof the given object returns 'object'.
     *
     */

    var isObject = is('object');


    /*
     * isArray: Returns true if the given object is an array
     *
     */

    var isArray = function(obj) {
      return Array.isArray(obj);
    };


    /*
     * isNull: Returns true if the given object is the value null
     *
     */

    var isNull = function(obj) {
      return obj === null;
    };


    /*
     * isRealObject: Returns true if the given object is a 'real' object, i.e. an
     *               typeof(obj) === 'object', and obj !== null and isArray(obj) === false
     *
     */

    var isRealObject = function(obj) {
      return isObject(obj) && !(isArray(obj) || isNull(obj));
    };


    /*
     * getType: a function wrapper around the typeof operator. Takes
     *          any Javascript value, and returns a string representing
     *          the object's type: one of 'number', 'boolean', 'string',
     *          'undefined', 'function' or 'object'.
     *
     */

    var getType = curry(function(val) {
      return typeof(val);
    });


    var exported = {
      applyFunc: applyFunc,
      compose: compose,
      composeMany: composeMany,
      constant: constant,
      constant0: constant0,
      curry: curry,
      curryWithArity: curryWithArity,
      deepEqual: deepEqual,
      equals: equals,
      flip: flip,
      getRealArity: getRealArity,
      getType: getType,
      id: id,
      is: is,
      isArray: isArray,
      isBoolean: isBoolean,
      isNumber: isNumber,
      isNull: isNull,
      isObject: isObject,
      isRealObject: isRealObject,
      isString: isString,
      isUndefined: isUndefined,
      notEqual: notEqual,
      permuteLeft: permuteLeft,
      permuteRight: permuteRight,
      sectionLeft: sectionLeft,
      sectionRight: sectionRight,
      strictEquals: strictEquals,
      strictNotEqual: strictNotEqual
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
