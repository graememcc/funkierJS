(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var getRealArity = base.getRealArity;


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
      var predLen = getRealArity(pred);
      if (predLen !== 1)
        throw new TypeError('notPred called with function of arity ' + predLen);

      return curry(function(x) {
        return !pred(x);
      });
    };


    var exported = {
      and: and,
      not: not,
      notPred: notPred,
      or: or,
      xor: xor
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
