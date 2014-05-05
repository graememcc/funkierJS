(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var curry = base.curry;
    var flip = base.flip;

    var object = require('./object');
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;


    /*
     * add: a wrapper around binary addition
     *
     */

    var add = curry(function(x, y) {
      return x + y;
    });


    /*
     * subtract: a wrapper around binary subtraction
     *
     */

    var subtract = curry(function(x, y) {
      return x - y;
    });


    /*
     * multiply: a wrapper around binary multiplication
     *
     */

    var multiply = curry(function(x, y) {
      return x * y;
    });


    /*
     * divide: a wrapper around binary division
     *
     */

    var divide = curry(function(x, y) {
      return x / y;
    });


    /*
     * exp: a wrapper around Math.pow
     *
     */

    var exp = curry(function(x, y) {
      return Math.pow(x, y);
    });


    /*
     * log: log(x, y) returns the log of y in the base x. Note: this uses
     *      the change of base formula, so may be subject to rounding errors
     *      caused by the vagaries of Javascript division.
     *
     */

    var log = curry(function(x, y) {
      return Math.log(y) / Math.log(x);
    });


    /*
     * div: returns the quotient on dividing x by y
     *
     */

    var div = curry(function(x, y) {
      return Math.floor(x / y);
    });


    /*
     * rem: a wrapper around the remainder operator
     *
     */

    var rem = curry(function(x, y) {
      return x % y;
    });


    /*
     * lessThan: a wrapper around the less than (<) operator
     *
     */

    var lessThan = curry(function(x, y) {
      return x < y;
    });


    /*
     * lessThanEqual: a wrapper around the less than or equal (<=) operator
     *
     */

    var lessThanEqual = curry(function(x, y) {
      return x <= y;
    });


    /*
     * greaterThan: a wrapper around the greater than (>) operator
     *
     */

    var greaterThan = curry(function(x, y) {
      return x > y;
    });


    /*
     * greaterThanEqual: a wrapper around the greater than or equal (>=) operator
     *
     */

    var greaterThanEqual = curry(function(x, y) {
      return x >= y;
    });


    /*
     * leftShift: a wrapper around the left shift (<<) operator
     *
     */

    var leftShift = curry(function(x, y) {
      return x << y;
    });


    /*
     * rightShift: a wrapper around the right shift (>>) operator
     *
     */

    var rightShift = curry(function(x, y) {
      return x >> y;
    });


    /*
     * rightShiftZero: a wrapper around the zero-fill right shift (>>>) operator
     *
     */

    var rightShiftZero = curry(function(x, y) {
      return x >>> y;
    });


    /*
     * bitwiseAnd: a wrapper around the bitwise and (&) operator
     *
     */

    var bitwiseAnd = curry(function(x, y) {
      return x & y;
    });


    /*
     * bitwiseOr: a wrapper around the bitwise or (|) operator
     *
     */

    var bitwiseOr = curry(function(x, y) {
      return x | y;
    });


    /*
     * bitwiseXor: a wrapper around the bitwise xor (^) operator
     *
     */

    var bitwiseXor = curry(function(x, y) {
      return x ^ y;
    });


    /*
     * bitwiseNot: a wrapper around the bitwise not (~) operator
     *
     */

    var bitwiseNot = curry(function(x) {
      return ~x;
    });


    // XXX Do we want a notion of Orderable like Haskell, and so have
    // min and max accept non-numeric types?

    /*
     * min: a wrapper around Math.min
     *
     */

    // min has a spec mandated length of 2, so we can simply...
    var min = curry(Math.min);


    /*
     * max: a wrapper around Math.max
     *
     */

    // max has a spec mandated length of 2, so we can simply...
    var max = curry(Math.max);


    /*
     * toFixed: a curried wrapper around Number.prototype.toFixed. Takes the number
     *          of digits between 0 and 20, and a number. Returns a string representing
     *          that number with the given number of digits.
     *
     */

    var toFixed = callPropWithArity('toFixed', 1);


    /*
     * toExponential: a curried wrapper around Number.prototype.toExponential. Takes the number
     *                of digits between 0 and 20, and a number. Returns a string representing
     *                that number in exponential form, with digits number of digits after the
     *                decimal point.
     *
     */

    var toExponential = callPropWithArity('toExponential', 1);


    /*
     * toPrecision: a curried wrapper around Number.prototype.toExponential. Takes the number
     *              of digits between 1 and 21, and a number. Returns a string representing
     *              that number in exponential form, with digits significant number of digits.
     *              The string will be in fixed or exponential form as appropriate.
     *
     */

    var toPrecision = callPropWithArity('toPrecision', 1);


    /*
     * toBaseAndString: a curried wrapper around Number.prototype.toString. Takes a base between
     *                  2 and 36, and a number. Returns a string representing the given number in
     *                  the given base.
     *
     */

    var toBaseAndString = callPropWithArity('toString', 1);


    /*
     * stringToInt: a curried wrapper around parseInt. Takes a base, and a string, and attempts to
     *              treat the string as representing a number in the given base, and convert it.
     *              Returns NaN if the string does not represent a valid number.
     *
     */

    var stringToInt = flip(parseInt);


    /*
     * even: Returns true if the given value is divisible by 2, and false otherwise.
     *
     */

    var even = curry(function(n) {
      return n % 2 === 0;
    });


    /*
     * odd: Returns true if the given value has remainder 1 on division by 2, and false otherwise.
     *
     */

    var odd = curry(function(n) {
      return n % 2 !== 0;
    });


    var exported = {
      add: add,
      bitwiseAnd: bitwiseAnd,
      bitwiseNot: bitwiseNot,
      bitwiseOr: bitwiseOr,
      bitwiseXor: bitwiseXor,
      div: div,
      divide: divide,
      even: even,
      exp: exp,
      greaterThan: greaterThan,
      greaterThanEqual: greaterThanEqual,
      leftShift: leftShift,
      lessThan: lessThan,
      lessThanEqual: lessThanEqual,
      log: log,
      min: min,
      max: max,
      multiply: multiply,
      odd: odd,
      rem: rem,
      rightShift: rightShift,
      rightShiftZero: rightShiftZero,
      stringToInt: stringToInt,
      subtract: subtract,
      toBaseAndString: toBaseAndString,
      toExponential: toExponential,
      toFixed: toFixed,
      toPrecision: toPrecision
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
