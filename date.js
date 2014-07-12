(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;

    var object = require('./object');
    var callProp = object.callProp;

    var utils = require('./utils');
    var defineValue = utils.defineValue;


    // XXX Consistency of the safe operations e.g. changing month to a 30 day month...


    var getDayOfMonth = defineValue(
      'name: getDayOfMonth',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getDate. Takes a date object, and returns an integer',
      'representing the day of the month (1-31) of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getDayOfMonth(a); // 15',
      callProp('getDate')
    );


    var getDayOfWeek = defineValue(
      'name: getDayOfWeek',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getDay. Takes a date object, and returns an integer',
      'representing the day of the week (0-6) of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getDayOfWeek(a); // 2',
      callProp('getDay')
    );


    var getFullYear = defineValue(
      'name: getFullYear',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getFullYear. Takes a date object, and returns a 4 digit',
      'number representing the year of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getFullYear(a); // 2000',
      callProp('getFullYear')
    );


    var getHours = defineValue(
      'name: getHours',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getHours. Takes a date object, and returns an integer',
      'representing the hour field (0-23) of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getHours(a); // 10',
      callProp('getHours')
    );


    var getMilliseconds = defineValue(
      'name: getMilliseconds',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getMilliseconds. Takes a date object, and returns an',
      'integer representing the milliseconds field (0-999) of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getMilliseconds(a); // 13',
      callProp('getMilliseconds')
    );


    var getMinutes = defineValue(
      'name: getMinutes',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getMinutes. Takes a date object, and returns an integer',
      'representing the minutes field (0-59) of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getMinutes(a); // 11',
      callProp('getMinutes')
    );



    var getMonth = defineValue(
      'name: getMonth',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getMonth. Takes a date object, and returns an integer',
      'representing the month field (0-11) of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getMonth(a); // 1',
      callProp('getMonth')
    );


    var getSeconds = defineValue(
      'name: getSeconds',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getSeconds. Takes a date object, and returns an integer',
      'representing the seconds field (0-59) of the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'getSeconds(a); // 12',
      callProp('getSeconds')
    );


    var toEpochMilliseconds = defineValue(
      'name: toEpochMilliseconds',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getTime. Takes a date object, and returns the number of',
      'milliseconds elapsed since midnight, January 1 1970.',
      callProp('getTime')
    );


    var getTimezoneOffset = defineValue(
      'name: getTimezoneOffset',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and returns the delta',
      'in minutes between the Javascript environment and UTC.',
      callProp('getTimezoneOffset')
    );


    var getUTCDayOfMonth = defineValue(
      'name: getUTCDayOfMonth',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCDate. Takes a date object, and returns an integer representing',
      'representing the day of the month (1-31) of the given date adjusted for UTC.',
      callProp('getUTCDate')
    );


    var getUTCDayOfWeek = defineValue(
      'name: getUTCDayOfWeek',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCDay. Takes a date object, and returns an integer representing the',
      'day of the week (0-6) of the given date adjusted for UTC.',
      callProp('getUTCDay')
    );


    var getUTCFullYear = defineValue(
      'name: getUTCFullYear',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCFullYear. Takes a date object, and returns a 4-digit number representing',
      'the year of the given date adjusted for UTC.',
      callProp('getUTCFullYear')
    );


    var getUTCHours = defineValue(
      'name: getUTCHours',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns an integer representing',
      'the hour field of the given date (0-23) adjusted for UTC.',
      callProp('getUTCHours')
    );


    var getUTCMilliseconds = defineValue(
      'name: getUTCMilliseconds',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and returns an intger representing',
      'the milliseconds field (0-999) of the given date adjusted for UTC.',
      callProp('getUTCMilliseconds')
    );


    var getUTCMinutes = defineValue(
      'name: getUTCMinutes',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns an integer representing the',
      'minutes field (0-59) of the given date adjusted for UTC.',
      callProp('getUTCMinutes')
    );


    var getUTCMonth = defineValue(
      'name: getUTCMonth',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns an integer representing the',
      'month field (0-11) of the given date adjusted for UTC.',
      callProp('getUTCMonth')
    );


    var getUTCSeconds = defineValue(
      'name: getUTCSeconds',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns an integer representing',
      'the seconds field (0-59) of the given date adjusted for UTC.',
      callProp('getUTCSeconds')
    );


    var toLocaleDateString = defineValue(
      'name: toLocaleDateString',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.toLocaleDateString. Takes a date object, and returns a string representing',
      'the date portion of the object, formatted according to locale conventions.',
      callProp('toLocaleDateString')
    );


    var toDateString = defineValue(
      'name: toDateString',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.toDateString. Takes a date object, and returns and returns a string',
      'representing the date portion of the object.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'toDateString(a); // "Tue Feb 15 2000" or similar',
      callProp('toDateString')
    );


    var toTimeString = defineValue(
      'name: toTimeString',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.toTimeString. Takes a date object, and returns a string representing',
      'the time portion of the object.',
      callProp('toTimeString')
    );


    var toISOString = defineValue(
      'name: toISOString',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.toISOString. Takes a date object, and returns a representation of',
      'the date in ISO format.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'toISOString(a); // "2000-02-15T10:11:12.013Z" or similar',
      callProp('toISOString')
    );


    var toUTCString = defineValue(
      'name: toUTCString',
      'signature: d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.toUTCString. Takes a date object, and returns a representation of the',
      'equivalent date in UTC.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'toISOString(a); // "Tue, 15 Feb 2000 10:11:12 GMT" or similar',
      callProp('toUTCString')
    );


    // We cannot use callProp for the setters due to the need to return
    // the given date

    var setDayOfMonth = defineValue(
      'name: setDayOfMonth',
      'signature: day: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object, and sets the',
      'day of the month to the given value. Invalid values will cause a change in other fields: for example,',
      'changing the day to 31 in a month with 30 days will increment the month, which may in turn increment the',
      'year.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setDayOfMonth(1, a); // a now refers to Feb 1st 2000',
      curry(function(val, d) {
        d.setDate(val);
        return d;
      })
    );


    var setFullYear = defineValue(
      'name: setFullYear',
      'signature: year: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setFullYear. Takes a year value, and a Date object, and sets the',
      'the year to the given value. This may cause a change in other fields: for example, setting the year',
      'when the month and date are February 29 may cause those values to change to March 1 if the specified',
      'year was not a leap year.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setFullYear(2001, a); // a now refers to 15 February 2001',
      curry(function(val, d) {
        d.setFullYear(val);
        return d;
      })
    );


    var setHours = defineValue(
      'name: setHours',
      'signature: hours: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setHours. Takes a value between 0-23 representing the hour of the day,',
      'and sets the hour to the given value. Invalid values will cause a change in other fields: if the',
      'value > 23, then the day will be incremented by hours div 24. This may in turn cause a cascade of',
      'increments to other fields.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setHours(11, a); // a now refers to 11:11:12:013',
      curry(function(val, d) {
        d.setHours(val);
        return d;
      })
    );


    var setMilliseconds = defineValue(
      'name: setMilliseconds',
      'signature: milliseconds: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setMilliseconds. Takes a value between 0-999 representing the',
      'milliseconds, and sets the milliseconds to the given value. Invalid values will cause a change',
      'in other fields: if the value > 999, then the seconds will be incremented by milliseconds div 1000.',
      'This may in turn cause a cascade of increments to other fields.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setMilliseconds(20, a); // a now refers to 10:11:12:020',
      curry(function(val, d) {
        d.setMilliseconds(val);
        return d;
      })
    );


    var setMinutes = defineValue(
      'name: setMinutes',
      'signature: minutes: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setMinutes. Takes a value between 0-59 representing the minutes,',
      'and sets the given date\'s minutes to that value. Invalid values will cause a change in other',
      'fields: if the given minutes > 59, then the hours will be incremented by minutes div 60. This in',
      'turn may cause a cascade of increments to other fields.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setMinutes(59, a); // a now refers to 10:59:12:013',
      curry(function(val, d) {
        d.setMinutes(val);
        return d;
      })
    );


    var setMonth = defineValue(
      'name: setMonth',
      'signature: month: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setMonth. Takes a value between 0-11 representing the month,',
      'and sets the given date\'s month to the that value. Invalid values will cause a change in other',
      'fields: if the given month > 11, then the year will be incremented by month div 12.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setMonth(2, a); // a now refers to 15 March 2001',
      curry(function(val, d) {
        d.setMonth(val);
        return d;
      })
    );


    var setSeconds = defineValue(
      'name: setSeconds',
      'signature: seconds: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setSeconds. Takes a value between 0-59 representing the',
      'seconds, and sets the given date\'s seconds to that value. Invalid values will cause a',
      'change in other fields: if the given seconds > 59, then the minutes will be incremented',
      'by seconds div 60. This in turn may cause a cascade of increments to other fields.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setSeconds(50, a); // a now refers to 10:11:50:013',
      curry(function(val, d) {
        d.setSeconds(val);
        return d;
      })
    );


    var setTimeSinceEpoch = defineValue(
      'name: setTimeSinceEpoch',
      'signature: milliseconds: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setTime. Takes a value representing the number of milliseconds',
      'since midnight, January 1, 1970, and a date. Simultaneously sets all the fields of the given',
      'date to represent the date and time that is that many milliseconds since the epoch.',
      '',
      'Returns the given date.',
      '--',
      'var a = new Date(2000, 1, 15, 10, 11, 12, 13);',
      'setTimeSinceEpoch(1340122101412, a); // a now refers to 19th July 2012, 16:08:21.041',
      curry(function(val, d) {
        d.setTime(val);
        return d;
      })
    );


    var setUTCDayOfMonth = defineValue(
      'name: setUTCDayOfMonth',
      'signature: day: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setUTCDate. Takes a value between 1 and 31, and a Date object, and',
      'sets the day of the month to the local equivalent of the given value. Invalid values will cause a change',
      'in other fields: for example, changing the day to 31 in a month with 30 days will increment the month,',
      'which may in turn increment the year.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        d.setUTCDate(val);
        return d;
      })
    );


    var setUTCFullYear = defineValue(
      'name: setUTCFullYear',
      'signature: year: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setUTCFullYear. Takes a value representing the year, and a Date',
      'object, and sets the year to the local equivalent of the given value.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        d.setUTCFullYear(val);
        return d;
      })
    );


    var setUTCHours = defineValue(
      'name: setUTCHours',
      'signature: hours: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setUTCHours. Takes a value between 0-23 representing the hour',
      'of the day, and sets the hour to the local equivalent of the given value. Invalid values will',
      'cause a change in other fields: if the value > 23, then the day will be incremented by hours',
      'div 24. This may in turn cause a cascade of increments to other fields.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        d.setUTCHours(val);
        return d;
      })
    );


    var setUTCMilliseconds = defineValue(
      'name: setUTCMilliseconds',
      'signature: milliseconds: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0-999 representing the',
      'milliseconds, and sets the milliseconds to the local equivalent of the given value. Invalid',
      'values will cause a change in other fields: if the value > 999, then the seconds will be',
      'incremented by milliseconds div 1000. This may in turn cause a cascade of increments to other fields.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        d.setUTCMilliseconds(val);
        return d;
      })
    );


    var setUTCMinutes = defineValue(
      'name: setUTCMinutes',
      'signature: minutes: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0-59 representing',
      'the minutes, and sets the given date\'s minutes to the local equivalent of that value.',
      'Invalid values will cause a change in other fields: if the given minutes > 59, then the',
      'hours will be incremented by minutes div 60. This in turn may cause a cascade of increments',
      'to other fields.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        d.setUTCMinutes(val);
        return d;
      })
    );


    var setUTCMonth = defineValue(
      'name: setUTCMonth',
      'signature: month: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setUTCMonth. Takes a value between 0-11 representing',
      'the month, and sets the given date\'s month to the local equivalent of that value.',
      'Invalid values will cause a change in other fields if the given month > 11, then',
      'year will be incremented by month div 12.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        d.setUTCMonth(val);
        return d;
      })
    );


    var setUTCSeconds = defineValue(
      'name: setUTCSeconds',
      'signature: seconds: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0-59 representing',
      'the seconds, and sets the given date\'s seconds to the local equivalent of that value.',
      'Invalid values will cause a change in other fields: if the given seconds > 59, then the',
      'minutes will be incremented by seconds div 60. This in turn may cause a cascade of',
      'increments to other fields.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        d.setUTCSeconds(val);
        return d;
      })
    );


    var safeSetDayOfMonth = defineValue(
      'name: safeSetDayOfMonth',
      'signature: day: number, d: date',
      'classification: date',
      '',
      'A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and',
      'a Date object, and sets the day of the month to the given value. Throws if the',
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
      'A wrapper around Date.prototype.setHours. Takes a value between 0-23 representing the',
      'hour of the day, and sets the hour to the given value. Throws a TypeError for values',
      'outwith the range 0-23.',
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
      'A wrapper around Date.prototype.setMilliseconds. Takes a value between 0-999',
      'representing the milliseconds, and sets the milliseconds to the given value.',
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
      'A wrapper around Date.prototype.setMinutes. Takes a value between 0-59 representing',
      'the minutes, and sets the given date\'s minutes to that value. Throws a TypeError for',
      'values outside this range.',
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
      'A wrapper around Date.prototype.setMonth. Takes a value between 0-11 representing the',
      'month, and sets the given date\'s month to that value. Throws a TypeError for values',
      'outside this range.',
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
      'A wrapper around Date.prototype.setSeconds. Takes a value between 0-59 representing',
      'the seconds, and sets the given date\'s seconds to that value. Throws a TypeError for',
      'values outside this range.',
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
      'A wrapper around Date.prototype.setDate. Takes a value between 1 and 31, and a Date object',
      'and sets the day of the month to the local equivalent of the given value. Throws if the',
      'value is outside this range, or if the month contains fewer days than the given value.',
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
      'A wrapper around Date.prototype.setUTCHours. Takes a value between 0-23 representing the',
      'hour of the day, and sets the hour to the local equivalent of the given value. Throws a',
      'TypeError for values outside this range.',
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
      'A wrapper around Date.prototype.setUTCMilliseconds. Takes a value between 0-999 representing',
      'the milliseconds, and sets the milliseconds to the local equivalent of the given value.',
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
      'A wrapper around Date.prototype.setUTCMinutes. Takes a value between 0-59 representing',
      'the minutes, and sets the given date\'s minutes to the local equivalent of that value.',
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
      'A wrapper around Date.prototype.setUTCMonth. Takes a value between 0-11 representing',
      'the month, and sets the given date\'s month to the local equivalent of that value.',
      'Throws for values outside this range.',
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
      'A wrapper around Date.prototype.setUTCSeconds. Takes a value between 0-59 representing',
      'the seconds, and sets the given date\'s seconds to the local equivalent of that value.',
      'Throws for values outside this range.',
      '',
      'Returns the given date.',
      curry(function(val, d) {
        if (val < 0 || val > 59)
          throw new TypeError('Attempt to set seconds with invalid value: '+ val);

        d.setUTCSeconds(val);
        return d;
      })
    );


    // Now we delve into the madness that is the Date constructor...

    var getCurrentTimeString = defineValue(
      'name: getCurrentTimeString',
      'classification: date',
      '',
      'A wrapper around calling the Date constructor without the \'new\' operator.',
      '',
      'Returns a string representing the current date and time.',
      curry(function() {
        return Date();
      })
    );


    var makeDateFromString = defineValue(
      'name: makeDateFromString',
      'signature: dateString: string',
      'classification: date',
      '',
      'A wrapper around calling the Date constructor with a single string argument. Throws',
      'TypeError when called with a non-string argument, or a string that cannot be parsed.',
      '',
      'Returns the new date.',
      '--',
      'var d = makeDateFromString(\'2000-01-01T10:00:01:000Z\');',
      curry(function(s) {
        if (typeof(s) !== 'string')
          throw new TypeError('Attempt to make Date from string with incorrect type');

        var d = new Date(s);

        // If the string is not parsable, Date will still create a date!
        if (isNaN(d.getHours()))
          throw new TypeError('Attempt to make Date from unparsable string');

        return d;
      })
    );


    var makeDateFromMilliseconds = defineValue(
      'name: makeDateFromMilliseconds',
      'signature: milliseconds: number',
      'classification: date',
      '',
      'A wrapper around calling the Date constructor with a single numeric argument.',
      'Throws a TypeError when called with a non-numeric argument.',
      '',
      'Returns the new date',
      '--',
      'var d = makeDateFromMilliseconds(1400161244101);',
      curry(function(n) {
        if (typeof(n) !== 'number')
          throw new TypeError('Attempt to make Date from milliseconds with incorrect type');

        var d = new Date(n);

        // If the number isn't valid, a date will still be created!
        if (isNaN(d.getHours()))
          throw new TypeError('Attempt to make Date from invalid value');

        return d;
      })
    );


    var makeMonthDate = defineValue(
      'name: makeMonthDate',
      'signature: year: number, month: number',
      'classification: date',
      '',
      'A curried wrapper around calling the Date constructor with two arguments: the year',
      'and the month. No validation or type checking occurs on the parameters. Excess arguments',
      'are ignored. All other fields in the Date are initialised to zero, with the exception of',
      'the day, which will be 1.',
      '',
      'Returns the new Date.',
      '--',
      'var d = new Date(2000, 0); // A date representing January 1 2000',
      curry(function(y, m) {
        return new Date(y, m);
      })
    );


    var makeDayDate = defineValue(
      'name: makeDayDate',
      'signature: year: number, month: number, day: number',
      'classification: date',
      '',
      'makeDayDate: a curried wrapper around calling the Date constructor with three arguments: the year,',
      'the month, and the day. No validation or type checking occurs on the parameters. Excess arguments are',
      'ignored. All other fields in the Date are initialised to zero.',
      '',
      'Returns the new Date.',
      '--',
      'var d = new Date(2000, 0, 2); // A date representing January 2 2000',
      curry(function(y, m, d) {
        return new Date(y, m, d);
      })
    );


    var makeHourDate = defineValue(
      'name: makeHourDate',
      'signature: year: number, month: number, day: number, hour: number',
      'classification: date',
      '',
      'A curried wrapper around calling the Date constructor with four arguments: the year',
      'the month, the day, and the hour. No validation or type checking occurs on the',
      'parameters. Excess arguments are ignored. All other fields in the Date are initialised',
      'to zero.',
      '',
      'Returns the new Date.',
      '--',
      'var d = new Date(2000, 0, 2, 10); // A date representing 10am, January 2 2000',
      curry(function(y, m, d, h) {
        return new Date(y, m, d, h);
      })
    );


    var makeMinuteDate = defineValue(
      'name: makeMinuteDate',
      'signature: year: number, month: number, day: number, hour: number, minute: number',
      'classification: date',
      '',
      'A curried wrapper around calling the Date constructor with five arguments: the year',
      'the month, the day, the hour and the minute. No validation or type checking occurs on',
      'the parameters. Excess arguments are ignored. All other fields in the Date are',
      'initialised to zero.',
      '',
      'Returns the new Date.',
      '--',
      'var d = new Date(2000, 0, 2, 10, 15); // A date representing 10:15:00, January 2 2000',
      curry(function(y, m, d, h, min) {
        return new Date(y, m, d, h, min);
      })
    );


    var makeSecondDate = defineValue(
      'name: makeSecondDate',
      'signature: year: number, month: number, day: number, hour: number, minute: number, seconds: number',
      'classification: date',
      '',
      'A curried wrapper around calling the Date constructor with six arguments: the year, the',
      'month, the day, the hour, minute, and second. No validation or type checking occurs on the',
      'parameters. Excess arguments are ignored. All other fields in the Date are initialised to',
      'zero.',
      '',
      'Returns the new Date.',
      '--',
      'var d = new Date(2000, 0, 2, 10, 15, 30); // A date representing 10:15:30, January 2 2000',
      curry(function(y, m, d, h, min, s) {
        return new Date(y, m, d, h, min, s);
      })
    );


    var makeMillisecondDate = defineValue(
      'name: makeMillisecondDate',
      'signature: year: number, month: number, day: number, hour: number, minute: number, seconds: number, milliseconds: number',
      'classification: date',
      '',
      'A curried wrapper around calling the Date constructor with seven arguments: the year, the month',
      'the day, the hour, minute, second and millisecond. No validation or type checking occurs on the',
      'parameters. Excess arguments are ignored. All other fields in the Date are initialised to zero.',
      '',
      'Returns the new Date.',
      '--',
      'var d = new Date(2000, 0, 2, 10, 15, 30, 12); // A date representing 10:15:30:012, January 2 2000',
      curry(function(y, m, d, h, min, s, ms) {
        return new Date(y, m, d, h, min, s, ms);
      })
    );


    var exported = {
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


    module.exports = exported;
  };


  // AMD/CommonJS foo
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      makeModule(require, exports, module);
    });
  } else {
    makeModule(require, exports, module);
  }
})();
