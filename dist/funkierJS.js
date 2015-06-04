(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.funkierJS = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
   * supply `g` with the context the first time it is invoked. If `g` was curried by [`bind`], then the returned function
   * will also be considered as having been curried that way, with the correct bound context.
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

},{"../funcUtils":10,"../internalUtilities":13,"./curry":2}],2:[function(require,module,exports){
module.exports = (function () {
  "use strict";

  var checkPositiveIntegral = require('../internalUtilities').checkPositiveIntegral;

  // Property that will be installed on all curried functions reflecting 'real' arity.
  var arityProp = '_trueArity';

  // Property that will be installed on curried functions that have not been partially applied
  var uncurriedProp = '_getOriginal';

  // Property that records the context with which the function was curried
  var contextProp = '_context';

  /*
   * Ostensibly an internal helper function to detect whether or not a function is curried. It does however, have to
   * be installed as a property of arityOf, as some of the auto-generated tests require it.
   *
   */

  var isCurried = function(f) { return f.hasOwnProperty(arityProp); };


  var decorate = function(f, arity, original, context) {
    var define = function(p, v) { Object.defineProperty(f, p, {value: v}); };

    define(arityProp, arity);
    define(uncurriedProp, original);
    define(contextProp, context);

    return f;
  };


  var curryInternal = function(initialContext, length, fn) {
    length = checkPositiveIntegral(length, {strict: true});

    // We can't use checkFunction from the funcUtils module here: it depends on the base module, which in turn depends on
    // this module
    if (typeof(fn) !== 'function')
      throw new TypeError('Value to be curried is not a function');

    // Check function hasn't already been curried using a different mechanism
    var context = fn.hasOwnProperty(contextProp) ? fn[contextProp] : initialContext;
    if (context !== initialContext)
      throw new Error('Cannot bind a curried function to a different execution context');

    if (fn.hasOwnProperty(arityProp) && fn[arityProp] === length)
      return fn;

    fn = fn.hasOwnProperty(uncurriedProp) ? fn[uncurriedProp] : fn;

    // Handle the special case of length 0
    if (length === 0) {
      return decorate(function() {
        // We need to use a fresh variable for the context rather than reusing context, or later object curried
        // functions will have the wrong context due to lexical scoping
        var callContext = context;

        // Acquire context if objectCurried
        if (callContext === undefined) {
          if (this === undefined)
            throw new Error('Object curried function called without a context');

          callContext = this;
        }

        // Don't simply return fn: need to discard any arguments
        return fn.apply(callContext);
      }, 0, fn, initialContext);
    }

    // Note: 'a' is a dummy parameter to force the length property to be 1
    return decorate(function(a) {
      var args = [].slice.call(arguments);
      var callContext = context;

      // Throw if we expected arguments and didn't receive any
      if (args.length === 0) {
        var errText = length === 1 ? '1 argument' : ('1 - ' + length + ' arguments');
        throw new Error('This function requires ' + errText);
      }

      // If we have more arguments than we need, drop the extra ones on the floor
      // (the function will be called when we fall through to the next conditional)
      if (args.length > length)
        args = args.slice(0, length);

      // Acquire context if object-curried
      if (callContext === undefined) {
        if (this === undefined)
          throw new Error('Object curried function called without a context');

        callContext = this;
      }

      // If we have enough arguments, call the underlying function
      if (args.length === length)
        return fn.apply(callContext, args);

      // We don't have enough arguments. Bind those that we already have
      var newFn = fn.bind.apply(fn, [callContext].concat(args));
      var argsNeeded = length - args.length;

      // Continue currying if we can't yet return a function of length 1
      if (argsNeeded > 1)
        return curryInternal({context: callContext}, argsNeeded, newFn);

      return decorate(function(b) {
        return newFn(b);
      }, 1, newFn, callContext);
    }, length, fn, context);
  };


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
   * natural number, or if the second parameter is not a function. It will also throw if the given function is known
   * to be bound to a specific execution context.
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
   * It is possible to recurry functions that have been previously curried with [`curry`](#curry) or `curryWithArity`,
   * however generally it only makes sense to recurry a function that has not been partially applied: this will be
   * equivalent to currying the original function. Recurrying a partially applied function will likely not work as you
   * expect: the new function will be one that requires the given number of arguments before calling the original
   * function with the partially applied arguments and some of the ones supplied to the recurried function.
   *
   * You cannot however pass in functions that have been bound to a specific execution context using [`bind`](#bind),
   * or [`bindWithContextAndArity`](#bindWithContextAndArity): `curryWithArity` promises to invoke functions with a null
   * execution context, but those functions have a fixed execution context that cannot be overridden. For similar
   * reasons, functions curried with [`objectCurry`](#objectCurry) or [`objectCurryWithArity`](#objectCurryWithArity)
   * cannot be curried. An error is thrown if the function has been bound to an execution context in this way.
   *
   * Note however that funkierJS has no visibility into the execution contexts of functions bound using the native
   * function `bind` method. Attempting to curry these might lead to surprising results, and should be avoided.
   *
   * Examples:
   *   var f = function(x, y) { console.log(x, y); }
   *
   *   var g = funkierJS.curryWithArity(1, f);
   *
   *   g(7);  // => 1, undefined logged
   *
   *   var h = funkierJS.curryWithArity(3, f);
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

   // XXX Comment on the fact that we provide parseInt


  var curryWithArity = curryInternal.bind(null, null);


  /*
   * <apifunction>
   *
   * curry
   *
   * Category: function
   *
   * Parameter: f: function
   * Returns: function
   *
   * Curries the given function f, returning a function which accepts the same number of arguments as the original
   * function's length property, but which may be partially applied. The function can be partially applied by passing
   * arguments one at a time, or by passing several arguments at once. The function can also be called with more
   * arguments than the given function's length, but the superfluous arguments will be ignored, and will not be
   * passed to the original function. If the curried function or any subsequent partial applications require at least
   * one argument, then calling the function with no arguments will throw. `curry` throws if its argument is not a
   * function. It will also throw if the function is known to be bound to a specific execution context.
   *
   * Currying a function that has already been curried will return the exact same function, unless the function was
   * curried with a different mechanism - see below.
   *
   * The returned function will have a length of 1, unless the original function will have length 0, in which case
   * the result also has length 0. Note that when currying functions of length 0 and 1 that the results will be
   * different functions from those passed in.
   *
   * If you need a function which accepts an argument count that differs from the function's length property,
   * use `curryWithArity`.
   *
   * Note that you cannot pass in functions that have been bound to a specific execution context using [`bind`](#bind),
   * or [`bindWithContextAndArity`](#bindWithContextAndArity): allowing those would break the invariant that functions
   * curried with `curry` are invoked with a null execution context. Similarly, functions curried with
   * [`objectCurry`](#objectCurry) and [`objectCurryWithArity`](#objectCurryWithArity) cannot be recurried through
   * `curryWithArity`. Thus an error is thrown in such cases. (However, funkierJS cannot tell if a function has been
   * bound with the native `bind` method. Currying such functions might lead to unexpected results).
   *
   * Examples:
   *   var f = function(x, y, z) { console.log(x, y, z); }
   *
   *   var g = funkierJS.curry(f);
   *
   *   g(4);  // => a function awaiting two arguments
   *
   *   g(4)(2); // => a function awaiting one argument
   *
   *   g(4)(2)('z'); // => 4, 2, 'z' logged
   *
   *   g('a', 'b')('c'); // => 'a', 'b' 'c' logged
   *
   *   g('x')('y', 'z'); // => 'x', 'y' 'z' logged
   *
   *   g('d', 'e', 'f'); // => 'd', 'e' 'f' logged
   *
   *   funkierJS.curry(g) === g;  // => true
   *
   */

  // TODO: More realistic examples required
  var curry = function(fn) {
    var desiredLength = fn.hasOwnProperty(arityProp) ? fn[arityProp] : fn.length;
    return curryWithArity(desiredLength, fn);
  };

  // Now that curry is defined, we can use it to curry itself
  curry = curry(curry);
  // curryWithArity should also be curried
  curryWithArity = curry(curryWithArity);


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
   *   funkierJS.arityOf(function(x) {}); // => 1;
   *
   */

  var arityOf = curry(function(f) {
    if (typeof(f) !== 'function')
      throw new TypeError('Cannot compute arity of non-function');

    return f.hasOwnProperty(arityProp) ? f[arityProp] : f.length;
  });
  arityOf._isCurried = isCurried;


  /*
   * <apifunction>
   *
   * bind
   *
   * Category: function
   *
   * Synonyms: bindWithContext
   *
   * Parameter: ctx: objectlike
   * Parameter: f: function
   * Returns: function
   *
   * Given an object and function, returns a curried function with the same arity as the original, and whose execution
   * context is permanently bound to the supplied object. The function will be called when sufficient arguments have
   * been supplied. Superfluous arguments are discarded. It is possible to partially apply the resulting function, and
   * indeed the further resulting function(s). The resulting function and its partial applications will throw if they
   * require at least one argument, but are invoked without any. `bind` throws if the first parameter is not an
   * an acceptable type for an execution context, or if the last parameter is not a function.
   *
   * The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
   * length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required before the
   * wrapped function will be invoked.
   *
   * `bind` will accept functions that have been previously been curried to the same execution context, as that being
   * provided, but will effectively be an identity function in such cases. However, attempting to curry a function
   * known to be bound to a different execution context is an error. In particular, functions curried
   * with [`curry`](#curry) or [`curryWithArity`](#curryWithArity) cannot be curried with an execution context: they
   * have already been bound with an implicit `null` execution context. Equally, functions curried with
   * [`objectCurry`](#objectCurry) and [`objectCurryWithArity`](#objectCurryWithArity) cannot be passed to `bind`, due
   * to the different way in which they acquire an execution context. `bind` will throw in such cases.
   *
   * Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
   * curry such functions won't throw, but they will not work as expected.
   *
   * Examples:
   *   var obj = {foo: 42};
   *
   *   var f = function(x, y) { return this.foo + x; };
   *
   *   var g = funkierJS.bind(obj, f);
   *
   *   g(3)(2); // returns 45
   *
   *   g(5, 2); // returns 47
   *
   *   var obj2 = {foo: 10};
   *   var h = funkierJS.bindWithContextAndArity(3, obj2, f);
   *   var j = funkierJS.bind(obj2, h); // OK, same context object
   *
   *   var err = funkierJS.bind({foo: 1}, g); // throws: execution contexts don't match
   *
   */

  var bind = curry(function(context, fn) {
    var desiredLength = fn.hasOwnProperty(arityProp) ? fn[arityProp] : fn.length;
    return bindWithContextAndArity(desiredLength, context, fn);
  });


  /*
   * <apifunction>
   *
   * bindWithContextAndArity
   *
   * Category: function
   *
   * Parameter: n: strictNatural
   * Parameter: ctx: objectlike
   * Parameter: f: function
   * Returns: function
   *
   * Given an arity, object and function, returns a curried function whose execution context is permanently bound to
   * the supplied object, and whose arity equals the arity given. The supplied arity need not equal the function's
   * length. The function will be only called when the specified number of arguments have been supplied. Superfluous
   * arguments are discarded. It is possible to partially apply the resulting function, and indeed the further
   * resulting function(s). The resulting function and its partial applications will throw if they require at least
   * one argument, but are invoked without any. `bindWithContextAndArity` throws if the arity is not a natural
   * number, if the second parameter is not an acceptable type for an execution context, or if the last parameter is
   * not a function.
   *
   * The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
   * length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required before the
   * wrapped function will be invoked.
   *
   * As noted above, you are permitted to curry a function to a smaller arity than its length. Whether the resulting
   * function behaves in a useful manner will of course depend on the function.
   *
   * In some limited circumstances, it is possible to recurry previously curried functions, however generally it only
   * makes sense to recurry a function that has not been partially applied: this will be equivalent to currying the
   * original function. To be able to recurry a curried function to a different arity, the execution context given
   * must be the exact object that was previously used to create the function being recurried. It is an error to
   * try and recurry a curried function bound to one execution context to another. In particular, functions curried
   * with [`curry`](#curry) or [`curryWithArity`](#curryWithArity) cannot be curried with an execution context: they
   * have already been bound with an implicit `null` execution context. Likewise, functions that have been curried
   * using either [`objectCurry`](#objectCurry) or [`objectCurryWithArity`](#objectCurryWithArity) cannot be curried
   * using `bindWithContextAndArity`, due to the different mechanism they use to acquire an execution context.
   * `bindWithContextAndArity` will throw in that such cases.
   *
   * Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
   * curry such functions won't throw, but they will not work as expected.
   *
   * Examples:
   *   var obj = {foo: 42};
   *
   *   var f = function(x, y) { return this.foo + x; };
   *
   *   var g = funkierJS.bindWithContextAndArity(1, obj, f);
   *
   *   g(3); // returns 45
   *
   *   var h = funkierJS.bindWithContextAndArity(3, obj, g); // OK, same context object
   *   h(2)(3, 4); // returns 44
   *
   *   var err = funkierJS.bindWithContextAndArity(2, {foo: 1}, g); // throws: execution contexts don't match
   *
   *   var ok = funkierJS.bindWithContextAndArity(2, {foo: 1}, f); // still ok to bind the original function though
   *
   */

  var bindWithContextAndArity = curry(function(arity, context, fn) {
    return curryInternal(context, arity, fn);
  });


  /*
   * <apifunction>
   *
   * objectCurry
   *
   * Category: function
   *
   * Parameter: f: function
   * Returns: function
   *
   * Given a function, returns a curried function which calls the underlying with the execution context active when the
   * first arguments are supplied. This means that when partially applying the function, the resulting functions will
   * have their execution context permanently bound. This method of binding is designed for currying functions that
   * exist on an object's prototype. The function will be only called when sufficient arguments have been supplied.
   * Superfluous arguments are discarded. The resulting function and its partial applications will throw if they
   * require at least one argument, but are invoked without any. `objectCurry` throws if its parameter is not a
   * function. The resulting function will throw if invoked with an undefined execution context.
   *
   * The returned function will have a length of 1, unless a function of arity of 0 was supplied, in which case this
   * will be the length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required
   * before the wrapped function will be invoked.
   *
   * One can pass in a function created by `objectCurry` or [`objectCurryWithArity`](#objectCurryWithArity) providing
   * it has not been partially applied. This will effectively be an identity operation. However, passing in a partially
   * applied function derived from an earlier currying call is an error, as the execution context has now been bound.
   * Similarly, functions returned from [`curry`](#curry), [`curryWithArity`](#curryWithArity), [`bind`](#bind) and
   * [`bindWithContextAndArity`](#bindWithContextAndArity) cannot be curried with this function, and will throw an
   * error, just as those functions curry functions and their partial applications returned from `objectCurry`.
   * `objectCurry` will throw when provided with an invalid function.
   *
   * Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
   * curry such functions won't throw, but they will not work as expected.
   *
   * Examples:
   *
   *   var proto = {foo: function(x, y) { return x + y + this.bar; }};
   *   proto.foo = funkierJS.objectCurry(proto.foo);
   *
   *   var obj1 = Object.create(proto);
   *   obj1.bar = 10;
   *
   *   var g = obj1.foo(10);
   *   g(22); // => 42
   *
   *   var obj2 = Object.create(proto);
   *   obj2.bar = 100;
   *   obj2.foo(10)(10); // => 120
   *   g(1); // => 21, the application using obj2 didn't affect the execution context of g
   *
   *   var err = obj1.foo;
   *   err(1, 2);  // => throws
   *
   */

  // TODO: Need better examples
  // TODO: Revisit examples in this file once object functions implemented (use funkierJS equivalents
  //       rather than Object.create, [].slice, etc...)
  var objectCurry = curry(function(fn) {
    return objectCurryWithArity(arityOf(fn), fn);
  });


  /*
   * <apifunction>
   *
   * objectCurryWithArity
   *
   * Category: function
   *
   * Parameter: n: strictNatural
   * Parameter: f: function
   * Returns: function
   *
   * Given an arity and function, returns a curried function which calls the underlying with the execution context
   * active when the first arguments are supplied. This means that when partially applying the function, the
   * resulting functions will have their execution context permanently bound. This method of binding is designed for
   * currying functions that exist on an object's prototype. The function will be only called when the specified number
   * of arguments have been supplied. Superfluous arguments are discarded. The resulting function and its partial
   * applications throw if they require at least one argument, but are invoked without any. `objectCurryWithArity`
   * throws if the arity is not a natural number or if the second parameter is not a function. The resulting function
   * will throw if invoked with an undefined execution context.
   *
   * The returned function will have a length of 1, unless an arity of 0 was requested, in which case this will be the
   * length. The [`arityOf`](#arityOf) function can be used to determine how many arguments are required before the
   * wrapped function will be invoked.
   *
   * As noted above, you are permitted to curry a function to a smaller arity than its length. Whether the resulting
   * function behaves in a useful manner will of course depend on the function.
   *
   * If one has a function that has been returned from [`objectCurry`](#objectCurry) or `objectCurryWithArity`, one can
   * recurry it to a different arity if required. However, one cannot recurry any partial applications derived from it,
   * as the execution context has now been bound. `objectCurryWithArity` also cannot curry functions returned from
   * [`curry`](#curry), [`curryWithArity`](#curryWithArity), [`bind`](#bind) or
   * [`bindWithContextAndArity`](#bindWithContextAndArity), and nor can those functions curry functions returned from
   * `objectCurryWithArity`, or their subsequent partial applications. `objectCurryWithArity` will throw when provided
   * with such a function.
   *
   * Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
   * curry such functions won't throw, but they will not work as expected.
   *
   * Examples:
   *
   *   var proto = {foo: function(x, y, z) { return x + y + this.bar; }};
   *   proto.foo = funkierJS.objectCurryWithArity(2, proto.foo);
   *
   *   var obj1 = Object.create(proto);
   *   obj1.bar = 10;
   *
   *   var g = obj1.foo(10);
   *   g(22); // => 42
   *
   *   var obj2 = Object.create(proto);
   *   obj2.bar = 100;
   *   obj2.foo(10)(10); // => 120
   *   g(1); // => 21, the application using obj2 didn't affect the execution context of g
   *
   *   var err = obj1.foo;
   *   err(1, 2);  // => throws
   *
   */

  // TODO: Need better examples
  // TODO: Revisit examples in this file once object functions implemented (use funkierJS equivalents
  //       rather than Object.create, [].slice, etc...)
  var objectCurryWithArity = curry(curryInternal.bind(null, undefined));


  /*
   * Where appropriate, funkierJS aims to preserve the currying style in functions that manipulate other functions
   * This function takes an existing curried function and a new function, and curries the new function in a compatible
   * way with the existing function. Thus, if the function was object curried, then so too is the new function. If it
   * is bound to a specific object then so too is the new function. Otherwise, the standard currying is applied.
   *
   * Of course, with the exception of object currying, the currying of the wrapper will not affect the operation
   * of the original function—which is presumably called within the wrapper function—as its context is already
   * bound. This function simply aims to enable manipulation of arities in a manner consistent with the original
   * functions.
   *
   */

  var curryWithConsistentStyle = function(existing, newFn, arity) {
    arity = arity === undefined ? arityOf(newFn) : arity;
    return curryInternal(existing.hasOwnProperty(contextProp ? existing.contextProp : null), arity, newFn);
  };


  /*
   * Where appropriate, funkierJS aims to preserve the currying style in functions that manipulate other functions
   * Whilst a simple question in the case of one function, this becomes more problematic when dealing with two or
   * more functions. This function takes two functions—the functions being wrapped—and the wrapping function, and
   * currys the wrapping function to the most appropriate choice for those functions. The wrapping function is assumed
   * to have the correct arity (so the plain currying function will be called, not a *WithArity function.
   *
   * So, what is the most appropriate style? If either function is object curried, then one would want another object
   * curried function for the purposes of passing the execution context to the wrapped functions. If both functions
   * are bound to the same context, then it makes sense to bind the result to the same context. If both functions
   * are curried to a null context, then again it is consistent to curry the wrapping function in the same manner.
   *
   * Things are more complicated when the functions have different currying styles, and neither of them is object
   * curried. Thus, either they are both bound to different contexts, or one is bound and one is null curried. For
   * maximum flexibility, I think the result should be null curried.
   *
   * Of course, with the exception of object currying, the currying of the wrapper will not affect the operation
   * of the original functions—which are presumably called within the wrapper function—as their contexts are already
   * bound. This function simply aims to enable manipulation of arities in a manner consistent with the original
   * functions.
   *
   */

  var chooseCurryStyle = function(pred1, pred2, wrapper, arity) {
    arity = arity !== undefined ? arity : arityOf(wrapper);

    var contexts = [pred1, pred2].map(function(p) { return isCurried(p) ? p[contextProp] : null; });

    var contextToApply;
    if (contexts.indexOf(undefined) !== -1) {
      contextToApply = undefined;
    } else if (contexts[0] === contexts[1]) {
      contextToApply = contexts[0];
    } else {
      contextToApply = null;
    }

    return curryInternal(contextToApply, arity, wrapper);
  };


  return {
    arity: arityOf,
    arityOf: arityOf,
    bind: bind,
    bindWithContext: bind,
    bindWithContextAndArity: bindWithContextAndArity,
    _chooseCurryStyle: chooseCurryStyle,
    curry: curry,
    curryWithArity: curryWithArity,
    _curryWithConsistentStyle: curryWithConsistentStyle,
    objectCurry: objectCurry,
    objectCurryWithArity: objectCurryWithArity,
  };
})();

},{"../internalUtilities":13}],3:[function(require,module,exports){
module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var chooseCurryStyle = curryModule._chooseCurryStyle;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;


  /*
   * <apifunction>
   *
   * not
   *
   * Category: Logical
   *
   * Parameter: b: boolean
   * Returns: boolean
   *
   * A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.
   *
   * Examples:
   *
   *   funkierJS.not(true); // => false
   *
   */

  var not = curry(function(b) {
    return !b;
  });


  /*
   * <apifunction>
   *
   * and
   *
   * Category: Logical
   *
   * Parameter: x: boolean
   * Parameter: y: boolean
   * Returns: boolean
   *
   * A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments
   *
   * Examples:
   *
   *   funkierJS.and(true, true); // => true
   *
   */

  var and = curry(function(x, y) {
    return x && y;
  });


  /*
   * <apifunction>
   *
   * or
   *
   * Category: Logical
   *
   * Parameter: x: boolean
   * Parameter: y: boolean
   * Returns: boolean
   *
   * A wrapper around the logical or (||) operator. Returns the logical or of the given arguments
   *
   * Examples:
   *
   *   funkierJS.or(true, false); // => true
   *
   */

  var or = curry(function(x, y) {
    return x || y;
  });


  /*
   * <apifunction>
   *
   * xor
   *
   * Category: Logical
   *
   * Parameter: x: boolean
   * Parameter: y: boolean
   * Returns: boolean
   *
   * A wrapper around the logical xor operator. Returns the logical xor of the given arguments
   *
   * Examples:
   *
   *   funkierJS.xor(true, true); // => false
   *
   */

  var xor = curry(function(x, y) {
    return x ? x !== y : y;
  });


  /*
   * <apifunction>
   *
   * notPred
   *
   * Category: Logical
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a unary predicate function, and returns a new unary function that, when called, will call the original
   * function with the given argument, and return the negated result. Throws if f is not a function, or has an
   * arity other than 1.
   *
   * If the supplied predicate has been previously curried, then the resulting function will replicate the currying
   * style. In particular, if the original function was curried with one of the [`objectCurry'](#objectCurry) variants,
   * then the resulting function will be too, and where necessary will supply the execution context to the wrapped
   * function.
   *
   * Examples:
   *  var c = funkierJS.constant(true);',
   *  var f = funkierJS.notPred(c);',
   *  f("foo"); // => false',
   *
   */

  var notPred = curry(function(pred) {
    pred = checkFunction(pred, {arity: 1, message: 'Predicate must be a function of arity 1'});

    return curryWithConsistentStyle(pred, function(x) {
      return !pred.call(this, x);
    });
  });


  /*
   * <apifunction>
   *
   * andPred
   *
   * Category: Logical
   *
   * Parameter: f1: function
   * Parameter: f2: function
   * Returns: function
   *
   * Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
   * functions with the given argument, and logically and their results, returning that value. Throws if either
   * argument is not a function of arity 1.
   *
   * Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
   * produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
   * curried, and supply the correct execution context to the supplied functions. If neither was curried in that
   * manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
   * also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
   * in case you need to give the resulting function to one of the `withArity` functions to change the arity).
   *
   * Examples:
   *  var c = funkierJS.constant(true);',
   *  var d = funkierJS.constant(false);',
   *  var f = funkierJS.andPred(c, d);',
   *  f("foo"); // => false',
   *
   */

  var andPred = curry(function(pred1, pred2) {
    pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
    pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

    return chooseCurryStyle(pred1, pred2, function(x) {
      return pred1.call(this, x) && pred2.call(this, x);
    });
  });


  /*
   * <apifunction>
   *
   * orPred
   *
   * Category: Logical
   *
   * Parameter: f1: function
   * Parameter: f2: function
   * Returns: function
   *
   * Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
   * functions with the given argument, and logically or their results, returning that value. Throws if either
   * argument is not a function of arity 1.
   *
   * Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
   * produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
   * curried, and supply the correct execution context to the supplied functions. If neither was curried in that
   * manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
   * also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
   * in case you need to give the resulting function to one of the `withArity` functions to change the arity).
   *
   * Examples:
   *  var c = funkierJS.constant(true);',
   *  var d = funkierJS.constant(false);',
   *  var f = funkierJS.andPred(c, d);',
   *  f("foo"); // => true',
   *
   */

  var orPred = curry(function(pred1, pred2) {
    pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
    pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

    return chooseCurryStyle(pred1, pred2, function(x) {
      return pred1.call(this, x) || pred2.call(this, x);
    });
  });


  /*
   * <apifunction>
   *
   * xorPred
   *
   * Category: Logical
   *
   * Parameter: f1: function
   * Parameter: f2: function
   * Returns: function
   *
   * Takes two unary predicate functions, and returns a new unary function that, when called, will call the original
   * functions with the given argument, and logically xor their results, returning that value. Throws if either
   * argument is not a function of arity 1.
   *
   * Where possible, funkierJS will aim to replicate the currying style of the function. If either function was
   * produced by one of the [`objectCurry'](#objectCurry) variants, then the resulting function will also be object
   * curried, and supply the correct execution context to the supplied functions. If neither was curried in that
   * manner, but one or more was curried with one of the [`bind`](#bind) variants, then the resulting function will
   * also be bound to the same context. Otherwise, the function will be curried with [`curry`]. (This is only provided
   * in case you need to give the resulting function to one of the `withArity` functions to change the arity).
   *
   * Examples:
   *  var c = funkierJS.constant(true);',
   *  var d = funkierJS.constant(true);',
   *  var f = funkierJS.xorPred(c, d);',
   *  f("foo"); // false',
   *
   */

  var xorPred = curry(function(pred1, pred2) {
    pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
    pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

    return chooseCurryStyle(pred1, pred2, function(x) {
      return xor(pred1.call(this, x), pred2.call(this, x));
    });
  });


  return {
    and: and,
    andPred: andPred,
    not: not,
    notPred: notPred,
    or: or,
    orPred: orPred,
    xor: xor,
    xorPred: xorPred
  };
})();

},{"../funcUtils":10,"./curry":2}],4:[function(require,module,exports){
module.exports = (function() {
"use strict";


  var curry = require('./curry').curry;

  //var base = require('./base');
  //var flip = base.flip;

  //var object = require('./object');
  //var callProp = object.callProp;
  //var callPropWithArity = object.callPropWithArity;


  /*
   * <apifunction>
   *
   * add
   *
   * Category: maths
   *
   * Synonyms: plus
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the addition operator.
   *
   * Examples:
   *   funkierJS.add(1, 1); // => 2
   *
   */

  var add = curry(function(x, y) {
    return x + y;
  });


  /*
   * <apifunction>
   *
   * subtract
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the subtraction operator.
   *
   * Examples:
   *   funkierJS.subtract(3, 1); // => 2;
   *
   */

  var subtract = curry(function(x, y) {
    return x - y;
  });


  /*
   * <apifunction>
   *
   * multiply
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the multiplication operator.
   *
   * Examples:
   *   funkierJS.multiply(2, 2); // => 4;
   *
   */

  var multiply = curry(function(x, y) {
    return x * y;
  });


  /*
   * <apifunction>
   *
   * divide
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the division operator.
   *
   * Examples:
   *   funkierJS.arityOf(4, 2); // => 2;
   *
   */

  var divide = curry(function(x, y) {
    return x / y;
  });


  /*
   * <apifunction>
   *
   * exp
   *
   * Category: maths
   *
   * Synonyms: pow
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A curried wrapper around Math.pow.
   *
   * Examples:
   *   funkierJS.exp(2, 3); // => 8
   *
   */

  var exp = curry(function(x, y) {
    return Math.pow(x, y);
  });


  /*
   * <apifunction>
   *
   * log
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * Returns the logarithm of y in the given base x. Note that this function uses the change of base formula, so may
   * be subject to rounding errors.
   *
   * Examples:
   *   funkierJS.log(2, 8); // => 3;
   *
   */

  var log = curry(function(x, y) {
    return Math.log(y) / Math.log(x);
  });



  /*
   * <apifunction>
   *
   * div
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * Returns the quotient on dividing x by y.
   *
   * Examples:
   *   funkierJS.div(5, 2); // => 2
   *
   */

  var div = curry(function(x, y) {
    return Math.floor(x / y);
  });


  /*
   * <apifunction>
   *
   * rem
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the remainder (%) operator.
   *
   * Examples:
   *   funkierJS.rem(5, 2); // => 1;
   *
   */

  var rem = curry(function(x, y) {
    return x % y;
  });



  /*
   * <apifunction>
   *
   * lessThan
   *
   * Category: maths
   *
   * Synonyms: lt
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the less than (<) operator.
   *
   * Examples:
   *   funkierJS.lessThan(5, 2); // => false;
   *
   */

  var lessThan = curry(function(x, y) {
    return x < y;
  });


  /*
   * <apifunction>
   *
   * lessThanEqual
   *
   * Category: maths
   *
   * Synonyms: lte
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the less than or equal (<=) operator.
   *
   * Examples:
   *   funkierJS.lessThanEqual(2, 2); // => true;
   *
   */

  var lessThanEqual = curry(function(x, y) {
    return x <= y;
  });


  /*
   * <apifunction>
   *
   * greaterThan
   *
   * Category: maths
   *
   * Synonyms: gt
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the less than or equal (<=) operator.
   *
   * Examples:
   *   funkierJS.greaterThan(5, 2); // => true;
   *
   */

  var greaterThan = curry(function(x, y) {
    return x > y;
  });


  /*
   * <apifunction>
   *
   * greaterThanEqual
   *
   * Category: maths
   *
   * Synonyms: gte
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the greater than or equal (=>) operator.
   *
   * Examples:
   *   funkierJS.greaterThanEqual(2, 2); // => true;
   *
   */

  var greaterThanEqual = curry(function(x, y) {
    return x >= y;
  });


  /*
   * <apifunction>
   *
   * leftShift
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the left shift (<<) operator.
   *
   * Examples:
   *   funkierJS.leftShift(1, 2); // => 4;
   *
   */

  var leftShift = curry(function(x, y) {
    return x << y;
  });


  /*
   * <apifunction>
   *
   * rightShift
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the right shift (>>) operator.
   *
   * Examples:
   *   funkierJS.rightShift(-4, 2); // => -1;
   *
   */

  var rightShift = curry(function(x, y) {
    return x >> y;
  });


  /*
   * <apifunction>
   *
   * rightShiftZero
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the left shift (>>>) operator.
   *
   * Examples:
   *   funkierJS.rightShiftZero(-4, 2); // => 1073741823;
   *
   */

  var rightShiftZero = curry(function(x, y) {
    return x >>> y;
  });


  /*
   * <apifunction>
   *
   * bitwiseAnd
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the bitwise and (&) operator.
   *
   * Examples:
   *   funkierJS.bitwiseAnd(7, 21); // => 5;
   *
   */

  var bitwiseAnd = curry(function(x, y) {
    return x & y;
  });


  /*
   * <apifunction>
   *
   * bitwiseOr
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the bitwise or (&) operator.
   *
   * Examples:
   *   funkierJS.bitwiseOr(7, 8); // => 15;
   *
   */

  var bitwiseOr = curry(function(x, y) {
    return x | y;
  });


  /*
   * <apifunction>
   *
   * bitwiseXor
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the bitwise xor (^) operator.
   *
   * Examples:
   *   funkierJS.bitwiseAnd(7, 3); // => 4;
   *
   */


  var bitwiseXor = curry(function(x, y) {
    return x ^ y;
  });


  /*
   * <apifunction>
   *
   * bitwiseNot
   *
   * Category: maths
   *
   * Parameter: x: number
   * Returns: number
   *
   * A wrapper around the bitwise not (~) operator.
   *
   * Examples:
   *   funkierJS.bitwiseNot(5); // => -6;
   *
   */

  var bitwiseNot = curry(function(x) {
    return ~x;
  });


  /*
   * <apifunction>
   *
   * min
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A curried wrapper around Math.min. Takes exactly two arguments.
   *
   * Examples:
   *   funkierJS.min(5, 2); // => 2;
   *
   */

  // min has a spec mandated length of 2, so we calling curry will do the right thing
  var min = curry(Math.min);


  /*
   * <apifunction>
   *
   * max
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A curried wrapper around Math.max. Takes exactly two arguments.
   *
   * Examples:
   *   funkierJS.min(5, 2); // => 5;
   *
   */

  // max has a spec mandated length of 2, so we can simply curry
  var max = curry(Math.max);


/*
  var toFixed = defineValue(
    'name: toFixed',
    'signature: x: number, y: number',
    'classification: maths',
    '',
    'A curried wrapper around Number.prototype.toFixed. Takes the number of digits',
    'after the decimal point (which should be between 0 and 20), and a number.',
    'Returns a string representing the number but with the specified number of places',
    'after the decimal point.',
    '--',
    'toFixed(2, 1); // "1.00"',
    callPropWithArity('toFixed', 1)
  );


  var toExponential = defineValue(
    'name: toExponential',
    'signature: x: number, y: number',
    'classification: maths',
    '',
    'A curried wrapper around Number.prototype.toExponential. Takes the number of',
    'digits after the decimal point (which should be between 0 and 20), and a number.',
    'Returns a string representing the number in exponential notation, with the',
    'specified number of places after the decimal point.',
    '--',
    'toExponential(3, 1); // "1.000e+0"',
    callPropWithArity('toExponential', 1)
  );


  var toPrecision = defineValue(
    'name: toPrecision',
    'signature: x: number, y: number',
    'classification: maths',
    '',
    'A curried wrapper around Number.prototype.toPrecision. Takes the number of',
    'significant digits (which should be between 1 and 21), and a number. Returns a',
    'string representing the number, with the specified number of significant digits.',
    '--',
    'toPrecision(3, 1); // "1.000"',
    callPropWithArity('toPrecision', 1)
  );


  var toBaseAndString = defineValue(
    'name: toBaseAndString',
    'signature: x: number, y: number',
    'classification: maths',
    '',
    'A curried wrapper around Number.prototype.toString. Takes a base between 2 and',
      '36, and a number. Returns a string representing the given number in the given',
      'base.',
      '--',
      'toBaseAndString(2, 5); // "101"',
      callPropWithArity('toString', 1)
    );


    var stringToInt = defineValue(
      'name: stringToInt',
      'signature: n: number, s: string',
      'classification: maths',
      '',
      'A curried wrapper around parseInt. Takes a base between 2 and 36, and a string,',
      'and attempts to convert the string assuming it represents a number in the given',
      'base. Returns NaN if the string does not represent a valid number given the base.',
      '--',
      'stringToInt(16, "80"); // 128',
      flip(parseInt)
    );
*/


  /*
   * <apifunction>
   *
   * even
   *
   * Category: maths
   *
   * Parameter: x: number
   * Returns: boolean
   *
   * Given a number, returns true if it is divisible by 2, and false otherwise.
   *
   * Examples:
   *   funkierJS.even(2); // => true
   *   funkierJS.even(3); // => false
   *
   */


  var even = curry(function(n) {
    return n % 2 === 0;
  });


  /*
   * <apifunction>
   *
   * odd
   *
   * Category: maths
   *
   * Parameter: x: number
   * Returns: boolean
   *
   * Given a number, returns true if it is not divisible by 2, and false otherwise.
   *
   * Examples:
   *   funkierJS.odd(2); // => false
   *   funkierJS.odd(3); // => true
   *
   */

  var odd = curry(function(n) {
    return n % 2 !== 0;
  });


  return {
    add: add,
    bitwiseAnd: bitwiseAnd,
    bitwiseNot: bitwiseNot,
    bitwiseOr: bitwiseOr,
    bitwiseXor: bitwiseXor,
    div: div,
    divide: divide,
    even: even,
    exp: exp,
    greaterThan: greaterThan,
    greaterThanEqual: greaterThanEqual,
    gt: greaterThan,
    gte: greaterThanEqual,
    leftShift: leftShift,
    lessThan: lessThan,
    lessThanEqual: lessThanEqual,
    lt: lessThan,
    lte: lessThanEqual,
    log: log,
    min: min,
    max: max,
    multiply: multiply,
    odd: odd,
    plus: add,
    pow: exp,
    rem: rem,
    rightShift: rightShift,
    rightShiftZero: rightShiftZero,
    //stringToInt: stringToInt,
    subtract: subtract
    //toBaseAndString: toBaseAndString,
    //toExponential: toExponential,
    //toFixed: toFixed,
    //toPrecision: toPrecision
  };
})();

},{"./curry":2}],5:[function(require,module,exports){
module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;
  var arityOf = curryModule.arityOf;

  var internalUtilities = require('../internalUtilities');
  var valueStringifier = internalUtilities.valueStringifier;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;


  /*
   * Maybe encapsulates the idea of sentinel values returned by functions to represent an error or unusual condition.
   * Authors can return an instance of the Just constructor when a function runs successfully, and the Nothing object
   * when an error occurs or the computation is otherwise unsuccessful.
   */


  /*
   * <apifunction>
   *
   * Maybe
   *
   * Category: DataTypes
   *
   * The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
   * conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
   * Nothing object when an error occurs, or the computation is otherwise unsuccessful.
   *
   * Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
   * operator.
   *
   * It is an error to call Maybe.
   *
   */

  var Maybe = curry(function() {
    throw new Error('Maybe cannot be instantiated directly');
  });


  Maybe.prototype = {toString: function() {return 'Maybe';}, constructor: Maybe};

  var nothingPrototype = Object.create(Maybe.prototype);
  nothingPrototype.toString = function() {return 'Maybe {Nothing}';};


  /*
   * <apiobject>
   *
   * Nothing
   *
   * Category: DataTypes
   *
   * A Nothing is a type of Maybe representing an unsuccessful computation.
   *
   */

  var Nothing = Object.create(nothingPrototype);
  Object.freeze(Nothing);


  /*
   * <apifunction>
   *
   * Just
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: Just
   *
   * A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.
   * Throws when called with no arguments.
   *
   * Examples:
   *   var result = funkierJS.Just(42);
   *
   */

  var Just = function(val) {
    if (arguments.length !== 1)
      throw new TypeError('Just called with incorrect number of arguments');

    if (!(this instanceof Just))
      return new Just(val);

    Object.defineProperty(this, 'value', {value: val});
  };


  Just.prototype = Object.create(Maybe.prototype);
  Just.prototype.toString = function() {
    return 'Maybe {Just ' + valueStringifier(this.value) + '}';
  };


  /*
   * <apifunction>
   *
   * isMaybe
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a Maybe object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
   *
   */

  var isMaybe = curry(function(val) {
    return val === Maybe || val instanceof Maybe;
  });


  /*
   * <apifunction>
   *
   * isNothing
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is the Nothing object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isNothing(funkierJS.Nothing); // => true
   *
   */

  var isNothing = curry(function(val) {
    return val === Nothing;
  });


  /*
   * <apifunction>
   *
   * isJust
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is a Just object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isJust(funkierJS.Just(42)); // => true
   *
   */

  var isJust = curry(function(val) {
    return val instanceof Just;
  });


  /*
   * <apifunction>
   *
   * getJustValue
   *
   * Category: DataTypes
   *
   * Parameter: j: Just
   * Returns: any
   *
   * Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a
   * Just.
   *
   * Examples:
   *   funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
   *
   */

  var getJustValue = curry(function(j) {
    if (!isJust(j))
      throw new TypeError('Value is not a Just');

    return j.value;
  });


  /*
   * <apifunction>
   *
   * makeMaybeReturner
   *
   * Category: DataTypes
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
   * original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
   * the function is wrapped in a Just and returned.
   *
   * The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
   * curried.
   *
   * Examples:
   *   var g = function(x) {
   *     if (x < 10)
   *       throw new Error('Bad value');
   *     return x;
   *   };
   *
   *   var f = funkierJS.makeMaybeReturner(g);
   *   f(11); // => Just(11)
   *   f(5); // => Nothing
   *
   */

  var makeMaybeReturner = curry(function(f) {
    f = checkFunction(f, {message: 'Value to be transformed must be a function'});

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);

      try {
        var result = f.apply(this, arguments);
        return Just(result);
      } catch (e) {
        return Nothing;
      }
    }, arityOf(f));
  });


  return {
    getJustValue: getJustValue,
    isJust: isJust,
    isMaybe: isMaybe,
    isNothing: isNothing,
    makeMaybeReturner: makeMaybeReturner,
    Just: Just,
    Maybe: Maybe,
    Nothing: Nothing
  };
})();

},{"../funcUtils":10,"../internalUtilities":13,"./curry":2}],6:[function(require,module,exports){
module.exports = (function() {
  "use strict";
  /* jshint -W001 */


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var objectCurry = curryModule.objectCurry;


  var base = require('./base');
  var flip = base.flip;


  var maybe = require('./maybe');
  var Just = maybe.Just;
  var Nothing = maybe.Nothing;


  var internalUtilities = require('../internalUtilities');
  var checkObjectLike = internalUtilities.checkObjectLike;


  /*
   * <apifunction>
   *
   * callPropWithArity
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: arity: natural
   * Returns: function
   *
   * Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
   * requires all the original arguments in their original order, and an object as its final parameter. The returned
   * function will then try to call the named property on the given object,
   *
   * Note that the function is curried in the standard sense. In particular the function is not object curried.
   *
   * Examples:
   *   var myMap = funkierJS.callPropWithArity('map', 1);
   *   myMap(f, arr); // => returns arr.map(f);
   *
   *   var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
   *   myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
   *
   */

  var callPropWithArity = curry(function(prop, arity) {
    return curryWithArity(arity + 1, function() {
      // curryWithArity guarantees we will be called with arity + 1 args
      var propArgs = [].slice.call(arguments, 0, arity);
      var obj = arguments[arity];

      return obj[prop].apply(obj, propArgs);
    });
  });


  /*
   * <apifunction>
   *
   * callProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Returns: function
   *
   * A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified
   * property on the given object.
   *
   * Examples:
   *   var myObj = { return42: function() { return 42; }};
   *   var callReturn42 = funkierJS.callProp('return42');
   *   var callReturn42(myObj); // => 42
   *
   */

  var callProp = flip(callPropWithArity)(0);


  /*
   * <apifunction>
   *
   * hasOwnProperty
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an
   * object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
   * property.
   *
   * Examples:
   *   funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
   *   funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
   *
   */

  var hasOwnProperty = curry(function(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  });


  /*
   * <apifunction>
   *
   * hasProperty
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around the 'in' operator. Takes a string representing a property name and an object, and
   * returns true if the given object or some object in the prototype chain has the specified property.
   *
   * Examples:
   *   funkierJS.hasProperty('funkier', {funkier: 1}); // => true
   *   funkierJS.hasProperty('toString', {funkier: 1}); // => true
   *
   */

  var hasProperty = curry(function(prop, object) {
    return prop in object;
  });


  /*
   * <apifunction>
   *
   * instanceOf
   *
   * Category: Object
   *
   * Parameter: constructor: function
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around the 'instanceof' operator. Takes a constructor function and an object, and returns true
   * if the function's prototype property is in the prototype chain of the given object.
   *
   * Examples:
   *   var Constructor = function() {};
   *   funkierJS.instanceOf(Constructor, new Constructor()); // => true
   *   funkierJS.instanceOf(Function, {}); // => false
   *
   */

  var instanceOf = curry(function(constructor, object) {
    return object instanceof constructor;
  });


  /*
   * <apifunction>
   *
   * isPrototypeOf
   *
   * Category: Object
   *
   * Parameter: protoObject: objectLike
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object
   * whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.
   *
   * Examples:
   *   var Constructor = function() {};
   *   funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
   *   funkierJS.isPrototypeOf(Function.prototype, {}); // => false
   *
   */

  var isPrototypeOf = curry(function(proto, obj) {
    return Object.prototype.isPrototypeOf.call(proto, obj);
  });


  /*
   * <apifunction>
   *
   * createObject
   *
   * Category: Object
   *
   * Parameter: protoObject: objectLike
   * Returns: object
   *
   * Returns a new object whose internal prototype property is the given object protoObject.
   *
   * Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
   * to the created object, use [createObjectWithProps](#createObjectWithProps).
   *
   * Examples:
   *   var obj = {};
   *   var newObj = funkierJS.createObject(obj);
   *   funkierJS.isPrototypeOf(obj, newObj); // => true
   *
   */

  var createObject = curry(function(obj) {
    return Object.create(obj);
  });


  /*
   * <apifunction>
   *
   * createObjectWithProps
   *
   * Category: Object
   *
   * Parameter: protoObject: objectLike
   * Parameter: descriptorsObject: object
   * Returns: object
   *
   * Creates an object whose internal prototype property is protoObj, and which has the additional properties described
   * in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
   * form accepted by Object.create, Object.defineProperties etc.
   *
   * Examples:
   *   var obj = {};
   *   var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
   *                                                             writeable: true, value: 1}});
   *   funkierJS.isPrototypeOf(obj, newObj); // => true
   *   funkierJS.hasOwnProperty('prop', newObj); // => true',
   *
   */

  var createObjectWithProps = curry(function(obj, descriptor) {
    return Object.create(obj, descriptor);
  });


  /*
   * <apifunction>
   *
   * defineProperty
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: descriptor: object
   * Parameter: o: objectLike
   * Returns: objectLike
   *
   * A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the
   * object that the property hould be defined on. Returns the object o, after having defined the relevant property
   * per the descriptor. Throws a TypeError if the descriptor is not an object.
   *
   * Examples:
   *   var a = {};',
   *   funkierJS.hasOwnProperty('foo', a); // => false
   *   funkierJS.defineProperty('foo', {value: 42}, a);
   *   funkierJS.hasOwnProperty('foo', a); // => true
   *
   */

  var defineProperty = curry(function(prop, descriptor, obj) {
    descriptor = checkObjectLike(descriptor, {strict: true});
    return Object.defineProperty(obj, prop, descriptor);
  });


  /*
   * <apifunction>
   *
   * defineProperties
   *
   * Category: Object
   *
   * Parameter: descriptors: object
   * Parameter: o: objectLike
   * Returns: objectLike
   *
   * A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property
   * descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
   * properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.
   *
   * Examples:
   *   var a = {};',
   *   funkierJS.hasOwnProperty('foo', a); // => false
   *   funkierJS.defineProperties({foo: {value: 42}}, a);
   *   funkierJS.hasOwnProperty('foo', a); // => true
   *
   */

  var defineProperties = curry(function(descriptors, obj) {
    // We're not strict here: for example one might want to install array-like properties from an array
    descriptors = checkObjectLike(descriptors, {allowNull: false});
    obj = checkObjectLike(obj, {allowNull: false});
    return Object.defineProperties(obj, descriptors);
  });


  /*
   * <apifunction>
   *
   * getOwnPropertyDescriptor
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: o: objectLike
   * Returns: object
   *
   * A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself
   * has the given property, then the object's property descriptor for the given object is returned, otherwise it returns
   * undefined.
   *
   * Examples:
   *   var a = {foo: 42};',
   *   funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
   *                                                        value: 42}
   *   funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
   *
   */

  var getOwnPropertyDescriptor = flip(Object.getOwnPropertyDescriptor);


  /*
   * <apifunction>
   *
   * extract
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: object
   * Returns: any
   *
   * Synonyms: tap
   *
   * Extracts the given property from the given object. Equivalent to evaluating obj[prop].
   *
   * Examples:
   *   funkierJS.extract('foo', {foo: 42}); // => 42
   *
   */

  var extract = curry(function(prop, obj) {
    return obj[prop];
  });


  /*
   * <apifunction>
   *
   * extractOrDefault
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: default: any
   * Parameter: obj: object
   * Returns: any
   *
   * Synonyms: defaultTap
   *
   * Extracts the given property from the given object, unless the property is not found in the object or its prototype
   * chain, in which case the specified default value is returned.
   *
   * Examples:
   *   funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
   *
   */

  var extractOrDefault = curry(function(prop, defaultVal, obj) {
    if (!(prop in obj))
      return defaultVal;

    return obj[prop];
  });


  /*
   * <apifunction>
   *
   * maybeExtract
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: object
   * Returns: Maybe
   *
   * Synonyms: safeExtract | maybeTap | safeTap
   *
   * Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,
   * either in the object, or its prototype chain, then Nothing is returned.
   *
   * Examples:
   *   funkierJS.maybeExtract('foo', {}); // => Nothing
   *
   */

  var maybeExtract = curry(function(prop, obj) {
    if (!(prop in obj))
      return Nothing;

    // Handle case where there is no getter
    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (('set' in descriptor) && descriptor.get === undefined)
      return Nothing;

    return Just(obj[prop]);
  });


  // A thousand curses!
  // Per the ECMAScript spec, when setting a property on an object, the property descriptor - if it exists -
  // should be checked. Setting should fail when writable=false or there is no setter in the descriptor.
  // If the property descriptor doesn't exist on the property, then walk up the prototype chain making the
  // same check.
  //
  // Versions of V8 up to 3.11.9 fail to walk up the prototype chain. Further, when it was fixed, the fix
  // was gated behind a flag, which defaulted to false until 3.13.6, when the flag was flipped and V8 became
  // spec-compliant. The flag was removed in 3.25.4.
  var engineHandlesProtosCorrectly = (function() {
    var A = function(){};
    Object.defineProperty(A.prototype, 'foo', {writable: false});
    var compliant = false;
    var b = new A();

    try {
      b.foo = 1;
    } catch (e) {
      compliant = true;
    }

    return compliant;
  })();


  // Utility function for set: work backwards to Object.prototype, looking for a property descriptor
  var findPropertyDescriptor = function(prop, obj) {
    var descriptor;
    var toppedOut = false;

    while (descriptor === undefined && !toppedOut) {
      descriptor = getOwnPropertyDescriptor(prop, obj);
      if (descriptor === undefined) {
        if (obj === Object.prototype) {
          toppedOut = true;
        } else {
          obj = Object.getPrototypeOf(obj);
        }
      }
    }

    return descriptor;
  };


 // Utility function, taking a property and an object, returning true if that property is writable
  var checkIfWritable = function(prop, obj) {
    var writable = true;
    var descriptor = findPropertyDescriptor(prop, obj);

    // Don't modify writable false properties
    if (descriptor && 'writable' in descriptor && descriptor.writable === false)
      writable = false;

    // Don't modify no setter properties
    if (descriptor && writable && 'set' in descriptor && descriptor.set === undefined)
      writable = false;

    return writable;
  };


  /*
   * <apifunction>
   *
   * set
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: setProp
   *
   * Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
   * o[prop] = value. The property will be created if it doesn't exist on the object. Throws when the property is
   * not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
   * is not already present.
   *
   * Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
   * Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
   * created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
   * to ensure existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.set('foo', 42, a); // => returns a
   *   a.foo // => 42
   *
   */

  var set = curry(function(prop, val, obj) {
    // We manually emulate the operation of [[CanPut]], rather than just setting in a
    // try-catch. We don't want to suppress other errors: for example the property's
    // setter function might throw
    var writable = checkIfWritable(prop, obj);

    if (writable && !hasOwnProperty(prop, obj) && (Object.isSealed(obj) || !Object.isExtensible(obj)))
      writable = false;

    if (!writable)
      throw new Error('Cannot write to property ' + prop);

    obj[prop] = val;
    return obj;
  });


  /*
   * <apifunction>
   *
   * safeSet
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: Maybe
   *
   * Synonyms: maybeSet | maybeSetProp | safeSetProp
   *
   * Sets the given property to the given value on the given object, returning the object wrapped in a Just value when
   * successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn't exist on the
   * object. If unable to modify or create the property, then Nothing will be returned.
   *
   * Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
   * Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
   * created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants
   * to ensure existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   Object.freeze(a);
   *   funkierJS.safeSet('foo', 42, a); // => returns Nothing
   *   a.foo // => 1
   *
   */

  var safeSet = curry(function(prop, val, obj) {
    // We manually emulate the operation of [[CanPut]], rather than just setting in a
    // try-catch. We don't want to suppress other errors: for example the property's
    // setter function might throw
    var writable = checkIfWritable(prop, obj);

    if (writable && !hasOwnProperty(prop, obj) && (Object.isSealed(obj) || !Object.isExtensible(obj)))
      writable = false;

    if (!writable)
      return Nothing;

    obj[prop] = val;
    return Just(obj);
  });


  /*
   * <apifunction>
   *
   * modify
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: modifyProp
   *
   * Sets the given property to the given value on the given object, providing it exists, and returns the object.
   * Equivalent to evaluating o[prop] = value. The property will not be created when it doesn't exist on the object.
   * Throws when the property is not writable, when it has no setter function, or when the object is frozen.
   *
   * Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above circumstances.
   * Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
   * where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
   * existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.modify('foo', 42, a); // => returns a
   *   a.foo // => 42
   *
   */

  var modify = curry(function(prop, val, obj) {
    // Return straight away if the property doesn't exist
    if (!hasProperty(prop, obj))
      throw new Error('Cannot modify non-existent property ' + prop);

    return set(prop, val, obj);
  });


  /*
   * <apifunction>
   *
   * safeModify
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: maybeModify | maybeModifyProp | safeModifyProp
   *
   * Sets the given property to the given value on the given object, providing it exists, and returns the object,
   * wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be
   * created when it doesn't exist on the object; nor will it be amended when the property is not writable, when it
   * has no setter function, or when the object is frozen. In such cases, Nothing will be returned.
   *
   * Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
   * Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
   * where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
   * existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   Object.freeze(a);
   *   funkierJS.safeModify('foo', 42, a); // => Nothing
   *   a.foo // => 1
   *
   */

  var safeModify = curry(function(prop, val, obj) {
    // Return straight away if the property doesn't exist
    if (!hasProperty(prop, obj))
      return Nothing;

    return safeSet(prop, val, obj);
  });


  /*
   * <apifunction>
   *
   * createProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
   * o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.
   * Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
   * successfully created when it already exists, but only in the prototype chain.
   *
   * Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above circumstances.
   * Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
   * creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
   * required.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.create('bar', 42, a); // => returns a
   *   a.bar // => 42
   *
   */

  var createProp = curry(function(prop, val, obj) {
    // Return straight away if the property exists
    if (hasOwnProperty(prop, obj))
      throw new Error('Attempt to recreate existing property ' + prop);

    return set(prop, val, obj);
  });


  /*
   * <apifunction>
   *
   * safeCreateProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: Maybe
   *
   * Synonyms: maybeCreate
   *
   *
   * Creates the given property to the given value on the given object, returning the object wrapped in a Just.
   * Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
   * that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
   * cannot be extended. Note that the property will be successfully created when it already exists, but only in the
   * prototype chain.
   *
   * Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
   * [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
   * creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
   * required.
   *
   * Examples:
   *   var a = {foo: 1};
   *   Object.freeze(a);
   *   funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
   *   a.foo // => undefined
   *
   */

  var safeCreateProp = curry(function(prop, val, obj) {
    // Return straight away if the property exists
    if (hasOwnProperty(prop, obj))
      return Nothing;

    return safeSet(prop, val, obj);
  });



  /*
   * <apifunction>
   *
   * deleteProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
   * delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.
   *
   * Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
   * depending on the outcome of the operation.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.delete('foo',  a); // => returns a
   *   a.foo // => undefined
   *
   */

  var deleteProp = curry(function(prop, obj) {
    obj = checkObjectLike(obj);

    if (!obj.hasOwnProperty(prop))
      return obj;

    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (descriptor.configurable === false)
      throw new Error('Cannot delete property ' + prop + ': not configurable!');

    delete obj[prop];
    return obj;
  });


  /*
   * <apifunction>
   *
   * safeDeleteProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: maybeDelete
   *
   * Deletes the given property from the given the given object, returning the object wrapped as a Just value.
   * Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual
   * descriptor or the object being frozen or sealed) then Nothing will be returned.
   *
   * Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.
   *
   * Examples:
   *   var a = {};
   *   funkierJS.delete('foo',  a); // => returns Nothing
   *
   */

  var safeDeleteProp = curry(function(prop, obj) {
    obj = checkObjectLike(obj);

    if (!obj.hasOwnProperty(prop))
      return Just(obj);

    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (descriptor.configurable === false)
      return Nothing;

    delete obj[prop];
    return Just(obj);
  });


  /*
   * <apifunction>
   *
   * keys
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object's own
   * properties. Returns an empty array for non-objects.
   *
   * Examples:
   *   funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
   *                                     //    environment
   *
   */

  var keys = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return Object.keys(obj);
  });


  /*
   * <apifunction>
   *
   * getOwnPropertyNames
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the
   * object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
   * the property names is not defined.
   *
   * Examples:
   *   funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
   *                                                    // native environment
   *
   */

  var getOwnPropertyNames = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return Object.getOwnPropertyNames(obj);
  });



  /*
   * <apifunction>
   *
   * keyValues
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
   * of a property from the object, and the second element is the value of the property. This function only returns
   * key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
   * is not defined.
   *
   * Examples:
   *   funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]] depending on
   *                                          // native environment
   *
   */

  var keyValues = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return keys(obj).map(function(k) {return [k, obj[k]];});
  });


  /*
   * <apifunction>
   *
   * descriptors
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
   * of a property from the object, and the second element is its property descriptor. This function only returns
   * key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
   * is not defined.
   *
   * Examples:
   *   funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
   *                                                            value: 1}]
   *
   */

  var descriptors = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return keys(obj).map(function(k) {return [k, getOwnPropertyDescriptor(k, obj)];});
  });


  /*
   * <apifunction>
   *
   * clone
   *
   * Category: Object
   *
   * Synonyms: shallowClone
   *
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
   * and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
   * from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of
   * the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
   * Non-primitive values are copied by reference.
   *
   * Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
   * will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
   * corresponding property in the original.
   *
   */

  var shallowCloneInternal = function(obj, isRecursive) {
    if (typeof(obj) === 'function')
      return obj;

    if (typeof(obj) !== 'object')
      throw new TypeError('shallowClone called on non-object');

    if (Array.isArray(obj)) {
      var newArray = obj.slice();

      Object.keys(obj).forEach(function(k) {
        var n = k - 0;
        if (isNaN(n)) {
          newArray[k] = obj[k];
          return;
        }

        if (Math.floor(n) === n && Math.ceil(n) === n) return;
        newArray[k] = obj[k];
      });

      return newArray;
    }

    if (obj === null)
      return isRecursive ? Object.create(null) : null;

    if (obj === Object.prototype)
      return {};

    var result = shallowCloneInternal(Object.getPrototypeOf(obj), true);

    Object.getOwnPropertyNames(obj).forEach(function(k) {
      var desc = Object.getOwnPropertyDescriptor(obj, k);
      Object.defineProperty(result, k, desc);
    });

    return result;
  };


  var shallowClone = curry(function(obj) {
    return shallowCloneInternal(obj, false);
  });


  /*
   * <apifunction>
   *
   * extend
   *
   * Category: Object
   *
   * Parameter: source: objectLike
   * Parameter: dest: objectLike
   * Returns: objectLike
   *
   * Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
   * into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
   * properties are shallow-copied: in other words, if 'foo' is a property of source whose value is an object, then
   * afterwards source.foo === dest.foo will be true.
   *
   * Examples:
   *   var a = {bar: 1};
   *   funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
   *
   */

  var extend = curry(function(source, dest) {
    for (var k in source)
      dest[k] = source[k];

    return dest;
  });


  /*
   * <apifunction>
   *
   * extendOwn
   *
   * Category: Object
   *
   * Parameter: source: objectLike
   * Parameter: dest: objectLike
   * Returns: objectLike
   *
   * Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
   * source's prototype chain are not copied. Any extant properties with the same name are overwritten.
   * Returns the modified dest object. All properties are shallow-copied: in other words, if 'foo' is a property of
   * source whose value is an object, then afterwards source.foo === dest.foo will be true.
   *
   * Examples:
   *   var a = funkierJS.createObject({bar: 1});
   *   a.baz = 2;
   *   var b = {foo: 3};
   *   funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
   *
   */

  var extendOwn = curry(function(source, dest) {
    var keys = Object.keys(source);

    keys.forEach(function(k) {
      dest[k] = source[k];
    });

    return dest;
  });


  /*
   * <apifunction>
   *
   * curryOwn
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
   * writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
   * If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
   * object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
   * in their descriptor are ignored.
   *
   * The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
   * the client would be left having to manually enumerate the functions to see which ones did get curried. The
   * avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
   * ambiguities.
   *
   * Examples:
   *   var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
   *   funkierJS.curryOwn(obj);
   *   obj.foo(2)(3); // => 15
   *
   */

  var curryOwn = curry(function(obj) {
    var keys = Object.keys(obj);

    var funcKeys = keys.filter(function(k) {
      var desc = Object.getOwnPropertyDescriptor(obj, k);
      return typeof(obj[k]) === 'function' && desc.hasOwnProperty('configurable') && desc.hasOwnProperty('writable');
    });

    if (funcKeys.some(function(k) { return Object.getOwnPropertyDescriptor(obj, k).writable === false; }))
      return obj;

    funcKeys.forEach(function(k) {
      obj[k] = objectCurry(obj[k]);
    });

    return obj;
  });


  return {
    callProp: callProp,
    callPropWithArity: callPropWithArity,
    clone: shallowClone,
    createObject: createObject,
    createObjectWithProps: createObjectWithProps,
    createProp: createProp,
    curryOwn: curryOwn,
    descriptors: descriptors,
    defaultTap: extractOrDefault,
    defineProperty: defineProperty,
    defineProperties: defineProperties,
    deleteProp: deleteProp,
    extend: extend,
    extendOwn: extendOwn,
    extract: extract,
    extractOrDefault: extractOrDefault,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    getOwnPropertyNames: getOwnPropertyNames,
    hasOwnProperty: hasOwnProperty,
    hasProperty: hasProperty,
    instanceOf: instanceOf,
    isPrototypeOf: isPrototypeOf,
    keys: keys,
    keyValues: keyValues,
    maybeCreate: safeCreateProp,
    maybeDelete: safeDeleteProp,
    maybeExtract: maybeExtract,
    maybeModify: safeModify,
    maybeModifyProp: safeModify,
    maybeSet: safeSet,
    maybeSetProp: safeSet,
    maybeTap: maybeExtract,
    modify: modify,
    modifyProp: modify,
    safeCreateProp: safeCreateProp,
    safeDeleteProp: safeDeleteProp,
    safeExtract: maybeExtract,
    safeModify: safeModify,
    safeModifyProp: safeModify,
    safeSet: safeSet,
    safeSetProp: safeSet,
    safeTap: maybeExtract,
    set: set,
    setProp: set,
    shallowClone: shallowClone,
    tap: extract
  };
})();

},{"../internalUtilities":13,"./base":1,"./curry":2,"./maybe":5}],7:[function(require,module,exports){
module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;

  var utils = require('../internalUtilities');
  var valueStringifier = utils.valueStringifier;


  /*
   * A Pair represents an immutable tuple. The constructor function takes two elements,
   * first, and second, and returns a new tuple. The contents of the tuple can be accessed
   * with the accessor functions fst and snd respectively. The constructor is new-agnostic.
   * When called with one argument, a function will be returned that expects a second argument;
   * supplying this function with a value will yield a Pair. Throws a TypeError if called with
   * zero arguments.
   *
   */


  /*
   * <apifunction>
   *
   * Pair
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: Pair
   *
   * A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
   * new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd
   * respectively. The constructor is new-agnostic.
   *
   * The constructor is curried: when called with one argument, a function will be returned that expects a second
   * argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
   * outside of the usual mechanisms.
   *
   * Throws a TypeError if called with zero arguments.
   *
   * Examples:
   * var p1 = new funkierJS.Pair(2, 3);
   * var p2 = funkierJS.Pair(2)(3);
   * var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
   *
   */

  var Pair = function(a, b) {
    if (arguments.length === 0)
      throw new TypeError('Pair constructor takes two arguments');

    if (arguments.length === 1)
      return pairMaker(a);

    if (!(this instanceof Pair))
      return new Pair(a, b);

    Object.defineProperty(this, 'first', {enumerable: false, configurable: false, value: a});
    Object.defineProperty(this, 'second', {enumerable: false, configurable: false, value: b});
  };


  Pair.prototype = {
    toString: function() {
      // We use coercion rather than an explicit toString call as it's permissible for the
      // values to be null or undefined
      return ['Pair (', valueStringifier(this.first), ', ', valueStringifier(this.second), ')'].join('');
    },

    constructor: Pair
  };


  // Utility function for Pair to provide the illusion of currying
  var pairMaker = function(a) {
    var fn = curry(function(b) {
      return new Pair(a, b);
    });

    // Lie to instanceof
    fn.prototype = Pair.prototype;
    return fn;
  };


  /*
   * <apifunction>
   *
   * fst
   *
   * Category: DataTypes
   *
   * Synonyms: first
   *
   * Parameter: p: Pair
   * Returns: any
   *
   * Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if
   * called with a non-pair value.
   *
   * Examples:
   * var p = new funkierJS.Pair(2, 3);
   * funkierJS.fst(p); // => 2',
   *
   */

  var fst = curry(function(pair) {
    if (!(pair instanceof Pair))
      throw new TypeError('Not a pair');

    return pair.first;
  });


  /*
   * <apifunction>
   *
   * snd
   *
   * Category: DataTypes
   *
   * Synonyms: second
   *
   * Parameter: p: Pair
   * Returns: any
   *
   * Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if
   * called with a non-pair value.
   *
   * Examples:
   * var p = new funkierJS.Pair(2, 3);
   * funkierJS.cnd(p); // => 3',
   *
   */

  var snd = curry(function(pair) {
    if (!(pair instanceof Pair))
      throw new TypeError('Not a pair');

    return pair.second;
  });



  /*
   * <apifunction>
   *
   * isPair
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is a Pair, and false otherwise.
   *
   * Examples:
   *   funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
   *
   */

  var isPair = curry(function(obj) {
    return obj instanceof Pair;
  });



  /*
   * <apifunction>
   *
   * asArray
   *
   * Category: DataTypes
   *
   * Parameter: p: Pair
   * Returns: array
   *
   * Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if
   * the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is
   * not a pair.
   *
   * Examples:
   *   funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
   *
   */

  var asArray = curry(function(p) {
    if (!(p instanceof Pair))
      throw new TypeError('Not a pair');

    return [fst(p), snd(p)];
  });


  return {
    Pair: Pair,
    asArray: asArray,
    first: fst,
    fst: fst,
    isPair: isPair,
    second: snd,
    snd: snd
  };
})();

},{"../internalUtilities":13,"./curry":2}],8:[function(require,module,exports){
module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var arityOf = curryModule.arityOf;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;

  var internalUtilities = require('../internalUtilities');
  var valueStringifier = internalUtilities.valueStringifier;
  var checkArrayLike = internalUtilities.checkArrayLike;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;


  /*
   * Result encapsulates the idea of functions throwing errors. It can be considered equivalent
   * to the Either datatype from Haskell, or the Result type from Rust.
   */


  /*
   * <apifunction>
   *
   * Result
   *
   * Category: DataTypes
   *
   * The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
   * datatype from Haskell, or the Result type from Rust.
   *
   * Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.
   *
   * It is an error to call Result.
   *
   */

  var Result = function() {
    throw new Error('Result cannot be instantiated directly');
  };
  Result.prototype = {toString: function() {return 'Result';}, constructor: Result};


  /*
   * <apifunction>
   *
   * Ok
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: Ok
   *
   * An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
   * Throws when called with no arguments.
   *
   * Examples:
   *   var result = funkierJS.Ok(42);
   *
   */

  var Ok = function(val) {
    if (arguments.length !== 1)
      throw new TypeError('Ok called with incorrect number of arguments');

    if (!(this instanceof Ok))
      return new Ok(val);

    Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
  };


  Ok.prototype = Object.create(Result.prototype);
  Ok.prototype.toString = function() {
    return 'Result {Ok ' + valueStringifier(this.value) + '}';
  };


  /*
   * <apifunction>
   *
   * Err
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: Just
   *
   * An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
   * Throws if called without any arguments
   *
   * Examples:
   *   var result = funkierJS.Err(new TypeError('boom');
   *
   */


  var Err = function(val) {
    if (arguments.length !== 1)
      throw new TypeError('Err called with incorrect number of arguments');

    if (!(this instanceof Err))
      return new Err(val);

    Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
  };


  Err.prototype = Object.create(Result.prototype);
  Err.prototype.toString = function() {
    return 'Result {Err ' + valueStringifier(this.value) + '}';
  };


  /*
   * <apifunction>
   *
   * isResult
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a Result object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
   *
   */

  var isResult = curry(function(val) {
    return val === Result || val instanceof Result;
  });


  /*
   * <apifunction>
   *
   * isErr
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a Err object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isErr(funkierJS.Err(4)); // => true
   *
   */

  var isErr = curry(function(val) {
    return val instanceof Err;
  });


  /*
   * <apifunction>
   *
   * isOk
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a Ok object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isOk(funkierJS.Ok('foo)); // => true
   *
   */

  var isOk = curry(function(val) {
    return val instanceof Ok;
  });


  /*
   * <apifunction>
   *
   * getOkValue
   *
   * Category: DataTypes
   *
   * Parameter: o: Ok
   * Returns: any
   *
   * Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
   * Ok.
   *
   * Examples:
   *   funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
   *
   */

  var getOkValue = curry(function(val) {
    if (!isOk(val))
      throw new TypeError('Value is not an Ok');

    return val.value;
  });


  /*
   * <apifunction>
   *
   * getErrValue
   *
   * Category: DataTypes
   *
   * Parameter: e: Err
   * Returns: any
   *
   * Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
   * Err.
   *
   * Examples:
   *   funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
   *
   */

  var getErrValue = curry(function(val) {
    if (!isErr(val))
      throw new TypeError('Value is not an Err');

    return val.value;
  });


  /*
   * <apifunction>
   *
   * makeResultReturner
   *
   * Category: DataTypes
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
   * original. If the function f throws during execution, then the exception will be caught, and an Err object
   * wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.
   *
   * The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
   * curried.
   *
   * Examples:
   *   var g = function(x) {
   *     if (x < 10)
   *       throw new Error('Bad value');
   *     return x;
   *   };
   *
   *   var f = funkierJS.makeResultReturner(g);
   *   f(11); // => Ok(11)
   *   f(5); // => Err(Error('Bad value');
   *
   */

  var makeResultReturner = curry(function(f) {
    f = checkFunction(f, {message: 'Value to be transformed must be a function'});

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);

      try {
        var result = f.apply(this, arguments);
        return Ok(result);
      } catch (e) {
        return Err(e);
      }
    }, arityOf(f));
  });


  /*
   * <apifunction>
   *
   * either
   *
   * Category: DataTypes
   *
   * Parameter: f1: function
   * Parameter: f2: function
   * Parameter: r: Result
   * Returns: function
   *
   * Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
   * be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
   * with the unwrapped value. In either case, the result of of the called function is returned.
   *
   * Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
   * is not a Result.
   *
   * Examples:
   * var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
   * f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
   * f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
   *
   */

  var either = curry(function(okFn, errFn, result) {
    okFn = checkFunction(okFn, {arity: 1, minimum: true, message: 'Ok value must be a function of arity 1 or more'});
    errFn = checkFunction(errFn, {arity: 1, minimum: true, message: 'Err value must be a function of arity 1 or more'});

    if (isOk(result))
      return okFn(getOkValue(result));

    if (isErr(result))
      return errFn(getErrValue(result));

    throw new TypeError('Invalid value');
  });


  return {
    either: either,
    getErrValue: getErrValue,
    getOkValue: getOkValue,
    isErr: isErr,
    isOk: isOk,
    isResult: isResult,
    makeResultReturner: makeResultReturner,
    Err: Err,
    Ok: Ok,
    Result: Result
  };
})();

},{"../funcUtils":10,"../internalUtilities":13,"./curry":2}],9:[function(require,module,exports){
module.exports = (function() {
  "use strict";

//  var makeModule = function(require, exports) {
//    var curryModule = require('./curry');
  var curry = require('./curry').curry;
//    var curryWithArity = curryModule.curryWithArity;
//    var getRealArity = curryModule.getRealArity;
//
//    var funcUtils = require('./funcUtils');
//    var checkFunction = funcUtils.checkFunction;
//
//    var utils = require('./utils');
//    var checkPositiveIntegral = utils.checkPositiveIntegral;
//    var defineValue = utils.defineValue;



  /*
   * <apifunction>
   *
   * equals
   *
   * Category: types
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the non-strict equality (==) operator.
   *
   * Examples:
   *   funkierJS.equals(1, '1'); // => true
   *
   */

  var equals = curry(function(x, y) {
    return x == y;
  });



  /*
   * <apifunction>
   *
   * strictEquals
   *
   * Category: types
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the strict equality (===) operator.
   *
   * Examples:
   *   funkierJS.strictEquals(1, '1'); // => false
   *
   */

  var strictEquals = curry(function(x, y) {
    return x === y;
  });


  /*
   * <apifunction>
   *
   * notEqual
   *
   * Category: types
   *
   * Synonyms: notEquals
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the inequality (!=) operator.
   *
   * Examples:
   *   funkierJS.notEqual({}, {}); // => true
   *
   */

  var notEqual = curry(function(x, y) {
    return x != y;
  });


  /*
   * <apifunction>
   *
   * strictNotEqual
   *
   * Category: types
   *
   * Synonyms: strictNotEquals | strictInequality
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the strict inequality (!==) operator.
   *
   * Examples:
   *   funkierJS.strictNotEqual(1, '1'); // => true
   *
   */

  var strictNotEqual = curry(function(x, y) {
    return x !== y;
  });


  // Helper function for deepEqual. Assumes both objects are arrays.
  var deepEqualArr = function(a, b, aStack, bStack) {
    if (a.length !== b.length)
      return false;

    for (var i = aStack.length - 1; i >= 0; i--) {
      if (aStack[i] === a)
        return bStack[i] === b || bStack[i] === a;
      if (bStack[i] === b)
        return false;
    }

    aStack.push(a);
    bStack.push(b);
    var ok = true;
      ok = ok && deepEqualInternal(a[i], b[i], aStack, bStack);

    // Can't just iterate over the indices: the array might have custom keys
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      ok = false;
    } else {
      aKeys.sort();
      bKeys.sort();

      ok = aKeys.every(function(k, i) {
        if (k !== bKeys[i])
          return false;
        return deepEqualInternal(a[k], b[k], aStack, bStack);
      });
    }

    aStack.pop();
    bStack.pop();
    return ok;
  };


  // Helper function for deepEqual. Assumes identity has already been checked, and
  // that a check has been made for both objects being arrays.
  var deepEqualObj = function(a, b, aStack, bStack) {
    // Identity should have already been checked (ie a ==== b === null)
    if (a === null || b === null)
      return false;

    // Likewise, we should already have checked for arrays
    if (Array.isArray(a) || Array.isArray(b))
      return false;

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
      return false;

    // Check for recursive objects
    for (var i = aStack.length - 1; i >= 0; i--) {
      if (aStack[i] === a)
        return bStack[i] === b || bStack[i] === a;
      if (bStack[i] === b)
        return false;
    }

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    aKeys.sort();
    bKeys.sort();

    if (!deepEqualArr(aKeys, bKeys, aStack, bStack))
      return false;

    aStack.push(a);
    bStack.push(b);
    var ok = true;
    for (i = 0; ok && i < aKeys.length; i++)
      ok = ok && deepEqualInternal(a[aKeys[i]], b[bKeys[i]], aStack, bStack);

    aStack.pop();
    bStack.pop();
    return ok;
  };


  var deepEqualInternal = function(a, b, aStack, bStack) {
    if (strictEquals(a, b))
      return true;

    if (typeof(a) !== typeof(b))
       return false;

    if (typeof(a) !== 'object')
      return false;

    if (Array.isArray(a) && Array.isArray(b))
      return deepEqualArr(a, b, aStack, bStack);

    return deepEqualObj(a, b, aStack, bStack);
  };


  /*
   * <apifunction>
   *
   * deepEqual
   *
   * Category: types
   *
   * Synonyms: deepEquals
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * Check two values for deep equality. Deep equality holds if any of the following if the two values are the same
   * object, if both values are objects with the same object, the same prototype, the same enumerable properties
   * and those properties are themselves deeply equal (non-enumerable properties are not checked), or if both values
   * are arrays with the same length, any additional properties installed on the arrays are deeply equal, and the items
   * at each index are themselves deeply equal.
   *
   * Examples:
   *   funkierJS.deepEqual({foo: 1, bar: [2, 3]}, {bar: [2, 3], foo: 1}); // => true
   *
   */

  var deepEqual = curry(function(a, b) {
    return deepEqualInternal(a, b, [], []);
  });


  /*
   * <apifunction>
   *
   * is
   *
   * Category: types
   *
   * Synonyms: hasType
   *
   * Parameter: type: string
   * Parameter: value: any
   * Returns: boolean
   *
   * Given a string that could be returned by the `typeof` operator, and a value, returns true if typeof the given
   * object equals the given string. Throws if the first argument is not a string.
   *
   * Examples:
   *   funkierJS.is('number', 1); // => true
   *
   */

  var is = curry(function(s, obj) {
    if (typeof(s) !== 'string')
      throw new TypeError('Type to be checked is not a string');

    return typeof(obj) === s;
  });


  /*
   * <apifunction>
   *
   * isNumber
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "number", false otherwise.
   *
   * Examples:
   *   funkierJS.isNumber(1); // => true
   *
   */

  var isNumber = is('number');


  /*
   * <apifunction>
   *
   * isString
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "string", false otherwise.
   *
   * Examples:
   *   funkierJS.isString('a'); // => true
   *
   */

  var isString = is('string');


  /*
   * <apifunction>
   *
   * isBoolean
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "boolean", false otherwise.
   *
   * Examples:
   *   funkierJS.isBoolean(false); // => true
   *
   */

  var isBoolean = is('boolean');


  /*
   * <apifunction>
   *
   * isUndefined
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "undefined", false otherwise.
   *
   * Examples:
   *   funkierJS.isUndefined(1); // => false
   *
   */

  var isUndefined = is('undefined');


  /*
   * <apifunction>
   *
   * isObject
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "object", false otherwise.
   *
   * Examples:
   *   funkierJS.isObject(null); // => true
   *
   */

  var isObject = is('object');


  /*
   * <apifunction>
   *
   * isArray
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is an array, false otherwise
   *
   * Examples:
   *   funkierJS.isArray([]); // => true
   *
   */

  var isArray = curry(function(obj) {
    return Array.isArray(obj);
  });


  /*
   * <apifunction>
   *
   * isNull
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given object is null, false otherwise
   *
   * Examples:
   *   funkierJS.isNull(null); // => true
   *
   */

  var isNull = curry(function(obj) {
    return obj === null;
  });


  /*
   * <apifunction>
   *
   * isRealObject
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
   * and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.
   *
   * Examples:
   *   funkierJS.isRealObject(null); // => false
   *
   */

  var isRealObject = curry(function(obj) {
    return isObject(obj) && !(isArray(obj) || isNull(obj));
  });


  /*
   * <apifunction>
   *
   * getType
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: string
   *
   * A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
   * the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".
   *
   * Examples:
   *   funkierJS.getType({}); // => "object"
   *
   */

  var getType = curry(function(val) {
    return typeof(val);
  });


  return {
    deepEqual: deepEqual,
    deepEquals: deepEqual,
    equals: equals,
    getType: getType,
    hasType: is,
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
    notEquals: notEqual,
    strictEquals: strictEquals,
    strictInequality: strictNotEqual,
    strictNotEqual: strictNotEqual,
    strictNotEquals: strictNotEqual
  };
})();

},{"./curry":2}],10:[function(require,module,exports){
module.exports = (function() {
  "use strict";

  /*
   * A collection of internal utilities. Not exported to consumers.
   *
   * These utilities are deliberately split out from those in utils.js. Some functions here
   * depend on arityOf from curry.js, and we want curry.js to be able to use the functions
   * in utils.
   *
   */


  var curryModule = require('./components/curry');
  var arityOf = curryModule.arityOf;


  /*
   * Takes a value. Throws a TypeError if the value is not a function, and possibly return the
   * function otherwise, after any optional checks.
   *
   * This function takes an optional options object. The following properties are recognised:
   *   - message: the message the TypeError should contain if it proves necessary to throw
   *   - arity: in isolation, will restrict to accepting functions of this arity
   *   - minimum: when true, changes the meaning of arity to be the minimum accepted
   *
   */

  var checkFunction = function(f, options) {
    options = options || {};
    var message = options.message || 'Value is not a function';
    var arity = 'arity' in options ? options.arity : null;
    var minimum = options.minimum || false;

    if (minimum && !options.message)
      message = 'Value is not a function of arity ≥ ' + arity;

    var maximum = options.maximum || false;
    if (maximum && !options.message)
      message = 'Value is not a function of arity ≤ ' + arity;

    if (typeof(f) !== 'function')
      throw new TypeError(message);

    if (arity !== null) {
      var fArity = arityOf(f);

      if ((minimum && fArity < arity) || (maximum && fArity > arity) || (!minimum && !maximum && fArity !== arity))
        throw new TypeError(message);
    }

    return f;
  };


  return {
    checkFunction: checkFunction
  };
})();

},{"./components/curry":2}],11:[function(require,module,exports){
module.exports = (function() {
  "use strict";


  var funkier = {};

  // Imports need to be explicit for browserify to find them
  var imports = {
    base: require('./components/base'),
    curry: require('./components/curry'),
    logical: require('./components/logical'),
    object: require('./components/object'),
    maths: require('./components/maths'),
    maybe: require('./components/maybe'),
    pair: require('./components/pair'),
    result: require('./components/result'),
    types: require('./components/types')
  };


  // Export our imports
  Object.keys(imports).forEach(function(mod) {
    var m = imports[mod];
    Object.keys(m).forEach(function(k) {
      if (k[0] === '_') return;

      funkier[k] = m[k];
    });
  });


  // Install auto-generated help
  require('./help')(funkier);


  return funkier;
})();
//(funcion() {
//  "use strict";
//
//
//  var makeModule = function(require, exports) {
//    var base = require('./base');
//    var logical = require('./logical');
//    var maths = require('./maths');
//    var object = require('./object');
//    var string = require('./string');
//    var fn = require('./fn');
//    var date = require('./date');
//    var pair = require('./pair');
//    var maybe = require('./maybe');
//    var result = require('./result');
//    var combinators = require('./combinators');
//    var array = require('./array');
//
//    var utils = require('./utils');
//    var help = utils.help;
//
//
//
//    // Also export help
//    exportedFns.help = help;
//
//
//    module.exports = exportedFns;
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

},{"./components/base":1,"./components/curry":2,"./components/logical":3,"./components/maths":4,"./components/maybe":5,"./components/object":6,"./components/pair":7,"./components/result":8,"./components/types":9,"./help":12}],12:[function(require,module,exports){
module.exports = (function() {
  "use strict";


  /* NOTE: THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT MANUALLY */


  return function(funkier) {
    var helpFn = function(value) {
      switch (value) {
        case helpFn:
          console.log('help:');
          console.log('Displays useful help for funkierJS API values');
          console.log('');
          console.log('Usage: help(f);');
          console.log('');
          console.log('Find full help online at https://graememcc.github.io/funkierJS/docs/');
          break;

        case funkier.Err:
          console.log('Err:');
          console.log('');
          console.log('An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.');
          console.log('Throws if called without any arguments');
          console.log('');
          console.log('Usage: var x = Err(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#err');
          break;

        case funkier.Just:
          console.log('Just:');
          console.log('');
          console.log('A Just is a type of Maybe representing a successful computation. The constructor is new-agnostic.');
          console.log('Throws when called with no arguments.');
          console.log('');
          console.log('Usage: var x = Just(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#just');
          break;

        case funkier.Maybe:
          console.log('Maybe:');
          console.log('');
          console.log('The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual');
          console.log('conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the');
          console.log('Nothing object when an error occurs, or the computation is otherwise unsuccessful.');
          console.log('');
          console.log('Usage: var x = Maybe()');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#maybe');
          break;

        case funkier.Nothing:
          console.log('Nothing:');
          console.log('');
          console.log('A Nothing is a type of Maybe representing an unsuccessful computation.');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#nothing');
          break;

        case funkier.Ok:
          console.log('Ok:');
          console.log('');
          console.log('An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.');
          console.log('Throws when called with no arguments.');
          console.log('');
          console.log('Usage: var x = Ok(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#ok');
          break;

        case funkier.Pair:
          console.log('Pair:');
          console.log('');
          console.log('A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a');
          console.log('new immutable tuple. The contents of the tuple can be accessed with the accessor functions fst and snd');
          console.log('respectively. The constructor is new-agnostic.');
          console.log('');
          console.log('Usage: var x = Pair(a, b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#pair');
          break;

        case funkier.Result:
          console.log('Result:');
          console.log('');
          console.log('The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either');
          console.log('datatype from Haskell, or the Result type from Rust.');
          console.log('');
          console.log('Usage: var x = Result()');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#result');
          break;

        case funkier.add:
          console.log('add:');
          console.log('');
          console.log('Synonyms: plus');
          console.log('');
          console.log('A wrapper around the addition operator.');
          console.log('');
          console.log('Usage: var x = add(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#add');
          break;

        case funkier.and:
          console.log('and:');
          console.log('');
          console.log('A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments');
          console.log('');
          console.log('Usage: var x = and(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#and');
          break;

        case funkier.andPred:
          console.log('andPred:');
          console.log('');
          console.log('Takes two unary predicate functions, and returns a new unary function that, when called, will call the original');
          console.log('functions with the given argument, and logically and their results, returning that value. Throws if either');
          console.log('argument is not a function of arity 1.');
          console.log('');
          console.log('Usage: var x = andPred(f1, f2)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#andpred');
          break;

        case funkier.arityOf:
          console.log('arityOf:');
          console.log('');
          console.log('Synonyms: arity');
          console.log('');
          console.log('Reports the real arity of a function. If the function has not been curried by funkier.js, this simply returns the');
          console.log('function\'s length property. For a function that has been curried, the arity of the original function will be');
          console.log('reported (the function\'s length property will always be 0 or 1 in this case). For a partially applied function,');
          console.log('the amount of arguments not yet supplied will be returned.');
          console.log('');
          console.log('Usage: var x = arityOf(f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#arityof');
          break;

        case funkier.asArray:
          console.log('asArray:');
          console.log('');
          console.log('Takes a pair, and returns a 2-element array containing the values contained in the given pair p. Specifically, if');
          console.log('the resulting array is named arr, then we have arr[0] === fst(p) and arr[1] === snd(p). Throws a TypeError if p is');
          console.log('not a pair.');
          console.log('');
          console.log('Usage: var x = asArray(p)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#asarray');
          break;

        case funkier.bind:
          console.log('bind:');
          console.log('');
          console.log('Synonyms: bindWithContext');
          console.log('');
          console.log('Given an object and function, returns a curried function with the same arity as the original, and whose execution');
          console.log('context is permanently bound to the supplied object. The function will be called when sufficient arguments have');
          console.log('been supplied. Superfluous arguments are discarded. It is possible to partially apply the resulting function, and');
          console.log('indeed the further resulting function(s). The resulting function and its partial applications will throw if they');
          console.log('require at least one argument, but are invoked without any. `bind` throws if the first parameter is not an');
          console.log('an acceptable type for an execution context, or if the last parameter is not a function.');
          console.log('');
          console.log('Usage: var x = bind(ctx, f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#bind');
          break;

        case funkier.bindWithContextAndArity:
          console.log('bindWithContextAndArity:');
          console.log('');
          console.log('Given an arity, object and function, returns a curried function whose execution context is permanently bound to');
          console.log('the supplied object, and whose arity equals the arity given. The supplied arity need not equal the function\'s');
          console.log('length. The function will be only called when the specified number of arguments have been supplied. Superfluous');
          console.log('arguments are discarded. It is possible to partially apply the resulting function, and indeed the further');
          console.log('resulting function(s). The resulting function and its partial applications will throw if they require at least');
          console.log('one argument, but are invoked without any. `bindWithContextAndArity` throws if the arity is not a natural');
          console.log('number, if the second parameter is not an acceptable type for an execution context, or if the last parameter is');
          console.log('not a function.');
          console.log('');
          console.log('Usage: var x = bindWithContextAndArity(n, ctx, f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#bindwithcontextandarity');
          break;

        case funkier.bitwiseAnd:
          console.log('bitwiseAnd:');
          console.log('');
          console.log('A wrapper around the bitwise and (&) operator.');
          console.log('');
          console.log('Usage: var x = bitwiseAnd(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#bitwiseand');
          break;

        case funkier.bitwiseNot:
          console.log('bitwiseNot:');
          console.log('');
          console.log('A wrapper around the bitwise not (~) operator.');
          console.log('');
          console.log('Usage: var x = bitwiseNot(x)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#bitwisenot');
          break;

        case funkier.bitwiseOr:
          console.log('bitwiseOr:');
          console.log('');
          console.log('A wrapper around the bitwise or (&) operator.');
          console.log('');
          console.log('Usage: var x = bitwiseOr(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#bitwiseor');
          break;

        case funkier.bitwiseXor:
          console.log('bitwiseXor:');
          console.log('');
          console.log('A wrapper around the bitwise xor (^) operator.');
          console.log('');
          console.log('Usage: var x = bitwiseXor(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#bitwisexor');
          break;

        case funkier.callProp:
          console.log('callProp:');
          console.log('');
          console.log('A shorthand for callPropWithArity(prop, 0). Returns a new function that takes an object, and calls the specified');
          console.log('property on the given object.');
          console.log('');
          console.log('Usage: var x = callProp(prop)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#callprop');
          break;

        case funkier.callPropWithArity:
          console.log('callPropWithArity:');
          console.log('');
          console.log('Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function');
          console.log('requires all the original arguments in their original order, and an object as its final parameter. The returned');
          console.log('function will then try to call the named property on the given object,');
          console.log('');
          console.log('Usage: var x = callPropWithArity(prop, arity)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#callpropwitharity');
          break;

        case funkier.clone:
          console.log('clone:');
          console.log('');
          console.log('Synonyms: shallowClone');
          console.log('');
          console.log('Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object');
          console.log('and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values');
          console.log('from Object.prototype, Array.prototype, will not be copied, but those prototypes will be in the prototype chain of');
          console.log('the clone if they are in the prototype chain of the original object. Functions are returned unchanged.');
          console.log('Non-primitive values are copied by reference.');
          console.log('');
          console.log('Usage: var x = clone(obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#clone');
          break;

        case funkier.compose:
          console.log('compose:');
          console.log('');
          console.log('Composes the two functions, returning a new function that consumes one argument, which is passed to `g`. The result');
          console.log('of that call is then passed to `f`. That result is then returned. Throws if either parameter is not a function, or');
          console.log('has arity 0.');
          console.log('');
          console.log('Usage: var x = compose(f, g)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#compose');
          break;

        case funkier.composeMany:
          console.log('composeMany:');
          console.log('');
          console.log('Repeatedly composes the given array of functions, from right to left. All functions are curried where necessary.');
          console.log('Functions are curried from right to left. Throws an Error if any array member is not a function, if it has arity');
          console.log('zero, or if the value supplied is not an array.');
          console.log('');
          console.log('Usage: var x = composeMany(fns)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#composemany');
          break;

        case funkier.composeOn:
          console.log('composeOn:');
          console.log('');
          console.log('Composes the two functions, returning a new function that consumes the specified number of arguments, which are');
          console.log('then passed to `g`. The result of that call is then passed to `f`. That result is then returned. Throws if the');
          console.log('first parameter is not an integer greater than zero, if either parameter is not a function, or if either parameter');
          console.log('has arity 0.');
          console.log('');
          console.log('Usage: var x = composeOn(argCount, f, g)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#composeon');
          break;

        case funkier.constant:
          console.log('constant:');
          console.log('');
          console.log('Intended to be partially applied, first taking a value, returning a function that takes another parameter');
          console.log('and which always returns the first value.');
          console.log('');
          console.log('Usage: var x = constant(a, b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#constant');
          break;

        case funkier.constant0:
          console.log('constant0:');
          console.log('');
          console.log('Returns a function of arity zero that when called always returns the supplied value.');
          console.log('');
          console.log('Usage: var x = constant0(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#constant0');
          break;

        case funkier.createObject:
          console.log('createObject:');
          console.log('');
          console.log('Returns a new object whose internal prototype property is the given object protoObject.');
          console.log('');
          console.log('Usage: var x = createObject(protoObject)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#createobject');
          break;

        case funkier.createObjectWithProps:
          console.log('createObjectWithProps:');
          console.log('');
          console.log('Creates an object whose internal prototype property is protoObj, and which has the additional properties described');
          console.log('in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the');
          console.log('form accepted by Object.create, Object.defineProperties etc.');
          console.log('');
          console.log('Usage: var x = createObjectWithProps(protoObject, descriptorsObject)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#createobjectwithprops');
          break;

        case funkier.createProp:
          console.log('createProp:');
          console.log('');
          console.log('Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating');
          console.log('o[prop] = value. The property will be not be modified if it already exists; in that case this method will throw.');
          console.log('Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be');
          console.log('successfully created when it already exists, but only in the prototype chain.');
          console.log('');
          console.log('Usage: var x = createProp(prop, val, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#createprop');
          break;

        case funkier.curry:
          console.log('curry:');
          console.log('');
          console.log('Curries the given function f, returning a function which accepts the same number of arguments as the original');
          console.log('function\'s length property, but which may be partially applied. The function can be partially applied by passing');
          console.log('arguments one at a time, or by passing several arguments at once. The function can also be called with more');
          console.log('arguments than the given function\'s length, but the superfluous arguments will be ignored, and will not be');
          console.log('passed to the original function. If the curried function or any subsequent partial applications require at least');
          console.log('one argument, then calling the function with no arguments will throw. `curry` throws if its argument is not a');
          console.log('function. It will also throw if the function is known to be bound to a specific execution context.');
          console.log('');
          console.log('Usage: var x = curry(f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#curry');
          break;

        case funkier.curryOwn:
          console.log('curryOwn:');
          console.log('');
          console.log('Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as');
          console.log('writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.');
          console.log('If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the');
          console.log('object\'s own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters');
          console.log('in their descriptor are ignored.');
          console.log('');
          console.log('Usage: var x = curryOwn(obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#curryown');
          break;

        case funkier.curryWithArity:
          console.log('curryWithArity:');
          console.log('');
          console.log('Curries the given function f to the supplied arity, which need not equal the function\'s length. The function will');
          console.log('be called when that number of arguments have been supplied. Superfluous arguments are discarded. The original');
          console.log('function will be called with a null execution context. It is possible to partially apply the resulting function,');
          console.log('and indeed the further resulting function(s). The resulting function and its partial applications will throw if');
          console.log('they require at least one argument, but are invoked without any. `curryWithArity` throws if the arity is not a');
          console.log('natural number, or if the second parameter is not a function. It will also throw if the given function is known');
          console.log('to be bound to a specific execution context.');
          console.log('');
          console.log('Usage: var x = curryWithArity(n, f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#currywitharity');
          break;

        case funkier.deepEqual:
          console.log('deepEqual:');
          console.log('');
          console.log('Synonyms: deepEquals');
          console.log('');
          console.log('Check two values for deep equality. Deep equality holds if any of the following if the two values are the same');
          console.log('object, if both values are objects with the same object, the same prototype, the same enumerable properties');
          console.log('and those properties are themselves deeply equal (non-enumerable properties are not checked), or if both values');
          console.log('are arrays with the same length, any additional properties installed on the arrays are deeply equal, and the items');
          console.log('at each index are themselves deeply equal.');
          console.log('');
          console.log('Usage: var x = deepEqual(a, b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#deepequal');
          break;

        case funkier.defineProperties:
          console.log('defineProperties:');
          console.log('');
          console.log('A curried wrapper around Object.defineProperties. Takes an object whose own properties map to property');
          console.log('descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the');
          console.log('properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.');
          console.log('');
          console.log('Usage: var x = defineProperties(descriptors, o)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#defineproperties');
          break;

        case funkier.defineProperty:
          console.log('defineProperty:');
          console.log('');
          console.log('A curried wrapper around Object.defineProperty. Takes a property name string, a property descriptor object and the');
          console.log('object that the property hould be defined on. Returns the object o, after having defined the relevant property');
          console.log('per the descriptor. Throws a TypeError if the descriptor is not an object.');
          console.log('');
          console.log('Usage: var x = defineProperty(prop, descriptor, o)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#defineproperty');
          break;

        case funkier.deleteProp:
          console.log('deleteProp:');
          console.log('');
          console.log('Deletes the given property from the given the given object, returning the object. Equivalent to evaluating');
          console.log('delete o[prop]. Throws when the property is not configurable, including when the object is frozen or sealed.');
          console.log('');
          console.log('Usage: var x = deleteProp(prop, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#deleteprop');
          break;

        case funkier.descriptors:
          console.log('descriptors:');
          console.log('');
          console.log('Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name');
          console.log('of a property from the object, and the second element is its property descriptor. This function only returns');
          console.log('key-value pairs for the object\'s own properties. Returns an empty array for non-objects.  The order of the values');
          console.log('is not defined.');
          console.log('');
          console.log('Usage: var x = descriptors(obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#descriptors');
          break;

        case funkier.div:
          console.log('div:');
          console.log('');
          console.log('Returns the quotient on dividing x by y.');
          console.log('');
          console.log('Usage: var x = div(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#div');
          break;

        case funkier.divide:
          console.log('divide:');
          console.log('');
          console.log('A wrapper around the division operator.');
          console.log('');
          console.log('Usage: var x = divide(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#divide');
          break;

        case funkier.either:
          console.log('either:');
          console.log('');
          console.log('Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will');
          console.log('be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called');
          console.log('with the unwrapped value. In either case, the result of of the called function is returned.');
          console.log('');
          console.log('Usage: var x = either(f1, f2, r)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#either');
          break;

        case funkier.equals:
          console.log('equals:');
          console.log('');
          console.log('A wrapper around the non-strict equality (==) operator.');
          console.log('');
          console.log('Usage: var x = equals(a, b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#equals');
          break;

        case funkier.even:
          console.log('even:');
          console.log('');
          console.log('Given a number, returns true if it is divisible by 2, and false otherwise.');
          console.log('');
          console.log('Usage: var x = even(x)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#even');
          break;

        case funkier.exp:
          console.log('exp:');
          console.log('');
          console.log('Synonyms: pow');
          console.log('');
          console.log('A curried wrapper around Math.pow.');
          console.log('');
          console.log('Usage: var x = exp(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#exp');
          break;

        case funkier.extend:
          console.log('extend:');
          console.log('');
          console.log('Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties');
          console.log('into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All');
          console.log('properties are shallow-copied: in other words, if \'foo\' is a property of source whose value is an object, then');
          console.log('afterwards source.foo === dest.foo will be true.');
          console.log('');
          console.log('Usage: var x = extend(source, dest)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#extend');
          break;

        case funkier.extendOwn:
          console.log('extendOwn:');
          console.log('');
          console.log('Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from');
          console.log('source\'s prototype chain are not copied. Any extant properties with the same name are overwritten.');
          console.log('Returns the modified dest object. All properties are shallow-copied: in other words, if \'foo\' is a property of');
          console.log('source whose value is an object, then afterwards source.foo === dest.foo will be true.');
          console.log('');
          console.log('Usage: var x = extendOwn(source, dest)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#extendown');
          break;

        case funkier.extract:
          console.log('extract:');
          console.log('');
          console.log('Synonyms: tap');
          console.log('');
          console.log('Extracts the given property from the given object. Equivalent to evaluating obj[prop].');
          console.log('');
          console.log('Usage: var x = extract(prop, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#extract');
          break;

        case funkier.extractOrDefault:
          console.log('extractOrDefault:');
          console.log('');
          console.log('Synonyms: defaultTap');
          console.log('');
          console.log('Extracts the given property from the given object, unless the property is not found in the object or its prototype');
          console.log('chain, in which case the specified default value is returned.');
          console.log('');
          console.log('Usage: var x = extractOrDefault(prop, default, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#extractordefault');
          break;

        case funkier.flip:
          console.log('flip:');
          console.log('');
          console.log('Takes a binary function f, and returns a curried function that takes the arguments in the opposite order.');
          console.log('');
          console.log('Usage: var x = flip(f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#flip');
          break;

        case funkier.fst:
          console.log('fst:');
          console.log('');
          console.log('Synonyms: first');
          console.log('');
          console.log('Accessor function for pair tuples. Returns the first value that was supplied to the pair constructor. Throws if');
          console.log('called with a non-pair value.');
          console.log('');
          console.log('Usage: var x = fst(p)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#fst');
          break;

        case funkier.getErrValue:
          console.log('getErrValue:');
          console.log('');
          console.log('Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an');
          console.log('Err.');
          console.log('');
          console.log('Usage: var x = getErrValue(e)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#geterrvalue');
          break;

        case funkier.getJustValue:
          console.log('getJustValue:');
          console.log('');
          console.log('Returns the value wrapped by the given Just instance j. Throws a TypeError if called with anything other than a');
          console.log('Just.');
          console.log('');
          console.log('Usage: var x = getJustValue(j)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#getjustvalue');
          break;

        case funkier.getOkValue:
          console.log('getOkValue:');
          console.log('');
          console.log('Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an');
          console.log('Ok.');
          console.log('');
          console.log('Usage: var x = getOkValue(o)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#getokvalue');
          break;

        case funkier.getOwnPropertyDescriptor:
          console.log('getOwnPropertyDescriptor:');
          console.log('');
          console.log('A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name and an object. If the object itself');
          console.log('has the given property, then the object\'s property descriptor for the given object is returned, otherwise it returns');
          console.log('undefined.');
          console.log('');
          console.log('Usage: var x = getOwnPropertyDescriptor(prop, o)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#getownpropertydescriptor');
          break;

        case funkier.getOwnPropertyNames:
          console.log('getOwnPropertyNames:');
          console.log('');
          console.log('A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an array containing the names of the');
          console.log('object\'s own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of');
          console.log('the property names is not defined.');
          console.log('');
          console.log('Usage: var x = getOwnPropertyNames(obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#getownpropertynames');
          break;

        case funkier.getType:
          console.log('getType:');
          console.log('');
          console.log('A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing');
          console.log('the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".');
          console.log('');
          console.log('Usage: var x = getType(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#gettype');
          break;

        case funkier.greaterThan:
          console.log('greaterThan:');
          console.log('');
          console.log('Synonyms: gt');
          console.log('');
          console.log('A wrapper around the less than or equal (<=) operator.');
          console.log('');
          console.log('Usage: var x = greaterThan(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#greaterthan');
          break;

        case funkier.greaterThanEqual:
          console.log('greaterThanEqual:');
          console.log('');
          console.log('Synonyms: gte');
          console.log('');
          console.log('A wrapper around the greater than or equal (=>) operator.');
          console.log('');
          console.log('Usage: var x = greaterThanEqual(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#greaterthanequal');
          break;

        case funkier.hasOwnProperty:
          console.log('hasOwnProperty:');
          console.log('');
          console.log('A curried wrapper around Object.prototype.hasOwnProperty. Takes a string representing a property name and an');
          console.log('object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified');
          console.log('property.');
          console.log('');
          console.log('Usage: var x = hasOwnProperty(prop, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#hasownproperty');
          break;

        case funkier.hasProperty:
          console.log('hasProperty:');
          console.log('');
          console.log('A curried wrapper around the \'in\' operator. Takes a string representing a property name and an object, and');
          console.log('returns true if the given object or some object in the prototype chain has the specified property.');
          console.log('');
          console.log('Usage: var x = hasProperty(prop, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#hasproperty');
          break;

        case funkier.id:
          console.log('id:');
          console.log('');
          console.log('Returns the supplied value. Superfluous values are ignored.');
          console.log('');
          console.log('Usage: var x = id(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#id');
          break;

        case funkier.instanceOf:
          console.log('instanceOf:');
          console.log('');
          console.log('A curried wrapper around the \'instanceof\' operator. Takes a constructor function and an object, and returns true');
          console.log('if the function\'s prototype property is in the prototype chain of the given object.');
          console.log('');
          console.log('Usage: var x = instanceOf(constructor, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#instanceof');
          break;

        case funkier.is:
          console.log('is:');
          console.log('');
          console.log('Synonyms: hasType');
          console.log('');
          console.log('Given a string that could be returned by the `typeof` operator, and a value, returns true if typeof the given');
          console.log('object equals the given string. Throws if the first argument is not a string.');
          console.log('');
          console.log('Usage: var x = is(type, value)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#is');
          break;

        case funkier.isArray:
          console.log('isArray:');
          console.log('');
          console.log('Returns true if the given value is an array, false otherwise');
          console.log('');
          console.log('Usage: var x = isArray(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isarray');
          break;

        case funkier.isBoolean:
          console.log('isBoolean:');
          console.log('');
          console.log('Returns true if typeof the given value equals "boolean", false otherwise.');
          console.log('');
          console.log('Usage: var x = isBoolean(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isboolean');
          break;

        case funkier.isErr:
          console.log('isErr:');
          console.log('');
          console.log('Returns true when the given value is a Err object, and false otherwise.');
          console.log('');
          console.log('Usage: var x = isErr(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#iserr');
          break;

        case funkier.isJust:
          console.log('isJust:');
          console.log('');
          console.log('Returns true if the given value is a Just object, and false otherwise.');
          console.log('');
          console.log('Usage: var x = isJust(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isjust');
          break;

        case funkier.isMaybe:
          console.log('isMaybe:');
          console.log('');
          console.log('Returns true when the given value is a Maybe object, and false otherwise.');
          console.log('');
          console.log('Usage: var x = isMaybe(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#ismaybe');
          break;

        case funkier.isNothing:
          console.log('isNothing:');
          console.log('');
          console.log('Returns true if the given value is the Nothing object, and false otherwise.');
          console.log('');
          console.log('Usage: var x = isNothing(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isnothing');
          break;

        case funkier.isNull:
          console.log('isNull:');
          console.log('');
          console.log('Returns true if the given object is null, false otherwise');
          console.log('');
          console.log('Usage: var x = isNull(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isnull');
          break;

        case funkier.isNumber:
          console.log('isNumber:');
          console.log('');
          console.log('Returns true if typeof the given value equals "number", false otherwise.');
          console.log('');
          console.log('Usage: var x = isNumber(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isnumber');
          break;

        case funkier.isObject:
          console.log('isObject:');
          console.log('');
          console.log('Returns true if typeof the given value equals "object", false otherwise.');
          console.log('');
          console.log('Usage: var x = isObject(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isobject');
          break;

        case funkier.isOk:
          console.log('isOk:');
          console.log('');
          console.log('Returns true when the given value is a Ok object, and false otherwise.');
          console.log('');
          console.log('Usage: var x = isOk(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isok');
          break;

        case funkier.isPair:
          console.log('isPair:');
          console.log('');
          console.log('Returns true if the given value is a Pair, and false otherwise.');
          console.log('');
          console.log('Usage: var x = isPair(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#ispair');
          break;

        case funkier.isPrototypeOf:
          console.log('isPrototypeOf:');
          console.log('');
          console.log('A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects: the prototype object, and the object');
          console.log('whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.');
          console.log('');
          console.log('Usage: var x = isPrototypeOf(protoObject, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isprototypeof');
          break;

        case funkier.isRealObject:
          console.log('isRealObject:');
          console.log('');
          console.log('Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`');
          console.log('and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.');
          console.log('');
          console.log('Usage: var x = isRealObject(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isrealobject');
          break;

        case funkier.isResult:
          console.log('isResult:');
          console.log('');
          console.log('Returns true when the given value is a Result object, and false otherwise.');
          console.log('');
          console.log('Usage: var x = isResult(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isresult');
          break;

        case funkier.isString:
          console.log('isString:');
          console.log('');
          console.log('Returns true if typeof the given value equals "string", false otherwise.');
          console.log('');
          console.log('Usage: var x = isString(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isstring');
          break;

        case funkier.isUndefined:
          console.log('isUndefined:');
          console.log('');
          console.log('Returns true if typeof the given value equals "undefined", false otherwise.');
          console.log('');
          console.log('Usage: var x = isUndefined(a)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#isundefined');
          break;

        case funkier.keyValues:
          console.log('keyValues:');
          console.log('');
          console.log('Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name');
          console.log('of a property from the object, and the second element is the value of the property. This function only returns');
          console.log('key-value pairs for the object\'s own properties. Returns an empty array for non-objects.  The order of the values');
          console.log('is not defined.');
          console.log('');
          console.log('Usage: var x = keyValues(obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#keyvalues');
          break;

        case funkier.keys:
          console.log('keys:');
          console.log('');
          console.log('A wrapper around Object.keys. Takes an object, and returns an array containing the names of the object\'s own');
          console.log('properties. Returns an empty array for non-objects.');
          console.log('');
          console.log('Usage: var x = keys(obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#keys');
          break;

        case funkier.leftShift:
          console.log('leftShift:');
          console.log('');
          console.log('A wrapper around the left shift (<<) operator.');
          console.log('');
          console.log('Usage: var x = leftShift(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#leftshift');
          break;

        case funkier.lessThan:
          console.log('lessThan:');
          console.log('');
          console.log('Synonyms: lt');
          console.log('');
          console.log('A wrapper around the less than (<) operator.');
          console.log('');
          console.log('Usage: var x = lessThan(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#lessthan');
          break;

        case funkier.lessThanEqual:
          console.log('lessThanEqual:');
          console.log('');
          console.log('Synonyms: lte');
          console.log('');
          console.log('A wrapper around the less than or equal (<=) operator.');
          console.log('');
          console.log('Usage: var x = lessThanEqual(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#lessthanequal');
          break;

        case funkier.log:
          console.log('log:');
          console.log('');
          console.log('Returns the logarithm of y in the given base x. Note that this function uses the change of base formula, so may');
          console.log('be subject to rounding errors.');
          console.log('');
          console.log('Usage: var x = log(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#log');
          break;

        case funkier.makeMaybeReturner:
          console.log('makeMaybeReturner:');
          console.log('');
          console.log('Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the');
          console.log('original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of');
          console.log('the function is wrapped in a Just and returned.');
          console.log('');
          console.log('Usage: var x = makeMaybeReturner(f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#makemaybereturner');
          break;

        case funkier.makeResultReturner:
          console.log('makeResultReturner:');
          console.log('');
          console.log('Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the');
          console.log('original. If the function f throws during execution, then the exception will be caught, and an Err object');
          console.log('wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.');
          console.log('');
          console.log('Usage: var x = makeResultReturner(f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#makeresultreturner');
          break;

        case funkier.max:
          console.log('max:');
          console.log('');
          console.log('A curried wrapper around Math.max. Takes exactly two arguments.');
          console.log('');
          console.log('Usage: var x = max(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#max');
          break;

        case funkier.maybeExtract:
          console.log('maybeExtract:');
          console.log('');
          console.log('Synonyms: safeExtract, maybeTap, safeTap');
          console.log('');
          console.log('Extracts the given property from the given object, and wraps it in a Just value. When the property is not present,');
          console.log('either in the object, or its prototype chain, then Nothing is returned.');
          console.log('');
          console.log('Usage: var x = maybeExtract(prop, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#maybeextract');
          break;

        case funkier.min:
          console.log('min:');
          console.log('');
          console.log('A curried wrapper around Math.min. Takes exactly two arguments.');
          console.log('');
          console.log('Usage: var x = min(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#min');
          break;

        case funkier.modify:
          console.log('modify:');
          console.log('');
          console.log('Synonyms: modifyProp');
          console.log('');
          console.log('Sets the given property to the given value on the given object, providing it exists, and returns the object.');
          console.log('Equivalent to evaluating o[prop] = value. The property will not be created when it doesn\'t exist on the object.');
          console.log('Throws when the property is not writable, when it has no setter function, or when the object is frozen.');
          console.log('');
          console.log('Usage: var x = modify(prop, val, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#modify');
          break;

        case funkier.multiply:
          console.log('multiply:');
          console.log('');
          console.log('A wrapper around the multiplication operator.');
          console.log('');
          console.log('Usage: var x = multiply(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#multiply');
          break;

        case funkier.not:
          console.log('not:');
          console.log('');
          console.log('A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.');
          console.log('');
          console.log('Usage: var x = not(b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#not');
          break;

        case funkier.notEqual:
          console.log('notEqual:');
          console.log('');
          console.log('Synonyms: notEquals');
          console.log('');
          console.log('A wrapper around the inequality (!=) operator.');
          console.log('');
          console.log('Usage: var x = notEqual(a, b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#notequal');
          break;

        case funkier.notPred:
          console.log('notPred:');
          console.log('');
          console.log('Takes a unary predicate function, and returns a new unary function that, when called, will call the original');
          console.log('function with the given argument, and return the negated result. Throws if f is not a function, or has an');
          console.log('arity other than 1.');
          console.log('');
          console.log('Usage: var x = notPred(f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#notpred');
          break;

        case funkier.objectCurry:
          console.log('objectCurry:');
          console.log('');
          console.log('Given a function, returns a curried function which calls the underlying with the execution context active when the');
          console.log('first arguments are supplied. This means that when partially applying the function, the resulting functions will');
          console.log('have their execution context permanently bound. This method of binding is designed for currying functions that');
          console.log('exist on an object\'s prototype. The function will be only called when sufficient arguments have been supplied.');
          console.log('Superfluous arguments are discarded. The resulting function and its partial applications will throw if they');
          console.log('require at least one argument, but are invoked without any. `objectCurry` throws if its parameter is not a');
          console.log('function. The resulting function will throw if invoked with an undefined execution context.');
          console.log('');
          console.log('Usage: var x = objectCurry(f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#objectcurry');
          break;

        case funkier.objectCurryWithArity:
          console.log('objectCurryWithArity:');
          console.log('');
          console.log('Given an arity and function, returns a curried function which calls the underlying with the execution context');
          console.log('active when the first arguments are supplied. This means that when partially applying the function, the');
          console.log('resulting functions will have their execution context permanently bound. This method of binding is designed for');
          console.log('currying functions that exist on an object\'s prototype. The function will be only called when the specified number');
          console.log('of arguments have been supplied. Superfluous arguments are discarded. The resulting function and its partial');
          console.log('applications throw if they require at least one argument, but are invoked without any. `objectCurryWithArity`');
          console.log('throws if the arity is not a natural number or if the second parameter is not a function. The resulting function');
          console.log('will throw if invoked with an undefined execution context.');
          console.log('');
          console.log('Usage: var x = objectCurryWithArity(n, f)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#objectcurrywitharity');
          break;

        case funkier.odd:
          console.log('odd:');
          console.log('');
          console.log('Given a number, returns true if it is not divisible by 2, and false otherwise.');
          console.log('');
          console.log('Usage: var x = odd(x)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#odd');
          break;

        case funkier.or:
          console.log('or:');
          console.log('');
          console.log('A wrapper around the logical or (||) operator. Returns the logical or of the given arguments');
          console.log('');
          console.log('Usage: var x = or(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#or');
          break;

        case funkier.orPred:
          console.log('orPred:');
          console.log('');
          console.log('Takes two unary predicate functions, and returns a new unary function that, when called, will call the original');
          console.log('functions with the given argument, and logically or their results, returning that value. Throws if either');
          console.log('argument is not a function of arity 1.');
          console.log('');
          console.log('Usage: var x = orPred(f1, f2)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#orpred');
          break;

        case funkier.rem:
          console.log('rem:');
          console.log('');
          console.log('A wrapper around the remainder (%) operator.');
          console.log('');
          console.log('Usage: var x = rem(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#rem');
          break;

        case funkier.rightShift:
          console.log('rightShift:');
          console.log('');
          console.log('A wrapper around the right shift (>>) operator.');
          console.log('');
          console.log('Usage: var x = rightShift(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#rightshift');
          break;

        case funkier.rightShiftZero:
          console.log('rightShiftZero:');
          console.log('');
          console.log('A wrapper around the left shift (>>>) operator.');
          console.log('');
          console.log('Usage: var x = rightShiftZero(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#rightshiftzero');
          break;

        case funkier.safeCreateProp:
          console.log('safeCreateProp:');
          console.log('');
          console.log('Synonyms: maybeCreate');
          console.log('');
          console.log('Creates the given property to the given value on the given object, returning the object wrapped in a Just.');
          console.log('Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in');
          console.log('that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or');
          console.log('cannot be extended. Note that the property will be successfully created when it already exists, but only in the');
          console.log('prototype chain.');
          console.log('');
          console.log('Usage: var x = safeCreateProp(prop, val, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#safecreateprop');
          break;

        case funkier.safeDeleteProp:
          console.log('safeDeleteProp:');
          console.log('');
          console.log('Synonyms: maybeDelete');
          console.log('');
          console.log('Deletes the given property from the given the given object, returning the object wrapped as a Just value.');
          console.log('Equivalent to evaluating delete o[prop]. When the property is not configurable (either due to the individual');
          console.log('descriptor or the object being frozen or sealed) then Nothing will be returned.');
          console.log('');
          console.log('Usage: var x = safeDeleteProp(prop, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#safedeleteprop');
          break;

        case funkier.safeModify:
          console.log('safeModify:');
          console.log('');
          console.log('Synonyms: maybeModify, maybeModifyProp, safeModifyProp');
          console.log('');
          console.log('Sets the given property to the given value on the given object, providing it exists, and returns the object,');
          console.log('wrapped in a Just value when successful. Equivalent to evaluating o[prop] = value. The property will not be');
          console.log('created when it doesn\'t exist on the object; nor will it be amended when the property is not writable, when it');
          console.log('has no setter function, or when the object is frozen. In such cases, Nothing will be returned.');
          console.log('');
          console.log('Usage: var x = safeModify(prop, val, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#safemodify');
          break;

        case funkier.safeSet:
          console.log('safeSet:');
          console.log('');
          console.log('Synonyms: maybeSet, maybeSetProp, safeSetProp');
          console.log('');
          console.log('Sets the given property to the given value on the given object, returning the object wrapped in a Just value when');
          console.log('successful. Equivalent to evaluating o[prop] = value. The property will be created if it doesn\'t exist on the');
          console.log('object. If unable to modify or create the property, then Nothing will be returned.');
          console.log('');
          console.log('Usage: var x = safeSet(prop, val, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#safeset');
          break;

        case funkier.sectionLeft:
          console.log('sectionLeft:');
          console.log('');
          console.log('Partially applies the binary function f with the given argument x, with x being supplied as the first argument');
          console.log('to f. The given function f will be curried if necessary. Throws if f is not a binary function.');
          console.log('');
          console.log('Usage: var x = sectionLeft(f, x)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#sectionleft');
          break;

        case funkier.sectionRight:
          console.log('sectionRight:');
          console.log('');
          console.log('Partially applies the binary function f with the given argument x, with x being supplied as the second argument');
          console.log('to f. The given function f will be curried if necessary. Throws if f is not a binary function.');
          console.log('');
          console.log('Usage: var x = sectionRight(f, x)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#sectionright');
          break;

        case funkier.set:
          console.log('set:');
          console.log('');
          console.log('Synonyms: setProp');
          console.log('');
          console.log('Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating');
          console.log('o[prop] = value. The property will be created if it doesn\'t exist on the object. Throws when the property is');
          console.log('not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property');
          console.log('is not already present.');
          console.log('');
          console.log('Usage: var x = set(prop, val, obj)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#set');
          break;

        case funkier.snd:
          console.log('snd:');
          console.log('');
          console.log('Synonyms: second');
          console.log('');
          console.log('Accessor function for pair tuples. Returns the second value that was supplied to the pair constructor. Throws if');
          console.log('called with a non-pair value.');
          console.log('');
          console.log('Usage: var x = snd(p)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#snd');
          break;

        case funkier.strictEquals:
          console.log('strictEquals:');
          console.log('');
          console.log('A wrapper around the strict equality (===) operator.');
          console.log('');
          console.log('Usage: var x = strictEquals(a, b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#strictequals');
          break;

        case funkier.strictNotEqual:
          console.log('strictNotEqual:');
          console.log('');
          console.log('Synonyms: strictNotEquals, strictInequality');
          console.log('');
          console.log('A wrapper around the strict inequality (!==) operator.');
          console.log('');
          console.log('Usage: var x = strictNotEqual(a, b)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#strictnotequal');
          break;

        case funkier.subtract:
          console.log('subtract:');
          console.log('');
          console.log('A wrapper around the subtraction operator.');
          console.log('');
          console.log('Usage: var x = subtract(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#subtract');
          break;

        case funkier.xor:
          console.log('xor:');
          console.log('');
          console.log('A wrapper around the logical xor operator. Returns the logical xor of the given arguments');
          console.log('');
          console.log('Usage: var x = xor(x, y)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#xor');
          break;

        case funkier.xorPred:
          console.log('xorPred:');
          console.log('');
          console.log('Takes two unary predicate functions, and returns a new unary function that, when called, will call the original');
          console.log('functions with the given argument, and logically xor their results, returning that value. Throws if either');
          console.log('argument is not a function of arity 1.');
          console.log('');
          console.log('Usage: var x = xorPred(f1, f2)');
          console.log('');
          console.log('See https://graememcc.github.io/funkierJS/docs/index.html#xorpred');
          break;

        default:
          console.log('No help available');
      }
    };

    funkier.help = helpFn;
  };
})();

},{}],13:[function(require,module,exports){
module.exports = (function() {
  "use strict";


  /* checkIntegral: Takes a value and an optional options object. In the following circumstances it will return
   *                the supplied value (coerced to an integer if necessary):
   *                  - The value is an integer.
   *                  - The value can be coerced to an integer, and the options object does not contain a property
   *                    named "strict" that coerces to true.
   *
   *                For all other values, a TypeError will be thrown. The message of the TypeError can be specified
   *                by including an "errorMessage" property in the options object.
   *
   */

  var checkIntegral = function(n, options) {
    options = options || {};
    var message = options.errorMessage || 'Value is not an integer';

    if (options.strict && typeof(n) !== 'number')
      throw new TypeError(message);

    n = n - 0;

    if (isNaN(n) || !isFinite(n))
      throw new TypeError(message);

    if (n !== Math.round(n))
      throw new TypeError(message);

    return n;
  };


  /* checkPositiveIntegral: Takes a value and an optional options object. In the following circumstances it will return
   *                        the supplied value (coerced to an integer if necessary):
   *                          - The value is a positive integer.
   *                          - The value can be coerced to a positive integer, and the options object does not contain
   *                            a property named "strict" that coerces to true.
   *
   *                        For all other values, a TypeError will be thrown. The message of the TypeError can be
   *                        specified by including an "errorMessage" property in the options object.
   *
   */

  var checkPositiveIntegral = function(n, options) {
    options = options || {};
    var message = options.errorMessage || 'Value is not a positive integer';
    // Don't mutate the supplied options
    var newOptions = Object.create(options);
    newOptions.errorMessage = message;
    n = checkIntegral(n, newOptions);

    if (n < 0)
      throw new TypeError(message);

    return n;
  };


  /*
   * isObjectLike: returns true if the given value is a string, array, function, or object,
   *               and false otherwise.
   *
   */

  var isObjectLike = function(v, options) {
    options = options || {};
    var strict = options.strict || false;
    var allowNull = options.allowNull || false;

    var acceptable = strict ? ['object'] : ['string', 'function', 'object'];
    if (strict && Array.isArray(v))
      return false;

    return (v === null && allowNull) || (v !== null && acceptable.indexOf(typeof(v)) !== -1);
  };


  /* checkObjectLike: takes a value and throws if it is not object-like, otherwise returns the object
   *
   */

  var checkObjectLike = function(v, options) {
    options = options || {};
    var message = options.message || 'Value is not an object';
    var allowNull = options.allowNull || false;

    if (!isObjectLike(v, options))
      throw new TypeError(message);

    return v;
  };


  /*
   * isArrayLike: returns true if the given value is a string, array, or 'array-like', and false otherwise.
   *              Takes an optional 'noStrings' argument: strings will not be considered 'array-like' when
   *              this is true.
   *
   */

  var isArrayLike = function(v, noStrings) {
    noStrings = noStrings || false;

    if (typeof(v) === 'string')
      return !noStrings;

    if (typeof(v) !== 'object' || v === null)
      return false;

    if (Array.isArray(v))
      return true;

    if (!v.hasOwnProperty('length'))
      return false;

    var l = v.length;

    return l === 0 || (v.hasOwnProperty('0') && v.hasOwnProperty('' + (l - 1)));
  };


  /*
   * valueStringifier: Returns a string representation of the given value.
   *
   */

  var valueStringifier = function(v) {
    switch (typeof(v)) {
      case 'number':
      case 'boolean':
      case 'undefined':
        return '' + v;
      case 'string':
        return '\'' + v + '\'';
      case 'function':
        return v.toString();
      case 'object':
        if (v === null)
          return 'null';
        if (Array.isArray(v))
          return '[' + v.join(', ') + ']';
        return '{' + v.toString() + '}';
      default:
        return v.toString();
    }
  };


  return {
    checkIntegral: checkIntegral,
    checkObjectLike: checkObjectLike,
    checkPositiveIntegral: checkPositiveIntegral,
    isArrayLike: isArrayLike,
    isObjectLike: isObjectLike,
    valueStringifier: valueStringifier
  };
})();
//(function() {
//  // Double scope: we want this code to execute in a non-strict environment where this points to the global
//  var global = this;
//
//
//  return function() {
//    "use strict";
//
//
//    /*
//     * A collection of internal utilities. Not exported to consumers.
//     *
//     */
//
//
//    var makeModule = function(require, exports) {
//      /* checkArrayLike: takes a value and throws if it is not array-like, otherwise
//       *                 return a copy.
//       *
//       */
//
//      var checkArrayLike = function(v, options) {
//        options = options || {};
//        var message = options.message || 'Value is not a string or array';
//
//        if (!isArrayLike(v, options.noStrings))
//          throw new TypeError(message);
//
//        // We allow an optional 'dontSlice' option for arrays and arraylikes. For example,
//        // when implementing length, there is no need to copy the object, we can just read
//        // the property
//        if (typeof(v) === 'string' || ('dontSlice' in options && options.dontSlice))
//          return v;
//
//        return [].slice.call(v);
//      };
//
//
//      var exported = {
//        checkArrayLike: checkArrayLike,
//        checkIntegral: checkIntegral,
//        checkObjectLike: checkObjectLike,
//        checkPositiveIntegral: checkPositiveIntegral,
//        isArrayLike: isArrayLike,
//        isObjectLike: isObjectLike,
//        valueStringifier: valueStringifier
//      };
//
//
//      module.exports = exported;
//    };
//
//
//    // AMD/CommonJS foo
//    if (typeof(define) === "function") {
//      define(function(require, exports, module) {
//        makeModule(require, exports, module);
//      });
//    } else {
//      makeModule(require, exports, module);
//    }
//    }();
//})();

},{}]},{},[11])(11)
});