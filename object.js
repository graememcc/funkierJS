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


    // A thousand curses!
    // Per the ECMAScript spec, when setting a property on an object, the property descriptor - if it exists -
    // should be checked. Setting should fail when writable=false or there is no setter in the descriptor.
    // If the property descriptor doesn't exist on the property, then walk up the prototype chain making the
    // same check.
    //
    // Versions of V8 up to 3.11.9 fail to walk up the prototype chain. Further, when it was fixed, the fix
    // was gated behind a flag, which defaulted to false until 3.13.6, when the flag was flipped and V8 became
    // spec-compliant. The flag was removed in 3.25.4.
    //
    // Nevertheless, despite the flag being flipped in 3.13.6, node continues by default to set the flag to
    // spec-incompliant.
    var engineHandlesProtosCorrectly = (function() {
      var a = function(){};
      Object.defineProperty(a.prototype, 'foo', {writable: false});
      var compliant = false;
      var b = new a();

      try {
        b.foo = 1;
      } catch (e) {
        compliant = true;
      }

      return compliant;
    })();


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


    var checkIfWritable = function(prop, obj) {
      var writable = true;
      var descriptor = findPropertyDescriptor(prop, obj);

      // Don't modify writable false properties
      if (descriptor && 'writable' in descriptor && descriptor.writable === false)
        writable = false;

      // Don't modify no setter properties
      if (descriptor && writable && 'set' in descriptor && descriptor.set === undefined)
        writable = false;

      return writable;
    };


    /*
     * set: set the given property to the given value on the given object, returning the object.
     *      Equivalent to evaluating obj[prop] = val. The property will be created if it doesn't
     *      exist on the object. This function will not throw when the property is not writable,
     *      when it has no setter function, or when the object is frozen. Likewise, if the property
     *      must be created, it will not throw if the object is sealed, frozen, or Object.preventExtensions
     *      has been called. It will fail silently in all these cases.
     *
     * Use setOrThrow if you require a function that throws in such circumstances.
     * Use modify/modifyOrThrow if you require a function that will only modify existing properties.
     */

    var set = curry(function(prop, val, obj) {
      // We manually emulate the operation of [[CanPut]], rather than just setting in a
      // try-catch. We don't want to suppress other errors: for example the set function
      // might throw
      var writable = checkIfWritable(prop, obj);

      if (writable && !hasOwnProperty(prop, obj) && (Object.isSealed(obj) || !Object.isExtensible(obj)))
        writable = false;

      if (writable)
        obj[prop] = val;
      return obj;
    });


    /*
     * setOrThrow: set the given property to the given value on the given object, returning the object.
     *             Equivalent to evaluating obj[prop] = val. The property will be created if it doesn't
     *             exist on the object. This function will throw when the property is not writable,
     *             when it has no setter function, or when the object is frozen. Likewise, if the property
     *             must be created, it will throw if the object is sealed, frozen, or not extensible.
     *
     * Use set if you require a function which will not throw in such circumstances.
     * Use modify/modifyOrThrow if you require a function that will only modify existing properties.
     * Use createProp/createPropOrThrow if you need a version that will only create a new property, and not modify 
     * an existing property.
     *
     */

    var setOrThrow = curry(function(prop, val, obj) {
      // We *should* be able to just set the property, and trust the JS
      // engine to throw. Sadly, this is untrue; see the comments for
      // engineHandlesProtosCorrectly.

      // Take the fast path if we can
      if (engineHandlesProtosCorrectly) {
        obj[prop] = val;
      } else {
        if (checkIfWritable(prop, Object.getPrototypeOf(obj))) {
          obj[prop] = val;
        } else {
          // Spec says throw a TypeError
          throw new TypeError('Setting property disallowed by prototype');
        }
      }

      return obj;
    });


    /*
     * modify: set the given property to the given value on the given object, returning the object.
     *         Equivalent to evaluating obj[prop] = val. The property will *not* be created when the object
     *         does not have the property; the function will silently fail. In particular, the property will
     *         not be created if it exists only in the prototype chain: hasOwnProperty(prop, obj) must be true.
     *
     *         This function will also not throw when the property is not writable, when it has no setter function,
     *         or when the object is frozen. Again, it will silently fail.
     *
     * Use modifyOrThrow if you need a version that will throw rather than silently fail.
     * Use set/setOrThrow if you require a function that will create the property if it does not exist.
     * Use createProp/createPropOrThrow if you need a version that will only create a new property, and not modify 
     * an existing property.
     *
     */

    var modify = curry(function(prop, val, obj) {
      // Return straight away if the property doesn't exist
      if (!hasOwnProperty(prop, obj))
        return obj;

      return set(prop, val, obj);
    });


    /*
     * modifyOrThrow: set the given property to the given value on the given object, returning the object.
     *                Equivalent to evaluating obj[prop] = val. The property will *not* be created when the object
     *                does not have the property: instead the function will throw a TypError. In particular, the
     *                property will not be created if it exists only in the prototype chain: hasOwnProperty(prop, obj)
     *                must be true.
     *
     *                This function will also throw when the property is not writable, when it has no setter function,
     *                or when the object is frozen.
     *
     * Use modify if you need a version that will silently fail rather than throw.
     * Use set/setOrThrow if you require a function that will create the property if it does not exist.
     * Use createProp/createPropOrThrow if you need a version that will only create a new property, and not modify 
     * an existing property.
     *
     */

    var modifyOrThrow = curry(function(prop, val, obj) {
      // Return straight away if the property doesn't exist
      if (!hasOwnProperty(prop, obj))
        throw new TypeError('Attempt to modify non-existant property');

      return setOrThrow(prop, val, obj);
    });


    /*
     * createProp: create the given property with the given value on the given object, returning the object.
     *             Equivalent to evaluating obj[prop] = val. The property will *not* be modified when the object
     *             has the property; the function will silently fail. In particular, the property will be created
     *             if it exists only in the prototype chain: hasOwnProperty(prop, obj) must be false.
     *
     *             This function will also not throw when the property is not writable (through the prototype),
     *             when it has no setter function (again through the prototype), or when the object is frozen.
     *             Again, it will silently fail.
     *
     * Use set/setOrThrow if you require a function that will create or modify the property.
     * Use modify/modifyOrThrow if you need a version that will only modify existing properties.
     * Use createPropOrThrow if you need a version that throws.
     *
     */

    var createProp = curry(function(prop, val, obj) {
      // Return straight away if the property exists
      if (hasOwnProperty(prop, obj))
        return obj;

      return set(prop, val, obj);
    });


    /*
     * createPropOrThrow: create the given property with the given value on the given object, returning the object.
     *                    Equivalent to evaluating obj[prop] = val. The property will *not* be modified when the object
     *                    has the property; the function will throw a TypeError in that case. In particular, the property
     *                    will be created if it exists only in the prototype chain: hasOwnProperty(prop, obj) must be false.
     *
     *                    This function will also throw when the property is not writable (through the prototype),
     *                    when it has no setter function (again through the prototype), or when the object is frozen.
     *
     * Use set/setOrThrow if you require a function that will create or modify the property.
     * Use modify/modifyOrThrow if you need a version that will only modify existing properties.
     * Use createProp if you need a version that does not throw.
     *
     */

    var createPropOrThrow = curry(function(prop, val, obj) {
      // Return straight away if the property exists
      if (hasOwnProperty(prop, obj))
        throw new TypeError('Attempt to create existing property');

      return setOrThrow(prop, val, obj);
    });


    /*
     * deleteProp: deletes the given property from the given object, returning the object. Equivalent to
     *             delete obj.prop. The function will silently fail when the property does not exist.
     *             It also silently fails when deletion is disallowed by the 'configurable' property
     *             of the property descriptor, or when the object is sealed or frozen.
     *
     */

    var deleteProp = curry(function(prop, obj) {
      // Deleting is considerably simpler than the "setting" cases! There's no need
      // to walk the prototype chain, and there are no other errors to propagate. Thus...
      try {
        delete obj[prop];
      } catch (e) {}

      return obj;
    });


    /*
     * deletePropOrThrow: deletes the given property from the given object, returning the object.
     *                    Equivalent to delete obj.prop. The function will throw when the property
     *                    does not exist, when deletion is disallowed by the 'configurable' property
     *                    of the property descriptor, or when the object is sealed or frozen.
     *
     */

    var deletePropOrThrow = curry(function(prop, obj) {
      // Even simpler still!
      if (!hasOwnProperty(prop, obj))
        throw new TypeError('Attempt to delete non-existant property');

      delete obj[prop];
      return obj;
    });


    /*
     * keys: a wrapper around Object.keys. Takes an object, returns an array containing the names
     *       of the object's own properties. Returns an empty array for non-objects.
     *
     * keys({foo: 1, bar: 2});  // ['foo', 'bar'];
     * keys(undefined);         // []
     *
     */

    var keys = function(obj) {
      if (typeof(obj) !== 'object' || obj === null)
        return [];

      return Object.keys(obj);
    };


    var exported = {
      callProp: callProp,
      callPropWithArity: callPropWithArity,
      createObject: createObject,
      createObjectWithProps: createObjectWithProps,
      createProp: createProp,
      createPropOrThrow: createPropOrThrow,
      defineProperty: defineProperty,
      defineProperties: defineProperties,
      deleteProp: deleteProp,
      deletePropOrThrow: deletePropOrThrow,
      extract: extract,
      getOwnPropertyDescriptor: getOwnPropertyDescriptor,
      hasOwnProperty: hasOwnProperty,
      hasProperty: hasProperty,
      instanceOf: instanceOf,
      isPrototypeOf: isPrototypeOf,
      keys: keys,
      modify: modify,
      modifyOrThrow: modifyOrThrow,
      set: set,
      setOrThrow: setOrThrow
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
