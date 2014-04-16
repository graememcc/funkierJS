(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var getRealArity = base.getRealArity;


    /*
     * toString: A wrapper around Object.prototype.toString. Takes a value,
     *           and calls toString on the given value.
     *
     */

    var toString = function(val) {
      return val.toString();
    };


    var exported = {
      toString: toString
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
