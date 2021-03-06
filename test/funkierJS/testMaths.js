(function() {
  "use strict";


  var expect = require('chai').expect;

  var maths = require('../../lib/components/maths');

  var testUtils = require('./testingUtilities');
  var checkModule = testUtils.checkModule;
  var checkFunction = testUtils.checkFunction;


  describe('maths', function() {
    var expectedObjects = [];
    var expectedFunctions = ['add', 'bitwiseAnd', 'bitwiseNot', 'bitwiseOr', 'bitwiseXor', 'div', 'divide', 'even',
                             'exp', 'greaterThan', 'greaterThanEqual', 'leftShift', 'lessThan', 'lessThanEqual', 'log',
                             'max', 'min', 'multiply', 'odd', 'parseInt', 'rem', 'rightShift', 'rightShiftZero',
                             'stringToInt', 'subtract', 'toBaseAndString', 'toExponential', 'toFixed', 'toPrecision'];
    checkModule('maths', maths, expectedObjects, expectedFunctions);


    // The tests for the binary functions will have a similar structure. Generate them automatically.
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
      var spec = {
        name: test.func,
      };


      checkFunction(spec, maths[test.func], function(fnUnderTest) {
        var test1 = test.test1;
        var test2 = test.test2;

        it('Works as expected (1)', function() {
          expect(fnUnderTest(test1.val1, test1.val2)).to.equal(test1.result);
        });


        it('Works as expected (2)', function() {
          expect(fnUnderTest(test2.val1, test2.val2)).to.equal(test2.result);
        });


      });
    });


    var bitwiseNotSpec = {
      name: 'bitwiseNot',
      arity: 1
    };


    checkFunction(bitwiseNotSpec, maths.bitwiseNot, function(bitwiseNot) {
      it('Works as expected (1)', function() {
        expect(bitwiseNot(1)).to.equal(~1);
      });


      it('Works as expected (2)', function() {
        expect(bitwiseNot(-43)).to.equal(~(-43));
      });
    });


    var minSpec = {
      name: 'min',
      arity: 2
    };


    checkFunction(minSpec, maths.min, function(min) {
      it('Works as expected (1)', function() {
        expect(min(1, 2)).to.equal(Math.min(1, 2));
      });


      it('Works as expected (2)', function() {
        expect(min(42, 210)).to.equal(Math.min(42, 210));
      });


      it('Discards excess arguments', function() {
        expect(min(42, 45, 1)).to.equal(Math.min(42, 45));
      });
    });


    var maxSpec = {
      name: 'max',
      arity: 2
    };


    checkFunction(maxSpec, maths.max, function(max) {
      it('Works as expected (1)', function() {
        expect(max(1, 2)).to.equal(Math.max(1, 2));
      });


      it('Works as expected (2)', function() {
        expect(max(42, 21)).to.equal(Math.max(42, 21));
      });


      it('Discards excess arguments', function() {
        expect(max(42, 35, 1)).to.equal(Math.max(42, 35));
      });
    });


    var makeNumStringTest = function(desc, fnUnderTest, verifier, testData) {
      describe(desc, function() {
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


    describe('parseInt', function() {
      var parseInt = maths.parseInt;


      it('Returns a number', function() {
        var s = '17';
        var result = parseInt(s);

        expect(result).to.be.a('number');
      });


      it('Works correctly (2)', function() {
        var s = 'abc';
        var result = parseInt(s);

        expect(isNaN(result)).to.equal(true);
      });


      it('Ignores superfluous arguments', function() {
        var s = '101';
        var result = parseInt(s, 2);

        expect(result).to.equal(101);
      });
    });


    describe('stringToInt', function() {
      var stringToInt = maths.stringToInt;


      it('Returns a number', function() {
        var s = '17';
        var result = stringToInt(10, s);

        expect(result).to.be.a('number');
      });


      var addStringToIntTest = function(message, s, base) {
        it('Works correctly ' + message, function() {
          var result = stringToInt(base, s);

          expect(result).to.equal(parseInt(s, base));
        });
      };


      addStringToIntTest('(1)', '10', 10);
      addStringToIntTest('(2)', '10', 2);
      addStringToIntTest('(3)', '1z', 36);


      it('Works correctly (4)', function() {
        var s = 'abc';
        var base = 2;
        var result = stringToInt(base, s);

        expect(isNaN(result)).to.equal(true);
      });
    });


    // XXX FIXME
    var numToLocaleStringSpec = {
      name: 'numToLocaleString'
    };


    var addEvenOddTests = function(desc, fnUnderTest, isEven) {
      describe(desc, function() {
        it('Works correctly (1)', function() {
          var result = fnUnderTest(2);

          expect(result).to.equal(isEven ? true : false);
        });


        it('Works correctly (2)', function() {
          var result = fnUnderTest(3);

          expect(result).to.equal(isEven ? false : true);
        });


        it('Works correctly (3)', function() {
          var result = fnUnderTest(0);

          expect(result).to.equal(isEven ? true : false);
        });
      });
    };


    addEvenOddTests('even', maths.even, true);
    addEvenOddTests('odd', maths.odd, false);
  });
})();
