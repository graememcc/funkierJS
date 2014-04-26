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
                             'sum', 'product'];

    describeModule('array', array, expectedObjects, expectedFunctions);


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
        if (typeof(source) === 'string') source = source.split('');
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
      it('Returns an array when called with an array', function() {
        var result = filter(base.id, ['a', 1, true]);

        expect(Array.isArray(result)).to.be.true;
      });


      it('Returns a string when called with a string', function() {
        var result = filter(base.id, 'abc');

        expect(typeof(result) === 'string').to.be.true;
      });


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


      addAcceptsOnlyFixedArityTests(filter, 'array', 1, [], [[1, 2, 3]]);
      addAcceptsOnlyFixedArityTests(filter, 'string', 1, [], ['abc']);
      addFuncCalledWithSpecificArityTests(filter, 'array', 1, [], [[4, 2]]);
      addFuncCalledWithSpecificArityTests(filter, 'string', 1, [], ['funkier']);
      addCalledWithEveryMemberTests(filter, 'array', [], [[1, 2, 3]]);
      addCalledWithEveryMemberTests(filter, 'string', [], ['abc']);


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


      it('Returns empty array when called with empty array', function() {
        var result = filter(function(x) {}, []);

        expect(result).to.deep.equal([]);
      });


      it('Returns empty string when called with empty string', function() {
        var result = filter(function(x) {}, '');

        expect(result).to.equal('');
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
