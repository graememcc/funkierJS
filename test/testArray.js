(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var array = require('../array');

    var base = require('../base');
    var getRealArity = base.getRealArity;
    var isArray = base.isArray;
    var alwaysTrue = base.constant(true);
    var alwaysFalse = base.constant(false);

    var pair = require('../pair');
    var Pair = pair.Pair;
    var isPair = pair.isPair;
    var fst = pair.fst;
    var snd = pair.snd;

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var makeArrayLike = testUtils.makeArrayLike;


    var expectedObjects = [];
    var expectedFunctions = ['length', 'getIndex', 'head', 'last', 'replicate', 'map', 'each', 'filter',
                             'foldl', 'foldl1', 'foldr', 'foldr1', 'every', 'some', 'maximum', 'minimum',
                             'sum', 'product', 'element', 'elementWith', 'range', 'rangeStep', 'take',
                             'drop', 'init', 'tail', 'inits', 'tails', 'copy', 'slice', 'takeWhile',
                             'dropWhile', 'prepend', 'append', 'concat', 'isEmpty', 'intersperse',
                             'reverse', 'find', 'findFrom', 'findWith', 'findFromWith', 'occurrences',
                             'occurrencesWith', 'zip', 'zipWith', 'nub', 'uniq', 'nubWith', 'uniqWith',
                             'sort', 'sortWith', 'unzip', 'insert', 'remove', 'replace', 'removeOne',
                             'removeOneWith', 'removeAll', 'removeAllWith', 'replaceOne', 'replaceOneWith',
                             'replaceAll', 'replaceAllWith', 'join', 'flatten', 'flattenMap'];

    describeModule('array', array, expectedObjects, expectedFunctions);


    // Many of the predicate functions on strings are tested with the following predicate
    var isDigit = function(x) {return x >= '0' && x <= '9';};
    // and likewise the array tests regularly use this test
    var fooIs42 = function(x) {return x.foo === 42;};


    // Many functions split string arguments in order to run a test using every
    var splitIfNecessary = function(val) {
      if (typeof(val) === 'string')
        val = val.split('');

      // Turn arraylikes into real arrays
      if (!isArray(val))
        return [].slice.call(val);

      return val;
    };


    // Various test generation functions need a clean copy of their test data, to ensure there
    // is no interdependence between individual tests
    var sliceIfNecessary = function(originalData) {
      if (typeof(originalData) === 'string')
        return originalData;

      return originalData.slice();
    };


    // Several functions need to check "equality" where one value is an array and the other an arraylike
    var valuesEqual = function(source, copy) {
      var sameLength = source.length === copy.length;

      source = splitIfNecessary(source);
      var sameValues = source.every(function(val, i) {
        return copy[i] === val;
      });

      return sameLength && sameValues;
    };


    // Several functions need to auto-generate tests for the empty values. Let's not replicate that logic
    // all over the place
    var addEmptyTests = function(testAdder) {
      testAdder('empty array', []);
      testAdder('empty arraylike', makeArrayLike());
      testAdder('empty string', '');
    };


    // Several functions should throw on empty arrays/strings
    var addThrowsOnEmptyTests = function(fnUnderTest, args) {
      var addOne = function(message, data) {
        it('Throws for empty ' + message, function() {
          var fn = function() {
            fnUnderTest.apply(null, args.concat([data]));
          };

          expect(fn).to.throw(TypeError);
        });
      };


      addOne('arrays', []);
      addOne('arraylikes', makeArrayLike());
      addOne('strings', '');
    };


    // Several functions should return a value of the same length
    var addSameLengthTest = function(fnUnderTest, message, otherArgs, originalData, modifier) {
      modifier = modifier || 0;

      it('Result has same length for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var length = fnUnderTest.apply(null, otherArgs.concat([data])).length;

        expect(length).to.equal(data.length + modifier);
      });
    };


    // Several functions expect the first argument to be a function that should be always be called with a
    // specific number of arguments
    var addFuncCalledWithSpecificArityTests = function(fnUnderTest, requiredArgs, argsBetween, arrayOnly) {
      // None of the functions in array need more than 2 arguments: throw at test generation stage if I get
      // this wrong
      if (requiredArgs > 2)
        throw new Error('Incorrect test: addFuncCalledWithSpecificArityTests called with ' + requiredArgs);

      argsBetween = argsBetween || [];
      arrayOnly = arrayOnly || false;

      var addTestsForType = function(type, originalData) {
        it('Function called with correct number of arguments when called with ' + type, function() {
          var allArgs = [];
          var f;

          if (requiredArgs === 1) {
            f = function(x) {
              var args = [].slice.call(arguments);
              allArgs.push(args);
            };
          } else {
            f = function(x, y) {
              var args = [].slice.call(arguments);
              allArgs.push(args);
            };
          }

          fnUnderTest.apply(null, [f].concat(argsBetween).concat([originalData]));
          var result = allArgs.every(function(arr) {
            return arr.length === requiredArgs;
          });

          expect(result).to.be.true;
        });
      };


      addTestsForType('array', [1, 2, 3]);
      addTestsForType('arraylike', makeArrayLike(2, 3, 4, 5));
      if (!arrayOnly)
        addTestsForType('string', 'abc');
    };


    // Several functions expect that the function being tested should be called with each element
    // of the given object, in order.
    var addCalledWithEveryMemberTests = function(fnUnderTest, argsBetween, isArity2, isRTL, skipsFirst) {
      argsBetween = argsBetween || [];

      // only the fold* functions have arity 2
      isArity2 = isArity2 || false;
      // only the foldr* functions operate RTL
      isRTL = isRTL || false;
      // only the fold*1 functions skip the first element
      skipsFirst = skipsFirst || false;

      var addTestsForType = function(type, originalData) {
        it('Called the correct number of times for ' + type, function() {
          var data = sliceIfNecessary(originalData);

          var allArgs = [];
          var f = function(x) {
            allArgs.push(x);
          };

          if (isArity2) {
            f = function(x, y) {
              // In the fold* functions, the current element is the second parameter
              allArgs.push(y);
            };
          }

          fnUnderTest.apply(null, [f].concat(argsBetween).concat([data]));

          // allArgs now contains each element that our function was called with
          expect(allArgs.length).to.equal(skipsFirst ? originalData.length - 1 : originalData.length);
        });


        it('Called with every element of ' + type, function() {
          var data = sliceIfNecessary(originalData);

          var allArgs = [];
          var f = function(x) {
            allArgs.push(x);
          };

          if (isArity2) {
            f = function(x, y) {
              // In the fold* functions, the current element is the second parameter
              allArgs.push(y);
            };
          }

          fnUnderTest.apply(null, [f].concat(argsBetween).concat([data]));

          // allArgs now contains each element that our function was called with
          originalData = splitIfNecessary(originalData);
          var numElems = originalData.length - 1;

          var result = originalData.every(function(elem, i) {
            // The fold*1 functions should have 1 call fewer
            if (skipsFirst) {
              if ((isRTL && i === numElems) || (!isRTL && i === 0))
                return true;
            }

            // Where should this element be in allArgs?
            var index = i;
            if (skipsFirst) {
              if (isRTL)
                index += 1;
              else
                index -= 1;
            }

            return allArgs[isRTL ? numElems - index : index] === elem;
          });

          expect(result).to.be.true;
        });
      };


      addTestsForType('array', [1, 2, 3]);
      addTestsForType('arraylike', makeArrayLike(2, 3, 4, 5));
      addTestsForType('string', 'abc');
    };


    // Several functions expect that the result should be distinct from the original
    // value, not harming the original value in any way
    var addNoModificationOfOriginalTests = function(fnUnderTest, argsBefore) {
      var addOne = function(type, data) {
        it('Doesn\'t modify original ' + type + ' value', function() {
          var copy = sliceIfNecessary(data);
          var fnResult = fnUnderTest.apply(null, argsBefore.concat([data]));

          var different = fnResult !== data;
          var sameLength = data.length === copy.length;

          data = splitIfNecessary(data);
          var sameEntries = data.every(function(v, i) {
            return copy[i] === v;
          });

          expect(sameLength && sameEntries && different).to.be.true;
        });
      };


      addOne('array', [{foo: 1}, {foo: 2}, {bar: 3}]);
      addOne('arraylike', makeArrayLike({foo: 1}, {foo: 2}, {bar: 3}));
    };


    // Several functions expect the return type to be the same as the final argument
    var addReturnsSameTypeTests = function(fnUnderTest, argsBefore, arrayOnly) {
      arrayOnly = arrayOnly || false;

      var addOne = function(type, data) {
        it('Returns ' + (type === 'arraylike' ? 'array' : type) + ' when called with ' + type, function() {
          var result = fnUnderTest.apply(null, argsBefore.concat([data]));

          if (type !== 'string')
            expect(isArray(result)).to.be.true;
          else
            expect(typeof(result)).to.equal('string');
        });
      };

      addOne('array', [{foo: 1}]);
      addOne('arraylike', makeArrayLike(1, 2));
      if (!arrayOnly)
        addOne('string', 'abc');
    };


    // Several functions should yield the empty array/string when called with an empty
    // array/string
    var addReturnsEmptyOnEmptyTests = function(fnUnderTest, argsBefore, alwaysArray) {
      alwaysArray = alwaysArray || false;


      it('Returns empty array when called with empty array', function() {
        var original = [];
        var result = fnUnderTest.apply(null, argsBefore.concat([original]));

        expect(result).to.not.equal(original);
        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when called with empty arraylike', function() {
        var original = makeArrayLike();
        var result = fnUnderTest.apply(null, argsBefore.concat([original]));

        expect(result).to.not.equal(original);
        expect(result).to.deep.equal([]);
      });


      it('Returns empty ' + (alwaysArray ? 'array' : 'string') + ' when called with empty string', function() {
        var original = '';
        var result = fnUnderTest.apply(null, argsBefore.concat([original]));

        expect(result).to.deep.equal(alwaysArray ? [] : '');
      });
    };


    var lengthSpec = {
      name: 'length',
      arity: 1,
      restrictions: [['arraylike']],
      validArguments: [[[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(lengthSpec, array.length, function(length) {
      var addOne = function(message, data) {
        it('Works ' + message, function() {
          expect(length(data)).to.equal(data.length);
        });
      };


      addEmptyTests(addOne);
      addOne('arrays (1)', [1]);
      addOne('arrays (2)', [2, 3]);
      addOne('arraylikes (1)', makeArrayLike(1));
      addOne('arraylikes (2)', makeArrayLike(2, 3));
      addOne('strings (1)', 'a');
      addOne('strings (2)', 'bcd');
    });


    var getIndexSpec = {
      name: 'getIndex',
      arity: 2,
      restrictions: [['positive'], ['arraylike']],
      validArguments: [[1], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(getIndexSpec, array.getIndex, function(getIndex) {
      addThrowsOnEmptyTests(getIndex, [0]);


      var addTests = function(originalData) {
        // The generated tests assume a length of 3. Sanity-check my data.
        if (originalData.length < 3)
          throw new Error('Test generation for getIndex requires test data of length ' + originalData.length);

        var typeString = typeof(originalData) === 'string' ? 'string' : isArray(originalData) ? 'array' : 'arraylike';


        it('Works for ' + typeString + ' (1)', function() {
          var data = sliceIfNecessary(originalData);
          var result = getIndex(0, data);

          expect(result).to.equal(data[0]);
        });


        it('Works for ' + typeString + ' (2)', function() {
          var data = sliceIfNecessary(originalData);
          var result = getIndex(2, data);

          expect(result).to.equal(data[2]);
        });


        it('Throws when ' + typeString + ' indices outside range', function() {
          var data = sliceIfNecessary(originalData);
          var fn = function() {
            getIndex(data.length, data);
          };

          expect(fn).to.throw(TypeError);
        });
      };


      addTests([1, 7, 0, 42]);
      addTests(makeArrayLike(4, 3, 2, 1));
      addTests('funkier');


      testCurriedFunction('getIndex', getIndex, [1, ['a', 'b']]);
    });


    // The tests for head and tail are very similar, and can be generated
    var makeElementSelectorTest = function(desc, fnUnderTest, isFirst) {
      var spec = {
        name: desc,
        arity: 1
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addThrowsOnEmptyTests(fnUnderTest, []);

        var addOne = function(message, data) {
          it('Works for ' + message, function() {
            var result = fnUnderTest(data);

            expect(result).to.equal(data[isFirst ? 0 : data.length - 1]);
          });
        };


        addOne('arrays (1)', [1]);
        addOne('arrays (2)', [2, 3]);
        addOne('arraylikes (1)', makeArrayLike(4));
        addOne('arraylikes (2)', makeArrayLike(5, 6));
        addOne('strings (1)', 'a');
        addOne('strings (2)', 'funkier');
      });
    };


    makeElementSelectorTest('head', array.head, true);
    makeElementSelectorTest('last', array.last, false);


    var replicateSpec = {
      name: 'replicate',
      arity: 2,
      restrictions: [['positive'], []],
      validArguments: [[1], ['a']]
    };


    describeFunction(replicateSpec, array.replicate, function(replicate) {
      var addTests = function(message, count, data) {
        it('Returns array ' + message, function() {
          var replicated = replicate(count, data);

          expect(isArray(replicated)).to.be.true;
        });


        it('Returned array has correct length ' + message, function() {
          var result = replicate(count, data);

          expect(result.length).to.equal(count);
        });


        it('Returned array\'s elements strictly equal given value ' + message, function() {
          var result = replicate(count, data).every(function(e) {
            return e === data;
          });

          expect(result).to.be.true;
        });
      };


      addTests('(1)', 1, 'a');
      addTests('(2)', 10, {});
      addTests('when count is zero', 0, 2);


      testCurriedFunction('replicate', replicate, [1, 1]);
    });


    var mapSpec = {
      name: 'map',
      arity: 2,
      restrictions: [['function: minarity 1'], ['arraylike']],
      validArguments: [[function() {}], [['a'], 'a', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(mapSpec, array.map, function(map) {
      addFuncCalledWithSpecificArityTests(map, 1);
      addCalledWithEveryMemberTests(map);
      addReturnsEmptyOnEmptyTests(map, [function(x) {return 42;}], true);


      var addTests = function(message, f, originalData) {
        addSameLengthTest(map, message, [f], originalData);


        it('Returns an array for ', function() {
          var data = sliceIfNecessary(originalData);
          var mapped = map(f, data);

          expect(isArray(mapped)).to.be.true;
        });


        it('Returned array correct for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = map(f, data).every(function(val, i) {
            return val === f(data[i]);
          });

          expect(result).to.be.true;
        });
      };


      addTests('array (1)', base.id, [1, true, null, undefined]);
      addTests('array (2)', function(x) {return x + 1;}, [2, 3, 4]);
      addTests('arraylike (1)', base.id, makeArrayLike({}, {}));
      addTests('arraylike (2)', function(x) {return x - 1;}, makeArrayLike(5, 6, 7));
      addTests('strings (1)', function(x) {return x.toUpperCase();}, 'funkier');
      addTests('strings (2)', function(x) {return x.charCodeAt(0);}, 'abc');


      it('Array contains partially applied functions if supplied function arity > 1', function() {
        var uncurried = function(x, y) {return x + y;};
        var mapped = map(uncurried, [1, 2]);
        var allPartiallyApplied = mapped.every(function(f) {
          return typeof(f) === 'function' && getRealArity(f) === 1;
        });

        expect(allPartiallyApplied).to.be.true;
      });


      testCurriedFunction('map', map, [base.id, [1, 2]]);
    });


    var eachSpec = {
      name: 'each',
      arity: 2,
      restrictions: [['function'], ['arraylike']],
      validArguments: [[function() {}], [['a'], 'a', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(eachSpec, array.each, function(each) {
      addFuncCalledWithSpecificArityTests(each, 1);
      addCalledWithEveryMemberTests(each);


      var addOne = function(message, data) {
        it('Returns undefined when called with ' + data, function() {
          var result = each(base.id, data);

          expect(result).to.equal(undefined);
        });
      };


      addOne('array', [1, true, null]);
      addOne('arraylike', makeArrayLike(2, 3, 4));
      addOne('string', 'abc');


      testCurriedFunction('each', each, [base.id, [1, 2]]);
    });


    var filterSpec = {
      name: 'filter',
      arity: 2,
      restrictions: [['function: arity 1'], ['arraylike']],
      validArguments: [[function(x) {}], [['a'], 'a', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(filterSpec, array.filter, function(filter) {
      addReturnsSameTypeTests(filter, [alwaysTrue]);
      addFuncCalledWithSpecificArityTests(filter, 1);
      addCalledWithEveryMemberTests(filter);
      addNoModificationOfOriginalTests(filter, [alwaysTrue]);
      addReturnsEmptyOnEmptyTests(filter, [alwaysTrue]);


      var addTests = function(message, f, originalData, expectedResult, isArrayLike) {
        isArrayLike = isArrayLike || false;


        var addLengthAndValuesTests = function(countMessage, fn, expected) {
          it('Returned value correct for ' + message + ' ' + countMessage, function() {
            var data = sliceIfNecessary(originalData);
            var filtered = filter(fn, data);

            expect(filtered).to.deep.equal(expected);
          });
        };


        // We test filter returns correct arrays for 3 different functions:
        //  - alwaysTrue: this should result in a copy of the original value
        //  - alwaysFalse: this should result in an empty value
        //  - the custom function passed in to this test generator
        addLengthAndValuesTests('(1)', alwaysTrue, isArrayLike ? [].slice.call(originalData) : originalData);
        addLengthAndValuesTests('(2)', alwaysFalse, typeof(originalData) === 'string' ? '' : []);
        addLengthAndValuesTests('(3)', f, expectedResult);
      };


      addTests('for an array', function(x) {return x % 2 === 0;}, [1, 2, 3, 4], [2, 4]);
      addTests('for an arraylike', function(x) {return x > 10;}, makeArrayLike(11, 3, 2, 20, 42, 1), [11, 20, 42], true);
      addTests('for a string', function(c) {return c !== 'a';}, 'banana', 'bnn');


      it('Elements of returned values strictly equal those from the original value', function() {
        var a = [{}, {}, {}, {}];
        var f = alwaysTrue;
        var allStrictEqual = filter(f, a).every(function(e, i) {
          return e === a[i];
        });

        expect(allStrictEqual).to.be.true;
      });


      testCurriedFunction('filter', filter, [alwaysTrue, [1, 2]]);
    });


    var addFoldTests = function(spec, fnUnderTest, specificTests, is1Func, isRTL) {
      var betweenArgs = is1Func ? [] : [0];


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addFuncCalledWithSpecificArityTests(fnUnderTest, 2);
        addCalledWithEveryMemberTests(fnUnderTest, betweenArgs, true, isRTL, is1Func);


        var addCalledWithAccumulatorTest = function(type, originalData) {
          it('Function called with correct accumulator for ' + type, function() {
            // We save each accumulator our fold function is called with
            var data = sliceIfNecessary(originalData);
            var accumulators = [];

            var count = 1;
            var f = function(acc, current) {
              accumulators.push(acc);
              return count++;
            };

            var fnArgs = is1Func ? [f, data] : [f, 0, data];
            fnUnderTest.apply(null, fnArgs);

            // Calculate the first element of the array/string for fold*1 tests
            var first = data[isRTL ? data.length - 1 : 0];

            var accumulatorsCorrect = accumulators.every(function(acc, i) {
              if (is1Func && i === 0)
                return acc === first;

              return acc === i;
            });

            expect(accumulatorsCorrect).to.be.true;
          });
        };


        var addInitialOnEmptyTests = function(message, originalData) {
          // fold(l|r) should return the 'initial' parameter if the value to be folded is empty
          // We test with two different values to confirm the return value is not fixed 

          var addOneInitialTest = function(count, initValue) {
            it('Returns initial value when called with empty ' + message + ' ' + count, function() {
              var data = sliceIfNecessary(originalData);
              var result = fnUnderTest(function(x, y) {return 3;}, initValue, data);

              expect(result).to.deep.equal(initValue);
            });
          };


          addOneInitialTest('(1)', {});
          addOneInitialTest('(2)', 'z');
        };


        addCalledWithAccumulatorTest([1, 2, 3], 'array');
        addCalledWithAccumulatorTest(makeArrayLike(2, 3, 4), 'arraylike');
        addCalledWithAccumulatorTest('123', 'string');


        if (is1Func)
          addThrowsOnEmptyTests(fnUnderTest, function(x, y) {return 3;});
        else
          addEmptyTests(addInitialOnEmptyTests);


        specificTests.forEach(function(testData) {
          var message = testData.message;
          var args = testData.args;
          var expected = testData.expected;


          it('Works correctly for ' + message, function() {
            var result = fnUnderTest.apply(null, args);

            expect(result).to.equal(expected);
          });
        });


        var curriedArgs = is1Func ? [function(x, y) {return 42;}, [1, 2]] :
                                    [function(x, y) {return 42;}, 0, [1, 2]];

        testCurriedFunction(spec.name, fnUnderTest, curriedArgs);
      });
    };


    var foldlSpec = {
      name: 'foldl',
      arity: 3,
      restrictions: [['function: arity 2'], [], ['arraylike']],
      validArguments: [[function(x, y) {}], [0], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    var foldlTests = [
      {message: 'array (1)', args: [function(x, y) {return x + y;}, 4, [1, 2, 3]], expected: 4 + 1 + 2 + 3},
      {message: 'array (2)', args: [function(x, y) {return x - y;}, 0, [1, 2, 3]], expected: -1 - 2 - 3},
      {message: 'arraylike (1)', args: [function(x, y) {return x + y;}, 6, makeArrayLike(3, 4, 5)],
       expected: 6 + 3 + 4 + 5},
      {message: 'arraylike (2)', args: [function(x, y) {return x - y;}, 0, makeArrayLike(5, 6, 7)],
       expected: 0 - 5 - 6 - 7},
      {message: 'string (1)', args: [function(x, y) {return x + y;}, '', 'abc'], expected: '' + 'a' + 'b' + 'c'},
      {message: 'string (2)', args: [function(x, y) {return x + y;}, 'z', 'abc'], expected: 'z' + 'a' + 'b' + 'c'}
    ];


    addFoldTests(foldlSpec, array.foldl, foldlTests, false, false);


    var foldl1Spec = {
      name: 'foldl1',
      arity: 2,
      restrictions: [['function: arity 2'], ['arraylike']],
      validArguments: [[function(x, y) {}], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    var foldl1Tests = [
      {message: 'array (1)', args: [function(x, y) {return x + y;}, [1, 2, 3]], expected: 1 + 2 + 3},
      {message: 'array (2)', args: [function(x, y) {return x - y;}, [1, 2, 3]], expected: 1 - 2 - 3},
      {message: 'arraylike (1)', args: [function(x, y) {return x + y;}, makeArrayLike(3, 4, 5)], expected: 3 + 4 + 5},
      {message: 'arraylike (2)', args: [function(x, y) {return x - y;}, makeArrayLike(5, 6, 7)], expected: 5 - 6 - 7},
      {message: 'string (1)', args: [function(x, y) {return x + y;}, 'abc'], expected: 'a' + 'b' + 'c'},
      {message: 'string (2)', args: [function(x, y) {return y + x;}, 'abc'], expected: 'c' + 'b' + 'a'}
    ];


    addFoldTests(foldl1Spec, array.foldl1, foldl1Tests, true, false);


    var foldrSpec = {
      name: 'foldr',
      arity: 3,
      restrictions: [['function: arity 2'], [], ['arraylike']],
      validArguments: [[function(x, y) {}], [0], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    var foldrTests = [
      {message: 'array (1)', args: [function(x, y) {return x + y;}, 4, [1, 2, 3]], expected: 4 + 3 + 2 + 1},
      {message: 'array (2)', args: [function(x, y) {return x - y;}, 0, [1, 2, 3]], expected: -3 - 2 - 1},
      {message: 'arraylike (1)', args: [function(x, y) {return x + y;}, 6, makeArrayLike(3, 4, 5)],
       expected: 6 + 5 + 4 + 3},
      {message: 'arraylike (2)', args: [function(x, y) {return x - y;}, 0, makeArrayLike(5, 6, 7)],
       expected:  0 - 5 - 6 - 7},
      {message: 'string (1)', args: [function(x, y) {return x + y;}, '', 'abc'], expected: '' + 'c' + 'b' + 'a'},
      {message: 'string (2)', args: [function(x, y) {return y + x;}, 'z', 'abc'], expected: 'a' + 'b' + 'c' + 'z'}
    ];


    addFoldTests(foldrSpec, array.foldr, foldrTests, false, true);


    var foldr1Spec = {
      name: 'foldr1',
      arity: 2,
      restrictions: [['function: arity 2'], ['arraylike']],
      validArguments: [[function(x, y) {}], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    var foldr1Tests = [
      {message: 'array (1)', args: [function(x, y) {return x + y;}, [1, 2, 3]], expected: 3 + 2 + 1},
      {message: 'array (2)', args: [function(x, y) {return x - y;}, [1, 2, 3]], expected: 3 - 2 - 1},
      {message: 'arraylike (1)', args: [function(x, y) {return x + y;}, makeArrayLike(3, 4, 5)], expected: 5 + 4 + 3},
      {message: 'arraylike (2)', args: [function(x, y) {return x - y;}, makeArrayLike(5, 6, 7)], expected: 7 - 6 - 5},
      {message: 'string (1)', args: [function(x, y) {return x + y;}, 'abc'], expected: 'c' + 'b' + 'a'},
      {message: 'string (2)', args: [function(x, y) {return y + x;}, 'abc'], expected: 'a' + 'b' + 'c'}
    ];


    addFoldTests(foldr1Spec, array.foldr1, foldr1Tests, true, true);


    var makeArrayBooleanTest = function(desc, fnUnderTest, trigger) {
      var spec = {
        name: desc,
        arity: 2,
        restrictions: [['function: arity 1'], ['arraylike']],
        validArguments: [[function(x) {}], [[1, 2], 'ab', makeArrayLike(2, 3, 4)]]
      };


      describe(spec, fnUnderTest, function(fnUnderTest) {
        var okVal = !trigger;
        addFuncCalledWithSpecificArityTests(fnUnderTest, 1);


        var addTests = function(type, num, originalData) {
          it('Stops prematurely when called with ' + type + ' and ' + trigger + ' returned (' + num + ')', function() {
            var data = sliceIfNecessary(originalData);

            // We use a function that is expected to return the short-circuit trigger after length - 2 calls. If the
            // function under tests works correctly, this function should not be called again, and calls should still
            // equal data.length - 2

            var calls = 0;
            var f = function(x) {
              calls += 1;
              if (calls === data.length - 2)
                return trigger;
              return okVal;
            }

            fnUnderTest(f, data);

            expect(calls).to.equal(data.length - 2);
          });


          it('Called with correct values when called with ' + type + ' and ' + trigger + ' returned (' + num + ')', function() {
            var data = sliceIfNecessary(originalData);

            // This function ensures the function under test traverses the array in order, starting at element 0
            // equal data.length - 2
            var vals = [];
            var calls = 0;
            var f = function(x) {
              calls += 1;
              vals.push(x);
              if (calls === data.length - 1)
                return trigger;
              return okVal;
            }

            fnUnderTest(f, data);
            var result = vals.every(function(elem, i) {
              return data[i] === elem;
            });

            expect(result).to.be.true;
          });


          it('Returns correct value when called with ' + type + ' and ' + trigger + ' returned (' + num + ')', function() {
            var data = sliceIfNecessary(originalData);

            var calls = 0;
            var f = function(x) {
              calls += 1;
              if (calls === data.length - 1)
                return trigger;
              return okVal;
            }

            var result = fnUnderTest(f, data);

            expect(result).to.equal(trigger);
          });


          it('Called with all values when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var data = sliceIfNecessary(originalData);

            // If the trigger is not returned, the entire value should be iterated over
            var calls = 0;
            var f = function(x) {
              calls += 1;
              return okVal;
            }

            fnUnderTest(f, data);

            expect(calls).to.equal(data.length);
          });


          it('Called with correct values when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var data = sliceIfNecessary(originalData);

            var vals = [];
            var calls = 0;
            var f = function(x) {
              vals.push(x);
              calls += 1;
              return okVal;
            }

            fnUnderTest(f, data);

            var calledWithEvery = vals.every(function(elem, i) {
              return data[i] === elem;
            });

            expect(calledWithEvery).to.be.true;
          });


          it('Returns correctly when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var data = sliceIfNecessary(originalData);
            var calls = 0;
            var f = function(x) {
              calls += 1;
              return okVal;
            }
            var result = fnUnderTest(f, data);

            expect(result).to.equal(okVal);
          });
        };


        addTests('array', 1, [1, 2, 3]);
        addTests('array', 2, [{}, {}, {}, {}]);
        addTests('arraylike', 1, makeArrayLike(true, false, true));
        addTests('arraylike', 2, makeArrayLike(function() {}, function() {}, function() {}));
        addTests('string', 1, 'abc');
        addTests('string', 2, 'funkier');


        var checkEmpty = function(message, value) {
          it('Returns ' + okVal + ' for ' + message, function() {
            expect(fnUnderTest(function(x) {}, value)).to.equal(okVal);
          });
        };
        addEmptyTests(checkEmpty);


        testCurriedFunction(desc, fnUnderTest, [alwaysTrue, [1, 2, 3]]);
      });
    };


    makeArrayBooleanTest('every', array.every, false);
    makeArrayBooleanTest('some', array.some, true);


    // The "work correctly" tests for max/min/sum/product are the same shape
    var addSpecialFoldsTest = function(fnUnderTest, message, originalData, expected) {
      it('Works correctly for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var result = fnUnderTest(data);

        expect(result).to.equal(expected);
      });
    };


    var makeMinMaxTests = function(desc, fnUnderTest, isMax) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['arraylike']],
        validArguments: [[[1, 2], 'ab', makeArrayLike(2, 3, 4)]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addThrowsOnEmptyTests(fnUnderTest, []);


        addSpecialFoldsTest(fnUnderTest, 'for array (1)', [3, 1, 2, 42, 6], isMax ? 42 : 1);
        addSpecialFoldsTest(fnUnderTest, 'for array (2)', [2], 2);
        addSpecialFoldsTest(fnUnderTest, 'for arraylike (1)', makeArrayLike(4, 7, 13, 2, 8), isMax ? 13 : 2);
        addSpecialFoldsTest(fnUnderTest, 'for arraylike (2)', makeArrayLike(7), 7);
        addSpecialFoldsTest(fnUnderTest, 'for string (1)', 'bad0Z9w', isMax ? 'w' : '0');
        addSpecialFoldsTest(fnUnderTest, 'for string (2)', 'e', 'e');
      });
    };


    makeMinMaxTests('maximum', array.maximum, true);
    makeMinMaxTests('minimum', array.minimum, false);


    var makeSumProductTests = function(desc, fnUnderTest, isSum) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['strictarraylike']],
        validArguments: [[[1, 2], makeArrayLike(2, 3, 4)]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        it('Throws when called with a string', function() {
          var fn = function() {
            fnUnderTest('abc');
          };

          expect(fn).to.throw(TypeError);
        });


        addSpecialFoldsTest(fnUnderTest, 'for array (1)', [1, 2, 3, 4], isSum ? 10 : 24);
        addSpecialFoldsTest(fnUnderTest, 'for array (2)', [2], 2);
        addSpecialFoldsTest(fnUnderTest, 'for empty array', [], isSum ? 0 : 1);
        addSpecialFoldsTest(fnUnderTest, 'for arraylike (1)', makeArrayLike(1, 3, 5), isSum ? 9 : 15);
        addSpecialFoldsTest(fnUnderTest, 'for arraylike (2)', makeArrayLike(5), 5);
        addSpecialFoldsTest(fnUnderTest, 'for empty arraylike', makeArrayLike(), isSum ? 0 : 1);
      });
    };


    makeSumProductTests('sum', array.sum, true);
    makeSumProductTests('product', array.product, false);


    // element and elementWith share common behaviours. The next two functions are used
    // for generating these tests
    var addElementNotFoundTest = function(fnUnderTest, message, value, data) {
      it('Returns false when called with empty ' + message, function() {
        var found = fnUnderTest(value, data);

        expect(found).to.be.false;
      });
    };


    var addElementFoundTest = function(fnUnderTest, message, value, data) {
      it('Returns true when ' + message, function() {
        var found = fnUnderTest(value, data);

        expect(found).to.be.true;
      });
    };


    var elementSpec = {
      name: 'element',
      arity: 2,
      restrictions: [[], ['arraylike']],
      validArguments: [['a'], [['a', 'b', 'c'], 'abc', makeArrayLike('a', 'c', 'd')]]
    };


    describeFunction(elementSpec, array.element, function(element) {
      addElementNotFoundTest(element, 'array empty', 2, []);
      addElementNotFoundTest(element, 'arraylike empty', 7, makeArrayLike());
      addElementNotFoundTest(element, 'string empty', 'a', '');
      addElementNotFoundTest(element, 'element not present in array', 5, [1, 3, 4]);
      addElementNotFoundTest(element, 'element not present in arraylike', 6, makeArrayLike(1, 2, 3));
      addElementNotFoundTest(element, 'element not present in string', 'd', 'abc');
      addElementNotFoundTest(element, 'identical element not in array', {foo: 1},
                                      [{foo: 1}, {foo: 1}, {foo: 1}]);
      addElementNotFoundTest(element, 'identical element not in arraylike', {}, makeArrayLike({}, {}, {}));

      addElementFoundTest(element, 'element present in array', 6, [1, 6, 4]);
      addElementFoundTest(element, 'element present in arraylike', 8, makeArrayLike(1, 2, 8));
      addElementFoundTest(element, 'element present in string', 'b', 'abc');
      var obj = {foo: 1};
      addElementFoundTest(element, 'identical element in array', obj, [{foo: 1}, {foo: 1}, obj]);
      addElementFoundTest(element, 'identical element in arraylike', obj, makeArrayLike({foo: 1}, obj, {}));


      testCurriedFunction('element', element, [2, [1, 2, 3]]);
    });


    var elementWithSpec = {
      name: 'elementWith',
      arity: 2,
      restrictions: [['function: arity 1'], ['arraylike']],
      validArguments: [[function(x) {return true;}], [['a', 'b', 'c'], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(elementWithSpec, array.elementWith, function(elementWith) {
      addElementNotFoundTest(elementWith, 'array is empty', alwaysTrue, []);
      addElementNotFoundTest(elementWith, 'arraylike is empty', alwaysTrue, makeArrayLike());
      addElementNotFoundTest(elementWith, 'string is empty', alwaysTrue, '');
      addElementNotFoundTest(elementWith, 'array predicate returns false', function(x) {return x.foo === 5;},
                                          [{foo: 1}, {foo: 4}, {foo: 3}]);
      addElementNotFoundTest(elementWith, 'arraylike predicate returns false', alwaysFalse, makeArrayLike('a', 'b'));
      addElementNotFoundTest(elementWith, 'string predicate returns false', isDigit, 'abcde');

      addElementFoundTest(elementWith, 'predicate matches array element', function(x) {return x.foo === 7},
                                       [{foo: 1}, {foo: 7}, {foo: 4}]);
      addElementFoundTest(elementWith, 'predicate matches arraylike element', fooIs42,
                                       makeArrayLike({foo: 4}, {foo: 42}));
      addElementFoundTest(elementWith, 'predicate matches element in string', isDigit, 'abc8de');


      testCurriedFunction('elementWith', elementWith, [function(x) {return true;}, [1, 2, 3]]);
    });


    // The two range functions have some common behaviours: the value returned should be empty if the limits are equal,
    // and the right-hand limit should not be included
    var addCommonRangeTests = function(fnUnderTest, hasStep) {
      hasStep = hasStep || false;


      it('Returns empty array if b === a', function() {
        var args = hasStep ? [1, 1, 1] : [1, 1];
        var result = fnUnderTest.apply(null, args);

        expect(result).to.deep.equal([]);
      });


      it('Does not include right-hand limit (1)', function() {
        var b = 10;
        var args = hasStep ? [0, 1, b] : [0, b];
        var result = fnUnderTest.apply(null, args);

        expect(array.last(result) < b).to.be.true;
      });


      it('Does not include right-hand limit (2)', function() {
        var b = 15.2;
        var args = hasStep ? [1.1, 1.1, b] : [1.1, b];
        var result = fnUnderTest.apply(null, args);

        expect(array.last(result) < b).to.be.true;
      });
    };


    var rangeSpec = {
      name: 'range',
      arity: 2
    };


    describeFunction(rangeSpec, array.range, function(range) {
      addCommonRangeTests(range);


      it('Throws if b < a', function() {
        var fn = function() {
          range(1, 0);
        };

        expect(fn).to.throw(TypeError);
      });


      var addCorrectTest = function(message, a, b) {
        it('Works correctly ' + message, function() {
          var arr = range(a, b);
          var result = arr.every(function(val, i) {
            return (i === 0 && val === a) || (val === arr[i - 1] + 1);
          });

          expect(result).to.be.true;
        });
      };


      addCorrectTest('(1)', 0, 10);
      addCorrectTest('(2)', 1.1, 15.2);


      testCurriedFunction('range', array.range, [1, 5]);
    });


    var rangeStepSpec = {
      name: 'rangeStep',
      arity: 3
    };


    describeFunction(rangeStepSpec, array.rangeStep, function(rangeStep) {
      addCommonRangeTests(rangeStep, true);


      var addBadRangeTest = function(message, a, step, b) {
        it('Throws if ' + message, function() {
          var fn = function() {
            rangeStep(a, step, b);
          };

          expect(fn).to.throw(TypeError);
        });
      };


      addBadRangeTest('b < a, and step positive', 1, 1, 0);
      addBadRangeTest('b < a, and step zero', 1, 0, 0);
      addBadRangeTest('b < a, and step not finite (1)', 1, Number.POSITIVE_INFINITY, 0);
      addBadRangeTest('b < a, and step not finite (2)', 1, Number.NEGATIVE_INFINITY, 0);
      addBadRangeTest('b > a, and step positive', 1, -1, 10);
      addBadRangeTest('b > a, and step zero', 1, 0, 10);
      addBadRangeTest('b > a, and step not finite (1)', 1, Number.POSITIVE_INFINITY, 10);
      addBadRangeTest('b > a, and step not finite (2)', 1, Number.NEGATIVE_INFINITY, 10);


      var addCorrectTest = function(message, a, step, b) {
        it('Works correctly (1)', function() {
          var arr = rangeStep(a, step, b);
          var result = arr.every(function(val, i) {
            return (i === 0 && val === a) || (val === arr[i - 1] + step);
          });

          expect(result).to.be.true;
        });
      };


      addCorrectTest('(1)', 0, 2, 10);
      addCorrectTest('(2)', 15.2, -1.1, 1.1);


      it('Empty if a === b, and step incorrect', function() {
        var a = 1;
        var step = 0;
        var b = 1;
        var arr = rangeStep(a, step, b);

        expect(arr).to.deep.equal([]);
      });


      // The common range tests don't test the bacward step case
      it('Does not include right-hand limit (3)', function() {
        var a = 20;
        var step = -1;
        var b = 10;
        var result = rangeStep(a, step, b);

        expect(array.last(result) > b).to.be.true;
      });


      testCurriedFunction('rangeStep', array.rangeStep, [1, 1, 5]);
    });


    var addCommonTakeDropTests = function(testAdder) {
      var tests = [
        {name: 'array', makeEmpty: function() {return [];}, makeNormal: function() {return [1, 2, 3];}},
        {name: 'arraylike', makeEmpty: function() {return makeArrayLike();},
                            makeNormal: function() {return makeArrayLike(2, 3, 4);}},
        {name: 'string', makeEmpty: function() {return '';}, makeNormal: function() {return 'funkier';}}
      ];


      tests.forEach(function(test) {
        testAdder('count is 0 for empty ' + test.name, 0, test.makeEmpty());
        testAdder('count is 0 for ' + test.name, 0, test.makeNormal());
        testAdder('count is negative for empty ' + test.name, -1, test.makeEmpty());
        testAdder('count is negative for ' + test.name, -1, test.makeNormal());
      });
    };


    var takeSpec = {
      name: 'take',
      arity: 2,
      restrictions: [['integer'], ['arraylike']],
      validArguments: [[1], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(takeSpec, array.take, function(take) {
      addReturnsSameTypeTests(take, [1]);
      addNoModificationOfOriginalTests(take, [1]);
      addReturnsEmptyOnEmptyTests(take, [1]);


      var addExpectEmptyTest = function(message, count, originalData) {
        var isArray = typeof(originalData) !== 'string';


        it('Returns empty ' + (isArray ? 'array' : 'string') + ' when ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = take(count, data);

          expect(result).to.deep.equal(isArray ? [] : '');
        });
      };


      addCommonTakeDropTests(addExpectEmptyTest);


      var addCorrectEntryTests = function(message, count, arrData, arrlikeData, strData) {
        var addTest = function(typeMessage, originalData) {
          it('Works correctly when ' + message + typeMessage, function() {
            var data = sliceIfNecessary(originalData);
            var arr = take(count, data);
            arr = splitIfNecessary(arr);

            var result = arr.every(function(val, i) {
              return val === data[i];
            });

            expect(result).to.be.true;
          });
        };

        addTest(' for array', arrData);
        addTest(' for arrayLike', arrlikeData);
        addTest(' for string', strData);
      };


      addCorrectEntryTests('count < length', 2, [1, 2, 3], makeArrayLike(2, 3, 4), 'funkier');
      addCorrectEntryTests('count === length', 3, [{}, {}, {}], makeArrayLike(5, 6, 7), 'abc');
      addCorrectEntryTests('count > length', 4, [3, 4, 5], makeArrayLike(8, 9), 'x');


      testCurriedFunction('take', take, [1, [1, 2, 3]]);
    });


    var dropSpec = {
      name: 'drop',
      arity: 2,
      restrictions: [['integer'], ['arraylike']],
      validArguments: [[1], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(dropSpec, array.drop, function(drop) {
      addReturnsSameTypeTests(drop, [1]);
      addNoModificationOfOriginalTests(drop, [1]);
      addReturnsEmptyOnEmptyTests(drop, [1]);


      var addExpectFullTest = function(message, count, originalData) {
        var isArray = typeof(original) !== 'string';

        it('Returns copy of ' + (isArray ? 'array' : 'string') + ' when ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var dropped = drop(count, data);

          expect(valuesEqual(data, dropped)).to.be.true;
        });
      };


      addCommonTakeDropTests(addExpectFullTest);


      var addCorrectEntryTests = function(message, count, arrData, arrlikeData, strData) {
        var addTest = function(typeMessage, originalData) {
          it('Works correctly when ' + message + typeMessage, function() {
            var data = sliceIfNecessary(originalData);
            var arr = drop(count, data);
            arr = splitIfNecessary(arr);

            var result = arr.every(function(val, i) {
              return val === data[i + count];
            });

            expect(result).to.be.true;
          });
        };

        addTest(' for array', arrData);
        addTest(' for arraylike', arrlikeData);
        addTest(' for string', strData);
      };


      var addEmptyAfterDropTests = function(message, count, arrData, arrlikeData, strData) {
        var addTest = function(type, typeMessage, originalData) {
          it('Returns empty ' + type + ' when ' + message + typeMessage, function() {
            var data = sliceIfNecessary(originalData);
            var result = drop(count, data);

            expect(result).to.deep.equal(type === 'array' ? [] : '');
          });
        };

        addTest('array', ' for array ', arrData);
        addTest('array', ' for arraylike', arrlikeData);
        addTest('string', ' for string ', strData);
      };


      addCorrectEntryTests('count < length', 1, [1, 2, 3], makeArrayLike(2, 3, 4), 'funkier');
      addEmptyAfterDropTests('count === length', 3, [{}, {}, {}], makeArrayLike(1, 2, 3), 'abc');
      addEmptyAfterDropTests('count > length', 4, [3, 4, 5], makeArrayLike('a', 'b'), 'x');


      testCurriedFunction('drop', drop, [1, [1, 2, 3]]);
    });


    var makeInitTailTests = function(desc, fnUnderTest) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['arraylike']],
        validArguments: [[[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addThrowsOnEmptyTests(fnUnderTest, []);
        addReturnsSameTypeTests(fnUnderTest, []);


        var addTests = function(type, tests) {
          var addOne = function(originalData, count) {
            var lenMessage = 'Returns ' + (typeof(originalData === 'string') ? 'string' : 'array') +
                             ' of correct length when called with ' + type + '(' + count + ')';
            addSameLengthTest(fnUnderTest, lenMessage, [], originalData, -1);


            it('Works correctly for ' + type + ' (' + count + ')', function() {
              var data = sliceIfNecessary(originalData);
              var arr = fnUnderTest(data);
              arr = splitIfNecessary(arr);

              var valuesCorrect = arr.every(function(val, i) {
                return val === data[fnUnderTest === array.tail ? i + 1 : i];
              });

              expect(valuesCorrect).to.be.true;
            });
          };

          tests.forEach(addOne);
        };


        addTests('array', [[1, 2, 3], [{}, {}, {}, {}, {}]]);
        addTests('arraylike', [makeArrayLike({}, {}), makeArrayLike(true, false, null)]);
        addTests('string', ['abc', 'funkier']);
      });
    };


    makeInitTailTests('init', array.init);
    makeInitTailTests('tail', array.tail);


    var makeInitsTailsTests = function(desc, fnUnderTest) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['arraylike']],
        validArguments: [[[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        var addTests = function(type, tests) {
          var expectedType = type === 'string' ? 'string' : 'array';


          var addOneSet = function(originalData, count) {
            var lenMessage = 'Returns array of correct length when called with ' + type + '(' + count + ')';
            addSameLengthTest(fnUnderTest, lenMessage, [], originalData, 1);


            it('Returns array when called with ' + type + '(' + count + ')', function() {
              var data = sliceIfNecessary(originalData);
              var result = fnUnderTest(data);

              expect(isArray(result)).to.be.true;
            });


            it('Returns elements of type ' + expectedType + ' when called with ' + type + '(' + count + ')', function() {
              var data = sliceIfNecessary(originalData);
              var elementsHaveCorrectType = fnUnderTest(data).every(function(val) {
                if (expectedType === 'array')
                  return isArray(val);
                return typeof(val) === 'string';
               });

               expect(elementsHaveCorrectType).to.be.true;
            });


            it('Elements have correct length when called with ' + type + '(' + count + ')', function() {
              var data = sliceIfNecessary(originalData);
              var elementLengthsCorrect = fnUnderTest(data).every(function(val, i) {
                return val.length === (fnUnderTest === array.tails ? data.length - i : i);
              });

              expect(elementLengthsCorrect).to.be.true;
            });


            it('Works correctly for ' + type + ' (' + count + ')', function() {
              var data = sliceIfNecessary(originalData);
              var arr = fnUnderTest(data);
              var elementsCorrect = arr.every(function(val, i) {
                val = splitIfNecessary(val);

                return val.every(function(v, j) {
                  return v === data[fnUnderTest === array.tails ? i + j : j];
                });
              });

              expect(elementsCorrect).to.be.true;
            });
          };

          tests.forEach(addOneSet);
        };


        addTests('array', [[], [1, 2], [{}, {}, {}]]);
        addTests('arraylike', [makeArrayLike(), makeArrayLike(2, 3), makeArrayLike({}, true, null)]);
        addTests('string', ['', 'ab', 'funkier']);
        addNoModificationOfOriginalTests(fnUnderTest, []);
      });
    };


    makeInitsTailsTests('inits', array.inits);
    makeInitsTailsTests('tails', array.tails);


    var copySpec = {
      name: 'copy',
      arity: 1,
      restrictions: [['arraylike']],
      validArguments: [[[1, 2], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(copySpec, array.copy, function(copy) {
      addReturnsSameTypeTests(copy, []);
      addReturnsEmptyOnEmptyTests(copy, []);


      var addTests = function(message, originalData) {
        addSameLengthTest(copy, message, [], originalData);


        it('Returns a copy for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var sameValue = copy(data) === data;

          expect(sameValue).to.be.false;
        });


        it('Works correctly for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var copied = copy(data);


          expect(valuesEqual(data, copied)).to.be.true;
        });


        it('Shallow copies members for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var membersAreCopies = copy(data).every(function(val, i) {
            return val === data[i];
          });

          expect(membersAreCopies).to.be.true;
        });
      };


      addTests('empty arrays', []);
      addTests('arrays (1)', [1, 2, 3]);
      addTests('arrays (2)', [{foo: 1}, {baz: 2}, {fizz: 3, buzz: 5}]);
      addTests('empty arraylikes', makeArrayLike());
      addTests('arraylikes (1)', makeArrayLike(2, 3, 4));
      addTests('arraylikes (2)', makeArrayLike({fizz: 3}, {buzz: 5}));
    });


    var sliceSpec = {
      name: 'slice',
      arity: 3,
      restrictions: [['positive'], ['positive'], ['arraylike']],
      validArguments: [[0], [1], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(sliceSpec, array.slice, function(slice) {
      addReturnsSameTypeTests(slice, [0, 1]);
      addNoModificationOfOriginalTests(slice, []);
      addNoModificationOfOriginalTests(slice, []);


      var addReturnEmptyTests = function(originalData) {
        var isArray = typeof(originalData) !== 'string';


        it('Returns empty ' + (isArray ? 'array' : 'string') + ' if from > length', function() {
          var data = originalData.slice();
          var result = slice(data.length + 2, data.length + 4, data);

          expect(result).to.deep.equal(isArray ? [] : '');
        });


        it('Returns empty ' + (isArray ? 'array' : 'string') + ' if from === length', function() {
          var data = originalData.slice();
          var result = slice(data.length, data.length + 3, data);

          expect(result).to.deep.equal(isArray ? [] : '');
        });
      };


      addReturnEmptyTests([1, 2, 3]);
      addReturnEmptyTests(makeArrayLike(true, 1, null));
      addReturnEmptyTests('abc');

      // we should also test we get an empty when passing empty. We cannot pass addReturnEmptyTests directly to
      // addTests: addTests expects the generator to have arity 2, addReturnEmptyTests has arity 1. Thus we wrap it.
      var addEmpty = function(message, data) {addReturnEmptyTests(data);};
      addEmptyTests(addEmpty);


      var addTests = function(message, from, to, arrData, arrlikeData, strData) {
        var addOne = function(type, originalData) {
          it('Result has correct length when ' + message + ' for ' + type, function() {
            var data = sliceIfNecessary(originalData);
            var result = slice(from, to, data).length === Math.min(data.length - from, to - from);

            expect(result).to.be.true;
          });


          it('Result has correct values when ' + message + ' for ' + type, function() {
            var data = sliceIfNecessary(originalData);
            var newVal = slice(from, to, data);
            newVal = splitIfNecessary(newVal);

            var result = newVal.every(function(val, i) {
              return val === data[from + i];
            });

            expect(result).to.be.true;
          });
        };

        addOne('array', arrData);
        addOne('arraylike', arrlikeData);
        addOne('string', strData);
      };


      addTests('to > len', 1, 5, [1, 2, 3, 4], makeArrayLike(2, 3, 4, 5), 'abcd');
      addTests('to === len', 1, 4, [2, 3, 4, 5], makeArrayLike(2, 3, 4, 5), 'efgh');
      addTests('slicing normally', 1, 3, [{foo: 1}, {bar: 2}, {fizz: 3}, {buzz: 5}], makeArrayLike(2, 3, 4, 5), 'abcd');


      testCurriedFunction('slice', slice, [1, 2, 'funkier']);
    });


    var makeTakeWDropWTests = function(desc, fnUnderTest) {
      var isTakeWhile = desc === 'takeWhile';


      var spec = {
        name: desc,
        arity: 2,
        restrictions: [['function: arity 1'], ['arraylike']],
        validArguments: [[function(x) {return true;}], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addFuncCalledWithSpecificArityTests(fnUnderTest, 1);
        addReturnsSameTypeTests(fnUnderTest, [alwaysTrue]);
        addReturnsEmptyOnEmptyTests(fnUnderTest, [alwaysTrue]);
        addNoModificationOfOriginalTests(fnUnderTest, [alwaysTrue]);


        var addTests = function(type, message, predicate, expectedLength, originalData) {
          it('Result has correct length ' + message + ' for ' + type, function() {
            var data = sliceIfNecessary(originalData);
            var correctLength = isTakeWhile ? expectedLength : data.length - expectedLength;
            var length = fnUnderTest(predicate, data).length;

            expect(length).to.equal(correctLength);
          });


          it('Predicate only called as often as needed ' + message + ' for ' + type, function() {
            var data = sliceIfNecessary(originalData);

            // We use a predicate that records how often it is called, and check we didn't iterate over the whole value
            var called = 0;
            var newPredicate = function(x) {called += 1; return predicate(x);};
            fnUnderTest(newPredicate, data);
            var calledCorrectly = called === expectedLength + (expectedLength === data.length ? 0 : 1);

            expect(calledCorrectly).to.be.true;
          });


          it('Result has correct members ' + message + ' for ' + type, function() {
            var data = sliceIfNecessary(originalData);
            var arr = fnUnderTest(predicate, originalData);
            arr = splitIfNecessary(arr);

            var membersCorrect = arr.every(function(val, i) {
              return val === data[isTakeWhile ? i : i + expectedLength];
            });

            expect(membersCorrect).to.be.true;
          });
        };


        // Each type has 3 tests: one where only some initial elements match, one where no element matches, and one
        // where every element matches
        var testData = [
          {name: 'array', tests: [{f: function(x) {return x.foo < 4;}, expected: 2,
                                   data: [{foo: 1}, {foo: 3}, {foo: 4}, {foo: 5}, {foo: 6}]},
                                  {f: function(x) {return x % 2 === 0;}, expected: 0, data: [3, 4, 6, 1, 5]},
                                  {f: alwaysTrue, expected: 5, data: [2, 4, 6, 1, 5]}]},
          {name: 'arraylike', tests: [{f: function(x) {return x.foo < 5;}, expected: 4,
                                       data: makeArrayLike({foo: 1}, {foo: 3}, {foo: 4}, {foo: 2}, {foo: 6})},
                                      {f: function(x) {return x % 2 !== 0;}, expected: 0,
                                       data: makeArrayLike(2, 4, 6, 1, 5)},
                                      {f: alwaysTrue, expected: 5, data: makeArrayLike(2, 4, 6, 1, 5)}]},
          {name: 'string', tests: [{f: function(x) {return x === ' ';}, expected: 3, data: '   funkier'},
                                   {f: isDigit, expected: 0, data: 'zxabc'},
                                   {f: alwaysTrue, expected: 5, data: 'abcde'}]}
        ];


        testData.forEach(function(t) {
          t.tests.forEach(function(test, i) {
            addTests(t.name, '(' + (i + 1) + ')', test.f, test.expected, test.data);
          });
        });


        testCurriedFunction(desc, fnUnderTest, [function(x) {return true;}, [1, 2, 3]]);
      });
    };


    makeTakeWDropWTests('takeWhile', array.takeWhile);
    makeTakeWDropWTests('dropWhile', array.dropWhile);


    var makePrependAppendTests = function(desc, fnUnderTest) {
      var isPrepend = desc === 'prepend';


      var spec = {
        name: desc,
        arity: 2,
        restrictions: [[], ['arraylike']],
        validArguments: [[1], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addReturnsSameTypeTests(fnUnderTest, [1]);
        addNoModificationOfOriginalTests(fnUnderTest, [1]);


        var addTests = function(arrData, arrlikeData, strData) {
          var addOne = function(type, message, val, originalData) {
            addSameLengthTest(fnUnderTest, message, [val], originalData, 1);


            it('Result has correct values ' + message + ' for ' + type, function() {
              var data = sliceIfNecessary(originalData);
              var newVal = fnUnderTest(val, data);
              newVal = splitIfNecessary(newVal);

              var prependCheck = function(v, i) {
                if (i === 0)
                  return v === val;
                return v === data[i - 1];
              };

              var appendCheck = function(v, i) {
                if (i === data.length)
                  return v === val;
                return v === data[i];
              };

              var elementsCorrect = newVal.every(isPrepend ? prependCheck : appendCheck);

              expect(elementsCorrect).to.be.true;
            });
          };

          arrData.forEach(function(data, i) {
            addOne('array', '(' + (i + 1) + ')', data[0], data[1]);
          });
          arrlikeData.forEach(function(data, i) {
            addOne('arraylike', '(' + (i + 1) + ')', data[0], data[1]);
          });
          strData.forEach(function(data, i) {
            addOne('string', '(' + (i + 1) + ')', data[0], data[1]);
          });
        };


        // The tests include a "normal" test, and a value to be modified to is empty test
        addTests([[{}, [{foo: 1}, {bar: 2}, {fizz: 3}]], [1, []]],
                 [[5, makeArrayLike(6, 7, 8, 9)], ['a', makeArrayLike()]],
                 [['a', 'bcd'], ['z', '']]);


        testCurriedFunction(desc, fnUnderTest, [1, [1, 2, 3]]);
      });
    };


    makePrependAppendTests('prepend', array.prepend);
    makePrependAppendTests('append', array.append);


    var concatSpec = {
      name: 'concat',
      arity: 2,
      restrictions: [['arraylike'], ['arraylike']],
      validArguments: [[[1, 2], 'abc', makeArrayLike(2, 3, 4)], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(concatSpec, array.concat, function(concat) {
      var addTest = function(expectedType, message, left, right) {
        // We can't use the global returnsSameType test generator here
        it('Result has type ' + expectedType + ' for ' + message, function() {
          var first = left.slice();
          var second = right.slice();
          var result = concat(first, second);

          if (expectedType === 'array')
            expect(isArray(result)).to.be.true;
          else
            expect(result).to.be.a('string');
        });


        it('Result has correct length for ' + message, function() {
          var first = left.slice();
          var second = right.slice();
          var length = concat(first, second).length;

          expect(length).to.equal(first.length + second.length);
        });


        it('Result has correct values for ' + message, function() {
          var first = left.slice();
          var second = right.slice();
          var newVal = concat(first, second);
          newVal = splitIfNecessary(newVal);

          var valsCorrect = newVal.every(function(v, i) {
            return v === (i < first.length ? first[i] : second[i - first.length]);
          });

          expect(valsCorrect).to.be.true;
        });


        it('Doesn\'t affect originals for ' + message, function() {
          var first = left.slice();
          var second = right.slice();
          var firstLength = first.length;
          var secondLength = second.length;
          concat(first, second);

          expect(first.length === firstLength && second.length === secondLength).to.be.true;
        });
      };


      var tests = [
        {name: 'array', tests: [{type: 'empty', value: []}, {type: 'normal', value: [1, 2]}]},
        {name: 'arraylike', tests: [{type: 'empty', value: makeArrayLike()},
                                    {type: 'normal', value: makeArrayLike(2, 3, 4)}]},
        {name: 'string', tests: [{type: 'empty', value: ''}, {type: 'normal', value: 'funkier'}]}
      ];


      tests.forEach(function(left) {
        left.tests.forEach(function(leftTest) {
          tests.forEach(function(right) {
            right.tests.forEach(function(rightTest) {
              var expectedType = left.name === 'string' && right.name === 'string' ? 'string' : 'array';
              var message = ['LHS', leftTest.type, left.name, ',', 'RHS', rightTest.type, right.name].join(' ');

              addTest(expectedType, message, leftTest.value, rightTest.value);
            });
          });
        });
      });


      testCurriedFunction('concat', concat, [[1], [1, 2, 3]]);
    });


    var isEmptySpec = {
      name: 'empty',
      arity: 1,
      restrictions: [['arraylike']],
      validArguments: [[[], '', makeArrayLike()]]
    };


    describeFunction(isEmptySpec, array.isEmpty, function(isEmpty) {
      var addOne = function(message, originalData) {
        it('Works for ' + message, function() {
          var data = sliceIfNecessary(originalData);

          expect(isEmpty(data)).to.equal(data.length === 0);
        });
      };


      addEmptyTests(addOne);
      addOne('a non-empty array', [1, 2]);
      addOne('a non-empty arraylike', makeArrayLike(2, 3));
      addOne('a non-empty string', 'a');
    });


    var intersperseSpec = {
      name: 'intersperse',
      arity: 2,
      restrictions: [[], ['arraylike']],
      validArguments: [[','], [[1, 2], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(intersperseSpec, array.intersperse, function(intersperse) {
      addReturnsSameTypeTests(intersperse, ['-']);


      var addDegenerateTest = function(message, originalData) {
        it('Works correctly for ' + message, function() {
          var val = originalData.slice();
          var result = intersperse(',', val);

          expect(valuesEqual(val, result)).to.be.true;
        });
      };


      addEmptyTests(addDegenerateTest);
      addDegenerateTest('for single element array', [1]);
      addDegenerateTest('for single element arraylike', makeArrayLike(2));
      addDegenerateTest('for single element string', 'a');


      var addTests = function(message, originalData) {
        it('Result has correct length ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var length = intersperse(',', data).length;

          expect(length).to.equal(2 * data.length - 1);
        });


        it('Result has original values at correct positions ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var interspersed = intersperse(',', data);
          interspersed = splitIfNecessary(interspersed);
          var originalElementsPresent = interspersed.every(function(v, i) {
            // the values at odd indices should be the interspersed string
            if (i % 2 === 1) return true;

            return v === data[i / 2];
          });

          expect(originalElementsPresent).to.be.true;
        });


        it('Result has interspersed values at correct positions ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var intersperseValue = ':';
          var interspersed = intersperse(intersperseValue, data);
          interspersed = splitIfNecessary(interspersed);
          var interspersedCorrectly = interspersed.every(function(v, i) {
            // the values at even indices were checked in the preceding test
            if (i % 2 === 0) return true;

            return v === intersperseValue;
          });

          expect(interspersedCorrectly).to.be.true;
        });
      };


      addTests('array (1)', [1, 2]);
      addTests('array (2)', [1, 2, 3, 4]);
      addTests('arraylike (1)', makeArrayLike(2, 3));
      addTests('arraylike (2)', makeArrayLike(4, 5, 6, 7));
      addTests('string (1)', 'ab');
      addTests('string (2)', 'funkier');


      testCurriedFunction('intersperse', intersperse, ['1', 'abc']);
    });


    var reverseSpec = {
      name: 'reverse',
      arity: 1,
      restrictions: [['arraylike']],
      validArguments: [[[1, 2], 'ab', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(reverseSpec, array.reverse, function(reverse) {
      addReturnsEmptyOnEmptyTests(reverse, []);
      addReturnsSameTypeTests(reverse, []);


      var addTests = function(message, originalData) {
        it('Returns value with same length as original for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var expected = data.length;
          var result = reverse(data);

          expect(result.length).to.equal(expected);
        });


        it('Returns correct result for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var originalLength = data.length - 1;
          var reversed = reverse(data);
          reversed = splitIfNecessary(reversed);
          var result = reversed.every(function(v, i) {
            return v === data[originalLength - i];
          });

          expect(result).to.be.true;
        });
      };


      addTests('array', [{}, {}]);
      addTests('arraylike', makeArrayLike(1, 2));
      addTests('string', 'funkier');
      addTests('single element array', [1]);
      addTests('single element arraylike', makeArrayLike(3));
      addTests('single element string', '');
    });


    var addFindTest = function(message, fnUnderTest, args, expected) {
      var val = args[0];
      var originalData = args[args.length - 1];

      it(message, function() {
        var data = sliceIfNecessary(originalData);
        var argData = args.slice();
        var result = fnUnderTest.apply(null, argData);

        expect(result).to.equal(expected);
        if (result !== -1) {
          if (typeof(val) !== 'function') {
            expect(data[result]).to.equal(val);
          } else {
            expect(val(data[result])).to.be.true;
          }
        }
      });
    };


    var findSpec = {
      name: 'find',
      arity: 2,
      restrictions: [[], ['arraylike']],
      validArguments: [[1], [[2, 3], '234', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(findSpec, array.find, function(find) {
      var addEmpty = function(message, value) {
        addFindTest('Works correctly for ' + message, find, [1, value], -1);
      };
      addEmptyTests(addEmpty);


      // Each test's value should be such that the value at index 0 is duplicated in the value, the second and last
      // values are not duplicated, and the number 0 does not appear anywhere in the value
      var tests = [
        {name: 'array', value: [1, 2, 3, 1, 4]},
        {name: 'arraylike', value: makeArrayLike(2, 4, 2, 6)},
        {name: 'string', value: 'abacus'}
      ];


      tests.forEach(function(test) {
        addFindTest('Works correctly for ' + test.name + ' (1)', find, [test.value[1], test.value], 1);
        var len = test.value.length - 1;
        addFindTest('Works correctly for ' + test.name + ' (2)', find, [test.value[len], test.value], len);
        addFindTest('Returns first match for  ' + test.name, find, [test.value[0], test.value], 0);
        addFindTest('Returns -1 when no match for ' + test.name, find, [0, test.value], -1);
      });


      var obj = {};
      addFindTest('Tests with strict identity for array (1)', find, [obj, [{}, {}, {}]], -1);
      addFindTest('Tests with strict identity for array (2)', find, [obj, [{}, obj, {}]], 1);
      addFindTest('Tests with strict identity for arraylike (1)', find, [obj, makeArrayLike({}, {}, {})], -1);
      addFindTest('Tests with strict identity for arraylike (2)', find, [obj, makeArrayLike({}, obj, {})], 1);
    });


    var findFromSpec = {
      name: 'findFrom',
      arity: 3,
      restrictions: [[], ['positive'], ['arraylike']],
      validArguments: [[1], [1], [[2, 3], '234', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(findFromSpec, array.findFrom, function(findFrom) {
      var addEmpty = function(message, value) {
        addFindTest('Works correctly for ' + message, findFrom, [0, 0, value], -1);
      };
      addEmptyTests(addEmpty);


      // Each test's value should be such that:
      //  - the value at index 3 is the same as that at index 0
      //  - the values at index 1 and the last value occur only once
      //  - the value at index 2 and the second last value are the same
      //  - the number 0 does not appear anywhere in the value
      var tests = [
        {name: 'array', value: [1, 5, 6, 1, 6, 8]},
        {name: 'arraylike', value: makeArrayLike(2, 9, 7, 2, 7, 1)},
        {name: 'string', value: 'bacbcd'}
      ];


      tests.forEach(function(test) {
        var len = test.value.length - 1;
        addFindTest('Works correctly for ' + test.name + ' (1)', findFrom, [test.value[1], 1, test.value], 1);
        addFindTest('Works correctly for ' + test.name + ' (2)', findFrom, [test.value[len], 2, test.value], len);
        addFindTest('Returns first match for ' + test.name, findFrom, [test.value[2], 3, test.value], len - 1);
        addFindTest('Ignores earlier matches for ' + test.name, findFrom, [test.value[0], 1, test.value], 3);
        addFindTest('Returns -1 when no match for ' + test.name, findFrom, [0, 1, test.value], -1);
        addFindTest('Returns -1 when no match at position for ' + test.name, findFrom, [test.value[1], 2, test.value], -1);
        addFindTest('Returns -1 when from === length for ' + test.name, findFrom, [0, len + 1, test.value], -1);
        addFindTest('Returns -1 when from > length for ' + test.name, findFrom, [0, len + 2, test.value], -1);
      });

      var obj = {};
      addFindTest('Tests with strict identity for array (1)', findFrom, [obj, 0, [{}, {}, {}]], -1);
      addFindTest('Tests with strict identity for array (2)', findFrom, [obj, 1, [{}, {}, obj, {}]], 2);
      addFindTest('Tests with strict identity for arraylike (1)', findFrom, [obj, 1, makeArrayLike({}, {})], -1);
      addFindTest('Tests with strict identity for arraylike (2)', findFrom, [obj, 1, makeArrayLike({}, obj, {}, {})], 1);
    });


    var addFindPredicateCalledWithEveryNotFoundTest = function(fnUnderTest, fnArgs) {
      var originalData = fnArgs[fnArgs.length - 1];
      var message = isArray(originalData) ? 'array' : typeof(originalData) === 'string' ? 'string' : 'object';


      it('Function called with every element if not found (' + message + ')', function() {
        // The function records every argument it is called with. This should equal the original data
        var args = [];
        var f = function(x) {args.push(x); return false;};

        var from = fnArgs.length === 1 ? 0 : fnArgs[0];
        var data = sliceIfNecessary(fnArgs[fnArgs.length - 1]);
        var realFnArgs = [f].concat(fnArgs.slice(0, fnArgs.length - 1)).concat([data]);

        var result = fnUnderTest.apply(null, realFnArgs);

        var calledWithEvery = args.every(function(v, i) {
          return v === data[i + from];
        });

        expect(args.length).to.equal(data.length - from);
        expect(calledWithEvery).to.be.true;
      });
    };


    var addFindPredicateCalledOnlyAsOftenAsNecessaryTest = function(fnUnderTest, fnArgs) {
      var originalData = fnArgs[fnArgs.length - 1];
      var message = isArray(originalData) ? 'array' : typeof(originalData) === 'string' ? 'string' : 'object';


      it('Function called only as often as necessary when found (' + message + ')', function() {
        // Create a new predicate function that records the values it's called with, then defers to
        // the supplied predicate. We can then confirm we iterated from left to right.
        var args = [];
        var predicate = fnArgs[0];
        var f = function(x) {args.push(x); return predicate(x);};

        var data = sliceIfNecessary(fnArgs[fnArgs.length - 1]);
        var from = fnArgs.length === 2 ? 0 : fnArgs[1];
        var realFnArgs = [f].concat(fnArgs.slice(1, fnArgs.length - 1)).concat([data]);
        var index = fnUnderTest.apply(null, realFnArgs);

        var iteratedOverValue = args.every(function(v, i) {
          return v === data[from + i];
        });

        expect(args.length).to.equal(index + 1 - from);
        expect(iteratedOverValue).to.be.true;
      });
    };


    var findWithSpec = {
      name: 'findWith',
      arity: 2,
      restrictions: [['function: arity 1'], ['arraylike']],
      validArguments: [[alwaysTrue], [[1, 2], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(findWithSpec, array.findWith, function(findWith) {
      addFuncCalledWithSpecificArityTests(findWith, 1);


      var addEmpty = function(message, originalData) {
        it('Function never called for ' + message, function() {
          var called = false;
          var f = function(x) {called = true; return true;};
          var data = sliceIfNecessary(originalData);
          findWith(f, data);

          expect(called).to.be.false;
        });


        it('Works correctly for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = findWith(alwaysTrue, data);

          expect(result).to.equal(-1);
        });
      };


      addEmptyTests(addEmpty);
      addFindPredicateCalledWithEveryNotFoundTest(findWith, [[1, 2, 3]]);
      addFindPredicateCalledWithEveryNotFoundTest(findWith, [makeArrayLike()]);
      addFindPredicateCalledWithEveryNotFoundTest(findWith, ['funkier']);
      addFindPredicateCalledOnlyAsOftenAsNecessaryTest(findWith,
                                              [fooIs42, [{foo: 1}, {foo: 6}, {foo: 7}, {foo: 1}, {foo: 42}, {foo: 4}]]);
      addFindPredicateCalledOnlyAsOftenAsNecessaryTest(findWith,
                                                     [fooIs42, makeArrayLike({foo: 1}, {foo: 6}, {foo: 42}, {foo: 1})]);
      addFindPredicateCalledOnlyAsOftenAsNecessaryTest(findWith, [function(x) {return x < 'a';}, 'abCde']);


      // Each test's value should be such that:
      // - value1 should have one value that matches the predicate, at index 2
      // - value2 should have two values that match the predicate, at indices 1 and 3
      var tests = [
        {name: 'array', predicate: fooIs42, value1: [{foo: 1}, {foo: 3}, {foo: 42}, {foo: 6}],
                                            value2: [{foo: 2}, {foo: 42}, {foo: 5}, {foo: 42}, {foo: 7}]},
        {name: 'arraylike', predicate: fooIs42, value1: makeArrayLike({foo: 3}, {foo: 12}, {foo: 42}, {foo: 1}),
                                                value2: makeArrayLike({foo: 0}, {foo: 42}, {foo: 10}, {foo: 42})},
        {name: 'string', predicate: isDigit, value1: 'ab7def', value2: 'a1b2d'}
      ];


      tests.forEach(function(test) {
        addFindTest('Returns -1 when value not found for ' + test.name, findWith, [alwaysFalse, test.value1], -1);
        addFindTest('Works correctly for ' + test.name, findWith, [test.predicate, test.value1], 2);
        addFindTest('Returns first match for ' + test.name, findWith, [test.predicate, test.value2], 1);
      });


      testCurriedFunction('findWith', findWith, [alwaysTrue, 'funkier']);
    });


    var findFromWithSpec = {
      name: 'findFromWith',
      arity: 3,
      restrictions: [['function: arity 1'], ['positive'], ['arraylike']],
      validArguments: [[alwaysTrue], [1], [[1, 2], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(findFromWithSpec, array.findFromWith, function(findFromWith) {
      addFuncCalledWithSpecificArityTests(findFromWith, 1, [1]);


      var addEmpty = function(message, originalData) {
        it('Function never called with ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var called = 0;
          var f = function(x) {called += 1; return true;};
          findFromWith(f, 1, data);

          expect(called).to.equal(0);
        });


        it('Works correctly for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = findFromWith(alwaysTrue, 0, data);

          expect(result).to.equal(-1);
        });
      };


      // Each test's value should be such that:
      // - value1 should have one value that matches the predicate, at index 2
      // - value2 should have two values that match the predicate, at indices 1 and 3
      var tests = [
        {name: 'array', predicate: fooIs42, value1: [{foo: 1}, {foo: 3}, {foo: 42}, {foo: 6}, {foo: 8}],
                                            value2: [{foo: 2}, {foo: 42}, {foo: 5}, {foo: 42}, {foo: 7}]},
        {name: 'arraylike', predicate: fooIs42, value1: makeArrayLike({foo: 3}, {foo: 12}, {foo: 42}, {foo: 1}, {foo: 9}),
                                                value2: makeArrayLike({foo: 0}, {foo: 42}, {foo: 10}, {foo: 42})},
        {name: 'string', predicate: isDigit, value1: 'ab7edef', value2: 'a1b2d'}
      ];


      tests.forEach(function(test) {
        addFindTest('Returns -1 when value not found for ' + test.name, findFromWith,
                                                                 [alwaysFalse, 1, test.value1], -1);
        addFindTest('Returns -1 when value not found from position for ' + test.name, findFromWith,
                                                                 [test.predicate, 3, test.value1], -1);
        addFindTest('Returns -1 when index equals length for ' + test.name, findFromWith,
                                                                 [test.predicate, test.value1.length, test.value1], -1);
        addFindTest('Returns -1 when index > length for ' + test.name, findFromWith,
                                                              [test.predicate, test.value1.length + 1, test.value1], -1);
        addFindTest('Works correctly for ' + test.name, findFromWith, [test.predicate, 1, test.value1], 2);
        addFindTest('Returns first match for ' + test.name, findFromWith, [test.predicate, 0, test.value2], 1);
        addFindTest('Ignores earlier matches for ' + test.name, findFromWith, [test.predicate, 2, test.value2], 3);
      });


      addEmptyTests(addEmpty);
      addFindPredicateCalledWithEveryNotFoundTest(findFromWith, [1, [1, 2, 3]]);
      addFindPredicateCalledWithEveryNotFoundTest(findFromWith, [2, makeArrayLike(2, 3, 4, 5, 6)]);
      addFindPredicateCalledWithEveryNotFoundTest(findFromWith, [3, 'funkier']);
      addFindPredicateCalledOnlyAsOftenAsNecessaryTest(findFromWith,
                                           [fooIs42, 2, [{foo: 1}, {foo: 6}, {foo: 7}, {foo: 1}, {foo: 42}, {foo: 4}]]);
      addFindPredicateCalledOnlyAsOftenAsNecessaryTest(findFromWith,
                                                  [fooIs42, 1, makeArrayLike({foo: 1}, {foo: 6}, {foo: 42}, {foo: 1})]);
      addFindPredicateCalledOnlyAsOftenAsNecessaryTest(findFromWith, [function(x) {return x < 'a';}, 1, 'abdCde']);


      testCurriedFunction('findFromWith', findFromWith, [alwaysTrue, 1, 'funkier']);
    });


    var occurrencesSpec = {
      name: 'occurrences',
      arity: 2,
      restrictions: [[], ['arraylike']],
      validArguments: [[1], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(occurrencesSpec, array.occurrences, function(occurrences) {
      addReturnsEmptyOnEmptyTests(occurrences, ['z'], true);


      var addEmptyWhenNotFoundTest = function(val, data) {
        var message = isArray(data) ? 'array' : typeof(data) === 'string' ? 'string' : 'arraylike';


        it('Returns empty array when value not found (' + message + ')', function() {
          var result = occurrences(val, data);

          expect(result).to.deep.equal([]);
        });
      };


      addEmptyWhenNotFoundTest(1, [2, 3, 4]);
      addEmptyWhenNotFoundTest(1, makeArrayLike(2, 3, 4));
      addEmptyWhenNotFoundTest('a', 'bcd');


      var addTest = function(message, val, originalData) {
        it('Returns an array ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = occurrences(val, data);

          expect(isArray(result)).to.be.true;
        });


        it('Returned values are valid indices ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = occurrences(val, data).every(function(i) {
            return i >= 0 && i < data.length && data[i] === val;
          });

          expect(result).to.be.true;
        });


        it('No indices missing ' + message, function() {
          var data = splitIfNecessary(originalData.slice());
          var found = occurrences(val, data);
          var result = data.every(function(v, i) {
            if (found.indexOf(i) !== -1) return true;
            return v !== val;
          });

          expect(result).to.be.true;
        });
      };


      addTest('for array (1)', 1, [2, 1, 3]);
      addTest('for array (2)', 1, [2, 1, 1, 3, 1]);
      var obj = {};
      addTest('for array (3)', obj, [{}, {}, {}]);
      addTest('for array (4)', obj, [{}, obj, {}]);
      addTest('for arraylike (1)', 1, makeArrayLike(2, 1, 3, 1, 1));
      addTest('for arraylike (2)', obj, makeArrayLike({}, obj, obj, {}, obj));
      addTest('for string (1)', 'a', 'ban');
      addTest('for string (2)', 'a', 'banana');


      testCurriedFunction('occurrences', occurrences, [1, [1, 2, 3]]);
    });


    var occurrencesWithSpec = {
      name: 'occurrencesWith',
      arity: 2,
      restrictions: [['function: arity 1'], ['arraylike']],
      validArguments: [[alwaysTrue], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(occurrencesWithSpec, array.occurrencesWith, function(occurrencesWith) {
      addReturnsEmptyOnEmptyTests(occurrencesWith, [alwaysTrue], true);


      var addTests = function(message, p, originalData, isNotFound) {
        isNotFound = isNotFound || false;


        it('Returns an array for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = occurrencesWith(p, data);

          expect(isArray(result)).to.be.true;
        });


        if (isNotFound) {
          it('Returns empty array for ' + message, function() {
            var data = sliceIfNecessary(originalData);
            var result = occurrencesWith(base.constant(false), data);

            expect(result).to.deep.equal([]);
          });
        }


        it('Function called for every element for ' + message, function() {
          var args = [];
          var f = function(x) {args.push(x); return p(x);};
          var data = sliceIfNecessary(originalData);
          occurrencesWith(f, data);

          var calledWithEvery = args.every(function(v, i) {
            return v === data[i];
          });

          expect(args.length).to.equal(data.length);
          expect(calledWithEvery).to.be.true;
        });


        it('Returned values are valid indices for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var indicesValid = occurrencesWith(p, data).every(function(i) {
            return i >= 0 && i < data.length && p(data[i]);
          });

          expect(indicesValid).to.be.true;
        });


        it('No indices missing for ' + message, function() {
          var data = splitIfNecessary(originalData.slice());
          var found = occurrencesWith(p, data);

          var noneMissing = data.every(function(v, i) {
            if (found.indexOf(i) !== -1) return true;
            return p(v) === false;
          });

          expect(noneMissing).to.be.true;
        });
      };


      addTests('array when value not found', alwaysFalse, [1, 2, 3]);
      addTests('arraylike when value not found', alwaysFalse, makeArrayLike(2, 3, 4));
      addTests('string when value not found', alwaysFalse, 'funkier');
      addTests('array (1)', base.strictEquals(1), [2, 1, 3]);
      addTests('array (2)', base.strictEquals(1), [2, 1, 1, 3, 1]);
      addTests('array (3)', function(x) {return x.foo = 3;},
              [{foo: 3}, {foo: 42}, {foo: 3}, {foo: 3}, {foo: undefined}]);
      addTests('arraylike (1)', base.strictEquals(2), [2, 1, 3]);
      addTests('arraylike (2)', base.strictEquals(2), [2, 1, 1, 2, 2]);
      addTests('string (1)', base.strictEquals('a'), 'ban');
      addTests('string (2)', function(x) {return x >= '0' && x <= '9';}, 'b01d22e34');


      testCurriedFunction('occurrencesWith', occurrencesWith, [alwaysTrue, [1, 2, 3]]);
    });


    var zipSpec = {
      name: 'zip',
      arity: 2,
      restrictions: [['arraylike'], ['arraylike']],
      validArguments: [[[1, 2], 'abc', makeArrayLike(2, 3, 4)], [[3, 4, 5], 'def', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(zipSpec, array.zip, function(zip) {
      var addDegenerateTests = function(message, left, right) {
        it('Works for ' + message, function() {
          var result = zip(left, right);

          expect(result).to.deep.equal([]);
        });
      };


      var tests = [
        {name: 'array', tests: [{type: 'empty', value: []}, {type: 'normal', value: [1, 2]}]},
        {name: 'arraylike', tests: [{type: 'empty', value: makeArrayLike()},
                                    {type: 'normal', value: makeArrayLike(2, 3, 4)}]},
        {name: 'string', tests: [{type: 'empty', value: ''}, {type: 'normal', value: 'funkier'}]}
      ];


      tests.forEach(function(left) {
        left.tests.forEach(function(leftTest) {
          tests.forEach(function(right) {
            right.tests.forEach(function(rightTest) {
              if (leftTest.type === 'normal' && rightTest.type === 'normal')
                return;

              var message = ['LHS', leftTest.type, left.name, ',', 'RHS', rightTest.type, right.name].join(' ');
              addDegenerateTests(message, leftTest.value, rightTest.value);
            });
          });
        });
      });


      var addTests = function(message, left, right) {
        it('Result is an array for ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zip(l, r);

          expect(isArray(result)).to.be.true;
        });


        it('Result has correct length for ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var expectedLength = Math.min(l.length, r.length);
          var length = zip(l, r).length;

          expect(length).to.equal(expectedLength);
        });


        it('Every element is a pair for ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var allPairs = zip(l, r).every(function(p) {
            return isPair(p);
          });

          expect(allPairs).to.be.true;
        });


        it('First of every element is correct for ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var firstsCorrect = zip(l, r).every(function(p, i) {
            return fst(p) === l[i];
          });

          expect(firstsCorrect).to.be.true;
        });


        it('Second of every element is correct for ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var secondsCorrect = zip(l, r).every(function(p, i) {
            return snd(p) === r[i];
          });

          expect(secondsCorrect).to.be.true;
        });
      };


      var tests = [
        {name: 'array', tests: [{type: 'singleton', value: [3]}, {type: 'normal', value: [1, 2]}]},
        {name: 'arraylike', tests: [{type: 'singleton', value: makeArrayLike(5)},
                                    {type: 'normal', value: makeArrayLike(2, 3, 4)}]},
        {name: 'string', tests: [{type: 'singleton', value: 'a'}, {type: 'normal', value: 'funkier'}]}
      ];


      tests.forEach(function(left) {
        left.tests.forEach(function(leftTest) {
          tests.forEach(function(right) {
            right.tests.forEach(function(rightTest) {
              var message = ['LHS', leftTest.type, left.name, ',', 'RHS', rightTest.type, right.name].join(' ');
              if (left.name === right.name)
                message = ' ' + left.name + ' (' + message + ')';
              else
                message = ' mix (' + message + ')';

              addTests(message, leftTest.value, rightTest.value);
            });
          });
        });
      });


      testCurriedFunction('zip', zip, [[1, 2, 3], [4, 5, 6]]);
    });


    var zipWithSpec = {
      name: 'zipWith',
      arity: 3,
      restrictions: [['function: minarity 2'], ['arraylike'], ['arraylike']],
      validArguments: [[function(x, y) {return x + y;}], [[1, 2], 'abc', makeArrayLike(2, 3, 4)],
                      [[3, 4, 5], 'def', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(zipWithSpec, array.zipWith, function(zipWith) {
      addFuncCalledWithSpecificArityTests(zipWith, 2, [['a', 'b', 'c']]);


      var addDegenerateTests = function(message, left, right) {
        it('Works for ' + message, function() {
          var result = zipWith(function(l, r) {return l;}, left, right);

          expect(result).to.deep.equal([]);
        });
      };


      var tests = [
        {name: 'array', tests: [{type: 'empty', value: []}, {type: 'normal', value: [1, 2]}]},
        {name: 'arraylike', tests: [{type: 'empty', value: makeArrayLike()},
                                    {type: 'normal', value: makeArrayLike(2, 3, 4)}]},
        {name: 'string', tests: [{type: 'empty', value: ''}, {type: 'normal', value: 'funkier'}]}
      ];


      tests.forEach(function(left) {
        left.tests.forEach(function(leftTest) {
          tests.forEach(function(right) {
            right.tests.forEach(function(rightTest) {
              if (leftTest.type === 'normal' && rightTest.type === 'normal')
                return;

              var message = ['LHS', leftTest.type, left.name, ',', 'RHS', rightTest.type, right.name].join(' ');
              addDegenerateTests(message, leftTest.value, rightTest.value);
            });
          });
        });
      });


      var addTests = function(message, f, left, right) {
        it('Result is an array ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zipWith(f, l, r);

          expect(isArray(result)).to.be.true;
        });


        it('Result has correct length ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var expectedLength = Math.min(l.length, r.length);
          var length = zipWith(f, l, r).length;

          expect(length).to.equal(expectedLength);
        });


        it('Every element is correct ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var elementsCorrect = zipWith(f, l, r).every(function(p, i) {
            return p === f(l[i], r[i]);
          });

          expect(elementsCorrect).to.be.true;
        });
      };


      var tests = [
        {name: 'array', tests: [{type: 'singleton', value: [3]}, {type: 'normal', value: [1, 2]}]},
        {name: 'arraylike', tests: [{type: 'singleton', value: makeArrayLike(5)},
                                    {type: 'normal', value: makeArrayLike(2, 3, 4)}]},
        {name: 'string', tests: [{type: 'singleton', value: 'a'}, {type: 'normal', value: 'funkier'}]}
      ];


      var addTwo = function(x, y) {return x + y;};
      tests.forEach(function(left) {
        left.tests.forEach(function(leftTest) {
          tests.forEach(function(right) {
            right.tests.forEach(function(rightTest) {
              var message = ['LHS', leftTest.type, left.name, ',', 'RHS', rightTest.type, right.name].join(' ');
              if (left.name === right.name)
                message = ' ' + left.name + ' (' + message + ')';
              else
                message = ' mix (' + message + ')';

              addTests(message, addTwo, leftTest.value, rightTest.value);
            });
          });
        });
      });


      testCurriedFunction('zipWith', zipWith, [function(x, y) {return x * y;}, [1, 2, 3], [4, 5, 6]]);
    });


    var addCommonNubTests = function(fnUnderTest, message, originalData, otherArgs, expectedLength) {
      it('Length is correct for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var length = fnUnderTest.apply(null, otherArgs.concat([data])).length;

        expect(length).to.equal(expectedLength);
      });


      it('Each value came from original for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var unique = fnUnderTest.apply(null, otherArgs.concat([data]));
        unique = splitIfNecessary(unique);
        var copiedFromSource = unique.every(function(val) {
          return data.indexOf(val) !== -1;
        });

        expect(copiedFromSource).to.be.true;
      });


      it('Ordering maintained from original for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var unique = fnUnderTest.apply(null, otherArgs.concat([data]));
        unique = splitIfNecessary(unique);

        var sameOrder = unique.every(function(val, i) {
          if (i === 0) return true; // vacuously true

          return data.indexOf(unique[i - 1]) < data.indexOf(val);
        });

        expect(sameOrder).to.be.true;
      });
    };


    var nubSpec = {
      name: 'nub',
      arity: 1,
      restrictions: [['arraylike']],
      validArguments: [[[1, 2], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(nubSpec, array.nub, function(nub) {
      addReturnsEmptyOnEmptyTests(nub, []);
      addNoModificationOfOriginalTests(nub, []);
      addReturnsSameTypeTests(nub, []);


      var addTests = function(message, originalData, expectedLength) {
        addCommonNubTests(nub, message, originalData, [], expectedLength);


        it('Each value only occurs once for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var unique = nub(data);
          unique = splitIfNecessary(unique);
          var allUnique = unique.every(function(val) {
            return array.occurrences(val, unique).length === 1;
          });

          expect(allUnique).to.be.true;
        });
      };


      addTests('singleton array', [5], 1);
      addTests('array with no duplicates', [2, 3, 4], 3);
      addTests('array with one duplicate', [2, 3, 2, 4], 3);
      addTests('array with multiple duplicates', [2, 3, 3, 4, 2, 4], 3);
      addTests('singleton arraylike', makeArrayLike(1), 1);
      addTests('arraylike with no duplicates', makeArrayLike(2, 3, 4), 3);
      addTests('arraylike with one duplicate', makeArrayLike(2, 3, 2, 4), 3);
      addTests('arraylike with multiple duplicates', makeArrayLike(2, 3, 2, 3, 4, 4), 3);
      addTests('singleton string', 'a', 1);
      addTests('string with no duplicates', 'abcd', 4);
      addTests('string with one duplicate', 'mozilla', 6);
      addTests('string with multiple duplicates', 'banana', 3);
    });


    describe('uniq', function() {
      it('uniq is a synonym for nub', function() {
        return array.uniq === array.nub;
      });
    });


    var nubWithSpec = {
      name: 'nubWith',
      arity: 2,
      restrictions: [['function: arity 2'], ['arraylike']],
      validArguments: [[function(x, y) {return false;}], [[1, 2, 3], 'abcd', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(nubWithSpec, array.nubWith, function(nubWith) {
      var alwaysFalse = function(x, y) {return false;};


      addReturnsEmptyOnEmptyTests(nubWith, [alwaysFalse]);
      addNoModificationOfOriginalTests(nubWith, [alwaysFalse]);
      addReturnsSameTypeTests(nubWith, [alwaysFalse]);
      addFuncCalledWithSpecificArityTests(nubWith, 2);


      var addTests = function(message, f, originalData, expectedLength) {
        addCommonNubTests(nubWith, message, originalData, [f], expectedLength);


        it('Predicate function called as often as required for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var called = 0;
          var p = function(x, y) {
            called += 1;
            return f(x, y);
          };
          nubWith(p, data);

          expect(called).to.be.at.most(data.length * (data.length - 1) / 2);
        });


        it('Each value only occurs once for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var unique = nubWith(f, data);
          unique = splitIfNecessary(unique);
          var allUnique = unique.every(function(val, i) {
            return unique.every(function(val2, j) {
              if (i === j) return true;

              if (j < i)
                return f(val2, val) === false;

              return f(val, val2) === false;
            });
          });

          expect(allUnique).to.be.true;
        });
      };


      addTests('singleton array', alwaysFalse, [1], 1);
      addTests('array with no duplicates', function(x, y) {return x + y === 4;}, [2, 3, 4], 3);
      addTests('array with one duplicate', function(x, y) {return x + y === 4;}, [2, 3, 2, 4], 3);
      addTests('array with multiple duplicates', function(x, y) {return x.foo === y.foo;},
               [{foo: 1}, {foo: 2}, {foo: 1}, {foo: 3}, {foo: 2}], 3);
      addTests('singleton arraylike', alwaysFalse, makeArrayLike(2), 1);
      addTests('arraylike with no duplicates', function(x, y) {return x + y === 4;}, makeArrayLike(2, 3, 4), 3);
      addTests('arraylike with one duplicate', function(x, y) {return x + y === 4;}, makeArrayLike(2, 3, 2, 4), 3);
      addTests('arraylike with multiple duplicates', function(x, y) {return x.foo === y.foo;},
               makeArrayLike({foo: 1}, {foo: 2}, {foo: 1}, {foo: 3}, {foo: 2}), 3);

      var oneVowel = function(x, y) {return 'aeiou'.indexOf(x) !== -1 && 'aeiou'.indexOf(y) !== -1;};
      addTests('singleton string', oneVowel, 'a', 1);
      addTests('string with no duplicates', oneVowel, 'abcd', 4);
      addTests('string with one duplicate', oneVowel, 'java', 3);
      addTests('string with multiple duplicates', oneVowel, 'funkier', 5);


      testCurriedFunction('nubWith', nubWith, [function(x, y) {return false;}, 'funkier']);
    });


    describe('uniqWith', function() {
      it('uniqWith is a synonym for nubWith', function() {
        return array.uniqWith === array.nubWith;
      });
    });


    var sortSpec = {
      name: 'sort',
      arity: 1,
      restrictions: [['arraylike']],
      validArguments: [[[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(sortSpec, array.sort, function(sort) {
      addReturnsEmptyOnEmptyTests(sort, []);
      addNoModificationOfOriginalTests(sort, []);
      addReturnsSameTypeTests(sort, []);


      var addTests = function(message, originalData) {
        addSameLengthTest(sort, message, [], originalData);


        it('Each value came from original for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var sorted = sort(data);
          sorted = splitIfNecessary(sorted);
          var copiedFromSource = sorted.every(function(val) {
            var ourOccurrences = array.occurrences(val, sorted).length;
            var originalOccurrences = array.occurrences(val, data).length;

            return data.indexOf(val) !== -1 && ourOccurrences === originalOccurrences;
          });

          expect(copiedFromSource).to.be.true;
        });


        it('Ordering correct for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var sorted = sort(data);
          sorted = splitIfNecessary(sorted);
          var isSorted = sorted.every(function(val, i) {
            if (i === 0) return true; // vacuously true

            return sorted[i - 1] <= val;
          });

          expect(isSorted).to.be.true;
        });
      };


      addTests('singleton array', [1]);
      addTests('array with no duplicates', [4, 2, 3]);
      addTests('array with duplicate', [4, 2, 3, 2]);
      addTests('already sorted array', [1, 2, 3]);
      addTests('worst case array', [5, 4, 3, 2, 1]);

      addTests('singleton arraylike', makeArrayLike(1));
      addTests('arraylike with no duplicates', makeArrayLike(5, 7, 1));
      addTests('arraylike with duplicate', makeArrayLike(5, 7, 1, 7, 2));
      addTests('already sorted arraylike', makeArrayLike(1, 2, 3));
      addTests('worst case arraylike', makeArrayLike(5, 4, 3, 2, 1));

      addTests('singleton string', 'a');
      addTests('string with no duplicates', 'debc');
      addTests('string with duplicate', 'dcebc');
      addTests('already sorted string', '0123');
      addTests('worst case string', 'zyxw');
    });


    var sortWithSpec = {
      name: 'sortWith',
      arity: 2,
      restrictions: [['function: arity 2'], ['arraylike']],
      validArguments: [[function(x, y) {return -1;}], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(sortWithSpec, array.sortWith, function(sortWith) {
      var normalCompare = function(x, y) {return x - y;};
      addReturnsEmptyOnEmptyTests(sortWith, [normalCompare]);
      addNoModificationOfOriginalTests(sortWith, [normalCompare]);
      addReturnsSameTypeTests(sortWith, [normalCompare]);
      addFuncCalledWithSpecificArityTests(sortWith, 2);


      var addTests = function(message, f, originalData) {
        addSameLengthTest(sortWith, message, [f], originalData);


        it('Each value came from original for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var sorted = sortWith(f, data);
          sorted = splitIfNecessary(sorted);
          var copiedFromSource = sorted.every(function(val) {
            var ourOccurrences = array.occurrences(val, sorted).length;
            var originalOccurrences = array.occurrences(val, data).length;

            return data.indexOf(val) !== -1 && ourOccurrences === originalOccurrences;
          });

          expect(copiedFromSource).to.be.true;
        });


        it('Ordering correct for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var sorted = sortWith(f, data);
          sorted = splitIfNecessary(sorted);
          var result = sorted.every(function(val, i) {
            if (i === 0) return true; // vacuously true

            return f(sorted[i - 1], val) <= 0;
          });

          expect(result).to.be.true;
        });
      };


      addTests('singleton array', normalCompare, [1]);
      addTests('array with no duplicates', function(x, y) {return x.foo - y.foo;},
                [{foo: 1}, {foo: 3}, {foo: 2}]);
      addTests('array with duplicate', function(x, y) {return x.foo - y.foo;},
                [{foo: 1}, {foo: 3}, {foo: 1}, {foo: 3}]);
      addTests('already sorted array', function(x, y) {return x.foo - y.foo;},
                [{foo: 1}, {foo: 2}, {foo: 3}]);
      addTests('worst case',  function(x, y) {return x.foo - y.foo;},
                [{foo: 3}, {foo: 2}, {foo: 1}]);

      addTests('singleton arraylike', normalCompare, makeArrayLike(1));
      addTests('arraylike with no duplicates', function(x, y) {return x.foo - y.foo;},
                makeArrayLike({foo: 1}, {foo: 3}, {foo: 2}));
      addTests('arraylike with duplicate', function(x, y) {return x.foo - y.foo;},
                makeArrayLike({foo: 1}, {foo: 3}, {foo: 1}, {foo: 3}));
      addTests('already sorted arraylike', function(x, y) {return x.foo - y.foo;},
                makeArrayLike({foo: 1}, {foo: 2}, {foo: 3}));
      addTests('worst case',  function(x, y) {return x.foo - y.foo;},
                makeArrayLike({foo: 3}, {foo: 2}, {foo: 1}));

      var stringSort = function(x, y) {
        return x.toUpperCase() < y.toUpperCase() ? -1 : x.toUpperCase() === y.toUpperCase() ? 0 : 1;
      };
      addTests('singleton string', stringSort, 'a');
      addTests('string with no duplicates', stringSort, 'debc');
      addTests('string with duplicate', stringSort, 'dcebc');
      addTests('already sorted string', stringSort, '0123');
      addTests('worst case', stringSort, 'zyxw');


      testCurriedFunction('sortWith', sortWith, [normalCompare, [1, 2, 3]]);
    });


    var unzipSpec = {
      name: 'unzip',
      arity: 1,
      restrictions: [['strictarraylike']],
      validArguments: [[[Pair(1, 2)], makeArrayLike(Pair(2, 3), Pair(4, 5))]]
    };


    describeFunction(unzipSpec, array.unzip, function(unzip) {
      var addThrowsWhenNotPairTest = function(bogus, message) {
        it('Throws if any element is not a Pair ' + message, function() {
          var fn = function() {
            unzip(bogus);
          };

          expect(fn).to.throw(TypeError);
        });
      };


      addThrowsWhenNotPairTest('(1)', ['a', Pair(1, 2), Pair(3, 4)]);
      addThrowsWhenNotPairTest('(2)', [Pair(1, 2), Pair(5, 6), 1, Pair(3, 4)]);
      addThrowsWhenNotPairTest('(3)', [Pair(1, 2), Pair(5, 6), Pair(3, 4), []]);
      addThrowsWhenNotPairTest('(4)', makeArrayLike('a', Pair(1, 2), Pair(3, 4)));


      var addDegenerateTest = function(message, data) {
        it('Works for degenerate ' + message + ' case', function() {
          var result = unzip(data);

          expect(isPair(result)).to.be.true;
          expect(fst(result)).to.deep.equal([]);
          expect(snd(result)).to.deep.equal([]);
        });
      };


      addDegenerateTest('array', []);
      addDegenerateTest('arraylike', makeArrayLike());


      var addTests = function(message, originalData) {
        it('Returns a pair for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = unzip(data);

          expect(isPair(result)).to.be.true;
        });


        it('First element is an array for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var firstIsArray = isArray(fst(unzip(data)));

          expect(firstIsArray).to.be.true;
        });


        it('Second element is an array for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var secondIsArray = isArray(snd(unzip(data)));

          expect(secondIsArray).to.be.true;
        });


        it('First element has correct length for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var length = fst(unzip(data)).length;

          expect(length).to.equal(data.length);
        });


        it('Second element has correct length for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var length = snd(unzip(data)).length;

          expect(length).to.equal(data.length);
        });


        it('Doesn\'t affect the original ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var originalUnaffected = unzip(data) !== data;

          expect(originalUnaffected).to.be.true;
        });


        it('First element correct for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var firstCorrect = fst(unzip(data)).every(function(val, i) {
            return fst(data[i]) === val;
          });

          expect(firstCorrect).to.be.true;
        });


        it('Second element correct for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var secondCorrect = snd(unzip(data)).every(function(val, i) {
            return snd(data[i]) === val;
          });

          expect(secondCorrect).to.be.true;
        });
      };


      addTests('singleton array', [Pair(1, 2)]);
      addTests('normal array', [Pair('a', true), Pair(3, null), Pair(1, 2), Pair({}, {})]);
      addTests('singleton arraylike', makeArrayLike(Pair(1, 2)));
      addTests('normal arraylike', makeArrayLike(Pair('a', true), Pair(3, null), Pair(1, 2), Pair({}, {})));
    });


    var insertSpec = {
      name: 'insert',
      arity: 3,
      restrictions: [['positive'], [], ['arraylike']],
      validArguments: [[0], ['1'], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(insertSpec, array.insert, function(insert) {
      addNoModificationOfOriginalTests(insert, [0, 'a']);
      addReturnsSameTypeTests(insert, [0, 'a']);


      var addIndexTest = function(message, index, val, originalData, dontThrow) {
        dontThrow = dontThrow || false;


        it((!dontThrow ? 'Does not throw' : 'Throws') + ' when ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var fn = function() {
            insert(index, val, data);
          };

          if (dontThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);
        });
      };


      addIndexTest('index > length (array)', 4, 1, [1, 2]);
      addIndexTest('index > length (arraylike)', 5, 1, makeArrayLike(2, 3, 4));
      addIndexTest('index > length (string)', 10, 'a', 'bcde');
      addIndexTest('index === length (array)', 2, 1, [1, 2], true);
      addIndexTest('index === length (arraylike)', 2, 1, makeArrayLike(2, 3), true);
      addIndexTest('index === length (string)', 4, 'a', 'bcde', true);


      var addTests = function(message, index, val, originalData) {
        addSameLengthTest(insert, 'Returned value is the correct length ' + message, [index, val], originalData, 1);


        it('Returned value has correct elements ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var newVal = insert(index, val, data);
          newVal = splitIfNecessary(newVal);
          var elementsCorrect = newVal.every(function(v, i) {
            if (i < index)
              return v === data[i];

            if (i === index)
              return v === val;

            return v === data[i - 1];
          });

          expect(elementsCorrect).to.be.true;
        });
      };


      addTests('for array', 1, 4, [1, 2, 3]);
      addTests('for arraylike', 1, 4, makeArrayLike(1, 2, 3));
      addTests('for string', 1, 'd', 'abc');
      addTests('for array when index === length', 3, 4, [1, 2, 3]);
      addTests('for arraylike when index === length', 3, 4, makeArrayLike(1, 2, 3));
      addTests('for string when index === length', 3, 'd', 'abc');
      addTests('for array when index === 0', 0, 4, [1, 2, 3]);
      addTests('for arraylike when index === 0', 0, 4, makeArrayLike(1, 2, 3));
      addTests('for string when index === 0', 0, 'd', 'abc');
      addTests('for empty array when index === 0', 0, 1, []);
      addTests('for empty arraylike when index === 0', 0, 1, makeArrayLike());
      addTests('for empty string when index === 0', 0, 'a', '');


      it('toString called when inserting non-string in string', function() {
        var obj = {toString: function() {return 'funk';}};
        var result = insert(0, obj, 'ier');

        expect(result).to.equal('funkier');
      });


      testCurriedFunction('insert', insert, [0, 'a', [1, 2, 3]]);
    });


    // remove and replace both throw when index >= length
    var addCommonRemoveReplaceTests = function(fnUnderTest, argsBetween) {
      argsBetween = argsBetween || [];


      var addTest = function(message, index, originalData) {
        it('Throws if index >= length ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var args = [index].concat(argsBetween).concat([data]);
          var fn = function() {
            fnUnderTest.apply(null, args);
          };

          expect(fn).to.throw(TypeError);
        });
      };


      addTest('for array (1)', 4, [1, 2, 3]);
      addTest('for array (2)', 3, [2, 3, 4]);
      addTest('for arraylike (1)', 4, makeArrayLike(2, 3, 4));
      addTest('for arraylike (2)', 3, makeArrayLike(3, 4, 5));
      addTest('for string (1)', 4, 'abc');
      addTest('for string (2)', 3, 'bcd');
    };


    var removeSpec = {
      name: 'remove',
      arity: 2,
      restrictions: [['positive'], ['arraylike']],
      validArguments: [[0], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(removeSpec, array.remove, function(remove) {
      addNoModificationOfOriginalTests(remove, [0]);
      addReturnsSameTypeTests(remove, [0]);
      addCommonRemoveReplaceTests(remove);


      var addTests = function(message, index, originalData) {
        addSameLengthTest(remove, 'Returned value is the correct length for ' + message, [index], originalData, -1);


        it('Returned value has correct elements for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var newVal = remove(index, data);
          newVal = splitIfNecessary(newVal);
          var elementsCorrect = newVal.every(function(v, i) {
            if (i < index)
              return v === data[i];

            return v === data[i + 1];
          });

          expect(elementsCorrect).to.be.true;
        });
      };


      addTests('array', 1, [1, 2, 3]);
      addTests('arraylike', 1, makeArrayLike(1, 2, 3));
      addTests('string', 1, 'abc');
      addTests('array when index === length - 1', 2, [1, 2, 3]);
      addTests('arraylike when index === length - 1', 1, makeArrayLike(2, 3));
      addTests('string when index === length - 1', 2, 'abc');
      addTests('array when index === 0', 0, [1, 2, 3]);
      addTests('arraylike when index === 0', 0, makeArrayLike(3, 4));
      addTests('string when index === 0', 0, 'abc');
      addTests('singleton array when index === 0', 0, [1]);
      addTests('singleton arraylike when index === 0', 0, makeArrayLike(2));
      addTests('singleton string when index === 0', 0, 'a');


      testCurriedFunction('remove', remove, [0, [1, 2, 3]]);
    });


    var replaceSpec = {
      name: 'replace',
      arity: 3,
      restrictions: [['positive'], [], ['arraylike']],
      validArguments: [[0], ['a'], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(replaceSpec, array.replace, function(replace) {
      addNoModificationOfOriginalTests(replace, [0, 'a']);
      addReturnsSameTypeTests(replace, [0, 'a']);
      addCommonRemoveReplaceTests(replace, [1]);


      var addTests = function(message, index, val, originalData) {
        addSameLengthTest(replace, message, [index, val], originalData);


        it('Returned value has correct elements for ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var newVal = replace(index, val, data);
          newVal = splitIfNecessary(newVal);
          var elementsCorrect = newVal.every(function(v, i) {
            if (i !== index)
              return v === data[i];

            return v === val;
          });

          expect(elementsCorrect).to.be.true;
        });
      };


      addTests('array', 1, 0, [1, 2, 3]);
      addTests('arraylike', 1, 0, makeArrayLike(2, 3, 4, 5));
      addTests('string', 1, 'd', 'abc');
      addTests('array when index === length - 1', 2, 0, [1, 2, 3]);
      addTests('arraylike when index === length - 1', 3, 0, makeArrayLike(2, 3, 4, 5));
      addTests('string when index === length - 1', 2, 'd', 'abc');
      addTests('array when index === 0', 0, 0, [1, 2, 3]);
      addTests('arraylike when index === 0', 0, 0, makeArrayLike(2, 3));
      addTests('string when index === 0', 0, 'd', 'abc');
      addTests('singleton array when index === 0', 0, 0, [1]);
      addTests('singleton arraylike when index === 0', 0, 0, makeArrayLike(2));
      addTests('singleton string when index === 0', 0, 'd', 'a');


      it('toString called when replacement is non-string for string', function() {
        var obj = {toString: function() {return 'funk';}};
        var result = replace(0, obj, 'bier');

        expect(result).to.equal('funkier');
      });


      testCurriedFunction('replace', replace, [0, 0, [1, 2, 3]]);
    });


    var addCommonRemoveNotFoundTests = function(message, fnUnderTest, val, originalData) {
      addSameLengthTest(fnUnderTest, message, [val], originalData);


      it('Returned value has correct elements for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var newVal = fnUnderTest(val, data);
        var elementsCorrect = newVal.every(function(v, i) {
          return v === data[i];
        });

        expect(elementsCorrect).to.be.true;
      });
    };


    var addCommonRemoveValTests = function(testAdder, fnUnderTest) {
      testAdder('array', 2, [1, 2, 3]);
      testAdder('array when value matches last entry', 3, [1, 2, 3]);
      testAdder('array when value matches first entry', 1, [1, 2, 3]);
      testAdder('singleton array when value matches', 1, [1]);
      testAdder('array with multiple matches', 1, [1, 2, 3, 1]);

      testAdder('arraylike', 2, makeArrayLike(1, 2, 3));
      testAdder('arraylike when value matches last entry', 3, makeArrayLike(1, 2, 3));
      testAdder('arraylike when value matches first entry', 1, makeArrayLike(1, 2, 3));
      testAdder('singleton arraylike when value matches', 1, makeArrayLike(1));
      testAdder('arraylike with multiple matches', 1, makeArrayLike(1, 2, 3, 1));

      addCommonRemoveNotFoundTests('array when value not found', fnUnderTest, 4, [1, 2, 3]);
      var obj = {foo: 42};
      addCommonRemoveNotFoundTests('array when value not strictly equal', fnUnderTest, obj,
                                    [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('array when value strictly equal', obj, [{foo: 1}, obj, {foo: 3}]);

      addCommonRemoveNotFoundTests('arraylike when value not found', fnUnderTest, 4, makeArrayLike(1, 2, 3));
      var obj = {foo: 42};
      addCommonRemoveNotFoundTests('arraylike when value not strictly equal', fnUnderTest, obj,
                                   makeArrayLike({foo: 1}, {foo: 42}, {foo: 3}));
      testAdder('arraylike when value strictly equal', obj, makeArrayLike({foo: 1}, obj, {foo: 3}));
    };


    var addCommonRemoveWithTests = function(testAdder, fnUnderTest) {
      testAdder('array', fooIs42, [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('array when value matches last entry', function(x) {return x >= 3;}, [1, 2, 3]);
      testAdder('array when value matches first entry', function(x) {return x < 2;}, [1, 2, 3]);
      testAdder('singleton array when value matches', base.equals(1), [1]);
      testAdder('array with multiple matches', function(x) {return x < 10;}, [1, 2, 3, 1]);

      testAdder('arraylike', fooIs42, makeArrayLike({foo: 1}, {foo: 42}, {foo: 3}));
      testAdder('arraylike when value matches last entry', function(x) {return x >= 3;}, makeArrayLike(1, 2, 3));
      testAdder('arraylike when value matches first entry', function(x) {return x < 2;}, makeArrayLike(1, 2, 3));
      testAdder('singleton arraylike when value matches', base.equals(1), makeArrayLike(1));
      testAdder('arraylike with multiple matches', function(x) {return x < 10;}, makeArrayLike(1, 2, 3, 1));

      addCommonRemoveNotFoundTests('array when value not found', fnUnderTest,
                             function(x) {return x.foo === 4;}, [{foo: 1}, {foo: 42}, {foo: 3}]);
      addCommonRemoveNotFoundTests('arraylike when value not found', fnUnderTest,
                             function(x) {return x.foo === 4;}, makeArrayLike({foo: 1}, {foo: 42}, {foo: 3}));
    };


    var addCommonRemoveOneTests = function(fnUnderTest, message, val, originalData, isWith) {
      addSameLengthTest(fnUnderTest, 'Returned value is the correct length for ' + message, [val], originalData, -1);
      isWith = isWith || false;
      var occurrencesFn = isWith ? array.occurrencesWith : array.occurrences;


      it('Returned value has correct elements for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var newVal = fnUnderTest(val, data);

        var f = isWith ? val : function(x) {return x === val;};
        var deletionFound = false;
        var elementsCorrect = newVal.every(function(v, i) {
          if (deletionFound || f(data[i])) {
            deletionFound = true;
            return v === data[i + 1];
          }

          return v === data[i];
        });

        expect(elementsCorrect).to.be.true;
      });


      // Any errors that would be caught by the next two tests should be caught by the previous test, however I prefer
      // these behavious to be explicit
      it('Returned value has one less occurrence of value for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var originalCount = occurrencesFn(val, data).length;
        var newVal = fnUnderTest(val, data);
        var newCount = occurrencesFn(val, newVal).length;

        expect(newCount).to.equal(originalCount - 1);
      });


      it('Removes first occurrence of value for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var originalOcc = occurrencesFn(val, data);
        var newVal = fnUnderTest(val, data);
        var newOcc = occurrencesFn(val, newVal);

        if (originalOcc.length === 1)
          expect(newOcc).to.deep.equal([]);
        else
          expect(newOcc[0]).to.equal(originalOcc[1] - 1);
      });
    };


    var removeOneSpec = {
      name: 'removeOne',
      arity: 2,
      restrictions: [[], ['strictarraylike']],
      validArguments: [[2], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(removeOneSpec, array.removeOne, function(removeOne) {
      addNoModificationOfOriginalTests(removeOne, [0]);
      addReturnsSameTypeTests(removeOne, [0], true);


      var addTests = function(message, val, originalData) {
        addCommonRemoveOneTests(removeOne, message, val, originalData);
      };
      addCommonRemoveValTests(addTests, removeOne);


      testCurriedFunction('removeOne', removeOne, [0, [1, 2, 3]]);
    });


    var removeOneWithSpec = {
      name: 'removeOneWith',
      arity: 2,
      restrictions: [['function: arity 1'], ['strictarraylike']],
      validArguments: [[alwaysTrue], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(removeOneWithSpec, array.removeOneWith, function(removeOneWith) {
      addNoModificationOfOriginalTests(removeOneWith, [alwaysTrue]);
      addReturnsSameTypeTests(removeOneWith, [alwaysTrue], true);
      addFuncCalledWithSpecificArityTests(removeOneWith, 1, [], true);


      var addTests = function(message, f, originalData) {
        addCommonRemoveOneTests(removeOneWith, message, f, originalData, true);
      };
      addCommonRemoveWithTests(addTests, removeOneWith);


      testCurriedFunction('removeOneWith', removeOneWith, [base.constant(true), [1, 2, 3]]);
    });


    var addCommonRemoveAllTests = function(fnUnderTest, message, val, originalData, isWith) {
      isWith = isWith || false;
      var occurrencesFn = isWith ? array.occurrencesWith : array.occurrences;


      it('Returned value is the correct length for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var occurrences = occurrencesFn(val, data);
        var length = fnUnderTest(val, data).length;

        expect(length).to.equal(data.length - occurrences.length);
      });


      it('Returned value has correct elements for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var newVal = fnUnderTest(val, data);

        var f = isWith ? val : function(x) {return x === val;};
        var offset = 0;
        var elementsCorrect = newVal.every(function(v, i) {
          while (f(data[i + offset]))
             offset += 1;

          return data[i + offset] === v;
        });

        expect(elementsCorrect).to.be.true;
      });


      // Any errors that would be caught by the next two tests should be caught by the previous test, however I prefer
      // these behavious to be explicit
      it('Returned value has no occurrences of value for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var newVal = fnUnderTest(val, data);
        var newCount = occurrencesFn(val, newVal).length;

        expect(newCount).to.equal(0);
      });
    };


    var removeAllSpec = {
      name: 'removeAll',
      arity: 2,
      restrictions: [[], ['strictarraylike']],
      validArguments: [[2], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(removeAllSpec, array.removeAll, function(removeAll) {
      addNoModificationOfOriginalTests(removeAll, [0]);
      addReturnsSameTypeTests(removeAll, [0], true);


      var addTests = function(message, val, originalData) {
        addCommonRemoveAllTests(removeAll, message, val, originalData);
      };


      addCommonRemoveValTests(addTests, removeAll);
      addTests('array with all matches', 1, [1, 1, 1, 1]);
      addTests('arraylike with all matches', 1, makeArrayLike(1, 1, 1, 1));


      testCurriedFunction('removeAll', removeAll, [0, [1, 2, 3]]);
    });


    var removeAllWithSpec = {
      name: 'removeAllWith',
      arity: 2,
      restrictions: [['function: arity 1'], ['strictarraylike']],
      validArguments: [[alwaysTrue], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(removeAllWithSpec, array.removeAllWith, function(removeAllWith) {
      addNoModificationOfOriginalTests(removeAllWith, [alwaysTrue]);
      addReturnsSameTypeTests(removeAllWith, [alwaysTrue], true);
      addFuncCalledWithSpecificArityTests(removeAllWith, 1, [], true);


      var addTests = function(message, f, originalData) {
        addCommonRemoveAllTests(removeAllWith, message, f, originalData, true);
      };


      addCommonRemoveWithTests(addTests, removeAllWith);
      addTests('array where every value matches', base.constant(true), [1, 2, 3, 4]);
      addTests('arraylike where every value matches', base.constant(true), makeArrayLike(1, 2, 3, 4));


      testCurriedFunction('removeAllWith', removeAllWith, [base.constant(true), [1, 2, 3]]);
    });


    var addCommonReplaceNotFoundTests = function(message, fnUnderTest, val, newVal, originalData) {
      addSameLengthTest(fnUnderTest, message, [val, newVal], originalData);


      it('Returned value has correct elements for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var replaced = fnUnderTest(val, newVal, data);

        // Can't use chai's deepEqual: it won't be true for arraylike
        var allCorrect = replaced.every(function(v, i) {
          return v === data[i];
        });

        expect(allCorrect).to.be.true;
      });
    };


    var addCommonReplaceValTests = function(testAdder, fnUnderTest) {
      testAdder('array', 2, 4, [1, 2, 3]);
      testAdder('array with multiple matches', 1, 4, [1, 2, 3, 1]);
      testAdder('arraylike', 2, 4, makeArrayLike(1, 2, 3));
      testAdder('arraylike with multiple matches', 1, 4, makeArrayLike(1, 2, 3, 1));

      addCommonReplaceNotFoundTests('array when value not found', fnUnderTest, 4, 5, [1, 2, 3]);
      var obj = {foo: 42};
      addCommonReplaceNotFoundTests('array when value not strictly equal', fnUnderTest, obj, {foo: 52},
                       [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('array when value strictly equal', obj, {foo: 62}, [{foo: 1}, obj, {foo: 3}]);

      addCommonReplaceNotFoundTests('arraylike when value not found', fnUnderTest, 4, 5, makeArrayLike(1, 2, 3));
      var obj = {foo: 42};
      addCommonReplaceNotFoundTests('arraylike when value not strictly equal', fnUnderTest, obj, {foo: 52},
                       makeArrayLike({foo: 1}, {foo: 42}, {foo: 3}));
      testAdder('arraylike when value strictly equal', obj, {foo: 62}, makeArrayLike({foo: 1}, obj, {foo: 3}));
    };


    var addCommonReplaceWithTests = function(testAdder, fnUnderTest) {
      testAdder('array', fooIs42, {foo: 52}, [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('array with multiple matches', function(x) {return x < 10;}, 11, [1, 2, 3, 1]);

      testAdder('arraylike', fooIs42, {foo: 52}, makeArrayLike({foo: 1}, {foo: 42}, {foo: 3}));
      testAdder('arraylike with multiple matches', function(x) {return x < 10;}, 11, makeArrayLike(1, 2, 3, 1));

      addCommonReplaceNotFoundTests('array when value not found', fnUnderTest,
                             function(x) {return x.foo === 4;}, {foo: 52}, [{foo: 1}, {foo: 42}, {foo: 3}]);
      addCommonReplaceNotFoundTests('arraylike when value not found', fnUnderTest,
                             function(x) {return x.foo === 4;}, {foo: 52}, makeArrayLike({foo: 1}, {foo: 42}));
    };


    var addCommonReplaceOneTests = function(fnUnderTest, message, val, newVal, originalData, isWith) {
      isWith = isWith || false;
      var occurrencesFn = isWith ? array.occurrencesWith : array.occurrences;
      addSameLengthTest(fnUnderTest, message, [val, newVal], originalData);


      it('Returned value has correct elements for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var replaced = fnUnderTest(val, newVal, data);

        var found = false;
        var f = isWith ? val : function(x) {return x === val;};
        var elementsCorrect = replaced.every(function(v, i) {
          if (!found && f(data[i])) {
            found = true;
            return v === newVal;
          }

          return v === data[i];
        });

        expect(elementsCorrect).to.be.true;
      });


      // Any errors that would be caught by the next two tests should be caught by the previous test, however I prefer
      // these behavious to be explicit
      it('Returned value has one less occurrence of old value for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var originalCount = occurrencesFn(val, data).length;
        var replaced = fnUnderTest(val, newVal, data);
        var newCount = occurrencesFn(val, replaced).length;

        expect(newCount).to.equal(originalCount - 1);
      });


      it('Replaces first occurrence of value with new for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var originalOcc = occurrencesFn(val, data);
        var replaced = fnUnderTest(val, newVal, data);
        var newSearch = isWith ? base.strictEquals(newVal) : newVal;
        var newOcc = occurrencesFn(newSearch, replaced);

        expect(newOcc[0]).to.equal(originalOcc[0]);
      });
    };


    var replaceOneSpec = {
      name: 'replaceOne',
      arity: 3,
      restrictions: [[], [], ['strictarraylike']],
      validArguments: [[2], [4], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(replaceOneSpec, array.replaceOne, function(replaceOne) {
      addNoModificationOfOriginalTests(replaceOne, [0, 1]);
      addReturnsSameTypeTests(replaceOne, [0, 1], true);


      var addTests = function(message, val, newVal, originalData) {
        addCommonReplaceOneTests(replaceOne, message, val, newVal, originalData);
      };
      addCommonReplaceValTests(addTests, replaceOne);


      testCurriedFunction('replaceOne', replaceOne, [0, 1, [1, 2, 3]]);
    });


    var replaceOneWithSpec = {
      name: 'replaceOneWith',
      arity: 3,
      restrictions: [['function: arity 1'], [], ['strictarraylike']],
      validArguments: [[alwaysTrue], [1], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(replaceOneWithSpec, array.replaceOneWith, function(replaceOneWith) {
      addNoModificationOfOriginalTests(replaceOneWith, [alwaysTrue, 1]);
      addReturnsSameTypeTests(replaceOneWith, [alwaysTrue, 'a'], true);
      addFuncCalledWithSpecificArityTests(replaceOneWith, 1, ['a'], true);


      var addTests = function(message, f, newVal, originalData) {
        addCommonReplaceOneTests(replaceOneWith, message, f, newVal, originalData, true);
      };
      addCommonReplaceWithTests(addTests, replaceOneWith);


      testCurriedFunction('replaceOneWith', replaceOneWith, [base.constant(true), 4, [1, 2, 3]]);
    });


    var addCommonReplaceAllTests = function(fnUnderTest, message, val, newVal, originalData, isWith) {
      isWith = isWith || false;
      var occurrencesFn = isWith ? array.occurrencesWith : array.occurrences;
      addSameLengthTest(fnUnderTest, message, [val, newVal], originalData);


      it('Returned value has correct elements for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var replaced = fnUnderTest(val, newVal, data);

        var f = isWith ? val : function(x) {return x === val;};
        var elementsCorrect = replaced.every(function(v, i) {
          if (f(data[i]))
             return v === newVal;

          return data[i] === v;
        });

        expect(elementsCorrect).to.be.true;
      });


      // Any errors that would be caught by the next two tests should be caught by the previous test, however I prefer
      // these behavious to be explicit
      it('Returned value has no occurrences of value for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var replaced = fnUnderTest(val, newVal, data);
        var newCount = occurrencesFn(val, replaced).length;

        expect(newCount).to.equal(0);
      });


      it('Replaces all occurrences of value for ' + message, function() {
        var data = sliceIfNecessary(originalData);
        var originalOcc = occurrencesFn(val, data);
        var replaced = fnUnderTest(val, newVal, data);
        var newSearch = isWith ? base.strictEquals(newVal) : newVal;
        var newOcc = occurrencesFn(newSearch, replaced);
        var result = newOcc.every(function(idx, i) {
          return idx === originalOcc[i];
        });

        expect(result).to.be.true;
      });
    };


    var replaceAllSpec = {
      name: 'replaceAll',
      arity: 3,
      restrictions: [[], [], ['strictarraylike']],
      validArguments: [[2], [4], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(replaceAllSpec, array.replaceAll, function(replaceAll) {
      addNoModificationOfOriginalTests(replaceAll, [0, 1]);
      addReturnsSameTypeTests(replaceAll, [0, 1], true);


      var addTests = function(message, val, newVal, originalData) {
        addCommonReplaceAllTests(replaceAll, message, val, newVal, originalData);
      };
      addCommonReplaceValTests(addTests, replaceAll);


      testCurriedFunction('replaceAll', replaceAll, [0, 1, [1, 2, 3]]);
    });


    var replaceAllWithSpec = {
      name: 'replaceAllWith',
      arity: 3,
      restrictions: [['function: arity 1'], [], ['strictarraylike']],
      validArguments: [[alwaysTrue], ['e'], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(replaceAllWithSpec, array.replaceAllWith, function(replaceAllWith) {
      addNoModificationOfOriginalTests(replaceAllWith, [alwaysTrue, 'e']);
      addReturnsSameTypeTests(replaceAllWith, [alwaysTrue, 'e'], true);
      addFuncCalledWithSpecificArityTests(replaceAllWith, 1, ['e'], true);


      var addTests = function(message, f, newVal, originalData) {
        addCommonReplaceAllTests(replaceAllWith, message, f, newVal, originalData, true);
      };
      addCommonReplaceWithTests(addTests, replaceAllWith);

      var lessThanFive = function(x) {return x < 5;};
      addTests('array where every value matches', lessThanFive, 5, [1, 2, 3, 4]);
      addTests('arraylike where every value matches', lessThanFive, 5, makeArrayLike(1, 2, 3, 4));


      testCurriedFunction('replaceAllWith', replaceAllWith, [base.constant(true), 4, [1, 2, 3]]);
    });


    var joinSpec = {
      name: 'join',
      arity: 2,
      restrictions: [[], ['strictarraylike']],
      validArguments: [[' '], [[1, 2, 3], makeArrayLike(2, 3, 4)]]
    };


    describeFunction(joinSpec, array.join, function(join) {
      it('Works correctly for empty array', function() {
        expect(join('-', [])).to.equal('');
      });


      it('Works correctly for empty arraylike', function() {
        expect(join('-', makeArrayLike())).to.equal('');
      });


      it('Works correctly for singleton array', function() {
        var arr = [1];

        expect(join('-', arr)).to.equal(arr[0].toString());
      });


      it('Works correctly for singleton arraylike', function() {
        var arr = makeArrayLike(2);

        expect(join('-', arr)).to.equal(arr[0].toString());
      });


      var addTests = function(message, str, originalData) {
        it('Returns a string ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = join(str, data);

          expect(result).to.be.a('string');
        });


        it('Returned value is correct ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var joined = join(str, data);
          var s = str.toString();
          var l = s.length;
          var offset = 0;

          var result = data.every(function(val, i) {
            var valString = val.toString();

            if (joined.slice(offset, offset + valString.length) !== valString)
              return false;

            if (i === data.length - 1)
              return true;

            offset += valString.length;
            if (joined.slice(offset, offset + l) !== s)
              return false;

            offset += l;
            return true;
          });

          expect(result).to.be.true;
        });
      };


      addTests('in normal case (array)', ':', ['a', 'b', 'c']);
      addTests('when array values are not strings', '_', [1, 2, 3]);
      addTests('when join value is not a string (array)', {toString: function() {return '-';}}, [1, 2, 3]);
      addTests('in normal case (arraylike)', ':', makeArrayLike('a', 'b', 'c'));
      addTests('when arraylike values are not strings', '_', makeArrayLike(true, false, 1));
      addTests('when join value is not a string (arraylike)', {toString: function() {return '-';}}, makeArrayLike(1, 2, 3));


      testCurriedFunction('join', join, [', ', [4, 5, 6]]);
    });


    var flattenSpec = {
      name: 'flatten',
      arity: 1,
      restrictions: [['strictarraylike']],
      validArguments: [[[[1, 2], [3, 4]], makeArrayLike([1, 2], [3, 4])]]
    };


    describeFunction(flattenSpec, array.flatten, function(flatten) {
      var notArray = [3, true, undefined, null, {}, function() {}];


      notArray.forEach(function(val, i) {
        var testBogus = function(type, arr, j) {
          it('Throws if any element not an ' + type + ' (' + (3 * i + j + 1) + ')', function() {
            var fn = function() {
              flatten(arr);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var bogusArr = [[val, [1, 2], [3, 4]],
                        [[1, 2], val, [3, 4]],
                        [[1, 2], [3, 4], val]];
        var bogusArrLike = [makeArrayLike(val, [1, 2], [3, 4]),
                            makeArrayLike([1, 2], val, [3, 4]),
                            makeArrayLike([1, 2], [3, 4], val)];
        bogusArr.forEach(testBogus.bind(null, 'array'));
        bogusArr.forEach(testBogus.bind(null, 'arraylike'));
      });


      it('Returns empty array when supplied empty array', function() {
        expect(flatten([])).to.deep.equal([]);
      });


      it('Returns empty array when supplied empty arraylike', function() {
        expect(flatten(makeArrayLike())).to.deep.equal([]);
      });


      var addTests = function(message, originalData) {
        it('Result is an array ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var result = flatten(data);
            
          expect(isArray(result)).to.be.true;
        });


        it('Result has correct length ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var expected = array.sum(array.map(array.length, data.slice()));
          var flattened = flatten(data);

          expect(flattened.length).to.equal(expected);
        });


        it('Result has correct contents ' + message, function() {
          var data = sliceIfNecessary(originalData);
          var flattened = flatten(data);
          var offset = 0;

          var result = data.every(function(val) {
            val = splitIfNecessary(val);
            var result = val.every(function(val2, j) {
              return flattened[offset + j] === val2;
            });

            offset += val.length;
            return result;
          });
        });
      };


      addTests('for normal case (array)', [[1, 2], [3, 4], [5, 6]]);
      addTests('for singleton (array)', [[1]]);
      addTests('when some values are strings for array', [[1, 2], 'abc', 'funkier', [5, 6]]);
      addTests('when all values are strings for array', ['funkierJS', 'is', 'the', 'best']);
      addTests('when some values are arraylikes', [[1, 2], makeArrayLike(3, 4), makeArrayLike(5, 6), [7, 8]]);
      addTests('when all values are arraylikes', [makeArrayLike(1, 2), makeArrayLike(3, 4, 5)]);
      addTests('for normal case (arraylike)', makeArrayLike(makeArrayLike(1, 2), makeArrayLike(3, 4)));

      // We can't make the singleton "arraylike" in the normal fashion, as our makeArrayLike utility returns a copy if passed a single
      // arraylike
      var arrayLikeSingleton = {'0': makeArrayLike(1), 'length': 1, slice: function() {return makeArrayLike(this);},
                                every: function(p) {return [].every.call(this, p);}};
      addTests('for singleton (arraylike)', arrayLikeSingleton);
      addTests('when some values are strings for arraylike', makeArrayLike(makeArrayLike(1, 2), 'abc', 'funkier'));
      addTests('when all values are strings for arraylike', makeArrayLike('funkierJS', 'is', 'the', 'best'));
      addTests('when some values are arrays', makeArrayLike([1, 2], makeArrayLike(3, 4), makeArrayLike(5, 6), [7, 8]));
      addTests('when all values are arrays', makeArrayLike([1, 2], [3, 4], [5, 6, 7]));


      var addOnlyRemovesOneLayerTest = function(message, data) {
        it('Only removes one layer for ' + message, function() {
          var flattened = flatten(data);
          var result = flattened.every(function(val, i) {
            var sameType = isArray(val) === isArray(data[0][0]) && typeof(val) === typeof(data[0][0]);
            return sameType && val === data[Math.floor(i / 2)][i % 2];
          });

          expect(result).to.be.true;
        });
      };


      addOnlyRemovesOneLayerTest('array (1)', [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]);
      addOnlyRemovesOneLayerTest('array (2)', [['funkier', 'is'], ['the', 'best']]);
      addOnlyRemovesOneLayerTest('array (3)', [makeArrayLike(1, 4), makeArrayLike(2, 3)]);
      addOnlyRemovesOneLayerTest('arraylike (1)', makeArrayLike([[1, 2], [3, 4]], [[5, 6], [7, 8]]));
      addOnlyRemovesOneLayerTest('arraylike (2)', makeArrayLike(['funkier', 'is'], ['the', 'best']));
      addOnlyRemovesOneLayerTest('arraylike (3)', makeArrayLike(makeArrayLike(1, 5), makeArrayLike(2, 3)));
    });


    var flattenMapSpec = {
      name: 'flattenMap',
      arity: 2,
      restrictions: [['function: arity 1'], ['arraylike']],
      validArguments: [[array.replicate(2)], [[1, 2, 3], 'abc', makeArrayLike(2, 3, 4)]]
    };


    describeFunction(flattenMapSpec, array.flattenMap, function(flattenMap) {
      var addTest = function(message, f, data) {
        it('Works correctly ' + message, function() {
          var result = flattenMap(f, data);

          expect(result).to.deep.equal(array.flatten(array.map(f, data)));
        });
      };


      addTest('(1)', array.range(1), [2, 3, 4, 5]);
      addTest('(2)', array.replicate(2), 'abc');
      addTest('(3)', array.range(2), makeArrayLike(4, 5, 6));
      addTest('for singleton', array.replicate(1), [1]);


      it('Throws if the function does not return an array/string', function() {
        var fn = function() {
          flattenMap(function(x) {return x + 1;}, [2, 3, 4]);
        };

        expect(fn).to.throw(TypeError);
      });


      testCurriedFunction('flattenMap', flattenMap, [array.range(1), [2, 3, 4]]);
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
