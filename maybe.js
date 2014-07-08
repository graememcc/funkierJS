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
     * Maybe encapsulates the idea of sentinel values returned by functions to represent an error
     * or unusual condition. Authors can return an instance of the Just constructor when a function
     * runs successfully, and the Nothing object when an error occurs or the computation is otherwise
     * unsuccessful.
     */


    var Maybe = defineValue(
      'name: Maybe',
      'classification: datatypes',
      '',
      'The Maybe type encapsulates the idea of sentinel values returned by functions to represent an error or',
      'unusual conditions. Authors can return an instance of the Just constructor when a function executes',
      'successfully, and the Nothing object when an error occurs, or the computation is otherwise unsuccessful.',
      '',
      'Maybe is the \'base class\' of [[Just]] and [[Nothing]]. It is provided only for the instanceof operator.',
      '',
      'Throws an Error when called directly.',
      function() {
        throw new Error('Maybe cannot be instantiated directly');
      }
    );

    Maybe.prototype = {toString: function() {return 'Maybe';}};


    var nothingPrototype = Object.create(Maybe.prototype);
    nothingPrototype.toString = function() {return 'Maybe {Nothing}';};

    var Nothing = defineValue(
      'name: Nothing',
      'classification: datatypes',
      '',
      'A Nothing is a type of [[Maybe]] representing an unsuccessful computation.',
      '',
      '--',
      'var result = Nothing;',
      Object.create(nothingPrototype)
    );
    Object.freeze(Nothing);


    var Just = defineValue(
      'name: Just',
      'classification: datatypes',
      'signature: val: any',
      '',
      'A Just is a type of [[Maybe]] representing a successful computation. The constructor is new-agnostic.',
      '',
      'Throws a TypeError when called with no arguments.',
      '',
      '--',
      'var result = Just(42);',
      function(val) {
        if (arguments.length !== 1)
          throw new TypeError('Just called with incorrect number of arguments');

        if (!(this instanceof Just))
          return new Just(val);

        Object.defineProperty(this, 'value', {configurable: false, writable: false, enumerable: false, value: val});
      }
    );


    Just.prototype = Object.create(Maybe.prototype);
    Just.prototype.toString = function() {
      return 'Maybe {Just ' + valueStringifier(this.value) + '}';
    };


    var isMaybe = defineValue(
      'name: isMaybe',
      'classification: datatypes',
      'signature: val: any',
      '',
      'Returns true when the given object is a [[Maybe]] object. Returns false otherwise.',
      '',
      '--',
      'isMaybe(Just(3)) && isMaybe(Nothing); // true',
       function(val) {
        return val === Maybe || val instanceof Maybe;
      }
    );


    var isNothing = defineValue(
      'name: isNothing',
      'classification: datatypes',
      'signature: val: any',
      '',
      'Returns true when the given object is the [[Nothing]] object. Returns false otherwise.',
      '',
      '--',
      'isNothing(Nothing); // true',
      function(val) {
        return val === Nothing;
      }
    );


    var isJust = defineValue(
      'name: isJust',
      'classification: datatypes',
      'signature: val: any',
      '',
      'Returns true when the given object is an [[Just]] object. Returns false otherwise.',
      '',
      '--',
      'isJust(Just(function() {})); // true',
      function(val) {
        return val instanceof Just;
      }
    );


    var getJustValue = defineValue(
      'name: getJustValue',
      'classification: datatypes',
      'signature: val: [[Just]]',
      '',
      'Returns the value wrapped by the given [[Just]] instance val.',
      '',
      'Throws a TypeError if called with a value which is not a [[Just]].',
      '',
      '--',
      'getJustValue(Just(3)); // 3',
      curry(function(j) {
        if (!isJust(j))
          throw new TypeError('Value is not a Just');

        return j.value;
      })
    );


    var makeMaybeReturner = defineValue(
      'name: makeMaybeReturner',
      'classification: datatypes',
      'signature: sentinels: array/arraylike, f: function',
      '',
      'Takes an array of sentinel values, and a function f. Returns a new function with the same arity as f.',
      'When called, the new function calls the original function and examines the result. If the result is contained',
      'in the array of sentinel values—checked for strict identity—then the new function returns [[Nothing]].',
      'Otherwise, the result is wrapped in a [[Just]] and returned.',
      '',
      'Throws a TypeError if the first argument is not an array or arraylike, or if the second argument is not a function.',
      '',
      '--',
      'var sentinels = [-1];',
      'var newIndexOf = makeMaybeReturner(sentinels, indexOf);',
      'newIndexOf(\'a\', \'banana\'); // returns Just(1)',
      'newIndexOf(\'a\', \'funkier\'); // returns Nothing',
      curry(function(sentinels, f) {
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
      })
    );


    var makePredMaybeReturner = defineValue(
      'name: makePredMaybeReturner',
      'classification: datatypes',
      'signature: p: function, f: function',
      '',
      'Takes a predicate function p, and a function f. Returns a new function with the same arity as f. When called,',
      'the new function calls the original function and calls the given predicate function with the result.',
      'If p returns false, then [[Nothing]] is returned, otherwise the result is wrapped in an [[Just]] and returned.',
      '',
      'Throws a TypeError if p is not a function of arity 1, or if f is not a function.',
      '--',
      'var predicate = function(x) {return x !== -1;};',
      'var newIndexOf = makePredMaybeReturner(predicate, indexOf);',
      'newIndexOf(\'a\', \'funkier\'); // returns Nothing',
      'newIndexOf(\'u\', \'funkier\'); // returns Just(1)',
      curry(function(p, f) {
        p = checkFunction(p, {arity: 1, message: 'Predicate must be a function of arity 1'});
        f = checkFunction(f, {message: 'Value to be transformed must be a function'});

        return curryWithArity(getRealArity(f), function() {
          var args = [].slice.call(arguments);
          var result = f.apply(this, arguments);

          if (!p(result))
            return Nothing;

          return Just(result);
        });
      })
    );


    var makeThrowMaybeReturner = defineValue(
      'name: makeThrowMaybeReturner',
      'classification: datatypes',
      'signature: f: function',
      '',
      'Takes a function f. Returns a new function with the same arity as f. When called, the new function calls the',
      'original function. If the function f throws during execution, then [[Nothing]] is returned.',
      'Otherwise, the result of the function is wrapped in a [[Just]] and returned.',
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
      'var f = makeThrowMaybeReturner(g);',
      'f(11); // returns Just(11)',
      'f(5); // returns Nothing',
      curry(function(f) {
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
      })
    );


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
