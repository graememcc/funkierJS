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
                             'checkIntegral', 'checkPositiveIntegral', 'checkObjectLike'];
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


    // We deliberately use describe rather than our own describeFunction here
    // due to the optional parameter
    describe('isArrayLike', function() {
      var isArrayLike = utils.isArrayLike;


      arrayLikeTests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var b = isArrayLike(t.value);
          var expected = t.result;

          expect(b).to.equal(expected);
        });
      });


      it('Behaves correctly with string when noStrings parameter explicitly false', function() {
        expect(isArrayLike('a', false)).to.be.true;
      });


      it('Behaves correctly with string when noStrings parameter explicitly true', function() {
        expect(isArrayLike('a', true)).to.be.false;
      });
    });



    // We deliberately use describe rather than our own describeFunction here
    // due to the optional parameter
    describe('checkArrayLike', function() {
      var checkArrayLike = utils.checkArrayLike;


      var shouldFail = arrayLikeTests.filter(function(test) {return test.result === false;});
      var shouldPass = arrayLikeTests.filter(function(test) {return test.result === true;});

      shouldFail.forEach(function(test) {
        var name = test.name;


        it('Behaves correctly for ' + name, function() {
          var fn = function() {
            checkArrayLike(test.value);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Returns correct exception for ' + name, function() {
          var message = 'This was an error';
          var fn = function() {
            checkArrayLike(test.value, {message: message});
          };

          expect(fn).to.throw(message);
        });
      });


      shouldPass.forEach(function(test) {
        var name = test.name;


        it('Doesn\'t throw for ' + name, function() {
          var fn = function() {
            checkArrayLike(test.value);
          };

          expect(fn).to.not.throw(TypeError);
        });


        it('Behaves correctly when dontSlice in options ' + name, function() {
          var v = checkArrayLike(test.value, {dontSlice: true});

          expect(v).to.equal(test.value);
        });


        it('Behaves correctly when dontSlice explicitly false in options ' + name, function() {
          var v = checkArrayLike(test.value, {dontSlice: false});

          if (name === 'string') {
            expect(v).to.equal(test.value);
          } else {
            expect(v).to.not.equal(test.value);
            // Need to manually check deep equality due to arraylikes being transformed to arrays
            for (var i = 0, l = test.value.length; i < l; i++)
              expect(v[i]).to.equal(test.value[i]);
          }
        });


        it('Behaves correctly when dontSlice not in options ' + name, function() {
          var v = checkArrayLike(test.value);

          if (name === 'string') {
            expect(v).to.equal(test.value);
          } else {
            expect(v).to.not.equal(test.value);
            // Need to manually check deep equality due to arraylikes being transformed to arrays
            for (var i = 0, l = test.value.length; i < l; i++)
              expect(v[i]).to.equal(test.value[i]);
          }
        });
      });


      it('Doesn\'t accept strings when relevant parameter passed in (1)', function() {
        var fn = function() {
          checkArrayLike('abc', {noStrings: true});
        };

        expect(fn).to.throw(TypeError);
      });


      it('Doesn\'t accept strings when relevant parameter passed in (2)', function() {
        var message = 'Noooo, no strings here!';
        var fn = function() {
          checkArrayLike('abc', {noStrings: true, message: message});
        };

        expect(fn).to.throw(message);
      });


      it('Accepts strings when relevant parameter explicitly passed in', function() {
        var s = checkArrayLike('abc', {noStrings: false});

        expect(s).to.equal('abc');
      });
    });


    var objectLikeTests = [
      {name: 'number', value: 1, result: false},
      {name: 'boolean', value: true, result: false},
      {name: 'string', value: 'a', result: true},
      {name: 'function', value: function() {}, result: true},
      {name: 'object', value: {}, result: true},
      {name: 'array', value: [1, 2], result: true},
      {name: 'undefined', value: undefined, result: false},
      {name: 'null', value: null, result: false}
    ];


    describe('isObjectLike', function() {
      var isObjectLike = utils.isObjectLike;


      objectLikeTests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var b = isObjectLike(t.value);
          var expected = t.result;

          expect(b).to.equal(expected);
        });
      });


      var addOptionTests = function(allowNull, strict) {
        it('Behaves correctly for null when allowNull ' + allowNull + ' and strict ' + strict, function() {
          expect(isObjectLike(null, {allowNull: allowNull, strict: strict})).to.equal(allowNull);
        });


        it('Behaves correctly for function when allowNull ' + allowNull + ' and strict ' + strict, function() {
          expect(isObjectLike(function() {}, {allowNull: allowNull, strict: strict})).to.equal(!strict);
        });


        it('Behaves correctly for string when allowNull ' + allowNull + ' and strict ' + strict, function() {
          expect(isObjectLike('a', {allowNull: allowNull, strict: strict})).to.equal(!strict);
        });


        it('Behaves correctly for array when allowNull ' + allowNull + ' and strict ' + strict, function() {
          expect(isObjectLike([1], {allowNull: allowNull, strict: strict})).to.equal(!strict);
        });


        it('Behaves correctly for object when allowNull ' + allowNull + ' and strict ' + strict, function() {
          expect(isObjectLike({}, {allowNull: allowNull, strict: strict})).to.be.true;
        });
      };


      addOptionTests(false, false);
      addOptionTests(false, true);
      addOptionTests(true, false);
      addOptionTests(true, true);
    });


    // We deliberately use describe rather than our own describeFunction here
    // due to the optional parameter
    describe('checkObjectLike', function() {
      var checkObjectLike = utils.checkObjectLike;


      var shouldFail = objectLikeTests.filter(function(test) {return test.result === false;});
      var shouldPass = objectLikeTests.filter(function(test) {return test.result === true;});

      shouldFail.forEach(function(test) {
        var name = test.name;


        it('Behaves correctly for ' + name, function() {
          var fn = function() {
            checkObjectLike(test.value);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Returns correct exception for ' + name, function() {
          var message = 'This was an error';
          var fn = function() {
            checkObjectLike(test.value, {message: message});
          };

          expect(fn).to.throw(message);
        });
      });


      shouldPass.forEach(function(test) {
        var name = test.name;


        it('Doesn\'t throw for ' + name, function() {
          var fn = function() {
            checkObjectLike(test.value);
          };

          expect(fn).to.not.throw(TypeError);
        });


        it('Returns its argument for ' + name, function() {
          expect(checkObjectLike(test.value)).to.equal(test.value);
        });
      });


      it('Doesn\'t accept null when relevant parameter explicitly passed in (1)', function() {
        var fn = function() {
          checkObjectLike(null, {allowNull: false});
        };

        expect(fn).to.throw(TypeError);
      });


      it('Doesn\'t accept null when relevant parameter explicitly passed in (2)', function() {
        var message = 'Noooo, no null here!';
        var fn = function() {
          checkObjectLike(null, {allowNull: false, message: message});
        };

        expect(fn).to.throw(message);
      });


      it('Accepts null when relevant parameter passed in', function() {
        var o = checkObjectLike(null, {allowNull: true});

        expect(o).to.equal(null);
      });


      var addStrictTests = function(type, val) {
        it('Accepts ' + type + ' when strict parameter explicitly false', function() {
          var o = checkObjectLike(val, {strict: false});

          expect(o).to.equal(val);
        });


        it('Doesn\'t accept ' + type + ' when strict parameter true (1)', function() {
          var fn = function() {
            checkObjectLike(val, {strict: true});
          };

          expect(fn).to.throw(TypeError);
        });


        it('Doesn\'t accept ' + type + ' when relevant strict parameter true (2)', function() {
          var message = 'Noooo, only objects here!';
          var fn = function() {
            checkObjectLike(val, {strict: true, message: message});
          };

          expect(fn).to.throw(message);
        });
      };


      addStrictTests('function', function() {});
      addStrictTests('string', 'abc');
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
