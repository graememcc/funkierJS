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


    describe('Object exports', function() {
      var expectedFunctions = ['callPropWithArity', 'callProp', 'hasOwnProperty',
                               'hasProperty', 'instanceOf', 'isPrototypeOf', 'createObject',
                               'createObjectWithProps'];

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
      var testObj = {property: function() {return 42;}};
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


      // We cannot use testCurriedFunction, as createObjectWithProps produces an object, which
      // will cause the equality check to fail


      it('createObjectWithProps is curried (1)', function() {
        expect(getRealArity(createObjectWithProps({}))).to.equal(1);
      });


      it('createObjectWithProps is curried (2)', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj)(descriptor);

        expect(result).to.be.a('object');
      });


      it('createObjectWithProps is curried (3)', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj)(descriptor);

        expect(isPrototypeOf(obj, result)).to.be.true;
      });


      it('createObjectWithProps is curried (4)', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj)(descriptor);

        expect(hasOwnProperty('prop1', result)).to.be.true;
      });


      it('createObjectWithProps is curried (5)', function() {
        var obj = {funkier: 1};
        var result = createObjectWithProps(obj)(descriptor);

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
    });
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
