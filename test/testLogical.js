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
      var expectedFunctions = ['not', 'and'];

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


    describe('and', function() {
      var and = logical.and;


      var truthTable = [
        {val1: false, val2: false, expected: false},
        {val1: false, val2: true, expected: false},
        {val1: true, val2: false, expected: false},
        {val1: true, val2: true, expected: true}
      ];

      truthTable.forEach(function(test, i) {
        var indexString = ' (' + (i + 1) + ')';
        it('and works as expected' + indexString,
            makeBinaryBooleanTest(and, test.val1, test.val2, test.expected));

        testCurriedFunction('and is curried' + indexString, and, [test.val1, test.val2]);
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
