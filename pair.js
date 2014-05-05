(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var base = require('./base');
    var curry = base.curry;

    var utils = require('./utils');
    var valueStringifier = utils.valueStringifier;


    /*
     * A Pair represents an immutable tuple. The constructor function takes two elements,
     * first, and second. And returns a new tuple. The contents of the tuple can be accessed
     * with the accessor functions fst and snd respectively. The constructor is new-agnostic.
     * When called with one argument, a function will be returned that expects a second argument;
     * supplying this function with a value will yield a Pair. Throws a TypeError if called with
     * zero arguments.
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
      }
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
     * fst: accessor function for Pair tuples. Returns the first value that was supplied to the
     *      pair constructor. Throws a TypeError for non-Pair arguments.
     *
     */

    var fst = curry(function(pair) {
      if (!(pair instanceof Pair))
        throw new TypeError('Not a pair');

      return pair.first;
    });


    /*
     * snd: accessor function for Pair tuples. Returns the second value that was supplied to the
     *      pair constructor. Throws a TypeError for non-Pair arguments.
     *
     */

    var snd = curry(function(pair) {
      if (!(pair instanceof Pair))
        throw new TypeError('Not a pair');

      return pair.second;
    });


    /*
     * isPair: returns true if the given object is an instance of a Pair, false otherwise.
     *
     */

    var isPair = curry(function(obj) {
      return obj instanceof Pair;
    });


    /*
     * asArray: Takes a pair, and returns a 2-element array containing the values contained
     *          in p. Specifically, if the resulting array is named arr, then we have
     *          arr[0] === fst(p) and arr[1] === snd(p). Throws if p is not a pair.
     *
     */

    var asArray = function(p) {
      if (!(p instanceof Pair))
        throw new TypeError('Not a pair');

      return [fst(p), snd(p)];
    };


    var exported = {
      Pair: Pair,
      asArray: asArray,
      fst: fst,
      isPair: isPair,
      snd: snd
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
