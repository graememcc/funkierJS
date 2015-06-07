module.exports = (function () {
  "use strict";

  var checkPositiveIntegral = require('../internalUtilities').checkPositiveIntegral;

  // Property that will be installed on all curried functions reflecting 'real' arity.
  var arityProp = '_trueArity';

  // Property that will be installed on curried functions that have not been partially applied
  var uncurriedProp = '_getOriginal';

  // Property that records the context with which the function was curried
  var contextProp = '_context';

  // Indicator that a function has been object curried but not yet acquired a context
  var objectCurryContext = {};


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

    // We can't use checkFunction from the funcUtils module here: it depends on the base module, which in turn depends
    // on this module
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
        if (callContext === objectCurryContext) {
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

      // Throw if we expected arguments and didn't receive any, unless the function was objectCurried, in which case
      // we allow such a call to establish the execution context
      if (args.length === 0) {
        if (callContext === objectCurryContext) {
          if (this === undefined)
            throw new Error('Object curried function called without a context');
          return curryInternal(this, length, fn);
        }

        var errText = length === 1 ? '1 argument' : ('1 - ' + length + ' arguments');
        throw new Error('This function requires ' + errText);
      }

      // Acquire context if object-curried
      if (callContext === objectCurryContext) {
        if (this === undefined)
          throw new Error('Object curried function called without a context');

        callContext = this;
      }

      // If we have more arguments than we need, drop the extra ones on the floor
      // (the function will be called when we fall through to the next conditional)
      if (args.length > length)
        args = args.slice(0, length);

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
   * one argument. (Note: funkierJS provides a [`parseInt`](#parseInt) function for this purpose).
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
   * Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
   * will curry the result in the same manner as the supplied functions, or otherwise will curry them using
   * [`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
   * when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
   * This limitation may be removed in future versions of the library.
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
   * Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
   * will curry the result in the same manner as the supplied functions, or otherwise will curry them using
   * [`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
   * when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
   * This limitation may be removed in future versions of the library.
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
   * Superfluous arguments are discarded. The resulting function may be called without any arguments even when it has
   * non-zero arity, for the purposes of establishing an execution context (usually when passing the function to some
   * other function-manipulating function); however the partial applications of the result will throw if they
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
   * Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
   * will curry the result in the same manner as the supplied functions, or otherwise will curry them using
   * [`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
   * when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
   * This limitation may be removed in future versions of the library.
   *
   * In certain cases, `objectCurry` can be used to curry constructors; the requirement is that the constructor is
   * **not** new-agnostic. (This may be fixed in future versions). Note that the instanceof relation will not hold
   * for any partially applied functions created along the way.
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
   * of arguments have been supplied. Superfluous arguments are discarded. If the resulting function has non-zero
   * length, it may be called without any arguments for the purpose of establishing an execution context; however
   * its partial applications throw if they require at least one argument, but are invoked without any.
   * `objectCurryWithArity` throws if the arity is not a natural number or if the second parameter is not a function.
   * The resulting function will throw if invoked with an undefined execution context.
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
   * Note also that many of the function manipulating functions, such as [`flip`](#flip), [`compose`](#compose) etc.
   * will curry the result in the same manner as the supplied functions, or otherwise will curry them using
   * [`curry`](#curry). As noted above, functions curried by `curry` cannot then be recurried by this function. Thus
   * when performing such manipulations, one must curry them in the desired manner first, before manipulating them.
   * This limitation may be removed in future versions of the library.
   *
   * In certain cases, `objectCurryWithArity` can be used to curry constructors; the requirement is that the
   * constructor is **not** new-agnostic. (This may be fixed in future versions). Note that the instanceof relation
   * will not hold for any partially applied functions created along the way.
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
  var objectCurryWithArity = curry(curryInternal.bind(null, objectCurryContext));


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
    return curryInternal(existing.hasOwnProperty(contextProp) ? existing[contextProp] : null, arity, newFn);
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
    if (contexts.indexOf(objectCurryContext) !== -1) {
      contextToApply = objectCurryContext;
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
