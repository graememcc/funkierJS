(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var array = require('../array');
    var pair = require('../pair');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var getRealArity = base.getRealArity;
    var alwaysTrue = base.constant(true);
    var alwaysFalse = base.constant(false);
    var Pair = pair.Pair;
    var isPair = pair.isPair;
    var fst = pair.fst;
    var snd = pair.snd;


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


    // Many functions split string arguments in order to run a test using every
    var splitIfNecessary = function(val) {
      if (typeof(val) === 'string')
        val = val.split('');

      return val;
    };


    // Several functions have common behaviours, so we factor out common tests


    // Several functions should throw on empty arrays/strings
    var addThrowsOnEmptyTests = function(fnUnderTest, args) {
      it('Throws for empty arrays', function() {
        var a = [];
        var fn = function() {
          fnUnderTest.apply(null, args.concat([a]));
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws for empty strings', function() {
        var a = '';
        var fn = function() {
          fnUnderTest.apply(null, args.concat([a]));
        };

        expect(fn).to.throw(TypeError);
      });
    };


    // Several functions should throw when the first parameter is negative or NaN
    var addBadNumberTests = function(paramName, fnUnderTest, argsBefore, argsAfter, acceptNegative) {
      acceptNegative = acceptNegative || false;

      if (!acceptNegative) {
        it('Throws when ' + paramName + ' is negative', function() {
          var fn = function() {
            fnUnderTest.apply(null, argsBefore.concat([-1]).concat(argsAfter));
          };

          expect(fn).to.throw(TypeError);
        });
      }


      it('Throws when ' + paramName + ' is NaN', function() {
        var fn = function() {
          fnUnderTest.apply(null, argsBefore.concat([NaN]).concat(argsAfter));
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws when ' + paramName + ' is positive infinity', function() {
        var fn = function() {
          fnUnderTest.apply(null, argsBefore.concat([Number.POSITIVE_INFINITY]).concat(argsAfter));
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws when ' + paramName + ' is negative infinity', function() {
        var fn = function() {
          fnUnderTest.apply(null, argsBefore.concat([Number.NEGATIVE_INFINITY]).concat(argsAfter));
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws when ' + paramName + ' is not integral', function() {
        var fn = function() {
          fnUnderTest.apply(null, argsBefore.concat([1.2]).concat(argsAfter));
        };

        expect(fn).to.throw(TypeError);
      });
    };


    // Several functions require that the first parameter is a function with a specific arity
    var addAcceptsOnlyFixedArityTests = function(fnUnderTest, requiredArity, argsBetween, isMinimum, validFunction) {
      argsBetween = argsBetween || [];
      validFunction = validFunction || null;
      isMinimum = isMinimum || false;

      var funcs = [
        function() {},
        function(x) {},
        function(x, y) {},
        function(x, y, z) {},
        function(w, x, y, z) {}
      ];

      var addTestsForType = function(type, originalData) {
        funcs.forEach(function(f, i) {
          if ((!isMinimum && i !== requiredArity) || (isMinimum && i < requiredArity)) {
            it('Throws when called with ' + type + ' and function of arity ' + i, function() {
              var data = originalData.slice();

              var fn = function() {
                fnUnderTest.apply(null, [f].concat(argsBetween).concat([data]));
              };

              expect(fn).to.throw(TypeError);
            });

            return;
          }
          it('Does not throw when called with ' + type + ' and function of arity ' + i, function() {
            var data = originalData.slice();

            // The following is needed for flattenMap, whose function must return an array
            if (!isMinimum && validFunction !== null)
              f = validFunction;

            var fn = function() {
              fnUnderTest.apply(null, [f].concat(argsBetween).concat([data]));
            };

            expect(fn).to.not.throw(TypeError);
          });
        });
      };


      addTestsForType('array', [1, 2, 3]);
      addTestsForType('string', 'abc');
    };


    // Several functions expect the first argument to be a function that should be always be called with a
    // specific number of arguments
    var addFuncCalledWithSpecificArityTests = function(fnUnderTest, requiredArgs, argsBetween) {
      // None of the functions in array need more than 2 arguments: throw at test generation stage if I get
      // this wrong
      if (requiredArgs > 2)
        throw new Error('Incorrect test: addFuncCalledWithSpecificArityTests called with ' + requiredArgs);

      argsBetween = argsBetween || [];

      var addTestsForType = function(type, originalData) {
        it('Function called with correct number of arguments when called with ' + type, function() {
          var data = originalData.slice();
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

          fnUnderTest.apply(null, [f].concat(argsBetween).concat([data]));
          var result = allArgs.every(function(arr) {
            return arr.length === requiredArgs;
          });

          expect(result).to.be.true;
        });
      };


      addTestsForType('array', [1, 2, 3]);
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
          var data = originalData.slice();

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
          var data = originalData.slice();

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
      addTestsForType('string', 'abc');
    };


    // Several functions expect that the result should be distinct from the original
    // value, not harming the original value in any way
    var addNoModificationOfOriginalTests = function(fnUnderTest, argsBefore) {
      var addOne = function(type, originalData) {
        it('Doesn\'t modify original ' + type + ' value', function() {
          var data = originalData.slice();
          var copy = data.slice();
          var fnResult = fnUnderTest.apply(null, argsBefore.concat([data]));
          var stillSameLength = data.length === copy.length;
          data = splitIfNecessary(data);

          var result = data.every(function(v, i) {
            return copy[i] === v;
          });

          expect(stillSameLength && result).to.be.true;
        });
      };


      addOne('array', [{foo: 1}, {foo: 2}, {bar: 3}]);
      addOne('string', 'ab01cd');
    };


    // Several functions expect the return type to be the same as the final argument
    var addReturnsSameTypeTests = function(fnUnderTest, argsBefore) {
      var addOne = function(type, originalData) {
        it('Returns ' + type + ' when called with ' + type, function() {
          var data = originalData.slice();
          var result = fnUnderTest.apply(null, argsBefore.concat([data]));

          if (type === 'array')
            expect(Array.isArray(result)).to.be.true;
          else
            expect(typeof(result)).to.equal('string');
        });
      };

      addOne('array', [{foo: 1}]);
      addOne('string', 'abc');
    };


    // Several functions should yield the empty array/string when called with an empty
    // array/string
    var addReturnsEmptyOnEmptyTests = function(fnUnderTest, argsBefore) {
      it('Returns empty array when called with empty array', function() {
        var original = [];
        var result = fnUnderTest.apply(null, argsBefore.concat([original]));

        expect(result === original).to.be.false;
        expect(result).to.deep.equal([]);
      });


      it('Returns empty string when called with empty string', function() {
        var original = '';
        var result = fnUnderTest.apply(null, argsBefore.concat([original]));

        expect(result).to.deep.equal('');
      });
    };


    var lengthSpec = {
      name: 'length',
      arity: 1
    };


    describeFunction(lengthSpec, array.length, function(length) {
      var addOne = function(message, originalData) {
        it('Works ' + message, function() {
          var data = originalData.slice();

          expect(length(data)).to.equal(data.length);
        });
      };


      addOne('empty arrays', []);
      addOne('arrays (1)', [1]);
      addOne('arrays (2)', [2, 3]);
      addOne('empty strings', '');
      addOne('strings (1)', 'a');
      addOne('strings (2)', 'bcd');
    });


    var getIndexSpec = {
      name: 'getIndex',
      arity: 2
    };


    describeFunction(getIndexSpec, array.getIndex, function(getIndex) {
      addThrowsOnEmptyTests(getIndex, [0]);
      addBadNumberTests('index', getIndex, [], [[1, 2, 3]]);
      addBadNumberTests('index', getIndex, [], ['abc']);


      var addTests = function(originalData) {
        if (originalData.length < 3)
          throw new Error('Test generation function for getIndex requires test data of length ' + originalData.length);
        var typeString = typeof(originalData) === 'string' ? 'string' : 'array';


        it('Works for ' + typeString + ' (1)', function() {
          var data = originalData.slice();
          var result = getIndex(0, data);

          expect(result).to.equal(data[0]);
        });


        it('Works for ' + typeString + ' (2)', function() {
          var data = originalData.slice();
          var result = getIndex(2, data);

          expect(result).to.equal(data[2]);
        });


        it('Throws when ' + typeString + ' indices outside range', function() {
          var data = originalData.slice();
          var fn = function() {
            getIndex(data.length, data);
          };

          expect(fn).to.throw(TypeError);
        });
      };


      addTests([1, 7, 0, 42]);
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

        var addOne = function(message, originalData) {
          it('Works for ' + message, function() {
            var data = originalData.slice();
            var result = fnUnderTest(data);

            expect(result).to.equal(data[isFirst ? 0 : data.length - 1]);
          });
        };


        addOne('arrays (1)', [1]);
        addOne('arrays (2)', [2, 3]);
        addOne('strings (1)', 'a');
        addOne('strings (2)', 'funkier');
      });
    };


    makeElementSelectorTest('head', array.head, true);
    makeElementSelectorTest('last', array.last, false);


    var replicateSpec = {
      name: 'replicate',
      arity: 2
    };


    describeFunction(replicateSpec, array.replicate, function(replicate) {
      addBadNumberTests('length', replicate, [], ['a']);
      addBadNumberTests('length', replicate, [], [1]);


      var addTests = function(message, count, data) {
        it('Returns array ' + message, function() {
          var result = replicate(count, data);

          expect(Array.isArray(result)).to.be.true;
        });


        it('Returned array has correct length ' + message, function() {
          var result = replicate(count, data);

          expect(result.length).to.equal(count);
        });


        it('Returned array\'s elements strictly equal parameter ' + message, function() {
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
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function() {}], [['a'], 'a']]
    };


    describeFunction(mapSpec, array.map, function(map) {
      addFuncCalledWithSpecificArityTests(map, 1);
      addAcceptsOnlyFixedArityTests(map, 1, [], true);
      addCalledWithEveryMemberTests(map);


      var addTests = function(message, f, originalData) {
        it('Returns an array when ', function() {
          var data = originalData.slice();
          var result = map(f, data);

          expect(Array.isArray(result)).to.be.true;
        });


        it('Returned array has correct length when ' + message, function() {
          var data = originalData.slice();
          var result = map(f, data);

          expect(result.length).to.equal(data.length);
        });


        it('Returned array correct when ' + message, function() {
          var data = originalData.slice();
          var result = map(f, data).every(function(val, i) {
            return val === f(data[i]);
          });

          expect(result).to.be.true;
        });
      };


      addTests('called with array (1)', base.id, [1, true, null, undefined]);
      addTests('called with array (2)', function(x) {return x + 1;}, [2, 3, 4]);
      addTests('called with empty array', function(x) {return 42;}, []);
      addTests('called with strings (1)', function(x) {return x.toUpperCase();}, 'funkier');
      addTests('called with strings (2)', function(x) {return x.charCodeAt(0);}, 'abc');
      addTests('called with empty string', function(x) {return true;}, '');


      it('Array contains partially applied functions if supplied function arity > 1', function() {
        var result = map(function(x, y) {return x + y;}, [1, 2]).every(function(f) {
          return typeof(f) === 'function' && getRealArity(f) === 1;
        });

        expect(result).to.be.true;
      });


      testCurriedFunction('map', map, [base.id, [1, 2]]);
    });


    var eachSpec = {
      name: 'each',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function() {}], [['a'], 'a']]
    };


    describeFunction(eachSpec, array.each, function(each) {
      addFuncCalledWithSpecificArityTests(each, 1);
      addCalledWithEveryMemberTests(each);


      it('Returns undefined when called with an array', function() {
        var result = each(base.id, ['a', 1, true]);

        expect(result === undefined).to.be.true;
      });


      it('Returns undefined when called with a string', function() {
        var result = each(base.id, 'abc');

        expect(result === undefined).to.be.true;
      });


      testCurriedFunction('each', each, [base.id, [1, 2]]);
    });


    var filterSpec = {
      name: 'filter',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x) {}], [['a'], 'a']]
    };


    describeFunction(filterSpec, array.filter, function(filter) {
      addReturnsSameTypeTests(filter, [alwaysTrue]);
      addAcceptsOnlyFixedArityTests(filter, 1);
      addFuncCalledWithSpecificArityTests(filter, 1);
      addCalledWithEveryMemberTests(filter);
      addNoModificationOfOriginalTests(filter, [alwaysTrue]);
      addReturnsEmptyOnEmptyTests(filter, [alwaysTrue]);


      var addTests = function(message, f, originalData, expectedResult) {
        it('Returned value has correct length when ' + message + ' (1)', function() {
          var data = originalData.slice();
          var result = filter(alwaysTrue, data);

          expect(result.length).to.equal(data.length);
        });


        it('Returned value has correct length when ' + message + ' (2)', function() {
          var data = originalData.slice();
          var result = filter(alwaysFalse, data);

          expect(result.length).to.equal(0);
        });


        it('Returned value has correct length when ' + message + ' (3)', function() {
          var data = originalData.slice();
          var result = filter(f, data);

          expect(result.length).to.equal(expectedResult.length);
        });


        it('Returned value correct when ' + message + ' (1)', function() {
          var data = originalData.slice();
          var result = filter(alwaysTrue, data);

          expect(result).to.deep.equal(data);
        });


        it('Returned value correct when ' + message + ' (2)', function() {
          var data = originalData.slice();
          var result = filter(alwaysFalse, data);

          expect(result).to.deep.equal(typeof(data) === 'string' ? '' : []);
        });


        it('Returned value correct when ' + message + ' (3)', function() {
          var data = originalData.slice();
          var result = filter(f, data);

          expect(result).to.deep.equal(expectedResult);
        });


        it('Preserves order when ' + message, function() {
          var data = originalData.slice();
          var filtered = filter(f, data);
          filtered = splitIfNecessary(filtered);

          var searchFrom = 0;
          var result = filtered.every(function(val, i) {
            if (i === 0) {
              searchFrom = data.indexOf(val) + 1;
              return true; //vacuously true
            }

            // searchFrom is the position immediately after the location of the previous value.
            // If ordering was preserved, there should be an occurrence of the current value
            // at that position or somewhere after
            searchFrom = data.indexOf(val, searchFrom) + 1;

            return searchFrom !== 0;
          });

          expect(result).to.be.true;
        });
      };


      addTests('called with an array', function(x) {return x % 2 === 0;}, [1, 2, 3, 4], [2, 4]);
      addTests('called with a string', function(c) {return c !== 'a';}, 'banana', 'bnn');


      it('Returned elements are precisely those from the original array', function() {
        var a = [{}, {}, {}, {}];
        var f = alwaysTrue;
        var result = filter(f, a).every(function(e, i) {
            return e === a[i];
        });

        expect(result).to.be.true;
      });


      testCurriedFunction('filter', filter, [alwaysTrue, [1, 2]]);
    });


    var addCommonFoldTests = function(desc, fnUnderTest, is1Func, isRTL) {
      var betweenArgs = is1Func ? [] : [0];
      addAcceptsOnlyFixedArityTests(fnUnderTest, 2, betweenArgs);
      addFuncCalledWithSpecificArityTests(fnUnderTest, 2);
      addCalledWithEveryMemberTests(fnUnderTest, betweenArgs, true, isRTL, is1Func);


      var addCalledWithAccumulatorTest = function(source, type) {
        it('Called with correct accumulator for ' + type, function() {
          var allArgs = [];
          var f;

          var count = 1;

          f = function(x, y) {
            allArgs.push(x);
            return count++;
          };

          var fnArgs = is1Func ? [f, source] : [f, 0, source];
          fnUnderTest.apply(null, fnArgs);

          // Calculate the first element of the array/string for fold*1 tests
          var first = source[isRTL ? source.length - 1 : 0];

          var result = allArgs.every(function(acc, i) {
            if (is1Func && i === 0)
              return acc === first;

            return acc === i;
          });

          expect(result).to.be.true;
        });
      };


      addCalledWithAccumulatorTest([1, 2, 3], 'array');
      addCalledWithAccumulatorTest('123', 'string');


      if (is1Func) {
        it('Throws when called with empty array', function() {
          var fn = function() {
            fnUnderTest(function(x, y) {return 3;}, []);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws when called with empty string', function() {
          var fn = function() {
            fnUnderTest(function(x, y) {return 3;}, '');
          };

          expect(fn).to.throw(TypeError);
        });
      } else {
        it('Returns initial value when called with empty array (1)', function() {
          var initial = 0;
          var result = fnUnderTest(function(x, y) {return 3;}, initial, []);

          expect(result).to.deep.equal(initial);
        });


        it('Returns initial value when called with empty array (2)', function() {
          var initial = 'a';
          var result = fnUnderTest(function(x, y) {return x + y;}, initial, []);

          expect(result).to.deep.equal(initial);
        });


        it('Returns initial value when called with empty string (1)', function() {
          var initial = [];
          var result = fnUnderTest(function(x, y) {return 10;}, initial, []);

          expect(result).to.deep.equal(initial);
        });


        it('Returns initial value when called with empty string (2)', function() {
          var initial = 'a';
          var result = fnUnderTest(function(x, y) {return x + y;}, initial, []);

          expect(result).to.deep.equal(initial);
        });
      }


      var curriedArgs = is1Func ? [function(x, y) {return 42;}, [1, 2]] :
                                  [function(x, y) {return 42;}, 0, [1, 2]];

      testCurriedFunction(desc, fnUnderTest, curriedArgs);
    };


    var foldlSpec = {
      name: 'foldl',
      arity: 3,
      restrictions: [['function'], [], ['array', 'string']],
      validArguments: [[function(x, y) {}], [0], [[1, 2, 3], 'abc']]
    };


    describeFunction(foldlSpec, array.foldl, function(foldl) {
      addCommonFoldTests('foldl', foldl, false, false);


      it('Works correctly for array (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldl(f, 0, [1, 2, 3]);

        expect(result).to.equal(1 + 2 + 3);
      });


      it('Works correctly for array (2)', function() {
        var f = function(x, y) {return x - y;};
        var result = foldl(f, 0, [1, 2, 3]);

        expect(result).to.equal(-1 - 2 - 3);
      });


      it('Works correctly for string (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldl(f, '', 'abc');

        expect(result).to.equal('abc');
      });


      it('Works correctly for string (2)', function() {
        var f = function(x, y) {return y + x;};
        var result = foldl(f, 'z', 'abc');

        expect(result).to.equal('cbaz');
      });
    });


    var foldl1Spec = {
      name: 'foldl1',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x, y) {}], [[1, 2, 3], 'abc']]
    };


    describeFunction(foldl1Spec, array.foldl1, function(foldl1) {
      addCommonFoldTests('foldl1', foldl1, true, false);


      it('Works correctly for array (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldl1(f, [1, 2, 3]);

        expect(result).to.equal(1 + 2 + 3);
      });


      it('Works correctly for array (2)', function() {
        var f = function(x, y) {return x - y;};
        var result = foldl1(f, [1, 2, 3]);

        expect(result).to.equal(1 - 2 - 3);
      });


      it('Works correctly for string (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldl1(f, 'abc');

        expect(result).to.equal('abc');
      });


      it('Works correctly for string (2)', function() {
        var f = function(x, y) {return y + x;};
        var result = foldl1(f, 'abc');

        expect(result).to.equal('cba');
      });
    });


    var foldrSpec = {
      name: 'foldr',
      arity: 3,
      restrictions: [['function'], [], ['array', 'string']],
      validArguments: [[function(x, y) {}], [0], [[1, 2, 3], 'abc']]
    };


    describeFunction(foldrSpec, array.foldr, function(foldr) {
      addCommonFoldTests('foldr', foldr, false, true);


      it('Works correctly for array (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldr(f, 0, [1, 2, 3]);

        expect(result).to.equal(3 + 2 + 1);
      });


      it('Works correctly for array (2)', function() {
        var f = function(x, y) {return x - y;};
        var result = foldr(f, 0, [1, 2, 3]);

        expect(result).to.equal(-3 - 2 - 1);
      });


      it('Works correctly for string (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldr(f, '', 'abc');

        expect(result).to.equal('cba');
      });


      it('Works correctly for string (2)', function() {
        var f = function(x, y) {return y + x;};
        var result = foldr(f, 'z', 'abc');

        expect(result).to.equal('abcz');
      });
    });


    var foldr1Spec = {
      name: 'foldr1',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x, y) {}], [[1, 2, 3], 'abc']]
    };


    describeFunction(foldr1Spec, array.foldr1, function(foldr1) {
      addCommonFoldTests('foldr1', foldr1, true, true);


      it('Works correctly for array (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldr1(f, [1, 2, 3]);

        expect(result).to.equal(3 + 2 + 1);
      });


      it('Works correctly for array (2)', function() {
        var f = function(x, y) {return x - y;};
        var result = foldr1(f, [1, 2, 3]);

        expect(result).to.equal(3 - 2 - 1);
      });


      it('Works correctly for string (1)', function() {
        var f = function(x, y) {return x + y;};
        var result = foldr1(f, 'abc');

        expect(result).to.equal('cba');
      });


      it('Works correctly for string (2)', function() {
        var f = function(x, y) {return y + x;};
        var result = foldr1(f, 'abc');

        expect(result).to.equal('abc');
      });
    });


    var makeArrayBooleanTest = function(desc, fnUnderTest, trigger) {
      var spec = {
        name: desc,
        arity: 2,
        restrictions: [['function'], ['array', 'string']],
        validArguments: [[function(x) {}], [[1, 2], 'ab']]
      };


      describe(spec, fnUnderTest, function(fnUnderTest) {
        var okVal = !trigger;

        var addPrematureTests = function(type, num, originalData) {
          it('Stops prematurely when called with ' + type + ' and ' + trigger + ' returned (' + num + ')', function() {
            var data = originalData.slice();

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
            var data = originalData.slice();

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
            var data = originalData.slice();

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
        };


        var addNormalTests = function(type, num, originalData) {
          it('Called with all values when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var data = originalData.slice();

            var calls = 0;
            var f = function(x) {
              calls += 1;
              return okVal;
            }

            fnUnderTest(f, data);

            expect(calls).to.equal(data.length);
          });


          it('Called with correct values when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var data = originalData.slice();

            var vals = [];
            var calls = 0;
            var f = function(x) {
              vals.push(x);
              calls += 1;
              return okVal;
            }

            fnUnderTest(f, data);

            var result = vals.every(function(elem, i) {
              return data[i] === elem;
            });

            expect(result).to.be.true;
          });


          it('Returns correctly when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var data = originalData.slice();
            var calls = 0;
            var f = function(x) {
              calls += 1;
              return okVal;
            }
            var result = fnUnderTest(f, data);

            expect(result).to.equal(okVal);
          });
        };


        var addShortCircuitTests = function(type, num, testData) {
          addPrematureTests(type, num, testData);
          addNormalTests(type, num, testData);
        };


        addAcceptsOnlyFixedArityTests(fnUnderTest, 1);
        addFuncCalledWithSpecificArityTests(fnUnderTest, 1);
        addPrematureEndTests(fnUnderTest, trigger);
        addRunsToEndTests(fnUnderTest, trigger);
        addShortCircuitTests('array', 1, [1, 2, 3]);
        addShortCircuitTests('array', 2, [{}, {}, {}, {}]);
        addShortCircuitTests('string', 1, 'abc');
        addShortCircuitTests('string', 2, 'abcd');


        testCurriedFunction(desc, fnUnderTest, [alwaysTrue, [1, 2, 3]]);
      });
    };


    makeArrayBooleanTest('every', array.every, false);
    makeArrayBooleanTest('some', array.some, true);


    var makeMinMaxTests = function(desc, fnUnderTest, isMax) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['array', 'string']],
        validArguments: [[[1, 2], 'ab']]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addThrowsOnEmptyTests(fnUnderTest, []);


        it('Works correctly for array (1)', function() {
          var a = [3, 1, 2, 42, 6];
          var result = fnUnderTest(a);

          expect(result).to.equal(isMax ? 42 : 1);
        });


        it('Works correctly for array (2)', function() {
          var a = [2];
          var result = fnUnderTest(a);

          expect(result).to.equal(2);
        });


        it('Works correctly for string (1)', function() {
          var s = 'bad0Z9w';
          var result = fnUnderTest(s);

          expect(result).to.equal(isMax ? 'w' : '0');
        });


        it('Works correctly for string (2)', function() {
          var s = ['e'];
          var result = fnUnderTest(s);

          expect(result).to.equal('e');
        });
      });
    };


    makeMinMaxTests('maximum', array.maximum, true);
    makeMinMaxTests('minimum', array.minimum, false);


    var makeSumProductTests = function(desc, fnUnderTest, isSum) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['array']],
        validArguments: [[[1, 2]]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        it('Throws when called with a string', function() {
          var fn = function() {
            fnUnderTest('abc');
          };

          expect(fn).to.throw(TypeError);
        });


        it('Works correctly for array (1)', function() {
          var a = [1, 2, 3, 4];
          var result = fnUnderTest(a);

          expect(result).to.equal(isSum ? 10 : 24);
        });


        it('Works correctly for array (2)', function() {
          var a = [2];
          var result = fnUnderTest(a);

          expect(result).to.equal(2);
        });


        it('Works correctly for empty arrays', function() {
          var a = [];
          var result = fnUnderTest(a);

          expect(result).to.equal(isSum ? 0 : 1);
        });
      });
    };


    makeSumProductTests('sum', array.sum, true);
    makeSumProductTests('product', array.product, false);


    // element and elementWith share common behaviours. The next two functions are used
    // for generating these tests
    var addElementNotFoundTest = function(fnUnderTest, message, value, originalData) {
      it('Returns false when ' + message, function() {
        var data = originalData.slice();
        var result = fnUnderTest(value, data);

        expect(result).to.be.false;
      });
    };


    var addElementFoundTest = function(fnUnderTest, message, value, originalData) {
      it('Returns true when ' + message, function() {
        var data = originalData.slice();
        var result = fnUnderTest(value, data);

        expect(result).to.be.true;
      });
    };


    var elementSpec = {
      name: 'element',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [['a'], [['a', 'b', 'c'], 'abc']]
    };


    describeFunction(elementSpec, array.element, function(element) {
      addElementNotFoundTest(element, 'array empty', 2, []);
      addElementNotFoundTest(element, 'string empty', 'a', '');
      addElementNotFoundTest(element, 'element not present in array', 5, [1, 3, 4]);
      addElementNotFoundTest(element, 'element not present in string', 'd', 'abc');
      addElementNotFoundTest(element, 'identical element not in array', {foo: 1},
                                      [{foo: 1}, {foo: 1}, {foo: 1}]);

      addElementFoundTest(element, 'element present in array', 6, [1, 6, 4]);
      addElementFoundTest(element, 'element present in string', 'b', 'abc');
      var obj = {foo: 1};
      addElementFoundTest(element, 'identical element in array', obj, [{foo: 1}, {foo: 1}, obj]);


      testCurriedFunction('element', element, [2, [1, 2, 3]]);
    });


    var elementWithSpec = {
      name: 'elementWith',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x) {return true;}], [['a', 'b', 'c'], 'abc']]
    };


    describeFunction(elementWithSpec, array.elementWith, function(elementWith) {
      addAcceptsOnlyFixedArityTests(elementWith, 1);


      addElementNotFoundTest(elementWith, 'array is empty', alwaysTrue, []);
      addElementNotFoundTest(elementWith, 'string is empty', alwaysTrue, '');
      addElementNotFoundTest(elementWith, 'array predicate returns false', function(x) {return x.foo === 5;},
                                          [{foo: 1}, {foo: 4}, {foo: 3}]);
      addElementNotFoundTest(elementWith, 'string predicate returns false', function(x) {return x >= '0' && x <= '9';},
                                          'abcde');

      addElementFoundTest(elementWith, 'predicate matches array element', function(x) {return x.foo === 7},
                                       [{foo: 1}, {foo: 7}, {foo: 4}]);
      addElementFoundTest(elementWith, 'predicate matches element in string', function(x) {return x >= '0' && x <= '9';},
                                          'abc8de');


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


      it('Works correctly (1)', function() {
        var a = 0;
        var b = 10;
        var arr = range(a, b);
        var result = arr.every(function(val, i) {
          return (i === 0 && val === a) || (val === arr[i - 1] + 1);
        });

        expect(result).to.be.true;
      });


      it('Works correctly (2)', function() {
        var a = 1.1;
        var b = 15.2;
        var arr = range(a, b);
        var result = arr.every(function(val, i) {
          return (i === 0 && val === a) || (val === arr[i - 1] + 1);
        });

        expect(result).to.be.true;
      });


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


      it('Works correctly (1)', function() {
        var a = 0;
        var step = 2;
        var b = 10;
        var arr = rangeStep(a, step, b);
        var result = arr.every(function(val, i) {
          return (i === 0 && val === a) || (val === arr[i - 1] + step);
        });

        expect(result).to.be.true;
      });


      it('Works correctly (2)', function() {
        var a = 15.2;
        var step = -1.1;
        var b = 1.1;
        var arr = rangeStep(a, step, b);
        var result = arr.every(function(val, i) {
          return (i === 0 && val === a) || (val === arr[i - 1] + step);
        });

        expect(result).to.be.true;
      });


      it('Empty if a === b, and step incorrect', function() {
        var a = 1;
        var step = 0;
        var b = 1;
        var arr = rangeStep(a, step, b);

        expect(arr).to.deep.equal([]);
      });


      it('Does not include right-hand limit (3)', function() {
        var a = 20;
        var step = -1;
        var b = 10;
        var result = rangeStep(a, step, b);

        expect(array.last(result) > b).to.be.true;
      });


      testCurriedFunction('rangeStep', array.rangeStep, [1, 1, 5]);
    });


    var takeSpec = {
      name: 'take',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[1], [[1, 2, 3], 'abc']]
    };


    describeFunction(takeSpec, array.take, function(take) {
      addBadNumberTests('count', take, [], [[1, 2, 3]], true);
      addBadNumberTests('count', take, [], ['abc'], true);
      addReturnsSameTypeTests(take, [1]);
      addNoModificationOfOriginalTests(take, [1]);
      addReturnsEmptyOnEmptyTests(take, [1]);


      var addExpectEmptyTest = function(message, count, originalData) {
        var isArray = typeof(originalData) !== 'string';

        it('Returns empty ' + (isArray ? 'array' : 'string') + ' when ' + message, function() {
          var data = originalData.slice();
          var result = take(count, data);

          expect(result).to.deep.equal(isArray ? [] : '');
        });
      };


      addExpectEmptyTest('count is 0 for array', 0, [2, 3, 4]);
      addExpectEmptyTest('count is 0 for empty array', 0, []);
      addExpectEmptyTest('count is negative for array', -1, [3, 4, 5]);
      addExpectEmptyTest('count is negative for empty array', -1, []);
      addExpectEmptyTest('count is 0 for string', 0, 'funkier');
      addExpectEmptyTest('count is 0 for empty string', 0, '');
      addExpectEmptyTest('count is negative for string', -1, 'abc');
      addExpectEmptyTest('count is negative for empty string', -1, '');


      var addCorrectEntryTests = function(message, count, arrData, strData) {
        var addTest = function(typeMessage, originalData) {
          it('Works correctly when ' + message + typeMessage, function() {
            var data = originalData.slice();
            var arr = take(count, data);
            arr = splitIfNecessary(arr);

            var result = arr.every(function(val, i) {
              return val === data[i];
            });

            expect(result).to.be.true;
          });
        };

        addTest(' for array', arrData);
        addTest(' for string', strData);
      };


      addCorrectEntryTests('count < length', 2, [1, 2, 3], 'funkier');
      addCorrectEntryTests('count === length', 3, [{}, {}, {}], 'abc');
      addCorrectEntryTests('count > length', 4, [3, 4, 5], 'x');


      testCurriedFunction('take', take, [1, [1, 2, 3]]);
    });


    var dropSpec = {
      name: 'drop',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[1], [[1, 2, 3], 'abc']]
    };


    describeFunction(dropSpec, array.drop, function(drop) {
      addBadNumberTests('count', drop, [], [[1, 2, 3]], true);
      addBadNumberTests('count', drop, [], ['abc'], true);
      addReturnsSameTypeTests(drop, [1]);
      addNoModificationOfOriginalTests(drop, [1]);
      addReturnsEmptyOnEmptyTests(drop, [1]);


      var addExpectFullTest = function(message, count, originalData) {
        var isArray = typeof(original) !== 'string';

        it('Returns copy of ' + (isArray ? 'array' : 'string') + ' when ' + message, function() {
          var data = originalData.slice();
          var result = drop(count, data);

          expect(result).to.deep.equal(data);
        });
      };


      addExpectFullTest('count is 0 for array', 0, [2, 3, 4]);
      addExpectFullTest('count is 0 for empty array', 0, []);
      addExpectFullTest('count is negative for array', -1, [3, 4, 5]);
      addExpectFullTest('count is negative for empty array', -1, []);
      addExpectFullTest('count is 0 for string', 0, 'funkier');
      addExpectFullTest('count is 0 for empty string', 0, '');
      addExpectFullTest('count is negative for string', -1, 'abc');
      addExpectFullTest('count is negative for empty string', -1, '');


      var addCorrectEntryTests = function(message, count, arrData, strData) {
        var addTest = function(typeMessage, originalData) {
          it('Works correctly when ' + message + typeMessage, function() {
            var data = originalData.slice();
            var arr = drop(count, data);
            arr = splitIfNecessary(arr);

            var result = arr.every(function(val, i) {
              return val === data[i + count];
            });

            expect(result).to.be.true;
          });
        };

        addTest(' for array', arrData);
        addTest(' for string', strData);
      };


      var addEmptyAfterDropTests = function(message, count, arrData, strData) {
        var addTest = function(type, typeMessage, originalData) {
          it('Returns empty ' + type + ' when ' + message + typeMessage, function() {
            var data = originalData.slice();
            var result = drop(count, data);

            expect(result).to.deep.equal(type === 'array' ? [] : '');
          });
        };

        addTest('array', ' for array ', arrData);
        addTest('string', ' for string ', strData);
      };


      addCorrectEntryTests('count < length', 1, [1, 2, 3], 'funkier');
      addEmptyAfterDropTests('count === length', 3, [{}, {}, {}], 'abc');
      addEmptyAfterDropTests('count > length', 4, [3, 4, 5], 'x');


      testCurriedFunction('drop', drop, [1, [1, 2, 3]]);
    });


    var makeInitTailTests = function(desc, fnUnderTest) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['array', 'string']],
        validArguments: [[[1, 2, 3], 'abc']]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addThrowsOnEmptyTests(fnUnderTest, []);
        addReturnsSameTypeTests(fnUnderTest, []);


        var addTests = function(type, tests) {
          var addOne = function(originalData, count) {
            it('Returns ' + type + ' of correct length when called with ' + type + '(' + count + ')', function() {
              var data = originalData.slice();
              var result = fnUnderTest(data);

              expect(result.length).equal(data.length - 1);
            });


            it('Works correctly for ' + type + ' (' + count + ')', function() {
              var data = originalData.slice();
              var arr = fnUnderTest(data);
              arr = splitIfNecessary(arr);

              var result = arr.every(function(val, i) {
                return val === data[fnUnderTest === array.tail ? i + 1 : i];
              });
            });
          };

          tests.forEach(addOne);
        };


        addTests('array', [[1, 2, 3], [{}, {}, {}, {}, {}]]);
        addTests('string', ['abc', 'funkier']);
      });
    };


    makeInitTailTests('init', array.init);
    makeInitTailTests('tail', array.tail);


    var makeInitsTailsTests = function(desc, fnUnderTest) {
      var spec = {
        name: desc,
        arity: 1,
        restrictions: [['array', 'string']],
        validArguments: [[[1, 2, 3], 'abc']]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        var addTests = function(type, tests) {
          var addOneSet = function(originalData, count) {
            it('Returns array when called with ' + type + '(' + count + ')', function() {
              var data = originalData.slice();
              var result = fnUnderTest(data);

              expect(Array.isArray(result)).to.be.true;
            });


            it('Returns elements of type ' + type + ' when called with ' + type + '(' + count + ')', function() {
              var data = originalData.slice();
              var result = fnUnderTest(data).every(function(val) {
                if (type === 'array')
                  return Array.isArray(val);
                return typeof(val) === 'string';
               });

               expect(result).to.be.true;
            });


            it('Returns ' + type + ' of correct length when called with ' + type + '(' + count + ')', function() {
              var data = originalData.slice();
              var result = fnUnderTest(data);

              expect(result.length).equal(data.length + 1);
            });


            it('Elements have correct length when called with ' + type + '(' + count + ')', function() {
              var data = originalData.slice();
              var result = fnUnderTest(data).every(function(val, i) {
                return val.length === (fnUnderTest === array.tails ? data.length - i : i);
              });

              expect(result).to.be.true;
            });


            it('Works correctly for ' + type + ' (' + count + ')', function() {
              var data = originalData.slice();
              var arr = fnUnderTest(data);
              var result = arr.every(function(val, i) {
                val = splitIfNecessary(val);

                return val.every(function(v, j) {
                  return v === data[fnUnderTest === array.tails ? i + j : j];
                });
              });

              expect(result).to.be.true;
            });
          };

          tests.forEach(addOneSet);
        };


        addTests('array', [[], [1, 2], [{}, {}, {}]]);
        addTests('string', ['', 'ab', 'funkier']);
        addNoModificationOfOriginalTests(fnUnderTest, []);
        addNoModificationOfOriginalTests(fnUnderTest, []);
      });
    };


    makeInitsTailsTests('inits', array.inits);
    makeInitsTailsTests('tails', array.tails);


    var copySpec = {
      name: 'copy',
      arity: 1,
      restrictions: [['array', 'string']],
      validArguments: [[[1, 2], 'abc']]
    };


    describeFunction(copySpec, array.copy, function(copy) {
      var addTests = function(message, originalData) {
        it('Returns a copy ' + message, function() {
          var data = originalData.slice();
          var result = copy(data) === data;

          expect(result).to.be.false;
        });


        it('Has correct length ' + message, function() {
          var data = originalData.slice();
          var result = copy(data).length === data.length;

          expect(result).to.be.true;
        });


        it('Works correctly ' + message, function() {
          var data = originalData.slice();
          var result = copy(data);

          expect(result).to.deep.equal(data);
        });


        it('Shallow copies members ' + message, function() {
          var data = originalData.slice();
          var result = copy(data).every(function(val, i) {
            return val === data[i];
          });

          expect(result).to.be.true;
        });
      };


      addReturnsSameTypeTests(copy, []);
      addReturnsEmptyOnEmptyTests(copy, []);
      addTests('for empty arrays', []);
      addTests('(1)', [1, 2, 3]);
      addTests('(2)', [{foo: 1}, {baz: 2}, {fizz: 3, buzz: 5}]);
    });


    var sliceSpec = {
      name: 'slice',
      arity: 3,
      restrictions: [[], [], ['array', 'string']],
      validArguments: [[0], [1], [[1, 2, 3], 'abc']]
    };


    describeFunction(sliceSpec, array.slice, function(slice) {
      addBadNumberTests('from', slice, [], [1, 'abc']);
      addBadNumberTests('to', slice, [0], ['abc']);
      addReturnsSameTypeTests(slice, [0, 1]);
      addNoModificationOfOriginalTests(slice, []);
      addNoModificationOfOriginalTests(slice, []);


      var addEmptyTests = function(originalData) {
        var isArray = typeof(originalData) !== 'string';


        it('Returns empty ' + (isArray ? 'array' : 'string') + ' if from <= length', function() {
          var data = originalData.slice();
          var result = slice(4, 5, data);

          expect(result).to.deep.equal(isArray ? [] : '');
        });
      };


      addEmptyTests([1, 2, 3]);
      addEmptyTests('abc');


      var addTests = function(message, from, to, arrData, strData) {
        var addOne = function(type, originalData) {
          it('Result has correct length when ' + message + ' for ' + type, function() {
            var data = originalData.slice();
            var result = slice(from, to, data).length === Math.min(data.length - from, to - from);

            expect(result).to.be.true;
          });


          it('Result has correct values when ' + message + ' for ' + type, function() {
            var data = originalData.slice();
            var newVal = slice(from, to, data);
            newVal = splitIfNecessary(newVal);

            var result = newVal.every(function(val, i) {
              return val === data[from + i];
            });

            expect(result).to.be.true;
          });
        };

        addOne('array', arrData);
        addOne('string', strData);
      };


      addTests('to > len', 1, 5, [1, 2, 3, 4], 'abcd');
      addTests('to === len', 1, 4, [2, 3, 4, 5], 'efgh');
      addTests('slicing normally', 1, 3, [{foo: 1}, {bar: 2}, {fizz: 3}, {buzz: 5}], 'abcd');


      testCurriedFunction('slice', slice, [1, 2, 'funkier']);
    });


    var makeTakeWDropWTests = function(desc, fnUnderTest) {
      var isTakeWhile = desc === 'takeWhile';


      var spec = {
        name: desc,
        arity: 2,
        restrictions: [['function'], ['array', 'string']],
        validArguments: [[function(x) {return true;}], [[1, 2, 3], 'abc']]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        addAcceptsOnlyFixedArityTests(fnUnderTest, 1);
        addFuncCalledWithSpecificArityTests(fnUnderTest, 1);
        addReturnsSameTypeTests(fnUnderTest, [alwaysTrue]);
        addReturnsEmptyOnEmptyTests(fnUnderTest, [alwaysTrue]);


        if (isTakeWhile) {
          it('Always returns a copy', function() {
            var original = [4, 5, 6];
            var result = fnUnderTest(alwaysTrue, original) !== original;

            expect(result).to.be.true;
          });
        }


        var addTests = function(type, message, predicate, expectedLength, originalData) {
          it('Result has correct length ' + message + ' for ' + type, function() {
            var data = originalData.slice();
            var length = isTakeWhile ? expectedLength : data.length - expectedLength;
            var result = fnUnderTest(predicate, data).length === length;

            expect(result).to.be.true;
          });


          it('Predicate only called as often as needed ' + message + ' for ' + type, function() {
            var data = originalData.slice();
            var newPredicate = function(x) {newPredicate.called += 1; return predicate(x);};
            newPredicate.called = 0;
            fnUnderTest(newPredicate, data);
            var result = newPredicate.called === expectedLength + (expectedLength === data.length ? 0 : 1);

            expect(result).to.be.true;
          });


          it('Result has correct members ' + message + ' for ' + type, function() {
            var data = originalData.slice();
            var arr = fnUnderTest(predicate, originalData);
            arr = splitIfNecessary(arr);

            var result = arr.every(function(val, i) {
              return val === data[isTakeWhile ? i : i + expectedLength];
            });

            expect(result).to.be.true;
          });
        };


        addTests('array', '(1)', function(x) {return x.foo < 4;}, 2,
                 [{foo: 1}, {foo: 3}, {foo: 4}, {foo: 5}, {foo: 6}]);
        addTests('array', '(2)', function(x) {return x % 2 === 0;}, 3, [2, 4, 6, 1, 5]);
        addTests('array', '(3)', alwaysTrue, 5, [2, 4, 6, 1, 5]);
        addTests('string', '(1)', function(x) {return x  === ' ';}, 3, '   funkier');
        addTests('string', '(2)', function(x) {return x >= '0' && x <= '9';}, 2, '09abc');
        addTests('string', '(3)', alwaysTrue, 5, 'abcde');
        addNoModificationOfOriginalTests(fnUnderTest, [alwaysTrue]);


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
        restrictions: [[], ['array', 'string']],
        validArguments: [[1], [[1, 2, 3], 'abc']]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        var addTests = function(arrData, strData) {
          var addOne = function(type, message, val, originalData) {
            it('Result has correct length ' + message + ' for ' + type, function() {
              var data = originalData.slice();
              var result = fnUnderTest(val, data).length === data.length + 1;

              expect(result).to.be.true;
            });


            it('Result has correct values ' + message + ' for ' + type, function() {
              var data = originalData.slice();
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

              var result = newVal.every(isPrepend ? prependCheck : appendCheck);

              expect(result).to.be.true;
            });
          };

          arrData.forEach(function(data, i) {
            addOne('array', '(' + (i + 1) + ')', data[0], data[1]);
          });
          strData.forEach(function(data, i) {
            addOne('string', '(' + (i + 1) + ')', data[0], data[1]);
          });
        };

        addTests([[4, [1, 2, 3]], [{}, [{foo: 1}, {bar: 2}, {fizz: 3}]], [1, []]],
                 [['a', 'bcd'], ['0', '123'], ['z', '']]);
        addReturnsSameTypeTests(fnUnderTest, [1]);
        addNoModificationOfOriginalTests(fnUnderTest, [1]);


        testCurriedFunction(desc, fnUnderTest, [1, [1, 2, 3]]);
      });
    };


    makePrependAppendTests('prepend', array.prepend);
    makePrependAppendTests('append', array.append);


    var concatSpec = {
      name: 'concat',
      arity: 2,
      restrictions: [['array', 'string'], ['array', 'string']],
      validArguments: [[[1, 2], 'abc'], [[1, 2, 3], 'abc']]
    };


    describeFunction(concatSpec, array.concat, function(concat) {
      var addTests = function(arrData, strData) {
        var addOne = function(type, message, left, right) {
          // Can't use the global test generation here because we take two arrays
          it('Result has type ' + type + ' ' + message + ' for ' + type, function() {
            var first = left.slice();
            var second = right.slice();
            var result = concat(first, second);

            if (type === 'array')
              expect(Array.isArray(result)).to.be.true;
            else
              expect(result).to.be.a('string');
          });


          it('Result has correct length ' + message + ' for ' + type, function() {
            var first = left.slice();
            var second = right.slice();
            var result = concat(first, second).length === left.length + right.length;

            expect(result).to.be.true;
          });


          it('Result has correct values ' + message + ' for ' + type, function() {
            var first = left.slice();
            var second = right.slice();
            var newVal = concat(first, second);
            newVal = splitIfNecessary(newVal);

            var result = newVal.every(function(v, i) {
              return v === (i < first.length ? first[i] : second[i - first.length]);
            });

            expect(result).to.be.true;
          });


          it('Doesn\'t affect originals', function() {
            var first = left.slice();
            var second = right.slice();
            var firstLength = first.length;
            var secondLength = second.length;
            concat(first, second);

            expect(first.length === firstLength && second.length === secondLength).to.be.true;
          });
        };

        addOne('array', '(LHS empty)', [], [1, 2, 3]);
        addOne('array', '(RHS empty)', [1, 2, 3], []);
        addOne('array', '(both empty)', [], []);
        arrData.forEach(function(data, i) {
          addOne('array', '(' + (i + 1) + ')', data[0], data[1]);
        });
        addOne('string', '(LHS empty)', '', 'abc');
        addOne('string', '(RHS empty)', 'abc', '');
        addOne('string', '(both empty)', '', '');
        strData.forEach(function(data, i) {
          addOne('string', '(' + (i + 1) + ')', data[0], data[1]);
        });
        addOne('array', '(LHS array, RHS string)', [1, 2], 'abc');
        addOne('array', '(LHS string, RHS array)', 'abc', [3, 4, 5]);
      };

      addTests([[[4], [1, 2, 3]], [[{}], [{foo: 1}, {bar: 2}, {fizz: 3}]]],
               [['a', 'bcd'], ['0', '123']]);


      testCurriedFunction('concat', concat, [[1], [1, 2, 3]]);
    });


    var isEmptySpec = {
      name: 'empty',
      arity: 1,
      restrictions: [['array', 'string']],
      validArguments: [[[], '']]
    };


    describeFunction(isEmptySpec, array.isEmpty, function(isEmpty) {
      var addOne = function(message, originalData) {
        it('Works for ' + message, function() {
          var data = originalData.slice();

          expect(isEmpty(data)).to.equal(data.length === 0);
        });
      };


      addOne('an empty array', []);
      addOne('an empty string', '');
      addOne('a non-empty array', [1, 2]);
      addOne('a non-empty string', 'a');
    });


    var intersperseSpec = {
      name: 'intersperse',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[','], [[1, 2], 'abc']]
    };


    describeFunction(intersperseSpec, array.intersperse, function(intersperse) {
      var addDegenerateTest = function(message, originalData) {
        it('Works correctly ' + message, function() {
          var val = originalData.slice();
          var result = intersperse(',', val);

          expect(result).to.deep.equal(val);
        });
      };


      addDegenerateTest('for empty array', []);
      addDegenerateTest('for empty string', '');
      addDegenerateTest('for single element array', [1]);
      addDegenerateTest('for single element string', 'a');


      var addTests = function(message, originalData) {
        it('Result has correct length ' + message, function() {
          var data = originalData.slice();
          var result = intersperse(',', data);

          expect(result.length).to.equal(data.length + (data.length - 1));
        });


        it('Result has original values at correct positions ' + message, function() {
          var data = originalData.slice();
          var interspersed = intersperse(',', data);
          interspersed = splitIfNecessary(interspersed);
          var result = interspersed.every(function(v, i) {
            if (i % 2 === 1) return true;

            return v === data[i];
          });

          expect(result).to.be.true;
        });


        it('Result has interspersed values at correct positions ' + message, function() {
          var data = originalData.slice();
          var intersperseValue = ':';
          var interspersed = intersperse(',', data);
          interspersed = splitIfNecessary(interspersed);
          var result = interspersed.every(function(v, i) {
            if (i % 2 === 0) return true;

            return v === intersperseValue;
          });

          expect(result).to.be.true;
        });
      };


      addReturnsSameTypeTests(intersperse, ['-']);
      testCurriedFunction('intersperse', intersperse, ['1', 'abc']);
    });


    var reverseSpec = {
      name: 'reverse',
      arity: 1,
      restrictions: [['array', 'string']],
      validArguments: [[[1, 2], 'ab']]
    };


    describeFunction(reverseSpec, array.reverse, function(reverse) {
      addReturnsEmptyOnEmptyTests(reverse, []);
      addReturnsSameTypeTests(reverse, []);


      var addTests = function(message, originalData) {
        it('Returns value with same length as original ' + message, function() {
          var data = originalData.slice();
          var expected = data.length;
          var result = reverse(data);

          expect(result.length).to.equal(expected);
        });


        it('Returns correct result ' + message, function() {
          var data = originalData.slice();
          var originalLength = data.length - 1;
          var reversed = reverse(data);
          reversed = splitIfNecessary(reversed);
          var result = reversed.every(function(v, i) {
            return v === data[originalLength - i];
          });

          expect(result).to.be.true;
        });
      };


      addTests('for array', [{}, {}]);
      addTests('for string', 'funkier');
      addTests('for single element array', [1]);
      addTests('for single element string', '');
    });


    var addFindTest = function(message, fnUnderTest, args, expected) {
      var val = args[0];
      var originalData = args[args.length - 1];

      it(message, function() {
        var data = originalData.slice();
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
      restrictions: [[], ['array', 'string']],
      validArguments: [[1], [[2, 3], '234']]
    };


    describeFunction(findSpec, array.find, function(find) {
      addFindTest('Works correctly for array (1)', find, [1, [1, 2, 3]], 0);
      addFindTest('Works correctly for array (2)', find, [1, [3, 2, 1]], 2);
      addFindTest('Returns first match for array', find, [1, [3, 1, 1]], 1);
      addFindTest('Returns -1 when no match for array', find, [4, [1, 2, 3]], -1);
      addFindTest('Works correctly for string (1)', find, ['a', 'abc'], 0);
      addFindTest('Works correctly for string (2)', find, ['b', 'abc'], 1);
      addFindTest('Returns first match for string', find, ['c', 'abcc'], 2);
      addFindTest('Returns -1 when no match for string', find, ['a', 'def'], -1);
      addFindTest('Works correctly when array empty', find, [1, []], -1);
      addFindTest('Works correctly when string empty', find, ['a', ''], -1);
      addFindTest('Tests with strict identity (1)', find, [{}, [{}, {}, {}]], -1);
      var obj = {};
      addFindTest('Tests with strict identity (2)', find, [obj, [{}, obj, {}]], 1);
    });


    var findFromSpec = {
      name: 'findFrom',
      arity: 3,
      restrictions: [[], [], ['array', 'string']],
      validArguments: [[1], [1], [[2, 3], '234']]
    };


    describeFunction(findFromSpec, array.findFrom, function(findFrom) {
      addFindTest('Works correctly for array (1)', findFrom, [1, 0, [1, 2, 3]], 0);
      addFindTest('Works correctly for array (2)', findFrom, [1, 1, [3, 2, 1]], 2);
      addFindTest('Ignores earlier matches for array', findFrom, [1, 1, [1, 1, 1]], 1);
      addFindTest('Returns -1 when no match for array', findFrom, [4, 0, [1, 2, 3]], -1);
      addFindTest('Returns -1 when no match at position for array', findFrom, [4, 1, [4, 1, 2, 3]], -1);
      addFindTest('Works correctly for string (1)', findFrom, ['a', 0, 'abc'], 0);
      addFindTest('Works correctly for string (2)', findFrom, ['b', 1, 'abc'], 1);
      addFindTest('Ignores earlier matches for string', findFrom, ['c', 3, 'abcc'], 3);
      addFindTest('Returns -1 when no match for string', findFrom, ['a', 0, 'def'], -1);
      addFindTest('Returns -1 when no match at position for string', findFrom, ['a', 1, 'abc'], -1);
      addFindTest('Works correctly when array empty', findFrom, [1, 0, []], -1);
      addFindTest('Works correctly when string empty', findFrom, ['a', 0, ''], -1);
      addFindTest('Tests with strict identity (1)', findFrom, [{}, 0, [{}, {}, {}]], -1);
      var obj = {};
      addFindTest('Tests with strict identity (2)', findFrom, [obj, 1, [{}, {}, obj, {}]], 2);
    });


    var findWithSpec = {
      name: 'findWith',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[alwaysTrue], [[1, 2], 'abc']]
    };


    describeFunction(findWithSpec, array.findWith, function(findWith) {
      addAcceptsOnlyFixedArityTests(findWith, 1);
      addFuncCalledWithSpecificArityTests(findWith, 1);


      var addNeverCalledOnEmptyTest = function(originalData) {
        var isArray = typeof(value) !== 'string';

        it('Function never called with empty ' + (isArray ? 'array ' : 'string'), function() {
          var data = originalData.slice();
          var f = function(x) {f.called += 1; return true;};
          f.called = 0;
          findWith(f, data);

          expect(f.called).to.equal(0);
        });
      };


      addNeverCalledOnEmptyTest([]);
      addNeverCalledOnEmptyTest('');
      addFindTest('Works correctly when array empty', findWith, [alwaysTrue, []], -1);
      addFindTest('Works correctly when string empty', findWith, [alwaysTrue, ''], -1);
      addFindTest('Works correctly when value not found in array', findWith,
                  [alwaysFalse, [1, 2, 3]], -1);
      addFindTest('Works correctly when value not found in string', findWith,
                  [alwaysFalse, 'funkier'], -1);

      var fooArr1 = [{foo: 1}, {foo: 42}, {foo: 7}, {foo: 5}, {foo: 3}, {foo: 6}];
      addFindTest('Works correctly when value present in array', findWith,
                  [function(x) {return x.foo === 42;}, fooArr1], 1);
      addFindTest('Works correctly when value present in string', findWith,
                  [function(x) {return x >= '0' && x <= '9';}, 'ab0cd'], 2);

      var fooArr2 = [{foo: 1}, {foo: 7}, {foo: 42}, {foo: 5}, {foo: 42}, {foo: 6}];
      addFindTest('Returns first index of first match in array', findWith,
                  [function(x) {return x.foo === 42;}, fooArr2], 2);
      addFindTest('Returns first index of first match in string', findWith,
                  [function(x) {return x >= '0' && x <= '9';}, 'abc01d2'], 3);


      var addCalledWithEveryNotFoundTest = function(originalData) {
        var isArray = typeof(originalData) !== 'string';


        it('Function called with every element if not found (' + (isArray ? 'array' : 'string') + ')', function() {
          // The function records every argument it is called with. This should equal the original data
          var f = function(x) {f.called.push(x); return false;};
          f.called = [];

          var data = originalData.slice();
          findWith(f, data);

          var result = f.called.every(function(v, i) {
            return v === data[i];
          });

          expect(f.called.length).to.equal(data.length);
          expect(result).to.be.true;
        });
      };


      addCalledWithEveryNotFoundTest([1, 2, 3]);
      addCalledWithEveryNotFoundTest('funkier');


      var addCalledOnlyAsOftenAsNecessaryTest = function(predicate, originalData) {
        var isArray = typeof(originalData) !== 'string';


        it('Function called only as often as necessary when found (' + (isArray ? 'array' : 'string') + ')', function() {
          // Create a new predicate function that records the values it's called with, then defers to
          // the supplied predicate. We can then confirm we iterated from left to right.
          var f = function(x) {f.called.push(x); return predicate(x);};
          f.called = [];

          var data = originalData.slice();
          var index = findWith(f, data);

          var result = f.called.every(function(v, i) {
            return v === data[i];
          });

          expect(f.called.length).to.equal(index + 1);
          expect(result).to.be.true;
        });
      };


      addCalledOnlyAsOftenAsNecessaryTest(function(x) {return x.foo === 42;},
                                          [{foo: 1}, {foo: 6}, {foo: 7}, {foo: 1}, {foo: 42}, {foo: 4}]);
      addCalledOnlyAsOftenAsNecessaryTest(function(x) {return x < 'a';}, 'abCde');


      testCurriedFunction('findWith', findWith, [alwaysTrue, 'funkier']);
    });


    var findFromWithSpec = {
      name: 'findFromWith',
      arity: 3,
      restrictions: [['function'], [], ['array', 'string']],
      validArguments: [[alwaysTrue], [1], [[1, 2], 'abc']]
    };


    describeFunction(findFromWithSpec, array.findFromWith, function(findFromWith) {
      addAcceptsOnlyFixedArityTests(findFromWith, 1, [1]);
      addFuncCalledWithSpecificArityTests(findFromWith, 1, [1]);


      it('Function never called with empty array', function() {
        var f = function(x) {f.called += 1; return true;};
        f.called = 0;
        findFromWith(f, 1, []);

        expect(f.called).to.equal(0);
      });


      it('Works correctly with empty arrays', function() {
        var result = findFromWith(alwaysTrue, 1, []);

        expect(result).to.equal(-1);
      });


      it('Function never called with empty string', function() {
        var f = function(x) {f.called += 1; return true;};
        f.called = 0;
        findFromWith(f, 1, '');

        expect(f.called).to.equal(0);
      });


      it('Works correctly with empty string', function() {
        var result = findFromWith(alwaysTrue, 1, '');

        expect(result).to.equal(-1);
      });


      it('Function called with every element from position if not found (array)', function() {
        var f = function(x) {f.called.push(x); return false;};
        f.called = [];
        var arr = [2, 3, 4];
        var index = 1;
        findFromWith(f, index, arr);
        var result = f.called.every(function(v, i) {
          return v === arr[i + index];
        });

        expect(f.called.length).to.equal(arr.length - index);
        expect(result).to.be.true;
      });


      it('Works correctly if value never found from position (array)', function() {
        var result = findFromWith(base.constant(false), 1, [1, 2, 3]);

        expect(result).to.equal(-1);
      });


      it('Function called with every element from position if not found (string)', function() {
        var f = function(x) {f.called.push(x); return false;};
        f.called = [];
        var arr = 'funkier';
        var index = 2;
        findFromWith(f, index, arr);
        var result = f.called.every(function(v, i) {
          return v === arr[i + index];
        });

        expect(f.called.length).to.equal(arr.length - index);
        expect(result).to.be.true;
      });


      it('Works correctly if value never found from position (string)', function() {
        var result = findFromWith(base.constant(false), 1, 'def');

        expect(result).to.equal(-1);
      });


      it('Function called only as often as necessary when found from position (array)', function() {
        var f = function(x) {f.called.push(x); return x.foo === 42;};
        f.called = [];
        var arr = [{foo: 1}, {foo: 3}, {foo: 7}, {foo: 5}, {foo: 42}, {foo: 6}];
        var index = 3;
        findFromWith(f, index, arr);
        var result = f.called.every(function(v, i) {
          return v === arr[i + index];
        });

        expect(f.called.length).to.equal(2);
        expect(result).to.be.true;
      });


      it('Works correctly when value present (array)', function() {
        var f = function(x) {return x.foo === 42;};
        var arr = [{foo: 1}, {foo: 42}, {foo: 7}, {foo: 5}, {foo: 3}, {foo: 6}];
        var result = findFromWith(f, 1, arr);

        expect(result).to.equal(1);
      });


      it('Returns first index (array)', function() {
        var f = function(x) {return x.foo === 42;};
        var arr = [{foo: 1}, {foo: 7}, {foo: 42}, {foo: 5}, {foo: 42}, {foo: 6}];
        var result = findFromWith(f, 1, arr);

        expect(result).to.equal(2);
      });


      it('Ignores earlier occurrences (array)', function() {
        var f = function(x) {return x.foo === 42;};
        var arr = [{foo: 42}, {foo: 7}, {foo: 42}, {foo: 5}, {foo: 42}, {foo: 6}];
        var result = findFromWith(f, 1, arr);

        expect(result).to.equal(2);
      });


      it('Works correctly if index >= array length', function() {
        var f = alwaysTrue;
        var arr = [1, 2, 3];
        var result = findFromWith(f, 4, arr);

        expect(result).to.equal(-1);
      });


      it('Function called only as often as necessary when found (string)', function() {
        var f = function(x) {f.called.push(x); return x >= '0' && x <= '9';};
        f.called = [];
        var arr = 'ab0cd';
        var index = 1;
        findFromWith(f, index, arr);
        var result = f.called.every(function(v, i) {
          return v === arr[i + index];
        });

        expect(f.called.length).to.equal(2);
        expect(result).to.be.true;
      });


      it('Works correctly when value present (string)', function() {
        var f = function(x) {return x >= '0' && x <= '9';};
        var arr = 'ab0cd';
        var result = findFromWith(f, 1, arr);

        expect(result).to.equal(2);
      });


      it('Returns first index (array)', function() {
        var f = function(x) {return x >= '0' && x <= '9';};
        var arr = 'a0c1d';
        var result = findFromWith(f, 1, arr);

        expect(result).to.equal(1);
      });


      it('Ignores earlier matches (array)', function() {
        var f = function(x) {return x >= '0' && x <= '9';};
        var arr = 'a0c1d';
        var result = findFromWith(f, 2, arr);

        expect(result).to.equal(3);
      });


      it('Works correctly if index >= string length', function() {
        var f = alwaysTrue;
        var arr = 'abc';
        var result = findFromWith(f, 7, arr);

        expect(result).to.equal(-1);
      });


      testCurriedFunction('findFromWith', findFromWith, [alwaysTrue, 1, 'funkier']);
    });


    var occurrencesSpec = {
      name: 'occurrences',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[1], [[1, 2, 3], 'abc']]
    };


    describeFunction(occurrencesSpec, array.occurrences, function(occurrences) {
      it('Returns empty array when called with empty array', function() {
        var result = occurrences(1, []);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when called with empty string', function() {
        var result = occurrences(1, '');

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when value not found (array)', function() {
        var result = occurrences(1, [2, 3, 4]);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when value not found (string)', function() {
        var result = occurrences('a', 'funkier');

        expect(result).to.deep.equal([]);
      });


      var addTest = function(message, val, originalData) {
        it('Returns an array ' + message, function() {
          var data = originalData.slice();
          var result = occurrences(val, data);

          expect(Array.isArray(result)).to.be.true;
        });


        it('Returned values are valid indices ' + message, function() {
          var data = originalData.slice();
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
      addTest('for array (3)', {}, [{}, {}, {}]);
      var obj = {};
      addTest('for array (4)', obj, [{}, obj, {}]);
      addTest('for string (1)', 'a', 'ban');
      addTest('for string (2)', 'a', 'banana');


      testCurriedFunction('occurrences', occurrences, [1, [1, 2, 3]]);
    });


    var occurrencesWithSpec = {
      name: 'occurrencesWith',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[alwaysTrue], [[1, 2, 3], 'abc']]
    };


    describeFunction(occurrencesWithSpec, array.occurrencesWith, function(occurrencesWith) {
      addAcceptsOnlyFixedArityTests(occurrencesWith, 1);


      it('Returns empty array when called with empty array', function() {
        var result = occurrencesWith(alwaysTrue, []);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when called with empty string', function() {
        var result = occurrencesWith(alwaysTrue, '');

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when value not found (array)', function() {
        var result = occurrencesWith(base.constant(false), [2, 3, 4]);

        expect(result).to.deep.equal([]);
      });


      it('Function called for every element when not found (array)', function() {
        var f = function(x) {f.called.push(x); return false;};
        f.called = [];
        var arr = [1, 2, 3];
        var index = 1;
        occurrencesWith(f, arr);
        var result = f.called.every(function(v, i) {
          return v === arr[i];
        });

        expect(f.called.length).to.equal(arr.length);
        expect(result).to.be.true;
      });


      it('Returns empty array when value not found (string)', function() {
        var result = occurrencesWith(base.constant(false), 'funkier');

        expect(result).to.deep.equal([]);
      });


      it('Function called for every element when not found (string)', function() {
        var f = function(x) {f.called.push(x); return false;};
        f.called = [];
        var arr = 'abcde';
        var index = 1;
        occurrencesWith(f, arr);
        var result = f.called.every(function(v, i) {
          return v === arr[i];
        });

        expect(f.called.length).to.equal(arr.length);
        expect(result).to.be.true;
      });


      var addTest = function(message, p, originalData) {
        it('Returns an array ' + message, function() {
          var data = originalData.slice();
          var result = occurrencesWith(p, data);

          expect(Array.isArray(result)).to.be.true;
        });


        it('Function called for every element ' + message, function() {
          var f = function(x) {f.called.push(x); return p(x);};
          f.called = [];
          var arr = 'abcde';
          var index = 1;
          occurrencesWith(f, arr);
          var result = f.called.every(function(v, i) {
            return v === arr[i];
          });

          expect(f.called.length).to.equal(arr.length);
          expect(result).to.be.true;
        });


        it('Returned values are valid indices ' + message, function() {
          var data = originalData.slice();
          var result = occurrencesWith(p, data).every(function(i) {
            return i >= 0 && i < data.length && p(data[i]);
          });

          expect(result).to.be.true;
        });


        it('No indices missing ' + message, function() {
          var data = splitIfNecessary(originalData.slice());
          var found = occurrencesWith(p, data);
          var result = data.every(function(v, i) {
            if (found.indexOf(i) !== -1) return true;
            return p(v) === false;
          });

          expect(result).to.be.true;
        });
      };


      addTest('for array (1)', base.strictEquals(1), [2, 1, 3]);
      addTest('for array (2)', base.strictEquals(1), [2, 1, 1, 3, 1]);
      addTest('for array (3)', function(x) {return x.foo = 3;},
              [{foo: 3}, {foo: 42}, {foo: 3}, {foo: 3}, {foo: undefined}]);
      addTest('for string (1)', base.strictEquals('a'), 'ban');
      addTest('for string (2)', function(x) {return x >= '0' && x <= '9';}, 'b01d22e34');


      testCurriedFunction('occurrencesWith', occurrencesWith, [alwaysTrue, [1, 2, 3]]);
    });


    var zipSpec = {
      name: 'zip',
      arity: 2,
      restrictions: [['array', 'string'], ['array', 'string']],
      validArguments: [[[1, 2], 'abc'], [[3, 4, 5], 'def']]
    };


    describeFunction(zipSpec, array.zip, function(zip) {
      var addDegenerateTests = function(message, left, right) {
        it('Works for ' + message, function() {
          var result = zip(left, right);

          expect(result).to.deep.equal([]);
        });
      };


      addDegenerateTests('LHS empty', [], [1, 2, 3]);
      addDegenerateTests('RHS empty', [1, 2, 3], []);
      addDegenerateTests('both empty', [], []);


      var addTests = function(message, left, right) {
        it('Result is an array ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zip(l, r);

          expect(Array.isArray(result)).to.be.true;
        });


        it('Result has correct length ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var expected = Math.min(l.length, r.length);
          var result = zip(l, r).length;

          expect(result).to.equal(expected);
        });


        it('Every element is a pair ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zip(l, r).every(function(p) {
            return isPair(p);
          });

          expect(result).to.be.true;
        });


        it('First of every element is correct ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zip(l, r).every(function(p, i) {
            return fst(p) === l[i];
          });

          expect(result).to.be.true;
        });


        it('Second of every element is correct ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zip(l, r).every(function(p, i) {
            return snd(p) === r[i];
          });

          expect(result).to.be.true;
        });
      };


      addTests('for array (1)', [1], [2, 3, 4]);
      addTests('for array (2)', [2, 3, 4], [5]);
      addTests('for array (3)', [2, 3, 4], [5, 6, 7, 8]);
      addTests('for string (1)', 'a', 'bcd');
      addTests('for string (2)', 'bcd', 'e');
      addTests('for string (3)', 'bcd', 'efgh');
      addTests('for mix (1)', [{}, {}, {}], 'funkier');
      addTests('for mix (2)', 'funkier', [true, false, null]);


      testCurriedFunction('zip', zip, [[1, 2, 3], [4, 5, 6]]);
    });


    var zipWithSpec = {
      name: 'zipWith',
      arity: 3,
      restrictions: [['function'], ['array', 'string'], ['array', 'string']],
      validArguments: [[function(x, y) {return x + y;}], [[1, 2], 'abc'], [[3, 4, 5], 'def']]
    };


    describeFunction(zipWithSpec, array.zipWith, function(zipWith) {
      var addDegenerateTests = function(message, left, right) {
        it('Works for ' + message, function() {
          var result = zipWith(function(l, r) {return l;}, left, right);

          expect(result).to.deep.equal([]);
        });
      };


      addDegenerateTests('LHS empty', [], [1, 2, 3]);
      addDegenerateTests('RHS empty', [1, 2, 3], []);
      addDegenerateTests('both empty', [], []);


      addAcceptsOnlyFixedArityTests(zipWith, 2, [[4, 5, 6]], true);
      addFuncCalledWithSpecificArityTests(zipWith, 2, [['a', 'b', 'c']]);


      var addTests = function(message, f, left, right) {
        it('Result is an array ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zipWith(f, l, r);

          expect(Array.isArray(result)).to.be.true;
        });


        it('Result has correct length ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var expected = Math.min(l.length, r.length);
          var result = zipWith(f, l, r).length;

          expect(result).to.equal(expected);
        });


        it('Every element is correct ' + message, function() {
          var l = left.slice();
          var r = right.slice();
          var result = zipWith(f, l, r).every(function(p, i) {
            return p === f(l[i], r[i]);
          });

          expect(result).to.be.true;
        });
      };


      addTests('for array (1)', function(x, y) {return x + y;}, [1], [2, 3, 4]);
      addTests('for array (2)', function(x, y) {return x - y;}, [2, 3, 4], [5]);
      addTests('for array (3)', function(x, y) {return x * y;}, [2, 3, 4], [5, 6, 7, 8]);
      addTests('for string (1)', function(x, y) {return x.toUpperCase();}, 'a', 'bcd');
      addTests('for string (2)', function(x, y) {return x + y;}, 'bcd', 'e');
      addTests('for string (3)', function(x, y) {return y + x;}, 'bcd', 'efgh');
      addTests('for mix (1)', function(x, y) {return x.toString() + y.toString();}, [{}, {}, {}], 'funkier');
      addTests('for mix (2)', function(x, y) {return x.toString() + y.toString();}, 'funkier', [true, false, {}]);


      testCurriedFunction('zipWith', zipWith, [function(x, y) {return x * y;}, [1, 2, 3], [4, 5, 6]]);
    });


    var nubSpec = {
      name: 'nub',
      arity: 1,
      restrictions: [['array', 'string']],
      validArguments: [[[1, 2], 'abc']]
    };


    describeFunction(nubSpec, array.nub, function(nub) {
      addReturnsEmptyOnEmptyTests(nub, []);
      addNoModificationOfOriginalTests(nub, []);
      addReturnsSameTypeTests(nub, []);


      var addTests = function(message, originalData, expectedLength) {
        it('Length is correct for ' + message, function() {
          var data = originalData.slice();
          var result = nub(data).length;

          expect(result).to.equal(expectedLength);
        });


        it('Each value only occurs once for ' + message, function() {
          var data = originalData.slice();
          var unique = nub(data);
          unique = splitIfNecessary(unique);
          var result = unique.every(function(val) {
            return array.occurrences(val, unique).length === 1;
          });

          expect(result).to.be.true;
        });


        it('Each value came from original for ' + message, function() {
          var data = originalData.slice();
          var unique = nub(data);
          unique = splitIfNecessary(unique);
          var result = unique.every(function(val) {
            return data.indexOf(val) !== -1;
          });

          expect(result).to.be.true;
        });


        it('Ordering maintained from original for ' + message, function() {
          var data = originalData.slice();
          var unique = nub(data);
          unique = splitIfNecessary(unique);
          var result = unique.every(function(val, i) {
            if (i === 0) return true; // vacuously true

            return data.indexOf(unique[i - 1]) < data.indexOf(val);
          });

          expect(result).to.be.true;
        });
      };


      addTests('singleton array', [5], 1);
      addTests('array with no duplicates', [2, 3, 4], 3);
      addTests('array with one duplicate', [2, 3, 2, 4], 3);
      addTests('array with multiple duplicates', [2, 3, 3, 4, 2, 4], 3);
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
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x, y) {return false;}], [[1, 2, 3], 'abcd']]
    };


    describeFunction(nubWithSpec, array.nubWith, function(nubWith) {
      var alwaysFalse = function(x, y) {return false;};


      addReturnsEmptyOnEmptyTests(nubWith, [alwaysFalse]);
      addNoModificationOfOriginalTests(nubWith, [alwaysFalse]);
      addReturnsSameTypeTests(nubWith, [alwaysFalse]);
      addAcceptsOnlyFixedArityTests(nubWith, 2);
      addFuncCalledWithSpecificArityTests(nubWith, 2);


      var addTests = function(message, f, originalData, expectedLength) {
        it('Length is correct for ' + message, function() {
          var data = originalData.slice();
          var result = nubWith(f, data).length;

          expect(result).to.equal(expectedLength);
        });


        it('Predicate function called as often as required for ' + message, function() {
          var data = originalData.slice();
          var p = function(x, y) {
            p.called += 1;
            return f(x, y);
          };
          p.called = 0;
          nubWith(p, data);

          expect(p.called).to.be.at.most(data.length * (data.length - 1) / 2);
        });


        it('Each value only occurs once for ' + message, function() {
          var data = originalData.slice();
          var unique = nubWith(f, data);
          unique = splitIfNecessary(unique);
          var result = unique.every(function(val, i) {
            return unique.every(function(val2, j) {
              if (i === j) return true;

              if (j < i)
                return f(val2, val) === false;

              return f(val, val2) === false;
            });
          });

          expect(result).to.be.true;
        });


        it('Each value came from original for ' + message, function() {
          var data = originalData.slice();
          var unique = nubWith(f, data);
          unique = splitIfNecessary(unique);
          var result = unique.every(function(val) {
            return data.indexOf(val) !== -1;
          });

          expect(result).to.be.true;
        });


        it('Ordering maintained from original for ' + message, function() {
          var data = originalData.slice();
          var unique = nubWith(f, data);
          unique = splitIfNecessary(unique);
          var result = unique.every(function(val, i) {
            if (i === 0) return true; // vacuously true

            return data.indexOf(unique[i - 1]) <= data.indexOf(val);
          });

          expect(result).to.be.true;
        });
      };


      addTests('singleton array', alwaysFalse, [1], 1);
      addTests('array with no duplicates', function(x, y) {return x + y === 4;}, [2, 3, 4], 3);
      addTests('array with one duplicate', function(x, y) {return x + y === 4;}, [2, 3, 2, 4], 3);
      addTests('array with multiple duplicates', function(x, y) {return x.foo === y.foo;},
               [{foo: 1}, {foo: 2}, {foo: 1}, {foo: 3}, {foo: 2}], 3);

      var oneVowel = function(x, y) {return 'aeiou'.indexOf(x) !== -1 && 'aeiou'.indexOf(y) !== -1;};
      addTests('singleton string', oneVowel, 'a', 1);
      addTests('string with no duplicates', oneVowel, 'abcd', 4);
      addTests('string with one duplicate', oneVowel, 'java', 3);
      addTests('string with multiple duplicates', oneVowel, 'bananae', 4);


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
      restrictions: [['array', 'string']],
      validArguments: [[[1, 2, 3], 'abc']]
    };


    describeFunction(sortSpec, array.sort, function(sort) {
      addReturnsEmptyOnEmptyTests(sort, []);
      addNoModificationOfOriginalTests(sort, []);
      addReturnsSameTypeTests(sort, []);


      var addTests = function(message, originalData) {
        it('Length is correct for ' + message, function() {
          var data = originalData.slice();
          var result = sort(data).length;

          expect(result).to.equal(data.length);
        });


        it('Each value came from original for ' + message, function() {
          var data = originalData.slice();
          var sorted = sort(data);
          sorted = splitIfNecessary(sorted);
          var result = sorted.every(function(val) {
            var ourOccurrences = array.occurrences(val, sorted).length;
            var originalOccurrences = array.occurrences(val, data).length;

            return data.indexOf(val) !== -1 && ourOccurrences === originalOccurrences;
          });

          expect(result).to.be.true;
        });


        it('Ordering correct for ' + message, function() {
          var data = originalData.slice();
          var sorted = sort(data);
          sorted = splitIfNecessary(sorted);
          var result = sorted.every(function(val, i) {
            if (i === 0) return true; // vacuously true

            return sorted[i - 1] <= val;
          });

          expect(result).to.be.true;
        });
      };


      addTests('singleton array', [1]);
      addTests('array with no duplicates', [4, 2, 3]);
      addTests('array with duplicate', [4, 2, 3, 2]);
      addTests('already sorted array', [1, 2, 3]);
      addTests('worst case', [5, 4, 3, 2, 1]);

      addTests('singleton string', 'a');
      addTests('string with no duplicates', 'debc');
      addTests('string with duplicate', 'dcebc');
      addTests('already sorted string', '0123');
      addTests('worst case', 'zyxw');
    });


    var sortWithSpec = {
      name: 'sortWith',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x, y) {return -1;}], [[1, 2, 3], 'abc']]
    };


    describeFunction(sortWithSpec, array.sortWith, function(sortWith) {
      var normalCompare = function(x, y) {return x - y;};
      addReturnsEmptyOnEmptyTests(sortWith, [normalCompare]);
      addNoModificationOfOriginalTests(sortWith, [normalCompare]);
      addReturnsSameTypeTests(sortWith, [normalCompare]);
      addAcceptsOnlyFixedArityTests(sortWith, 2);
      addFuncCalledWithSpecificArityTests(sortWith, 2);


      var addTests = function(message, f, originalData) {
        it('Length is correct for ' + message, function() {
          var data = originalData.slice();
          var result = sortWith(f, data).length;

          expect(result).to.equal(data.length);
        });


        it('Each value came from original for ' + message, function() {
          var data = originalData.slice();
          var sorted = sortWith(f, data);
          sorted = splitIfNecessary(sorted);
          var result = sorted.every(function(val) {
            var ourOccurrences = array.occurrences(val, sorted).length;
            var originalOccurrences = array.occurrences(val, data).length;

            return data.indexOf(val) !== -1 && ourOccurrences === originalOccurrences;
          });

          expect(result).to.be.true;
        });


        it('Ordering correct for ' + message, function() {
          var data = originalData.slice();
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
      restrictions: [['array']],
      validArguments: [[[Pair(1, 2)]]]
    };


    describeFunction(unzipSpec, array.unzip, function(unzip) {
      it('Throws if any element is not a Pair (1)', function() {
        var bogus = ['a', Pair(1, 2), Pair(3, 4)];
        var fn = function() {
          unzip(bogus);
        };

       expect(fn).to.throw(TypeError);
      });


      it('Throws if any element is not a Pair (2)', function() {
        var bogus = [Pair(1, 2), Pair(5, 6), 1, Pair(3, 4)];
        var fn = function() {
          unzip(bogus);
        };

       expect(fn).to.throw(TypeError);
      });


      it('Throws if any element is not a Pair (3)', function() {
        var bogus = [Pair(1, 2), Pair(5, 6), Pair(3, 4), []];
        var fn = function() {
          unzip(bogus);
        };

       expect(fn).to.throw(TypeError);
      });


      it('Works for degenerate case', function() {
        var arr = [];
        var result = unzip(arr);

        expect(isPair(result)).to.be.true;
        expect(fst(result)).to.deep.equal([]);
        expect(snd(result)).to.deep.equal([]);
      });


      var addTests = function(message, original) {
        it('Returns a pair for ' + message, function() {
          var arr = original.slice();
          var result = unzip(arr);

          expect(isPair(result)).to.be.true;
        });


        it('First element is an array for ' + message, function() {
          var arr = original.slice();
          var result = Array.isArray(fst(unzip(arr)));

          expect(result).to.be.true;
        });


        it('Second element is an array for ' + message, function() {
          var arr = original.slice();
          var result = Array.isArray(snd(unzip(arr)));

          expect(result).to.be.true;
        });


        it('First element has correct length for ' + message, function() {
          var arr = original.slice();
          var result = fst(unzip(arr)).length === arr.length;

          expect(result).to.be.true;
        });


        it('Second element has correct length for ' + message, function() {
          var arr = original.slice();
          var result = snd(unzip(arr)).length === arr.length;

          expect(result).to.be.true;
        });


        it('Doesn\'t affect the original ' + message, function() {
          var arr = original.slice();
          var result = unzip(arr) !== arr;

          expect(result).to.be.true;
        });


        it('First element correct for ' + message, function() {
          var arr = original.slice();
          var result = fst(unzip(arr)).every(function(val, i) {
            return fst(arr[i]) === val;
          });

          expect(result).to.be.true;
        });


        it('Second element correct for ' + message, function() {
          var arr = original.slice();
          var result = snd(unzip(arr)).every(function(val, i) {
            return snd(arr[i]) === val;
          });

          expect(result).to.be.true;
        });
      };


      addTests('singleton', [Pair(1, 2)]);
      addTests('normal array', [Pair('a', true), Pair(3, null), Pair(1, 2), Pair({}, {})]);
    });


    var insertSpec = {
      name: 'insert',
      arity: 3,
      restrictions: [[], [], ['array', 'string']],
      validArguments: [[0], ['1'], [[1, 2, 3], 'abc']]
    };


    describeFunction(insertSpec, array.insert, function(insert) {
      addBadNumberTests('index', insert, [], ['a', [1, 2, 3]]);
      addBadNumberTests('index', insert, [], ['a', 'bcd']);


      it('Throws if index > length (1)', function() {
        var fn = function() {
          insert(4, 'a', [1, 2, 3]);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if index > length (2)', function() {
        var fn = function() {
          insert(10, 'a', 'bcde');
        };

        expect(fn).to.throw(TypeError);
      });


      it('Does not throw if index === length (1)', function() {
        var fn = function() {
          insert(3, 'a', [1, 2, 3]);
        };

        expect(fn).to.not.throw(TypeError);
      });


      it('Does not throw if index === length (2)', function() {
        var fn = function() {
          insert(4, 'a', 'bcde');
        };

        expect(fn).to.not.throw(TypeError);
      });


      addNoModificationOfOriginalTests(insert, [0, 'a']);
      addReturnsSameTypeTests(insert, [0, 'a']);


      var addTests = function(message, index, val, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = insert(index, val, data);

          expect(result.length).to.equal(data.length + 1);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var newVal = insert(index, val, data);
          newVal = splitIfNecessary(newVal);
          var result = newVal.every(function(v, i) {
            if (i < index)
              return v === data[i];

            if (i === index)
              return v === val;

            return v === data[i - 1];
          });

          expect(result).to.be.true;
        });
      };


      addTests('for array', 1, 4, [1, 2, 3]);
      addTests('for string', 1, 'd', 'abc');
      addTests('for array when index === length', 3, 4, [1, 2, 3]);
      addTests('for string when index === length', 3, 'd', 'abc');
      addTests('for array when index === 0', 0, 4, [1, 2, 3]);
      addTests('for string when index === 0', 0, 'd', 'abc');
      addTests('for empty array when index === 0', 0, 1, []);
      addTests('for empty string when index === 0', 0, 'a', '');


      it('toString called when inserting non-string in string', function() {
        var obj = {toString: function() {return 'funk';}};
        var result = insert(0, obj, 'ier');

        expect(result).to.equal('funkier');
      });


      testCurriedFunction('insert', insert, [0, 'a', [1, 2, 3]]);
    });


    var removeSpec = {
      name: 'remove',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[0], [[1, 2, 3], 'abc']]
    };


    describeFunction(removeSpec, array.remove, function(remove) {
      addBadNumberTests('index', remove, [], [[1, 2, 3]]);
      addBadNumberTests('index', remove, [], ['bcd']);


      it('Throws if index >= length (1)', function() {
        var fn = function() {
          remove(4, [1, 2, 3]);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if index >= length (2)', function() {
        var fn = function() {
          remove(3, [1, 2, 3]);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if index >= length (3)', function() {
        var fn = function() {
          remove(10, 'bcde');
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if index >= length (4)', function() {
        var fn = function() {
          remove(4, 'bcde');
        };

        expect(fn).to.throw(TypeError);
      });


      addNoModificationOfOriginalTests(remove, [0]);
      addReturnsSameTypeTests(remove, [0]);


      var addTests = function(message, index, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = remove(index, data);

          expect(result.length).to.equal(data.length - 1);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var newVal = remove(index, data);
          newVal = splitIfNecessary(newVal);
          var result = newVal.every(function(v, i) {
            if (i < index)
              return v === data[i];

            return v === data[i + 1];
          });

          expect(result).to.be.true;
        });
      };


      addTests('for array', 1, [1, 2, 3]);
      addTests('for string', 1, 'abc');
      addTests('for array when index === length - 1', 2, [1, 2, 3]);
      addTests('for string when index === length - 1', 2, 'abc');
      addTests('for array when index === 0', 0, [1, 2, 3]);
      addTests('for string when index === 0', 0, 'abc');
      addTests('for singleton array when index === 0', 0, [1]);
      addTests('for singleton string when index === 0', 0, 'a');


      testCurriedFunction('remove', remove, [0, [1, 2, 3]]);
    });


    var replaceSpec = {
      name: 'replace',
      arity: 3,
      restrictions: [[], [], ['array', 'string']],
      validArguments: [[0], ['a'], [[1, 2, 3], 'abc']]
    };


    describeFunction(replaceSpec, array.replace, function(replace) {
      addBadNumberTests('index', replace, [], [1, [1, 2, 3]]);
      addBadNumberTests('index', replace, [], ['a', 'bcd']);


      it('Throws if index >= length (1)', function() {
        var fn = function() {
          replace(4, 0, [1, 2, 3]);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if index >= length (2)', function() {
        var fn = function() {
          replace(3, 0, [1, 2, 3]);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if index >= length (3)', function() {
        var fn = function() {
          replace(10, 'a', 'bcde');
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if index >= length (4)', function() {
        var fn = function() {
          replace(4, 'a', 'bcde');
        };

        expect(fn).to.throw(TypeError);
      });


      addNoModificationOfOriginalTests(replace, [0, 'a']);
      addReturnsSameTypeTests(replace, [0, 'a']);


      var addTests = function(message, index, val, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = replace(index, val, data);

          expect(result.length).to.equal(data.length);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var newVal = replace(index, val, data);
          newVal = splitIfNecessary(newVal);
          var result = newVal.every(function(v, i) {
            if (i !== index)
              return v === data[i];

            return v === val;
          });

          expect(result).to.be.true;
        });
      };


      addTests('for array', 1, 0, [1, 2, 3]);
      addTests('for string', 1, 'd', 'abc');
      addTests('for array when index === length - 1', 2, 0, [1, 2, 3]);
      addTests('for string when index === length - 1', 2, 'd', 'abc');
      addTests('for array when index === 0', 0, 0, [1, 2, 3]);
      addTests('for string when index === 0', 0, 'd', 'abc');
      addTests('for singleton array when index === 0', 0, 0, [1]);
      addTests('for singleton string when index === 0', 0, 'd', 'a');


      it('toString called when replacement is non-string for string', function() {
        var obj = {toString: function() {return 'funk';}};
        var result = replace(0, obj, 'bier');

        expect(result).to.equal('funkier');
      });


      testCurriedFunction('replace', replace, [0, 0, [1, 2, 3]]);
    });


    var addCommonRemoveNotFoundTests = function(message, fnUnderTest, val, originalData) {
      it('Returned value is the correct length ' + message, function() {
        var data = originalData.slice();
        var result = fnUnderTest(val, data);

        expect(result.length).to.equal(data.length);
      });


      it('Returned value has correct elements ' + message, function() {
        var data = originalData.slice();
        var newVal = fnUnderTest(val, data);
        newVal = splitIfNecessary(newVal);
        var result = newVal.every(function(v, i) {
          return v === data[i];
        });

        expect(result).to.be.true;
      });
    };


    var addCommonRemoveValTests = function(testAdder, fnUnderTest) {
      testAdder('for array', 2, [1, 2, 3]);
      testAdder('for string', 'b', 'abc');
      testAdder('for array when value matches last entry', 3, [1, 2, 3]);
      testAdder('for string when value matches last entry', 'c', 'abc');
      testAdder('for array when value matches first entry', 1, [1, 2, 3]);
      testAdder('for string when value matches first entry', 'a', 'abc');
      testAdder('for singleton array when value matches', 1, [1]);
      testAdder('for singleton string when value matches', 'a', 'a');
      testAdder('for array with multiple matches', 1, [1, 2, 3, 1]);
      testAdder('for string with multiple matches', 'a', 'abca');


      addCommonRemoveNotFoundTests('for array when value not found', fnUnderTest, 4, [1, 2, 3]);
      addCommonRemoveNotFoundTests('for string when value not found', fnUnderTest, 'd', 'abc');
      var obj = {foo: 42};
      addCommonRemoveNotFoundTests('for array when value not strictly equal', fnUnderTest, obj,
                       [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('for array when value strictly equal', obj, [{foo: 1}, obj, {foo: 3}]);
    };


    var addCommonRemoveWithTests = function(testAdder, fnUnderTest) {
      testAdder('for array', function(x) {return x.foo === 42;}, [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('for string', base.equals('b'), 'abc');
      testAdder('for array when value matches last entry', function(x) {return x >= 3;}, [1, 2, 3]);
      testAdder('for string when value matches last entry', function(x) {return x >= 'c';}, 'abc');
      testAdder('for array when value matches first entry', function(x) {return x < 2;}, [1, 2, 3]);
      testAdder('for string when value matches first entry', function(x) {return x < 'b';}, 'abc');
      testAdder('for singleton array when value matches', base.equals(1), [1]);
      testAdder('for singleton string when value matches', base.equals('a'), 'a');
      testAdder('for array with multiple matches', function(x) {return x < 10;}, [1, 2, 3, 1]);
      testAdder('for string with multiple matches', function(x) {return x < 'd';}, 'abca');

      addCommonRemoveNotFoundTests('for array when value not found', fnUnderTest,
                             function(x) {return x.foo === 4;}, [{foo: 1}, {foo: 42}, {foo: 3}]);
      addCommonRemoveNotFoundTests('for string when value not found', fnUnderTest, base.constant(false), 'abc');
    };


    var removeOneSpec = {
      name: 'removeOne',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[2], [[1, 2, 3], 'abc']]
    };


    describeFunction(removeOneSpec, array.removeOne, function(removeOne) {
      addNoModificationOfOriginalTests(removeOne, [0]);
      addReturnsSameTypeTests(removeOne, [0]);


      var addTests = function(message, val, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = removeOne(val, data);

          expect(result.length).to.equal(data.length - 1);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var newVal = removeOne(val, data);
          newVal = splitIfNecessary(newVal);
          var deletionSpotFound = false;
          var result = newVal.every(function(v, i) {
            if (deletionSpotFound || data[i] === val) {
              deletionSpotFound = true;
              return v === data[i + 1];
            }

            return v === data[i];
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has one less occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalCount = array.occurrences(val, data).length;
          var newVal = removeOne(val, data);
          var newCount = array.occurrences(val, newVal).length;

          expect(newCount).to.equal(originalCount - 1);
        });


        // And likewise...
        it('Removes first occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalOcc = array.occurrences(val, data);
          var newVal = removeOne(val, data);
          var newOcc = array.occurrences(val, newVal);

          if (originalOcc.length === 1)
            expect(newOcc).to.deep.equal([]);
          else
            expect(newOcc[0]).to.equal(originalOcc[1] - 1);
        });
      };


      addCommonRemoveValTests(addTests, removeOne);


      testCurriedFunction('removeOne', removeOne, [0, [1, 2, 3]]);
    });


    var removeOneWithSpec = {
      name: 'removeOneWith',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[alwaysTrue], [[1, 2, 3], 'abc']]
    };


    describeFunction(removeOneWithSpec, array.removeOneWith, function(removeOneWith) {
      addNoModificationOfOriginalTests(removeOneWith, [alwaysTrue]);
      addReturnsSameTypeTests(removeOneWith, [alwaysTrue]);
      addAcceptsOnlyFixedArityTests(removeOneWith, 1);
      addFuncCalledWithSpecificArityTests(removeOneWith, 1);


      var addTests = function(message, f, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = removeOneWith(f, data);

          expect(result.length).to.equal(data.length - 1);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var newVal = removeOneWith(f, data);
          newVal = splitIfNecessary(newVal);
          var deletionSpotFound = false;
          var result = newVal.every(function(v, i) {
            if (deletionSpotFound || f(data[i])) {
              deletionSpotFound = true;
              return v === data[i + 1];
            }

            return v === data[i];
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has one less occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalCount = array.occurrencesWith(f, data).length;
          var newVal = removeOneWith(f, data);
          var newCount = array.occurrencesWith(f, newVal).length;

          expect(newCount).to.equal(originalCount - 1);
        });


        // And likewise...
        it('Removes first occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalOcc = array.occurrencesWith(f, data);
          var newVal = removeOneWith(f, data);
          var newOcc = array.occurrencesWith(f, newVal);

          if (originalOcc.length === 1)
            expect(newOcc).to.deep.equal([]);
          else
            expect(newOcc[0]).to.equal(originalOcc[1] - 1);
        });
      };


      addCommonRemoveWithTests(addTests, removeOneWith);


      testCurriedFunction('removeOneWith', removeOneWith, [base.constant(true), [1, 2, 3]]);
    });


    var removeAllSpec = {
      name: 'removeAll',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[2], [[1, 2, 3], 'abc']]
    };


    describeFunction(removeAllSpec, array.removeAll, function(removeAll) {
      addNoModificationOfOriginalTests(removeAll, [0]);
      addReturnsSameTypeTests(removeAll, [0]);


      var addTests = function(message, val, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var occurrences = array.occurrences(val, data);
          var result = removeAll(val, data);

          expect(result.length).to.equal(data.length - occurrences.length);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var newVal = removeAll(val, data);
          newVal = splitIfNecessary(newVal);
          var offset = 0;
          var result = newVal.every(function(v, i) {
            while (data[i + offset] === val)
               offset += 1;

            return data[i + offset] === v;
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has no occurrences of value ' + message, function() {
          var data = originalData.slice();
          var newVal = removeAll(val, data);
          var newCount = array.occurrences(val, newVal).length;

          expect(newCount).to.equal(0);
        });
      };


      addCommonRemoveValTests(addTests, removeAll);
      addTests('for array with all matches', 1, [1, 1, 1, 1]);
      addTests('for string with all matches', 'a', 'aaaa');


      testCurriedFunction('removeAll', removeAll, [0, [1, 2, 3]]);
    });


    var removeAllWithSpec = {
      name: 'removeAllWith',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[alwaysTrue], [[1, 2, 3], 'abc']]
    };


    describeFunction(removeAllWithSpec, array.removeAllWith, function(removeAllWith) {
      addNoModificationOfOriginalTests(removeAllWith, [alwaysTrue]);
      addReturnsSameTypeTests(removeAllWith, [alwaysTrue]);
      addAcceptsOnlyFixedArityTests(removeAllWith, 1);
      addFuncCalledWithSpecificArityTests(removeAllWith, 1);


      var addTests = function(message, f, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var originalCount = array.occurrencesWith(f, data).length;
          var result = removeAllWith(f, data);

          expect(result.length).to.equal(data.length - originalCount);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var newVal = removeAllWith(f, data);
          newVal = splitIfNecessary(newVal);
          var offset = 0;
          var result = newVal.every(function(v, i) {
            while (f(data[i + offset]))
               offset += 1;

            return data[i + offset] === v;
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has no occurrences of value ' + message, function() {
          var data = originalData.slice();
          var newVal = removeAllWith(f, data);
          var newCount = array.occurrencesWith(f, newVal).length;

          expect(newCount).to.equal(0);
        });
      };


      addCommonRemoveWithTests(addTests, removeAllWith);
      addTests('for array where every value matches', base.constant(true), [1, 2, 3, 4]);
      addTests('for string where every value matches', base.constant(true), 'abcd');


      testCurriedFunction('removeAllWith', removeAllWith, [base.constant(true), [1, 2, 3]]);
    });


    var addCommonReplaceNotFoundTests = function(message, fnUnderTest, val, newVal, originalData) {
      it('Returned value is the correct length ' + message, function() {
        var data = originalData.slice();
        var result = fnUnderTest(val, newVal, data);

        expect(result.length).to.equal(data.length);
      });


      it('Returned value has correct elements ' + message, function() {
        var data = originalData.slice();
        var replaced = fnUnderTest(val, newVal, data);
        replaced = splitIfNecessary(replaced);
        var result = replaced.every(function(v, i) {
          return v === data[i];
        });

        expect(result).to.be.true;
      });
    };


    var addCommonReplaceValTests = function(testAdder, fnUnderTest) {
      testAdder('for array', 2, 4, [1, 2, 3]);
      testAdder('for string', 'b', 'd', 'abc');
      testAdder('for array with multiple matches', 1, 4, [1, 2, 3, 1]);
      testAdder('for string with multiple matches', 'a', 'd', 'abca');


      addCommonReplaceNotFoundTests('for array when value not found', fnUnderTest, 4, 5, [1, 2, 3]);
      addCommonReplaceNotFoundTests('for string when value not found', fnUnderTest, 'd', 'e', 'abc');
      var obj = {foo: 42};
      addCommonReplaceNotFoundTests('for array when value not strictly equal', fnUnderTest, obj, {foo: 52},
                       [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('for array when value strictly equal', obj, {foo: 62}, [{foo: 1}, obj, {foo: 3}]);
    };


    var addCommonReplaceWithTests = function(testAdder, fnUnderTest) {
      testAdder('for array', function(x) {return x.foo === 42;}, {foo: 52}, [{foo: 1}, {foo: 42}, {foo: 3}]);
      testAdder('for string', base.equals('b'), 'd', 'abc');
      testAdder('for array with multiple matches', function(x) {return x < 10;}, 11, [1, 2, 3, 1]);
      testAdder('for string with multiple matches', function(x) {return x < 'd';}, 'e', 'abca');

      addCommonReplaceNotFoundTests('for array when value not found', fnUnderTest,
                             function(x) {return x.foo === 4;}, {foo: 52}, [{foo: 1}, {foo: 42}, {foo: 3}]);
      addCommonReplaceNotFoundTests('for string when value not found', fnUnderTest, base.constant(false), 'd', 'abc');
    };


    var replaceOneSpec = {
      name: 'replaceOne',
      arity: 3,
      restrictions: [[], [], ['array', 'string']],
      validArguments: [[2], [4], [[1, 2, 3], 'abc']]
    };


    describeFunction(replaceOneSpec, array.replaceOne, function(replaceOne) {
      addNoModificationOfOriginalTests(replaceOne, [0, 1]);
      addReturnsSameTypeTests(replaceOne, [0, 1]);


      var addTests = function(message, val, newVal, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = replaceOne(val, newVal, data);

          expect(result.length).to.equal(data.length);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var replaced = replaceOne(val, newVal, data);
          replaced = splitIfNecessary(replaced);
          var found = false;
          var result = replaced.every(function(v, i) {
            if (!found && data[i] === val) {
              found = true;
              return v === newVal;
            }

            return v === data[i];
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has one less occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalCount = array.occurrences(val, data).length;
          var replaced = replaceOne(val, newVal, data);
          var newCount = array.occurrences(val, replaced).length;

          expect(newCount).to.equal(originalCount - 1);
        });


        // And likewise...
        it('Replaces first occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalOcc = array.occurrences(val, data);
          var replaced = replaceOne(val, newVal, data);
          var newOcc = array.occurrences(newVal, replaced);

          expect(newOcc[0]).to.equal(originalOcc[0]);
        });
      };


      addCommonReplaceValTests(addTests, replaceOne);


      testCurriedFunction('replaceOne', replaceOne, [0, 1, [1, 2, 3]]);
    });


    var replaceOneWithSpec = {
      name: 'replaceOneWith',
      arity: 3,
      restrictions: [['function'], [], ['array', 'string']],
      validArguments: [[alwaysTrue], [1], [[1, 2, 3], 'abc']]
    };


    describeFunction(replaceOneWithSpec, array.replaceOneWith, function(replaceOneWith) {
      addNoModificationOfOriginalTests(replaceOneWith, [alwaysTrue, 1]);
      addReturnsSameTypeTests(replaceOneWith, [alwaysTrue, 'a']);
      addAcceptsOnlyFixedArityTests(replaceOneWith, 1, ['a']);
      addFuncCalledWithSpecificArityTests(replaceOneWith, 1, ['a']);


      var addTests = function(message, f, newVal, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = replaceOneWith(f, newVal, data);

          expect(result.length).to.equal(data.length);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var replaced = replaceOneWith(f, newVal, data);
          replaced = splitIfNecessary(replaced);
          var found = false;
          var result = replaced.every(function(v, i) {
            if (!found && f(data[i])) {
              found = true;
              return v === newVal;
            }

            return v === data[i];
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has one less occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalCount = array.occurrencesWith(f, data).length;
          var replaced = replaceOneWith(f, newVal, data);
          var newCount = array.occurrencesWith(f, replaced).length;

          expect(newCount).to.equal(originalCount - 1);
        });


        // And likewise...
        it('Replaces first occurrence of value ' + message, function() {
          var data = originalData.slice();
          var originalOcc = array.occurrencesWith(f, data);
          var replaced = replaceOneWith(f, newVal, data);
          var newOcc = array.occurrencesWith(f, replaced);

          if (originalOcc.length === 1)
            expect(newOcc).to.deep.equal([]);
          else
            expect(newOcc[0]).to.equal(originalOcc[1]);
        });
      };


      addCommonReplaceWithTests(addTests, replaceOneWith);


      testCurriedFunction('replaceOneWith', replaceOneWith, [base.constant(true), 4, [1, 2, 3]]);
    });


    var replaceAllSpec = {
      name: 'replaceAll',
      arity: 3,
      restrictions: [[], [], ['array', 'string']],
      validArguments: [[2], [4], [[1, 2, 3], 'abc']]
    };


    describeFunction(replaceAllSpec, array.replaceAll, function(replaceAll) {
      addNoModificationOfOriginalTests(replaceAll, [0, 1]);
      addReturnsSameTypeTests(replaceAll, [0, 1]);


      var addTests = function(message, val, newVal, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = replaceAll(val, newVal, data);

          expect(result.length).to.equal(data.length);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var replaced = replaceAll(val, newVal, data);
          replaced = splitIfNecessary(replaced);
          var result = replaced.every(function(v, i) {
            if (data[i] === val)
              return v === newVal;

            return v === data[i];
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has no occurrences of value ' + message, function() {
          var data = originalData.slice();
          var replaced = replaceAll(val, newVal, data);
          var newCount = array.occurrences(val, replaced).length;

          expect(newCount).to.equal(0);
        });


        // And likewise...
        it('Replaces all occurrences of value ' + message, function() {
          var data = originalData.slice();
          var originalOcc = array.occurrences(val, data);
          var replaced = replaceAll(val, newVal, data);
          var newOcc = array.occurrences(newVal, replaced);
          var result = newOcc.every(function(idx, i) {
            return idx === originalOcc[i];
          });

          expect(result).to.be.true;
        });
      };


      addCommonReplaceValTests(addTests, replaceAll);


      testCurriedFunction('replaceAll', replaceAll, [0, 1, [1, 2, 3]]);
    });


    var replaceAllWithSpec = {
      name: 'replaceAllWith',
      arity: 3,
      restrictions: [['function'], [], ['array', 'string']],
      validArguments: [[alwaysTrue], ['e'], [[1, 2, 3], 'abc']]
    };


    describeFunction(replaceAllWithSpec, array.replaceAllWith, function(replaceAllWith) {
      addNoModificationOfOriginalTests(replaceAllWith, [alwaysTrue, 'e']);
      addReturnsSameTypeTests(replaceAllWith, [alwaysTrue, 'e']);
      addAcceptsOnlyFixedArityTests(replaceAllWith, 1, ['e']);
      addFuncCalledWithSpecificArityTests(replaceAllWith, 1, ['e']);


      var addTests = function(message, f, newVal, originalData) {
        it('Returned value is the correct length ' + message, function() {
          var data = originalData.slice();
          var result = replaceAllWith(f, newVal, data);

          expect(result.length).to.equal(data.length);
        });


        it('Returned value has correct elements ' + message, function() {
          var data = originalData.slice();
          var replaced = replaceAllWith(f, newVal, data);
          replaced = splitIfNecessary(replaced);
          var result = replaced.every(function(v, i) {
            if (f(data[i]))
               return v === newVal;

            return data[i] === v;
          });

          expect(result).to.be.true;
        });


        // Although any errors would be caught by the previous test, I prefer to
        // make this explicit
        it('Returned value has no occurrences of value ' + message, function() {
          var data = originalData.slice();
          var replaced = replaceAllWith(f, newVal, data);
          var newCount = array.occurrencesWith(f, replaced).length;

          expect(newCount).to.equal(0);
        });


        // And likewise...
        it('Replaces all occurrences of value ' + message, function() {
          var data = originalData.slice();
          var originalOcc = array.occurrencesWith(f, data);
          var replaced = replaceAllWith(f, newVal, data);
          var newOcc = array.occurrences(newVal, replaced);
          var result = newOcc.every(function(idx, i) {
            return idx === originalOcc[i];
          });

          expect(result).to.be.true;
        });
      };


      addCommonReplaceWithTests(addTests, replaceAllWith);
      addTests('for array where every value matches', function(x) {return x < 5;}, 5, [1, 2, 3, 4]);
      addTests('for string where every value matches', function(x) {return x < 'e';}, 'e', 'abcd');


      testCurriedFunction('replaceAllWith', replaceAllWith, [base.constant(true), 4, [1, 2, 3]]);
    });


    var joinSpec = {
      name: 'join',
      arity: 2,
      restrictions: [[], ['array']],
      validArguments: [[' '], [[1, 2, 3]]]
    };


    describeFunction(joinSpec, array.join, function(join) {
      it('Works correctly for empty array', function() {
        expect(join('-', [])).to.equal('');
      });


      it('Works correctly for singleton array', function() {
        var arr = [1];

        expect(join('-', arr)).to.equal(arr[0].toString());
      });


      var addTests = function(message, str, originalData) {
        it('Returns a string ' + message, function() {
          var data = originalData.slice();
          var result = join(str, data);

          expect(result).to.be.a('string');
        });


        it('Returned value is correct ' + message, function() {
          var data = originalData.slice();
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


      addTests('in normal case', ':', ['a', 'b', 'c']);
      addTests('when array values are not strings', '_', [1, 2, 3]);
      addTests('when join value is not a string', {toString: function() {return '-';}}, [1, 2, 3]);


      testCurriedFunction('join', join, [', ', [4, 5, 6]]);
    });


    var flattenSpec = {
      name: 'flatten',
      arity: 1,
      restrictions: [['array']],
      validArguments: [[[[1, 2], [3, 4]]]]
    };


    describeFunction(flattenSpec, array.flatten, function(flatten) {
      var notArray = [3, true, undefined, null, {}, function() {}];

      notArray.forEach(function(val, i) {
        it('Throws if any element not an array (' + (3 * i + 1) + ')', function() {
          var arr = [val, [1, 2], [3, 4]];
          var fn = function() {
            flatten(arr);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if any element not an array (' + (3 * i + 2) + ')', function() {
          var arr = [[1, 2], val, [3, 4]];
          var fn = function() {
            flatten(arr);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if any element not an array (' + (3 * i + 3) + ')', function() {
          var arr = [[1, 2], [3, 4], val];
          var fn = function() {
            flatten(arr);
          };

          expect(fn).to.throw(TypeError);
        });
      });


      it('Returns empty array when supplied empty array ', function() {
        expect(flatten([])).to.deep.equal([]);
      });


      var addTests = function(message, originalData) {
        it('Result is an array ' + message, function() {
          var data = originalData.slice();
          var result = flatten(data);

          expect(Array.isArray(data)).to.be.true;
        });


        it('Result has correct length ' + message, function() {
          var data = originalData.slice();
          var expected = array.sum(array.map(array.length, data.slice()));
          var flattened = flatten(data);

          expect(flattened.length).to.equal(expected);
        });


        it('Result has correct contents ' + message, function() {
          var data = originalData.slice();
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


      addTests('for normal case', [[1, 2], [3, 4], [5, 6]]);
      addTests('for singleton', [[1]]);
      addTests('when some values are strings', [[1, 2], 'abc', 'funkier', [5, 6]]);
      addTests('when all values are strings', ['funkierJS', 'is', 'the', 'best']);


      it('Only removes one layer (1)', function() {
        var data = [[[1, 2], [3, 4]], [[5, 6], [7, 8]]];
        var flattened = flatten(data);
        var result = flattened.every(function(val, i) {
          return Array.isArray(val) && val === data[Math.floor(i / 2)][i % 2];
        });

        expect(result).to.be.true;
      });


      it('Only removes one layer (2)', function() {
        var data = [['funkier', 'is'], ['the', 'best']];
        var flattened = flatten(data);
        var result = flattened.every(function(val, i) {
          return typeof(val) === 'string' && val === data[Math.floor(i / 2)][i % 2];
        });

        expect(result).to.be.true;
      });
    });


    var flattenMapSpec = {
      name: 'flattenMap',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[array.replicate(2)], [[1, 2, 3], 'abc']]
    };


    describeFunction(flattenMapSpec, array.flattenMap, function(flattenMap) {
      addAcceptsOnlyFixedArityTests(flattenMap, 1, [], false, base.constant([]));


      var addTest = function(message, f, originalData) {
        it('Works correctly ' + message, function() {
          var data = originalData.slice();
          var result = flattenMap(f, data);

          expect(result).to.deep.equal(array.flatten(array.map(f, data)));
        });
      };


      addTest('(1)', array.range(1), [2, 3, 4, 5]);
      addTest('(2)', array.replicate(2), 'abc');
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
