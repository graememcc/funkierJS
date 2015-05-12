//(function() {
//  "use strict";
//
//
//  var testFixture = function(require, exports) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var combinators = require('../../combinators');
//
//    var base = require('../../base');
//    var id = base.id;
//    var constant = base.constant;
//
//    // Import utility functions
//    var testUtils = require('./testUtils');
//    var describeModule = testUtils.describeModule;
//    var describeFunction = testUtils.describeFunction;
//    var exportsProperty = testUtils.exportsProperty;
//    var exportsFunction = testUtils.exportsFunction;
//    var testCurriedFunction = testUtils.testCurriedFunction;
//
//
//    var expectedObjects = ['combinators'];
//    var expectedFunctions = [];
//    describeModule('combinators', combinators, expectedObjects, expectedFunctions);
//
//
//    describe('Combinators.combinators properties', function() {
//      var combinatorsObj = combinators.combinators;
//      var expectedFunctions = ['I', 'K', 'Ky', 'S'];
//
//      expectedFunctions.forEach(function(f) {
//        it('combinators.js exports \'' + f + '\' property', exportsProperty(combinatorsObj, f));
//        it('\'' + f + '\' property of combinators.js is a function', exportsFunction(combinatorsObj, f));
//      });
//    });
//
//
//    describe('I', function() {
//      it('Is a synonym for id', function() {
//        expect(combinators.combinators.I).to.equal(id);
//      });
//    });
//
//
//    describe('K', function() {
//      it('Is a synonym for base.constant', function() {
//        expect(combinators.combinators.K).to.equal(constant);
//      });
//    });
//
//
//    var KySpec = {
//      name: 'Ky',
//      arity: 2,
//    };
//
//
//    describeFunction(KySpec, combinators.combinators.Ky, function(Ky) {
//      var tests = [
//        {name: 'null', value: null},
//        {name: 'undefined', value: undefined},
//        {name: 'number', value: 42},
//        {name: 'string', value: 'functional'},
//        {name: 'boolean', value: 'true'},
//        {name: 'array', value: [1, 2, 3]},
//        {name: 'object', value: {foo: 1, bar: 'a'}},
//        {name: 'function', value: function(a, b) {}}
//      ];
//
//
//      tests.forEach(function(test) {
//        var name = test.name;
//        var value = test.value;
//
//        tests.forEach(function(t2) {
//          it('Works correctly for value of type ' + name + ' and ' + t2.name, function() {
//            expect(Ky(value, t2.value)).to.equal(t2.value);
//          });
//        });
//      });
//
//
//      testCurriedFunction(Ky, [1, {}]);
//    });
//
//
//    var SSpec = {
//      name: 'S',
//      arity: 3,
//      restrictions: [['function: minarity 1'], ['function: minarity 1'], []],
//      validArguments: [[function(x) {return id;}], [id], [2]]
//    };
//
//    describeFunction(SSpec, combinators.combinators.S, function(S) {
//      it('Calls first argument with third argument', function() {
//        var called = false;
//        var args = null;
//        var f = function(x) {
//          called = true;
//          args = x;
//          return id;
//        };
//        S(f, id, 1);
//
//        expect(called).to.equal(true);
//        expect(args).to.equal(1);
//      });
//
//
//      it('Calls second argument with third argument', function() {
//        var called = false;
//        var args = null;
//        var f = function(x) {
//          called = true;
//          args = x;
//          return x;
//        };
//        S(function(x) {return id;}, f, 1);
//
//        expect(called).to.equal(true);
//        expect(args).to.equal(1);
//      });
//
//
//      it('Throws if first function doesn\'t return a function', function() {
//        var f = function(x) {return 3;};
//        var fn = function() {
//          S(f, f, 1);
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//
//
//      it('Throws if first function doesn\'t return function of arity 1', function() {
//        var f = function(x) {return function() {};};
//        var fn = function() {
//          S(f, f, 1);
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//
//
//      it('Calls result of first function with result of second function', function() {
//        var called = false;
//        var args = null;
//        var f = function(x) {
//          called = true;
//          args = x;
//        };
//        var g = function(x) {return f;};
//        var h = function(x) {return x + 2;};
//        S(g, h, 1);
//
//        expect(called).to.equal(true);
//        expect(args).to.equal(h(1));
//      });
//
//
//      it('Returns result of calling first function with result of second function', function() {
//        var f = function(x) {
//          return x * 10;
//        };
//        var g = function(x) {return f;};
//        var h = function(x) {return x + 2;};
//        var result = S(g, h, 1);
//
//        expect(result).to.equal(f(h(1)));
//      });
//
//
//      it('Curries functions if necessary (1)', function() {
//        var f = function(x, y) {
//          return x * y;
//        };
//        var g = function(x) {return x + 2;};
//        var result = S(f, g, 2);
//
//        expect(result).to.equal(f(2, g(2)));
//      });
//
//
//      it('Curries functions if necessary (2)', function() {
//        var f = function(x) {return id;};
//        var g = function(x, y) {return x;};
//        var result1 = S(f, g, 2);
//        var result2 = result1(5);
//
//        expect(result2).to.equal(2);
//      });
//
//
//      testCurriedFunction(S, [function(x, y) {return x + y;}, id, 4]);
//    });
//  };
//
//
//  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
//  if (typeof(define) === "function") {
//    define(function(require, exports, module) {
//      testFixture(require, exports, module);
//    });
//  } else {
//    testFixture(require, exports, module);
//  }
//})();
