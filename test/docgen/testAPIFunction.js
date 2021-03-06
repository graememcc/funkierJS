(function() {
  "use strict";


  var expect = require('chai').expect;
  var APIPrototype = require('../../docgen/APIPrototype');
  var APIFunction = require('../../docgen/APIFunction');


  describe('APIFunction constructor', function() {
    it('Constructor returns an object of the correct type', function() {
      expect(new APIFunction('foo', 'a.js', 'Bar', 'baz', {})).to.be.an.instanceOf(APIFunction);
    });


    it('Constructor is new agnostic', function() {
      expect(APIFunction('foo', 'a.js', 'Bar', 'baz', {})).to.be.an.instanceOf(APIFunction);
    });


    it('Returned objects should have APIPrototype in their prototype chain', function() {
      expect(APIPrototype.isPrototypeOf(APIFunction('foo', 'a.js', 'Bar', 'baz', {}))).to.equal(true);
    });


    /*
     * Invalid test generation: The constructor takes five parameters. The first four should be strings, and the
     * last an object. We wish to test that the constructor throws when supplied an argument of invalid type at each
     * position. We generate these tests automatically.
     *
     */

    ['name', 'filename', 'category', 'summary', 'options'].forEach(function(paramName, i, arr) {
      var stringInvalids = [1, true, {}, [], function() {}, undefined, null];
      var objectInvalids = [1, true, 'abc', [], function() {}, undefined, null];

      (i === arr.length - 1 ? objectInvalids: stringInvalids).map(function(invalid, j) {
        it('Constructor throws when ' + paramName + ' is invalid (' + (j + 1) + ')', function() {
          var args = ['foo', 'a.js', 'Bar', 'baz', {}];
          args[i] = invalid;
          var fn = function() {
            APIFunction.apply(null, args);
          };

          expect(fn).to.throw();
        });
      });
    });


    var invalidArrayData = [{value: 1, type: 'number'},
                            {value: true, type: 'boolean'},
                            {value: {}, type: 'object'},
                            {value: null, type: 'null' },
                            {value: [], type: 'array'},
                            {value: [Function], type: 'function'}];

    /*
     * Every optional property except 'parameters' is expected to be an array containing only strings. If the value is
     * not an array, or an array that has a non-string member, then the constructor should throw. Every test for this
     * would have the same shape, regardless of the property, so we shall just generate the tests.
     *
     * Note: we only test the unique properties here: the rest we get for free through APIPrototype being in the
     * prototype chain (tested above).
     *
     */

    ['parameters', 'returnType', 'synonyms'].forEach(function(property) {
      invalidArrayData.concat([{value: '', type: 'string'}]).forEach(function(invalid) {
        if (invalid.type !== 'array') {
          it('Constructor throws when ' + property + ' has type ' + invalid.type, function() {
            var obj = {};
            obj[property] = invalid.value;
            var fn = function() {
              APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
            };

            expect(fn).to.throw();
          });
        }
      });

      invalidArrayData.forEach(function(invalid) {
        if (property !== 'parameters' || invalid.type !== 'object') {
          it('Constructor throws when ' + property + ' contains a value of type ' + invalid.type, function() {
            var obj = {};
            obj[property] = [(property != 'parameters' ? 'line1' : {name: 'p1', type: ['t1']}), invalid.value];
            var fn = function() {
              APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
            };

            expect(fn).to.throw();
          });
        }
      });
    });


    it('Constructor throws when parameters contains a value of type string', function() {
      var obj = {parameters: [{name: 'p1', type: ['t1']}, 'fizz']};
      var fn = function() {
        APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
      };

      expect(fn).to.throw();
    });


    // More test generation: the constructor should throw if the objects describing the parameters have a non-string
    // 'name' property, a non-array 'type' property or non-string values in the 'type' property
    invalidArrayData.forEach(function(invalid) {
      it('Constructor throws when parameters contains a value with a name of type ' + invalid.type, function() {
        var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: invalid.value, type: ['t1']}]};
        var fn = function() {
          APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
        };

        expect(fn).to.throw();
      });


      it('Constructor throws when type array of a parameters entry contains a value of type ' + invalid.type,
         function() {
        var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2', invalid.value]}]};
        var fn = function() {
          APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
        };

        expect(fn).to.throw();
      });


      if (invalid.type !== 'array') {
        it('Constructor throws when parameters contains a value with a type of type ' + invalid.type, function() {
          var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: 'p1', type: invalid.value}]};
          var fn = function() {
            APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
          };

          expect(fn).to.throw();
        });
      }
    });


    it('Constructor throws when parameters contains a value with a type of type string', function() {
      var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: 'p1', type: 't1'}]};
      var fn = function() {
        APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
      };

      expect(fn).to.throw();
    });


    it('Constructor throws when a parameter\'s type property is an empty array', function() {
      var obj = {parameters: [{name: 'p1', type: []}]};
      var fn = function() {
        APIFunction('fizz', 'a.js', 'Bar', 'buzz', obj);
      };

      expect(fn).to.throw();
    });
  });


  describe('APIFunction objects', function() {
    it('name property correct', function() {
      var name = 'fizz';
      var obj = APIFunction(name, 'a.js', 'Bar', 'baz', {});
      expect(obj.name).to.equal(name);
    });


    it('filename property correct', function() {
      var filename = 'a.js';
      var obj = APIFunction('fizz', filename, 'Bar', 'baz', {});
      expect(obj.filename).to.equal(filename);
    });


    it('category property correct', function() {
      var category = 'Bar';
      var obj = APIFunction('fizz', 'a.js', category, 'baz', {});
      expect(obj.category).to.equal(category);
    });


    it('summary property correct', function() {
      var summary = 'baz';
      var obj = APIFunction('fizz', 'a.js', 'Bar', summary, {});
      expect(obj.summary).to.equal(summary);
    });


    it('summary property shorn of trailing newlines', function() {
      var summary = 'baz';
      var obj = APIFunction('fizz', 'a.js', 'Bar', summary + '    \n', {});
      expect(obj.summary).to.equal(summary);
    });


    it('Newlines within the summary are preserved', function() {
      var summary = 'baz\nfoo';
      var obj = APIFunction('fizz', 'a.js', 'Bar', summary, {});
      expect(obj.summary).to.equal(summary);
    });


    /*
     * The 'details', 'returnType', 'synonyms' and 'examples' properties all share some common characteristics:
     *   - They are arrays of strings
     *   - They should default to an empty array if not present in the options object
     *   - The array should be a clone of the value supplied to the constructor (not a reference)
     *   - The array should be immutable
     *
     * Given this commonality, we can automatically generate the tests.
     *
     */

    ['details', 'returnType', 'examples', 'synonyms'].forEach(function(property) {
      it(property + ' is an empty array if not provided', function() {
        var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {});
        expect(obj[property]).to.deep.equal([]);
      });


      it(property + ' is correct when provided', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var options = {};
        options[property] = expected;
        var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', options);
        expect(obj[property]).to.deep.equal(expected);
      });


      it(property + ' is a copy of supplied array when provided', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var options = {};
        options[property] = expected;
        var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', options);
        expect(obj[property] === expected).to.equal(false);
      });


      it(property + ' array is immutable (1)', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var options = {};
        options[property] = expected;
        var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', options);

        expect(Object.isFrozen(obj[property])).to.equal(true);
      });


      it(property + ' array is immutable (2)', function() {
        var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {});
        expect(Object.isFrozen(obj[property])).to.equal(true);
      });
    });


    it('parameters property is an empty array if no parameters provided', function() {
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {});
      expect(obj.parameters).to.deep.equal([]);
    });


    it('parameters property is correct if parameters provided', function() {
      var expectedParameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {parameters: expectedParameters});
      expect(obj.parameters).to.deep.equal(expectedParameters);
    });


    it('parameters property is a copy of supplied array when provided', function() {
      var expectedParameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {parameters: expectedParameters});
      expect(obj.parameters === expectedParameters).to.equal(false);
    });


    it('Objects in the parameters array have immutable type arrays', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {parameters: parameters});

      var allImmutable = obj.parameters.every(function(param) {
        return Object.isFrozen(param.type);
      });
      expect(allImmutable).to.equal(true);
    });


    it('Objects in the parameters array have type arrays that are copies of the original', function() {
      var types = [['t1'], ['t2']];
      var parameters = [{name: 'p1', type: types[0]}, {name: 'p2', type: types[1]}];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {parameters: parameters});

      var allCopies = obj.parameters.every(function(param, i) {
        return param.type !== types[i];
      });
      expect(allCopies).to.equal(true);
    });


    it('parameters array is immutable (1)', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {parameters: parameters});

      expect(Object.isFrozen(obj.parameters)).to.equal(true);
    });


    it('parameters array is immutable (2)', function() {
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {});

      expect(Object.isFrozen(obj.parameters)).to.equal(true);
    });


    it('parameters array contents are clones of supplied contents', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {parameters: parameters});

      var allDifferent = obj.parameters.every(function(paramObj, i) {
        return paramObj !== parameters[i];
      });
      expect(allDifferent).to.equal(true);
    });


    it('parameters array contents are immutable', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {parameters: parameters});

      var allFrozen = obj.parameters.every(function(paramObj) {
        return Object.isFrozen(paramObj);
      });
      expect(allFrozen).to.equal(true);
    });


    it('Returned objects are immutable (1)', function() {
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', {});

      expect(Object.isFrozen(obj)).to.equal(true);
    });


    it('Returned objects are immutable (2)', function() {
      var options = {
        details: ['line 1', 'line 2'],
        returnType: ['type1', 'type2'],
        parameters: [{name: 'p1', type: ['arg1']}],
        synonyms: ['otherName'],
        examples: ['line 1']
      };
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'baz', options);

      expect(Object.isFrozen(obj)).to.equal(true);
    });


    it('Categories are normalized', function() {
      var obj = APIFunction('fizz', 'a.js', 'foo', 'buzz', {});

      expect(obj.category).to.equal('Foo');
    });


    it('Category normalization preserves camelCasing other than for the first letter', function() {
      var obj = APIFunction('fizz', 'a.js', 'fooBar', 'buzz', {});

      expect(obj.category).to.equal('FooBar');
    });


    it('Paragraph breaks in details are preserved', function() {
      var details = ['Line 1', '', 'Line 2', '  ', 'Line 3'];
      var obj = APIFunction('fizz', 'a.js', 'Bar', 'buzz', {details: details});
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

        var options = {};
        options[propName] = valuesToSupply;
        var obj = APIFunction('fizz', 'a.js', 'Bar', 'buzz', options);
        expect(obj[propName]).to.deep.equal(values);
      });


      it('Internal newlines are split in ' + propName + ' entries', function() {
        var values = ['Line 1', 'Line 2'];
        var valuesToSupply = [values.join('\n')];
        var options = {};
        options[propName] = valuesToSupply;
        var obj = APIFunction('fizz', 'a.js', 'Bar', 'buzz', options);
        expect(obj[propName]).to.deep.equal(values);
      });
    });
  });
})();
