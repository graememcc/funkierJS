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
   *  var f = funkierJS.orPred(c, d);',
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
