(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var utils = require('../utils');

    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;


    var expectedObjects = [];
    var expectedFunctions = ['valueStringifier'];
    describeModule('utils', utils, expectedObjects, expectedFunctions);


    var vsSpec = {
      name: 'valueStringifier',
      arity: 1
    };


    describeFunction(vsSpec, utils.valueStringifier, function(valueStringifier) {
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
