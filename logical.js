(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;


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


    var exported = {
      and: and,
      not: not,
      or: or
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
