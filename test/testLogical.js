(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var logical = require('../logical');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;


    describe('Logical exports', function() {
      var expectedFunctions = ['not', 'and', 'or', 'xor',
                               'notPred'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('logical.js exports \'' + f + '\' property', exportsProperty(logical, f));
        it('\'' + f + '\' property of logical.js is a function', exportsFunction(logical, f));
      });
    });


    describe('not', function() {
      var not = logical.not;


      it('not works as expected (1)', function() {
        expect(not(true)).to.be.false;
      });


      it('not works as expected (2)', function() {
        expect(not(false)).to.be.true;
      });
    });


    // Utility function for test generation
    var makeBinaryBooleanTest = function(fn, val1, val2, expected) {
      return function() {
        expect(fn(val1, val2)).to.equal(expected);
      };
    };


    // All the boolean operator tests have the same template
    var makeBinaryBooleanTestFixture = function(prop, truthTable) {
      var functionUnderTest = logical[prop];

      truthTable.forEach(function(test, i) {
        var indexString = ' (' + (i + 1) + ')';
        it(prop + ' works as expected' + indexString,
            makeBinaryBooleanTest(functionUnderTest, test.val1, test.val2, test.expected));

        testCurriedFunction(prop + ' is curried' + indexString, functionUnderTest, [test.val1, test.val2]);
      });
    };


    describe('and', function() {
      var truthTable = [
        {val1: false, val2: false, expected: false},
        {val1: false, val2: true, expected: false},
        {val1: true, val2: false, expected: false},
        {val1: true, val2: true, expected: true}
      ];

      makeBinaryBooleanTestFixture('and', truthTable);
    });


    describe('or', function() {
      var truthTable = [
        {val1: false, val2: false, expected: false},
        {val1: false, val2: true, expected: true},
        {val1: true, val2: false, expected: true},
        {val1: true, val2: true, expected: true}
      ];

      makeBinaryBooleanTestFixture('or', truthTable);
    });


    describe('xor', function() {
      var truthTable = [
        {val1: false, val2: false, expected: false},
        {val1: false, val2: true, expected: true},
        {val1: true, val2: false, expected: true},
        {val1: true, val2: true, expected: false}
      ];

      makeBinaryBooleanTestFixture('xor', truthTable);
    });


    // The following predicate functions require the following definitions
    var constant = base.constant;
    var curry = base.curry;
    var constantFalse = constant(false);
    var constantTrue = constant(true);


    describe('notPred', function() {
      var notPred = logical.notPred;


      it('notPred has arity 1', function() {
        expect(notPred.length).to.equal(1);
      });


      it('notPred throws when called with a function of arity 0', function() {
        var predicate = function() {};
        var fn = function() {
          notPred(predicate);
        };

        expect(fn).to.throw(TypeError);
      });


      it('notPred throws when called with a function of arity > 1', function() {
        var predicate = function(x, y) {};
        var fn = function() {
          notPred(predicate);
        };

        expect(fn).to.throw(TypeError);
      });


      it('notPred throws when called with a curried function of arity > 1', function() {
        var predicate = curry(function(x, y) {});
        var fn = function() {
          notPred(predicate);
        };

        expect(fn).to.throw(TypeError);
      });


      it('notPred works as expected (1)', function() {
        var negated = notPred(constantTrue);

        expect(negated).to.be.a('function');
        expect(negated.length).to.equal(1);
        expect(negated('a')).to.equal(false);
      });


      it('notPred works as expected (2)', function() {
        var negated = notPred(constantFalse);

        expect(negated).to.be.a('function');
        expect(negated.length).to.equal(1);
        expect(negated('a')).to.equal(true);
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
