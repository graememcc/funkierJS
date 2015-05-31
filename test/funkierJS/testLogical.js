(function() {
  "use strict";


  var expect = require('chai').expect;

  var base = require('../../lib/components/base');
  var constant = base.constant;
  var constantFalse = constant(false);
  var constantTrue = constant(true);

  var logical = require('../../lib/components/logical');

  var testUtils = require('./testingUtilities');
  var checkModule = testUtils.checkModule;
  var checkFunction = testUtils.checkFunction;
  var addCurryStyleTests = testUtils.addCurryStyleTests;
  var addDoubleCurryStyleTests = testUtils.addDoubleCurryStyleTests;


  describe('Logical', function() {
    var expectedObjects = [];
    var expectedFunctions = ['not', 'and', 'or', 'xor', 'notPred', 'andPred', 'orPred', 'xorPred'];
    checkModule('logical', logical, expectedObjects, expectedFunctions);


    var notSpec = {
      name: 'not',
    };


    checkFunction(notSpec, logical.not, function(not) {
      it('Works as expected (1)', function() {
        expect(not(true)).to.equal(false);
      });


      it('Works as expected (2)', function() {
        expect(not(false)).to.equal(true);
      });
    });


    // Utility function for test generation
    var makeBinaryBooleanTest = function(fn, val1, val2, expected) {
      return function() {
        expect(fn(val1, val2)).to.equal(expected);
      };
    };


    // All the boolean operator tests have the same template
    var makeBinaryBooleanTestFixture = function(desc, fnUnderTest, truthTable) {
      var spec = {
        name: desc,
      };

      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
        truthTable.forEach(function(test, i) {
          var indexString = ' (' + (i + 1) + ')';
          it('Works as expected' + indexString,
              makeBinaryBooleanTest(fnUnderTest, test.val1, test.val2, test.expected));
        });
      });
    };


    var makeTruthTable = function(ff, ft, tf, tt) {
      return [
        {val1: false, val2: false, expected: ff},
        {val1: false, val2: true, expected: ft},
        {val1: true, val2: false, expected: tf},
        {val1: true, val2: true, expected: tt}
      ];
    };


    var andTruthTable = makeTruthTable(false, false, false, true);
    makeBinaryBooleanTestFixture('and', logical.and, andTruthTable);


    var orTruthTable = makeTruthTable(false, true, true, true);
    makeBinaryBooleanTestFixture('or', logical.or, orTruthTable);


    var xorTruthTable = makeTruthTable(false, true, true, false);
    makeBinaryBooleanTestFixture('xor', logical.xor, xorTruthTable);


    var notPredSpec = {
      name: 'notPred',
      restrictions: [['function: arity 1']],
      validArguments: [[function(x) {return true;}]]
    };


    checkFunction(notPredSpec, logical.notPred, function(notPred) {
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


      addCurryStyleTests(function(p) { return notPred(p); }, true, 1);
    });


    // Utility functions for test generation
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
    var makeBinaryPredicateTestFixture = function(desc, fnUnderTest, truthTable) {
      var spec = {
        name: desc,
        restrictions: [['function: arity 1'], ['function: arity 1']],
        validArguments: [[function(x) {return true;}], [function(x) {return true;}]]
      };


      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
        truthTable.forEach(function(test, i) {
          var indexString = ' (' + (i + 1) + ')';
          it('Works as expected' + indexString,
              makeBinaryPredicateTest(fnUnderTest, test.pred1, test.pred2, test.expected));

          if (test.shortCircuits) {
            // Note, we deliberately call the predicate functions now—we need the values they return
            it('Correctly short-circuits' + indexString,
                makePredicateShortCircuitTest(fnUnderTest, test.pred1(), test.pred2()));
          }
        });


        // Watch out for short-circuiting when testing the curry style
        var f1Return = fnUnderTest === logical.andPred ? true : false;

        addDoubleCurryStyleTests(function(p1, p2) {
          return fnUnderTest(p1, p2);
        }, f1Return);
      });
    };


    var makePredTruthTable = function(ff, ft, tf, tt) {
      return [
        {pred1: constantFalse, pred2: constantFalse, expected: ff.expected, shortCircuits: ff.shortCircuits},
        {pred1: constantFalse, pred2: constantTrue, expected: ft.expected, shortCircuits: ft.shortCircuits},
        {pred1: constantTrue, pred2: constantFalse, expected: tf.expected, shortCircuits: tf.shortCircuits},
        {pred1: constantTrue, pred2: constantTrue, expected: tt.expected, shortCircuits: tt.shortCircuits}
      ];
    };


    var andPredTruthTable = makePredTruthTable({expected: false, shortCircuits: true}, {expected: false, shortCircuits: true},
                                           {expected: false, shortCircuits: false}, {expected: true, shortCircuits: false});
    makeBinaryPredicateTestFixture('andPred', logical.andPred, andPredTruthTable);


    var orPredTruthTable = makePredTruthTable({expected: false, shortCircuits: false}, {expected: true, shortCircuits: false},
                                          {expected: true, shortCircuits: true}, {expected: true, shortCircuits: true});
    makeBinaryPredicateTestFixture('orPred', logical.orPred, orPredTruthTable);


    var xorPredTruthTable = makePredTruthTable({expected: false, shortCircuits: false}, {expected: true, shortCircuits: false},
                                           {expected: true, shortCircuits: false}, {expected: false, shortCircuits: false});
    makeBinaryPredicateTestFixture('xorPred', logical.xorPred, xorPredTruthTable);
  });
})();
