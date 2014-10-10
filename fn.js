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


    var apply = defineValue(
      'name: apply',
      'signature: args: array, f: function',
      'classification: function',
      '',
      'Apply the given function f with a null execution context, and the arguments given',
      'in the array args, returning the result. The given function will be curried if it',
      'has arity > 1.',
      '',
      'Throws a TypeError if args is not an array, or if f is not a function.',
      '',
      '--',
      'apply([1], id); // 1',
      curry(function(args, f) {
        f = checkFunction(f);
        f = curry(f);
        args = checkArrayLike(args, {noStrings: true, message: 'Function arguments not an array'});

        return f.apply(null, args);
      })
    );


    var applyWithContext = defineValue(
      'name: applyWithContext',
      'signature: args: array, context: any, f: function',
      'classification: function',
      '',
      'Apply the given function f with the given execution context, and the arguments',
      'given in the array args, returning the result. The given function will be curried',
      'if it has arity > 1.',
      '',
      'Throws a TypeError if args is not an array, or if f is not a function.',
      '',
      '--',
      'applyWithContext([1], {foo: 1}, function(x) {return this.foo + x;}); // 2',
      curry(function(args, context, f) {
        f = checkFunction(f);
        f = curry(f);
        args = checkArrayLike(args, {noStrings: true, message: 'Function arguments not an array'});

        return f.apply(context, args);
      })
    );


    var permuteLeft = defineValue(
      'name: permuteLeft/rotateLeft',
      'signature: f: function',
      'classification: function',
      '',
      'Takes a function, returns a curried function of the same arity which takes the',
      'same parameters, except in a different position. The first parameter of the',
      'original function will be the last parameter of the new function, the second',
      'parameter of the original will be the first parameter of the new function and',
      'so on. This function is essentially a no-op for functions of arity 0 and 1, and',
      'equivalent to flip for functions of arity 2.',
      '',
      'Throws a TypeError if f is not a function.',
      '--',
      function(f) {
        var fLen = getRealArity(f);
        f = curry(f);

        if (fLen < 2)
          return f;

        return curryWithArity(fLen, function() {
          var args = [].slice.call(arguments);
          var newArgs = [args[fLen - 1]].concat(args.slice(0, fLen - 1));
          return f.apply(null, newArgs);
        });
      }
    );


    var permuteRight = defineValue(
      'name: permuteRight/rotateRight',
      'signature: f: function',
      'classification: function',
      '',
      'Takes a function, returns a curried function of the same arity which takes the',
      'same parameters, except in a different position. The last parameter of the',
      'original function will be the first parameter of the new function, the first',
      'parameter of the original will be the second parameter of the new function and',
      'so on. This function is essentially a no-op for functions of arity 0 and 1, and',
      'equivalent to flip for functions of arity 2.',
      '',
      'Throws a TypeError if f is not a function.',
      '--',
      'f = function(x, y, z) {return x + y + z;};',
      'g = permuteRight(f);',
      'g(\'a\', \'b\', \'c\'); // \'cab\'',
      function(f) {
        var fLen = getRealArity(f);
        f = curry(f);

        if (fLen < 2)
          return f;

        return curryWithArity(fLen, function() {
          var args = [].slice.call(arguments);
          var newArgs = args.slice(1).concat([args[0]]);
          return f.apply(null, newArgs);
        });
      }
    );


    var bindWithContext = defineValue(
      'name: bindWithContext',
      'signature: context: Object, f: function',
      'classification: function',
      '',
      'A curried version of Function.prototype.bind. Takes an execution context, and a',
      'function. Binds the given object as the execution context for the given function,',
      'returning a curried function with the same arity as the original.',
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
      'A curried version of Function.prototype.bind. Takes an execution context, an',
      'arity and a function. Binds the given object as the execution context for the',
      'given function, returning a curried function with the given arity.',
      '',
      'Throws a TypeError if context is not an object, if arity is not a non',
      'negative integer, or if f is not a function.',
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
      'Takes two functions g, and f, and returns a new function with the same arity as',
      'the original function f When this new function is called, it will first call g,',
      'with the same execution context, and a single argument: an array containing all',
      'the arguments the function was called with. When g returns, its return value',
      'will be discarded, and f will be called with the same execution context and invoked with the same',
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
      'Takes two functions g, and f, and returns a new function with the same arity as',
      'the original function f. When this new function is called, it will first call f,',
      'with the same execution context and arguments that the new function is called',
      'with. Its return value will be saved. Next, g will be called, with the same',
      'execution context, and two arguments: an array containing the arguments to f, and',
      'f\'s return value. Any value returned from g will be discarded, and f\'s return',
      'value will be returned.',
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
      'Takes 3 functions, before, after and f. Returns a new function with the same',
      'arity as f. When called, the following will happen in sequence:',
      '- * before will be called with the execution context of the new function and one',
      '-   argument: an array containing the arguments the new function was invoked with',
      '- * f will be called with the execution context that the new function was called',
      '-   with, and the same arguments after will be called with the original execution',
      '-   context and two arguments: an array containing the arguments the new function',
      '-   was called with, and f\'s result',
      '- * f\'s result will be returned',
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


    var callWithContext = defineValue(
      'name: callWithContext',
      'signature: context: Object, args: Array, f: function',
      'classification: function',
      '',
      'Takes an execution context object, an array of arguments, and a function. Calls',
      'the function with the given context and arguments, and returns the result. The',
      'function will be curried if necessary.',
      '',
      'Throws a TypeError if the middle argument is not an array, or if the last',
      'argument is not a function.',
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
      apply: apply,
      applyWithContext: applyWithContext,
      bindWithContext: bindWithContext,
      bindWithContextAndArity: bindWithContextAndArity,
      callWithContext: callWithContext,
      permuteLeft: permuteLeft,
      permuteRight: permuteRight,
      pre: pre,
      post: post,
      rotateLeft: permuteLeft,
      rotateRight: permuteRight,
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
