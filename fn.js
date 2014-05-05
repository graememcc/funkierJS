(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
    var getRealArity = base.getRealArity;

    var utils = require('./utils');
    var checkArrayLike = utils.checkArrayLike;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;


    /*
     * bindWithContext: A curried version of Function.prototype.bind.
     *                  Binds the given object as the execution context
     *                  for the given function, returning a curried function
     *                  with the same arity as the original. Throws if f is not
     *                  a function.
     *
     */

    var bindWithContext = curry(function(obj, f) {
      f = checkFunction(f);

      var realArity = getRealArity(f);
      return curryWithArity(realArity, function() {
        var args = [].slice.call(arguments);
        return f.apply(obj, arguments);
      });
    });


    /*
     * bindWithContextAndArity: A curried version of Function.prototype.bind.
     *                          Takes an execution context object, an arity and a
     *                          function. Binds the given object as the execution
     *                          context for the given function, returning a curried
     *                          function accepting arity arguments. Throws if f is not
     *                          a function.
     *
     */

    var bindWithContextAndArity = curry(function(obj, arity, f) {
      f = checkFunction(f);

      return curryWithArity(arity, function() {
        var args = [].slice.call(arguments);
        return f.apply(obj, arguments);
      });
    });


    /*
     * pre: takes two functions g, and f, and returns a new function with the same arity as the original function
     *      f. When this new function is called, it will first call g, with the same execution context, and a
     *      single argument: an array containing all the arguments the function was called with. When g returns,
     *      its return value will be discarded, and f will be called with the same execution context and invoked
     *      with the same arguments as the new function. The return value from f will be returned. Throws a TypeError
     *      if neither of the given values are functions.
     *
     * For example, you might log function calls as follows:
     * var logger = function(args) {console.log('plus called with ', args.join(', '));};
     * var loggedPlus = pre(logger, plus);
     * loggedPlus(2, 2); // outputs 'plus called with 2, 2' to console
     *
     */

    var pre = curry(function(g, f) {
      g = checkFunction(g, {message: 'Pre value must be a function'});
      f = checkFunction(f, {message: 'Value to be wrapped must be a function'});

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        g.call(this, args);
        return f.apply(this, args);
      });
    });


    /*
     * post: takes two functions g, and f, and returns a new function with the same arity as the original function
     *       f. When this new function is called, it will first call f, with the same execution context and arguments
     *       that the new function is called with. Its return value will be saved. Next, g will be called, with the same
     *       execution context, and two arguments: an array containing the arguments to f, and f's return value. Ant value
     *       returned from g will be discarded, and f's return value will be returned. Throws a TypeError if either of the
     *       given values are not functions.
     *
     * For example, you might log function calls as follows:
     * var postLogger = function(args, result) {console.log('plus called with ', args.join(', '), 'returned', result);};
     * var loggedPlus = post(logger, plus);
     * loggedPlus(2, 2); // outputs 'plus called with 2, 2 returned 4' to console
     *
     */

    var post = curry(function(g, f) {
      g = checkFunction(g, {message: 'Post value must be a function'});
      f = checkFunction(f, {message: 'Value to be wrapped must be a function'});

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        var result = f.apply(this, args);
        g.call(this, args, result);
        return result;
      });
    });


    /*
     * wrap: takes 3 functions, before, after and f. Returns a new function with the same arity as f. When called, the
     *       following will happen in sequence:
     *       - before will be called with the execution context of the new function and one argument: an array containing
     *           the arguments the new function was invoked with
     *       - f will be called with the execution context that the new function was called with, and the same arguments
     *       - after will be called with the original execution context and two arguments: an array containing the
     *           arguments the new function was called with, and f's result
     *       - f's result will be returned
     *       Throws a TypeError if any argument is not a function.
     *
     * This function is equivalent to calling post and pre on some function. 
     *
     */
    var wrap = curry(function(before, after, f) {
      return post(after, pre(before, f));
    });


    /*
     * fixpoint: takes an argument a and a function f of arity 1. Repeatedly calls f, first with
     *           the argument a, then with the result of the previous call until two sequential
     *           results yield values that deep equal each other. Returns this value. Throws a
     *           TypeError if f does not have arity 1. Throws an Error after 1000 calls if no
     *           fixpoint has been found.
     *
     */

    var fixpoint = curry(function(a, f) {
      f = checkFunction(f, {arity: 1, message: 'Value must be a function of arity 1'});

      var result = f(a);
      var calls = 1;
      var found = false;

      while (calls < 1000 && !found) {
        calls += 1;
        var newResult = f(result);
        found = base.deepEqual(result, newResult);
        result = newResult;
      }

      if (calls === 1000)
        throw new Error('Unable to find fixpoint in reasonable time');

      return result;
    });


    /*
     * callWithContext: Takes an execution context object, an array of arguments, and a function. Calls
     *                  the function with the given context and arguments, and returns the result. The
     *                  function will be curried if necessary. Throws a TypeError if the middle argument
     *                  is not an array, or if the last argument is not a function.
     *
     */

    var callWithContext = curry(function(context, args, f) {
      args = checkArrayLike(args);
      f = curry(f);

      return f.apply(context, args);
    });


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
