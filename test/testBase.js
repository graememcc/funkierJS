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
      var expectedFunctions = ['curry', 'curryWithArity'];

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
