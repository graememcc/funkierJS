module.exports = (function() {
  "use strict";
//
//
//  var makeModule = function(require, exports) {
//    var curryModule = require('./curry');
  var curry = require('./curry').curry;
//    var getRealArity = curryModule.getRealArity;
//
//    var funcUtils = require('./funcUtils');
//    var checkFunction = funcUtils.checkFunction;
//
//    var utils = require('./utils');
//    var defineValue = utils.defineValue;


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
//
//
//    var notPred = defineValue(
//      'name: notPred',
//      'signature: f: function',
//      'classification: logical',
//      '',
//      'Takes a unary predicate function, and returns a new unary function that, when',
//      'called, will call the original function with the given argument, and return the',
//      'negated result.',
//      '',
//      'Throws a TypeError if f is not a function, or if it has an arity other than 1.',
//      '--',
//      'var c = constant(true);',
//      'var f = notPred(c);',
//      'f("foo"); // false',
//      curry(function(pred) {
//        pred = checkFunction(pred, {arity: 1, message: 'Predicate must be a function of arity 1'});
//
//        return curry(function(x) {
//          return !pred(x);
//        });
//      })
//    );
//
//
//    var andPred = defineValue(
//      'name: andPred',
//      'signature: f: function, g: function',
//      'classification: logical',
//      '',
//      'Takes two unary predicate functions, and returns a new unary function that, when',
//      'called, will call the original functions with the given argument, and and their',
//      'results, returning this value.',
//      '',
//      'Throws a TypeError if either argument is not a function of arity 1.',
//      '--',
//      'var c = constant(true);',
//      'var d = constant(false);',
//      'var f = andPred(c, d);',
//      'f("foo"); // false',
//      curry(function(pred1, pred2) {
//        pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
//        pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});
//
//        return curry(function(x) {
//          return pred1(x) && pred2(x);
//        });
//      })
//    );
//
//
//    var orPred = defineValue(
//      'name: orPred',
//      'signature: f: function, g: function',
//      'classification: logical',
//      '',
//      'Takes two unary predicate functions, and returns a new unary function that, when',
//      'called, will call the original functions with the given argument, and or their',
//      'results, returning this value.',
//      '',
//      'Throws a TypeError if either argument is not a function of arity 1.',
//      '--',
//      'var c = constant(true);',
//      'var d = constant(false);',
//      'var f = orPred(c, d);',
//      'f("foo"); // true',
//      curry(function(pred1, pred2) {
//        pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
//        pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});
//
//        return curry(function(x) {
//          return pred1(x) || pred2(x);
//        });
//      })
//    );
//
//
//    var xorPred = defineValue(
//      'name: xorPred',
//      'signature: f: function, g: function',
//      'classification: logical',
//      '',
//      'Takes two unary predicate functions, and returns a new unary function that, when',
//      'called, will call the xoriginal functions with the given argument, and xor their',
//      'results, returning this value.',
//      '',
//      'Throws a TypeErrxor if either argument is not a function of arity 1.',
//      '--',
//      'var c = constant(true);',
//      'var d = constant(true);',
//      'var f = xorPred(c, d);',
//      'f("foo"); // false',
//      curry(function(pred1, pred2) {
//        pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
//        pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});
//
//        return curry(function(x) {
//          return xor(pred1(x), pred2(x));
//        });
//      })
//    );
//
//
//    var exported = {
//      andPred: andPred,
//      notPred: notPred,
//      orPred: orPred,
//      xorPred: xorPred
//    };
//
//
//    module.exports = exported;
//  };

  return {
    and: and,
    not: not,
    or:   or,
    xor: xor
  };
})();
