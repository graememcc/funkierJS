module.exports = (function() {
"use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;

  var base = require('./base');
  var flip = base.flip;

  var object = require('./object');
  var callProp = object.callProp;
  var callPropWithArity = object.callPropWithArity;


  /*
   * <apifunction>
   *
   * add
   *
   * Category: maths
   *
   * Synonyms: plus
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the addition operator.
   *
   * Examples:
   *   funkierJS.add(1, 1); // => 2
   *
   */

  var add = curry(function(x, y) {
    return x + y;
  });


  /*
   * <apifunction>
   *
   * subtract
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the subtraction operator.
   *
   * Examples:
   *   funkierJS.subtract(3, 1); // => 2;
   *
   */

  var subtract = curry(function(x, y) {
    return x - y;
  });


  /*
   * <apifunction>
   *
   * multiply
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the multiplication operator.
   *
   * Examples:
   *   funkierJS.multiply(2, 2); // => 4;
   *
   */

  var multiply = curry(function(x, y) {
    return x * y;
  });


  /*
   * <apifunction>
   *
   * divide
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the division operator.
   *
   * Examples:
   *   funkierJS.arityOf(4, 2); // => 2;
   *
   */

  var divide = curry(function(x, y) {
    return x / y;
  });


  /*
   * <apifunction>
   *
   * exp
   *
   * Category: maths
   *
   * Synonyms: pow
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A curried wrapper around Math.pow.
   *
   * Examples:
   *   funkierJS.exp(2, 3); // => 8
   *
   */

  var exp = curry(function(x, y) {
    return Math.pow(x, y);
  });


  /*
   * <apifunction>
   *
   * log
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * Returns the logarithm of y in the given base x. Note that this function uses the change of base formula, so may
   * be subject to rounding errors.
   *
   * Examples:
   *   funkierJS.log(2, 8); // => 3;
   *
   */

  var log = curry(function(x, y) {
    return Math.log(y) / Math.log(x);
  });



  /*
   * <apifunction>
   *
   * div
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * Returns the quotient on dividing x by y.
   *
   * Examples:
   *   funkierJS.div(5, 2); // => 2
   *
   */

  var div = curry(function(x, y) {
    return Math.floor(x / y);
  });


  /*
   * <apifunction>
   *
   * rem
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the remainder (%) operator.
   *
   * Examples:
   *   funkierJS.rem(5, 2); // => 1;
   *
   */

  var rem = curry(function(x, y) {
    return x % y;
  });



  /*
   * <apifunction>
   *
   * lessThan
   *
   * Category: maths
   *
   * Synonyms: lt
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the less than (<) operator.
   *
   * Examples:
   *   funkierJS.lessThan(5, 2); // => false;
   *
   */

  var lessThan = curry(function(x, y) {
    return x < y;
  });


  /*
   * <apifunction>
   *
   * lessThanEqual
   *
   * Category: maths
   *
   * Synonyms: lte
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the less than or equal (<=) operator.
   *
   * Examples:
   *   funkierJS.lessThanEqual(2, 2); // => true;
   *
   */

  var lessThanEqual = curry(function(x, y) {
    return x <= y;
  });


  /*
   * <apifunction>
   *
   * greaterThan
   *
   * Category: maths
   *
   * Synonyms: gt
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the less than or equal (<=) operator.
   *
   * Examples:
   *   funkierJS.greaterThan(5, 2); // => true;
   *
   */

  var greaterThan = curry(function(x, y) {
    return x > y;
  });


  /*
   * <apifunction>
   *
   * greaterThanEqual
   *
   * Category: maths
   *
   * Synonyms: gte
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: boolean
   *
   * A wrapper around the greater than or equal (=>) operator.
   *
   * Examples:
   *   funkierJS.greaterThanEqual(2, 2); // => true;
   *
   */

  var greaterThanEqual = curry(function(x, y) {
    return x >= y;
  });


  /*
   * <apifunction>
   *
   * leftShift
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the left shift (<<) operator.
   *
   * Examples:
   *   funkierJS.leftShift(1, 2); // => 4;
   *
   */

  var leftShift = curry(function(x, y) {
    return x << y;
  });


  /*
   * <apifunction>
   *
   * rightShift
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the right shift (>>) operator.
   *
   * Examples:
   *   funkierJS.rightShift(-4, 2); // => -1;
   *
   */

  var rightShift = curry(function(x, y) {
    return x >> y;
  });


  /*
   * <apifunction>
   *
   * rightShiftZero
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the left shift (>>>) operator.
   *
   * Examples:
   *   funkierJS.rightShiftZero(-4, 2); // => 1073741823;
   *
   */

  var rightShiftZero = curry(function(x, y) {
    return x >>> y;
  });


  /*
   * <apifunction>
   *
   * bitwiseAnd
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the bitwise and (&) operator.
   *
   * Examples:
   *   funkierJS.bitwiseAnd(7, 21); // => 5;
   *
   */

  var bitwiseAnd = curry(function(x, y) {
    return x & y;
  });


  /*
   * <apifunction>
   *
   * bitwiseOr
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the bitwise or (&) operator.
   *
   * Examples:
   *   funkierJS.bitwiseOr(7, 8); // => 15;
   *
   */

  var bitwiseOr = curry(function(x, y) {
    return x | y;
  });


  /*
   * <apifunction>
   *
   * bitwiseXor
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A wrapper around the bitwise xor (^) operator.
   *
   * Examples:
   *   funkierJS.bitwiseAnd(7, 3); // => 4;
   *
   */


  var bitwiseXor = curry(function(x, y) {
    return x ^ y;
  });


  /*
   * <apifunction>
   *
   * bitwiseNot
   *
   * Category: maths
   *
   * Parameter: x: number
   * Returns: number
   *
   * A wrapper around the bitwise not (~) operator.
   *
   * Examples:
   *   funkierJS.bitwiseNot(5); // => -6;
   *
   */

  var bitwiseNot = curry(function(x) {
    return ~x;
  });


  /*
   * <apifunction>
   *
   * min
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A curried wrapper around Math.min. Takes exactly two arguments.
   *
   * Examples:
   *   funkierJS.min(5, 2); // => 2;
   *
   */

  // min has a spec mandated length of 2, so we calling curry will do the right thing
  var min = curry(Math.min);


  /*
   * <apifunction>
   *
   * max
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: number
   *
   * A curried wrapper around Math.max. Takes exactly two arguments.
   *
   * Examples:
   *   funkierJS.min(5, 2); // => 5;
   *
   */

  // max has a spec mandated length of 2, so we can simply curry
  var max = curry(Math.max);


  /*
   * <apifunction>
   *
   * toFixed
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: string
   *
   * A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal point (which should
   * be between 0 and 20), and a number. Returns a string representing the number but with the specified number of
   * places after the decimal point.
   *
   * Examples:
   *   funkierJS.toFixed(2, 1); // => "1.00"
   *
   */

  var toFixed = callPropWithArity('toFixed', 1);


  /*
   * <apifunction>
   *
   * toExponential
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: string
   *
   * A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal point (which should
   * be between 0 and 20), and a number. Returns a string representing the number in exponential notation, with the
   * specified number of places after the decimal point.
   *
   * Examples:
   *   funkierJS.toExponential(3, 1); // => "1.000e+0"
   *
   */

  var toExponential = callPropWithArity('toExponential', 1);


  /*
   * <apifunction>
   *
   * toPrecision
   *
   * Category: maths
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: string
   *
   * A curried wrapper around Number.prototype.toPrecision. Takes the number of digits significant digits (which
   * should be between 1 and 21), and a number. Returns a string representing the number with the specified number
   * of significant digits.
   *
   * Examples:
   *   funkierJS.toPrecision(3, 1); // => "1.000"
   *
   */

  var toPrecision = callPropWithArity('toPrecision', 1);


  /*
   * <apifunction>
   *
   * toBaseAndString
   *
   * Category: maths
   *
   * Synonyms: toBaseAndRadix
   *
   * Parameter: x: number
   * Parameter: y: number
   * Returns: string
   *
   * A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number. Returns a string
   * representing the given number in the given base.
   * of significant digits.
   *
   * Examples:
   *   funkierJS.toBaseAndString(2, 5); // => "101"
   *
   */

  var toBaseAndString = callPropWithArity('toString', 1);


  /*
   * <apifunction>
   *
   * parseInt
   *
   * Category: maths
   *
   * Parameter: s: string
   * Returns: number
   *
   * A curried wrapper around parseInt when called with one argument. Takes a string and attempts to convert it
   * assuming it represents a number in base 10. Returns NaN if the string does not represent a valid number in base 10.
   *
   * Examples:
   *   funkierJS.parseInt(101); // => 101
   *
   */

  var stringToInt = flip(parseInt);


  /*
   * <apifunction>
   *
   * stringToInt
   *
   * Category: maths
   *
   * Synonyms: parseIntInBase
   *
   * Parameter: base: number
   * Parameter: s: string
   * Returns: number
   *
   * A curried wrapper around parseInt when called with two arguments. Takes a base between 2 and 36, and a string, and
   * attempts to convert the string assuming it represents a number in the given base. Returns NaN if the string does
   * not represent a valid number in the given base.
   *
   * Examples:
   *   funkierJS.stringToInt(16, "80"); // => 128
   *
   */

  // Deliberate name-mangling to avoid shadowing the global
  var parseint = curryWithArity(1, parseInt);


  /*
   * <apifunction>
   *
   * even
   *
   * Category: maths
   *
   * Parameter: x: number
   * Returns: boolean
   *
   * Given a number, returns true if it is divisible by 2, and false otherwise.
   *
   * Examples:
   *   funkierJS.even(2); // => true
   *   funkierJS.even(3); // => false
   *
   */


  var even = curry(function(n) {
    return n % 2 === 0;
  });


  /*
   * <apifunction>
   *
   * odd
   *
   * Category: maths
   *
   * Parameter: x: number
   * Returns: boolean
   *
   * Given a number, returns true if it is not divisible by 2, and false otherwise.
   *
   * Examples:
   *   funkierJS.odd(2); // => false
   *   funkierJS.odd(3); // => true
   *
   */

  var odd = curry(function(n) {
    return n % 2 !== 0;
  });


  return {
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
    gt: greaterThan,
    gte: greaterThanEqual,
    leftShift: leftShift,
    lessThan: lessThan,
    lessThanEqual: lessThanEqual,
    lt: lessThan,
    lte: lessThanEqual,
    log: log,
    min: min,
    max: max,
    multiply: multiply,
    odd: odd,
    parseInt: parseint,
    parseIntInBase: stringToInt,
    plus: add,
    pow: exp,
    rem: rem,
    rightShift: rightShift,
    rightShiftZero: rightShiftZero,
    stringToInt: stringToInt,
    subtract: subtract,
    toBaseAndRadix: toBaseAndString,
    toBaseAndString: toBaseAndString,
    toExponential: toExponential,
    toFixed: toFixed,
    toPrecision: toPrecision
  };
})();
