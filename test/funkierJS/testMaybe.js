//(function() {
//  "use strict";
//
//
//  var testFixture = function(require, exports) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var maybe = require('../../maybe');
//
//    var curryModule = require('../../curry');
//    var getRealArity = curryModule.getRealArity;
//
//    var base = require('../../base');
//    var id = base.id;
//
//    var utils = require('../../utils');
//    var valueStringifier = utils.valueStringifier;
//
//    // Import utility functions
//    var testUtils = require('./testUtils');
//    var describeModule = testUtils.describeModule;
//    var describeFunction = testUtils.describeFunction;
//    var testCurriedFunction = testUtils.testCurriedFunction;
//    var makeArrayLike = testUtils.makeArrayLike;
//
//
//    var expectedObjects = ['Maybe', 'Nothing'];
//    var expectedFunctions = ['Just', 'getJustValue', 'isMaybe', 'isJust', 'isNothing', 'makeMaybeReturner',
//                             'makePredMaybeReturner', 'makeThrowMaybeReturner'];
//    describeModule('maybe', maybe, expectedObjects, expectedFunctions);
//
//
//    var Maybe = maybe.Maybe;
//    var Just = maybe.Just;
//    var Nothing = maybe.Nothing;
//    var getJustValue = maybe.getJustValue;
//    var isJust = maybe.isJust;
//    var isNothing = maybe.isNothing;
//
//
//    describe('Maybe', function() {
//      it('Is a function', function() {
//        expect(Maybe).to.be.a('function');
//      });
//
//
//      it('Cannot be called directly (1)', function() {
//        var fn = function() {
//          var m = new Maybe();
//        };
//
//        expect(fn).to.throw(Error);
//      });
//
//
//      it('Cannot be called directly (2)', function() {
//        var fn = function() {
//          var m = Maybe();
//        };
//
//        expect(fn).to.throw(Error);
//      });
//
//
//      it('toString works correctly', function() {
//        var s = Maybe.prototype.toString();
//
//        expect(s).to.equal('Maybe');
//      });
//    });
//
//
//    describe('Nothing', function() {
//      it('Is an object', function() {
//        expect(Nothing).to.be.an('object');
//      });
//
//
//      it('Has no own properties', function() {
//        var ownProperties = Object.getOwnPropertyNames(Nothing);
//
//        expect(ownProperties.length).to.equal(0);
//      });
//
//
//      it('New properties cannot be added', function() {
//        var fn = function() {
//          Nothing.foo = 1;
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//
//
//      it('Is a Maybe', function() {
//        var result = Nothing instanceof Maybe;
//
//        expect(result).to.equal(true);
//      });
//
//
//      it('toString works correctly', function() {
//        var s = Nothing.toString();
//
//        expect(s).to.equal('Maybe {Nothing}');
//      });
//    });
//
//
//    // Values to generate various tests
//    var tests = [1, true, 'a', [], {}, function() {}, undefined, null];
//
//
//    var justSpec = {
//      name: 'Just',
//      arity: 1
//    };
//
//
//    describeFunction(justSpec, Just, function(Just) {
//      it('Throws when called with no arguments (1)', function() {
//        var fn = function() {
//          new Just();
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//
//
//      it('Throws when called with no arguments (2)', function() {
//        var fn = function() {
//          Just();
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//
//
//      var makeJustTest = function(message, testMakerFn) {
//        var withNew = function() {
//          return new Just(1);
//        };
//
//        var noNew = function() {
//          return Just(1);
//        };
//
//        it(message + ' when object created with new operator', testMakerFn(withNew));
//        it(message + ' when object created without new operator', testMakerFn(noNew));
//      };
//
//
//      makeJustTest('Returns an object', function(justMaker) {
//        return function() {
//          var j = justMaker();
//
//          expect(j).to.be.an('object');
//        };
//      });
//
//
//      makeJustTest('instanceof correct', function(justMaker) {
//        return function() {
//          var j = justMaker();
//
//          expect(j).to.be.an.instanceOf(Just);
//        };
//      });
//
//
//      makeJustTest('Returned object is also a Maybe', function(justMaker) {
//        return function() {
//          var j = justMaker();
//
//          expect(j).to.be.an.instanceOf(Maybe);
//        };
//      });
//
//
//      makeJustTest('Object created has \'value\' property', function(justMaker) {
//        return function() {
//          var j = justMaker();
//          var props = Object.getOwnPropertyNames(j);
//          var result = props.indexOf('value') !== -1;
//
//          expect(result).to.equal(true);
//        };
//      });
//
//
//      makeJustTest('\'value\' property is not enumerable', function(justMaker) {
//        return function() {
//          var j = justMaker();
//          var value = false;
//          for (var prop in j)
//            if (prop === 'value') value = true;
//          var result = !value;
//
//          expect(result).to.equal(true);
//        };
//      });
//
//
//      makeJustTest('\'value\' is immutable', function(justMaker) {
//        return function() {
//          var j = justMaker();
//          var fn = function() {
//            j.value = 2;
//          };
//
//          expect(fn).to.throw(TypeError);
//        };
//      });
//
//
//      makeJustTest('Returned object correct', function(justMaker) {
//        return function() {
//          var j = justMaker();
//
//          expect(getJustValue(j)).to.equal(1);
//        };
//      });
//
//
//      tests.forEach(function(t, i) {
//        it('toString works correctly (' + (i + 1) + ')', function() {
//          var j = new Just(t);
//          var s = j.toString();
//
//          expect(s).to.equal('Maybe {Just ' + valueStringifier(t) + '}');
//        });
//      });
//    });
//
//
//    var getJustValueSpec = {
//      name: 'getJustValue',
//      arity: 1,
//      restrictions: [[Just]],
//      validArguments: [[new Just(1)]]
//    };
//
//
//    describeFunction(getJustValueSpec, getJustValue, function(getJustValue) {
//      it('Throws if called with Maybe', function() {
//        var fn = function() {
//          getJustValue(Maybe);
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//
//
//      it('Throws if called with Nothing', function() {
//        var fn = function() {
//          getJustValue(Nothing);
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//
//
//      tests.forEach(function(t, i) {
//        it('Works correctly (' + (i + 1) + ')', function() {
//          var j = new Just(t);
//
//          expect(getJustValue(j)).to.equal(t);
//        });
//
//
//        it('Works correctly (' + (i + 2) + ')', function() {
//          var j = Just(t);
//
//          expect(getJustValue(j)).to.equal(t);
//        });
//      });
//    });
//
//
//    var isMaybeSpec = {
//      name: 'isMaybe',
//      arity: 1,
//    };
//
//
//    describeFunction(isMaybeSpec, maybe.isMaybe, function(isMaybe) {
//      it('Correct for Maybe', function() {
//        expect(isMaybe(Maybe)).to.equal(true);
//      });
//
//
//      it('Correct for Nothing', function() {
//        expect(isMaybe(Nothing)).to.equal(true);
//      });
//
//
//      tests.forEach(function(t, i) {
//        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
//          expect(isMaybe(t)).to.equal(false);
//        });
//
//
//        it('Works correctly (' + (i + 1) + ')', function() {
//          expect(isMaybe(Just(t))).to.equal(true);
//        });
//      });
//    });
//
//
//    var isNothingSpec = {
//      name: 'isNothing',
//      arity: 1,
//    };
//
//
//    describeFunction(isNothingSpec, isNothing, function(isNothing) {
//      it('Correct for Maybe', function() {
//        expect(isNothing(Maybe)).to.equal(false);
//      });
//
//
//      it('Correct for Nothing', function() {
//        expect(isNothing(Nothing)).to.equal(true);
//      });
//
//
//      tests.forEach(function(t, i) {
//        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
//          expect(isNothing(t)).to.equal(false);
//        });
//
//
//        it('Correct for Just (' + (i + 1) + ')', function() {
//          expect(isNothing(Just(t))).to.equal(false);
//        });
//      });
//    });
//
//
//    var isJustSpec = {
//      name: 'isJust',
//      arity: 1,
//    };
//
//
//    describeFunction(isJustSpec, isJust, function(isJust) {
//      it('Correct for Maybe', function() {
//        expect(isJust(Maybe)).to.equal(false);
//      });
//
//
//      it('Correct for Nothing', function() {
//        expect(isJust(Nothing)).to.equal(false);
//      });
//
//
//      tests.forEach(function(t, i) {
//        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
//          expect(isJust(t)).to.equal(false);
//        });
//
//
//        it('Correct for Just (' + (i + 1) + ')', function() {
//          expect(isJust(Just(t))).to.equal(true);
//        });
//      });
//    });
//
//
//    var addCommonMaybeMakerTests = function(fnUnderTest, goodArgs) {
//      it('Returns a function', function() {
//        var result = fnUnderTest.apply(null, goodArgs);
//
//        expect(result).to.be.a('function');
//      });
//
//
//      var addSameArityTest = function(message, f) {
//        it('Returned function has same arity ' + message, function() {
//          var expected = getRealArity(f);
//          var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
//
//          expect(getRealArity(newFn)).to.equal(getRealArity(f));
//        });
//      };
//
//
//      addSameArityTest('(1)', function() {});
//      addSameArityTest('(2)', function(x, y, z) {});
//
//
//      var addCallsOriginalTest = function(message, args) {
//        it('Returned function calls original function with given args ' + message, function() {
//          var called = false;
//          var fArgs = null;
//
//          var f = args.length > 1 ? function(x, y) {called = true; fArgs = [x, y]; return 0;} :
//                                      function(x) {called = true; fArgs = [x]; return 0;};
//          var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
//          newFn.apply(null, args);
//
//          expect(called).to.equal(true);
//          expect(fArgs).to.deep.equal(args);
//        });
//      };
//
//
//      addCallsOriginalTest('(1)', [1, 2]);
//      addCallsOriginalTest('(2)', ['a']);
//
//
//      it('Returned function preserves execution context', function() {
//        var f = function() {f.exc = this;};
//        f.exc = undefined;
//        var newFn = fnUnderTest.apply(null, goodArgs.length > 1 ? [goodArgs[0], f] : [f]);
//        var obj = {};
//        newFn.apply(obj);
//
//        expect(f.exc).to.equal(obj);
//      });
//    };
//
//
//    var maybeReturnerSpec = {
//      name: 'makeMaybeReturner',
//      arity: 2,
//      restrictions: [['strictarraylike'], ['function']],
//      validArguments: [[[], makeArrayLike()], [function() {}]]
//    };
//
//
//    describeFunction(maybeReturnerSpec, maybe.makeMaybeReturner, function(makeMaybeReturner) {
//      var goodArgs = [[1], function() {}];
//      addCommonMaybeMakerTests(makeMaybeReturner, goodArgs);
//
//
//      var addReturnsJustTests = function(message, bad, good, f) {
//        it('Returns Just <value> when original function\'s result not in bad arguments array ' + message, function() {
//          var newFn = makeMaybeReturner(bad, f);
//          var good = [0, 1, 2, 3, 4];
//          var result = good.every(function(v) {
//            var r = newFn(v);
//            return isJust(r) && getJustValue(r) === f(v);
//          });
//
//          expect(result).to.equal(true);
//        });
//      };
//
//
//      addReturnsJustTests('(1)', [6, 7, 8, 9, 10], [0, 1, 2, 3, 4], function(x) {return x + 1;});
//      addReturnsJustTests('(2)', [false, undefined, 'a'], [true, null, 'b'], id);
//
//
//      var addReturnsNothingTests = function(message, bad, badReturners, f) {
//        it('Returns Nothing when original function\'s result in bad arguments array ' + message, function() {
//          var newFn = makeMaybeReturner(bad, f);
//          var result = badReturners.every(function(v) {
//            var r = newFn(v);
//            return isNothing(r);
//          });
//
//          expect(result).to.equal(true);
//        });
//      };
//
//
//      addReturnsNothingTests('(1)', [6, 7, 8, 9, 10], [5, 6, 7, 8, 9], function(x) {return x + 1;});
//      addReturnsNothingTests('(2)', [false, undefined, 'a'], [false, undefined, 'a'], id);
//
//      var obj = {};
//      addReturnsJustTests('(tested for strict identity)', [obj], [{}], id);
//      addReturnsNothingTests('(tested for strict identity)', [obj], [obj], id);
//
//      addReturnsJustTests('(when bad values array empty)', [], [true, null, undefined, 1, function() {}, {}, [], 'b'],
//                          id);
//
//
//      // makeMaybeReturner should be curried
//      var f1 = id;
//      var badArgs = [1];
//      var thenArgs = [1];
//      testCurriedFunction(makeMaybeReturner, {firstArgs: [badArgs, f1], thenArgs: thenArgs});
//
//
//      // And so should the returned function
//      var f2 = function(x, y) {return x + y;};
//      var newFn = makeMaybeReturner([], f2);
//      testCurriedFunction(newFn, [2, 3], {message: 'function returned by makeMaybeReturner'});
//    });
//
//
//    var predReturnerSpec = {
//      name: 'makePredMaybeReturner',
//      arity: 2,
//      restrictions: [['function: arity 1'], ['function']],
//      validArguments: [[function(x) {}], [function() {}]]
//    };
//
//
//    describeFunction(predReturnerSpec, maybe.makePredMaybeReturner, function(makePredMaybeReturner) {
//      var notFns = [1, true, 'a', undefined, {}, [1]];
//      var goodArgs = [function(x) {}, function() {}];
//      addCommonMaybeMakerTests(makePredMaybeReturner, goodArgs);
//
//
//      notFns.forEach(function(val, i) {
//        it('Predicate function called with result of original function (' + (i + 1) + ')', function() {
//          var called = false;
//          var arg = null;
//          var pred = function(x) {called = true; arg = x; return true;};
//
//          var f = id;
//          var newFn = makePredMaybeReturner(pred, f);
//          newFn(val);
//
//          expect(called).to.equal(true);
//          expect(arg).to.equal(val);
//        });
//      });
//
//
//      var addReturnsJustOnTrueTest = function(message, pred, good, f)  {
//        it('Returns Just <value> when pred returns true ' + message, function() {
//          var newFn = makePredMaybeReturner(pred, f);
//
//          var result = good.every(function(v) {
//            var r = newFn(v);
//            return isJust(r) && getJustValue(r) === f(v);
//          });
//
//          expect(result).to.equal(true);
//        });
//      };
//
//
//      addReturnsJustOnTrueTest('(1)', function(x) {return x < 6;}, [0, 1, 2, 3, 4], function(x) {return x + 1;});
//      addReturnsJustOnTrueTest('(2)', base.constant(true), [true, 1, {}], id);
//
//
//      var addReturnsNothingOnFalseTest = function(message, pred, bad, f)  {
//        it('Returns Nothing when pred returns false ' + message, function() {
//          var newFn = makePredMaybeReturner(pred, f);
//
//          var result = bad.every(function(v) {
//            var r = newFn(v);
//            return isNothing(r);
//          });
//
//          expect(result).to.equal(true);
//        });
//      };
//
//
//      addReturnsNothingOnFalseTest('(1)', function(x) {return x < 6;}, [5, 6, 7, 8, 9], function(x) {return x + 1;});
//      addReturnsNothingOnFalseTest('(2)', base.constant(false), [true, 1, {}], id);
//
//
//      // makePredMaybeReturner should be curried
//      var pred = function(x) {return true;};
//      var thenArgs = [1];
//      testCurriedFunction(makePredMaybeReturner, {firstArgs: [pred, id], thenArgs: thenArgs});
//
//
//      // And so should the returned function
//      var f2 = function(x, y) {return x + y;};
//      var newFn = makePredMaybeReturner(pred, f2);
//      testCurriedFunction(newFn, [2, 3], {message: 'function returned by makePredMaybeReturner'});
//    });
//
//
//    var throwReturnerSpec = {
//      name: 'makeThrowMaybeReturner',
//      arity: 1,
//      restrictions: [['function']],
//      validArguments: [[function(x) {}]]
//    };
//
//
//    describeFunction(throwReturnerSpec, maybe.makeThrowMaybeReturner, function(makeThrowMaybeReturner) {
//      var goodArgs = [function() {}];
//      addCommonMaybeMakerTests(makeThrowMaybeReturner, goodArgs);
//
//
//      it('Returns Just <value> when function does not throw', function() {
//        var f = function(x) {return x + 1;};
//        var newFn = makeThrowMaybeReturner(f);
//        var good = [0, 1, 2, 3, 4];
//        var result = good.every(function(v) {
//          var r = newFn(v);
//          return isJust(r) && getJustValue(r) === f(v);
//        });
//
//        expect(result).to.equal(true);
//      });
//
//
//      var thingsToThrow = [
//        new Error(), new TypeError(), new SyntaxError(), new ReferenceError(),
//        1, true, 'a', undefined, null, {}, function() {}, []];
//
//
//      thingsToThrow.forEach(function(boom, i) {
//        it('Doesn\'t throw if underlying function throws', function() {
//          var f = function(x) {throw boom;};
//          var newFn = makeThrowMaybeReturner(f);
//          var fn = function() {
//            newFn(1);
//          };
//
//          expect(fn).to.not.throw(boom);
//        });
//
//
//        it('Returns Nothing when function throws (' + (i + 1) + ')', function() {
//          var f = function(x) {throw boom;};
//          var newFn = makeThrowMaybeReturner(f);
//          var r = newFn(1);
//          var result = isNothing(r);
//
//          expect(result).to.equal(true);
//        });
//      });
//
//
//      // The function returned by makeThrowMaybeReturner should be curried
//      var f2 = function(x, y) {return x + y;};
//      var newFn = makeThrowMaybeReturner(f2);
//      testCurriedFunction(newFn, [2, 3], {message: 'function returned by makeThrowMaybeReturner'});
//    });
//  };
//
//
//  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
//  if (typeof(define) === "function") {
//    define(function(require, exports, module) {
//      testFixture(require, exports, module);
//    });
//  } else {
//    testFixture(require, exports, module);
//  }
//})();
