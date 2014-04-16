(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var string = require('../string');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var getRealArity = base.getRealArity;


    describe('String exports', function() {
      var expectedFunctions = ['toString'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('string.js exports \'' + f + '\' property', exportsProperty(string, f));
        it('\'' + f + '\' property of string.js is a function', exportsFunction(string, f));
      });
    });


    describe('toString', function() {
      var toString = string.toString;


      it('Has correct arity', function() {
        expect(getRealArity(toString)).to.equal(1);
      });


      var testData = [
        {name: 'number', value: 1},
        {name: 'string', value: 'a'},
        {name: 'boolean', value: true},
        {name: 'function', value: function() {}},
        {name: 'object', value: {}},
        {name: 'array', value: [1]}
      ];


      var makeToStringTest = function(val) {
        return function() {
          expect(toString(val)).to.equal(val.toString());
        };
      };


      testData.forEach(function(tData) {
        it('Works correctly for ' + tData.name, makeToStringTest(tData.value));
      });


      it('Works correctly for object with custom toString', function() {
        var a = {toString: function() {return 'foo';}};

        expect(toString(a)).to.equal(a.toString());
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
