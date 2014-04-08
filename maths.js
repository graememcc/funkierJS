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


    var exported = {
      add: add,
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
