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
  var expectedFunctions = ['arityOf', 'bind', 'bindWithContextAndArity', 'curry', 'curryWithArity', 'objectCurry',
                           'objectCurryWithArity'];
  checkModule('curry', curryModule, expectedObjects, expectedFunctions);


  // The functions in this module are used in the tests for other functions. Pull them out now, to avoid an endless need to prefix
  var arityOf = curryModule.arityOf;
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var bind = curryModule.bind;
  var bindWithContextAndArity = curryModule.bindWithContextAndArity;
  var objectCurry = curryModule.objectCurry;
  var objectCurryWithArity = curryModule.objectCurryWithArity;


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


    it('Works correctly for a curried function (3)', function() {
      var fn = function(x, y) {};
      var curried = bind({}, fn);

      expect(arityOf(curried)).to.equal(fn.length);
    });


    it('Works correctly for a curried function (4)', function() {
      var fn = function(x, y) {};
      var curryTo = 1;
      var curried = bindWithContextAndArity(curryTo, {}, fn);

      expect(arityOf(curried)).to.equal(curryTo);
    });


    it('Works correctly for a curried function (5)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y) {};
      proto.curried = objectCurry(fn);

      expect(arityOf(proto.curried)).to.equal(fn.length);
    });


    it('Works correctly for a curried function (6)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y) {};
      var curryTo = 1;
      proto.curried = objectCurryWithArity(curryTo, fn);

      expect(arityOf(proto.curried)).to.equal(curryTo);
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


    it('Reports arguments outstanding for partially applied function (4)', function() {
      var fn = function(x, y) {};
      var curried = curryWithArity(3, fn);

      expect(arityOf(curried(1))).to.equal(2);
    });


    it('Reports arguments outstanding for partially applied function (5)', function() {
      var fn = function(x, y) {};
      var curried = curryWithArity(3, fn);

      expect(arityOf(curried(1)(1))).to.equal(1);
    });


    it('Reports arguments outstanding for partially applied function (6)', function() {
      var fn = function(x, y) {};
      var curried = curryWithArity(3, fn);

      expect(arityOf(curried(1, 1))).to.equal(1);
    });


    it('Reports arguments outstanding for partially applied function (7)', function() {
      var fn = function(x, y, z) {};
      var curried = bind({}, fn);

      expect(arityOf(curried(1))).to.equal(fn.length - 1);
    });


    it('Reports arguments outstanding for partially applied function (8)', function() {
      var fn = function(x, y, z) {};
      var curried = bind({}, fn);

      expect(arityOf(curried(1)(1))).to.equal(fn.length - 2);
    });


    it('Reports arguments outstanding for partially applied function (9)', function() {
      var fn = function(x, y, z) {};
      var curried = bind({}, fn);

      expect(arityOf(curried(1, 1))).to.equal(fn.length - 2);
    });


    it('Reports arguments outstanding for partially applied function (10)', function() {
      var fn = function(x, y) {};
      var curried = bindWithContextAndArity(3, {}, fn);

      expect(arityOf(curried(1))).to.equal(2);
    });


    it('Reports arguments outstanding for partially applied function (11)', function() {
      var fn = function(x, y) {};
      var curried = bindWithContextAndArity(3, {}, fn);

      expect(arityOf(curried(1)(1))).to.equal(1);
    });


    it('Reports arguments outstanding for partially applied function (12)', function() {
      var fn = function(x, y) {};
      var curried = bindWithContextAndArity(3, {}, fn);

      expect(arityOf(curried(1, 1))).to.equal(1);
    });


    it('Reports arguments outstanding for partially applied function (13)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y, z) {};
      proto.curried = objectCurry(fn);

      expect(arityOf(obj.curried(1))).to.equal(2);
    });


    it('Reports arguments outstanding for partially applied function (14)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y, z) {};
      proto.curried = objectCurry(fn);

      expect(arityOf(obj.curried(1)(1))).to.equal(1);
    });


    it('Reports arguments outstanding for partially applied function (16)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y, z) {};
      proto.curried = objectCurry(fn);

      expect(arityOf(obj.curried(1, 1))).to.equal(1);
    });


    it('Reports arguments outstanding for partially applied function (17)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y) {};
      proto.curried = objectCurryWithArity(3, fn);

      expect(arityOf(obj.curried(1))).to.equal(2);
    });


    it('Reports arguments outstanding for partially applied function (18)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y) {};
      proto.curried = objectCurryWithArity(3, fn);

      expect(arityOf(obj.curried(1)(1))).to.equal(1);
    });


    it('Reports arguments outstanding for partially applied function (19)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y) {};
      proto.curried = objectCurryWithArity(3, fn);

      expect(arityOf(obj.curried(1, 1))).to.equal(1);
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


    it('Recognises when a function is curried (13)', function() {
      var fn = bind({}, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (14)', function() {
      var fn = bind({}, function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (15)', function() {
      var fn = bind({}, function(x, y) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (16)', function() {
      var fn = bind({}, function(x, y) {})(1);

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (17)', function() {
      var fn = bindWithContextAndArity(1, {}, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (18)', function() {
      var fn = bindWithContextAndArity(2, {}, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (19)', function() {
      var fn = bindWithContextAndArity(2, {}, function() {})(1);

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (20)', function() {
      var fn = bindWithContextAndArity(1, {}, function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (21)', function() {
      var fn = bindWithContextAndArity(0, {}, function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (22)', function() {
      var fn = bindWithContextAndArity(2, {}, function(x, y) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (23)', function() {
      var fn = bindWithContextAndArity(2, {}, function(x, y) {})(1);

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (24)', function() {
      var fn = objectCurry(function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (25)', function() {
      var fn = objectCurry(function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (26)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y) {};
      proto.curried = objectCurry(fn);
      var f = obj.curried(1);

      expect(arityOf._isCurried(f)).to.equal(true);
    });


    it('Recognises when a function is curried (27)', function() {
      var fn = objectCurryWithArity(1, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (28)', function() {
      var fn = objectCurryWithArity(2, function() {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (29)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function() {};
      proto.curried = objectCurryWithArity(2, fn);
      var f = obj.curried(1);

      expect(arityOf._isCurried(f)).to.equal(true);
    });


    it('Recognises when a function is curried (30)', function() {
      var fn = objectCurryWithArity(1, function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (31)', function() {
      var fn = objectCurryWithArity(0, function(x) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (32)', function() {
      var fn = objectCurryWithArity(2, function(x, y) {});

      expect(arityOf._isCurried(fn)).to.equal(true);
    });


    it('Recognises when a function is curried (33)', function() {
      var proto = {};
      var obj = Object.create(proto);
      var fn = function(x, y) {};
      proto.curried = objectCurryWithArity(2, fn);
      var f = obj.curried(1);

      expect(arityOf._isCurried(f)).to.equal(true);
    });
  });


  var currySpec = {
    name: 'curry',
    arity: 1,
    restrictions: [['function']],
    validArguments: [ANYVALUE]
  };


  checkFunction(currySpec, curry, function(curry) {
    // We shall test curry with binary, ternary, and quarternary functions
    var testFuncs = [
      {f: function(a) {return 'foo' + a;}, args: [2], message: 'Curried unary function'},
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


    it('Calling a curried function that expects no arguments works correctly', function() {
      var expected = 'funkier';
      var f = curry(function() { return expected; });

      expect(curry(f)()).to.equal(expected);
    });


    it('Calling a curried function that awaits further arguments with no arguments throws', function() {
      var f = curry(function(x) {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.throw();
    });


    it('Functions cannot be recurried if curried with bind', function() {
      var curried = bind({}, function(x, y) {});
      var fn = function() {
        curry(curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with bindWithContextAndArity', function() {
      var curried = bindWithContextAndArity(2, {}, function() {});
      var fn = function() {
        curry(curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (1)', function() {
      var curried = objectCurry(function() {});
      var fn = function() {
        curry(curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (2)', function() {
      var curried = objectCurry(function(x, y) {});
      var obj = {foo: curried};
      var fn = function() {
        curry(obj.foo(1));
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (1)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var fn = function() {
        curry(curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (2)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var obj = {foo: curried};
      var fn = function() {
        curry(obj.foo(1));
      };

      expect(fn).to.throw();
    });
  });


  var curryWithAritySpec = {
    name: 'curryWithArity',
    restrictions: [['strictNatural'], ['function']],
    validArguments: [[1], [function() {}]]
  };


  checkFunction(curryWithAritySpec, curryWithArity, function(curryWithArity) {
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


    it('Calling with curried function and function\'s arity returns original (1)', function() {
      var f = curryWithArity(2, function(a, b) {});

      expect(curryWithArity(2, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (2)', function() {
      var f = curryWithArity(1, function(a, b) {});

      expect(curryWithArity(1, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (3)', function() {
      var f = curryWithArity(0, function(a, b) {});

      expect(curryWithArity(0, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (4)', function() {
      var f = curryWithArity(1, function(a) {});

      expect(curryWithArity(1, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (5)', function() {
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


    it('Calling a curried function that expects no arguments works correctly', function() {
      var f = curryWithArity(0, function(x) {return 42;});
      expect(f()).to.equal(42);
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


    it('Functions cannot be recurried if curried with bind', function() {
      var curried = bind({}, function(x, y, z) {});
      var fn = function() {
        curryWithArity(2, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with bindWithContextAndArity', function() {
      var curried = bindWithContextAndArity(2, {}, function() {});
      var fn = function() {
        curryWithArity(2, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (1)', function() {
      var curried = objectCurry(function() {});
      var fn = function() {
        curryWithArity(2, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (2)', function() {
      var curried = objectCurry(function(x, y) {});
      var obj = {foo: curried};
      var fn = function() {
        curryWithArity(2, obj.foo(1));
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (1)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var fn = function() {
        curryWithArity(3, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (2)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var obj = {foo: curried};
      var fn = function() {
        curry(obj.foo(1));
      };

      expect(fn).to.throw();
    });
  });


  var bindSpec = {
    name: 'bind',
    restrictions: [['objectlike'], ['function']],
    validArguments: ANYVALUE
  };


  checkFunction(bindSpec, bind, function(bind) {
    it('Currying a function of length 0 returns a function of length 0', function() {
      var f = function() {};
      var curried = bind({}, f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Currying a function of length 1 returns a function of length 1', function() {
      var f = function(x) {};
      var curried = bind({}, f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Underlying function called with specified argument count when invoked with superfluous arguments', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var args = [1, 2, 4, 'a'];

      var curried = bind({}, f);
      curried(args[0], args[1], args[2], args[3]);

      expect(invokedArgs).to.deep.equal(args.slice(0, f.length));
    });


    it('Calling a curried function that expects no arguments does not throw', function() {
      var f = bind({}, function() {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.not.throw();
    });


    it('Calling a curried function that expects no arguments works correctly', function() {
      var expected = 'hello, world';
      var f = bind({foo: expected}, function() { return this.foo; });
      expect(f()).to.equal(expected);
    });


    it('Calling a curried function awaiting further arguments without any arguments throws', function() {
      var f = bind({}, function(x) { return 42; });
      var fn = function() {
        f();
      };

      expect(f).to.throw();
    });


    var testFuncs = [
      {f: function(a, b) {return this.foo + a + b;}, args: [2, 3], message: 'Binary function'},
      {f: function(a) {return this.foo + a;}, args: [2], message: 'Unary function'},
      {f: function(a, b, c) {return this.foo * a * b * c;}, args: [4, 5, 6], message: 'Ternary function'},
    ];


    testFuncs.forEach(function(testData) {
      var fn = testData.f;
      var args = testData.args;
      var message = testData.message;
      var obj = {foo: 10};
      var curried = bind(obj, fn);
      testCurriedFunction(curried, fn.bind(obj), args, message);
    });


    it('Binds to context', function() {
      var f = function() { return this; };
      var obj = {};
      var arity = 0;
      var result = bind(obj, f)();

      expect(result).to.equal(obj);
    });


    it('Functions can be recurried when not partially applied if context is the same (1)', function() {
      var context = null;
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); context = this; };
      var args = [1, 'x', 4, 'a', null];

      var ctx = {};
      var intermediate = bind(ctx, f);
      intermediate.apply(null, args);
      // Sanity check
      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
      expect(context).to.equal(ctx);
      invokedArgs = [];
      context = null;

      var curried = bind(ctx, intermediate);
      curried(args[0])(args[1]);

      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
      expect(context).to.equal(ctx);
    });


    it('Functions can be recurried when not partially applied if context is the same (2)', function() {
      var context = null;
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); context = this; };
      var args = [1, 'x', 4, 'a', null];

      var ctx = {};
      var intermediate = bindWithContextAndArity(3, ctx, f);
      intermediate.apply(null, args);
      // Sanity check
      expect(invokedArgs).to.deep.equal(args.slice(0, 3));
      expect(context).to.equal(ctx);
      invokedArgs = [];
      context = null;

      var curried = bind(ctx, intermediate);
      curried(args[0])(args[1], args[2]);

      expect(invokedArgs).to.deep.equal(args.slice(0, 3));
      expect(context).to.equal(ctx);
    });


    it('Binding a previously bound function with the same execution context returns the same function', function() {
      var obj = {};
      var f = bind(obj, function(x) { return 42; });
      var g = bind(obj, f);

      expect(f).to.equal(g);
    });


    it('Functions cannot be bound to a different context (1)', function() {
      var ctx = {};
      var f = function(a, b) { return this; };

      var intermediate = bind(ctx, f);
      var fn = function() {
        bind({}, intermediate);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be bound to a different context (2)', function() {
      var ctx = {};
      var f = function(a, b) { return this; };

      var intermediate = bindWithContextAndArity(2, ctx, f);
      var fn = function() {
        bind({}, intermediate);
      };

      expect(fn).to.throw();
    });


    it('Functions bound to a null context by curry cannot be rebound to a different context', function() {
      var curried = curry(function(x, y) {});
      var fn = function() {
        bind({}, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions bound to a null context by curryWithArity cannot be rebound to a different context', function() {
      var curried = curryWithArity(3, function(x, y) {});
      var fn = function() {
        bind({}, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (1)', function() {
      var curried = objectCurry(function() {});
      var fn = function() {
        bind({}, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (2)', function() {
      var curried = objectCurry(function(x, y) {});
      var obj = {foo: curried};
      var fn = function() {
        bind({}, obj.foo(1));
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (1)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var fn = function() {
        bind({}, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (2)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var obj = {foo: curried};
      var fn = function() {
        bind({}, obj.foo(1));
      };

      expect(fn).to.throw();
    });
  });


  var bindWithContextAndAritySpec = {
    name: 'bindWithContextAndArity',
    restrictions: [['objectlike'], ['natural'], ['function']],
    validArguments: ANYVALUE
  };


  checkFunction(bindWithContextAndAritySpec, bindWithContextAndArity, function(bindWithContextAndArity) {
    it('Currying a function of length 0 to 0 returns a function of length 0', function() {
      var f = function() {};
      var curried = bindWithContextAndArity(0, {}, f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Currying a function of length 1 to 1 returns a function of length 1', function() {
      var f = function(x) {};
      var curried = bindWithContextAndArity(1, {}, f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Returns a function of length 1 when a function of length 0 is curried to a length > 0', function() {
      var f = function() {};
      var curried = bindWithContextAndArity(1, {}, f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Returns a function of length 0 when a function of length > 0 is curried to length 0', function() {
      var f = function(a, b, c) {};
      var curried = bindWithContextAndArity(0, {}, f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Underlying function called with specified argument count when invoked with superfluous arguments', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var args = [1, 2, 4, 'a'];

      var curried = bindWithContextAndArity(2, {}, f);
      curried(args[0], args[1], args[2], args[3]);

      expect(invokedArgs).to.deep.equal(args.slice(0, f.length));
    });


    it('Underlying function can be curried to a higher arity than its length', function() {
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); };
      var args = [1, 2, 4, 'a', null];

      var curried = bindWithContextAndArity(5, {}, f);
      curried(args[0])(args[1])(args[2])(args[3])(args[4]);

      expect(invokedArgs).to.deep.equal(args);
    });


    it('Calling a curried function that expects no arguments does not throw', function() {
      var f = bindWithContextAndArity(0, {}, function(x) {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.not.throw();
    });


    it('Calling a curried function that expects no arguments works correctly', function() {
      var expected = 'rust';
      var f = bindWithContextAndArity(0, {}, function(a, b, c) {return expected; });
      expect(f()).to.equal(expected);
    });


    it('Calling a curried function awaiting further arguments without any arguments throws', function() {
      var f = bindWithContextAndArity(1, {}, function() {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.throw();
    });


    var testFuncs = [
      {f: function(a, b) {return this.foo + a;}, args: [2, 3], message: 'Binary function curried to binary'},
      {f: function(a, b) {return this.foo + a;}, args: [2], message: 'Binary function curried to unary'},
      {f: function(a) {return this.foo * a;}, args: [4, 5, 6], message: 'Unary function curried to ternary'},
    ];


    testFuncs.forEach(function(testData) {
      var fn = testData.f;
      var args = testData.args;
      var message = testData.message;
      var obj = {foo: 10};
      var curried = bindWithContextAndArity(args.length, obj, fn);
      testCurriedFunction(curried, fn.bind(obj), args, message);
    });


    it('Binds to context', function() {
      var f = function() { return this; };
      var obj = {};
      var arity = 0;
      var result = bindWithContextAndArity(arity, obj, f)();

      expect(result).to.equal(obj);
    });


    it('Functions can be recurried when not partially applied if context is the same (1)', function() {
      var context = null;
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); context = this; };
      var args = [1, 'x', 4, 'a', null];

      var ctx = {};
      var intermediate = bindWithContextAndArity(3, ctx, f);
      intermediate.apply(null, args);
      // Sanity check
      expect(invokedArgs).to.deep.equal(args.slice(0, 3));
      expect(context).to.equal(ctx);
      invokedArgs = [];
      context = null;

      var curried = bindWithContextAndArity(5, ctx, intermediate);
      curried(args[0])(args[1])(args[2])(args[3])(args[4]);

      expect(invokedArgs).to.deep.equal(args);
      expect(context).to.equal(ctx);
    });


    it('Functions can be recurried when not partially applied if context is the same (2)', function() {
      var context = null;
      var invokedArgs = [];
      var f = function(a, b) { invokedArgs = [].slice.call(arguments); context = this; };
      var args = [1, 'x', 4, 'a', null];

      var ctx = {};
      var intermediate = bind(ctx, f);
      intermediate.apply(null, args);
      // Sanity check
      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
      expect(context).to.equal(ctx);
      invokedArgs = [];
      context = null;

      var curried = bindWithContextAndArity(5, ctx, intermediate);
      curried(args[0])(args[1])(args[2])(args[3])(args[4]);

      expect(invokedArgs).to.deep.equal(args);
      expect(context).to.equal(ctx);
    });


    it('Functions cannot be bound to a different context (1)', function() {
      var ctx = {};
      var f = function(a, b) { return this; };

      var intermediate = bindWithContextAndArity(2, ctx, f);
      var fn = function() {
        bindWithContextAndArity(2, {}, intermediate);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be bound to a different context (2)', function() {
      var ctx = {};
      var f = function(a, b) { return this; };

      var intermediate = bind(ctx, f);
      var fn = function() {
        bindWithContextAndArity(2, {}, intermediate);
      };

      expect(fn).to.throw();
    });


    it('Functions bound to a null context by curry cannot be rebound to a different context', function() {
      var curried = curry(function(x, y) {});
      var fn = function() {
        bindWithContextAndArity(2, {}, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions bound to a null context by curryWithArity cannot be rebound to a different context', function() {
      var curried = curryWithArity(3, function(x, y) {});
      var fn = function() {
        bindWithContextAndArity(2, {}, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (1)', function() {
      var curried = objectCurry(function() {});
      var fn = function() {
        bindWithContextAndArity({}, 2, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurry (2)', function() {
      var curried = objectCurry(function(x, y) {});
      var obj = {foo: curried};
      var fn = function() {
        bindWithContextAndArity({}, 3, obj.foo(1));
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (1)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var fn = function() {
        bindWithContextAndArity(4, {}, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with objectCurryWithArity (2)', function() {
      var curried = objectCurryWithArity(2, function() {});
      var obj = {foo: curried};
      var fn = function() {
        bindWithContextAndArity({}, 4, obj.foo(1));
      };

      expect(fn).to.throw();
    });
  });


  var objectCurrySpec = {
    name: 'objectCurry',
    restrictions: [['function']],
    validArguments: ANYVALUE
  };


  checkFunction(objectCurrySpec, objectCurry, function(objectCurry) {
    it('Currying a function of length 0 returns a function of length 0', function() {
      var f = function() {};
      var curried = objectCurry(f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Currying a function of length 1 returns a function of length 1', function() {
      var f = function(x) {};
      var curried = objectCurry(f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Works as expected when currying a function of arity 0', function() {
      var called = false;
      var obj = {};
      obj.f = objectCurry(function() { called = true; });
      obj.f();

      expect(called).to.equal(true);
    });


    it('Works as expected when currying a function of arity 1 (1)', function() {
      var called = false;
      var obj = {};
      obj.f = objectCurry(function(x) { called = true; });
      obj.f(1);

      expect(called).to.equal(true);
    });


    it('Works as expected when currying a function of arity 1 (2)', function() {
      var called = false;
      var param = null;
      var obj = {};
      obj.f = objectCurry(function(x) { param = x; called = true; });
      obj.f(1);

      expect(called).to.equal(true);
      expect(param).to.equal(1);
    });


    it('Works as expected when currying a function of arity 2 (1)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurry(function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1, 2);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2]);
    });


    it('Works as expected when currying a function of arity 2 (2)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurry(function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1);
      expect(called).to.equal(false);
      obj.f(1)(2);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2]);
    });


    it('Works as expected when currying a function of arity 3 (1)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurry(function(x, y, z) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1, 2, 3);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2, 3]);
    });


    it('Works as expected when currying a function of arity 3 (2)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurry(function(x, y, z) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1);
      expect(called).to.equal(false);
      obj.f(1)(2);
      expect(called).to.equal(false);
      obj.f(1)(2)(3);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2, 3]);
    });


    it('Works as expected when currying a function of arity 3 (3)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurry(function(x, y, z) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(4)(5, 6);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([4, 5, 6]);
    });


    it('Works as expected when currying a function of arity 3 (4)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurry(function(x, y, z) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(4, 5)(6);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([4, 5, 6]);
    });


    it('Underlying function called with specified argument count when invoked with superfluous arguments', function() {
      var invokedArgs = [];
      var obj = {};
      obj.f = objectCurry(function(x, y) { invokedArgs = [].slice.call(arguments); });
      var args = [1, 2, 4, 'a'];
      obj.f(args[0], args[1], args[2], args[3]);

      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
    });


    it('Calling with curried function and function\'s arity returns original (1)', function() {
      var f = objectCurry(function(a, b) {});

      expect(objectCurry(f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (2)', function() {
      var f = objectCurryWithArity(1, function(a, b) {});

      expect(objectCurry(f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (3)', function() {
      var f = objectCurry(function() {});

      expect(objectCurry(f)).to.equal(f);
    });


    it('Curried function bound to first invocation\'s execution context (1)', function() {
      var obj = {};
      var invoked = null;
      obj.f = objectCurry(function(x, y) { invoked = this; });
      obj.f(1, 2);

      expect(invoked).to.equal(obj);
    });


    it('Curried function bound to first invocation\'s execution context (2)', function() {
      var obj = {};
      var invoked = null;
      obj.f = objectCurry(function(x, y) { invoked = this; });
      obj.f(1)(2);

      expect(invoked).to.equal(obj);
    });


    it('Curried function bound to first invocation\'s execution context (3)', function() {
      var obj = {};
      var obj2 = {};
      var invoked = null;
      obj.f = objectCurry(function(x, y) { invoked = this; });
      obj2.f = obj.f;
      obj2.f(1)(2);

      expect(invoked).to.equal(obj2);
    });


    it('Curried function bound to first invocation\'s execution context (4)', function() {
      var obj = {};
      var invoked = null;
      obj.f = objectCurry(function() { invoked = this; });
      obj.f();

      expect(invoked).to.equal(obj);
    });


    it('Execution context isn\'t permanently bound to initial function', function() {
      var obj = {};
      var obj2 = {};
      var invoked = null;
      obj.f = objectCurry(function(x, y) { invoked = this; });
      obj.f(1, 2);
      obj2.f = obj.f;
      var fn = function() {
        obj2.f(1)(2);
      };

      expect(fn).to.not.throw();
      expect(invoked).to.equal(obj2);
    });


    it('Throws if called with no execution context', function() {
      var f = objectCurry(function(x, y) {});
      var fn = function() {
        f();
      };

      expect(fn).to.throw();
    });


    it('Calling a curried function awaiting further arguments without any arguments throws', function() {
      var f = objectCurry(function(x) {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.throw();
    });


    it('Functions cannot be recurried when not partially applied (1)', function() {
      var invoked = null;
      var invokedArgs = [];
      var obj = {};
      obj.f = objectCurry(function(x, y) { invoked = this; invokedArgs = [].slice.call(arguments); });

      var g = obj.f(1);
      var fn = function() {
        objectCurry(g);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with curry', function() {
      var curried = curry(function() {});
      var fn = function() {
        objectCurryWithArity(3, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with curryWithArity', function() {
      var curried = curryWithArity(2, function() {});
      var fn = function() {
        objectCurry(curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with bind', function() {
      var curried = bind({}, function(x, y, z) {});
      var fn = function() {
        objectCurry(curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with bindWithContextAndArity', function() {
      var curried = bindWithContextAndArity(2, {}, function() {});
      var fn = function() {
        objectCurry(curried);
      };

      expect(fn).to.throw();
    });
  });


  var objectCurryWithAritySpec = {
    name: 'objectCurryWithArity',
    restrictions: [['strictNatural'], ['function']],
    validArguments: ANYVALUE
  };


  checkFunction(objectCurryWithAritySpec, objectCurryWithArity, function(objectCurryWithArity) {
    it('Currying a function of length 0 to 0 returns a function of length 0', function() {
      var f = function() {};
      var curried = objectCurryWithArity(0, f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Currying a function of length 1 to 1 returns a function of length 1', function() {
      var f = function(x) {};
      var curried = objectCurryWithArity(1, f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Returns a function of length 1 when a function of length 0 is curried to a length > 0', function() {
      var f = function() {};
      var curried = objectCurryWithArity(1, f);

      expect(arityOf(curried)).to.equal(1);
    });


    it('Returns a function of length 0 when a function of length > 0 is curried to length 0', function() {
      var f = function(a, b, c) {};
      var curried = objectCurryWithArity(0, f);

      expect(arityOf(curried)).to.equal(0);
    });


    it('Works as expected when curried to arity 0 (1)', function() {
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(0, function() { called = true; });
      obj.f();

      expect(called).to.equal(true);
    });


    it('Works as expected when curried to arity 0 (2)', function() {
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(0, function() { called = true; });
      obj.f();

      expect(called).to.equal(true);
    });


    it('Works as expected when curried to arity 1 (1)', function() {
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(1, function() { called = true; });
      obj.f(1);

      expect(called).to.equal(true);
    });


    it('Works as expected when curried to arity 1 (2)', function() {
      var called = false;
      var param = null;
      var obj = {};
      obj.f = objectCurryWithArity(1, function(x) { param = x; called = true; });
      obj.f(1);

      expect(called).to.equal(true);
      expect(param).to.equal(1);
    });


    it('Works as expected when curried to arity 2 (1)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(2, function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1, 2);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2]);
    });


    it('Works as expected when curried to arity 2 (2)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(2, function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1)(2);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2]);
    });


    it('Works as expected when curried to arity 3 (1)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(3, function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1, 2, 3);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2, 3]);
    });


    it('Works as expected when curried to arity 3 (2)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(3, function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(1)(2)(3);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([1, 2, 3]);
    });


    it('Works as expected when curried to arity 3 (3)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(3, function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(4)(5, 6);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([4, 5, 6]);
    });


    it('Works as expected when curried to arity 3 (4)', function() {
      var invokedArgs = [];
      var called = false;
      var obj = {};
      obj.f = objectCurryWithArity(3, function(x, y) { invokedArgs = [].slice.call(arguments); called = true; });
      obj.f(4, 5)(6);

      expect(called).to.equal(true);
      expect(invokedArgs).to.deep.equal([4, 5, 6]);
    });


    it('Underlying function called with specified argument count when invoked with superfluous arguments', function() {
      var invokedArgs = [];
      var obj = {};
      obj.f = objectCurryWithArity(2, function(x, y) { invokedArgs = [].slice.call(arguments); });
      var args = [1, 2, 4, 'a'];
      obj.f(args[0], args[1], args[2], args[3]);

      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
    });


    it('Calling with curried function and function\'s arity returns original (1)', function() {
      var f = objectCurryWithArity(2, function(a, b) {});

      expect(objectCurryWithArity(2, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (2)', function() {
      var f = objectCurryWithArity(1, function(a, b) {});

      expect(objectCurryWithArity(1, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (3)', function() {
      var f = objectCurryWithArity(0, function(a, b) {});

      expect(objectCurryWithArity(0, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (4)', function() {
      var f = objectCurryWithArity(1, function(a) {});

      expect(objectCurryWithArity(1, f)).to.equal(f);
    });


    it('Calling with curried function and function\'s arity returns original (5)', function() {
      var f = objectCurryWithArity(0, function() {});

      expect(objectCurryWithArity(0, f)).to.equal(f);
    });


    it('Curried function bound to first invocation\'s execution context (1)', function() {
      var obj = {};
      var invoked = null;
      obj.f = objectCurryWithArity(2, function(x, y) { invoked = this; });
      obj.f(1, 2);

      expect(invoked).to.equal(obj);
    });


    it('Curried function bound to first invocation\'s execution context (2)', function() {
      var obj = {};
      var invoked = null;
      obj.f = objectCurryWithArity(3, function(x, y) { invoked = this; });
      obj.f(1)(2)(3);

      expect(invoked).to.equal(obj);
    });


    it('Curried function bound to first invocation\'s execution context (3)', function() {
      var obj = {};
      var obj2 = {};
      var invoked = null;
      obj.f = objectCurryWithArity(3, function(x, y) { invoked = this; });
      obj2.f = obj.f;
      obj2.f(1)(2, 3);

      expect(invoked).to.equal(obj2);
    });


    it('Curried function bound to first invocation\'s execution context (4)', function() {
      var obj = {};
      var invoked = null;
      obj.f = objectCurryWithArity(0, function(x, y) { invoked = this; });
      obj.f();

      expect(invoked).to.equal(obj);
    });


    it('Execution context isn\'t permanently bound to initial function', function() {
      var obj = {};
      var obj2 = {};
      var invoked = null;
      obj.f = objectCurryWithArity(3, function(x, y) { invoked = this; });
      obj.f(1, 2, 3);
      obj2.f = obj.f;
      var fn = function() {
        obj2.f(1)(2, 3);
      };

      expect(fn).to.not.throw();
      expect(invoked).to.equal(obj2);
    });


    it('Throws if called with no execution context', function() {
      var f = objectCurryWithArity(1, function(x, y) {});
      var fn = function() {
        f();
      };

      expect(fn).to.throw();
    });


    it('Calling a curried function awaiting further arguments without any arguments throws', function() {
      var f = objectCurryWithArity(1, function() {return 42;});
      var fn = function() {
        f();
      };

      expect(f).to.throw();
    });


    it('Functions can be recurried when not partially applied (1)', function() {
      var invoked = null;
      var invokedArgs = [];
      var obj = {};
      obj.f = objectCurryWithArity(2, function(x, y) { invoked = this; invokedArgs = [].slice.call(arguments); });
      var args = [1, 'x', 4, 'a', null];

      // Sanity check
      obj.f.apply(obj, args);
      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
      expect(invoked).to.equal(obj);

      var obj2 = {};
      obj2.f = objectCurryWithArity(args.length, obj.f);
      obj2.f(args[0], args[1], args[2], args[3], args[4]);

      expect(invokedArgs).to.deep.equal(args);
      expect(invoked).to.equal(obj2);
    });


    it('Functions can be recurried when not partially applied (2)', function() {
      var invoked = null;
      var invokedArgs = [];
      var obj = {};
      obj.f = objectCurry(function(x, y) { invoked = this; invokedArgs = [].slice.call(arguments); });
      var args = [1, 'x', 4, 'a', null];

      // Sanity check
      obj.f.apply(obj, args);
      expect(invokedArgs).to.deep.equal(args.slice(0, 2));
      expect(invoked).to.equal(obj);

      var obj2 = {};
      obj2.f = objectCurryWithArity(args.length, obj.f);
      obj2.f(args[0], args[1], args[2], args[3], args[4]);

      expect(invokedArgs).to.deep.equal(args);
      expect(invoked).to.equal(obj2);
    });


    it('Functions cannot be recurried when partially applied (1)', function() {
      var invoked = null;
      var invokedArgs = [];
      var obj = {};
      obj.f = objectCurryWithArity(1, function(x, y) { invoked = this; invokedArgs = [].slice.call(arguments); });

      var g = obj.f(1);
      var fn = function() {
        objectCurryWithArity(3, g);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried when partially applied (2)', function() {
      var invoked = null;
      var invokedArgs = [];
      var obj = {};
      obj.f = objectCurry(function(x, y) { invoked = this; invokedArgs = [].slice.call(arguments); });

      var g = obj.f(1);
      var fn = function() {
        objectCurryWithArity(3, g);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with curry', function() {
      var curried = curry(function() {});
      var fn = function() {
        objectCurryWithArity(3, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with curryWithArity', function() {
      var curried = curryWithArity(2, function() {});
      var fn = function() {
        objectCurryWithArity(3, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with bind', function() {
      var curried = bind({}, function(x, y, z) {});
      var fn = function() {
        objectCurryWithArity(2, curried);
      };

      expect(fn).to.throw();
    });


    it('Functions cannot be recurried if curried with bindWithContextAndArity', function() {
      var curried = bindWithContextAndArity(2, {}, function() {});
      var fn = function() {
        objectCurryWithArity(2, curried);
      };

      expect(fn).to.throw();
    });
  });
})();
