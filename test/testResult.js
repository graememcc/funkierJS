(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var result = require('../result');

    var curryModule = require('../curry');
    var getRealArity = curryModule.getRealArity;

    var base = require('../base');
    var id = base.id;
    var constant = base.constant;

    var utils = require('../utils');
    var valueStringifier = utils.valueStringifier;

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var makeArrayLike = testUtils.makeArrayLike;


    var expectedObjects = ['Result'];
    var expectedFunctions = ['Ok', 'Err', 'getOkValue', 'getErrValue', 'isResult', 'isOk', 'isErr',
                             'makeResultReturner', 'makePredResultReturner', 'makeThrowResultReturner',
                             'either'];
    describeModule('result', result, expectedObjects, expectedFunctions);


    var Result = result.Result;
    var Ok = result.Ok;
    var Err = result.Err;
    var getOkValue = result.getOkValue;
    var getErrValue = result.getErrValue;
    var isOk = result.isOk;
    var isErr = result.isErr;


    describe('Result', function() {
      it('Is a function', function() {
        expect(Result).to.be.a('function');
      });


      it('Cannot be called directly (1)', function() {
        var fn = function() {
          var m = new Result();
        };

        expect(fn).to.throw(Error);
      });


      it('Cannot be called directly (2)', function() {
        var fn = function() {
          var r = Result();
        };

        expect(fn).to.throw(Error);
      });


      it('toString works correctly', function() {
        var s = Result.prototype.toString();

        expect(s).to.equal('Result');
      });
    });


    // Values to generate various tests
    var tests = [1, true, 'a', [], {}, function() {}, undefined, null];


    var makeConstructorTests = function(desc, constructorFunction, verifier, toStringText) {
      var spec = {
        name: desc,
        arity: 1,
      };


      describeFunction(spec, constructorFunction, function(constructorFunction) {
        it('Throws when called with no arguments (1)', function() {
          var fn = function() {
            new constructorFunction();
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws when called with no arguments (2)', function() {
          var fn = function() {
            constructorFunction();
          };

          expect(fn).to.throw(TypeError);
        });


        var makeTest = function(message, testMaker) {
          var withNew = function() {
            return new constructorFunction(1);
          };


          var withoutNew = function() {
            return constructorFunction(1);
          };


          it(message + ' (when called with new operator)', testMaker(withNew));
          it(message + ' (when called without new operator)', testMaker(withoutNew));
        };


        makeTest('Returns an object', function(resultMaker) {
          return function() {
            var o = resultMaker();

            expect(o).to.be.an('object');
          };
        });


        makeTest('instanceof correct', function(resultMaker) {
          return function() {
            var o = constructorFunction(1);

            expect(o).to.be.an.instanceOf(constructorFunction);
          };
        });


        makeTest('Returned object is also a Maybe', function(resultMaker) {
          return function() {
            var o = resultMaker();

            expect(o).to.be.an.instanceOf(Result);
          };
        });


        makeTest('Has \'value\' property', function(resultMaker) {
          return function() {
            var o = resultMaker();
            var props = Object.getOwnPropertyNames(o);
            var result = props.indexOf('value') !== -1;

            expect(result).to.be.true;
          };
        });


        makeTest('\'value\' property is not enumerable', function(resultMaker) {
          return function() {
            var o = resultMaker();
            var value = false;
            for (var prop in o)
              if (prop === 'value') value = true;
            var result = !value;

            expect(result).to.be.true;
          };
        });


        makeTest('\'value\' is immutable', function(resultMaker) {
          return function() {
            var o = resultMaker();
            var fn = function() {
              o.value = 2;
            };

            expect(fn).to.throw(TypeError);
          };
        });


        makeTest('Returned object correct', function(resultMaker) {
          return function() {
            var o = resultMaker();

            expect(verifier(o)).to.equal(1);
          };
        });


        tests.forEach(function(t, i) {
          it('toString works correctly (' + (i + 1) + ')', function() {
            var o = new constructorFunction(t);
            var s = o.toString();

            expect(s).to.equal('Result {' + toStringText + ' ' + valueStringifier(t) + '}');
          });
        });
      });
    };


    makeConstructorTests('Ok', Ok, getOkValue, 'Ok');
    makeConstructorTests('Err', Err, getErrValue, 'Err');


    var makeCommonExtractorTests = function(desc, fnUnderTest, correct, correctName, opposite, oppositeName) {
      var spec = {
        name: spec,
        arity: 1,
        restrictions: [[Result]],
        validArguments: [[correct(1)]]
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        it('Throws if called with Result', function() {
          var fn = function() {
            fnUnderTest(Result);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if called with ' + oppositeName, function() {
          var fn = function() {
            fnUnderTest(opposite(1));
          };

          expect(fn).to.throw(TypeError);
        });


        tests.forEach(function(t, i) {
          it('Works correctly (' + (i + 1) + ')', function() {
            var j = new correct(t);

            expect(fnUnderTest(j)).to.equal(t);
          });


          it('Works correctly (' + (i + 2) + ')', function() {
            var j = correct(t);

            expect(fnUnderTest(j)).to.equal(t);
          });
        });
      });
    };


    makeCommonExtractorTests('getOkValue', getOkValue, Ok, 'Ok', Err, 'Err');
    makeCommonExtractorTests('getErrValue', getErrValue, Err, 'Err', Ok, 'Ok');


    var isResultSpec = {
      name: 'isResult',
      arity: 1,
    };


    describeFunction(isResultSpec, result.isResult, function(isResult) {
      it('Correct for Result', function() {
        expect(isResult(Result)).to.be.true;
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Result value (' + (i + 1) + ')', function() {
          expect(isResult(t)).to.be.false;
        });


        it('Works correctly for Ok (' + (i + 1) + ')', function() {
          expect(isResult(Ok(t))).to.be.true;
        });


        it('Works correctly for Err (' + (i + 1) + ')', function() {
          expect(isResult(Err(t))).to.be.true;
        });
      });
    });


    var makeIsTests = function(desc, fnUnderTest, constructorFn, name, opposite, oppositeName) {
      var spec = {
        name: desc,
        arity: 1
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        it('Correct for Result', function() {
          expect(fnUnderTest(Result)).to.be.false;
        });


        tests.forEach(function(t, i) {
          it('Returns false if called with non-Result value (' + (i + 1) + ')', function() {
            expect(fnUnderTest(t)).to.be.false;
          });


          it('Correct for ' + oppositeName + ' (' + (i + 1) + ')', function() {
            expect(fnUnderTest(opposite(t))).to.be.false;
          });


          it('Correct for ' + name + ' (' + (i + 1) + ')', function() {
            expect(fnUnderTest(constructorFn(t))).to.be.true;
          });
        });
      });
    };


    makeIsTests('isOk', result.isOk, Ok, 'Ok', Err, 'Err');
    makeIsTests('isErr', result.isErr, Err, 'Err', Ok, 'Ok');


    var addCommonResultMakerTests = function(fnUnderTest, goodArgs) {
      it('Returns a function', function() {
        var result = fnUnderTest.apply(null, goodArgs);

        expect(result).to.be.a('function');
      });


      var addSameArityTest = function(message, f) {
        it('Returned function has same arity ' + message, function() {
          var expected = getRealArity(f);
          var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);

          expect(getRealArity(newFn)).to.equal(getRealArity(f));
        });
      };


      addSameArityTest('(1)', function() {});
      addSameArityTest('(2)', function(x, y, z) {});


      var addCallsOriginalTest = function(message, args) {
        it('Returned function calls original function with given args ' + message, function() {
          var called = false;
          var fArgs = null;

          var f = args.length > 1 ? function(x, y) {called = true; fArgs = [x, y]; return 0;} :
                                      function(x) {called = true; fArgs = [x]; return 0;};
          var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
          newFn.apply(null, args);

          expect(called).to.be.true;
          expect(fArgs).to.deep.equal(args);
        });
      };


      addCallsOriginalTest('(1)', [1, 2]);
      addCallsOriginalTest('(2)', ['a']);


      it('Returned function preserves execution context', function() {
        var f = function() {f.exc = this;};
        f.exc = undefined;
        var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
        var obj = {};
        newFn.apply(obj);

        expect(f.exc).to.equal(obj);
      });
    };


    var returnerSpec = {
      name: 'makeResultReturner',
      arity: 2,
      restrictions: [['strictarraylike'], ['function']],
      validArguments: [[[], makeArrayLike()], [function() {}]]
    };


    describeFunction(returnerSpec, result.makeResultReturner, function(makeResultReturner) {
      var goodArgs = [[1], function() {}];
      addCommonResultMakerTests(makeResultReturner, goodArgs);


      var addReturnsOkTests = function(message, bad, good, f) {
        it('Returns Ok <value> when original function\'s result not in bad arguments array ' + message, function() {
          var newFn = makeResultReturner(bad, f);
          var good = [0, 1, 2, 3, 4];
          var result = good.every(function(v) {
            var r = newFn(v);
            return isOk(r) && getOkValue(r) === f(v);
          });

          expect(result).to.be.true;
        });
      };


      addReturnsOkTests('(1)', [6, 7, 8, 9, 10], [0, 1, 2, 3, 4], function(x) {return x + 1;});
      addReturnsOkTests('(2)', [false, undefined, 'a'], [true, null, 'b'], id);


      var addReturnsErrTests = function(message, bad, badReturners, f) {
        it('Returns Err <value> when original function\'s result in bad arguments array ' + message, function() {
          var newFn = makeResultReturner(bad, f);
          var result = badReturners.every(function(v) {
            var r = newFn(v);
            return isErr(r) && getErrValue(r) === f(v);
          });

          expect(result).to.be.true;
        });
      };


      addReturnsErrTests('(1)', [6, 7, 8, 9, 10], [5, 6, 7, 8, 9], function(x) {return x + 1;});
      addReturnsErrTests('(2)', [false, undefined, 'a'], [false, undefined, 'a'], id);

      var obj = {};
      addReturnsOkTests('(tested for strict identity)', [obj], [{}], id);
      addReturnsErrTests('(tested for strict identity)', [obj], [obj], id);

      addReturnsOkTests('(when bad values empty)', [], [true, null, undefined, 1, function() {}, {}, [], 'b'], id);


      // makeResultReturner should be curried
      var badArgs = [1];
      var thenArgs = [1];
      testCurriedFunction(makeResultReturner, {firstArgs: [badArgs, id], thenArgs: thenArgs});


      // And so should the returned function
      var f2 = function(x, y) {return x + y;};
      var newFn = makeResultReturner([], f2);
      testCurriedFunction(newFn, [2, 3], {message: 'function returned by makeResultReturner'});
    });


    var predSpec = {
      name: 'makePredResultReturner',
      arity: 2,
      restrictions: [['function: arity 1'], ['function']],
      validArguments: [[function(x) {}], [function() {}]]
    };


    describeFunction(predSpec, result.makePredResultReturner, function(makePredResultReturner) {
      var notFns = [1, true, 'a', undefined, {}, [1]];
      var goodArgs = [function(x) {}, function() {}];
      addCommonResultMakerTests(makePredResultReturner, goodArgs);


      notFns.forEach(function(val, i) {
        it('Predicate function called with result of original function (' + (i + 1) + ')', function() {
          var called = false;
          var arg = null;
          var pred = function(x) {called = true; arg = x; return true;};

          var f = id;
          var newFn = makePredResultReturner(pred, f);
          newFn(val);

          expect(called).to.be.true;
          expect(arg).to.equal(val);
        });
      });


      var addReturnsOkOnTrueTest = function(message, pred, good, f)  {
        it('Returns Ok <value> when pred returns true ' + message, function() {
          var newFn = makePredResultReturner(pred, f);

          var result = good.every(function(v) {
            var r = newFn(v);
            return isOk(r) && getOkValue(r) === f(v);
          });

          expect(result).to.be.true;
        });
      };


      addReturnsOkOnTrueTest('(1)', function(x) {return x < 6;}, [0, 1, 2, 3, 4], function(x) {return x + 1;});
      addReturnsOkOnTrueTest('(2)', constant(true), [true, 1, {}], id);


      var addReturnsErrOnFalseTest = function(message, pred, bad, f)  {
        it('Returns Err <value> when pred returns false ' + message, function() {
          var newFn = makePredResultReturner(pred, f);

          var result = bad.every(function(v) {
            var r = newFn(v);
            return isErr(r) && getErrValue(r) === f(v);
          });

          expect(result).to.be.true;
        });
      };


      addReturnsErrOnFalseTest('(1)', function(x) {return x < 6;}, [5, 6, 7, 8, 9], function(x) {return x + 1;});
      addReturnsErrOnFalseTest('(2)', constant(false), [true, 1, {}], id);


      // makePredResultReturner should be curried
      var f1 = function(x) {return x;}; // XXX ID REFACTORING
      var pred = function(x) {return true;};
      var thenArgs = [1];
      testCurriedFunction(makePredResultReturner, {firstArgs: [pred, f1], thenArgs: thenArgs});


      // And so should the returned function
      var f2 = function(x, y) {return x + y;};
      var newFn = makePredResultReturner(pred, f2);
      testCurriedFunction(newFn, [2, 3], {message: 'function returned by makePredResultReturner'});
    });


    var throwSpec = {
      name: 'makeThrowResultReturner',
      arity: 1,
      restrictions: [['function']],
      validArguments: [[function() {}]]
     };


    describeFunction(throwSpec, result.makeThrowResultReturner, function(makeThrowResultReturner) {
      var goodArgs = [function() {}];
      addCommonResultMakerTests(makeThrowResultReturner, goodArgs);


      it('Returns Ok <value> when function does not throw', function() {
        var f = function(x) {return x + 1;};
        var newFn = makeThrowResultReturner(f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isOk(r) && getOkValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      var thingsToThrow = [
        new Error(), new TypeError(), new SyntaxError(), new ReferenceError(),
        1, true, 'a', undefined, null, {}, function() {}, []];


      thingsToThrow.forEach(function(boom, i) {
        it('Doesn\'t throw if underlying function throws', function() {
          var f = function(x) {throw boom;};
          var newFn = makeThrowResultReturner(f);
          var fn = function() {
            newFn(1);
          };

          expect(fn).to.not.throw(boom);
        });


        it('Returns Err <value thrown> when function throws (' + (i + 1) + ')', function() {
          var f = function(x) {throw boom;};
          var newFn = makeThrowResultReturner(f);
          var r = newFn(1);
          var result = isErr(r) && getErrValue(r) === boom;

          expect(result).to.be.true;
        });
      });


      // The function returned by makeThrowResultReturner should be curried
      var f2 = function(x, y) {return x + y;};
      var newFn = makeThrowResultReturner(f2);
      testCurriedFunction(newFn, [2, 3], {message: 'function returned by makeThrowResultReturner'});
    });


    var eitherSpec = {
      name: 'either',
      arity: 3,
      restrictions: [['function: minarity 1'], ['function: minarity 1'], [Result]],
      validArguments: [[id], [id], [Ok(1)]]
    };


    describeFunction(eitherSpec, result.either, function(either) {
      var notResults = [1, 'a', true, null, undefined, {}, []];

      notResults.forEach(function(test, i) {
        it('Throws if the last argument is not a Result (' + (i + 1) + ')', function() {
          var fn = function() {
            either(id, constant, test);
          };

          expect(fn).to.throw(TypeError);
        });
      });


      var addOKTest = function(message, val) {
        it('Calls first function if value is OK ' + message, function() {
          var ok = Ok(val);
          var called = false;
          var f = function(x) {called = true; return null;};
          called = false;
          either(f, id, ok);

          expect(called).to.be.true;
        });


        it('Calls first function with wrapped value if OK ' + message, function() {
          var ok = Ok(val);
          var arg = null;
          var f = function(x) {arg = x; return null;};
          arg = null;
          either(f, id, ok);

          expect(arg).to.equal(val);
        });


        var addReturnsFirstTest = function(m, expected) {
          it('Returns result of first function if OK ' + m + ' ' + message, function() {
            var ok = Ok(val);
            var res = expected;
            var f = function(x) {return res;};
            var result = either(f, id, ok);

            expect(result).to.equal(expected);
          });
        };


        addReturnsFirstTest('(1)', 1);
        addReturnsFirstTest('(2)', 'funkier');
      };


      addOKTest('(1)', {foo: 1});
      addOKTest('(2)', 'abc');


      var addErrTest = function(message, val) {
        it('Calls second function if value is Err ' + message, function() {
          var err = Err(val);
          var called = false;
          var f = function(x) {called = true; return null;};
          either(id, f, err);

          expect(called).to.be.true;
        });


        it('Calls second function with wrapped value if Err ' + message, function() {
          var err = Err(val);
          var arg = null;
          var f = function(x) {arg = x; return null;};
          either(id, f, err);

          expect(arg).to.equal(val);
        });


        var addReturnsSecondTest = function(m, expected) {
          it('Returns result of second function if Err ' + m + ' ' + message, function() {
            var err = Err(val);
            var res = expected;
            var f = function(x) {return res;};
            var result = either(id, f, err);

            expect(result).to.equal(expected);
          });
        };


        addReturnsSecondTest('(1)', 1);
        addReturnsSecondTest('(2)', 'funkier');
      };


      addErrTest('(1)', {foo: 42});
      addErrTest('(2)', 2);


      testCurriedFunction(either, [id, id, Err(1)]);
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
