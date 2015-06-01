(function() {
  "use strict";


  var expect = require('chai').expect;

  var result = require('../../lib/components/result');

  var curryModule = require('../../lib/components/curry');
  var arityOf = curryModule.arityOf;

  var base = require('../../lib/components/base');
  var id = base.id;
  var constant = base.constant;

  var internalUtilities = require('../../lib/internalUtilities');
  var valueStringifier = internalUtilities.valueStringifier;

  var testUtils = require('./testingUtilities');
  var checkModule = testUtils.checkModule;
  var checkFunction = testUtils.checkFunction;
  var addCurryStyleTests = testUtils.addCurryStyleTests;


  describe('Result', function() {
    var expectedObjects = ['Result'];
    var expectedFunctions = ['Ok', 'Err', 'getOkValue', 'getErrValue', 'isResult', 'isOk', 'isErr',
                             'makeResultReturner', 'either'];
    checkModule('result', result, expectedObjects, expectedFunctions);


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


    var makeConstructorTests = function(desc, ConstructorFunction, verifier, toStringText) {
      describe(desc, function() {
        it('Throws when called with no arguments (1)', function() {
          var fn = function() {
            new ConstructorFunction();
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws when called with no arguments (2)', function() {
          var fn = function() {
            ConstructorFunction();
          };

          expect(fn).to.throw(TypeError);
        });


        var makeTest = function(message, testMaker) {
          var withNew = function() {
            return new ConstructorFunction(1);
          };


          var withoutNew = function() {
            return ConstructorFunction(1);
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
            var o = ConstructorFunction(1);

            expect(o).to.be.an.instanceOf(ConstructorFunction);
          };
        });


        makeTest('constructor correct', function(resultMaker) {
          return function() {
            var o = ConstructorFunction(1);

            expect(o.constructor).to.equal(Result);
          };
        });


        makeTest('Returned object is also a Result', function(resultMaker) {
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

            expect(result).to.equal(true);
          };
        });


        makeTest('\'value\' property is not enumerable', function(resultMaker) {
          return function() {
            var o = resultMaker();
            var value = false;
            for (var prop in o)
              if (prop === 'value') value = true;
            var result = !value;

            expect(result).to.equal(true);
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
            var o = new ConstructorFunction(t);
            var s = o.toString();

            expect(s).to.equal('Result {' + toStringText + ' ' + valueStringifier(t) + '}');
          });
        });
      });
    };


    makeConstructorTests('Ok', Ok, getOkValue, 'Ok');
    makeConstructorTests('Err', Err, getErrValue, 'Err');


    var makeCommonExtractorTests = function(desc, fnUnderTest, Correct, correctName, opposite, oppositeName) {
      var spec = {
        name: desc,
        restrictions: [[Result]],
        validArguments: [[Correct(1)]]
      };


      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
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
            var j = new Correct(t);

            expect(fnUnderTest(j)).to.equal(t);
          });


          it('Works correctly (' + (i + 2) + ')', function() {
            var j = Correct(t);

            expect(fnUnderTest(j)).to.equal(t);
          });
        });
      });
    };


    makeCommonExtractorTests('getOkValue', getOkValue, Ok, 'Ok', Err, 'Err');
    makeCommonExtractorTests('getErrValue', getErrValue, Err, 'Err', Ok, 'Ok');


    describe('isResult', function() {
      var isResult = result.isResult;


      it('Correct for Result', function() {
        expect(isResult(Result)).to.equal(true);
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Result value (' + (i + 1) + ')', function() {
          expect(isResult(t)).to.equal(false);
        });


        it('Works correctly for Ok (' + (i + 1) + ')', function() {
          expect(isResult(Ok(t))).to.equal(true);
        });


        it('Works correctly for Err (' + (i + 1) + ')', function() {
          expect(isResult(Err(t))).to.equal(true);
        });
      });
    });


    var makeIsTests = function(desc, fnUnderTest, constructorFn, name, opposite, oppositeName) {
      describe(desc, function() {
        it('Correct for Result', function() {
          expect(fnUnderTest(Result)).to.equal(false);
        });


        tests.forEach(function(t, i) {
          it('Returns false if called with non-Result value (' + (i + 1) + ')', function() {
            expect(fnUnderTest(t)).to.equal(false);
          });


          it('Correct for ' + oppositeName + ' (' + (i + 1) + ')', function() {
            expect(fnUnderTest(opposite(t))).to.equal(false);
          });


          it('Correct for ' + name + ' (' + (i + 1) + ')', function() {
            expect(fnUnderTest(constructorFn(t))).to.equal(true);
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
          var expected = arityOf(f);
          var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);

          expect(arityOf(newFn)).to.equal(arityOf(f));
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

          expect(called).to.equal(true);
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


    var resultReturnerSpec = {
      name: 'makeResultReturner',
      restrictions: [['function']],
      validArguments: [[function() {}]]
     };


    checkFunction(resultReturnerSpec, result.makeResultReturner, function(makeResultReturner) {
      it('Returns a function', function() {
        var result = makeResultReturner(function() {});

        expect(result).to.be.a('function');
      });


      var addSameArityTest = function(message, f) {
        it('Returned function has same arity ' + message, function() {
          var expected = arityOf(f);
          var newFn = makeResultReturner(f);

          expect(arityOf(newFn)).to.equal(arityOf(f));
        });
      };


      addSameArityTest('(1)', function() {});
      addSameArityTest('(2)', function(x, y, z) {});


      var addCallsOriginalTest = function(message, args) {
        it('Returned function calls original function with given args ' + message, function() {
          var called = false;
          var calledArgs = null;

          var f = function(x) {called = true; calledArgs = [].slice.call(arguments); return 0;};
          var newFn = makeResultReturner(f);
          newFn.apply(null, args);

          expect(called).to.equal(true);
          expect(calledArgs).to.deep.equal(args);
        });
      };


      addCallsOriginalTest('(1)', [[1, 2]]);
      addCallsOriginalTest('(2)', ['a']);


      it('Returns Ok <value> when function does not throw', function() {
        var f = function(x) {return x + 1;};
        var newFn = makeResultReturner(f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isOk(r) && getOkValue(r) === f(v);
        });

        expect(result).to.equal(true);
      });


      var thingsToThrow = [
        new Error(), new TypeError(), new SyntaxError(), new ReferenceError(),
        1, true, 'a', undefined, null, {}, function() {}, []];


      thingsToThrow.forEach(function(boom, i) {
        it('Doesn\'t throw if underlying function throws', function() {
          var f = function(x) {throw boom;};
          var newFn = makeResultReturner(f);
          var fn = function() {
            newFn(1);
          };

          expect(fn).to.not.throw(boom);
        });


        it('Returns Err <value thrown> when function throws (' + (i + 1) + ')', function() {
          var f = function(x) {throw boom;};
          var newFn = makeResultReturner(f);
          var r = newFn(1);
          var result = isErr(r) && getErrValue(r) === boom;

          expect(result).to.equal(true);
        });
      });


      addCurryStyleTests(function(f) { return makeResultReturner(f); });
    });


    var eitherSpec = {
      name: 'either',
      arity: 3,
      restrictions: [['function: minarity 1'], ['function: minarity 1'], [Result]],
      validArguments: [[id], [id], [Ok(1)]]
    };


    checkFunction(eitherSpec, result.either, function(either) {
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

          expect(called).to.equal(true);
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

          expect(called).to.equal(true);
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
    });
  });
})();
