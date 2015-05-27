//(function() {
//  "use strict";
//
//
//  var testFixture = function(require, exports) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var maths = require('../../maths');
//
//    // Import utility functions
//    var testUtils = require('./testUtils');
//    var describeModule = testUtils.describeModule;
//    var describeFunction = testUtils.describeFunction;
//    var testCurriedFunction = testUtils.testCurriedFunction;
//
//
//    var expectedObjects = [];
//    var expectedFunctions = ['add', 'subtract', 'multiply', 'divide', 'exp',
//                             'log', 'div', 'rem', 'lessThan', 'lessThanEqual',
//                             'greaterThan', 'greaterThanEqual', 'leftShift',
//                             'rightShift', 'rightShiftZero', 'bitwiseAnd',
//                             'bitwiseOr', 'bitwiseXor', 'bitwiseNot', 'min', 'max',
//                             'toFixed', 'toExponential', 'toPrecision',
//                             'toBaseAndString', 'stringToInt', 'even', 'odd'];
//    describeModule('maths', maths, expectedObjects, expectedFunctions);
//
//
//    // The binary tests will have a similar structure. Generate them automatically.
//    var binaryTests = [
//      {func: 'add', test1: {val1: 1, val2: 2, result: 1 + 2},
//       test2: {val1: 32, val2: 10, result: 32 + 10}},
//      {func: 'subtract', test1: {val1: 1, val2: 2, result: 1 - 2},
//       test2: {val1: 52, val2: 10, result: 52 - 10}},
//      {func: 'multiply', test1: {val1: 1, val2: 2, result: 1 * 2},
//       test2: {val1: 7, val2: 6, result: 7 * 6}},
//      {func: 'divide', test1: {val1: 1, val2: 2, result: 1 / 2},
//       test2: {val1: 210, val2: 5, result: 210 / 5}},
//      {func: 'exp', test1: {val1: 2, val2: 3, result: Math.pow(2, 3)},
//       test2: {val1: 3, val2: 4, result: Math.pow(3, 4)}},
//      {func: 'log', test1: {val1: 2, val2: 8, result: 3},
//       test2: {val1: 10, val2: 100, result: 2}},
//      {func: 'div', test1: {val1: 4, val2: 2, result: 2},
//       test2: {val1: 85, val2: 2, result: 42}},
//      {func: 'rem', test1: {val1: 4, val2: 2, result: 0},
//       test2: {val1: 42, val2: 43, result: 42}},
//      {func: 'lessThan', test1: {val1: 2, val2: 3, result: 2 < 3},
//       test2: {val1: 42, val2: 41, result: 42 < 41}},
//      {func: 'lessThanEqual', test1: {val1: 3, val2: 2, result: 3 <= 2},
//       test2: {val1: 42, val2: 42, result: 42 <= 42}},
//      {func: 'greaterThan', test1: {val1: 2, val2: 3, result: 2 > 3},
//       test2: {val1: 42, val2: 41, result: 42 > 41}},
//      {func: 'greaterThanEqual', test1: {val1: 2, val2: 3, result: 2 >= 3},
//       test2: {val1: 42, val2: 42, result: 42 >= 42}},
//      {func: 'leftShift', test1: {val1: 1, val2: 2, result: 1 << 2},
//       test2: {val1: 21, val2: 1, result: 21 << 1}},
//      {func: 'rightShift', test1: {val1: 2, val2: 1, result: 2 >> 1},
//       test2: {val1: 168, val2: 2, result: 168 >> 2}},
//      {func: 'rightShiftZero', test1: {val1: 168, val2: 2, result: 168 >>> 2},
//       test2: {val1: -15, val2: 1, result: -15 >>> 1}},
//      {func: 'bitwiseAnd', test1: {val1: 1, val2: 0, result: 1 & 0},
//       test2: {val1: 0x3a, val2: 0x4b, result: 0x3a & 0x4b}},
//      {func: 'bitwiseOr', test1: {val1: 1, val2: 0, result: 1 | 0},
//       test2: {val1: 0x20, val2: 0x0a, result: 0x20 | 0xa}},
//      {func: 'bitwiseXor', test1: {val1: 1, val2: 1, result: 1 ^ 1},
//       test2: {val1: 0x26, val2: 0x0c, result: 0x26 ^ 0xc}}
//    ];
//
//
//    binaryTests.forEach(function(test) {
//      var spec = {
//        name: test.func,
//        arity: 2
//      };
//
//      describeFunction(spec, maths[test.func], function(fnUnderTest) {
//        var test1 = test.test1;
//        var test2 = test.test2;
//
//        it('Works as expected (1)', function() {
//          expect(fnUnderTest(test1.val1, test1.val2)).to.equal(test1.result);
//        });
//
//
//        it('Works as expected (2)', function() {
//          expect(fnUnderTest(test2.val1, test2.val2)).to.equal(test2.result);
//        });
//
//
//        testCurriedFunction(fnUnderTest, [3, 4]);
//      });
//    });
//
//
//    var bitwiseNotSpec = {
//      name: 'bitwiseNot',
//      arity: 1
//    };
//
//
//    describeFunction(bitwiseNotSpec, maths.bitwiseNot, function(bitwiseNot) {
//      it('Works as expected (1)', function() {
//        expect(bitwiseNot(1)).to.equal(~1);
//      });
//
//
//      it('Works as expected (2)', function() {
//        expect(bitwiseNot(-43)).to.equal(~(-43));
//      });
//    });
//
//
//    var minSpec = {
//      name: 'min',
//      arity: 2
//    };
//
//
//    describeFunction(minSpec, maths.min, function(min) {
//      it('Works as expected (1)', function() {
//        expect(min(1, 2)).to.equal(Math.min(1, 2));
//      });
//
//
//      it('Works as expected (2)', function() {
//        expect(min(42, 210)).to.equal(Math.min(42, 210));
//      });
//
//
//      it('Discards excess arguments', function() {
//        expect(min(42, 45, 1)).to.equal(Math.min(42, 45));
//      });
//
//
//      testCurriedFunction(min, [5, 4]);
//    });
//
//
//    var maxSpec = {
//      name: 'max',
//      arity: 2
//    };
//
//
//    describeFunction(maxSpec, maths.max, function(max) {
//      it('Works as expected (1)', function() {
//        expect(max(1, 2)).to.equal(Math.max(1, 2));
//      });
//
//
//      it('Works as expected (2)', function() {
//        expect(max(42, 21)).to.equal(Math.max(42, 21));
//      });
//
//
//      it('Discards excess arguments', function() {
//        expect(max(42, 35, 1)).to.equal(Math.max(42, 35));
//      });
//
//
//      testCurriedFunction(max, [5, 4]);
//    });
//
//
//    var makeNumStringTest = function(desc, fnUnderTest, verifier, testData) {
//      var spec = {
//        name: desc,
//        arity: 2
//      };
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        it('Returns a string', function() {
//          var n = 17;
//          var result = fnUnderTest(2, n);
//
//          expect(result).to.be.a('string');
//        });
//
//
//        testData.forEach(function(test, i) {
//          it('Works correctly (' + (i + 1) + ')', function() {
//            var n = test[0];
//            var param = test[1];
//            var result = fnUnderTest(param, n);
//
//            expect(result).to.equal(n[verifier](param));
//          });
//        });
//
//
//        testCurriedFunction(fnUnderTest, [testData[0][1], testData[0][0]]);
//      });
//    };
//
//
//    var fixTests = [[17.051, 2], [17.051, 0], [17.051, 4], [17, 2]];
//    makeNumStringTest('toFixed', maths.toFixed, 'toFixed', fixTests);
//
//
//    var expTests = [[123.456, 1], [123.456, 2], [123.456, 0], [1, 4], [0.1, 2]];
//    makeNumStringTest('toExponential', maths.toExponential, 'toExponential', expTests);
//
//
//    var precisionTests = [[1, 1], [1, 2], [123.45, 2]];
//    makeNumStringTest('toPrecision', maths.toPrecision, 'toPrecision', precisionTests);
//
//
//    var baseTests = [[3, 2], [11, 10], [35, 36]];
//    makeNumStringTest('toString', maths.toBaseAndString, 'toString', baseTests);
//
//
//    var stringToIntSpec = {
//      name: 'stringToInt',
//      arity: 2
//    };
//
//
//    describeFunction(stringToIntSpec, maths.stringToInt, function(stringToInt) {
//      it('Returns a number', function() {
//        var s = '17';
//        var result = stringToInt(10, s);
//
//        expect(result).to.be.a('number');
//      });
//
//
//      var addStringToIntTest = function(message, s, base) {
//        it('Works correctly ' + message, function() {
//          var result = stringToInt(base, s);
//
//          expect(result).to.equal(parseInt(s, base));
//        });
//      };
//
//
//      addStringToIntTest('(1)', '10', 10);
//      addStringToIntTest('(2)', '10', 2);
//      addStringToIntTest('(3)', '1z', 36);
//
//
//      it('Works correctly (4)', function() {
//        var s = 'abc';
//        var base = 2;
//        var result = stringToInt(base, s);
//
//        expect(isNaN(result)).to.equal(true);
//      });
//
//
//      testCurriedFunction(stringToInt, [2, '11']);
//    });
//
//
//    var numToLocaleStringSpec = {
//      name: 'numToLocaleString',
//      arity: 1
//    };
//
//
//    var addEvenOddTests = function(desc, fnUnderTest, isEven) {
//      var spec = {
//        name: desc,
//        arity: 1
//      };
//
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        it('Works correctly (1)', function() {
//          var result = fnUnderTest(2);
//
//          expect(result).to.equal(isEven ? true : false);
//        });
//
//
//        it('Works correctly (2)', function() {
//          var result = fnUnderTest(3);
//
//          expect(result).to.equal(isEven ? false : true);
//        });
//
//
//        it('Works correctly (3)', function() {
//          var result = fnUnderTest(0);
//
//          expect(result).to.equal(isEven ? true : false);
//        });
//      });
//    };
//
//
//    addEvenOddTests('even', maths.even, true);
//    addEvenOddTests('odd', maths.odd, false);
//  };
//
//
//  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
//  if (typeof(define) === "function") {
//    define(function(require, exports, module) {
//      testFixture(require, exports, module);
//    });
//  } else {
//    testFixture(require, exports, module);
//  }
//})();
