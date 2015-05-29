//(function() {
//  "use strict";
//
//
//  var testFixture = function(require, exports) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var fn = require('../../fn');
//
//    var curryModule = require('../../curry');
//    var curry = curryModule.curry;
//    var curryWithArity = curryModule.curryWithArity;
//    var getRealArity = curryModule.getRealArity;
//
//    var base = require('../../base');
//    var id = base.id;
//
//    // Import utility functions
//    var testUtils = require('./testUtils');
//    var describeModule = testUtils.describeModule;
//    var describeFunction = testUtils.describeFunction;
//    var testCurriedFunction = testUtils.testCurriedFunction;
//    var makeArrayLike = testUtils.makeArrayLike;
//
//
//    var expectedObjects = [];
//    var expectedFunctions = ['apply', 'applyWithContext', 'bindWithContext', 'bindWithContextAndArity', 'permuteLeft',
//                             'rotateLeft', 'permuteRight', 'rotateRight', 'pre', 'post', 'wrap', 'callWithContext'];
//    describeModule('fn', fn, expectedObjects, expectedFunctions);
//
//
//    var applySpec = {
//      name: 'apply',
//      arity: 2,
//      restrictions: [['strictarraylike'], ['function']],
//      validArguments: [[[1, 2], makeArrayLike([1, 2])], [function(x) {}]]
//    };
//
//
//    describeFunction(applySpec, fn.apply, function(apply) {
//      it('Calls f', function() {
//        var called = false;
//        var f = function() {called = true;};
//        apply([], f);
//
//        expect(called).to.equal(true);
//      });
//
//
//      it('Calls f with null execution context', function() {
//        var context;
//        var f = function() {context = this;};
//        apply([], f);
//
//        expect(context).to.equal(null);
//      });
//
//
//      it('Calls f with given arguments (1)', function() {
//        var args = null;
//        var f = function(x) {args = [].slice.call(arguments);};
//        var fArgs = [1];
//        apply(fArgs, f);
//
//        expect(args).to.deep.equal(fArgs);
//      });
//
//
//      it('Calls f with given arguments (2)', function() {
//        var args = null;
//        var f = function(x, y) {args = [].slice.call(arguments);};
//        var fArgs = ['foo', 42];
//        apply(fArgs, f);
//
//        expect(args).to.deep.equal(fArgs);
//      });
//
//
//      it('Returns value of f when applied to given arguments (1)', function() {
//        var f = function(x) {return x + 1;};
//        var arg = 1;
//        var result = apply([arg], f);
//
//        expect(result).to.deep.equal(f(arg));
//      });
//
//
//      it('Returns value of f when applied to given arguments (2)', function() {
//        var f = function(x, y) {return x * y;};
//        var arg1 = 2;
//        var arg2 = 42;
//        var result = apply([arg1, arg2], f);
//
//        expect(result).to.deep.equal(f(arg1, arg2));
//      });
//
//
//      it('Curries f if necessary', function() {
//        var f = function(x, y) {return x + y;};
//        var arg = 42;
//        var result = apply([arg], f);
//
//        expect(result).to.be.a('function');
//        expect(result.length).to.equal(1);
//        expect(result(10)).to.equal(f(arg, 10));
//      });
//
//
//      testCurriedFunction(apply, [[42], id]);
//    });
//
//
//    var applyWithContextSpec = {
//      name: 'applyWithContext',
//      arity: 3,
//      restrictions: [['strictarraylike'], [], ['function']],
//      validArguments: [[[1, 2], makeArrayLike([1, 2])], [{}], [function(x) {}]]
//    };
//
//
//    describeFunction(applyWithContextSpec, fn.applyWithContext, function(applyWithContext) {
//      it('Calls f', function() {
//        var called = false;
//        var f = function() {called = true;};
//        applyWithContext([], {}, f);
//
//        expect(called).to.equal(true);
//      });
//
//
//      it('Calls f with correct execution context', function() {
//        var context;
//        var o = {};
//        var f = function() {context = this;};
//        applyWithContext([], o, f);
//
//        expect(context).to.equal(o);
//      });
//
//
//      it('Calls f with given arguments (1)', function() {
//        var args = null;
//        var f = function(x) {args = [].slice.call(arguments);};
//        var fArgs = [1];
//        applyWithContext(fArgs, {}, f);
//
//        expect(args).to.deep.equal(fArgs);
//      });
//
//
//      it('Calls f with given arguments (2)', function() {
//        var args = null;
//        var f = function(x, y) {args = [].slice.call(arguments);};
//        var fArgs = ['foo', 42];
//        applyWithContext(fArgs, {}, f);
//
//        expect(args).to.deep.equal(fArgs);
//      });
//
//
//      it('Returns value of f when applied to given arguments (1)', function() {
//        var o = {foo: 41};
//        var f = function(x) {return x + this.foo;};
//        var arg = 1;
//        var result = applyWithContext([arg], o, f);
//
//        expect(result).to.deep.equal(f.call(o, arg));
//      });
//
//
//      it('Returns value of f applied to given arguments (2)', function() {
//        var o = {bar: 10};
//        var f = function(x, y) {return x * y * this.bar;};
//        var arg1 = 2;
//        var arg2 = 42;
//        var result = applyWithContext([arg1, arg2], o, f);
//
//        expect(result).to.deep.equal(f.call(o, arg1, arg2));
//      });
//
//
//      it('Curries f if necessary', function() {
//        var f = function(x, y) {return x + y;};
//        var arg = 42;
//        var result = applyWithContext([arg], {}, f);
//
//        expect(result).to.be.a('function');
//        expect(result.length).to.equal(1);
//        expect(result(10)).to.equal(f(arg, 10));
//      });
//
//
//      testCurriedFunction(applyWithContext, [[42], {}, id]);
//    });
//
//
//    var addCommonPermuteTests = function(fnUnderTest) {
//      // Generate the same arity tests
//      var fns = [function() {}, function(a) {}, function(a, b) {}, function(a, b, c) {}, function(a, b, c, d) {}];
//
//      var addSameArityTest = function(f, i) {
//        it('Returns function with correct \'real\' arity if called with uncurried function of arity ' + i, function() {
//          var permuted = fnUnderTest(f);
//
//          expect(getRealArity(permuted)).to.equal(getRealArity(f));
//        });
//      };
//
//
//      var addCurriedSameArityTest = function(f, i) {
//        it('Returns function with correct \'real\' arity if called with curried function of arity ' + i, function() {
//          f = curry(f);
//          var permuted = fnUnderTest(f);
//
//          expect(getRealArity(permuted)).to.equal(getRealArity(f));
//        });
//      };
//
//
//      fns.forEach(function(f, i) {
//        addSameArityTest(f, i);
//        addCurriedSameArityTest(f, i);
//      });
//
//
//      it('Returns original function if original is curried with arity 0', function() {
//        var f = curry(function() {});
//        var g = fnUnderTest(f);
//
//        expect(g).to.equal(f);
//      });
//
//
//      it('Returns curried original function if original is not curried and has arity 0', function() {
//        var f = function() {return [].slice.call(arguments);};
//        var g = fnUnderTest(f);
//
//        expect(g).to.not.equal(f);
//        // The curried function should ignore superfluous arguments
//        expect(g(1, 2, 3)).to.deep.equal([]);
//      });
//
//
//      it('Returns original function if original is curried with arity 1', function() {
//        var f = curry(function(x) {});
//        var g = fnUnderTest(f);
//
//        expect(g).to.equal(f);
//      });
//
//
//      it('Returns curried original function if original is not curried and has arity 1', function() {
//        var f = function(x) {return [].slice.call(arguments);};
//        var g = fnUnderTest(f);
//
//        expect(g).to.not.equal(f);
//        // The curried function should ignore superfluous arguments
//        expect(g(1, 2, 3)).to.deep.equal([1]);
//      });
//
//
//      it('New function returns same result as original when called with uncurried function of arity 2', function() {
//        var f = function(x, y) {return x - y;};
//        var permuted = fnUnderTest(f);
//
//        expect(permuted(1, 2)).to.equal(f(2, 1));
//      });
//
//
//      it('New function returns same result as original when called with curried function of arity 2', function() {
//        var f = curry(function(x, y) {return x - y;});
//        var permuted = fnUnderTest(f);
//
//        expect(permuted(1, 2)).to.equal(f(2, 1));
//      });
//
//
//      it('Equivalent to flip when called with an uncurried function of arity 2', function() {
//        var f = function(x, y) {return x - y;};
//        var flipped = base.flip(f);
//        var permuted = fnUnderTest(f);
//
//        expect(permuted(1, 2)).to.equal(flipped(1, 2));
//      });
//
//
//      it('Equivalent to flip when called with an curried function of arity 2', function() {
//        var f = curry(function(x, y) {return x - y;});
//        var flipped = base.flip(f);
//        var permuted = fnUnderTest(f);
//
//        expect(permuted(1, 2)).to.equal(flipped(1, 2));
//      });
//
//
//      var f = function(a, b) {return a - b;};
//      testCurriedFunction(fnUnderTest(f), [1, 2], {message: 'Uncurried arity 2 function curries'});
//      var g = curry(function(a, b) {return a - b;});
//      testCurriedFunction(fnUnderTest(g), [1, 2], {message: 'Curried arity 2 function'});
//    };
//
//
//    var permuteLeftSpec = {
//      name: 'permuteLeft',
//      arity: 1,
//      restrictions: [['function']],
//      validArguments: [[function() {}]]
//    };
//
//
//    describeFunction(permuteLeftSpec, fn.permuteLeft, function(permuteLeft) {
//      addCommonPermuteTests(permuteLeft);
//
//
//      // For higher arities, we will generate a series of tests for arities 3 and 4
//      var params = [1, 'a', undefined, true];
//      var baseFunc = function() {return [].slice.call(arguments);};
//
//
//      var addCallsOriginalTest = function(i) {
//        it('Calls original function for function of arity ' + i, function() {
//          var called = false;
//          var args = params.slice(0, i);
//          var fn = curryWithArity(i, function() {called = true;});
//          var permuted = permuteLeft(fn);
//          // Lack of assignment is deliberate: we only care about the side-effect
//          permuted.apply(null, args);
//
//          expect(called).to.equal(true);
//        });
//      };
//
//
//      var addPermutesArgsTest = function(i) {
//        it('Correctly permutes arguments for function of arity ' + i, function() {
//          var args = params.slice(0, i);
//          var fn = curryWithArity(i, baseFunc);
//          var permuted = permuteLeft(fn);
//          var result = permuted.apply(null, args);
//          var expected = [args[i - 1]].concat(args.slice(0, i - 1));
//
//          expect(result).to.deep.equal(expected);
//        });
//      };
//
//
//      var addSameResultTest = function(i) {
//        it('Returns same result as original for function of arity ' + i, function() {
//          var args = params.slice(0, i);
//          var fn = curryWithArity(i, function() {return [].slice.call(arguments).sort();});
//          var permuted = permuteLeft(fn);
//          var originalResult = fn.apply(null, args.slice(1).concat([args[0]]));
//          var result = permuted.apply(null, args);
//
//          expect(result).to.deep.equal(originalResult);
//        });
//      };
//
//
//      for (var i = 3; i < 5; i++) {
//        addCallsOriginalTest(i);
//        addPermutesArgsTest(i);
//        addSameResultTest(i);
//
//        // And, of course, the permuted function should be curried
//        var curried = curryWithArity(i, baseFunc);
//        testCurriedFunction(permuteLeft(curried), params.slice(0, i), {message: 'Permuted function of arity ' + i});
//      }
//    });
//
//
//    describe('rotateLeft', function() {
//      it('Is a synonym for permuteLeft', function() {
//        expect(fn.rotateLeft === fn.permuteLeft).to.equal(true);
//      });
//    });
//
//
//    var permuteRightSpec = {
//      name: 'permuteRight',
//      arity: 1,
//      restrictions: [['function']],
//      validArguments: [[function() {}]]
//    };
//
//
//    describeFunction(permuteRightSpec, fn.permuteRight, function(permuteRight) {
//      addCommonPermuteTests(permuteRight);
//
//
//      // For higher arities, we will generate a series of tests for arities 3 and 4
//      var params = [1, 'a', undefined, true];
//      var baseFunc = function() {return [].slice.call(arguments);};
//
//
//      var addCallsOriginalTest = function(i) {
//        it('Calls original function for function of arity ' + i, function() {
//          var called = false;
//          var args = params.slice(0, i);
//          var fn = curryWithArity(i, function() {called = true;});
//          var permuted = permuteRight(fn);
//          // Lack of assignment is deliberate: we only care about the side-effect
//          permuted.apply(null, args);
//
//          expect(called).to.equal(true);
//        });
//      };
//
//
//      var addPermutesArgsTest = function(i) {
//        it('Correctly permutes arguments for function of arity ' + i, function() {
//          var args = params.slice(0, i);
//          var fn = curryWithArity(i, baseFunc);
//          var permuted = permuteRight(fn);
//          var result = permuted.apply(null, args);
//          var expected = args.slice(1).concat([args[0]]);
//
//          expect(result).to.deep.equal(expected);
//        });
//      };
//
//
//      var addSameResultTest = function(i) {
//        it('Returns same result as original for function of arity ' + i, function() {
//          var args = params.slice(0, i);
//          var fn = curryWithArity(i, function() {return [].slice.call(arguments).sort();});
//          var permuted = permuteRight(fn);
//          var originalResult = fn.apply(null, args.slice(1).concat([args[0]]));
//          var result = permuted.apply(null, args);
//
//          expect(result).to.deep.equal(originalResult);
//        });
//      };
//
//
//      for (var i = 3; i < 5; i++) {
//        addCallsOriginalTest(i);
//        addPermutesArgsTest(i);
//        addSameResultTest(i);
//
//        // And, of course, the permuted function should be curried
//        var curried = curryWithArity(i, baseFunc);
//        testCurriedFunction(permuteRight(curried), params.slice(0, i), {message: 'Permuted function of arity ' + i});
//      }
//    });
//
//
//    describe('rotateRight', function() {
//      it('Is a synonym for permuteRight', function() {
//        expect(fn.rotateRight === fn.permuteRight).to.equal(true);
//      });
//    });
//
//
//    var addReturnsFunctionTest = function(fnUnderTest, args) {
//      it('Returns a function', function() {
//        var result = fnUnderTest.apply(null, args);
//
//        expect(result).to.be.a('function');
//      });
//    };
//
//
//    var bindWithContextSpec = {
//      name: 'bindWithContext',
//      arity: 2,
//      restrictions: [['objectlike'], ['function']],
//      validArguments: [[{}], [function() {}]]
//    };
//
//
//    describeFunction(bindWithContextSpec, fn.bindWithContext, function(bindWithContext) {
//      addReturnsFunctionTest(bindWithContext, [{}, function() {}]);
//
//
//      var addCorrectArityTest = function(message, f) {
//        it('Returned function has correct arity ' + message, function() {
//          var obj = {};
//          var result = bindWithContext(obj, f);
//
//          expect(getRealArity(result)).to.equal(f.length);
//        });
//      };
//
//
//      addCorrectArityTest('(1)', function() {});
//      addCorrectArityTest('(2)', function(x) {});
//      addCorrectArityTest('(3)', function(x, y) {});
//
//
//      it('Binds to context', function() {
//        var f = function() {return this;};
//        var obj = {};
//        var result = bindWithContext(obj, f)();
//
//        expect(result).to.equal(obj);
//      });
//
//
//      // If necessary, the returned function should be curried
//      var f1 = function(x, y) {return x + y + this.foo;};
//      var obj1 = {foo: 6};
//      var result = bindWithContext(obj1, f1);
//      testCurriedFunction(result, [1, 2], {message: 'bindWithContext bound function'});
//
//
//      // bindWithContext should be curried
//      var f2 = function(x) {return x + this.foo;};
//      var obj2 = {foo: 5};
//      testCurriedFunction(bindWithContext, {firstArgs: [obj2, f2], thenArgs: [2]});
//    });
//
//
//    var addCommonWrapTests = function(fnUnderTest, isWrap) {
//      isWrap = isWrap || false;
//
//
//      addReturnsFunctionTest(fnUnderTest, isWrap ? [function() {}, function() {}, function() {}] :
//                                                   [function() {}, function() {}]);
//
//
//      var addCorrectArityTest = function(message, g, f) {
//        it('Returned function has correct arity ' + message, function() {
//          var result = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);
//
//          expect(getRealArity(result)).to.equal(f.length);
//        });
//      };
//
//
//      addCorrectArityTest('(1)', function() {}, function() {});
//      addCorrectArityTest('(2)', function() {}, function(x) {});
//      addCorrectArityTest('(3)', function(x) {}, function(x, y) {});
//
//
//      var addCallsOriginalWithArgsTest = function(message, args) {
//        it('Calls the original function with the given arguments ' + message, function() {
//          var fArgs = null;
//          var f = args.length === 2 ? function(x, y) {fArgs = [].slice.call(arguments);} :
//                                      function(x) {fArgs = [].slice.call(arguments);};
//          var g = function() {};
//          var newFn = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);
//          newFn.apply(null, args);
//
//          expect(fArgs).to.deep.equal(args);
//        });
//      };
//
//
//      addCallsOriginalWithArgsTest('(1)', [1, 2]);
//      addCallsOriginalWithArgsTest('(2)', ['funkier']);
//
//
//      it('Calls the original function with preserved execution context', function() {
//        var exc;
//        var f = function(x, y) {exc = this;};
//        var g = function() {};
//        var newFn = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);
//        var args = ['a', 'b'];
//        var obj = {};
//        newFn.apply(obj, args);
//
//        expect(exc).to.equal(obj);
//      });
//
//
//      var addReturnsOriginalsValueTest = function(message, f, args) {
//        it('Returns the original function\'s return value ' + message, function() {
//          var g = function() {};
//          var newFn = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);
//          var result = newFn.apply(null, args);
//
//          expect(result).to.equal(f.apply(null, args));
//        });
//      };
//
//
//      addReturnsOriginalsValueTest('(1)', function(x, y) {return x + y;}, [1, 2]);
//      addReturnsOriginalsValueTest('(2)', function(x, y) {return 42;}, [1, 2]);
//    };
//
//
//    var addCommonPreTests = function(fnUnderTest, isWrap) {
//      isWrap = isWrap || false;
//
//
//      var addCallsPreWithArgsTest = function(message, f, args) {
//        it('Calls the pre function with the given arguments ' + message, function() {
//          var preArgs = null;
//          var pre = function(args) {preArgs = args;};
//          var post = function() {};
//          var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
//          newFn.apply(null, args);
//
//          expect(preArgs).to.deep.equal(args);
//        });
//      };
//
//
//      addCallsPreWithArgsTest('(1)', function(x, y) {}, [1, 2]);
//      addCallsPreWithArgsTest('(2)', function(x) {}, ['funkier']);
//
//
//      it('Calls the pre function with preserved execution context', function() {
//        var preExc;
//        var pre = function() {preExc = this;};
//        var post = function() {};
//        var f = function() {};
//        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
//        var args = ['a', 'b'];
//        var obj = {};
//        newFn.apply(obj, args);
//
//        expect(preExc).to.equal(obj);
//      });
//
//
//      it('Calls the pre function before the original function', function() {
//        var origCalled = false;
//        var preCalledBefore = false;
//
//        var f = function() {origCalled = true;};
//        var pre = function() {preCalledBefore = !origCalled;};
//        var post = function() {};
//        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
//        var args = ['funkier'];
//        newFn.apply(null, args);
//
//        expect(preCalledBefore).to.equal(true);
//      });
//
//
//      it('Disregards the fnUnderTest function\'s return value', function() {
//        var f = function(x, y) {return x + y;};
//        var pre = function() {return 42;};
//        var post = function() {};
//        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
//        var args = [1, 2];
//        var result = newFn.apply(null, args);
//
//        expect(result).to.not.equal(pre.apply(null, args));
//        expect(result).to.equal(f.apply(null, args));
//      });
//    };
//
//
//    var preSpec = {
//      name: 'pre',
//      arity: 2,
//      restrictions: [['function'], ['function']],
//      validArguments: [[function() {}], [function() {}]]
//    };
//
//
//    describeFunction(preSpec, fn.pre, function(pre) {
//      addCommonWrapTests(pre);
//      addCommonPreTests(pre);
//
//
//      var g = function() {};
//      var f = function(x) {return x;};
//      testCurriedFunction(pre, {firstArgs: [g, f], thenArgs: [1]});
//    });
//
//
//    var addCommonPostTests = function(fnUnderTest, isWrap) {
//      isWrap = isWrap || false;
//
//
//      it('Calls the post function with preserved execution context', function() {
//        var postExc;
//        var post = function() {postExc = this;};
//        var f = function() {};
//        var pre = function() {};
//        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
//        var args = ['a', 'b'];
//        var obj = {};
//        newFn.apply(obj, args);
//
//        expect(postExc).to.equal(obj);
//      });
//
//
//      it('Calls the post function after the original function', function() {
//        var origCalled = false;
//        var postCalledAfter = false;
//
//        var f = function() {origCalled = true;};
//        var pre = function() {};
//        var post = function() {postCalledAfter = origCalled;};
//        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
//        var args = ['funkier'];
//        newFn.apply(null, args);
//
//        expect(postCalledAfter).to.equal(true);
//      });
//
//
//      var addCallsPostWithArgsAndResultTest = function(message, f, args) {
//        it('Calls the pre function with the given arguments ' + message, function() {
//          var postArgs = null;
//          var postResult = null;
//          var post = function(args, result) {postArgs = args; postResult = result;};
//          var pre = function() {};
//          var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
//          newFn.apply(null, args);
//
//          expect(postArgs).to.deep.equal(args);
//          expect(postResult).to.deep.equal(f.apply(null, args));
//        });
//      };
//
//
//      addCallsPostWithArgsAndResultTest('(1)', function(x, y) {return x + y;}, [1, 2]);
//      addCallsPostWithArgsAndResultTest('(2)', id, ['funkier']);
//
//
//      it('Disregards the post function\'s return value', function() {
//        var f = function(x, y) {return x + y;};
//        var pre = function() {};
//        var post = function() {return 42;};
//        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
//        var args = [1, 2];
//        var result = newFn.apply(null, args);
//
//        expect(result).to.not.equal(post.apply(null, [args, f.apply(null, args)]));
//        expect(result).to.equal(f.apply(null, args));
//      });
//    };
//
//
//    var postSpec = {
//      name: 'post',
//      arity: 2,
//      restrictions: [['function'], ['function']],
//      validArguments: [[function() {}], [function() {}]]
//    };
//
//
//    describeFunction(postSpec, fn.post, function(post) {
//      addCommonWrapTests(post);
//      addCommonPostTests(post);
//
//
//      var g = function() {};
//      testCurriedFunction(post, {firstArgs: [g, id], thenArgs: [1]});
//    });
//
//
//    var wrapSpec = {
//      name: 'wrap',
//      arity: 3,
//      restrictions: [['function'], ['function'], ['function']],
//      validArguments: [[function() {}], [function() {}], [function() {}]]
//    };
//
//
//    describeFunction(wrapSpec, fn.wrap, function(wrap) {
//      addCommonWrapTests(wrap, true);
//      addCommonPreTests(wrap, true);
//      addCommonPostTests(wrap, true);
//
//
//      var pre = function() {};
//      var post = function() {};
//      var f = function(x) {return x;};
//      testCurriedFunction(wrap, {firstArgs: [pre, post, f], thenArgs: [1]});
//    });
//
//
//    var callWithContextSpec = {
//      name: 'callWithContext',
//      arity: 3,
//      restrictions: [['objectlike'], ['strictarraylike'], ['function']],
//      validArguments: [[{}], [[], makeArrayLike()], [function() {}]]
//    };
//
//
//    describeFunction(callWithContextSpec, fn.callWithContext, function(callWithContext) {
//      it('Calls function with correct context', function() {
//        var fContext = null;
//        var f = function() {fContext = this;};
//        var context = {};
//        callWithContext(context, [], f);
//
//        expect(fContext).to.equal(context);
//      });
//
//
//      var addCallsWithArgsTest = function(message, args) {
//        it('Calls function with correct arguments ' + message, function() {
//          var fArgs = null;
//          var f = args.length === 0 ? function() {fArgs = [].slice.call(arguments);} :
//                                      function(a, b, c) {fArgs = [].slice.call(arguments);};
//          var context = {};
//          callWithContext(context, args, f);
//
//          expect(fArgs).to.deep.equal(args);
//        });
//      };
//
//
//      addCallsWithArgsTest('(1)', [1, true, []]);
//      addCallsWithArgsTest('(2)', []);
//
//
//      it('Returns result of function (1)', function() {
//        var expected = {};
//        var f = function() {return expected;};
//        var context = {};
//        var result = callWithContext(context, [], f);
//
//        expect(result).to.equal(expected);
//      });
//
//
//      it('Returns result of function (2)', function() {
//        var f = function(x) {return this.foo + x;};
//        var context = {foo: 15};
//        var result = callWithContext(context, [1], f);
//
//        expect(result).to.equal(context.foo + 1);
//      });
//
//
//      it('Curries function if necessary (1)', function() {
//        var f = function(x, y) {return this.foo + x + y;};
//        var x = 2;
//        var y = 3;
//        var context = {foo: 5};
//        var result = callWithContext(context, [x], f);
//
//        expect(result).to.be.a('function');
//        expect(getRealArity(result)).to.equal(1);
//        expect(result(y)).to.equal(context.foo + x + y);
//      });
//
//
//      it('Curries function if necessary (2)', function() {
//        var f = function(x, y, z) {return this.foo + x + y + z;};
//        var x = 2;
//        var y = 3;
//        var z = 7;
//        var context = {foo: 9};
//        var result = callWithContext(context, [x], f);
//
//        expect(result).to.be.a('function');
//        expect(getRealArity(result)).to.equal(2);
//        expect(result(y, z)).to.equal(context.foo + x + y + z);
//      });
//
//
//      it('Doesn\'t permanently affect context', function() {
//        var f = function() {return this;};
//        var context = {};
//        callWithContext(context, [], f);
//        var result = f();
//
//        expect(result).to.not.equal(context);
//      });
//
//
//      var f = function() {return this.foo;};
//      testCurriedFunction(callWithContext, [{foo: 42}, [], f]);
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
