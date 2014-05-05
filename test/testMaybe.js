(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var maybe = require('../maybe');
    var utils = require('../utils');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var getRealArity = base.getRealArity;
    var valueStringifier = utils.valueStringifier;


    var expectedObjects = ['Maybe', 'Nothing'];
    var expectedFunctions = ['Just', 'getJustValue', 'isMaybe', 'isJust', 'isNothing', 'makeMaybeReturner',
                             'makePredMaybeReturner', 'makeThrowMaybeReturner'];
    describeModule('maybe', maybe, expectedObjects, expectedFunctions);


    var Maybe = maybe.Maybe;
    var Just = maybe.Just;
    var Nothing = maybe.Nothing;
    var getJustValue = maybe.getJustValue;
    var isJust = maybe.isJust;
    var isNothing = maybe.isNothing;


    describe('Maybe', function() {
      it('Is a function', function() {
        expect(Maybe).to.be.a('function');
      });


      it('Cannot be called directly (1)', function() {
        var fn = function() {
          var m = new Maybe();
        };

        expect(fn).to.throw(Error);
      });


      it('Cannot be called directly (2)', function() {
        var fn = function() {
          var m = Maybe();
        };

        expect(fn).to.throw(Error);
      });


      it('toString works correctly', function() {
        var s = Maybe.prototype.toString();

        expect(s).to.equal('Maybe');
      });
    });


    describe('Nothing', function() {
      it('Is an object', function() {
        expect(Nothing).to.be.an('object');
      });


      it('Has no own properties', function() {
        var ownProperties = Object.getOwnPropertyNames(Nothing);

        expect(ownProperties.length).to.equal(0);
      });


      it('New properties cannot be added', function() {
        var fn = function() {
          Nothing.foo = 1;
        };

        expect(fn).to.throw(TypeError);
      });


      it('Is a Maybe', function() {
        var result = Nothing instanceof Maybe;

        expect(result).to.be.true;
      });


      it('toString works correctly', function() {
        var s = Nothing.toString();

        expect(s).to.equal('Maybe {Nothing}');
      });
    });


    // Values to generate various tests
    var tests = [1, true, 'a', [], {}, function() {}, undefined, null];


    var justSpec = {
      name: 'Just',
      arity: 1
    };


    describeFunction(justSpec, Just, function(Just) {
      it('Throws when called with no arguments (1)', function() {
        var fn = function() {
          new Just();
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws when called with no arguments (2)', function() {
        var fn = function() {
          Just();
        };

        expect(fn).to.throw(TypeError);
      });


      it('Returns an object when called with new operator', function() {
        var j = new Just(1);

        expect(j).to.be.an('object');
      });


      it('Returns an object when called without new operator', function() {
        var j = Just(1);

        expect(j).to.be.an('object');
      });


      it('instanceof correct for object created by new', function() {
        var j = Just(1);

        expect(j).to.be.an.instanceOf(Just);
      });


      it('instanceof correct for object created without new', function() {
        var j = Just(1);

        expect(j).to.be.an.instanceOf(Just);
      });


      it('Returned object is also a Maybe (1)', function() {
        var j = new Just(1);

        expect(j).to.be.an.instanceOf(Maybe);
      });


      it('Returned object is also a Maybe (2)', function() {
        var j = Just(1);

        expect(j).to.be.an.instanceOf(Maybe);
      });


      it('Object created with new has \'value\' property', function() {
        var j = new Just(1);
        var props = Object.getOwnPropertyNames(j);
        var result = props.indexOf('value') !== -1;

        expect(result).to.be.true;
      });


      it('Object created without new has \'value\' property', function() {
        var j = new Just(1);
        var props = Object.getOwnPropertyNames(j);
        var result = props.indexOf('value') !== -1;

        expect(result).to.be.true;
      });


      it('\'value\' property is not enumerable (1)', function() {
        var j = new Just(1);
        var value = false;
        for (var prop in j)
          if (prop === 'value') value = true;
        var result = !value;

        expect(result).to.be.true;
      });


      it('\'value\' property is not enumerable (2)', function() {
        var j = Just(1);
        var value = false;
        for (var prop in j)
          if (prop === 'value') value = true;
        var result = !value;

        expect(result).to.be.true;
      });


      it('\'value\' is immutable (1)', function() {
        var j = new Just(1);
        var fn = function() {
          j.value = 2;
        };

        expect(fn).to.throw(TypeError);
      });


      it('\'value\' is immutable (2)', function() {
        var j = Just(1);
        var fn = function() {
          j.value = 2;
        };

        expect(fn).to.throw(TypeError);
      });


      it('Returned object correct (1)', function() {
        var j = new Just(1);

        expect(getJustValue(j)).to.equal(1);
      });


      it('Returned object correct (2)', function() {
        var j = Just(1);

        expect(getJustValue(j)).to.equal(1);
      });


      tests.forEach(function(t, i) {
        it('toString works correctly (' + (i + 1) + ')', function() {
          var j = new Just(t);
          var s = j.toString();

          expect(s).to.equal('Maybe {Just ' + valueStringifier(t) + '}');
        });
      });
    });


    var getJustValueSpec = {
      name: 'getJustValue',
      arity: 1,
      restrictions: [[Just]],
      validArguments: [[new Just(1)]]
    };


    describeFunction(getJustValueSpec, getJustValue, function(getJustValue) {
      it('Throws if called with Maybe', function() {
        var fn = function() {
          getJustValue(Maybe);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if called with Nothing', function() {
        var fn = function() {
          getJustValue(Nothing);
        };

        expect(fn).to.throw(TypeError);
      });


      tests.forEach(function(t, i) {
        it('Works correctly (' + (i + 1) + ')', function() {
          var j = new Just(t);

          expect(getJustValue(j)).to.equal(t);
        });


        it('Works correctly (' + (i + 2) + ')', function() {
          var j = Just(t);

          expect(getJustValue(j)).to.equal(t);
        });
      });
    });


    var isMaybeSpec = {
      name: 'isMaybe',
      arity: 1,
    };


    describeFunction(isMaybeSpec, maybe.isMaybe, function(isMaybe) {
      it('Correct for Maybe', function() {
        expect(isMaybe(Maybe)).to.be.true;
      });


      it('Correct for Nothing', function() {
        expect(isMaybe(Nothing)).to.be.true;
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
          expect(isMaybe(t)).to.be.false;
        });


        it('Works correctly (' + (i + 1) + ')', function() {
          expect(isMaybe(Just(t))).to.be.true;
        });
      });
    });


    var isNothingSpec = {
      name: 'isNothing',
      arity: 1,
    };


    describeFunction(isNothingSpec, isNothing, function(isNothing) {
      it('Correct for Maybe', function() {
        expect(isNothing(Maybe)).to.be.false;
      });


      it('Correct for Nothing', function() {
        expect(isNothing(Nothing)).to.be.true;
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
          expect(isNothing(t)).to.be.false;
        });


        it('Correct for Just (' + (i + 1) + ')', function() {
          expect(isNothing(Just(t))).to.be.false;
        });
      });
    });


    var isJustSpec = {
      name: 'isJust',
      arity: 1,
    };


    describeFunction(isJustSpec, isJust, function(isJust) {
      it('Correct for Maybe', function() {
        expect(isJust(Maybe)).to.be.false;
      });


      it('Correct for Nothing', function() {
        expect(isJust(Nothing)).to.be.false;
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
          expect(isJust(t)).to.be.false;
        });


        it('Correct for Just (' + (i + 1) + ')', function() {
          expect(isJust(Just(t))).to.be.true;
        });
      });
    });


    var addCommonMaybeMakerTests = function(fnUnderTest, goodArgs) {
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


      it('Returned function preserves execution context', function() {
        var f = function() {f.exc = this;};
        f.exc = undefined;
        var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
        var obj = {};
        newFn.apply(obj);

        expect(f.exc).to.equal(obj);
      });
    };


    var maybeReturnerSpec = {
      name: 'makeMaybeReturner',
      arity: 2,
      restrictions: [['array'], ['function']],
      validArguments: [[[]], [function() {}]]
    };


    describeFunction(maybeReturnerSpec, maybe.makeMaybeReturner, function(makeMaybeReturner) {
      var notArrays = [1, true, 'a', undefined, null, {}, function() {}];
      var notFns = [1, true, 'a', undefined, null, {}, [1]];
      var goodArgs = [[1], function() {}];
      addCommonMaybeMakerTests(makeMaybeReturner, goodArgs);


      it('Returns Just <value> when value not in bad arguments array (1)', function() {
        var bad = [6, 7, 8, 9, 10];
        var f = function(x) {return x + 1;};
        var newFn = makeMaybeReturner(bad, f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isJust(r) && getJustValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Just <value> when value not in bad arguments array (2)', function() {
        var bad = [false, undefined, 'a'];
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeMaybeReturner(bad, f);
        var good = [true, null, 'b'];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isJust(r) && getJustValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Nothing when value in bad arguments array (1)', function() {
        var bad = [6, 7, 8, 9, 10];
        var f = function(x) {return x + 1;};
        var newFn = makeMaybeReturner(bad, f);
        var result = bad.every(function(v) {
          var r = newFn(v - 1);
          return isNothing(r);
        });

        expect(result).to.be.true;
      });


      it('Returns Nothing when value in bad arguments array (2)', function() {
        var bad = [false, undefined, 'a'];
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeMaybeReturner(bad, f);
        var result = bad.every(function(v) {
          var r = newFn(v);
          return isNothing(r);
        });

        expect(result).to.be.true;
      });


      it('Strict identity used for checking values in bad array (1)', function() {
        var o1 = {};
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeMaybeReturner([o1], f);
        var o2 = {};
        var val = newFn(o2);
        var result = isJust(val) && getJustValue(val) === o2;

        expect(result).to.be.true;
      });


      it('Strict identity used for checking values in bad array (2)', function() {
        var o1 = {};
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeMaybeReturner([o1], f);
        var val = newFn(o1);
        var result = isNothing(val);

        expect(result).to.be.true;
      });


      it('Always return Just if bad values array empty', function() {
        var f = function(x) {return x;}; // XXX ID REFACTORING
        var newFn = makeMaybeReturner([], f);
        var good = [true, null, undefined, 1, {}, function() {}, [], 'b'];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isJust(r) && getJustValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      // makeMaybeReturner should be curried
      var f1 = function(x) {return x;}; // XXX ID REFACTORING
      var badArgs = [1];
      var thenArgs = [1];
      testCurriedFunction('makeMaybeReturner', makeMaybeReturner, {firstArgs: [badArgs, f1], thenArgs: thenArgs});


      // And so should the returned function
      var f2 = function(x, y) {return x + y;};
      var newFn = makeMaybeReturner([], f2);
      testCurriedFunction('function returned by makeMaybeReturner', newFn, [2, 3]);
    });


    var predReturnerSpec = {
      name: 'makePredMaybeReturner',
      arity: 2,
      restrictions: [['function'], ['function']],
      validArguments: [[function(x) {}], [function() {}]]
    };


    describeFunction(predReturnerSpec, maybe.makePredMaybeReturner, function(makePredMaybeReturner) {
      var notFns = [1, true, 'a', undefined, {}, [1]];
      var goodArgs = [function(x) {}, function() {}];
      addCommonMaybeMakerTests(makePredMaybeReturner, goodArgs);


      it('Throws if predicate function doesn\'t have arity 1 (1)', function() {
        var pred = function() {};
        var f = function(x) {};
        var fn = function() {
          makePredMaybeReturner(pred, f);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if predicate function doesn\'t have arity 1 (2)', function() {
        var pred = function(x, y) {};
        var f = function() {};
        var fn = function() {
          makePredMaybeReturner(pred, f);
        };

        expect(fn).to.throw(TypeError);
      });


      notFns.forEach(function(val, i) {
        it('Predicate function called with result of original function (' + (i + 1) + ')', function() {
          var pred = function(x) {pred.called = true; pred.arg = x; return true;};
          pred.called = false;
          pred.arg = null;
          var f = function(x) {return x;}; // XXX ID REFACTORING
          var newFn = makePredMaybeReturner(pred, f);
          newFn(val);

          expect(pred.called).to.be.true;
          expect(pred.arg === val).to.be.true;
        });
      });


      it('Returns Just <value> when pred returns true (1)', function() {
        var pred = function(x) {return x < 6;};
        var f = function(x) {return x + 1;};
        var newFn = makePredMaybeReturner(pred, f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isJust(r) && getJustValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Just <value> when pred returns true (2)', function() {
        var pred = function(x) {return true;}; // XXX Use constant
        var f = function(x) {return x;};
        var newFn = makePredMaybeReturner(pred, f);
        var good = [true, null, 'b'];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isJust(r) && getJustValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      it('Returns Nothing when pred returns false (1)', function() {
        var pred = function(x) {return x < 6;};
        var f = function(x) {return x + 1;};
        var newFn = makePredMaybeReturner(pred, f);
        var bad = [6, 7, 8, 9, 10];
        var result = bad.every(function(v) {
          var r = newFn(v);
          return isNothing(r);
        });

        expect(result).to.be.true;
      });


      it('Returns Nothing when pred returns false (2)', function() {
        var pred = function(x) {return false;}; // XXX Use constant
        var f = function(x) {return x;};
        var newFn = makePredMaybeReturner(pred, f);
        var bad = [0, 1, 2, 3, 4];
        var result = bad.every(function(v) {
          var r = newFn(v);
          return isNothing(r);
        });

        expect(result).to.be.true;
      });


      // makePredMaybeReturner should be curried
      var f1 = function(x) {return x;}; // XXX ID REFACTORING
      var pred = function(x) {return true;};
      var thenArgs = [1];
      testCurriedFunction('makePredMaybeReturner', makePredMaybeReturner, {firstArgs: [pred, f1], thenArgs: thenArgs});


      // And so should the returned function
      var f2 = function(x, y) {return x + y;};
      var newFn = makePredMaybeReturner(pred, f2);
      testCurriedFunction('function returned by makePredMaybeReturner', newFn, [2, 3]);
    });


    var throwReturnerSpec = {
      name: 'makeThrowMaybeReturner',
      arity: 1,
      restrictions: [['function']],
      validArguments: [[function(x) {}]]
    };


    describeFunction(throwReturnerSpec, maybe.makeThrowMaybeReturner, function(makeThrowMaybeReturner) {
      var notFns = [1, true, 'a', undefined, {}, [1]];
      var goodArgs = [function() {}];
      addCommonMaybeMakerTests(makeThrowMaybeReturner, goodArgs);


      it('Returns Just <value> when function does not throw', function() {
        var f = function(x) {return x + 1;};
        var newFn = makeThrowMaybeReturner(f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isJust(r) && getJustValue(r) === f(v);
        });

        expect(result).to.be.true;
      });


      var thingsToThrow = [
        new Error(), new TypeError(), new SyntaxError(), new ReferenceError(),
        1, true, 'a', undefined, null, {}, function() {}, []];


      thingsToThrow.forEach(function(boom, i) {
        it('Doesn\'t throw if underlying function throws', function() {
          var f = function(x) {throw boom;};
          var newFn = makeThrowMaybeReturner(f);
          var fn = function() {
            newFn(1);
          };

          expect(fn).to.not.throw(boom);
        });


        it('Returns Nothing when function throws (' + (i + 1) + ')', function() {
          var f = function(x) {throw boom;};
          var newFn = makeThrowMaybeReturner(f);
          var r = newFn(1);
          var result = isNothing(r);

          expect(result).to.be.true;
        });
      });


      // The function returned by makeThrowMaybeReturner should be curried
      var f2 = function(x, y) {return x + y;};
      var newFn = makeThrowMaybeReturner(f2);
      testCurriedFunction('function returned by makeThrowMaybeReturner', newFn, [2, 3]);
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
