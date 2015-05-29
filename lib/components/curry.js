module.exports = (function () {
  "use strict";

  var checkPositiveIntegral = require('../internalUtilities').checkPositiveIntegral;

  // Property that will be installed on all curried functions reflecting 'real' arity.
  var arityProp = '_trueArity';

  // Property that will be installed on curried functions that have not been partially applied
  var uncurriedProp = '_getOriginal';

  /*
   * Ostensibly an internal helper function to detect whether or not a function is curried. It does however, have to
   * be installed as a property of arityOf, as some of the auto-generated tests require it.
   *
   */

  var isCurried = function(f) { return f.hasOwnProperty(arityProp); };


  /*
   * <apifunction>
   *
   * curryWithArity
   *
   * Category: function
   *
   * Parameter: n: strictNatural
   * Parameter: f: function
   * Returns: function
   *
   * Curries the given function f to the supplied arity, which need not equal the function's length. The function will
   * be called when that number of arguments have been supplied. Superfluous arguments are discarded. The original
   * function will be called with a null execution context. It is possible to partially apply the resulting function,
   * and indeed the further resulting function(s). The resulting function and its partial applications will throw if
   * they require at least one argument, but are invoked without any. `curryWithArity` throws if the arity is not a
   * natural number, or if the second parameter is not a function.
   *
   * The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
   * length. The [arityOf](#arityOf) function can be used to determine how many arguments are required before the
   * wrapped function will be invoked.
   *
   * As noted above, you are permitted to curry a function to a smaller arity than its length. Whether the resulting
   * function behaves in a useful manner will of course depend on the function. One use case of `curryWithArity` is
   * to create unique functions from functions that accept optional arguments. For example, one common error involves
   * mapping over an array with `parseInt`, which has an optional *radix* parameter. `Array.prototype.map` invokes
   * the mapping function with additional metadata such as the position of the current element; when these factors
   * collide, one ends up trying to convert to numbers whose radix equals the array index. Instead, one could use
   * `curryWithArity` with an arity of 1 to create a new function that guarantees `parseInt` will be called with only
   * one argument.
   *
   * It is possible to recurry previously curried functions, however generally it only makes sense to recurry a
   * function that has not been partially applied: this will be equivalent to currying the original function.
   * Recurrying a partially applied function will likely not work as you expect: the new function will be one that
   * requires the given number of arguments before calling the original function with the partially applied arguments
   * and some of the ones supplied to the recurried function.
   *
   * Examples:
   *   var f = function(x, y) { console.log(x, y); }
   *
   *   var g = curryWithArity(1, f);
   *
   *   g(7);  // => 1, undefined logged
   *
   *   var h = curryWithArity(3, f);
   *
   *   var j = h(2, 'a');
   *
   *   j(9);  // => 2, 'a' logged
   *
   *   h('fizz')('buzz', 'foo') // => 'fizz', 'buzz' logged
   *
   */

   // TODO: More realistic examples required
   // TODO: The paragraph about not recurrying partially applied functions is not particularly clear

   // XXX Revisit comments about null execution context once we have our new types of currying in place. Also, comment on native binds.
   // XXX Comment on the fact that we provide parseInt


  var curryWithArity = function(length, fn) {
    length = checkPositiveIntegral(length, {strict: true});

    // We can't use checkFunction from the funcUtils module here: it depends on the base module, which in turn depends on
    // this module
    if (typeof(fn) !== 'function')
      throw new TypeError('Value to be curried is not a function');

    if (fn.hasOwnProperty(arityProp) && fn[arityProp] === length)
      return fn;

    fn = fn.hasOwnProperty(uncurriedProp) ? fn[uncurriedProp]() : fn;

    // Handle the special case of length 0
    if (length === 0) {
       var result = function() {
        // Don't simply return fn: need to discard any arguments
        return fn.apply(null);
      };

      Object.defineProperty(result, arityProp, {value: 0});
      return result;
    }

    // Note: 'a' is a dummy parameter to force the length property to be 1
    var curried = function(a) {
      var args = [].slice.call(arguments);

      // Throw if we expected arguments and didn't receive any
      if (args.length === 0) {
        var errText = length === 1 ? '1 argument' : ('1 - ' + length + ' arguments');
        throw new Error('This function requires ' + errText);
      }

      // If we have more arguments than we need, drop the extra ones on the floor
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

      Object.defineProperty(trivial, arityProp, {value: 1});
      Object.defineProperty(trivial, uncurriedProp, {value: function() { return newFn; }});
      return trivial;
    };

    Object.defineProperty(curried, arityProp, {value: length});
    Object.defineProperty(curried, uncurriedProp, {value: function() { return fn; }});
    return curried;
  };

  // curryWithArity should itself be curried
//  curryWithArity = curry(curryWithArity);


  /*
   * <apifunction>
   *
   * arityOf
   *
   * Category: function
   *
   * Synonyms: arity
   * Parameter: f: function
   * Returns: number
   *
   * Reports the real arity of a function. If the function has not been curried by funkier.js, this simply returns the
   * function's length property. For a function that has been curried, the arity of the original function will be
   * reported (the function's length property will always be 0 or 1 in this case). For a partially applied function,
   * the amount of arguments not yet supplied will be returned.
   *
   * Examples:
   *   arityOf(function(x) {}); // => 1;
   *
   */

  var arityOf = function(f) {
    if (typeof(f) !== 'function')
      throw new TypeError('Cannot compute arity of non-function');

    return f.length;
  };
  arityOf._isCurried = isCurried;


  return {
    arity: arityOf,
    arityOf: arityOf,
    curryWithArity: curryWithArity
  };
})();
//(function() {
//  "use strict";
//
//  var makeModule = function(require, exports) {
//    var utils = require('./utils');
//
//
//
//
//    /*
//     * curry: Takes a function fn, and curries it up to the function's arity, as defined by the
//     *        function's length property. The curried function returned will have length 1,
//     *        unless the original function had length 0, in which case the returned function
//     *        will have length 0 too. Arguments are curried left to right. Throws if fn is not a function.
//     *
//     * curry will ultimately call the underlying function with a null execution context. Use
//     * Function.prototype.bind beforehand if you need to curry with a specific context.
//     *
//     * Each curried function will have an arity of 1, but will accept > 1 arguments. If the number
//     * of arguments supplied is equal to the number of outstanding arguments, the
//     * underlying function will be called. For example,
//     *   var f = curry(function(a, b) {...});
//     *   f(1); // returns a function that awaits a value for the b parameter
//     *   f(1, 2); // calls the original function with a=1, b=2
//     *
//     * If the curried function is called with superfluous arguments, they will be discarded.
//     * This avoids unexpected behaviour triggered by supplying optional arguments. Functions accepting
//     * optional arguments effectively represent a family of functions with different type-signatures,
//     * so each variant should be treated seperately.
//     *
//     * If you need a function to accept a specific number of arguments, where that number is different
//     * from the function's length property, use curryWithArity instead.
//     *
//     */
//
//    var curry = function(fn) {
//      var desiredLength = fn.hasOwnProperty(arityProp) ? fn[arityProp] : fn.length;
//      return curryWithArity(desiredLength, fn);
//    };
//
//
//    /*
//     * getRealArity: reports the real arity of a function. If the function has not been curried by funkier.js
//     *               this simply returns the function's length property. For a function that has been curried,
//     *               the arity of the original function will be reported (the function's length property will
//     *               always be 0 or 1 in this case). For a partially applied function, the amount of arguments
//     *               not yet supplied will be returned.
//     *
//     * For example:
//     *   function(x) {}.length == 1;
//     *   getRealArity(function(x) {}) == 1;
//     *   function(x, y) {}.length == 2;
//     *   getRealArity(function(x, y) {}) == 2;
//     *   curry(function(x, y) {}).length == 1;
//     *   getRealArity(curry(function(x, y) {})) == 2;
//     *   getRealArity(curry(function(x, y, z) {})) == 3;
//     *   getRealArity(curry(function(x, y, z) {})(1)) == 2;
//     *
//     */
//
//    var getRealArity = function(f) {
//      return f.hasOwnProperty(arityProp) ? f[arityProp] : f.length;
//    };
//
//
//    var exported = {
//      curry: curry,
//      curryWithArity: curryWithArity,
//      getRealArity: getRealArity
//    };
//
//
//    module.exports = exported;
//  };
//
//
//  // AMD/CommonJS foo
//  if (typeof(define) === "function") {
//    define(function(require, exports, module) {
//      makeModule(require, exports, module);
//    });
//  } else {
//    makeModule(require, exports, module);
//  }
//})();
