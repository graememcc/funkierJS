(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var utils = require('../utils');

    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;


    var expectedObjects = [];
    var expectedFunctions = ['valueStringifier', 'isArrayLike', 'checkArrayLike', 'isObjectLike',
                             'checkIntegral', 'checkPositiveIntegral'];
    describeModule('utils', utils, expectedObjects, expectedFunctions);


    var vsSpec = {
      name: 'valueStringifier',
      arity: 1
    };


    describeFunction(vsSpec, utils.valueStringifier, function(valueStringifier) {
      var f = function() {};
      var o = {};
      var tests = [
        {name: 'number', value: 1, result: '1'},
        {name: 'boolean', value: true, result: 'true'},
        {name: 'string', value: 'a', result: '\'a\''},
        {name: 'function', value: f, result: f.toString()},
        {name: 'object', value: o, result: '{' + o.toString() + '}'},
        {name: 'object with toString', value: {toString: function() {return '***';}},
                                       result: '{***}'},
        {name: 'array', value: [1, 2], result: '[1, 2]'},
        {name: 'undefined', value: undefined, result: 'undefined'},
        {name: 'null', value: null, result: 'null'}
      ];


      tests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var s = valueStringifier(t.value);
          var expected = t.result;

          expect(s).to.equal(expected);
        });
      });
    });


    var arrayLikeTests = [
      {name: 'number', value: 1, result: false},
      {name: 'boolean', value: true, result: false},
      {name: 'string', value: 'a', result: true},
      {name: 'function', value: function() {}, result: false},
      {name: 'object', value: {}, result: false},
      {name: 'array', value: [1, 2], result: true},
      {name: 'undefined', value: undefined, result: false},
      {name: 'null', value: null, result: false},
      {name: 'arrayLike', value: {'0': 'a', '1': 'b', 'length': 2}, result: true}
    ];


    var ialSpec = {
      name: 'isArrayLike',
      arity: 1
    };


    describeFunction(ialSpec, utils.isArrayLike, function(isArrayLike) {
      arrayLikeTests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var b = isArrayLike(t.value);
          var expected = t.result;

          expect(b).to.equal(expected);
        });
      });
    });


    var calSpec = {
      name: 'checkArrayLike',
      arity: 1
    };


    describeFunction(calSpec, utils.checkArrayLike, function(checkArrayLike) {
      arrayLikeTests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var v;
          var fn = function() {
            v = checkArrayLike(t.value);
          };

          if (t.result) {
            expect(fn).to.not.throw(TypeError);
            for (var i = 0, l = t.value.length; i < t; i++)
              expect(v[i] === t.value[i]).to.be.true;

            if (t.name === 'string')
              expect(v === t.value).to.be.true;
            else
              expect(v !== t.value).to.be.true;
          } else {
            expect(fn).to.throw(TypeError);
          }
        });
      });
    });


    var iolSpec = {
      name: 'isObjectLike',
      arity: 1
    };


    describeFunction(iolSpec, utils.isObjectLike, function(isObjectLike) {
      var tests = [
        {name: 'number', value: 1, result: false},
        {name: 'boolean', value: true, result: false},
        {name: 'string', value: 'a', result: true},
        {name: 'function', value: function() {}, result: true},
        {name: 'object', value: {}, result: true},
        {name: 'array', value: [1, 2], result: true},
        {name: 'undefined', value: undefined, result: false},
        {name: 'null', value: null, result: false}
      ];


      tests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var b = isObjectLike(t.value);
          var expected = t.result;

          expect(b).to.equal(expected);
        });
      });
    });


    // The following arrays are for generating tests that exercise checkIntegral/checkPositiveIntegral

    var notNumericTests = [
      {name: 'string', value: 'a'},
      {name: 'function', value: function() {}},
      {name: 'object', value: {}},
      {name: 'array', value: [1, 2]},
      {name: 'undefined', value: undefined}
    ];


    var nonIntegralTests = [
      {name: 'NaN', value: NaN, result: false},
      {name: 'negative infinity', value: Number.NEGATIVE_INFINITY, result: false},
      {name: 'positive infinity', value: Number.POSITIVE_INFINITY, result: false},
      {name: 'negative float', value: -1.1, result: false},
      {name: 'float', value: 2.2, result: false},
      {name: 'string containing float', value: '0.1', result: false},
      {name: 'object evaluating to float', value: {valueOf: function() {return 1.1;}}, result: false},
    ];


    var positiveIntegralTests = [
      {name: 'integer', value: 2, result: true},
      {name: 'null', value: null, result: true}, // null coerces to 0
      {name: 'true', value: true, result: true}, // booleans should coerce to numbers
      {name: 'false', value: false, result: true},
      {name: 'string containing positive integer', value: '1', result: true},
      {name: 'object evaluating to positive integer', value: {valueOf: function() {return 2;}}, result: true},
    ];


    var negativeIntegralTests = [
      {name: 'negative integer', value: -5, result: false},
      {name: 'string containing negative integer', value: '-1', result: true},
      {name: 'object evaluating to negative integer', value: {valueOf: function() {return -3;}}, result: true},
    ];


    // All the tests for the numeric tests will have the same shape, and use the same data
    var addNumericTests = function(fnUnderTest, positiveOnly) {
      var addOne = function(name, value, ok) {
        it('Behaves correctly for ' + name, function() {
          var result = null;
          var fn = function() {
            result = fnUnderTest(value);
          };

          if (!ok) {
            expect(fn).to.throw(TypeError);
          } else {
            expect(fn).to.not.throw(TypeError);
            expect(result).to.equal(value - 0);
          }
        });


        if (ok)
          return;


        it('Returns correct exception for ' + name, function() {
          var message = 'This was an error';
          var fn = function() {
            fnUnderTest(value, message);
          };

          expect(fn).to.throw(message);
        });
      };


      notNumericTests.forEach(function(t) {
        addOne(t.name, t.value, false);
      });


      nonIntegralTests.forEach(function(t) {
        addOne(t.name, t.value, false);
      });


      positiveIntegralTests.forEach(function(t) {
        addOne(t.name, t.value, true);
      });


      negativeIntegralTests.forEach(function(t) {
        addOne(t.name, t.value, !positiveOnly);
      });
    };


    // We deliberately use describe rather than our own describeFunction here
    // due to the optional parameter
    describe('checkIntegral', function() {
      var checkIntegral = utils.checkIntegral;


      addNumericTests(checkIntegral, false);
    });


    describe('checkPositiveIntegral', function() {
      var checkPositiveIntegral = utils.checkPositiveIntegral;


      addNumericTests(checkPositiveIntegral, true);
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
