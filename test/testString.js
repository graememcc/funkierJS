(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var string = require('../string');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var checkArrayEquality = testUtils.checkArrayEquality;
    var getRealArity = base.getRealArity;


    describe('String exports', function() {
      var expectedFunctions = ['toString', 'toCharCode', 'ord', 'chr', 'toLowerCase',
                               'toLocaleLowerCase', 'toUpperCase', 'toLocaleUpperCase',
                               'split', 'replaceOneString', 'replaceString', 'replaceOneStringWith',
                               'replaceStringWith', 'replaceOneRegExp', 'replaceRegExp',
                               'replaceRegExpWith', 'replaceOneRegExpWith', 'test', 'matches',
                               'matchesFrom', 'firstMatch', 'firstMatchFrom'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('string.js exports \'' + f + '\' property', exportsProperty(string, f));
        it('\'' + f + '\' property of string.js is a function', exportsFunction(string, f));
      });
    });


    describe('toString', function() {
      var toString = string.toString;


      it('Has correct arity', function() {
        expect(getRealArity(toString)).to.equal(1);
      });


      var testData = [
        {name: 'number', value: 1},
        {name: 'string', value: 'a'},
        {name: 'boolean', value: true},
        {name: 'function', value: function() {}},
        {name: 'object', value: {}},
        {name: 'array', value: [1]}
      ];


      var makeToStringTest = function(val) {
        return function() {
          expect(toString(val)).to.equal(val.toString());
        };
      };


      testData.forEach(function(tData) {
        it('Works correctly for ' + tData.name, makeToStringTest(tData.value));
      });


      it('Works correctly for object with custom toString', function() {
        var a = {toString: function() {return 'foo';}};

        expect(toString(a)).to.equal(a.toString());
      });
    });


    describe('toCharCode', function() {
      var toCharCode = string.toCharCode;


      it('Has correct arity', function() {
        expect(getRealArity(toCharCode)).to.equal(2);
      });


      it('Works correctly (1)', function() {
        var a = 'abc';
        var l = a.length;

        for (var i = 0; i < l; i++)
          expect(toCharCode(i, a)).to.equal(a.charCodeAt(i));
      });


      it('Works correctly (2)', function() {
        var a = 'abc';

        expect(isNaN(toCharCode(10, a))).to.be.true;
      });


      testCurriedFunction('toCharCode', toCharCode, [1, 'abc']);
    });


    describe('ord', function() {
      var ord = string.ord;


      it('Has correct arity', function() {
        expect(getRealArity(ord)).to.equal(1);
      });


      it('Works correctly (1)', function() {
        var a = 'a';

        expect(ord(a)).to.equal(a.charCodeAt(0));
      });


      it('Works correctly (2)', function() {
        var a = 'F';

        expect(ord(a)).to.equal(a.charCodeAt(0));
      });


      it('Works correctly (3)', function() {
        var a = 'funkier';

        expect(ord(a)).to.equal(a.charCodeAt(0));
      });


      it('Works correctly (4)', function() {
        var a = '';

        expect(isNaN(ord(a))).to.be.true;
      });
    });


    describe('chr', function() {
      var chr = string.chr;
      var ord = string.ord;


      it('Has correct arity', function() {
        expect(getRealArity(chr)).to.equal(1);
      });


      it('Works correctly (1)', function() {
        var a = 'a';
        var aCode = ord(a);

        expect(chr(aCode)).to.equal(a);
      });


      it('Works correctly (2)', function() {
        var f = 'F';
        var fCode = ord(f);

        expect(chr(fCode)).to.equal(f);
      });


      it('Discards superfluous arguments', function() {
        var a = 'a';
        var aCode = ord(a);
        var bCode = ord('b');
        var cCode = ord('c');

        expect(chr(aCode, bCode, cCode)).to.equal(a);
      });
    });


    var makeStringCaseTest = function(desc, fnUnderTest, verifier) {
      describe(desc, function() {


        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(1);
        });


        it('Works correctly (1)', function() {
          var s = 'abc';
          var result = fnUnderTest(s);

          expect(result).to.equal(s[verifier]());
        });


        it('Works correctly (2)', function() {
          var s = 'ABC';
          var result = fnUnderTest(s);

          expect(result).to.equal(s[verifier]());
        });


        it('Works correctly (3)', function() {
          var s = 'AbC';
          var result = fnUnderTest(s);

          expect(result).to.equal(s[verifier]());
        });
      });
    };


    makeStringCaseTest('toLowerCase', string.toLowerCase, 'toLowerCase');
    makeStringCaseTest('toLocaleLowerCase', string.toLocaleLowerCase, 'toLocaleLowerCase');
    makeStringCaseTest('toUpperCase', string.toUpperCase, 'toUpperCase');
    makeStringCaseTest('toLocaleUpperCase', string.toLocaleUpperCase, 'toLocaleUpperCase');


    describe('split', function() {
      var split = string.split;


      it('Has correct arity', function() {
        expect(getRealArity(split)).to.equal(2);
      });


      it('Returns an array (1)', function() {
        var s = 'a-b-c';
        var result = split('-', s);

        expect(base.isArray(result)).to.be.true;
      });


      it('Returns an array (2)', function() {
        var s = 'a-b-c';
        var result = split('*', s);

        expect(base.isArray(result)).to.be.true;
      });


      it('Splitting string not present in results (1)', function() {
        var s = 'a-b-c';
        var result = split('-', s).every(function(sp) {
          return sp !== '-';
        });

        expect(result).to.be.true;
      });


      it('Splitting string not present in results (2)', function() {
        var s = 'a-b-c';
        var result = split('-', s).every(function(sp) {
          return sp.indexOf('-') === -1;
        });

        expect(result).to.be.true;
      });


      it('Works correctly (1)', function() {
        var s = 'd-e-f-g';
        var result = split('-', s);

        expect(checkArrayEquality(result, s.split('-'))).to.be.true;
      });


      it('Works correctly (2)', function() {
        var s = 'd-e-f-g';
        var result = split('*', s);

        expect(checkArrayEquality(result, s.split('*'))).to.be.true;
      });


      it('Works correctly (3)', function() {
        var s = 'd--e--f--g';
        var result = split('--', s);

        expect(checkArrayEquality(result, s.split('--'))).to.be.true;
      });


      it('Works correctly (4)', function() {
        var s = 'defg';
        var result = split('', s);

        expect(checkArrayEquality(result, s.split(''))).to.be.true;
      });


      it('Works correctly (5)', function() {
        var s = 'd--e--f--g';
        var result = split(/--/, s);

        expect(checkArrayEquality(result, s.split(/--/))).to.be.true;
      });


      testCurriedFunction('split', split, ['*', 'a*b']);
    });


    var makeReplaceTest = function(desc, fnUnderTest, regexp, fn, once) {
      describe(desc, function() {
        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(3);
        });


        if (!regexp) {
          it('Throws if from is a regular expression', function() {
            var s = 'funkier';
            var from = /g/;
            var to = fn ? function(s) {return 'h';} : 'h';
            var f = function() {
              fnUnderTest(from, to, s);
            };

            expect(f).to.throw(TypeError);
          });
        } else {
          it('Does not throw if from is a regular expression', function() {
            var s = 'funkier';
            var from = /g/;
            var to = fn ? function(s) {return 'h';} : 'h';
            var f = function() {
              fnUnderTest(from, to, s);
            };

            expect(f).to.not.throw(TypeError);
          });


          if (!fn) {
            it('Respects meaning of $1 in replacement', function() {
              var s = 'bana';
              var from = /(na)/;
              var to = '$1$1'
              var result = fnUnderTest(from, to, s);

              expect(result).to.equal('banana');
            });
          } else {
            it('Calls replacement function with matched groups', function() {
              var s = 'a111b222c';
              var from = /(\d+)b(\d+)/;
              var to = function(s, a, b) {to.arg1 = a; to.arg2 = b; return '';};
              to.arg1 = null;
              to.arg2 = null;
              var result = fnUnderTest(from, to, s);

              expect(to.arg1).to.equal('111');
              expect(to.arg2).to.equal('222');
            });
          }
        }


        if (!fn) {
          it('Throws if to is a function', function() {
            var s = 'funkier';
            var from = regexp ? /g/ : 'g';
            var to = function(s) {};
            var f = function() {
              fnUnderTest(from, to, s);
            };

            expect(f).to.throw(TypeError);
          });


          // If argument 2 isn't a function, then it's a string. Test the various
          //  special characters.

          it('Respects meaning of $& in replacement', function() {
            var s = 'ba';
            var from = regexp ? /ba/ : 'ba';
            var to = 'ab$&';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('abba');
          });


          it('Respects meaning of $` in replacement', function() {
            var s = 'can-';
            var from = regexp ? /-/ : '-';
            var to = '-$`';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('can-can');
          });


          it('Respects meaning of $\' in replacement', function() {
            var s = 'bana';
            var from = regexp ? /ba/ : 'ba';
            var to = 'ba$\''
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('banana');
          });


          it('Respects meaning of $$ in replacement', function() {
            var s = 'let\'s make some dollar';
            var from = regexp ? /dollar/ : 'dollar';
            var to = '$$'
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('let\'s make some $');
          });
        } else {
          it('Calls replacement function with matched substring', function() {
            var s = 'funkier';
            var from = regexp ? /f/ : 'f';
            var to = function(s) {to.s = s; return 'g';};
            to.s = null;
            var result = fnUnderTest(from, to, s);

            expect(to.s).to.equal('f');
          });
        }


        it('Returns original string when no matches found', function() {
          var s = 'funkier';
          var from = regexp ? /g/ : 'g';
          var to = fn ? function(s) {return 'h';} : 'h';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal(s);
        });


        it('Works correctly', function() {
          var s = 'funkier';
          var from = regexp ? /f/ : 'f';
          var to = fn ? function(s) {return 'g';} : 'g';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal('gunkier');
        });


        it('Replaces leftmost', function() {
          var s = 'bannna';
          var from = regexp ? /nn/ : 'nn';
          var to = fn ? function(s) {return 'na';} : 'na';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal('banana');
        });


        it('Deletes if replacement is empty', function() {
          var s = 'funkier';
          var from = regexp ? /u/ : 'u';
          var to = fn ? function(s) {return '';} : '';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal('fnkier');
        });


        if (once) {
          it('Replaces exactly one instance when found', function() {
            var s = 'banana';
            var from = regexp ? /a/ : 'a';
            var to = fn ? function(s) {return 'i';} : 'i';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('binana');
          });


          if (regexp) {
            it('Ignores global flag on regexp', function() {
              var s = 'banana';
              var from = /a/g;
              var to = fn ? function(s) {return 'i';} : 'i';
              var result = fnUnderTest(from, to, s);

              expect(result).to.equal('binana');
            });
          }
        } else {
          it('Replaces all instances found', function() {
            var s = 'banana';
            var from = regexp ? /a/ : 'a';
            var to = fn ? function(s) {return 'i';} : 'i';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('binini');
          });
        }

        var from = regexp ? /a/ : 'a';
        var to = fn ? function(s) {return 'i';} : 'i';
        testCurriedFunction(desc, fnUnderTest, [from, to, 'banana']);
      });
    };

    makeReplaceTest('replaceOneString', string.replaceOneString, false, false, true);
    makeReplaceTest('replaceString', string.replaceString, false, false, false);
    makeReplaceTest('replaceOneStringWith', string.replaceOneStringWith, false, true, true);
    makeReplaceTest('replaceStringWith', string.replaceStringWith, false, true, false);
    makeReplaceTest('replaceOneRegExp', string.replaceOneRegExp, true, false, true);
    makeReplaceTest('replaceRegExp', string.replaceRegExp, true, false, false);
    makeReplaceTest('replaceOneRegExpWith', string.replaceOneRegExpWith, true, true, true);
    makeReplaceTest('replaceRegExpWith', string.replaceRegExpWith, true, true, false);


    describe('test', function() {
      var test = string.test;


      it('Has correct arity', function() {
        expect(getRealArity(test)).to.equal(2);
      });


      it('Throws if first parameter not a RegExp', function() {
        var fn = function() {
          test('a', 'b');
        };

        expect(fn).to.throw(TypeError);
      });


      it('Returns a boolean (1)', function() {
        var result = test(/a/, 'b');

        expect(result).to.be.a('boolean');
      });


      it('Returns a boolean (2)', function() {
        var result = test(/a/, 'a');

        expect(result).to.be.a('boolean');
      });


      it('Works correctly (1)', function() {
        var result = test(/a/, 'b');

        expect(result).to.be.false;
      });


      it('Works correctly (2)', function() {
        var result = test(/a/, 'a');

        expect(result).to.be.true;
      });


      testCurriedFunction('test', test, [/na/, 'na']);
    });


    // Helper for the various match tests
    var resultIsCorrectShape = function(result) {
      // The match functions don't return a constructed object,
      // just a bare object with certain properties attached.

      var keys = Object.keys(result);
      var expectedKeys = ['index', 'matchedText', 'subexpressions'];

      if (keys.length !== expectedKeys.length)
        return false;

      return keys.every(function(k) {
        return expectedKeys.indexOf(k) !== -1;
      });
    };


    var addCommonMatcherTests = function(fnUnderTest, isFrom) {
      it('Has correct arity', function() {
        var expectedArity = isFrom ? 3 : 2;
        expect(getRealArity(fnUnderTest)).to.equal(expectedArity);
      });


      it('Throws a TypeError if first parameter not a RegExp', function() {
        var args = isFrom ? ['a', 0, 'b'] : ['a', 'b'];
        var fn = function() {
          fnUnderTest.apply(null, args);
        };

        expect(fn).to.throw(TypeError);
      });
    };


    var makeMultiMatcherTests = function(desc, fnUnderTest, isFrom) {
      describe(desc, function() {
        addCommonMatcherTests(fnUnderTest, isFrom);


        it('Returns an empty array when there are no results', function() {
          var args = isFrom ? [/a/, 0, 'b'] : [/a/, 'b'];
          var result = fnUnderTest.apply(null, args);

          expect(result).to.be.an('array');
          expect(result.length).to.equal(0);
        });


        it('Returns an array of correct length (1)', function() {
          var s = 'a cat hat mat';
          // Our search string has 4 results: the from function should pick up 2 of them
          // based on the start position
          var expectedResults = isFrom ? 2 : 4;
          var r = /a/g;
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args);

          expect(result.length).to.equal(expectedResults);
        });


        it('All results have correct form (1)', function() {
          var s = 'a cat hat mat';
          var r = /a/g;
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(resultIsCorrectShape);

          expect(result).to.be.true;
        });


        it('All results have correct matched text (1)', function() {
          var s = 'a cat hat mat';
          var r = /a/g;
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(function(obj) {
            return obj.matchedText === 'a';
          });

          expect(result).to.be.true;
        });


        it('All results have correct index (1)', function() {
          var s = 'a cat hat mat';
          var r = /a/g;
          var indices = [0, 3, 7, 11];
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(function(obj, i) {
            return obj.index === (isFrom ? indices[i + 2]  - 5 : indices[i]);
          });

          expect(result).to.be.true;
        });


        it('All results have correct subexpressions (1)', function() {
          // This search has no subexpressions: the result should be an empty array
          var s = 'a cat hat mat';
          var r = /a/g;
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(function(res) {
            return Array.isArray(res.subexpressions) &&
                   res.subexpressions.length === 0;
          });

          expect(result).to.be.true;
        });


        it('Returns an array of correct length (2)', function() {
          var s = 'a012 bca123 defa234 gha345';
          // Our search string has 4 results: the from function should pick up 2 of them
          // based on the start position
          var expectedResults = isFrom ? 2 : 4;
          var r = /a(\d)(\d)(\d)/g;
          var args = isFrom ? [r, 8, s] : [r, s];
          var result = fnUnderTest.apply(null, args);

          expect(result.length).to.equal(expectedResults);
        });


        it('All results have correct form (2)', function() {
          var s = 'a012 bca123 defa234 gha345';
          var r = /a(\d)(\d)(\d)/g;
          var args = isFrom ? [r, 8, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(resultIsCorrectShape);

          expect(result).to.be.true;
        });


        it('All results have correct matched text (2)', function() {
          var s = 'a012 bca123 defa234 gha345';
          var r = /a(\d)(\d)(\d)/g;
          var args = isFrom ? [r, 8, s] : [r, s];
          var isDigit = function(c) {
            return c.length === 1 && c >= '0' && c <= '9';
          };
          var result = fnUnderTest.apply(null, args).every(function(obj) {
            return obj.matchedText.length === 4 &&
                   obj.matchedText[0] === 'a' && isDigit(obj.matchedText[1]) &&
                   isDigit(obj.matchedText[1]) && isDigit(obj.matchedText[2]);
          });

          expect(result).to.be.true;
        });


        it('All results have correct index (2)', function() {
          var s = 'a012 bca123 defa234 gha345';
          var r = /a(\d)(\d)(\d)/g;
          var args = isFrom ? [r, 8, s] : [r, s];
          var indices = [0, 7, 15, 22];
          var result = fnUnderTest.apply(null, args).every(function(obj, i) {
            return obj.index === (isFrom ? indices[i + 2] - 8 : indices[i]);
          });

          expect(result).to.be.true;
        });


        it('All results have correct subexpressions (2)', function() {
          var s = 'a012 bca123 defa234 gha345';
          var r = /a(\d)(\d)(\d)/g;
          var args = isFrom ? [r, 8, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(function(res, i) {
            var subs = res.subexpressions;
            var sub0 = '' + (isFrom ? i + 2 : i);
            var sub1 = '' + (isFrom ? i + 3 : i + 1);
            var sub2 = '' + (isFrom ? i + 4 : i + 2);
            return Array.isArray(subs) && subs.length === 3 && subs[0] === sub0 &&
                   subs[1] === sub1 && subs[2] === sub2;
          });

          expect(result).to.be.true;
        });


        it('Works correctly when RegExp has no global flag', function () {
          var s = 'banana';
          var r = /n/;
          var args = isFrom ? [r, 0, s] : [r, s];
          var result = fnUnderTest.apply(null, args);

          expect(result.length).to.equal(2);
        });


        var args = isFrom ? [/a/, 0, 'banana'] : [/a/, 'banana'];
        testCurriedFunction(desc, fnUnderTest, args);
      });
    };


    var makeSingleMatcherTests = function(desc, fnUnderTest, isFrom, multiEquivalent) {
      describe(desc, function() {
        addCommonMatcherTests(fnUnderTest, isFrom);


        it('Returns null when there are no results', function() {
          var args = isFrom ? [/a/, 0, 'b'] : [/a/, 'b'];
          var result = fnUnderTest.apply(null, args);

          expect(result === null).to.be.true;
        });


        it('Works correctly (1)', function() {
          var s = 'a cat hat mat';
          var r = /a/g;
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args);

          expect(result).to.deep.equal(multiEquivalent.apply(null, args)[0]);
        });


        it('Works correctly (2)', function() {
          var s = 'a012 bca123 defa234 gha345';
          var r = /a(\d)(\d)(\d)/g;
          var args = isFrom ? [r, 8, s] : [r, s];
          var result = fnUnderTest.apply(null, args);

          expect(result).to.deep.equal(multiEquivalent.apply(null, args)[0]);
        });


        it('Works correctly when RegExp has global flag', function () {
          var s = 'banana';
          var r = /n/g;
          var args = isFrom ? [r, 0, s] : [r, s];
          var result = fnUnderTest.apply(null, args);

          expect(result === null).to.be.false;
          expect(result.index === 2).to.be.true;
        });


        var args = isFrom ? [/a/, 4, 'banana'] : [/a/, 'banana'];
        testCurriedFunction(desc, fnUnderTest, args);
      });
    };


    makeMultiMatcherTests('matches', string.matches, false);
    makeMultiMatcherTests('matchesFrom', string.matchesFrom, true);
    makeSingleMatcherTests('firstMatch', string.firstMatch, false, string.matches);
    makeSingleMatcherTests('firstMatchFrom', string.firstMatchFrom, true, string.matchesFrom);
  };


  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      testFixture(require, exports, module);
    });
  } else {
    testFixture(require, exports, module);
  }
})();
