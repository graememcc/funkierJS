//(function() {
//  "use strict";
//
//
//  var testFixture = function(require, exports) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var date = require('../../date');
//
//    // Import utility functions
//    var testUtils = require('./testUtils');
//    var describeModule = testUtils.describeModule;
//    var describeFunction = testUtils.describeFunction;
//    var testCurriedFunction = testUtils.testCurriedFunction;
//    var testTypeRestrictions = testUtils.testTypeRestrictions;
//
//
//    var expectedObjects = [];
//    var expectedFunctions = ['getDayOfMonth', 'getDayOfWeek', 'getFullYear', 'getHours',
//                             'getMilliseconds', 'getMinutes', 'getMonth', 'getSeconds',
//                             'toEpochMilliseconds', 'getTimezoneOffset', 'getUTCDayOfMonth',
//                             'getUTCDayOfWeek', 'getUTCFullYear', 'getUTCHours', 'getUTCMilliseconds',
//                             'getUTCMinutes', 'getUTCMonth', 'getUTCSeconds', 'toLocaleDateString',
//                             'toDateString', 'toTimeString', 'toISOString', 'toUTCString', 'setDayOfMonth',
//                             'setFullYear', 'setHours', 'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds',
//                             'setTimeSinceEpoch', 'setUTCDayOfMonth', 'setUTCFullYear', 'setUTCHours',
//                             'setUTCMilliseconds', 'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'safeSetHours',
//                             'safeSetMilliseconds', 'safeSetMinutes', 'safeSetMonth', 'safeSetSeconds',
//                             'safeSetUTCHours', 'safeSetUTCMilliseconds', 'safeSetUTCMinutes', 'safeSetUTCMonth',
//                             'safeSetUTCSeconds', 'safeSetDayOfMonth', 'safeSetUTCDayOfMonth', 'getCurrentTimeString',
//                             'makeDateFromString', 'makeDateFromMilliseconds', 'makeMonthDate', 'makeDayDate',
//                             'makeHourDate', 'makeMinuteDate', 'makeSecondDate', 'makeMillisecondDate'];
//
//    describeModule('date', date, expectedObjects, expectedFunctions);
//
//
//    var makeUnaryDateTest = function(desc, fnUnderTest, verifier) {
//      var spec = {
//        name: desc,
//        arity: 1,
//        restrictions: [[Date]],
//        validArguments: [[new Date()]]
//      };
//
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        var addOne = function(message, date) {
//          it('Works correctly ' + message, function() {
//            var result = fnUnderTest(date);
//
//            expect(result).to.equal(date[verifier]());
//          });
//        };
//
//
//        addOne('(1)', new Date(2000, 0, 1, 0, 0, 0, 0));
//        addOne('(2)', new Date());
//      });
//    };
//
//
//    makeUnaryDateTest('getDayOfMonth', date.getDayOfMonth, 'getDate');
//    makeUnaryDateTest('getDayOfWeek', date.getDayOfWeek, 'getDay');
//    makeUnaryDateTest('getFullYear', date.getFullYear, 'getFullYear');
//    makeUnaryDateTest('getHours', date.getHours, 'getHours');
//    makeUnaryDateTest('getMilliseconds', date.getMilliseconds, 'getMilliseconds');
//    makeUnaryDateTest('getMinutes', date.getMinutes, 'getMinutes');
//    makeUnaryDateTest('getMonth', date.getMonth, 'getMonth');
//    makeUnaryDateTest('getSeconds', date.getSeconds, 'getSeconds');
//    makeUnaryDateTest('toEpochMilliseconds', date.toEpochMilliseconds, 'getTime');
//    makeUnaryDateTest('getTimezoneOffset', date.getTimezoneOffset, 'getTimezoneOffset');
//    makeUnaryDateTest('getUTCDayOfMonth', date.getUTCDayOfMonth, 'getUTCDate');
//    makeUnaryDateTest('getUTCDayOfWeek', date.getUTCDayOfWeek, 'getUTCDay');
//    makeUnaryDateTest('getUTCFullYear', date.getUTCFullYear, 'getUTCFullYear');
//    makeUnaryDateTest('getUTCHours', date.getUTCHours, 'getUTCHours');
//    makeUnaryDateTest('getUTCMilliseconds', date.getUTCMilliseconds, 'getUTCMilliseconds');
//    makeUnaryDateTest('getUTCMinutes', date.getUTCMinutes, 'getUTCMinutes');
//    makeUnaryDateTest('getUTCMonth', date.getUTCMonth, 'getUTCMonth');
//    makeUnaryDateTest('getUTCSeconds', date.getUTCSeconds, 'getUTCSeconds');
//    makeUnaryDateTest('toLocaleDateString', date.toLocaleDateString, 'toLocaleDateString');
//    makeUnaryDateTest('toDateString', date.toDateString, 'toDateString');
//    makeUnaryDateTest('toTimeString', date.toTimeString, 'toTimeString');
//    makeUnaryDateTest('toISOString', date.toISOString, 'toISOString');
//    makeUnaryDateTest('toUTCString', date.toUTCString, 'toUTCString');
//
//
//    var makeBasicSetterTests = function(fnUnderTest, verifier) {
//      it('Returns the date', function() {
//        var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
//        var result = fnUnderTest(2, testDate);
//
//        expect(result).to.equal(testDate);
//      });
//
//
//      var addOne = function(message, date) {
//        it('Works correctly ' + message, function() {
//          var current = verifier(date);
//          var newVal = current > 1 ? current - 1 : current + 1;
//          var result = fnUnderTest(newVal, date);
//
//          expect(verifier(result)).to.equal(newVal);
//        });
//      };
//
//
//      addOne('(1)', new Date(2000, 0, 1, 0, 0, 0, 0));
//
//
//      // fnUnderTest should have arity 2, so should be curried
//      var makeDate = function() {return new Date(2000, 0, 1, 0, 0, 0);};
//      testCurriedFunction(fnUnderTest, [2, {reset: makeDate}]);
//    };
//
//
//    var makeDateSetterTests = function(desc, fnUnderTest, verifier) {
//      var spec = {
//        name: desc,
//        arity: 2,
//        restrictions: [[], [Date]],
//        validArguments: [[2], [new Date()]]
//      };
//
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        makeBasicSetterTests(fnUnderTest, verifier);
//      });
//    };
//
//
//    makeDateSetterTests('setDayOfMonth', date.setDayOfMonth, date.getDayOfMonth);
//    makeDateSetterTests('setFullYear', date.setFullYear, date.getFullYear);
//    makeDateSetterTests('setHours', date.setHours, date.getHours);
//    makeDateSetterTests('setMilliseconds', date.setMilliseconds, date.getMilliseconds);
//    makeDateSetterTests('setMinutes', date.setMinutes, date.getMinutes);
//    makeDateSetterTests('setMonth', date.setMonth, date.getMonth);
//    makeDateSetterTests('setSeconds', date.setSeconds, date.getSeconds);
//    makeDateSetterTests('setTimeSinceEpoch', date.setTimeSinceEpoch, date.toEpochMilliseconds);
//    makeDateSetterTests('setUTCDayOfMonth', date.setUTCDayOfMonth, date.getUTCDayOfMonth);
//    makeDateSetterTests('setUTCFullYear', date.setUTCFullYear, date.getUTCFullYear);
//    makeDateSetterTests('setUTCHours', date.setUTCHours, date.getUTCHours);
//    makeDateSetterTests('setUTCMilliseconds', date.setUTCMilliseconds, date.getUTCMilliseconds);
//    makeDateSetterTests('setUTCMinutes', date.setUTCMinutes, date.getUTCMinutes);
//    makeDateSetterTests('setUTCMonth', date.setUTCMonth, date.getUTCMonth);
//    makeDateSetterTests('setUTCSeconds', date.setUTCSeconds, date.getUTCSeconds);
//
//
//    var makeDateSafeSetterTests = function(desc, fnUnderTest, verifier, bounds) {
//      var spec = {
//        name: desc,
//        arity: 2,
//        restrictions: [[], [Date]],
//        validArguments: [[2], [new Date()]]
//      };
//
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        makeBasicSetterTests(fnUnderTest, verifier);
//
//
//        bounds.forEach(function(bound, i) {
//          it('Throws for invalid values (' + (i + 1) + ')', function() {
//            var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
//            var fn = function() {
//              fnUnderTest(bound, testDate);
//            };
//
//            expect(fn).to.throw(TypeError);
//          });
//        });
//      });
//    };
//
//
//    makeDateSafeSetterTests('safeSetHours', date.safeSetHours, date.getHours, [-1, 60]);
//    makeDateSafeSetterTests('safeSetMilliseconds', date.safeSetMilliseconds, date.getMilliseconds, [-1, 1000]);
//    makeDateSafeSetterTests('safeSetMinutes', date.safeSetMinutes, date.getMinutes, [-1, 60]);
//    makeDateSafeSetterTests('safeSetSeconds', date.safeSetSeconds, date.getSeconds, [-1, 60]);
//    makeDateSafeSetterTests('safeSetUTCHours', date.safeSetUTCHours, date.getUTCHours, [-1, 60]);
//    makeDateSafeSetterTests('safeSetUTCMilliseconds', date.safeSetUTCMilliseconds, date.getUTCMilliseconds, [-1, 1000]);
//    makeDateSafeSetterTests('safeSetUTCMinutes', date.safeSetUTCMinutes, date.getUTCMinutes, [-1, 60]);
//    makeDateSafeSetterTests('safeSetUTCSeconds', date.safeSetUTCSeconds, date.getUTCSeconds, [-1, 60]);
//
//
//    // day of month is trickier, so we break it out separately
//    var makeSafeDayOfMonthTests = function(desc, fnUnderTest, monthSetter, verifier) {
//      var spec = {
//        name: desc,
//        arity: 2,
//        restrictions: [[], [Date]],
//        validArguments: [[2], [new Date()]]
//      };
//
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        makeBasicSetterTests(fnUnderTest, verifier);
//
//
//        // Tackle some obvious invalid values first
//        it('Throws for invalid values (1)', function() {
//          var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
//          var fn = function() {
//            fnUnderTest(-1, testDate);
//          };
//
//          expect(fn).to.throw(TypeError);
//        });
//
//
//        it('Throws for invalid values (2)', function() {
//          var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
//          var fn = function() {
//            fnUnderTest(32, testDate);
//          };
//
//          expect(fn).to.throw(TypeError);
//        });
//
//
//        // Set day to 31 in a 30 day month
//        it('Throws for invalid values (3)', function() {
//          var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
//          monthSetter(3, testDate);
//          var fn = function() {
//            fnUnderTest(31, testDate);
//          };
//
//          expect(fn).to.throw(TypeError);
//        });
//
//
//        // Set day to 29 in a non leap-year...
//        it('Throws for invalid values (4)', function() {
//          var testDate = new Date(2014, 0, 1, 0, 0, 0, 0);
//          monthSetter(2, testDate);
//          var fn = function() {
//            fnUnderTest(29, testDate);
//          };
//
//          expect(fn).to.throw(TypeError);
//        });
//
//
//        // ... and a real leap year
//        it('Throws for invalid values (5)', function() {
//          var testDate = new Date(2012, 0, 1, 0, 0, 0, 0);
//          monthSetter(2, testDate);
//          var fn = function() {
//            fnUnderTest(29, testDate);
//          };
//
//          expect(fn).to.not.throw(TypeError);
//        });
//      });
//    };
//
//
//    makeSafeDayOfMonthTests('safeSetDayOfMonth', date.safeSetDayOfMonth,
//      date.safeSetMonth, date.getDayOfMonth);
//    makeSafeDayOfMonthTests('safeSetUTCDayOfMonth', date.safeSetUTCDayOfMonth,
//      date.safeSetUTCMonth, date.getUTCDayOfMonth);
//
//
//    // Can't really write meaningful tests for this
//    var gctsSpec = {name: 'getCurrentTimeString', arity: 0};
//    describeFunction(gctsSpec, date.getCurrentTimeString, function() {});
//
//
//    var addDateMakerTests = function(fnUnderTest, sourceFields) {
//      var addOne = function(message, field, date) {
//        it('Works correctly ' + message, function() {
//          var result = fnUnderTest(date[field]());
//
//          expect(result).to.be.an.instanceOf(Date);
//          expect(result).to.deep.equal(date);
//        });
//      };
//
//      sourceFields.forEach(function(field, i) {
//        // Hack to allow deep equal checks: Dates created with toString have ms at 0
//        var d = new Date();
//        d.setMilliseconds(0);
//
//        [new Date(2000, 0, 1, 0, 0, 0, 0), d].forEach(function(date, j) {
//          addOne('(' + (2 * i + j + 1) + ')', field, date);
//        });
//      });
//    };
//
//
//    var mdfsSpec = {
//      name: 'makeDateFromString',
//      arity: 1,
//      restrictions: [['string']],
//      validArguments: [[new Date().toUTCString()]]
//    };
//
//
//    describeFunction(mdfsSpec, date.makeDateFromString, function(makeDateFromString) {
//      addDateMakerTests(makeDateFromString, ['toString', 'toISOString']);
//
//
//      it('Throws for unparsable string', function() {
//        var fn = function() {
//          makeDateFromString('a');
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//    });
//
//
//    var mdfnSpec = {
//      name: 'makeDateFromMilliseconds',
//      arity: 1,
//      restrictions: [['number']],
//      validArguments: [[1000]]
//    };
//
//
//    describeFunction(mdfnSpec, date.makeDateFromMilliseconds, function(makeDateFromMilliseconds) {
//      addDateMakerTests(makeDateFromMilliseconds, ['getTime']);
//
//
//      it('Throws for invalid value', function() {
//        var fn = function() {
//          makeDateFromMilliseconds(Number.POSITIVE_INFINITY);
//        };
//
//        expect(fn).to.throw(TypeError);
//      });
//    });
//
//
//    var testDates = [[2000, 0, 1, 0, 0, 0, 0], [2014, 11, 31, 23, 59, 59, 999]];
//    var fields = ['year', 'month', 'day', 'hours', 'minutes', 'seconds', 'milliseconds'];
//    var verifiers = [date.getFullYear, date.getMonth, date.getDayOfMonth, date.getHours,
//                     date.getMinutes, date.getSeconds, date.getMilliseconds];
//
//    var makeDateConstructorTests = function(desc, fnUnderTest, arity) {
//      var spec = {
//        name: desc,
//        arity: arity
//      };
//
//
//      describeFunction(spec, fnUnderTest, function(fnUnderTest) {
//        testDates.forEach(function(testDate, i) {
//          var message = ' (' + (i + 1) + ')';
//          var args = testDate.slice(0, arity);
//
//
//          it('Returns a date' + message, function() {
//            var result = fnUnderTest.apply(null, args);
//
//            expect(result).to.be.an.instanceOf(Date);
//          });
//
//
//          verifiers.forEach(function(verifier, i) {
//            it('Returned Date has correct ' + fields[i] + message, function() {
//              var expected = i < arity ? args[i] : i === 2 ? 1 : 0;
//              var result = fnUnderTest.apply(null, args);
//
//              expect(verifier(result)).to.equal(expected);
//            });
//          });
//
//
//          var makeDiscardTest = function(i) {
//            return function() {
//              var args = testDate.slice(0, i);
//              var d = fnUnderTest.apply(null, args);
//              var result = verifiers.every(function(v, j) {
//                // We're not concerned about the values that aren't ignored here
//                if (j < arity) return true;
//
//                // If the arity is 2, the day will default to 1
//                if (j === 2)
//                  return v(d) === 1;
//
//                // If the argument was ignored, the field should be zero
//                return v(d) === 0;
//              });
//
//              expect(result).to.equal(true);
//            };
//          };
//
//
//          for (var k = arity; k < fields.length; k++) {
//            var m = ' (' + (k - arity + 1) + ')';
//            it('Ignores superfluous arguments' + message + m,
//                makeDiscardTest(k));
//          }
//        });
//
//
//        // The constructor function should be curried
//        testCurriedFunction(fnUnderTest, testDates[0].slice(0, arity));
//      });
//    };
//
//
//    var dateConstructors = ['makeMonthDate', 'makeDayDate', 'makeHourDate', 'makeMinuteDate',
//                            'makeSecondDate', 'makeMillisecondDate'];
//    dateConstructors.forEach(function(c, i) {
//      makeDateConstructorTests(c, date[c], i + 2);
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
