module.exports = (function() {
  "use strict";


  /* checkIntegral: Takes a value and an optional options object. In the following circumstances it will return
   *                the supplied value (coerced to an integer if necessary):
   *                  - The value is an integer.
   *                  - The value can be coerced to an integer, and the options object does not contain a property
   *                    named "strict" that coerces to true.
   *
   *                For all other values, a TypeError will be thrown. The message of the TypeError can be specified
   *                by including an "errorMessage" property in the options object.
   *
   */

  var checkIntegral = function(n, options) {
    options = options || {};
    var message = options.errorMessage || 'Value is not an integer';

    if (options.strict && typeof(n) !== 'number')
      throw new TypeError(message);

    n = n - 0;

    if (isNaN(n) || !isFinite(n))
      throw new TypeError(message);

    if (n !== Math.round(n))
      throw new TypeError(message);

    return n;
  };


  /* checkPositiveIntegral: Takes a value and an optional options object. In the following circumstances it will return
   *                        the supplied value (coerced to an integer if necessary):
   *                          - The value is a positive integer.
   *                          - The value can be coerced to a positive integer, and the options object does not contain
   *                            a property named "strict" that coerces to true.
   *
   *                        For all other values, a TypeError will be thrown. The message of the TypeError can be
   *                        specified by including an "errorMessage" property in the options object.
   *
   */

  var checkPositiveIntegral = function(n, options) {
    options = options || {};
    var message = options.errorMessage || 'Value is not a positive integer';
    // Don't mutate the supplied options
    var newOptions = Object.create(options);
    newOptions.errorMessage = message;
    n = checkIntegral(n, newOptions);

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
    options = options || {};
    var strict = options.strict || false;
    var allowNull = options.allowNull || false;

    var acceptable = strict ? ['object'] : ['string', 'function', 'object'];
    if (strict && Array.isArray(v))
      return false;

    return (v === null && allowNull) || (v !== null && acceptable.indexOf(typeof(v)) !== -1);
  };


  /* checkObjectLike: takes a value and throws if it is not object-like, otherwise returns the object
   *
   */

  var checkObjectLike = function(v, options) {
    options = options || {};
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
    options = options || {};
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


  return {
    checkArrayLike: checkArrayLike,
    checkIntegral: checkIntegral,
    checkObjectLike: checkObjectLike,
    checkPositiveIntegral: checkPositiveIntegral,
    isArrayLike: isArrayLike,
    isObjectLike: isObjectLike,
    valueStringifier: valueStringifier
  };
})();
