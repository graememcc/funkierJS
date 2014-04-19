(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var object = require('./object');
    var curry = base.curry;
    var callProp = object.callProp;


    /*
     * getDayOfMonth: A wrapper around Date.prototype.getDate. Takes a date object,
     *                and returns an integer representing the day of the month (1-31).
     *
     */

    var getDayOfMonth = callProp('getDate');


    /*
     * getDayOfWeek: A wrapper around Date.prototype.getDay. Takes a date object,
     *               and returns an integer representing the day of the week (0-6).
     *
     */

    var getDayOfWeek = callProp('getDay');


    /*
     * getFullYear: A wrapper around Date.prototype.getFullYear. Takes a date object,
     *               and returns an—at time of writing—4 digit number representing the year.
     *
     */

    var getFullYear = callProp('getFullYear');


    /*
     * getHours: A wrapper around Date.prototype.getHours. Takes a date object, and returns
     *           an integer representing the current hour (0-23).
     *
     */

    var getHours = callProp('getHours');


    /*
     * getMilliseconds: A wrapper around Date.prototype.getMilliseconds. Takes a date object,
     *                  and returns an integer representing the current milliseconds (0-999).
     *
     */

    var getMilliseconds = callProp('getMilliseconds');


    /*
     * getMinutes: A wrapper around Date.prototype.getMinutes. Takes a date object, and returns
     *             an integer representing the current minutes. (0-59).
     *
     */

    var getMinutes = callProp('getMinutes');


    var exported = {
      getDayOfMonth: getDayOfMonth,
      getDayOfWeek: getDayOfWeek,
      getFullYear: getFullYear,
      getHours: getHours,
      getMilliseconds: getMilliseconds,
      getMinutes: getMinutes
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
