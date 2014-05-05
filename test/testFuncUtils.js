(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var funcUtils = require('../funcUtils');

    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;


    var expectedObjects = [];
    var expectedFunctions = ['isFunction'];
    describeModule('funcUtils', funcUtils, expectedObjects, expectedFunctions);


    var nonFunctions = [
      {name: 'number', value: 1},
      {name: 'boolean', value: true},
      {name: 'string', value: 'a'},
      {name: 'object', value: {}},
      {name: 'array', value: [1, 2]},
      {name: 'undefined', value: undefined},
      {name: 'null', value: null}
    ];


    var funcs = [
      function() {},
      function(x) {},
      function(x, y) {},
      function(x, y, z) {}
    ];


    // We cannot use describeFunction from testUtils due to the optional parameter
    describe('isFunction', function() {
      var isFunction = funcUtils.isFunction;


      nonFunctions.forEach(function(test) {
        it('Works correctly for value of type ' + test.name, function() {
          var b = isFunction(test.value);

          expect(b).to.be.false;
        });
      });


      funcs.forEach(function(f) {
        it('Works correctly for function of arity ' + f.length, function() {
          var b = isFunction(f);

          expect(b).to.be.true;
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
