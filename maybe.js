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

    var funcUtils = require('./funcUtils');
    var checkFunction = funcUtils.checkFunction;


    /*
     * Maybe encapsulates the idea of sentinel values returned by functions to represent an error
     * or unusual condition. Authors can return an instance of the Just constructor when a function
     * runs successfully, and the Nothing object when an error occurs or the computation is otherwise
     * unsuccessful.
     */

    /*
     * Maybe is the 'base class' of Just and Nothing. It is provided for the instanceof operator
     *
     */

    var Maybe = function() {
      throw new Error('Maybe cannot be instantiated directly');
    };

    Maybe.prototype = {toString: function() {return 'Maybe';}};


    /*
     * Nothing represents a failed computation.
     *
     */

    var nothingPrototype = Object.create(Maybe.prototype);
    nothingPrototype.toString = function() {return 'Maybe {Nothing}';};
    var Nothing = Object.create(nothingPrototype);
    Object.freeze(Nothing);


    /*
     * A Just represents a successful computation. The constructor is new-agnostic, but
     * throws if called with no arguments.
     *
     */

    var Just = function(val) {
      if (arguments.length !== 1)
        throw new TypeError('Just called with incorrect number of arguments');

      if (!(this instanceof Just))
        return new Just(val);

      Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
    };


    Just.prototype = Object.create(Maybe.prototype);
    Just.prototype.toString = function() {
      return 'Maybe {Just ' + valueStringifier(this.value) + '}';
    };


    /*
     * isMaybe: returns true when the given object is a Maybe object. Returns false otherwise.
     *
     */

    var isMaybe = function(obj) {
      return obj === Maybe || obj instanceof Maybe;
    };


    /*
     * isNothing: returns true when the given object is the Nothing object. Returns false otherwise.
     *
     */

    var isNothing = function(obj) {
      return obj === Nothing;
    };


    /*
     * isJust: returns true when the given object is a Just object. Returns false otherwise.
     *
     */

    var isJust = function(obj) {
      return obj instanceof Just;
    };


    /*
     * getJustValue: returns the value wrapped by the given Just instance. Throws if not called
     *               with a Just.
     *
     */

    var getJustValue = function(j) {
      if (!isJust(j))
        throw new TypeError('Value is not a Just');

      return j.value;
    };


    /*
     * makeMaybeReturner: Takes an array of sentinel values, and a function f. Returns a function
     *                    with the same arity as f. The returned function calls the original function
     *                    and examines the result. If the result is in the array of sentinel values—
     *                    checked for strict identity—then Nothing is returned. Otherwise, the value
     *                    is wrapped in a Just and returned. Throws if the first argument is not an
     *                    array, or if the second argument is not a function.
     *
     */

    var makeMaybeReturner = curry(function(sentinels, f) {
      sentinels = checkArrayLike(sentinels, {noStrings: true,
                                             message: 'Sentinels must be an array'});
      f = checkFunction(f, {message: 'Value to be transformed must be a function'});

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        var result = f.apply(this, arguments);

        if (sentinels.indexOf(result) !== -1)
          return Nothing;

        return Just(result);
      });
    });


    /*
     * makePredMaybeReturner: Takes a predicate function p, and a function f. Returns a function
     *                        with the same arity as f. The returned function calls the original function
     *                        and examines the result. The predicate function p is called with the result.
     *                        If p returns false, then Nothing is returned, otherwise the result is wrapped
     *                        in a Just and returned. Throws if p is not a function of arity 1, or if f is
     *                        not a function.
     *
     */

    var makePredMaybeReturner = curry(function(p, f) {
      p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
      f = checkFunction(f, {message: 'Value to be transformed must be a function'});

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);
        var result = f.apply(this, arguments);

        if (!p(result))
          return Nothing;

        return Just(result);
      });
    });


    /*
     * makeThrowMaybeReturner: Takes a function f. Returns a function with the same arity as f. The returned
     *                         function calls the original function. If the function f throws during execution
     *                         then Nothing is returned, otherwise the result is wrapped in a Just and returned.
     *                         Throws if f is not a function.
     *
     */

    var makeThrowMaybeReturner = curry(function(f) {
      f = checkFunction(f, {message: 'Value to be transformed must be a function'});

      return curryWithArity(getRealArity(f), function() {
        var args = [].slice.call(arguments);

        try {
          var result = f.apply(this, arguments);
          return Just(result);
        } catch (e) {
          return Nothing;
        }
      });
    });


    var exported = {
      getJustValue: getJustValue,
      isJust: isJust,
      isMaybe: isMaybe,
      isNothing: isNothing,
      makeMaybeReturner: makeMaybeReturner,
      makePredMaybeReturner: makePredMaybeReturner,
      makeThrowMaybeReturner: makeThrowMaybeReturner,
      Just: Just,
      Maybe: Maybe,
      Nothing: Nothing
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
