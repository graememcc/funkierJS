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
                               'toLocaleString', 'toLocaleTimeString', 'toDateString', 'toTimeString',
                               'toISOString', 'toUTCString', 'setDayOfMonth', 'setFullYear', 'setHours',
                               'setMilliseconds', 'setMinutes', 'setMonth', 'setSeconds', 'setTimeSinceEpoch',
                               'setUTCDayOfMonth', 'setUTCFullYear', 'setUTCHours', 'setUTCMilliseconds',
                               'setUTCMinutes', 'setUTCMonth', 'setUTCSeconds', 'safeSetHours', 'safeSetMilliseconds',
                               'safeSetMinutes', 'safeSetMonth', 'safeSetSeconds', 'safeSetUTCHours',
                               'safeSetUTCMilliseconds', 'safeSetUTCMinutes', 'safeSetUTCMonth', 'safeSetUTCSeconds',
                               'safeSetDayOfMonth', 'safeSetUTCDayOfMonth', 'getCurrentTimeString', 'makeDateFromString',
                               'makeDateFromMilliseconds', 'makeMonthDate', 'makeDayDate', 'makeHourDate', 'makeMinuteDate',
                               'makeSecondDate', 'makeMillisecondDate'];

      // Automatically generate existence tests for each expected function
      expectedFunctions.forEach(function(f) {
        it('date.js exports \'' + f + '\' property', exportsProperty(date, f));
        it('\'' + f + '\' property of date.js is a function', exportsFunction(date, f));
      });
    });


    var makeUnaryDateTest = function(desc, fnUnderTest, verifier) {
      describe(desc, function() {
        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(1);
        });


        it('Works correctly (1)', function() {
          var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
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


    makeUnaryDateTest('getDayOfMonth', date.getDayOfMonth, 'getDate');
    makeUnaryDateTest('getDayOfWeek', date.getDayOfWeek, 'getDay');
    makeUnaryDateTest('getFullYear', date.getFullYear, 'getFullYear');
    makeUnaryDateTest('getHours', date.getHours, 'getHours');
    makeUnaryDateTest('getMilliseconds', date.getMilliseconds, 'getMilliseconds');
    makeUnaryDateTest('getMinutes', date.getMinutes, 'getMinutes');
    makeUnaryDateTest('getMonth', date.getMonth, 'getMonth');
    makeUnaryDateTest('getSeconds', date.getSeconds, 'getSeconds');
    makeUnaryDateTest('toEpochMilliseconds', date.toEpochMilliseconds, 'getTime');
    makeUnaryDateTest('getTimezoneOffset', date.getTimezoneOffset, 'getTimezoneOffset');
    makeUnaryDateTest('getUTCDayOfMonth', date.getUTCDayOfMonth, 'getUTCDate');
    makeUnaryDateTest('getUTCDayOfWeek', date.getUTCDayOfWeek, 'getUTCDay');
    makeUnaryDateTest('getUTCFullYear', date.getUTCFullYear, 'getUTCFullYear');
    makeUnaryDateTest('getUTCHours', date.getUTCHours, 'getUTCHours');
    makeUnaryDateTest('getUTCMilliseconds', date.getUTCMilliseconds, 'getUTCMilliseconds');
    makeUnaryDateTest('getUTCMinutes', date.getUTCMinutes, 'getUTCMinutes');
    makeUnaryDateTest('getUTCMonth', date.getUTCMonth, 'getUTCMonth');
    makeUnaryDateTest('getUTCSeconds', date.getUTCSeconds, 'getUTCSeconds');
    makeUnaryDateTest('toLocaleDateString', date.toLocaleDateString, 'toLocaleDateString');
    makeUnaryDateTest('toLocaleString', date.toLocaleString, 'toLocaleString');
    makeUnaryDateTest('toLocaleTimeString', date.toLocaleTimeString, 'toLocaleTimeString');
    makeUnaryDateTest('toDateString', date.toDateString, 'toDateString');
    makeUnaryDateTest('toTimeString', date.toTimeString, 'toTimeString');
    makeUnaryDateTest('toISOString', date.toISOString, 'toISOString');
    makeUnaryDateTest('toUTCString', date.toUTCString, 'toUTCString');


    var makeBasicSetterTests = function(desc, fnUnderTest, verifier) {
      it('Has correct arity', function() {
        expect(getRealArity(fnUnderTest)).to.equal(2);
      });


      it('Returns the date', function() {
        var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
        var result = fnUnderTest(2, testDate);

        expect(result).to.equal(testDate);
      });


      it('Works correctly (1)', function() {
        var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
        var newVal = 2;
        var result = fnUnderTest(2, testDate);

        expect(verifier(result)).to.equal(newVal);
      });


      it('Works correctly (2)', function() {
        var d = new Date();
        var current = verifier(d);
        var newVal = current > 0 ? current - 1 : 1;
        var result = fnUnderTest(newVal, d);

        expect(verifier(result)).to.equal(newVal);
      });


      // fnUnderTest should have arity 2, so should be curried
      var makeDate = function() {return new Date(2000, 0, 1, 0, 0, 0)};
      testCurriedFunction(desc, fnUnderTest, [2, {reset: makeDate}]);
    };


    var makeDateSetterTests = function(desc, fnUnderTest, verifier) {
      describe(desc, function() {
        makeBasicSetterTests(desc, fnUnderTest, verifier);
      });
    };


    makeDateSetterTests('setDayOfMonth', date.setDayOfMonth, date.getDayOfMonth);
    makeDateSetterTests('setFullYear', date.setFullYear, date.getFullYear);
    makeDateSetterTests('setHours', date.setHours, date.getHours);
    makeDateSetterTests('setMilliseconds', date.setMilliseconds, date.getMilliseconds);
    makeDateSetterTests('setMinutes', date.setMinutes, date.getMinutes);
    makeDateSetterTests('setMonth', date.setMonth, date.getMonth);
    makeDateSetterTests('setSeconds', date.setSeconds, date.getSeconds);
    makeDateSetterTests('setTimeSinceEpoch', date.setTimeSinceEpoch, date.toEpochMilliseconds);
    makeDateSetterTests('setUTCDayOfMonth', date.setUTCDayOfMonth, date.getUTCDayOfMonth);
    makeDateSetterTests('setUTCFullYear', date.setUTCFullYear, date.getUTCFullYear);
    makeDateSetterTests('setUTCHours', date.setUTCHours, date.getUTCHours);
    makeDateSetterTests('setUTCMilliseconds', date.setUTCMilliseconds, date.getUTCMilliseconds);
    makeDateSetterTests('setUTCMinutes', date.setUTCMinutes, date.getUTCMinutes);
    makeDateSetterTests('setUTCMonth', date.setUTCMonth, date.getUTCMonth);
    makeDateSetterTests('setUTCSeconds', date.setUTCSeconds, date.getUTCSeconds);


    var makeDateSafeSetterTests = function(desc, fnUnderTest, verifier, bounds) {
      describe(desc, function() {
        makeBasicSetterTests(desc, fnUnderTest, verifier);


        bounds.forEach(function(bound, i) {
          it('Throws for invalid values (' + (i + 1) + ')', function() {
            var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
            var fn = function() {
              fnUnderTest(bound, testDate);
            };

            expect(fn).to.throw(TypeError);
          });
        });
      });
    };


    makeDateSafeSetterTests('safeSetHours', date.safeSetHours, date.getHours, [-1, 60]);
    makeDateSafeSetterTests('safeSetMilliseconds', date.safeSetMilliseconds, date.getMilliseconds, [-1, 1000]);
    makeDateSafeSetterTests('safeSetMinutes', date.safeSetMinutes, date.getMinutes, [-1, 60]);
    makeDateSafeSetterTests('safeSetSeconds', date.safeSetSeconds, date.getSeconds, [-1, 60]);
    makeDateSafeSetterTests('safeSetUTCHours', date.safeSetUTCHours, date.getUTCHours, [-1, 60]);
    makeDateSafeSetterTests('safeSetUTCMilliseconds', date.safeSetUTCMilliseconds, date.getUTCMilliseconds, [-1, 1000]);
    makeDateSafeSetterTests('safeSetUTCMinutes', date.safeSetUTCMinutes, date.getUTCMinutes, [-1, 60]);
    makeDateSafeSetterTests('safeSetUTCSeconds', date.safeSetUTCSeconds, date.getUTCSeconds, [-1, 60]);


    // day of month is trickier, so we break it out separately
    var makeSafeDayOfMonthTests = function(desc, fnUnderTest, monthSetter, verifier) {
      describe(desc, function() {


        makeBasicSetterTests(desc, fnUnderTest, verifier);


        // Tackle some obvious invalid values first
        it('Throws for invalid values (1)', function() {
          var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
          var fn = function() {
            fnUnderTest(-1, testDate);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws for invalid values (2)', function() {
          var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
          var fn = function() {
            fnUnderTest(32, testDate);
          };

          expect(fn).to.throw(TypeError);
        });


        // Set day to 31 in a 30 day month
        it('Throws for invalid values (3)', function() {
          var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
          monthSetter(3, testDate);
          var fn = function() {
            fnUnderTest(31, testDate);
          };

          expect(fn).to.throw(TypeError);
        });


        // Set day to 29 in a non leap-year...
        it('Throws for invalid values (4)', function() {
          var testDate = new Date(2014, 0, 1, 0, 0, 0, 0);
          monthSetter(2, testDate);
          var fn = function() {
            fnUnderTest(29, testDate);
          };

          expect(fn).to.throw(TypeError);
        });


        // ... and a real leap year
        it('Throws for invalid values (5)', function() {
          var testDate = new Date(2012, 0, 1, 0, 0, 0, 0);
          monthSetter(2, testDate);
          var fn = function() {
            fnUnderTest(29, testDate);
          };

          expect(fn).to.not.throw(TypeError);
        });
      });
    };


    makeSafeDayOfMonthTests('safeSetDayOfMonth', date.safeSetDayOfMonth,
      date.safeSetMonth, date.getDayOfMonth);
    makeSafeDayOfMonthTests('safeSetUTCDayOfMonth', date.safeSetUTCDayOfMonth,
      date.safeSetUTCMonth, date.getUTCDayOfMonth);


    describe('getCurrentTimeString', function() {
      var getCurrentTimeString = date.getCurrentTimeString;


      it('Has correct arity', function() {
        expect(getRealArity(getCurrentTimeString)).to.equal(0);
      });
    });


    describe('makeDateFromString', function() {
      var makeDateFromString = date.makeDateFromString;


      it('Has correct arity', function() {
        expect(getRealArity(makeDateFromString)).to.equal(1);
      });


      it('Works correctly (1)', function() {
        var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
        var result = makeDateFromString(testDate.toString());

        expect(result).to.be.an.instanceOf(Date);
        expect(result).to.deep.equal(testDate);
      });


      it('Works correctly (2)', function() {
        var testDate = new Date();
        var result = makeDateFromString(testDate.toISOString());

        expect(result).to.be.an.instanceOf(Date);
        expect(result).to.deep.equal(testDate);
      });


      var nonStrings = [
       {name: 'number', value: 1},
       {name: 'boolean', value: true},
       {name: 'undefined', value: undefined},
       {name: 'null', value: null},
       {name: 'function', value: function() {}},
       {name: 'array', value: []},
       {name: 'object', value: {}}];


      nonStrings.forEach(function(non) {
        var name = non.name;
        var value = non.value;

        it('Throws for value of type: ' + name, function() {
          var fn = function() {
            makeDateFromString(value);
          };

          expect(fn).to.throw(TypeError);
        });
      });


      it('Throws for unparsable string', function() {
        var fn = function() {
          makeDateFromString('a');
        };

        expect(fn).to.throw(TypeError);
      });
    });


    describe('makeDateFromMilliseconds', function() {
      var makeDateFromMilliseconds = date.makeDateFromMilliseconds;


      it('Has correct arity', function() {
        expect(getRealArity(makeDateFromMilliseconds)).to.equal(1);
      });


      it('Works correctly (1)', function() {
        var testDate = new Date(2000, 0, 1, 0, 0, 0, 0);
        var result = makeDateFromMilliseconds(testDate.getTime());

        expect(result).to.be.an.instanceOf(Date);
        expect(result).to.deep.equal(testDate);
      });


      it('Works correctly (2)', function() {
        var testDate = new Date();
        var result = makeDateFromMilliseconds(testDate.getTime());

        expect(result).to.be.an.instanceOf(Date);
        expect(result).to.deep.equal(testDate);
      });


      var nonStrings = [
       {name: 'string', value: 's'},
       {name: 'boolean', value: true},
       {name: 'undefined', value: undefined},
       {name: 'null', value: null},
       {name: 'function', value: function() {}},
       {name: 'array', value: []},
       {name: 'object', value: {}}];


      nonStrings.forEach(function(non) {
        var name = non.name;
        var value = non.value;

        it('Throws for value of type: ' + name, function() {
          var fn = function() {
            makeDateFromMilliseconds(value);
          };

          expect(fn).to.throw(TypeError);
        });
      });


      it('Throws for invalid value', function() {
        var fn = function() {
          makeDateFromMilliseconds(Number.POSITIVE_INFINITY);
        };

        expect(fn).to.throw(TypeError);
      });
    });


    var testDates = [[2000, 0, 1, 0, 0, 0, 0], [2014, 11, 31, 23, 59, 59, 999]];
    var fields = ['year', 'month', 'day', 'hours', 'minutes', 'seconds', 'milliseconds'];
    var verifiers = [date.getFullYear, date.getMonth, date.getDayOfMonth, date.getHours,
                     date.getMinutes, date.getSeconds, date.getMilliseconds];

    var makeDateConstructorTests = function(desc, fnUnderTest, arity) {
      describe(desc, function() {
        it('Has correct arity', function() {
          expect(getRealArity(fnUnderTest)).to.equal(arity);
        });


        testDates.forEach(function(testDate, i) {
          var message = ' (' + (i + 1) + ')';
          var args = testDate.slice(0, arity);


          it('Returns a date' + message, function() {
            var result = fnUnderTest.apply(null, args);

            expect(result).to.be.an.instanceOf(Date);
          });


          verifiers.forEach(function(verifier, i) {
            it('Returned Date has correct ' + fields[i] + message, function() {
              var expected = i < arity ? args[i] : i === 2 ? 1 : 0;
              var result = fnUnderTest.apply(null, args);

              expect(verifier(result)).to.equal(expected);
            });
          });


          var makeDiscardTest = function(i) {
            return function() {
              var args = testDate.slice(0, i);
              var d = fnUnderTest.apply(null, args);
              var result = verifiers.every(function(v, j) {
                // We're not concerned about the values that aren't ignored here
                if (j < arity) return true;

                // If the arity is 2, the day will default to 1
                if (j === 2)
                  return v(d) === 1;

                // If the argument was ignored, the field should be zero
                return v(d) === 0;
              });

              expect(result).to.be.true;
            };
          };


          for (var k = arity; k < fields.length; k++) {
            var m = ' (' + (k - arity + 1) + ')';
            it('Ignores superfluous arguments' + message + m,
                makeDiscardTest(k));
          }
        });


        // The constructor function should be curried
        testCurriedFunction(desc, fnUnderTest, testDates[0].slice(0, arity));
      });
    };


    var dateConstructors = ['makeMonthDate', 'makeDayDate', 'makeHourDate', 'makeMinuteDate',
                            'makeSecondDate', 'makeMillisecondDate'];
    dateConstructors.forEach(function(c, i) {
      makeDateConstructorTests(c, date[c], i + 2);
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
