module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;

  var internalUtilities = require('../internalUtilities');
  var defineValue = internalUtilities.defineValue;
  var checkIntegral = internalUtilities.checkIntegral;

  var base = require('./base');
  var flip = base.flip;

  var object = require('./object');
  var callProp = object.callProp;
  var callPropWithArity = object.callPropWithArity;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;


  /*
   * <apifunction>
   *
   * toString
   *
   * Category: string
   *
   * Parameter: val: any
   *
   * Calls val's `toString` property, and returns the result.
   *
   * Examples:
   *   funkierJS.toString({}); // => '[object Object]'
   *
   */

  var toString = curry(function(val) {
    return val.toString();
  });


  /*
   * <apifunction>
   *
   * toLocaleString
   *
   * Category: string
   *
   * Parameter: val: any
   * Returns: string
   *
   * Calls val's `toLocaleString` property, and returns the result.
   *
   * Examples:
   *   funkierJS.toLocaleString(1000); // => '1000' (in some environments)
   */

  var toLocaleString = curry(function(val) {
    return val.toLocaleString();
  });


  /*
   * <apifunction>
   *
   * toCharCode
   *
   * Category: string
   *
   * Parameter: i: number
   * Parameter: s: string
   * Returns: number
   *
   * A curried wrapper around `String.charCodeAt`. Takes an index i, and a string s, and returns the Unicode value of
   * the character at the given index in s.
   *
   * Examples:
   *   funkierJS.toCharCode(2, 'funkier'); // => 117
   *
   */

  var toCharCode = callPropWithArity('charCodeAt', 1);


  /*
   * <apifunction>
   *
   * ord
   *
   * Category: string
   *
   * Parameter: s: string
   *
   * Takes a string s, and returns the Unicode value of the character at index 0. Equivalent to `toCharCode(0, s)`.
   *
   * Examples:
   *   funkierJS.ord('A'); // => 65
   *
   */

  var ord = toCharCode(0);


  /*
   * <apifunction>
   *
   * chr
   *
   * Category: string
   *
   * Parameter: n: number
   * Returns: string
   *
   * Equivalent to `String.fromCharCode`. Takes a number n, and returns the character whose Unicode value is that
   * number.
   *
   * Examples:
   *   funkierJS.chr(69); // => 'E'
   *
   */

  var chr = curry(function(c) {
    return String.fromCharCode(c);
  });


  /*
   * <apifunction>
   *
   * toLowerCase
   *
   * Category: string
   *
   * Parameter: s: string
   * Returns: string
   *
   * Equivalent to `String.prototype.toLowerCase`. Takes a string s, and returns a lowercase version of s.
   *
   * Examples:
   *   funkierJS.toLowerCase('I LIKE TO SHOUT'); // => 'i like to shout'
   *
   */

  var toLowerCase = callProp('toLowerCase');


  /*
   * <apifunction>
   *
   * toLocaleLowerCase
   *
   * Category: string
   *
   * Parameter: s: string
   * Returns: string
   *
   * Equivalent to `String.prototype.toLocaleLowerCase`. Takes a string s, and returns a lowercase version of s,
   * converted following locale conventions.
   *
   * Examples:
   *   funkierJS.toLocaleLowerCase('I LIKE TO SHOUT'); // => 'i like to shout'
   *
   */

  var toLocaleLowerCase = callProp('toLocaleLowerCase');


  /*
   * <apifunction>
   *
   * toUpperCase
   *
   * Category: string
   *
   * Parameter: s: string
   * Returns: string
   *
   * Equivalent to `String.prototype.toUpperCase`. Takes a string s, and returns a uppercase version of s.
   *
   * Examples:
   *   funkierJS.oUpperCase('i like to whisper'); // => 'I LIKE TO WHISPER'
   *
   */

  var toUpperCase = callProp('toUpperCase');


  /*
   * <apifunction>
   *
   * toLocaleUpperCase
   *
   * Category: string
   *
   * Parameter: s: string
   *
   * Equivalent to `String.prototype.toLocaleUpperCase`. Takes a string s, and returns a uppercase version of s,
   * converted following locale conventions.
   *
   * Examples:
   *   funkierJS.toLocaleUpperCase('i like to whisper'); // => 'I LIKE TO WHISPER'
   *
   */

  var toLocaleUpperCase = callProp('toLocaleUpperCase');


  /*
   * <apifunction>
   *
   * split
   *
   * Category: string
   *
   * Parameter: delimiter: string
   * Parameter: s: string
   * Returns: array
   *
   * A curried wrapper around `String.prototype.split`. Takes a string delimiter, and a target string s, and returns an
   * array containing the substrings of s that were separated by the given delimiter.
   *
   * Throws a TypeError if either parameter is not a string.
   *
   * To specify the delimiter as a RegExp, use [`regExpSplit`](#regExpSplit).
   * To specify an upper bound, use [`splitMax`](#splitMax')/[`regExpSplitMax`](#regExpSplitMax).
   *
   * Examples:
   *   funkierJS.split('|', '1|2|3'); // => ['1', '2', '3']
   *
   */

  var split = curry(function(delimiter, s) {
    if (typeof(s) !== 'string' || typeof(delimiter) !== 'string')
      throw new TypeError('Delimiter and string must be strings');

    return s.split(delimiter);
  });


  /*
   * <apifunction>
   *
   * regExpSplit
   *
   * Category: string
   *
   * Parameter: delimiter: RegExp
   * Parameter: s: string
   * Returns: array
   *
   * Synonyms: splitRegExp
   *
   * A curried wrapper around `String.prototype.split`. Takes a pattern regexp, and a target string s, and returns an
   * array containing the substrings of s that were separated by substrings matching the given pattern.
   *
   * Throws a TypeError if the first parameter is not a RegExp or if the second parameter is not a string.
   *
   * To specify the delimiter as a string, use [`split`](#split).
   * To specify an upper bound, use [`splitMax`](#splitMax')/[`regExpSplitMax`](#regExpSplitMax).
   *
   * Examples:
   *   regExpSplit/a/, 'banana'); // => ['b', 'n', 'n']
   *
   */

  var regExpSplit = curry(function(delimiter, s) {
    if (typeof(s) !== 'string')
      throw new TypeError('Value to split must be a string');
    if (!(delimiter instanceof RegExp))
      throw new TypeError('Pattern to split on must be a RegExp');

    return s.split(delimiter);
  });


  /*
   * <apifunction>
   *
   * splitMax
   *
   * Category: string
   *
   * Parameter: delimiter: string
   * Parameter: limit: natural
   * Parameter: s: string
   * Returns: array
   *
   * Synonyms: splitLimit | splitCount
   *
   * A curried wrapper around `String.prototype.split`. Takes a string delimiter, a count, and a target string s, and
   * returns an array containing the substrings of s that were separated by the given delimiter, the returned array
   * containing at most limit such substrings.
   *
   * Throws a TypeError if the first or last parameter is not a string, or if limit is not integral.
   *
   * To specify the delimiter as a RegExp, use [`regExpSplitMax`](#regExpSplitMax).
   * To split without an upper bound, use [`split`](#split')/[`regExpSplit`](#regExpSplit).
   *
   * Examples:
   *   funkierJS.split('|', 2, '1|2|3'); // => ['1', '2']
   *
   */

  var splitMax = curry(function(delimiter, limit, s) {
    limit = checkIntegral(limit);

    if (typeof(s) !== 'string' || typeof(delimiter) !== 'string')
      throw new TypeError('Delimiter and string must be strings');

    return s.split(delimiter, limit);
  });


  /*
   * <apifunction>
   *
   * regExpSplitMax
   *
   * Category: string
   *
   * Parameter: delimiter: RegExp
   * Parameter: limit: natural
   * Parameter: s: string
   * Returns: array
   *
   * Synonyms: regExpSplitLimit | regExpSplitCount
   *
   * A curried wrapper around `String.prototype.split`. Takes a RegExp delimiter, a count, and a target string s, and
   * returns an array containing the substrings of s that were separated by strings matching the given delimiter, the
   * returned array containing at most limit such substrings.
   *
   * Throws a TypeError if the first parameter is not a RegExp, if the limit count is not integral, or if the last
   * parameter is not a string.
   *
   * To specify the delimiter as a string, use [`splitMax`](#splitMax).
   * To split without an upper bound, use [`split`](#split')/[`regExpSplit`](#regExpSplit).
   *
   *   funkierJS.splitRegExpLimit(/a/, 2, 'banana'); // => ['b', 'n']
   *
   */

  var regExpSplitMax = curry(function(delimiter, limit, s) {
    limit = checkIntegral(limit);

    if (typeof(s) !== 'string')
      throw new TypeError('Value to split must be a string');
    if (!(delimiter instanceof RegExp))
      throw new TypeError('Pattern to split on must be a RegExp');

    return s.split(delimiter, limit);
  });


  /*
   * Modification functions are not yet ready for implementation.
   *
  var replaceOneString = defineValue(
   *
   * replaceOneString
   *
   * Category: string
   *
   * Parameter: regexp: RegExp, replacement: string, s: string
   *
   * Takes 3 parameters:
   *   - regexp: a pattern to be replaced
   *   - replacement: the value to replace regexp with
   *   - s: the string to be searched
   * and replaces the first occurrence of regexp with replacement, and returns the new
   * string.
   *
   * The following sequences have special meaning: if replacement contains these, then
   * when the match is replaced, these patterns will be replaced by the values they
   * represent:
   *   - $1, $2, ... $99: the text matching the parenthesized subpatterns
   *   - $& refers to the text that was matched
   *   - $` refers to the text before the match
   *   - $\' refers to the text after the match
   *
   * Throws a TypeError if regexp is not a RegExp, or if replacement is not a string.
   *
   * Note: this function ignores the global flag of the given RegExp.
   *
   * To specify a function to be called with the match, use [[replaceOneStringWith]].
   * To replace all matches, use [[replaceString]]/[[replaceStringWith]].
   *
   * Examples:
   * var s = replaceOneString(/a/, \'i\', \'banana\'); // s => \'binana\'
    curry(function(regexp, replacement, s) {
      if (!(regexp instanceof RegExp) || typeof(replacement) !== 'string')
        throw new TypeError('replaceOneString called with invalid types');

      var r = new RegExp(regexp.source);
      return s.replace(r, replacement);
    })
  );


  var replaceString = defineValue(
   * replaceString
   *
   * Category: string
   *
   * Parameter: regexp: RegExp, replacement: string, s: string
   *
   * Takes 3 parameters:
   *   - regexp: a pattern to be replaced
   *   - replacement: the value to replace regexp with
   *   - s: the string to be searched
   * and replaces all occurrences of regexp with replacement, and returns the new
   * string.
   * The following sequences have special meaning: if replacement contains these, then
   * when the match is replaced, these patterns will be replaced by the values they
   * represent:
   *   - $1, $2, ... $99: the text matching the parenthesized subpatterns
   *   - $& refers to the text that was matched
   *   - $` refers to the text before the match
   *   - $\' refers to the text after the match
   *
   * Throws a TypeError if regexp is not a RegExp, or if replacement is not a string.
   *
   * Note: this function ignores the global flag of the given RegExp.
   *
   * To specify a function to be called with the match, use [[replaceStringWith]].
   * To replace only the first match, use [[replaceOneString]]/[[replaceOneStringWith]].
   *
   * Examples:
   * var s = replaceString(/a/, \'i\', \'banana\'); // s => \'binini\'
    curry(function(regexp, replacement, s) {
      if (!(regexp instanceof RegExp) || typeof(replacement) !== 'string')
        throw new TypeError('replaceString called with invalid types');

      var r = new RegExp(regexp.source, 'g');
      return s.replace(r, replacement);
    })
  );


  var replaceOneStringWith = defineValue(
   * replaceOneStringWith
   *
   * Category: string
   *
   * Parameter: regexp: RegExp, f: function, s: string
   *
   * Takes 3 parameters:
   *   - regexp: a pattern to be replaced
   *   - f: a function to call that will return the replacement text
   *   - s: the string to be searched
   * and replaces the first occurrence of substr with the value returned by f, and
   * returns the new string.
   *
   * The function f will be called with 3 or more parameters: the matched text,
   * followed by an argument for each parenthesized expression, each such argument
   * containing the text that the subexpression matched. The penultimate argument
   * will be the index of the start of the match, and the last argument will be the
   * original string. If f returns a non-string value, it will be coerced to a string.
   *
   * Throws a TypeError if regexp is not a RegExp, if f is not a function, or if f
   * has arity 0.
   *
   * Note: this function ignores the global flag of the given RegExp.
   *
   * To specify a string to be replace the match, use [[replaceOneString]].
   * To replace all matches, use [[replaceString]]/[[replaceStringWith]].
   *
   * Examples:
   * var f = function(match, paren, i, s) {return paren + i;};
   * var s = replaceOneStringWith(/(a)/, f, \'banana\'); // s => \'ba1nana\'
    curry(function(regexp, f, s) {
      f = checkFunction(f, {arity: 1, minimum: true, message: 'to must be a function of arity at least 1'});
      if (!(regexp instanceof RegExp))
        throw new TypeError('replaceOneStringWith called with invalid types');

      var r = new RegExp(regexp.source);
      return s.replace(r, f);
    })
  );


  var replaceStringWith = defineValue(
   * replaceStringWith
   *
   * Category: string
   *
   * Parameter: regexp: RegExp, f: function, s: string
   *
   * Takes 3 parameters:
   *   - regexp: a pattern to be replaced
   *   - f: a function to call that will return the replacement text
   *   - s: the string to be searched
   * and replaces all occurrences of substr with the value returned by f, and returns
   * the new string.
   *
   * The function f will be called with 3 or more parameters: the matched text,
   * followed by an argument for each parenthesized expression, each such argument
   * containing the text that the subexpression matched. The penultimate argument will
   * be the index of the start of the match, and the last argument will be the original
   * string. If f returns a non-string value, it will be coerced to a string.
   *
   * Throws a TypeError if regexp is not a RegExp, if f is not a function, or if f
   * has arity 0.
   *
   * Note: this function ignores the global flag of the given RegExp.
   *
   * To specify a string to be replace the match, use [[replaceString]].
   * To replace only the first match, use [[replaceOneString]]/[[replaceOneStringWith]].
   *
   * Examples:
   * var f = function(match, paren, i, s) {return paren + i;};
   * var s = replaceOneStringWith(/(a)/, f, \'banana\'); // s => \'ba1na2na3\'
    curry(function(regexp, f, s) {
      f = checkFunction(f, {arity: 1, minimum: true, message: 'to must be a function of arity at least 1'});
      if (!(regexp instanceof RegExp))
        throw new TypeError('replaceStringWith called with invalid types');

      var r = new RegExp(regexp.source, 'g');
      return s.replace(r, f);
    })
  );
  */


  /*
   * <apifunction>
   *
   * test
   *
   * Category: string
   *
   * Parameter: regexp: RegExp
   * Parameter: s: string
   * Returns: boolean
   *
   * A curried wrapper around `RegExp.prototype.test`. Takes a regexp, and a string s, and returns true if the string
   * contains a substring matching the given pattern, and false otherwise.
   *
   * Throws a TypeError if regexp is not a RegExp, or if s is not a string.
   *
   * Examples:
   *   funkierJS.test(/a/, 'banana'); // => true
   *
   */

  var test = curry(function(regexp, s) {
    if (!(regexp instanceof RegExp) || typeof(s) !== 'string')
      throw new TypeError('test called with invalid types');
    return regexp.test(s);
  });


  // Helper function for the various match functions
  var makeMatchResult = function(reResult) {
    return {
      index: reResult.index,
      matchedText: reResult[0],
      subexpressions: reResult.slice(1)
    };
  };


  /*
   * <apifunction>
   *
   * matches
   *
   * Category: string
   *
   * Parameter: r: Regexp
   * Parameter: s: string
   * Returns: array
   *
   * Finds all matches within a string for a given regular expression. Takes two parameters: a regular expression and a
   * string. Returns an array of objects, one object per match.
   *
   * Each object has the following properties:
   *   - index: the index in the original string where the match was found
   *   - matchedText: the substring that matched the pattern
   *   - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
   *                     The substring matching the first parenthesised expression will be at position 0, the string
   *                     matching the second at position 1, and so on. If the regular expression did not contain any
   *                     parenthesised subexpressions, this array will be empty.
   *
   * This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
   * is not affected by and does not change the lastIndex property of the regular expression if it exists.
   *
   * Throws a TypeError if the first parameter is not a regular expression.
   *
   * Examples:
   *   funkierJS.matches(/a/, 'banana');
   *   // a => [{index: 1, matchedText: 'a', []}, {index: 3, matchedText: 'a', []},
   *   //       {index: 5, matchedText: 'a', []}]
   *
   */

  var matches = curry(function(regexp, s) {
    if (!(regexp instanceof RegExp))
      throw new TypeError('Pattern is not a regular expression');

    regexp = new RegExp(regexp.source, 'g');
    var result = [];
    var next = regexp.exec(s);

    while (next !== null) {
      result.push(makeMatchResult(next));
      next = regexp.exec(s);
    }

    return result;
  });


  /*
   * <apifunction>
   *
   * matchesFrom
   *
   * Category: string
   *
   * Parameter: r: Regexp
   * Parameter: index: number
   * Parameter: s: string
   * Returns: array
   *
   * Finds all matches within a string for a given regular expression from the given index. Takes three parameters: a
   * regular expression, an index and a string. Returns an array of objects, one object per match.
   *
   * Each object has the following properties:
   *   - index: the index in the original string where the match was found
   *   - matchedText: the substring that matched the pattern
   *   - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
   *                     The substring matching the first parenthesised expression will be at position 0, the string
   *                     matching the second at position 1, and so on. If the regular expression did not contain any
   *                     parenthesised subexpressions, this array will be empty.
   *
   * This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
   * is not affected by and does not change the lastIndex property of the regular expression if it exists.
   *
   * If the index is negative, it is taken as an offset from the end of the string.
   *
   * Throws a TypeError if the first parameter is not a regular expression.
   *
   * Examples:
   *  funkierJS.matchesFrom(/a/, 2, 'banana');
   *  // => [{index: 3, matchedText: 'a', []}, {index: 5, matchedText: 'a', []}]
   *
   */

  var matchesFrom = curry(function(regexp, index, s) {
    return matches(regexp, s.slice(index));
  });


  /*
   * <apifunction>
   *
   * firstMatch
   *
   * Category: string
   *
   * Parameter: r: Regexp
   * Parameter: s: string
   * Returns: object | null
   *
   * Finds the first match in a string for a given regular expression. Takes two parameters: a regular expression and a
   * string. Returns a single object or null.
   *
   * If not null, the object has the following properties:
   *   - index: the index in the original string where the match was found
   *   - matchedText: the substring that matched the pattern
   *   - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
   *                     The substring matching the first parenthesised expression will be at position 0, the string
   *                     matching the second at position 1, and so on. If the regular expression did not contain any
   *                     parenthesised subexpressions, this array will be empty.
   *
   * This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
   * is not affected by and does not change the lastIndex property of the regular expression if it exists.
   *
   * Throws a TypeError if the first parameter is not a regular expression.
   *
   * Examples:
   *   funkierJS.firstMatch(/a/, \'banana\'); // => {index: 3, matchedText: \'a\', []}
   *
   */

  var firstMatch = curry(function(regexp, s) {
    if (!(regexp instanceof RegExp))
      throw new TypeError('Pattern is not a regular expression');

    regexp = new RegExp(regexp.source, 'g');
    var result = regexp.exec(s);
    return result === null ? result : makeMatchResult(result);
  });


  /*
   * <apifunction>
   *
   * firstMatchFrom
   *
   * Category: string
   *
   * Parameter: r: Regexp
   * Parameter: index: natural
   * Parameter: s: string
   * Returns: object | null
   *
   * Finds the first match in a string for a given regular expression from a given index. Takes three parameters: a
   * regular expression an index, and a string. Returns a single object or null.
   *
   * If not null, the object has the following properties:
   *   - index: the index in the original string where the match was found
   *   - matchedText: the substring that matched the pattern
   *   - subexpressions: an array of substrings that matched the parenthesed expressions in the regular expressions.
   *                     The substring matching the first parenthesised expression will be at position 0, the string
   *                     matching the second at position 1, and so on. If the regular expression did not contain any
   *                     parenthesised subexpressions, this array will be empty.
   *
   * This function is not affected by the presence or absence of a global flag in the supplied regular expression. It
   * is not affected by and does not change the lastIndex property of the regular expression if it exists.
   *
   * Throws a TypeError if the first parameter is not a regular expression.
   *
   * Examples:
   *   funkierJS.firstMatchFrom(/a/, 4, 'banana'); // => {index: 5, matchedText: 'a', []}
   *
   */

  var firstMatchFrom = curry(function(regexp, index, s) {
    return firstMatch(regexp, s.slice(index));
  });


  /*
   * <apifunction>
   *
   * trim
   *
   * Category: string
   *
   * Parameter: s: string
   * Returns: string
   *
   * Returns a string containing the contents of the original string, less any leading and trailing whitespace.
   *
   * Examples:
   *   funkierJS.trim(' abc   '); // 'abc'
   *
   */

  var trim = curry(function(s) {
    return s.trim();
  });


  return {
    chr: chr,
    firstMatch: firstMatch,
    firstMatchFrom: firstMatchFrom,
    matches: matches,
    matchesFrom: matchesFrom,
    ord: ord,
    regExpSplit: regExpSplit,
    regExpSplitCount: regExpSplitMax,
    regExpSplitLimit: regExpSplitMax,
    regExpSplitMax: regExpSplitMax,
    /*
    replaceOneString: replaceOneString,
    replaceOneStringWith: replaceOneStringWith,
    replaceString: replaceString,
    replaceStringWith: replaceStringWith,
    */
    split: split,
    splitCount: splitMax,
    splitLimit: splitMax,
    splitRegExp: regExpSplit,
    splitMax: splitMax,
    test: test,
    toCharCode: toCharCode,
    toLocaleLowerCase: toLocaleLowerCase,
    toLocaleString: toLocaleString,
    toLocaleUpperCase: toLocaleUpperCase,
    toLowerCase: toLowerCase,
    toUpperCase: toUpperCase,
    toString: toString,
    trim: trim
  };
})();
