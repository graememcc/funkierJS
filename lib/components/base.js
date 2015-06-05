module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var arityOf = curryModule.arityOf;
  var chooseCurryStyle = curryModule._chooseCurryStyle;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;

  var internalUtilities = require('../internalUtilities');
  var checkPositiveIntegral = internalUtilities.checkPositiveIntegral;
  var isArrayLike = internalUtilities.isArrayLike;


  /*
   * <apifunction>
   *
   * compose
   *
   * Category: function
   *
   * Parameter: f: function
   * Parameter: g: function
   * Returns: function
   *
   * Composes the two functions, returning a new function that consumes one argument, which is passed to `g`. The result
   * of that call is then passed to `f`. That result is then returned. Throws if either parameter is not a function, or
   * has arity 0.
   *
   * The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
   * real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
   * argument: `f` will recieve a partially applied `g`, and any remaining arguments.
   *
   * If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
   * supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned
   * function will also be considered as having been curried that way, with the correct bound context.
   *
   * Examples:
   *
   * var f1 = function(a) {return a + 1;};
   * var f2 = function(b) {return b * 2;};
   * var f = funkierJS.compose(f1, f2); // => f(x) = 2(x + 1)',
   *
   */

  var compose = curry(function(f, g) {
    var gLen = arityOf(g);
    var fLen = arityOf(f);

    f = checkFunction(f, {arity: 1, minimum: true, message: 'function f must have arity ≥ 1'});
    g = checkFunction(g, {arity: 1, minimum: true, message: 'function g must have arity ≥ 1'});
    f = arityOf._isCurried(f) ? f : curry(f);
    g = arityOf._isCurried(g) ? g : curry(g);

    var curryTo = fLen;

    return chooseCurryStyle(f, g, function(x) {
      var args = [].slice.call(arguments);

      var gArgs = [args[0]];
      var fArgs = args.slice(1);
      return f.apply(this, [g.apply(this, [args[0]])].concat(fArgs));
    }, curryTo);
  });


  /*
   * <apifunction>
   *
   * composeOn
   *
   * Category: function
   *
   * Parameter: argCount: positive
   * Parameter: f: function
   * Parameter: g: function
   * Returns: function
   *
   * Composes the two functions, returning a new function that consumes the specified number of arguments, which are
   * then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the
   * first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter
   * has arity 0.
   *
   * The functions will be curried (using the standard [`curry`](#curry) if required. The resulting function will have
   * real arity of `arityOf(f)`. Note in particular, that if `g` has arity 1, it will be partially applied with 1
   * argument: `f` will recieve a partially applied `g`, and any remaining arguments.
   *
   * If `g` was curried by one of the [`objectCurry`] variants, then the returned function will be too, and it will
   * supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned
   * function will also be considered as having been curried that way, with the correct bound context.
   *
   * This function is intended to afford an approximation of writing functions in a point-free style.
   *
   * Examples:
   *   var f1 = function(a) {return a(2);};
   *   var f2 = function(c, d, e) {return c * d * e;};
   *   var f = funkierJS.composeOn(f1, f2); // => f(x, y) = 2(x * y);
   *
   */

  var composeOn = curry(function(argCount, f, g) {
    argCount = checkPositiveIntegral(argCount, {errorMessage: 'argCount must be non-negative'});
    f = checkFunction(f, {arity: 1, minimum: true, message: 'function f must have arity ≥ 1'});
    g = checkFunction(g, {arity: argCount, minimum: true, message: 'function g must have arity ≥ ' + argCount});
    f = arityOf._isCurried(f) ? f : curry(f);
    g = arityOf._isCurried(g) ? g : curry(g);

    var fLen = arityOf(f);

    var curryArity = fLen - 1 + argCount;

    return chooseCurryStyle(f, g, function() {
      var args = [].slice.call(arguments);

      var gArgs = args.slice(0, argCount);
      var fArgs = args.slice(argCount);
      return f.apply(this, [g.apply(this, gArgs)].concat(fArgs));
    }, curryArity);
  });


  /*
   * <apifunction>
   *
   * id
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: any
   *
   * Returns the supplied value. Superfluous values are ignored.
   *
   * Examples:
   *   funkierJS.id([1, 2]); // => [1, 2]
   *
   */

  var id = curry(function(x) {
    return x;
  });


  /*
   * <apifunction>
   *
   * constant
   *
   * Category: function
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: any
   *
   * Intended to be partially applied, first taking a value, returning a function that takes another parameter
   * and which always returns the first value.
   *
   * Examples:
   *   var f = funkierJS.constant(42);
   *   f(10); // => 42
   *
   */

  var constant = curry(function(x, y) {
    return x;
  });


  /*
   * <apifunction>
   *
   * constant0
   *
   * Category: function
   *
   * Parameter: a: any
   * Returns: function
   *
   * Returns a function of arity zero that when called always returns the supplied value.
   *
   * Examples:
   *   var f = funkierJS.constant0(42);
   *   f(); // => 42
   *
   */

  var constant0 = compose(curryWithArity(0), constant);


  /*
   * <apifunction>
   *
   * flip
   *
   * Category: function
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.
   *
   * Examples:
   *   var backwards = funkierJS.flip(funkierJS.subtract);
   *   backwards(2, 3); // => 1
   *
   */

  var flip = curry(function(f) {
    f = checkFunction(f, {arity: 2, maximum: true, message: 'Value to be flipped must be a function of arity 2'});
    f = arityOf._isCurried(f) ? f : curry(f);

    if (arityOf(f) < 2)
      return f;

    return curryWithConsistentStyle(f, function(a, b) {
      return f(b, a);
    });
  });


  /*
   * <apifunction>
   *
   * composeMany
   *
   * Category: types
   *
   * Parameter: fns: array
   * Returns: function
   *
   * Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.
   * Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity
   * zero, or if the value supplied is not an array.
   *
   * The result of calling composeMany([f1, f2, f3](x) is equal to f1(f2(f3(x))).
   *
   * Examples:
   * var square = function(x) {return x * x;};
   * var double = function(x) {return 2 * x;};
   * var plusOne = funkierJS.plus(1);
   * var f = funkierJS.composeMany([square, double, plusOne]);
   * f(2); // => 36
   *
   */

  var composeMany = curry(function(fnArray) {
    if (!isArrayLike(fnArray, true))
      throw new TypeError('composeMany requires an array or array-like object of functions');

    if (fnArray.length === 0)
      throw new TypeError('composeMany called with empty array');

    // We need to explicitly check the arity for the last function, as reduceRight won't trigger compose if the
    // array has length 1
    if (arityOf(fnArray[fnArray.length - 1]) === 0)
      throw new TypeError('Cannot compose functions of arity 0');

    if (fnArray.length === 1)
      return curry(fnArray[0]);

    // We don't use our foldr to avoid creating a circular dependency
    return fnArray.reduceRight(flip(compose));
  });


  /*
   * <apifunction>
   *
   * sectionLeft
   *
   * Category: function
   *
   * Parameter: f: function
   * Parameter: x: any
   * Returns: function
   *
   * Partially applies the binary function f with the given argument x, with x being supplied as the first argument
   * to f. The given function f will be curried if necessary. Throws if f is not a binary function.
   *
   * Examples:
   * var f = function(x, y) {return x * y;};',
   * var g = funkierJS.sectionLeft(f, 2);
   * g(3); // => 6 (i.e. 2 * 3)',
   *
   */

  var sectionLeft = curry(function(f, x) {
    f = checkFunction(f, {arity: 2, message: 'Value to be sectioned must be a function of arity 2'});
    if (arityOf._isCurried(f)) return f.call(this, x);

    f = curry(f);
    return f(x);
  });


  /*
   * <apifunction>
   *
   * sectionRight
   *
   * Category: function
   *
   * Parameter: f: function
   * Parameter: x: any
   * Returns: function
   *
   * Partially applies the binary function f with the given argument x, with x being supplied as the second argument
   * to f. The given function f will be curried if necessary. Throws if f is not a binary function.
   *
   * Examples:
   *   var fn = funkierJS.sectionRight(funkierJS.subtract, 3);
   *   fn(2); // => -1
   *
   */

  var sectionRight = curry(function(f, x) {
    f = checkFunction(f, {arity: 2, message: 'Value to be sectioned must be a function of arity 2'});

    return sectionLeft(flip(f), x);
  });


  return {
    compose: compose,
    composeMany: composeMany,
    composeOn: composeOn,
    constant: constant,
    constant0: constant0,
    flip: flip,
    id: id,
    sectionLeft: sectionLeft,
    sectionRight: sectionRight
  };
})();
