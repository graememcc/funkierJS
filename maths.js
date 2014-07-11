(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;

    var base = require('./base');
    var flip = base.flip;

    var object = require('./object');
    var callProp = object.callProp;
    var callPropWithArity = object.callPropWithArity;

    var utils = require('./utils');
    var defineValue = utils.defineValue;


    var add = defineValue(
      'name: add',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the addition operator.',
      '--',
      'add(2, 3); // 5',
      curry(function(x, y) {
        return x + y;
      })
    );


    var subtract = defineValue(
      'name: subtract',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the subtraction operator.',
      '--',
      'subtract(5, 2); // 3',
      curry(function(x, y) {
        return x - y;
      })
    );


    var multiply = defineValue(
      'name: multiply',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the multiplication operator.',
      '--',
      'multiply(5, 2); // 10',
      curry(function(x, y) {
        return x * y;
      })
    );


    var divide = defineValue(
      'name: divide',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the division operator.',
      '--',
      'divide(5, 2); // 2.5',
      curry(function(x, y) {
        return x / y;
      })
    );


    var exp = defineValue(
      'name: exp',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A curried wrapper around Math.pow.',
      '--',
      'exp(5, 2); // 25',
      curry(function(x, y) {
        return Math.pow(x, y);
      })
    );


    var log = defineValue(
      'name: log',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'Returns the logarithm of y in the given base x.',
      '',
      'Note: this uses the change of base formula, so may be subject to rounding errors caused by',
      'the vagaries of Javascript division.',
      '--',
      'log(2, 8); // 3',
      curry(function(x, y) {
        return Math.log(y) / Math.log(x);
      })
    );


    var div = defineValue(
      'name: div',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'Returns the quotient on dividing x by y.',
      '--',
      'div(5, 2); // 2',
      curry(function(x, y) {
        return Math.floor(x / y);
      })
    );


    var rem = defineValue(
      'name: rem',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the remainder (%) operator.',
      '--',
      'rem(5, 2); // 1',
      curry(function(x, y) {
        return x % y;
      })
    );


    var lessThan = defineValue(
      'name: lessThan',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the less than (<) operator.',
      '--',
      'lessThan(5, 2); // false',
      'lessThan(2, 2); // false',
      'lessThan(2, 3); // true',
      curry(function(x, y) {
        return x < y;
      })
    );


    var lessThanEqual = defineValue(
      'name: lessThanEqual',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the less than or equal (<=)  operator.',
      '--',
      'lessThanEqual(5, 2); // false',
      'lessThanEqual(2, 2); // true',
      'lessThanEqual(2, 3); // true',
      curry(function(x, y) {
        return x <= y;
      })
    );


    /*
     * greaterThan: a wrapper around the greater than (>) operator
     *
     */

    var greaterThan = defineValue(
      'name: greaterThan',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the greater than (>) operator.',
      '--',
      'greaterThan(5, 2); // true',
      'greaterThan(2, 2); // false',
      'greaterThan(2, 3); // false',
      curry(function(x, y) {
        return x > y;
      })
    );


    var greaterThanEqual = defineValue(
      'name: greaterThanEqual',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the greater than or equal (>=) operator.',
      '--',
      'greaterThanEqual(5, 2); // true',
      'greaterThanEqual(2, 2); // true',
      'greaterThanEqual(2, 3); // false',
      curry(function(x, y) {
        return x >= y;
      })
    );


    var leftShift = defineValue(
      'name: leftShift',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the left shift (<<) operator.',
      '--',
      'leftShift(1, 2); // 4',
      curry(function(x, y) {
        return x << y;
      })
    );


    var rightShift = defineValue(
      'name: rightShift',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the right shift (>>) operator.',
      '--',
      'rightShift(-4, 2); // -1',
      curry(function(x, y) {
        return x >> y;
      })
    );


    var rightShiftZero = defineValue(
      'name: rightShiftZero',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the right shift zero fill (>>>) operator.',
      '--',
      'rightShiftZero(-4, 2); // 1073741823',
      curry(function(x, y) {
        return x >>> y;
      })
    );


    var bitwiseAnd = defineValue(
      'name: bitwiseAnd',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the bitwise and (&) operator.',
      '--',
      'bitwiseAnd(2, 5); // 0',
      'bitwiseAnd(7, 21); // 5',
      curry(function(x, y) {
        return x & y;
      })
    );


    var bitwiseOr = defineValue(
      'name: bitwiseOr',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the bitwise or (|) operator.',
      '--',
      'bitwiseOr(2, 5); // 5',
      'bitwiseOr(7, 8); // 15',
      curry(function(x, y) {
        return x | y;
      })
    );


    var bitwiseXor = defineValue(
      'name: bitwiseXor',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A wrapper around the bitwise xor (^) operator.',
      '--',
      'bitwiseXor(2, 5); // 5',
      'bitwiseXor(7, 8); // 15',
      curry(function(x, y) {
        return x ^ y;
      })
    );


    var bitwiseNot = defineValue(
      'name: bitwiseNot',
      'signature: x: number',
      'classification: maths',
      '',
      'A wrapper around the bitwise not (~) operator.',
      '--',
      'bitwiseNot(5); // -6',
      curry(function(x) {
        return ~x;
      })
    );


    // XXX Do we want a notion of Orderable like Haskell, and so have
    // min and max accept non-numeric types?

    // min has a spec mandated length of 2, so we can simply curry
    var min = defineValue(
      'name: min',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A curried wrapper around Math.min. Takes exactly two arguments.',
      '--',
      'min(5, 2); // 2',
      curry(Math.min)
    );


    // max has a spec mandated length of 2, so we can simply curry
    var max = defineValue(
      'name: max',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A curried wrapper around Math.max. Takes exactly two arguments.',
      '--',
      'max(5, 2); // 5',
      curry(Math.max)
    );


    var toFixed = defineValue(
      'name: toFixed',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A curried wrapper around Number.prototype.toFixed. Takes the number of digits after the decimal',
      'point (which should be between 0 and 20), and a number. Returns a string representing the number',
      'but with the specified number of places after the decimal point.',
      '--',
      'toFixed(2, 1); // "1.00"',
      callPropWithArity('toFixed', 1)
    );


    var toExponential = defineValue(
      'name: toExponential',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A curried wrapper around Number.prototype.toExponential. Takes the number of digits after the decimal',
      'point (which should be between 0 and 20), and a number. Returns a string representing the number',
      'in exponential notation, with the specified number of places after the decimal point.',
      '--',
      'toExponential(3, 1); // "1.000e+0"',
      callPropWithArity('toExponential', 1)
    );


    var toPrecision = defineValue(
      'name: toPrecision',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A curried wrapper around Number.prototype.toPrecision. Takes the number of significant digits (which should',
      'be between 1 and 21), and a number. Returns a string representing the number, with the specified number of',
      'significant digits.',
      '--',
      'toPrecision(3, 1); // "1.000"',
      callPropWithArity('toPrecision', 1)
    );


    var toBaseAndString = defineValue(
      'name: toBaseAndString',
      'signature: x: number, y: number',
      'classification: maths',
      '',
      'A curried wrapper around Number.prototype.toString. Takes a base between 2 and 36, and a number.',
      'Returns a string representing the given number in the given base.',
      '--',
      'toBaseAndString(2, 5); // "101"',
      callPropWithArity('toString', 1)
    );


    var stringToInt = defineValue(
      'name: stringToInt',
      'signature: n: number, s: string',
      'classification: maths',
      '',
      'A curried wrapper around parseInt. Takes a base between 2 and 36, and a string, and attempts to convert',
      'the string assuming it represents a number in the given base. Returns NaN if the string does not',
      'represent a valid number given the base.',
      '--',
      'stringToInt(16, "80"); // 128',
      flip(parseInt)
    );


    var even = defineValue(
      'name: even',
      'signature: x: number',
      'classification: maths',
      '',
      'Takes a number, and returns true if it is divisible by 2, and false otherwise.',
      '--',
      'even(2); // true',
      'even(3); // false',
      curry(function(n) {
        return n % 2 === 0;
      })
    );


    var odd = defineValue(
      'name: odd',
      'signature: x: number',
      'classification: maths',
      'Takes a number, and returns true if it is not divisible by 2, and false otherwise.',
      '--',
      'odd(2); // false',
      'odd(3); // true',
      curry(function(n) {
        return n % 2 !== 0;
      })
    );


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
