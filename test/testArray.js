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
    var expectedFunctions = ['length', 'getIndex', 'head', 'last', 'repeat', 'map', 'each', 'filter',
                             'foldl', 'foldl1', 'foldr', 'foldr1', 'every', 'some', 'maximum', 'minimum',
                             'sum', 'product', 'element', 'elementWith', 'range', 'rangeStep', 'take',
                             'drop', 'init', 'tail', 'inits', 'tails', 'copy', 'slice', 'takeWhile',
                             'dropWhile', 'prepend', 'append', 'concat', 'isEmpty', 'intersperse',
                             'reverse'];

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
    var addBadNumberTests = function(paramName, fnUnderTest, argsBefore, argsAfter) {
      it('Throws when ' + paramName + ' is negative', function() {
        var fn = function() {
          fnUnderTest.apply(null, argsBefore.concat([-1]).concat(argsAfter));
        };

        expect(fn).to.throw(TypeError);
      });


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
    var addAcceptsOnlyFixedArityTests = function(fnUnderTest, type, requiredArity, argsBefore, argsAfter, isMinimum) {
      isMinimum = isMinimum || false;

      var funcs = [
        function() {},
        function(x) {},
        function(x, y) {},
        function(x, y, z) {},
        function(w, x, y, z) {}
      ];

      funcs.forEach(function(f, i) {
        if ((!isMinimum && i !== requiredArity) || (isMinimum && i < requiredArity)) {
          it('Throws when called with ' + type + ' and function of arity ' + i, function() {
            var fn = function() {
              fnUnderTest.apply(null, argsBefore.concat([f]).concat(argsAfter));
            };

            expect(fn).to.throw(TypeError);
          });
        } else {
          it('Does not throw when called with ' + type + ' and function of arity ' + i, function() {
            var fn = function() {
              fnUnderTest.apply(null, argsBefore.concat([f]).concat(argsAfter));
            };

            expect(fn).to.not.throw(TypeError);
          });
        }
      });
    };


    // Several functions expect the first argument to be a function that should be always be called with a
    // specific number of arguments
    var addFuncCalledWithSpecificArityTests = function(fnUnderTest, type, requiredArgs, argsBefore, argsAfter) {
      if (requiredArgs > 2)
        throw new Error('Incorrect test: addFuncCalledWithSpecificArityTests called with ' + requiredArgs);

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

        fnUnderTest.apply(null, argsBefore.concat([f]).concat(argsAfter));
        var result = allArgs.every(function(arr) {
          return arr.length === requiredArgs;
        });

        expect(result).to.be.true;
      });
    };


    // Several functions expect that  the function being tested should be called with each element
    // of the given object, in order.
    var addCalledWithEveryMemberTests = function(fnUnderTest, type, argsBefore, argsAfter, isArity2, isRTL, skipsFirst) {
      // only the fold* functions have arity 2
      isArity2 = isArity2 || false;
      // only the foldr* functions operate RTL
      isRTL = isRTL || false;
      // only the fold*1 functions skip the first element
      skipsFirst = skipsFirst || false;

      it('Called the correct number of times for ' + type, function() {
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

        fnUnderTest.apply(null, argsBefore.concat([f]).concat(argsAfter));
        var source = argsAfter[argsAfter.length - 1];

        // allArgs now contains each element that our function was called with
        expect(allArgs.length).to.equal(skipsFirst ? source.length - 1 : source.length);
      });


      it('Called with every element of ' + type, function() {
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

        fnUnderTest.apply(null, argsBefore.concat([f]).concat(argsAfter));

        // allArgs now contains each element that our function was called with
        var source = argsAfter[argsAfter.length - 1];
        source = splitIfNecessary(source);
        var numElems = source.length - 1;

        var result = source.every(function(elem, i) {
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


    // Several functions expect that the result should be distinct from the original
    // value, not harming the original value in any way
    var addNoModificationOfOriginalTests = function(fnUnderTest, argsBefore) {
      var addOne = function(type, testData) {
        it('Doesn\'t modify original ' + type + ' value', function() {
          var original = testData.slice();
          var copy = testData.slice();
          var fnResult = fnUnderTest.apply(null, argsBefore.concat([original]));
          var stillSameLength = original.length === copy.length;
          original = splitIfNecessary(original);

          var result = original.every(function(v, i) {
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
      var addOne = function(type, testData) {
        it('Returns ' + type + ' when called with ' + type, function() {
          var result = fnUnderTest.apply(null, argsBefore.concat([testData]));

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


      it('Returns empty array when called with empty string', function() {
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


    var getIndexSpec = {
      name: 'getIndex',
      arity: 2
    };


    describeFunction(getIndexSpec, array.getIndex, function(getIndex) {
      it('Works for arrays (1)', function() {
        var a = [1, 7, 0, 42];
        var result = getIndex(1, a);

        expect(result).to.equal(a[1]);
      });


      it('Works for arrays (2)', function() {
        var a = [1, 7, 0, 42];
        var result = getIndex(0, a);

        expect(result).to.equal(a[0]);
      });


      it('Throws for values outside range (1)', function() {
        var a = [1, 2, 3];
        var fn = function() {
          getIndex(4, a);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Works for strings (1)', function() {
        var a = 'dcba';
        var result = getIndex(1, a);

        expect(result).to.equal(a[1]);
      });


      it('Works for strings (2)', function() {
        var a = 'funkier';
        var result = getIndex(0, a);

        expect(result).to.equal(a[0]);
      });


      it('Throws for values outside range (2)', function() {
        var a = 'abc';
        var fn = function() {
          getIndex(4, a);
        };

        expect(fn).to.throw(TypeError);
      });


      addThrowsOnEmptyTests(getIndex, [0]);
      addBadNumberTests('index', getIndex, [], [[1, 2, 3]]);
      addBadNumberTests('index', getIndex, [], ['abc']);
      testCurriedFunction('getIndex', getIndex, [1, ['a', 'b']]);
    });


    // The tests for head and tail are very similar, and can be generated
    var makeElementSelectorTest = function(desc, fnUnderTest, isFirst) {
      var spec = {
        name: desc,
        arity: 1
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        it('Works for arrays (1)', function() {
          var a = [1, 7, 0, 42];
          var result = fnUnderTest(a);

          expect(result).to.equal(a[isFirst ? 0 : a.length - 1]);
        });


        it('Works for arrays (2)', function() {
          var a = [42];
          var result = fnUnderTest(a);

          expect(result).to.equal(a[isFirst ? 0 : a.length - 1]);
        });


        it('Works for strings (1)', function() {
          var a = 'dcba';
          var result = fnUnderTest(a);

          expect(result).to.equal(a[isFirst ? 0 : a.length - 1]);
        });


        it('Works for strings (2)', function() {
          var a = 'funkier';
          var result = fnUnderTest(a);

          expect(result).to.equal(a[isFirst ? 0 : a.length - 1]);
        });


        addThrowsOnEmptyTests(fnUnderTest, []);
      });
    };


    makeElementSelectorTest('head', array.head, true);
    makeElementSelectorTest('last', array.last, false);


    var repeatSpec = {
      name: 'repeatSpec',
      arity: 2
    };


    describeFunction(repeatSpec, array.repeat, function(repeat) {
      it('Returns array (1)', function() {
        var howMany = 10;
        var obj = 'a';
        var result = repeat(howMany, obj);

        expect(Array.isArray(result)).to.be.true;
      });


      it('Returns array (2)', function() {
        var howMany = 1;
        var obj = 2;
        var result = repeat(howMany, obj);

        expect(Array.isArray(result)).to.be.true;
      });


      it('Returned array has correct length (1)', function() {
        var howMany = 10;
        var obj = 'a';
        var result = repeat(howMany, obj);

        expect(result.length).to.equal(howMany);
      });


      it('Returned array has correct length (2)', function() {
        var howMany = 1;
        var obj = 2;
        var result = repeat(howMany, obj);

        expect(result.length).to.equal(howMany);
      });


      it('Returned array\'s elements strictly equal parameter (1)', function() {
        var howMany = 10;
        var obj = 'a';
        var result = repeat(howMany, obj).every(function(e) {
          return e === obj;
        });

        expect(result).to.be.true;
      });


      it('Returned array\'s elements strictly equal parameter (2)', function() {
        var howMany = 10;
        var obj = {};
        var result = repeat(howMany, obj).every(function(e) {
          return e === obj;
        });

        expect(result).to.be.true;
      });


      it('Works when count is zero', function() {
        var result = repeat(0, 'a');

        expect(result).to.deep.equal([]);
      });


      addBadNumberTests('length', repeat, [], ['a']);
      addBadNumberTests('length', repeat, [], [1]);
      testCurriedFunction('repeat', repeat, [1, 1]);
    });


    var mapSpec = {
      name: 'map',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function() {}], [['a'], 'a']]
    };


    describeFunction(mapSpec, array.map, function(map) {
      it('Returns an array when called with an array', function() {
        var result = map(base.id, ['a', 1, true]);

        expect(Array.isArray(result)).to.be.true;
      });


      it('Returns an array when called with a string', function() {
        var result = map(base.id, 'abc');

        expect(Array.isArray(result)).to.be.true;
      });


      it('Returned array has correct length for array', function() {
        var arr = [2, null];
        var result = map(base.id, arr);

        expect(result.length).to.equal(arr.length);
      });


      it('Retured array has correct length for string', function() {
        var s = 'dcba';
        var result = map(base.id, s);

        expect(result.length).to.equal(s.length);
      });


      addFuncCalledWithSpecificArityTests(map, 'array', 1, [], [[1, 2, 3]], true);
      addFuncCalledWithSpecificArityTests(map, 'string', 1, [], ['abc'], true);
      addCalledWithEveryMemberTests(map, 'array', [], [[1, 2, 3]]);
      addCalledWithEveryMemberTests(map, 'string', [], ['abc']);


      it('Returned array correct for array', function() {
        var arr = [1, 2, 3];
        var f = function(x) {return x + 1;};
        var result = map(f, arr).every(function(val, i) {
          return val === f(arr[i]);
        });

        expect(result).to.be.true;
      });


      it('Returned array correct for string', function() {
        var arr = 'bdc';
        var f = function(x) {return x.toUpperCase();};
        var result = map(f, arr).every(function(val, i) {
          return val === f(arr[i]);
        });

        expect(result).to.be.true;
      });


      it('Returns empty array when called with empty array', function() {
        var result = map(function(x) {}, []);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when called with empty string', function() {
        var result = map(function(x) {}, '');

        expect(result).to.deep.equal([]);
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
      it('Returns undefined when called with an array', function() {
        var result = each(base.id, ['a', 1, true]);

        expect(result === undefined).to.be.true;
      });


      it('Returns undefined when called with a string', function() {
        var result = each(base.id, 'abc');

        expect(result === undefined).to.be.true;
      });


      addFuncCalledWithSpecificArityTests(each, 'array', 1, [], [[1, 2, 3]]);
      addFuncCalledWithSpecificArityTests(each, 'string', 1, [], ['abc']);
      addCalledWithEveryMemberTests(each, 'array', [], [[1, 2, 3]]);
      addCalledWithEveryMemberTests(each, 'string', [], ['abc']);


      testCurriedFunction('each', each, [base.id, [1, 2]]);
    });


    var filterSpec = {
      name: 'filter',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x) {}], [['a'], 'a']]
    };


    describeFunction(filterSpec, array.filter, function(filter) {
      it('Returned array has correct length when called with an array (1)', function() {
        var arr = [2, null];
        var result = filter(base.constant(true), arr);

        expect(result.length).to.equal(arr.length);
      });


      it('Returned array has correct length when called with an array (2)', function() {
        var arr = [1, 2, 3, 4];
        var f = function(x) {return x % 2 === 0;};
        var result = filter(f, arr);

        expect(result.length).to.equal(2);
      });


      it('Returned string has correct length when called with a string (1)', function() {
        var s = 'abc';
        var result = filter(base.constant(true), s);

        expect(result.length).to.equal(s.length);
      });


      it('Returned array has correct length when called with an array (2)', function() {
        var s = 'banana';
        var f = function(c) {return c  === 'a';};
        var result = filter(f, s);

        expect(result.length).to.equal(3);
      });


      addReturnsSameTypeTests(filter, [base.constant(true)]);
      addAcceptsOnlyFixedArityTests(filter, 'array', 1, [], [[1, 2, 3]]);
      addAcceptsOnlyFixedArityTests(filter, 'string', 1, [], ['abc']);
      addFuncCalledWithSpecificArityTests(filter, 'array', 1, [], [[4, 2]]);
      addFuncCalledWithSpecificArityTests(filter, 'string', 1, [], ['funkier']);
      addCalledWithEveryMemberTests(filter, 'array', [], [[1, 2, 3]]);
      addCalledWithEveryMemberTests(filter, 'string', [], ['abc']);
      addNoModificationOfOriginalTests(filter, [base.constant(true)]);
      addReturnsEmptyOnEmptyTests(filter, [base.constant(true)]);


      it('Returned array correct when called with an array (1)', function() {
        var arr = [2, null];
        var result = filter(base.constant(true), arr);

        expect(result).to.deep.equal(arr);
      });


      it('Returned array correct when called with an array (2)', function() {
        var arr = [1, 2, 3, 4];
        var f = function(x) {return x % 2 !== 0;};
        var result = filter(f, arr);

        expect(result).to.deep.equal([1, 3]);
      });


      it('Returned string correct when called with a string (1)', function() {
        var s = 'abc';
        var result = filter(base.constant(true), s);

        expect(result).to.equal(s);
      });


      it('Returned array has correct length when called with an array (2)', function() {
        var s = 'banana';
        var f = function(c) {return c  !== 'a';};
        var result = filter(f, s);

        expect(result).to.equal('bnn');
      });


      it('Preserves order when called with an array', function() {
        var a = [1, 2, 3, 4, 5, 6];
        var f = function(x) {return x % 2 !== 0;};
        var result = true;
        var filtered = filter(f, a);
        for (var i = 1, l = filtered.length; i < l; i++) {
          if (a.indexOf(filtered[i - 1]) > a.indexOf(filtered[i]))
            result = false;
        }

        expect(result).to.be.true;
      });


      it('Preserves order when called with an string', function() {
        var s = 'funkier';
        var f = function(x) {return 'aeiou'.indexOf(x) === 1;};
        var result = true;
        var filtered = filter(f, s);
        for (var i = 1, l = filtered.length; i < l; i++) {
          if (s.indexOf(filtered[i - 1]) > s.indexOf(filtered[i]))
            result = false;
        }

        expect(result).to.be.true;
      });


      it('Returned elements are precisely those from the original array', function() {
        var a = [{}, {}, {}, {}];
        var f = base.constant(true);
        var result = filter(f, a).every(function(e, i) {
            return e === a[i];
        });

        expect(result).to.be.true;
      });


      testCurriedFunction('filter', filter, [base.constant(true), [1, 2]]);
    });


    var addCommonFoldTests = function(desc, fnUnderTest, is1Func, isRTL) {
      var afterArgsArr = is1Func ? [[1, 2, 3]] : [0, [1, 2, 3]];
      var afterArgsStr = is1Func ? ['abc'] : [0, 'abc'];


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


      addAcceptsOnlyFixedArityTests(fnUnderTest, 'array', 2, [], afterArgsArr);
      addAcceptsOnlyFixedArityTests(fnUnderTest, 'string', 2, [], afterArgsStr);
      addFuncCalledWithSpecificArityTests(fnUnderTest, 'array', 2, [], [[1, 2, 3]]);
      addFuncCalledWithSpecificArityTests(fnUnderTest, 'string', 2, [], 'abc');
      addCalledWithEveryMemberTests(fnUnderTest, 'array', [], afterArgsArr, true, isRTL, is1Func);
      addCalledWithEveryMemberTests(fnUnderTest, 'string', [], afterArgsStr, true, isRTL, is1Func);
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

        var addPrematureTests = function(type, num, val) {
          it('Stops prematurely when called with ' + type + ' and ' + trigger + ' returned (' + num + ')', function() {
            var calls = 0;
            var f = function(x) {
              calls += 1;
              if (calls === val.length - 1)
                return trigger;
              return okVal;
            }
            fnUnderTest(f, val);

            expect(calls).to.equal(val.length - 1);
          });


          it('Called with correct values when called with ' + type + ' and ' + trigger + ' returned (' + num + ')', function() {
            var vals = [];
            var calls = 0;
            var f = function(x) {
              vals.push(x);
              calls += 1;
              if (calls === val.length - 1)
                return trigger;
              return okVal;
            }
            fnUnderTest(f, val);
            var result = vals.every(function(elem, i) {
              return val[i] === elem;
            });

            expect(result).to.be.true;
          });


          it('Returns correctly when called with ' + type + ' and ' + trigger + ' returned (' + num + ')', function() {
            var calls = 0;
            var f = function(x) {
              calls += 1;
              if (calls === val.length - 1)
                return trigger;
              return okVal;
            }
            var result = fnUnderTest(f, val);

            expect(result).to.equal(trigger);
          });
        };


        var addNormalTests = function(type, num, val) {
          it('Called with all values when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var calls = 0;
            var f = function(x) {
              calls += 1;
              return okVal;
            }
            fnUnderTest(f, val);

            expect(calls).to.equal(val.length);
          });


          it('Called with correct values when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var vals = [];
            var calls = 0;
            var f = function(x) {
              vals.push(x);
              calls += 1;
              return okVal;
            }
            fnUnderTest(f, val);
            var result = vals.every(function(elem, i) {
              return val[i] === elem;
            });

            expect(result).to.be.true;
          });


          it('Returns correctly when called with ' + type + ' and ' + okVal + ' returned (' + num + ')', function() {
            var calls = 0;
            var f = function(x) {
              calls += 1;
              return okVal;
            }
            var result = fnUnderTest(f, val);

            expect(result).to.equal(okVal);
          });
        };


        var addShortCircuitTests = function(type, num, val) {
          addPrematureTests(type, num, val);
          addNormalTests(type, num, val);
        };


        addAcceptsOnlyFixedArityTests(fnUnderTest, 'array', 1, [], [[1, 2, 3]]);
        addAcceptsOnlyFixedArityTests(fnUnderTest, 'string', 1, [], ['abc']);
        addFuncCalledWithSpecificArityTests(fnUnderTest, 'array', 1, [], [[1, 2, 3]]);
        addFuncCalledWithSpecificArityTests(fnUnderTest, 'string', 1, [], 'abc');
        addPrematureEndTests(fnUnderTest, trigger);
        addRunsToEndTests(fnUnderTest, trigger);
        addShortCircuitTests('array', 1, [1, 2, 3]);
        addShortCircuitTests('array', 2, [{}, {}, {}, {}]);
        addShortCircuitTests('string', 1, 'abc');
        addShortCircuitTests('string', 2, 'abcd');


        testCurriedFunction(desc, fnUnderTest, [base.constant(true), [1, 2, 3]]);
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


    var elementSpec = {
      name: 'element',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [['a'], [['a', 'b', 'c'], 'abc']]
    };


    describeFunction(elementSpec, array.element, function(element) {
      it('Returns correct result for empty arrays', function() {
        var result = element(2, []);

        expect(result).to.be.false;
      });


      it('Returns correct result for empty strings', function() {
        var result = element('a', '');

        expect(result).to.be.false;
      });


      it('Returns correct result when element not present in array', function() {
        var result = element(5, [1, 3, 4]);

        expect(result).to.be.false;
      });


      it('Returns correct result when element not present in string', function() {
        var result = element('e', 'bcd');

        expect(result).to.be.false;
      });


      it('Returns correct result when element present in array', function() {
        var result = element(6, [1, 6, 4]);

        expect(result).to.be.true;
      });


      it('Returns correct result when element not present in string', function() {
        var result = element('c', 'bcd');

        expect(result).to.be.true;
      });


      it('Tests with identity for arrays (1)', function() {
        var obj = {foo: 1};
        var a = [{foo: 1}, {foo: 1}, {foo: 1}];
        var result = element(obj, a);

        expect(result).to.be.false;
      });


      it('Tests with identity for arrays (2)', function() {
        var obj = {foo: 1};
        var a = [{foo: 1}, {foo: 1}, {foo: 1}, obj];
        var result = element(obj, a);

        expect(result).to.be.true;
      });


      testCurriedFunction('element', element, [2, [1, 2, 3]]);
    });


    var elementWithSpec = {
      name: 'element',
      arity: 2,
      restrictions: [['function'], ['array', 'string']],
      validArguments: [[function(x) {return true;}], [['a', 'b', 'c'], 'abc']]
    };


    describeFunction(elementWithSpec, array.elementWith, function(elementWith) {
      addAcceptsOnlyFixedArityTests(elementWith, 'array', 1, [], [[1, 2, 3]]);
      addAcceptsOnlyFixedArityTests(elementWith, 'string', 1, [], ['abc']);


      it('Returns correct result for empty arrays', function() {
        var f = function(x) {return true;};
        var result = elementWith(f, []);

        expect(result).to.be.false;
      });


      it('Returns correct result for empty strings', function() {
        var f = function(x) {return true;};
        var result = elementWith(f, '');

        expect(result).to.be.false;
      });


      it('Returns correct result when elementWith does not match elements in array', function() {
        var f = function(x) {return 'foo' in x && x.foo === 5;};
        var result = elementWith(f, [{foo: 1}, {foo: 3}, {foo: 4}]);

        expect(result).to.be.false;
      });


      it('Returns correct result when elementWith does not match elements in string', function() {
        var f = function(x) {return x >= '0' && x <= '9';};
        var result = elementWith(f, 'bcd');

        expect(result).to.be.false;
      });


      it('Returns correct result when elementWith matches element in array', function() {
        var f = function(x) {return 'foo' in x && x.foo === 7;};
        var result = elementWith(f, [{foo: 1}, {foo: 7}, {foo: 4}]);

        expect(result).to.be.true;
      });


      it('Returns correct result when elementWith matches element in string', function() {
        var f = function(x) {return x >= '0' && x <= '9';};
        var result = elementWith(f, 'bc7d');

        expect(result).to.be.true;
      });


      testCurriedFunction('elementWith', elementWith, [function(x) {return true;}, [1, 2, 3]]);
    });


    var rangeSpec = {
      name: 'range',
      arity: 2
    };


    describeFunction(rangeSpec, array.range, function(range) {
      it('Throws if b < a', function() {
        var fn = function() {
          range(1, 0);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Returns empty array if b === a', function() {
        var result = range(1, 1);

        expect(result).to.deep.equal([]);
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


      it('Does not include right-hand limit (1)', function() {
        var a = 0;
        var b = 10;
        var arr = range(a, b);

        expect(array.last(arr) < b).to.be.true;
      });


      it('Does not include right-hand limit (2)', function() {
        var a = 1.1;
        var b = 15.2;
        var arr = range(a, b);

        expect(array.last(arr) < b).to.be.true;
      });


      testCurriedFunction('range', array.range, [1, 5]);
    });


    var rangeStepSpec = {
      name: 'rangeSpec',
      arity: 3
    };


    describeFunction(rangeStepSpec, array.rangeStep, function(rangeStep) {
      it('Throws if b < a, and step positive', function() {
        var fn = function() {
          rangeStep(1, 1, 0);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if b > a, and step negative', function() {
        var fn = function() {
          rangeStep(1, -1, 10);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if b < a, and step zero', function() {
        var fn = function() {
          rangeStep(1, 0, 0);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if b > a, and step zero', function() {
        var fn = function() {
          rangeStep(1, 0, 10);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Returns empty array if b === a (1)', function() {
        var result = rangeStep(1, 1, 1);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array if b === a (2)', function() {
        var result = rangeStep(1, -1, 1);

        expect(result).to.deep.equal([]);
      });


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
        var b = 1.1
        var arr = rangeStep(a, step, b);
        var result = arr.every(function(val, i) {
          return (i === 0 && val === a) || (val === arr[i - 1] + step);
        });

        expect(result).to.be.true;
      });


      it('Does not include right-hand limit (1)', function() {
        var a = 0;
        var step = 2;
        var b = 10;
        var arr = rangeStep(a, step, b);

        expect(array.last(arr) < b).to.be.true;
      });


      it('Does not include right-hand limit (2)', function() {
        var a = 15.2;
        var step = -1.1;
        var b = 1.1
        var arr = rangeStep(a, step, b);

        expect(array.last(arr) > b).to.be.true;
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
      addBadNumberTests('count', take, [], [[1, 2, 3]]);
      addBadNumberTests('count', take, [], ['abc']);


      it('Returns empty array when count is 0 for array (1)', function() {
        var result = take(0, [2, 3, 4]);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty array when count is 0 for array (2)', function() {
        var result = take(0, []);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty string when count is 0 for string (1)', function() {
        var result = take(0, 'funkier');

        expect(result).to.deep.equal('');
      });


      it('Returns empty string when count is 0 for string (2)', function() {
        var result = take(0, '');

        expect(result).to.deep.equal('');
      });


      var addCorrectEntryTests = function(message, count, arrData, strData) {
        var addTest = function(typeMessage, data) {
          it('Works correctly when ' + message + typeMessage, function() {
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

      addReturnsSameTypeTests(take, [1]);
      addNoModificationOfOriginalTests(take, [1]);
      addReturnsEmptyOnEmptyTests(take, [1]);


      testCurriedFunction('take', take, [1, [1, 2, 3]]);
    });


    var dropSpec = {
      name: 'drop',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[1], [[1, 2, 3], 'abc']]
    };


    describeFunction(dropSpec, array.drop, function(drop) {
      addBadNumberTests('count', drop, [], [[1, 2, 3]]);
      addBadNumberTests('count', drop, [], ['abc']);


      it('Returns empty array when count is 0 for array (1)', function() {
        var original = [2, 3, 4];
        var result = drop(0, original);

        expect(result).to.deep.equal(original);
      });


      it('Returns empty array when count is 0 for array (2)', function() {
        var original = [];
        var result = drop(0, original);

        expect(result).to.deep.equal(original);
      });


      it('Returns empty string when count is 0 for string (1)', function() {
        var original = 'funkier';
        var result = drop(0, original);

        expect(result).to.deep.equal(original);
      });


      it('Returns empty string when count is 0 for string (2)', function() {
        var original = '';
        var result = drop(0, original);

        expect(result).to.deep.equal(original);
      });


      var addCorrectEntryTests = function(message, count, arrData, strData) {
        var addTest = function(typeMessage, data) {
          it('Works correctly when ' + message + typeMessage, function() {
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
        var addTest = function(type, typeMessage, data) {
          it('Returns empty ' + type + ' when ' + message + typeMessage, function() {
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
      addReturnsSameTypeTests(drop, [1]);
      addNoModificationOfOriginalTests(drop, [1]);
      addReturnsEmptyOnEmptyTests(drop, [1]);


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
          var addOne = function(data, count) {
            it('Returns ' + type + ' of correct length when called with ' + type + '(' + count + ')', function() {
              var result = fnUnderTest(data);

              expect(result.length).equal(data.length - 1);
            });


            it('Works correctly for ' + type + ' (' + count + ')', function() {
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
          var addOneSet = function(data, count) {
            it('Returns array when called with ' + type + '(' + count + ')', function() {
              var result = fnUnderTest(data);

              expect(Array.isArray(result)).to.be.true;
            });


            it('Returns elements of type ' + type + ' when called with ' + type + '(' + count + ')', function() {
              var result = fnUnderTest(data).every(function(val) {
                if (type === 'array')
                  return Array.isArray(val);
                return typeof(val) === 'string';
               });

               expect(result).to.be.true;
            });


            it('Returns ' + type + ' of correct length when called with ' + type + '(' + count + ')', function() {
              var result = fnUnderTest(data);

              expect(result.length).equal(data.length + 1);
            });


            it('Elements have correct length when called with ' + type + '(' + count + ')', function() {
              var result = fnUnderTest(data).every(function(val, i) {
                return val.length === (fnUnderTest === array.tails ? data.length - i : i);
              });

              expect(result).to.be.true;
            });


            it('Works correctly for ' + type + ' (' + count + ')', function() {
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
      var addTests = function(message, data) {
        it('Returns a copy ' + message, function() {
          var original = data.slice();
          var result = copy(original) === original;

          expect(result).to.be.false;
        });


        it('Has correct length ' + message, function() {
          var original = data.slice();
          var result = copy(original).length === original.length;

          expect(result).to.be.true;
        });


        it('Works correctly ' + message, function() {
          var original = data.slice();
          var result = copy(original);

          expect(result).to.deep.equal(original);
        });


        it('Shallow copies members ' + message, function() {
          var original = data.slice();
          var result = copy(original).every(function(val, i) {
            return val === original[i];
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


      it('Returns empty array if from <= length', function() {
        var original = [1, 2, 3];
        var result = slice(4, 5, original);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty string if from <= length', function() {
        var original = 'abc';
        var result = slice(4, 5, original);

        expect(result).to.deep.equal('');
      });


      var addTests = function(message, from, to, arrData, strData) {
        var addOne = function(type, data) {
          it('Result has correct length when ' + message + ' for ' + type, function() {
            var original = data.slice();
            var result = slice(from, to, original).length === Math.min(original.length - from, to - from);

            expect(result).to.be.true;
          });


          it('Result has correct values when ' + message + ' for ' + type, function() {
            var original = data.slice();
            var newVal = slice(from, to, original);
            newVal = splitIfNecessary(newVal);

            var result = newVal.every(function(val, i) {
              return val === original[from + i];
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
      addReturnsSameTypeTests(slice, [0, 1]);
      addNoModificationOfOriginalTests(slice, []);
      addNoModificationOfOriginalTests(slice, []);


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
        addAcceptsOnlyFixedArityTests(fnUnderTest, 'array', 1, [], [[1, 2, 3]]);
        addAcceptsOnlyFixedArityTests(fnUnderTest, 'string', 1, [], ['abc']);
        addFuncCalledWithSpecificArityTests(fnUnderTest, 'array', 1, [], [[1, 2, 3]]);
        addFuncCalledWithSpecificArityTests(fnUnderTest, 'string', 1, [], ['abc']);
        addReturnsSameTypeTests(fnUnderTest, [base.constant(true)]);
        addReturnsEmptyOnEmptyTests(fnUnderTest, [base.constant(true)]);


        if (isTakeWhile) {
          it('Always returns a copy', function() {
            var original = [4, 5, 6];
            var result = fnUnderTest(base.constant(true), original) !== original;

            expect(result).to.be.true;
          });
        }


        var addTests = function(type, message, predicate, expectedLength, data) {
          it('Result has correct length ' + message + ' for ' + type, function() {
            var original = data.slice();
            var length = isTakeWhile ? expectedLength : original.length - expectedLength;
            var result = fnUnderTest(predicate, original).length === length;

            expect(result).to.be.true;
          });


          it('Predicate only called as often as needed ' + message + ' for ' + type, function() {
            var newPredicate = function(x) {newPredicate.called += 1; return predicate(x);};
            newPredicate.called = 0;
            fnUnderTest(newPredicate, data.slice());
            var result = newPredicate.called === expectedLength + (expectedLength === data.length ? 0 : 1);

            expect(result).to.be.true;
          });


          it('Result has correct members ' + message + ' for ' + type, function() {
            var original = data.slice();
            var arr = fnUnderTest(predicate, original);
            arr = splitIfNecessary(arr);

            var result = arr.every(function(val, i) {
              return val === original[isTakeWhile ? i : i + expectedLength];
            });

            expect(result).to.be.true;
          });
        };


        addTests('array', '(1)', function(x) {return x.foo < 4;}, 2,
                 [{foo: 1}, {foo: 3}, {foo: 4}, {foo: 5}, {foo: 6}]);
        addTests('array', '(2)', function(x) {return x % 2 === 0;}, 3, [2, 4, 6, 1, 5]);
        addTests('array', '(3)', base.constant(true), 5, [2, 4, 6, 1, 5]);
        addTests('string', '(1)', function(x) {return x  === ' ';}, 3, '   funkier');
        addTests('string', '(2)', function(x) {return x >= '0' && x <= '9';}, 2, '09abc');
        addTests('string', '(3)', base.constant(true), 5, 'abcde');
        addNoModificationOfOriginalTests(fnUnderTest, [base.constant(true)]);


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
          var addOne = function(type, message, val, data) {
            it('Result has correct length ' + message + ' for ' + type, function() {
              var original = data.slice();
              var result = fnUnderTest(val, original).length === original.length + 1;

              expect(result).to.be.true;
            });


            it('Result has correct values ' + message + ' for ' + type, function() {
              var original = data.slice();
              var newVal = fnUnderTest(val, original);
              newVal = splitIfNecessary(newVal);

              var prependCheck = function(v, i) {
                if (i === 0)
                  return v === val;
                return v === original[i - 1];
              };

              var appendCheck = function(v, i) {
                if (i === original.length)
                  return v === val;
                return v === original[i];
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
          // Can't use the global test generation here
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
      it('Works for an empty array', function() {
        expect(isEmpty([])).to.be.true;
      });


      it('Works for an empty string', function() {
        expect(isEmpty('')).to.be.true;
      });


      it('Works for non-empty array', function() {
        expect(isEmpty([1, 2])).to.be.false;
      });


      it('Works for an non-empty string', function() {
        expect(isEmpty('a')).to.be.false;
      });
    });


    var intersperseSpec = {
      name: 'intersperse',
      arity: 2,
      restrictions: [[], ['array', 'string']],
      validArguments: [[','], [[1, 2], 'abc']]
    };


    describeFunction(intersperseSpec, array.intersperse, function(intersperse) {
      var addDegenerateTest = function(message, val) {
        it('Works correctly ' + message, function() {
          var result = intersperse(',', val);

          expect(result).to.deep.equal(val);
        });
      };


      addDegenerateTest('for empty array', []);
      addDegenerateTest('for empty string', '');
      addDegenerateTest('for single element array', [1]);
      addDegenerateTest('for single element string', 'a');


      var addTests = function(message, val) {
        it('Result has correct length ' + message, function() {
          var result = intersperse(',', val);

          expect(result.length).to.equal(val.length + (val.length - 1));
        });


        it('Result has original values at correct positions ' + message, function() {
          var interspersed = intersperse(',', val);
          interspersed = splitIfNecessary(interspersed);
          var result = interspersed.every(function(v, i) {
            if (i % 2 === 1) return true;

            return v === val[i];
          });

          expect(result).to.be.true;
        });


        it('Result has interspersed values at correct positions ' + message, function() {
          var intersperseValue = ':';
          var interspersed = intersperse(',', val);
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


      var addTests = function(message, data) {
        it('Returns value with same length as original ' + message, function() {
          var original = data.slice();
          var expected = original.length;
          var result = reverse(original);

          expect(result.length).to.equal(expected);
        });


        it('Returns correct result ' + message, function() {
          var original = data.slice();
          var originalLength = original.length - 1;
          var reversed = reverse(original);
          reversed = splitIfNecessary(reversed);
          var result = reversed.every(function(v, i) {
            return v === original[originalLength - i];
          });

          expect(result).to.be.true;
        });
      };


      addTests('for array', [{}, {}]);
      addTests('for string', 'funkier');
      addTests('for single element array', [1]);
      addTests('for single element string', '');
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
