(function() {
  "use strict";


  /*
   * A collection of internal utilities. Not exported to consumers.
   *
   * These utilities are deliberately split out from those in utils.js. Some functions here
   * depend on getRealArity from curry.js, and we want curry.js to be able to use the functions
   * in utils.
   *
   */


  var makeModule = function(require, exports) {


    /*
     * isFunction: Returns a string representation of the given value.
     *
     */

    var isFunction = function(f) {
      return typeof(f) === 'function';
    };


    var exported = {
      isFunction: isFunction
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
