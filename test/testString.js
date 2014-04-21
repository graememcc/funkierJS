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
                               'replaceStringWith', 'replaceOneRegExp', 'replaceRegExp'];

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
            var fn = function() {
              fnUnderTest(from, to, s);
            };

            expect(fn).to.throw(TypeError);
          });
        } else {
          it('Does not throw if from is a regular expression', function() {
            var s = 'funkier';
            var from = /g/;
            var to = fn ? function(s) {return 'h';} : 'h';
            var fn = function() {
              fnUnderTest(from, to, s);
            };

            expect(fn).to.not.throw(TypeError);
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
            var fn = function() {
              fnUnderTest(from, to, s);
            };

            expect(fn).to.throw(TypeError);
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
