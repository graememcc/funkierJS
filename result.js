(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;
    var curryWithArity = curryModule.curryWithArity;
    var getRealArity = curryModule.getRealArity;

    var utils = require('./utils');
    var valueStringifier = utils.valueStringifier;
    var checkArrayLike = utils.checkArrayLike;
    var defineValue = utils.defineValue;

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;


    /*
     * Result encapsulates the idea of functions throwing errors. It can be considered equivalent
     * to the Either datatype from Haskell, or the Result type from Rust.
     */

    var Result = defineValue(
      'name: Result',
      'classification: datatypes',
      '',
      'The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent',
      'to the Either datatype from Haskell, or the Result type from Rust.',
      '',
      'Result is the \'base class\' of [[Ok]] and [[Err]]. It is provided only for the instanceof operator.',
      '',
      'Throws an Error when called directly.',
      function() {
        throw new Error('Result cannot be instantiated directly');
      }
    );

    Result.prototype = {toString: function() {return 'Result';}};


    var Ok = defineValue(
      'name: Ok',
      'classification: datatypes',
      'signature: val: any',
      '',
      'An Ok is a type of [[Result]] representing a successful computation. The constructor is new-agnostic.',
      '',
      'Throws a TypeError when called with no arguments.',
      '',
      '--',
      'var result = Ok(42);',
      function(val) {
        if (arguments.length !== 1)
          throw new TypeError('Ok called with incorrect number of arguments');

        if (!(this instanceof Ok))
          return new Ok(val);

        Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
      }
    );


    Ok.prototype = Object.create(Result.prototype);
    Ok.prototype.toString = function() {
      return 'Result {Ok ' + valueStringifier(this.value) + '}';
    };


    var Err = defineValue(
      'name: Err',
      'classification: datatypes',
      'signature: val: any',
      '',
      'An Err represents the error from an unsuccessful computation. The constructor is new-agnostic.',
      '',
      'Throws a TypeError when called with no arguments.',
      '',
      '--',
      'var result = Err(false);',
      function(val) {
        if (arguments.length !== 1)
          throw new TypeError('Err called with incorrect number of arguments');

        if (!(this instanceof Err))
          return new Err(val);

        Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
      }
    );


    Err.prototype = Object.create(Result.prototype);
    Err.prototype.toString = function() {
      return 'Result {Err ' + valueStringifier(this.value) + '}';
    };


    var isResult = defineValue(
      'name: isResult',
      'classification: datatypes',
      'signature: val: any',
      '',
      'Returns true when the given object is a [[Result]] object. Returns false otherwise.',
      '',
      '--',
      'isResult(Ok(3)) && isResult(Err(false)); // true',
      function(val) {
        return val === Result || val instanceof Result;
      }
    );


    var isErr = defineValue(
      'name: isErr',
      'classification: datatypes',
      'signature: val: any',
      '',
      'Returns true when the given object is an [[Err]] object. Returns false otherwise.',
      '',
      '--',
      'isErr(Err(4)); // true',
      function(val) {
        return val instanceof Err;
      }
    );


    var isOk = defineValue(
      'name: isOk',
      'classification: datatypes',
      'signature: val: any',
      '',
      'Returns true when the given object is an [[Ok]] object. Returns false otherwise.',
      '',
      '--',
      'isOk(Ok({})); // true',
       function(val) {
        return val instanceof Ok;
      }
    );


    var getOkValue = defineValue(
      'name: isOk',
      'classification: datatypes',
      'signature: val: [[Ok]]',
      '',
      'Returns the value wrapped by the given [[Ok]] instance.',
      '',
      'Throws a TypeError when called with a value that is not an [[Ok]].',
      '',
      '--',
      'var a = getOkValue(Ok(7)); // a === 7',
      function(val) {
        if (!isOk(val))
          throw new TypeError('Value is not an Ok');

        return val.value;
      }
    );


    var getErrValue = defineValue(
      'name: isErr',
      'classification: datatypes',
      'signature: val: [[Err]]',
      '',
      'Returns the value wrapped by the given [[Err]] instance.',
      '',
      'Throws a TypeError when called with a value that is not an [[Err]].',
      '',
      '--',
      'var a = getErrValue(Ok(7)); // a === 7',
      function(val) {
        if (!isErr(val))
          throw new TypeError('Value is not an Err');

        return val.value;
      }
    );


    var makeResultReturner = defineValue(
      'name: makeResultReturner',
      'classification: datatypes',
      'signature: sentinels: array/arraylike, f: function',
      '',
      'Takes an array of sentinel values, and a function f. Returns a new function with the same arity as f.',
      'When called, the new function calls the original function and examines the result. If the result is contained',
      'in the array of sentinel values—checked for strict identity—then the result is wrapped in an [[Err]] and returned.',
      'Otherwise, the result is wrapped in a [[Ok]] and returned.',
      '',
      'Throws a TypeError if the first argument is not an array or arraylike, or if the second argument is not a function.',
      '',
      '--',
      'var sentinels = [-1];',
      'var newIndexOf = makeResultReturner(sentinels, indexOf);',
      'newIndexOf(\'a\', \'banana\'); // Ok(1)',
      'newIndexOf(\'a\', \'funkier\'); // Err(-1)',
      curry(function(sentinels, f) {
        sentinels = checkArrayLike(sentinels, {noStrings: true,
                                               message: 'Sentinels must be an array'});
        f = checkFunction(f, {message: 'Value to be transformed must be a function'});

        return curryWithArity(getRealArity(f), function() {
          var args = [].slice.call(arguments);
          var result = f.apply(this, arguments);

          if (sentinels.indexOf(result) !== -1)
            return Err(result);

          return Ok(result);
        });
      })
    );


    var makePredResultReturner = defineValue(
      'name: makePredResultReturner',
      'classification: datatypes',
      'signature: p: function, f: function',
      '',
      'Takes a predicate function p, and a function f. Returns a new function with the same arity as f. When called,',
      'the new function calls the original function and the given predicate function is called with the result.',
      'If p returns false, then the result is wrapped in an [[Err]] and returned, otherwise it is wrapped in an',
      '[[Ok]] and returned.',
      '',
      'Throws a TypeError if p is not a function of arity 1, or if f is not a function.',
      '--',
      'var predicate = function(x) {return x !== -1;};',
      'var newIndexOf = makePredResultReturner(predicate, indexOf);',
      'newIndexOf(\'a\', \'funkier\'); // Err(-1)',
      curry(function(p, f) {
        p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
        f = checkFunction(f, {message: 'Value to be transformed must be a function'});

        return curryWithArity(getRealArity(f), function() {
          var args = [].slice.call(arguments);
          var result = f.apply(this, arguments);

          if (!p(result))
            return Err(result);

          return Ok(result);
        });
      })
    );


    var makeThrowResultReturner = defineValue(
      'name: makeThrowResultReturner',
      'classification: datatypes',
      'signature: f: function',
      '',
      'Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the',
      'original function. If the function f throws during execution, then the exception is wrapped in an [[Err]] and',
      'returned. Otherwise, the result of the funciton is wrapped in an [[Ok]] and returned.',
      '',
      'Throws a TypeError if f is not a function.',
      '',
      '--',
      'var g = function(x) {',
      '  if (x < 10)',
      '    throw new Error(\'Bad value\');',
      '  return x;',
      '};',
      '',
      'var f = makeThrowResultReturner(g);',
      'f(11); // returns Ok(11);',
      'f(5); // returns Err([object Error]);',
      curry(function(f) {
        f = checkFunction(f, {message: 'Value to be transformed must be a function'});

        return curryWithArity(getRealArity(f), function() {
          var args = [].slice.call(arguments);

          try {
            var result = f.apply(this, arguments);
            return Ok(result);
          } catch (e) {
            return Err(e);
          }
        });
      })
    );


    var either = defineValue(
      'name: either',
      'classification: datatypes',
      'signature: okFn: function, errFn: function, result: [[Result]]',
      '',
      'Takes two functions of arity 1 or greater, and a [[Result]]. If the [[Result]] is an [[Ok]] value,',
      'the first function will be called with the unwrapped value. Otherwise, if the [[Result]] is an',
      '[[Err]] value, the second function is called with the unwrapped value. In either case, the result of',
      'of the called function is returned.',
      '',
      'Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if',
      'the given value is not a [[Result]]',
      '',
      '--',
      'var f = either(function(x) {console.log(\'Good: \' + x);}, function(x) {console.log(\'Bad: \' + x);});',
      'f(Ok(2)); // logs \'Good: 2\' to the console',
      'f(Err(\':(\')); // logs \'Bad: :(\' to the console',
      curry(function(okFn, errFn, result) {
        okFn = checkFunction(okFn, {arity: 1, minimum: true, message: 'Ok value must be a function of arity 1 or more'});
        errFn = checkFunction(errFn, {arity: 1, minimum: true, message: 'Err value must be a function of arity 1 or more'});

        if (isOk(result))
          return okFn(getOkValue(result));

        if (isErr(result))
          return errFn(getErrValue(result));

        throw new TypeError('Invalid value');
      })
    );


    var exported = {
      either: either,
      getErrValue: getErrValue,
      getOkValue: getOkValue,
      isErr: isErr,
      isOk: isOk,
      isResult: isResult,
      makeResultReturner: makeResultReturner,
      makePredResultReturner: makePredResultReturner,
      makeThrowResultReturner: makeThrowResultReturner,
      Err: Err,
      Ok: Ok,
      Result: Result
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
