module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;

  var object = require('./object');
  var callProp = object.callProp;

  // TODO Consistency of the safe operations e.g. changing month to a 30 day month...
  // TODO Could use some synonyms for these functions

  /*
   * <apifunction>
   *
   * getDayOfMonth
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getDate`. Takes a `Date` object, and returns an integer representing the day of
   * the month (1-31) of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getDayOfMonth(a); // => 15
   *
   */

  var getDayOfMonth = callProp('getDate');


  /*
   * <apifunction>
   *
   * getDayOfWeek
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getDay`. Takes a `Date` object, and returns an integer representing the day of the
   * month (0-6) of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getDayOfWeek(a); // => 2
   *
   */

  var getDayOfWeek = callProp('getDay');


  /*
   * <apifunction>
   *
   * getFullYear
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getFullYear`. Takes a `Date` object, and returns a 4-digit integer representing
   * the year of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getFullYear(a); // => 2000
   *
   */

  var getFullYear = callProp('getFullYear');


  /*
   * <apifunction>
   *
   * getHours
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getHours`. Takes a `Date` object, and returns a integer representing the hour
   * field (0-23) of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getHours(a); // => 10
   *
   */

  var getHours = callProp('getHours');


  /*
   * <apifunction>
   *
   * getMilliseconds
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getMilliseconds`. Takes a `Date` object, and returns a integer representing the
   * milliseconds field (0-999) of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getMilliseconds(a); // => 13
   *
   */

  var getMilliseconds = callProp('getMilliseconds');


  /*
   * <apifunction>
   *
   * getMinutes
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getMinutes`. Takes a `Date` object, and returns a integer representing the minutes
   * field (0-59) of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getMinutes(a); // => 11
   *
   */

  var getMinutes = callProp('getMinutes');


  /*
   * <apifunction>
   *
   * getMonth
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getMonths`. Takes a `Date` object, and returns a integer representing the month
   * field (0-11) of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getMonth(a); // => 1
   *
   */

  var getMonth = callProp('getMonth');


  /*
   * <apifunction>
   *
   * getSeconds
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getSeconds`. Takes a `Date` object, and returns a integer representing the seconds
   * field (0-59) of the given date.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.getSeconds(a); // => 12
   *
   */

  var getSeconds = callProp('getSeconds');


  /*
   * <apifunction>
   *
   * toEpochMilliseconds
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getTime`. Takes a `Date` object, and returns the number of milliseconds elapsed
   * since midnight, January 1 1970.
   *
   */

  var toEpochMilliseconds = callProp('getTime');


  /*
   * <apifunction>
   *
   * getTimezoneOffset
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getTimezoneOffset`. Takes a `Date` object, and returns the delta in minutes
   * between the Javascript environment and UTC.
   *
   */

  var getTimezoneOffset = callProp('getTimezoneOffset');


  /*
   * <apifunction>
   *
   * getUTCDayOfMonth
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCDate`. Takes a `Date` object, and returns an integer representing the day of
   * the month (1-31) of the given date, adjusted for UTC.
   *
   */

  var getUTCDayOfMonth = callProp('getUTCDate');

  /*
   * <apifunction>
   *
   * getUTCDayOfWeek
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCDay`. Takes a `Date` object, and returns an integer representing the day of
   * the week (0-6) of the given date, adjusted for UTC.
   *
   */


  var getUTCDayOfWeek = callProp('getUTCDay');


  /*
   * <apifunction>
   *
   * getUTCFullYear
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCFullYear`. Takes a `Date` object, and returns a 4-digit integer representing
   * the year of the given date, adjusted for UTC.
   *
   */

  var getUTCFullYear = callProp('getUTCFullYear');


  /*
   * <apifunction>
   *
   * getUTCHours
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCHours`. Takes a `Date` object, and returns an integer representing the hours
   * field of the given date (0-23), adjusted for UTC.
   *
   */

  var getUTCHours = callProp('getUTCHours');


  /*
   * <apifunction>
   *
   * getUTCMilliseconds
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCMilliseconds`. Takes a `Date` object, and returns an integer representing
   * the milliseconds field of the given date (0-999), adjusted for UTC.
   *
   */

  var getUTCMilliseconds = callProp('getUTCMilliseconds');


  /*
   * <apifunction>
   *
   * getUTCMinutes
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCMinutes`. Takes a `Date` object, and returns an integer representing the
   * minutes field of the given date (0-59), adjusted for UTC.
   *
   */

  var getUTCMinutes = callProp('getUTCMinutes');


  /*
   * <apifunction>
   *
   * getUTCMonth
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCMonth`. Takes a `Date` object, and returns an integer representing the month
   * field of the given date (0-11), adjusted for UTC.
   *
   */

  var getUTCMonth = callProp('getUTCMonth');


  /*
   * <apifunction>
   *
   * getUTCSeconds
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: number
   *
   * A wrapper around `Date.prototype.getUTCSeconds`. Takes a `Date` object, and returns an integer representing the
   * seconds field of the given date (0-59), adjusted for UTC.
   *
   */

  var getUTCSeconds = callProp('getUTCSeconds');


  /*
   * <apifunction>
   *
   * toLocaleDateString
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: string
   *
   * A wrapper around `Date.prototype.toLocaleDateString`. Takes a `Date` object, and  a string representing the date
   * portion of the object, formatted according to locale conventions.
   *
   */

  var toLocaleDateString = callProp('toLocaleDateString');


  /*
   * <apifunction>
   *
   * toDateString
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: string
   *
   * A wrapper around `Date.prototype.toDateString`. Takes a `Date` object, and returns a string representing the date
   * portion of the object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.toDateString(a); // => "Tue Feb 15 2000" or similar
   *
   */

  var toDateString = callProp('toDateString');


  /*
   * <apifunction>
   *
   * toTimeString
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: string
   *
   * A wrapper around `Date.prototype.toTimeString`. Takes a `Date` object, and returns a string representing the time
   * portion of the object.
   *
   */

  var toTimeString = callProp('toTimeString');


  /*
   * <apifunction>
   *
   * toISOString
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: string
   *
   * A wrapper around `Date.prototype.toISOString`. Takes a `Date` object, and returns a string representation of the
   * date in ISO format.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
   *
   */

  var toISOString = callProp('toISOString');


  /*
   * <apifunction>
   *
   * toUTCString
   *
   * Category: Date
   *
   * Parameter: d: Date
   * Returns: string
   *
   * A wrapper around `Date.prototype.toUTCString`. Takes a `Date` object, and returns a string representation of the
   * equivalent date in UTC.
   *
   */

  var toUTCString = callProp('toUTCString');


  // We cannot use callProp for the setters due to the need to return the given date
  // TODO: This comment is likely out of date

  /*
   * <apifunction>
   *
   * setDayOfMonth
   *
   * Category: Date
   *
   * Parameter: day: number
   * Parameter: d: Date
   * Returns: Date
   *
   * A wrapper around `Date.prototype.setDate`. Takes a value between 1 and 31, and a `Date` object, and sets the day of
   * the month to the given value. Invalid values will cause a change in other fields: for example, changing the day to
   * 31 in a month with 30 days will increment the month, which may in turn increment the year. Returns the given 'Date`
   * object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setDayOfMonth(1, a); // => a now refers to Feb 1 2000
   *
   */

  var setDayOfMonth = curry(function(val, d) {
    d.setDate(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setFullYear
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: d: Date
   * Returns: Date
   *
   * A wrapper around `Date.prototype.setFullYear`. Takes a value and a `Date` object, and sets the year to the given
   * value. This may cause a change in other fields: for example, setting the year when the month and day represent
   * February 29 respectively may cause those values to change to March 1 if the new year is not a leap year.
   * Returns the given `Date` object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setFullYear(2001, a); // => a now refers to Feb 15 2001
   *
   */

  var setFullYear = curry(function(val, d) {
    d.setFullYear(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setHours
   *
   * Category: Date
   *
   * Parameter: hours: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setHours`. Takes a value between 0 and 23 representing the hour of the day, and
   * a `Date` object, and sets the hour to the given value. Invalid values will cause a change in other fields: if the
   * value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of increments
   * to other fields. Returns the given `Date` object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setHours(11, a); // => a now refers to 11:11:12:013
   *
   */

  var setHours = curry(function(val, d) {
    d.setHours(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setMilliseconds
   *
   * Category: Date
   *
   * Parameter: milliseconds: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setMilliseconds`. Takes a value between 0 and 999 representing the milliseconds,
   * and a `Date` object, and sets the milliseconds to the given value. Invalid values will cause a change in other
   * fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000. This may in turn cause
   * a cascade of increments to other fields. Returns the given `Date` object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setMilliseconds(20, a); // => a now refers to 10:11:12:020
   *
   */

  var setMilliseconds = curry(function(val, d) {
    d.setMilliseconds(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setMinutes
   *
   * Category: Date
   *
   * Parameter: minutes: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setMinutes`. Takes a value between 0 and 59 representing the minutes, and a
   * `Date` object, and sets the minutes to the given value. Invalid values will cause a change in other fields: if the
   * value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a cascade of increments
   * to other fields. Returns the given `Date` object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setMinutes(59, a); // => a now refers to 10:59:12:013
   *
   */

  var setMinutes = curry(function(val, d) {
    d.setMinutes(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setMonth
   *
   * Category: Date
   *
   * Parameter: month: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setMonth`. Takes a value between 0 and 11 representing the month, and a `Date`
   * object, and sets the month to the given value. Invalid values will cause a change in other fields: if the
   * value > 11, then the year will be incremented by month div 12. Returns the given `Date` object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setMonth(2, a); // => a now refers to 15 March 2001
   *
   */

  var setMonth = curry(function(val, d) {
    d.setMonth(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setSeconds
   *
   * Category: Date
   *
   * Parameter: seconds: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setSeconds`. Takes a value between 0 and 59 representing the seconds, and a
   * `Date` object, and sets the seconds to the given value. Invalid values will cause a change in other fields: if the
   * value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause a cascade of increments
   * to other fields. Returns the given `Date` object.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setSeconds(50, a); // => a now refers to 10:11:50:013
   *
   */

  var setSeconds = curry(function(val, d) {
    d.setSeconds(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setTimeSinceEpoch
   *
   * Category: Date
   *
   * Parameter: milliseconds: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setTime`. Takes a value representing the number of seconds since midnight,
   * January 1, 1970 and a date. Simultaneously sets all of the fields of the given date to represent the date and
   * time that is that many seconds since the epoch. Returns the given `Date`.
   *
   * Examples:
   *   var a = new Date(2000, 1, 15, 10, 11, 12, 13);
   *   funkierJS.setTimeSinceEpoch(1340122101412, a); // => a now refers to 19th July 2012, 16:08:21:041
   *
   */

  var setTimeSinceEpoch = curry(function(val, d) {
    d.setTime(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setUTCDayOfMonth
   *
   * Category: Date
   *
   * Parameter: day: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setUTCDate`. Takes a value between 1 and 31, and a `Date` object, and sets the day
   * of the month to the local equivalent of the given value. Invalid values will cause a change in other fields: for
   * example, changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the
   * year. Returns the given `Date` object.
   *
   */

  var setUTCDayOfMonth = curry(function(val, d) {
    d.setUTCDate(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setUTCFullYear
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setUTCFullYear`. Takes a value and a `Date` object, and sets the year to the local
   * equivalent of the given value. This may cause a change in other fields: for example, setting the year when the
   * month and day represent February 29 respectively may cause those values to change to March 1 if the new year is not
   * a leap year. Returns the given `Date` object.
   *
   */

  var setUTCFullYear = curry(function(val, d) {
    d.setUTCFullYear(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setUTCHours
   *
   * Category: Date
   *
   * Parameter: hours: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setUTCHours`. Takes a value between 0 and 23 representing the hour of the day, and
   * a `Date` object, and sets the hour to the local equivalent of the given value. Invalid values will cause a change
   * in other fields: if the value > 23, then the day will be incremented by hours div 24. This may in turn cause a
   * cascade of increments to other fields. Returns the given `Date` object.
   *
   */

  var setUTCHours = curry(function(val, d) {
    d.setUTCHours(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setUTCMilliseconds
   *
   * Category: Date
   *
   * Parameter: milliseconds: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setUTCMilliseconds`. Takes a value between 0 and 999 representing the
   * milliseconds, and a `Date` object, and sets the milliseconds to the local equivalent of the given value. Invalid
   * values will cause a change in other fields: if the value > 999, then the seconds will be incremented by
   * milliseconds div 1000. This may in turn cause a cascade of increments to other fields. Returns the given `Date`
   * object.
   *
   */

  var setUTCMilliseconds = curry(function(val, d) {
    d.setUTCMilliseconds(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setUTCMinutes
   *
   * Category: Date
   *
   * Parameter: minutes: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setUTCMinutes`. Takes a value between 0 and 59 representing the minutes, and a
   * `Date` object, and sets the minutes to the local equivalent of the given value. Invalid values will cause a change
   * in other fields: if the value > 59, then the hours will be incremented by minutes div 60. This may in turn cause a
   * cascade of increments to other fields. Returns the given `Date` object.
   *
   */

  var setUTCMinutes = curry(function(val, d) {
    d.setUTCMinutes(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setUTCMonth
   *
   * Category: Date
   *
   * Parameter: month: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setUTCMonth`. Takes a value between 0 and 11 representing the month, and a
   * `Date` object, and sets the month to the local equivalent of the given value. Invalid values will cause a change
   * in other fields: if the value > 11, then the year will be incremented by month div 12. Returns the given `Date`
   * object.
   *
   */

  var setUTCMonth = curry(function(val, d) {
    d.setUTCMonth(val);
    return d;
  });


  /*
   * <apifunction>
   *
   * setUTCSeconds
   *
   * Category: Date
   *
   * Parameter: seconds: number
   * Parameter: d: Date
   * Returns: date
   *
   * A wrapper around `Date.prototype.setUTCSeconds`. Takes a value between 0 and 59 representing the seconds, and a
   * `Date` object, and sets the seconds to the local equivalent of the given value. Invalid values will cause a change
   * in other fields: if the value > 59, then the minutes will be incremented by seconds div 60. This may in turn cause
   * a cascade of increments to other fields. Returns the local equivalent of the given `Date` object.
   *
   */

  var setUTCSeconds = curry(function(val, d) {
    d.setUTCSeconds(val);
    return d;
  });


/* TODO
  var safeSetDayOfMonth = defineValue(
    'name: safeSetDayOfMonth',
    'signature: day: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setDate`. Takes a value between 1 and 31, and',
    'a `Date` object, and sets the day of the month to the given value. Throws if the',
    'value is outside this range, or if the month contains fewer days than the given',
    'value.',
    '',
    'Returns the given date.',
    '--',
    'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
    'safeSetDayOfMonth(30, a); // Throws',
    curry(function(val, d) {
      if (val < 0 || val > 31)
        throw new TypeError('Attempt to set day with invalid value: '+ val);

      var month = getMonth(d);
      if (val === 31 && [1, 3, 5, 8, 10].indexOf(month) !== -1)
        throw new TypeError('Attempt to set day with invalid value: '+ val);

      if (month === 2) {
        if (val === 30)
          throw new TypeError('Attempt to set day with invalid value: '+ val);

        if (val === 29) {
          var year = getFullYear(d);
          var notLeapYear = (year % 4 !== 0) || (year % 100 === 0 && year % 400 !== 0);

          if (notLeapYear)
            throw new TypeError('Attempt to set day with invalid value: '+ val);
        }
      }

      d.setDate(val);
      return d;
    })
  );


  var safeSetHours = defineValue(
    'name: safeSetHours',
    'signature: hours: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setHours`. Takes a value between 0-23',
    'representing the hour of the day, and sets the hour to the given value.',
    '',
    'Throws a TypeError for values outwith the range 0-23.',
    '',
    'Returns the given date.',
    '--',
    'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
    'safeSetHours(33, a); // Throws',
    curry(function(val, d) {
      if (val < 0 || val > 23)
        throw new TypeError('Attempt to set hour with invalid value: '+ val);

      d.setHours(val);
      return d;
    })
  );


  var safeSetMilliseconds = defineValue(
    'name: safeSetMilliseconds',
    'signature: milliseconds: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setMilliseconds`. Takes a value between 0-999',
    'representing the milliseconds, and sets the milliseconds to the given value.',
    '',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    '--',
    'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
    'safeSetMilliseconds(1002, a); // Throws',
    curry(function(val, d) {
      if (val < 0 || val > 999)
        throw new TypeError('Attempt to set milliseconds with invalid value: '+ val);

      d.setMilliseconds(val);
      return d;
    })
  );


  var safeSetMinutes = defineValue(
    'name: safeSetMinutes',
    'signature: minutes: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setMinutes`. Takes a value between 0-59',
    'representing the minutes, and sets the given date\'s minutes to that value.',
    '',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    '--',
    'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
    'safeSetMinutes(61, a); // Throws',
    curry(function(val, d) {
      if (val < 0 || val > 59)
        throw new TypeError('Attempt to set minutes with invalid value: '+ val);

      d.setMinutes(val);
      return d;
    })
  );


  var safeSetMonth = defineValue(
    'name: safeSetMonth',
    'signature: m: month, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setMonth`. Takes a value between 0-11',
    'representing the month, and sets the given date\'s month to that value.',
    '  ',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    '--',
    'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
    'safeSetMinutes(13, a); // Throws',
    curry(function(val, d) {
      if (val < 0 || val > 11)
        throw new TypeError('Attempt to set month with invalid value: '+ val);

      d.setMonth(val);
      return d;
    })
  );


  var safeSetSeconds = defineValue(
    'name: safeSetSeconds',
    'signature: seconds: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setSeconds`. Takes a value between 0-59',
    'representing the seconds, and sets the given date\'s seconds to that value.',
    '',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    '--',
    'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
    'safeSetMinutes(61, a); // Throws',
    curry(function(val, d) {
      if (val < 0 || val > 59)
        throw new TypeError('Attempt to set seconds with invalid value: '+ val);

      d.setSeconds(val);
      return d;
    })
  );


  var safeSetUTCDayOfMonth = defineValue(
    'name: safeSetUTCDayOfMonth',
    'signature: day: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setDate`. Takes a value between 1 and 31, and a',
    '`Date` object and sets the day of the month to the local equivalent of the given',
    'value.',
    '',
    'Throws a TypeError if the value is outside this range, or if the month contains',
    'fewer days than the given value.',
    '',
    'Returns the given date.',
    curry(function(val, d) {
      if (val < 0 || val > 31)
        throw new TypeError('Attempt to set day with invalid value: '+ val);

      var month = getUTCMonth(d);
      if (val === 31 && [1, 3, 5, 8, 10].indexOf(month) !== -1)
        throw new TypeError('Attempt to set day with invalid value: '+ val);

      if (month === 2) {
        if (val === 30)
          throw new TypeError('Attempt to set day with invalid value: '+ val);

        if (val === 29) {
          var year = getUTCFullYear(d);
          var notLeapYear = (year % 4 !== 0) || (year % 100 === 0 && year % 400 !== 0);

          if (notLeapYear)
            throw new TypeError('Attempt to set day with invalid value: '+ val);
        }
      }

      d.setUTCDate(val);
      return d;
    })
  );


  var safeSetUTCHours = defineValue(
    'name: safeSetUTCHours',
    'signature: hours: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setUTCHours`. Takes a value between 0-23',
    'representing the hour of the day, and sets the hour to the local equivalent of',
    'the given value.',
    '',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    curry(function(val, d) {
      if (val < 0 || val > 23)
        throw new TypeError('Attempt to set hour with invalid value: '+ val);

      d.setUTCHours(val);
      return d;
    })
  );


  var safeSetUTCMilliseconds = defineValue(
    'name: safeSetUTCMilliseconds',
    'signature: milliseconds: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setUTCMilliseconds`. Takes a value between 0-999',
    'representing the milliseconds, and sets the milliseconds to the local equivalent',
    'of the given value.',
    '',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    curry(function(val, d) {
      if (val < 0 || val > 999)
        throw new TypeError('Attempt to set milliseconds with invalid value: '+ val);

      d.setUTCMilliseconds(val);
      return d;
    })
  );


  var safeSetUTCMinutes = defineValue(
    'name: safeSetUTCMinutes',
    'signature: minutes: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setUTCMinutes`. Takes a value between 0-59',
    'representing the minutes, and sets the given date\'s minutes to the local',
    'equivalent of that value.',
    '',
    'Throws a TypeError values outside this range.',
    '',
    'Returns the given date.',
    curry(function(val, d) {
      if (val < 0 || val > 59)
        throw new TypeError('Attempt to set minutes with invalid value: '+ val);

      d.setUTCMinutes(val);
      return d;
    })
  );


  var safeSetUTCMonth = defineValue(
    'name: safeSetUTCMonth',
    'signature: month: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setUTCMonth`. Takes a value between 0-11',
    'representing the month, and sets the given date\'s month to the local equivalent',
    'of that value.',
    '',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    curry(function(val, d) {
      if (val < 0 || val > 11)
        throw new TypeError('Attempt to set month with invalid value: '+ val);

      d.setUTCMonth(val);
      return d;
    })
  );


  var safeSetUTCSeconds = defineValue(
    'name: safeSetUTCSeconds',
    'signature: seconds: number, d: date',
    'classification: date',
    '',
    'A wrapper around `Date.prototype.setUTCSeconds`. Takes a value between 0-59',
    'representing the seconds, and sets the given date\'s seconds to the local',
    'equivalent of that value.',
    '',
    'Throws a TypeError for values outside this range.',
    '',
    'Returns the given date.',
    curry(function(val, d) {
      if (val < 0 || val > 59)
        throw new TypeError('Attempt to set seconds with invalid value: '+ val);

      d.setUTCSeconds(val);
      return d;
    })
  );
*/


  // Now we delve into the madness that is the Date constructor...
  // TODO Need better synonyms for these


  /*
   * <apifunction>
   *
   * getCurrentTimeString
   *
   * Category: Date
   *
   * Returns: string
   *
   * A wrapper around calling the Date constructor without the `new` operator. Returns a string representing the
   * current date and time.
   *
   */

  var getCurrentTimeString = curry(function() {
    return Date();
  });


  /*
   * <apifunction>
   *
   * makeDateFromString
   *
   * Category: Date
   *
   * Parameter: dateString: string
   * Returns: Date
   *
   * A wrapper around calling the `Date` constructor with a single string argument. Throws a TypeError when called with
   * a non-string argument, or a string that cannot be parsed as a date. Returns a new `Date` object whose value
   * represents that given in the string.
   *
   * Examples:
   *   var d = funkierJS.makeDateFromString('2000-01-01T10:00:01:000Z');
   *
   */

  var makeDateFromString = curry(function(s) {
    if (typeof(s) !== 'string')
      throw new TypeError('Attempt to make Date from string with incorrect type');

    var d = new Date(s);

    // If the string is not parsable, Date will still create a date!
    if (isNaN(d.getHours()))
      throw new TypeError('Attempt to make Date from unparsable string');

    return d;
  });


  /*
   * <apifunction>
   *
   * makeDateFromMilliseconds
   *
   * Category: Date
   *
   * Parameter: milliseconds: number
   * Returns: Date
   *
   * A wrapper around calling the Date constructor with a single numeric argument. Throws a TypeError when called with a
   * non-numeric argument. Returns a new `Date` object whose value represents the date which is that many elapsed
   * milliseconds since the epoch.
   *
   * Examples:
   *   var d = funkierJS.makeDateFromMilliseconds(1400161244101);
   *
   */

  var makeDateFromMilliseconds = curry(function(n) {
    if (typeof(n) !== 'number')
      throw new TypeError('Attempt to make Date from milliseconds with incorrect type');

    var d = new Date(n);

    // If the number isn't valid, a date will still be created!
    if (isNaN(d.getHours()))
      throw new TypeError('Attempt to make Date from invalid value');

    return d;
  });


  /*
   * <apifunction>
   *
   * makeMonthDate
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: month: number
   * Returns: Date
   *
   * A curried wrapper around calling the `Date` constructor with two arguments: the year and the month. No validation
   * or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the `Date` are
   * initialized to zero, with the exception of the day, which is initialized to 1. Returns the new `Date`.
   *
   * Examples:
   *   var d = funkierJS.makeMonthDate(2000, 0); // => A date representing January 1 2000
   *
   */

  var makeMonthDate = curry(function(y, m) {
    return new Date(y, m);
  });


  /*
   * <apifunction>
   *
   * makeDayDate
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: month: number
   * Parameter: day: number
   * Returns: Date
   *
   * A curried wrapper around calling the Date constructor with three arguments: the year, the month and the day. No
   * validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in the `Date`
   * are initialized to zero. Returns the new `Date`.
   *
   * Examples:
   *   var d = funkierJS.makeDayDate(2000, 0, 2); // => A date representing January 2 2000
   *
   */

  var makeDayDate = curry(function(y, m, d) {
    return new Date(y, m, d);
  });


  /*
   * <apifunction>
   *
   * makeHourDate
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: month: number
   * Parameter: day: number
   * Parameter: hour: number
   * Returns: Date
   *
   * A curried wrapper around calling the `Date` constructor with four arguments: the year, the month, the day and the
   * hour. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other fields in
   * the `Date` are initialized to zero. Returns the new `Date`.
   *
   * Examples:
   *   var d = funkierJS.makeHourDate(2000, 0, 2, 10); // => A date representing 10am, January 2 2000
   *
   */

  var makeHourDate = curry(function(y, m, d, h) {
    return new Date(y, m, d, h);
  });


  /*
   * <apifunction>
   *
   * makeMinuteDate
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: month: number
   * Parameter: day: number
   * Parameter: hour: number
   * Parameter: minute: number
   * Returns: Date
   *
   * A curried wrapper around calling the `Date` constructor with five arguments: the year, the month, the day, the hour
   * and the minute. No validation or type-checking occurs on the parameters. Excess arguments are ignored. All other
   * fields in the `Date` are initialized to zero. Returns the new `Date`.
   *
   * Examples:
   *   var d = funkierJS.makeMinuteDate(2000, 0, 2, 10, 15); // => A date representing 10:15:00, January 2 2000
   *
   */

  var makeMinuteDate = curry(function(y, m, d, h, min) {
    return new Date(y, m, d, h, min);
  });


  /*
   * <apifunction>
   *
   * makeSecondDate
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: month: number
   * Parameter: day: number
   * Parameter: hour: number
   * Parameter: minute: number
   * Parameter: second: number
   * Returns: Date
   *
   * A curried wrapper around calling the `Date` constructor with six arguments: the year, the month, the day, the hour,
   * the minute, and the seconds. No validation or type-checking occurs on the parameters. Excess arguments are ignored.
   * All other fields in the `Date` are initialized to zero. Returns the new `Date`.
   *
   * Examples:
   *   var d = funkierJS.makeSecondDate(2000, 0, 2, 10, 15, 30); // => A date representing 10:15:30, January 2 2000
   *
   */

  var makeSecondDate = curry(function(y, m, d, h, min, s) {
    return new Date(y, m, d, h, min, s);
  });


  /*
   * <apifunction>
   *
   * makeMillisecondDate
   *
   * Category: Date
   *
   * Parameter: year: number
   * Parameter: month: number
   * Parameter: day: number
   * Parameter: hour: number
   * Parameter: minute: number
   * Parameter: second: number
   * Parameter: millisecond: number
   * Returns: Date
   *
   * A curried wrapper around calling the `Date` constructor with seven arguments: the year, the month, the day, the
   * hour, the minute, the seconds, and the milliseconds. No validation or type-checking occurs on the parameters.
   * Returns the new `Date`.
   *
   * Examples:
   *   var d = funkierJS.makeMillisecondDate(2000, 0, 2, 10, 15, 30, 12); // => A date representing 10:15:30:012,
   *                                                                      //    January 2 2000
   *
   */

  var makeMillisecondDate = curry(function(y, m, d, h, min, s, ms) {
    return new Date(y, m, d, h, min, s, ms);
  });


  return {
    getCurrentTimeString: getCurrentTimeString,
    getDayOfMonth: getDayOfMonth,
    getDayOfWeek: getDayOfWeek,
    getFullYear: getFullYear,
    getHours: getHours,
    getMilliseconds: getMilliseconds,
    getMinutes: getMinutes,
    getMonth: getMonth,
    getSeconds: getSeconds,
    getTimezoneOffset: getTimezoneOffset,
    getUTCDayOfMonth: getUTCDayOfMonth,
    getUTCDayOfWeek: getUTCDayOfWeek,
    getUTCFullYear: getUTCFullYear,
    getUTCHours: getUTCHours,
    getUTCMilliseconds: getUTCMilliseconds,
    getUTCMinutes: getUTCMinutes,
    getUTCMonth: getUTCMonth,
    getUTCSeconds: getUTCSeconds,
    makeDateFromMilliseconds: makeDateFromMilliseconds,
    makeDateFromString: makeDateFromString,
    makeDayDate: makeDayDate,
    makeHourDate: makeHourDate,
    makeMinuteDate: makeMinuteDate,
    makeMillisecondDate: makeMillisecondDate,
    makeMonthDate: makeMonthDate,
    makeSecondDate: makeSecondDate,
/* TBC
    safeSetDayOfMonth: safeSetDayOfMonth,
    safeSetHours: safeSetHours,
    safeSetMilliseconds: safeSetMilliseconds,
    safeSetMinutes: safeSetMinutes,
    safeSetMonth: safeSetMonth,
    safeSetSeconds: safeSetSeconds,
    safeSetUTCDayOfMonth: safeSetUTCDayOfMonth,
    safeSetUTCHours: safeSetUTCHours,
    safeSetUTCMilliseconds: safeSetUTCMilliseconds,
    safeSetUTCMinutes: safeSetUTCMinutes,
    safeSetUTCMonth: safeSetUTCMonth,
    safeSetUTCSeconds: safeSetUTCSeconds,
*/
    setDayOfMonth: setDayOfMonth,
    setFullYear: setFullYear,
    setHours: setHours,
    setMilliseconds: setMilliseconds,
    setMinutes: setMinutes,
    setMonth: setMonth,
    setSeconds: setSeconds,
    setTimeSinceEpoch: setTimeSinceEpoch,
    setUTCDayOfMonth: setUTCDayOfMonth,
    setUTCFullYear: setUTCFullYear,
    setUTCHours: setUTCHours,
    setUTCMilliseconds: setUTCMilliseconds,
    setUTCMinutes: setUTCMinutes,
    setUTCMonth: setUTCMonth,
    setUTCSeconds: setUTCSeconds,
    toDateString: toDateString,
    toEpochMilliseconds: toEpochMilliseconds,
    toISOString: toISOString,
    toLocaleDateString: toLocaleDateString,
    toTimeString: toTimeString,
    toUTCString: toUTCString
  };
})();
