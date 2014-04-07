(function() {
  "use strict";


  var makeModule = function(require, exports) {

    /*
     * curry: take a function fn, and curry up to the function's arity, as defined by the
     *        function's length property. The curried function returned will have length 1,
     *        unless the original function had length 0, in which case the returned function
     *        will have length 0 too. Arguments are curried left to right.
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
     */

    var curry = function(fn) {
      return curryWithArity(fn.length, fn);
    };


    /*
     * curryWithArity: take an arity and a function fn, and curry up to the specified arity, regardless of the
     *                 function's length. Note in particular, a function can be curried to a length greater
     *                 than its arity. Arguments are curried left to right. The returned function will have
     *                 length 1, unless the arity requested was 0, in which case the length will be zero.
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
     */

    var curryWithArity = function(length, fn) {
      // Handle the special case of length 0
      if (length === 0) {
        var result = function() {
          // Don't simply return fn: need to discard any arguments
          return fn();
        };
        result['_trueArity'] = 0;
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
          return fn.apply(null, args);

        // We don't have enough arguments. Bind those that we already have
        var newFn = fn.bind.apply(fn, [null].concat(args));
        var argsNeeded = length - args.length;

        // Continue currying if we can't yet return a function of length 1
        if (argsNeeded > 1)
          return curryWithArity(argsNeeded, newFn);

        // The trivial case
        var trivial = function(b) {
          return newFn(b);
        };
        trivial['_trueArity'] = 1;
        return trivial;
      };

      curried['_trueArity'] = length;
      return curried;
    };

    // curryWithArity should itself be curried
    curryWithArity = curry(curryWithArity);


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
      var gLen = g.hasOwnProperty('_trueArity') ? g['_trueArity'] : g.length;
      var fLen = f.hasOwnProperty('_trueArity') ? f['_trueArity'] : f.length;

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
      var fLen = f.hasOwnProperty('_trueArity') ? f['_trueArity'] : f.length;

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

    var composeMany = function(fnArray) {
      if (fnArray.length === 0)
        throw new TypeError('composeMany called with empty array');

      if (fnArray.length === 1)
        return curry(fnArray[0]);

      return fnArray.reduceRight(flip(compose));
    };


    var exported = {
      compose: compose,
      composeMany: composeMany,
      constant: constant,
      constant0: constant0,
      curry: curry,
      curryWithArity: curryWithArity,
      flip: flip,
      id: id
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
