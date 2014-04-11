(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var getRealArity = base.getRealArity;

    var object = require('../object');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var checkEquality = testUtils.checkEquality;


    describe('Object exports', function() {
      var expectedFunctions = ['callPropWithArity', 'callProp', 'hasOwnProperty',
                               'hasProperty', 'instanceOf', 'isPrototypeOf', 'createObject',
                               'createObjectWithProps', 'defineProperty', 'defineProperties',
                               'getOwnPropertyDescriptor', 'extract', 'set', 'setOrThrow',
                               'modify', 'modifyOrThrow', 'createProp', 'createPropOrThrow',
                               'deleteProp'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('object.js exports \'' + f + '\' property', exportsProperty(object, f));
        it('\'' + f + '\' property of object.js is a function', exportsFunction(object, f));
      });
    });


    describe('callPropWithArity', function() {
      var callPropWithArity = object.callPropWithArity;


      it('callPropWithArity has correct \'real\' arity', function() {
        expect(getRealArity(callPropWithArity)).to.equal(2);
      });


      // Test generation
      var makeReturnedCurriedArityTest = function(i) {
        return function() {
          var fn = callPropWithArity('prop', i);

          expect(fn.length).to.equal(1);
        };
      };


      var makeReturnedArityTest = function(i) {
        return function() {
          var fn = callPropWithArity('prop', i);

          expect(getRealArity(fn)).to.equal(i + 1);
        };
      };


      var functionalityArgs = [1, true, null, function() {}, []];
      var makeCalledTest = function(i) {
        return function() {
          var args = functionalityArgs.slice(0, i);
          var obj = {called: false, calledProp: function() {this.called = true;}};
          var caller = callPropWithArity('calledProp', i);
          var result = caller.apply(null, args.concat([obj]));
        
          expect(obj.called).to.be.true;
        }
      };


      var makeReturnedValueTest = function(i) {
        return function() {
          var expected = functionalityArgs.slice(0, i);
          var obj = {calledProp: function() {return [].slice.call(arguments);}};
          var obj2 = {calledProp: function() {return 42;}};
          var caller = callPropWithArity('calledProp', i);
          var result = caller.apply(null, expected.concat([obj]));
          var result2 = caller.apply(null, expected.concat([obj2]));
        
          expect(result).to.deep.equal(expected);
          expect(result2).to.equal(42);
        };
      };


      for (var i = 0; i < 6; i++) {
        it('Returned function has correct arity for arity' + i,
           makeReturnedCurriedArityTest(i));

        it('Returned function has correct \'real\' arity' + i,
           makeReturnedArityTest(i));

        it('Returned function calls prop on given object' + i,
           makeCalledTest(i));

        it('Returned function returns correct result when called' + i,
           makeReturnedValueTest(i));

        // The returned function should be curried
        var testObj = {prop: function(x) {return x;}};
        var caller = callPropWithArity('prop', 1);
        testCurriedFunction('Returned function', caller, [2, testObj]);
      }


      // callPropWithArity should itself be curried
      testObj = {property: function() {return 42;}};
      var args = {firstArgs: ['property', 0], thenArgs: [testObj]};
      testCurriedFunction('callPropWithArity', callPropWithArity, args);
    });


    describe('callProp', function() {
      var callProp = object.callProp;


      it('callProp has correct arity', function() {
        expect(getRealArity(callProp)).to.equal(1);
      });


      it('Returned function has correct arity', function() {
        var fn = callProp('prop');

        expect(fn.length).to.equal(1);
      });


      it('Returned function has correct \'real\' arity', function() {
        var fn = callProp('prop');

        expect(getRealArity(fn)).to.equal(1);
      });


      it('Returned function calls prop on given object', function() {
        var obj = {called: false, calledProp: function() {this.called = true;}};
        var caller = callProp('calledProp');
        var result = caller(obj);

        expect(obj.called).to.be.true;
      });


      it('Returned function returns correct result when called', function() {
        var obj = {calledProp: function() {return [].slice.call(arguments);}};
        var obj2 = {calledProp: function() {return 42;}};
        var caller = callProp('calledProp');
        var result = caller.call(null, obj);
        var result2 = caller.call(null, obj2);

        expect(result).to.deep.equal([]);
        expect(result2).to.equal(42);
      });
    });


    describe('hasOwnProperty', function() {
      var hasOwnProperty = object.hasOwnProperty;


      it('hasOwnProperty has correct arity', function() {
        expect(getRealArity(hasOwnProperty)).to.equal(2);
      });


      it('Wraps Object.prototype.hasOwnProperty', function() {
        // Temporary monkey-patch
        var original = Object.prototype.hasOwnProperty;
        var fn = function() {fn.called = true;};
        fn.called = false;
        Object.prototype.hasOwnProperty = fn;
        var obj = {funkier: 1};
        hasOwnProperty('funkier', obj);

        expect(fn.called).to.be.true;
        Object.prototype.hasOwnProperty = original;
      });


      it('Works correctly (1)', function() {
        var obj = {funkier: 1};
        var result = hasOwnProperty('funkier', obj);

        expect(result).to.be.true;
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        Constructor.prototype.funkier = 1;
        var obj = new Constructor();
        var result = hasOwnProperty('funkier', obj);

        expect(result).to.be.false;
      });


      testCurriedFunction('hasOwnProperty', hasOwnProperty, ['funkier', {funkier: 1}]);
    });


    describe('hasProperty', function() {
      var hasProperty = object.hasProperty;


      it('hasProperty has correct arity', function() {
        expect(getRealArity(hasProperty)).to.equal(2);
      });


      it('Works correctly (1)', function() {
        var obj = {funkier: 1};
        var result = hasProperty('funkier', obj);

        expect(result).to.be.true;
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        Constructor.prototype.funkier = 1;
        var obj = new Constructor();
        var result = hasProperty('funkier', obj);

        expect(result).to.be.true;
      });


      testCurriedFunction('hasProperty', hasProperty, ['funkier', {funkier: 1}]);
    });


    describe('instanceOf', function() {
      var instanceOf = object.instanceOf;


      it('instanceOf has correct arity', function() {
        expect(getRealArity(instanceOf)).to.equal(2);
      });


      it('Works correctly (1)', function() {
        expect(instanceOf(Object, {})).to.be.true;
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        var obj = new Constructor();

        expect(instanceOf(Constructor, obj)).to.be.true;
      });


      it('Works correctly (3)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        Constructor.prototype = new Proto();
        var obj = new Constructor();

        expect(instanceOf(Proto, obj)).to.be.true;
      });


      it('Works correctly (4)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        var obj = new Constructor();

        expect(instanceOf(Proto, obj)).to.be.false;
      });


      testCurriedFunction('instanceOf', instanceOf, [Object, {}]);
    });


    describe('isPrototypeOf', function() {
      var isPrototypeOf = object.isPrototypeOf;


      it('isPrototypeOf has correct arity', function() {
        expect(getRealArity(isPrototypeOf)).to.equal(2);
      });


      it('Wraps Object.prototype.isPrototypeOf', function() {
        // Temporary monkey-patch
        var original = Object.prototype.isPrototypeOf;
        var fn = function() {fn.called = true;};
        fn.called = false;
        Object.prototype.isPrototypeOf = fn;
        var obj = {funkier: 1};
        isPrototypeOf({}, obj);

        expect(fn.called).to.be.true;
        Object.prototype.isPrototypeOf = original;
      });


      it('Calls Object.prototype.isPrototypeOf on correct object', function() {
        // Temporary monkey-patch
        var original = Object.prototype.isPrototypeOf;
        var fn = function() {fn.thisObj = this;};
        fn.thisObj = null;
        Object.prototype.isPrototypeOf = fn;
        var protoCheck = {};
        var obj = {funkier: 1};
        isPrototypeOf(protoCheck, obj);

        expect(fn.thisObj).to.equal(protoCheck);
        Object.prototype.isPrototypeOf = original;
      });


      it('Works correctly (1)', function() {
        expect(isPrototypeOf(Object.prototype, {})).to.be.true;
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        var obj = new Constructor();

        expect(isPrototypeOf(Constructor.prototype, obj)).to.be.true;
      });


      it('Works correctly (3)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        Constructor.prototype = new Proto();
        var obj = new Constructor();

        expect(isPrototypeOf(Proto.prototype, obj)).to.be.true;
      });


      it('Works correctly (4)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        var obj = new Constructor();

        expect(isPrototypeOf(Proto.prototype, obj)).to.be.false;
      });


      testCurriedFunction('isPrototypeOf', isPrototypeOf, [Object.prototype, {}]);
    });


    describe('createObject', function() {
      var createObject = object.createObject;
      var isPrototypeOf = object.isPrototypeOf;
      var hasOwnProperty = object.hasOwnProperty;


      it('createObject has correct arity', function() {
        expect(getRealArity(createObject)).to.equal(1);
      });


      it('Returns an object', function() {
        var obj = {funkier: 1};
        var result = createObject(obj);

        expect(result).to.be.a('object');
      });


      it('Works correctly', function() {
        var obj = {funkier: 1};
        var result = createObject(obj);

        expect(isPrototypeOf(obj, result)).to.be.true;
      });


      it('Ignores superfluous parameters', function() {
        var obj = {funkier: 1};
        var result = createObject(obj,
                      {prop1: {configurable: false, enumerable: false, writable: false, value: 42}});

        expect(hasOwnProperty('prop1', result)).to.be.false;
      });
    });


    describe('createObjectWithProps', function() {
      var createObjectWithProps = object.createObjectWithProps;
      var isPrototypeOf = object.isPrototypeOf;
      var hasOwnProperty = object.hasOwnProperty;
      var descriptor = {prop1: {configurable: false, enumerable: false, writable: false, value: 42}};


      it('createObjectWithProps has correct arity', function() {
        expect(getRealArity(createObjectWithProps)).to.equal(2);
      });


      it('Returns an object', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj, descriptor);

        expect(result).to.be.a('object');
      });


      it('Works correctly (1)', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj, descriptor);

        expect(isPrototypeOf(obj, result)).to.be.true;
      });


      it('Works correctly (2)', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj, descriptor);

        expect(hasOwnProperty('prop1', result)).to.be.true;
      });


      it('Works correctly (3)', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj, descriptor);

        var descriptorProps = Object.keys(descriptor.prop1);
        var actualDescriptor = Object.getOwnPropertyDescriptor(result, 'prop1');
        var leftComparison = descriptorProps.every(function(p) {
          return (p in actualDescriptor) && descriptor.prop1[p] === actualDescriptor[p];
        });
        var actualDescriptorProps = Object.keys(actualDescriptor);
        var rightComparison = actualDescriptorProps.every(function(p) {
          return (p in descriptor.prop1) && descriptor.prop1[p] === actualDescriptor[p];
        });

        expect(leftComparison && rightComparison).to.be.true;
      });


      testCurriedFunction('createObjectWithProps', createObjectWithProps, [{}, descriptor]);
    });


    describe('defineProperty', function() {
      var defineProperty = object.defineProperty;


      it('Has correct arity', function() {
        expect(getRealArity(defineProperty)).to.equal(3);
      });


      it('Returns the object', function() {
        var obj = {};
        var descriptor = {configurable: true, writable: false, enumerable: true, value: 42};
        var result = defineProperty('prop', descriptor, obj);

        expect(result).to.equal(obj);
      });


      it('Objects have the relevant property after calling defineProperty', function() {
        var obj = {};
        var descriptor = {configurable: true, writable: false, enumerable: true, value: 42};
        defineProperty('prop', descriptor, obj);

        expect(obj.hasOwnProperty('prop')).to.be.true;
      });


      it('Objects have the property with the correct value after calling defineProperty', function() {
        var obj = {};
        var descriptor = {configurable: true, writable: false, enumerable: true, value: 42};
        defineProperty('prop', descriptor, obj);

        expect(checkEquality(obj.prop, descriptor.value)).to.be.true;
      });


      it('The new property has the correct descriptor after calling defineProperty', function() {
        var obj = {};
        var descriptor = {configurable: true, writable: false, enumerable: true, value: 42};
        defineProperty('prop', descriptor, obj);
        var actualDescriptor = Object.getOwnPropertyDescriptor(obj, 'prop');

        expect(checkEquality(actualDescriptor, descriptor)).to.be.true;
      });


      // defineProperty should be curried
      testCurriedFunction('defineProperty', defineProperty, ['p', {value: 7}, {}]);
    });


    describe('defineProperties', function() {
      var defineProperties = object.defineProperties;


      // Test data
      // Note: don't omit any optional properties, or we'll fail the equality check
      var descriptors = {
        prop1: {configurable: true, writable: false, enumerable: true, value: 42},
        prop2: {configurable: false, writable: true, enumerable: false, value: 'funkier'},
        prop3: {configurable: true, enumerable: true, get: function() {return false;}, set: undefined}
      };


      it('Has correct arity', function() {
        expect(getRealArity(defineProperties)).to.equal(2);
      });


      it('Returns the object', function() {
        var obj = {};
        var result = defineProperties(descriptors, obj);

        expect(result).to.equal(obj);
      });


      it('Objects have the relevant properties after calling defineProperties', function() {
        var obj = {};
        defineProperties(descriptors, obj);
        var newProps = Object.keys(descriptors);
        var allThere = newProps.every(function(p) {
          return obj.hasOwnProperty(p);
        });

        expect(allThere).to.be.true;
      });


      it('Objects have the properties with the correct value after calling defineProperties', function() {
        var obj = {};
        defineProperties(descriptors, obj);
        var newProps = Object.keys(descriptors);
        var allCorrect = newProps.every(function(p) {
          return checkEquality(obj[p], 'get' in descriptors[p] ? descriptors[p].get() : descriptors[p].value);
        });

        expect(allCorrect).to.be.true;
      });


      it('The new properties have the correct descriptors after calling defineProperties', function() {
        var obj = {};
        defineProperties(descriptors, obj);
        var newProps = Object.keys(descriptors);
        var allDescriptorsCorrect = newProps.every(function(p) {
          return checkEquality(Object.getOwnPropertyDescriptor(obj, p), descriptors[p]);
        });

        expect(allDescriptorsCorrect).to.be.true;
      });


      // defineProperties should be curried
      testCurriedFunction('defineProperties', defineProperties, [descriptors, {}]);
    });


    describe('getOwnPropertyDescriptor', function() {
      var getOwnPropertyDescriptor = object.getOwnPropertyDescriptor;


      it('Has correct arity', function() {
        expect(getRealArity(getOwnPropertyDescriptor)).to.equal(2);
      });


      it('Returns undefined if property not present', function() {
        expect(getOwnPropertyDescriptor('prop', {})).to.equal(undefined);
      });


      it('Returns undefined if property exists only on prototype', function() {
        var Constructor = function() {};
        Constructor.prototype.prop = 42;
        var obj = new Constructor();

        expect(getOwnPropertyDescriptor('prop', obj)).to.equal(undefined);
      });


      it('Works correctly (1)', function() {
        var obj = {prop: 42};
        var realDescriptor = Object.getOwnPropertyDescriptor(obj, 'prop');
        var descriptor = getOwnPropertyDescriptor('prop', obj);

        expect(checkEquality(descriptor, realDescriptor)).to.be.true;
      });


      it('Works correctly (2)', function() {
        // Let's use object itself as a reasonably complex object
        var keys = Object.keys(object);
        var allCorrect = keys.every(function(k) {
          var realDescriptor = Object.getOwnPropertyDescriptor(object, k);
          var descriptor = getOwnPropertyDescriptor(k, object);
          return checkEquality(descriptor, realDescriptor);
        });

        expect(allCorrect).to.be.true;
      });


      testCurriedFunction('getOwnPropertyDescriptor', getOwnPropertyDescriptor, ['p', {p: 10}]);
    });


    describe('extract', function() {
      var extract = object.extract;


      it('Has correct arity', function() {
        expect(getRealArity(extract)).to.equal(2);
      });


      it('Returns undefined if property not present', function() {
        expect(extract('prop', {})).to.equal(undefined);
      });


      it('Works correctly (1)', function() {
        var obj = {prop: 42};
        var result = extract('prop', obj);

        expect(checkEquality(obj.prop, result)).to.be.true;
      });


      it('Works correctly (2)', function() {
        var obj = {funkier: function() {}};
        var result = extract('funkier', obj);

        expect(checkEquality(obj.funkier, result)).to.be.true;
      });


      it('Works correctly (3)', function() {
        var Constructor = function() {};
        Constructor.prototype.prop = 42;
        var obj = new Constructor();
        var result = extract('prop', obj);

        expect(checkEquality(obj.prop, result)).to.be.true;
      });


      testCurriedFunction('extract', extract, ['p', {p: 10}]);
    });


    // The various object manipulation functions have a lot of commonality.
    // We generate common tests.

    var makeCommonTests = function(setter, shouldThrow) {
      var defineProperty = object.defineProperty;


      it('Has correct arity', function() {
        expect(getRealArity(setter)).to.equal(3);
      });


      it('Behaves correctly if writable false (1)', function() {
        var a = {};
        defineProperty('foo', {writable: false, value: 1}, a);
        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };

        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });


      it('Behaves correctly if writable false (2)', function() {
        var a = function() {};
        defineProperty('foo', {enumerable: true, writable: false, value: 1}, a.prototype);

        var b = new a();
        var val = 42;
        var fn = function() {
          setter('foo', val, b);
        };


        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });


      it('Behaves correctly if no setter in descriptor (1)', function() {
        var a = (function() {
          var a = {};
          var privateProp = 1;
          var getter = function() {return privateProp;};
          defineProperty('foo', {get: getter}, a);
          return a;
        })();

        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };


        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });


      it('Behaves correctly if no setter in descriptor (2)', function() {
        var a = (function() {
          var a = function() {};
          var privateProp = 1;
          var getter = function() {return privateProp;};
          defineProperty('foo', {get: getter}, a.prototype);

          var b = new a();
          return b;
        })();

        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };


        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });


      it('Behaves correctly if preventExtensions has been called (1)', function() {
        var a = {};
        Object.preventExtensions(a);
        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };

        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });


      it('Behaves correctly if seal has been called (1)', function() {
        var a = {};
        Object.seal(a);
        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };

        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });


      it('Behaves correctly if freeze has been called (1)', function() {
        var a = {};
        Object.freeze(a);
        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };

        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });


      it('Behaves correctly if freeze has been called (2)', function() {
        var a = {foo: 1};
        Object.freeze(a);
        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };


        if (shouldThrow)
          expect(fn).to.throw(Error);
        else
          expect(fn).to.not.throw(Error);
      });
    };


    var makeCommonModificationTests = function(setter, shouldThrow) {
      var defineProperty = object.defineProperty;
      var hasOwnProperty = object.hasOwnProperty;


      it('Object has property afterwards', function() {
        var a = {foo: 1};
        setter('foo', 42, a);

        expect(hasOwnProperty('foo', a)).to.be.true;
      });


      it('Object\'s property has correct value afterwards', function() {
        var a = {foo: 1};
        var val = 42;
        setter('foo', val, a);

        expect(a.foo).to.equal(val);
      });


      it('Behaves correctly if preventExtensions has been called (2)', function() {
        var a = {foo: 1};
        Object.preventExtensions(a);
        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };

        expect(fn).to.not.throw(Error);
        expect(a.foo).to.equal(val);
      });


      it('Behaves correctly if seal has been called (2)', function() {
        var a = {foo: 1};
        Object.seal(a);
        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };


        expect(fn).to.not.throw(Error);
        expect(a.foo).to.equal(val);
      });


      it('Propagates other errors', function() {
        var a = (function() {
          var a = {};
          var privateProp = 1;
          var getter = function() {return privateProp;};
          var badSetter = function() {throw new ReferenceError();};
          defineProperty('foo', {get: getter, set: badSetter}, a);
          return a;
        })();

        var val = 42;
        var fn = function() {
          setter('foo', val, a);
        };

        expect(fn).to.throw(Error);
      });


      if (!shouldThrow) {
        it('Propagates TypeErrors from causes other than the ones we suppress', function() {
          var a = (function() {
            var a = {};
            var privateProp = 1;
            var getter = function() {return privateProp;};
            var badSetter = function() {throw new TypeError();};
            defineProperty('foo', {get: getter, set: badSetter}, a);
            return a;
          })();

          var val = 42;
          var fn = function() {
            setter('foo', val, a);
          };

          expect(fn).to.throw(Error);
        });
      }
    };


    var makeCommonCreationTests = function(setter, shouldThrow) {
      var defineProperty = object.defineProperty;
      var hasOwnProperty = object.hasOwnProperty;


      it('Creates the property if it doesn\'t exist', function() {
        var a = {};
        var val = 42;
        setter('foo', val, a);

        expect(hasOwnProperty('foo', a)).to.be.true;
      });


      it('Creates the property if it only exists on the prototype', function() {
        var a = function() {};
        a.prototype.foo = 1;
        var b = new a();
        var val = 42;
        setter('foo', val, b);

        expect(hasOwnProperty('foo', b)).to.be.true;
        expect(b.foo).to.equal(val);
      });
    };


    // We can't test the curried nature of setter in the normal fashion, due to the stateful
    // nature of the operation. Thus, we test manually
    var makePartialTests = function(setter, aMaker, message, parArgs, remainingArgs, val) {
      var hasOwnProperty = object.hasOwnProperty;


      var makePartial = function() {
        var partial;

        // We know setter has arity 3, so can partially apply at most 2 args.
        // We want to test partially applying with f(a, b) and f(a)(b) forms.
        if (!Array.isArray(parArgs[0]))
          partial = setter.apply(null, parArgs);
        else
          partial = setter.apply(null, parArgs[0]).apply(null, parArgs[1]);

        return partial;
      };


      it(message + ' returns a function', function() {
        var a = aMaker();
        var partial = makePartial();

        expect(partial).to.be.a('function');
      });


      it(message + ' returns a function of length 1', function() {
        var a = aMaker();
        var partial = makePartial();

        expect(partial.length).to.equal(1);
      });


      it(message + ' and supplying remaining arguments applies function', function() {
        var a = aMaker();
        var partial = makePartial();
        var result = partial.apply(null, remainingArgs.concat([a]));

        expect(result).to.equal(a);
        expect(hasOwnProperty('foo', a)).to.be.true;
        expect(a.foo).to.equal(val);
      });
    };


    var makeSetterTests = function(desc, setter, shouldThrow) {
      describe(desc, function() {
        makeCommonTests(setter, shouldThrow);
        makeCommonModificationTests(setter, shouldThrow);
        makeCommonCreationTests(setter, shouldThrow);

        makePartialTests(setter, function() {return {}}, 'Supplying 1 argument', ['foo'], [42], 42);
        makePartialTests(setter, function() {return {}}, 'Supplying 1 argument then another', [['foo'], [42]], [], 42);
        makePartialTests(setter, function() {return {}}, 'Supplying 2 arguments', ['foo', 42], [], 42);
      });
    };


    makeSetterTests('set', object.set, false);
    makeSetterTests('setOrThrow', object.setOrThrow, true);


    var makeModifierTests = function(desc, setter, shouldThrow) {
      describe(desc, function() {
        makeCommonTests(setter, shouldThrow);
        makeCommonModificationTests(setter, shouldThrow);


        it('Doesn\'t create the property if it doesn\'t exist', function() {
          var a = {};
          var val = 42;
          var fn = function() {
            setter('foo', val, a);
          };

          if (!shouldThrow) {
            expect(fn).to.not.throw(TypeError);
            expect(a).to.not.have.property('foo');
          } else {
            expect(fn).to.throw(TypeError);
            expect(a).to.not.have.property('foo');
          }
        });


        makePartialTests(setter, function() {return {foo: 1}}, 'Supplying 1 argument', ['foo'], [42], 42);
        makePartialTests(setter, function() {return {foo: 1}}, 'Supplying 1 argument then another', [['foo'], [42]], [], 42);
        makePartialTests(setter, function() {return {foo: 1}}, 'Supplying 2 arguments', ['foo', 42], [], 42);
      });
    };


    makeModifierTests('modify', object.modify, false);
    makeModifierTests('modifyOrThrow', object.modifyOrThrow, true);


    var makeCreatorTests = function(desc, setter, shouldThrow) {
      describe(desc, function() {
        makeCommonTests(setter, shouldThrow);
        makeCommonCreationTests(setter, shouldThrow);


        it('Doesn\'t modify the property if it exists', function() {
          var a = {foo: 1};
          var val = 42;
          var fn = function() {
            setter('foo', val, a);
          };

          if (!shouldThrow) {
            expect(fn).to.not.throw(TypeError);
          } else {
            expect(fn).to.throw(TypeError);
          }

          expect(a.foo).to.equal(1);
        });


        it('Behaves correctly if preventExtensions has been called (3)', function() {
          var a = {foo: 1};
          Object.preventExtensions(a);
          var val = 42;
          var fn = function() {
            setter('foo', val, a);
          };

          if (!shouldThrow) {
            expect(fn).to.not.throw(Error);
          } else {
            expect(fn).to.throw(TypeError);
          }
          expect(a.foo).to.equal(1);
        });


        it('Behaves correctly if seal has been called (3)', function() {
          var a = {foo: 1};
          Object.seal(a);
          var val = 42;
          var fn = function() {
            setter('foo', val, a);
          };


          if (!shouldThrow) {
            expect(fn).to.not.throw(Error);
          } else {
            expect(fn).to.throw(TypeError);
          }

          expect(a.foo).to.equal(1);
        });


        makePartialTests(setter, function() {return {}}, 'Supplying 1 argument', ['foo'], [42], 42);
        makePartialTests(setter, function() {return {}}, 'Supplying 1 argument then another', [['foo'], [42]], [], 42);
        makePartialTests(setter, function() {return {}}, 'Supplying 2 arguments', ['foo', 42], [], 42);
      });
    };


    makeCreatorTests('createProp', object.createProp, false);
    makeCreatorTests('createPropOrThrow', object.createPropOrThrow, true);


    // The delete functions also have a similar structure
    var makeDeleterTests = function(desc, deleter, shouldThrow) {
      describe(desc, function() {
        var hasOwnProperty = object.hasOwnProperty;
        var defineProperty = object.defineProperty;


        it('Has correct arity', function() {
          expect(getRealArity(deleter)).to.equal(2);
        });


        it('Object does not have property afterwards', function() {
          var a = {foo: 1};
          deleter('foo', a);

          expect(hasOwnProperty('foo', a)).to.be.false;
        });


        it('Behaves correctly if object does not have property', function() {
          var a = {bar: 1};
          var fn = function() {
            deleter('foo', a);
          };

          if (!shouldThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);
        });


        it('Behaves correctly if object does not have property but prototype does', function() {
          var a = function() {};
          a.prototype.foo = 1;
          var b = new a();
          var fn = function() {
            deleter('foo', b);
          };

          if (!shouldThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);

          expect(hasOwnProperty('foo', Object.getPrototypeOf(b))).to.be.true;
        });


        it('Behaves correctly if configurable false', function() {
          var a = {};
          defineProperty('foo', {configurable: false, value: 1}, a);
          var fn = function() {
            deleter('foo', a);
          };

          if (shouldThrow)
            expect(fn).to.throw(Error);
          else
            expect(fn).to.not.throw(Error);

          expect(a).to.have.property('foo');
          expect(a.foo).to.equal(1);
        });


        it('Behaves if preventExtensions called (1)', function() {
          var a = {foo: 1};
          Object.preventExtensions(a);
          deleter('foo', a);

          expect(hasOwnProperty('foo', a)).to.be.false;
        });


        it('Behaves correctly if preventExtensions called (2)', function() {
          var a = {};
          Object.preventExtensions(a);
          var fn = function() {
            deleter('foo', a);
          };

          if (!shouldThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);
        });


        it('Behaves if seal called (1)', function() {
          var a = {};
          Object.seal(a);
          var fn = function() {
            deleter('foo', a);
          };

          if (!shouldThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);
        });


        it('Behaves correctly if seal called (2)', function() {
          var a = {foo: 1};
          Object.seal(a);
          var fn = function() {
            deleter('foo', a);
          };

          if (!shouldThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);

          expect(a).to.have.property('foo');
        });


        it('Behaves if freeze called (1)', function() {
          var a = {};
          Object.freeze(a);
          var fn = function() {
            deleter('foo', a);
          };

          if (!shouldThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);
        });


        it('Behaves correctly if freeze called (2)', function() {
          var a = {foo: 1};
          Object.freeze(a);
          var fn = function() {
            deleter('foo', a);
          };

          if (!shouldThrow)
            expect(fn).to.not.throw(TypeError);
          else
            expect(fn).to.throw(TypeError);

          expect(a).to.have.property('foo');
        });


        // We can't test the curried nature of deleter in the normal fashion, due to the stateful
        // nature of the operation. Thus, we test manually
        it('Returns a function when partially applied', function() {
          var a = {foo: 1};
          var partial = deleter('foo');

          expect(partial).to.be.a('function');
        });


        it('Returns a function of length 1', function() {
          var a = {foo: 1};
          var partial = deleter('foo');

          expect(partial.length).to.equal(1);
        });


        it('Partially applying then supplying remaining arguments applies function', function() {
          var a = {foo: 1};
          var partial = deleter('foo');
          var result = partial(a);

          expect(result).to.equal(a);
          expect(hasOwnProperty('foo', a)).to.be.false;
        });
      });
    };


    makeDeleterTests('deleteProp', object.deleteProp, false);
  };


  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      testFixture(require, exports, module);
    });
  } else {
    testFixture(require, exports, module);
  }
})();
