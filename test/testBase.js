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
      var expectedFunctions = ['curry'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('base.js exports \'' + f + '\' property', exportsProperty(base, f));
        it('\'' + f + '\' property of base.js is a function', exportsFunction(base, f));
      });
    });


    describe('curry', function() {
      var curry = base.curry;

      it('curry returns a function of length 0 unharmed', function() {
        var f = function() {};
        var curried = curry(f);
        expect(curried).to.equal(f);
      });


      it('curry returns a function of length 1 unharmed', function() {
        var f = function(x) {return x;};
        var curried = curry(f);
        expect(curried).to.equal(f);
      });


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


      it('Curried function called with anticipated arguments when called with more than required', function() {
        var f = function(a, b) {f.args = [].slice.call(arguments);};
        f.args = null;
        var curried = curry(f);
        var args = [1, 2, 4, 'a'];
        curried(args[0], args[1], args[2], args[3]);
        expect(f.args).to.deep.equal(args.slice(0, f.length));
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
