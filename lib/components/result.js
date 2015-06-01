module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var arityOf = curryModule.arityOf;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;

  var internalUtilities = require('../internalUtilities');
  var valueStringifier = internalUtilities.valueStringifier;
  var checkArrayLike = internalUtilities.checkArrayLike;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;


  /*
   * Result encapsulates the idea of functions throwing errors. It can be considered equivalent
   * to the Either datatype from Haskell, or the Result type from Rust.
   */


  /*
   * <apifunction>
   *
   * Result
   *
   * Category: DataTypes
   *
   * The Result type encapsulates the idea of functions throwing errors. It can be considered equivalent to the Either
   * datatype from Haskell, or the Result type from Rust.
   *
   * Result is the 'base class' of [`Ok`](#Ok) and [`Err`](#Err). It is provided only for the instanceof operator.
   *
   * It is an error to call Result.
   *
   */

  var Result = function() {
    throw new Error('Result cannot be instantiated directly');
  };
  Result.prototype = {toString: function() {return 'Result';}, constructor: Result};


  /*
   * <apifunction>
   *
   * Ok
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: Ok
   *
   * An Ok is a type of Result representing a successful computation. The constructor is new-agnostic.
   * Throws when called with no arguments.
   *
   * Examples:
   *   var result = funkierJS.Ok(42);
   *
   */

  var Ok = function(val) {
    if (arguments.length !== 1)
      throw new TypeError('Ok called with incorrect number of arguments');

    if (!(this instanceof Ok))
      return new Ok(val);

    Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
  };


  Ok.prototype = Object.create(Result.prototype);
  Ok.prototype.toString = function() {
    return 'Result {Ok ' + valueStringifier(this.value) + '}';
  };


  /*
   * <apifunction>
   *
   * Err
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: Just
   *
   * An Err is a type of Result representing a unsuccessful computation. The constructor is new-agnostic.
   * Throws if called without any arguments
   *
   * Examples:
   *   var result = funkierJS.Err(new TypeError('boom');
   *
   */


  var Err = function(val) {
    if (arguments.length !== 1)
      throw new TypeError('Err called with incorrect number of arguments');

    if (!(this instanceof Err))
      return new Err(val);

    Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
  };


  Err.prototype = Object.create(Result.prototype);
  Err.prototype.toString = function() {
    return 'Result {Err ' + valueStringifier(this.value) + '}';
  };


  /*
   * <apifunction>
   *
   * isResult
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a Result object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isResult(funkierJS.Ok(3)) && funkierJS.isResult(funkierJS.Err(false)); // => true
   *
   */

  var isResult = curry(function(val) {
    return val === Result || val instanceof Result;
  });


  /*
   * <apifunction>
   *
   * isErr
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a Err object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isErr(funkierJS.Err(4)); // => true
   *
   */

  var isErr = curry(function(val) {
    return val instanceof Err;
  });


  /*
   * <apifunction>
   *
   * isOk
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a Ok object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isOk(funkierJS.Ok('foo)); // => true
   *
   */

  var isOk = curry(function(val) {
    return val instanceof Ok;
  });


  /*
   * <apifunction>
   *
   * getOkValue
   *
   * Category: DataTypes
   *
   * Parameter: o: Ok
   * Returns: any
   *
   * Returns the value wrapped by the given Ok instance o. Throws a TypeError if called with anything other than an
   * Ok.
   *
   * Examples:
   *   funkierJS.getOkValue(funkierJS.Ok(3)); // => 3',
   *
   */

  var getOkValue = curry(function(val) {
    if (!isOk(val))
      throw new TypeError('Value is not an Ok');

    return val.value;
  });


  /*
   * <apifunction>
   *
   * getErrValue
   *
   * Category: DataTypes
   *
   * Parameter: e: Err
   * Returns: any
   *
   * Returns the value wrapped by the given Err instance e. Throws a TypeError if called with anything other than an
   * Err.
   *
   * Examples:
   *   funkierJS.getErrValue(funkierJS.Err(4)); // => 4',
   *
   */

  var getErrValue = curry(function(val) {
    if (!isErr(val))
      throw new TypeError('Value is not an Err');

    return val.value;
  });


  /*
   * <apifunction>
   *
   * makeResultReturner
   *
   * Category: DataTypes
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
   * original. If the function f throws during execution, then the exception will be caught, and an Err object
   * wrapping the exception is returned. Otherwise the result of the function is wrapped in an Ok and returned.
   *
   * The function will be curried in the same style as the original, or using [`curry`](#curry) if the function was not
   * curried.
   *
   * Examples:
   *   var g = function(x) {
   *     if (x < 10)
   *       throw new Error('Bad value');
   *     return x;
   *   };
   *
   *   var f = funkierJS.makeResultReturner(g);
   *   f(11); // => Ok(11)
   *   f(5); // => Err(Error('Bad value');
   *
   */

  var makeResultReturner = curry(function(f) {
    f = checkFunction(f, {message: 'Value to be transformed must be a function'});

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);

      try {
        var result = f.apply(this, arguments);
        return Ok(result);
      } catch (e) {
        return Err(e);
      }
    }, arityOf(f));
  });


  /*
   * <apifunction>
   *
   * either
   *
   * Category: DataTypes
   *
   * Parameter: f1: function
   * Parameter: f2: function
   * Parameter: r: Result
   * Returns: function
   *
   * Takes two functions of arity 1 or greater, and a Result. If the Result is an Ok value, the first function f1 will
   * be called with the unwrapped value.  Otherwise, if the Result is an Err value, the second function is called
   * with the unwrapped value. In either case, the result of of the called function is returned.
   *
   * Throws a TypeError if either of the first two arguments is not a function of arity 1 or more, or if the given value
   * is not a Result.
   *
   * Examples:
   * var f = funkierJS.either(function(x) {console.log('Good: ' + x);}, function(x) {console.log('Bad: ' + x);});
   * f(funkierJS.Ok(2)); // => logs 'Good: 2' to the console
   * f(funkierJS.Err(':(')); // logs 'Bad: :(' to the console
   *
   */

  var either = curry(function(okFn, errFn, result) {
    okFn = checkFunction(okFn, {arity: 1, minimum: true, message: 'Ok value must be a function of arity 1 or more'});
    errFn = checkFunction(errFn, {arity: 1, minimum: true, message: 'Err value must be a function of arity 1 or more'});

    if (isOk(result))
      return okFn(getOkValue(result));

    if (isErr(result))
      return errFn(getErrValue(result));

    throw new TypeError('Invalid value');
  });


  return {
    either: either,
    getErrValue: getErrValue,
    getOkValue: getOkValue,
    isErr: isErr,
    isOk: isOk,
    isResult: isResult,
    makeResultReturner: makeResultReturner,
    Err: Err,
    Ok: Ok,
    Result: Result
  };
})();
