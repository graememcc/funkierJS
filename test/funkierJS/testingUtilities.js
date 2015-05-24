(function (root, factory) {
  var dependencies = ['chai'];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else if (typeof exports === 'object') {
    // CommonJS

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  } else {
    // Browser globals

    root.commonJsStrict = root.commonJsStrict || {};
    factory.apply(null, [root].concat(dependencies.map(function(dep) {
      if (dep.slice(0, 2) == './') dep = dep.slice(2);
      if (dep.slice(0, 3) == '../') dep = dep.slice(3);
      return root[dep] || root.commonJsStrict[dep];
    })));
  }
}(this, function(exports, chai) {
  "use strict";


  var expect = chai.expect;


  /*
   * Return a function that tests if an object has the given property
   *
   */

  var exportsProperty = function(obj, prop) {
    return function() {
      expect(obj).to.have.property(prop);
    };
  };


  /*
   * Return a function that tests if an object has the given function
   *
   */

  var exportsFunction = function(obj, prop) {
    return function() {
      expect(obj[prop]).to.be.a('function');
    };
  };


  /*
   * Generate a test suite that ensures a module exports all the expected values and functions
   *
   */

  var checkModule = function(name, moduleUnderTest, moduleDescription) {
    var testDescription = name[0].toUpperCase() + name.slice(1);

    describe(testDescription + ' exports', function() {
      // Generate existence tests for each expected object
      if ('expectedObjects' in moduleDescription) {
        moduleDescription.expectedObjects.forEach(function(o) {
          it(name + '.js exports \'' + o + '\' property', exportsProperty(moduleUnderTest, o));
        });
      }

      // ... and each expected function
      if ('expectedFunctions' in moduleDescription) {
        moduleDescription.expectedFunctions.forEach(function(f) {
          it(name + '.js exports \'' + f + '\' property', exportsProperty(moduleUnderTest, f));
          it('\'' + f + '\' property of ' + name + '.js is a function', exportsFunction(moduleUnderTest, f));
        });
      }
    });
  };


  exports = exports.commonJsStrict ? (exports.commonJsStrict.testingUtilities = {}) : exports;
  exports.checkModule = checkModule;


}));
//(function() {
//  "use strict";
//
//
//  // Exports useful functions for testing
//  var testUtils = function(require, exports, module) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var curryModule = require('../curry');
//    var getRealArity = curryModule.getRealArity;
//    var curry = curryModule.curry;
//
//    var utils = require('../utils');
//    var isObjectLike = utils.isObjectLike;
//
//
//    var isFuncTypeClass = function(tc) {
//      return /^function:\s+/.test(tc);
//    };
//
//
//    var prims = ['number', 'boolean', 'undefined', 'object', 'string', 'function'];
//    var isPrimitiveType = function(t) {
//      return prims.indexOf(t) !== -1;
//    };
//
//
//    // Maps typeclass names to the values that will be returned by typeof for an instance of the typeclass.
//    // This allows testTypeRestrictions to verify that I've specified valid validArguments values
//    var nonPrimDict = {'null': 'object', 'array': 'object', 'integer': 'number', 'positive': 'number'};
//    var nonPrimToPrim = function(nP) {
//      if (nP in nonPrimDict)
//        return nonPrimDict[nP];
//      if (isFuncTypeClass(nP))
//        return 'function';
//
//      throw new Error('testUtils typechecking: unrecognised non-primitive' + nP);
//    };
//
//
//    var typeclasses = ['integer', 'positive', 'arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull'];
//    var isTypeClass = function(restriction) {
//      if (typeclasses.indexOf(restriction) !== -1)
//        return true;
//      if (isFuncTypeClass(restriction))
//        return true;
//
//      return false;
//    };
//
//
//    // Returns true when argument is the name of a typeclass that can map to actual values of more than one type
//    var isMultiTypeClass = function(restriction) {
//      return ['arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull'].indexOf(restriction) !== -1;
//    };
//
//
//    // Take an array of arrays—args—where each subarray is a list of acceptable values
//    // for the parameter at that position. Returns a new array of arrays where each subarray
//    // is an acceptable parameter list for the function.
//    var makeGoodArgs = function(args) {
//      var result = [];
//
//      if (args.length === 0)
//        return result;
//
//      var remaining = makeGoodArgs(args.slice(1));
//      args[0].forEach(function(arg) {
//        if (remaining.length > 0) {
//          remaining.forEach(function(rest) {
//            result.push([arg].concat(rest));
//          });
//        } else {
//          result.push([arg]);
//        }
//      });
//
//      return result;
//    };
//
//
//    var makeGoodArgDescriptor = function(b, a) {return {before: b, after: a};};
//
//    // Takes an array of arrays—args—where each subarray is a list of acceptable values
//    // for the parameter at that position, and the parameter position where we are going to
//    // substitute bad data. Returns an array of arg descriptor objects, with before and after
//    // properties: these are the arguments that slot in either side of the bad data.
//    var constructGoodArgsFor = function(goodArgs, paramIndex) {
//      var beforeArgs = makeGoodArgs(goodArgs.slice(0, paramIndex));
//      var afterArgs = makeGoodArgs(goodArgs.slice(paramIndex + 1));
//
//      var result = [];
//      if (beforeArgs.length > 0) {
//        beforeArgs.forEach(function(b) {
//          if (afterArgs.length > 0) {
//            afterArgs.forEach(function(a) {
//              result.push(makeGoodArgDescriptor(b, a));
//            });
//          } else {
//            result.push(makeGoodArgDescriptor(b, []));
//          }
//        });
//      } else {
//        if (afterArgs.length > 0) {
//          afterArgs.forEach(function(a) {
//            result.push(makeGoodArgDescriptor([], a));
//          });
//        } else {
//          result.push(makeGoodArgDescriptor([], []));
//        }
//      }
//
//      return result;
//    };
//
//
//    // Generates an array of possible bogus values. We want a fresh array
//    // every time, in case the function modifies values in some way.
//    var makeBogusFor = function(resSpec) {
//      var primBogus = [
//        {name: 'number', article: 'a ', value: 2, typeclasses: ['integer', 'positive']},
//        {name: 'boolean', article: 'a ', value: true, typeclasses: ['integer', 'positive']},
//        {name: 'string', article: 'a ', value: 'c',
//         typeclasses: ['integer', 'positive', 'arraylike', 'objectlike', 'objectlikeornull']},
//        {name: 'undefined', article: '', value: undefined, typeclasses: []},
//        {name: 'null', article: '', value: null, typeclasses: ['integer', 'positive', 'objectlikeornull']},
//        {name: 'function', article: 'a ', value: function() {},
//         typeclasses: ['function', 'objectlike', 'objectlikeornull']},
//        {name: 'object', article: 'an ', value: {foo: 4},
//         typeclasses: ['integer', 'positive', 'objectlike','objectlikeornull']},
//        {name: 'array', article: 'an ', value: [4, 5, 6],
//         typeclasses: ['arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull']}
//      ];
//
//      // If the restriction is a constructor function, then all of the above will be bogus
//      if (resSpec.length === 1 && typeof(resSpec[0]) === 'function')
//        return primBogus;
//
//      primBogus = primBogus.filter(function(val) {return resSpec.indexOf(val.name) === -1;});
//
//      // Add arraylike test if objects aren't allowed (need to do this seperately as they are of course objects
//      if (resSpec.indexOf('object') === -1)
//        primBogus.push({name: 'arraylike', article: 'an ', value: {'0': 1, '1': 2, 'length': 2},
//         typeclasses: ['arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull']});
//
//      // If the restriction is not a typeclass, then we're done. This assumes we already checked
//      // that typeclasses restrictions only appear in arrays of length 1
//      if (resSpec.length > 1 || !isTypeClass(resSpec[0]))
//        return primBogus;
//
//      resSpec = resSpec[0];
//
//      // Filter on the members of the typeclass
//      var toFilter = isFuncTypeClass(resSpec) ? 'function' : resSpec;
//      primBogus = primBogus.filter(function(val) {return val.typeclasses.indexOf(toFilter) === -1;});
//
//      var badObjectMaker = function(val) {
//        return {valueOf: function() {return val;}};
//      };
//
//      // Add typeclass specific bogus arguments
//
//      if (resSpec === 'integer' || resSpec === 'positive') {
//        primBogus.push({name: 'positive float', article: 'a ', value: 1.1});
//        primBogus.push({name: 'negative float', article: 'a ', value: -1.1});
//        primBogus.push({name: 'positive infinity', article: '', value: Number.POSITIVE_INFINITY});
//        primBogus.push({name: 'negative infinity', article: '', value: Number.NEGATIVE_INFINITY});
//        primBogus.push({name: 'NaN', article: '', value: NaN});
//        primBogus.push({name: 'string that coerces to NaN', article: 'a ', value: 'abc'});
//        primBogus.push({name: 'string that coerces to float', article: 'a ', value: '1.1'});
//        primBogus.push({name: 'string that coerces to negative float', article: 'a ', value: '-1.1'});
//        primBogus.push({name: 'object that coerces to float', article: 'an ', value: badObjectMaker(1.1)});
//        primBogus.push({name: 'object that coerces to negative float', article: 'an ', value: badObjectMaker(-1.1)});
//        primBogus.push({name: 'object that coerces to infinity', article: 'an ',
//                        value: badObjectMaker(Number.POSITIVE_INFINITY)});
//        primBogus.push({name: 'object that coerces to negative infinity', article: 'an ',
//                        value: badObjectMaker(Number.NEGATIVE_INFINITY)});
//        primBogus.push({name: 'object that coerces to NaN', article: 'an ', value: badObjectMaker(NaN)});
//      }
//
//      if (resSpec === 'positive') {
//        primBogus.push({name: 'negative integer', article: 'a ', value: -1});
//        primBogus.push({name: 'string that coerces to a negative integer', article: 'a ', value: '-2'});
//        primBogus.push({name: 'object that coerces to a negative integer', article: 'a ', value: badObjectMaker(-3)});
//      }
//
//
//      var bogusFuncs = [
//        function() {},
//        function(x) {},
//        function(x, y) {},
//        function(x, y, z) {},
//        function(w, x, y, z) {}
//      ];
//
//
//      var arityResults = /function:\s+arity\s+(\d+)/.exec(resSpec);
//      var i, l;
//
//      if (arityResults && arityResults.length > 0) {
//        var arity = arityResults[1] - 0;
//        for (i = 0, l = bogusFuncs.length; i < l; i++) {
//          if (i !== arity) {
//            primBogus.push({name: 'function of arity ' + i, article: 'a ', value: bogusFuncs[i]});
//            primBogus.push({name: 'curried function of arity ' + i, article: 'a ', value: curry(bogusFuncs[i])});
//          }
//        }
//      } else {
//        var minArityResults = /function:\s+minarity\s+(\d+)/.exec(resSpec);
//        if (minArityResults && minArityResults.length > 0) {
//          var minArity = minArityResults[1] - 0;
//          for (i = 0; i < minArity; i++) {
//            primBogus.push({name: 'function of arity ' + i, article: 'a ', value: bogusFuncs[i]});
//            primBogus.push({name: 'curried function of arity ' + i, article: 'a ', value: curry(bogusFuncs[i])});
//          }
//        }
//      }
//
//
//      return primBogus;
//    };
//
//
//    // If I've written a function taking 10 parameters, then something has gone terribly wrong!
//    var positions = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
//
//
//    // Before testTypeRestrictions generates the type tests, it is prudent to ensure I have written the spec correctly.
//    // Specifically, we need to ensure that if the "restrictions" field says that, for example, parameter 0 can be a
//    // number or a boolean, then the "validArguments" for that parameter should contain a number and a boolean (at the
//    // same indices as their respective restrictions).
//    //
//    // The task is complicated somewhat by the function typeclasses for functions of specific arity, and the "multi"
//    // typeclasses: arraylike etc, which map to more than one type.
//    //
//    // The function below performs this verification.
//
//    var verifyRestrictions = function(name, restrictions, validArguments) {
//      restrictions.forEach(function(resSpec, i) {
//        var errorPre = name + ' spec incorrect for parameter ' + (i + 1) + ': ';
//
//        // resSpec is an array of restrictions for parameter i
//        resSpec.forEach(function(r, j) {
//          // If a function accepts a specific type of object e.g. RegExp, then that should be the only possible
//          // restriction for that position: for example, we shouldn't have a parameter that can be a RegExp or a boolean.
//          if (typeof(r) === 'function') {
//            if (resSpec.length > 1)
//              throw new Error(errorPre + 'A constructor must be the only restriction for that parameter!');
//
//            if (!(validArguments[i][j] instanceof r))
//              throw new Error(errorPre + 'The example argument is not an instance of the given constructor');
//
//            return;
//          }
//
//          if (typeof(r) !== 'string')
//            throw new Error(errorPre + 'Restriction ' + (j + 1) + ' has type ' + typeof(r));
//
//          // If the restriction is a typeclass, it should be the only one
//          if (isTypeClass(r) && resSpec.length > 1)
//            throw new Error(errorPre + 'A typeclass must be the only restriction for that parameter!');
//
//          // Sanity check the validArguments for this parameter. They should be the type I claim is permissable!
//          if (!isMultiTypeClass(r)) {
//            var t = isPrimitiveType(r) ? r : nonPrimToPrim(r);
//            if (typeof(validArguments[i][j]) !== t)
//              throw new Error(errorPre + 'valid argument ' + (j + 1) + ' has type ' + typeof(validArguments[i][j]) +
//                              ', value ' + validArguments[i][j] + ', restriction demands type ' + t);
//            return;
//          }
//
//          // We now know the restriction is a multi typeclass. For 'arraylike' and 'strictarraylike', we require that
//          // validArguments contains a value for each permissible member of the typeclass. For 'objectlike' we require
//          // only one example.
//
//          if (r === 'objectlike' || r === 'objectlikeornull') {
//            var withNull = r === 'objectlikeornull';
//            if (!isObjectLike(validArguments[i][j], withNull))
//              throw new Error(errorPre + 'validArguments ' + (j + 1) + ' (' + validArguments[i][j] + ') is not objectlike');
//
//            return;
//          }
//
//          var validArgsType = validArguments[i].map(function(x) {return Array.isArray(x) ? 'array' : typeof(x);});
//          var correctLength = r === 'arraylike' ? 3 : 2;
//
//          if (validArguments[i].length !== correctLength)
//            throw new Error(errorPre + 'Not enough examples of ' + r + ' - expected ' + correctLength + ' found ' +
//                            validArguments[i].length);
//
//          if (validArgsType.indexOf('array') === -1 || validArgsType.indexOf('object') === -1 ||
//              (correctLength === 3 && validArgsType.indexOf('string') === -1))
//            throw new Error(errorPre + 'Valid argument for ' + r + ' have wrong type');
//        });
//      });
//    };
//
//
//    /*
//     * Generates a number of functions that test all possible combinations where a particular argument
//     * is of a type that should throw. Takes the function name, the function to test, and two arrays:
//     *
//     *  - restrictions:       An array of arrays. This should have the same length as the function's arity.
//     *                        Each element is an array containing EITHER a list of strings representing the
//     *                        valid types for this parameter, or a single element which is the constructor
//     *                        function for a specific object type. For example,
//     *                        [['string'], ['object', 'array'], [RegExp]] denotes a function whose first
//     *                        argument must be a string, whose second can be an object or array, and whose
//     *                        third parameter must be a RegExp. Note, 'object' means a real object: use 'null'
//     *                        or 'array' if those types are acceptable.
//     *
//     *  - validArguments:     An array of arrays. This must be the same length as the function's arity. Each
//     *                        element should be an array, containing acceptable values for the parameter at
//     *                        that position. Where an argument has a restriction, the array at this position
//     *                        should have the same length as the number of restrictions, and the values should
//     *                        match: i.e. for the example above for restrictions, the second array should have
//     *                        two elements: the first an acceptable object, the second an acceptable string.
//     *                        Arguments without restrictions can be supplied in any number, but there must be
//     *                        at least one.
//     *
//     * Throws at test generation time if the restrictions/good arguments don't match.
//     *
//     */
//
//    var testTypeRestrictions = function(name, fnUnderTest, restrictions, validArguments) {
//      // First, we perform various sanity checks to ensure I have written the spec correctly
//
//      var arity = getRealArity(fnUnderTest);
//      if (restrictions.length !== arity)
//        throw new Error('You haven\'t supplied the correct amount of restrictions: ' + name + ' has arity ' + arity +
//                        ' and you supplied ' + restrictions.length);
//
//      if (validArguments.length !== arity)
//        throw new Error('You haven\'t supplied the correct amount of valid arguments: ' + name + ' has arity ' + arity +
//                        ' and you supplied ' + validArguments.length);
//
//      validArguments.forEach(function(g, i) {
//        if (g.length === 0)
//          throw new Error('You never supplied any valid values for parameter ' + (i + 1) + ' of ' + name);
//      });
//
//
//      verifyRestrictions(name, restrictions, validArguments);
//
//      // Now we've checked that I'm not an idiot, we can generate the tests!
//      restrictions.forEach(function(resSpec, i) {
//        if (resSpec.length === 0)
//          return;
//
//        // We want the message to be 'the parameter' if there's only one
//        var posString = restrictions.length > 1 ? positions[i] + ' ' : '';
//
//        var good = constructGoodArgsFor(validArguments, i);
//        var l = good.length;
//
//        var bogusArgs = makeBogusFor(resSpec);
//
//        bogusArgs.forEach(function(bogus) {
//          good.forEach(function(goodDescriptor, j) {
//            var args = goodDescriptor.before.concat([bogus.value]).concat(goodDescriptor.after);
//
//            // We handle stateful functions as follows: if the last argument is an object with a
//            // 'reset' property, then assume this is a function to be called to generate the argument
//            var idx = args.length - 1;
//            if (typeof(args[idx]) === 'object' && args[idx] !== null && 'reset' in args[idx])
//              args[idx] = args[idx].reset();
//
//            var message = good.length === 1 ? '' : ' (' + (j + 1) + ')';
//            it('Throws when the ' + posString + 'parameter is ' + bogus.article + bogus.name + message, function() {
//              var fn = function() {
//                fnUnderTest.apply(null, args);
//              };
//
//              expect(fn).to.throw(TypeError);
//            });
//          });
//        });
//      });
//    };
//
//
//    var makeArrayLike = function() {
//      var args = [].slice.call(arguments);
//
//      var result = {};
//      if (args.length === 1 && typeof(args[0]) === 'object' && ('length' in args[0])) {
//        // We've been passed an arraylike: copy it
//        for (var k in args[0])
//          result[k] = args[0][k];
//
//        return result;
//      }
//
//      args.forEach(function(arg, i) {
//        result[i] = arg;
//      });
//
//      result.length = args.length;
//
//      // We provide every, indexOf and slice for testing convenience
//      result.every = function() {
//        return [].every.apply(this, arguments);
//      };
//
//      result.slice = function() {
//        return makeArrayLike(this);
//      };
//
//
//      result.indexOf = function(val, from) {
//        from = from || 0;
//
//        for (var i = from, l = this.length; i < l; i++)
//          if (this[i] === val)
//            return i;
//
//        return -1;
//      };
//
//
//      return result;
//    };
//
//
//    var addFunctionIsCurriedTest = function(fnUnderTest) {
//      it('Is curried', function() {
//        expect(fnUnderTest.length).to.equal(1);
//        expect(getRealArity(fnUnderTest)).to.not.equal(1);
//      });
//    };
//
//
//    // Generate a text fixture code that checks a function has a given length, and possibly that it is curried,
//    // and then calls remainingTests with the function under test in order to add function-specific tests
//    var describeFunction = function(spec, fnUnderTest, remainingTests) {
//      var name = spec.name;
//      var arity = spec.arity;
//
//      describe(name, function() {
//        it('Has correct arity', function() {
//          expect(getRealArity(fnUnderTest)).to.equal(arity);
//        });
//
//
//        if (arity > 1)
//          addFunctionIsCurriedTest(fnUnderTest);
//
//        if ('restrictions' in spec)
//          testTypeRestrictions(name, fnUnderTest, spec.restrictions, spec.validArguments);
//
//        remainingTests(fnUnderTest);
//      });
//    };
//
//
//    // Deeply check two objects for equality (ignoring functions)
//    var checkObjectEquality = function(obj1, obj2) {
//      var obj1Keys = Object.getOwnPropertyNames(obj1);
//      var obj2Keys = Object.getOwnPropertyNames(obj2);
//
//      if (obj1Keys.length !== obj2Keys.length)
//        return false;
//
//      return obj1Keys.every(function(k, i) {
//        return checkEquality(obj1[k], obj2[k], true);
//      });
//    };
//
//
//    // Deeply check two arrays for equality (ignoring functions)
//    var checkArrayEquality = function(arr1, arr2) {
//      if (arr1.length !== arr2.length)
//        return false;
//
//      return arr1.every(function(val, i) {
//        return checkEquality(val, arr2[i], true);
//      });
//    };
//
//
//    // Check two arrays for identity of contents, ignoring order
//    var checkArrayContent = function(arr1, arr2, sortFn) {
//      if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length)
//        return false;
//
//      var sortArgs = [];
//      if (typeof(sortFn) === 'function')
//        sortArgs.push(sortFn);
//
//      var a1 = arr1.slice();
//      var a2 = arr2.slice();
//
//      a1.sort.apply(a1, sortArgs);
//      a2.sort.apply(a2, sortArgs);
//      return a1.every(function(val, i) {
//        return val === a2[i];
//      });
//    };
//
//
//    // Deeply check two values for equality. If acceptFunctions is true,
//    // then two functions will blindly be assumed to be equal.
//    var checkEquality = function(obj1, obj2, acceptFunctions) {
//      acceptFunctions = acceptFunctions || false;
//
//      if (typeof(obj1) !== typeof(obj2))
//        return false;
//
//      // Short-circuit if we can (needed for the 'constant' tests)
//      if (obj1 === obj2)
//        return true;
//
//      var objType = typeof(obj1);
//
//      // If the initial result is a function, then we've written
//      // the test incorrectly
//      if (objType === 'function' && !acceptFunctions)
//        throw new Error('Test error: trying to compare functions!');
//
//      if (objType === 'object') {
//        if (Array.isArray(obj1)) {
//          if (!Array.isArray(obj2))
//            return false;
//
//          return checkArrayEquality(obj1, obj2);
//        } else if (obj1 === null || obj2 === null) {
//          return obj1 === obj2;
//        } else {
//          return checkObjectEquality(obj1, obj2);
//        }
//      } else if (objType === 'function') {
//        // We can't check functions, so just wing it
//        return true;
//      } else {
//        // We already know obj1 !== obj2
//        return false;
//      }
//    };
//
//
//    // Three helper functions for the test generation code below
//    var checkFunction = function(curried) {
//      return function() {
//        expect(curried).to.be.a('function');
//      };
//    };
//
//
//    var checkLength = function(curried) {
//      return function() {
//        expect(curried.length).to.equal(1);
//      };
//    };
//
//
//    var callWithRemaining = function(curried, curriedArgs, expected, thenArgs) {
//      var args = getRealArgs(curriedArgs);
//
//      var testPrimitive = function() {
//        var result = curried.apply(null, args);
//
//        expect(checkEquality(result, expected)).to.equal(true);
//      };
//
//      var testFunc = function() {
//        var result = curried.apply(null, args).apply(null, thenArgs);
//
//        expect(checkEquality(result, expected)).to.equal(true);
//      };
//
//      return thenArgs === null ? testPrimitive : testFunc;
//    };
//
//
//    // Helper function for testing stateful functions
//    var getRealArgs = function(args) {
//      var result = args.slice();
//      var last = result[result.length - 1];
//
//      // If the last argument is an object with a "reset" property, then assume we are testing a state-changing
//      // function, and the property contains the function to be called to generate a new object
//      if (typeof(last) === 'object' && last !== null && 'reset' in last)
//        result[result.length - 1] = last.reset();
//
//      return result;
//    };
//
//
//    // There are a number of checks we want to perform on curried functions when testing
//    // the 'curry' function. The same checks apply when testing other library functions that we expect
//    // to be curried. We generate these tests automatically.
//    var testCurriedFunction = function(curried, originalArgs, options) {
//      options = options || {};
//
//      // Many of the functions being tested will themselves return functions. This means we generally
//      // won't be able to test equality of return values. If originalArgs is an array, then we assume
//      // that the function under test does indeed return a primitive value. Otherwise, we assume it is
//      // an object containing two arrays: 'firstArgs': the args to supply to the function under test, and
//      // 'thenArgs': the args to apply to the resulting function. (Yes, we assume that the returned function
//      // itself returns primitive values)
//
//      // I chose to make original optional. There are really two use cases: check this curried function behaves
//      // like this uncurried function, and check this curried function—which I have verified works when called with
//      // all args—behaves correctly when partially applied.
//      // Initially, I thought original would be mandatory, but realised this will often result in having to
//      // reimplement the function under test.
//      var original = options.original || curried;
//      var message = options.message || 'Curried function';
//
//      var args = Array.isArray(originalArgs) ? originalArgs : originalArgs.firstArgs;
//      var thenArgs = Array.isArray(originalArgs) ? null : originalArgs.thenArgs;
//
//      var expectedArgs = getRealArgs(args);
//
//      var expected = thenArgs === null ? original.apply(null, expectedArgs) : original.apply(null, expectedArgs).apply(null, thenArgs);
//
//      var performTests = function(curried, curriedArgs, message) {
//        // Function?
//        it(message + ' is a function', checkFunction(curried));
//
//        // Correct length?
//        it(message + ' has length 1', checkLength(curried));
//
//        // Called with outstanding arg === original result
//        // Note: if curried === original then these tests should be redundant, the caller should
//        // have already tested the function with all arguments supplied
//        if (curried !== original) {
//          var length = curriedArgs.length;
//
//          var postMessage = length === 1 ? ' final curried function returns correct value' :
//                                           ' called with all remaining arguments returns correct value';
//          it(message + postMessage, callWithRemaining(curried, curriedArgs, expected, thenArgs));
//
//          if (length === 1)
//            return;
//        }
//
//        // Perform these tests again with various numbers of arguments applied
//        for (var i = 0, l = curriedArgs.length - 1; i < l; i++) {
//          var newCurried = curried.apply(null, curriedArgs.slice(0, i + 1));
//          var newRemaining = curriedArgs.slice(i + 1);
//          var newMessage = [message, ' (then partially applied with ', i + 1, ' arguments)'].join('');
//          performTests(newCurried, newRemaining, newMessage);
//        }
//      };
//
//      performTests(curried, args, message);
//    };
//
//
//    module.exports = {
//      addFunctionIsCurriedTest: addFunctionIsCurriedTest,
//      checkArrayContent: checkArrayContent,
//      checkArrayEquality: checkArrayEquality,
//      checkEquality: checkEquality,
//      checkObjectEquality: checkObjectEquality,
//      describeFunction: describeFunction,
//      describeModule: describeModule,
//      exportsFunction: exportsFunction,
//      exportsProperty: exportsProperty,
//      makeArrayLike: makeArrayLike,
//      testCurriedFunction: testCurriedFunction,
//      testTypeRestrictions: testTypeRestrictions
//    };
//  };
//
//
//  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
//  if (typeof(define) === "function") {
//    define(function(require, exports, module) {
//      testUtils(require, exports, module);
//    });
//  } else {
//    testUtils(require, exports, module);
//  }
//})();