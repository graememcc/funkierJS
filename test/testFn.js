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
      var expectedFunctions = ['bindWithContext', 'bindWithContextAndArity'];

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