(function() {
  // Deliberate outer scope here: we want a non-strict scope where "this" points to the global.

  var global = this;
  var print = this.window === undefined ? this.print : undefined; // SpiderMonkey JS shell

  return function() {
    "use strict";


    var testFixture = function(require, exports) {
      var chai = require('chai');
      var expect = chai.expect;

      var utils = require('../utils');

      var testUtils = require('./testUtils');
      var describeModule = testUtils.describeModule;
      var describeFunction = testUtils.describeFunction;


      var expectedObjects = [];
      var expectedFunctions = ['valueStringifier', 'isArrayLike', 'checkArrayLike', 'isObjectLike',
                               'checkIntegral', 'checkPositiveIntegral', 'checkObjectLike', 'defineValue', 'help'];
      describeModule('utils', utils, expectedObjects, expectedFunctions);


      var vsSpec = {
        name: 'valueStringifier',
        arity: 1
      };


      describeFunction(vsSpec, utils.valueStringifier, function(valueStringifier) {
        var f = function() {};
        var o = {};
        var tests = [
          {name: 'number', value: 1, result: '1'},
          {name: 'boolean', value: true, result: 'true'},
          {name: 'string', value: 'a', result: '\'a\''},
          {name: 'function', value: f, result: f.toString()},
          {name: 'object', value: o, result: '{' + o.toString() + '}'},
          {name: 'object with toString', value: {toString: function() {return '***';}},
                                         result: '{***}'},
          {name: 'array', value: [1, 2], result: '[1, 2]'},
          {name: 'undefined', value: undefined, result: 'undefined'},
          {name: 'null', value: null, result: 'null'}
        ];


        tests.forEach(function(t) {
          var name = t.name;

          it('Behaves correctly for ' + name, function() {
            var s = valueStringifier(t.value);
            var expected = t.result;

            expect(s).to.equal(expected);
          });
        });
      });


      var arrayLikeTests = [
        {name: 'number', value: 1, result: false},
        {name: 'boolean', value: true, result: false},
        {name: 'string', value: 'a', result: true},
        {name: 'function', value: function() {}, result: false},
        {name: 'object', value: {}, result: false},
        {name: 'array', value: [1, 2], result: true},
        {name: 'undefined', value: undefined, result: false},
        {name: 'null', value: null, result: false},
        {name: 'arrayLike', value: {'0': 'a', '1': 'b', 'length': 2}, result: true}
      ];


      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter.
      describe('isArrayLike', function() {
        var isArrayLike = utils.isArrayLike;


        arrayLikeTests.forEach(function(t) {
          var name = t.name;

          it('Behaves correctly for ' + name, function() {
            var b = isArrayLike(t.value);
            var expected = t.result;

            expect(b).to.equal(expected);
          });
        });


        it('Behaves correctly with string when noStrings parameter explicitly false', function() {
          expect(isArrayLike('a', false)).to.be.true;
        });


        it('Behaves correctly with string when noStrings parameter explicitly true', function() {
          expect(isArrayLike('a', true)).to.be.false;
        });
      });



      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter.
      describe('checkArrayLike', function() {
        var checkArrayLike = utils.checkArrayLike;


        var shouldFail = arrayLikeTests.filter(function(test) {return test.result === false;});
        var shouldPass = arrayLikeTests.filter(function(test) {return test.result === true;});

        shouldFail.forEach(function(test) {
          var name = test.name;


          it('Behaves correctly for ' + name, function() {
            var fn = function() {
              checkArrayLike(test.value);
            };

            expect(fn).to.throw(TypeError);
          });


          it('Returns correct exception for ' + name, function() {
            var message = 'This was an error';
            var fn = function() {
              checkArrayLike(test.value, {message: message});
            };

            expect(fn).to.throw(message);
          });
        });


        shouldPass.forEach(function(test) {
          var name = test.name;


          it('Doesn\'t throw for ' + name, function() {
            var fn = function() {
              checkArrayLike(test.value);
            };

            expect(fn).to.not.throw(TypeError);
          });


          it('Behaves correctly when dontSlice in options ' + name, function() {
            var v = checkArrayLike(test.value, {dontSlice: true});

            expect(v).to.equal(test.value);
          });


          it('Behaves correctly when dontSlice explicitly false in options ' + name, function() {
            var v = checkArrayLike(test.value, {dontSlice: false});

            if (name === 'string') {
              expect(v).to.equal(test.value);
            } else {
              expect(v).to.not.equal(test.value);
              // Need to manually check deep equality due to arraylikes being transformed to arrays
              for (var i = 0, l = test.value.length; i < l; i++)
                expect(v[i]).to.equal(test.value[i]);
            }
          });


          it('Behaves correctly when dontSlice not in options ' + name, function() {
            var v = checkArrayLike(test.value);

            if (name === 'string') {
              expect(v).to.equal(test.value);
            } else {
              expect(v).to.not.equal(test.value);
              // Need to manually check deep equality due to arraylikes being transformed to arrays
              for (var i = 0, l = test.value.length; i < l; i++)
                expect(v[i]).to.equal(test.value[i]);
            }
          });
        });


        it('Doesn\'t accept strings when relevant parameter passed in (1)', function() {
          var fn = function() {
            checkArrayLike('abc', {noStrings: true});
          };

          expect(fn).to.throw(TypeError);
        });


        it('Doesn\'t accept strings when relevant parameter passed in (2)', function() {
          var message = 'Noooo, no strings here!';
          var fn = function() {
            checkArrayLike('abc', {noStrings: true, message: message});
          };

          expect(fn).to.throw(message);
        });


        it('Accepts strings when relevant parameter explicitly passed in', function() {
          var s = checkArrayLike('abc', {noStrings: false});

          expect(s).to.equal('abc');
        });
      });


      var objectLikeTests = [
        {name: 'number', value: 1, result: false},
        {name: 'boolean', value: true, result: false},
        {name: 'string', value: 'a', result: true},
        {name: 'function', value: function() {}, result: true},
        {name: 'object', value: {}, result: true},
        {name: 'array', value: [1, 2], result: true},
        {name: 'undefined', value: undefined, result: false},
        {name: 'null', value: null, result: false}
      ];


      describe('isObjectLike', function() {
        var isObjectLike = utils.isObjectLike;


        objectLikeTests.forEach(function(t) {
          var name = t.name;

          it('Behaves correctly for ' + name, function() {
            var b = isObjectLike(t.value);
            var expected = t.result;

            expect(b).to.equal(expected);
          });
        });


        var addOptionTests = function(allowNull, strict) {
          it('Behaves correctly for null when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike(null, {allowNull: allowNull, strict: strict})).to.equal(allowNull);
          });


          it('Behaves correctly for function when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike(function() {}, {allowNull: allowNull, strict: strict})).to.equal(!strict);
          });


          it('Behaves correctly for string when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike('a', {allowNull: allowNull, strict: strict})).to.equal(!strict);
          });


          it('Behaves correctly for array when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike([1], {allowNull: allowNull, strict: strict})).to.equal(!strict);
          });


          it('Behaves correctly for object when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike({}, {allowNull: allowNull, strict: strict})).to.be.true;
          });
        };


        addOptionTests(false, false);
        addOptionTests(false, true);
        addOptionTests(true, false);
        addOptionTests(true, true);
      });


      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter.
      describe('checkObjectLike', function() {
        var checkObjectLike = utils.checkObjectLike;


        var shouldFail = objectLikeTests.filter(function(test) {return test.result === false;});
        var shouldPass = objectLikeTests.filter(function(test) {return test.result === true;});

        shouldFail.forEach(function(test) {
          var name = test.name;


          it('Behaves correctly for ' + name, function() {
            var fn = function() {
              checkObjectLike(test.value);
            };

            expect(fn).to.throw(TypeError);
          });


          it('Returns correct exception for ' + name, function() {
            var message = 'This was an error';
            var fn = function() {
              checkObjectLike(test.value, {message: message});
            };

            expect(fn).to.throw(message);
          });
        });


        shouldPass.forEach(function(test) {
          var name = test.name;


          it('Doesn\'t throw for ' + name, function() {
            var fn = function() {
              checkObjectLike(test.value);
            };

            expect(fn).to.not.throw(TypeError);
          });


          it('Returns its argument for ' + name, function() {
            expect(checkObjectLike(test.value)).to.equal(test.value);
          });
        });


        it('Doesn\'t accept null when relevant parameter explicitly passed in (1)', function() {
          var fn = function() {
            checkObjectLike(null, {allowNull: false});
          };

          expect(fn).to.throw(TypeError);
        });


        it('Doesn\'t accept null when relevant parameter explicitly passed in (2)', function() {
          var message = 'Noooo, no null here!';
          var fn = function() {
            checkObjectLike(null, {allowNull: false, message: message});
          };

          expect(fn).to.throw(message);
        });


        it('Accepts null when relevant parameter passed in', function() {
          var o = checkObjectLike(null, {allowNull: true});

          expect(o).to.equal(null);
        });


        var addStrictTests = function(type, val) {
          it('Accepts ' + type + ' when strict parameter explicitly false', function() {
            var o = checkObjectLike(val, {strict: false});

            expect(o).to.equal(val);
          });


          it('Doesn\'t accept ' + type + ' when strict parameter true (1)', function() {
            var fn = function() {
              checkObjectLike(val, {strict: true});
            };

            expect(fn).to.throw(TypeError);
          });


          it('Doesn\'t accept ' + type + ' when relevant strict parameter true (2)', function() {
            var message = 'Noooo, only objects here!';
            var fn = function() {
              checkObjectLike(val, {strict: true, message: message});
            };

            expect(fn).to.throw(message);
          });
        };


        addStrictTests('function', function() {});
        addStrictTests('string', 'abc');
      });


      // The following arrays are for generating tests that exercise checkIntegral/checkPositiveIntegral.

      var notNumericTests = [
        {name: 'string', value: 'a'},
        {name: 'function', value: function() {}},
        {name: 'object', value: {}},
        {name: 'array', value: [1, 2]},
        {name: 'undefined', value: undefined}
      ];


      var nonIntegralTests = [
        {name: 'NaN', value: NaN, result: false},
        {name: 'negative infinity', value: Number.NEGATIVE_INFINITY, result: false},
        {name: 'positive infinity', value: Number.POSITIVE_INFINITY, result: false},
        {name: 'negative float', value: -1.1, result: false},
        {name: 'float', value: 2.2, result: false},
        {name: 'string containing float', value: '0.1', result: false},
        {name: 'object evaluating to float', value: {valueOf: function() {return 1.1;}}, result: false},
      ];


      var positiveIntegralTests = [
        {name: 'integer', value: 2, result: true},
        {name: 'null', value: null, result: true}, // null coerces to 0
        {name: 'true', value: true, result: true}, // booleans should coerce to numbers
        {name: 'false', value: false, result: true},
        {name: 'string containing positive integer', value: '1', result: true},
        {name: 'object evaluating to positive integer', value: {valueOf: function() {return 2;}}, result: true},
      ];


      var negativeIntegralTests = [
        {name: 'negative integer', value: -5, result: false},
        {name: 'string containing negative integer', value: '-1', result: true},
        {name: 'object evaluating to negative integer', value: {valueOf: function() {return -3;}}, result: true},
      ];


      // All the tests for the numeric tests will have the same shape, and use the same data.
      var addNumericTests = function(fnUnderTest, positiveOnly) {
        var addOne = function(name, value, ok) {
          it('Behaves correctly for ' + name, function() {
            var result = null;
            var fn = function() {
              result = fnUnderTest(value);
            };

            if (!ok) {
              expect(fn).to.throw(TypeError);
            } else {
              expect(fn).to.not.throw(TypeError);
              expect(result).to.equal(value - 0);
            }
          });


          if (ok)
            return;


          it('Returns correct exception for ' + name, function() {
            var message = 'This was an error';
            var fn = function() {
              fnUnderTest(value, message);
            };

            expect(fn).to.throw(message);
          });
        };


        notNumericTests.forEach(function(t) {
          addOne(t.name, t.value, false);
        });


        nonIntegralTests.forEach(function(t) {
          addOne(t.name, t.value, false);
        });


        positiveIntegralTests.forEach(function(t) {
          addOne(t.name, t.value, true);
        });


        negativeIntegralTests.forEach(function(t) {
          addOne(t.name, t.value, !positiveOnly);
        });
      };


      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter.
      describe('checkIntegral', function() {
        var checkIntegral = utils.checkIntegral;


        addNumericTests(checkIntegral, false);
      });


      describe('checkPositiveIntegral', function() {
        var checkPositiveIntegral = utils.checkPositiveIntegral;


        addNumericTests(checkPositiveIntegral, true);
      });


      // Helper function for defineValue/help test generation.
      // Takes the type of data being defined, an array of strings naming the arguments to be supplied, and
      // an optional options object.

      // Returns an object containing an array 'argsArray' of actual arguments that can be fed to defineValue,
      // using defineValue.apply(null, ...), and 'argMap', which maps the argument names to their position in
      // argsArray.

      // The args args array should be ordered according to the desired ordering of the actual arguments.
      // (This allows this function to be used for generating both valid and invalid calls.)
      //
      // options can contain the following fields:
      //   - arity: If dataType === 'function' ensures that the supplied function and signature have the same arity
      //   - customType: a value to use for data (allows checking defineValue's handling of unsupported datatypes)
      //   - badSig: choose a signature that doesn't match the function's arity (if dataType === 'function')
      //   - customText: an array of strings to use as the help text
      //   - customSignature: a signature to be used for the function
      var makeDefineArguments = function(dataType, args, options) {
        options = options || {};

        // Note: function of arity n must be at index n
        var fns = [
          {sig: '', fn: function() {}},
          {sig: 'a: any', fn: function(a) {}},
          {sig: 'a: any, b: any', fn: function(a, b) {}},
          {sig: 'a: any, b: any, c: any', fn: function(a, b, c) {}}];

        // We allow the caller to specify a function with a specific arity
        var arity = ('arity' in options) ? options.arity : 1;
        if (arity >= fns.length)
          throw new TypeError('Trying to generate test data with unsupported arity');

        var data = dataType === 'function' ? fns[arity].fn : {};

        if ('badSig' in options)
          arity = (arity + 1) % (fns.length);
        var sig = fns[arity].sig;
        if ('customSignature' in options)
          sig = options.customSignature;

        // Handle invalid data
        if ('customType' in options)
          data = options.customType;

        var name = 'foo';
        if ('customName' in options)
          name = options.customName;

        var callData = {argMap: {}};

        callData.argsArray = args.map(function(arg, i) {
          callData.argMap[arg] = i;

          arg = arg.toLowerCase();
          switch (arg) {
            case 'signature':
              return arg + ': ' + sig;

            case 'data':
              return data;

            case 'text':
              return 'text line 1';

            case 'name':
              return 'name: ' + name;

            default:
              return arg + ': foo';
          };
        });

        if ('text' in callData.argMap && 'customText' in options && options.customText) {
          var textPos = callData.argMap.text;
          var after = callData.argsArray.slice(textPos + 1);
          var custom = options.customText;
          if (!Array.isArray(custom))
            throw new TypeError('Test generation error: custom text must be in an array!');

          callData.argsArray = callData.argsArray.slice(0, textPos).concat(custom).concat(after);

          // Renumber later args
          Object.keys(callData.argMap).forEach(function(k) {
            var argPos = callData.argMap[k];
            if (argPos > textPos)
              callData.argMap[k] = argPos + custom.length - 1;
          });
        }

        return callData;
      };


      describe('defineValue', function() {
        var defineValue = utils.defineValue;


        beforeEach(function() {
          utils.resetHelpCache();
        });


        // Helper function: returns an array containing the 'signatures' of the valid calls to defineValue
        // for the given datatype.
        var getValidCallsForDataType = function(dataType) {
          var calls = [['name', 'plugin'], ['name', 'classification']];
          calls = calls.concat(calls.map(function(call) {
            return call.concat(['text']);
          }));

          if (dataType === 'function') {
            calls = calls.map(function(call) {
              return [call[0]].concat(['signature']).concat(call.slice(1));
            });
          }

          calls = calls.map(function(call) {
            return call.concat(['data']);
          });

          // Add degenerate calls
          calls.push(['data']);
          return calls;
        };


        // Helper function: returns an array containing the 'signatures' of the valid calls to defineValue
        // excluding the simple call consisting only of the data in question.
        var getNonDegenerateCallsFor = function(dataType) {
          return getValidCallsForDataType(dataType).filter(function(call) {
            return call.length > 1;
          });
        };


        // Helper function: returns a textual description of the argument list for use in the 'it' call.
        var getDescForCall = function(dataType, args) {
          // Assume args is something returned by getValidCallsForDataType
          if (args.length === 1)
            return dataType;

          var text = ((args.indexOf('plugin') !== -1) ? 'Plugin ' : 'Core ') + dataType;

          if (args.indexOf('signature') !== -1) {
            text += ' with a signature';
            if (args.indexOf('text') !== -1)
              text += ' and';
          }

          if (args.indexOf('text') !== -1)
            text += ' with text';

          return text;
        };


        var definableTypes = ['function', 'object'];


        // Helper function for test generation: iterates over each valid call for each type that defineValue
        // accepts (or the specific types specified in the options parameter). For each of those, it iterates
        // over each argument in the call, and calls the provided test making function with the type under
        // scrutiny, a textual description of the arguments, the argument in question, and the signature of
        // the arguments (this will perhaps be clearer if you look at how this is used).
        //
        // Takes an optional options parameter, and recognises the following properties
        //   ignoreText - don't call the test making function in relation to lines of help text
        //   ignoreData - don't call the test making function in relation to the value being defined
        //   ignoreDegenerate - don't call the test making function in relation to calls containing just the
        //                      defined value
        var iterateOverEachValid = function(testMaker, options) {
          options = options || {};

          var ignoreText = options.ignoreText || false;
          var ignoreData = options.ignoreData || false;
          var ignoreDegenerate = options.ignoreDegenerate || false;
          var types = options.types || definableTypes;

          types.forEach(function(dataType) {
            var callFetcher = ignoreDegenerate ? getNonDegenerateCallsFor : getValidCallsForDataType;

            var validCalls = callFetcher(dataType);
            validCalls.forEach(function(validCall) {
              var desc = getDescForCall(dataType, validCall);
              validCall.forEach(function(arg) {
                if ((ignoreText && arg === 'text') || (ignoreData && arg === 'data'))
                  return;

                testMaker(dataType, desc, arg, validCall);
              });
            });
          });
        };


        // defineValue should throw if more than one name|signature|plugin|classification line.
        var addThrowsIfMoreThanOneTest = function(dataType, desc, argToDup, args) {
          it('Throws for ' + desc + ' with more than one ' + argToDup, function() {
            var callArgsData = makeDefineArguments(dataType, args);
            var argDupIndex = callArgsData.argMap[argToDup];
            var callArgs = callArgsData.argsArray;
            callArgs = callArgs.slice(0, argDupIndex + 1)
                                .concat([callArgs[argDupIndex]])
                                .concat(callArgs.slice(argDupIndex + 1));

            var fn = function() {
              defineValue.apply(null, callArgs);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var addThrowsIfMoreThanOneTests = function() {
          iterateOverEachValid(addThrowsIfMoreThanOneTest, {ignoreDegenerate: true, ignoreText: true});
        };


        // If you provide one string you must provide them all. i.e. defineValue should throw if
        // name|plugin/classification are omitted (and also signature in the case of arity > 0 functions).
        var addThrowsIfNoneTest = function(dataType, desc, argToOmit, args) {
          it('Throws for ' + desc + ' when ' + argToOmit + ' omitted', function() {
            var callArgsData = makeDefineArguments(dataType, args);
            var argOmitIndex = callArgsData.argMap[argToOmit];
            var callArgs = callArgsData.argsArray;
            callArgs = callArgs.slice(0, argOmitIndex)
                                .concat(callArgs.slice(argOmitIndex + 1));

            var fn = function() {
              defineValue.apply(null, callArgs);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var addThrowsIfNoneTests = function() {
          iterateOverEachValid(addThrowsIfNoneTest, {ignoreText: true});
        };


        // The value being defined must be the last argument.
        var addThrowsIfDefinedValueNotLastTest = function(dataType, desc, argToSwap, args) {
          var callArgsData = makeDefineArguments(dataType, args);
          it('Throws for ' + desc + ' when value not last (value swapped with ' + argToSwap + ')', function() {
            var callArgs = callArgsData.argsArray;

            var temp = callArgs[callArgsData.argMap[argToSwap]];
            callArgs[callArgsData.argMap[argToSwap]] = callArgs[callArgs.length - 1];
            callArgs[callArgs.length - 1] = temp;

            var fn = function() {
              defineValue.apply(null, callArgs);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var addThrowsIfDefinedValueNotLastTests = function() {
          iterateOverEachValid(addThrowsIfDefinedValueNotLastTest, {ignoreData: true, ignoreDegenerate: true});
        };


        // defineValue takes zero or more strings followed by a function or object. There should be no other
        // JS types in the argument list.
        var addThrowsIfInvalidValAmongstValidTest = function(val, valDesc) {
          return function(dataType, desc, argToInsertAfter, args) {
            var testDesc = argToInsertAfter + ' (value of type: ' + valDesc + ')';
            it('Throws for ' + desc + ' when invalid value appears after ' + testDesc, function() {
              var callArgsData = makeDefineArguments(dataType, args);
              var argIndex = callArgsData.argMap[argToInsertAfter];
              var callArgs = callArgsData.argsArray;
              callArgs = callArgs.slice(0, argIndex + 1).concat([val]).concat(callArgs.slice(argIndex + 1));

              var fn = function() {
                defineValue.apply(null, callArgs);
              };

              expect(fn).to.throw(TypeError);
            });
          };
        };


        var badValues = [
          {name: 'number', value: 1},
          {name: 'boolean', value: true},
          {name: 'array', value: [1, 2]},
          {name: 'undefined', value: undefined},
          {name: 'null', value: null}
        ];


        var addThrowsIfInvalidAmongstValidTests = function() {
          badValues.forEach(function(bad) {
            iterateOverEachValid(addThrowsIfInvalidValAmongstValidTest(bad.value, bad.name));
          });
        };


        // defineValue can only define functions and objects.
        var addThrowsIfValueInvalidTest = function(val, valDesc) {
          return function(dataType, desc, argToReplace, args) {
            // I should really add a different iterator to avoid all this redundant work
            if (argToReplace !== 'data')
              return;

            it('Throws for ' + desc + ' when value is ' + valDesc, function() {
              var callArgsData = makeDefineArguments(dataType, args, {customType: val});

              var fn = function() {
                defineValue.apply(null, callArgsData.argsArray);
              };

              expect(fn).to.throw(TypeError);
            });
          };
        };


        var addThrowsIfValueInvalidTests = function() {
          badValues.forEach(function(bad) {
            iterateOverEachValid(addThrowsIfValueInvalidTest(bad.value, bad.name));
          });
        };


        // For the "special" lines (i.e. name, plugin, signature, classification), capitalisation is irrelevant.
        var addIgnoresCapitalisationTest = function(dataType, desc, argToCapitalise, args) {
          it('Ignores for ' + desc + ' when ' + argToCapitalise + ' capitalised', function() {
            var callArgsData = makeDefineArguments(dataType, args);
            var argIndex = callArgsData.argMap[argToCapitalise];
            var callArgs = callArgsData.argsArray;

            var arg = callArgs[argIndex];
            var colon = callArgs[argIndex].indexOf(':');
            if (colon === -1)
              throw new TypeError('Test error: colon not found for ' + argToCapitalise + ' in ' + arg);

            callArgs[argIndex] = arg.substring(0, colon).toUpperCase() + arg.substring(colon);

            var fn = function() {
              defineValue.apply(null, callArgs);
            };

            expect(fn).to.not.throw(TypeError);
          });
        };


        var addIgnoresCapitalisationTests = function() {
          iterateOverEachValid(addIgnoresCapitalisationTest, {ignoreText: true, ignoreData: true});
        };


        // "plugin" and "classification" lines should be mutually exclusive.
        var addThrowsWithBothTests = function() {
          definableTypes.forEach(function(dataType) {
            var calls = getNonDegenerateCallsFor(dataType).filter(function(call) {
              return call.indexOf('plugin') !== -1 || call.indexOf('classification') !== -1;
            });

            calls.forEach(function(args) {
              var desc = getDescForCall(dataType, args);

              it('Throws for ' + desc + ' when both plugin and classification provided', function() {
                var callArgsData = makeDefineArguments(dataType, args);
                var argToAdd = args.indexOf('plugin') === -1 ? 'plugin' : 'classification';

                var callArgs = callArgsData.argsArray;
                var val = callArgs[callArgs.length - 1];
                callArgs[callArgs.length - 1] = argToAdd + ': bar';
                callArgs.push(val);

                var fn = function() {
                  defineValue.apply(null, callArgs);
                };

                expect(fn).to.throw(TypeError);
              });
            });
          });
        };


        // Functions of arity zero do not require a "signature" line.
        var addSignatureOptionalForArityZeroTests = function(dataType, desc, args) {
          var calls = getNonDegenerateCallsFor('function');

          calls.forEach(function(args) {
            var newArgs = args.filter(function(arg) {
              return arg !== 'signature';
            });

            var desc = getDescForCall('function', newArgs);

            it('Does not throw for ' + desc + ' when arity zero and no signature', function() {
              var callArgsData = makeDefineArguments('function', newArgs, {arity: 0});

              var callArgs = callArgsData.argsArray;

              var fn = function() {
                defineValue.apply(null, callArgs);
              };

              expect(fn).to.not.throw(TypeError);
            });
          });
        };


        var singleTests = [{name: 'function', val: function(x) {}},
                           {name: 'object', val: {}}];


        // You do not need to supply any strings.
        var addCalledOnlyWithValueTests = function() {
          singleTests.forEach(function(t) {
            it('Doesn\'t throw when called only with ' + t.name, function() {
              var fn = function() {
                defineValue(t.val);
              };

              expect(fn).to.not.throw(TypeError);
            });
          });
        };


        // The value being defined should be returned.
        var addReturnsValueTests = function() {
          singleTests.forEach(function(t) {
            it('Returns value when called with ' + t.name, function() {
              expect(defineValue(t.val)).to.not.equal(t.value);
            });
          });
        };


        addThrowsIfMoreThanOneTests();
        addThrowsIfNoneTests();
        addThrowsIfDefinedValueNotLastTests();
        addThrowsIfInvalidAmongstValidTests();
        addThrowsIfValueInvalidTests();
        addIgnoresCapitalisationTests();
        addThrowsWithBothTests();
        addSignatureOptionalForArityZeroTests();
        addCalledOnlyWithValueTests();
        addReturnsValueTests();


        it('Throws when called with no arguments', function() {
          var fn = function() {
            defineValue();
          };

          expect(fn).to.throw(TypeError);
        });
      });


      describe('help', function() {
        var defineValue = utils.defineValue;
        var help = utils.help;
        var resetHelpCache = utils.resetHelpCache;


        beforeEach(function() {
          resetHelpCache();
        });


        // Replace the output mechanism with the given writer, and return a function that can restore the world
        // to the way we found it.
        var monkeyPatchOutput = function(writerFn) {
          var shellPrint = null;
          var consoleLog = null;

          // If node's stdout is available, use that
          if (print !== undefined) {
            shellPrint = print;
            global.print = writerFn;
          } else {
            consoleLog = console.log;
            console.log = writerFn;
          }

          // Return a function that allows the caller to restore the environment
          return function() {
            if (print !== undefined) {
              global.print = shellPrint;
            } else {
              console.log = consoleLog;
            }
          };
        };


        // Create a writer that we can monkey-patch in place of the environment's console.log
        // which records all output.
        //
        // Output will be logged in an array called 'text' attached to the returned function.
        //
        // The boolean 'called', similarly attached notes whether this function was ever called.
        var makeWriter = function() {
          var writer = function() {
            writer.called = true;
            [].forEach.call(arguments, function(val) {
              writer.text.push(val);
            });
          };
          writer.called = false;
          writer.text = [];

          return writer;
        };


        var addUseBestTest = function(dataType) {
          it('Uses best available output method for this environment (' + dataType + ')', function() {
            var writer = makeWriter();

            // Define a function with help text
            var ourText = ['ELEPHANT'];
            var args = makeDefineArguments(dataType, ['name', 'classification', 'text', 'data'],
                                            {arity: 0, customText: ourText}).argsArray;
            var f = defineValue.apply(null, args);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);

            // Restore things so mocha can write out as normal
            stateRestorer();

            // Now we want called to be true, but we also want to confirm it was our text that was printed
            expect(writer.called).to.be.true;
            expect(writer.text.indexOf(ourText[0])).to.not.equal(-1);
          });
        };


        // Something meaningful should be printed if there is no help for the given value.
        var addPrintsWhenNotFoundTest = function(dataType) {
          it('Prints something when function not found', function() {
            var writer = makeWriter();

            // Define a value that is not registered with help
            var data = dataType === 'function' ? function() {} : {};
            var restorer = monkeyPatchOutput(writer);
            help(data);

            // Restore things so mocha can write out as normal
            restorer();

            // Now we want called to be true, but we also want to confirm it was our text
            expect(writer.called).to.be.true;
            expect(writer.text.length).to.be.greaterThan(0);
          });
        };


        // Differently defined values should return different help.
        var addPrintsDifferentForDifferent = function(dataType) {
          ['function', 'object'].forEach(function(dt2) {
            it('Prints different help for different values (' + dataType + ', ' + dt2 + ')', function() {
              var v1Writer = makeWriter();
              var v2Writer = makeWriter();

              var args = ['name', 'classification', 'text', 'data'];
              var v1Text = ['This is the text for v1'];
              var v1Opts = {customText: v1Text};
              if (dataType === 'function')
                v1Opts.arity = 0;

              var v2Text = ['This, however, is the text for v2.', 'It should be different'];
              var v2Opts = {customText: v2Text};
              if (dt2 === 'function')
                v2Opts.arity = 0;

              var v1 = defineValue.apply(null, makeDefineArguments(dataType, args, v1Opts).argsArray);
              var v2 = defineValue.apply(null, makeDefineArguments(dt2, args, v2Opts).argsArray);

              var stateRestorer = monkeyPatchOutput(v1Writer);
              help(v1);
              stateRestorer();
              stateRestorer = monkeyPatchOutput(v2Writer);
              help(v2);
              stateRestorer();

              expect(v1Writer.text.length).to.be.greaterThan(0);
              expect(v2Writer.text.length).to.be.greaterThan(0);
              expect(v1Writer.text).to.not.deep.equal(v2Writer.text);
            });
          });
        };


        // The first line of output should contain the name of the value. There should then be exactly one trailing
        // empty line, regardless of the number of trailing empty strings in the defineValue call.
        var addEmptyTrailingSigTest = function(type, numTrailing) {
          it('Always one trailing line empty line after ' + type + ' signature (' + (numTrailing + 1) + ')', function() {
            var writer = makeWriter();

            var text = ['This is the text for f'];
            for (var i = 0; i < numTrailing; i++)
              text.unshift('');

            var opts = {customText: text};
            var args = type === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                             ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(type, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text[1]).to.equal('');
            expect(writer.text[2]).to.not.equal('');
          });
        };


        // Multiple empty strings in the defineValue call should be collapsed to a single trailing empty line in
        // the output.
        var addDuplicateEmptyStrippedTest = function(dataType) {
          it('Suppresses duplicate empty lines within text (' + dataType + ')', function() {
            var writer = makeWriter();

            var customText = ['', 'This is line 3.', '', '', 'This is line 5', '', '', 'This is line 7'];
            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                             ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text.length).to.equal(7);
          });
        };


        // The help text should be the correct text for the given value.
        var addTextCorrectTest = function(dataType, message, customText) {
          it('Text correct (' + dataType + ') ' + message, function() {
            var writer = makeWriter();

            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            var textCorrect = writer.text.every(function(t, i) {
              if (i === 0 || i === 1)
                return true; // skip signature and trailing line

              return t === customText[i - 2];
            });

            expect(textCorrect).to.be.true;
          });
        };


        // help should correctly handle newline characters in the help strings, and split lines accordingly.
        var addHandlesNewlineTest = function(dataType) {
          it('Handles newline characters in strings correctly (' + dataType + ')', function() {
            var writer = makeWriter();

            var customText = ['', 'Line 3.\nLine 4', '', 'Line 6\nLine  7'];
            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text.length).to.equal(7);
          });
        };


        // help should collapse multiple adjacent newline characters to one.
        var addHandlesDuplicateNewlineTest = function(dataType) {
          it('Suppresses duplicate newlines generated by newline character (' + dataType + ')', function() {
            var writer = makeWriter();

            var customText = ['', 'Line 3\n\n\nThis is line 5', '', 'Line 7\n\n\n\nLine 9'];
            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text.length).to.equal(9);
          });
        };


        // Helper function: special formatting characters should be removed in console output.
        var addFormattingTest = function(dataType, message, line2) {
          it('Removes special formatting for ' + message + ' in explanatory text (' + dataType + ')', function() {
            var writer = makeWriter();

            var customText = ['', line2];
            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text[2]).to.equal('This is line 2 with formatting');
          });
        };


        var addLinkFormattingTest = function(dataType) {
          addFormattingTest(dataType, 'links', 'This is line 2 with [[formatting]]');
        };


        var addInlineCodeTest = function(dataType) {
          addFormattingTest(dataType, 'inline code', 'This is line 2 with {{formatting}}');
        };


        var addItalicFormattingTest = function(dataType) {
          addFormattingTest(dataType, 'italics', 'This is line 2 with __formatting__');
        };


        var addStrongEmphasisTest = function(dataType) {
          addFormattingTest(dataType, 'strong emphasis', 'This is line 2 with **formatting**');
        };


        // After a '--' line, all strings are assumed to be a concluding code example. On the console, this marker should
        // be replaced by 'for example'.
        var addCodePrefixedWithForExampleTest = function(dataType) {
          it('Replaces code block marker with \'For example\' when logging to console (' + dataType + ')', function() {
            var writer = makeWriter();

            var customText = ['', '--', 'a=1;'];
            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text[2]).to.equal('For example:');
          });
        };


        // After a '--' line, all strings are assumed to be a concluding code example. On the console, these lines should
        // be indented.
        var addCodeBlockIndentedTest = function(dataType) {
          it('Indents text after code block marker (' + dataType + ')', function() {
            var writer = makeWriter();

            var customText = ['', '--', 'a=1;', 'b=2;', 'c=3;'];
            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            for (var i = 3; i < 6; i++)
              expect(writer.text[i].slice(0, 2)).to.equal('  ');
          });
        };


        // When indenting code examples, the relative indent of those strings should be maintained.
        var addMaintainsExistingIndentInCodeTest = function(dataType) {
          it('Maintains existing indents after code block marker (' + dataType + ')', function() {
            var writer = makeWriter();

            var indent1 = '      a = 1;';
            var indent2 = '    b = 2;';
            var opts = {customText: ['', '--', indent1, indent2]};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text[3]).to.equal(indent1);
            expect(writer.text[4]).to.equal(indent2);
          });
        };


        // Lines marked with an indent character should be indented.
        var addIndentFormattingAddedTest = function(dataType) {
          it('Indents lines starting with - (' + dataType + ')', function() {
            var writer = makeWriter();

            var customText = ['', '- this should be indented', 'your ad here', '- indent this too',
                              'no indentation'];
            var opts = {customText: customText};
            var args = dataType === 'function' ? ['name', 'signature', 'classification', 'text', 'data'] :
                                                 ['name', 'classification', 'text', 'data'];
            var f = defineValue.apply(null, makeDefineArguments(dataType, args, opts).argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            expect(writer.text[2].slice(0, 2)).to.equal('  ');
            expect(writer.text[4].slice(0, 2)).to.equal('  ');
            expect(writer.text[3].slice(0, 2)).to.not.equal('  ');
            expect(writer.text[5].slice(0, 2)).to.not.equal('  ');
          });
        };


        // XXX Tests for no plugin/classification in output?
        // XXX Although we might actually want plugin!
        ['function', 'object'].forEach(function(dataType) {
          addUseBestTest(dataType);
          addPrintsWhenNotFoundTest(dataType);
          addPrintsDifferentForDifferent(dataType);
          addDuplicateEmptyStrippedTest(dataType);
          addHandlesNewlineTest(dataType);
          addHandlesDuplicateNewlineTest(dataType);
          addLinkFormattingTest(dataType);
          addInlineCodeTest(dataType);
          addItalicFormattingTest(dataType);
          addStrongEmphasisTest(dataType);
          addCodeBlockIndentedTest(dataType);
          addCodePrefixedWithForExampleTest(dataType);
          addMaintainsExistingIndentInCodeTest(dataType);
          addIndentFormattingAddedTest(dataType);

          var normalTextTests = [['Line 1'], ['Line 1', '', 'Line 2', '', 'Line 3']];
          for (var i = 0; i < 3; i++)
            addEmptyTrailingSigTest(dataType, i);
          normalTextTests.forEach(function(text, i) {
            addTextCorrectTest(dataType, i + 1, text);
          });
        });


        // If the value is a function, the first line of output should be the name and signature.
        var addPrintsNameSigTest = function(message, name, arity, sig) {
          it('First line of function output contains name and signature' + message, function() {
            var writer = makeWriter();

            var args = ['name', 'signature', 'classification', 'text', 'data'];
            var customText = ['', 'This is the text for the function'];
            var defineArgs = makeDefineArguments('function', args, {arity: arity, customName: name,
                                                                    customSignature: sig, customText: customText});
            var f = defineValue.apply(null, defineArgs.argsArray);

            var stateRestorer = monkeyPatchOutput(writer);
            help(f);
            stateRestorer();

            var firstText = writer.text[0];
            expect(firstText).to.equal(name + '(' + sig + ')');
          });
        };


        addPrintsNameSigTest('(1)', 'funky', 2, 'a: number, b: array');
        addPrintsNameSigTest('(2)', 'fizzBuzz', 1, 'a: object');


        // If the value is a function, the first line of output should be the name.
        it('First line of object output contains name', function() {
          var writer = makeWriter();

          var args = ['name', 'classification', 'text', 'data'];
          var customText = ['', 'This is the text for the object'];
          var defineArgs = makeDefineArguments('object', args, {customName: 'myObject', customText: customText});
          var o = defineValue.apply(null, defineArgs.argsArray);

          var stateRestorer = monkeyPatchOutput(writer);
          help(o);
          stateRestorer();

          var firstText = writer.text[0];
          expect(firstText).to.equal('myObject');
        });


        // The function signature should be output correctly for arity 0 functions where no explicit signature was
        // passed to defineValue.
        it('Signature correct for arity 0 function (1)', function() {
          var writer = makeWriter();

          var args = ['name', 'classification', 'text', 'data'];
          var opts = {arity: 0, customName: 'noSignature'};
          var f = defineValue.apply(null, makeDefineArguments('function', args, opts).argsArray);

          var stateRestorer = monkeyPatchOutput(writer);
          help(f);
          stateRestorer();

          var firstText = writer.text[0];
          expect(firstText).to.equal('noSignature()');
        });


        // The function signature should be output correctly for arity 0 functions when an explicit signature was
        // passed to defineValue.
        it('Signature correct for arity 0 function (2)', function() {
          var writer = makeWriter();

          var args = ['name', 'classification', 'signature', 'text', 'data'];
          var opts = {arity: 0, customName: 'explicitSignature'};
          var f = defineValue.apply(null, makeDefineArguments('function', args, opts).argsArray);

          var stateRestorer = monkeyPatchOutput(writer);
          help(f);
          stateRestorer();

          var firstText = writer.text[0];
          expect(firstText).to.equal('explicitSignature()');
        });


        // Links may appear in the signature. The formatting characters should be stripped for console output.
        it('Function signature stripped of formatting characters', function() {
          var writer = makeWriter();

          var text = ['', 'This is the text for f'];
          var signature = 'a: [[Pair]]';
          var opts = {arity: 1, customSignature: signature, customText: text};
          var args = ['name', 'classification', 'signature', 'text', 'data'];
          var f = defineValue.apply(null, makeDefineArguments('function', args, opts).argsArray);

          var stateRestorer = monkeyPatchOutput(writer);
          help(f);
          stateRestorer();

          var firstText = writer.text[0];
          expect(firstText).to.equal('foo(a: Pair)');
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
  }();
})();
