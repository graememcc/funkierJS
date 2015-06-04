(function() {
  "use strict";


  var expect = require('chai').expect;

  var deepEqual = require('deep-equal');

  var curryModule = require('../../lib/components/curry');
  var arityOf = curryModule.arityOf;
  var objectCurry = curryModule.objectCurry;

  var object = require('../../lib/components/object');

  var testingUtilities = require('./testingUtilities');
  var checkModule = testingUtilities.checkModule;
  var checkFunction = testingUtilities.checkFunction;
  var testCurriedFunction = testingUtilities.testCurriedFunction;
  var NO_RESTRICTIONS = testingUtilities.NO_RESTRICTIONS;

  var maybe = require('../../lib/components/maybe');
  var isJust = maybe.isJust;
  var isNothing = maybe.isNothing;
  var getJustValue = maybe.getJustValue;

  describe('Object', function() {
    var expectedObjects = [];
    var expectedFunctions = ['callProp', 'callPropWithArity', 'createObject', 'createObjectWithProps', 'createProp',
                             'curryOwn', 'defineProperties', 'defineProperty', 'deleteProp', 'descriptors',
                             'extend', 'extendOwn', 'extract', 'extractOrDefault', 'getOwnPropertyDescriptor',
                             'getOwnPropertyNames', 'hasOwnProperty', 'hasProperty', 'instanceOf', 'isPrototypeOf',
                             'keyValues', 'keys', 'maybeExtract', 'modify', 'safeCreateProp', 'safeDeleteProp',
                             'safeModify', 'safeSet', 'set', 'setOrThrow', 'shallowClone'];
    checkModule('object', object, expectedObjects, expectedFunctions);


    // Note: we allow the final parameter to be anything to allow the boxing coercions
    var cpwaSpec = {
      name: 'callPropWithArity',
      restrictions: [['string'], ['natural']],
      validArguments: [['toString'], [1]],
    };


    checkFunction(cpwaSpec, object.callPropWithArity, function(callPropWithArity) {
      var addReturnedCurriedArityTest = function(i) {
        it('Returned function is curried for arity ' + i, function() {
          var fn = callPropWithArity('prop', i);

          expect(fn.length).to.equal(1);
          if (i > 0)
            expect(arityOf(fn)).to.not.equal(1);
        });
      };


      var addReturnedArityTest = function(i) {
        it('Returned function has correct arity for arity ' + i, function() {
          var fn = callPropWithArity('prop', i);

          expect(arityOf(fn)).to.equal(i + 1);
        });
      };


      var functionalityArgs = [1, true, null, function() {}, []];
      var addCalledTest = function(i) {
        it('Returned function calls property on given object for arity ' + i, function() {
          var args = functionalityArgs.slice(0, i);
          var obj = {called: false, calledProp: function() {this.called = true;}};
          var caller = callPropWithArity('calledProp', i);
          caller.apply(null, args.concat([obj]));

          expect(obj.called).to.equal(true);
        });
      };


      var addReturnedValueTest = function(i) {
        it('Returned function returns correct result when called for arity ' + i, function() {
          var expected = functionalityArgs.slice(0, i);
          var obj = {calledProp: function() {return [].slice.call(arguments);}};
          var obj2 = {calledProp: function() {return 42;}};
          var caller = callPropWithArity('calledProp', i);
          var result = caller.apply(null, expected.concat([obj]));
          var result2 = caller.apply(null, expected.concat([obj2]));

          expect(result).to.deep.equal(expected);
          expect(result2).to.equal(42);
        });
      };


      var id = function(x) {return x;};
      var testObj;

      for (var i = 0; i < functionalityArgs.length; i++) {
        addReturnedCurriedArityTest(i);
        addReturnedArityTest(i);
        addCalledTest(i);
        addReturnedValueTest(i);
      }
    });


    var callPropSpec = {
      name: 'callProp',
      restrictions: [['string']],
      validArguments: [['toString']]
    };

    checkFunction(callPropSpec, object.callProp, function(callProp) {
      it('Returned function has correct arity', function() {
        var fn = callProp('prop');

        expect(fn.length).to.equal(1);
      });


      it('Returned function has correct \'real\' arity', function() {
        var fn = callProp('prop');

        expect(arityOf(fn)).to.equal(1);
      });


      it('Returned function calls prop on given object', function() {
        var obj = {called: false, calledProp: function() {this.called = true;}};
        var caller = callProp('calledProp');
        var result = caller(obj);

        expect(obj.called).to.equal(true);
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


    var hasOwnPropertySpec = {
      name: 'hasOwnProperty',
      restrictions: [['string'], NO_RESTRICTIONS],
      validArguments: [['toString'], [1]]
    };


    checkFunction(hasOwnPropertySpec, object.hasOwnProperty, function(hasOwnProperty) {
      it('Works correctly (1)', function() {
        var obj = {funkier: 1};
        var result = hasOwnProperty('funkier', obj);

        expect(result).to.equal(true);
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        Constructor.prototype.funkier = 1;
        var obj = new Constructor();
        var result = hasOwnProperty('funkier', obj);

        expect(result).to.equal(false);
      });


      it('Works correctly when object has custom hasOwnProperty function', function() {
       // hasOwnProperty lint warning suppression
       /* jshint -W001 */
        var obj = {
          'foo': 1,
          'hasOwnProperty': function(prop) {
            return prop !== 'foo';
          }
        };
        var result = hasOwnProperty('foo', obj);

        expect(result).to.equal(true);
      });


      it('Works correctly when object has null prototype', function() {
        var obj = Object.create(null);
        obj.foo = 1;
        var result = hasOwnProperty('foo', obj);

        expect(result).to.equal(true);
      });
    });


    var hpSpec = {
      name: 'hasProperty',
      restrictions: [['string'], NO_RESTRICTIONS],
      validArguments: [['toString'], [1]]
    };


    checkFunction(hpSpec, object.hasProperty, function(hasProperty) {
      it('Works correctly (1)', function() {
        var obj = {funkier: 1};
        var result = hasProperty('funkier', obj);

        expect(result).to.equal(true);
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        Constructor.prototype.funkier = 1;
        var obj = new Constructor();
        var result = hasProperty('funkier', obj);

        expect(result).to.equal(true);
      });
    });


    var ioSpec = {
      name: 'instanceOf',
      restrictions: [['function'], NO_RESTRICTIONS],
      validArguments: [[Object], [{}]]
    };


    checkFunction(ioSpec, object.instanceOf, function(instanceOf) {
      it('Works correctly (1)', function() {
        expect(instanceOf(Object, {})).to.equal(true);
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        var obj = new Constructor();

        expect(instanceOf(Constructor, obj)).to.equal(true);
      });


      it('Works correctly (3)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        Constructor.prototype = Proto.prototype;
        var obj = new Constructor();

        expect(instanceOf(Proto, obj)).to.equal(true);
      });


      it('Works correctly (4)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        var obj = new Constructor();

        expect(instanceOf(Proto, obj)).to.equal(false);
      });
    });


    describe('isPrototypeOf', function() {
      var isPrototypeOf = object.isPrototypeOf;


      it('Works correctly (1)', function() {
        expect(isPrototypeOf(Object.prototype, {})).to.equal(true);
      });


      it('Works correctly (2)', function() {
        var Constructor = function() {};
        var obj = new Constructor();

        expect(isPrototypeOf(Constructor.prototype, obj)).to.equal(true);
      });


      it('Works correctly (3)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        Constructor.prototype = Proto.prototype;
        var obj = new Constructor();

        expect(isPrototypeOf(Proto.prototype, obj)).to.equal(true);
      });


      it('Works correctly (4)', function() {
        var Constructor = function() {};
        var Proto = function() {};
        var obj = new Constructor();

        expect(isPrototypeOf(Proto.prototype, obj)).to.equal(false);
      });


      it('Works correctly when object has custom isPrototypeOf function', function() {
        var obj = {
          'foo': 1,
          'isPrototypeOf': function(prop) {
            return true;
          }
        };
        var result = isPrototypeOf(obj, Object);

        expect(result).to.equal(false);
      });


      it('Works correctly when object has null prototype', function() {
        var obj = Object.create(null);
        obj.foo = 1;
        var result = isPrototypeOf(obj, Object);

        expect(result).to.equal(false);
      });
    });


    var coSpec = {
      name: 'createObject',
      restrictions: [['objectLikeOrNull']],
      validArguments: [[{}, function() {}, null, []]]
    };


    checkFunction(coSpec, object.createObject, function(createObject) {
      var isPrototypeOf = object.isPrototypeOf;
      var hasOwnProperty = object.hasOwnProperty;


      it('Returns an object', function() {
        var obj = {funkier: 1};
        var result = createObject(obj);

        expect(result).to.be.a('object');
      });


      it('Works correctly (1)', function() {
        var obj = {funkier: 1};
        var result = createObject(obj);

        expect(isPrototypeOf(obj, result)).to.equal(true);
      });


      it('Works correctly (2)', function() {
        var result = createObject(null);

        expect(Object.getPrototypeOf(result)).to.equal(null);
      });


      it('Ignores superfluous parameters', function() {
        var obj = {funkier: 1};
        var result = createObject(obj,
                      {prop1: {configurable: false, enumerable: false, writable: false, value: 42}});

        expect(hasOwnProperty('prop1', result)).to.equal(false);
      });
    });


    describe('createObjectWithProps', function() {
      var createObjectWithProps = object.createObjectWithProps;
      var isPrototypeOf = object.isPrototypeOf;
      var hasOwnProperty = object.hasOwnProperty;
      var descriptor = {prop1: {configurable: false, enumerable: false, writable: false, value: 42}};


      it('Returns an object', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj, descriptor);

        expect(result).to.be.a('object');
      });


      var addWorksCorrectlyTests = function(message, proto) {
        it('Created objects have correct prototype ' + message, function() {
          var result = createObjectWithProps(proto, descriptor);

          expect(Object.getPrototypeOf(result)).to.equal(proto);
        });


        it('Created objects have correct properties ' + message, function() {
          var result = createObjectWithProps(proto, descriptor);

          // Need to call hasOwnProperty in this manner because of the null
          // proto test, which of course will not inherit from Object.prototype
          expect(Object.prototype.hasOwnProperty.call(result, 'prop1')).to.equal(true);
        });


        it('Created objects have correct descriptors ' + message, function() {
          var result = createObjectWithProps(proto, descriptor);

          var descriptorProps = descriptor.prop1;
          var actualDescriptor = Object.getOwnPropertyDescriptor(result, 'prop1');
          expect(actualDescriptor).to.deep.equal(descriptorProps);
        });
      };


      addWorksCorrectlyTests('for normal case', {});
      addWorksCorrectlyTests('when prototype is null', null);
    });


    var dpSpec = {
      name: 'defineProperty',
      restrictions: [['string'], ['object'], ['objectLike']],
      validArguments: [['myprop'], [{writable: true, value:42}], [{}, function() {}]]
    };


    checkFunction(dpSpec, object.defineProperty, function(defineProperty) {
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

        expect(obj.hasOwnProperty('prop')).to.equal(true);
      });


      it('Objects have the property with the correct value after calling defineProperty', function() {
        var obj = {};
        var descriptor = {configurable: true, writable: false, enumerable: true, value: 42};
        defineProperty('prop', descriptor, obj);

        expect(obj.prop).to.deep.equal(descriptor.value);
      });


      it('The new property has the correct descriptor after calling defineProperty', function() {
        var obj = {};
        var descriptor = {configurable: true, writable: false, enumerable: true, value: 42};
        defineProperty('prop', descriptor, obj);
        var actualDescriptor = Object.getOwnPropertyDescriptor(obj, 'prop');

        expect(actualDescriptor).to.deep.equal(descriptor);
      });
    });


    var dpsSpec = {
      name: 'defineProperties',
      restrictions: [['object'], ['objectlike']],
      validArguments: [[{value: 42, writable: true}], [{}, function() {}]]
    };


    checkFunction(dpsSpec, object.defineProperties, function(defineProperties) {
      // Test data
      // Note: don't omit any optional properties, or we'll fail the equality check
      var descriptors = {
        prop1: {configurable: true, writable: false, enumerable: true, value: 42},
        prop2: {configurable: false, writable: true, enumerable: false, value: 'funkier'},
        prop3: {configurable: true, enumerable: true, get: function() {return false;}, set: undefined}
      };


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

        expect(allThere).to.equal(true);
      });


      it('Objects have the properties with the correct value after calling defineProperties', function() {
        var obj = {};
        defineProperties(descriptors, obj);
        var newProps = Object.keys(descriptors);

        newProps.forEach(function(p) {
          expect(obj[p]).to.deep.equal('get' in descriptors[p] ? descriptors[p].get() : descriptors[p].value);
        });
      });


      it('The new properties have the correct descriptors after calling defineProperties', function() {
        var obj = {};
        defineProperties(descriptors, obj);
        var newProps = Object.keys(descriptors);

        newProps.forEach(function(prop) {
          expect(Object.getOwnPropertyDescriptor(obj, prop)).to.deep.equal(descriptors[prop]);
        });
      });
    });


    describe('getOwnPropertyDescriptor', function() {
      var getOwnPropertyDescriptor = object.getOwnPropertyDescriptor;


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

        expect(descriptor).to.deep.equal(realDescriptor);
      });


      it('Works correctly (2)', function() {
        // Let's use object itself as a reasonably complex object
        var keys = Object.keys(object);

        keys.forEach(function(k) {
          var realDescriptor = Object.getOwnPropertyDescriptor(object, k);
          var descriptor = getOwnPropertyDescriptor(k, object);
          expect(descriptor).to.deep.equal(realDescriptor);
        });
      });
    });


    var eSpec = {
      name: 'extract',
      restrictions: [['string'], ['objectLike']],
      validArguments: [['prop'], [{prop: 1}]]
    };


    checkFunction(eSpec, object.extract, function(extract) {
      it('Returns undefined if property not present (1)', function() {
        expect(extract('prop', {})).to.equal(undefined);
      });


      it('Returns undefined if property not present (2)', function() {
        var obj = {};
        // Define a property with no getter
        object.defineProperty('foo', {enumerable: true, set: function(x) {}});

        expect(extract('foo', obj)).to.equal(undefined);
      });


      it('Works correctly (1)', function() {
        var obj = {prop: 42};
        var result = extract('prop', obj);

        expect(result).to.deep.equal(obj.prop);
      });


      it('Works correctly (2)', function() {
        var obj = {funkier: function() {}};
        var result = extract('funkier', obj);

        expect(result).to.deep.equal(obj.funkier);
      });


      it('Works correctly (3)', function() {
        var Constructor = function() {};
        Constructor.prototype.prop = 42;
        var obj = new Constructor();
        var result = extract('prop', obj);

        expect(result).to.deep.equal(obj.prop);
      });
    });


    var eodSpec = {
      name: 'extractOrDefault',
      restrictions: [['string'], NO_RESTRICTIONS, ['objectLike']],
      validArguments: [['prop'], [2], [{prop: 1}]]
    };


    checkFunction(eodSpec, object.extractOrDefault, function(extractOrDefault) {
      it('Returns default if property not present (1)', function() {
        var defaultVal = 42;

        expect(extractOrDefault('prop', defaultVal, {})).to.equal(defaultVal);
      });


      it('Returns default if property not present (2)', function() {
        var defaultVal = 42;
        var obj = {};
        // Define a property with no getter
        object.defineProperty('foo', {enumerable: true, set: function(x) {}});

        expect(extractOrDefault('foo', defaultVal, obj)).to.equal(defaultVal);
      });


      it('Works correctly (1)', function() {
        var obj = {prop: 42};
        var defaultVal = 'default';
        var result = extractOrDefault('prop', defaultVal, obj);

        expect(result).to.deep.equal(obj.prop);
      });


      it('Works correctly (2)', function() {
        var obj = {funkier: function() {}};
        var defaultVal = 'default';
        var result = extractOrDefault('funkier', defaultVal, obj);

        expect(result).to.deep.equal(obj.funkier);
      });


      it('Works correctly (3)', function() {
        var Constructor = function() {};
        Constructor.prototype.prop = 42;
        var obj = new Constructor();
        var defaultVal = 'default';
        var result = extractOrDefault('prop', defaultVal, obj);

        expect(result).to.deep.equal(obj.prop);
      });


      it('Works correctly (4)', function() {
        var obj = {funkier: undefined};
        var defaultVal = 'default';
        var result = extractOrDefault('funkier', defaultVal, obj);

        expect(result).to.deep.equal(obj.funkier);
      });
    });


    var mbxSpec = {
      name: 'maybeExtract',
      restrictions: [['string'], ['objectLike']],
      validArguments: [['prop'], [{prop: 1}]]
    };


    checkFunction(mbxSpec, object.maybeExtract, function(maybeExtract) {
      it('Works correctly if property not present (1)', function() {
        expect(isNothing(maybeExtract('prop', {}))).to.equal(true);
      });


      it('Works correctly if property not present (2)', function() {
        var obj = {};
        // Define a property with no getter
        Object.defineProperty(obj, 'foo', {enumerable: true, set: function(x) {}});

        expect(isNothing(maybeExtract('foo', obj))).to.equal(true);
      });


      it('Works correctly (1)', function() {
        var obj = {prop: 42};
        var result = maybeExtract('prop', obj);

        expect(isJust(result)).to.equal(true);
        expect(getJustValue(result)).to.deep.equal(obj.prop);
      });


      it('Works correctly (2)', function() {
        var obj = {funkier: function() {}};
        var result = maybeExtract('funkier', obj);

        expect(isJust(result)).to.equal(true);
        expect(getJustValue(result)).to.deep.equal(obj.funkier);
      });
    });


    // The various object manipulation functions have a lot of commonality.
    // We generate common tests.

    var makeCommonTests = function(setter, shouldWrap) {
      var defineProperty = object.defineProperty;


      it('Behaves correctly if writable false (1)', function() {
        var a = {};
        defineProperty('foo', {writable: false, value: 1}, a);
        var val = 42;
        var result;
        var fn = function() {
          result = setter('foo', val, a);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
      });


      it('Behaves correctly if writable false (2)', function() {
        var A = function() {};
        defineProperty('foo', {enumerable: true, writable: false, value: 1}, A.prototype);

        var b = new A();
        var val = 42;
        var result;
        var fn = function() {
          result = setter('foo', val, b);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
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
        var result;
        var fn = function() {
          result = setter('foo', val, a);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
      });


      it('Behaves correctly if no setter in descriptor (2)', function() {
        var a = (function() {
          var A = function() {};
          var privateProp = 1;
          var getter = function() {return privateProp;};
          defineProperty('foo', {get: getter}, A.prototype);

          var b = new A();
          return b;
        })();

        var val = 42;
        var result;
        var fn = function() {
          result = setter('foo', val, a);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
      });


      it('Behaves correctly if preventExtensions has been called (1)', function() {
        var a = {};
        Object.preventExtensions(a);
        var val = 42;
        var result;
        var fn = function() {
          result = setter('foo', val, a);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
      });


      it('Behaves correctly if seal has been called (1)', function() {
        var a = {};
        Object.seal(a);
        var val = 42;
        var result;
        var fn = function() {
          result = setter('foo', val, a);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
      });


      it('Behaves correctly if freeze has been called (1)', function() {
        var a = {};
        Object.freeze(a);
        var val = 42;
        var result;
        var fn = function() {
          result = setter('foo', val, a);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
      });


      it('Behaves correctly if freeze has been called (2)', function() {
        var a = {foo: 1};
        Object.freeze(a);
        var val = 42;
        var result;
        var fn = function() {
          result = setter('foo', val, a);
        };

        if (shouldWrap) {
          expect(fn).to.not.throw();
          expect(isNothing(result)).to.equal(true);
        } else {
          expect(fn).to.throw();
        }
      });
    };


    var makeCommonModificationTests = function(setter, shouldWrap) {
      var defineProperty = object.defineProperty;
      var hasOwnProperty = object.hasOwnProperty;


      it('Returns object on success', function() {
        var a = {foo: 1};
        var result = setter('foo', 42, a);

        if (shouldWrap) {
          expect(isJust(result)).to.equal(true);
          expect(getJustValue(result)).to.equal(a);
        } else {
          expect(result).to.equal(a);
        }
      });


      it('Object has property afterwards', function() {
        var a = {foo: 1};
        setter('foo', 42, a);

        expect(hasOwnProperty('foo', a)).to.equal(true);
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
        var result = setter('foo', val, a);

        if (shouldWrap) {
          expect(isJust(result)).to.equal(true);
          expect(getJustValue(result)).to.equal(a);
        } else {
          expect(result).to.equal(a);
        }

        expect(a.foo).to.equal(val);
      });


      it('Behaves correctly if seal has been called (2)', function() {
        var a = {foo: 1};
        Object.seal(a);
        var val = 42;
        var result = setter('foo', val, a);

        if (shouldWrap) {
          expect(isJust(result)).to.equal(true);
          expect(getJustValue(result)).to.equal(a);
        } else {
          expect(result).to.equal(a);
        }

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


      if (!shouldWrap) {
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


    var makeCommonCreationTests = function(setter, shouldWrap) {
      var defineProperty = object.defineProperty;
      var hasOwnProperty = object.hasOwnProperty;


      it('Returns object on success', function() {
        var a = {};
        var result = setter('foo', 42, a);

        if (shouldWrap) {
          expect(isJust(result)).to.equal(true);
          expect(getJustValue(result)).to.equal(a);
        } else {
          expect(result).to.equal(a);
        }
      });


      it('Creates the property if it doesn\'t exist', function() {
        var a = {};
        var val = 42;
        setter('foo', val, a);

        expect(hasOwnProperty('foo', a)).to.equal(true);
      });


      it('Creates the property if it only exists on the prototype', function() {
        var A = function() {};
        A.prototype.foo = 1;
        var b = new A();
        var val = 42;
        setter('foo', val, b);

        expect(hasOwnProperty('foo', b)).to.equal(true);
        expect(b.foo).to.equal(val);
      });
    };


    var makeSetterTests = function(desc, setter, shouldWrap) {
      var spec = {
        name: desc,
        restrictions: [['string'], NO_RESTRICTIONS, ['objectlike']],
        validArguments: [['foo'], [1], [{}, function() {}]]
      };


      checkFunction(spec, setter, function(setter) {
        makeCommonTests(setter, shouldWrap);
        makeCommonModificationTests(setter, shouldWrap);
        makeCommonCreationTests(setter, shouldWrap);
      });
    };


    makeSetterTests('set', object.set, false);
    makeSetterTests('safeSet', object.safeSet, true);


    var makeModifierTests = function(desc, modifier, shouldWrap) {
      var spec = {
        name: desc,
        restrictions: [['string'], NO_RESTRICTIONS, ['objectlike']],
        validArguments: [['foo'], [1], [{}, function() {}]]
      };


      checkFunction(spec, modifier, function(modifier) {
        makeCommonTests(modifier, shouldWrap);
        makeCommonModificationTests(modifier, shouldWrap);


        it('Doesn\'t create the property if it doesn\'t exist', function() {
          var a = {};
          var val = 42;
          var result;
          var fn = function() {
            result = modifier('foo', val, a);
          };

          if (!shouldWrap) {
            expect(fn).to.throw();
          } else {
            expect(fn).to.not.throw();
            expect(isNothing(result)).to.equal(true);
          }

          expect(a).to.not.have.property('foo');
        });
      });
    };


    makeModifierTests('modify', object.modify, false);
    makeModifierTests('safeModify', object.safeModify, true);


    var makeCreatorTests = function(desc, creator, shouldWrap) {
      var spec = {
        name: desc,
        restrictions: [['string'], NO_RESTRICTIONS, ['objectlike']],
        validArguments: [['foo'], [1], [{}, function() {}]]
      };


      checkFunction(spec, creator, function(creator) {
        makeCommonTests(creator, shouldWrap);
        makeCommonCreationTests(creator, shouldWrap);


        it('Doesn\'t modify the property if it exists', function() {
          var a = {foo: 1};
          var val = 42;

          var result;
          var fn = function() {
            result = creator('foo', val, a);
          };

          if (!shouldWrap) {
            expect(fn).to.throw();
          } else {
            expect(fn).to.not.throw();
            expect(isNothing(result)).to.equal(true);
          }

          expect(a.foo).to.equal(1);
        });
      });
    };


    makeCreatorTests('createProp', object.createProp, false);
    makeCreatorTests('safeCreateProp', object.safeCreateProp, true);


    // The delete functions also have a similar structure
    var makeDeleterTests = function(desc, deleter, shouldWrap) {
      var spec = {
        name: desc,
        restrictions: [['string'], ['objectlike']],
        validArguments: [['abc'], [{}, function() {}]]
      };


      checkFunction(spec, deleter, function(deleter) {
        var hasOwnProperty = object.hasOwnProperty;
        var defineProperty = object.defineProperty;


        it('Object does not have property afterwards', function() {
          var a = {foo: 1};
          deleter('foo', a);

          expect(hasOwnProperty('foo', a)).to.equal(false);
        });


        it('Behaves correctly if object does not have property', function() {
          var a = {bar: 1};
          var result = deleter('foo', a);

          if (!shouldWrap) {
            expect(result).to.equal(a);
          } else {
            expect(isJust(result)).to.equal(true);
            expect(getJustValue(result)).to.equal(a);
          }
        });


        it('Behaves correctly if object does not have property but prototype does', function() {
          var A = function() {};
          A.prototype.foo = 1;
          var b = new A();
          var result = deleter('foo', b);

          if (!shouldWrap) {
            expect(result).to.equal(b);
          } else {
            expect(isJust(result)).to.equal(true);
            expect(getJustValue(result)).to.equal(b);
          }

          expect(hasOwnProperty('foo', Object.getPrototypeOf(b))).to.equal(true);
        });


        it('Behaves correctly if configurable false', function() {
          var a = {};
          defineProperty('foo', {configurable: false, value: 1}, a);
          var result;
          var fn = function() {
            result = deleter('foo', a);
          };

          if (!shouldWrap) {
            expect(fn).to.throw();
          } else {
            expect(fn).to.not.throw();
            expect(isNothing(result)).to.equal(true);
          }

          expect(a).to.have.property('foo');
          expect(a.foo).to.equal(1);
        });


        it('Behaves correctly if preventExtensions called (1)', function() {
          var a = {foo: 1};
          Object.preventExtensions(a);
          var result = deleter('foo', a);

          if (!shouldWrap) {
            expect(result).to.equal(a);
          } else {
            expect(isJust(result)).to.equal(true);
            expect(getJustValue(result)).to.equal(a);
          }

          expect(hasOwnProperty('foo', a)).to.equal(false);
        });


        it('Behaves correctly if preventExtensions called (2)', function() {
          var a = {};
          Object.preventExtensions(a);
          var result = deleter('foo', a);

          if (!shouldWrap) {
            expect(result).to.equal(a);
          } else {
            expect(isJust(result)).to.equal(true);
            expect(getJustValue(result)).to.equal(a);
          }
        });


        it('Behaves correctly if seal called (1)', function() {
          var a = {};
          Object.seal(a);
          var result = deleter('foo', a);

          if (!shouldWrap) {
            expect(result).to.equal(a);
          } else {
            expect(isJust(result)).to.equal(true);
            expect(getJustValue(result)).to.equal(a);
          }
        });


        it('Behaves correctly if seal called (2)', function() {
          var a = {foo: 1};
          Object.seal(a);
          var result;
          var fn = function() {
            result = deleter('foo', a);
          };

          if (!shouldWrap) {
            expect(fn).to.throw();
          } else {
            expect(fn).to.not.throw();
            expect(isNothing(result)).to.equal(true);
          }

          expect(a).to.have.property('foo');
        });


        it('Behaves correctly if freeze called (1)', function() {
          var a = {};
          Object.freeze(a);
          var result =  deleter('foo', a);

          if (!shouldWrap) {
            expect(result).to.equal(a);
          } else {
            expect(isJust(result)).to.equal(true);
            expect(getJustValue(result)).to.equal(a);
          }
        });


        it('Behaves correctly if freeze called (2)', function() {
          var a = {foo: 1};
          Object.freeze(a);
          var result;
          var fn = function() {
            result = deleter('foo', a);
          };

          if (!shouldWrap) {
            expect(fn).to.throw();
          } else {
            expect(fn).to.not.throw();
            expect(isNothing(result)).to.equal(true);
          }

          expect(a).to.have.property('foo');
        });
      });
    };


    makeDeleterTests('deleteProp', object.deleteProp, false);
    makeDeleterTests('safeDeleteProp', object.safeDeleteProp, true);


    var nonObjects = [
      {name: 'number', val: 1},
      {name: 'boolean', val: true},
      {name: 'string', val: 'a'},
      {name: 'undefined', val: undefined},
      {name: 'null', val: null}];


    var makeKeyBasedTests = function(desc, fnUnderTest, verifier, expectNonEnumerable) {
      var defineProperty = object.defineProperty;


      describe(desc, function() {
        var makeNonObjectTest = function(val) {
          return function() {
            var result = fnUnderTest(val);
            expect(result).to.deep.equal([]);
          };
        };


        nonObjects.forEach(function(test) {
          it('Returns empty array for value of type ' + test.name,
             makeNonObjectTest(test.val));
        });


        it('Returns empty array for empty object', function() {
          var result = fnUnderTest({});
          expect(result).to.deep.equal([]);
        });


        var addReturnsCorrectTest = function(message, obj) {
          it('Returns correct value for ' + message, function() {
            var expected = verifier(obj);
            var result = fnUnderTest(obj);

            expect(result).to.deep.equal(expected);
          });
        };


        addReturnsCorrectTest('object (1)', {foo: 1, bar: 2, baz: 3});
        addReturnsCorrectTest('object (2)', object);
        addReturnsCorrectTest('array', [1, 2, 3]);
        addReturnsCorrectTest('empty array', []);


        it('Only returns own properties', function() {
          var F = function() {this.baz = 42;};
          F.prototype = {foo: 1, bar: 2};
          var a = new F();
          var expected = verifier(a);
          var result = fnUnderTest(a);

          expect(result).to.deep.equal(expected);
        });


        it('Behaves correctly with non-enumerable properties', function() {
          var a = {foo: 1, bar: 2};
          defineProperty('baz', {enumerable: false, value: 1}, a);
          var result = fnUnderTest(a).indexOf('baz');

          expect(result !== -1).to.equal(expectNonEnumerable);
        });
      });
    };


    makeKeyBasedTests('keys', object.keys, Object.keys, false);
    makeKeyBasedTests('getOwnPropertyNames', object.getOwnPropertyNames, Object.getOwnPropertyNames, true);


    var makeKeyPairBasedTests = function(desc, fnUnderTest, verifier) {
      describe(desc, function() {
        var makeNonObjectTest = function(val) {
          return function() {
            var result = fnUnderTest(val);
            expect(result).to.deep.equal([]);
          };
        };


        nonObjects.forEach(function(test) {
          it('Returns empty array for value of type ' + test.name,
             makeNonObjectTest(test.val));
        });


        it('Returns empty array for empty object', function() {
          var result = fnUnderTest({});
          expect(result).to.deep.equal([]);
        });


        var verifyKeys = function(obj, result) {
          var keys = result.map(function(r) {return r[0];});
          var expected = Object.keys(obj);

          expect(Array.isArray(result)).to.equal(true);
          expect(result.every(function(val) {
            return Array.isArray(val) && val.length === 2;
          })).to.equal(true);
          expect(keys).to.deep.equal(expected);
        };


        var verifyValues = function(obj, result) {
          var keys = result.map(function(r) {return r[0];});
          var values = result.map(function(r) {return r[1];});
          return values.every(function(val, i) {
            var key = keys[i];
            return verifier(val, key, obj);
          });
        };


        var addReturnsCorrectTests = function(message, obj) {
          it('Returns correct keys for ' + message, function() {
            var result = fnUnderTest(obj);

            verifyKeys(obj, result);
          });


          it('Returns correct values for ' + message, function() {
            var result = fnUnderTest(obj);

            verifyValues(obj, result);
          });
        };


        addReturnsCorrectTests('object (1)', {foo: 1, bar: 2, baz: 3});
        addReturnsCorrectTests('object (2)', object);
        addReturnsCorrectTests('array', [1, 2, 3]);
        addReturnsCorrectTests('empty array', []);


        it('Only returns keys for own properties', function() {
          var F = function() {this.baz = 42;};
          F.prototype = {foo: 1, bar: 2};
          var a = new F();
          var result = fnUnderTest(a);

          verifyKeys(a, result);
        });


        it('Only returns values for own properties', function() {
          var F = function() {this.baz = 42;};
          F.prototype = {foo: 1, bar: 2};
          var a = new F();
          var result = fnUnderTest(a);

          verifyValues(a, result);
        });
      });
    };


    makeKeyPairBasedTests('keyValues', object.keyValues, function(val, key, obj) {return val === obj[key];});

    var propVerifier = function(val, key, obj) {
      return deepEqual(val, object.getOwnPropertyDescriptor(key, obj));
    };
    makeKeyPairBasedTests('descriptors', object.descriptors, propVerifier);


    var makeCloneTests = function(desc, fnUnderTest, additionalTests) {
      describe(desc, function() {
        var isPrototypeOf = object.isPrototypeOf;
        var keys = object.keys;
        var defineProperty = object.defineProperty;
        var getOwnPropertyNames = object.getOwnPropertyNames;
        var getOwnPropertyDescriptor = object.getOwnPropertyDescriptor;


        it('New object has does not have same prototype', function() {
          var F = function() {};
          var a = new F();
          var clone = fnUnderTest(a);

          expect(isPrototypeOf(Object.getPrototypeOf(a), clone)).to.equal(false);
        });


        it('New array does have same prototype', function() {
          var a = [1, 2, 3];
          var clone = fnUnderTest(a);

          expect(isPrototypeOf(Object.getPrototypeOf(a), clone)).to.equal(true);
        });


        it('New object has same own keys as original', function() {
          var a = {foo: 1, bar: 2, baz: 3};
          var clone = fnUnderTest(a);
          var origKeys = keys(a);
          var cloneKeys = keys(clone);

          expect(cloneKeys).to.deep.equal(origKeys);
        });


        it('New array has same length as original', function() {
          var a = [1, 2, 3];
          var clone = fnUnderTest(a);

          expect(clone.length).to.equal(a.length);
        });


        it('New object has non-enumerable keys from original', function() {
          var a = {foo: 1, bar: 2};
          defineProperty('baz', {enumerable: false, value: 42}, a);
          var clone = fnUnderTest(a);
          var origKeys = getOwnPropertyNames(a);
          var cloneKeys = getOwnPropertyNames(clone);

          expect(origKeys).to.deep.equal(cloneKeys);
        });


        it('Enumerable properties are enumerable on clone', function() {
          var a = {foo: 1, bar: 2};
          var clone = fnUnderTest(a);
          var fooDescriptor = getOwnPropertyDescriptor('foo', clone);
          var barDescriptor = getOwnPropertyDescriptor('bar', clone);

          expect(fooDescriptor.enumerable).to.equal(true);
          expect(barDescriptor.enumerable).to.equal(true);
        });


        it('Non-enumerable properties are enumerable on clone', function() {
          var a = {foo: 1, bar: 2};
          defineProperty('baz', {enumerable: false, value: 42}, a);
          var clone = fnUnderTest(a);
          var bazDescriptor = getOwnPropertyDescriptor('baz', clone);

          expect(bazDescriptor.enumerable).to.equal(false);
        });


        it('Additional properties on arrays are copied', function() {
          var a = [];
          a.foo = 42;
          a['2.1'] = 'foo';
          var clone = fnUnderTest(a);

          expect(clone.hasOwnProperty('foo')).to.equal(true);
          expect(clone.hasOwnProperty('2.1')).to.equal(true);
        });


        it('Additional properties on functions are copied', function() {
          var f = function() {};
          f.bar = 42;
          var clone = fnUnderTest(f);

          expect(clone.hasOwnProperty('bar')).to.equal(true);
        });


        it('Cloning copies properties all the way up the prototype chain', function() {
          var a = {};
          defineProperty('foo', {enumerable: true, value: 'a'}, a);
          defineProperty('bar', {enumerable: false, value: 1}, a);
          var F = function() {};
          F.prototype = Object.create(a);
          defineProperty('fizz', {enumerable: true, value: 3}, a);
          defineProperty('buzz', {enumerable: false, value: 5}, a);
          var b = new F();
          var clone = fnUnderTest(b);
          var cloneProps = getOwnPropertyNames(clone);
          var hasProp = function(p) {return cloneProps.indexOf(p) !== -1;};
          var expectedProps = ['foo', 'bar', 'fizz', 'buzz'];
          var result = expectedProps.every(hasProp);

          expect(result).to.equal(true);
        });


        it('Clones have Object.prototype as their prototype if in prototype chain of original (1)', function() {
          var a = {};
          var clone = fnUnderTest(a);

          expect(Object.getPrototypeOf(clone)).to.equal(Object.prototype);
        });


        it('Clones have Object.prototype as their prototype if in prototype chain of original (2)', function() {
          var a = {};
          var b = Object.create(a);
          var clone = fnUnderTest(b);

          expect(Object.getPrototypeOf(clone)).to.equal(Object.prototype);
        });


        it('Clones have null as their prototype if in prototype chain of original', function() {
          var a = Object.create(null);
          var clone = fnUnderTest(a);

          expect(Object.getPrototypeOf(clone)).to.equal(null);
        });


        it('Cloning doesn\'t copy Object.prototype values if Object.prototype in prototype chain (2)', function() {
          var clone = fnUnderTest(Object.prototype);
          var objProto = getOwnPropertyNames(Object.prototype);
          var cloneProps = getOwnPropertyNames(clone);
          var result = objProto.every(function(k) {
            return cloneProps.indexOf(k) === -1;
          });

          expect(result).to.equal(true);
        });


        it('Cloning doesn\'t copy Array.prototype values', function() {
          var a = [];
          var clone = fnUnderTest(a);
          var arrProto = getOwnPropertyNames(Array.prototype);
          var cloneProps = getOwnPropertyNames(clone);
          var result = arrProto.every(function(k) {
            // Array.prototype does have a length property!
            if (k === 'length') return true;

            return cloneProps.indexOf(k) === -1;
          });

          expect(result).to.equal(true);
        });


        it('Cloning returns functions unchanged', function() {
          var a = function() {};
          var clone = fnUnderTest(a);
          expect(clone).to.equal(a);
        });


        it('Properties from prototype chain are copied in correct order', function() {
          var a = {foo: 1};
          var b = Object.create(a);
          b.foo = 2;
          var clone = fnUnderTest(b);

          expect(clone.foo).to.equal(2);
        });


        it('Handles null correctly', function() {
          var a = null;
          var clone = fnUnderTest(a);

          expect(a).to.equal(clone);
        });


        additionalTests(fnUnderTest);
      });
    };


    makeCloneTests('shallowClone', object.shallowClone, function(shallowClone) {
      it('New array has same values as original', function() {
        var a = [1, 2, 3, function() {}, {foo: 7, bar: 42}];
        var clone = shallowClone(a);
        clone.forEach(function(val, i) {
          expect(val).to.equal(a[i]);
        });
      });


      it('New object has same values as original', function() {
        var a = {
          foo: 42,
          bar: function() {},
          baz: [1, 2, 3],
          other: {v1: true, v2: {foo: 7, bar: 9}, v3: null}
        };
        object.defineProperty('nonenum', {enumerable: false, value: 'a'}, a);

        var clone = shallowClone(a);
        var result = object.getOwnPropertyNames(clone).forEach(function(k) {
          expect(clone[k]).to.equal(a[k]);
        });
      });
    });


    /* TODO REINSTATE DEEPCLONE
    makeCloneTests('deepClone', object.deepClone, function(deepClone) {
      var isPrimitive = function(v) {
         return ['string', 'number', 'boolean', 'undefined', 'function'].indexOf(typeof(v)) !== -1;
      };


      it('New array has same values as original', function() {
        var a = [1, 2, 3, function() {}, {foo: 7, bar: 42}, [4, 5]];
        var clone = deepClone(a);
        clone.forEach(function(val, i) {
          if (isPrimitive(val)) {
            expect(val).to.equal(a[i]);
          } else {
            expect(val).to.not.equal(a[i]);
            expect(val).to.deep.equal(a[i]);
          }
        });
      });


      it('New object has same values as original', function() {
        var a = {
          foo: 42,
          bar: function() {},
          baz: [1, 2, 3],
          other: {v1: true, v2: {foo: 7, bar: 9}, v3: null}
        };
        defineProperty('nonenum', {enumerable: false, value: 'a'}, a);

        var clone = deepClone(a);
        var result = getOwnPropertyNames(clone).forEach(function(k) {
          var val = clone[k];

          if (isPrimitive(val)) {
            expect(val).to.equal(a[k]);
          } else {
            expect(val).to.not.equal(a[k]);
            expect(val).to.deep.equal(a[i]);
          }
        });
      });


      it('Circularity handled correctly (1)', function() {
        var a = {};
        a.foo = a;
        var clone = deepClone(a);

        expect(clone).to.deep.equal(a);
      });


      it('Circularity handled correctly (2)', function() {
        var a = {};
        var b = Object.create(a);
        a.foo = b;
        var clone = deepClone(b);

        expect(clone).to.deep.equal(b);
      });


      it('Circularity handled correctly (3)', function() {
        var a = [];
        a[0] = a;
        var clone = deepClone(a);

        expect(clone).to.deep.equal(a);
      });
    });
    */


    var makeExtendTests = function(desc, fnUnderTest, remainingTests) {
      var spec = {
        name: desc,
        restrictions: [NO_RESTRICTIONS, ['objectLike']],
        validArguments: [[{}], [{}, function() {}]]
      };


      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
        it('Returns the destination object', function() {
          var dest = {};
          var result = fnUnderTest({}, dest);

          expect(result).to.equal(dest);
        });


        it('Every enumerable property in object afterwards', function() {
          var source = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
          var dest = {};
          fnUnderTest(source, dest);

          for (var key in source)
          expect(dest).to.have.ownProperty(key);
        });


        it('Every enumerable property has correct value afterwards', function() {
          var source = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
          var dest = {};
          fnUnderTest(source, dest);

          for (var key in source)
            expect(dest[key]).to.equal(source[key]);
        });


        it('Throws if preventExtensions has been called', function() {
          var source = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
          var dest = {};
          Object.preventExtensions(dest);

          var fn = function() {
            fnUnderTest(source, dest);
          };

          expect(fn).to.throw();
        });


        it('Behaves correctly if preventExtensions has been called and properties present', function() {
          var source = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
          var dest = {foo: 2, baz: 'b', bar: {}, fizz: [], buzz: 'a'};
          Object.preventExtensions(dest);

          var fn = function() {
            fnUnderTest(source, dest);
          };

          expect(fn).to.not.throw();
        });


        it('Throws if seal has been called', function() {
          var source = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
          var dest = {};
          Object.seal(dest);

          var fn = function() {
            fnUnderTest(source, dest);
          };

          expect(fn).to.throw();
        });


        it('Throws if seal has been called and properties already present but not writable', function() {
          var source = {foo: 1};
          var dest = {};
          Object.defineProperty(dest, 'foo', {foo: 2});
          Object.seal(dest);

          var fn = function() {
            fnUnderTest(source, dest);
          };

          expect(fn).to.throw();
        });


        it('Behaves correctly if seal has been called and properties already present', function() {
          var source = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
          var dest = {foo: 2, baz: 'b', bar: {}, fizz: [], buzz: 'a'};
          Object.seal(dest);

          var fn = function() {
            fnUnderTest(source, dest);
          };

          expect(fn).to.not.throw();
        });


        it('Throws if freeze has been called', function() {
          var source = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
          var dest = {};
          Object.freeze(dest);

          var fn = function() {
            fnUnderTest(source, dest);
          };

          expect(fn).to.throw();
        });


        it('Non-enumerable properties not copied', function() {
          var source = {};
          object.defineProperty('foo', {enumerable: false, value: 1}, source);
          var dest = {};
          fnUnderTest(source, dest);

          expect(dest).to.not.have.property('foo');
        });


        it('Existing values overwritten', function() {
          var source = {foo: 2};
          var dest = {foo: 1};
          fnUnderTest(source, dest);

          expect(dest.foo).to.equal(source.foo);
        });


        remainingTests(fnUnderTest);
      });
    };


    makeExtendTests('extend', object.extend, function(extend) {
      it('Every enumerable property from prototype chain in object afterwards', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {};
        extend(source, dest);

        for (var key in proto)
          expect(dest).to.have.ownProperty(key);
      });


      it('Every enumerable property from prototype has correct value afterwards', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {};
        extend(source, dest);

        for (var key in proto)
          expect(dest[key]).to.equal(proto[key]);
      });


      it('Values from prototype copied to dest, not dests prototype', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {};
        extend(source, dest);

        for (var key in proto)
          expect(dest.hasOwnProperty(key)).to.equal(true);
      });


      it('Throws if seal has been called and properties already present but not writable (2)', function() {
        var proto = {foo: 1};
        var source = Object.create(proto);
        var dest = {};
        Object.defineProperty(dest, 'foo', {foo: 2});
        Object.seal(dest);

        var fn = function() {
          fnUnderTest(source, dest);
        };

        expect(fn).to.throw();
      });


      it('Behaves correctly if seal has been called and properties already present (2)', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {foo: 2, baz: 'b', bar: {}, fizz: [], buzz: 'a'};
        Object.seal(dest);

        var fn = function() {
          extend(source, dest);
        };

        expect(fn).to.not.throw();
      });


      it('Behaves correctly if preventExtensions has been called and properties present (2)', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {foo: 2, baz: 'b', bar: {}, fizz: [], buzz: 'a'};
        Object.preventExtensions(dest);

        var fn = function() {
          extend(source, dest);
        };

        expect(fn).to.not.throw();
        Object.keys(proto).forEach(function(k) {
          expect(dest[k]).to.equal(proto[k]);
        });
      });
    });


    makeExtendTests('extendOwn', object.extendOwn, function(extendOwn) {
      it('No enumerable properties from prototype chain in object afterwards', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {};
        extendOwn(source, dest);

        for (var key in proto)
          expect(dest).to.not.have.property(key);
      });


      it('Non-enumerable properties not copied', function() {
        var proto = {};
        object.defineProperty('foo', {enumerable: false, value: 1}, proto);
        var source = Object.create(proto);
        var dest = {};
        extendOwn(source, dest);

        expect(dest).to.not.have.property('foo');
      });


      it('Behaves correctly if preventExtensions has been called (2)', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {};
        Object.preventExtensions(dest);

        var fn = function() {
          extendOwn(source, dest);
        };

        expect(fn).to.not.throw();
      });


      it('Behaves correctly if preventExtensions has been called and properties present (2)', function() {
        var proto = {foo: 1, baz: 'a', bar: {}, fizz: [], buzz: function() {}};
        var source = Object.create(proto);
        var dest = {foo: 2, baz: 'b', bar: {}, fizz: [], buzz: 'a'};
        Object.preventExtensions(dest);

        var fn = function() {
          extendOwn(source, dest);
        };

        expect(fn).to.not.throw();
        Object.keys(proto).forEach(function(k) {
          expect(dest[k]).to.not.equal(proto[k]);
        });
      });


      it('Does not throw if seal has been called and properties only present on prototype (2)', function() {
        var proto = {foo: 1};
        var source = Object.create(proto);
        var dest = {};
        Object.defineProperty(dest, 'foo', {foo: 2});
        Object.seal(dest);

        var fn = function() {
          extendOwn(source, dest);
        };

        expect(fn).to.not.throw();
      });
    });


    var curryOwnSpec = {
      name: 'curryOwn',
      restrictions: [['objectLike']],
      validArguments: [[{}, function() {}]]
    };


    checkFunction(curryOwnSpec, object.curryOwn, function(curryOwn) {
      it('Returns the object', function() {
        var foo = function(x, y) {};
        var bar = function(x, y, z) {};
        var obj = {foo: foo, bar: bar};

        expect(curryOwn(obj)).to.equal(obj);
      });


      it('Works correctly (1)', function() {
        var foo = function(x, y) {};
        var bar = function(x, y, z) {};
        var obj = {foo: foo, bar: bar};
        curryOwn(obj);

        // If its curried, recurrying won't change the function
        expect(objectCurry(obj.foo)).to.equal(obj.foo);
        expect(objectCurry(obj.bar)).to.equal(obj.bar);
      });


      it('Works correctly (2)', function() {
        var foo = function(x, y) { return this; };
        var bar = function(x, y, z) { return this; };
        var obj = {foo: foo, bar: bar};
        curryOwn(obj);

        expect(obj.foo(1)(2)).to.equal(obj);
        expect(obj.bar('a')('b')('c')).to.equal(obj);
      });


      it('Non-functional values should be untouched', function() {
        var foo = 42;
        var bar = {};
        var obj = {foo: foo, bar: bar};

        curryOwn(obj);

        expect(obj.foo).to.equal(foo);
        expect(obj.bar).to.equal(bar);
      });


      it('Values are unchanged if any function not writable', function() {
        var foo = function(x, y) {};
        var bar = function(x, y, z) {};
        var obj = {bar: bar};
        Object.defineProperty(obj, 'foo', {enumerable: true, value: foo});
        curryOwn(obj);

        // No need to check foo, we know it cannot be changed
        expect(obj.bar).to.equal(bar);
      });


      it('Functions with getters are unchanged', function() {
        var foo = function(x, y) {};
        var bar = function(x, y, z) {};
        var obj = {foo: foo, get bar() { return bar; }};
        Object.defineProperty(obj, 'foo', {value: foo});
        curryOwn(obj);

        expect(obj.bar).to.equal(bar);
        expect(objectCurry(obj.foo)).to.equal(obj.foo);
      });


      it('Functions with setters are unchanged', function() {
        var foo = function(x, y) {};
        var bar = function(x, y, z) {};
        var obj = {foo: foo, get bar() { return bar; }, set bar(f) { return bar; }};
        Object.defineProperty(obj, 'foo', {value: foo});
        curryOwn(obj);

        expect(obj.bar).to.equal(bar);
        expect(objectCurry(obj.foo)).to.equal(obj.foo);
      });


      it('Values are unchanged if not enumerable', function() {
        var foo = function(x, y) {};
        var obj = {};
        Object.defineProperty(obj, 'foo', {enumerable: false, value: foo});
        curryOwn(obj);

        // No need to check foo, we know it cannot be changed
        expect(obj.foo).to.equal(foo);
      });


      it('Behaves correctly if object sealed', function() {
        var foo = function(x, y) {};
        var bar = function(x, y, z) {};
        var obj = {foo: foo, bar: bar};
        Object.seal(obj);
        curryOwn(obj);

        // If its curried, recurrying won't change the function
        expect(objectCurry(obj.foo)).to.equal(obj.foo);
        expect(objectCurry(obj.bar)).to.equal(obj.bar);
      });


      it('Functions in prototype are unchanged', function() {
        var foo = function(x, y) {};
        var proto = {foo: foo};
        var obj = Object.create(proto);
        obj.bar = function(x, y, z) {};
        curryOwn(obj);

        expect(objectCurry(obj.bar)).to.equal(obj.bar);
        expect(proto.foo).to.equal(foo);
      });


      it('Unaffected by writable status of functions on prototype', function() {
        var foo = function(x, y) {};
        var proto = {};
        Object.defineProperty(proto, 'foo', {value: foo});
        var obj = Object.create(proto);
        obj.bar = function(x, y, z) {};
        curryOwn(obj);

        expect(objectCurry(obj.bar)).to.equal(obj.bar);
      });


      it('Unaffected by freeze status of functions on prototype', function() {
        var foo = function(x, y) {};
        var proto = {foo: foo};
        Object.freeze(proto);
        var obj = Object.create(proto);
        obj.bar = function(x, y, z) {};
        curryOwn(obj);

        expect(objectCurry(obj.bar)).to.equal(obj.bar);
      });
    });
  });
})();
