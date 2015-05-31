(function() {
  "use strict";


  var internalUtilities = require('../../lib/internalUtilities');
  var expect = require('chai').expect;
  var checkModule = require('./testingUtilities').checkModule;


  describe('internalUtilities', function() {
    checkModule('internalUtilities', internalUtilities, {
                expectedFunctions: ['checkIntegral', 'checkPositiveIntegral', 'isArrayLike', 'valueStringifier']});


    /*
     * The tests for checkPositiveIntegral and checkIntegral have broadly the same shape: they must both either return
     * the given argument, or throw an exception. This function automatically installs those tests with the correct
     * expectations based on the function under tests. This test generation function will exercise the function under
     * test in both its strict (accepts only numbers) and relaxed (accepts values that coerce to numbers) forms.
     *
     */

    var addNumericTests = function(fnUnderTest, options) {
      options = options || {};
      var acceptOnlyPositive = options.positiveOnly;

      var addSingleTest = function(type, value, shouldAcceptValue, functionOptions) {
        functionOptions = functionOptions || {};

        // Confirm that the function under test either returns the given value or throws a type error
        it('Behaves correctly for ' + type, function() {
          var result = null;
          var fn = function() {
            result = fnUnderTest(value, functionOptions);
          };

          if (shouldAcceptValue) {
            expect(fn).to.not.throw(TypeError);
            // Coerce the value for comparison when necessary
            expect(result).to.equal(value - 0);
          } else {
            expect(fn).to.throw(TypeError);
          }
        });

        if (shouldAcceptValue)
          return;

        // Confirm that the exception thrown is a TypeError
        it('Returns correct exception for ' + type, function() {
          var message = 'This was an error';
          // Be mindful of the existing options: keep them in the prototype chain
          var opts = Object.create(functionOptions);
          opts.errorMessage = message;
          var fn = function() {
            fnUnderTest(value, opts);
          };

          expect(fn).to.throw(message);
        });
      };

      var checkAcceptsValue = function(type, value, options) {
        addSingleTest(type, value, true, options);
      };

      var checkRejectsValue = function(type, value, options) {
        addSingleTest(type, value, false, options);
      };

      var notNumericTests = [
        {type: 'string', value: 'a'},
        {type: 'function', value: function() {}},
        {type: 'object', value: {}},
        {type: 'array', value: [1, 2]},
        {type: 'undefined', value: undefined}
      ];

      var nonIntegralTests = [
        {type: 'NaN', value: NaN},
        {type: 'negative infinity', value: Number.NEGATIVE_INFINITY},
        {type: 'positive infinity', value: Number.POSITIVE_INFINITY},
        {type: 'negative float', value: -1.1},
        {type: 'float', value: 2.2},
        {type: 'string containing float', value: '0.1'},
        {type: 'object evaluating to float', value: {valueOf: function() {return 1.1;}}},
        {type: 'object evaluating to float via string', value: {valueOf: function() {return '1.1';}}}
      ];

      var positiveIntegralTests = [
        {type: 'integer', value: 2},
        {type: 'integer expressed as a float', value: 3.0},
        {type: 'negative zero', value: -0.0}
      ];

      var coerciblePositiveTests = [
        {type: 'null', value: null}, // null coerces to 0
        {type: 'true', value: true}, // booleans should coerce to numbers
        {type: 'false', value: false},
        {type: 'string containing positive integer', value: '1'},
        {type: 'object evaluating to positive integer', value: {valueOf: function() {return 2;}}},
        {type: 'object evaluating to positive integer via string', value: {valueOf: function() {return '2';}}},
        {type: 'object evaluating to positive integer via boolean', value: {valueOf: function() {return true;}}},
        {type: 'object evaluating to positive integer via null', value: {valueOf: function() {return null;}}}
      ];

      var negativeIntegralTests = [
        {type: 'negative integer', value: -5}
      ];

      var coercibleNegativeTests = [
        {type: 'string containing negative integer', value: '-1'},
        {type: 'object evaluating to negative integer', value: {valueOf: function() {return -3;}}},
        {type: 'object evaluating to negative integer via string', value: {valueOf: function() {return '-2';}}}
      ];


      // Neither function should accept values that are not numbers
      notNumericTests.forEach(function(t) {
        checkRejectsValue(t.type, t.value);
      });


      // Neither function should accept values that are not integral numbers
      nonIntegralTests.forEach(function(t) {
        checkRejectsValue(t.type, t.value);
      });


      // Both functions should accept positive integers
      positiveIntegralTests.forEach(function(t) {
        checkAcceptsValue(t.type, t.value);
      });


      // Both functions should accept values coercible to positive integers when called in relaxed mode
      coerciblePositiveTests.forEach(function(t) {
        checkAcceptsValue(t.type, t.value);
      });


      // Both functions should reject values coercible to positive integers when called in strict mode
      coerciblePositiveTests.forEach(function(t) {
        checkRejectsValue(t.type + ' (strict mode)', t.value, {strict: true});
      });


      // Only checkIntegral should accept negative values
      negativeIntegralTests.forEach(function(t) {
        var testAdder = acceptOnlyPositive ? checkRejectsValue : checkAcceptsValue;
        testAdder(t.type, t.value);
      });


      // checkIntegral should accept objects coercible to negative values
      coercibleNegativeTests.forEach(function(t) {
        var testAdder = acceptOnlyPositive ? checkRejectsValue : checkAcceptsValue;
        testAdder(t.type, t.value);
      });


      // All functions should reject objects coercible to negative values in strict mode
      coercibleNegativeTests.forEach(function(t) {
        checkRejectsValue(t.type + ' (strict mode)', t.value, {strict: true});
      });
    };


    describe('checkIntegral', function() {
      var checkIntegral = internalUtilities.checkIntegral;

      addNumericTests(checkIntegral);
    });


    describe('checkPositiveIntegral', function() {
      var checkPositiveIntegral = internalUtilities.checkPositiveIntegral;


      addNumericTests(checkPositiveIntegral, {positiveOnly: true});
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


    describe('isArrayLike', function() {
      var isArrayLike = internalUtilities.isArrayLike;


      arrayLikeTests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var b = isArrayLike(t.value);
          var expected = t.result;

          expect(b).to.equal(expected);
        });
      });


      it('Behaves correctly with string when noStrings parameter explicitly false', function() {
        expect(isArrayLike('a', false)).to.equal(true);
      });


      it('Behaves correctly with string when noStrings parameter explicitly true', function() {
        expect(isArrayLike('a', true)).to.equal(false);
      });
    });


    describe('valueStringifier', function() {
      var valueStringifier = internalUtilities.valueStringifier;


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
  });
})();
//(function() {
//  // Deliberate outer scope here: we want a non-strict scope where "this" points to the global.
//
//  var global = this;
//  var print = this.window === undefined ? this.print : undefined; // SpiderMonkey JS shell
//
//  return function() {
//    "use strict";
//
//
//    var testFixture = function(require, exports) {
//      var chai = require('chai');
//      var expect = chai.expect;
//
//      var utils = require('../utils');
//
//      var testUtils = require('./testUtils');
//      var describeModule = testUtils.describeModule;
//      var describeFunction = testUtils.describeFunction;
//
//
//      var expectedObjects = [];
//      var expectedFunctions = ['valueStringifier', 'isArrayLike', 'checkArrayLike', 'isObjectLike',
//                               'checkIntegral', 'checkPositiveIntegral', 'checkObjectLike', 'defineValue', 'help'];
//      describeModule('utils', utils, expectedObjects, expectedFunctions);
//
//
//      var objectLikeTests = [
//        {name: 'number', value: 1, result: false},
//        {name: 'boolean', value: true, result: false},
//        {name: 'string', value: 'a', result: true},
//        {name: 'function', value: function() {}, result: true},
//        {name: 'object', value: {}, result: true},
//        {name: 'array', value: [1, 2], result: true},
//        {name: 'undefined', value: undefined, result: false},
//        {name: 'null', value: null, result: false}
//      ];
//
//
//      describe('isObjectLike', function() {
//        var isObjectLike = utils.isObjectLike;
//
//
//        objectLikeTests.forEach(function(t) {
//          var name = t.name;
//
//          it('Behaves correctly for ' + name, function() {
//            var b = isObjectLike(t.value);
//            var expected = t.result;
//
//            expect(b).to.equal(expected);
//          });
//        });
//
//
//        var addOptionTests = function(allowNull, strict) {
//          it('Behaves correctly for null when allowNull ' + allowNull + ' and strict ' + strict, function() {
//            expect(isObjectLike(null, {allowNull: allowNull, strict: strict})).to.equal(allowNull);
//          });
//
//
//          it('Behaves correctly for function when allowNull ' + allowNull + ' and strict ' + strict, function() {
//            expect(isObjectLike(function() {}, {allowNull: allowNull, strict: strict})).to.equal(!strict);
//          });
//
//
//          it('Behaves correctly for string when allowNull ' + allowNull + ' and strict ' + strict, function() {
//            expect(isObjectLike('a', {allowNull: allowNull, strict: strict})).to.equal(!strict);
//          });
//
//
//          it('Behaves correctly for array when allowNull ' + allowNull + ' and strict ' + strict, function() {
//            expect(isObjectLike([1], {allowNull: allowNull, strict: strict})).to.equal(!strict);
//          });
//
//
//          it('Behaves correctly for object when allowNull ' + allowNull + ' and strict ' + strict, function() {
//            expect(isObjectLike({}, {allowNull: allowNull, strict: strict})).to.equal(true);
//          });
//        };
//
//
//        addOptionTests(false, false);
//        addOptionTests(false, true);
//        addOptionTests(true, false);
//        addOptionTests(true, true);
//      });
//
//
//      // We deliberately use describe rather than our own describeFunction here
//      // due to the optional parameter.
//      describe('checkObjectLike', function() {
//        var checkObjectLike = utils.checkObjectLike;
//
//
//        var shouldFail = objectLikeTests.filter(function(test) {return test.result === false;});
//        var shouldPass = objectLikeTests.filter(function(test) {return test.result === true;});
//
//        shouldFail.forEach(function(test) {
//          var name = test.name;
//
//
//          it('Behaves correctly for ' + name, function() {
//            var fn = function() {
//              checkObjectLike(test.value);
//            };
//
//            expect(fn).to.throw(TypeError);
//          });
//
//
//          it('Returns correct exception for ' + name, function() {
//            var message = 'This was an error';
//            var fn = function() {
//              checkObjectLike(test.value, {message: message});
//            };
//
//            expect(fn).to.throw(message);
//          });
//        });
//
//
//        shouldPass.forEach(function(test) {
//          var name = test.name;
//
//
//          it('Doesn\'t throw for ' + name, function() {
//            var fn = function() {
//              checkObjectLike(test.value);
//            };
//
//            expect(fn).to.not.throw(TypeError);
//          });
//
//
//          it('Returns its argument for ' + name, function() {
//            expect(checkObjectLike(test.value)).to.equal(test.value);
//          });
//        });
//
//
//        it('Doesn\'t accept null when relevant parameter explicitly passed in (1)', function() {
//          var fn = function() {
//            checkObjectLike(null, {allowNull: false});
//          };
//
//          expect(fn).to.throw(TypeError);
//        });
//
//
//        it('Doesn\'t accept null when relevant parameter explicitly passed in (2)', function() {
//          var message = 'Noooo, no null here!';
//          var fn = function() {
//            checkObjectLike(null, {allowNull: false, message: message});
//          };
//
//          expect(fn).to.throw(message);
//        });
//
//
//        it('Accepts null when relevant parameter passed in', function() {
//          var o = checkObjectLike(null, {allowNull: true});
//
//          expect(o).to.equal(null);
//        });
//
//
//        var addStrictTests = function(type, val) {
//          it('Accepts ' + type + ' when strict parameter explicitly false', function() {
//            var o = checkObjectLike(val, {strict: false});
//
//            expect(o).to.equal(val);
//          });
//
//
//          it('Doesn\'t accept ' + type + ' when strict parameter true (1)', function() {
//            var fn = function() {
//              checkObjectLike(val, {strict: true});
//            };
//
//            expect(fn).to.throw(TypeError);
//          });
//
//
//          it('Doesn\'t accept ' + type + ' when relevant strict parameter true (2)', function() {
//            var message = 'Noooo, only objects here!';
//            var fn = function() {
//              checkObjectLike(val, {strict: true, message: message});
//            };
//
//            expect(fn).to.throw(message);
//          });
//        };
//
//
//        addStrictTests('function', function() {});
//        addStrictTests('string', 'abc');
//      });
//    };
//
//
//    // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
//    if (typeof(define) === "function") {
//      define(function(require, exports, module) {
//        testFixture(require, exports, module);
//      });
//    } else {
//      testFixture(require, exports, module);
//    }
//  }();
//})();
