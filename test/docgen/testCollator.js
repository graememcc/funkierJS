// XXX Do we intend to allow these tests to be run in the browser
(function (root, factory) {
  var dependencies = ['chai', '../../docgen/APIFunction', '../../docgen/APIObject', '../../docgen/collator'];

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
}(this, function(exports, chai, APIFunction, APIObject, Collator) {
  "use strict";


  var expect = chai.expect;
  APIFunction = APIFunction.APIFunction;
  APIObject = APIObject.APIObject;
  Collator = Collator.Collator;


  describe('Collator', function() {
    describe('Constructor', function() {

      var badData = [
        {name: 'array', value: []},
        {name: 'number', value: 42},
        {name: 'string', value: 'a'},
        {name: 'boolean', value: true},
        {name: 'random object', value: {}},
        {name: 'function', value: function() {}},
        {name: 'undefined', value: undefined},
        {name: 'null', value: null}];


      badData.forEach(function(test, i) {
        if (i > 0) {
          it('Throws when called with ' + test.name, function() {
            var fn = function() {
              new Collator(test.value);
            };

            expect(fn).to.throw();
          });


          it('Throws when called with an array containing ' + test.name, function() {
            var fn = function() {
              new Collator([test.value]);
            };

            expect(fn).to.throw();
          });
        }


        it('Throws when called with an array with a sub-array containing ' + test.name, function() {
          var fn = function() {
            new Collator([[APIFunction('fizz', 'foo', 'bar', {})], [APIObject('a', 'b', 'c', {}), test.value]]);
          };

          expect(fn).to.throw();
        });
      });


      /*
       * Many of the tests have the same form. As usual, we generate them automagically.
       *
       */

      var addDualTest = function(description, makeFirst, makeSecond) {
        it('Throws if ' + description + ' (values occur in same array)', function() {
          var data = [[].concat(makeFirst).concat(makeSecond)];
          var fn = function() {
            new Collator(data);
          };

          expect(fn).to.throw();
        });


        it('Throws if ' + description + ' (values occur in same array)', function() {
          var data = [[].concat(makeFirst), [].concat(makeSecond)];
          var fn = function() {
            new Collator(data);
          };

          expect(fn).to.throw();
        });
      };


      addDualTest('two APIFunctions share the same name',
                  function() { return [APIFunction('foo', 'fizz', 'buzz', {})];},
                  function() { return [APIFunction('foo', 'fizz', 'buzz', {})];});


      addDualTest('two APIObjects share the same name',
                  function() { return [APIObject('foo', 'fizz', 'buzz', {})];},
                  function() { return [APIObject('foo', 'fizz', 'buzz', {})];});


      addDualTest('one function has the same name as the synonym of another',
                  function() { return [APIFunction('foo', 'fizz', 'buzz', {})];},
                  function() { return [APIFunction('bar', 'fizz', 'buzz', {synonyms: ['foo']})];});


      addDualTest('an APIObject has the same name as the synonym of an APIFunction',
                  function() { return [APIObject('foo', 'fizz', 'buzz', {})];},
                  function() { return [APIFunction('bar', 'fizz', 'buzz', {synonyms: ['foo']})];});


      addDualTest('two APIFunctions have the same synonym',
                  function() { return [APIFunction('foo', 'fizz', 'buzz', {synonyms: ['a1', 'a2']})];},
                  function() { return [APIFunction('bar', 'fizz', 'buzz', {synonyms: ['a3', 'a1']})];});



      it('Doesn\'t throw when called with an empty array', function() {
        var fn = function() {
          new Collator([]);
        };

        expect(fn).to.not.throw();
      });


      it('Constructor is new-agnostic', function() {
        expect(Collator([])).to.be.an.instanceOf(Collator);
      });
    });


    describe('Functions', function() {
      var testData, collated;

      beforeEach(function() {
        testData = [
          [
            APIFunction('Cat1Func1', 'Cat1', '', {synonyms: ['Cat1Func2', 'Cat1Func3']}),
            APIFunction('Cat2Func1', 'Cat2', '', {})
          ],
          [
            APIObject('Cat2Obj1', 'Cat2', '', {}),
            APIObject('Cat3Obj1', 'Cat3', '', {}),
            APIFunction('Cat1Func4', 'Cat1', '', {})
          ],
          [
            APIFunction('Cat1Func5', 'Cat1', '', {synonyms: ['Cat1Func6']})
          ]
        ];

        collated = Collator(testData);
      });


      describe('Category names', function() {
        it('Category names returned in alphabetical order', function() {
          var expected = ['Cat1', 'Cat2', 'Cat3'];
          expect(collated.getCategories()).to.deep.equal(expected);
        });
      });


      describe('By category', function() {
        it('Returns empty array when category not recognised', function() {
          expect(collated.byCategory('NonExistantCategory')).to.deep.equal([]);
        });


        it('Works as expected (1)', function() {
          var expected = [testData[0][1], testData[1][0]];
          expect(collated.byCategory(testData[0][1].category)).to.deep.equal(expected);
        });


        it('Works as expected (2)', function() {
          var expected = [testData[1][1]];
          expect(collated.byCategory(testData[1][1].category)).to.deep.equal(expected);
        });


        it('Adds objects representing synonyms as required', function() {
          var expected = [testData[0][0], {name: 'Cat1Func2', synonymFor: 'Cat1Func1'},
                          {name: 'Cat1Func3', synonymFor: 'Cat1Func1'}, testData[1][2], testData[2][0],
                          {name: 'Cat1Func6', synonymFor: 'Cat1Func5'} ];
          expect(collated.byCategory(testData[0][0].category)).to.deep.equal(expected);
        });
      });


      describe('By name', function() {
        it('Works as expected', function() {
          var expected = [
            testData[0][0], {name: 'Cat1Func2', synonymFor: 'Cat1Func1'}, {name: 'Cat1Func3', synonymFor: 'Cat1Func1'},
            testData[1][2], testData[2][0], {name: 'Cat1Func6', synonymFor: 'Cat1Func5'}, testData[0][1], testData[1][0],
            testData[1][1]
          ];

          expect(collated.byName()).to.deep.equal(expected);
        });
      });
    });
  });
}));
