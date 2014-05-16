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


    /* checkIntegral: Takes a value and an optional error message. Throws a TypeError, with the given error
     *                if specified, when the value cannot be coerced to an integer, and returns the coerced
     *                integer in all other cases.
     *
     */

    var checkIntegral = function(n, message) {
      message = message || 'Value is not an integer';
      n = n - 0;

      if (isNaN(n) || !isFinite(n))
        throw new TypeError(message);

      if (n !== Math.floor(n) || n !== Math.ceil(n))
        throw new TypeError(message);

      return n;
    };


    /* checkPositiveIntegral: Takes a value and an optional error message. Throws a TypeError, with the given error
     *                        if specified, when the value cannot be coerced to a positive integer, and returns the
     *                        coerced integer in all other cases.
     *
     */

    var checkPositiveIntegral = function(n, message) {
      message = message || 'Value is not a positive integer';
      n = checkIntegral(n, message);

      if (n < 0)
        throw new TypeError(message);

      return n;
    };


    /*
     * isObjectLike: returns true if the given value is a string, array, function, or object,
     *               and false otherwise.
     *
     */

    var isObjectLike = function(v, options) {
      var options = options || {};
      var strict = options.strict || false;
      var allowNull = options.allowNull || false;

      var acceptable = strict ? ['object'] : ['string', 'function', 'object'];
      if (strict && Array.isArray(v))
        return false;

      return (v === null && allowNull) || (v !== null && acceptable.indexOf(typeof(v)) !== -1);
    };


    /* checkObjectLike: takes a value and throws if it is not object-like, otherwise return a copy.
     *
     */

    var checkObjectLike = function(v, options) {
      var options = options || {};
      var message = options.message || 'Value is not an object';
      var allowNull = options.allowNull || false;

      if (!isObjectLike(v, options))
        throw new TypeError(message);

      return v;
    };


    /*
     * isArrayLike: returns true if the given value is a string, array, or 'array-like', and false otherwise.
     *              Takes an optional 'noStrings' argument: strings will not be considered 'array-like' when
     *              this is true.
     *
     */

    var isArrayLike = function(v, noStrings) {
      noStrings = noStrings || false;

      if (typeof(v) === 'string')
        return !noStrings;

      if (typeof(v) !== 'object' || v === null)
        return false;

      if (Array.isArray(v))
        return true;

      if (!v.hasOwnProperty('length'))
        return false;

      var l = v.length;

      return l === 0 || (v.hasOwnProperty('0') && v.hasOwnProperty('' + (l - 1)));
    };


    /* checkArrayLike: takes a value and throws if it is not array-like, otherwise
     *                 return a copy.
     *
     */

    var checkArrayLike = function(v, options) {
      var options = options || {};
      var message = options.message || 'Value is not a string or array';

      if (!isArrayLike(v, options.noStrings))
        throw new TypeError(message);

      // We allow an optional 'dontSlice' option for arrays and arraylikes. For example,
      // when implementing length, there is no need to copy the object, we can just read
      // the property
      if (typeof(v) === 'string' || ('dontSlice' in options && options.dontSlice))
        return v;

      return [].slice.call(v);
    };


    var exported = {
      checkArrayLike: checkArrayLike,
      checkIntegral: checkIntegral,
      checkObjectLike: checkObjectLike,
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
