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


    var exported = {
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
