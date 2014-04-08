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
      var expectedFunctions = ['add'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('maths.js exports \'' + f + '\' property', exportsProperty(maths, f));
        it('\'' + f + '\' property of maths.js is a function', exportsFunction(maths, f));
      });
    });


    describe('add', function() {
      var add = maths.add;


      it('add works as expected (1)', function() {
        expect(add(1, 2)).to.equal(1 + 2);
      });


      it('add works as expected (2)', function() {
        expect(add(32, 10)).to.equal(32 + 10);
      });


      testCurriedFunction('add', add, [3, 4]);
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
