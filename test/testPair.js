(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var pair = require('../pair');

    var curryModule = require('../curry');
    var getRealArity = curryModule.getRealArity;

    var utils = require('../utils');
    var valueStringifier = utils.valueStringifier;

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;


    var expectedObjects = [];
    var expectedFunctions = ['Pair', 'fst', 'snd', 'isPair', 'asArray'];
    describeModule('pair', pair, expectedObjects, expectedFunctions);


    var Pair = pair.Pair;
    var fst = pair.fst;
    var snd = pair.snd;


    describe('Pair constructor', function() {
      // Note we cannot use describeFunction for the traditional arity testing
      // here, as the constructor is not curried in the normal sense

      it('Has correct arity', function() {
        expect(getRealArity(Pair)).to.equal(2);
      });


      it('Throws when called with no arguments (1)', function() {
        var fn = function() {
          new Pair();
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws when called with no arguments (2)', function() {
        var fn = function() {
          Pair();
        };

        expect(fn).to.throw(TypeError);
      });


      var makePairTest = function(message, testMaker) {
        var withNew = function() {
          return new Pair(1, 2);
        };

        var noNew = function() {
          return Pair(1, 2);
        };


        it(message + ' (when pair constructed with new)', testMaker(withNew));
        it(message + ' (when pair constructed without new)', testMaker(noNew));
      };


      makePairTest('Returns an object', function(pairMaker) {
        return function() {
          var p = pairMaker();

          expect(p).to.be.an('object');
        };
      });


      makePairTest('instanceof correct', function(pairMaker) {
        return function() {
          var p = pairMaker();

          expect(p).to.be.an.instanceOf(Pair);
        };
      });


      makePairTest('Has \'first\' property', function(pairMaker) {
        return function() {
          var p = pairMaker();
          var props = Object.getOwnPropertyNames(p);
          var result = props.indexOf('first') !== -1;

          expect(result).to.equal(true);
        };
      });


      makePairTest('Has \'second\' property', function(pairMaker) {
        return function() {
          var p = pairMaker();
          var props = Object.getOwnPropertyNames(p);
          var result = props.indexOf('second') !== -1;

          expect(result).to.equal(true);
        };
      });


      makePairTest('\'first\' and \'second\' properties are not enumerable', function(pairMaker) {
        return function() {
          var p = pairMaker();
          var first = false;
          var second = false;
          for (var prop in p) {
            if (prop === 'first') first = true;
            if (prop === 'second') second = true;
          }
          var result = !first && !second;

          expect(result).to.equal(true);
        };
      });


      makePairTest('\'first\' is immutable', function(pairMaker) {
        return function() {
          var p = pairMaker();
          var fn = function() {
            p.first = 3;
          };

          expect(fn).to.throw(TypeError);
        };
      });


      makePairTest('\'second\' is immutable', function(pairMaker) {
        return function() {
          var p = pairMaker();
          var fn = function() {
            p.second = 3;
          };

          expect(fn).to.throw(TypeError);
        };
      });


      makePairTest('Returns function of arity 1 if called with one argument', function(pairMaker) {
        return function() {
          var p = new Pair(1);

          expect(p).to.be.a('function');
          expect(p.length).to.equal(1);
        };
      });


      var makeCurriedPairTest = function(message, testMaker) {
        var withNew = function() {
          return new Pair(1);
        };

        var noNew = function() {
          return Pair(1);
        };


        it(message + ' (when pair constructed with new', testMaker(withNew));
        it(message + ' (when pair constructed without new', testMaker(noNew));
      };


      makeCurriedPairTest('Returns Pair when called with 1 argument, and result is called with another', function(pairMaker) {
        return function() {
          var f = pairMaker();
          var p = f(2);

          expect(p).to.be.an('object');
          expect(p).to.be.an.instanceOf(Pair);
        };
      });


      makeCurriedPairTest('Returned function can be called with new', function(pairMaker) {
        return function() {
          var F = pairMaker();
          var p = new F(2);

          expect(p).to.be.an('object');
          expect(p).to.be.an.instanceOf(Pair);
        };
      });


      makeCurriedPairTest('Returned function can be called without new', function(pairMaker) {
        return function() {
          var f = pairMaker();
          var p = f(2);

          expect(p).to.be.an('object');
          expect(p).to.be.an.instanceOf(Pair);
        };
      });


      makeCurriedPairTest('instanceof also correct in terms of returned function (1)', function(pairMaker) {
        return function() {
          var F = pairMaker();
          var p = new F(2);

          expect(p).to.be.an.instanceOf(F);
        };
      });


      makeCurriedPairTest('instanceof also correct in terms of returned function (2)', function(pairMaker) {
        return function() {
          var f = pairMaker();
          var p = f(2);

          expect(p).to.be.an.instanceOf(f);
        };
      });


      makeCurriedPairTest('Returned object correct (1)', function(pairMaker) {
        return function() {
          var F = pairMaker();
          var p = new F(2);

          expect(fst(p)).to.equal(1);
          expect(snd(p)).to.equal(2);
        };
      });


      makeCurriedPairTest('Returned object correct (2)', function(pairMaker) {
        return function() {
          var f = pairMaker();
          var p = f(2);

          expect(fst(p)).to.equal(1);
          expect(snd(p)).to.equal(2);
        };
      });
    });


    // Test data for generating the fst and snd tests
    var tests = [
     [1, 'a'], [true, {}], [[2], null], [undefined, function() {}]
    ];


    var fstSpec = {
      name: 'fst',
      arity: 1,
      restrictions: [[Pair]],
      validArguments: [[new Pair(1, 2)]]
    };


    describeFunction(fstSpec, fst, function(fst) {
      tests.forEach(function(t, i) {
        it('Works correctly (' + (i + 1) + ')', function() {
          var p = Pair(t[0], t[1]);

          expect(fst(p)).to.equal(t[0]);
        });


        it('Works correctly (' + (i + 2) + ')', function() {
          var p = Pair(t[1], t[0]);

          expect(fst(p)).to.equal(t[1]);
        });
      });
    });


    var sndSpec = {
      name: 'snd',
      arity: 1,
      restrictions: [[Pair]],
      validArguments: [[new Pair(1, 2)]]
    };


    describeFunction(sndSpec, snd, function(snd) {
      tests.forEach(function(t, i) {
        it('Works correctly (' + (2 * i + 1) + ')', function() {
          var p = Pair(t[0], t[1]);

          expect(snd(p)).to.equal(t[1]);
        });


        it('Works correctly (' + (2 * i + 2) + ')', function() {
          var p = Pair(t[1], t[0]);

          expect(snd(p)).to.equal(t[0]);
        });
      });
    });


    var isPairSpec = {
      name: 'isPair',
      arity: 1
    };


    describeFunction(isPairSpec, pair.isPair, function(isPair) {
      tests.forEach(function(t, i) {
        it('Returns false if called with non-Pair value (' + (2 * i + 1) + ')', function() {
          expect(isPair(t[0])).to.equal(false);
        });

        it('Returns false if called with non-Pair value (' + (2 * i + 2) + ')', function() {
          expect(isPair(t[1])).to.equal(false);
        });

        it('Works correctly (' + (i + 1) + ')', function() {
          expect(isPair(Pair(t[0], t[1]))).to.equal(true);
        });
      });
    });


    describe('toString', function() {
      it('toString defined by prototype (1)', function() {
        var p = new Pair(1, 2);

        expect(p.hasOwnProperty('toString')).to.equal(false);
      });


      it('toString defined by prototype (2)', function() {
        var proto = Object.getPrototypeOf(Pair);

        expect(proto.hasOwnProperty('toString')).to.equal(true);
      });


      it('Has correct arity', function() {
        var proto = Object.getPrototypeOf(Pair);

        expect(getRealArity(proto.toString)).to.equal(0);
      });


      tests.forEach(function(t, i) {
        it('Works correctly (' + (2 * i + 1) + ')', function() {
          var p = Pair(t[0], t[1]);
          var s = p.toString();

          expect(s).to.equal(['Pair (', valueStringifier(t[0]), ', ', valueStringifier(t[1]) + ')'].join(''));
        });


        it('Works correctly (' + (2 * i + 2) + ')', function() {
          var p = Pair(t[1], t[0]);
          var s = p.toString();

          expect(s).to.equal(['Pair (', valueStringifier(t[1]), ', ', valueStringifier(t[0]) + ')'].join(''));
        });
      });
    });


    var asArraySpec = {
      name: 'asArray',
      arity: 1,
      restrictions: [[Pair]],
      validArguments: [[new Pair(2, 3)]]
    };


    describeFunction(asArraySpec, pair.asArray, function(asArray) {
      tests.forEach(function(t, i) {
        it('Works correctly (' + (2 * i + 1) + ')', function() {
          var arr = asArray(Pair(t[0], t[1]));

          expect(Array.isArray(arr)).to.equal(true);
          expect(arr.length).to.equal(2);
          expect(arr[0]).to.equal(t[0]);
          expect(arr[1]).to.equal(t[1]);
        });


        it('Works correctly (' + (2 * i + 2) + ')', function() {
          var arr = asArray(Pair(t[1], t[0]));

          expect(Array.isArray(arr)).to.equal(true);
          expect(arr.length).to.equal(2);
          expect(arr[0]).to.equal(t[1]);
          expect(arr[1]).to.equal(t[0]);
        });
      });
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
