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


    var trim = function(s) {
      s = s.replace(/^\s+/, '');
      s = s.replace(/\s+$/, '');
      return s;
    };


    // defineFunction returns the function, and optionally takes several strings to be returned
    // as help text, and to be used in documentation generation. If you call it with strings, then
    // the following must be present:
    //  - a string starting with "name: " defining the function name
    //  - a string starting with "signature: " defining the type signature of the function
    //  - either of:
    //     - a string starting with "classification: " defining the class of functionality of the function
    //         (this should only be used by funkierJS core)
    //     - a string starting with "plugin: " defining the plugin this function came from
    // These can then be followed by lines of explanatory text, detailing the functionality of the function
    var defineFunction = function() {
      var args = [].slice.call(arguments);

      if (args.length === 0)
        throw new TypeError('defineFunction called with no function');

      var errorMessage = '';
      var name = '';
      var signature = '';
      var classification = '';
      var plugin = '';
      var fn = null;
      var text = [];

      // We abuse every to ensure an early exit if things go awry
      var valsOK = args.every(function(val, i) {
        var type = typeof(val);

        // The last argument must be a function
        if (i === args.length - 1) {
          if (type !== 'function') {
            errorMessage = 'defineFunction must be called with a function';
            return false;
          }
          fn = val;
          return true;
        }
        if (type !== 'string') {
          errorMessage = 'defineFunction can only be called with strings and a function';
          return false;
        }

        var colon = val.indexOf(':');

        // For now, ignore explanatory text
        if (colon === -1) {
          text.push(val);
          return true;
        }

        // Look for lines with special meaning
        var preColon = val.slice(0, colon).toLowerCase();
        preColon = trim(preColon);

        if (preColon === 'name') {
          if (name !== '') {
            errorMessage = 'defineFunction called with two \'name\' lines';
            return false;
          }
          name = val.slice(colon + 1);
        } else if (preColon === 'signature') {
          if (signature !== '') {
            errorMessage = 'defineFunction called with two \'signature\' lines';
            return false;
          }
          signature = val.slice(colon + 1);
        } else if (preColon === 'classification') {
          if (classification !== '') {
            errorMessage = 'defineFunction called with two \'classification\' lines';
            return false;
          } else if (plugin !== '') {
            errorMessage = 'defineFunction called with both \'classification\'  and \'plugin\' lines';
            return false;
          }

          classification = val.slice(colon + 1);
        } else if (preColon === 'plugin') {
          if (plugin !== '') {
            errorMessage = 'defineFunction called with two \'plugin\' lines';
            return false;
          } else if (classification !== '') {
            errorMessage = 'defineFunction called with both \'classification\'  and \'plugin\' lines';
            return false;
          }

          plugin = val.slice(colon + 1);
        } else {
          // Not a documentation-specific string
          text.push(val);
        }

        return true;
      });

      if (args.length > 1) {
        if (name === '')
          errorMessage = 'defineFunction called with no name for function';
        else if (signature === '')
          errorMessage = 'defineFunction called with no signature for function';
        else if (classification === '' && plugin === '')
          errorMessage = 'defineFunction called with no classification/plugin for function';
      }

      if (errorMessage !== '')
        throw new TypeError(errorMessage);

      return fn;
    };


    var exported = {
      checkArrayLike: checkArrayLike,
      checkIntegral: checkIntegral,
      checkObjectLike: checkObjectLike,
      checkPositiveIntegral: checkPositiveIntegral,
      defineFunction: defineFunction,
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
