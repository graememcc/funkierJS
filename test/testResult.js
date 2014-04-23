(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var result = require('../result');
    var utils = require('../utils');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var getRealArity = base.getRealArity;
    var valueStringifier = utils.valueStringifier;


    var expectedObjects = ['Result'];
    var expectedFunctions = ['Ok', 'Err', 'getOkValue', 'getErrValue', 'isResult', 'isOk', 'isErr',
                             'makeResultReturner', 'makePredResultReturner', 'makeThrowResultReturner'];
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
      describe(desc, function() {
        it('Has correct arity', function() {
          expect(getRealArity(constructorFunction)).to.equal(1);
        });


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


        it('Returns an object when called with new operator', function() {
          var o = new constructorFunction(1);

          expect(o).to.be.an('object');
        });


        it('Returns an object when called without new operator', function() {
          var o = constructorFunction(1);

          expect(o).to.be.an('object');
        });


        it('instanceof correct for object created by new', function() {
          var o = constructorFunction(1);

          expect(o).to.be.an.instanceOf(constructorFunction);
        });


        it('instanceof correct for object created without new', function() {
          var o = constructorFunction(1);

          expect(o).to.be.an.instanceOf(constructorFunction);
        });


        it('Returned object is also a Maybe (1)', function() {
          var o = new constructorFunction(1);

          expect(o).to.be.an.instanceOf(Result);
        });


        it('Returned object is also a Maybe (2)', function() {
          var o = constructorFunction(1);

          expect(o).to.be.an.instanceOf(Result);
        });


        it('Object created with new has \'value\' property', function() {
          var o = new constructorFunction(1);
          var props = Object.getOwnPropertyNames(o);
          var result = props.indexOf('value') !== -1;

          expect(result).to.be.true;
        });


        it('Object created without new has \'value\' property', function() {
          var o = new constructorFunction(1);
          var props = Object.getOwnPropertyNames(o);
          var result = props.indexOf('value') !== -1;

          expect(result).to.be.true;
        });


        it('\'value\' property is not enumerable (1)', function() {
          var o = new constructorFunction(1);
          var value = false;
          for (var prop in o)
            if (prop === 'value') value = true;
          var result = !value;

          expect(result).to.be.true;
        });


        it('\'value\' property is not enumerable (2)', function() {
          var o = constructorFunction(1);
          var value = false;
          for (var prop in o)
            if (prop === 'value') value = true;
          var result = !value;

          expect(result).to.be.true;
        });


        it('\'value\' is immutable (1)', function() {
          var o = new constructorFunction(1);
          var fn = function() {
            o.value = 2;
          };

          expect(fn).to.throw(TypeError);
        });


        it('\'value\' is immutable (2)', function() {
          var o = constructorFunction(1);
          var fn = function() {
            o.value = 2;
          };

          expect(fn).to.throw(TypeError);
        });


        it('Returned object correct (1)', function() {
          var o = new constructorFunction(1);

          expect(verifier(o)).to.equal(1);
        });


        it('Returned object correct (2)', function() {
          var o = constructorFunction(1);

          expect(verifier(o)).to.equal(1);
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
      describe(desc, function() {
        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(1);
        });


        it('Throws if called with Result', function() {
          var fn = function() {
            fnUnderTest(Result);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if called with ' + oppositeName, function() {
          var fn = function() {
            fnUnderTest(opposite);
          };

          expect(fn).to.throw(TypeError);
        });


        tests.forEach(function(t, i) {
          it('Throws if called with non-' + correctName + ' value (' + (i + 1) + ')', function() {
            var fn = function() {
              fnUnderTest(t);
            };

            expect(fn).to.throw(TypeError);
          });


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


    describe('isResult', function() {
      var isResult = result.isResult;


      it('Has correct arity', function() {
        expect(getRealArity(isResult)).to.equal(1);
      });


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
      describe(desc, function() {
        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(1);
        });


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


    var addCommonResultMakerTests = function(fnUnderTest, arity, badArgs, goodArgs) {
      it('Has correct arity', function() {
        expect(getRealArity(fnUnderTest)).to.equal(arity);
      });


      if (badArgs.length > 1)  {
        badArgs[0].vals.forEach(function(val, i) {
          it('Throws if first parameter not a ' + badArgs[0].type + ' (' + (i + 1) + ')', function() {
            var fn = function() {
              fnUnderTest(val, function() {});
            };

            expect(fn).to.throw(TypeError);
          });
        });


        badArgs[1].vals.forEach(function(val, i) {
          it('Throws if second parameter not a ' + badArgs[1].type + ' (' + (i + 1) + ')', function() {
            var fn = function() {
              fnUnderTest([1], val);
            };

            expect(fn).to.throw(TypeError);
          });
        });
      } else {
        badArgs[0].vals.forEach(function(val, i) {
          it('Throws if parameter not a ' + badArgs[0].type + ' (' + (i + 1) + ')', function() {
            var fn = function() {
              fnUnderTest(val);
            };

            expect(fn).to.throw(TypeError);
          });
        });
      }


      it('Returns a function', function() {
        var result = fnUnderTest.apply(null, goodArgs);

        expect(result).to.be.a('function');
      });


      it('Returned function has same arity (1)', function() {
        var f = function() {};
        var expected = getRealArity(f);
        var result = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);

        expect(getRealArity(result)).to.equal(expected);
      });


      it('Returned function has same arity (2)', function() {
        var f = function(x, y, z) {};
        var expected = getRealArity(f);
        var result = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);

        expect(getRealArity(result)).to.equal(expected);
      });


      it('Returned function calls original function with given args (1)', function() {
        var f = function(x, y) {f.called = true; f.args = [x, y]; return 0;};
        f.called = false;
        f.args = null;
        var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
        newFn(1, 2);

        expect(f.called).to.be.true;
        expect(f.args).to.deep.equal([1, 2]);
      });


      it('Returned function calls original function with given args (2)', function() {
        var f = function(x) {f.called = true; f.args = [x]; return 0;};
        f.called = false;
        f.args = null;
        var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
        newFn('a');

        expect(f.called).to.be.true;
        expect(f.args).to.deep.equal(['a']);
      });
    };


    describe('makeResultReturner', function() {
      var makeResultReturner = result.makeResultReturner;


      var notArrays = [1, true, 'a', undefined, null, {}, function() {}];
      var notFns = [1, true, 'a', undefined, null, {}, [1]];
      var goodArgs = [[1], function() {}];
      var bad = [{type: 'array', vals: notArrays}, {type: 'function', vals: notFns}];
      addCommonResultMakerTests(makeResultReturner, 2, bad, goodArgs);


      it('Returns Ok <value> when value not in bad arguments array (1)', function() {
        var bad = [6, 7, 8, 9, 10];
        var f = function(x) {return x + 1;};
        var newFn = makeResultReturner(bad, f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isOk(r) && getOkValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Ok <value> when value not in bad arguments array (2)', function() {
        var bad = [false, undefined, 'a'];
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeResultReturner(bad, f);
        var good = [true, null, 'b'];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isOk(r) && getOkValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Err <value> when value in bad arguments array (1)', function() {
        var bad = [6, 7, 8, 9, 10];
        var f = function(x) {return x + 1;};
        var newFn = makeResultReturner(bad, f);
        var result = bad.every(function(v) {
          var r = newFn(v - 1);
          return isErr(r) && getErrValue(r) === f(v - 1);
        });

        expect(result).to.be.true;
      });


      it('Returns Err <value> when value in bad arguments array (2)', function() {
        var bad = [false, undefined, 'a'];
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeResultReturner(bad, f);
        var result = bad.every(function(v) {
          var r = newFn(v);
          return isErr(r) && getErrValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Strict identity used for checking values in bad array (1)', function() {
        var o1 = {};
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeResultReturner([o1], f);
        var o2 = {};
        var val = newFn(o2);
        var result = isOk(val) && getOkValue(val) === o2;

        expect(result).to.be.true;
      });


      it('Strict identity used for checking values in bad array (2)', function() {
        var o1 = {};
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeResultReturner([o1], f);
        var val = newFn(o1);
        var result = isErr(val);

        expect(result).to.be.true;
      });


      it('Always return Ok if bad values array empty', function() {
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeResultReturner([], f);
        var good = [true, null, undefined, 1, {}, function() {}, [], 'b'];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isOk(r) && getOkValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      // makeResultReturner should be curried
      var f1 = function(x) {return x;}; // XXX ID REFACTORING
      var badArgs = [1];
      var thenArgs = [1];
      testCurriedFunction('makeResultReturner', makeResultReturner, {firstArgs: [badArgs, f1], thenArgs: thenArgs});


      // And so should the returned function
      var f2 = function(x, y) {return x + y;};
      var newFn = makeResultReturner([], f2);
      testCurriedFunction('function returned by makeResultReturner', newFn, [2, 3]);
    });


    describe('makePredResultReturner', function() {
      var makePredResultReturner = result.makePredResultReturner;


      var notFns = [1, true, 'a', undefined, {}, [1]];
      var goodArgs = [function(x) {}, function() {}];
      var bad = [{type: 'function', vals: notFns}, {type: 'function', vals: notFns}];
      addCommonResultMakerTests(makePredResultReturner, 2, bad, goodArgs);


      it('Throws if predicate function doesn\'t have arity 1 (1)', function() {
        var pred = function() {};
        var f = function(x) {};
        var fn = function() {
          makePredResultReturner(pred, f);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if predicate function doesn\'t have arity 1 (2)', function() {
        var pred = function(x, y) {};
        var f = function() {};
        var fn = function() {
          makePredResultReturner(pred, f);
        };

        expect(fn).to.throw(TypeError);
      });


      notFns.forEach(function(val, i) {
        it('Predicate function called with result of original function (' + (i + 1) + ')', function() {
          var pred = function(x) {pred.called = true; pred.arg = x; return true;};
          pred.called = false;
          pred.arg = null;
          var f = function(x) {return x;}; // XXX ID REFACTORING
          var newFn = makePredResultReturner(pred, f);
          newFn(val);

          expect(pred.called).to.be.true;
          expect(pred.arg === val).to.be.true;
        });
      });


      it('Returns Ok <value> when pred returns true (1)', function() {
        var pred = function(x) {return x < 6;};
        var f = function(x) {return x + 1;};
        var newFn = makePredResultReturner(pred, f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isOk(r) && getOkValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Ok <value> when pred returns true (2)', function() {
        var pred = function(x) {return true;}; // XXX Use constant
        var f = function(x) {return x;};
        var newFn = makePredResultReturner(pred, f);
        var good = [true, null, 'b'];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isOk(r) && getOkValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Err <value> when pred returns false (1)', function() {
        var pred = function(x) {return x < 6;};
        var f = function(x) {return x + 1;};
        var newFn = makePredResultReturner(pred, f);
        var result = bad.every(function(v) {
          var r = newFn(v);
          return isErr(r) && getErrValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Err <value> when pred returns false (2)', function() {
        var pred = function(x) {return false;}; // XXX Use constant
        var f = function(x) {return x;};
        var newFn = makePredResultReturner(pred, f);
        var result = bad.every(function(v) {
          var r = newFn(v);
          return isErr(r) && getErrValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      // makePredResultReturner should be curried
      var f1 = function(x) {return x;}; // XXX ID REFACTORING
      var pred = function(x) {return true;};
      var thenArgs = [1];
      testCurriedFunction('makePredResultReturner', makePredResultReturner, {firstArgs: [pred, f1], thenArgs: thenArgs});


      // And so should the returned function
      var f2 = function(x, y) {return x + y;};
      var newFn = makePredResultReturner(pred, f2);
      testCurriedFunction('function returned by makePredResultReturner', newFn, [2, 3]);
    });


    describe('makeThrowResultReturner', function() {
      var makeThrowResultReturner = result.makeThrowResultReturner;


      var notFns = [1, true, 'a', undefined, {}, [1]];
      var goodArgs = [function() {}];
      var bad = [{type: 'function', vals: notFns}];
      addCommonResultMakerTests(makeThrowResultReturner, 1, bad, goodArgs);


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
      testCurriedFunction('function returned by makeThrowResultReturner', newFn, [2, 3]);
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
