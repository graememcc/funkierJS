(function() {
  "use strict";


  // Exports useful functions for testing
  var testUtils = function(require, exports, module) {
    var chai = require('chai');
    var expect = chai.expect;


    // Utility functions to generate common tests
    var exportsProperty = function(obj, prop) {
      return function() {
        expect(obj).to.have.property(prop);
      };
    };


    var exportsFunction = function(obj, prop) {
      return function() {
        expect(obj[prop]).to.be.a('function');
      };
    };


    // Three helper functions for the test generation code below
    var checkFunction = function(curried) {
      return function() {
        expect(curried).to.be.a('function');
      };
    };


    var checkLength = function(curried) {
      return function() {
        expect(curried.length).to.equal(1);
      };
    };


    var callWithRemaining = function(curried, curriedArgs, original, originalArgs) {
      return function() {
        expect(curried.apply(null, curriedArgs)).to.equal(original.apply(null, originalArgs));
      };
    };


    // There are a number of checks we want to perform on curried functions as part
    // of testing the 'curry' function, but also other library functions that we expect
    // to be curried. We generate these tests automatically.
    var testCurriedFunction = function(curried, curriedArgs, original, originalArgs, message) {
      // Function?
      it(message + ' is a function', checkFunction(curried));

      // Correct length?
      it(message + ' has length 1', checkLength(curried));

      // Called with outstanding arg === original result
      var length = curriedArgs.length;
      if (length === 1) {
        it(message + ' final curried function returns correct value',
            callWithRemaining(curried, curriedArgs, original, originalArgs));
        return;
      }

      // Can call with all remaining values and get final value?
      it(message + ' called with all remaining arguments returns correct value',
          callWithRemaining(curried, curriedArgs, original, originalArgs));

      // Carry out these tests again with various numbers of arguments applied
      for (var i = 0, l = curriedArgs.length - 1; i < l; i++) {
        var newCurried = curried.apply(null, curriedArgs.slice(0, i + 1));
        var newRemaining = curriedArgs.slice(i + 1);
        var newMessage = [message, ' (then partially applied with ', i + 1, ' arguments)'].join('');
        testCurriedFunction(newCurried, newRemaining, original, originalArgs, newMessage);
      }
    };


    module.exports = {
      exportsFunction: exportsFunction,
      exportsProperty: exportsProperty,
      testCurriedFunction: testCurriedFunction
    };
  };


  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      testUtils(require, exports, module);
    });
  } else {
    testUtils(require, exports, module);
  }
})();
