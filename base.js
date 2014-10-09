(function() {
  "use strict";

  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;
    var curryWithArity = curryModule.curryWithArity;
    var getRealArity = curryModule.getRealArity;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;

    var utils = require('./utils');
    var checkPositiveIntegral = utils.checkPositiveIntegral;
    var defineValue = utils.defineValue;


    var compose = defineValue(
      'name: compose',
      'signature: f: function, g: function',
      'classification: base',
      '',
      'Composes the two functions f and g, returning a new function that will return',
      'f(g(<arguments>)).',
      '',
      'The function f must have arity >= 1. A TypeError will be thrown when this is not',
      'the case.',
      '',
      'If any function has arity > 1, it will be curried, and partially applied when an',
      'argument is supplied to the composed function.',
      '--',
      'var f1 = function(a) {return a + 1;};',
      'var f2 = function(b) {return b * 2;};',
      'var f = compose(f1, f2); // f(x) = 2(x + 1)',
      curry(function(f, g) {
        var gLen = getRealArity(g);
        var fLen = getRealArity(f);

        f = checkFunction(f, {arity: 1, minimum: true, message: 'function f must have arity ≥ 1'});
        f = curry(f);
        g = curry(g);

        // If g has arity > 0, then we accept one argument for g, and f.length - 1 arguments for f
        // Otherwise, we accept fLen - 1 arguments.
        var curryTo = fLen - (gLen > 0 ? 0 : 1);

        return curryWithArity(curryTo, function() {
          var args = [].slice.call(arguments);

          var gArgs = gLen > 0 ? [args[0]] : [];
          var fArgs = gLen > 0 ? args.slice(1) : args;
          return f.apply(null, [g.apply(null, gArgs)].concat(fArgs));
        });
      })
    );


    var id = defineValue(
      'name: id',
      'signature: x: any',
      'classification: base',
      '',
      'Returns the value passed in. Superfluous arguments supplied will be discarded.',
      '',
      'Satisfies id(x) === x.',
      '--',
      'id(1); // 1',
      function(x) {
        return x;
      }
    );


    var constant = defineValue(
      'name: constant',
      'signature: x: any, y: any',
      'classification: base',
      '',
      'Takes a value x, and returns a function of one parameter that, when called,',
      'returns x regardless of input',
      '',
      'constant(x)(y) === x for all x, y',
      '--',
      'constant(2)(3); // 2',
      'constant(2, 3); // 2',
      curry(function(x, y) {
        return x;
      })
    );


    var constant0 = defineValue(
      'name: constant0',
      'signature: a: any',
      'classification: base',
      '',
      'Similar to constant, but returns a function of arity 0.',
      '',
      'constant0(x)() === x for all x',
      'Superfluous arguments supplied to the returned function will be discarded.',
      '--',
      'var f = constant0(42);',
      'f(); // 42',
      compose(curryWithArity(0), constant)
    );


    var flip = defineValue(
      'name: flip',
      'signature: f: function',
      'classification: base',
      '',
      'Takes a binary function f, and returns a curried function that flips the.',
      'arguments',
      '',
      'i.e. flip(f)(a, b) == f(b, a);',
      '',
      'Throws a TypeError if called with a function of arity > 2',
      '--',
      'var backwards = flip(subtract);',
      'backwards(2, 3); // 1',
      function(f) {
        f = checkFunction(f, {arity: 2, maximum: true, message: 'Value to be flipped must be a function of arity 2'});

        // XXX Should checkFunction curry automatically?
        if (getRealArity(f) < 2)
          return curry(f);

        return curry(function(a, b) {
          return f(b, a);
        });
      }
    );


    // XXX should we supply a vararg variant of composeMany?
    var composeMany = defineValue(
      'name: composeMany',
      'signature: fns: array',
      'classification: base',
      '',
      'Repeatedly composes the given array of functions, from right to left. All',
      'functions are curried where necessary.',
      '',
      'composeMany([f1, f2, f3]) behaves like f1(f2(f3(x)));',
      '',
      'Throws a TypeError if the given array is empty, if any entry is not a',
      'function, or if any entry other than the last has arity 0.',
      '--',
      'var square = function(x) {return x * x;};',
      'var double = function(x) {return 2 * x;};',
      'var plusOne = plus(1);',
      'var f = composeMany([square, double, plusOne]);',
      'f(2); // 36',
      function(fnArray) {
        // XXX Should throw if not array. Update help text too!
        if (fnArray.length === 0)
          throw new TypeError('composeMany called with empty array');

        if (fnArray.length === 1)
          return curry(fnArray[0]);

        // We don't use foldr to avoid creating a circular dependency',
        return fnArray.reduceRight(flip(compose));
      }
    );


    var sectionLeft = defineValue(
      'name: sectionLeft',
      'signature: f: function, x: any',
      'classification: base',
      '',
      'Partially applies the binary function f with the given argument x, with x being',
      'supplied as the first argument to f. The given function f will be curried if',
      'necessary.',
      '',
      'Throws a TypeError if f is not a binary function.',
      '--',
      'var f = function(x, y) {return x * y;};',
      'var g = sectionLeft(f, 2); // returns a function',
      'g(3); // 6 (i.e. 2 * 3)',
      curry(function(f, x) {
        f = checkFunction(f, {arity: 2, message: 'Value to be sectioned must be a function of arity 2'});
        f = curry(f);

        return f(x);
      })
    );


    var sectionRight = defineValue(
      'name: sectionRight',
      'signature: f: function, arg: any',
      'classification: base',
      '',
      'Partially applies the binary function f with the given argument x, with x being supplied as',
      'the second argument to f.',
      '',
      'Throws a TypeError if f is not a binary function.',
      '--',
      'var fn = sectionRight(subtract, 3);',
      'fn(2); // -1',
      curry(function(f, x) {
        f = checkFunction(f, {arity: 2, message: 'Value to be sectioned must be a function of arity 2'});

        return sectionLeft(flip(f), x);
      })
    );


    var equals = defineValue(
      'name: equals',
      'signature: a: any, b: any',
      'classification: base',
      '',
      'A wrapper around the non-strict equality (==) operator.',
      '--',
      'equals({}, {}); // false',
      curry(function(x, y) {
        return x == y;
      })
    );


    var strictEquals = defineValue(
      'name: strictEquals',
      'signature: a: any, b: any',
      'classification: base',
      '',
      'A wrapper around the strict equality (===) operator.',
      '--',
      'equals({}, {}); // true',
      curry(function(x, y) {
        return x === y;
      })
    );


    var notEqual = defineValue(
      'name: notEqual',
      'signature: a: any, b: any',
      'classification: base',
      '',
      'A wrapper around the not-equal (!=) operator.',
      '--',
      'notEqual({}, {}); // true',
      curry(function(x, y) {
        return x != y;
      })
    );


    var strictNotEqual = defineValue(
      'name: strictNotEqual',
      'signature: a: any, b: any',
      'classification: base',
      '',
      'A wrapper around the strict not-equal (!==) operator.',
      '--',
      'strictNotEqual({}, {}); // true',
      curry(function(x, y) {
        return x !== y;
      })
    );


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
      for (i = 0; ok && i < a.length; i++)
        ok = ok && deepEqualInternal(a[i], b[i], aStack, bStack);

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


    var deepEqual = defineValue(
      'name: deepEqual',
      'signature: a: any, b: any',
      'classification: base',
      '',
      'Check two values for deep equality. Deep equality holds if any of the following',
      'hold:',
      '- strictEquals(a, b) is true i.e. identity.',
      '- Both values are objects with the same prototype, same enumerable properties',
      '- and those properties are deepEqual. Non-enumerable properties are not checked.',
      '- Both values are arrays with the same length, and the items at each index are',
      '- themselves deepEqual.',
      '--',
      'deepEqual({foo: 1, bar: [2, 3]}, {bar: [2, 3], foo: 1}); // true',
      curry(function(a, b) {
        return deepEqualInternal(a, b, [], []);
      })
    );


    var is = defineValue(
      'name: is',
      'signature: type: string, value: any',
      'classification: base',
      '',
      'Takes a string that could be returned by the typeof operator, and a value.',
      'Returns true if the type of the given object equals the given string.',
      '',
      'Throws a TypeError if the first argument is not a string.',
      '--',
      'is(\'object\', {}); // true',
      curry(function(s, obj) {
        if (typeof(s) !== 'string')
          throw new TypeError('Type to be checked is not a string');

        return typeof(obj) === s;
      })
    );


    var isNumber = defineValue(
      'name: isNumber',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if typeof the given object returns \'number\'.',
      '--',
      'isNumber(10); // true',
      is('number')
    );


    var isString = defineValue(
      'name: isString',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if typeof the given object returns \'string\'.',
      '--',
      'isString(\'abc\'); // true',
      is('string')
    );


    var isBoolean = defineValue(
      'name: isBoolean',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if typeof the given object returns \'boolean\'.',
      '--',
      'isBoolean(true); // true',
      is('boolean')
    );


    var isUndefined = defineValue(
      'name: isUndefined',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if typeof the given object returns \'undefined\'.',
      '--',
      'isUndefined(undefined); // true',
      is('undefined')
    );


    var isObject = defineValue(
      'name: isObject',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if typeof the given object returns \'object\'.',
      '--',
      'isObject({}); // true',
      is('object')
    );


    var isArray = defineValue(
      'name: isArray',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if the given object is an array.',
      '--',
      'isArray([1, 2]); // true',
      function(obj) {
        return Array.isArray(obj);
      }
    );


    var isNull = defineValue(
      'name: isNull',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if the given object is the value null.',
      '--',
      'isNull(null); // true',
      function(obj) {
        return obj === null;
      }
    );


    var isRealObject = defineValue(
      'name: isRealObject',
      'signature: a: any',
      'classification: base',
      '',
      'Returns true if the given object is a \'real\' object, i.e. an object for which',
      'typeof(obj) === \'object\', and obj !== null and isArray(obj) === false',
      '--',
      'isRealObject({}); // true',
      function(obj) {
        return isObject(obj) && !(isArray(obj) || isNull(obj));
      }
    );


    var getType = defineValue(
      'name: getType',
      'signature: a: any',
      'classification: base',
      '',
      'A function wrapper around the typeof operator. Takes any Javascript value,',
      'and returns a string representing the object\'s type: one of \'number\', \'boolean\',',
      '\'string\', \'undefined\', \'function\' or \'object\'.',
      '--',
      'getType(function() {}); // function',
      curry(function(val) {
        return typeof(val);
      })
    );


    var exported = {
      compose: compose,
      composeMany: composeMany,
      constant: constant,
      constant0: constant0,
      deepEqual: deepEqual,
      equals: equals,
      flip: flip,
      getType: getType,
      id: id,
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
      sectionLeft: sectionLeft,
      sectionRight: sectionRight,
      strictEquals: strictEquals,
      strictNotEqual: strictNotEqual
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
