module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;
  var arityOf = curryModule.arityOf;
  var curryWithConsistentStyle = curryModule._curryWithConsistentStyle;

  var array = require('./array');
  var map = array.map;

  var maybe = require('./maybe');
  var isJust = maybe.isJust;
  var isNothing = maybe.isNothing;
  var Just = maybe.Just;
  var Nothing = maybe.Nothing;
  var getJustValue = maybe.getJustValue;

  var result = require('./result');
  var isOk = result.isOk;
  var isErr = result.isErr;
  var Ok = result.Ok;
  var Err = result.Err;
  var getOkValue = result.getOkValue;

  var internalUtilities = require('../internalUtilities');
  var isArrayLike = internalUtilities.isArrayLike;


  /*
   * <apifunction>
   *
   * fmap
   *
   * Category: function
   *
   * Synonyms: fMap
   *
   * Parameter: f: function
   * Parameter: g: any
   * Returns: any
   *
   * Takes a known Functor, and maps the given function over it. Known functors are currently arrays, strings,
   * [`Maybes`](#Maybe) and [`Results`](#Result), although this may change in future versions. Throws if the
   * first value is not a function of arity 1, or the second is not a known functor.
   *
   * The actions taken are as follows:
   *   - arrays/strings: the function is mapped over the array
   *   - Maybe: [`Just`](#Just) values yield a new Just value containing the result of applying the function to the
   *      contents of the Just. [`Nothing`](#Nothing) values yield Nothing.
   *   - Result: [`Ok`](#Ok) values yiels a new Ok value containing the result of applying the function to the contents
   *      of the Ok. [`Err`](#Err) values yield the Err value unchanged.
   *
   * Examples:
   *  funkierJS.fmap(function(x) { return x + 1; }, Just(10)); => Just 11
   *
   */

  var fmap = curry(function(f, val) {
    f = curryWithConsistentStyle(f, f, arityOf(f));

    if (isArrayLike(val))
      return map(f, val);

    if (isJust(val))
      return Just(f(getJustValue(val)));

    if (isNothing(val))
      return val;

    if (isOk(val))
      return Ok(f(getOkValue(val)));

    if (isErr(val))
      return val;

    throw new Error('Unrecognised functor');
  });


  return {
    fMap: fmap,
    fmap: fmap
  };
})();
