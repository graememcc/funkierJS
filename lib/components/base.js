module.exports = (function() {
  "use strict";


//  var makeModule = function(require, exports) {
  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var arityOf = curryModule.arityOf;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;

//    var utils = require('./utils');
//    var checkPositiveIntegral = utils.checkPositiveIntegral;
//    var defineValue = utils.defineValue;


  /*
   * <apifunction>
   *
   * compose
   *
   * Category: functions
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
   * supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
   * will also be considered as having been curried that way, with the correct bound context.
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

    return g._curry(function(x) {
      var args = [].slice.call(arguments);

      var gArgs = [args[0]];
      var fArgs = args.slice(1);
      return f.apply(this, [g.apply(this, [args[0]])].concat(fArgs));
    }, curryTo);
  });


//    var composeOn = defineValue(
//      'name: composeOn',
//      'signature: argCount: positive integer, f: function, g: function',
//      'classification: base',
//      '',
//      'Similar to [[compose]], composes the two functions f and g, returning a new function which returns',
//      'f(g(<arguments>)). However, the first argCount arguments will be consumed by g, before the result is',
//      'supplied to f. This often enables function creation approximating a point-free style.',
//      '',
//      'The function f must have arity >= 1. A TypeError will be thrown when this is not',
//      'the case.',
//      '',
//      'The function g must have arity <= argCount. A TypeError will be thrown when this is not',
//      'the case.',
//      '',
//      'If any function has arity > 1, it will be curried, and partially applied when an',
//      'argument is supplied to the composed function.',
//      '--',
//      'var f1 = function(a) {return a(2);};',
//      'var f2 = function(c, d, e) {return c * d * e;};',
//      'var f = composeOn(f1, f2); // f(x, y) = 2(x * y);',
//      curry(function(argCount, f, g) {
//        argCount = checkPositiveIntegral(argCount, 'argCount must be non-negative');
//        f = checkFunction(f, {arity: 1, minimum: true, message: 'function f must have arity ≥ 1'});
//        g = checkFunction(g, {arity: argCount, minimum: true, message: 'function g must have arity ≥ ' + argCount});
//
//        var fLen = getRealArity(f);
//        f = curry(f);
//        g = curry(g);
//
//        var curryArity = fLen - 1 + argCount;
//
//        return curryWithArity(curryArity, function() {
//          var args = [].slice.call(arguments);
//
//          var gArgs = argCount > 0 ? args.slice(0, argCount) : [];
//          var fArgs = argCount > 0 ? args.slice(argCount) : args;
//          return f.apply(null, [g.apply(null, gArgs)].concat(fArgs));
//        });
//      })
//    );


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

    return f._curry(function(a, b) {
      return f(b, a);
    });
  });


//    // XXX should we supply a vararg variant of composeMany?
//    var composeMany = defineValue(
//      'name: composeMany',
//      'signature: fns: array',
//      'classification: base',
//      '',
//      'Repeatedly composes the given array of functions, from right to left. All',
//      'functions are curried where necessary.',
//      '',
//      'composeMany([f1, f2, f3]) behaves like f1(f2(f3(x)));',
//      '',
//      'Throws a TypeError if the given array is empty, if any entry is not a',
//      'function, or if any entry other than the last has arity 0.',
//      '--',
//      'var square = function(x) {return x * x;};',
//      'var double = function(x) {return 2 * x;};',
//      'var plusOne = plus(1);',
//      'var f = composeMany([square, double, plusOne]);',
//      'f(2); // 36',
//      function(fnArray) {
//        // XXX Should throw if not array. Update help text too!
//        if (fnArray.length === 0)
//          throw new TypeError('composeMany called with empty array');
//
//        if (fnArray.length === 1)
//          return curry(fnArray[0]);
//
//        // We don't use foldr to avoid creating a circular dependency',
//        return fnArray.reduceRight(flip(compose));
//      }
//    );
//
//
//    var sectionLeft = defineValue(
//      'name: sectionLeft',
//      'signature: f: function, x: any',
//      'classification: base',
//      '',
//      'Partially applies the binary function f with the given argument x, with x being',
//      'supplied as the first argument to f. The given function f will be curried if',
//      'necessary.',
//      '',
//      'Throws a TypeError if f is not a binary function.',
//      '--',
//      'var f = function(x, y) {return x * y;};',
//      'var g = sectionLeft(f, 2); // returns a function',
//      'g(3); // 6 (i.e. 2 * 3)',
//      curry(function(f, x) {
//        f = checkFunction(f, {arity: 2, message: 'Value to be sectioned must be a function of arity 2'});
//        f = curry(f);
//
//        return f(x);
//      })
//    );
//
//
//    var sectionRight = defineValue(
//      'name: sectionRight',
//      'signature: f: function, arg: any',
//      'classification: base',
//      '',
//      'Partially applies the binary function f with the given argument x, with x being supplied as',
//      'the second argument to f.',
//      '',
//      'Throws a TypeError if f is not a binary function.',
//      '--',
//      'var fn = sectionRight(subtract, 3);',
//      'fn(2); // -1',
//      curry(function(f, x) {
//        f = checkFunction(f, {arity: 2, message: 'Value to be sectioned must be a function of arity 2'});
//
//        return sectionLeft(flip(f), x);
//      })
//    );
//
//
  return {
    compose: compose,
//      composeMany: composeMany,
//      composeOn: composeOn,
      constant: constant,
      constant0: constant0,
      flip: flip,
//      getType: getType,
      id: id
//      sectionLeft: sectionLeft,
//      sectionRight: sectionRight,
  };
})();
