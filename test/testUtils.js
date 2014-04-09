(function() {
  "use strict";


  // Exports useful functions for testing
  var testUtils = function(require, exports, module) {
    var chai = require('chai');
    var expect = chai.expect;


    // Deeply check two objects for equality (ignoring functions)
    var checkObjectEquality = function(obj1, obj2) {
      var obj1Keys = Object.keys(obj1);
      var obj2Keys = Object.keys(obj2);

      if (obj1Keys.length !== obj2Keys.length)
        return false;

      return obj1Keys.every(function(k, i) {
        return checkEquality(obj1[k], obj2[k], true);
      });
    };


    // Deeply check two arrays for equality (ignoring functions)
    var checkArrayEquality = function(arr1, arr2) {
      if (arr1.length !== arr2.length)
        return false;

      return arr1.every(function(val, i) {
        return checkEquality(val, arr2[i], true);
      });
    };


    // Deeply check two values for equality. If acceptFunctions is true,
    // then two functions will blindly be assumed to be equal.
    var checkEquality = function(obj1, obj2, acceptFunctions) {
      acceptFunctions = acceptFunctions || false;

      if (typeof(obj1) !== typeof(obj2))
        return false;

      // Short-circuit if we can (needed for the 'constant' tests)
      if (obj1 === obj2)
        return true;

      var objType = typeof(obj1);

      // If the initial result is a function, then we've written
      // the test incorrectly
      if (objType === 'function' && !acceptFunctions)
        throw new Error('Test error: trying to compare functions!');

      if (objType === 'object') {
        if (Array.isArray(obj1)) {
          if (!Array.isArray(obj2))
            return false;

          return checkArrayEquality(obj1, obj2);
        } else if (obj1 === null || obj2 === null) {
          return obj1 === obj2;
        } else {
          return checkObjectEquality(obj1, obj2);
        }
      } else if (objType === 'function') {
        // We can't check functions, so just wing it
        return true;
      } else {
        // We already know obj1 !== obj2
        return false;
      }
    };


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


    var callWithRemaining = function(curried, curriedArgs, expected, thenArgs) {
      var testPrimitive = function() {
        var result = curried.apply(null, curriedArgs);

        expect(checkEquality(result, expected)).to.be.true;
      };

      var testFunc = function() {
        var result = curried.apply(null, curriedArgs).apply(null, thenArgs);

        expect(checkEquality(result, expected)).to.be.true;
      };

      return thenArgs === null ? testPrimitive : testFunc;
    };


    // There are a number of checks we want to perform on curried functions when testing
    // the 'curry' function. The same checks apply when testing other library functions that we expect
    // to be curried. We generate these tests automatically.
    var testCurriedFunction = function(message, curried, originalArgs, original) {

      // Many of the functions being tested will themselves return functions. This means we generally
      // won't be able to test equality of return values. If originalArgs is an array, then we assume
      // that the function under test does indeed return a primitive value. Otherwise, we assume it is
      // an object containing two arrays: 'firstArgs': the args to supply to the function under test, and
      // 'thenArgs': the args to apply to the resulting function. (Yes, we assume that the returned function
      // itself returns primitive values)

      // I chose to make original optional. There are really two use cases: check this curried function behaves
      // like this uncurried function, and check this curried function—which I have verified works when called with
      // all args—behaves correctly when partially applied.
      // Initially, I thought original would be mandatory, but realised this will often result in having to
      // reimplement the function under test.
      original = original || curried;
      var args = Array.isArray(originalArgs) ? originalArgs : originalArgs.firstArgs;
      var thenArgs = Array.isArray(originalArgs) ? null : originalArgs.thenArgs;
      var expected = thenArgs === null ? original.apply(null, args) : original.apply(null, args).apply(null, thenArgs);

      var performTests = function(curried, curriedArgs, message) {
        // Function?
        it(message + ' is a function', checkFunction(curried));

        // Correct length?
        it(message + ' has length 1', checkLength(curried));

        // Called with outstanding arg === original result
        // Note: if curried === original then these tests should be redundant, the caller should
        // have already tested the function with all arguments supplied
        if (curried !== original) {
          var length = curriedArgs.length;
          if (length === 1) {
            it(message + ' final curried function returns correct value',
                callWithRemaining(curried, curriedArgs, expected, thenArgs));
            return;
          }

          // Can call with all remaining values and get final value?
          it(message + ' called with all remaining arguments returns correct value',
              callWithRemaining(curried, curriedArgs, expected, thenArgs));
        }

        // Perform these tests again with various numbers of arguments applied
        for (var i = 0, l = curriedArgs.length - 1; i < l; i++) {
          var newCurried = curried.apply(null, curriedArgs.slice(0, i + 1));
          var newRemaining = curriedArgs.slice(i + 1);
          var newMessage = [message, ' (then partially applied with ', i + 1, ' arguments)'].join('');
          performTests(newCurried, newRemaining, newMessage);
        }
      };

      performTests(curried, args, message);
    };


    module.exports = {
      checkArrayEquality: checkArrayEquality,
      checkEquality: checkEquality,
      checkObjectEquality: checkObjectEquality,
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
