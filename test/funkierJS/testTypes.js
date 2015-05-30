(function() {
  "use strict";


  var expect = require('chai').expect;

  var types = require('../../lib/components/types');

  var testUtils = require('./testingUtilities');
  var checkModule = testUtils.checkModule;
  var checkFunction = testUtils.checkFunction;
  var NO_RESTRICTIONS = testUtils.NO_RESTRICTIONS;
  var ANYVALUE = testUtils.ANYVALUE;


  describe('Types', function() {
    var expectedObjects = [];
    var expectedFunctions = ['deepEqual', 'equals', 'getType', 'is', 'isArray', 'isBoolean', 'isNull', 'isNumber',
                             'isObject', 'isRealObject', 'isString', 'isUndefined', 'notEqual', 'strictEquals',
                             'strictNotEqual'];


    checkModule('types', types, expectedObjects, expectedFunctions);


    // The following array is used for generating tests for both equality and strictEquality
    // They are not an exhaustive check of all possible type coercions.
    var equalityTests = [
      {value: 1, coercible: ['1', true, {valueOf: function() {return 1;}}],
                 notEqual: [0, NaN, false, undefined, null, function() {}, '2', {valueOf: function() {return 2;}}]},
      {value: '1', coercible: [true, {toString: function() {return '1';}}],
                 notEqual: [0, NaN, '0', undefined, null, function() {}, 'false', {toString: function() {return '0';}}]},
      {value: false, coercible: [0, '0', {valueOf: function() {return 0;}}],
                 notEqual: [NaN, true, undefined, null, function() {}, 'false', {valueOf: function() {return 1;}}]},
      {value: undefined, coercible: [null],
                 notEqual: [NaN, 'undefined', true, function() {}, 'false', {valueOf: function() {return 1;}}]},
      {value: null, coercible: [], // we've already tried permissible coercions in earlier tests
                 notEqual: [NaN, true, function() {}, 'false', {valueOf: function() {return 1;}}]},
      {value: {}, coercible: [], // we've already tried permissible coercions in earlier tests
                 notEqual: [NaN, true, function() {}, 'false', {}]}];


      var makeAnEqualityTest = function(equalityFn, expectedResult, val1, val2) {
        return function() {
          expect(equalityFn(val1, val2)).to.equal(expectedResult);
        };
      };


     var makeEqualsTests = function(name, fnUnderTest, isStrict, isNot) {
        var spec = {
          name: name,
        };


        checkFunction(spec, fnUnderTest, function(fnUnderTest) {
          equalityTests.forEach(function(test) {
            var val = test.value;
            var type = val !== null ? typeof(val) : 'null';

            it('Correct for value of type ' + type + ' when testing value with itself',
               makeAnEqualityTest(fnUnderTest, !isNot, val, val));

            var coercible = test.coercible;
            coercible.forEach(function(cVal) {
            var cType = cVal !== null ? typeof(cVal) : 'null';
            it('Correct for value of type ' + type + ' when testing value with coercible value of type ' + cType,
               makeAnEqualityTest(fnUnderTest, !(isStrict ^ isNot), val, cVal));
          });

          var notEqual = test.notEqual;
          notEqual.forEach(function(nVal) {
            var nType = nVal !== null ? typeof(nVal) : 'null';
            it('Correct for value of type ' + type + ' when testing value with unequal value of type ' + nType,
               makeAnEqualityTest(fnUnderTest, isNot, val, nVal));
          });
        });
      });
    };


    makeEqualsTests('equals', types.equals, false, false);
    makeEqualsTests('strictEquals', types.strictEquals, true, false);
    makeEqualsTests('notEqual', types.notEqual, false, true);
    makeEqualsTests('strictNotEqual', types.strictNotEqual, true, true);


    var deepEqualSpec = {
      name: 'deepEqual',
    };


    checkFunction(deepEqualSpec, types.deepEqual, function(deepEqual) {
      var addWorksCorrectlyTest = function(message, a, b, expected) {
        it('Works correctly for ' + message, function() {
          expect(deepEqual(a, b)).to.equal(expected);
        });
      };


      var deTests = [
        {name: 'number', value: 1},
        {name: 'string', value: 'a'},
        {name: 'boolean', value: true},
        {name: 'undefined', value: undefined},
        {name: 'function', value: function() {}},
        {name: 'null', value: null},
        {name: 'array', value: []},
        {name: 'object', value: {}}];


      deTests.forEach(function(deTest, i) {
        var name = deTest.name;
        var value = deTest.value;

        deTests.forEach(function(deTest2, j) {
          var name2 = deTest2.name;
          var value2 = deTest2.value;

          var expected = (i === j);
          addWorksCorrectlyTest('values of type ' + name + ' and ' + name2, value, value2, expected);
        });
      });


      it('Works correctly for objects with non-identical prototypes (1)', function() {
        var F = function() {this.foo = 1;};
        F.prototype = {};
        var G = function() {this.foo = 1;};
        G.prototype = {};
        var f = new F();
        var g = new G();

        expect(deepEqual(f, g)).to.equal(false);
      });


      addWorksCorrectlyTest('objects with different keys', {foo: 5}, {baz: 1}, false);
      addWorksCorrectlyTest('objects with different property values', {foo: 5}, {foo: 1}, false);
      addWorksCorrectlyTest('objects with properties that are not deep equal (1)', {foo: {bar: 1}},
                                                                                   {foo: {bar: 2}}, false);
      addWorksCorrectlyTest('objects with properties that are not deep equal (2)', {foo: [1, 2, 3]},
                                                                                   {foo: [4, 5]}, false);
      addWorksCorrectlyTest('objects with same keys and values', {foo: 4, bar: 3}, {foo: 4, bar: 3}, true);
      addWorksCorrectlyTest('objects with properties that are deep equal (1)', {foo: {bar: 1}}, {foo: {bar: 1}}, true);
      addWorksCorrectlyTest('objects with properties that are deep equal (2)', {foo: [1, 2, 3]}, {foo: [1, 2, 3]}, true);
      addWorksCorrectlyTest('arrays with different lengths', [1], [], false);
      addWorksCorrectlyTest('arrays with different values', [1, 2], [1, 3], false);
      addWorksCorrectlyTest('arrays that aren\'t deep equal (1)', [1, {foo: 5}], [1, {foo: 6}], false);
      addWorksCorrectlyTest('arrays that aren\'t deep equal (2)', [1, [1]], [1, [2]], false);
      addWorksCorrectlyTest('arrays with same lengths and  values', [1, 2], [1, 2], true);
      addWorksCorrectlyTest('arrays that are deep equal (1)', [1, {foo: 5}], [1, {foo: 5}], true);
      addWorksCorrectlyTest('arrays that are deep equal (2)', [1, [2]], [1, [2]], true);


      it('Works correctly for objects with non-identical prototypes (2)', function() {
        // The object literals here will not be identical
        var f = Object.create({foo: 1});
        var g = Object.create({foo: 1});

        expect(deepEqual(f, g)).to.equal(false);
      });


      it('Works correctly for objects with same prototypes', function() {
        var F = function() {this.foo = 1;};
        F.prototype = {};
        var f = new F();
        var g = new F();

        expect(deepEqual(f, g)).to.equal(true);
      });


      it('Non-enumerable properties do not affect deep equality', function() {
        var f = {buzz: 42};
        var g = {buzz: 42};
        Object.defineProperty(f, 'foo', {enumerable: false, value: 'a'});

        expect(deepEqual(f, g)).to.equal(true);
      });


      it('Works correctly for equal recursive array (1)', function() {
        var a = [1, 2, 3];
        a[3] = a;
        var b = [1, 2, 3];
        b[3] = a;

        expect(deepEqual(a, b)).to.equal(true);
      });


      it('Works correctly for equal recursive array (2)', function() {
        var a = [1, 2, 3];
        a[3] = a;
        var b = [1, 2, 3];
        b[3] = b;

        expect(deepEqual(a, b)).to.equal(true);
      });


      it('Works correctly for equal recursive array (3)', function() {
        var a = [1, 2, 3];
        a[3] = a;
        var b = [1, 2, 3, 4];

        expect(deepEqual(a, b)).to.equal(false);
      });


      it('Works correctly for equal recursive array (4)', function() {
        var a = [1, 2, 3, 4];
        var b = [1, 2, 3];
        a[3] = b;

        expect(deepEqual(a, b)).to.equal(false);
      });


      it('Works correctly for equal recursive array (5)', function() {
        var a = [1, 2, 3];
        a[4] = [4, 5, a];
        var b = [1, 2, 3];
        b[4] = [4, 5, b];

        expect(deepEqual(a, b)).to.equal(true);
      });


      it('Works correctly for equal recursive object (1)', function() {
        var o = {foo: 42};
        var a = {bar: o};
        o.bar = a;

        expect(deepEqual(o, o)).to.equal(true);
      });


      it('Works correctly for equal recursive object (2)', function() {
        var o1 = {foo: 42};
        var a = {bar: o1};
        o1.bar = a;

        var o2 = {foo: 42};
        var b = {bar: o2};
        o2.bar = b;

        expect(deepEqual(o1, o2)).to.equal(true);
      });


      it('Works correctly for equal recursive object (3)', function() {
        var o1 = {foo: 42};
        var a = {bar: o1};
        o1.bar = a;

        var o2 = {foo: 43};
        var b = {bar: o2};
        o2.bar = b;

        expect(deepEqual(o1, o2)).to.equal(false);
      });


      it('Works correctly for equal recursive object (4)', function() {
        var o1 = {foo: 42, bar: {}};
        o1.bar.baz = o1;

        var o2 = {foo: 42, bar: {}};
        o2.bar.baz = o2;

        expect(deepEqual(o1, o2)).to.equal(true);
      });


      it('Works correctly for equal recursive object (5)', function() {
        var o1 = {foo: 42, bar: {}};
        o1.bar.baz = o1;

        var o2 = {foo: 42, bar: {}};
        var other = {foo: 43, bar: {}};
        other.bar.baz = other;
        o2.bar.baz = other;

        expect(deepEqual(o1, o2)).to.equal(false);
      });


      it('Works correctly for array with custom properties (1)', function() {
        var a = [1, 2, 3];
        a.foo = 'bar';
        var b = [1, 2, 3];

        expect(deepEqual(a, b)).to.equal(false);
      });


      it('Works correctly for array with custom properties (2)', function() {
        var a = [1, 2, 3];
        a.foo = 'bar';
        var b = [1, 2, 3];
        b.foo = 'bar';

        expect(deepEqual(a, b)).to.equal(true);
      });
    });


    var isTestData = [
      {name: 'number', primitive: true, types: ['number'], value: 1},
      {name: 'string', primitive: true, types: ['string'], value: 'a'},
      {name: 'undefined', primitive: true, types: ['undefined'], value: undefined},
      {name: 'boolean', primitive: true, types: ['boolean'], value: true},
      {name: 'function', primitive: true, types: ['function'], value: function() {}},
      {name: 'object', primitive: true, types: ['realObject', 'object'], value: {}},
      {name: 'null', primitive: false, types: ['object', 'null'], value: null},
      {name: 'array', primitive: false, types: ['object', 'array'], value: [1]}
    ];


    var isSpec = {
      name: 'is',
      restrictions: [['string'], NO_RESTRICTIONS],
      validArguments: [['number'], ANYVALUE]
    };


    checkFunction(isSpec, types.is, function(is) {
      var primitiveIsTests = isTestData.filter(function(o) {return o.primitive;});


      var addIsCheck = function(name, test2) {
        it('Works correctly for type ' + name + ' and value ' + test2.name, function() {
          var result = is(name, test2.value);
          var expected = test2.types.indexOf(name) !== -1;

          expect(result).to.equal(expected);
        });
      };


      primitiveIsTests.forEach(function(primTest) {
        var name = primTest.name;

        isTestData.forEach(function(test2) {
          addIsCheck(primTest.name, test2);
        });
      });
    });


    var addSpecialisedIsCheck = function(name, fnUnderTest, test, accepts) {
      it('Works correctly for type ' + name, function() {
        var result = fnUnderTest(test.value);
        var expected = test.types.indexOf(accepts) !== -1;

        expect(result).to.equal(expected);
      });
    };


    var addSpecialisedIsTest = function(desc, fnUnderTest, accepts) {
      var spec = {
        name: desc,
      };


      checkFunction(spec, fnUnderTest, function(fnUnderTest) {
        isTestData.forEach(function(test) {
          var name = test.name;
          addSpecialisedIsCheck(name, fnUnderTest, test, accepts);
        });
      });
    };


    addSpecialisedIsTest('isNumber', types.isNumber, 'number');
    addSpecialisedIsTest('isString', types.isString, 'string');
    addSpecialisedIsTest('isBoolean', types.isBoolean, 'boolean');
    addSpecialisedIsTest('isUndefined', types.isUndefined, 'undefined');
    addSpecialisedIsTest('isObject', types.isObject, 'object');
    addSpecialisedIsTest('isArray', types.isArray, 'array');
    addSpecialisedIsTest('isNull', types.isNull, 'null');
    addSpecialisedIsTest('isRealObject', types.isRealObject, 'realObject');


    var getTypeSpec = {
      name: 'getType',
    };


    checkFunction(getTypeSpec, types.getType, function(getType) {
      var typeTests = [
        {name: 'number', val: 1},
        {name: 'boolean', val: true},
        {name: 'string', val: 'a'},
        {name: 'undefined', val: undefined},
        {name: 'null', val: null},
        {name: 'array', val: []},
        {name: 'function', val: function() {}},
        {name: 'object', val: {}}];

      typeTests.forEach(function(tt) {
        var name = tt.name;
        var val = tt.val;

        it('Works correctly for value of type ' + name, function() {
          expect(getType(val)).to.equal(typeof(val));
        });
      });
    });
  });
})();
