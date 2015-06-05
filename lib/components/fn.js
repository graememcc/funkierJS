module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var arityOf = curryModule.arityOf;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;

  var internalUtilities = require('../internalUtilities');
  var checkArrayLike = internalUtilities.checkArrayLike;
  var checkPositiveIntegral = internalUtilities.checkPositiveIntegral;
  var checkObjectLike = internalUtilities.checkObjectLike;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;


  /*
   * <apifunction>
   *
   * apply
   *
   * Category: function
   *
   * Parameter: args: array
   * Parameter: f: function
   * Returns: any
   *
   * Applies the given function f with the arguments given in the array args. If the function is not curried, it will be
   * curried (using [`curry`](#curry)) and partially applied if necessary. If the function is object curried, and has
   * not yet acquired an execution context, then it will be invoked with a null execution context (as `apply` is itself
   * curried, and so will have no visibility into the execution context it was invoked with). The result of applying the
   * given arguments to the function is returned.  Throws a TypeError if args is not an array, or if f is not a
   * function.
   *
   * Examples:
   *   funkierJS.apply([1], id); // 1
   */

  var apply = curry(function(args, f) {
    f = checkFunction(f);
    args = checkArrayLike(args, {noStrings: true, message: 'Function arguments not an array'});
    f = curryWithConsistentStyle(f, f, arityOf(f));

    return f.apply(null, args);
  });


  /*
   * <apifunction>
   *
   * permuteLeft
   *
   * Category: function
   *
   * Synonyms: rotateLeft
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a function, returns a curried function of the same arity which takes the same parameters, except in a
   * different position. The first parameter of the original function will be the last parameter of the new function,
   * the second parameter of the original will be the first parameter of the new function and so on. This function is
   * essentially a no-op for curried functions of arity 0 and 1, equivalent to [`curry`](#curry) for uncurried
   * functions of arities 0 and 1, and equivalent to flip for functions of arity 2.
   *
   * If f is already curried, the currying style of f will be preserved.
   *
   * Throws a TypeError if f is not a function.
   *
   * Examples:
   *   f = function(x, y, z) {return x + y + z;};
   *   g = permuteLeft(f);
   *   g('a', 'b', 'c'); // => 'bca'
   *
   */

  var permuteLeft = curry(function(f) {
    var fLen = arityOf(f);
    f = curryWithConsistentStyle(f, f, fLen);

    if (fLen < 2)
      return f;

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);
      var newArgs = [args[fLen - 1]].concat(args.slice(0, fLen - 1));
      return f.apply(this, newArgs);
    }, fLen);
  });


  /*
   * <apifunction>
   *
   * permuteRight
   *
   * Category: function
   *
   * Synonyms: rotateRight
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a function, returns a curried function of the same arity which takes the same parameters, except in a
   * different position. The first parameter of the original function will be the second parameter of the new function,
   * the second parameter of the original will be the third parameter of the new function and so on. This function is
   * essentially a no-op for curried functions of arity 0 and 1, equivalent to [`curry`](#curry) for uncurried
   * functions of arities 0 and 1, and equivalent to flip for functions of arity 2.
   *
   * If f is already curried, the currying style of f will be preserved.
   *
   * Throws a TypeError if f is not a function.
   *
   * Examples:
   *   f = function(x, y, z) {return x + y + z;};
   *   g = permuteLeft(f);
   *   g('a', 'b', 'c'); // => 'cab'
   *
   */

  var permuteRight = curry(function(f) {
    var fLen = arityOf(f);
    f = curryWithConsistentStyle(f, f, fLen);

    if (fLen < 2)
      return f;

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);
      var newArgs = args.slice(1).concat([args[0]]);
      return f.apply(this, newArgs);
    }, fLen);
  });


  /*
   * <apifunction>
   *
   * pre
   *
   * Category: function
   *
   * Parameter: wrappingFunction: function
   * Parameter: f: function
   * Returns: function
   *
   * Takes two functions wrappingFunction, and f, and returns a new function with the same arity as the function f,
   * and curried in the same manner (or curried with [`curry`](#curry) if f was not curried). When this new function
   * is called, it will first call wrappingFunction, with the same execution context, and a single argument: an array
   * containing all the arguments the function was called with. When wrappingFunction returns, its return value
   * will be discarded, and f will be called with the same execution context and invoked with the same arguments as the
   * new function was invoked with. The return value from f will be returned.
   *
   * Throws a TypeError if neither of the given values are functions.
   *
   * Examples:
   *   var logger = function(args) {console.log('plus called with ', args.join(', '));};
   *   var loggedPlus = pre(logger, plus);
   *   loggedPlus(2, 2); // => outputs 'plus called with 2, 2' to console
   *
   */

  var pre = curry(function(wrappingFunction, f) {
    wrappingFunction = checkFunction(wrappingFunction, {message: 'Pre value must be a function'});
    f = checkFunction(f, {message: 'Value to be wrapped must be a function'});

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);
      wrappingFunction.call(this, args);
      return f.apply(this, args);
    }, arityOf(f));
  });


  /*
   * <apifunction>
   *
   * post
   *
   * Category: function
   *
   * Parameter: wrappingFunction: function
   * Parameter: f: function
   * Returns: function
   *
   * Takes two functions wrappingFunction, and f, and returns a new function with the same arity as the function f,
   * and curried in the same manner (or curried with [`curry`](#curry) if f was not curried). When this new function
   * is called, it will first call f with the same execution context and arguments that the new function was called
   * with. Its return value will be saved. Next, wrappingFunction will be called, again with the same execution
   * context, and two arguments: an array containing the arguments to f, and f's return value. Anything returned from
   * wrappingFunction will be discarded, and f's return value will be returned.
   *
   * Throws a TypeError if either of the given values are not functions.
   *
   * Examples:
   *   var postLogger = function(args, result) {console.log('plus called with ', args.join(', '), 'returned', result);};
   *   var loggedPlus = post(postLogger, plus);
   *   loggedPlus(2, 2); // => outputs 'plus called with 2, 2 returned 4' to console
   *
   */

  var post = curry(function(wrappingFunction, f) {
    wrappingFunction = checkFunction(wrappingFunction, {message: 'Post value must be a function'});
    f = checkFunction(f, {message: 'Value to be wrapped must be a function'});

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);
      var result = f.apply(this, args);
      wrappingFunction.call(this, args, result);
      return result;
    }, arityOf(f));
  });


  /*
   * <apifunction>
   *
   * wrap
   *
   * Category: function
   *
   * Parameter: before: function
   * Parameter: after: function
   * Parameter: f: function
   *
   * Returns: function
   *
   * Takes 3 functions, before, after and f. Returns a new function with the same arity as f, and curried in the same
   * manner (or curried using [`curry`](#curry) if f was not curried. The functions before, f, and after will be called
   * when the returned function is invoked.
   *
   * Specifically, when the returned function is called, the following will happen in sequence:
   *   -  before will be called with the execution context of the new function and one argument: an array containing
   *      the arguments the new function was invoked with
   *
   *   -  f will be called with the execution context that the new function was called with, and the same arguments
   *
   *   -  after will be called with the original execution context and two arguments: an array containing the arguments
   *      the new function was called with, and f's result
   *
   *   -  f's result will be returned
   *
   * Throws a TypeError if any argument is not a function.
   *
   * This function is equivalent to calling [`post`](#post) and [`pre`](#pre) on some function.
   *
   * Examples:
   *   var logger = function(args) {console.log('plus called with ', args.join(', '));};
   *   var postLogger = function(args, result) {console.log('plus returned', result);};
   *   var loggedPlus = wrap(logger, postLogger, plus);
   *   loggedPlus(2, 2); // => outputs 'plus called with 2, 2' and 'plus returned 4' to console
   *
   */

  var wrap = curry(function(before, after, f) {
    return post(after, pre(before, f));
  });


  return {
    apply: apply,
    permuteLeft: permuteLeft,
    permuteRight: permuteRight,
    pre: pre,
    post: post,
    rotateLeft: permuteLeft,
    rotateRight: permuteRight,
    wrap: wrap
  };
})();
