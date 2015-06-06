(function() {
  "use strict";


  var expect = require('chai').expect;

  var categoryModule = require('../../lib/components/categories');

  var array = require('../../lib/components/array');
  var map = array.map;

  var base = require('../../lib/components/base');
  var compose = base.compose;
  var id = base.id;

  var string = require('../../lib/components/string');
  var toUpperCase = string.toUpperCase;

  var maybe = require('../../lib/components/maybe');
  var Nothing = maybe.Nothing;
  var Just = maybe.Just;
  var isNothing = maybe.isNothing;
  var isJust = maybe.isJust;
  var getJustValue = maybe.getJustValue;

  var result = require('../../lib/components/result');
  var Err = result.Err;
  var Ok = result.Ok;
  var isErr = result.isErr;
  var isOk = result.isOk;
  var getOkValue = result.getOkValue;

  var testUtils = require('./testingUtilities');
  var checkModule = testUtils.checkModule;
  var checkFunction = testUtils.checkFunction;
  var makeArrayLike = testUtils.makeArrayLike;


  describe('categories', function() {
    var expectedObjects = [];
    var expectedFunctions = ['fmap'];
    checkModule('categories', categoryModule, expectedObjects, expectedFunctions);


    describe('fmap', function() {
      var fmap = categoryModule.fmap;


      it('Works correctly for arrays (1)', function() {
        var arr = [];
        expect(fmap(id, arr)).to.deep.equal(arr);
      });


      it('Works correctly for arrays (2)', function() {
        var arr = [1, 2, 3];
        var inc = function(x) { return x + 1; };
        expect(fmap(inc, arr)).to.deep.equal(map(inc, arr));
      });


      it('Works correctly for arrays (3)', function() {
        var arr = makeArrayLike(4, 5, 6);
        var inc = function(x) { return x + 1; };
        expect(fmap(inc, arr)).to.deep.equal(map(inc, arr));
      });


      it('Works correctly for strings (1)', function() {
        var s = '';
        expect(fmap(id, s)).to.deep.equal([]);
      });


      it('Works correctly for strings (2)', function() {
        var s = 'abc';
        expect(fmap(toUpperCase, s)).to.deep.equal(map(toUpperCase, s));
      });


      it('Works correctly for Maybes (1)', function() {
        var j = Nothing;
        var inc = function(x) { return x + 1; };
        expect(isNothing(fmap(inc, j))).to.equal(true);
      });


      it('Works correctly for Maybes (1)', function() {
        var val = 41;
        var j = Just(val);
        var inc = function(x) { return x + 1; };

        var result = fmap(inc, j);
        expect(isJust(result)).to.equal(true);
        expect(getJustValue(result)).to.equal(inc(val));
      });


      it('Works correctly for Results (1)', function() {
        var r = Err(42);
        var inc = function(x) { return x + 1; };
        expect(fmap(inc, r)).to.equal(r);
      });


      it('Works correctly for Results (2)', function() {
        var val = 41;
        var j = Ok(val);
        var inc = function(x) { return x + 1; };

        var result = fmap(inc, j);
        expect(isOk(result)).to.equal(true);
        expect(getOkValue(result)).to.equal(inc(val));
      });


      it('Function is curried if necessary', function() {
        var arr = [1, 2, 3];
        var f = function(x, y) {};
        var result = fmap(f, arr);

        expect(result.every(function(g) { return typeof(g) === 'function'; })).to.equal(true);
      });


      var tests = [
        {name: 'null', value: null},
        {name: 'undefined', value: undefined},
        {name: 'number', value: 42},
        {name: 'boolean', value: true},
        {name: 'object', value: {foo: 1, bar: 'a'}},
      ];


      tests.forEach(function(t) {
        it('Throws when called with ' + t.name, function() {
          var fn = function() {
            fmap(id, t.value);
          };

          expect(fn).to.throw();
        });
      });
    });
  });
})();
