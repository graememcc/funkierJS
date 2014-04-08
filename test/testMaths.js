(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var maths = require('../maths');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;


    describe('Maths exports', function() {
      var expectedFunctions = ['add', 'subtract', 'multiply', 'divide'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('maths.js exports \'' + f + '\' property', exportsProperty(maths, f));
        it('\'' + f + '\' property of maths.js is a function', exportsFunction(maths, f));
      });
    });


    // The binary tests will have a similar structure. Generate them automatically.
    var binaryTests = [
      {func: 'add', test1: {val1: 1, val2: 2, result: 1 + 2},
       test2: {val1: 32, val2: 10, result: 32 + 10}},
      {func: 'subtract', test1: {val1: 1, val2: 2, result: 1 - 2},
       test2: {val1: 52, val2: 10, result: 52 - 10}},
      {func: 'multiply', test1: {val1: 1, val2: 2, result: 1 * 2},
       test2: {val1: 7, val2: 6, result: 7 * 6}},
      {func: 'divide', test1: {val1: 1, val2: 2, result: 1 / 2},
       test2: {val1: 210, val2: 5, result: 210 / 5}}
    ];


    binaryTests.forEach(function(test) {
      describe(test.func, function() {
        var funcUnderTest = maths[test.func];
        var test1 = test.test1;
        var test2 = test.test2;

        it(test.func + ' works as expected (1)', function() {
          expect(funcUnderTest(test1.val1, test1.val2)).to.equal(test1.result);
        });


        it(test.func + ' works as expected (2)', function() {
          expect(funcUnderTest(test2.val1, test2.val2)).to.equal(test2.result);
        });


        testCurriedFunction(test.func, funcUnderTest, [3, 4]);
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
