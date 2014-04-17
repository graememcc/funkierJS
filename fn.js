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


    var exported = {
      bindWithContext: bindWithContext
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
