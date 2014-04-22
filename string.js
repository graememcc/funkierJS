(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var object = require('./object');
    var curry = base.curry;
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;
    var flip = base.flip;


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
     * split: A curried wrapper around String.prototype.split. Takes a string or RegExp to split on,
     *        and a target string, and returns an array, containing all of the substrings that
     *        were separated by the given split string.
     *
     * Note this does not accept the limit parameter.
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


    /*
     * replaceOneRegExpWith: A curried wrapper around String.prototype.replace. Takes three arguments:
     *                         - from: a regular expression matching the pattern to be replaced
     *                         - to: a function that will be called with the matched string, and which returns a string
     *                         - s: the string to be searched
     *                       Replaces the first instance of from with to. Throws if from is not a RegExp or to is not
     *                       a function. Returns the modified string.
     *
     */

    var replaceOneRegExpWith = curry(function(from, to, s) {
      if (!(from instanceof RegExp) || !(to instanceof Function))
        throw new TypeError('replaceOneRegExpWith called with invalid types');

      var r = new RegExp(from.source);
      return s.replace(r, to);
    });


    /*
     * replaceRegExpWith: A curried wrapper around String.prototype.replace. Takes three arguments:
     *                      - from: a regular expression matching the pattern to be replaced
     *                      - to: a function that will be called with the matched string, and which returns a string
     *                      - s: the string to be searched
     *                    Replaces all instances of from with to. Throws if from is not a RegExp or to is not
     *                    a function. Returns the modified string.
     *
     */

    var replaceRegExpWith = curry(function(from, to, s) {
      if (!(from instanceof RegExp) || !(to instanceof Function))
        throw new TypeError('replaceRegExpWith called with invalid types');

      var r = new RegExp(from.source, 'g');
      return s.replace(r, to);
    });


    /*
     * test: A curried wrapper around RegExp.prototype.test. Takes a RegExp and a string, and returns true if
     *       the string contains a substring matching the given pattern, and false otherwise. Throws a ReferenceError
     *       if the first parameter is not a RegExp.
     *
     */

    var test = flip(callPropWithArity('test', 1));


    // Helper function for the various match functions
    var makeMatchResult = function(reResult) {
      return {
        index: reResult.index,
        matchedText: reResult[0],
        subexpressions: reResult.slice(1)
      };
    };


    /*
     * matches: find all matches within a string for a given regular expression. Takes two parameters: a regular
     *          expression and a string. Returns an array of objects, one object per match. Each object has the
     *          following properties:
     *            - index: the index in the original string where the match was found
     *            - matchedText: the substring that matched the pattern
     *            - subexpressions: an array of substrings that matched the parenthised expressions in the
     *                              regular expressions. The substring matching the first parenthesised expression
     *                              will be at position 0, the string matching the second at position 1, and so on.
     *                              If the regular expression did not contain any parenthesised subexpressions, this
     *                              array will be empty.
     *          This function is not affected by the presence or absence of a global flag in the supplied regular
     *          expression. It is not affected by, and nor does it change the lastIndex property of the regular
     *          expression if it exists. Throws a TypeError if the first parameter is not a regular expression.
     *
     */

    var matches = curry(function(r, s) {
      if (!(r instanceof RegExp))
        throw new TypeError('Pattern is not a regular expression');

      r = new RegExp(r.source, 'g');
      var result = [];
      var next = r.exec(s);

      while (next !== null) {
        result.push(makeMatchResult(next));
        next = r.exec(s);
      }

      return result;
    });


    /*
     * matchesFrom: find all matches within a string from the given index for a given regular expression. Takes three
     *              parameters: a regular expression, an index, and a string. Returns an array of objects, one object
     *              per match. Each object has the following properties:
     *                - index: the index in the original string where the match was found
     *                - matchedText: the substring that matched the pattern
     *                - subexpressions: an array of substrings that matched the parenthised expressions in the
     *                                  regular expressions. The substring matching the first parenthesised expression
     *                                  will be at position 0, the string matching the second at position 1, and so on.
     *                                  If the regular expression did not contain any parenthesised subexpressions, this
     *                                  array will be empty.
     *              This function is not affected by the presence or absence of a global flag in the supplied regular
     *              expression. It is not affected by, and nor does it change the lastIndex property of the regular
     *              expression if it exists. Throws a TypeError if the first parameter is not a regular expression.
     *
     */

    var matchesFrom = curry(function(r, i, s) {
      return matches(r, s.slice(i));
    });


    /*
     * firstMatch: finds the first match within a string for a given regular expression. Takes two parameters: a regular
     *             expression and a string. Returns a single object or null. The object has the following properties:
     *               - index: the index in the original string where the match was found
     *               - matchedText: the substring that matched the pattern
     *               - subexpressions: an array of substrings that matched the parenthised expressions in the
     *                                 regular expressions. The substring matching the first parenthesised expression
     *                                 will be at position 0, the string matching the second at position 1, and so on.
     *                                 If the regular expression did not contain any parenthesised subexpressions, this
     *                                 array will be empty.
     *             This function is not affected by the presence or absence of a global flag in the supplied regular
     *             expression. It is not affected by, and nor does it change the lastIndex property of the regular
     *             expression if it exists. Throws a TypeError if the first parameter is not a regular expression.
     *
     */

    var firstMatch = curry(function(r, s) {
      if (!(r instanceof RegExp))
        throw new TypeError('Pattern is not a regular expression');

      r = new RegExp(r.source, 'g');
      var result = r.exec(s);
      return result === null ? result : makeMatchResult(result);
    });


    var exported = {
      chr: chr,
      firstMatch: firstMatch,
      matches: matches,
      matchesFrom: matchesFrom,
      ord: ord,
      replaceOneRegExp: replaceOneRegExp,
      replaceOneRegExpWith: replaceOneRegExpWith,
      replaceOneString: replaceOneString,
      replaceOneStringWith: replaceOneStringWith,
      replaceRegExp: replaceRegExp,
      replaceRegExpWith: replaceRegExpWith,
      replaceString: replaceString,
      replaceStringWith: replaceStringWith,
      split: split,
      test: test,
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
