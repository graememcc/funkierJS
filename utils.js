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


    /*
     * isObjectLike: returns true if the given value is a string, array, function, or object,
     *               and false otherwise.
     *
     */

    var isObjectLike = function(v) {
      if (typeof(v) === 'string')
        return true;

      if (typeof(v) === 'function')
        return true;

      return typeof(v) === 'object' && v !== null;
    };


    /*
     * isArrayLike: returns true if the given value is a string, array, or 'array-like', and
     *              false otherwise.
     *
     */

    var isArrayLike = function(v) {
      if (typeof(v) === 'string')
        return true;

      if (typeof(v) !== 'object' || v === null)
        return false;

      if (Array.isArray(v))
        return true;

      if (!v.hasOwnProperty('length'))
        return false;

      var l = v.length;
      return v.hasOwnProperty('0') && v.hasOwnProperty('' + (l - 1));
    };


    /* checkArrayLike: takes a value and throws if it is not array-like, otherwise
     *                 return it.
     *
     */

    var checkArrayLike = function(v) {
      if (!isArrayLike(v))
        throw new TypeError('Value is not a string or array');

      return v;
    };


    var exported = {
      checkArrayLike: checkArrayLike,
      checkPositiveIntegral: checkPositiveIntegral,
      isArrayLike: isArrayLike,
      isObjectLike: isObjectLike,
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
