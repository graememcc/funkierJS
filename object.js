(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;

    /*
     * callPropWithArity: takes a property name, and an arity. Returns a curried function
     *                    of (arity + 1) arguments, that calls the given property on an
     *                    object with the first arity arguments (the object is the last parameter),
     *                    returning the result. The function is called on the object with the parameters
     *                    in the order given.
     *
     * For example:
     *   var myMap = callPropWithArity('map', 1);
     *   myMap(f, arr);  // returns arr.map(f);
     *   var myFoldr = callPropWithArity('reduceRight', 2);
     *   myFoldr(f, initialValue, arr); // returns arr.reduceRight(f, initialValue);
     *
     *   var myConstructor = function() {};
     *   myConstructor.prototype.return42 = function() {return 42;};
     *   var myObj = new myConstructor();
     *   var call42 = callPropWithArity('return42', 0);
     *   call42(myObj);  // calls myObj.return42();
     *
     */

    var callPropWithArity = curry(function(prop, arity) {
      return curryWithArity(arity + 1, function() {
        // curryWithArity guarantees we will be called with arity + 1 args
        var propArgs = [].slice.call(arguments, 0, arity);
        var obj = arguments[arity];

        return obj[prop].apply(obj, propArgs);
      });
    });


    var exported = {
      callPropWithArity: callPropWithArity
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
