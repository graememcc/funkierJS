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


    describe('Maths exports', function() {
      var expectedFunctions = ['add', 'subtract', 'multiply', 'divide', 'exp',
                               'log', 'div', 'rem', 'lessThan', 'lessThanEqual',
                               'greaterThan', 'greaterThanEqual', 'leftShift',
                               'rightShift', 'rightShiftZero', 'bitwiseAnd'];

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
       test2: {val1: 0x3a, val2: 0x4b, result: 0x3a & 0x4b}}
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
