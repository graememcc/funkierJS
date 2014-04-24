(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var pair = require('../pair');
    var utils = require('../utils');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var getRealArity = base.getRealArity;
    var valueStringifier = utils.valueStringifier;


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


      it('Returns an object when called with new operator', function() {
        var p = new Pair(1, 2);

        expect(p).to.be.an('object');
      });


      it('Returns an object when called without new operator', function() {
        var p = Pair(1, 2);

        expect(p).to.be.an('object');
      });


      it('instanceof correct for object created by new', function() {
        var p = new Pair(1, 2);

        expect(p).to.be.an.instanceOf(Pair);
      });


      it('instanceof correct for object created without new', function() {
        var p = Pair(1, 2);

        expect(p).to.be.an.instanceOf(Pair);
      });


      it('Object created with new has \'first\' property', function() {
        var p = new Pair(1, 2);
        var props = Object.getOwnPropertyNames(p);
        var result = props.indexOf('first') !== -1;

        expect(result).to.be.true;
      });


      it('Object created with new has \'second\' property', function() {
        var p = new Pair(1, 2);
        var props = Object.getOwnPropertyNames(p);
        var result = props.indexOf('second') !== -1;

        expect(result).to.be.true;
      });


      it('Object created without new has \'first\' property', function() {
        var p = Pair(1, 2);
        var props = Object.getOwnPropertyNames(p);
        var result = props.indexOf('first') !== -1;

        expect(result).to.be.true;
      });


      it('Object created without new has \'second\' property', function() {
        var p = Pair(1, 2);
        var props = Object.getOwnPropertyNames(p);
        var result = props.indexOf('second') !== -1;

        expect(result).to.be.true;
      });


      it('\'first\' and \'second\' properties are not enumerable (1)', function() {
        var p = new Pair(1, 2);
        var first = false;
        var second = false;
        for (var prop in p) {
          if (prop === 'first') first = true;
          if (prop === 'second') second = true;
        }
        var result = !first && !second;

        expect(result).to.be.true;
      });


      it('\'first\' and \'second\' properties are not enumerable (2)', function() {
        var p = Pair(1, 2);
        var first = false;
        var second = false;
        for (var prop in p) {
          if (prop === 'first') first = true;
          if (prop === 'second') second = true;
        }
        var result = !first && !second;

        expect(result).to.be.true;
      });


      it('\'first\' is immutable (1)', function() {
        var p = new Pair(1, 2);
        var fn = function() {
          p.first = 3;
        };

        expect(fn).to.throw(TypeError);
      });


      it('\'first\' is immutable (2)', function() {
        var p = Pair(1, 2);
        var fn = function() {
          p.first = 3;
        };

        expect(fn).to.throw(TypeError);
      });


      it('\'second\' is immutable (1)', function() {
        var p = new Pair(1, 2);
        var fn = function() {
          p.second = 3;
        };

        expect(fn).to.throw(TypeError);
      });


      it('\'second\' is immutable (2)', function() {
        var p = Pair(1, 2);
        var fn = function() {
          p.second = 3;
        };

        expect(fn).to.throw(TypeError);
      });


      it('Returns function of arity 1 if called with one argument (1)', function() {
        var p = new Pair(1);

        expect(p).to.be.a('function');
        expect(p.length).to.equal(1);
      });


      it('Returns function of arity 1 if called with one argument (2)', function() {
        var p = Pair(1);

        expect(p).to.be.a('function');
        expect(p.length).to.equal(1);
      });


      it('Returns Pair when called with 1 argument, and result is called with another (1)', function() {
        var f = new Pair(1);
        var p = f(2)

        expect(p).to.be.an('object');
        expect(p).to.be.an.instanceOf(Pair);
      });


      it('Returns Pair when called with 1 argument, and result is called with another (2)', function() {
        var f = Pair(1);
        var p = f(2)

        expect(p).to.be.an('object');
        expect(p).to.be.an.instanceOf(Pair);
      });


      it('Returned function can be called with new (1)', function() {
        var f = new Pair(1);
        var p = new f(2)

        expect(p).to.be.an('object');
        expect(p).to.be.an.instanceOf(Pair);
      });


      it('Returned function can be called with new (2)', function() {
        var f = Pair(1);
        var p = new f(2)

        expect(p).to.be.an('object');
        expect(p).to.be.an.instanceOf(Pair);
      });


      it('instanceof also correct in terms of returned function (1)', function() {
        var f = new Pair(1);
        var p = new f(2)

        expect(p).to.be.an.instanceOf(f);
      });


      it('instanceof also correct in terms of returned function (2)', function() {
        var f = Pair(1);
        var p = new f(2)

        expect(p).to.be.an('object');
        expect(p).to.be.an.instanceOf(Pair);
      });


      it('instanceof also correct in terms of returned function (3)', function() {
        var f = new Pair(1);
        var p = f(2)

        expect(p).to.be.an.instanceOf(f);
      });


      it('instanceof also correct in terms of returned function (4)', function() {
        var f = Pair(1);
        var p = f(2)

        expect(p).to.be.an.instanceOf(Pair);
      });


      it('Returned object correct (1)', function() {
        var f = new Pair(1);
        var p = new f(2)

        expect(fst(p)).to.equal(1);
        expect(snd(p)).to.equal(2);
      });


      it('Returned object correct (2)', function() {
        var f = Pair(1);
        var p = new f(2)

        expect(fst(p)).to.equal(1);
        expect(snd(p)).to.equal(2);
      });


      it('Returned object correct (3)', function() {
        var f = new Pair(1);
        var p = f(2)

        expect(fst(p)).to.equal(1);
        expect(snd(p)).to.equal(2);
      });


      it('Returned object correct (4)', function() {
        var f = Pair(1);
        var p = f(2)

        expect(fst(p)).to.equal(1);
        expect(snd(p)).to.equal(2);
      });
    });


    // Test data for generating the fst and snd tests
    var tests = [
     [1, 'a'], [true, {}], [[2], null], [undefined, function() {}]
    ];


    describeFunction('fst', fst, 1, function(fst) {
      tests.forEach(function(t, i) {
        it('Throws if called with non-Pair value (' + (i + 1) + ')', function() {
          var fn = function() {
            fst(t[0]);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if called with non-Pair value (' + (i + 2) + ')', function() {
          var fn = function() {
            fst(t[1]);
          };

          expect(fn).to.throw(TypeError);
        });


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


    describeFunction('snd', snd, 1, function(snd) {
      it('Has correct arity', function() {
        expect(getRealArity(snd)).to.equal(1);
      });


      tests.forEach(function(t, i) {
        it('Throws if called with non-Pair value (' + (2 * i + 1) + ')', function() {
          var fn = function() {
            snd(t[0]);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if called with non-Pair value (' + (2 * i + 2) + ')', function() {
          var fn = function() {
            snd(t[1]);
          };

          expect(fn).to.throw(TypeError);
        });


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


    describeFunction('isPair', pair.isPair, 1, function(isPair) {
      tests.forEach(function(t, i) {
        it('Returns false if called with non-Pair value (' + (2 * i + 1) + ')', function() {
          expect(isPair(t[0])).to.be.false;
        });

        it('Returns false if called with non-Pair value (' + (2 * i + 2) + ')', function() {
          expect(isPair(t[1])).to.be.false;
        });

        it('Works correctly (' + (i + 1) + ')', function() {
          expect(isPair(Pair(t[0], t[1]))).to.be.true;
        });
      });
    });


    describe('toString', function() {
      it('toString defined by prototype (1)', function() {
        var p = new Pair(1, 2);

        expect(p.hasOwnProperty('toString')).to.be.false;
      });


      it('toString defined by prototype (2)', function() {
        var proto = Object.getPrototypeOf(Pair);

        expect(proto.hasOwnProperty('toString')).to.be.true;
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


    describeFunction('asArray', pair.asArray, 1, function(asArray) {
      tests.forEach(function(t, i) {
        it('Throws if argument is not a pair (' + (2 * i + 1) + ')', function() {
          var fn = function() {
            asArray(t[0]);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if argument is not a pair (' + (2 * i + 2) + ')', function() {
          var fn = function() {
            asArray(t[0]);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Works correctly (' + (2 * i + 1) + ')', function() {
          var arr = asArray(Pair(t[0], t[1]));

          expect(Array.isArray(arr)).to.be.true;
          expect(arr.length).to.equal(2);
          expect(arr[0] === t[0]).to.be.true;
          expect(arr[1] === t[1]).to.be.true;
        });


        it('Works correctly (' + (2 * i + 2) + ')', function() {
          var arr = asArray(Pair(t[1], t[0]));

          expect(Array.isArray(arr)).to.be.true;
          expect(arr.length).to.equal(2);
          expect(arr[0] === t[1]).to.be.true;
          expect(arr[1] === t[0]).to.be.true;
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
