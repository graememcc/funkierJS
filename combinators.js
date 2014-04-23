(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;


    /* Combinators exports the traditional S, K, and I combinators */

    /*
     * I: Ix = x. A synonym for the id function.
     *
     */

    var I = base.id;


    /*
     * K: Kxy = x. A synonym for the constant function.
     *
     */

    var K = base.constant;


    /*
     * Ky: Kxy = y. A flipped constant function.
     *
     */

    var Ky = base.flip(base.constant);


    /*
     * S: Sxyz = (xz)(yz). Takes two functions and an argument. Calls the first
     *    argument with the third. This must yield a new function. The second
     *    argument is also called with the third, and this result is fed to the
     *    function returned from the first argument. The result of this call is
     *    returned. Throws if the first two arguments are not functions, or if
     *    the value returned from the first function is itself not a function.
     *
     * Note: Functions of arity > 1 can be passed in: they will be curried if
     * necessary.
     *
     */

    var S = curry(function(x, y, z) {
      x = curry(x);
      y = curry(y);
      return x(z)(y(z));
    });


    var combinators = {
      I: I,
      K: K,
      Ky: Ky,
      S: S
    };

    var exported = {
      combinators: combinators
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
