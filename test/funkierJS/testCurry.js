(function() {
  "use strict";


  var expect = require('chai').expect;
  var curryModule = require('../../lib/components/curry');

  // Import utility functions
  var testUtils = require('./testingUtilities');
  var ANYVALUE = testUtils.ANYVALUE;
  var checkModule = testUtils.checkModule;
  var checkFunction = testUtils.checkFunction;


  var expectedObjects = [];
  var expectedFunctions = ['curry', 'curryWithArity', 'arityOf'];
  checkModule('curry', curryModule, expectedObjects, expectedFunctions);


  // The functions in this module are used in the tests for other functions. Pull them out now, to avoid an endless need to prefix
  var arityOf = curryModule.arityOf;
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;


  /*
   * Helper for generating tests examining the basic qualities that we want a curried function to have: it should
   * be a function of length 1, and for each possible way of invoking it, it should be extensionally equal to the
   * original function.
   *
   */

  var testCurriedFunction = function(curried, original, typicalArgs, message, expected) {
    expected = expected || original.apply(null, typicalArgs);

    it(message + ' is a function', function() {
      expect(curried).to.be.a('function');
    });


    it(message + ' has length 1', function() {
      expect(curried.length).to.equal(1);
    });


    it(message + (/arguments?$/.test(message) ? ' then' : '') +
       ' called with all available arguments equals original function\'s result', function() {
      expect(curried.apply(null, typicalArgs)).to.deep.equal(expected);
    });


    // Now to test the possible combinations. We stop recursing when we are down to the last argument
    for (var i = 0, l = typicalArgs.length - 1; i < l; i++) {
      var next = curried.apply(null, typicalArgs.slice(0, i + 1));
      var remainingArgs = typicalArgs.slice(i + 1);
      var newMessage = message + (message.slice(-('arguments'.length)) === 'arguments' ? ' and ' : '') +
                       ' then partially applied with ' + (i + 1) + ' argument' + (i > 0 ? 's' : '');
      testCurriedFunction(next, original, remainingArgs, newMessage, expected);
    }
  };


  var currySpec = {
    name: 'curry',
    arity: 1,
    restrictions: [['function']],
    validArguments: [ANYVALUE]
  };


  checkFunction(currySpec, curry, function(curry) {
    // We shall test curry with binary, ternary, and quarternary functions
    var testFuncs = [
      {f: function(a, b) {return a + b;}, args: [2, 3], message: 'Curried binary function'},
      {f: function(a, b, c) {return a * b * c;}, args: [4, 5, 6], message: 'Curried ternary function'},
      {f: function(a, b, c, d) {return a - b - c - d;}, args: [10, 9, 8, 7], message: 'Curried quarternary function'}
    ];


    testFuncs.forEach(function(testData) {
      var fn = testData.f;
      var args = testData.args;
      var message = testData.message;

      var curried = curry(fn);
      testCurriedFunction(curried, fn, args, message);
    });


    it('Underlying function called with specified argument count when invoked with superfluous arguments', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var curried = curry(f);
      var args = [1, 2, 4, 'a'];
      curried(args[0], args[1], args[2], args[3]);

      expect(invokedArgs).to.deep.equal(args.slice(0, f.length));
    });


    it('Currying a function of length 0 returns a function of length 0', function() {
      var f = function() {};
      var curried = curry(f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Currying a function of length 1 returns a function of length 1', function() {
      var f = function(x) {};
      var curried = curry(f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Previously curried function not recurried', function() {
      var f = curry(function(a, b) {});

      expect(curry(f)).to.equal(f);
    });


    it('Currying binds to null execution context (1)', function() {
      var f = curry(function(a, b) {return this;});
      var context = {f: f};
      var result = context.f(1, 2);

      expect(result).to.equal(null);
    });


    it('Currying binds to null execution context (2)', function() {
      var f = curry(function(a, b) {return this;});
      var context = {f: f};
      var result = context.f(1)(2);

      expect(result).to.equal(null);
    });


    it('Currying binds to null execution context (3)', function() {
      var f = curry(function() {return this;});
      var context = {f: f};
      var result = context.f();

      expect(result).to.equal(null);
    });


    it('Calling a curried function that expects no arguments does not throw', function() {
      var f = curry(function() {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.not.throw();
    });


    it('Calling a curried function that awaits further arguments with no arguments throws', function() {
      var f = curry(function(x) {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.throw();
    });
  });


  var curryWithAritySpec = {
    name: 'curryWithArity',
    restrictions: [['strictNatural'], ['function']],
    validArguments: [[1], [function() {}]]
  };


  checkFunction(curryWithAritySpec, curryModule.curryWithArity, function(curryWithArity) {
    var fromCharCodes = String.fromCharCode;


    it('Currying a function of length 0 to 0 returns a function of length 0', function() {
      var f = function() {};
      var curried = curryWithArity(0, f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Currying a function of length 1 to 1 returns a function of length 1', function() {
      var f = function(x) {};
      var curried = curryWithArity(1, f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Returns a function of length 1 when a function of length 0 is curried to a length > 0', function() {
      var f = function() {};
      var curried = curryWithArity(1, f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Returns a function of length 0 when a function of length > 0 is curried to length 0', function() {
      var f = function(a, b, c) {};
      var curried = curryWithArity(0, f);

      expect(arityOf(curried)).to.equal(0);
    });


    // curryWithArity was partly motivated by the need to handle ambiguous methods on standard global objects that
    // can accept more or less arguments than their reported length, possibly exhibiting different behaviour.
    // For example, Array.reduce has a standard mandated length of 1, but is normally called with 2 parameters.
    //
    // We use String.fromCharCode in our tests. String.fromCharCode accepts any number of parameters
    // and shouldn't depend on the equation this === String holding.
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
      testCurriedFunction(curried, fn, args, message);
    });


    it('Underlying function called with specified argument count when invoked with superfluous arguments', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var args = [1, 2, 4, 'a'];

      var curried = curryWithArity(2, f);
      curried(args[0], args[1], args[2], args[3]);

      expect(invokedArgs).to.deep.equal(args.slice(0, f.length));
    });


    it('Underlying function can be curried to a higher arity than its length', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var args = [1, 2, 4, 'a', null];

      var curried = curryWithArity(5, f);
      curried(args[0])(args[1])(args[2])(args[3])(args[4]);

      expect(invokedArgs).to.deep.equal(args);
    });


    it('Previously curried function not recurried to same arity (1)', function() {
      var f = curryWithArity(2, function(a, b) {});

      expect(curryWithArity(2, f)).to.equal(f);
    });


    it('Previously curried function not recurried to same arity (2)', function() {
      var f = curryWithArity(1, function(a, b) {});

      expect(curryWithArity(1, f)).to.equal(f);
    });


    it('Previously curried function not recurried to same arity (3)', function() {
      var f = curryWithArity(0, function(a, b) {});

      expect(curryWithArity(0, f)).to.equal(f);
    });


    it('Previously curried function not recurried to same arity (4)', function() {
      var f = curryWithArity(1, function(a) {});

      expect(curryWithArity(1, f)).to.equal(f);
    });


    it('Previously curried function not recurried to same arity (5)', function() {
      var f = curryWithArity(0, function() {});

      expect(curryWithArity(0, f)).to.equal(f);
    });


    it('Curried function bound to null execution context (1)', function() {
      var f = curryWithArity(1, function(a, b) { return this; });
      var context = {foo: 42, f: f};
      var result = context.f(1, 2);

      expect(result).to.equal(null);
    });


    it('Curried function bound to null execution context (2)', function() {
      var f = curryWithArity(3, function(a, b) {return this;});
      var context = {foo: 42, f: f};
      var result = context.f(1)(2)(3);

      expect(result).to.equal(null);
    });


    it('Curried function bound to null execution context (3)', function() {
      var f = curryWithArity(0, function() {return this;});
      var context = {foo: 42, f: f};
      var result = context.f(1, 2, 3);

      expect(result).to.equal(null);
    });


    it('Calling a curried function that expects no arguments does not throw', function() {
      var f = curryWithArity(0, function(x) {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.not.throw();
    });


    it('Calling a curried function awaiting further arguments without any arguments throws', function() {
      var f = curryWithArity(1, function() {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.throw();
    });


    it('Functions can be recurried when not partially applied (1)', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var args = [1, 'x', 4, 'a', null];

      var intermediate = curryWithArity(3, f);
      intermediate.apply(null, args);
      // Sanity check
      expect(invokedArgs).to.deep.equal(args.slice(0, 3));
      invokedArgs = [];
      var curried = curryWithArity(5, intermediate);
      curried(args[0])(args[1])(args[2])(args[3])(args[4]);

      expect(invokedArgs).to.deep.equal(args);
    });


    it('Functions can be recurried when not partially applied (2)', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var args = [1, 'x', 4, 'a', null];

      var intermediate = curry(f);
      intermediate.apply(null, args);
      // Sanity check
      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
      invokedArgs = [];
      var curried = curryWithArity(5, intermediate);
      curried(args[0])(args[1])(args[2])(args[3])(args[4]);

      expect(invokedArgs).to.deep.equal(args);
    });
  });


  var aritySpec = {
    name: 'arityOf',
    restrictions: [['function']],
    validArguments: ANYVALUE
  };


  checkFunction(aritySpec, curryModule.arityOf, function(arityOf) {
    it('Works correctly for an uncurried function (1)', function() {
      var fn = function() {};

      expect(arityOf(fn)).to.equal(fn.length);
    });


    it('Works correctly for an uncurried function (2)', function() {
      var fn = function(x) {};

      expect(arityOf(fn)).to.equal(fn.length);
    });


    it('Works correctly for an uncurried function (3)', function() {
      var fn = function(x, y) {};

      expect(arityOf(fn)).to.equal(fn.length);
    });


    /*
     * Although _isCurried is not part of the public API, other tests need to be sure it works correctly
     *
     */

    it('Recognises when a function is not curried (1)', function() {
      var fn = function() {};

      expect(arityOf._isCurried(fn)).to.equal(false);
    });


    it('Recognises when a function is not curried (2)', function() {
      var fn = function(x) {};

      expect(arityOf._isCurried(fn)).to.equal(false);
    });


    it('Recognises when a function is not curried (3)', function() {
      var fn = function(x, y) {};

      expect(arityOf._isCurried(fn)).to.equal(false);
    });


    it('Works correctly for a curried function (1)', function() {
      var fn = function(x, y) {};
      var curried = curry(fn);

      expect(arityOf(curried)).to.equal(fn.length);
    });


    it('Works correctly for a curried function (2)', function() {
      var fn = function(x, y) {};
      var curryTo = 0;
      var curried = curryWithArity(curryTo, fn);

      expect(arityOf(curried)).to.equal(curryTo);
    });


      it('Reports arguments outstanding for partially applied function (1)', function() {
        var fn = function(x, y, z) {};
        var curried = curry(fn);

        expect(arityOf(curried(1))).to.equal(fn.length - 1);
      });


      it('Reports arguments outstanding for partially applied function (2)', function() {
        var fn = function(x, y, z) {};
        var curried = curry(fn);

        expect(arityOf(curried(1)(1))).to.equal(fn.length - 2);
      });


      it('Reports arguments outstanding for partially applied function (3)', function() {
        var fn = function(x, y, z) {};
        var curried = curry(fn);

        expect(arityOf(curried(1, 1))).to.equal(fn.length - 2);
      });


    it('Recognises when a function is curried (1)', function() {
      var fn = curry(function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (2)', function() {
      var fn = curry(function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (3)', function() {
      var fn = curry(function(x, y) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (4)', function() {
      var fn = curry(function(x, y) {})(1);

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (5)', function() {
      var fn = curryWithArity(0, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (6)', function() {
      var fn = curryWithArity(1, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (7)', function() {
      var fn = curryWithArity(2, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (8)', function() {
      var fn = curryWithArity(2, function() {})(1);

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (9)', function() {
      var fn = curryWithArity(1, function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (10)', function() {
      var fn = curryWithArity(0, function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (11)', function() {
      var fn = curryWithArity(2, function(x, y) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (12)', function() {
      var fn = curryWithArity(2, function(x, y) {})(1);

      expect(arityOf._isCurried(fn)).to.equal(true);
    });
  });
})();
