(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
    var getRealArity = base.getRealArity;


    /*
     * bindWithContext: A curried version of Function.prototype.bind.
     *                  Binds the given object as the execution context
     *                  for the given function, returning a curried function
     *                  with the same arity as the original.
     *
     */

    var bindWithContext = curry(function(obj, f) {
      var realArity = getRealArity(f);
      return curryWithArity(realArity, function() {
        var args = [].slice.call(arguments);
        return f.apply(obj, arguments);
      });
    });


    /*
     * bindWithContext: A curried version of Function.prototype.bind.
     *                  Takes an execution context object, an arity and a
     *                  function. Binds the given object as the execution
     *                  context for the given function, returning a curried
     *                  function accepting arity arguments.
     *
     */

    var bindWithContextAndArity = curry(function(obj, arity, f) {
      return curryWithArity(arity, function() {
        var args = [].slice.call(arguments);
        return f.apply(obj, arguments);
      });
    });


    /*
     * pre: takes two functions g, and f, and returns a new function
     *      with the same arity as f. When this new function is called, it will first
     *      call g with a single argument: an array containing all the arguments the
     *      function was called with. When g finishes executing, f will be called with
     *      those arguments, and a null execution context. f's return value will be
     *      returned.
     *
     * For example, you might log function calls as follows:
     * var logger = function(args) {console.log('plus called with ', args.join(', '));};
     * var loggedPlus = pre(logger, plus);
     * loggedPlus(2, 2); // outputs 'plus called with 2, 2' to console
     *
     */

    var pre = curry(function(g, f) {
      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        g(args);
        return f.apply(null, args);
      });
    });


    /*
     * post: takes two functions g, and f, and returns a new function
     *       with the same arity as f. When this new function is called, it will first
     *       call f with a null execution context and the given arguments, and then
     *       call g with two arguments: the first argument will be an array containing
     *       the arguments the function was called with, and the second argument will be
     *       the value returned by f. f's return value will be returned.
     *
     * For example, you might log function calls as follows:
     * var postLogger = function(args, result) {console.log('plus called with ', args.join(', '), 'returned', result);};
     * var loggedPlus = post(logger, plus);
     * loggedPlus(2, 2); // outputs 'plus called with 2, 2 returned 4' to console
     *
     */

    var post = curry(function(g, f) {
      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        var result = f.apply(null, args);
        g(args, result);
        return result;
      });
    });


    /*
     * wrap: takes 3 functions, before, after and f. Returns a new function with the same arity
     *       as f. When called, the following will happen in sequence:
     *       - before will be called with the given arguments
     *       - f will be called with the given arguments, and a null execution context
     *       - after will be called with 2 arguments: an array containing the given arguments, and
     *           f's result
     *       - f's result will be returned
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
      if (getRealArity(f) !== 1)
        throw new TypeError('Cannot compute fixpoint of function with arity !== 1');

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


    var exported = {
      bindWithContext: bindWithContext,
      bindWithContextAndArity: bindWithContextAndArity,
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
