(function() {
  "use strict";


  var makeModule = function(require, exports) {

    /*
     * curry: take a function f, and curry up to the function's arity, as defined by the
     *        function's length property. Functions of arity 0 and 1 are returned unharmed.
     *        Arguments are curried left to right.
     *
     * curry will ultimately call the underlying function with a null execution context. Use
     * Function.prototype.bind beforehand if you need to curry with a specific context.
     *
     * Each curried function will have an arity of 1, but will accept > 1 arguments. If the number
     * of arguments supplied is equal to the number of outstanding arguments, the
     * underlying function will be called. For example,
     *   var f = curry(function(a, b) {...});
     *   f(1); // returns a function that awaits a value for the b parameter
     *   f(1, 2); // calls the original function with a=1, b=2
     *
     * If the curried function is called with superfluous arguments, they will be discarded.
     * This avoids unexpected behaviours triggered by supplying optional arguments.
     */

    var curry = function(f) {
      // Define curry with length 1, so don't leak our optional arg to function length
      var length = (arguments.length === 1) ? f.length : arguments[1];

      if (length < 2)
        return f;

      var first = function(a) {
        var args = [].slice.call(arguments);
        var argsNeeded = length - args.length;

        // If we have more args than expected, trim down to the expected length
        // (the function will be called when we fall through to the next conditional)
        if (args.length > length)
          args = args.slice(0, length);

        // If we have enough arguments, call the underlying function
        if (args.length === length)
          return f.apply(null, args);

        // We don't have enough arguments. Bind those that we already have
        var newFn = f.bind.apply(f, [null].concat(args));
        var argsNeeded = length - args.length;

        // Continue currying if we can't yet return a function of length 1
        if (argsNeeded > 1)
          return curry(newFn, argsNeeded);

        // The trivial case
        return function(b) {
          return newFn(b);
        };
      };

      return first;
    };


    var exported = {
      curry: curry
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
