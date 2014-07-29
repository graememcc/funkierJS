(function() { "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var curryModule = require('../curry');
    var curry = curryModule.curry;
    var curryWithArity = curryModule.curryWithArity;
    var getRealArity = curryModule.getRealArity;

    var base = require('../base');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;


    var expectedObjects = [];
    var expectedFunctions = ['compose', 'id', 'constant', 'constant0', 'composeMany', 'flip', 'sectionLeft', 'sectionRight',
                             'equals', 'strictEquals', 'notEqual', 'strictNotEqual', 'is', 'isNumber', 'isString', 'isBoolean',
                             'isUndefined', 'isObject', 'isArray', 'isNull', 'isRealObject', 'getType', 'deepEqual'];
    describeModule('base', base, expectedObjects, expectedFunctions);


    // Many of the tests use id: let's pull it out
    var id = base.id;


    var composeSpec = {
      name: 'compose',
      arity: 2,
      restrictions: [['function: minarity 1'], ['function']],
      validArguments: [[function(x) {}], [function() {}]]
    };


    describeFunction(composeSpec, base.compose, function(compose) {
      it('Composes two functions correctly (1)', function() {
        var f = function(x) {return x + 2;};
        var g = function(x) {return x + 1;};
        var composition = compose(f, g);

        expect(composition(1)).to.equal(f(g(1)));
      });


      it('Composes two functions correctly (2)', function() {
        var f = function(x) {return x + 3;};
        var g = function(x) {return x + 2;};
        var composition = compose(f, g);

        expect(composition(1)).to.equal(f(g(1)));
      });


      it('Calls the second function first', function() {
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


      it('Works if the second function has arity 0 (1)', function() {
        var f = function(x) {return x + 1;};
        var g = function() {return 3;};
        var composition = compose(f, g);

        expect(composition()).to.equal(f(g()));
      });


      it('Works if the second function has arity 0 (2)', function() {
        var f = function(x, y) {return x + y + 1;};
        var g = function() {return 3;};
        var composition = compose(f, g);

        expect(getRealArity(composition)).to.equal(1);
        expect(composition(1)).to.equal(f(g(), 1));
      });


      it('Curries first function if it has arity > 1', function() {
        var f = function(a, b) {return a + b;};
        var g = function(x) {return x + 1;};
        var composition = compose(f, g);

        expect(composition(1)).to.be.a('function');
        expect(getRealArity(composition(1))).to.equal(1);
      });


      it('Partially applies first function correctly if it has arity > 1 (1)', function() {
        var f = function(a, b) {return a + b;};
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1)(1)).to.equal(expected);
      });


      it('Partially applies first function correctly if it has arity > 1 (2)', function() {
        var f = curry(function(a, b) {return a + b;});
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1)(1)).to.equal(expected);
      });


      it('Applies first function when all arguments supplied and first function has arity > 1 (1)', function() {
        var f = function(a, b) {return a + b;};
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1, 1)).to.equal(expected);
      });


      it('Applies first function when all arguments supplied and first function has arity > 1 (2)', function() {
        var f = curry(function(a, b) {return a + b;});
        var g = function(x) {return x + 1;};
        var expected = f(g(1), 1);
        var composition = compose(f, g);

        expect(composition(1, 1)).to.equal(expected);
      });


      it('Curries second function if it has arity > 1', function() {
        var id = function(x) {return x;};
        var g = function(x, y) {return x + 1;};
        var composition = compose(id, g);

        expect(composition(1)).to.be.a('function');
        expect(getRealArity(composition(1))).to.equal(1);
      });


      it('Partially applies second function correctly if it has arity > 1', function() {
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
      var fn = function(a) {return a + 1;};
      var args = {firstArgs: [fn, fn], thenArgs: [1]};
      testCurriedFunction('compose', compose, args);

      // Also, lets test the composed functions too
      var fn = function(a, b) {return a + b + 3;};
      var fn2 = function(a) {return a * 4;};
      testCurriedFunction('Composed function', compose(fn, fn2), [1, 2]);
    });


    var idSpec = {
      name: 'id',
      arity: 1
    };


    describeFunction(idSpec, base.id, function(id) {
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

        it('Works correctly for value of type ' + name, function() {
          expect(id(value)).to.equal(value);
        });

        it('Ignores superfluous arguments for value of type ' + name, function() {
          expect(id(value, 'x')).to.equal(value);
        });
      });
    });


    var constantSpec = {
      name: 'constant',
      arity: 2
    };


    describeFunction(constantSpec, base.constant, function(constant) {
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

        it('Works correctly for value of type ' + name, function() {
          tests.forEach(function(test) {
            expect(constant(value, test.value)).to.equal(value);
          });
        });

        it('Ignores superfluous arguments for value of type ' + name, function() {
          var fn = constant(value);
          expect(fn(value, 'x')).to.equal(value);
        });

        it('Returns value immediately when called with two arguments, with first of type ' + name, function() {
          expect(constant(value, 'x')).to.equal(value);
        });

        tests.forEach(function(test) {
          testCurriedFunction('constant of type ' + name + ' called with type ' + test.name, constant,
                              [value, test.value]);
        });
      });
    });


    var constant0Spec = {
      name: 'constant0',
      arity: 1
    };


    describeFunction(constant0Spec, base.constant0, function(constant0) {
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

      it('Returns a function of arity 0', function() {
        tests.forEach(function(test) {
          expect(getRealArity(constant0(test.value))).to.equal(0);
        });
      });


      tests.forEach(function(test) {
        var name = test.name;
        var value = test.value;

        it('Works correctly for value of type ' + name, function() {
          var fn = constant0(value);

          tests.forEach(function(test) {
            expect(fn()).to.equal(value);
          });
        });

        it('Ignores superfluous arguments for value of type ' + name, function() {
          var fn = constant0(value);
          expect(fn('x')).to.equal(value);
        });
      });
    });



    var composeManySpec = {
      name: 'composeMany',
      arity: 1,
      restrictions: [['strictarraylike']],
      validArguments: [[[function(a) {}, function() {}], testUtils.makeArrayLike(function(a) {}, function() {})]]
    };


    describeFunction(composeManySpec, base.composeMany, function(composeMany) {
      it('Throws if called with empty array', function() {
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
        it('Throws if function other than last has zero arity ' + (i + 1),
           makeZeroArityTest(i));


      it('Returns curried original function if supplied one function of arity 0', function() {
        var f = function() {return [].slice.call(arguments);};
        var g = composeMany([f]);

        expect(g.length).to.equal(0);
        expect(g()).to.deep.equal(f());
        expect(g(42)).to.deep.equal([]);
      });


      it('Returns original function if supplied curried function of arity 0', function() {
        var f = curry(function() {return [].slice.call(arguments);});
        var g = composeMany([f]);

        expect(g).to.equal(f);
      });


      it('Returns curried original function if supplied one function of arity 1', function() {
        var f = function(x) {return [].slice.call(arguments);};
        var g = composeMany([f]);

        expect(g.length).to.equal(1);
        expect(getRealArity(g)).to.equal(1);
        expect(g(42)).to.deep.equal(f(42));
        expect(g(42, 'x')).to.deep.equal([42]);
      });


      it('Returns original function if supplied curried function of arity 1', function() {
        var f = curry(function(x) {return [].slice.call(arguments);});
        var g = composeMany([f]);

        expect(g).to.equal(f);
      });


      it('Returns curried original function if supplied one function of arity > 1', function() {
        var f = function(x, y) {return x + y;};
        var g = composeMany([f]);

        expect(g.length).to.equal(1);
        expect(getRealArity(g)).to.equal(2);
        expect(g(1)(2)).to.equal(f(1, 2));
        expect(g(1, 2)).to.equal(f(1, 2));
      });


      it('Returns original function if supplied one curried function of real arity > 1', function() {
        var f = curry(function(x, y) {return x + y;});
        var g = composeMany([f]);

        expect(g).to.equal(f);
      });


      it('Acts like compose when called with two functions (1)', function() {
        var compose = base.compose;
        var f = function(x) {return x + 1;};
        var g = function(x) {return x * 2;};
        var composeM = composeMany([f, g]);
        var composed = compose(f, g);

        expect(composeM.length).to.equal(composed.length);
        expect(getRealArity(composeM)).to.equal(getRealArity(composed));
        expect(composeM(1)).to.equal(composed(1));
      });


      it('Acts like compose when called with two functions (2)', function() {
        var compose = base.compose;
        var f = function(x, y) {return x + y + 1;};
        var g = function(x) {return x * 2;};
        var composeM = composeMany([f, g]);
        var composed = compose(f, g);

        expect(composeM.length).to.equal(composed.length);
        expect(getRealArity(composeM)).to.equal(getRealArity(composed));
        expect(composeM(1)(2)).to.equal(composed(1)(2));
        expect(composeM(1, 2)).to.equal(composed(1, 2));
      });


      it('Works correctly (1)', function() {
        var composed = composeMany([id, id, id]);

        expect(composed.length).to.equal(1);
        expect(composed(1)).to.equal(id(id(id(1))));
      });


      it('Works correctly (2)', function() {
        var args = [
          function(x) {return x + 3},
          function(x) {return x + 2},
          function(x) {return x + 1}
        ];
        var composed = composeMany(args);

        expect(composed.length).to.equal(1);
        expect(composed(1)).to.equal(args[0](args[1](args[2](1))));
      });


      it('Composes in right direction (1)', function() {
        var args = [
          function(x) {return x + 'three';},
          function(x) {return x + 'two';},
          function() {return 'one';}
        ];
        var composed = composeMany(args);

        expect(composed()).to.equal('onetwothree');
      });


      it('Composes in right direction (2)', function() {
        var args = [
          function(x) {return x.concat([3]);},
          function(x) {return x.concat([2]);},
          function(x) {return [x].concat([1]);}
        ];
        var composed = composeMany(args);

        expect(composed(0)).to.deep.equal([0, 1, 2, 3]);
      });


      it('Returns function with correct arity (1)', function() {
        var args = [
          function(x) {return x + 1;},
          id,
          function() {return 3;}
        ];
        var composed = composeMany(args);

        expect(getRealArity(composed)).to.equal(0);
      });


      it('Returns function with correct arity (2)', function() {
        var args = [
          function(x, y, z) {return x + 1;},
          id,
          function() {return 3;}
        ];
        var composed = composeMany(args);

        expect(composed.length).to.equal(1);
        expect(getRealArity(composed)).to.equal(2);
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


    var flipSpec = {
      name: 'flip',
      arity: 1,
      restrictions: [['function']],
      validArguments: [[function(a, b) {}]]
    };


    describeFunction(flipSpec, base.flip, function(flip) {
      it('Returns a curried version of original function when called with function of length 0', function() {
        var f = function() {return [].slice.call(arguments);};
        var flipped = flip(f);

        expect(getRealArity(flipped)).to.equal(0);
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

        expect(getRealArity(flipped)).to.equal(1);
        expect(flipped(42)).to.deep.equal(f(42));
        expect(flipped(42, 'x')).to.deep.equal([42]);
      });


      it('Returns original function when called with curried function of length 1', function() {
        var f = curry(function(x) {return [].slice.call(arguments);});
        var flipped = flip(f);

        expect(flipped).to.equal(f);
      });


      var addThrowsArityGT2Test = function(message, f) {
        it('Throws if called with a function of arity > 2 ' + message, function() {
          var fn = function() {
            var flipped = flip(f);
          };

          expect(fn).to.throw(TypeError);
        });
      };


      addThrowsArityGT2Test('(normal function)', function(x, y, z) {return 42;});
      addThrowsArityGT2Test('(curried function)', curry(function(x, y, z) {return 42;}));


      var addReturnsCurriedTest = function(message, f) {
        it('Returns a curried function ' + message, function() {
          var flipped = flip(f);

          expect(flipped.length).to.equal(1);
          expect(getRealArity(flipped)).to.equal(2);
        });
      };


      addReturnsCurriedTest('(normal function)', function(x, y) {});
      addReturnsCurriedTest('(curried function)', curry(function(x, y) {}));


      it('Works correctly', function() {
        var f = function(x, y) {return [].slice.call(arguments);};
        var flipped = flip(f);

        expect(flipped(1, 2)).to.deep.equal(f(2, 1));
        expect(flipped('a', 'b')).to.deep.equal(f('b', 'a'));
      });


      testCurriedFunction('flipped function', flip(function(a, b) {return a - b;}), [1, 2]);
    });


    var sectionLeftSpec = {
      name: 'sectionLeft',
      arity: 2,
      restrictions: [['function: arity 2'], []],
      validArguments: [[function(x, y) {}], [1]]
    };


    describeFunction(sectionLeftSpec, base.sectionLeft, function(sectionLeft) {
      it('Calls f with x (1)', function() {
        var f = function(x, y) {f.args = [x];};
        f.args = null;
        // Lack of assignment here is deliberate: we are interested in the side effect
        var val = 42;
        var g = sectionLeft(f, val);
        g(1);

        expect(f.args).to.deep.equal([val]);
      });


      it('Calls f with x (2)', function() {
        var f = function(x, y) {f.args = [x];};
        f.args = null;
        // Lack of assignment here is deliberate: we are interested in the side effect
        var val = 'mozilla';
        var g = sectionLeft(f, val);
        g(1);

        expect(f.args).to.deep.equal([val]);
      });


      it('Returns f(x) (1)', function() {
        var val = 42;
        var f = curry(function(x, y) {return x + y;});
        var result = sectionLeft(f, val);

        expect(result).to.be.a('function');
        expect(result.length).to.equal(1);
        expect(result(10)).to.equal(f(val, 10));
      });


      it('Returns f(x) (2)', function() {
        var val = 42;
        var f = curry(function(x, y) {return x * y;});
        var result = sectionLeft(f, val);

        expect(result).to.be.a('function');
        expect(result.length).to.equal(1);
        expect(result(10)).to.equal(f(val, 10));
      });


      it('Curries f if necessary', function() {
        var val = 42;
        var f = function(x, y) {return x + y;};
        var result = sectionLeft(f, val);

        expect(result).to.be.a('function');
        expect(result.length).to.equal(1);
        expect(result(10)).to.equal(f(val, 10));
      });


      var fn = function(x, y) {return x + y;};
      testCurriedFunction('sectionLeft', sectionLeft, {firstArgs: [fn, 42], thenArgs: [1]});
    });


    var sectionRightSpec = {
      name: 'sectionRight',
      arity: 2,
      restrictions: [['function: arity 2'], []],
      validArguments: [[function(x, y) {}], [1]]
    };


    describeFunction(sectionRightSpec, base.sectionRight, function(sectionRight) {
      var addPartiallyAppliedRightTest = function(message, f, val1, val2) {
        it('Partially applies to the right (1)', function() {
          var sectioned = sectionRight(f, val1);

          expect(sectioned).to.be.a('function');
          expect(sectioned.length).to.equal(1);
          expect(sectioned(val2)).to.deep.equal(f(val2, val1));
        });
      };


      addPartiallyAppliedRightTest('(1)', curry(function(a, b) {return a - b;}), 1, 2);
      addPartiallyAppliedRightTest('(2)', function(a, b) {return [a, b];}, 3, 4);


      it('Curries f if necessary', function() {
        var f = function(a, b) {return [].slice.call(arguments);};
        var val1 = 32;
        var val2 = 10;
        var sectioned = sectionRight(f, val1);

        expect(sectioned).to.be.a('function');
        expect(sectioned.length).to.equal(1);
        expect(sectioned(val2)).to.deep.equal([val2, val1]);
      });


      var fn = function(x, y) {return x + y;};
      testCurriedFunction('sectionRight', sectionRight, {firstArgs: [fn, 42], thenArgs: [10]});
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


    var makeEqualsTests = function(name, fnUnderTest, isStrict, isNot) {
      var spec = {
        name: name,
        arity: 2
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        equalityTests.forEach(function(test) {
          var val = test.value;
          var type = val !== null ? typeof(val) : 'null';

          it('Correct for value of type ' + type + ' when testing value with itself',
             makeEqualityTest(fnUnderTest, !isNot, val, val));

          var coercible = test.coercible;
          coercible.forEach(function(cVal) {
            var cType = cVal !== null ? typeof(cVal) : 'null';
            it('Correct for value of type ' + type + ' when testing value with coercible value of type ' + cType,
               makeEqualityTest(fnUnderTest, !(isStrict ^ isNot), val, cVal));
          });

          var notEqual = test.notEqual;
          notEqual.forEach(function(nVal) {
            var nType = nVal !== null ? typeof(nVal) : 'null';
            it('Correct for value of type ' + type + ' when testing value with unequal value of type ' + nType,
               makeEqualityTest(fnUnderTest, isNot, val, nVal));
          });

          testCurriedFunction(name, fnUnderTest, [val, val]);
        });
      });
    };


    makeEqualsTests('equals', base.equals, false, false);
    makeEqualsTests('strictEquals', base.strictEquals, true, false);
    makeEqualsTests('notEqual', base.notEqual, false, true);
    makeEqualsTests('strictNotEqual', base.strictNotEqual, true, true);


    var deepEqualSpec = {
      name: 'deepEqual',
      arity: 2
    };


    describeFunction(deepEqualSpec, base.deepEqual, function(deepEqual) {
      var addWorksCorrectlyTest = function(message, a, b, expected) {
        it('Works correctly for ' + message, function() {
          expect(deepEqual(a, b)).to.equal(expected);
        });
      };


      var deTests = [
        {name: 'number', value: 1},
        {name: 'string', value: 'a'},
        {name: 'boolean', value: true},
        {name: 'undefined', value: undefined},
        {name: 'function', value: function() {}},
        {name: 'null', value: null},
        {name: 'array', value: []},
        {name: 'object', value: {}}];


      deTests.forEach(function(deTest, i) {
        var name = deTest.name;
        var value = deTest.value;

        deTests.forEach(function(deTest2, j) {
          var name2 = deTest2.name;
          var value2 = deTest2.value;

          var expected = (i === j);
          addWorksCorrectlyTest('values of type ' + name + ' and ' + name2, value, value2, expected);
        });
      });


      it('Works correctly for objects with non-identical prototypes (1)', function() {
        var F = function() {this.foo = 1;};
        F.prototype = {};
        var G = function() {this.foo = 1;};
        G.prototype = {};
        var f = new F();
        var g = new G();

        expect(deepEqual(f, g)).to.be.false;
      });


      addWorksCorrectlyTest('objects with different keys', {foo: 5}, {baz: 1}, false);
      addWorksCorrectlyTest('objects with different property values', {foo: 5}, {foo: 1}, false);
      addWorksCorrectlyTest('objects with properties that are not deep equal (1)', {foo: {bar: 1}},
                                                                                   {foo: {bar: 2}}, false);
      addWorksCorrectlyTest('objects with properties that are not deep equal (2)', {foo: [1, 2, 3]},
                                                                                   {foo: [4, 5]}, false);
      addWorksCorrectlyTest('objects with same keys and values', {foo: 4, bar: 3}, {foo: 4, bar: 3}, true);
      addWorksCorrectlyTest('objects with properties that are deep equal (1)', {foo: {bar: 1}}, {foo: {bar: 1}}, true);
      addWorksCorrectlyTest('objects with properties that are deep equal (2)', {foo: [1, 2, 3]}, {foo: [1, 2, 3]}, true);
      addWorksCorrectlyTest('arrays with different lengths', [1], [], false);
      addWorksCorrectlyTest('arrays with different values', [1, 2], [1, 3], false);
      addWorksCorrectlyTest('arrays that aren\'t deep equal (1)', [1, {foo: 5}], [1, {foo: 6}], false);
      addWorksCorrectlyTest('arrays that aren\'t deep equal (2)', [1, [1]], [1, [2]], false);
      addWorksCorrectlyTest('arrays with same lengths and  values', [1, 2], [1, 2], true);
      addWorksCorrectlyTest('arrays that are deep equal (1)', [1, {foo: 5}], [1, {foo: 5}], true);
      addWorksCorrectlyTest('arrays that are deep equal (2)', [1, [2]], [1, [2]], true);


      it('Works correctly for objects with non-identical prototypes (2)', function() {
        // The object literals here will not be identical
        var f = Object.create({foo: 1});
        var g = Object.create({foo: 1});

        expect(deepEqual(f, g)).to.be.false;
      });


      it('Works correctly for objects with same prototypes', function() {
        var F = function() {this.foo = 1;};
        F.prototype = {};
        var f = new F();
        var g = new F();

        expect(deepEqual(f, g)).to.be.true;
      });


      it('Non-enumerable properties do not affect deep equality', function() {
        var f = {buzz: 42};
        var g = {buzz: 42};
        Object.defineProperty(f, 'foo', {enumerable: false, value: 'a'});

        expect(deepEqual(f, g)).to.be.true;
      });


      testCurriedFunction('deepEqual', deepEqual, [{fizz: 'funkier'}, {fizz: 'funkier'}]);
    });


    var isTestData = [
      {name: 'number', base: true, types: ['number'], value: 1},
      {name: 'string', base: true, types: ['string'], value: 'a'},
      {name: 'undefined', base: true, types: ['undefined'], value: undefined},
      {name: 'boolean', base: true, types: ['boolean'], value: true},
      {name: 'function', base: true, types: ['function'], value: function() {}},
      {name: 'object', base: true, types: ['realObject', 'object'], value: {}},
      {name: 'null', base: false, types: ['object', 'null'], value: null},
      {name: 'array', base: false, types: ['object', 'array'], value: [1]}
    ];


    var isSpec = {
      name: 'is',
      arity: 2,
      restrictions: [['string'], []],
      validArguments: [['number'], [1]]
    };


    describeFunction(isSpec, base.is, function(is) {
      var primitiveIsTests = isTestData.filter(function(o) {return o.primitive;});


      var addIsCheck = function(name, test2) {
        it('Works correctly for type ' + name + ' and value ' + test2.name, function() {
          var result = is(name, test2.value);
          var expected = test2.types.indexOf(name) !== -1;

          expect(result).to.equal(expected);
        });
      };


      primitiveIsTests.forEach(function(primTest) {
        var name = primTest.name;

        isTestData.forEach(function(test2) {
          addIsCheck(is, primTest, test2);
        });
      });


      testCurriedFunction('is', is, ['object', {}]);
    });


    var addSpecialisedIsCheck = function(name, fnUnderTest, test, accepts) {
      it('Works correctly for type ' + name, function() {
        var result = fnUnderTest(test.value);
        var expected = test.types.indexOf(accepts) !== -1;

        expect(result).to.equal(expected);
      });
    };


    var addSpecialisedIsTest = function(desc, fnUnderTest, accepts) {
      var spec = {
        name: desc,
        arity: 1
      };


      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
        isTestData.forEach(function(test) {
          var name = test.name;
          addSpecialisedIsCheck(name, fnUnderTest, test, accepts);
        });


        testCurriedFunction(desc, fnUnderTest, [1]);
      });
    };


    addSpecialisedIsTest('isNumber', base.isNumber, 'number');
    addSpecialisedIsTest('isString', base.isString, 'string');
    addSpecialisedIsTest('isBoolean', base.isBoolean, 'boolean');
    addSpecialisedIsTest('isUndefined', base.isUndefined, 'undefined');
    addSpecialisedIsTest('isObject', base.isObject, 'object');
    addSpecialisedIsTest('isArray', base.isArray, 'array');
    addSpecialisedIsTest('isNull', base.isNull, 'null');
    addSpecialisedIsTest('isRealObject', base.isRealObject, 'realObject');


    var getTypeSpec = {
      name: 'getType',
      arity: 1
    };


    describeFunction(getTypeSpec, base.getType, function(getType) {
      var typeTests = [
        {name: 'number', val: 1},
        {name: 'boolean', val: true},
        {name: 'string', val: 'a'},
        {name: 'undefined', val: undefined},
        {name: 'null', val: null},
        {name: 'array', val: []},
        {name: 'function', val: function() {}},
        {name: 'object', val: {}}];

      typeTests.forEach(function(tt) {
        var name = tt.name;
        var val = tt.val;

        it('Works correctly for value of type ' + name, function() {
          expect(getType(val)).to.equal(typeof(val));
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
