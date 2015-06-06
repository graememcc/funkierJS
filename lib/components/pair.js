module.exports = (function() {
  "use strict";


  var curryModule = require('./curry');
  var curry = curryModule.curry;

  var utils = require('../internalUtilities');
  var valueStringifier = utils.valueStringifier;


  /*
   * A Pair represents an immutable tuple. The constructor function takes two elements,
   * first, and second, and returns a new tuple. The contents of the tuple can be accessed
   * with the accessor functions fst and snd respectively. The constructor is new-agnostic.
   * When called with one argument, a function will be returned that expects a second argument;
   * supplying this function with a value will yield a Pair. Throws a TypeError if called with
   * zero arguments.
   *
   */


  /*
   * <apifunction>
   *
   * Pair
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Parameter: b: any
   * Returns: Pair
   *
   * A Pair represents an immutable tuple. The constructor function takes two elements, first and second. and returns a
   * new immutable tuple. The contents of the tuple can be accessed with the accessor functions [`fst`](#fst) and
   * [`snd`](#snd) respectively. The constructor is new-agnostic.
   *
   * The constructor is curried: when called with one argument, a function will be returned that expects a second
   * argument; supplying this function with a value will yield a Pair. Note that the constructor is internally curried
   * outside of the usual mechanisms.
   *
   * Throws a TypeError if called with zero arguments.
   *
   * Examples:
   * var p1 = new funkierJS.Pair(2, 3);
   * var p2 = funkierJS.Pair(2)(3);
   * var pairs = funkierJS.map(funkierJS.new Pair(3), [4, 5, 6]);
   *
   */

  var Pair = function(a, b) {
    if (arguments.length === 0)
      throw new TypeError('Pair constructor takes two arguments');

    if (arguments.length === 1)
      return pairMaker(a);

    if (!(this instanceof Pair))
      return new Pair(a, b);

    Object.defineProperty(this, 'first', {enumerable: false, configurable: false, value: a});
    Object.defineProperty(this, 'second', {enumerable: false, configurable: false, value: b});
  };


  Pair.prototype = {
    toString: function() {
      // We use coercion rather than an explicit toString call as it's permissible for the
      // values to be null or undefined
      return ['Pair (', valueStringifier(this.first), ', ', valueStringifier(this.second), ')'].join('');
    },

    constructor: Pair
  };


  // Utility function for Pair to provide the illusion of currying
  var pairMaker = function(a) {
    var fn = curry(function(b) {
      return new Pair(a, b);
    });

    // Lie to instanceof
    fn.prototype = Pair.prototype;
    return fn;
  };


  /*
   * <apifunction>
   *
   * fst
   *
   * Category: DataTypes
   *
   * Synonyms: first
   *
   * Parameter: p: Pair
   * Returns: any
   *
   * Accessor function for [`Pair`](#Pair) tuples. Returns the first value that was supplied to the [`Pair`](#Pair)
   * constructor. Throws if called with a non-pair value.
   *
   * Examples:
   * var p = new funkierJS.Pair(2, 3);
   * funkierJS.fst(p); // => 2',
   *
   */

  var fst = curry(function(pair) {
    if (!(pair instanceof Pair))
      throw new TypeError('Not a pair');

    return pair.first;
  });


  /*
   * <apifunction>
   *
   * snd
   *
   * Category: DataTypes
   *
   * Synonyms: second
   *
   * Parameter: p: Pair
   * Returns: any
   *
   * Accessor function for [`Pair`](#Pair) tuples. Returns the second value that was supplied to the [`Pair`](#Pair)
   * constructor. Throws if called with a non-pair value.
   *
   * Examples:
   * var p = new funkierJS.Pair(2, 3);
   * funkierJS.snd(p); // => 3',
   *
   */

  var snd = curry(function(pair) {
    if (!(pair instanceof Pair))
      throw new TypeError('Not a pair');

    return pair.second;
  });



  /*
   * <apifunction>
   *
   * isPair
   *
   * Category: DataTypes
   *
   * Parameter: a: any
   * Returns: boolean
   *
   * Returns true if the given value is a [`Pair`](#Pair), and false otherwise.
   *
   * Examples:
   *   funkierJS.isPair(funkierJS.Pair(2, 3)); // => True
   *
   */

  var isPair = curry(function(obj) {
    return obj instanceof Pair;
  });



  /*
   * <apifunction>
   *
   * asArray
   *
   * Category: DataTypes
   *
   * Parameter: p: Pair
   * Returns: array
   *
   * Takes a pair, and returns a 2-element array containing the values contained in the given [`Pair`](#Pair) p.
   * Specifically, if the resulting array is named arr, then we have `arr[0] === fst(p)` and `arr[1] === snd(p)`.
   * Throws a TypeError if p is not a pair.
   *
   * Examples:
   *   funkierJS.asArray(funkierJS.Pair(7, 10)); // => [7, 10]',
   *
   */

  var asArray = curry(function(p) {
    if (!(p instanceof Pair))
      throw new TypeError('Not a pair');

    return [fst(p), snd(p)];
  });


  return {
    Pair: Pair,
    asArray: asArray,
    first: fst,
    fst: fst,
    isPair: isPair,
    second: snd,
    snd: snd
  };
})();
