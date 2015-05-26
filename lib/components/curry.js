(function (root, factory) {
  var dependencies = [];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else if (typeof exports === 'object') {
    // CommonJS

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  } else {
    // Browser globals

    root.commonJsStrict = root.commonJsStrict || {};
    factory.apply(null, [root].concat(dependencies.map(function(dep) {
      if (dep.slice(0, 2) == './') dep = dep.slice(2);
      return root[dep] || root.commonJsStrict[dep];
    })));
  }
}(this, function(exports) {


  /*
   */

  var arity = function(f) { /* TODO: this is temporary while we build the documentation system */ };


  exports = exports.commonJsStrict ? (exports.commonJsStrict.curry = {}) : exports;
}));
//(function() {
//  "use strict";
//
//  var makeModule = function(require, exports) {
//    var utils = require('./utils');
//    var checkPositiveIntegral = utils.checkPositiveIntegral;
//
//
//    // Property that will be installed on all curried functions reflecting 'real' arity.
//    // When we attach this property to the curried functions, we will use Object.defineProperty.
//    // This is a minor hack to prevent the property showing up when the functions are logged
//    // to the console (enumerable will be false).
//    var arityProp = '_trueArity';
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
//     * curryWithArity: take an arity and a function fn, and curry up to the specified arity, regardless of the
//     *                 function's length. Note in particular, a function can be curried to a length greater
//     *                 than its arity. Arguments are curried left to right. The returned function will have
//     *                 length 1, unless the arity requested was 0, in which case the length will be zero. Throws if
//     *                 fn is not a function, or if length is not a non-negative integer.
//     *
//     * curryWithArity will ultimately call the underlying function with a null execution context. Use
//     * Function.prototype.bind beforehand if you need to curry with a specific context.
//     *
//     * Each curried function will have an arity of 1, but will accept > 1 arguments. If the number
//     * of arguments supplied is equal to the number of outstanding arguments, the
//     * underlying function will be called. For example,
//     *   var f = curryWithArity(2, function(a, b) {...});
//     *   f(1); // returns a function that awaits a value for the b parameter
//     *   f(1, 2); // calls the original function with a=1, b=2
//     *
//     * If the curried function is called with superfluous arguments, they will be discarded.
//     * This avoids unexpected behaviour triggered by supplying optional arguments. Functions accepting
//     * optional arguments effectively represent a family of functions with different type-signatures,
//     * so each variant should be treated seperately.
//     *
//     */
//
//    var curryWithArity = function(length, fn) {
//      length = checkPositiveIntegral(length);
//
//      // We can't use checkFunction from funcUtils here: it depends on base so would introduce a circular dependency
//      if (typeof(fn) !== 'function')
//        throw new TypeError('Value to be curried is not a function');
//
//      if (fn.hasOwnProperty(arityProp) && fn[arityProp] === length)
//        return fn;
//
//      // Handle the special case of length 0
//      if (length === 0) {
//        var result = function() {
//          // Don't simply return fn: need to discard any arguments
//          return fn.apply(this);
//        };
//
//        Object.defineProperty(result, arityProp, {value: 0});
//        return result;
//      }
//
//      // Note: 'a' is a dummy parameter to force the length property to be 1
//      var curried = function(a) {
//        var args = [].slice.call(arguments);
//
//        // Throw if we expected arguments and didn't receive any
//        if (args.length === 0)
//          throw new TypeError('Missing arguments for function!');
//
//        // If we have more args than expected, trim down to the expected length
//        // (the function will be called when we fall through to the next conditional)
//        if (args.length > length)
//          args = args.slice(0, length);
//
//        // If we have enough arguments, call the underlying function
//        if (args.length === length)
//          return fn.apply(this, args);
//
//        // We don't have enough arguments. Bind those that we already have
//        var newFn = fn.bind.apply(fn, [this].concat(args));
//        var argsNeeded = length - args.length;
//
//        // Continue currying if we can't yet return a function of length 1
//        if (argsNeeded > 1)
//          return curryWithArity(argsNeeded, newFn);
//
//        // The trivial case
//        var trivial = function(b) {
//          return newFn(b);
//        };
//
//        Object.defineProperty(trivial, arityProp, {value: 1});
//        return trivial;
//      };
//
//      Object.defineProperty(curried, arityProp, {value: length});
//      return curried;
//    };
//
//    // curryWithArity should itself be curried
//    curryWithArity = curry(curryWithArity);
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
