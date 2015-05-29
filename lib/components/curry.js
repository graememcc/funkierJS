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


  var curryInternal = function(options, length, fn) {
    length = checkPositiveIntegral(length, {strict: true});

    // We can't use checkFunction from the funcUtils module here: it depends on the base module, which in turn depends on
    // this module
    if (typeof(fn) !== 'function')
      throw new TypeError('Value to be curried is not a function');

    // Check function hasn't already been curried using a different mechanism
    var context = fn.hasOwnProperty(contextProp) ? fn[contextProp] : options.context;
    if (context !== options.context)
      throw new Error('Cannot bind function to a different execution context');

    if (fn.hasOwnProperty(arityProp) && fn[arityProp] === length)
      return fn;

    fn = fn.hasOwnProperty(uncurriedProp) ? fn[uncurriedProp] : fn;

    // Handle the special case of length 0
    if (length === 0) {
       var result = function() {
        // Don't simply return fn: need to discard any arguments
        return fn.apply(context);
      };

      Object.defineProperty(result, arityProp, {value: 0});
      Object.defineProperty(result, uncurriedProp, {value: fn});
      Object.defineProperty(result, contextProp, {value: options.context});
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
        return fn.apply(context, args);

      // We don't have enough arguments. Bind those that we already have
      var newFn = fn.bind.apply(fn, [context].concat(args));
      var argsNeeded = length - args.length;

      // Continue currying if we can't yet return a function of length 1
      if (argsNeeded > 1)
        return curryInternal({context: context}, argsNeeded, newFn);

      // The trivial case
      var trivial = function(b) {
        return newFn(b);
      };

      Object.defineProperty(trivial, arityProp, {value: 1});
      Object.defineProperty(trivial, context, {value: context});
      Object.defineProperty(trivial, uncurriedProp, {value: newFn});
      return trivial;
    };

    Object.defineProperty(curried, arityProp, {value: length});
    Object.defineProperty(curried, uncurriedProp, {value: fn});
    Object.defineProperty(curried, contextProp, {value: context});
    return curried;
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
   * It is possible to recurry functions that have been previously curried with [`curry`](#curry) or `curryWithArity`,
   * however generally it only makes sense to recurry a function that has not been partially applied: this will be
   * equivalent to currying the original function. Recurrying a partially applied function will likely not work as you
   * expect: the new function will be one that requires the given number of arguments before calling the original
   * function with the partially applied arguments and some of the ones supplied to the recurried function.
   *
   * You cannot however pass in functions that have been bound to a specific execution context using
   * [`bindWithContextAndArity`](#bindWithContextAndArity): `curryWithArity` promises to invoke functions with a null
   * execution context, but those functions have a fixed execution context that cannot be overridden. An error is
   * thrown if the function has been bound to an execution context in this way.
   *
   * Note however that funkierJS has no visibility into the execution contexts of functions bound using the native
   * function `bind` method. Attempting to curry these might lead to surprising results, and should be avoided.
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


  var curryWithArity = curryInternal.bind(null, {context: null});


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
   * function.
   *
   * Currying a function that has already been curried will return the exact same function.
   *
   * The returned function will have a length of 1, unless the original function will have length 0, in which case
   * the result also has length 0. Note that when currying functions of length 0 and 1 that the results will be
   * different functions from those passed in.
   *
   * If you need a function which accepts an argument count that differs from the function's length property,
   * use `curryWithArity`.
   *
   * Note that you cannot pass in functions that have been bound to a specific execution context using
   * [`bindWithContextAndArity`](#bindWithContextAndArity): allowing those would break the invariant that functions
   * curried with `curry` are invoked with a null execution context. Thus an error is thrown in such cases. (However,
   * funkierJS cannot tell if a function has been bound with the native `bind` method. Currying such functions might
   * lead to unexpected results).
   *
   * Examples:
   *   var f = function(x, y, z) { console.log(x, y, z); }
   *
   *   var g = curry(f);
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
   *   curry(g) === g;  // => true
   *
   */

  // TODO: Revisit the line  * Currying a function that has already been curried will return the exact same function.
  //       once other currying mechanisms have been added
  // TODO: Revisit comments about other execution contexts once other currying mechanisms have been defined
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
   *   arityOf(function(x) {}); // => 1;
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
   * the supplied execution context.
   *
   * Curries the given function f to the supplied arity, which need not equal the function's length, and permanently
   * binds the resulting function to the supplied execution context. The function will be called when that number of
   * arguments have been supplied. Superfluous arguments are discarded. It is possible to partially apply the resulting
   * function, and indeed the further resulting function(s). The resulting function and its partial applications will
   * throw if they require at least one argument, but are invoked without any. `bindWithContextAndArity` throws if the
   * arity is not a natural number, if the second parameter is not an acceptable type for an execution context, or if
   * the last parameter is not a function.
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
   * have already been bound with an implicit `null` execution context. `bindWithContextAndArity` will throw in that
   * case.
   *
   * Unfortunately, funkierJS has no visibility into functions bound with the native `bind` method; attempting to
   * curry such functions won't throw, but they will not work as expected.
   *
   * Examples:
   *   var obj = {foo: 42};
   *
   *   var f = function(x, y) { return this.foo + x; };
   *
   *   var g = bindWithContextAndArity(1, obj, f);
   *
   *   g(3); // returns 45
   *
   *   var h = bindWithContextAndArity(3, obj, g); // OK, same context object
   *   h(2)(3, 4); // returns 44
   *
   *   var err = bindWithContextAndArity(2, {foo: 1}, g); // throws: execution contexts don't match
   *
   *   var ok = bindWithContextAndArity(2, {foo: 1}, f); // still ok to bind the original function though
   *
   */

  var bindWithContextAndArity = curry(function(arity, context, fn) {
    return curryInternal({context: context}, arity, fn);
  });

  return {
    arity: arityOf,
    arityOf: arityOf,
    bindWithContextAndArity: bindWithContextAndArity,
    curry: curry,
    curryWithArity: curryWithArity
  };
})();
