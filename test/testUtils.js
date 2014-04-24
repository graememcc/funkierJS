(function() {
  "use strict";


  // Exports useful functions for testing
  var testUtils = function(require, exports, module) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var getRealArity = base.getRealArity;


    // Return a function that tests if the object has the given property
    var exportsProperty = function(obj, prop) {
      return function() {
        expect(obj).to.have.property(prop);
      };
    };


    // Return a function that tests if the object has the given function
    var exportsFunction = function(obj, prop) {
      return function() {
        expect(obj[prop]).to.be.a('function');
      };
    };


    // Generate test code that ensures all expected functions and objects are exported by a module
    var describeModule = function(name, module, expectedObjects, expectedFunctions) {
      var desc = name[0].toUpperCase() + name.slice(1);

      describe(desc + ' exports', function() {
        // Generate existence tests for each expected object
        expectedObjects.forEach(function(o) {
          it(name + '.js exports \'' + o + '\' property', exportsProperty(module, o));
        });

        // ... and each expected function
        expectedFunctions.forEach(function(f) {
          it(name + '.js exports \'' + f + '\' property', exportsProperty(module, f));
          it('\'' + f + '\' property of ' + name + '.js is a function', exportsFunction(module, f));
        });
      });
    };


    var prims = ['number', 'boolean', 'undefined', 'object', 'string', 'function'];
    var isPrimitiveType = function(t) {
      return prims.indexOf(t) !== -1;
    };


    var nonPrimDict = {'null': 'object', 'array': 'object'};
    var nonPrimToPrim = function(nP) {
      return nonPrimDict[nP];
    };


    // Take an array of arrays—args—where each subarray is a list of acceptable values
    // for the parameter at that position. Returns a new array of arrays where each subarray
    // is an acceptable parameter list for the function.
    var makeGoodArgs = function(args) {
      var result = [];

      if (args.length === 0)
        return result;

      var remaining = makeGoodArgs(args.slice(1));
      args[0].forEach(function(arg) {
        if (remaining.length > 0) {
          remaining.forEach(function(rest) {
            result.push([arg].concat(rest));
          });
        } else {
          result.push([arg]);
        }
      });

      return result;
    };


    var makeGoodArgDescriptor = function(b, a) {return {before: b, after: a};};

    // Takes an array of arrays—args—where each subarray is a list of acceptable values
    // for the parameter at that position, and the parameter position where we are going to
    // substitute bad data. Returns an array of arg descriptor objects, with before and after
    // properties: these are the arguments that slot in either side of the bad data.
    var constructGoodArgsFor = function(goodArgs, paramIndex) {
      var beforeArgs = makeGoodArgs(goodArgs.slice(0, paramIndex));
      var afterArgs = makeGoodArgs(goodArgs.slice(paramIndex + 1));

      var result = [];
      if (beforeArgs.length > 0) {
        beforeArgs.forEach(function(b) {
          if (afterArgs.length > 0) {
            afterArgs.forEach(function(a) {
              result.push(makeGoodArgDescriptor(b, a));
            });
          } else {
            result.push(makeGoodArgDescriptor(b, []));
          }
        });
      } else {
        if (afterArgs.length > 0) {
          afterArgs.forEach(function(a) {
            result.push(makeGoodArgDescriptor([], a));
          });
        } else {
          result.push(makeGoodArgDescriptor([], []));
        }
      }

      return result;
    };


    // Generates an array of possible bogus values. We want a fresh array
    // every time, in case the function modifies values in some way.
    var allBogus = function() {
      return [
        {name: 'number', article: 'a ', value: 2},
        {name: 'boolean', article: 'a ', value: true},
        {name: 'string', article: 'a ', value: 'c'},
        {name: 'undefined', article: '', value: undefined},
        {name: 'null', article: '', value: null},
        {name: 'function', article: 'a ', value: function() {}},
        {name: 'object', article: 'an ', value: {foo: 4}},
        {name: 'array', article: 'an ', value: [4, 5, 6]}
      ];
    };


    // If I've written a function taking 10 parameters, then something has gone terribly wrong!
    var positions = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];


    /*
     * Generates a number of functions that test all possible combinations where a particular argument
     * is of a type that should throw. Takes the function name, the function to test, and two arrays:
     *
     *  - restrictions: an array of arrays. This should have the same length as the function's arity.
     *                  Each element is an array containing EITHER a list of strings representing the
     *                  valid types for this parameter, or a single element which is the constructor
     *                  function for a specific object type. For example,
     *                  [['string'], ['object', 'array'], [RegExp]] denotes a function whose first
     *                  argument must be a string, whose second can be an object or array, and whose
     *                  third parameter must be a RegExp. Note, 'object' means a real object: use 'null'
     *                  or 'array' if those types are acceptable.
     *
     *  - goodArgs:     An array of arrays. This must be the same length as the function's arity. Each
     *                  element should be an array, containing acceptable values for the parameter at
     *                  that position. Where an argument has a restriction, the array at this position
     *                  should have the same length as the number of restrictions, and the values should
     *                  match: i.e. for the example above for restrictions, the second array should have
     *                  two elements: the first an acceptable object, the second an acceptable string.
     *                  Arguments without restrictions can be supplied in any number, but there must be
     *                  at least one.
     *
     * Throws at test generation time if the restrictions/good arguments don't match.
     *
     */

    var testTypeRestrictions = function(name, fnUnderTest, restrictions, goodArgs) {
      // First: test I've written the spec correctly! Throw if not!

      var arity = getRealArity(fnUnderTest);
      if (restrictions.length !== arity)
        throw new Error('You haven\'t supplied enough restrictions: ' + name + ' has arity ' + arity +
                        ' and you supplied ' + restrictions.length);

      if (goodArgs.length !== arity)
        throw new Error('You haven\'t supplied enough correct arguments: ' + name + ' has arity ' + arity +
                        ' and you supplied ' + restrictions.length);

      goodArgs.forEach(function(g, i) {
        if (g.length === 0)
          throw new Error('You never supplied any valid values for parameter ' + (i + 1) + ' of name');
      });


      restrictions.forEach(function(resSpec, i) {
        resSpec.forEach(function(r, j) {
          if (typeof(r) === 'function' && resSpec.length > 1) {
            // If a function accepts a specific type of object e.g. RegExp, then that should be the only possible
            // restriction for that position: we shouldn't have e.g. this can be a RegExp or a boolean.

            throw new Error(name + ' Spec ' + i + ' incorrect. Specific object type should be isolated!');
          } else if (typeof(r) === 'string') {
            // The good arg at this position should have the right type!

            var t = isPrimitiveType(r) ? r : nonPrimToPrim(r);
            if (typeof(goodArgs[i][j]) !== t)
              throw new Error(name + ' spec: "good argument" of incorrect type for ' + i + ' ' + j + ', expected ' +
                             t + ' and found ' + typeof(goodArgs[i][j]) + ' ' + goodArgs[i][j]);
          }
        });
      });

      // Now we've checked that I'm not an idiot, we can generate the tests!
      restrictions.forEach(function(resSpec, i) {
        if (resSpec.length === 0)
          return;

        // We want the message to be 'the parameter' if there's only one
        var posString = restrictions.length > 1 ? positions[i] + ' ' : '';

        var good = constructGoodArgsFor(goodArgs, i);
        var l = good.length;

        var bogusArgs = allBogus();
        bogusArgs = bogusArgs.filter(function(b) {
          return resSpec.indexOf(b.name) === -1;
        });

        bogusArgs.forEach(function(bogus) {
          good.forEach(function(goodDescriptor, j) {
            var args = goodDescriptor.before.concat([bogus.value]).concat(goodDescriptor.after);
            // The last argument might be modified
            var idx = args.length - 1;
            if (typeof(args[idx]) === 'object' && args[idx] !== null && 'reset' in args[idx])
              args[idx] = args[idx].reset();

            var message = ' (' + (j + 1) + ')';
            it('Throws when the ' + posString + 'parameter is ' + bogus.article + bogus.name + message, function() {
              var fn = function() {
                fnUnderTest.apply(null, args);
              };

              expect(fn).to.throw(TypeError);
            });
          });
        });
      });
    };


    var addFunctionIsCurriedTest = function(fnUnderTest) {
      it('Is curried', function() {
        expect(fnUnderTest.length).to.equal(1);
        expect(getRealArity(fnUnderTest)).to.not.equal(1);
      });
    };


    // Generate a text fixture code that checks a function has a given length, and possibly that it is curried,
    // and then calls remainingTests with the function under test in order to add function-specific tests
    var describeFunction = function(spec, fnUnderTest, remainingTests) {
      var name = spec.name;
      var arity = spec.arity;

      describe(name, function() {
        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(arity);
        });


        if (arity > 1)
          addFunctionIsCurriedTest(fnUnderTest);

        if ('restrictions' in spec)
          testTypeRestrictions(name, fnUnderTest, spec.restrictions, spec.validArguments);

        remainingTests(fnUnderTest);
      });
    };


    // Deeply check two objects for equality (ignoring functions)
    var checkObjectEquality = function(obj1, obj2) {
      var obj1Keys = Object.getOwnPropertyNames(obj1);
      var obj2Keys = Object.getOwnPropertyNames(obj2);

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


    // Check two arrays for identity of contents, ignoring order
    var checkArrayContent = function(arr1, arr2, sortFn) {
      if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length)
        return false;

      var sortArgs = [];
      if (typeof(sortFn) === 'function')
        sortArgs.push(sortFn);

      var a1 = arr1.slice();
      var a2 = arr2.slice();

      a1.sort.apply(a1, sortArgs);
      a2.sort.apply(a2, sortArgs);
      return a1.every(function(val, i) {
        return val === a2[i];
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
      var args = getRealArgs(curriedArgs);

      var testPrimitive = function() {
        var result = curried.apply(null, args);

        expect(checkEquality(result, expected)).to.be.true;
      };

      var testFunc = function() {
        var result = curried.apply(null, args).apply(null, thenArgs);

        expect(checkEquality(result, expected)).to.be.true;
      };

      return thenArgs === null ? testPrimitive : testFunc;
    };


    // Helper function for testing stateful functions
    var getRealArgs = function(args) {
      var result = args.slice();
      var last = result[result.length - 1];

      // If the last argument is an object with a "reset" property, then assume we are testing a state-changing
      // function, and the property contains the function to be called to generate a new object
      if (typeof(last) === 'object' && last !== null && 'reset' in last)
        result[result.length - 1] = last.reset();

      return result;
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

      var expectedArgs = getRealArgs(args);

      var expected = thenArgs === null ? original.apply(null, expectedArgs) : original.apply(null, expectedArgs).apply(null, thenArgs);

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
      addFunctionIsCurriedTest: addFunctionIsCurriedTest,
      checkArrayContent: checkArrayContent,
      checkArrayEquality: checkArrayEquality,
      checkEquality: checkEquality,
      checkObjectEquality: checkObjectEquality,
      describeFunction: describeFunction,
      describeModule: describeModule,
      exportsFunction: exportsFunction,
      exportsProperty: exportsProperty,
      testCurriedFunction: testCurriedFunction,
      testTypeRestrictions: testTypeRestrictions
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
