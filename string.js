(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var object = require('./object');
    var curry = base.curry;
    var getRealArity = base.getRealArity;
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;


    /*
     * toString: A wrapper around Object.prototype.toString. Takes a value,
     *           and calls toString on the given value.
     *
     */

    var toString = function(val) {
      return val.toString();
    };


    /*
     * toCharCode: A curried wrapper around String.charCodeAt. Takes an index,
     *             and a string, and returns the Unicode value of the character.
     *
     */

    var toCharCode = callPropWithArity('charCodeAt', 1);


    /*
     * ord: Equivalent to toCharCode(0, s). Returns the Unicode value of the first
     *      character in the given string s.
     *
     */

    var ord = toCharCode(0);


    /*
     * chr: Equivalent to String.fromCharCode. Returns the character represented by the
     *      given Unicode character.
     *
     */

    var chr = function(c) {
      return String.fromCharCode(c);
    };


    /*
     * toLowerCase: Equivalent to String.prototype.toLowerCase. Takes a string, and converts
     *              it to lower case.
     *
     */

    var toLowerCase = callProp('toLowerCase');


    /*
     * toLocaleLowerCase: Equivalent to String.prototype.toLocaleLowerCase. Takes a string, and converts
     *                    it to lower case, following locale conventions.
     *
     */

    var toLocaleLowerCase = callProp('toLocaleLowerCase');


    var exported = {
      chr: chr,
      ord: ord,
      toCharCode: toCharCode,
      toLowerCase: toLowerCase,
      toLocaleLowerCase: toLocaleLowerCase,
      toString: toString
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
