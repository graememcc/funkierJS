(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var object = require('./object');
    var curry = base.curry;
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;


    /*
     * toString: A wrapper around Object.prototype.toString. Takes a value,
     *           and calls toString on the given value.
     *
     */

    var toString = function(val) {
      return val.toString();
    };


    /*
     * toCharCode: A curried wrapper around String.charCodeAt. Takes an index,
     *             and a string, and returns the Unicode value of the character.
     *
     */

    var toCharCode = callPropWithArity('charCodeAt', 1);


    /*
     * ord: Equivalent to toCharCode(0, s). Returns the Unicode value of the first
     *      character in the given string s.
     *
     */

    var ord = toCharCode(0);


    /*
     * chr: Equivalent to String.fromCharCode. Returns the character represented by the
     *      given Unicode character.
     *
     */

    var chr = function(c) {
      return String.fromCharCode(c);
    };


    /*
     * toLowerCase: Equivalent to String.prototype.toLowerCase. Takes a string, and converts
     *              it to lower case.
     *
     */

    var toLowerCase = callProp('toLowerCase');


    /*
     * toLocaleLowerCase: Equivalent to String.prototype.toLocaleLowerCase. Takes a string, and converts
     *                    it to lower case, following locale conventions.
     *
     */

    var toLocaleLowerCase = callProp('toLocaleLowerCase');


    /*
     * toUpperCase: Equivalent to String.prototype.toUpperCase. Takes a string, and converts
     *              it to upper case.
     *
     */

    var toUpperCase = callProp('toUpperCase');


    /*
     * toLocaleUpperCase: Equivalent to String.prototype.toLocaleUpperCase. Takes a string, and converts
     *                    it to upper case, following locale conventions.
     *
     */

    var toLocaleUpperCase = callProp('toLocaleUpperCase');


    /*
     * split: A curried wrapper around String.prototype.split. Takes a string to split on,
     *        and a target string, and returns an array, containing all of the substrings that
     *        were separated by the given split string.
     *
     */

    var split = callPropWithArity('split', 1);


    /*
     * replaceOneString: A curried wrapper around String.prototype.replace. Takes three strings:
     *                    - from: the substring to be replaced
     *                    - to: the value to replace from with
     *                    - s: the string to be searched
     *                   Replaces all instances of from with to. Throws if from is a RegExp or to is
     *                   a function. Returns the modified string.
     *
     */

    var replaceOneString = curry(function(from, to, s) {
      if ((from instanceof RegExp) || (to instanceof Function))
        throw new TypeError('replaceOneString called with invalid types');

      return s.replace(from, to);
    });


    /*
     * replaceString: Similar to replaceOneString. Takes three strings:
     *                  - from: the substring to be replaced
     *                  - to: the value to replace from with
     *                  - s: the string to be searched
     *                Replaces all instances of from with to. Throws if from is a RegExp or to is a function.
     *                Returns the modified string.
     *
     */

    var replaceString = curry(function(from, to, s) {
      if ((from instanceof RegExp) || (to instanceof Function))
        throw new TypeError('replaceString called with invalid types');

      var last = 0;
      var l = to.length;
      var i;

      while (i = s.indexOf(from, last) !== -1) {
        last = i + to.length;
        s = replaceOneString(from, to, s);
      }

      return s;
    });


    /*
     * replaceOneStringWith: A curried wrapper around String.prototype.replace. Takes three arguments:
     *                        - from: the substring to be replaced
     *                        - to: a function that will be called with the matched string, and which returns a string
     *                        - s: the string to be searched
     *                       Replaces the first instance of from with to. Throws if from is a RegExp or to is
     *                       not a function. Returns the modified string.
     *
     */

    var replaceOneStringWith = curry(function(from, to, s) {
      if ((from instanceof RegExp) || (!(to instanceof Function)))
        throw new TypeError('replaceOneStringWith called with invalid types');

      return s.replace(from, to);
    });


    /*
     * replaceStringWith: A curried wrapper around String.prototype.replace. Takes three arguments:
     *                     - from: the substring to be replaced
     *                     - to: a function that will be called with the matched string, and which returns a string
     *                     - s: the string to be searched
     *                    Replaces all instances of from with to. Throws if from is a RegExp or to is not
     *                    a function. Returns the modified string.
     *
     */

    var replaceStringWith = curry(function(from, to, s) {
      if ((from instanceof RegExp) || !(to instanceof Function))
        throw new TypeError('replaceStringWith called with invalid types');

      var last = 0;
      var i;

      while (i = s.indexOf(from, last) !== -1) {
        last = i + 1;
        s = replaceOneStringWith(from, to, s);
      }

      return s;
    });


    /*
     * replaceOneRegExp: A curried wrapper around String.prototype.replace. Takes three arguments:
     *                     - from: a regular expression matching the pattern to be replaced
     *                     - to: the string to replace the pattern matched by from with
     *                     - s: the string to be searched
     *                   Replaces the first instance of from with to. Throws if from is not a RegExp or to is
     *                   a function. Returns the modified string.
     *
     */

    var replaceOneRegExp = curry(function(from, to, s) {
      if (!(from instanceof RegExp) || (to instanceof Function))
        throw new TypeError('replaceOneRegExp called with invalid types');

      var r = new RegExp(from.source);
      return s.replace(r, to);
    });


    /*
     * replaceRegExp: A curried wrapper around String.prototype.replace. Takes three arguments:
     *                    - from: a regular expression matching the pattern to be replaced
     *                    - to: the string to replace the pattern matched by from with
     *                    - s: the string to be searched
     *                Replaces all instances of from with to. Throws if from is not a RegExp or to is
     *                a function. Returns the modified string.
     *
     */

    var replaceRegExp = curry(function(from, to, s) {
      if (!(from instanceof RegExp) || (to instanceof Function))
        throw new TypeError('replaceRegExp called with invalid types');

      var r = new RegExp(from.source, 'g');
      return s.replace(r, to);
    });


    var exported = {
      chr: chr,
      ord: ord,
      replaceOneRegExp: replaceOneRegExp,
      replaceOneString: replaceOneString,
      replaceOneStringWith: replaceOneStringWith,
      replaceRegExp: replaceRegExp,
      replaceString: replaceString,
      replaceStringWith: replaceStringWith,
      split: split,
      toCharCode: toCharCode,
      toLocaleLowerCase: toLocaleLowerCase,
      toLocaleUpperCase: toLocaleUpperCase,
      toLowerCase: toLowerCase,
      toUpperCase: toUpperCase,
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
