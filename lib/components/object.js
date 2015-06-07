module.exports = (function() {
  "use strict";
  /* jshint -W001 */


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var objectCurry = curryModule.objectCurry;


  var base = require('./base');
  var flip = base.flip;


  var maybe = require('./maybe');
  var Just = maybe.Just;
  var Nothing = maybe.Nothing;


  var internalUtilities = require('../internalUtilities');
  var checkObjectLike = internalUtilities.checkObjectLike;


  /*
   * <apifunction>
   *
   * callPropWithArity
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: arity: natural
   * Returns: function
   *
   * Given a property name and an arity, returns a curried function taking arity + 1 arguments. The new function
   * requires all the original arguments in their original order, and an object as its final parameter. The returned
   * function will then try to call the named property on the given object,
   *
   * Note that the function is curried in the standard sense. In particular the function is not object curried.
   *
   * Examples:
   *   var myMap = funkierJS.callPropWithArity('map', 1);
   *   myMap(f, arr); // => returns arr.map(f);
   *
   *   var myFoldr = funkierJS.callPropWithArity('reduceRight', 2);
   *   myFoldr(f, initialValue, arr); // => arr.reduceRight(f, initialValue);
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
   * <apifunction>
   *
   * callProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Returns: function
   *
   * A shorthand for `callPropWithArity(prop, 0)`. Returns a new function that takes an object, and calls the specified
   * property on the given object.
   *
   * Examples:
   *   var myObj = { return42: function() { return 42; }};
   *   var callReturn42 = funkierJS.callProp('return42');
   *   var callReturn42(myObj); // => 42
   *
   */

  var callProp = flip(callPropWithArity)(0);


  /*
   * <apifunction>
   *
   * hasOwnProperty
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around `Object.prototype.hasOwnProperty`. Takes a string representing a property name and an
   * object, and returns true if the given object itself (i.e. not objects in the prototype chain) has the specified
   * property.
   *
   * Examples:
   *   funkierJS.hasOwnProperty('funkier', {funkier: 1}); // => true
   *   funkierJS.hasOwnProperty('toString', {funkier: 1}); // => false
   *
   */

  var hasOwnProperty = curry(function(prop, obj) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  });


  /*
   * <apifunction>
   *
   * hasProperty
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around the `in` operator. Takes a string representing a property name and an object, and
   * returns true if the given object or some object in the prototype chain has the specified property.
   *
   * Examples:
   *   funkierJS.hasProperty('funkier', {funkier: 1}); // => true
   *   funkierJS.hasProperty('toString', {funkier: 1}); // => true
   *
   */

  var hasProperty = curry(function(prop, object) {
    return prop in object;
  });


  /*
   * <apifunction>
   *
   * instanceOf
   *
   * Category: Object
   *
   * Parameter: constructor: function
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around the `instanceof` operator. Takes a constructor function and an object, and returns true
   * if the function's prototype property is in the prototype chain of the given object.
   *
   * Examples:
   *   var Constructor = function() {};
   *   funkierJS.instanceOf(Constructor, new Constructor()); // => true
   *   funkierJS.instanceOf(Function, {}); // => false
   *
   */

  var instanceOf = curry(function(constructor, object) {
    return object instanceof constructor;
  });


  /*
   * <apifunction>
   *
   * isPrototypeOf
   *
   * Category: Object
   *
   * Parameter: protoObject: objectLike
   * Parameter: obj: objectLike
   * Returns: boolean
   *
   * A curried wrapper around `Object.prototype.isPrototypeOf`. Takes two objects: the prototype object, and the object
   * whose prototype chain you wish to check.  Returns true if protoObj is in the prototype chain of o.
   *
   * Examples:
   *   var Constructor = function() {};
   *   funkierJS.isPrototypeOf(Constructor.prototype, new Constructor()); // => true
   *   funkierJS.isPrototypeOf(Function.prototype, {}); // => false
   *
   */

  var isPrototypeOf = curry(function(proto, obj) {
    return Object.prototype.isPrototypeOf.call(proto, obj);
  });


  /*
   * <apifunction>
   *
   * createObject
   *
   * Category: Object
   *
   * Parameter: protoObject: objectLike
   * Returns: object
   *
   * Returns a new object whose internal prototype property is the given object protoObject.
   *
   * Note: this is an unary function that discards excess arguments. If you need to simultaneously add new properties
   * to the created object, use [`createObjectWithProps`](#createObjectWithProps).
   *
   * Examples:
   *   var obj = {};
   *   var newObj = funkierJS.createObject(obj);
   *   funkierJS.isPrototypeOf(obj, newObj); // => true
   *
   */

  var createObject = curry(function(obj) {
    return Object.create(obj);
  });


  /*
   * <apifunction>
   *
   * createObjectWithProps
   *
   * Category: Object
   *
   * Parameter: protoObject: objectLike
   * Parameter: descriptorsObject: object
   * Returns: object
   *
   * Creates an object whose internal prototype property is protoObj, and which has the additional properties described
   * in the given property descriptor object descriptorsObject. The property descriptor object is expected to be of the
   * form accepted by `Object.create`, `Object.defineProperties` etc.
   *
   * Examples:
   *   var obj = {};
   *   var newObj = funkierJS.createObjectWithProps(obj, {prop: {configurable: false, enumerable: false,
   *                                                             writeable: true, value: 1}});
   *   funkierJS.isPrototypeOf(obj, newObj); // => true
   *   funkierJS.hasOwnProperty('prop', newObj); // => true',
   *
   */

  var createObjectWithProps = curry(function(obj, descriptor) {
    return Object.create(obj, descriptor);
  });


  /*
   * <apifunction>
   *
   * defineProperty
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: descriptor: object
   * Parameter: o: objectLike
   * Returns: objectLike
   *
   * A curried wrapper around `Object.defineProperty`. Takes a property name string, a property descriptor object and
   * the object that the property hould be defined on. Returns the object o, after having defined the relevant property
   * per the descriptor. Throws a TypeError if the descriptor is not an object.
   *
   * Examples:
   *   var a = {};',
   *   funkierJS.hasOwnProperty('foo', a); // => false
   *   funkierJS.defineProperty('foo', {value: 42}, a);
   *   funkierJS.hasOwnProperty('foo', a); // => true
   *
   */

  var defineProperty = curry(function(prop, descriptor, obj) {
    descriptor = checkObjectLike(descriptor, {strict: true});
    return Object.defineProperty(obj, prop, descriptor);
  });


  /*
   * <apifunction>
   *
   * defineProperties
   *
   * Category: Object
   *
   * Parameter: descriptors: object
   * Parameter: o: objectLike
   * Returns: objectLike
   *
   * A curried wrapper around `Object.defineProperties`. Takes an object whose own properties map to property
   * descriptors, and an object o. Returns the object o, after having defined the relevant properties named by the
   * properties of the descriptors parameter, and whose values are dictated by the descriptor parameter.
   *
   * Examples:
   *   var a = {};',
   *   funkierJS.hasOwnProperty('foo', a); // => false
   *   funkierJS.defineProperties({foo: {value: 42}}, a);
   *   funkierJS.hasOwnProperty('foo', a); // => true
   *
   */

  var defineProperties = curry(function(descriptors, obj) {
    // We're not strict here: for example one might want to install array-like properties from an array
    descriptors = checkObjectLike(descriptors, {allowNull: false});
    obj = checkObjectLike(obj, {allowNull: false});
    return Object.defineProperties(obj, descriptors);
  });


  /*
   * <apifunction>
   *
   * getOwnPropertyDescriptor
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: o: objectLike
   * Returns: object
   *
   * A curried wrapper around `Object.getOwnPropertyDescriptor`. Takes a property name and an object. If the object
   * itself has the given property, then the object's property descriptor for the given object is returned, otherwise
   * it returns undefined.
   *
   * Examples:
   *   var a = {foo: 42};',
   *   funkierJS.getOwnPropertyDescriptor('foo', a); // => {configurable: true, enumerable: true, writable: true,
   *                                                        value: 42}
   *   funkierJS.getOwnPropertyDescriptor('toString', a); // => undefined',
   *
   */

  var getOwnPropertyDescriptor = flip(Object.getOwnPropertyDescriptor);


  /*
   * <apifunction>
   *
   * extract
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: object
   * Returns: any
   *
   * Synonyms: tap
   *
   * Extracts the given property from the given object. Equivalent to evaluating `obj[prop]`.
   *
   * Examples:
   *   funkierJS.extract('foo', {foo: 42}); // => 42
   *
   */

  var extract = curry(function(prop, obj) {
    return obj[prop];
  });


  /*
   * <apifunction>
   *
   * extractOrDefault
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: default: any
   * Parameter: obj: object
   * Returns: any
   *
   * Synonyms: defaultTap
   *
   * Extracts the given property from the given object, unless the property is not found in the object or its prototype
   * chain, in which case the specified default value is returned.
   *
   * Examples:
   *   funkierJS.extractOrDefaultt('foo', 43, {bar: 42}); // => 43
   *
   */

  var extractOrDefault = curry(function(prop, defaultVal, obj) {
    if (!(prop in obj))
      return defaultVal;

    return obj[prop];
  });


  /*
   * <apifunction>
   *
   * maybeExtract
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: object
   * Returns: Maybe
   *
   * Synonyms: safeExtract | maybeTap | safeTap
   *
   * Extracts the given property from the given object, and wraps it in a [`Just`](#Just) value. When the property is
   * not present, either in the object, or its prototype chain, then [`Nothing`](#Nothing) is returned.
   *
   * Examples:
   *   funkierJS.maybeExtract('foo', {}); // => Nothing
   *
   */

  var maybeExtract = curry(function(prop, obj) {
    if (!(prop in obj))
      return Nothing;

    // Handle case where there is no getter
    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (('set' in descriptor) && descriptor.get === undefined)
      return Nothing;

    return Just(obj[prop]);
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
  var engineHandlesProtosCorrectly = (function() {
    var A = function(){};
    Object.defineProperty(A.prototype, 'foo', {writable: false});
    var compliant = false;
    var b = new A();

    try {
      b.foo = 1;
    } catch (e) {
      compliant = true;
    }

    return compliant;
  })();


  // Utility function for set: work backwards to Object.prototype, looking for a property descriptor
  var findPropertyDescriptor = function(prop, obj) {
    var descriptor;
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


 // Utility function, taking a property and an object, returning true if that property is writable
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
   * <apifunction>
   *
   * set
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: setProp
   *
   * Sets the given property to the given value on the given object, returning the object. Equivalent to evaluating
   * `o[prop] = value`. The property will be created if it doesn't exist on the object. Throws when the property is
   * not writable, when it has no setter function, when the object is frozen, or when it is sealed and the property
   * is not already present.
   *
   * Alternatively, one can use [`safeSet`](#safeSet) for a version that will not throw in the above circumstances.
   * Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
   * created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when
   * one wants to ensure existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.set('foo', 42, a); // => returns a
   *   a.foo // => 42
   *
   */

  var set = curry(function(prop, val, obj) {
    // We manually emulate the operation of [[CanPut]], rather than just setting in a
    // try-catch. We don't want to suppress other errors: for example the property's
    // setter function might throw
    var writable = checkIfWritable(prop, obj);

    if (writable && !hasOwnProperty(prop, obj) && (Object.isSealed(obj) || !Object.isExtensible(obj)))
      writable = false;

    if (!writable)
      throw new Error('Cannot write to property ' + prop);

    obj[prop] = val;
    return obj;
  });


  /*
   * <apifunction>
   *
   * safeSet
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: Maybe
   *
   * Synonyms: maybeSet | maybeSetProp | safeSetProp
   *
   * Sets the given property to the given value on the given object, returning the object wrapped in a [`Just`](#Just)
   * value when successful. Equivalent to evaluating `o[prop] = value`. The property will be created if it doesn't exist
   * on the object. If unable to modify or create the property, then [`Nothing`](#Nothing) will be returned.
   *
   * Alternatively, one can use [`set`](#set) for a version that will throw in the above circumstances.
   * Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to guarantee the property is not
   * created when it does not exist, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when
   * one wants to ensure existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   Object.freeze(a);
   *   funkierJS.safeSet('foo', 42, a); // => returns Nothing
   *   a.foo // => 1
   *
   */

  var safeSet = curry(function(prop, val, obj) {
    // We manually emulate the operation of [[CanPut]], rather than just setting in a
    // try-catch. We don't want to suppress other errors: for example the property's
    // setter function might throw
    var writable = checkIfWritable(prop, obj);

    if (writable && !hasOwnProperty(prop, obj) && (Object.isSealed(obj) || !Object.isExtensible(obj)))
      writable = false;

    if (!writable)
      return Nothing;

    obj[prop] = val;
    return Just(obj);
  });


  /*
   * <apifunction>
   *
   * modify
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: modifyProp
   *
   * Sets the given property to the given value on the given object, providing it exists, and returns the object.
   * Equivalent to evaluating `o[prop] = value`. The property will not be created when it doesn't exist on the object.
   * Throws when the property is not writable, when it has no setter function, or when the object is frozen.
   *
   * Alternatively, one can use [`safeModify`](#safeModify) for a version that will not throw in the above
   * circumstances.  Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties
   * and create them where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when
   * one wants to ensure existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.modify('foo', 42, a); // => returns a
   *   a.foo // => 42
   *
   */

  var modify = curry(function(prop, val, obj) {
    // Return straight away if the property doesn't exist
    if (!hasProperty(prop, obj))
      throw new Error('Cannot modify non-existent property ' + prop);

    return set(prop, val, obj);
  });


  /*
   * <apifunction>
   *
   * safeModify
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: maybeModify | maybeModifyProp | safeModifyProp
   *
   * Sets the given property to the given value on the given object, providing it exists, and returns the object,
   * wrapped in a [`Just`](#Just) value when successful. Equivalent to evaluating `o[prop] = value`. The property will
   * not be created when it doesn't exist on the object; nor will it be amended when the property is not writable, when
   * it has no setter function, or when the object is frozen. In such cases, [`Nothing`](#Nothing) will be returned.
   *
   * Alternatively, one can use [`modify`](#modify) for a version that will throw in the above circumstances.
   * Similarly, [`set`](#set) and [`safeSet`](#safeSet) can be used to both modify existing properties and create them
   * where required, or [`create`](#create) and [`safeCreateProp`](#safeCreateProp) can be used when one wants to ensure
   * existing values will not be changed.
   *
   * Examples:
   *   var a = {foo: 1};
   *   Object.freeze(a);
   *   funkierJS.safeModify('foo', 42, a); // => Nothing
   *   a.foo // => 1
   *
   */

  var safeModify = curry(function(prop, val, obj) {
    // Return straight away if the property doesn't exist
    if (!hasProperty(prop, obj))
      return Nothing;

    return safeSet(prop, val, obj);
  });


  /*
   * <apifunction>
   *
   * createProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Creates the given property to the given value on the given object, returning the object. Equivalent to evaluating
   * `o[prop] = value`. The property will be not be modified if it already exists; in that case this method will throw.
   * Additionally, it throws when the object is frozen, sealed, or cannot be extended. The property will be
   * successfully created when it already exists, but only in the prototype chain.
   *
   * Alternatively, one can use [`safeCreateProp`](#safeCreateProp) for a version that will not throw in the above
   * circumstances.  Similarly, [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing
   * properties without creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or
   * create the property as required.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.create('bar', 42, a); // => returns a
   *   a.bar // => 42
   *
   */

  var createProp = curry(function(prop, val, obj) {
    // Return straight away if the property exists
    if (hasOwnProperty(prop, obj))
      throw new Error('Attempt to recreate existing property ' + prop);

    return set(prop, val, obj);
  });


  /*
   * <apifunction>
   *
   * safeCreateProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: val: any
   * Parameter: obj: objectLike
   * Returns: Maybe
   *
   * Synonyms: maybeCreate
   *
   *
   * Creates the given property to the given value on the given object, returning the object wrapped in a Just.
   * Equivalent to evaluating o[prop] = value. The property will be not be modified if it already exists; in
   * that case Nothing will be returned. Additionally, Nothing will be returned when the object is frozen, sealed, or
   * cannot be extended. Note that the property will be successfully created when it already exists, but only in the
   * prototype chain.
   *
   * Alternatively, one can use [`create`](#create) for a version that will throw on failure. Similarly,
   * [`modify`](#modify) and [`safeModify`](#safeModify) can be used to modify existing properties without
   * creating them, and [`set`](#set) and [`safeSet`](#safeSet) can be used to either modify or create the property as
   * required.
   *
   * Examples:
   *   var a = {foo: 1};
   *   Object.freeze(a);
   *   funkierJS.safeCreateProp('bar', 42, a); // => returns Nothing
   *   a.foo // => undefined
   *
   */

  var safeCreateProp = curry(function(prop, val, obj) {
    // Return straight away if the property exists
    if (hasOwnProperty(prop, obj))
      return Nothing;

    return safeSet(prop, val, obj);
  });



  /*
   * <apifunction>
   *
   * deleteProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Deletes the given property from the given the given object, returning the object. Equivalent to evaluating
   * `delete o[prop]`. Throws when the property is not configurable, including when the object is frozen or sealed.
   *
   * Alternatively, one can use [`safeDeleteProp`](#safeDeleteProp) that will return the appropriate Maybe value
   * depending on the outcome of the operation.
   *
   * Examples:
   *   var a = {foo: 1};
   *   funkierJS.delete('foo',  a); // => returns a
   *   a.foo // => undefined
   *
   */

  var deleteProp = curry(function(prop, obj) {
    obj = checkObjectLike(obj);

    if (!obj.hasOwnProperty(prop))
      return obj;

    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (descriptor.configurable === false)
      throw new Error('Cannot delete property ' + prop + ': not configurable!');

    delete obj[prop];
    return obj;
  });


  /*
   * <apifunction>
   *
   * safeDeleteProp
   *
   * Category: Object
   *
   * Parameter: prop: string
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Synonyms: maybeDelete
   *
   * Deletes the given property from the given the given object, returning the object wrapped as a [`Just`](#Just)
   * value. Equivalent to evaluating `delete o[prop]`. When the property is not configurable (either due to the
   * individual descriptor or the object being frozen or sealed) then [`Nothing`](#Nothing) will be returned.
   *
   * Alternatively, one can use [`delete`](#delete) that will return not wrap the object, and throw on error.
   *
   * Examples:
   *   var a = {};
   *   funkierJS.delete('foo',  a); // => returns Nothing
   *
   */

  var safeDeleteProp = curry(function(prop, obj) {
    obj = checkObjectLike(obj);

    if (!obj.hasOwnProperty(prop))
      return Just(obj);

    var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (descriptor.configurable === false)
      return Nothing;

    delete obj[prop];
    return Just(obj);
  });


  /*
   * <apifunction>
   *
   * keys
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * A wrapper around `Object.keys`. Takes an object, and returns an array containing the names of the object's own
   * properties. Returns an empty array for non-objects.
   *
   * Examples:
   *   funkierJS.keys({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on native
   *                                     //    environment
   *
   */

  var keys = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return Object.keys(obj);
  });


  /*
   * <apifunction>
   *
   * getOwnPropertyNames
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * A wrapper around `Object.getOwnPropertyNames`. Takes an object, and returns an array containing the names of the
   * object's own properties, including non-enumerable properties. Returns an empty array for non-objects. The order of
   * the property names is not defined.
   *
   * Examples:
   *   funkierJS.getOwnPropertyNames({foo: 1, bar: 2}); // => returns ['foo', 'bar'] or ['bar', 'foo'] depending on
   *                                                    // native environment
   *
   */

  var getOwnPropertyNames = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return Object.getOwnPropertyNames(obj);
  });



  /*
   * <apifunction>
   *
   * keyValues
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
   * of a property from the object, and the second element is the value of the property. This function only returns
   * key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
   * is not defined.
   *
   * Examples:
   *   funkierJS.keyValues({foo: 1, bar: 2}); // => returns [['foo', 1], ['bar', 2]] or [['bar', 2], ['foo', 1]]
   *                                          // depending on native environment
   *
   */

  var keyValues = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return keys(obj).map(function(k) {return [k, obj[k]];});
  });


  /*
   * <apifunction>
   *
   * descriptors
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: array
   *
   * Takes an object, and returns an array containing 2-element arrays. The first element of each sub-array is the name
   * of a property from the object, and the second element is its property descriptor. This function only returns
   * key-value pairs for the object's own properties. Returns an empty array for non-objects.  The order of the values
   * is not defined.
   *
   * Examples:
   *   funkierJS.descriptors({foo: 1}); // => returns [['foo', {configurable: true, writable: true, enumerable: true,
   *                                                            value: 1}]
   *
   */

  var descriptors = curry(function(obj) {
    if (typeof(obj) !== 'object' || obj === null)
      return [];

    return keys(obj).map(function(k) {return [k, getOwnPropertyDescriptor(k, obj)];});
  });


  /*
   * <apifunction>
   *
   * clone
   *
   * Category: Object
   *
   * Synonyms: shallowClone
   *
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Returns a shallow clone of the given object. All enumerable and non-enumerable properties from the given object
   * and its prototype chain will be copied, and will be enumerable or non-enumerable as appropriate. Note that values
   * from `Object.prototype`, `Array.prototype`, will not be copied, but those prototypes will be in the prototype chain
   * of the clone if they are in the prototype chain of the original object. Functions are returned unchanged.
   * Non-primitive values are copied by reference.
   *
   * Exercise caution when cloning properties that have get/set functions defined in the descriptor: the cloned object
   * will have these same functions using the same scope. Getting/setting such a property in the clone may affect the
   * corresponding property in the original.
   *
   */

  var shallowCloneInternal = function(obj, isRecursive) {
    if (typeof(obj) === 'function')
      return obj;

    if (typeof(obj) !== 'object')
      throw new TypeError('shallowClone called on non-object');

    if (Array.isArray(obj)) {
      var newArray = obj.slice();

      Object.keys(obj).forEach(function(k) {
        var n = k - 0;
        if (isNaN(n)) {
          newArray[k] = obj[k];
          return;
        }

        if (Math.floor(n) === n && Math.ceil(n) === n) return;
        newArray[k] = obj[k];
      });

      return newArray;
    }

    if (obj === null)
      return isRecursive ? Object.create(null) : null;

    if (obj === Object.prototype)
      return {};

    var result = shallowCloneInternal(Object.getPrototypeOf(obj), true);

    Object.getOwnPropertyNames(obj).forEach(function(k) {
      var desc = Object.getOwnPropertyDescriptor(obj, k);
      Object.defineProperty(result, k, desc);
    });

    return result;
  };


  var shallowClone = curry(function(obj) {
    return shallowCloneInternal(obj, false);
  });


  /*
   * <apifunction>
   *
   * extend
   *
   * Category: Object
   *
   * Parameter: source: objectLike
   * Parameter: dest: objectLike
   * Returns: objectLike
   *
   * Takes two objects, source and dest, and walks the prototype chain of source, copying all enumerable properties
   * into dest. Any extant properties with the same name are overwritten. Returns the modified dest object. All
   * properties are shallow-copied: in other words, if `foo` is a property of source whose value is an object, then
   * afterwards `source.foo === dest.foo` will be true.
   *
   * Examples:
   *   var a = {bar: 1};
   *   funkierJS.extend(a, {foo: 42}); // => a === {foo: 42, bar: 1}
   *
   */

  var extend = curry(function(source, dest) {
    for (var k in source)
      dest[k] = source[k];

    return dest;
  });


  /*
   * <apifunction>
   *
   * extendOwn
   *
   * Category: Object
   *
   * Parameter: source: objectLike
   * Parameter: dest: objectLike
   * Returns: objectLike
   *
   * Takes two objects, source and dest, and copies all enumerable properties from source into dest. Properties from
   * source's prototype chain are not copied. Any extant properties with the same name are overwritten.
   * Returns the modified dest object. All properties are shallow-copied: in other words, if `foo` is a property of
   * source whose value is an object, then afterwards `source.foo === dest.foo` will be true.
   *
   * Examples:
   *   var a = funkierJS.createObject({bar: 1});
   *   a.baz = 2;
   *   var b = {foo: 3};
   *   funkierJS.extendOwn(b, a); // b == {foo: 3, baz: 2}
   *
   */

  var extendOwn = curry(function(source, dest) {
    var keys = Object.keys(source);

    keys.forEach(function(k) {
      dest[k] = source[k];
    });

    return dest;
  });


  /*
   * <apifunction>
   *
   * curryOwn
   *
   * Category: Object
   *
   * Parameter: obj: objectLike
   * Returns: objectLike
   *
   * Takes an object, and providing every enumerable function is writable, (i.e. the function has not been configured as
   * writable: false), then curries the member functions of the object using the [`objectCurry`](#objectCurry) method.
   * If any member functions are found that do not meet this requirement, then the object is left unchanged. Only the
   * object's own properties are affected; those in the prototype chain are unperturbed. Properties with getter/setters
   * in their descriptor are ignored.
   *
   * The all-or-nothing approach was taken to avoid the difficulty in reasoning that would ensue on partial success:
   * the client would be left having to manually enumerate the functions to see which ones did get curried. The
   * avoidance of functions returned from properties with getter/setter descriptors is to avoid any lexical scoping
   * ambiguities.
   *
   * Examples:
   *   var obj = {foo: function(x, y) { return this.bar + x + y; }, bar: 10};
   *   funkierJS.curryOwn(obj);
   *   obj.foo(2)(3); // => 15
   *
   */

  var curryOwn = curry(function(obj) {
    var keys = Object.keys(obj);

    var funcKeys = keys.filter(function(k) {
      var desc = Object.getOwnPropertyDescriptor(obj, k);
      return typeof(obj[k]) === 'function' && desc.hasOwnProperty('configurable') && desc.hasOwnProperty('writable');
    });

    if (funcKeys.some(function(k) { return Object.getOwnPropertyDescriptor(obj, k).writable === false; }))
      return obj;

    funcKeys.forEach(function(k) {
      obj[k] = objectCurry(obj[k]);
    });

    return obj;
  });


  return {
    callProp: callProp,
    callPropWithArity: callPropWithArity,
    clone: shallowClone,
    createObject: createObject,
    createObjectWithProps: createObjectWithProps,
    createProp: createProp,
    curryOwn: curryOwn,
    descriptors: descriptors,
    defaultTap: extractOrDefault,
    defineProperty: defineProperty,
    defineProperties: defineProperties,
    deleteProp: deleteProp,
    extend: extend,
    extendOwn: extendOwn,
    extract: extract,
    extractOrDefault: extractOrDefault,
    getOwnPropertyDescriptor: getOwnPropertyDescriptor,
    getOwnPropertyNames: getOwnPropertyNames,
    hasOwnProperty: hasOwnProperty,
    hasProperty: hasProperty,
    instanceOf: instanceOf,
    isPrototypeOf: isPrototypeOf,
    keys: keys,
    keyValues: keyValues,
    maybeCreate: safeCreateProp,
    maybeDelete: safeDeleteProp,
    maybeExtract: maybeExtract,
    maybeModify: safeModify,
    maybeModifyProp: safeModify,
    maybeSet: safeSet,
    maybeSetProp: safeSet,
    maybeTap: maybeExtract,
    modify: modify,
    modifyProp: modify,
    safeCreateProp: safeCreateProp,
    safeDeleteProp: safeDeleteProp,
    safeExtract: maybeExtract,
    safeModify: safeModify,
    safeModifyProp: safeModify,
    safeSet: safeSet,
    safeSetProp: safeSet,
    safeTap: maybeExtract,
    set: set,
    setProp: set,
    shallowClone: shallowClone,
    tap: extract
  };
})();
