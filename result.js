(function() {
  "use strict";


  var makeModule = function(require, exports) {

    var base = require('./base');
    var utils = require('./utils');
    var curry = base.curry;
    var curryWithArity = base.curryWithArity;
    var getRealArity = base.getRealArity;
    var valueStringifier = utils.valueStringifier;


    /*
     * Result encapsulates the idea of functions throwing errors. It can be considered equivalent
     * to the Either datatype from Haskell, or the Result type from Rust.
     */

    /*
     * Result is the 'base class' of Ok and Err. It is provided for the instanceof operator
     *
     */

    var Result = function() {
      throw new Error('Result cannot be instantiated directly');
    };

    Result.prototype = {toString: function() {return 'Result';}};


    /*
     * An Ok represents a successful computation. The constructor is new-agnostic, but
     * throws if called with no arguments.
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
     * An Err represents the error from an successful computation. The constructor is new-agnostic, but
     * throws if called with no arguments.
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
     * isResult: returns true when the given object is a Result object. Returns false otherwise.
     *
     */

    var isResult = function(obj) {
      return obj === Result || obj instanceof Result;
    };


    /*
     * isErr: returns true when the given object is the Err object. Returns false otherwise.
     *
     */

    var isErr = function(obj) {
      return obj instanceof Err;
    };


    /*
     * isOk: returns true when the given object is a Ok object. Returns false otherwise.
     *
     */

    var isOk = function(obj) {
      return obj instanceof Ok;
    };


    /*
     * getOkValue: returns the value wrapped by the given Ok instance. Throws if not called
     *             with a Ok.
     *
     */

    var getOkValue = function(o) {
      if (!isOk(o))
        throw new TypeError('Value is not an Ok');

      return o.value;
    };


    /*
     * getErrValue: returns the value wrapped by the given Err instance. Throws if not called
     *              with a Err.
     *
     */

    var getErrValue = function(e) {
      if (!isErr(e))
        throw new TypeError('Value is not an Err');

      return e.value;
    };


    /*
     * makeResultReturner: Takes an array of sentinel values, and a function f. Returns a function
     *                     with the same arity as f. The returned function calls the original function
     *                     and examines the result. If the result is in the array of sentinel values—
     *                     checked for strict identity—then the value is wrapped in an Err and returned.
     *                     Otherwise, the result is wrapped in a Ok and returned. Throws if the first
     *                     argument is not an array, or if the second argument is not a function.
     *
     */

    var makeResultReturner = curry(function(sentinels, f) {
      if (!Array.isArray(sentinels) || typeof(f) !== 'function')
        throw new TypeError('makeResultReturner called with invalid arguments');

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        var result = f.apply(null, arguments);

        if (sentinels.indexOf(result) !== -1)
          return Err(result);

        return Ok(result);
      });
    });


    /*
     * makePredResultReturner: Takes a predicate function p, and a function f. Returns a function
     *                         with the same arity as f. The returned function calls the original function
     *                         and examines the result. The predicate function p is called with the result.
     *                         If p returns false, then the result is wrapped in an Err and returned, otherwise
     *                         it is wrapped in a Ok and returned. Throws if p is not a function of arity 1,
     *                         or if f is not a function.
     *
     */

    var makePredResultReturner = curry(function(p, f) {
      if (typeof(p) !== 'function' || getRealArity(p) !== 1 || typeof(f) !== 'function')
        throw new TypeError('makePredResultReturner called with invalid arguments');

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        var result = f.apply(null, arguments);

        if (!p(result))
          return Err(result);

        return Ok(result);
      });
    });


    /*
     * makeThrowResultReturner: Takes a function f. Returns a function with the same arity as f. The returned
     *                          function calls the original function. If the function f throws during execution
     *                          then the value thrown is wrapped in an Err and returned. Otherwise, the result is
     *                          wrapped in an Ok and returned. Throws if f is not a function.
     *
     */

    var makeThrowResultReturner = curry(function(f) {
      if (typeof(f) !== 'function')
        throw new TypeError('makeThrowResultReturner called with invalid arguments');

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);

        try {
          var result = f.apply(null, arguments);
          return Ok(result);
        } catch (e) {
          return Err(e);
        }
      });
    });


    var exported = {
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
