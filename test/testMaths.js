(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var maths = require('../maths');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var getRealArity = base.getRealArity;


    describe('Maths exports', function() {
      var expectedFunctions = ['add', 'subtract', 'multiply', 'divide', 'exp',
                               'log', 'div', 'rem', 'lessThan', 'lessThanEqual',
                               'greaterThan', 'greaterThanEqual', 'leftShift',
                               'rightShift', 'rightShiftZero', 'bitwiseAnd',
                               'bitwiseOr', 'bitwiseXor', 'bitwiseNot', 'min', 'max',
                               'toFixed', 'toExponential', 'toPrecision',
                               'toBaseAndString', 'stringToInt'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('maths.js exports \'' + f + '\' property', exportsProperty(maths, f));
        it('\'' + f + '\' property of maths.js is a function', exportsFunction(maths, f));
      });
    });


    // The binary tests will have a similar structure. Generate them automatically.
    var binaryTests = [
      {func: 'add', test1: {val1: 1, val2: 2, result: 1 + 2},
       test2: {val1: 32, val2: 10, result: 32 + 10}},
      {func: 'subtract', test1: {val1: 1, val2: 2, result: 1 - 2},
       test2: {val1: 52, val2: 10, result: 52 - 10}},
      {func: 'multiply', test1: {val1: 1, val2: 2, result: 1 * 2},
       test2: {val1: 7, val2: 6, result: 7 * 6}},
      {func: 'divide', test1: {val1: 1, val2: 2, result: 1 / 2},
       test2: {val1: 210, val2: 5, result: 210 / 5}},
      {func: 'exp', test1: {val1: 2, val2: 3, result: Math.pow(2, 3)},
       test2: {val1: 3, val2: 4, result: Math.pow(3, 4)}},
      {func: 'log', test1: {val1: 2, val2: 8, result: 3},
       test2: {val1: 10, val2: 100, result: 2}},
      {func: 'div', test1: {val1: 4, val2: 2, result: 2},
       test2: {val1: 85, val2: 2, result: 42}},
      {func: 'rem', test1: {val1: 4, val2: 2, result: 0},
       test2: {val1: 42, val2: 43, result: 42}},
      {func: 'lessThan', test1: {val1: 2, val2: 3, result: 2 < 3},
       test2: {val1: 42, val2: 41, result: 42 < 41}},
      {func: 'lessThanEqual', test1: {val1: 3, val2: 2, result: 3 <= 2},
       test2: {val1: 42, val2: 42, result: 42 <= 42}},
      {func: 'greaterThan', test1: {val1: 2, val2: 3, result: 2 > 3},
       test2: {val1: 42, val2: 41, result: 42 > 41}},
      {func: 'greaterThanEqual', test1: {val1: 2, val2: 3, result: 2 >= 3},
       test2: {val1: 42, val2: 42, result: 42 >= 42}},
      {func: 'leftShift', test1: {val1: 1, val2: 2, result: 1 << 2},
       test2: {val1: 21, val2: 1, result: 21 << 1}},
      {func: 'rightShift', test1: {val1: 2, val2: 1, result: 2 >> 1},
       test2: {val1: 168, val2: 2, result: 168 >> 2}},
      {func: 'rightShiftZero', test1: {val1: 168, val2: 2, result: 168 >>> 2},
       test2: {val1: -15, val2: 1, result: -15 >>> 1}},
      {func: 'bitwiseAnd', test1: {val1: 1, val2: 0, result: 1 & 0},
       test2: {val1: 0x3a, val2: 0x4b, result: 0x3a & 0x4b}},
      {func: 'bitwiseOr', test1: {val1: 1, val2: 0, result: 1 | 0},
       test2: {val1: 0x20, val2: 0x0a, result: 0x20 | 0xa}},
      {func: 'bitwiseXor', test1: {val1: 1, val2: 1, result: 1 ^ 1},
       test2: {val1: 0x26, val2: 0x0c, result: 0x26 ^ 0xc}}
    ];


    binaryTests.forEach(function(test) {
      describe(test.func, function() {
        var funcUnderTest = maths[test.func];
        var test1 = test.test1;
        var test2 = test.test2;

        it(test.func + ' works as expected (1)', function() {
          expect(funcUnderTest(test1.val1, test1.val2)).to.equal(test1.result);
        });


        it(test.func + ' works as expected (2)', function() {
          expect(funcUnderTest(test2.val1, test2.val2)).to.equal(test2.result);
        });


        testCurriedFunction(test.func, funcUnderTest, [3, 4]);
      });
    });


    describe('bitwiseNot', function() {
      var bitwiseNot = maths.bitwiseNot;


      it('bitwiseNot works as expected (1)', function() {
        expect(bitwiseNot(1)).to.equal(~1);
      });


      it('bitwiseNot works as expected (2)', function() {
        expect(bitwiseNot(-43)).to.equal(~(-43));
      });
    });


    describe('min', function() {
      var min = maths.min;


      it('min has arity of 2', function() {
        expect(getRealArity(min)).to.equal(2);
      });


      it('min works as expected (1)', function() {
        expect(min(1, 2)).to.equal(Math.min(1, 2));
      });


      it('min works as expected (2)', function() {
        expect(min(42, 210)).to.equal(Math.min(42, 210));
      });


      it('min discards excess arguments', function() {
        expect(min(42, 45, 1)).to.equal(Math.min(42, 45));
      });


      testCurriedFunction('min', min, [5, 4]);
    });


    describe('max', function() {
      var max = maths.max;


      it('max has arity of 2', function() {
        expect(getRealArity(max)).to.equal(2);
      });


      it('max works as expected (1)', function() {
        expect(max(1, 2)).to.equal(Math.max(1, 2));
      });


      it('max works as expected (2)', function() {
        expect(max(42, 21)).to.equal(Math.max(42, 21));
      });


      it('max discards excess arguments', function() {
        expect(max(42, 35, 1)).to.equal(Math.max(42, 35));
      });


      testCurriedFunction('max', max, [5, 4]);
    });


    var makeNumStringTest = function(desc, fnUnderTest, verifier, testData) {
      describe(desc, function() {


        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(2);
        });


        it('Returns a string', function() {
          var n = 17;
          var result = fnUnderTest(2, n);

          expect(result).to.be.a('string');
        });


        testData.forEach(function(test, i) {
          it('Works correctly (' + (i + 1) + ')', function() {
            var n = test[0];
            var param = test[1];
            var result = fnUnderTest(param, n);

            expect(result).to.equal(n[verifier](param));
          });
        });


        testCurriedFunction(desc, fnUnderTest, [testData[0][1], testData[0][0]]);
      });
    };


    var fixTests = [[17.051, 2], [17.051, 0], [17.051, 4], [17, 2]];
    makeNumStringTest('toFixed', maths.toFixed, 'toFixed', fixTests);


    var expTests = [[123.456, 1], [123.456, 2], [123.456, 0], [1, 4], [0.1, 2]];
    makeNumStringTest('toExponential', maths.toExponential, 'toExponential', expTests);


    var precisionTests = [[1, 1], [1, 2], [123.45, 2]];
    makeNumStringTest('toPrecision', maths.toPrecision, 'toPrecision', precisionTests);


    var baseTests = [[3, 2], [11, 10], [35, 36]];
    makeNumStringTest('toString', maths.toBaseAndString, 'toString', baseTests);


    describe('stringToInt', function() {
      var stringToInt = maths.stringToInt;


      it('Has correct arity', function() {
        expect(getRealArity(stringToInt)).to.equal(2);
      });


      it('Returns a number', function() {
        var s = '17';
        var result = stringToInt(10, s);

        expect(result).to.be.a('number');
      });


      it('Works correctly (1)', function() {
        var s = '10';
        var base = 10;
        var result = stringToInt(base, s);

        expect(result).to.equal(parseInt(s, base));
      });


      it('Works correctly (2)', function() {
        var s = '10';
        var base = 2;
        var result = stringToInt(base, s);

        expect(result).to.equal(parseInt(s, base));
      });


      it('Works correctly (3)', function() {
        var s = '1z';
        var base = 36;
        var result = stringToInt(base, s);

        expect(result).to.equal(parseInt(s, base));
      });


      it('Works correctly (4)', function() {
        var s = 'abc';
        var base = 2;
        var result = stringToInt(base, s);

        expect(isNaN(result)).to.be.true;
      });


      testCurriedFunction('stringToInt', stringToInt, [2, '11']);
    });
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
