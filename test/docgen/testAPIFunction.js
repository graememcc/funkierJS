// XXX Do we intend to allow these tests to be run in the browser?
(function (root, factory) {
  var dependencies = ['chai', '../../docgen/APIFunction'];

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
}(this, function(exports, chai, APIFunction) {
  "use strict";


  var expect = chai.expect;
  APIFunction = APIFunction.APIFunction;


  describe('APIFunction constructor', function() {
    it('Constructor returns an object of the correct type', function() {
      expect(new APIFunction('foo', 'Bar', 'baz', {})).to.be.an.instanceOf(APIFunction);
    });


    it('Constructor is new agnostic', function() {
      expect(APIFunction('foo', 'Bar', 'baz', {})).to.be.an.instanceOf(APIFunction);
    });


    /*
     * Invalid test generation: The constructor takes four parameters. The first three should be strings, and the
     * fourth an object. We wish to test that the constructor throws when supplied an argument of invalid type at each
     * position. We generate these tests automatically.
     *
     */

    var constructInvalidParamTest = function(parameterNumber) {
      var paramName = ['name', 'category', 'summary', 'options'][parameterNumber];

      var stringInvalids = [1, true, {}, [], function() {}, undefined, null];
      var objectInvalids = [1, true, 'abc', [], function() {}, undefined, null];
      var invalids = [stringInvalids, stringInvalids, stringInvalids, objectInvalids];

      invalids[parameterNumber].map(function(invalid, i) {
        it('Constructor throws when ' + paramName + ' is invalid (' + (i + 1) + ')', function() {
          var args = ['foo', 'Bar', 'baz', {}];
          args[parameterNumber] = invalid;
          var fn = function() {
            APIFunction.apply(null, args);
          };

          expect(fn).to.throw();
        });
      });
    };


    for (var i = 0; i < 4; i++) {
      constructInvalidParamTest(i);
    }


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
     */

    ['details', 'examples', 'parameters', 'returnType', 'synonyms'].forEach(function(property) {
      invalidArrayData.concat([{value: '', type: 'string'}]).forEach(function(invalid) {
        if (invalid.type !== 'array') {
          it('Constructor throws when ' + property + ' has type ' + invalid.type, function() {
            var obj = {};
            obj[property] = invalid.value;
            var fn = function() {
              APIFunction('fizz', 'Bar', 'buzz', obj);
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
              APIFunction('fizz', 'Bar', 'buzz', obj);
            };

            expect(fn).to.throw();
          });
        }
      });
    });


    it('Constructor throws when parameters contains a value of type string', function() {
      var obj = {parameters: [{name: 'p1', type: ['t1']}, 'fizz']};
      var fn = function() {
        APIFunction('fizz', 'Bar', 'buzz', obj);
      };

      expect(fn).to.throw();
    });


    // More test generation: the constructor should throw if the objects describing the parameters have a non-string
    // 'name' property, a non-array 'type' property or non-string values in the 'type' property
    invalidArrayData.forEach(function(invalid) {
      it('Constructor throws when parameters contains a value with a name of type ' + invalid.type, function() {
        var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: invalid.value, type: ['t1']}]};
        var fn = function() {
          APIFunction('fizz', 'Bar', 'buzz', obj);
        };

        expect(fn).to.throw();
      });


      it('Constructor throws when if type array of a parameters entry contains a value of type ' + invalid.type,
         function() {
        var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2', invalid.value]}]};
        var fn = function() {
          APIFunction('fizz', 'Bar', 'buzz', obj);
        };

        expect(fn).to.throw();
      });


      if (invalid.type !== 'array') {
        it('Constructor throws when parameters contains a value with a type of type ' + invalid.type, function() {
          var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: 'p1', type: invalid.value}]};
          var fn = function() {
            APIFunction('fizz', 'Bar', 'buzz', obj);
          };

          expect(fn).to.throw();
        });
      }
    });


    it('Constructor throws when parameters contains a value with a type of type string', function() {
      var obj = {parameters: [{name: 'p1', type: ['t1']}, {name: 'p1', type: 't1'}]};
      var fn = function() {
        APIFunction('fizz', 'Bar', 'buzz', obj);
      };

      expect(fn).to.throw();
    });
  });


  describe('APIFunction objects', function() {
    it('name property correct', function() {
      var name = 'fizz';
      var obj = APIFunction(name, 'Bar', 'baz', {});
      expect(obj.name).to.equal(name);
    });


    it('category property correct', function() {
      var category = 'Bar';
      var obj = APIFunction('fizz', category, 'baz', {});
      expect(obj.category).to.equal(category);
    });


    it('summary property correct', function() {
      var summary = 'baz';
      var obj = APIFunction('fizz', 'Bar', summary, {});
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
        var obj = APIFunction('fizz', 'Bar', 'baz', {});
        expect(obj[property]).to.deep.equal([]);
      });


      it(property + ' is correct when provided', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var options = {};
        options[property] = expected;
        var obj = APIFunction('fizz', 'Bar', 'baz', options);
        expect(obj[property]).to.deep.equal(expected);
      });


      it(property + ' is a copy of supplied array when provided', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var options = {};
        options[property] = expected;
        var obj = APIFunction('fizz', 'Bar', 'baz', options);
        expect(obj[property] === expected).to.equal(false);
      });


      it(property + ' array is immutable (1)', function() {
        var expected = ['line 1', 'line 2', 'line 3'];
        var options = {};
        options[property] = expected;
        var obj = APIFunction('fizz', 'Bar', 'baz', options);

        expect(Object.isFrozen(obj[property])).to.equal(true);
      });


      it(property + ' array is immutable (2)', function() {
        var obj = APIFunction('fizz', 'Bar', 'baz', {});
        expect(Object.isFrozen(obj[property])).to.equal(true);
      });
    });


    it('parameters property is an empty array if no parameters provided', function() {
      var obj = APIFunction('fizz', 'Bar', 'baz', {});
      expect(obj.parameters).to.deep.equal([]);
    });


    it('parameters property is correct if parameters provided', function() {
      var expectedParameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'Bar', 'baz', {parameters: expectedParameters});
      expect(obj.parameters).to.deep.equal(expectedParameters);
    });


    it('parameters property is a copy of supplied array when provided', function() {
      var expectedParameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'Bar', 'baz', {parameters: expectedParameters});
      expect(obj.parameters === expectedParameters).to.equal(false);
    });


    it('Objects in the parameters array have immutable type arrays', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'Bar', 'baz', {parameters: parameters});

      var allImmutable = obj.parameters.every(function(param) {
        return Object.isFrozen(param.type);
      });
      expect(allImmutable).to.equal(true);
    });


    it('Objects in the parameters array have type arrays that are copies of the original', function() {
      var types = [['t1'], ['t2']];
      var parameters = [{name: 'p1', type: types[0]}, {name: 'p2', type: types[1]}];
      var obj = APIFunction('fizz', 'Bar', 'baz', {parameters: parameters});

      var allCopies = obj.parameters.every(function(param, i) {
        return param.type !== types[i];
      });
      expect(allCopies).to.equal(true);
    });


    it('parameters array is immutable (1)', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'Bar', 'baz', {parameters: parameters});

      expect(Object.isFrozen(obj.parameters)).to.equal(true);
    });


    it('parameters array is immutable (2)', function() {
      var obj = APIFunction('fizz', 'Bar', 'baz', {});

      expect(Object.isFrozen(obj.parameters)).to.equal(true);
    });


    it('parameters array contents are clones of supplied contents', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'Bar', 'baz', {parameters: parameters});

      var allDifferent = obj.parameters.every(function(paramObj, i) {
        return paramObj !== parameters[i];
      });
      expect(allDifferent).to.equal(true);
    });


    it('parameters array contents are immutable', function() {
      var parameters = [{name: 'p1', type: ['t1']}, {name: 'p2', type: ['t2']}];
      var obj = APIFunction('fizz', 'Bar', 'baz', {parameters: parameters});

      var allFrozen = obj.parameters.every(function(paramObj) {
        return Object.isFrozen(paramObj);
      });
      expect(allFrozen).to.equal(true);
    });


    it('Returned objects are immutable (1)', function() {
      var obj = APIFunction('fizz', 'Bar', 'baz', {});

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
      var obj = APIFunction('fizz', 'Bar', 'baz', options);

      expect(Object.isFrozen(obj)).to.equal(true);
    });


    it('Categories are normalized', function() {
      var obj = APIFunction('fizz', 'foo', 'buzz', {});

      expect(obj.category).to.equal('Foo');
    });


    it('Category normalization preserves camelCasing other than for the first letter', function() {
      var obj = APIFunction('fizz', 'fooBar', 'buzz', {});

      expect(obj.category).to.equal('FooBar');
    });
  });
}));
