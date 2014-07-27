(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;

    var utils = require('./utils');
    var defineValue = utils.defineValue;

    var base = require('./base');
    var flip = base.flip;

    var object = require('./object');
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;


    var toString = defineValue(
      'name: toString',
      'classification: base',
      'signature: val: any',
      '',
      'Calls val\'s {{toString}} property, and returns the result.',
      '--',
      'var s = toString({}); // s === \'[object Object]\'',
      curry(function(val) {
        return val.toString();
      })
    );


    var toLocaleString = defineValue(
      'name: toLocaleString',
      'classification: base',
      'signature: val: any',
      '',
      'Calls val\'s {{toLocaleString}} property, and returns the result.',
      '--',
      'var s = toLocaleString(1000); // s === \'1, 000\' (in some environments)',
      curry(function(val) {
        return val.toLocaleString();
      })
    );


    var toCharCode = defineValue(
      'name: toCharCode',
      'classification: string',
      'signature: i: number, s: string',
      '',
      'A curried wrapper around {{String.charCodeAt}}. Takes an index i, and a string s,',
      'and returns the Unicode value of the character at the given index in s.',
      '--',
      'var u = toCharCode(2, \'funkier\'); // u = 117',
      callPropWithArity('charCodeAt', 1)
    );


    var ord = defineValue(
      'name: ord',
      'classification: string',
      'signature: s: string',
      '',
      'Takes a string s, and returns the Unicode value of the character at index 0.',
      'Equivalent to {{toCharCode(0, s)}}.',
      '--',
      'var a = ord(\'A\'); // a === 65',
      toCharCode(0)
    );


    var chr = defineValue(
      'name: chr',
      'classification: string',
      'signature: n: number',
      '',
      'Equivalent to {{String.fromCharCode}}. Takes a number n, and returns the',
      'character whose Unicode value is that number.',
      '--',
      'var c = chr(69); // c === \'E\'',
      curry(function(c) {
        return String.fromCharCode(c);
      })
    );


    var toLowerCase = defineValue(
      'name: toLowerCase',
      'classification: string',
      'signature: s: string',
      '',
      'Equivalent to {{String.prototype.toLowerCase}}. Takes a string s, and returns a lowercase version of s.',
      '--',
      'var s = toLowerCase(\'I LIKE TO SHOUT\'); // s === \'i like to shout\'',
      callProp('toLowerCase')
    );


    var toLocaleLowerCase = defineValue(
      'name: toLocaleLowerCase',
      'classification: string',
      'signature: s: string',
      '',
      'Equivalent to {{String.prototype.toLocaleLowerCase}}. Takes a string s, and',
      'returns a lowercase version of s, converted following locale conventions.',
      '--',
      'var s = toLocaleLowerCase(\'I LIKE TO SHOUT\'); // s === \'i like to shout\'',
      callProp('toLocaleLowerCase')
    );


    var toUpperCase = defineValue(
      'name: toUpperCase',
      'classification: string',
      'signature: s: string',
      '',
      'Equivalent to {{String.prototype.toUpperCase}}. Takes a string s, and returns a',
      'uppercase version of s.',
      '--',
      'var s = toUpperCase(\'i like to whisper\'); // s === \'I LIKE TO WHISPER\'',
      callProp('toUpperCase')
    );


    var toLocaleUpperCase = defineValue(
      'name: toLocaleUpperCase',
      'classification: string',
      'signature: s: string',
      '',
      'Equivalent to {{String.prototype.toLocaleUpperCase}}. Takes a string s, and',
      'returns a uppercase version of s, converted following locale conventions.',
      '--',
      'var s = toLocaleUpperCase(\'i like to whisper\'); // s === \'I LIKE TO WHISPER\'',
      callProp('toLocaleUpperCase')
    );


    // FIXME: Regexps should be a separate function
    var split = defineValue(
      'name: split',
      'classification: string',
      'signature: delimiter: string, s: string',
      '',
      'A curried wrapper around {{String.prototype.split}}. Takes a string delimiter,',
      'and a target string s, and returns an array containing the substrings of s that',
      'were separated by the given delimiter.',
      '',
      'Note: this function does not accept the limit parameter accepted by String.prototype.split.',
      '--',
      'var arr = split(\'|\', \'1|2|3\'); // arr === [\'1\', \'2\', \'3\']',
      callPropWithArity('split', 1)
    );


    // XXX Currently this function and replaceOneStringWith strictly require strings. Should we allow
    // coercion?
    var replaceOneString = defineValue(
      'name: replaceOneString',
      'signature: regexp: RegExp, replacement: string, s: string',
      'classification: string',
      '',
      'Takes 3 parameters:',
      '  - regexp: a pattern to be replaced',
      '  - replacement: the value to replace regexp with',
      '  - s: the string to be searched',
      'and replaces the first occurrence of regexp with replacement, and returns the new',
      'string.',
      '',
      'The following sequences have special meaning: if replacement contains these, then',
      'when the match is replaced, these patterns will be replaced by the values they',
      'represent:',
      '  - $1, $2, ... $99: the text matching the parenthesized subpatterns',
      '  - $& refers to the text that was matched',
      '  - $` refers to the text before the match',
      '  - $\' refers to the text after the match',
      '',
      'Throws a TypeError if regexp is not a RegExp, or if replacement is a function.',
      '',
      'Note: this function ignores the global flag of the given RegExp.',
      '',
      'To specify a function to be called with the match, use [[replaceOneStringWith]].',
      'To replace all matches, use [[replaceString]]/[[replaceStringWith]].',
      '--',
      'var s = replaceOneString(/a/, \'i\', \'banana\'); // s === \'binana\'',
      curry(function(regexp, replacement, s) {
        if (!(regexp instanceof RegExp) || typeof(replacement) !== 'string')
          throw new TypeError('replaceOneString called with invalid types');

        var r = new RegExp(regexp.source);
        return s.replace(r, replacement);
      })
    );


    var replaceString = defineValue(
      'name: replaceString',
      'signature: regexp: RegExp, replacement: string, s: string',
      'classification: string',
      '',
      'Takes 3 parameters:',
      '  - regexp: a pattern to be replaced',
      '  - replacement: the value to replace regexp with',
      '  - s: the string to be searched',
      'and replaces all occurrences of regexp with replacement, and returns the new',
      'string.',
      'The following sequences have special meaning: if replacement contains these, then',
      'when the match is replaced, these patterns will be replaced by the values they',
      'represent:',
      '  - $1, $2, ... $99: the text matching the parenthesized subpatterns',
      '  - $& refers to the text that was matched',
      '  - $` refers to the text before the match',
      '  - $\' refers to the text after the match',
      '',
      'Throws a TypeError if regexp is not a RegExp, or if replacement is a function.',
      '',
      'Note: this function ignores the global flag of the given RegExp.',
      '',
      'To specify a function to be called with the match, use [[replaceStringWith]].',
      'To replace only the first match, use [[replaceOneString]]/[[replaceOneStringWith]].',
      '--',
      'var s = replaceString(/a/, \'i\', \'banana\'); // s === \'binini\'',
      curry(function(regexp, replacement, s) {
        if (!(regexp instanceof RegExp) || typeof(replacement) !== 'string')
          throw new TypeError('replaceString called with invalid types');

        var r = new RegExp(regexp.source, 'g');
        return s.replace(r, replacement);
      })
    );


    var replaceOneStringWith = defineValue(
      'name: replaceOneStringWith',
      'signature: regexp: RegExp, f: function, s: string',
      'classification: string',
      '',
      'Takes 3 parameters:',
      '  - regexp: a pattern to be replaced',
      '  - f: a function to call that will return the replacement text',
      '  - s: the string to be searched',
      'and replaces the first occurrence of substr with the value returned by f, and',
      'returns the new string.',
      '',
      'The function f will be called with 3 or more parameters: the matched text,',
      'followed by an argument for each parenthesized expression, each such argument',
      'containing the text that the subexpression matched. The penultimate argument',
      'will be the index of the start of the match, and the last argument will be the',
      'original string. If f returns a non-string value, it will be coerced to a string.',
      '',
      'Throws a TypeError if regexp is not a RegExp, if f is not a function, or if f',
      'has arity 0.',
      '',
      'Note: this function ignores the global flag of the given RegExp.',
      '',
      'To specify a string to be replace the match, use [[replaceOneString]].',
      'To replace all matches, use [[replaceString]]/[[replaceStringWith]].',
      '--',
      'var f = function(match, paren, i, s) {return paren + i;};',
      'var s = replaceOneStringWith(/(a)/, f, \'banana\'); // s === \'ba1nana\'',
      curry(function(regexp, f, s) {
        f = checkFunction(f, {arity: 1, minimum: true, message: 'to must be a function of arity at least 1'});
        if (!(regexp instanceof RegExp))
          throw new TypeError('replaceOneStringWith called with invalid types');

        var r = new RegExp(regexp.source);
        return s.replace(r, f);
      })
    );


    var replaceStringWith = defineValue(
      'name: replaceStringWith',
      'signature: regexp: RegExp, f: function, s: string',
      'classification: string',
      '',
      'Takes 3 parameters:',
      '  - regexp: a pattern to be replaced',
      '  - f: a function to call that will return the replacement text',
      '  - s: the string to be searched',
      'and replaces all occurrences of substr with the value returned by f, and returns',
      'the new string.',
      '',
      'The function f will be called with 3 or more parameters: the matched text,',
      'followed by an argument for each parenthesized expression, each such argument',
      'containing the text that the subexpression matched. The penultimate argument will',
      'be the index of the start of the match, and the last argument will be the original',
      'string. If f returns a non-string value, it will be coerced to a string.',
      '',
      'Throws a TypeError if regexp is not a RegExp, if f is not a function, or if f',
      'has arity 0.',
      '',
      'Note: this function ignores the global flag of the given RegExp.',
      '',
      'To specify a string to be replace the match, use [[replaceString]].',
      'To replace only the first match, use [[replaceOneString]]/[[replaceOneStringWith]].',
      '--',
      'var f = function(match, paren, i, s) {return paren + i;};',
      'var s = replaceOneStringWith(/(a)/, f, \'banana\'); // s === \'ba1na2na3\'',
      curry(function(regexp, f, s) {
        f = checkFunction(f, {arity: 1, minimum: true, message: 'to must be a function of arity at least 1'});
        if (!(regexp instanceof RegExp))
          throw new TypeError('replaceStringWith called with invalid types');

        var r = new RegExp(regexp.source, 'g');
        return s.replace(r, f);
      })
    );


    // XXX Should we adapt this so we return a TypeError?
    var test = defineValue(
      'name: test',
      'signature: regexp: RegExp, s: string',
      'classification: string',
      '',
      'A curried wrapper around RegExp.prototype.test. Takes a regexp, and a string s,',
      'and returns true if the string contains a substring matching the given pattern,',
      'and false otherwise.',
      '',
      'Throws a ReferenceError if the first parameter is not a RegExp.',
      '--',
      'var b = test(/a/, \'banana\'); // b === true',
      flip(callPropWithArity('test', 1))
    );


    // Helper function for the various match functions
    var makeMatchResult = function(reResult) {
      return {
        index: reResult.index,
        matchedText: reResult[0],
        subexpressions: reResult.slice(1)
      };
    };


    var matches = defineValue(
      'name: matches',
      'signature: regexp: RegExp, s: string',
      'classification: string',
      '',
      'Finds all matches within a string for a given regular expression. Takes two',
      'parameters: a regular expression and a string. Returns an array of objects, one',
      'object per match. Each object has the following properties:',
      '- * index: the index in the original string where the match was found',
      '- * matchedText: the substring that matched the pattern',
      '- * subexpressions: an array of substrings that matched the parenthesed',
      '-                   expressions in the regular expressions. The substring',
      '-                   matching the first parenthesised expression will be at',
      '-                   position 0, the string matching the second at position 1,',
      '-                   and so on. If the regular expression did not contain any',
      '-                   parenthesised subexpressions, this array will be empty.',
      '',
      'This function is not affected by the presence or absence of a global flag in the',
      'supplied regular expression. It is not affected by and does not change the',
      'lastIndex property of the regular expression if it exists.',
      '',
      'Throws a TypeError if the first parameter is not a regular expression.',
      '--',
      'var a = matches(/a/, \'banana\');',
      '// a === [{index: 1, matchedText: \'a\', []}, {index: 3, matchedText: \'a\', []},',
      '//        {index: 5, matchedText: \'a\', []}]',
      curry(function(regexp, s) {
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
      })
    );


    var matchesFrom = defineValue(
      'name: matchesFrom',
      'signature: regexp: RegExp, index: number, s: string',
      'classification: string',
      '',
      'Finds all matches within a string for a given regular expression from the given',
      'index. Takes three parameters: a regular expression, an index and a string.',
      'Returns an array of objects, one object per match. Each object has the following',
      'properties:',
      '- * index: the index in the original string where the match was found',
      '- * matchedText: the substring that matched the pattern',
      '- * subexpressions: an array of substrings that matched the parenthesed',
      '-                   expressions in the regular expressions. The substring',
      '-                   matching the first parenthesised expression will be at',
      '-                   position 0, the string matching the second at position 1,',
      '-                   and so on. If the regular expression did not contain any',
      '-                   parenthesised subexpressions, this array will be empty.',
      '',
      'This function is not affected by the presence or absence of a global flag in the',
      'supplied regular expression. It is not affected by and does not change the',
      'lastIndex property of the regular expression if it exists.',
      '',
      'Throws a TypeError if the first parameter is not a regular expression.',
      '--',
      'var a = matches(/a/, 2, \'banana\');',
      '// a === [{index: 3, matchedText: \'a\', []}, {index: 5, matchedText: \'a\', []}]',
      curry(function(regexp, index, s) {
        return matches(regexp, s.slice(index));
      })
    );


    var firstMatch = defineValue(
      'name: firstMatch',
      'signature: regexp: RegExp, s: string',
      'classification: string',
      '',
      'Finds the first match in a string for a given regular expression. Takes two',
      'parameters: a regular expression and a string. Returns a single object or null. If',
      'not null, the object has the following properties:',
      '- * index: the index in the original string where the match was found',
      '- * matchedText: the substring that matched the pattern',
      '- * subexpressions: an array of substrings that matched the parenthesed',
      '-                   expressions in the regular expressions. The substring',
      '-                   matching the first parenthesised expression will be at',
      '-                   position 0, the string matching the second at position 1,',
      '-                   and so on. If the regular expression did not contain any',
      '-                   parenthesised subexpressions, this array will be empty.',
      '',
      'This function is not affected by the presence or absence of a global flag in the',
      'supplied regular expression. It is not affected by and does not change the',
      'lastIndex property of the regular expression if it exists.',
      '',
      'Throws a TypeError if the first parameter is not a regular expression.',
      '--',
      'var a = firstMatch(/a/, \'banana\'); // a === {index: 3, matchedText: \'a\', []}',
      curry(function(regexp, s) {
        if (!(regexp instanceof RegExp))
          throw new TypeError('Pattern is not a regular expression');

        regexp = new RegExp(regexp.source, 'g');
        var result = regexp.exec(s);
        return result === null ? result : makeMatchResult(result);
      })
    );


    var firstMatchFrom = defineValue(
      'name: firstMatchFrom',
      'signature: regexp: RegExp, index: number, s: string',
      'classification: string',
      '',
      'Finds the first match in a string for a given regular expression, from a given',
      'index. Takes three parameters: a regular expression, an index and a string.',
      'Returns a single object or null. If not null, the object has the following',
      'properties:',
      '- * index: the index in the original string where the match was found',
      '- * matchedText: the substring that matched the pattern',
      '- * subexpressions: an array of substrings that matched the parenthesed',
      '-                   expressions in the regular expressions. The substring',
      '-                   matching the first parenthesised expression will be at',
      '-                   position 0, the string matching the second at position 1,',
      '-                   and so on. If the regular expression did not contain any',
      '-                   parenthesised subexpressions, this array will be empty.',
      '',
      'This function is not affected by the presence or absence of a global flag in the',
      'supplied regular expression. It is not affected by and does not change the',
      'lastIndex property of the regular expression if it exists.',
      '',
      'Throws a TypeError if the first parameter is not a regular expression.',
      '--',
      'var a = firstMatchFrom(/a/, 4, \'banana\'); // a === {index: 5, matchedText: \'a\', []}',
      curry(function(regexp, index, s) {
        return firstMatch(regexp, s.slice(index));
      })
    );


    var exported = {
      chr: chr,
      firstMatch: firstMatch,
      firstMatchFrom: firstMatchFrom,
      matches: matches,
      matchesFrom: matchesFrom,
      ord: ord,
      replaceOneString: replaceOneString,
      replaceOneStringWith: replaceOneStringWith,
      replaceString: replaceString,
      replaceStringWith: replaceStringWith,
      split: split,
      test: test,
      toCharCode: toCharCode,
      toLocaleLowerCase: toLocaleLowerCase,
      toLocaleString: toLocaleString,
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
