(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
    var flip = base.flip;

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


    /*
     * callProp: A shorthand for callPropWithArity(prop, 0). Returns a function that takes an object
     *           and calls the given property on the object.
     *
     * For example:
     *   var myConstructor = function() {};
     *   myConstructor.prototype.return42 = function() {return 42;};
     *   var myObj = new myConstructor();
     *   var call42 = callProp('return42');
     *   call42(myObj);  // calls myObj.return42();
     *
     */

    var callProp = flip(callPropWithArity)(0);


    /*
     * hasOwnProperty: a curried wrapper around Object.prototype.hasOwnProperty. Takes a
     *                 string containing a property name and an object.
     *
     * hasOwnProperty('funkier', {funkier: 1}); // true
     * hasOwnProperty('toString', {funkier: 1}); // false
     *
     */

    var hasOwnProperty = callPropWithArity('hasOwnProperty', 1);


    /*
     * hasProperty: a curried wrapper around the 'in' operator. Takes a
     *              string containing a property name and an object.
     *
     * hasProperty('funkier', {funkier: 1}); // true
     * hasProperty('toString', {funkier: 1}); // true
     *
     */

    var hasProperty = curry(function(prop, object) {
      return prop in object;
    });


    /*
     * instanceOf: a curried wrapper around the 'instanceof' operator. Takes a
     *             constructor function and an object.
     *
     * var Constructor = function() {};
     * instanceOf(Constructor, new Constructor()); // true
     * instanceOf(Function, {}); // false
     *
     */

    var instanceOf = curry(function(constructor, object) {
      return object instanceof constructor;
    });


    /*
     * isPrototypeOf: a curried wrapper around Object.prototype.isPrototypeOf.
     *                Takes two objects: the prototype object, and the object whose
     *                prototype chain you wish to check.
     *
     * var Constructor = function() {};
     * isPrototypeOf(Constructor.prototype, new Constructor()); // true
     * isPrototypeOf(Function.prototype, {}); // false
     *
     */

    var isPrototypeOf = flip(callPropWithArity('isPrototypeOf', 1));


    /*
     * createObject: creates an object whose internal prototype property is the given object.
     *
     * var obj = {};
     * var newObj = createObject(obj);
     * isPrototypeOf(obj, newObj); // true
     *
     */

    var createObject = curry(function(obj) {
      return Object.create(obj);
    });


    var exported = {
      callProp: callProp,
      callPropWithArity: callPropWithArity,
      createObject: createObject,
      hasOwnProperty: hasOwnProperty,
      hasProperty: hasProperty,
      instanceOf: instanceOf,
      isPrototypeOf: isPrototypeOf
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
