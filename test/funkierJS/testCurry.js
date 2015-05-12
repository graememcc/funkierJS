//(function() {
//  "use strict";
//
//
//  var testFixture = function(require, exports) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var curryModule = require('../../curry');
//
//    // Import utility functions
//    var testUtils = require('./testUtils');
//    var describeModule = testUtils.describeModule;
//    var describeFunction = testUtils.describeFunction;
//    var testCurriedFunction = testUtils.testCurriedFunction;
//
//
//    var expectedObjects = [];
//    var expectedFunctions = ['curry', 'curryWithArity', 'getRealArity'];
//    describeModule('curry', curryModule, expectedObjects, expectedFunctions);
//
//
//    // Many of the tests use curry, id and getRealArity: let's pull them out for convenience
//    var curry = curryModule.curry;
//    var getRealArity = curryModule.getRealArity;
//
//
//    var currySpec = {
//      name: 'curry',
//      arity: 1,
//      restrictions: [['function']],
//      validArguments: [[function() {}]]
//    };
//
//
//    describeFunction(currySpec, curry, function(curry) {
//      // We shall test curry with binary, ternary, and quarternary functions
//      var testFuncs = [
//        {f: function(a, b) {return a + b;}, args: [2, 3], message: 'Curried binary function'},
//        {f: function(a, b, c) {return a * b * c;}, args: [4, 5, 6], message: 'Curried ternary function'},
//        {f: function(a, b, c, d) {return a - b - c - d;}, args: [10, 9, 8, 7], message: 'Curried quarternary function'}
//      ];
//
//
//      testFuncs.forEach(function(testData) {
//        var fn = testData.f;
//        var args = testData.args;
//        var message = testData.message;
//
//        var curried = curry(fn);
//        testCurriedFunction(curried, args, {original: fn, message: message});
//      });
//
//
//      it('Underlying function called with anticipated arguments when curried function called with superfluous arguments', function() {
//        var fArgs = [];
//        var f = function(a, b) {fArgs = [].slice.call(arguments);};
//        var curried = curry(f);
//        var args = [1, 2, 4, 'a'];
//        // Lack of assignment here is deliberate: we are interested in the side effect
//        curried(args[0], args[1], args[2], args[3]);
//
//        expect(fArgs).to.deep.equal(args.slice(0, f.length));
//      });
//
//
//      it('Currying a function of length 0 returns a function of length 0', function() {
//        var f = function() {};
//        var curried = curry(f);
//
//        expect(getRealArity(curried)).to.equal(0);
//      });
//
//
//      it('Currying a function of length 1 returns a function of length 1', function() {
//        var f = function(x) {};
//        var curried = curry(f);
//
//        expect(getRealArity(curried)).to.equal(1);
//      });
//
//
//      it('Previously curried function not recurried', function() {
//        var f = curry(function(a, b) {});
//
//        expect(curry(f)).to.equal(f);
//      });
//
//
//      it('Currying preserves execution context (1)', function() {
//        var f = curry(function(a, b) {return this;});
//        var context = {f: f};
//        var result = context.f(1, 2);
//
//        expect(result).to.equal(context);
//      });
//
//
//      it('Currying preserves execution context (2)', function() {
//        var f = curry(function(a, b) {return this;});
//        var context = {f: f};
//        var result = context.f(1)(2);
//
//        expect(result).to.equal(context);
//      });
//
//
//      it('Currying preserves execution context (3)', function() {
//        var f = curry(function() {return this;});
//        var context = {f: f};
//        var result = context.f();
//
//        expect(result).to.equal(context);
//      });
//
//
//      it('Calling a curried function that expects no arguments does not throw', function() {
//        var f = curry(function() {return 42;});
//        var fn = function() {
//          f();
//        };
//
//        expect(f).to.not.throw(TypeError);
//      });
//
//
//      it('Calling a curried function that awaits further arguments with no arguments throws', function() {
//        var f = curry(function(x) {return 42;});
//        var fn = function() {
//          f();
//        };
//
//        expect(f).to.throw(TypeError);
//      });
//    });
//
//
//    var curryWithAritySpec = {
//      name: 'curryWithArity',
//      arity: 2,
//      restrictions: [['positive'], ['function']],
//      validArguments: [[1], [function() {}]]
//    };
//
//
//    describeFunction(curryWithAritySpec, curryModule.curryWithArity, function(curryWithArity) {
//      var fromCharCodes = String.fromCharCode;
//
//
//      it('Currying a function of length 0 to 0 returns a function of length 0', function() {
//        var f = function() {};
//        var curried = curryWithArity(0, f);
//
//        expect(getRealArity(curried)).to.equal(0);
//      });
//
//
//      it('Currying a function of length 1 to 1 returns a function of length 1', function() {
//        var f = function(x) {};
//        var curried = curryWithArity(1, f);
//
//        expect(getRealArity(curried)).to.equal(1);
//      });
//
//
//      it('Returns a function of length 1 when a function of length 0 is curried to a length > 0', function() {
//        var f = function() {};
//        var curried = curryWithArity(1, f);
//
//        expect(getRealArity(curried)).to.equal(1);
//      });
//
//
//      it('Returns a function of length 0 when a function of length > 0 is curried to length 0', function() {
//        var f = function(a, b, c) {};
//        var curried = curryWithArity(0, f);
//
//        expect(getRealArity(curried)).to.equal(0);
//      });
//
//
//      // One of the motivating ideas of curryWithArity relates to methods of standard objects
//      // that have a given length, but accept fewer or more arguments.
//      // For example, Array.reduce has a standard mandated length of 1, but is normally
//      // called with 2 parameters.
//      //
//      // We use String.fromCharCode in our tests. String.fromCharCode accepts any number of parameters
//      // and shouldn't depend on this === String
//      it('Sanity check: String.fromCharCode has length 1', function() {
//        expect(String.fromCharCode.length).to.equal(1);
//      });
//
//
//      it('Sanity check: String.fromCharCode can be called without an execution context', function() {
//        var code = 65;
//        var fn = function() {
//          return fromCharCodes(code);
//        };
//
//        expect(fn).to.not.throw(Error);
//        expect(fn()).to.equal(String.fromCharCode(code));
//      });
//
//
//      // We shall test curryWithArity with binary, and ternary versions
//      var testFuncs = [
//        {f: fromCharCodes, args: [65, 66], message: 'Arbitrary length function curried as a binary function'},
//        {f: fromCharCodes, args: [65, 66, 67], message: 'Arbitrary length function curried as a ternary function'}
//      ];
//
//
//      testFuncs.forEach(function(testData) {
//        var fn = testData.f;
//        var args = testData.args;
//        var message = testData.message;
//        var curried = curryWithArity(args.length, fn);
//
//        testCurriedFunction(curried, args, {original: fn, message: message});
//      });
//
//
//      it('Underlying function called with anticipated arguments when curried function called with superfluous arguments', function() {
//        var fArgs = [];
//        var f = function(a, b) {fArgs = [].slice.call(arguments);};
//        var curried = curryWithArity(2, f);
//        var args = [1, 2, 4, 'a'];
//        // Lack of assignment here is deliberate: we are interested in the side effect
//        curried(args[0], args[1], args[2], args[3]);
//
//        expect(fArgs).to.deep.equal(args.slice(0, f.length));
//      });
//
//
//      it('Underlying function can be curried with more arguments than underlying function length', function() {
//        var fArgs = [];
//        var f = function(a, b) {fArgs = [].slice.call(arguments);};
//        var curried = curryWithArity(5, f);
//        var args = [1, 2, 4, 'a', null];
//        // Lack of assignment here is deliberate: we are interested in the side effect
//        curried(args[0])(args[1])(args[2])(args[3])(args[4]);
//
//        expect(fArgs).to.deep.equal(args);
//      });
//
//
//      it('Previously curried function not recurried (1)', function() {
//        var f = curryWithArity(2, function(a, b) {});
//
//        expect(curryWithArity(2, f)).to.equal(f);
//      });
//
//
//      it('Previously curried function not recurried (2)', function() {
//        var f = curryWithArity(1, function(a, b) {});
//
//        expect(curryWithArity(1, f)).to.equal(f);
//      });
//
//
//      it('Currying preserves execution context (1)', function() {
//        var f = curryWithArity(1, function(a, b) {return this;});
//        var context = {f: f};
//        var result = context.f(1, 2);
//
//        expect(result).to.equal(context);
//      });
//
//
//      it('Currying preserves execution context (2)', function() {
//        var f = curryWithArity(3, function(a, b) {return this;});
//        var context = {f: f};
//        var result = context.f(1)(2)(3);
//
//        expect(result).to.equal(context);
//      });
//
//
//      it('Currying preserves execution context (3)', function() {
//        var f = curryWithArity(0, function(a, b) {return this;});
//        var context = {f: f};
//        var result = context.f();
//
//        expect(result).to.equal(context);
//      });
//
//
//      it('Calling a curried function that expects no arguments does not throw', function() {
//        var f = curryWithArity(0, function(x) {return 42;});
//        var fn = function() {
//          f();
//        };
//
//        expect(f).to.not.throw(TypeError);
//      });
//
//
//      it('Calling a curried function that awaits further arguments with no arguments throws', function() {
//        var f = curryWithArity(1, function() {return 42;});
//        var fn = function() {
//          f();
//        };
//
//        expect(f).to.throw(TypeError);
//      });
//
//
//      // curryWithArity should itself be curried
//      var fn = function(a, b) {return a + b;};
//      var args = {firstArgs: [fn.length, fn], thenArgs: [41, 1]};
//      testCurriedFunction(curryWithArity, args);
//    });
//
//
//    // We can't use describeFunction for getRealArity, as describeFunction uses it
//    describe('getRealArity', function() {
//      var getRealArity = curryModule.getRealArity;
//      var curryWithArity = curryModule.curryWithArity;
//
//
//      it('Works correctly for an uncurried function (1)', function() {
//        var fn = function() {};
//
//        expect(getRealArity(fn)).to.equal(fn.length);
//      });
//
//
//      it('Works correctly for an uncurried function (2)', function() {
//        var fn = function(x, y) {};
//
//        expect(getRealArity(fn)).to.equal(fn.length);
//      });
//
//
//      it('Works correctly for a curried function (1)', function() {
//        var fn = function(x, y) {};
//        var curried = curry(fn);
//
//        expect(getRealArity(curried)).to.equal(fn.length);
//      });
//
//
//      it('Works correctly for a curried function (2)', function() {
//        var fn = function(x, y) {};
//        var curryTo = 0;
//        var curried = curryWithArity(curryTo, fn);
//
//        expect(getRealArity(curried)).to.equal(curryTo);
//      });
//
//
//      it('Reports arguments outstanding for partially applied function (1)', function() {
//        var fn = function(x, y, z) {};
//        var curried = curry(fn);
//
//        expect(getRealArity(curried(1))).to.equal(fn.length - 1);
//      });
//
//
//      it('Reports arguments outstanding for partially applied function (2)', function() {
//        var fn = function(x, y, z) {};
//        var curried = curry(fn);
//
//        expect(getRealArity(curried(1)(1))).to.equal(fn.length - 2);
//      });
//
//
//      it('Reports arguments outstanding for partially applied function (3)', function() {
//        var fn = function(x, y, z) {};
//        var curried = curry(fn);
//
//        expect(getRealArity(curried(1, 1))).to.equal(fn.length - 2);
//      });
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
