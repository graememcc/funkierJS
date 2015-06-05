module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;
  var arityOf = curryModule.arityOf;

  var internalUtilities = require('../internalUtilities');
  var valueStringifier = internalUtilities.valueStringifier;

  var funcUtils = require('../funcUtils');
  var checkFunction = funcUtils.checkFunction;


  /*
   * Maybe encapsulates the idea of sentinel values returned by functions to represent an error or unusual condition.
   * Authors can return an instance of the Just constructor when a function runs successfully, and the Nothing object
   * when an error occurs or the computation is otherwise unsuccessful.
   */


  /*
   * <apifunction>
   *
   * Maybe
   *
   * Category: DataTypes
   *
   * The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or unusual
   * conditions. Authors can return an instance of the Just constructor when a function executes successfully, and the
   * Nothing object when an error occurs, or the computation is otherwise unsuccessful.
   *
   * Maybe is the 'base class' of [`Just`](#Just) and [`Nothing`](#Nothing). It is provided only for the instanceof
   * operator.
   *
   * It is an error to call Maybe.
   *
   */

  var Maybe = curry(function() {
    throw new Error('Maybe cannot be instantiated directly');
  });


  Maybe.prototype = {toString: function() {return 'Maybe';}, constructor: Maybe};

  var nothingPrototype = Object.create(Maybe.prototype);
  nothingPrototype.toString = function() {return 'Maybe {Nothing}';};


  /*
   * <apiobject>
   *
   * Nothing
   *
   * Category: DataTypes
   *
   * A Nothing is a type of [`Maybe`](#Maybe) representing an unsuccessful computation.
   *
   */

  var Nothing = Object.create(nothingPrototype);
  Object.freeze(Nothing);


  /*
   * <apifunction>
   *
   * Just
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: Just
   *
   * A Just is a type of [`Maybe`](#Maybe) representing a successful computation. The constructor is new-agnostic.
   * Throws when called with no arguments.
   *
   * Examples:
   *   var result = funkierJS.Just(42);
   *
   */

  var Just = function(val) {
    if (arguments.length !== 1)
      throw new TypeError('Just called with incorrect number of arguments');

    if (!(this instanceof Just))
      return new Just(val);

    Object.defineProperty(this, 'value', {value: val});
  };


  Just.prototype = Object.create(Maybe.prototype);
  Just.prototype.toString = function() {
    return 'Maybe {Just ' + valueStringifier(this.value) + '}';
  };


  /*
   * <apifunction>
   *
   * isMaybe
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true when the given value is a [`Maybe`](#Maybe) object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isMaybe(funkierJS.Nothing) && funkierJS.isMaybe(funkierJS.Just(42)); // => true
   *
   */

  var isMaybe = curry(function(val) {
    return val === Maybe || val instanceof Maybe;
  });


  /*
   * <apifunction>
   *
   * isNothing
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is the [`Nothing`](#Nothing) object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isNothing(funkierJS.Nothing); // => true
   *
   */

  var isNothing = curry(function(val) {
    return val === Nothing;
  });


  /*
   * <apifunction>
   *
   * isJust
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is a [`Just`](#Just) object, and false otherwise.
   *
   * Examples:
   *   funkierJS.isJust(funkierJS.Just(42)); // => true
   *
   */

  var isJust = curry(function(val) {
    return val instanceof Just;
  });


  /*
   * <apifunction>
   *
   * getJustValue
   *
   * Category: DataTypes
   *
   * Parameter: j: Just
   * Returns: any
   *
   * Returns the value wrapped by the given [`Just`](#Just) instance j. Throws a TypeError if called with anything other
   * than a [`Just`](#Just).
   *
   * Examples:
   *   funkierJS.getJustValue(funkierJS.Just(3)); // => 3',
   *
   */

  var getJustValue = curry(function(j) {
    if (!isJust(j))
      throw new TypeError('Value is not a Just');

    return j.value;
  });


  /*
   * <apifunction>
   *
   * makeMaybeReturner
   *
   * Category: DataTypes
   *
   * Parameter: f: function
   * Returns: function
   *
   * Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the
   * original. If the function f throws during execution, then the Nothing object is returned. Otherwise the result of
   * the function is wrapped in a [`Just`](#Just) and returned.
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
   *   var f = funkierJS.makeMaybeReturner(g);
   *   f(11); // => Just(11)
   *   f(5); // => Nothing
   *
   */

  var makeMaybeReturner = curry(function(f) {
    f = checkFunction(f, {message: 'Value to be transformed must be a function'});

    return curryWithConsistentStyle(f, function() {
      var args = [].slice.call(arguments);

      try {
        var result = f.apply(this, arguments);
        return Just(result);
      } catch (e) {
        return Nothing;
      }
    }, arityOf(f));
  });


  return {
    getJustValue: getJustValue,
    isJust: isJust,
    isMaybe: isMaybe,
    isNothing: isNothing,
    makeMaybeReturner: makeMaybeReturner,
    Just: Just,
    Maybe: Maybe,
    Nothing: Nothing
  };
})();
