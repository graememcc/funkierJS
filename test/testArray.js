(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var array = require('../array');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;


    var expectedObjects = [];
    var expectedFunctions = ['length'];
    describeModule('array', array, expectedObjects, expectedFunctions);


    var lengthSpec = {
      name: 'length',
      arity: 1,
      restrictions: [['array', 'string']],
      validArguments: [[[], '']]
    };


    describeFunction(lengthSpec, array.length, function(length) {
      it('Works for arrays (1)', function() {
        expect(length([1])).to.equal(1);
      });


      it('Works for arrays (2)', function() {
        expect(length([1, 3, 2])).to.equal(3);
      });


      it('Works for empty arrays', function() {
        expect(length([])).to.equal(0);
      });


      it('Works for strings (1)', function() {
        expect(length(['1'])).to.equal(1);
      });


      it('Works for strings (2)', function() {
        expect(length('abc')).to.equal(3);
      });


      it('Works for empty strings', function() {
        expect(length('')).to.equal(0);
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
