(function() {
  "use strict";


  var expect = require('chai').expect;

  var maybe = require('../../lib/components/maybe');

  var curryModule = require('../../lib/components/curry');
  var arityOf = curryModule.arityOf;
  var objectCurry = curryModule.objectCurry;

  var internalUtilities = require('../../lib/internalUtilities');
  var valueStringifier = internalUtilities.valueStringifier;

  var testUtils = require('./testingUtilities');
  var checkModule = testUtils.checkModule;
  var checkFunction = testUtils.checkFunction;
  var makeArrayLike = testUtils.makeArrayLike;
  var addCurryStyleTests = testUtils.addCurryStyleTests;


  describe('Maybe', function() {
    var expectedObjects = ['Maybe', 'Nothing'];
    var expectedFunctions = ['Just', 'getJustValue', 'isMaybe', 'isJust', 'isNothing', 'makeMaybeReturner'];
    checkModule('maybe', maybe, expectedObjects, expectedFunctions);


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


      it('Is a Maybe (1)', function() {
        var result = Nothing instanceof Maybe;

        expect(result).to.equal(true);
      });


      it('Is a Maybe (2)', function() {
        var result = Nothing.constructor === Maybe;

        expect(result).to.equal(true);
      });


      it('toString works correctly', function() {
        var s = Nothing.toString();

        expect(s).to.equal('Maybe {Nothing}');
      });
    });


    // Values to generate various tests
    var tests = [1, true, 'a', [], {}, function() {}, undefined, null];


    describe('Just', function() {
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


      var makeJustTest = function(message, testMakerFn) {
        var withNew = function() {
          return new Just(1);
        };

        var noNew = function() {
          return Just(1);
        };

        it(message + ' when object created with new operator', testMakerFn(withNew));
        it(message + ' when object created without new operator', testMakerFn(noNew));
      };


      makeJustTest('Returns an object', function(justMaker) {
        return function() {
          var j = justMaker();

          expect(j).to.be.an('object');
        };
      });


      makeJustTest('instanceof correct', function(justMaker) {
        return function() {
          var j = justMaker();

          expect(j).to.be.an.instanceOf(Just);
        };
      });


      makeJustTest('Returned object is also a Maybe (1)', function(justMaker) {
        return function() {
          var j = justMaker();

          expect(j).to.be.an.instanceOf(Maybe);
        };
      });


      makeJustTest('Returned object is also a Maybe (2)', function(justMaker) {
        return function() {
        var result = Nothing.constructor === Maybe;

        expect(result).to.equal(true);
        };
      });


      makeJustTest('Object created has \'value\' property', function(justMaker) {
        return function() {
          var j = justMaker();
          var props = Object.getOwnPropertyNames(j);
          var result = props.indexOf('value') !== -1;

          expect(result).to.equal(true);
        };
      });


      makeJustTest('\'value\' property is not enumerable', function(justMaker) {
        return function() {
          var j = justMaker();
          var value = false;
          for (var prop in j)
            if (prop === 'value') value = true;
          var result = !value;

          expect(result).to.equal(true);
        };
      });


      makeJustTest('\'value\' is immutable', function(justMaker) {
        return function() {
          var j = justMaker();
          var fn = function() {
            j.value = 2;
          };

          expect(fn).to.throw(TypeError);
        };
      });


      makeJustTest('Returned object correct', function(justMaker) {
        return function() {
          var j = justMaker();

          expect(getJustValue(j)).to.equal(1);
        };
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
      restrictions: [[Just]],
      validArguments: [[new Just(1)]]
    };


    checkFunction(getJustValueSpec, getJustValue, function(getJustValue) {
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


    describe('isMaybe', function() {
      var isMaybe = maybe.isMaybe;


      it('Correct for Maybe', function() {
        expect(isMaybe(Maybe)).to.equal(true);
      });


      it('Correct for Nothing', function() {
        expect(isMaybe(Nothing)).to.equal(true);
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
          expect(isMaybe(t)).to.equal(false);
        });


        it('Works correctly (' + (i + 1) + ')', function() {
          expect(isMaybe(Just(t))).to.equal(true);
        });
      });
    });


    describe('isNothing', function() {
      it('Correct for Maybe', function() {
        expect(isNothing(Maybe)).to.equal(false);
      });


      it('Correct for Nothing', function() {
        expect(isNothing(Nothing)).to.equal(true);
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
          expect(isNothing(t)).to.equal(false);
        });


        it('Correct for Just (' + (i + 1) + ')', function() {
          expect(isNothing(Just(t))).to.equal(false);
        });
      });
    });


    describe('isJust', function() {
      it('Correct for Maybe', function() {
        expect(isJust(Maybe)).to.equal(false);
      });


      it('Correct for Nothing', function() {
        expect(isJust(Nothing)).to.equal(false);
      });


      tests.forEach(function(t, i) {
        it('Returns false if called with non-Maybe value (' + (i + 1) + ')', function() {
          expect(isJust(t)).to.equal(false);
        });


        it('Correct for Just (' + (i + 1) + ')', function() {
          expect(isJust(Just(t))).to.equal(true);
        });
      });
    });


    var maybeReturnerSpec = {
      name: 'makeMaybeReturner',
      restrictions: [['function']],
      validArguments: [[function(x) {}]]
    };


    checkFunction(maybeReturnerSpec, maybe.makeMaybeReturner, function(makeMaybeReturner) {
      it('Returns a function', function() {
        var result = makeMaybeReturner(function() {});

        expect(result).to.be.a('function');
      });


      var addSameArityTest = function(message, f) {
        it('Returned function has same arity ' + message, function() {
          var expected = arityOf(f);
          var newFn = makeMaybeReturner(f);

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
          var newFn = makeMaybeReturner(f);
          newFn.apply(null, args);

          expect(called).to.equal(true);
          expect(fArgs).to.deep.equal(args);
        });
      };


      addCallsOriginalTest('(1)', [1, 2]);
      addCallsOriginalTest('(2)', ['a']);


      it('Returns Just <value> when function does not throw', function() {
        var f = function(x) {return x + 1;};
        var newFn = makeMaybeReturner(f);
        var good = [0, 1, 2, 3, 4];
        var result = good.every(function(v) {
          var r = newFn(v);
          return isJust(r) && getJustValue(r) === f(v);
        });

        expect(result).to.equal(true);
      });


      var thingsToThrow = [
        new Error(), new TypeError(), new SyntaxError(), new ReferenceError(),
        1, true, 'a', undefined, null, {}, function() {}, []];


      thingsToThrow.forEach(function(boom, i) {
        it('Doesn\'t throw if underlying function throws', function() {
          var f = function(x) {throw boom;};
          var newFn = makeMaybeReturner(f);
          var fn = function() {
            newFn(1);
          };

          expect(fn).to.not.throw(boom);
        });


        it('Returns Nothing when function throws (' + (i + 1) + ')', function() {
          var f = function(x) {throw boom;};
          var newFn = makeMaybeReturner(f);
          var r = newFn(1);
          var result = isNothing(r);

          expect(result).to.equal(true);
        });
      });


      addCurryStyleTests(function(f) { return makeMaybeReturner(f); });


      it('Passes execution context to original function', function() {
        var context;
        var f = objectCurry(function(x) { context = this; return 1; });
        var newFn = makeMaybeReturner(f);
        var obj = {};
        var r = newFn.apply(obj, [1]);

        expect(context).to.equal(obj);
      });
    });
  });
})();
