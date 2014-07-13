(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curryModule = require('./curry');
    var curry = curryModule.curry;

    var utils = require('./utils');
    var valueStringifier = utils.valueStringifier;
    var defineValue = utils.defineValue;


    /*
     * A Pair represents an immutable tuple. The constructor function takes two elements,
     * first, and second, and returns a new tuple. The contents of the tuple can be accessed
     * with the accessor functions fst and snd respectively. The constructor is new-agnostic.
     * When called with one argument, a function will be returned that expects a second argument;
     * supplying this function with a value will yield a Pair. Throws a TypeError if called with
     * zero arguments.
     *
     */

    var Pair = defineValue(
      'name: Pair',
      'signature: first: any, second: any',
      'classification: datatypes',
      '',
      'A Pair represents an immutable tuple. The constructor function takes two',
      'elements, first and second. and returns a new immutable tuple. The contents of',
      'the tuple can be accessed with the accessor functions [[fst]] and [[snd]]',
      'respectively. The constructor is new-agnostic.',
      '',
      'The constructor is curried: when called with one argument, a function will be',
      'returned that expects a second argument; supplying this function with a value',
      'will yield a Pair.',
      '',
      'Throws a TypeError if called with zero arguments.',
      '--',
      'var p1 = new Pair(2, 3);',
      'var p2 = Pair(2)(3);',
      'var pairs = map(new Pair(3), [4, 5, 6]);',
      function(a, b) {
        if (arguments.length === 0)
          throw new TypeError('Pair constructor takes two arguments');

        if (arguments.length === 1)
          return pairMaker(a);

        if (!(this instanceof Pair))
          return new Pair(a, b);

        Object.defineProperty(this, 'first', {enumerable: false, configurable: false, value: a});
        Object.defineProperty(this, 'second', {enumerable: false, configurable: false, value: b});
      }
    );


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


    var fst = defineValue(
      'name: fst',
      'signature: p: [[Pair]]',
      'classification: datatypes',
      '',
      'Accessor function for pair tuples. Returns the first value that was supplied to',
      'the pair constructor.',
      '',
      'Throws a TypeError when called with a non-pair value.',
      '--',
      'var p = new Pair(2, 3);',
      'fst(p); // returns 2',
      curry(function(pair) {
        if (!(pair instanceof Pair))
          throw new TypeError('Not a pair');

        return pair.first;
      })
    );


    var snd = defineValue(
      'name: snd',
      'signature: p: [[Pair]]',
      'classification: datatypes',
      '',
      'Accessor function for pair tuples. Returns the second value that was supplied to',
      'the pair constructor.',
      '',
      'Throws a TypeError when called with a non-pair value.',
      '--',
      'var p = new Pair(2, 3);',
      'snd(p); // returns 3',
      curry(function(pair) {
        if (!(pair instanceof Pair))
          throw new TypeError('Not a pair');

        return pair.second;
      })
    );


    var isPair = defineValue(
      'name: isPair',
      'signature: val: any',
      'classification: datatypes',
      '',
      'Returns true if the supplied val is a Pair, and false otherwise.',
      '--',
      'isPair(Pair(4, 2)); // true',
      curry(function(obj) {
        return obj instanceof Pair;
      })
    );


    var asArray = defineValue(
      'name: asArray',
      'signature: p: [[Pair]]',
      'classification: datatypes',
      '',
      'Takes a pair, and returns a 2-element array containing the values contained in',
      'the given pair p. Specifically, if the resulting array is named arr, then we have',
      'arr[0] === fst(p) and arr[1] === snd(p).',
      '',
      'Throws a TypeError if p is not a pair.',
      '--',
      'asArray(Pair(7, 10)); // returns [7, 10]',
      curry(function(p) {
        if (!(p instanceof Pair))
          throw new TypeError('Not a pair');

        return [fst(p), snd(p)];
      })
    );


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
