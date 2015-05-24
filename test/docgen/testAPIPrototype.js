// XXX Do we intend to allow these tests to be run in the browser?
(function (root, factory) {
  var dependencies = ['chai', '../../docgen/APIPrototype'];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else if (typeof exports === 'object') {
    // CommonJS

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  } else {
    // Browser globals

    root.commonJsStrict = root.commonJsStrict || {};
    factory.apply(null, [root].concat(dependencies.map(function(dep) {
      if (dep.slice(0, 2) == './') dep = dep.slice(2);
      if (dep.slice(0, 3) == '../') dep = dep.slice(3);
      return root[dep] || root.commonJsStrict[dep];
    })));
  }
}(this, function(exports, chai, APIPrototype) {
  "use strict";


  var expect = chai.expect;
  APIPrototype = APIPrototype.APIPrototype;


  describe('APIPrototype objects', function() {

    /*
     * The prototype requires that its properties are a certain type: every test for this will have the same shape,
     * so we take the opportunity to generate the tests on the fly.
     *
     */

    var addInvalidPropTest = function(prop, type, val) {
      it('Throws when setting ' + prop + ' to a value of type ' + type, function() {
        var obj = Object.create(APIPrototype);
        var fn = function() {
          obj[prop] = val;
        };

        expect(fn).to.throw();
      });
    };


    // Note: array should be the last entry to ease creating invalidArrayData later
    var invalidStringData = [
      {name: 'number', value: 42},
      {name: 'boolean', value: false},
      {name: 'undefined', value: undefined},
      {name: 'null', value: null},
      {name: 'object', value: {}},
      {name: 'function', value: function() {}},
      {name: 'array', value: []}
    ];


    ['name', 'category', 'summary'].forEach(function(prop) {
      invalidStringData.forEach(function(test) {
        addInvalidPropTest(prop, test.name, test.value);
      });
    });


    var invalidArrayData = invalidStringData.slice(0, -1);
    invalidArrayData.push({name: 'string', value: ''});


    /*
     * The optional properties are expected to be arrays containing only strings. If the value is not an array, or an
     * array that has a non-string member, then setting the property should throw. Again, we are in the position to
     * generate tests.
     *
     */

    var addInvalidArrayTest = function(prop, type, val) {
      it('Throws when setting ' + prop + ' to an array containing a value of type' + type, function() {
        var obj = Object.create(APIPrototype);
        var fn = function() {
          obj[prop] = ['val1', val];
        };

        expect(fn).to.throw();
      });
    };


    ['details', 'examples'].forEach(function(prop) {
      invalidArrayData.forEach(function(test) {
        addInvalidPropTest(prop, test.name, test.value);
      });


      invalidStringData.forEach(function(test) {
        addInvalidArrayTest(prop, test.name, test.value);
      });
    });


    /*
     * Next, we generate tests that show that the string properties are correctly set when supplied valid data.
     *
     */


    var addValidStringPropTest = function(prop) {
      it(prop + ' set correctly', function() {
        var val = 'Foo';
        var obj = Object.create(APIPrototype);
        obj[prop] = val;
        expect(obj[prop]).to.deep.equal(val);
      });
    };


    ['name', 'category', 'summary'].forEach(function(prop) {
      addValidStringPropTest(prop);
    });


    it('summary property shorn of trailing newlines', function() {
      var summary = 'baz';
      var obj = Object.create(APIPrototype);
      obj.summary = summary + '    \n';
      expect(obj.summary).to.equal(summary);
    });


    it('Newlines within the summary are preserved', function() {
      var summary = 'baz\nfoo';
      var obj = Object.create(APIPrototype);
      obj.summary = summary + '    \n';
      expect(obj.summary).to.equal(summary);
    });


    /*
     * The 'details', and 'examples' properties share some common characteristics:
     *   - They are arrays of strings
     *   - They should default to an empty array if not present in the options object
     *   - The array should be a clone of the value supplied to the constructor (not a reference)
     *   - The array should be immutable
     *
     * Given this commonality, we can automatically generate the tests.
     *
     */

    ['details', 'examples'].forEach(function(property) {
      it(property + ' is an empty array if not provided', function() {
        var obj = Object.create(APIPrototype);
        expect(obj[property]).to.deep.equal([]);
      });


      it(property + ' is correct when provided', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var obj = Object.create(APIPrototype);
        obj[property] = expected;
        expect(obj[property]).to.deep.equal(expected);
      });


      it(property + ' is a copy of supplied array when provided', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var obj = Object.create(APIPrototype);
        obj[property] = expected;
        expect(obj[property] === expected).to.equal(false);
      });


      it(property + ' array is immutable (1)', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var obj = Object.create(APIPrototype);
        obj[property] = expected;
        expect(Object.isFrozen(obj[property])).to.equal(true);
      });


      it(property + ' array is immutable (2)', function() {
        var obj = Object.create(APIPrototype);
        expect(Object.isFrozen(obj[property])).to.equal(true);
      });
    });


    it('Categories are normalized', function() {
      var obj = Object.create(APIPrototype);
      obj.category = 'foo';
      expect(obj.category).to.equal('Foo');
    });


    it('Category normalization preserves camelCasing other than for the first letter', function() {
      var obj = Object.create(APIPrototype);
      obj.category = 'fooBar';
      expect(obj.category).to.equal('FooBar');
    });


    it('Paragraph breaks in details are preserved', function() {
      var details = ['Line 1', '', 'Line 2', '  ', 'Line 3'];
      var obj = Object.create(APIPrototype);
      obj.details = details;
      expect(obj.details).to.deep.equal(details.map(function(s) { return s.trim(); }));
    });


    ['details', 'examples'].forEach(function(propName) {
      it('Trailing newlines at the end of ' + propName + ' entries are stripped', function() {
        var values = ['Line 1', 'Line 2'];
        var valuesToSupply = values.map(function(s, i) {
        var whitespace = '';
        for (var j = 0; j < i + 1; j++) whitespace += ' ';
          return s + whitespace + '\n';
        });

        var obj = Object.create(APIPrototype);
        obj[propName] = valuesToSupply;
        expect(obj[propName]).to.deep.equal(values);
      });


      it('Internal newlines are split in ' + propName + ' entries', function() {
        var values = ['Line 1', 'Line 2'];
        var valuesToSupply = [values.join('\n')];

        var obj = Object.create(APIPrototype);
        obj[propName] = valuesToSupply;
        expect(obj[propName]).to.deep.equal(values);
      });
    });
  });
}));
