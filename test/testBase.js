(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;


    describe('Base exports', function() {
      var expectedFunctions = ['curry', 'curryWithArity', 'compose', 'id',
                               'constant', 'constant0'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('base.js exports \'' + f + '\' property', exportsProperty(base, f));
        it('\'' + f + '\' property of base.js is a function', exportsFunction(base, f));
      });
    });


    describe('curry', function() {
      var curry = base.curry;

      // We shall test curry with binary, ternary, and quarternary functions
      var testFuncs = [
        {f: function(a, b) {return a + b;}, args: [2, 3], message: 'Curried binary function'},
        {f: function(a, b, c) {return a * b * c;}, args: [4, 5, 6], message: 'Curried ternary function'},
        {f: function(a, b, c, d) {return a - b - c - d}, args: [10, 9, 8, 7], message: 'Curried quarternary function'}
      ];

      testFuncs.forEach(function(testData) {
        var fn = testData.f;
        var args = testData.args;
        var message = testData.message;

        var curried = curry(fn);
        testCurriedFunction(curried, args, fn, args, message);
      });


      it('Underlying function called with anticipated arguments when curried function called with superfluous arguments', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curry(f);
        var args = [1, 2, 4, 'a'];
        curried(args[0], args[1], args[2], args[3]);
        expect(f.args).to.deep.equal(args.slice(0, f.length));
      });
    });


    describe('curryWithArity', function() {
      var curryWithArity = base.curryWithArity;
      var fromCharCodes = String.fromCharCode;

      it('curryWithArity returns a function of length 1 when a function of length 0 is curried to a length > 0', function() {
        var f = function() {};
        var curried = curryWithArity(1, f);
        expect(curried.length).to.equal(1);
      });


      it('curryWithArity returns a function of length 0 when a function of length > 0 is curried to length 0', function() {
        var f = function(a, b, c) {};
        var curried = curryWithArity(0, f);
        expect(curried.length).to.equal(0);
      });


      // One of the motivating ideas of curryWithArity relates to methods of standard objects
      // that have a given length, but accept fewer or more arguments.
      // For example, Array.reduce has a standard mandated length of 1, but is normally
      // called with 2 parameters.
      //
      // We use String.fromCharCode in our tests. String.fromCharCode accepts any number of parameters
      // and shouldn't depend on this === String
      it('Sanity check: String.fromCharCode has length 1', function() {
        expect(String.fromCharCode.length).to.equal(1);
      });


      it('Sanity check: String.fromCharCode can be called without an execution context', function() {
        var code = 65;
        var fn = function() {
          return fromCharCodes(code);
        };
        expect(fn).to.not.throw(Error);
        expect(fn()).to.equal(String.fromCharCode(code));
      });


      // We shall test curryWithArity with binary, and ternary versions
      var testFuncs = [
        {f: fromCharCodes, args: [65, 66], message: 'Arbitrary length function curried as a binary function'},
        {f: fromCharCodes, args: [65, 66, 67], message: 'Arbitrary length function curried as a ternary function'}
      ];

      testFuncs.forEach(function(testData) {
        var fn = testData.f;
        var args = testData.args;
        var message = testData.message;

        var curried = curryWithArity(args.length, fn);
        testCurriedFunction(curried, args, fn, args, message);
      });


      // curryWithArity should itself be curried
      // We use an IIFE here to avoid an 'it' wrapped in an 'it'
      (function() {
        var fn = function(a, b) {return a + b;};
        var args = {firstArgs: [fn.length, fn], thenArgs: [41, 1]};
        var message = 'curryWithArity';
        testCurriedFunction(curryWithArity, [fn.length, fn], curryWithArity, args, message);
      }());


      it('Underlying function called with anticipated arguments when curried function called with superfluous arguments', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curryWithArity(2, f);
        var args = [1, 2, 4, 'a'];
        curried(args[0], args[1], args[2], args[3]);
        expect(f.args).to.deep.equal(args.slice(0, f.length));
      });


      it('Underlying function can be curried with more arguments than underlying function length', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curryWithArity(5, f);
        var args = [1, 2, 4, 'a', null];
        curried(args[0])(args[1])(args[2])(args[3])(args[4]);
        expect(f.args).to.deep.equal(args);
      });
    });


    describe('compose', function() {
      var compose = base.compose;

      it('compose composes two functions correctly (1)', function() {
        var f = function(x) {return x + 2;};
        var g = function(x) {return x + 1;};
        var composition = compose(f, g);
        expect(composition(1)).to.equal(f(g(1)));
      });


      it('compose composes two functions correctly (2)', function() {
        var f = function(x) {return x + 3;};
        var g = function(x) {return x + 2;};
        var composition = compose(f, g);
        expect(composition(1)).to.equal(f(g(1)));
      });


      it('compose calls the second function first', function() {
        var f = function(x) {return x * 2;};
        var g = function(x) {return x + 1;};
        var composition = compose(f, g);
        expect(composition(1)).to.not.equal(g(f(1)));
        expect(composition(1)).to.equal(f(g(1)));
      });


      it('composition works if the second function has arity 0', function() {
        var f = function(x) {return x + 1;};
        var g = function() {return 3;};
        var composition = compose(f, g);
        expect(composition.length).to.equal(0);
        expect(composition()).to.equal(f(g()));
      });


      it('composition works if the first function has arity 0', function() {
        var f = function() {return 3;};
        var g = function(x) {return x + 1;};
        var composition = compose(f, g);
        expect(composition.length).to.equal(1);
        expect(composition(1)).to.equal(f(g(1)));
      });


      it('composition works if the both functions have arity 0', function() {
        var f = function() {return 3;};
        var g = function() {return 4;};
        var composition = compose(f, g);
        expect(composition.length).to.equal(0);
        expect(composition()).to.equal(f(g()));
      });


      it('composition throws if second function has arity > 1', function() {
        var f = function(x) {return x + 1;};
        var g = function(a, b) {return a + b;};

        var fn = function() {
          var composition = compose(f, g);
        };

        expect(fn).to.throw(TypeError);
      });


      it('composition throws if first function has arity > 1', function() {
        var f = function(a, b) {return a + b;};
        var g = function(x) {return x + 1;};

        var fn = function() {
          var composition = compose(f, g);
        };

        expect(fn).to.throw(TypeError);
      });


      it('composition throws if both functions have arity > 1', function() {
        var f = function(a, b) {return a * b;};
        var g = function(c, d) {return c + d;};

        var fn = function() {
          var composition = compose(f, g);
        };

        expect(fn).to.throw(TypeError);
      });


      // Compose is binary, and should of course be curried
      // We use an IIFE here to avoid an 'it' wrapped in an 'it'
      (function() {
        var fn = function(a) {return a + 1;};
        var args = {firstArgs: [fn, fn], thenArgs: [1]};
        var message = 'compose';
        testCurriedFunction(compose, [fn, fn], compose, args, message);
      }());


      // Also, lets test the composed functions too
      (function() {
        var fn = function(a) {return a + 3;};
        var fn2 = function(a) {return a * 4;};
        var composed = compose(fn, fn2);
        var args = [1];
        var message = 'Composed function';
        testCurriedFunction(composed, args, composed, args, message);
      }());
    });


    describe('id', function() {
      var id = base.id;

      it('id has arity 1', function() {
        expect(id.length).to.equal(1);
      });


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

        it('id works correctly for value of type ' + name, function() {
          expect(id(value)).to.equal(value);
        });

        it('id ignores superfluous arguments for value of type ' + name, function() {
          expect(id(value, 'x')).to.equal(value);
        });
      });
    });


    describe('constant', function() {
      var constant = base.constant;

      it('constant has arity 1', function() {
        expect(constant.length).to.equal(1);
      });


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

      it('constant returns a function of arity 1', function() {
        tests.forEach(function(test) {
          expect(constant(test.value).length).to.equal(1);
        });
      });


      tests.forEach(function(test) {
        var name = test.name;
        var value = test.value;

        it('constant works correctly for value of type ' + name, function() {
          var fn = constant(value);

          tests.forEach(function(test) {
            expect(fn(test.value)).to.equal(value);
          });
        });

        it('constant ignores superfluous arguments for value of type ' + name, function() {
          var fn = constant(value);
          expect(fn(value, 'x')).to.equal(value);
        });

        it('constant returns value immediately when called with two arguments, with first of type ' + name, function() {
          expect(constant(value, 'x')).to.equal(value);
        });
      });
    });


    describe('constant0', function() {
      var constant0 = base.constant0;

      it('constant0 has arity 1', function() {
        expect(constant0.length).to.equal(1);
      });


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

      it('constant0 returns a function of arity 0', function() {
        tests.forEach(function(test) {
          expect(constant0(test.value).length).to.equal(0);
        });
      });


      tests.forEach(function(test) {
        var name = test.name;
        var value = test.value;

        it('constant0 works correctly for value of type ' + name, function() {
          var fn = constant0(value);

          tests.forEach(function(test) {
            expect(fn()).to.equal(value);
          });
        });

        it('constant0 ignores superfluous arguments for value of type ' + name, function() {
          var fn = constant0(value);
          expect(fn('x')).to.equal(value);
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
