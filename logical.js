(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;
    var getRealArity = curryModule.getRealArity;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;


    /*
     * not: returns the boolean negation of the given argument
     *
     */

    var not = curry(function(x) {
      return !x;
    });


    /*
     * and: returns and (&&) applied to the given arguments.
     *      Note: due to eager evaluation, this will not short-circuit.
     *
     */

    var and = curry(function(x, y) {
      return x && y;
    });


    /*
     * or: returns or (||) applied to the given arguments.
     *     Note: due to eager evaluation, this will not short-circuit.
     *
     */

    var or = curry(function(x, y) {
      return x || y;
    });


    /*
     * xor: returns logical xor of the given arguments.
     *
     */

    var xor = curry(function(x, y) {
      return x == y ? false : true;
    });


    /*
     * notPred: takes an unary predicate function, and returns a new unary function that calls
     *          the original function with the given argument, and returns the negation of the result
     *
     */

    var notPred = function(pred) {
      pred = checkFunction(pred, {arity: 1, message: 'Predicate must be a function of arity 1'});

      return curry(function(x) {
        return !pred(x);
      });
    };


    /*
     * andPred: takes two unary predicate functions, and returns a new unary function that returns true
     *          only if both the supplied predicates return true for the given argument. It will short-circuit:
     *          when the first predicate function returns false, the second will not be called.
     *
     */

    var andPred = curry(function(pred1, pred2) {
      pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
      pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

      return curry(function(x) {
        return pred1(x) && pred2(x);
      });
    });


    /*
     * orPred: takes two unary predicate functions, and returns a new unary function that returns true
     *         if one or both the supplied predicates return true for the given argument. It will short-circuit:
     *         when the first predicate function returns true, the second will not be called.
     *
     */

    var orPred = curry(function(pred1, pred2) {
      pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
      pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

      return curry(function(x) {
        return pred1(x) || pred2(x);
      });
    });


    /*
     * xorPred: takes two unary predicate functions, and returns a new unary function that returns true
     *          if exactly one of the supplied predicates return true for the given argument.
     *
     */

    var xorPred = curry(function(pred1, pred2) {
      pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
      pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

      return curry(function(x) {
        return xor(pred1(x), pred2(x));
      });
    });


    var exported = {
      and: and,
      andPred: andPred,
      not: not,
      notPred: notPred,
      or: or,
      orPred: orPred,
      xor: xor,
      xorPred: xorPred
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
