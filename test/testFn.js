(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var fn = require('../fn');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var checkArrayEquality = testUtils.checkArrayEquality;
    var getRealArity = base.getRealArity;


    describe('String exports', function() {
      var expectedFunctions = ['bindWithContext', 'bindWithContextAndArity',
                               'pre'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('fn.js exports \'' + f + '\' property', exportsProperty(fn, f));
        it('\'' + f + '\' property of fn.js is a function', exportsFunction(fn, f));
      });
    });


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
