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
    var expectedFunctions = ['length', 'getIndex', 'head', 'last', 'repeat', 'map', 'each', 'filter'];
    describeModule('array', array, expectedObjects, expectedFunctions);


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


    var addFunctionFixedArityTests = function(paramName, arity, fnUnderTest, argsBefore, argsAfter) {
      var funcs = [
        function() {},
        function(x) {},
        function(x, y) {},
        function(x, y, z) {},
        function(w, x, y, z) {}
      ];

      funcs.forEach(function(f, i) {
        if (i !== arity) {
          it('Throws when called with function of arity ' + i, function() {
            var fn = function() {
              fnUnderTest.apply(null, argsBefore.concat([f]).concat(argsAfter));
            };

            expect(fn).to.throw(TypeError);
          });
        } else {
          it('Does not throw when called with function of arity ' + i, function() {
            var fn = function() {
              fnUnderTest.apply(null, argsBefore.concat([f]).concat(argsAfter));
            };

            expect(fn).to.not.throw(TypeError);
          });
        }
      });
    };


    var addFuncCalledWithOneParamTests = function(paramName, fnUnderTest, argsBefore, argsAfter, isArity1) {
      isArity1 = isArity1 || false;

      it(paramName + ' called with single argument', function() {
        var allArgs = [];
        var f;

        if (isArity1) {
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
          return arr.length === 1;
        });

        expect(result).to.be.true;
      });
    };


    var addFuncCalledWithEveryMemberTests = function(paramName, fnUnderTest, argsBefore, argsAfter, isArity1, isRTL) {
      isArity1 = isArity1 || false;
      isRTL = isRTL || false;
      var sourceArray = argsAfter[argsAfter.length - 1];
      var elems = sourceArray.length - 1;

      it(paramName + ' called with every element of array', function() {
        var allArgs = [];
        var f;

        if (isArity1) {
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
        var result = allArgs.every(function(arr, i) {
          return arr[arr.length - 1] === sourceArray[isRTL ? elems - i : i];
        });

        expect(result).to.be.true;
      });
    };


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


      addFuncCalledWithEveryMemberTests('function', map, [], [[1, 2, 3]]);
      addFuncCalledWithEveryMemberTests('function', map, [], ['abc']);
      addFuncCalledWithOneParamTests('function', map, [], [[4, 2]]);
      addFuncCalledWithOneParamTests('function', map, [], ['funkier']);


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


      addFuncCalledWithEveryMemberTests('function', each, [], [[1, 2, 3]]);
      addFuncCalledWithEveryMemberTests('function', each, [], ['abc']);
      addFuncCalledWithOneParamTests('function', each, [], [[4, 2]]);
      addFuncCalledWithOneParamTests('function', each, [], ['funkier']);


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


      addFunctionFixedArityTests('function', 1, filter, [], [[1, 2, 3]]);
      addFunctionFixedArityTests('function', 1, filter, [], ['abc']);
      addFuncCalledWithEveryMemberTests('function', filter, [], [[1, 2, 3]], true);
      addFuncCalledWithEveryMemberTests('function', filter, [], ['abc'], true);
      addFuncCalledWithOneParamTests('function', filter, [], [[4, 2]], true);
      addFuncCalledWithOneParamTests('function', filter, [], ['funkier'], true);


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
