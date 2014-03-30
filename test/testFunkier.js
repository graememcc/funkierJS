(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var funkier = require('../funkier');


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


    describe('Funkier exports', function() {
      var expectedFunctions = ['curry'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('funkier.js exports \'' + f + '\' property', exportsProperty(funkier, f));
        it('\'' + f + '\' property of funkier.js is a function', exportsFunction(funkier, f));
      });
    });


    // Four utility functions for the test generation code that follows
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


    describe('curry', function() {
      var curry = funkier.curry;

      it('curry returns a function of length 0 unharmed', function() {
        var f = function() {};
        var curried = curry(f);
        expect(curried).to.equal(f);
      });


      it('curry returns a function of length 1 unharmed', function() {
        var f = function(x) {return x;};
        var curried = curry(f);
        expect(curried).to.equal(f);
      });


      // We shall test curry with binary, ternary, and quarternary functions
      var testFuncs = [
        {f: function(a, b) {return a + b;}, args: [2, 3], message: 'Curried binary function'},
        {f: function(a, b, c) {return a * b * c;}, args: [4, 5, 6], message: 'Curried ternary function'},
        {f: function(a, b, c, d) {return a - b - c - d}, args: [10, 9, 8, 7], message: 'Curried quarternary function'}
      ];

      testFuncs.forEach(function(testData) {
        var fn = testData.f;
        var args = testData.args;
        var message = testData.message;

        var curried = curry(fn);
        testCurriedFunction(curried, args, fn, args, message);
      });


      it('Curried function called with anticipated arguments when called with more than required', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curry(f);
        var args = [1, 2, 4, 'a'];
        curried(args[0], args[1], args[2], args[3]);
        expect(f.args).to.deep.equal(args.slice(0, f.length));
      });
    });
  };


  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      testFixture(require, exports);
    });
  } else {
    testFixture(require, exports);
  }
})();
