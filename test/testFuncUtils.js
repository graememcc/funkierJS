(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var funcUtils = require('../funcUtils');

    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;


    var expectedObjects = [];
    var expectedFunctions = ['checkFunction'];
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
    describe('checkFunction', function() {
      var checkFunction = funcUtils.checkFunction;


      nonFunctions.forEach(function(test) {
        it('Throws for value of type ' + test.name, function() {
          var fn = function() {
            checkFunction(test.value);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws with correct message value of type ' + test.name, function() {
          var message = 'That ain\'t no stinking function!';
          var fn = function() {
            checkFunction(test.value, {message: message});
          };

          expect(fn).to.throw(message);
        });
      });


      funcs.forEach(function(f) {
        it('Works correctly for function of arity ' + f.length, function() {
          var g = checkFunction(f);

          expect(g).to.equal(f);
        });
      });


      var addBadArityTest = function(arity, f) {
        it('Throws for function of arity ' + f.length + ' when arity is ' + arity, function() {
          var fn = function() {
            checkFunction(f, {arity: arity});
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws with correct message for disallowed arity ' + f.length, function() {
          var message = 'That ain\'t the right stinking function!';
          var fn = function() {
            checkFunction(f, {arity: arity, message: message});
          };

          expect(fn).to.throw(message);
        });
      };


      var addBadMinArityTest = function(arity, f) {
        it('Throws for function of arity ' + f.length + ' when minimum arity is ' + arity, function() {
          var fn = function() {
            checkFunction(f, {arity: arity, minimum: true});
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws with correct message for disallowed arity ' + f.length + ' below minimum ' + arity, function() {
          var message = 'That ain\'t the right stinking function!';
          var fn = function() {
            checkFunction(f, {arity: arity, message: message, minimum: true});
          };

          expect(fn).to.throw(message);
        });
      };


      var addGoodArityTest = function(arity, f, isMin) {
        isMin = isMin || false;


        it('Doesn\'t throw for function of arity ' + f.length + ' when ' + (isMin ? 'minimum ' : '') + 'arity is ' + arity, function() {
          var result = null;
          var fn = function() {
            var options = isMin ? {arity: arity, minimum: true} : {arity: arity};
            result = checkFunction(f, options);
          };

          expect(fn).to.not.throw(TypeError);
          expect(result).to.equal(f);
        });
      };


      funcs.forEach(function(_, arity) {
        funcs.forEach(function(f) {
          if (f.length === arity)
            addGoodArityTest(arity, f);
          else
            addBadArityTest(arity, f);

          if (arity > 0) {
            if (f.length >= arity)
              addGoodArityTest(arity, f, true);
            else
              addBadMinArityTest(arity, f);
          }
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
