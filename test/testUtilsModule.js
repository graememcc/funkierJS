(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var utils = require('../utils');

    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var getRealArity = base.getRealArity;


    describe('Utils exports', function() {
      var expectedFunctions = ['valueStringifier'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('utils.js exports \'' + f + '\' property', exportsProperty(utils, f));
        it('\'' + f + '\' property of utils.js is a function', exportsFunction(utils, f));
      });
    });


    describe('valueStringifier', function() {
      var valueStringifier = utils.valueStringifier;


      it('Has correct arity', function() {
        expect(getRealArity(valueStringifier)).to.equal(1);
      });


      var f = function() {};
      var o = {};
      var tests = [
        {name: 'number', value: 1, result: '1'},
        {name: 'boolean', value: true, result: 'true'},
        {name: 'string', value: 'a', result: '\'a\''},
        {name: 'function', value: f, result: f.toString()},
        {name: 'object', value: o, result: '{' + o.toString() + '}'},
        {name: 'object with toString', value: {toString: function() {return '***';}},
                                       result: '{***}'},
        {name: 'array', value: [1, 2], result: '[1, 2]'},
        {name: 'undefined', value: undefined, result: 'undefined'},
        {name: 'null', value: null, result: 'null'}
      ];


      tests.forEach(function(t) {
        var name = t.name;

        it('Behaves correctly for ' + name, function() {
          var s = valueStringifier(t.value);
          var expected = t.result;

          expect(s).to.equal(expected);
        });
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
