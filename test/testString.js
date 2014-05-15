(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var string = require('../string');

    var base = require('../base');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var checkArrayEquality = testUtils.checkArrayEquality;


    var expectedObjects = [];
    var expectedFunctions = ['toString', 'toCharCode', 'ord', 'chr', 'toLowerCase',
                             'toLocaleLowerCase', 'toUpperCase', 'toLocaleUpperCase',
                             'split', 'replaceOneString', 'replaceString', 'replaceOneStringWith',
                             'replaceStringWith', 'replaceOneRegExp', 'replaceRegExp',
                             'replaceRegExpWith', 'replaceOneRegExpWith', 'test', 'matches',
                             'matchesFrom', 'firstMatch', 'firstMatchFrom', 'toLocaleString'];
    describeModule('string', string, expectedObjects, expectedFunctions);


    var toStringTests = [
      {name: 'number', value: 1000},
      {name: 'string', value: 'a'},
      {name: 'boolean', value: true},
      {name: 'function', value: function() {}},
      {name: 'object', value: {}},
      {name: 'array', value: [1]},
      {name: 'date', value: new Date(2000, 0, 0)}
    ];


    var tsSpec = {
      name: 'toString',
      arity: 1
    };


    describeFunction(tsSpec, string.toString, function(toString) {
      var makeToStringTest = function(val) {
        return function() {
          expect(toString(val)).to.equal(val.toString());
        };
      };


      toStringTests.forEach(function(test) {
        it('Works correctly for ' + test.name, makeToStringTest(test.value));
      });


      it('Works correctly for object with custom toString', function() {
        var a = {toString: function() {return 'foo';}};

        expect(toString(a)).to.equal(a.toString());
      });
    });


    var toLocaleStringSpec = {
      name: 'toLocaleString',
      arity: 1
    };


    describeFunction(toLocaleStringSpec, string.toLocaleString, function(toLocaleString) {
      var makeToLocaleStringTest = function(val) {
        return function() {
          expect(toLocaleString(val)).to.equal(val.toLocaleString());
        };
      };


      toStringTests.forEach(function(test) {
        it('Works correctly for ' + test.name, makeToLocaleStringTest(test.value));
      });


      it('Works correctly for object with custom toLocaleString', function() {
        var a = {toLocaleString: function() {return 'foo';}};

        expect(toLocaleString(a)).to.equal(a.toLocaleString());
      });
    });


    var tccSpec = {
      name: 'toCharCode',
      arity: 2
    };


    describeFunction(tccSpec, string.toCharCode, function(toCharCode) {
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


    var ordSpec = {
      name: 'ord',
      arity: 1
    };


    describeFunction(ordSpec, string.ord, function(ord) {
      var addWorksTest = function(message, str) {
        it('Works correctly ' + message, function() {
          expect(ord(str)).to.equal(str.charCodeAt(0));
        });
      };


      addWorksTest('(1)', 'a');
      addWorksTest('(2)', 'F');
      addWorksTest('(3)', 'funkier');


      it('Works correctly (4)', function() {
        var a = '';

        expect(isNaN(ord(a))).to.be.true;
      });
    });


    var chrSpec = {
      name: 'chr',
      arity: 1
    };


    describeFunction(chrSpec, string.chr, function(chr) {
      var ord = string.ord;


      var addWorksTest = function(message, str) {
        it('Works correctly ' + message, function() {
          var code = ord(str);

          expect(chr(code)).to.equal(str);
        });
      };


      addWorksTest('(1)', 'a');
      addWorksTest('(1)', 'F');


      it('Discards superfluous arguments', function() {
        var a = 'a';
        var aCode = ord(a);
        var bCode = ord('b');
        var cCode = ord('c');

        expect(chr(aCode, bCode, cCode)).to.equal(a);
      });
    });


    var makeStringCaseTest = function(desc, fnUnderTest, verifier) {
      var spec = {
        name: desc,
        arity: 1
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        var addWorksTest = function(message, str) {
          it('Works correctly ' + message, function() {
            var result = fnUnderTest(str);

            expect(result).to.equal(str[verifier]());
          });
        };


        addWorksTest('(1)', 'abc');
        addWorksTest('(1)', 'ABC');
        addWorksTest('(1)', 'AbC');
      });
    };


    makeStringCaseTest('toLowerCase', string.toLowerCase, 'toLowerCase');
    makeStringCaseTest('toLocaleLowerCase', string.toLocaleLowerCase, 'toLocaleLowerCase');
    makeStringCaseTest('toUpperCase', string.toUpperCase, 'toUpperCase');
    makeStringCaseTest('toLocaleUpperCase', string.toLocaleUpperCase, 'toLocaleUpperCase');


    var splitSpec = {
      name: 'split',
      arity: 2
    };


    describeFunction(splitSpec, string.split, function(split) {
      var addReturnsArrayTest = function(message, splitStr, str) {
        it('Returns an array ' + message, function() {
          var result = split(splitStr, str);

          expect(base.isArray(result)).to.be.true;
        });
      };


      addReturnsArrayTest('(1)', '-', 'a-b-c');
      addReturnsArrayTest('(2)', '*', 'a-b-c');


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


      var addWorksCorrectlyTest = function(message, splitStr, str) {
        it('Works correctly ' + message, function() {
          var result = split(splitStr, str);

          expect(result).to.deep.equal(str.split(splitStr));
        });
      };


      addWorksCorrectlyTest('(1)', '-', 'd-e-f-g');
      addWorksCorrectlyTest('(2)', '*', 'd-e-f-g');
      addWorksCorrectlyTest('(3)', '--', 'd--e--f--g');
      addWorksCorrectlyTest('(4)', '', 'defg');
      addWorksCorrectlyTest('(5)', /--/, 'd--e--f--g');


      testCurriedFunction('split', split, ['*', 'a*b']);
    });


    var makeReplaceTest = function(desc, fnUnderTest, regexp, fn, once) {
      var spec = {
        name: desc,
        arity: 3
      };

      // XXX FIXME Need to modify testTypeRestriction to handle restriction
      // where something is not something. We don't want to clamp down too hard
      // and just say it must be a string: we should allow coercions.

      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        // XXX Delete this when the above is fixed
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


    var testSpec = {
      name: 'test',
      arity: 2,
      restrictions: [[RegExp], []],
      validArguments: [[/a/], ['a']]
    };


    describeFunction(testSpec, string.test, function(test) {
      var addReturnsBooleanTest = function(message, str) {
        it('Returns a boolean (1)', function() {
          var result = test(/a/, str);

          expect(result).to.be.a('boolean');
        });
      };


      addReturnsBooleanTest('(1)', 'b');
      addReturnsBooleanTest('(2)', 'a');


      var addWorksTest = function(message, str, expected) {
        it('Works correctly (1)', function() {
          var result = test(/a/, str);

          expect(result).to.equal(expected);
        });
      };


      addReturnsBooleanTest('(1)', 'b', false);
      addReturnsBooleanTest('(2)', 'a', true);


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


    var makeMultiMatcherTests = function(desc, fnUnderTest, isFrom) {
      var spec = {
        name: desc,
        arity: isFrom ? 3 : 2,
        restrictions: isFrom ? [[RegExp], [], []] : [[RegExp], []],
        validArguments: isFrom ? [[/a/], [1], ['abc']] : [[/a/], ['abc']]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
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
      var spec = {
        name: desc,
        arity: isFrom ? 3 : 2,
        restrictions: isFrom ? [[RegExp], [], []] : [[RegExp], []],
        validArguments: isFrom ? [[/a/], [1], ['abc']] : [[/a/], ['abc']]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        it('Returns null when there are no results', function() {
          var args = isFrom ? [/a/, 0, 'b'] : [/a/, 'b'];
          var result = fnUnderTest.apply(null, args);

          expect(result).to.equal(null);
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

          expect(result).to.not.equal(null);
          expect(result.index).to.equal(2);
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
