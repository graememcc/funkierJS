(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var array = require('../array');

    // Import utility functions
    var testUtils = require('./testUtils');
    var describeModule = testUtils.describeModule;
    var describeFunction = testUtils.describeFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;


    var expectedObjects = [];
    var expectedFunctions = ['length', 'getIndex', 'head'];
    describeModule('array', array, expectedObjects, expectedFunctions);


    var lengthSpec = {
      name: 'length',
      arity: 1
    };


    describeFunction(lengthSpec, array.length, function(length) {
      it('Works for arrays (1)', function() {
        expect(length([1])).to.equal(1);
      });


      it('Works for arrays (2)', function() {
        expect(length([1, 3, 2])).to.equal(3);
      });


      it('Works for empty arrays', function() {
        expect(length([])).to.equal(0);
      });


      it('Works for strings (1)', function() {
        expect(length(['1'])).to.equal(1);
      });


      it('Works for strings (2)', function() {
        expect(length('abc')).to.equal(3);
      });


      it('Works for empty strings', function() {
        expect(length('')).to.equal(0);
      });
    });


    var getIndexSpec = {
      name: 'getIndex',
      arity: 2
    };


    var addThrowsOnEmptyTests = function(fnUnderTest, args) {
      it('Throws for empty arrays', function() {
        var a = [];
        var fn = function() {
          fnUnderTest.apply(null, args.concat([a]));
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws for empty strings', function() {
        var a = '';
        var fn = function() {
          fnUnderTest.apply(null, args.concat([a]));
        };

        expect(fn).to.throw(TypeError);
      });
    };


    describeFunction(getIndexSpec, array.getIndex, function(getIndex) {
      it('Works for arrays (1)', function() {
        var a = [1, 7, 0, 42];
        var result = getIndex(1, a);

        expect(result).to.equal(a[1]);
      });


      it('Works for arrays (2)', function() {
        var a = [1, 7, 0, 42];
        var result = getIndex(0, a);

        expect(result).to.equal(a[0]);
      });


      it('Throws for values outside range (1)', function() {
        var a = [1, 2, 3];
        var fn = function() {
          getIndex(-1, a);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws for values outside range (2)', function() {
        var a = [1, 2, 3];
        var fn = function() {
          getIndex(4, a);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Works for strings (1)', function() {
        var a = 'dcba';
        var result = getIndex(1, a);

        expect(result).to.equal(a[1]);
      });


      it('Works for strings (2)', function() {
        var a = 'funkier';
        var result = getIndex(0, a);

        expect(result).to.equal(a[0]);
      });


      it('Throws for values outside range (3)', function() {
        var a = 'abc';
        var fn = function() {
          getIndex(-1, a);
        };

        expect(fn).to.throw(TypeError);
      });


      it('Throws for values outside range (4)', function() {
        var a = 'abc';
        var fn = function() {
          getIndex(4, a);
        };

        expect(fn).to.throw(TypeError);
      });


      addThrowsOnEmptyTests(getIndex, [0]);
      testCurriedFunction('getIndex', getIndex, [1, ['a', 'b']]);
    });


    var headSpec = {
      name: 'head',
      arity: 1
    };


    describeFunction(headSpec, array.head, function(head) {
      it('Works for arrays (1)', function() {
        var a = [1, 7, 0, 42];
        var result = head(a);

        expect(result).to.equal(a[0]);
      });


      it('Works for arrays (2)', function() {
        var a = [42];
        var result = head(a);

        expect(result).to.equal(a[0]);
      });


      it('Works for strings (1)', function() {
        var a = 'dcba';
        var result = head(a);

        expect(result).to.equal(a[0]);
      });


      it('Works for strings (2)', function() {
        var a = 'funkier';
        var result = head(a);

        expect(result).to.equal(a[0]);
      });


      addThrowsOnEmptyTests(head, []);
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
