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


    var exported = {
      bindWithContext: bindWithContext,
      bindWithContextAndArity: bindWithContextAndArity,
      pre: pre,
      post: post
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
