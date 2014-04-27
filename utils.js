(function() {
  "use strict";


  /*
   * A collection of internal utilities. Not exported to consumers.
   *
   */


  var makeModule = function(require, exports) {


    /*
     * valueStringifier: Returns a string representation of the given value.
     *
     */

    var valueStringifier = function(v) {
      switch (typeof(v)) {
        case 'number':
        case 'boolean':
        case 'undefined':
          return '' + v;
        case 'string':
          return '\'' + v + '\'';
        case 'function':
          return v.toString();
        case 'object':
          if (v === null)
            return 'null';
          if (Array.isArray(v))
            return '[' + v.join(', ') + ']';
          return '{' + v.toString() + '}';
        default:
          return v.toString();
      }
    };


    /* checkPositiveIntegral: takes a number and throw if it is not integral, otherwise
     *                        return it.
     *
     */

    var checkPositiveIntegral = function(n) {
      n = n - 0;

      if (isNaN(n) || !isFinite(n) || n < 0)
        throw new TypeError('Value is not a positive integer');

      if (n !== Math.floor(n) || n !== Math.ceil(n))
        throw new TypeError('Value is not a positive integer');

      return n;
    };


    var exported = {
      checkPositiveIntegral: checkPositiveIntegral,
      valueStringifier: valueStringifier
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
