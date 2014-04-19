(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var object = require('./object');
    var curry = base.curry;
    var callProp = object.callProp;


    /*
     * getDayOfMonth: A wrapper around Date.prototype.getDate. Takes a date object,
     *                and returns an integer representing the day of the month (1-31)
     *                of the given date.
     *
     */

    var getDayOfMonth = callProp('getDate');


    /*
     * getDayOfWeek: A wrapper around Date.prototype.getDay. Takes a date object,
     *               and returns an integer representing the day of the week (0-6)
     *               of the given date.
     *
     */

    var getDayOfWeek = callProp('getDay');


    /*
     * getFullYear: A wrapper around Date.prototype.getFullYear. Takes a date object,
     *              and returns an—at time of writing—4 digit number representing the year
     *              of the given date.
     *
     */

    var getFullYear = callProp('getFullYear');


    /*
     * getHours: A wrapper around Date.prototype.getHours. Takes a date object, and returns
     *           an integer representing the hour field (0-23) of the given date.
     *
     */

    var getHours = callProp('getHours');


    /*
     * getMilliseconds: A wrapper around Date.prototype.getMilliseconds. Takes a date object, and
     *                  returns an integer representing the milliseconds field (0-999) of the given date.
     *
     */

    var getMilliseconds = callProp('getMilliseconds');


    /*
     * getMinutes: A wrapper around Date.prototype.getMinutes. Takes a date object, and returns
     *             an integer representing the minutes field (0-59) of the given date.
     *
     */

    var getMinutes = callProp('getMinutes');


    /*
     * getMonth: A wrapper around Date.prototype.getMonth. Takes a date object, and returns
     *           an integer representing the month field (0-11) of the given date.
     *
     */

    var getMonth = callProp('getMonth');


    /*
     * getSeconds: A wrapper around Date.prototype.getSeconds. Takes a date object, and returns
     *             an integer representing the seconds field (0-59) of the given date.
     *
     */

    var getSeconds = callProp('getSeconds');


    /*
     * toEpochMilliseconds: A wrapper around Date.prototype.getTime. Takes a date object, and returns
     *                      the number of milliseconds elapsed since midnight, January 1 1970.
     *
     */

    var toEpochMilliseconds = callProp('getTime');


    /*
     * getTimezoneOffset: A wrapper around Date.prototype.getTimezoneOffset. Takes a date object, and
     *                    returns the delta in minutes between the Javascript environment and UTC.
     *
     */

    var getTimezoneOffset = callProp('getTimezoneOffset');


    /*
     * getUTCDayOfMonth: A wrapper around Date.prototype.getUTCDate. Takes a date object,
     *                   and returns an integer representing the day of the month (1-31)
     *                   of the given date adjusted for UTC.
     *
     */

    var getUTCDayOfMonth = callProp('getUTCDate');


    /*
     * getUTCDayOfWeek: A wrapper around Date.prototype.getUTCDay. Takes a date object,
     *                  and returns an integer representing the day of the week (0-6)
     *                  of the given date adjusted for UTC.
     *
     */

    var getUTCDayOfWeek = callProp('getUTCDay');


    /*
     * getUTCFullYear: A wrapper around Date.prototype.getUTCFullYear. Takes a date object,
     *                 and returns an—at time of writing—4 digit number representing the year
     *                 of the given date adjusted for UTC.
     *
     */

    var getUTCFullYear = callProp('getUTCFullYear');


    /*
     * getUTCHours: A wrapper around Date.prototype.getUTCHours. Takes a date object, and returns
     *              an integer representing the hour field of the given date (0-23) adjusted for UTC.
     *
     */

    var getUTCHours = callProp('getUTCHours');


    /*
     * getUTCMilliseconds: A wrapper around Date.prototype.getUTCMilliseconds. Takes a date object, and
     *                     returns an integer representing the milliseconds field (0-999) of the given
     *                     date adjusted for UTC.
     *
     */

    var getUTCMilliseconds = callProp('getUTCMilliseconds');


    /*
     * getUTCMinutes: A wrapper around Date.prototype.getUTCMinutes. Takes a date object, and returns
     *                an integer representing the minutes field (0-59) of the given date adjusted for UTC.
     *
     */

    var getUTCMinutes = callProp('getUTCMinutes');


    /*
     * getUTCMonth: A wrapper around Date.prototype.getUTCMonth. Takes a date object, and returns
     *              an integer representing the month field (0-11) of the given date adjusted for UTC.
     *
     */

    var getUTCMonth = callProp('getUTCMonth');


    /*
     * getUTCSeconds: A wrapper around Date.prototype.getUTCSeconds. Takes a date object, and returns
     *                an integer representing the seconds field (0-59) of the given date adjusted for UTC.
     *
     */

    var getUTCSeconds = callProp('getUTCSeconds');


    /*
     *
     * toLocaleDateString: A wrapper around Date.prototype.toLocaleDateString. Takes a date object,
     *                     and returns a string representing the date portion of the object, formatted
     *                     according to locale conventions.
     *
     */

    var toLocaleDateString = callProp('toLocaleDateString');


    /*
     *
     * toLocaleString: A wrapper around Date.prototype.toLocaleString. Takes a date object, and returns
     *                 a string representing the object, formatted according to locale conventions.
     *
     */

    var toLocaleString = callProp('toLocaleString');


    /*
     *
     * toLocaleTimeString: A wrapper around Date.prototype.toLocaleTimeString. Takes a date object, and returns
     *                     a string representing the time portion of the object, formatted according to locale conventions.
     *
     */

    var toLocaleTimeString = callProp('toLocaleTimeString');


    /*
     *
     * toDateString: A wrapper around Date.prototype.toDateString. Takes a date object, and returns
     *              and returns a string representing the date portion of the object.
     *
     */

    var toDateString = callProp('toDateString');


    /*
     *
     * toTimeString: A wrapper around Date.prototype.toTimeString. Takes a date object, and returns
     *               a string representing the time portion of the object.
     *
     */

    var toTimeString = callProp('toTimeString');


    var exported = {
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
      toDateString: toDateString,
      toEpochMilliseconds: toEpochMilliseconds,
      toLocaleDateString: toLocaleDateString,
      toLocaleString: toLocaleString,
      toLocaleTimeString: toLocaleTimeString,
      toTimeString: toTimeString
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
