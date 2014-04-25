(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;


    /*
     * length: Takes an array or string, and returns its length
     *
     */

    var length = curry(function(a) {
      if (!Array.isArray(a) && typeof(a) !== 'string')
        throw new TypeError('Value must be an array or string');

      return a.length;
    });


    var exported = {
      length: length
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
