module.exports = (function() {
  "use strict";

//  var makeModule = function(require, exports) {
//    var curryModule = require('./curry');
  var curry = require('./curry').curry;
//    var curryWithArity = curryModule.curryWithArity;
//    var getRealArity = curryModule.getRealArity;
//
//    var funcUtils = require('./funcUtils');
//    var checkFunction = funcUtils.checkFunction;
//
//    var utils = require('./utils');
//    var checkPositiveIntegral = utils.checkPositiveIntegral;
//    var defineValue = utils.defineValue;



  /*
   * <apifunction>
   *
   * equals
   *
   * Category: types
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the non-strict equality (==) operator.
   *
   * Examples:
   *   funkierJS.equals(1, '1'); // => true
   *
   */

  var equals = curry(function(x, y) {
    return x == y;
  });



  /*
   * <apifunction>
   *
   * strictEquals
   *
   * Category: types
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the strict equality (===) operator.
   *
   * Examples:
   *   funkierJS.strictEquals(1, '1'); // => false
   *
   */

  var strictEquals = curry(function(x, y) {
    return x === y;
  });


  /*
   * <apifunction>
   *
   * notEqual
   *
   * Category: types
   *
   * Synonyms: notEquals
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the inequality (!=) operator.
   *
   * Examples:
   *   funkierJS.notEqual({}, {}); // => true
   *
   */

  var notEqual = curry(function(x, y) {
    return x != y;
  });


  /*
   * <apifunction>
   *
   * strictNotEqual
   *
   * Category: types
   *
   * Synonyms: strictNotEquals | strictInequality
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * A wrapper around the strict inequality (!==) operator.
   *
   * Examples:
   *   funkierJS.strictNotEqual(1, '1'); // => true
   *
   */

  var strictNotEqual = curry(function(x, y) {
    return x !== y;
  });


  // Helper function for deepEqual. Assumes both objects are arrays.
  var deepEqualArr = function(a, b, aStack, bStack) {
    if (a.length !== b.length)
      return false;

    for (var i = aStack.length - 1; i >= 0; i--) {
      if (aStack[i] === a)
        return bStack[i] === b || bStack[i] === a;
      if (bStack[i] === b)
        return false;
    }

    aStack.push(a);
    bStack.push(b);
    var ok = true;
      ok = ok && deepEqualInternal(a[i], b[i], aStack, bStack);

    // Can't just iterate over the indices: the array might have custom keys
    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
      ok = false;
    } else {
      aKeys.sort();
      bKeys.sort();

      ok = aKeys.every(function(k, i) {
        if (k !== bKeys[i])
          return false;
        return deepEqualInternal(a[k], b[k], aStack, bStack);
      });
    }

    aStack.pop();
    bStack.pop();
    return ok;
  };


  // Helper function for deepEqual. Assumes identity has already been checked, and
  // that a check has been made for both objects being arrays.
  var deepEqualObj = function(a, b, aStack, bStack) {
    // Identity should have already been checked (ie a ==== b === null)
    if (a === null || b === null)
      return false;

    // Likewise, we should already have checked for arrays
    if (Array.isArray(a) || Array.isArray(b))
      return false;

    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b))
      return false;

    // Check for recursive objects
    for (var i = aStack.length - 1; i >= 0; i--) {
      if (aStack[i] === a)
        return bStack[i] === b || bStack[i] === a;
      if (bStack[i] === b)
        return false;
    }

    var aKeys = Object.keys(a);
    var bKeys = Object.keys(b);
    aKeys.sort();
    bKeys.sort();

    if (!deepEqualArr(aKeys, bKeys, aStack, bStack))
      return false;

    aStack.push(a);
    bStack.push(b);
    var ok = true;
    for (i = 0; ok && i < aKeys.length; i++)
      ok = ok && deepEqualInternal(a[aKeys[i]], b[bKeys[i]], aStack, bStack);

    aStack.pop();
    bStack.pop();
    return ok;
  };


  var deepEqualInternal = function(a, b, aStack, bStack) {
    if (strictEquals(a, b))
      return true;

    if (typeof(a) !== typeof(b))
       return false;

    if (typeof(a) !== 'object')
      return false;

    if (Array.isArray(a) && Array.isArray(b))
      return deepEqualArr(a, b, aStack, bStack);

    return deepEqualObj(a, b, aStack, bStack);
  };


  /*
   * <apifunction>
   *
   * deepEqual
   *
   * Category: types
   *
   * Synonyms: deepEquals
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: boolean
   *
   * Check two values for deep equality. Deep equality holds if any of the following if the two values are the same
   * object, if both values are objects with the same object, the same prototype, the same enumerable properties
   * and those properties are themselves deeply equal (non-enumerable properties are not checked), or if both values
   * are arrays with the same length, any additional properties installed on the arrays are deeply equal, and the items
   * at each index are themselves deeply equal.
   *
   * Examples:
   *   funkierJS.deepEqual({foo: 1, bar: [2, 3]}, {bar: [2, 3], foo: 1}); // => true
   *
   */

  var deepEqual = curry(function(a, b) {
    return deepEqualInternal(a, b, [], []);
  });


  /*
   * <apifunction>
   *
   * is
   *
   * Category: types
   *
   * Synonyms: hasType
   *
   * Parameter: type: string
   * Parameter: value: any
   * Returns: boolean
   *
   * Given a string that could be returned by the `typeof` operator, and a value, returns true if typeof the given
   * object equals the given string. Throws if the first argument is not a string.
   *
   * Examples:
   *   funkierJS.is('number', 1); // => true
   *
   */

  var is = curry(function(s, obj) {
    if (typeof(s) !== 'string')
      throw new TypeError('Type to be checked is not a string');

    return typeof(obj) === s;
  });


  /*
   * <apifunction>
   *
   * isNumber
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "number", false otherwise.
   *
   * Examples:
   *   funkierJS.isNumber(1); // => true
   *
   */

  var isNumber = is('number');


  /*
   * <apifunction>
   *
   * isString
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "string", false otherwise.
   *
   * Examples:
   *   funkierJS.isString('a'); // => true
   *
   */

  var isString = is('string');


  /*
   * <apifunction>
   *
   * isBoolean
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "boolean", false otherwise.
   *
   * Examples:
   *   funkierJS.isBoolean(false); // => true
   *
   */

  var isBoolean = is('boolean');


  /*
   * <apifunction>
   *
   * isUndefined
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "undefined", false otherwise.
   *
   * Examples:
   *   funkierJS.isUndefined(1); // => false
   *
   */

  var isUndefined = is('undefined');


  /*
   * <apifunction>
   *
   * isObject
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if typeof the given value equals "object", false otherwise.
   *
   * Examples:
   *   funkierJS.isObject(null); // => true
   *
   */

  var isObject = is('object');


  /*
   * <apifunction>
   *
   * isArray
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is an array, false otherwise
   *
   * Examples:
   *   funkierJS.isArray([]); // => true
   *
   */

  var isArray = curry(function(obj) {
    return Array.isArray(obj);
  });


  /*
   * <apifunction>
   *
   * isNull
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given object is null, false otherwise
   *
   * Examples:
   *   funkierJS.isNull(null); // => true
   *
   */

  var isNull = curry(function(obj) {
    return obj === null;
  });


  /*
   * <apifunction>
   *
   * isRealObject
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the value is a *real* Javascript object, i.e. an object for which `funkierJS.isObject(a) === true`
   * and `funkierJS.isNull(a) === false` and `funkierJS.isArray(a) === false`.
   *
   * Examples:
   *   funkierJS.isRealObject(null); // => false
   *
   */

  var isRealObject = curry(function(obj) {
    return isObject(obj) && !(isArray(obj) || isNull(obj));
  });


  /*
   * <apifunction>
   *
   * getType
   *
   * Category: types
   *
   * Parameter: a: any
   * Returns: string
   *
   * A functional wrapper around the typeof operator. Takes any Javascript value, and returns a string representing
   * the object"s type: the result will be one of "number", "string", "boolean", "function", "undefined", or "object".
   *
   * Examples:
   *   funkierJS.getType({}); // => "object"
   *
   */

  var getType = curry(function(val) {
    return typeof(val);
  });


  return {
    deepEqual: deepEqual,
    deepEquals: deepEqual,
    equals: equals,
    getType: getType,
    hasType: is,
    is: is,
    isArray: isArray,
    isBoolean: isBoolean,
    isNumber: isNumber,
    isNull: isNull,
    isObject: isObject,
    isRealObject: isRealObject,
    isString: isString,
    isUndefined: isUndefined,
    notEqual: notEqual,
    notEquals: notEqual,
    strictEquals: strictEquals,
    strictInequality: strictNotEqual,
    strictNotEqual: strictNotEqual,
    strictNotEquals: strictNotEqual
  };
})();
