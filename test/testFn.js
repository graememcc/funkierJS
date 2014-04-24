(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var fn = require('../fn');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var getRealArity = base.getRealArity;


    var expectedObjects = [];
    var expectedFunctions = ['bindWithContext', 'bindWithContextAndArity',
                             'pre', 'post', 'wrap', 'fixpoint'];
    describeModule('fn', fn, expectedObjects, expectedFunctions);


    describe('bindWithContext', function() {
      var bindWithContext = fn.bindWithContext;


      it('Has correct arity', function() {
        expect(getRealArity(bindWithContext)).to.equal(2);
      });


      it('Returns a function', function() {
        var f = function() {};
        var obj = {};
        var result = bindWithContext(obj, f);

        expect(result).to.be.a('function');
      });


      it('Returned function has correct arity (1)', function() {
        var f = function() {};
        var obj = {};
        var result = bindWithContext(obj, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Returned function has correct arity (2)', function() {
        var f = function(x, y) {};
        var obj = {};
        var result = bindWithContext(obj, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Binds to context', function() {
        var f = function() {return this;};
        var obj = {};
        var result = bindWithContext(obj, f)();

        expect(result).to.equal(obj);
      });


      // If necessary, the returned function should be curried
      var f1 = function(x, y) {return x + y + this.foo};
      var obj1 = {foo: 6};
      var result = bindWithContext(obj1, f1);
      testCurriedFunction('bindWithContext bound function', result, [1, 2]);


      // bindWithContext should be curried
      var f2 = function(x) {return x + this.foo};
      var obj2 = {foo: 5};
      testCurriedFunction('bindWithContext', bindWithContext, {firstArgs: [obj2, f2], thenArgs: [2]});
    });


    describe('bindWithContextAndArity', function() {
      var bindWithContextAndArity = fn.bindWithContextAndArity;


      it('Has correct arity', function() {
        expect(getRealArity(bindWithContextAndArity)).to.equal(3);
      });


      it('Returns a function', function() {
        var f = function() {};
        var obj = {};
        var result = bindWithContextAndArity(obj, 0, f);

        expect(result).to.be.a('function');
      });


      it('Returned function has correct arity (1)', function() {
        var f = function() {};
        var obj = {};
        var arity = 0;
        var result = bindWithContextAndArity(obj, arity, f);

        expect(getRealArity(result)).to.equal(arity);
      });


      it('Returned function has correct arity (2)', function() {
        var f = function() {};
        var obj = {};
        var arity = 1;
        var result = bindWithContextAndArity(obj, arity, f);

        expect(getRealArity(result)).to.equal(arity);
      });


      it('Returned function has correct arity (3)', function() {
        var f = function(x, y) {};
        var obj = {};
        var arity = 3;
        var result = bindWithContextAndArity(obj, arity, f);

        expect(getRealArity(result)).to.equal(arity);
      });


      it('Binds to context', function() {
        var f = function() {return this;};
        var obj = {};
        var arity = 0;
        var result = bindWithContextAndArity(obj, arity, f)();

        expect(result).to.equal(obj);
      });


      // If necessary, the returned function should be curried
      var f1 = function(x, y, z) {return x + y + this.foo};
      var obj1 = {foo: 6};
      var arity1 = 2;
      var result = bindWithContextAndArity(obj1, arity1, f1);
      testCurriedFunction('bindWithContextAndArity bound function', result, [1, 2]);


      // bindWithContextAndArity should be curried
      var f2 = function(x) {return x + this.foo};
      var obj2 = {foo: 5};
      var arity2 = 1;
      testCurriedFunction('bindWithContextAndArity', bindWithContextAndArity, {firstArgs: [obj2, arity2, f2], thenArgs: [2]});
    });


    describe('pre', function() {
      var pre = fn.pre;


      it('Has correct arity', function() {
        expect(getRealArity(pre)).to.equal(2);
      });


      it('Returns a function', function() {
        var f = function() {};
        var g = function() {};
        var result = pre(g, f);

        expect(result).to.be.a('function');
      });


      it('Returns a function with the correct arity (1)', function() {
        var f = function() {};
        var g = function() {};
        var result = pre(g, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Returns a function with the correct arity (2)', function() {
        var f = function(x) {};
        var g = function() {};
        var result = pre(g, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Returns a function with the correct arity (3)', function() {
        var f = function(x, y) {};
        var g = function() {};
        var result = pre(g, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Calls the pre function with the given arguments (1)', function() {
        var f = function(x, y) {};
        var g = function(args) {g.args = args;};
        g.args = null;
        var newFn = pre(g, f);
        var args = [1, 2];
        newFn.apply(null, args);

        expect(g.args).to.deep.equal(args);
      });


      it('Calls the pre function with the given arguments (2)', function() {
        var f = function(x) {};
        var g = function(args) {g.args = args;};
        g.args = null;
        var newFn = pre(g, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(g.args).to.deep.equal(args);
      });


      it('Calls the original function with the given arguments (1)', function() {
        var f = function(x, y) {f.args = [].slice.call(arguments);};
        f.args = null;
        var g = function() {};
        var newFn = pre(g, f);
        var args = [1, 2];
        newFn.apply(null, args);

        expect(f.args).to.deep.equal(args);
      });


      it('Calls the original function with the given arguments (2)', function() {
        var f = function(x) {f.args = [].slice.call(arguments);};
        f.args = null;
        var g = function() {};
        var newFn = pre(g, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(f.args).to.deep.equal(args);
      });


      it('Calls the original function with null execution context', function() {
        var f = function(x, y) {f.exc = this;};
        f.exc = undefined;
        var g = function() {};
        var newFn = pre(g, f);
        var args = ['a', 'b'];
        newFn.apply({}, args);

        expect(f.exc === null).to.be.true;
      });


      it('Calls the pre function before the original function', function() {
        var f = function() {f.called = true;};
        f.called = false;
        var g = function() {g.calledBefore = !f.called;};
        g.calledBefore = false;
        var newFn = pre(g, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(g.calledBefore).to.be.true;
      });


      it('Returns the original function\'s return value (1)', function() {
        var f = function(x, y) {return 42;};
        f.args = null;
        var g = function() {};
        var newFn = pre(g, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.equal(f.apply(null, args));
      });


      it('Returns the original function\'s return value (2)', function() {
        var f = function(x, y) {return x + y;};
        f.args = null;
        var g = function() {};
        var newFn = pre(g, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.equal(f.apply(null, args));
      });


      it('Disregards the pre function\'s return value', function() {
        var f = function(x, y) {return x + y;};
        var g = function() {return 42;};
        var newFn = pre(g, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.not.equal(g.apply(null, args));
        expect(result).to.equal(f.apply(null, args));
      });


      var g = function() {};
      var f = function(x) {return x;};
      testCurriedFunction('pre', pre, {firstArgs: [g, f], thenArgs: [1]});
    });


    describe('post', function() {
      var post = fn.post;


      it('Has correct arity', function() {
        expect(getRealArity(post)).to.equal(2);
      });


      it('Returns a function', function() {
        var f = function() {};
        var g = function() {};
        var result = post(g, f);

        expect(result).to.be.a('function');
      });


      it('Returns a function with the correct arity (1)', function() {
        var f = function() {};
        var g = function() {};
        var result = post(g, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Returns a function with the correct arity (2)', function() {
        var f = function(x) {};
        var g = function() {};
        var result = post(g, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Returns a function with the correct arity (3)', function() {
        var f = function(x, y) {};
        var g = function() {};
        var result = post(g, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Calls the original function with the given arguments (1)', function() {
        var f = function(x, y) {f.args = [].slice.call(arguments);};
        f.args = null;
        var g = function() {};
        var newFn = post(g, f);
        var args = [1, 2];
        newFn.apply(null, args);

        expect(f.args).to.deep.equal(args);
      });


      it('Calls the original function with the given arguments (2)', function() {
        var f = function(x) {f.args = [].slice.call(arguments);};
        f.args = null;
        var g = function() {};
        var newFn = post(g, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(f.args).to.deep.equal(args);
      });


      it('Calls the original function with null execution context', function() {
        var f = function(x, y) {f.exc = this;};
        f.exc = undefined;
        var g = function() {};
        var newFn = post(g, f);
        var args = ['a', 'b'];
        newFn.apply({}, args);

        expect(f.exc === null).to.be.true;
      });


      it('Calls the post function after the original function', function() {
        var f = function() {f.called = true;};
        f.called = false;
        var g = function() {g.calledAfter = f.called;};
        g.calledAfter = false;
        var newFn = post(g, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(g.calledAfter).to.be.true;
      });


      it('Calls the post function with the given arguments and result(1)', function() {
        var f = function(x, y) {return 42;};
        var g = function(args, result) {g.args = args; g.result = result;};
        g.args = null;
        g.result = null;
        var newFn = post(g, f);
        var args = [1, 2];
        newFn.apply(null, args);

        expect(g.args).to.deep.equal(args);
        expect(g.result).to.deep.equal(f.apply(null, args));
      });


      it('Calls the post function with the given arguments and result(2)', function() {
        var f = function(x) {return x;};
        var g = function(args, result) {g.args = args; g.result = result;};
        g.args = null;
        g.result = null;
        var newFn = post(g, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(g.args).to.deep.equal(args);
        expect(g.result).to.deep.equal(f.apply(null, args));
      });


      it('Returns the original function\'s return value (1)', function() {
        var f = function(x, y) {return 42;};
        f.args = null;
        var g = function() {};
        var newFn = post(g, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.equal(f.apply(null, args));
      });


      it('Returns the original function\'s return value (2)', function() {
        var f = function(x, y) {return x + y;};
        f.args = null;
        var g = function() {};
        var newFn = post(g, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.equal(f.apply(null, args));
      });


      it('Disregards the post function\'s return value', function() {
        var f = function(x, y) {return x + y;};
        var g = function() {return 42;};
        var newFn = post(g, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.not.equal(g.apply(null, [args, f.apply(null, args)]));
        expect(result).to.equal(f.apply(null, args));
      });


      var g = function() {};
      var f = function(x) {return x;};
      testCurriedFunction('post', post, {firstArgs: [g, f], thenArgs: [1]});
    });


    describe('wrap', function() {
      var wrap = fn.wrap;


      it('Has correct arity', function() {
        expect(getRealArity(wrap)).to.equal(3);
      });


      it('Returns a function', function() {
        var f = function() {};
        var pre = function() {};
        var post = function() {};
        var result = wrap(pre, post, f);

        expect(result).to.be.a('function');
      });


      it('Returns a function with the correct arity (1)', function() {
        var f = function() {};
        var pre = function() {};
        var post = function() {};
        var result = wrap(pre, post, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Returns a function with the correct arity (2)', function() {
        var f = function(x) {};
        var pre = function() {};
        var post = function() {};
        var result = wrap(pre, post, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Returns a function with the correct arity (3)', function() {
        var f = function(x, y) {};
        var pre = function() {};
        var post = function() {};
        var result = wrap(pre, post, f);

        expect(getRealArity(result)).to.equal(f.length);
      });


      it('Calls the pre function with the given arguments (1)', function() {
        var f = function(x, y) {};
        var pre = function(arpres) {pre.args = args;};
        var post = function() {};
        pre.args = null;
        var newFn = wrap(pre, post, f);
        var args = [1, 2];
        newFn.apply(null, args);

        expect(pre.args).to.deep.equal(args);
      });


      it('Calls the pre function with the given arguments (2)', function() {
        var f = function(x) {};
        var pre = function(arpres) {pre.args = args;};
        var post = function() {};
        pre.args = null;
        var newFn = wrap(pre, post, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(pre.args).to.deep.equal(args);
      });


      it('Calls the original function with the given arguments (1)', function() {
        var f = function(x, y) {f.args = [].slice.call(arguments);};
        var pre = function() {};
        var post = function() {};
        var newFn = wrap(pre, post, f);
        var args = [1, 2];
        newFn.apply(null, args);

        expect(f.args).to.deep.equal(args);
      });


      it('Calls the original function with the given arguments (2)', function() {
        var f = function(x) {f.args = [].slice.call(arguments);};
        f.args = null;
        var g = function() {};
        var pre = function() {};
        var post = function() {};
        var newFn = wrap(pre, post, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(f.args).to.deep.equal(args);
      });


      it('Calls the original function with null execution context', function() {
        var f = function(x, y) {f.exc = this;};
        f.exc = undefined;
        var pre = function() {};
        var post = function() {};
        var newFn = wrap(pre, post, f);
        var args = ['a', 'b'];
        newFn.apply({}, args);

        expect(f.exc === null).to.be.true;
      });


      it('Calls the pre function before the original function', function() {
        var f = function() {f.called = true;};
        f.called = false;
        var pre = function() {pre.calledBefore = !f.called;};
        pre.calledBefore = false;
        var post = function() {};
        var newFn = wrap(pre, post, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(pre.calledBefore).to.be.true;
      });


      it('Calls the post function after the original function', function() {
        var f = function() {f.called = true;};
        f.called = false;
        var pre = function() {};
        var post = function() {post.calledAfter = f.called;};
        post.calledAfter = false;
        var newFn = wrap(pre, post, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(post.calledAfter).to.be.true;
      });


      it('Calls the post function with the given arguments and result(1)', function() {
        var f = function(x, y) {return 42;};
        var post = function(args, result) {post.args = args; post.result = result;};
        post.args = null;
        post.result = null;
        var pre = function() {};
        var newFn = wrap(pre, post, f);
        var args = [1, 2];
        newFn.apply(null, args);

        expect(post.args).to.deep.equal(args);
        expect(post.result).to.deep.equal(f.apply(null, args));
      });


      it('Calls the post function with the given arguments and result(2)', function() {
        var f = function(x) {return 42;};
        var post = function(args, result) {post.args = args; post.result = result;};
        post.args = null;
        post.result = null;
        var pre = function() {};
        var newFn = wrap(pre, post, f);
        var args = ['funkier'];
        newFn.apply(null, args);

        expect(post.args).to.deep.equal(args);
        expect(post.result).to.deep.equal(f.apply(null, args));
      });


      it('Returns the original function\'s return value (1)', function() {
        var f = function(x, y) {return 42;};
        f.args = null;
        var pre = function() {};
        var post = function() {};
        var newFn = wrap(pre, post, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.equal(f.apply(null, args));
      });


      it('Returns the original function\'s return value (2)', function() {
        var f = function(x, y) {return x + y;};
        f.args = null;
        var pre = function() {};
        var post = function() {};
        var newFn = wrap(pre, post, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.equal(f.apply(null, args));
      });


      it('Disregards the pre function\'s return value', function() {
        var f = function(x, y) {return x + y;};
        var pre = function() {return 42;};
        var post = function() {};
        var newFn = wrap(pre, post, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.not.equal(pre.apply(null, args));
        expect(result).to.equal(f.apply(null, args));
      });


      it('Disregards the post function\'s return value', function() {
        var f = function(x, y) {return x + y;};
        var pre = function() {};
        var post = function() {return 42;};
        var newFn = wrap(pre, post, f);
        var args = [1, 2];
        var result = newFn.apply(null, args);

        expect(result).to.not.equal(post.apply(null, [args, f.apply(null, args)]));
        expect(result).to.equal(f.apply(null, args));
      });


      var pre = function() {};
      var post = function() {};
      var f = function(x) {return x;};
      testCurriedFunction('wrap', wrap, {firstArgs: [pre, post, f], thenArgs: [1]});
    });


    describe('fixpoint', function() {
      var fixpoint = fn.fixpoint;


      it('Has correct arity', function() {
        expect(getRealArity(fixpoint)).to.equal(2);
      });


      it('Throws if function does not have arity 1 (1)', function() {
        var f = function() {};
        var fn = function() {
          fixpoint(1, f);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws if function does not have arity 1 (2)', function() {
        var f = function(x, y) {};
        var fn = function() {
          fixpoint(1, f);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Does not throw if function has arity 1 (1)', function() {
        var f = function(x) {return 1;};
        var fn = function() {
          fixpoint(1, f);
        };

        expect(fn).to.not.throw(TypeError);
      });


      it('Does not throw if function has arity 1 (2)', function() {
        var f = base.curry(function(x, y) {return y;})(42);
        var fn = function() {
          fixpoint(1, f);
        };

        expect(fn).to.not.throw(TypeError);
      });


      it('Calls function', function() {
        var f = function(a) {f.called = true; return 1;};
        f.called = false;
        fixpoint([], f);

        expect(f.called).to.be.true;
      });


      it('Calls function with given arguments', function() {
        var f = function(a) {f.args = [].slice.call(arguments); return 1;};
        f.args = null;
        var args = 1;
        fixpoint(args, f);

        expect(f.args).to.deep.equal([args]);
      });


      it('Throws after 1000 calls', function() {
        var f = function(a) {return f.called++;};
        f.called = 0;
        var args = 1;
        var fn = function() {
          fixpoint(args, f);
        };

        expect(fn).to.throw(Error);
        expect(f.called).to.equal(1000);
      });


      var makeReturnAfterThresholdTest = function(threshold, value1, value2) {
        // The optional value2 parameter allows us to test by returning deep
        // equal but not identical values
        value2 = value2 || value1;

        return function() {
          var f = function(a) {
            f.called++;

            // Return the first object
            if (f.called === threshold + 1)
              return value1;

            // This should trigger the end of the function
            if (f.called === threshold + 2)
              return value2;

            // return something unique before threshold, and once we've returned
            // the two similar objects. Hope Math.random() is random enough!
            return Math.random();
          };
          f.called = 0;
          var result = fixpoint('a', f);

          expect(f.called).to.be.lessThan(1000);
          expect(result).to.deep.equal(value2);
        };
      };


      var simpleTests = [
        {name: 'number', value: 1},
        {name: 'string', value: 'a'},
        {name: 'boolean', value: true},
        {name: 'undefined', value: undefined},
        {name: 'null', value: null},
        {name: 'function', value: function() {}}];


      simpleTests.forEach(function(test, i) {
        var name = test.name;
        var value = test.value;

        it('Works correctly for return value of type ' + name,
           makeReturnAfterThresholdTest(i + 1, value));
      });


      var obj1 = {foo: 1, bar: {baz: 2}};
      var obj2 = {foo: 1, bar: {baz: 2}};
      it('Works correctly for objects (1)', makeReturnAfterThresholdTest(3, obj1, obj1));
      it('Works correctly for objects (2)', makeReturnAfterThresholdTest(3, obj1, obj2));

      var arr1 = [1, [2]];
      var arr2 = [1, [2]];
      it('Works correctly for arrays (1)', makeReturnAfterThresholdTest(3, arr1, arr1));
      it('Works correctly for arrays (2)', makeReturnAfterThresholdTest(3, arr2, arr2));


      it('Not fooled by null followed by an object', function() {
        var obj1 = {foo: 2};
        var obj2 = {foo: 3};

        var f = function(a) {
          f.called++;

          if (f.called === 1)
            return null;

          // We shouldn't get obj1
          if (f.called === 2)
            return obj1;

          return obj2;
        };
        f.called = 0;
        var result = fixpoint(42, f);

        expect(f.called).to.be.lessThan(1000);
        expect(result).to.not.equal(obj1);
        expect(result).to.equal(obj2);
      });


      testCurriedFunction('fixpoint', fixpoint, [1, Math.cos]);
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
