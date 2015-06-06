(function() {
  "use strict";


  var expect = require('chai').expect;

  var string = require('../../lib/components/string');

  var types = require('../../lib/components/types');
  var isArray = types.isArray;

  var testingUtilities = require('./testingUtilities');
  var checkModule = testingUtilities.checkModule;
  var checkFunction = testingUtilities.checkFunction;

  describe('string', function() {
    var expectedObjects = [];
    var expectedFunctions = ['chr', 'firstMatch', 'firstMatchFrom', 'matches', 'matchesFrom', 'ord', 'regExpSplit',
                             'regExpSplitMax',  /*'replaceOneString', 'replaceOneStringWith', 'replaceString',
                             'replaceStringWith',*/ 'split', 'splitMax', 'test', 'toCharCode', 'toLocaleLowerCase',
                             'toLocaleString', 'toLocaleUpperCase', 'toLowerCase', 'toString', 'toUpperCase', 'trim'];
    checkModule('string', string, expectedObjects, expectedFunctions);


    var toStringTests = [
      {name: 'number', value: 1000},
      {name: 'string', value: 'a'},
      {name: 'boolean', value: true},
      {name: 'function', value: function() {}},
      {name: 'object', value: {}},
      {name: 'array', value: [1]},
      {name: 'date', value: new Date(2000, 0, 0)}
    ];


    describe('toString', function() {
      var toString = string.toString;


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


    describe('toLocaleString', function() {
      var toLocaleString = string.toLocaleString;


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


    describe('toCharCode', function() {
      var toCharCode = string.toCharCode;


      it('Works correctly (1)', function() {
        var a = 'abc';
        var l = a.length;

        for (var i = 0; i < l; i++)
          expect(toCharCode(i, a)).to.equal(a.charCodeAt(i));
      });


      it('Works correctly (2)', function() {
        var a = 'abc';

        expect(isNaN(toCharCode(10, a))).to.equal(true);
      });
    });


    describe('ord', function() {
      var ord = string.ord;


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

        expect(isNaN(ord(a))).to.equal(true);
      });
    });


    describe('chr', function() {
      var ord = string.ord;
      var chr = string.chr;


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
      describe(desc, function() {
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
      restrictions: [['string'], ['string']],
      validArguments: [['a'], ['banana']]
    };


    checkFunction(splitSpec, string.split, function(split) {
      var addReturnsArrayTest = function(message, splitStr, str) {
        it('Returns an array ' + message, function() {
          var result = split(splitStr, str);

          expect(isArray(result)).to.equal(true);
        });
      };


      addReturnsArrayTest('(1)', '-', 'a-b-c');
      addReturnsArrayTest('(2)', '*', 'a-b-c');


      it('Splitting string not present in results (1)', function() {
        var s = 'a-b-c';
        var result = split('-', s).every(function(sp) {
          return sp !== '-';
        });

        expect(result).to.equal(true);
      });


      it('Splitting string not present in results (2)', function() {
        var s = 'a-b-c';
        var result = split('-', s).every(function(sp) {
          return sp.indexOf('-') === -1;
        });

        expect(result).to.equal(true);
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
      addWorksCorrectlyTest('(5)', '--', 'd--e--f--g');
    });


    var regExpSplitSpec = {
      name: 'regExpSplit',
      restrictions: [[RegExp], ['string']],
      validArguments: [[/a/], ['banana']]
    };


    checkFunction(regExpSplitSpec, string.regExpSplit, function(regExpSplit) {
      var addReturnsArrayTest = function(message, pattern, str) {
        it('Returns an array ' + message, function() {
          var result = regExpSplit(pattern, str);

          expect(isArray(result)).to.equal(true);
        });
      };


      addReturnsArrayTest('(1)', /-/, 'a-b-c');
      addReturnsArrayTest('(2)', /\*/, 'a-b-c');


      it('Matched pattern not present in results (1)', function() {
        var s = 'a-b-c';
        var result = regExpSplit(/-/, s).every(function(sp) {
          return sp !== '-';
        });

        expect(result).to.equal(true);
      });


      it('Matched pattern not present in results (2)', function() {
        var s = 'a-b-c';
        var result = regExpSplit(/-/, s).every(function(sp) {
          return sp.indexOf('-') === -1;
        });

        expect(result).to.equal(true);
      });


      var addWorksCorrectlyTest = function(message, pattern, str) {
        it('Works correctly ' + message, function() {
          var result = regExpSplit(pattern, str);

          expect(result).to.deep.equal(str.split(pattern));
        });
      };


      addWorksCorrectlyTest('(1)', /-/, 'd-e-f-g');
      addWorksCorrectlyTest('(2)', /\*/, 'd-e-f-g');
      addWorksCorrectlyTest('(3)', /-{1}/, 'd--e--f--g');
    });


    var splitMaxSpec = {
      name: 'splitMax',
      restrictions: [['string'], ['integer'], ['string']],
      validArguments: [['a'], [2], ['banana']]
    };


    checkFunction(splitMaxSpec, string.splitMax, function(splitMax) {
      var addReturnsArrayTest = function(message, splitStr, str) {
        it('Returns an array ' + message, function() {
          var result = splitMax(splitStr, 1, str);

          expect(isArray(result)).to.equal(true);
        });
      };


      addReturnsArrayTest('(1)', '-', 'a-b-c');
      addReturnsArrayTest('(2)', '*', 'a-b-c');


      it('Splitting string not present in results (1)', function() {
        var s = 'a-b-c';
        var result = splitMax('-', 10, s).every(function(sp) {
          return sp !== '-';
        });

        expect(result).to.equal(true);
      });


      it('Splitting string not present in results (2)', function() {
        var s = 'a-b-c';
        var result = splitMax('-', 10, s).every(function(sp) {
          return sp.indexOf('-') === -1;
        });

        expect(result).to.equal(true);
      });


      var addWorksCorrectlyTest = function(message, splitStr, limit, str) {
        it('Works correctly ' + message, function() {
          var result = splitMax(splitStr, limit, str);

          expect(result).to.deep.equal(str.split(splitStr, limit));
        });
      };


      addWorksCorrectlyTest('(1)', '-', 10, 'd-e-f-g');
      addWorksCorrectlyTest('(2)', '-', 1, 'd-e-f-g');
      addWorksCorrectlyTest('(3)', '*', 2, 'd-e-f-g');
      addWorksCorrectlyTest('(4)', '--', 4, 'd--e--f--g');
      addWorksCorrectlyTest('(5)', '', 2, 'defg');
    });


    var regExpSplitMaxSpec = {
      name: 'regExpSplitMax',
      restrictions: [[RegExp], ['integer'], ['string']],
      validArguments: [[/a/], [10], ['banana']]
    };


    checkFunction(regExpSplitMaxSpec, string.regExpSplitMax, function(regExpSplitMax) {
      var addReturnsArrayTest = function(message, pattern, str) {
        it('Returns an array ' + message, function() {
          var result = regExpSplitMax(pattern, 10, str);

          expect(isArray(result)).to.equal(true);
        });
      };


      addReturnsArrayTest('(1)', /-/, 'a-b-c');
      addReturnsArrayTest('(2)', /\*/, 'a-b-c');


      it('Matched pattern not present in results (1)', function() {
        var s = 'a-b-c';
        var result = regExpSplitMax(/-/, 10, s).every(function(sp) {
          return sp !== '-';
        });

        expect(result).to.equal(true);
      });


      it('Matched pattern not present in results (2)', function() {
        var s = 'a-b-c';
        var result = regExpSplitMax(/-/, 10, s).every(function(sp) {
          return sp.indexOf('-') === -1;
        });

        expect(result).to.equal(true);
      });


      var addWorksCorrectlyTest = function(message, pattern, limit, str) {
        it('Works correctly ' + message, function() {
          var result = regExpSplitMax(pattern, limit, str);

          expect(result).to.deep.equal(str.split(pattern, limit));
        });
      };


      addWorksCorrectlyTest('(1)', /-/, 10, 'd-e-f-g');
      addWorksCorrectlyTest('(2)', /-/, 2, 'd-e-f-g');
      addWorksCorrectlyTest('(3)', /\*/, 4, 'd-e-f-g');
      addWorksCorrectlyTest('(4)', /-{1}/, 3, 'd--e--f--g');
    });


    /*
     * The search and modification tests are not yet ready for implementation: the API needs to be finalized

    var makeReplaceTest = function(desc, fnUnderTest, fn, once) {
      var spec = {
        name: desc,
        arity: 3
      };


      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
        var invalids = [
          {name: 'number', value: 42},
          {name: 'boolean', value: false},
          {name: 'null', value: null},
          {name: 'undefined', value: undefined},
          {name: 'object', value: {}},
          {name: 'array', value: []}
        ];


        var nonRegExpes = invalids.concat([
          {name: 'string', value: 'abc'},
          {name: 'function', value: function() {}}
        ]);

        nonRegExpes.forEach(function(test) {
          it('Throws if from is a ' + test.name, function() {
            var s = 'funkier';
            var to = fn ? function(s) {return 'h';} : 'h';
            var f = function() {
              fnUnderTest(test.value, to, s);
            };

            expect(f).to.throw(TypeError);
          });
        });


        if (!fn) {
          var nonStrings = invalids.concat([
            {name: 'function', value: function() {return 'abc';}}
          ]);

          nonStrings.forEach(function(test) {
            it('Throws if replacement is a ' + test.name, function() {
              var s = 'funkier';
              var from = /u/;
              var f = function() {
                fnUnderTest(from, test.value, s);
              };

              expect(f).to.throw(TypeError);
            });
          });


          // If argument 2 isn't a function, then it's a string. Test the various
          //  special characters.

          it('Respects meaning of $1 in replacement', function() {
            var s = 'bana';
            var from = /(na)/;
            var to = '$1$1';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('banana');
          });


          it('Respects meaning of $& in replacement', function() {
            var s = 'ba';
            var from = /ba/;
            var to = 'ab$&';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('abba');
          });


          it('Respects meaning of $` in replacement', function() {
            var s = 'can-';
            var from = /-/;
            var to = '-$`';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('can-can');
          });


          it('Respects meaning of $\' in replacement', function() {
            var s = 'bana';
            var from = /ba/;
            var to = 'ba$\'';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('banana');
          });


          it('Respects meaning of $$ in replacement', function() {
            var s = 'let\'s make some dollar';
            var from = /dollar/;
            var to = '$$';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('let\'s make some $');
          });
        } else {
          var nonFunctions = invalids.concat([
            {name: 'string', value: 'abc'}
          ]);

          nonFunctions.forEach(function(test) {
            it('Throws if replacement is a ' + test.name, function() {
              var s = 'funkier';
              var from = /u/;
              var f = function() {
                fnUnderTest(from, test.value, s);
              };

              expect(f).to.throw(TypeError);
            });
          });


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


          it('Calls replacement function with matched substring', function() {
            var s = 'funkier';
            var from = /f/;
            var to = function(s) {to.s = s; return 'g';};
            to.s = null;
            var result = fnUnderTest(from, to, s);

            expect(to.s).to.equal('f');
          });
        }


        it('Returns original string when no matches found', function() {
          var s = 'funkier';
          var from = /g/;
          var to = fn ? function(s) {return 'h';} : 'h';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal(s);
        });


        it('Works correctly', function() {
          var s = 'funkier';
          var from = /f/;
          var to = fn ? function(s) {return 'g';} : 'g';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal('gunkier');
        });


        it('Replaces leftmost', function() {
          var s = 'bannna';
          var from = /nn/;
          var to = fn ? function(s) {return 'na';} : 'na';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal('banana');
        });


        it('Deletes if replacement is empty', function() {
          var s = 'funkier';
          var from = /u/;
          var to = fn ? function(s) {return '';} : '';
          var result = fnUnderTest(from, to, s);

          expect(result).to.equal('fnkier');
        });


        if (once) {
          it('Replaces exactly one instance when found', function() {
            var s = 'banana';
            var from = /a/;
            var to = fn ? function(s) {return 'i';} : 'i';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('binana');
          });


          it('Ignores global flag on regexp', function() {
            var s = 'banana';
            var from = /a/g;
            var to = fn ? function(s) {return 'i';} : 'i';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('binana');
          });
        } else {
          it('Replaces all instances found', function() {
            var s = 'banana';
            var from = /a/g;
            var to = fn ? function(s) {return 'i';} : 'i';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('binini');
          });


          it('Works correctly when replacement text matches', function() {
            var s = 'banana';
            var from = /a/g;
            var to = fn ? function(s) {return 'ai';} : 'ai';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('bainainai');
          });


          it('Works irrespective of regexp global flag', function() {
            var s = 'banana';
            var from = /a/;
            var to = fn ? function(s) {return 'i';} : 'i';
            var result = fnUnderTest(from, to, s);

            expect(result).to.equal('binini');
          });
        }
      });
    };

    makeReplaceTest('replaceOneString', string.replaceOneString, false, true);
    makeReplaceTest('replaceString', string.replaceString, false, false);
    makeReplaceTest('replaceOneStringWith', string.replaceOneStringWith, true, true);
    makeReplaceTest('replaceStringWith', string.replaceStringWith, true, false);
    */


    var testSpec = {
      name: 'test',
      restrictions: [[RegExp], []],
      validArguments: [[/a/], ['a']]
    };


    checkFunction(testSpec, string.test, function(test) {
      var invalids = [
        {name: 'number', value: 42},
        {name: 'boolean', value: false},
        {name: 'null', value: null},
        {name: 'undefined', value: undefined},
        {name: 'object', value: {}},
        {name: 'array', value: []},
        {name: 'function', value: function() {}}
      ];


      var nonRegExpes = invalids.concat([
        {name: 'string', value: 'abc'},
      ]);

      nonRegExpes.forEach(function(test) {
        it('Throws when first parameter is a ' + test.name, function() {
          var fn = function() {
            test(test.value, 'foo');
          };

          expect(fn).to.throw(TypeError);
        });
      });


      invalids.forEach(function(test) {
        it('Throws when second parameter is a ' + test.name, function() {
          var fn = function() {
            test(/a/, test.value);
          };

          expect(fn).to.throw(TypeError);
        });
      });


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
        restrictions: isFrom ? [[RegExp], [], []] : [[RegExp], []],
        validArguments: isFrom ? [[/a/], [1], ['abc']] : [[/a/], ['abc']]
      };


      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
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

          expect(result).to.equal(true);
        });


        it('All results have correct matched text (1)', function() {
          var s = 'a cat hat mat';
          var r = /a/g;
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(function(obj) {
            return obj.matchedText === 'a';
          });

          expect(result).to.equal(true);
        });


        it('All results have correct index (1)', function() {
          var s = 'a cat hat mat';
          var r = /a/g;
          var indices = [0, 3, 7, 11];
          var args = isFrom ? [r, 5, s] : [r, s];
          var result = fnUnderTest.apply(null, args).every(function(obj, i) {
            return obj.index === (isFrom ? indices[i + 2]  - 5 : indices[i]);
          });

          expect(result).to.equal(true);
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

          expect(result).to.equal(true);
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

          expect(result).to.equal(true);
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

          expect(result).to.equal(true);
        });


        it('All results have correct index (2)', function() {
          var s = 'a012 bca123 defa234 gha345';
          var r = /a(\d)(\d)(\d)/g;
          var args = isFrom ? [r, 8, s] : [r, s];
          var indices = [0, 7, 15, 22];
          var result = fnUnderTest.apply(null, args).every(function(obj, i) {
            return obj.index === (isFrom ? indices[i + 2] - 8 : indices[i]);
          });

          expect(result).to.equal(true);
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

          expect(result).to.equal(true);
        });


        it('Works correctly when RegExp has no global flag', function () {
          var s = 'banana';
          var r = /n/;
          var args = isFrom ? [r, 0, s] : [r, s];
          var result = fnUnderTest.apply(null, args);

          expect(result.length).to.equal(2);
        });
      });
    };


    var makeSingleMatcherTests = function(desc, fnUnderTest, isFrom, multiEquivalent) {
      var spec = {
        name: desc,
        arity: isFrom ? 3 : 2,
        restrictions: isFrom ? [[RegExp], [], []] : [[RegExp], []],
        validArguments: isFrom ? [[/a/], [1], ['abc']] : [[/a/], ['abc']]
      };


      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
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
      });
    };


    makeMultiMatcherTests('matches', string.matches, false);
    makeMultiMatcherTests('matchesFrom', string.matchesFrom, true);
    makeSingleMatcherTests('firstMatch', string.firstMatch, false, string.matches);
    makeSingleMatcherTests('firstMatchFrom', string.firstMatchFrom, true, string.matchesFrom);


    describe('trim', function() {
      var trim = string.trim;


      var addWorksCorrectlyTest = function(message, str) {
        it('Works correctly ' + message, function() {
          var result = trim(str);

          expect(result).to.equal(str.trim());
        });
      };


      addWorksCorrectlyTest('(1)', 'abc');
      addWorksCorrectlyTest('(2)', '  abc');
      addWorksCorrectlyTest('(3)', 'abc  ');
      addWorksCorrectlyTest('(4)', '  abc  ');
    });
  });
})();
