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
                               'notPred', 'andPred'];

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


      // Utility function for test generation
      var makePredicateArityTest = function(funcUnderTest, badArity) {
        return function() {
          var fn = function() {
            funcUnderTest(badArity);
          };

          expect(fn).to.throw(TypeError);
        };
      };


      it('notPred throws when called with a function of arity 0',
          makePredicateArityTest(notPred, function() {}));


      it('notPred throws when called with a function of arity > 1',
          makePredicateArityTest(notPred, function(x, y) {}));


      it('notPred throws when called with a curried function of arity > 1',
          makePredicateArityTest(notPred, curry(function(x, y) {})));


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


    // Utility functions for test generation
    var makeBinaryPredicateArityTest = function(funcUnderTest, pred1, pred2) {
      return function() {
        var fn = function() {
          funcUnderTest(pred1, pred2);
        };

        expect(fn).to.throw(TypeError);
      };
    };


    var makeBinaryPredicateTest = function(funcUnderTest, pred1, pred2, expected) {
      return function() {
        expect(funcUnderTest(pred1, pred2)('a')).to.equal(expected);
      };
    };


    var makePredicateShortCircuitTest = function(funcUnderTest, val1, val2) {
      var pred1 = function(x) {
        return val1;
      };

      var pred2 = function(x) {
        pred2.called = true;
        return val2;
      };

      return function() {
        pred2.called = false;
        funcUnderTest(pred1, pred2)('a');
        expect(pred2.called).to.equal(false);
      };
    };


    // All the boolean operator tests have the same template
    var makeBinaryPredicateTestFixture = function(prop, truthTable) {
      var functionUnderTest = logical[prop];
      var f0 = function() {};
      var f2 = function(x, y) {};

      it(prop + ' throws when called with a function of arity 0 (1)',
          makeBinaryPredicateArityTest(functionUnderTest, f0, constantTrue));


      it(prop + ' throws when called with a function of arity 0 (2)',
          makeBinaryPredicateArityTest(functionUnderTest, constantTrue, f0));


      it(prop + ' throws when called with a function of arity > 1 (1)',
          makeBinaryPredicateArityTest(functionUnderTest, f2, constantTrue));


      it(prop + ' throws when called with a function of arity > 1 (2)',
          makeBinaryPredicateArityTest(functionUnderTest, constantTrue, f2));


      it(prop + ' throws when called with a curried function of arity > 1 (1)',
          makeBinaryPredicateArityTest(functionUnderTest, curry(f2), constantTrue));


      it(prop + ' throws when called with a curried function of arity > 1 (2)',
          makeBinaryPredicateArityTest(functionUnderTest, constantTrue, curry(f2)));


      truthTable.forEach(function(test, i) {
        var indexString = ' (' + (i + 1) + ')';
        it(prop + ' works as expected' + indexString,
            makeBinaryPredicateTest(functionUnderTest, test.pred1, test.pred2, test.expected));

        if (test.shortCircuits) {
          // Note, we deliberately call the predicate functions now—we need the values they return
          it(prop + ' correctly short-circuits' + indexString,
              makePredicateShortCircuitTest(functionUnderTest, test.pred1(), test.pred2()));
        }

        var curryArgs = {firstArgs: [test.pred1, test.pred2], thenArgs: ['a']};
        testCurriedFunction(prop + ' is curried' + indexString, functionUnderTest, curryArgs);
      });
    };


    describe('andPred', function() {
      var truthTable = [
        {pred1: constantFalse, pred2: constantFalse, expected: false, shortCircuits: true},
        {pred1: constantFalse, pred2: constantTrue, expected: false, shortCircuits: true},
        {pred1: constantTrue, pred2: constantFalse, expected: false, shortCircuits: false},
        {pred1: constantTrue, pred2: constantTrue, expected: true, shortCircuits: false}
      ];

      makeBinaryPredicateTestFixture('andPred', truthTable);
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
