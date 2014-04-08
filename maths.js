(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;


    /*
     * add: a wrapper around binary addition
     *
     */

    var add = curry(function(x, y) {
      return x + y;
    });


    /*
     * subtract: a wrapper around binary subtraction
     *
     */

    var subtract = curry(function(x, y) {
      return x - y;
    });


    /*
     * multiply: a wrapper around binary multiplication
     *
     */

    var multiply = curry(function(x, y) {
      return x * y;
    });


    /*
     * divide: a wrapper around binary division
     *
     */

    var divide = curry(function(x, y) {
      return x / y;
    });


    /*
     * exp: a wrapper around Math.pow
     *
     */

    var exp = curry(function(x, y) {
      return Math.pow(x, y);
    });


    /*
     * log: log(x, y) returns the log of y in the base x. Note: this uses
     *      the change of base formula, so may be subject to rounding errors
     *      caused by the vagaries of Javascript division.
     *
     */

    var log = curry(function(x, y) {
      return Math.log(y) / Math.log(x);
    });


    var exported = {
      add: add,
      divide: divide,
      exp: exp,
      log: log,
      multiply: multiply,
      subtract: subtract
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
