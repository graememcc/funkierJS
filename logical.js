(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;
    var getRealArity = curryModule.getRealArity;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;

    var utils = require('./utils');
    var defineValue = utils.defineValue;


    var not = defineValue(
      'name: not',
      'signature: x: boolean',
      'classification: logical',
      '',
      'A wrapper around the logical not (!) operator. Returns the logical negation of the given argument.',
      '--',
      'not(true); // false',
      curry(function(x) {
      return !x;
      })
    );


    var and = defineValue(
      'name: and',
      'signature: x: boolean, y: boolean',
      'classification: logical',
      '',
      'A wrapper around the logical and (&&) operator. Returns the logical and of the given arguments.',
      '--',
      'and(false, true); // false',
      curry(function(x, y) {
        return x && y;
      })
    );


    var or = defineValue(
      'name: or',
      'signature: x: boolean, y: boolean',
      'classification: logical',
      '',
      'A wrapper around the logical o& (||) operator. Returns the logical or of the given arguments.',
      '--',
      'or(false, true); // true',
      curry(function(x, y) {
        return x || y;
      })
    );


    var xor = defineValue(
      'name: xor',
      'signature: x: boolean, y: boolean',
      'classification: logical',
      '',
      'Returns the logical xor of the given arguments.',
      '--',
      'xor(false, true); // true',
      'xor(true, true); // false',
      curry(function(x, y) {
        return x == y ? false : true;
      })
    );


    var notPred = defineValue(
      'name: notPred',
      'signature: f: function',
      'classification: logical',
      '',
      'Takes a unary predicate function, and returns a new unary function that, when called, will call',
      'the original function with the given argument, and return the negated result.',
      '',
      'Throws a TypeError if f is not a function, or if it has an arity other than 1.',
      '--',
      'var c = constant(true);',
      'var f = notPred(c);',
      'f("foo"); // false',
      curry(function(pred) {
        pred = checkFunction(pred, {arity: 1, message: 'Predicate must be a function of arity 1'});

        return curry(function(x) {
          return !pred(x);
        });
      })
    );


    var andPred = defineValue(
      'name: andPred',
      'signature: f: function, g: function',
      'classification: logical',
      '',
      'Takes two unary predicate functions, and returns a new unary function that, when called, will call',
      'the original functions with the given argument, and and their results, returning this value.',
      '',
      'Throws a TypeError if either argument is not a function of arity 1.',
      '--',
      'var c = constant(true);',
      'var d = constant(false);',
      'var f = andPred(c, d);',
      'f("foo"); // false',
      curry(function(pred1, pred2) {
        pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
        pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

        return curry(function(x) {
          return pred1(x) && pred2(x);
        });
      })
    );


    var orPred = defineValue(
      'name: orPred',
      'signature: f: function, g: function',
      'classification: logical',
      '',
      'Takes two unary predicate functions, and returns a new unary function that, when called, will call',
      'the original functions with the given argument, and or their results, returning this value.',
      '',
      'Throws a TypeError if either argument is not a function of arity 1.',
      '--',
      'var c = constant(true);',
      'var d = constant(false);',
      'var f = orPred(c, d);',
      'f("foo"); // true',
      curry(function(pred1, pred2) {
        pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
        pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

        return curry(function(x) {
          return pred1(x) || pred2(x);
        });
      })
    );


    var xorPred = defineValue(
      'name: xorPred',
      'signature: f: function, g: function',
      'classification: logical',
      '',
      'Takes two unary predicate functions, and returns a new unary function that, when called, will call',
      'the xoriginal functions with the given argument, and xor their results, returning this value.',
      '',
      'Throws a TypeErrxor if either argument is not a function of arity 1.',
      '--',
      'var c = constant(true);',
      'var d = constant(true);',
      'var f = xorPred(c, d);',
      'f("foo"); // false',
      curry(function(pred1, pred2) {
        pred1 = checkFunction(pred1, {arity: 1, message: 'First predicate must be a function of arity 1'});
        pred2 = checkFunction(pred2, {arity: 1, message: 'Second predicate must be a function of arity 1'});

        return curry(function(x) {
          return xor(pred1(x), pred2(x));
        });
      })
    );


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
