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
                               'constant', 'constant0', 'composeMany', 'flip',
                               'applyFunc', 'sectionLeft', 'sectionRight', 'equals',
                               'strictEquals', 'getRealArity', 'notEqual'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('base.js exports \'' + f + '\' property', exportsProperty(base, f));
        it('\'' + f + '\' property of base.js is a function', exportsFunction(base, f));
      });
    });


    // Many of the tests use curry and id: let's pull them out for convenience
    var curry = base.curry;
    var id = base.id;


    describe('curry', function() {
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
        testCurriedFunction(message, curried, args, fn);
      });


      it('Underlying function called with anticipated arguments when curried function called with superfluous arguments', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curry(f);
        var args = [1, 2, 4, 'a'];
        // Lack of assignment here is deliberate: we are interested in the side effect
        curried(args[0], args[1], args[2], args[3]);

        expect(f.args).to.deep.equal(args.slice(0, f.length));
      });


      it('Currying a function of length 0 returns a function of length 0', function() {
        var f = function() {};
        var curried = curry(f);

        expect(curried.length).to.equal(0);
      });


      it('Currying a function of length 1 returns a function of length 1', function() {
        var f = function(x) {};
        var curried = curry(f);

        expect(curried.length).to.equal(1);
      });


      it('Previously curried function not recurried', function() {
        var f = curry(function(a, b) {});

        expect(curry(f)).to.equal(f);
      });
    });


    describe('curryWithArity', function() {
      var curryWithArity = base.curryWithArity;
      var fromCharCodes = String.fromCharCode;


      it('Currying a function of length 0 to 0 returns a function of length 0', function() {
        var f = function() {};
        var curried = curryWithArity(0, f);

        expect(curried.length).to.equal(0);
      });


      it('Currying a function of length 1 to 1 returns a function of length 1', function() {
        var f = function(x) {};
        var curried = curryWithArity(1, f);

        expect(curried.length).to.equal(1);
      });


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

        testCurriedFunction(message, curried, args, fn);
      });


      // curryWithArity should itself be curried
      // We use an IIFE here to avoid an 'it' wrapped in an 'it'
      (function() {
        var fn = function(a, b) {return a + b;};
        var args = {firstArgs: [fn.length, fn], thenArgs: [41, 1]};
        var message = 'curryWithArity';

        testCurriedFunction(message, curryWithArity, args);
      }());


      it('Underlying function called with anticipated arguments when curried function called with superfluous arguments', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curryWithArity(2, f);
        var args = [1, 2, 4, 'a'];
        // Lack of assignment here is deliberate: we are interested in the side effect
        curried(args[0], args[1], args[2], args[3]);

        expect(f.args).to.deep.equal(args.slice(0, f.length));
      });


      it('Underlying function can be curried with more arguments than underlying function length', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curryWithArity(5, f);
        var args = [1, 2, 4, 'a', null];
        // Lack of assignment here is deliberate: we are interested in the side effect
        curried(args[0])(args[1])(args[2])(args[3])(args[4]);

        expect(f.args).to.deep.equal(args);
      });


      it('Previously curried function not recurried (1)', function() {
        var f = curryWithArity(2, function(a, b) {});

        expect(curryWithArity(2, f)).to.equal(f);
      });


      it('Previously curried function not recurried (2)', function() {
        var f = curryWithArity(1, function(a, b) {});

        expect(curryWithArity(1, f)).to.equal(f);
      });
    });


    describe('compose', function() {
      var compose = base.compose;


      it('composition throws if the first function has arity 0', function() {
        var f = function() {return 3;};
        var g = function(x) {return x + 1;};

        var fn = function() {
          var composition = compose(f, g);
        };

        expect(fn).to.throw(TypeError);
      });


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


      it('Returned function has correct arity if the second function has arity 0 (1)', function() {
        var f = function(x) {return x + 1;};
        var g = function() {return 3;};
        var composition = compose(f, g);

        expect(composition.length).to.equal(0);
      });


      it('Returned function has correct arity if the second function has arity 0 (2)', function() {
        var f = function(x, y) {return x + y + 1;};
        var g = function() {return 3;};
        var composition = compose(f, g);

        expect(composition.length).to.equal(1);
      });


      it('composition works if the second function has arity 0 (1)', function() {
        var f = function(x) {return x + 1;};
        var g = function() {return 3;};
        var composition = compose(f, g);

        expect(composition()).to.equal(f(g()));
      });


      it('composition works if the second function has arity 0 (2)', function() {
        var f = function(x, y) {return x + y + 1;};
        var g = function() {return 3;};
        var composition = compose(f, g);

        expect(composition.length).to.equal(1);
        expect(composition(1)).to.equal(f(g(), 1));
      });


      it('composition curries first function if it has arity > 1', function() {
        var f = function(a, b) {return a + b;};
        var g = function(x) {return x + 1;};
        var composition = compose(f, g);

        expect(composition(1)).to.be.a('function');
        expect(composition(1).length).to.equal(1);
      });


      it('composition partially applies first function correctly if it has arity > 1 (1)', function() {
        var f = function(a, b) {return a + b;};
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1)(1)).to.equal(expected);
      });


      it('composition partially applies first function correctly if it has arity > 1 (2)', function() {
        var f = curry(function(a, b) {return a + b;});
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1)(1)).to.equal(expected);
      });


      it('composition applies first function when all arguments supplied and first function has arity > 1 (1)', function() {
        var f = function(a, b) {return a + b;};
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1, 1)).to.equal(expected);
      });


      it('composition applies first function when all arguments supplied and first function has arity > 1 (2)', function() {
        var f = curry(function(a, b) {return a + b;});
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1, 1)).to.equal(expected);
      });


      it('composition curries second function if it has arity > 1', function() {
        var id = function(x) {return x;};
        var g = function(x, y) {return x + 1;};
        var composition = compose(id, g);

        expect(composition(1)).to.be.a('function');
        expect(composition(1).length).to.equal(1);
      });


      it('composition partially applies second function correctly if it has arity > 1', function() {
        var id = function(x) {return x;};
        var g = function(x, y) {return x + 1;};
        var composition = compose(id, g);

        expect(composition(1)(2)).to.equal(g(1, 2));
      });


      it('When both functions have arity > 1 and multiple arguments given to composition, only first argument passed to second function', function() {
        var f = function(x, y, z) {return [].slice.call(arguments, 1);};
        var g = function(x, y) {return x + 1;};
        var composition = compose(f, g);

        expect(composition(1, 2, 3)).to.deep.equal([2, 3]);
        expect(composition(3, 10, 17)).to.deep.equal([10, 17]);
      });


      // Compose is binary, and should of course be curried
      // We use an IIFE here to avoid an 'it' wrapped in an 'it'
      (function() {
        var fn = function(a) {return a + 1;};
        var args = {firstArgs: [fn, fn], thenArgs: [1]};
        var message = 'compose';

        testCurriedFunction(message, compose, args);
      }());


      // Also, lets test the composed functions too
      (function() {
        var fn = function(a) {return a + 3;};
        var fn2 = function(a) {return a * 4;};
        var composed = compose(fn, fn2);
        var args = [1];
        var message = 'Composed function';

        testCurriedFunction(message, composed, args);
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
          tests.forEach(function(test) {
            expect(constant(value, test.value)).to.equal(value);
          });
        });

        it('constant ignores superfluous arguments for value of type ' + name, function() {
          var fn = constant(value);
          expect(fn(value, 'x')).to.equal(value);
        });

        it('constant returns value immediately when called with two arguments, with first of type ' + name, function() {
          expect(constant(value, 'x')).to.equal(value);
        });

        tests.forEach(function(test) {
          testCurriedFunction('constant of type ' + name + ' called with type ' + test.name, constant,
                              [value, test.value]);
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


    describe('composeMany', function() {
      var composeMany = base.composeMany;


      it('composeMany throws if called with empty array', function() {
          var fn = function() {
            var composition = composeMany([]);
          };

          expect(fn).to.throw(TypeError);
      });


      var makeZeroArityTest = function(i) {
        return function() {
          var args = [id, id, id, id];
          args[i] = function() {return 3;};

          var fn = function() {
            var composition = composeMany(args);
          };

          expect(fn).to.throw(TypeError);
        };
      };


      for (var i = 0; i < 3; i++)
        it('composeMany throws if function other than last has zero arity ' + (i + 1),
           makeZeroArityTest(i));


      it('composeMany returns curried original function if supplied one function of arity 0', function() {
        var f = function() {return [].slice.call(arguments);};
        var g = composeMany([f]);

        expect(g.length).to.equal(0);
        expect(g()).to.deep.equal(f());
        expect(g(42)).to.deep.equal([]);
      });


      it('composeMany returns original function if supplied curried function of arity 0', function() {
        var f = curry(function() {return [].slice.call(arguments);});
        var g = composeMany([f]);

        expect(g).to.equal(f);
      });


      it('composeMany returns curried original function if supplied one function of arity 1', function() {
        var f = function(x) {return [].slice.call(arguments);};
        var g = composeMany([f]);

        expect(g.length).to.equal(1);
        expect(g(42)).to.deep.equal(f(42));
        expect(g(42, 'x')).to.deep.equal([42]);
      });


      it('composeMany returns original function if supplied curried function of arity 1', function() {
        var f = curry(function(x) {return [].slice.call(arguments);});
        var g = composeMany([f]);

        expect(g).to.equal(f);
      });


      it('composeMany returns curried original function if supplied one function of arity > 1', function() {
        var f = function(x, y) {return x + y;};
        var g = composeMany([f]);

        expect(g.length).to.equal(1);
        expect(g(1).length).to.equal(1);
        expect(g(1)(2)).to.equal(f(1, 2));
        expect(g(1, 2)).to.equal(f(1, 2));
      });


      it('composeMany acts like compose when called with two functions (1)', function() {
        var compose = base.compose;
        var f = function(x) {return x + 1;};
        var g = function(x) {return x * 2;};
        var composeM = composeMany([f, g]);
        var composed = compose(f, g);

        expect(composeM.length).to.equal(composed.length);
        expect(composeM(1)).to.equal(composed(1));
      });


      it('composeMany acts like compose when called with two functions (2)', function() {
        var compose = base.compose;
        var f = function(x, y) {return x + y + 1;};
        var g = function(x) {return x * 2;};
        var composeM = composeMany([f, g]);
        var composed = compose(f, g);

        expect(composeM.length).to.equal(composed.length);
        expect(composeM(1).length).to.equal(composed(1).length);
        expect(composeM(1)(2)).to.equal(composed(1)(2));
        expect(composeM(1, 2)).to.equal(composed(1, 2));
      });


      it('composeMany works correctly (1)', function() {
        var composed = composeMany([id, id, id]);

        expect(composed.length).to.equal(1);
        expect(composed(1)).to.equal(id(id(id(1))));
      });


      it('composeMany works correctly (2)', function() {
        var args = [
          function(x) {return x + 3},
          function(x) {return x + 2},
          function(x) {return x + 1}
        ];
        var composed = composeMany(args);

        expect(composed.length).to.equal(1);
        expect(composed(1)).to.equal(args[0](args[1](args[2](1))));
      });


      it('composeMany composes in right direction (1)', function() {
        var args = [
          function(x) {return x + 'three';},
          function(x) {return x + 'two';},
          function() {return 'one';}
        ];
        var composed = composeMany(args);

        expect(composed()).to.equal('onetwothree');
      });


      it('composeMany composes in right direction (2)', function() {
        var args = [
          function(x) {return x.concat([3]);},
          function(x) {return x.concat([2]);},
          function(x) {return [x].concat([1]);}
        ];
        var composed = composeMany(args);

        expect(composed(0)).to.deep.equal([0, 1, 2, 3]);
      });


      it('composeMany returns function with correct arity (1)', function() {
        var args = [
          function(x) {return x + 1;},
          id,
          function() {return 3;}
        ];
        var composed = composeMany(args);

        expect(composed.length).to.equal(0);
      });


      it('composeMany returns function with correct arity (2)', function() {
        var args = [
          function(x, y, z) {return x + 1;},
          id,
          function() {return 3;}
        ];
        var composed = composeMany(args);

        expect(composed.length).to.equal(1);
        expect(composed(1).length).to.equal(1);
      });


      it('Only one argument fed to first composed function: remaining fed to last (1)', function() {
        var args = [
          function(x, y, z) {return [].slice.call(arguments, 1);},
          id,
          function(x) {return x;}
        ];
        var composed = composeMany(args);

        expect(composed(1, 2, 3)).to.deep.equal([2, 3]);
      });


      it('Only one argument fed to first composed function: remaining fed to last (2)', function() {
        var args = [
          id,
          function(x, y, z) {return [].slice.call(arguments);},
          id
        ];

        var composed = composeMany(args);
        var result = composed(1, 2, 3);

        expect(result).to.be.a('function');
        expect(result(2)).to.be.a('function');
        expect(result(2)(3)).to.deep.equal([1, 2, 3]);
      });
    });


    describe('flip', function() {
      var flip = base.flip;


      it('flip has arity 1', function() {
        expect(flip.length).to.equal(1);
      });


      it('Returns a curried version of original function when called with function of length 0', function() {
        var f = function() {return [].slice.call(arguments);};
        var flipped = flip(f);

        expect(flipped.length).to.equal(0);
        expect(flipped()).to.deep.equal([]);
        expect(flipped(42)).to.deep.equal([]);
      });


      it('Returns original function when called with curried function of length 0', function() {
        var f = curry(function() {return [].slice.call(arguments);});
        var flipped = flip(f);

        expect(flipped).to.equal(f);
      });


      it('Returns a curried version of original function when called with function of length 1', function() {
        var f = function(x) {return [].slice.call(arguments);};
        var flipped = flip(f);

        expect(flipped.length).to.equal(1);
        expect(flipped(42)).to.deep.equal(f(42));
        expect(flipped(42, 'x')).to.deep.equal([42]);
      });


      it('Returns original function when called with curried function of length 1', function() {
        var f = curry(function(x) {return [].slice.call(arguments);});
        var flipped = flip(f);

        expect(flipped).to.equal(f);
      });


      it('Throws if called with a function of arity > 2 (1)', function() {
        var f = function(x, y, z) {return [].slice.call(arguments);};
        var fn = function() {
          var flipped = flip(f);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if called with a function of arity > 2 (2)', function() {
        var f = curry(function(x, y, z) {return [].slice.call(arguments);});
        var fn = function() {
          var flipped = flip(f);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Returns a curried function (1)', function() {
        var f = function(x, y) {};
        var flipped = flip(f);

        expect(flipped.length).to.equal(1);
        expect(flipped(1).length).to.equal(1);
      });


      it('Returns a curried function (2)', function() {
        var f = curry(function(x, y) {});
        var flipped = flip(f);

        expect(flipped.length).to.equal(1);
        expect(flipped(1).length).to.equal(1);
      });


      it('flip works correctly (1)', function() {
        var f = function(x, y) {return [].slice.call(arguments);};
        var flipped = flip(f);

        expect(flipped(1, 2)).to.deep.equal(f(2, 1));
        expect(flipped('a', 'b')).to.deep.equal(f('b', 'a'));
      });


      it('flip works correctly (2)', function() {
        var f = curry(function(x, y) {return [].slice.call(arguments);});
        var flipped = flip(f);

        expect(flipped(1)(2)).to.deep.equal(f(2)(1));
        expect(flipped('a')('b')).to.deep.equal(f('b')('a'));
      });
    });


    describe('applyFunc', function() {
      var applyFunc = base.applyFunc;


      it('Calls f with x (1)', function() {
        var f = function(x) {f.args = [].slice.call(arguments);};
        f.args = null;
        // Lack of assignment here is deliberate: we are interested in the side effect
        var val = 42;
        applyFunc(f, val);

        expect(f.args).to.deep.equal([val]);
      });


      it('Calls f with x (2)', function() {
        var f = function(x) {f.args = [].slice.call(arguments);};
        f.args = null;
        // Lack of assignment here is deliberate: we are interested in the side effect
        var val = 'mozilla';
        applyFunc(f, val);

        expect(f.args).to.deep.equal([val]);
      });


      it('Returns f(x) (1)', function() {
        var val = 42;
        var result = applyFunc(id, val);

        expect(result).to.equal(id(val));
      });


      it('Returns f(x) (2)', function() {
        var val = 42;
        var f = function(x) {return x + 1;};
        var result = applyFunc(f, val);

        expect(result).to.equal(f(val));
      });


      it('Returns f(x) (3)', function() {
        var val = 42;
        var f = curry(function(x, y) {return x + y;});
        var result = applyFunc(f, val);

        expect(result).to.be.a('function');
        expect(result.length).to.equal(1);
        expect(result(10)).to.equal(f(val, 10));
      });


      it('Curries f if necessary', function() {
        var val = 42;
        var f = function(x, y) {return x + y;};
        var result = applyFunc(f, val);

        expect(result).to.be.a('function');
        expect(result.length).to.equal(1);
        expect(result(10)).to.equal(f(val, 10));
      });


      // applyFunc should be curried
      (function() {
        testCurriedFunction('applyFunc', applyFunc, [id, 42]);
      })();
    });


    describe('sectionLeft', function() {
      var sectionLeft = base.sectionLeft;
      var applyFunc = base.applyFunc;


      it('sectionLeft is a synonym for applyFunc', function() {
        expect(sectionLeft).to.equal(applyFunc);
      });
    });


    describe('sectionRight', function() {
      var sectionRight = base.sectionRight;


      it('Throws if f is not binary (1)', function() {
        var fn = function() {
          sectionRight(id, 1);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if f is not binary (2)', function() {
        var fn = function() {
          sectionRight(function() {}, 1);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if f is not binary (3)', function() {
        var fn = function() {
          sectionRight(function(x, y, z) {}, 1);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if f is not binary (4)', function() {
        var fn = function() {
          sectionRight(curry(function(x, y, z) {}), 1);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Partially applies to the right (1)', function() {
        var f = curry(function(a, b) {return [].slice.call(arguments);});
        var val1 = 32;
        var val2 = 10;
        var sectioned = sectionRight(f, val1);

        expect(sectioned).to.be.a('function');
        expect(sectioned.length).to.equal(1);
        expect(sectioned(val2)).to.deep.equal([val2, val1]);
      });


      it('Partially applies to the right (2)', function() {
        var f = curry(function(a, b) {return a - b;});
        var val1 = 10;
        var val2 = 52;
        var sectioned = sectionRight(f, val1);

        expect(sectioned).to.be.a('function');
        expect(sectioned.length).to.equal(1);
        expect(sectioned(val2)).to.deep.equal(f(val2, val1));
      });


      it('Curries f if necessary', function() {
        var f = function(a, b) {return [].slice.call(arguments);};
        var val1 = 32;
        var val2 = 10;
        var sectioned = sectionRight(f, val1);

        expect(sectioned).to.be.a('function');
        expect(sectioned.length).to.equal(1);
        expect(sectioned(val2)).to.deep.equal([val2, val1]);
      });


      // sectionRight should be curried
      (function() {
        var fn = function(x, y) {return x + y;};
        testCurriedFunction('sectionRight', sectionRight, {firstArgs: [fn, 42], thenArgs: [10]});
      })();
    });


    // The following array is used for generating tests for both equality and strictEquality
    // They are not an exhaustive check of all possible type coercions.
    var equalityTests = [
      {value: 1, coercible: ['1', true, {valueOf: function() {return 1;}}],
                 notEqual: [0, NaN, false, undefined, null, function() {}, '2', {valueOf: function() {return 2;}}]},
      {value: '1', coercible: [true, {toString: function() {return '1';}}],
                 notEqual: [0, NaN, '0', undefined, null, function() {}, 'false', {toString: function() {return '0'}}]},
      {value: false, coercible: [0, '0', {valueOf: function() {return 0;}}],
                 notEqual: [NaN, true, undefined, null, function() {}, 'false', {valueOf: function() {return 1;}}]},
      {value: undefined, coercible: [null],
                 notEqual: [NaN, 'undefined', true, function() {}, 'false', {valueOf: function() {return 1;}}]},
      {value: null, coercible: [], // we've already tried permissible coercions in earlier tests
                 notEqual: [NaN, true, function() {}, 'false', {valueOf: function() {return 1;}}]},
      {value: {}, coercible: [], // we've already tried permissible coercions in earlier tests
                 notEqual: [NaN, true, function() {}, 'false', {}]}];


    var makeEqualityTest = function(equalityFn, expectedResult, val1, val2) {
      return function() {
        expect(equalityFn(val1, val2)).to.equal(expectedResult);
      };
    };


    describe('equals', function() {
      var equals = base.equals;


      equalityTests.forEach(function(test) {
        var val = test.value;
        var type = val !== null ? typeof(val) : 'null';

        it('equals is correct for value of type ' + type + ' when testing value with itself',
           makeEqualityTest(equals, true, val, val));

        var coercible = test.coercible;
        coercible.forEach(function(cVal) {
          var cType = cVal !== null ? typeof(cVal) : 'null';
          it('equals is correct for value of type ' + type + ' when testing value with coercible value of type ' + cType,
             makeEqualityTest(equals, true, val, cVal));
        });

        var notEqual = test.notEqual;
        notEqual.forEach(function(nVal) {
          var nType = nVal !== null ? typeof(nVal) : 'null';
          it('equals is correct for value of type ' + type + ' when testing value with unequal value of type ' + nType,
             makeEqualityTest(equals, false, val, nVal));
        });

        // equals should be curried
        testCurriedFunction('equals', equals, [val, val]);
      });
    });


    describe('strictEquals', function() {
      var strictEquals = base.strictEquals;


      equalityTests.forEach(function(test) {
        var val = test.value;
        var type = val !== null ? typeof(val) : 'null';

        it('strictEquals is correct for value of type ' + type + ' when testing value with itself',
           makeEqualityTest(strictEquals, true, val, val));

        var coercible = test.coercible;
        coercible.forEach(function(cVal) {
          var cType = cVal !== null ? typeof(cVal) : 'null';
          it('strictEquals is correct for value of type ' + type + ' when testing value with coercible value of type ' + cType,
             makeEqualityTest(strictEquals, false, val, cVal));
        });

        var notEqual = test.notEqual;
        notEqual.forEach(function(nVal) {
          var nType = nVal !== null ? typeof(nVal) : 'null';
          it('strictEquals is correct for value of type ' + type + ' when testing value with unequal value of type ' + nType,
             makeEqualityTest(strictEquals, false, val, nVal));
        });

        // strictEquals should be curried
        testCurriedFunction('strictEquals', strictEquals, [val, val]);
      });
    });


    describe('notEqual', function() {
      var notEqual = base.notEqual;


      equalityTests.forEach(function(test) {
        var val = test.value;
        var type = val !== null ? typeof(val) : 'null';

        it('notEqual is correct for value of type ' + type + ' when testing value with itself',
           makeEqualityTest(notEqual, false, val, val));

        var coercible = test.coercible;
        coercible.forEach(function(cVal) {
          var cType = cVal !== null ? typeof(cVal) : 'null';
          it('notEqual is correct for value of type ' + type + ' when testing value with coercible value of type ' + cType,
             makeEqualityTest(notEqual, false, val, cVal));
        });

        var notEquals = test.notEqual;
        notEquals.forEach(function(nVal) {
          var nType = nVal !== null ? typeof(nVal) : 'null';
          it('notEqual is correct for value of type ' + type + ' when testing value with unequal value of type ' + nType,
             makeEqualityTest(notEqual, true, val, nVal));
        });

        // notEqual should be curried
        testCurriedFunction('notEqual', notEqual, [val, val]);
      });
    });


    describe('getRealArity', function() {
      var getRealArity = base.getRealArity;
      var curryWithArity = base.curryWithArity;


      it('getRealArity works correctly for an uncurried function (1)', function() {
        var fn = function() {};

        expect(getRealArity(fn)).to.equal(fn.length);
      });


      it('getRealArity works correctly for an uncurried function (2)', function() {
        var fn = function(x, y) {};

        expect(getRealArity(fn)).to.equal(fn.length);
      });


      it('getRealArity works correctly for a curried function (1)', function() {
        var fn = function(x, y) {};
        var curried = curry(fn);

        expect(getRealArity(curried)).to.equal(fn.length);
      });


      it('getRealArity works correctly for a curried function (2)', function() {
        var fn = function(x, y) {};
        var curryTo = 0;
        var curried = curryWithArity(curryTo, fn);

        expect(getRealArity(curried)).to.equal(curryTo);
      });


      it('getRealArity reports arguments outstanding for partially applied function (1)', function() {
        var fn = function(x, y, z) {};
        var curried = curry(fn);

        expect(getRealArity(curried(1))).to.equal(fn.length - 1);
      });


      it('getRealArity reports arguments outstanding for partially applied function (2)', function() {
        var fn = function(x, y, z) {};
        var curried = curry(fn);

        expect(getRealArity(curried(1)(1))).to.equal(fn.length - 2);
      });


      it('getRealArity reports arguments outstanding for partially applied function (3)', function() {
        var fn = function(x, y, z) {};
        var curried = curry(fn);

        expect(getRealArity(curried(1, 1))).to.equal(fn.length - 2);
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
