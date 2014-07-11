(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;
    var curryWithArity = curryModule.curryWithArity;
    var getRealArity = curryModule.getRealArity;

    var base = require('./base');
    var deepEqual = base.deepEqual;

    var utils = require('./utils');
    var checkArrayLike = utils.checkArrayLike;
    var checkPositiveIntegral = utils.checkPositiveIntegral;
    var checkObjectLike = utils.checkObjectLike;
    var defineValue = utils.defineValue;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;


    var bindWithContext = defineValue(
      'name: bindWithContext',
      'signature: context: Object, f: function',
      'classification: function',
      '',
      'A curried version of Function.prototype.bind. Takes an execution context, and a function. Binds the',
      'given object as the execution context for the given function, returning a curried function with the',
      'same arity as the original.',
      '',
      'Throws a TypeError if context is not an object, or if f is not a function.',
      '--',
      'var f = function(x) {return this.foo + x;};',
      'var ctx = {foo: 1};',
      'var g = bindWithContext(ctx, f);',
      'g(10); // 11;',
      curry(function(obj, f) {
        obj = checkObjectLike(obj);
        f = checkFunction(f);

        var realArity = getRealArity(f);
        return curryWithArity(realArity, function() {
          var args = [].slice.call(arguments);
          return f.apply(obj, arguments);
        });
      })
    );


    var bindWithContextAndArity = defineValue(
      'name: bindWithContextAndArity',
      'signature: context: Object, arity: number, f: function',
      'classification: function',
      '',
      'A curried version of Function.prototype.bind. Takes an execution context, an arity and a function.',
      'Binds the given object as the execution context for the given function, returning a curried function',
      'with the given arity.',
      '',
      'Throws a TypeError if context is not an object, if arity is not a non-negative integer, or if f is not a function.',
      '--',
      'var f = function(x, y) {y = y || \'banana\'; return this.foo + x + y;};',
      'var ctx = {foo: \'apple\'};',
      'var g = bindWithContextAndArity(ctx, 1, f);',
      'g(\'pear\'); // "applepearbanana";',
      'g(\'mango\', \'papaya\'); // "applepearmango";',
      curry(function(obj, arity, f) {
        obj = checkObjectLike(obj);
        arity = checkPositiveIntegral(arity);
        f = checkFunction(f);

        return curryWithArity(arity, function() {
          var args = [].slice.call(arguments);
          return f.apply(obj, arguments);
        });
      })
    );


    var pre = defineValue(
      'name: pre',
      'signature: g: function, f: function',
      'classification: function',
      '',
      'Takes two functions g, and f, and returns a new function with the same arity as the original function f',
      'When this new function is called, it will first call g, with the same execution context, and a single',
      'argument: an array containing all the arguments the function was called with. When g returns, its return',
      'value will be discarded, and f will be called with the same execution context and invoked with the same',
      'arguments as the new function. The return value from f will be returned.',
      '',
      'Throws a TypeError if neither of the given values are functions.',
      '--',
      'var logger = function(args) {console.log(\'plus called with \', args.join(\', \'));};',
      'var loggedPlus = pre(logger, plus);',
      'loggedPlus(2, 2); // outputs \'plus called with 2, 2\' to console',
      curry(function(g, f) {
        g = checkFunction(g, {message: 'Pre value must be a function'});
        f = checkFunction(f, {message: 'Value to be wrapped must be a function'});

        return curryWithArity(getRealArity(f), function() {
          var args = [].slice.call(arguments);
          g.call(this, args);
          return f.apply(this, args);
        });
      })
    );


    var post = defineValue(
      'name: post',
      'signature: g: function, f: function',
      'classification: function',
      '',
      'Takes two functions g, and f, and returns a new function with the same arity as the original function f.',
      'When this new function is called, it will first call f, with the same execution context and arguments that the',
      'new function is called with. Its return value will be saved. Next, g will be called, with the same execution',
      'context, and two arguments: an array containing the arguments to f, and f\'s return value. Any value returned',
      'from g will be discarded, and f\'s return value will be returned.',
      '',
      'Throws a TypeError if either of the given values are not functions.',
      '--',
      'var postLogger = function(args, result) {console.log(\'plus called with \', args.join(\', \'), \'returned\', result);};',
      'var loggedPlus = post(postLogger, plus);',
      'loggedPlus(2, 2); // outputs \'plus called with 2, 2 returned 4\' to console',
      curry(function(g, f) {
        g = checkFunction(g, {message: 'Post value must be a function'});
        f = checkFunction(f, {message: 'Value to be wrapped must be a function'});

        return curryWithArity(getRealArity(f), function() {
          var args = [].slice.call(arguments);
          var result = f.apply(this, args);
          g.call(this, args, result);
          return result;
        });
      })
    );


    var wrap = defineValue(
      'name: wrap',
      'signature: before: function, after: function, f: function',
      'classification: function',
      '',
      'Takes 3 functions, before, after and f. Returns a new function with the same arity as f. When called, the',
      'following will happen in sequence:',
      '- * before will be called with the execution context of the new function and one argument: an array containing',
      '-   the arguments the new function was invoked with',
      '- * f will be called with the execution context that the new function was called with, and the same arguments',
      '-   after will be called with the original execution context and two arguments: an array containing the',
      '-   arguments the new function was called with, and f\'s result',
      '-   f\'s result will be returned',
      '',
      'Throws a TypeError if any argument is not a function.',
      '',
      'This function is equivalent to calling [[post]] and [[pre]] on some function. ',
      '--',
      'var logger = function(args) {console.log(\'plus called with \', args.join(\', \'));};',
      'var postLogger = function(args, result) {console.log(\'plus returned\', result);};',
      'var loggedPlus = wrap(logger, postLogger, plus);',
      'loggedPlus(2, 2); // outputs \'plus called with 2, 2\' and \'plus returned 4\' to console',
      curry(function(before, after, f) {
        return post(after, pre(before, f));
      })
    );


    var fixpoint = defineValue(
      'name: fixpoint',
      'signature: a: any, f: function',
      'classification: function',
      '',
      'Takes an argument a and a function f of arity 1. Repeatedly calls f, first with the argument a',
      'then with the result of the previous call until two sequential results yield values that [[deepEqual]]',
      'deep equal each other. Returns this value.',
      '',
      'Throws a TypeError if f does not have arity 1. Throws an Error after 1000 calls if no fixpoint has been',
      'found.',
      '--',
      'fixpoint(1, Math.cos); // 0.7390851332151607',
      curry(function(a, f) {
        f = checkFunction(f, {arity: 1, message: 'Value must be a function of arity 1'});

        var result = f(a);
        var calls = 1;
        var found = false;

        while (calls < 1000 && !found) {
          calls += 1;
          var newResult = f(result);
          found = deepEqual(result, newResult);
          result = newResult;
        }

        if (calls === 1000)
          throw new Error('Unable to find fixpoint in reasonable time');

        return result;
      })
    );


    var callWithContext = defineValue(
      'name: callWithContext',
      'signature: context: Object, args: Array, f: function',
      'classification: function',
      '',
      'Takes an execution context object, an array of arguments, and a function. Calls the function',
      'with the given context and arguments, and returns the result. The function will be curried if',
      'necessary.',
      '',
      'Throws a TypeError if the middle argument is not an array, or if the last argument is not a function.',
      '--',
      'var f = function(x, y) {return this.foo + x + y;};',
      'var ctx = {foo: 39};',
      'callWithContext(ctx, [1, 2], f); // 42',
      curry(function(context, args, f) {
        args = checkArrayLike(args);
        context = checkObjectLike(context);
        // Don't need to explicitly check the type of f: curry will throw for a non-function
        f = curry(f);

        return f.apply(context, args);
      })
    );


    var exported = {
      bindWithContext: bindWithContext,
      bindWithContextAndArity: bindWithContextAndArity,
      callWithContext: callWithContext,
      fixpoint: fixpoint,
      pre: pre,
      post: post,
      wrap: wrap
    };


    module.exports = exported;
  };


  // AMD/CommonJS foo
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      makeModule(require, exports, module);
    });
  } else {
    makeModule(require, exports, module);
  }
})();
