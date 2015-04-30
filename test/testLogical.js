//(function() {
//  "use strict";
//
//
//  var testFixture = function(require, exports) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var curryModule = require('../curry');
//
//    var base = require('../base');
//    var logical = require('../logical');
//
//    // Import utility functions
//    var testUtils = require('./testUtils');
//    var describeModule = testUtils.describeModule;
//    var describeFunction = testUtils.describeFunction;
//    var testCurriedFunction = testUtils.testCurriedFunction;
//
//
//    var expectedObjects = [];
//    var expectedFunctions = ['not', 'and', 'or', 'xor',
//                             'notPred', 'andPred', 'orPred', 'xorPred'];
//    describeModule('logical', logical, expectedObjects, expectedFunctions);
//
//
//    var notSpec = {
//      name: 'not',
//      arity: 1
//    };
//
//
//    describeFunction(notSpec, logical.not, function(not) {
//      it('Works as expected (1)', function() {
//        expect(not(true)).to.equal(false);
//      });
//
//
//      it('Works as expected (2)', function() {
//        expect(not(false)).to.equal(true);
//      });
//    });
//
//
//    // Utility function for test generation
//    var makeBinaryBooleanTest = function(fn, val1, val2, expected) {
//      return function() {
//        expect(fn(val1, val2)).to.equal(expected);
//      };
//    };
//
//
//    // All the boolean operator tests have the same template
//    var makeBinaryBooleanTestFixture = function(desc, fnUnderTest, truthTable) {
//      var spec = {
//        name: desc,
//        arity: 2
//      };
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        truthTable.forEach(function(test, i) {
//          var indexString = ' (' + (i + 1) + ')';
//          it('Works as expected' + indexString,
//              makeBinaryBooleanTest(fnUnderTest, test.val1, test.val2, test.expected));
//
//          testCurriedFunction(fnUnderTest, [test.val1, test.val2], {message: desc + ' ' + indexString});
//        });
//      });
//    };
//
//
//    var makeTruthTable = function(ff, ft, tf, tt) {
//      return [
//        {val1: false, val2: false, expected: ff},
//        {val1: false, val2: true, expected: ft},
//        {val1: true, val2: false, expected: tf},
//        {val1: true, val2: true, expected: tt}
//      ];
//    };
//
//
//    var andTruthTable = makeTruthTable(false, false, false, true);
//    makeBinaryBooleanTestFixture('and', logical.and, andTruthTable);
//
//
//    var orTruthTable = makeTruthTable(false, true, true, true);
//    makeBinaryBooleanTestFixture('or', logical.or, orTruthTable);
//
//
//    var xorTruthTable = makeTruthTable(false, true, true, false);
//    makeBinaryBooleanTestFixture('xor', logical.xor, xorTruthTable);
//
//
//    // The following predicate tests require the following definitions
//    var curry = curryModule.curry;
//    var constant = base.constant;
//    var constantFalse = constant(false);
//    var constantTrue = constant(true);
//
//
//    var notPredSpec = {
//      name: 'notPred',
//      arity: 1,
//      restrictions: [['function: arity 1']],
//      validArguments: [[function(x) {return true;}]]
//    };
//
//
//    describeFunction(notPredSpec, logical.notPred, function(notPred) {
//      it('notPred works as expected (1)', function() {
//        var negated = notPred(constantTrue);
//
//        expect(negated).to.be.a('function');
//        expect(negated.length).to.equal(1);
//        expect(negated('a')).to.equal(false);
//      });
//
//
//      it('notPred works as expected (2)', function() {
//        var negated = notPred(constantFalse);
//
//        expect(negated).to.be.a('function');
//        expect(negated.length).to.equal(1);
//        expect(negated('a')).to.equal(true);
//      });
//    });
//
//
//    // Utility functions for test generation
//    var makeBinaryPredicateTest = function(funcUnderTest, pred1, pred2, expected) {
//      return function() {
//        expect(funcUnderTest(pred1, pred2)('a')).to.equal(expected);
//      };
//    };
//
//
//    var makePredicateShortCircuitTest = function(funcUnderTest, val1, val2) {
//      var pred1 = function(x) {
//        return val1;
//      };
//
//      var pred2 = function(x) {
//        pred2.called = true;
//        return val2;
//      };
//
//      return function() {
//        pred2.called = false;
//        funcUnderTest(pred1, pred2)('a');
//        expect(pred2.called).to.equal(false);
//      };
//    };
//
//
//    // All the boolean operator tests have the same template
//    var makeBinaryPredicateTestFixture = function(desc, fnUnderTest, truthTable) {
//      var spec = {
//        name: desc,
//        arity: 2,
//        restrictions: [['function: arity 1'], ['function: arity 1']],
//        validArguments: [[function(x) {return true;}], [function(x) {return true;}]]
//      };
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        truthTable.forEach(function(test, i) {
//          var indexString = ' (' + (i + 1) + ')';
//          it('Works as expected' + indexString,
//              makeBinaryPredicateTest(fnUnderTest, test.pred1, test.pred2, test.expected));
//
//          if (test.shortCircuits) {
//            // Note, we deliberately call the predicate functions now—we need the values they return
//            it('Correctly short-circuits' + indexString,
//                makePredicateShortCircuitTest(fnUnderTest, test.pred1(), test.pred2()));
//          }
//
//          var curryArgs = {firstArgs: [test.pred1, test.pred2], thenArgs: ['a']};
//          testCurriedFunction(fnUnderTest, curryArgs, {message: desc + ' ' + indexString});
//        });
//      });
//    };
//
//
//    var makePredTruthTable = function(ff, ft, tf, tt) {
//      return [
//        {pred1: constantFalse, pred2: constantFalse, expected: ff.expected, shortCircuits: ff.shortCircuits},
//        {pred1: constantFalse, pred2: constantTrue, expected: ft.expected, shortCircuits: ft.shortCircuits},
//        {pred1: constantTrue, pred2: constantFalse, expected: tf.expected, shortCircuits: tf.shortCircuits},
//        {pred1: constantTrue, pred2: constantTrue, expected: tt.expected, shortCircuits: tt.shortCircuits}
//      ];
//    };
//
//
//    var andPredTruthTable = makePredTruthTable({expected: false, shortCircuits: true}, {expected: false, shortCircuits: true},
//                                           {expected: false, shortCircuits: false}, {expected: true, shortCircuits: false});
//    makeBinaryPredicateTestFixture('andPred', logical.andPred, andPredTruthTable);
//
//
//    var orPredTruthTable = makePredTruthTable({expected: false, shortCircuits: false}, {expected: true, shortCircuits: false},
//                                          {expected: true, shortCircuits: true}, {expected: true, shortCircuits: true});
//    makeBinaryPredicateTestFixture('orPred', logical.orPred, orPredTruthTable);
//
//
//    var xorPredTruthTable = makePredTruthTable({expected: false, shortCircuits: false}, {expected: true, shortCircuits: false},
//                                           {expected: true, shortCircuits: false}, {expected: false, shortCircuits: false});
//    makeBinaryPredicateTestFixture('xorPred', logical.xorPred, xorPredTruthTable);
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
