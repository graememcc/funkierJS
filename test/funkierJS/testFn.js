(function() {
  "use strict";


  var expect = require('chai').expect;

  var fn = require('../../lib/components/fn');

  var curryModule = require('../../lib/components/curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var bind = curryModule.bind;
  var objectCurry = curryModule.objectCurry;
  var arityOf = curryModule.arityOf;

  var base = require('../../lib/components/base');
  var id = base.id;

  var testingUtilities = require('./testingUtilities');
  var checkModule = testingUtilities.checkModule;
  var checkFunction = testingUtilities.checkFunction;
  var makeArrayLike = testingUtilities.makeArrayLike;
  var addCurryStyleTests = testingUtilities.addCurryStyleTests;


  describe('fn', function() {
    var expectedObjects = [];
    var expectedFunctions = ['apply', 'permuteLeft', 'permuteRight', 'post', 'pre', 'wrap'];
    checkModule('fn', fn, expectedObjects, expectedFunctions);


    var applySpec = {
      name: 'apply',
      restrictions: [['strictarraylike'], ['function']],
      validArguments: [[[1, 2], makeArrayLike([1, 2])], [function(x) {}]]
    };


    checkFunction(applySpec, fn.apply, function(apply) {
      it('Calls f', function() {
        var called = false;
        var f = function() {called = true;};
        apply([], f);

        expect(called).to.equal(true);
      });


      it('Calls uncurried f with null execution context (1)', function() {
        var context;
        var f = function() {context = this;};
        apply([], f);

        expect(context).to.equal(null);
      });


      it('Calls object curried f with extant execution context (2)', function() {
        var context;
        var f = objectCurry(function() {context = this;});
        apply([], f);

        expect(context).to.equal(null);
      });


      it('Calls f with given arguments (1)', function() {
        var args = null;
        var f = function(x) {args = [].slice.call(arguments);};
        var fArgs = [1];
        apply(fArgs, f);

        expect(args).to.deep.equal(fArgs);
      });


      it('Calls f with given arguments (2)', function() {
        var args = null;
        var f = function(x, y) {args = [].slice.call(arguments);};
        var fArgs = ['foo', 42];
        apply(fArgs, f);

        expect(args).to.deep.equal(fArgs);
      });


      it('Returns value of f when applied to given arguments (1)', function() {
        var f = function(x) {return x + 1;};
        var arg = 1;
        var result = apply([arg], f);

        expect(result).to.deep.equal(f(arg));
      });


      it('Returns value of f when applied to given arguments (2)', function() {
        var f = function(x, y) {return x * y;};
        var arg1 = 2;
        var arg2 = 42;
        var result = apply([arg1, arg2], f);

        expect(result).to.deep.equal(f(arg1, arg2));
      });


      it('Curries f if necessary', function() {
        var f = function(x, y) {return x + y;};
        var arg = 42;
        var result = apply([arg], f);

        expect(result).to.be.a('function');
        expect(result.length).to.equal(1);
        expect(result(10)).to.equal(f(arg, 10));
      });


      it('Curries f using curry necessary', function() {
        var f = function(x, y) {return x + y;};
        var arg = 42;
        var result = apply([arg], f);

        expect(result).to.be.a('function');
        expect(curry(result)).to.equal(result);
      });
    });


    var addCommonPermuteTests = function(fnUnderTest) {
      // Generate the same arity tests
      var fns = [function() {}, function(a) {}, function(a, b) {}, function(a, b, c) {}, function(a, b, c, d) {}];

      var addSameArityTest = function(f, i) {
        it('Returns function with correct \'real\' arity if called with uncurried function of arity ' + i, function() {
          var permuted = fnUnderTest(f);

          expect(arityOf(permuted)).to.equal(arityOf(f));
        });
      };


      var addCurriedSameArityTest = function(f, i) {
        it('Returns function with correct \'real\' arity if called with curried function of arity ' + i, function() {
          f = curry(f);
          var permuted = fnUnderTest(f);

          expect(arityOf(permuted)).to.equal(arityOf(f));
        });
      };


      fns.forEach(function(f, i) {
        addSameArityTest(f, i);
        addCurriedSameArityTest(f, i);
      });


      it('Returns original function if original is curried with arity 0', function() {
        var f = curry(function() {});
        var g = fnUnderTest(f);

        expect(g).to.equal(f);
      });


      it('Returns curried original function if original is not curried and has arity 0', function() {
        var f = function() {return [].slice.call(arguments);};
        var g = fnUnderTest(f);

        expect(g).to.not.equal(f);
        // The curried function should ignore superfluous arguments
        expect(g(1, 2, 3)).to.deep.equal([]);
      });


      it('Returns original function if original is curried with arity 1', function() {
        var f = curry(function(x) {});
        var g = fnUnderTest(f);

        expect(g).to.equal(f);
      });


      it('Returns curried original function if original is not curried and has arity 1', function() {
        var f = function(x) {return [].slice.call(arguments);};
        var g = fnUnderTest(f);

        expect(g).to.not.equal(f);
        // The curried function should ignore superfluous arguments
        expect(g(1, 2, 3)).to.deep.equal([1]);
      });


      it('New function returns same result as original when called with uncurried function of arity 2', function() {
        var f = function(x, y) {return x - y;};
        var permuted = fnUnderTest(f);

        expect(permuted(1, 2)).to.equal(f(2, 1));
      });


      it('New function returns same result as original when called with curried function of arity 2', function() {
        var f = curry(function(x, y) {return x - y;});
        var permuted = fnUnderTest(f);

        expect(permuted(1, 2)).to.equal(f(2, 1));
      });


      it('Equivalent to flip when called with an uncurried function of arity 2', function() {
        var f = function(x, y) {return x - y;};
        var flipped = base.flip(f);
        var permuted = fnUnderTest(f);

        expect(permuted(1, 2)).to.equal(flipped(1, 2));
      });


      it('Equivalent to flip when called with an curried function of arity 2', function() {
        var f = curry(function(x, y) {return x - y;});
        var flipped = base.flip(f);
        var permuted = fnUnderTest(f);

        expect(permuted(1, 2)).to.equal(flipped(1, 2));
      });


      addCurryStyleTests(function(f) { return fnUnderTest(f); });


      it('Execution context supplied to any objectCurried inputs', function() {
        var context;
        var f = objectCurry(function() { context = this; });
        var g = fnUnderTest(f);
        var obj = {};
        g.apply(obj);

        expect(context).to.equal(obj);
      });
    };


    var permuteLeftSpec = {
      name: 'permuteLeft',
      restrictions: [['function']],
      validArguments: [[function() {}]]
    };


    checkFunction(permuteLeftSpec, fn.permuteLeft, function(permuteLeft) {
      addCommonPermuteTests(permuteLeft);


      // To test higher arities, we will generate a series of tests for arities 3 and 4
      var params = [1, 'a', undefined, true];
      var baseFunc = function() {return [].slice.call(arguments);};


      var addCallsOriginalTest = function(i) {
        it('Calls original function for function of arity ' + i, function() {
          var called = false;
          var args = params.slice(0, i);
          var fn = curryWithArity(i, function() {called = true;});
          var permuted = permuteLeft(fn);
          permuted.apply(null, args);

          expect(called).to.equal(true);
        });
      };


      var addPermutesArgsTest = function(i) {
        it('Correctly permutes arguments for function of arity ' + i, function() {
          var args = params.slice(0, i);
          var fn = curryWithArity(i, baseFunc);
          var permuted = permuteLeft(fn);
          var result = permuted.apply(null, args);
          var expected = [args[i - 1]].concat(args.slice(0, i - 1));

          expect(result).to.deep.equal(expected);
        });
      };


      var addSameResultTest = function(i) {
        it('Returns same result as original for function of arity ' + i, function() {
          var args = params.slice(0, i);
          var fn = curryWithArity(i, function() {return [].slice.call(arguments).sort();});
          var permuted = permuteLeft(fn);
          var originalResult = fn.apply(null, args.slice(1).concat([args[0]]));
          var result = permuted.apply(null, args);

          expect(result).to.deep.equal(originalResult);
        });
      };


      for (var i = 3; i < 5; i++) {
        addCallsOriginalTest(i);
        addPermutesArgsTest(i);
        addSameResultTest(i);
      }
    });


    var permuteRightSpec = {
      name: 'permuteRight',
      restrictions: [['function']],
      validArguments: [[function() {}]]
    };


    checkFunction(permuteRightSpec, fn.permuteRight, function(permuteRight) {
      addCommonPermuteTests(permuteRight);


      // For higher arities, we will generate a series of tests for arities 3 and 4
      var params = [1, 'a', undefined, true];
      var baseFunc = function() {return [].slice.call(arguments);};


      var addCallsOriginalTest = function(i) {
        it('Calls original function for function of arity ' + i, function() {
          var called = false;
          var args = params.slice(0, i);
          var fn = curryWithArity(i, function() {called = true;});
          var permuted = permuteRight(fn);
          // Lack of assignment is deliberate: we only care about the side-effect
          permuted.apply(null, args);

          expect(called).to.equal(true);
        });
      };


      var addPermutesArgsTest = function(i) {
        it('Correctly permutes arguments for function of arity ' + i, function() {
          var args = params.slice(0, i);
          var fn = curryWithArity(i, baseFunc);
          var permuted = permuteRight(fn);
          var result = permuted.apply(null, args);
          var expected = args.slice(1).concat([args[0]]);

          expect(result).to.deep.equal(expected);
        });
      };


      var addSameResultTest = function(i) {
        it('Returns same result as original for function of arity ' + i, function() {
          var args = params.slice(0, i);
          var fn = curryWithArity(i, function() {return [].slice.call(arguments).sort();});
          var permuted = permuteRight(fn);
          var originalResult = fn.apply(null, args.slice(1).concat([args[0]]));
          var result = permuted.apply(null, args);

          expect(result).to.deep.equal(originalResult);
        });
      };


      for (var i = 3; i < 5; i++) {
        addCallsOriginalTest(i);
        addPermutesArgsTest(i);
        addSameResultTest(i);
      }
    });


    var addReturnsFunctionTest = function(fnUnderTest, args) {
      it('Returns a function', function() {
        var result = fnUnderTest.apply(null, args);

        expect(result).to.be.a('function');
      });
    };


    var addCommonWrapTests = function(fnUnderTest, isWrap) {
      isWrap = isWrap || false;


      addReturnsFunctionTest(fnUnderTest, isWrap ? [function() {}, function() {}, function() {}] :
                                                   [function() {}, function() {}]);


      var addCorrectArityTest = function(message, g, f) {
        it('Returned function has correct arity ' + message, function() {
          var result = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);

          expect(arityOf(result)).to.equal(f.length);
        });
      };


      addCorrectArityTest('(1)', function() {}, function() {});
      addCorrectArityTest('(2)', function() {}, function(x) {});
      addCorrectArityTest('(3)', function(x) {}, function(x, y) {});


      var addCallsOriginalWithArgsTest = function(message, args) {
        it('Calls the original function with the given arguments ' + message, function() {
          var fArgs = null;
          var f = args.length === 2 ? function(x, y) {fArgs = [].slice.call(arguments);} :
                                      function(x) {fArgs = [].slice.call(arguments);};
          var g = function() {};
          var newFn = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);
          newFn.apply(null, args);

          expect(fArgs).to.deep.equal(args);
        });
      };


      addCallsOriginalWithArgsTest('(1)', [1, 2]);
      addCallsOriginalWithArgsTest('(2)', ['funkier']);


      it('Calls the original function with preserved execution context', function() {
        var exc;
        var f = objectCurry(function(x, y) {exc = this;});
        var g = function() {};
        var newFn = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);
        var args = ['a', 'b'];
        var obj = {};
        newFn.apply(obj, args);

        expect(exc).to.equal(obj);
      });


      var addReturnsOriginalsValueTest = function(message, f, args) {
        it('Returns the original function\'s return value ' + message, function() {
          var g = function() {};
          var newFn = isWrap ? fnUnderTest(g, g, f) : fnUnderTest(g, f);
          var result = newFn.apply(null, args);

          expect(result).to.equal(f.apply(null, args));
        });
      };


      addReturnsOriginalsValueTest('(1)', function(x, y) {return x + y;}, [1, 2]);
      addReturnsOriginalsValueTest('(2)', function(x, y) {return 42;}, [1, 2]);
    };


    var addCommonPreTests = function(fnUnderTest, isWrap) {
      isWrap = isWrap || false;


      var addCallsPreWithArgsTest = function(message, f, args) {
        it('Calls the pre function with the given arguments ' + message, function() {
          var preArgs = null;
          var pre = function(args) {preArgs = args;};
          var post = function() {};
          var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
          newFn.apply(null, args);

          expect(preArgs).to.deep.equal(args);
        });
      };


      addCallsPreWithArgsTest('(1)', function(x, y) {}, [1, 2]);
      addCallsPreWithArgsTest('(2)', function(x) {}, ['funkier']);


      it('Calls the pre function with preserved execution context', function() {
        var preExc;
        var pre = function() {preExc = this;};
        var post = function() {};
        var f = objectCurry(function() {});
        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
        var args = ['a', 'b'];
        var obj = {};
        newFn.apply(obj, args);

        expect(preExc).to.equal(obj);
      });


      it('Calls the pre function before the original function', function() {
        var origCalled = false;
        var preCalledBefore = false;

        var f = function() {origCalled = true;};
        var pre = function() {preCalledBefore = !origCalled;};
        var post = function() {};
        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(preCalledBefore).to.equal(true);
      });


      it('Disregards the fnUnderTest function\'s return value', function() {
        var f = function(x, y) {return x + y;};
        var pre = function() {return 42;};
        var post = function() {};
        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(pre, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.not.equal(pre.apply(null, args));
        expect(result).to.equal(f.apply(null, args));
      });
    };


    var preSpec = {
      name: 'pre',
      restrictions: [['function'], ['function']],
      validArguments: [[function() {}], [function() {}]]
    };


    checkFunction(preSpec, fn.pre, function(pre) {
      addCommonWrapTests(pre);
      addCommonPreTests(pre);
    });


    var addCommonPostTests = function(fnUnderTest, isWrap) {
      isWrap = isWrap || false;


      it('Calls the post function with preserved execution context', function() {
        var postExc;
        var post = function() {postExc = this;};
        var f = objectCurry(function() {});
        var pre = function() {};
        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
        var args = ['a', 'b'];
        var obj = {};
        newFn.apply(obj, args);

        expect(postExc).to.equal(obj);
      });


      it('Calls the post function after the original function', function() {
        var origCalled = false;
        var postCalledAfter = false;

        var f = function() {origCalled = true;};
        var pre = function() {};
        var post = function() {postCalledAfter = origCalled;};
        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(postCalledAfter).to.equal(true);
      });


      var addCallsPostWithArgsAndResultTest = function(message, f, args) {
        it('Calls the pre function with the given arguments ' + message, function() {
          var postArgs = null;
          var postResult = null;
          var post = function(args, result) {postArgs = args; postResult = result;};
          var pre = function() {};
          var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
          newFn.apply(null, args);

          expect(postArgs).to.deep.equal(args);
          expect(postResult).to.deep.equal(f.apply(null, args));
        });
      };


      addCallsPostWithArgsAndResultTest('(1)', function(x, y) {return x + y;}, [1, 2]);
      addCallsPostWithArgsAndResultTest('(2)', id, ['funkier']);


      it('Disregards the post function\'s return value', function() {
        var f = function(x, y) {return x + y;};
        var pre = function() {};
        var post = function() {return 42;};
        var newFn = isWrap ? fnUnderTest(pre, post, f) : fnUnderTest(post, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.not.equal(post.apply(null, [args, f.apply(null, args)]));
        expect(result).to.equal(f.apply(null, args));
      });
    };


    var postSpec = {
      name: 'post',
      restrictions: [['function'], ['function']],
      validArguments: [[function() {}], [function() {}]]
    };


    checkFunction(postSpec, fn.post, function(post) {
      addCommonWrapTests(post);
      addCommonPostTests(post);
    });


    var wrapSpec = {
      name: 'wrap',
      restrictions: [['function'], ['function'], ['function']],
      validArguments: [[function() {}], [function() {}], [function() {}]]
    };


    checkFunction(wrapSpec, fn.wrap, function(wrap) {
      addCommonWrapTests(wrap, true);
      addCommonPreTests(wrap, true);
      addCommonPostTests(wrap, true);
    });
  });
})();
