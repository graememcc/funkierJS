(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;
    var curryWithArity = curryModule.curryWithArity;

    var base = require('./base');
    var flip = base.flip;
    var permuteLeft = base.permuteLeft;

    var utils = require('./utils');
    var checkObjectLike = utils.checkObjectLike;
    var defineValue = utils.defineValue;


    var callPropWithArity = defineValue(
      'name: callPropWithArity',
      'signature: prop: string, arity: number',
      'classification: object',
      '',
      'Takes a property name, and an arity. Returns a curried function of (arity + 1)',
      'arguments. The new function assumes that the given property is a callable value',
      'in the given object and so takes the (arity) arguments followed by an object to',
      'call the property on, returning the result. The parameters are supplied to the',
      'callable property in the order given.',
      '--',
      'var myMap = callPropWithArity(\'map\', 1);',
      'myMap(f, arr);  // returns arr.map(f);',
      'var myFoldr = callPropWithArity(\'reduceRight\', 2);',
      'myFoldr(f, initialValue, arr); // returns arr.reduceRight(f, initialValue);',
      '',
      'var myConstructor = function() {};',
      'myConstructor.prototype.return42 = function() {return 42;};',
      'var myObj = new myConstructor();',
      'var call42 = callPropWithArity(\return42\', 0);',
      'call42(myObj);  // calls myObj.return42();',
      curry(function(prop, arity) {
        return curryWithArity(arity + 1, function() {
          // curryWithArity guarantees we will be called with arity + 1 args
          var propArgs = [].slice.call(arguments, 0, arity);
          var obj = arguments[arity];

          return obj[prop].apply(obj, propArgs);
        });
      })
    );


    var callProp = defineValue(
      'name: callProp',
      'signature: prop: string',
      'classification: object',
      '',
      'A shorthand for [[callPropWithArity]](prop, 0). Returns a new function that',
      'takes an object and calls the specified property on the given object.',
      '--',
      'var myConstructor = function() {};',
      'myConstructor.prototype.return42 = function() {return 42;};',
      'var myObj = new myConstructor();',
      'var call42 = callProp(\'return42\');',
      'call42(myObj);  // calls myObj.return42();',
      flip(callPropWithArity)(0)
    );


    // XXX Bug: Use proto.hasOwnProperty in case object has own implementation
    var hasOwnProperty = defineValue(
      'name: hasOwnProperty',
      'signature: prop: string, o: Object',
      'classification: object',
      '',
      'A curried wrapper around Object.prototype.hasOwnProperty. Takes a string',
      'representing a property name and an object, and returns true if the given object',
      '(and not object\'s in the prototype chain) has the specified property.',
      '--',
      'hasOwnProperty(\'funkier\', {funkier: 1}); // true',
      'hasOwnProperty(\'toString\', {funkier: 1}); // false',
      callPropWithArity('hasOwnProperty', 1)
    );



    var hasProperty = defineValue(
      'name: hasProperty',
      'signature: prop: string, o: Object',
      'classification: object',
      '',
      'A curried wrapper around the \'in\' operator. Takes a string representing a property',
      'name and an object, and returns true if the given object or some property in the',
      'object\'s prototype chain has the specified property.',
      '--',
      'hasProperty(\'funkier\', {funkier: 1}); // true',
      'hasProperty(\'toString\', {funkier: 1}); // true',
      curry(function(prop, object) {
        return prop in object;
      })
    );


    var instanceOf = defineValue(
      'name: instanceOf',
      'signature: f: function, o: Object',
      'classification: object',
      '',
      'A curried wrapper around the \'instanceof\' operator. Takes a constructor',
      'function and an object, and returns true if the function\'s prototype property',
      'is in the prototype chain of the given object.',
      '--',
      'var Constructor = function() {};',
      'instanceOf(Constructor, new Constructor()); // true',
      'instanceOf(Function, {}); // false',
      curry(function(constructor, object) {
        return object instanceof constructor;
      })
    );


    // XXX Bug: Use proto.isPrototypeOf in case object has own implementation
    var isPrototypeOf = defineValue(
      'name: isPrototypeOf',
      'signature: protoObj: Object, o: Object',
      'classification: object',
      '',
      'A curried wrapper around Object.prototype.isPrototypeOf. Takes two objects:',
      'the prototype object, and the object whose prototype chain you wish to check.',
      'Returns true if protoObj is in the prototype chain of o.',
      '--',
      'var Constructor = function() {};',
      'isPrototypeOf(Constructor.prototype, new Constructor()); // true',
      'isPrototypeOf(Function.prototype, {}); // false',
      flip(callPropWithArity('isPrototypeOf', 1))
    );


    var createObject = defineValue(
      'name: createObject',
      'signature: protoObj: Object',
      'classification: object',
      '',
      'Returns a new object whose internal prototype property is the given object',
      'protoObj.',
      '',
      'Note: this is an unary function that discards excess arguments. If you need to',
      'add new properties at the same time, use [[createObjectWithProps]].',
      '--',
      'var obj = {};',
      'var newObj = createObject(obj);',
      'isPrototypeOf(obj, newObj); // true',
      curry(function(obj) {
        return Object.create(obj);
      })
    );


    var createObjectWithProps = defineValue(
      'name: createObjectWithProps',
      'signature: protoObj: Object, propsObj: Object',
      'classification: object',
      '',
      'Creates an object whose internal prototype property is protoObj, and which has',
      'the additional properties described in the given property descriptor object',
      'propsObj. The property descriptor object is expected to be of the form accepted',
      'by Object.create, Object.defineProperties etc.',
      '--',
      'var obj = {};',
      'var newObj = createObjectWithProps(obj, {prop: configurable: false, enumerable: false, writeable: true, value: 1}});',
      'isPrototypeOf(obj, newObj); // true',
      'hasOwnProperty(\'prop\', newObj); // true',
      curry(function(obj, descriptor) {
        return Object.create(obj, descriptor);
      })
    );


    var defineProperty = defineValue(
      'name: defineProperty',
      'signature: prop: string, descriptor: Object, o: Object',
      'classification: object',
      '',
      'A curried wrapper around Object.defineProperty. Takes a property name string, a',
      'property descriptor and the object that the object should be defined on. Returns',
      'the object o.',
      '',
      'Throws a TypeError if the descriptor is not an object.',
      '--',
      'var a = {};',
      'hasOwnProperty(\'foo\', a); // false',
      'defineProperty(\'foo\', {value: 42}, a);',
      'hasOwnProperty(\'foo\', a); // true',
      curry(function(prop, descriptor, obj) {
        descriptor = checkObjectLike(descriptor, {strict: true});
        return Object.defineProperty(obj, prop, descriptor);
      })
    );


    var defineProperties = defineValue(
      'name: defineProperties',
      'signature: descriptors: Object, o: Object',
      'classification: object',
      '',
      'A curried wrapper around Object.defineProperties. Takes an object whose own',
      'properties map to property descriptors and the object that the object should be',
      'defined on. Returns the object o.',
      '--',
      'var a = {};',
      'hasOwnProperty(\'foo\', a); // false',
      'defineProperties({foo: {value: 42}}, a);',
      'hasOwnProperty(\'foo\', a); // true',
      curry(function(descriptors, obj) {
        // We're not strict here: for example one might want to install array-like properties from an array
        descriptors = checkObjectLike(descriptors, {allowNull: false});
        obj = checkObjectLike(obj, {allowNull: false});
        return Object.defineProperties(obj, descriptors);
      })
    );


    var getOwnPropertyDescriptor = defineValue(
      'name: getOwnPropertyDescriptor',
      'signature: prop: string, o: Object',
      'classification: object',
      '',
      'A curried wrapper around Object.getOwnPropertyDescriptor. Takes a property name',
      'and an object. If the object itself has the given property, then the object\'s',
      'property descriptor for the given object is returned, otherwise it returns',
      'undefined.',
      '--',
      'var a = {foo: 42};',
      'getOwnPropertyDescriptor(\'foo\', a); // {configurable: true, enumerable: true, writable: true',
      '                                         value: 42}',
      'getOwnPropertyDescriptor(\'toString\', a); // undefined',
      flip(Object.getOwnPropertyDescriptor)
    );


    var extract = defineValue(
      'name: extract',
      'signature: prop: string, o: Object',
      'classification: object',
      '',
      'Extracts the given property for the given object. Equivalent to evaluating obj[prop].',
      '--',
      'extract(\'foo\', {foo: 42}); // 42',
      curry(function(prop, obj) {
        return obj[prop];
      })
    );


    var extractOrDefault = defineValue(
      'name: extractOrDefault',
      'signature: prop: string, default: any, o: Object',
      'classification: object',
      '',
      'Takes the name of a property, a default value, and an object. Attempts to read',
      'the value of the property from the object, and returns it if present. Returns',
      'the given default value if if the property is not present, or cannot be read.',
      '--',
      'extractOrDefault(\'foo\', 1, {foo: 42}); // 42',
      'extractOrDefault(\'bar\', 1, {foo: 42}); // 1',
      curry(function(prop, defaultVal, obj) {
        if (!(prop in obj))
          return defaultVal;

        return obj[prop];
      })
    );


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


    var set = defineValue(
      'name: set',
      'signature: prop: string, value: any, o: Object',
      'classification: object',
      '',
      'Sets the given property to the given value on the given object, returning the',
      'object. Equivalent to evaluating o[prop] = value. The property will be created',
      'if it doesn\'t exist on the object. This function will not throw when the',
      'property is not writable, when it has no setter function, or when the object is',
      'frozen. Likewise, if the property must be created, it will not throw if the',
      'object is sealed, frozen, or Object.preventExtensions has been called. It will',
      'fail silently in all these cases.',
      '',
      'Use [[setOrThrow]] if you require a function that throws in such circumstances.',
      'Use [[modify]]/[[modifyOrThrow]] if you require a function that will only modify',
      'existing properties.',
      'Use [[createProp]]/[[createPropOrThrow]] if you need a version that will only',
      'create a new property, and not modify.',
      '--',
      'var a = {foo: 1};',
      'set(\'foo\', 42, a);',
      'a.foo; // 42',
      curry(function(prop, val, obj) {
        // We manually emulate the operation of [[CanPut]], rather than just setting in a
        // try-catch. We don't want to suppress other errors: for example the set function
        // might throw
        var writable = checkIfWritable(prop, obj);

        if (writable && !hasOwnProperty(prop, obj) && (Object.isSealed(obj) || !Object.isExtensible(obj)))
          writable = false;

        if (writable)
          obj[prop] = val;
        return obj;
      })
    );


    var setOrThrow = defineValue(
      'name: setOrThrow',
      'signature: prop: string, value: any, o: Object',
      'classification: object',
      '',
      'Sets the given property to the given value on the given object, returning the',
      'object. Equivalent to evaluating o[prop] = value. The property will be created if',
      'it doesn\'t exist on the object. This function will throw when the property is',
      'not writable, when it has no setter function, or when the object is frozen.',
      'Likewise, if the property must be created, it will throw if the object is sealed,',
      'frozen, or not extensible.',
      '',
      'Use [[set]] if you require a function that does not throw in such circumstances.',
      'Use [[modify]]/[[modifyOrThrow]] if you require a function that will only modify',
      'existing properties.',
      'Use [[createProp]]/[[createPropOrThrow]] if you need a version that will only',
      'create a new property, and not modify.',
      '--',
      'var a = {};',
      'Object.freeze(a);',
      'setOrThrow(\'foo\', 42, a); // Throws',
      curry(function(prop, val, obj) {
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
      })
    );


    var modify = defineValue(
      'name: modify',
      'signature: prop: string, value: any, o: Object',
      'classification: object',
      '',
      'Sets the given property to the given value on the given object, returning the',
      'object. Equivalent to evaluating o[prop] = value. The property will *not* be',
      'created when the object does not have the property; the function will silently',
      'fail. In particular, the property will not be created if it exists only in the',
      'prototype chain: hasOwnProperty(prop, obj) must be true.',
      '',
      'This function will also not throw when the property is not writable, when it has',
      'no setter function, or when the object is frozen. Again, it will silently fail.',
      '',
      'Use [[modifyOrThrow]] if you need a version that will throw rather than silently',
      'fail.',
      'Use [[set]]/[[setOrThrow]] if you require a function that will create the',
      'property if it does not exist.',
      'Use [[createProp]]/[[createPropOrThrow]] if you need a version that will only',
      'create a new property, and not modify an existing property.',
      '--',
      'var a = {};',
      'modify(\'foo\', 42, a); // a is still an empty object',
      'modify(\'foo\', 42, {foo: 12}); // {foo: 42}',
      curry(function(prop, val, obj) {
        // Return straight away if the property doesn't exist
        if (!hasOwnProperty(prop, obj))
          return obj;

        return set(prop, val, obj);
      })
    );


    var modifyOrThrow = defineValue(
      'name: modifyOrThrow',
      'signature: prop: string, value: any, o: Object',
      'classification: object',
      '',
      'Sets the given property to the given value on the given object,',
      'returning the object. Equivalent to evaluating o[prop] = value. The property',
      'will *not* be created when the object does not have the property: instead the',
      'function will throw a TypeError. In particular, the property will not be created',
      'if it exists only in the prototype chain: hasOwnProperty(prop, obj) must be true.',
      '',
      'This function will also throw when the property is not writable, when it has no',
      'setter function, or when the object is frozen.',
      '',
      'Use [[modify]] if you need a version that will silently fail rather than throw.',
      'Use [[set]]/[[setOrThrow]] if you require a function that will create the',
      'property if it does not exist.',
      'Use [[createProp]]/[[createPropOrThrow]] if you need a version that will only',
      'create a new property, and not modify an existing property.',
      '--',
      'modifyOrThrow(\'foo\', 42, {foo: 12}); // {foo: 42}',
      'var a = {};',
      'modifyOrThrow(\'foo\', 42, a); // Throws',
      curry(function(prop, val, obj) {
        // Return straight away if the property doesn't exist
        if (!hasOwnProperty(prop, obj))
          throw new TypeError('Attempt to modify non-existent property');

        return setOrThrow(prop, val, obj);
      })
    );


    var createProp = defineValue(
      'name: createProp',
      'signature: prop: string, value: any, o: Object',
      'classification: object',
      '',
      '--',
      'Creates the given property with the given value on the given object, returning',
      'the object. Equivalent to evaluating o[prop] = value. The property will *not* be',
      'modified when the object has the property; the function will silently fail. In',
      'particular, the property will be created if it exists only in the prototype chain:',
      'hasOwnProperty(prop, obj) must be false.',
      '',
      'This function will also not throw when the property is not writable (through the',
      'prototype), when it has no setter function (again through the prototype), or when',
      'the object is frozen. Again, it will silently fail.',
      '',
      'Use [[set]]/[[setOrThrow]] if you require a function that will create or modify',
      'the property.',
      'Use [[modify]]/[[modifyOrThrow]] if you need a version that will only modify',
      'existing properties.',
      'Use [[createPropOrThrow]] if you need a version that throws.',
      '--',
      'createProp(\'foo\', 42, {}); // {foo: 42}',
      'createProp(\'foo\', 42, {foo: 1}); // {foo: 1}',
      curry(function(prop, val, obj) {
        // Return straight away if the property exists
        if (hasOwnProperty(prop, obj))
          return obj;

        return set(prop, val, obj);
      })
    );


    var createPropOrThrow = defineValue(
      'name: createPropOrThrow',
      'signature: prop: string, value: any, o: Object',
      'classification: object',
      '',
      '--',
      'Creates the given property with the given value on the given object, returning',
      'the object. Equivalent to evaluating o[prop] = value. The property will *not* be',
      'modified when the object has the property; the function will throw a TypeError in',
      'that case. In particular, the property will be created if it exists only in the',
      'prototype chain: hasOwnProperty(prop, obj) must be false.',
      '',
      'This function will also throw when the property is not writable (through the',
      'prototype). Again, it will silently fail.',
      '',
      'Use [[set]]/[[setOrThrow]] if you require a function that will create or modify',
      'the property.',
      'Use [[modify]]/[[modifyOrThrow]] if you need a version that will only modify',
      'existing properties.',
      'Use [[createProp]] if you need a version that silently fails rather than throwing.',
      '--',
      'createPropOrThrow(\'foo\', 42, {}); // {foo: 42}',
      'createPropOrThrow(\'foo\', 42, {foo: 1}); // Throws',
      curry(function(prop, val, obj) {
        // Return straight away if the property exists
        if (hasOwnProperty(prop, obj))
          throw new TypeError('Attempt to create existing property');

        return setOrThrow(prop, val, obj);
      })
    );



    var deleteProp = defineValue(
      'name: deleteProp',
      'signature: prop: string, o: Object',
      'classification: object',
      '',
      'Deletes the given property from the given object, returning the object.',
      'Equivalent to delete o.prop; The function will silently fail when the property',
      'does not exist. It also silently fails when deletion is disallowed by the',
      '\'configurable\' property of the property descriptor, or when the object is',
      'sealed or frozen.',
      '--',
      'deleteProp(\'foo\', {foo: 42, bar: 1}); // {bar: 1}',
      curry(function(prop, obj) {
        obj = checkObjectLike(obj);

        // Deleting is considerably simpler than the "setting" cases! There's no need
        // to walk the prototype chain, and there are no other errors to propagate. Thus...
        try {
          delete obj[prop];
        } catch (e) {}

        return obj;
      })
    );


    var deletePropOrThrow = defineValue(
      'name: deletePropOrThrow',
      'signature: prop: string, o: Object',
      'classification: object',
      '',
      'Deletes the given property from the given object, returning the object.',
      'Equivalent to delete o.prop; The function will throw when the property does not',
      'exist. It also throws when deletion is disallowed by the \'configurable\'',
      'property of the property descriptor, or when the object is sealed or frozen.',
      '--',
      'deletePropOrThrow(\'foo\', {foo: 42, bar: 1}); // {bar: 1}',
      'deletePropOrThrow(\'foo\', {bar: 1}); // Throws',
      '',
      '--',
      curry(function(prop, obj) {
        // Even simpler still!
        if (!hasOwnProperty(prop, obj))
          throw new TypeError('Attempt to delete non-existent property');

        delete obj[prop];
        return obj;
      })
    );


    var keys = defineValue(
      'name: keys',
      'signature: o: Object',
      'classification: object',
      '',
      'A wrapper around Object.keys. Takes an object, and returns an array containing',
      'the names of the object\'s own properties. Returns an empty array for non-objects.',
      '--',
      'keys({foo: 1, bar: 2});  // [\'foo\', \'bar\'];',
      'keys(undefined);         // []',
      curry(function(obj) {
        if (typeof(obj) !== 'object' || obj === null)
          return [];

        return Object.keys(obj);
      })
    );


    var values = defineValue(
      'name: values',
      'signature: o: Object',
      'classification: object',
      '',
      'Takes an object, and returns an array containing the values of the object\'s own',
      'properties. Returns an empty array for non-objects. The order of the values is',
      'not defined.',
      '--',
      'values({foo: 1, bar: 2});  // [1, 2] or [2, 1];',
      'values(undefined);         // []',
      curry(function(obj) {
        if (typeof(obj) !== 'object' || obj === null)
          return [];

        return keys(obj).map(function(k) {return obj[k];});
      })
    );


    var getOwnPropertyNames = defineValue(
      'name: getOwnPropertyNames',
      'signature: o: Object',
      'classification: object',
      '',
      'A wrapper around Object.getOwnPropertyNames. Takes an object, and returns an',
      'array containing the names of the object\'s own properties, including non',
      'enumerable properties. Returns an empty array for non-objects. The order of the',
      'property names is not defined.',
      '--',
      'getOwnPropertyNames({foo: 1, bar: 2});  // [\'foo\', \'bar\'] or [\'bar\', \'foo\']',
      'getOwnPropertyNames(undefined);         // []',
      curry(function(obj) {
        if (typeof(obj) !== 'object' || obj === null)
          return [];

        return Object.getOwnPropertyNames(obj);
      })
    );


    var keyValues = defineValue(
      'name: keyValues',
      'signature: o: Object',
      'classification: object',
      '',
      'Takes an object, and returns an array containing 2-element arrays. The first',
      'element of each sub-array is the name of a property from the object, and the',
      'second element is the value of the property. This function only returns key-value',
      'pairs for the object\'s own properties. Returns an empty array for non-objects.',
      'The order of the values is not defined.',
      '--',
      'keyValues({foo: 1, bar: 2});  // [[\'foo\': 1], [\'bar\': 2]] or [[\'bar\': 2], [\'foo\': 1]]',
      'keyValues(undefined);         // []',
      curry(function(obj) {
        if (typeof(obj) !== 'object' || obj === null)
          return [];

        return keys(obj).map(function(k) {return [k, obj[k]];});
      })
    );


    var descriptors = defineValue(
      'name: descriptors',
      'signature: o: Object',
      'classification: object',
      '',
      'Takes an object, and returns an array containing 2-element arrays. The first',
      'element of each sub-array is the name of a property from the object, and the',
      'second element is the property descriptor for the property. This function only',
      'returns key-value pairs for the object\'s own properties. Returns an empty array',
      'for non-objects. The order of the values is not defined.',
      '--',
      'descriptors({foo: 1});  // [[\'foo\': {configurable: ..., enumerable: ..., writable: ..., value: 1}]]',
      'descriptors(undefined); // []',
      curry(function(obj) {
        if (typeof(obj) !== 'object' || obj === null)
          return [];

        return keys(obj).map(function(k) {return [k, getOwnPropertyDescriptor(k, obj)];});
      })
    );


    var shallowClone = defineValue(
      'name: shallowClone',
      'signature: o: Object',
      'classification: object',
      '',
      'Returns a shallow clone of the given object. That is to say, the object',
      'returned will have have the same properties as the original (both enumerable',
      'and non-enumerable), except the prototype will be Object.prototype. The original',
      'object\'s constructor will not be called. The values of the properties in the new',
      'object will be exactly the same as the corresponding properties in the original',
      'object. In particular, if the original has a property whose value is an object or',
      'function, then the new object\'s property will refer to the same object; the',
      'value will not be cloned.',
      '',
      'A TypeError will be thrown if called with some non-object type.',
      '',
      'Exercise caution when cloning properties that have get/set functions defined in',
      'the descriptor: the cloned object will have these same functions using the same',
      'scope. Getting/setting such a property in the clone may affect the corresponding',
      'property in the original.',
      curry(function(obj) {
        if (typeof(obj) !== 'object')
          throw new TypeError('shallowClone called on non-object');

        if (obj === null)
          return obj;

        if (Array.isArray(obj))
          return obj.slice();

        var clone = {};
        while (obj !== Object.prototype) {
          var props = getOwnPropertyNames(obj);
          props.forEach(function(p) {
            var descriptor = getOwnPropertyDescriptor(p, obj);
            defineProperty(p, descriptor, clone);
          });
          obj = Object.getPrototypeOf(obj);
        }

        return clone;
      })
    );


    var deepCopyArray = function(arr) {
      var result = [];
      arr.forEach(function(a) {
        if (typeof(a) !== 'object' || a === null)
          result.push(a);
        else
          result.push(deepClone(a));
      });

      return result;
    };


    var deepClone = defineValue(
      'name: deepClone',
      'signature: o: Object',
      'classification: object',
      '',
      'Returns a deep clone of the given object. That is to say, the object',
      'returned will have have the same properties as the original (both enumerable',
      'and non-enumerable), except the prototype will be Object.prototype. The original',
      'object\'s constructor will not be called. The values of the properties in the new',
      'object will be exactly the same as the values in the original object, unless',
      'those properties are arrays or objects, in which case they will themselves be',
      'deep clones.',
      '',
      'A TypeError will be thrown if called with some non-object type.',
      '',
      'Exercise caution when cloning properties that have get/set functions defined in',
      'the descriptor: the cloned object will have these same functions using the same',
      'scope. Getting/setting such a property in the clone may affect the corresponding',
      'property in the original.',
      curry(function(obj) {
        if (typeof(obj) !== 'object')
          throw new TypeError('deepClone called on non-object');

        if (obj === null)
          return obj;

        if (Array.isArray(obj))
          return deepCopyArray(obj);

        var clone = {};
        while (obj !== Object.prototype) {
          var props = getOwnPropertyNames(obj);
          props.forEach(function(p) {
            var descriptor = getOwnPropertyDescriptor(p, obj);
            if ('value' in descriptor && typeof(descriptor.value) === 'object')
              descriptor.value = deepClone(descriptor.value);
            defineProperty(p, descriptor, clone);
          });
          obj = Object.getPrototypeOf(obj);
        }

        return clone;
      })
    );



    var extend = defineValue(
      'name: extend',
      'signature: source: Object, dest: Object',
      'classification: object',
      '',
      'Takes two objects, source and dest, and walks the prototype chain of source,',
      'copying all enumerable properties into dest. Any extant properties with the same',
      'name are overwritten. Returns the modified dest object.',
      '--',
      'var a = {bar: 1};',
      'extend(a, {foo: 42}); // a == {foo: 42, bar: 1}',
      curry(function(source, dest) {
        for (var k in source)
          dest[k] = source[k];

        return dest;
      })
    );


    /*
     * extendOwn: Takes two objects, source and dest, and copies all enumerable
     *            properties of source into dest. Properties of the prototype are
     *            not copied. Returns the modified dest object.
     *
     */

    var extendOwn = defineValue(
      'name: extendOwn',
      'signature: source: Object, dest: Object',
      'classification: object',
      '',
      'Takes two objects, source and dest, and copies all enumerable properties of',
      'source into dest. Properties of the prototype are not copied. Any extant',
      'properties with the same name are overwritten. Returns the modified dest object.',
      '--',
      'var a = createObject({bar: 1});',
      'a.baz = 2;',
      'var b = {foo: 3};',
      'extendOwn(b, a); // b == {foo: 3, baz: 2}',
      curry(function(source, dest) {
        var keys = Object.keys(source);

        keys.forEach(function(k) {
          dest[k] = source[k];
        });

        return dest;
      })
    );


    var exported = {
      callProp: callProp,
      callPropWithArity: callPropWithArity,
      createObject: createObject,
      createObjectWithProps: createObjectWithProps,
      createProp: createProp,
      createPropOrThrow: createPropOrThrow,
      deepClone: deepClone,
      descriptors: descriptors,
      defineProperty: defineProperty,
      defineProperties: defineProperties,
      deleteProp: deleteProp,
      deletePropOrThrow: deletePropOrThrow,
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
      modify: modify,
      modifyOrThrow: modifyOrThrow,
      set: set,
      setOrThrow: setOrThrow,
      shallowClone: shallowClone,
      values: values
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
