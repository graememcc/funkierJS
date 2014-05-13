(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var combinators = require('../combinators');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;


    var expectedObjects = ['combinators'];
    var expectedFunctions = [];
    describeModule('combinators', combinators, expectedObjects, expectedFunctions);


    describe('Combinators.combinators properties', function() {
      var combinatorsObj = combinators.combinators;
      var expectedFunctions = ['I', 'K', 'Ky', 'S'];

      expectedFunctions.forEach(function(f) {
        it('combinators.js exports \'' + f + '\' property', exportsProperty(combinatorsObj, f));
        it('\'' + f + '\' property of combinators.js is a function', exportsFunction(combinatorsObj, f));
      });
    });


    describe('I', function() {
      it('Is a synonym for base.id', function() {
        expect(combinators.combinators.I).to.equal(base.id);
      });
    });


    describe('K', function() {
      it('Is a synonym for base.constant', function() {
        expect(combinators.combinators.K).to.equal(base.constant);
      });
    });


    var KySpec = {
      name: 'Ky',
      arity: 2,
    };


    describeFunction(KySpec, combinators.combinators.Ky, function(Ky) {
      var tests = [
        {name: 'null', value: null},
        {name: 'undefined', value: undefined},
        {name: 'number', value: 42},
        {name: 'string', value: 'functional'},
        {name: 'boolean', value: 'true'},
        {name: 'array', value: [1, 2, 3]},
        {name: 'object', value: {foo: 1, bar: 'a'}},
        {name: 'function', value: function(a, b) {}}
      ];


      tests.forEach(function(test) {
        var name = test.name;
        var value = test.value;

        tests.forEach(function(t2) {
          it('Works correctly for value of type ' + name + ' and ' + t2.name, function() {
            expect(Ky(value, t2.value)).to.equal(t2.value);
          });


          testCurriedFunction('Ky of type ' + name + ' and ' + t2.name, Ky, [value, t2.value]);
        });
      });
    });


    var SSpec = {
      name: 'S',
      arity: 3,
      restrictions: [['function'], ['function'], []],
      validArguments: [[function(x) {return base.id;}], [base.id], [2]]
    };

    describeFunction(SSpec, combinators.combinators.S, function(S) {
      var nonFunctions = [
        {name: 'null', value: null},
        {name: 'undefined', value: undefined},
        {name: 'number', value: 42},
        {name: 'string', value: 'functional'},
        {name: 'boolean', value: 'true'},
        {name: 'array', value: [1, 2, 3]},
        {name: 'object', value: {foo: 1, bar: 'a'}}
      ];


      nonFunctions.forEach(function(nonFn) {
        it('Throws if first argument not a function', function() {
          var fn = function() {
            S(nonFn.value, function() {}, 1);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws if second argument not a function', function() {
          var fn = function() {
            S(function() {}, nonFn.value, 1);
          };

          expect(fn).to.throw(TypeError);
        });
      });


      it('Calls first argument with third argument', function() {
        var f = function(x) {
          f.called = true;
          f.args = x;
          return function(x) {return x;};
        };
        f.called = false;
        f.args = null;
        S(f, function(x) {return x;}, 1);

        expect(f.called).to.be.true;
        expect(f.args).to.equal(1);
      });


      it('Calls second argument with third argument', function() {
        var f = function(x) {
          f.called = true;
          f.args = x;
          return function(x) {return x;};
        };
        f.called = false;
        f.args = null;
        S(function(x) {return base.id;}, f, 1);

        expect(f.called).to.be.true;
        expect(f.args).to.equal(1);
      });


      it('Throws if first function doesn\'t return a function', function() {
        var f = function(x) {return 3;};
        var fn = function() {
          S(f, f, 1);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Calls result of first function with result of second function', function() {
        var f = function(x) {
          f.called = true;
          f.args = x;
        };
        f.called = false;
        f.args = null;
        var g = function(x) {return f;};
        var h = function(x) {return x + 2;};
        S(g, h, 1);

        expect(f.called).to.be.true;
        expect(f.args).to.equal(h(1));
      });


      it('Returns result of calling first function with result of second function', function() {
        var f = function(x) {
          return x * 10;
        };
        f.called = false;
        f.args = null;
        var g = function(x) {return f;};
        var h = function(x) {return x + 2;};
        var result = S(g, h, 1);

        expect(result).to.equal(f(h(1)));
      });


      it('Curries functions if necessary (1)', function() {
        var f = function(x, y) {
          return x * y;
        };
        var g = function(x) {return x + 2;};
        var result = S(f, g, 2);

        expect(result).to.equal(f(2, g(2)));
      });


      it('Curries functions if necessary (2)', function() {
        var f = function(x, y) {
          return x + y;
        };
        var g = function(x) {return x * 3;};
        var result = S(f, g, 4);

        expect(result).to.equal(f(4, g(4)));
      });


      it('Curries functions if necessary (3)', function() {
        var f = function() {return base.id;};
        var g = function(x, y) {return x;};
        var result1 = S(f, g, 2);
        var result2 = result1(5);

        expect(result2).to.equal(2);
      });


      it('Curries functions if necessary (4)', function() {
        var f = function() {return base.id;};
        var g = function(x, y) {return y;};
        var result1 = S(f, g, 2);
        var result2 = result1(5);

        expect(result2).to.equal(5);
      });


      testCurriedFunction('S', S, [function(x, y) {return x + y;}, base.id, 4]);
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
