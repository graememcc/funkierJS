(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var base = require('../base');
    var date = require('../date');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;
    var exportsFunction = testUtils.exportsFunction;
    var testCurriedFunction = testUtils.testCurriedFunction;
    var checkArrayEquality = testUtils.checkArrayEquality;
    var getRealArity = base.getRealArity;


    describe('Date exports', function() {
      var expectedFunctions = ['getDayOfMonth', 'getDayOfWeek', 'getFullYear', 'getHours',
                               'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds',
                               'toEpochMilliseconds', 'getTimezoneOffset', 'getUTCDayOfMonth',
                               'getUTCDayOfWeek', 'getUTCFullYear', 'getUTCHours', 'getUTCMilliseconds',
                               'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds', 'toLocaleDateString',
                               'toLocaleString', 'toLocaleTimeString'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('date.js exports \'' + f + '\' property', exportsProperty(date, f));
        it('\'' + f + '\' property of date.js is a function', exportsFunction(date, f));
      });
    });


    var makeUnaryDateTest = function(desc, fnUnderTest, testDate, verifier) {
      describe(desc, function() {
        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(1);
        });


        it('Works correctly (1)', function() {
          var result = fnUnderTest(testDate);

          expect(result).to.equal(testDate[verifier]());
        });


        it('Works correctly (2)', function() {
          var d = new Date();
          var result = fnUnderTest(d);

          expect(result).to.equal(d[verifier]());
        });
      });
    };


    var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
    makeUnaryDateTest('getDayOfMonth', date.getDayOfMonth, testDate, 'getDate');
    makeUnaryDateTest('getDayOfWeek', date.getDayOfWeek, testDate, 'getDay');
    makeUnaryDateTest('getFullYear', date.getFullYear, testDate, 'getFullYear');
    makeUnaryDateTest('getHours', date.getHours, testDate, 'getHours');
    makeUnaryDateTest('getMilliseconds', date.getMilliseconds, testDate, 'getMilliseconds');
    makeUnaryDateTest('getMinutes', date.getMinutes, testDate, 'getMinutes');
    makeUnaryDateTest('getMonth', date.getMonth, testDate, 'getMonth');
    makeUnaryDateTest('getSeconds', date.getSeconds, testDate, 'getSeconds');
    makeUnaryDateTest('toEpochMilliseconds', date.toEpochMilliseconds, testDate, 'getTime');
    makeUnaryDateTest('getTimezoneOffset', date.getTimezoneOffset, testDate, 'getTimezoneOffset');
    makeUnaryDateTest('getUTCDayOfMonth', date.getUTCDayOfMonth, testDate, 'getUTCDate');
    makeUnaryDateTest('getUTCDayOfWeek', date.getUTCDayOfWeek, testDate, 'getUTCDay');
    makeUnaryDateTest('getUTCFullYear', date.getUTCFullYear, testDate, 'getUTCFullYear');
    makeUnaryDateTest('getUTCHours', date.getUTCHours, testDate, 'getUTCHours');
    makeUnaryDateTest('getUTCMilliseconds', date.getUTCMilliseconds, testDate, 'getUTCMilliseconds');
    makeUnaryDateTest('getUTCMinutes', date.getUTCMinutes, testDate, 'getUTCMinutes');
    makeUnaryDateTest('getUTCMonth', date.getUTCMonth, testDate, 'getUTCMonth');
    makeUnaryDateTest('getUTCSeconds', date.getUTCSeconds, testDate, 'getUTCSeconds');
    makeUnaryDateTest('toLocaleDateString', date.toLocaleDateString, testDate, 'toLocaleDateString');
    makeUnaryDateTest('toLocaleString', date.toLocaleString, testDate, 'toLocaleString');
    makeUnaryDateTest('toLocaleTimeString', date.toLocaleTimeString, testDate, 'toLocaleTimeString');
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
