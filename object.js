(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
    var flip = base.flip;
    var permuteLeft = base.permuteLeft;

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
     * Note: this is an unary function that discards excess arguments. If you need to add new
     * properties, use createObjectWithProps.
     */

    var createObject = curry(function(obj) {
      return Object.create(obj);
    });


    /*
     * createObjectWithProps: creates an object whose internal prototype property is the given object,
     *                        and which has the additional properties described in the given property
     *                        descriptor object. The property descriptor object is of the form accepted
     *                        by Object.create, Object.defineProperties etc.
     *
     * var obj = {};
     * var newObj = createObjectWithProps(obj, {prop: configurable: false, enumerable: false, writeable: true, value: 1}});
     * isPrototypeOf(obj, newObj); // true
     * hasOwnProperty('prop', newObj); // true
     *
     */

    var createObjectWithProps = curry(function(obj, descriptor) {
      return Object.create(obj, descriptor);
    });


    /*
     * defineProperty: a curried wrapper around Object.defineProperty. Takes a property name,
     *                 a property descriptor, and an object. Returns the object.
     *
     */

    var defineProperty = permuteLeft(Object.defineProperty);


    /*
     * defineProperties: a curried wrapper around Object.defineProperties. Takes an object whose
     *                   properties are property descriptors, and an object. Returns the object.
     *
     */

    var defineProperties = permuteLeft(Object.defineProperties);


    /*
     * getOwnPropertyDescriptor: a curried wrapper around Object.getOwnPropertyDescriptor.
     *                           Takes the name of a property and an object. Returns the property
     *                           descriptor only if the object itself has the given property, and
     *                           undefined otherwise.
     *
     */

    var getOwnPropertyDescriptor = flip(Object.getOwnPropertyDescriptor);


    /*
     * extract: extract the given property from the given object. Equivalent to evaluating obj[prop].
     *
     */

    var extract = curry(function(prop, obj) {
      return obj[prop];
    });


    /*
     * set: set the given property to the given value on the given object, returning the object.
     *      Equivalent to evaluating obj[prop] = val. The property will be created if it doesn't
     *      exist on the object. This function will not throw when the property is not writable,
     *      when it has no setter function, or when the object is frozen. Likewise, if the property
     *      must be created, it will not throw if the object is sealed, frozen, or Object.preventExtensions
     *      has been called. It will fail silently in all these cases.
     */

    // Utility function for set: work backwards to Object.prototype, looking for a property descriptor
    var findPropertyDescriptor = function(prop, obj) {
      var descriptor = undefined;
      var toppedOut = false;

      while (descriptor === undefined && !toppedOut) {
        descriptor = getOwnPropertyDescriptor(prop, obj);
        if (descriptor === undefined) {
          if (obj === Object.prototype) {
            toppedOut = true;
          } else {
            obj = Object.getPrototypeOf(obj);
          }
        }
      }

      return descriptor;
    };


    var set = curry(function(prop, val, obj) {
      var writable = true;
      var descriptor = findPropertyDescriptor(prop, obj);

      // Don't modify writable false properties
      if (descriptor && 'writable' in descriptor && descriptor.writable === false)
        writable = false;

      // Don't modify no setter properties
      if (descriptor && writable && 'set' in descriptor && descriptor.set === undefined)
        writable = false;

      if (writable && (Object.isSealed(obj) || Object.isFrozen(obj) || !Object.isExtensible(obj)))
        writable = false;

      if (writable)
        obj[prop] = val;
      return obj;
    });


    var exported = {
      callProp: callProp,
      callPropWithArity: callPropWithArity,
      createObject: createObject,
      createObjectWithProps: createObjectWithProps,
      defineProperty: defineProperty,
      defineProperties: defineProperties,
      extract: extract,
      getOwnPropertyDescriptor: getOwnPropertyDescriptor,
      hasOwnProperty: hasOwnProperty,
      hasProperty: hasProperty,
      instanceOf: instanceOf,
      isPrototypeOf: isPrototypeOf,
      set: set
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
