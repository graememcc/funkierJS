module.exports = (function() {
  "use strict";


  var expect = require('chai').expect;


  var curryModule = require('../../lib/components/curry');
  var arityOf = curryModule.arityOf;
  var curry = curryModule.curry;
  var curryWithArity = curryModule.curryWithArity;
  var bind = curryModule.bind;
  var bindWithContextAndArity = curryModule.bindWithContextAndArity;
  var objectCurry = curryModule.objectCurry;
  var objectCurryWithArity = curryModule.objectCurryWithArity;


  /*
   * Return a function that tests if an object has the given property
   *
   */

  var exportsProperty = function(obj, prop) {
    return function() {
      expect(obj).to.have.property(prop);
    };
  };


  /*
   * Return a function that tests if an object has the given function
   *
   */

  var exportsFunction = function(obj, prop) {
    return function() {
      expect(obj[prop]).to.be.a('function');
    };
  };


  /*
   * Generate a test suite that ensures a module exports all the expected values and functions
   *
   */

  var checkModule = function(name, moduleUnderTest, moduleDescription) {
    var testDescription = name[0].toUpperCase() + name.slice(1);

    describe(testDescription + ' exports', function() {
      // Generate existence tests for each expected object
      if ('expectedObjects' in moduleDescription) {
        moduleDescription.expectedObjects.forEach(function(o) {
          it(name + '.js exports \'' + o + '\' property', exportsProperty(moduleUnderTest, o));
        });
      }

      // ... and each expected function
      if ('expectedFunctions' in moduleDescription) {
        moduleDescription.expectedFunctions.forEach(function(f) {
          it(name + '.js exports \'' + f + '\' property', exportsProperty(moduleUnderTest, f));
          it('\'' + f + '\' property of ' + name + '.js is a function', exportsFunction(moduleUnderTest, f));
        });
      }
    });
  };


//    var positions = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];


  /*
   * A special sentinel value to denote that there are no type restrictions on a particular argument position.
   *
   */

  var NO_RESTRICTIONS = {};
  Object.freeze(NO_RESTRICTIONS);


  /*
   * A special sentinel value to denote that we want the test harness to generate valid arguments for a particular
   * argument position.
   *
   */

  var ANYVALUE = {};
  Object.freeze(ANYVALUE);


  var typeclasses = ['function: arity 1', 'function: minarity 1', 'function: minarity 2',/*'integer',*/  'natural', 'strictNatural'/*'arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull'*/];
  var isTypeClass = function(restriction) {
    if (typeclasses.indexOf(restriction) !== -1)
      return true;
    /*
    if (isFuncTypeClass(restriction))
      return true;
    */

    return false;
  };


  var primitiveTypeOf = {
    'function': 'function',
    'function: arity 1': 'function',
    'function: minarity 1': 'function',
    'function: minarity 2': 'function',
    'natural':  'number',
    'objectlike': 'object',
    'strictNatural':  'number',
    'string': 'string'
  };


  var restrictionVerifiers = {
    'function': function(f) { return typeof(f) === 'function'; },
    'function: arity 1': function(f) { return typeof(f) === 'function' && f.length === 1; },
    'function: minarity 1': function(f) { return typeof(f) === 'function' && f.length >= 1; },
    'function: minarity 2': function(f) { return typeof(f) === 'function' && f.length >= 2; },
    'natural': function(n) { return (n - 0) >= 0 && (n - 0) !== Number.POSITIVE_INFINITY; },
    'objectlike': function(o) { return (typeof(o) === 'object' && o !== null) || typeof(o) === 'function' ||
                                        typeof(o) === 'string';},
    'strictNatural': function(n) { return typeof(n) === 'number' && n >= 0 && n !== Number.POSITIVE_INFINITY; },
    'string': function(f) { return typeof(f) === 'string'; },
  };


  // Before checkTypeRestrictions generates the type tests, it is prudent to confirm I wrote  the spec correctly.
  // Specifically, we need to ensure that if that, for example, the "restrictions" field requires parameter 0 to be a
  // number or boolean, then the "validArguments" for that parameter should contain a number and a boolean (at the
  // same indices as their respective restrictions).
  //
  // The task is complicated somewhat by the function typeclasses for functions of specific arity, and the "multi"
  // typeclasses: arraylike etc, which map to more than one type.
  //

  var verifyRestrictions = function(name, restrictions, typicalArguments) {
    // Assumption: caller has checked that restrictions is an array
    restrictions.forEach(function(typeRestrictions, i) {
      var failBecause = function(reason) {
        throw new Error(name + ': Spec error for positional argument ' + (i + 1) + ': ' + reason);
      };

      if (typeRestrictions === NO_RESTRICTIONS) return;

      // typeRestrictions is an array of restrictions for parameter i
      typeRestrictions.forEach(function(expectedType, j) {
        var typicalValue = typicalArguments[i][j];

        // Again, trust that the code will generate correct values for a particular restriction
        if (typicalValue === ANYVALUE) return;

        // If a function accepts a specific type of object e.g. RegExp, then that should be the only possible
        // restriction for that position: for example, we shouldn't have a parameter that can be a RegExp or a boolean.
        if (typeof(expectedType) === 'function') {
          if (typeRestrictions.length > 1)
            failBecause('A constructor must be the only restriction for that parameter!');

          if (!(typicalValue instanceof expectedType))
            failBecause('The example argument is not an instance of the given constructor');

          return;
        }

        // The restriction is not a constructor function: it must be a string
        if (typeof(expectedType) !== 'string')
          failBecause('Restriction ' + (j + 1) + ' isn\'t the name of a type: it\'s a ' + typeof(r));

        if (typeof(typicalValue) !== primitiveTypeOf[expectedType])
          failBecause('Sample argument ' + (j + 1) + ' has type ' + typeof(typicalValue) +
                      ', restriction demands ' + expectedType);

        // If the restriction is a typeclass, it should be the only one
        if (isTypeClass(expectedType) && typeRestrictions.length > 1)
          failBecause('A typeclass must be the only restriction for that parameter!');

        if (!restrictionVerifiers[expectedType](typicalValue))
          failBecause('Typical value ' + (j + 1) + ' for parameter ' + (i + 1) + ' is not of type ' + expectedType);
/*
        // Sanity check the validArguments for this parameter. They should be the type I claim is permissable!
        //if (!isMultiTypeClass(r)) {
          var t = isPrimitiveType(r) ? r : nonPrimToPrim(r);
          if (typeof(validArguments[i][j]) !== t)
            throw new Error(errorPre + 'valid argument ' + (j + 1) + ' has type ' + typeof(validArguments[i][j]) +
                            ', value ' + validArguments[i][j] + ', restriction demands type ' + t);
          return;
        }
//
        // We now know the restriction is a multi typeclass. For 'arraylike' and 'strictarraylike', we require that
        // validArguments contains a value for each permissible member of the typeclass. For 'objectlike' we require
        // only one example.
//
        if (r === 'objectlike' || r === 'objectlikeornull') {
          var withNull = r === 'objectlikeornull';
          if (!isObjectLike(validArguments[i][j], withNull))
            throw new Error(errorPre + 'validArguments ' + (j + 1) + ' (' + validArguments[i][j] + ') is not objectlike');
//
          return;
        }
//
        var validArgsType = validArguments[i].map(function(x) {return Array.isArray(x) ? 'array' : typeof(x);});
        var correctLength = r === 'arraylike' ? 3 : 2;
//
        if (validArguments[i].length !== correctLength)
          throw new Error(errorPre + 'Not enough examples of ' + r + ' - expected ' + correctLength + ' found ' +
                          validArguments[i].length);
//
        if (validArgsType.indexOf('array') === -1 || validArgsType.indexOf('object') === -1 ||
            (correctLength === 3 && validArgsType.indexOf('string') === -1))
          throw new Error(errorPre + 'Valid argument for ' + r + ' have wrong type');
*/
      });
    });

    if (restrictions.every(function(r) { return r === NO_RESTRICTIONS; }))
      throw new Error(name + 'has an unneccesary restrictions property. Please remove it');
  };


  /*
   * Given an array containing either a single constructor function, or one or more strings, generate an array of
   * values that would not satisfy that restriction.
   *
   */

  var makeBogusFor = function(restrictionsForPosition) {
    // Note that the typeclasses indicate what typeclass an instance of the type *could* be a value of after coercsion,
    // not necessarily the typeclass of the value given
    var bogusPrimitives = [
      {type: 'number',    value: 2,             typeclasses: [/*'integer',*/ 'natural', 'strictNatural']},
      {type: 'boolean',   value: true,          typeclasses: [/*'integer',*/ 'natural']},
      {type: 'string',    value: 'x',
         typeclasses: [/* 'integer', */ 'natural', /* 'arraylike', */'objectlike', /*'objectlikeornull' */]},
      {type: 'undefined', value: undefined,     typeclasses: []},
      {type: 'null',      value: null,          typeclasses: [/*'integer',*/ 'natural', /*'objectlikeornull' */]},
      {type: 'function',  value: function() {}, typeclasses: [/*'function',*/ 'objectlike', /*'objectlikeornull' */]},
      {type: 'object',    value: {foo: 4},      typeclasses: [/*'integer', */ 'natural', 'objectlike',/*'objectlikeornull' */]},
      {type: 'array',     value: [4, 5, 6],     typeclasses: [/*'arraylike', */ 'natural', 'objectlike' /*, 'strictarraylike',  'objectlikeornull' */]}
    ];

    var naturalCommon = [
      {type: 'negative', value: -1}, {type: 'positive infinity', value: Number.POSITIVE_INFINITY},
      {type: 'negative infinity', value: Number.NEGATIVE_INFINITY}, {type: 'non-integral', value: 1.5},
      {type: 'NaN', value: Number.NaN}, {type: 'string coercing to negative', value: '-1'},
      {type: 'string coercing to non-integral', value: '1.2'},
      {type: 'object coercing to negative', value: {valueOf: function() { return -1; }}},
      {type: 'object coercing to infinity', value: {valueOf: function() { return Number.POSITIVE_INFINITY; }}},
      {type: 'object coercing to negative infinity', value: {valueOf: function() { return Number.NEGATIVE_INFINITY; }}},
      {type: 'object coercing to non-integral', value: {valueOf: function() { return 1.2; }}}];


    var bogusForTypeClass = {
      'function: arity 1':    [{type: 'function with arity 0', value: function() {}},
                               {type: 'function with arity 2', value: function(x, y) {}}],
      'function: minarity 1': [{type: 'function with arity 0', value: function() {}}],
      'function: minarity 2': [{type: 'function with arity 0', value: function() {}},
                               {type: 'function with arity 1', value: function(x) {}}],
      natural: naturalCommon,
      objectlike: [],
      strictNatural: naturalCommon.concat([{type: 'object coercing to 0 via null',
                                            value: {valueOf: function() { return null; }}},
                                           {type: 'object coercing to boolean',
                                            value: {valueOf: function() { return true; }}},
                                           {type: 'object coercing to number via string',
                                            value: {valueOf: function() { return '1'; }}}])
    };

    // If the restriction is the constructor of a given type, then all of the above are invalid
    if (restrictionsForPosition.length === 1 && typeof(restrictionsForPosition[0]) === 'function')
      return bogusPrimitives.slice();

    var bogus = bogusPrimitives.filter(function(v) {
      return restrictionsForPosition.indexOf(v.type) === -1 && v.typeclasses.every(function(t) {
        return restrictionsForPosition.indexOf(t) === -1;
      });
    });

    return bogus.concat(restrictionsForPosition.reduce(function(soFar, restriction) {
      if (!isTypeClass(restriction)) return soFar;

      if (bogusForTypeClass[restriction] === undefined)
        throw new Error('No bogus arguments defined for typeclass ' + restriction + ': please fix makeBogusFor');

      return soFar.concat(bogusForTypeClass[restriction]);
    }, []));
  };


  /*
   * Helper functions for building positional arguments that can be supplied to Function.prototype.apply.
   *
   */

  var pickValidForRestriction = function(restriction) {
    var types = {
      'number': 0,
      'function': function() {},
      'function: minarity1': function(x) {},
      'natural': 0
    };

    return {type: restriction, value: types[restriction]};
  };


  var buildAnArgumentsArray = function(typicalArguments, restrictions) {
    var buildArgumentsForPosition = function(arr, restrictions) {
      if (restrictions === NO_RESTRICTIONS) {
        if (arr === ANYVALUE) return [[{type: 'number', value: 42}]];
        return arr.map(function(val) { return [{type: typeof(val), value: val}]; });
      }

      if (arr === ANYVALUE) return restrictions.map(function(r) { return [pickValidForRestriction(r)]; });
      return arr.map(function(arg, i) { return [{type: restrictions[i], value: arg}]; });
    };

    // Assumption: typicalArguments and restrictions have the same length
    if (typicalArguments.length === 0) return [];

    var remaining = buildAnArgumentsArray(typicalArguments.slice(1), restrictions.slice(1));

    var firstPositionalArguments = buildArgumentsForPosition(typicalArguments[0], restrictions[0]);
    if (remaining.length > 0) {
      return firstPositionalArguments.reduce(function(soFar, call) {
        soFar = soFar.concat(remaining.map(function(arr) { return call.concat(arr); }));
        return soFar;
      }, []);
    } else {
      return firstPositionalArguments;
    }
  };


  /*
   * We often want to test that functions throw if certain parameters are not of the required type. This function
   * generates such tests. As well as the function's name (for producing test descriptions) and the function under
   * test, the following arrays must be supplied:
   *
   *  - restrictions:      An array of length equal to the function under test's arity. Each element describes the
   *                       types of permissible values for a particular argument position. It can take one of the
   *                       following forms:
   *                         - The sentinel value NO_RESTRICTIONS exported by this module, indicating that this
   *                           parameter may take any value
   *                         - An array of strings representing the valid types for this parameter
   *                         - A single element which is the constructor function of the only valid object type for this
   *                         position.
   *
   *                       For example,
   *                         [['string'], ['object', 'array'], [[RegExp]]
   *                       denotes a function whose first argument must be a string, whose second can be an object or an
   *                       array and whose last parameter must be a RegExp. Note that 'object' means a real object:
   *                       include 'null' or 'array' if those types are acceptable.
   *
   *                       When supplied a constructor function, an instanceof test is made: any value that has a value
   *                       of the correct type somewhere in its prototype chain will pass.
   *                       TODO: Clarify what things like object mean, w.r.t arrays, functions etc
   *
   *  - typicalArguments:  Either the special sentinel value ANYVALUE, or an array of length equal to the arity of the
   *                       function being tested.
   *
   *                       If equal to ANYVALUE, the test generator will pick arguments that match the restrictions.
   *                       However, if the function being tested has certain expectations about the values it will be
   *                       invoked with, then this array should contain such positional arguments.
   *
   *                       Each element of the array corresponds to a particular positional argument. If this positional
   *                       argument has no particular requirements, then ANYVALUE can be specified here.
   *
   *                       Otherwise the element should be a subarray, with length equal to the correspoding subarray in
   *                       the restrictions array. Each element of the subarray should specify a typical value of type
   *                       specified by the restrictions array. Again, ANYVALUE can be used within this array to let
   *                       the test generator pick.
   *
   *                       If the member of restrictions for a particular position is NO_RESTRICTIONS, then the subarray
   *                       can contain any number of typical values, but must contain at least one.
   *
   * Throws at test generation time if the given restrictions and typical arguments don't match.
   *
   */

  var checkTypeRestrictions = function(name, fnUnderTest, restrictions, typicalArguments) {
    // First, we perform various sanity checks to ensure I have written the spec correctly
    var arity = arityOf(fnUnderTest);

    // We assume checkFunction has ensured that both restrictions and typicalArguments are arrays, and in particular
    // has already converted ANYVALUE to an array of ANYVALUE the same length as restrictions
    if (restrictions.length !== arity)
      throw new Error('Too few restrictions provided to test generation function for ' + name + ': it has arity ' +
                       arity + ' but only ' + restrictions.length + ' restrictions provided.');

    if (typicalArguments.length !== arity)
      throw new Error('Too few valid arguments provided to test generation function for ' + name + ': it has arity ' +
                       arity + ' but only ' + restrictions.length + ' restrictions provided.');

    typicalArguments.forEach(function(g, i) {
      if (g === ANYVALUE) {
        typicalArguments[i] = restrictions[i] !== NO_RESTRICTIONS ?
                                restrictions[i].map(function(_) { return ANYVALUE; }) : [ANYVALUE];
      } else {
        if (g.length === 0)
          throw new Error('No valid arguments supplied for parameter ' + (i + 1) + ' of ' + name);
      }
    });

    verifyRestrictions(name, restrictions, typicalArguments);

    var addOne = function(call) {
      var args = call.map(function(c) { return c.value; });
      var signature = '(' + call.map(function(c) {
        if (c.type === undefined) throw new Error('No type for bogus arg: ' + c.value + ': please fix makeBogusFor!');
        return c.type;
      }).join(', ') + ')';


      it('Throws with type signature ' + signature, function() {
        var fn = function() {
          fnUnderTest.apply(null, args);
        };

        expect(fn).to.throw();
      });
    };

    // Now we've checked that I'm not an idiot, we can generate the tests!
    restrictions.forEach(function(typeRestrictions, i) {
      // Skip if its impossible for an argument at this position to have an invalid type
      if (typeRestrictions === NO_RESTRICTIONS)
        return;

      var left = typicalArguments.slice(0, i);
      var right = typicalArguments.slice(i + 1);
      var argumentsLeft = buildAnArgumentsArray(left, restrictions.slice(0, i));
      var argumentsRight = buildAnArgumentsArray(right, restrictions.slice(i + 1));
      var bogusArguments = makeBogusFor(typeRestrictions);

      var getType = function(t) { return t === null ? null : (Array.isArray(t) ? 'array' : typeof(t)); };

      // Note: we must forEach over bogusArguments first: one or both of the valid argument arrays might
      // be degenerate

      bogusArguments.forEach(function(badArg) {
        if (argumentsLeft.length > 0) {
          argumentsLeft.forEach(function(left) {
            if (argumentsRight.length > 0) {
              argumentsRight.forEach(function(right) {
                addOne(left.concat([badArg]).concat(right));
              });
            } else {
              addOne(left.concat([badArg]));
            }
          });
        } else if (argumentsRight.length > 0) {
          argumentsRight.forEach(function(right) {
            addOne([badArg].concat(right));
          });
        } else {
          addOne([badArg]);
        }
      });

/*
      // We want the message to be 'the parameter' if there's only one
      var posString = restrictions.length > 1 ? positions[i] + ' ' : '';

      var good = constructGoodArgsFor(validArguments, i);
      var l = good.length;


      bogusArgs.forEach(function(bogus) {
        good.forEach(function(goodDescriptor, j) {
          var args = goodDescriptor.before.concat([bogus.value]).concat(goodDescriptor.after);

          // We handle stateful functions as follows: if the last argument is an object with a
          // 'reset' property, then assume this is a function to be called to generate the argument
          var idx = args.length - 1;
          if (typeof(args[idx]) === 'object' && args[idx] !== null && 'reset' in args[idx])
            args[idx] = args[idx].reset();

          var message = good.length === 1 ? '' : ' (' + (j + 1) + ')';
          it('Throws when the ' + posString + 'parameter is ' + bogus.article + bogus.name + message, function() {
            var fn = function() {
              fnUnderTest.apply(null, args);
            };

            expect(fn).to.throw(TypeError);
          });
        });
      });
*/
    });
  };


  // Generate a text fixture code containing tests that check the function throws when invoked with various combinations
  // of bad parameters, and then calls remainingTests to add function-specific tests
  var checkFunction = function(spec, fnUnderTest, remainingTests) {
    var name = spec.name;

    describe(name, function() {
      if ('restrictions' in spec) {
        // It would be somewhat pointless to explicitly say there are no restrictions at all, but check for it
        // just in case
        if (spec.restrictions !== NO_RESTRICTIONS) {
          if (!Array.isArray(spec.restrictions) || (spec.validArguments !== undefined &&
                                                    spec.validArguments !== ANYVALUE &&
                                                    !Array.isArray(spec.validArguments)))
            throw new Error('One (or both) of the restrictions and validArguments in ' + name + '\'s spec is malformed');

          if (spec.validArguments === undefined || spec.validArguments === ANYVALUE)
            spec.validArguments = spec.restrictions.map(function(_) { return ANYVALUE; });

          checkTypeRestrictions(name, fnUnderTest, spec.restrictions, spec.validArguments);
        } else {
          if (spec.validArguments !== undefined && spec.validArguments !== ANYVALUE)
            throw new Error(name + 'has an unneccesary validArguments property. Please remove it');
        }
      } else if ('validArguments' in spec) {
        throw new Error(name + 'has an unneccesary validArguments property. Please remove it');
      }

      remainingTests(fnUnderTest);
    });
  };


  /*
   * Helper function for testing function manipulating other functions. This adds tests that the results are curried
   * in the same "style" as the manipulated function. We make the following assumptions:
   *
   *  - The function being manipulated must have an arity of at least 1
   *  - The caller can supply a function which will take the function to be manipulated and return the result
   *
   * Optionally takes an options object containing the following properties:
   *   - arity:   the arity of the function to supply to the manipulator
   *   - returns: the value to return from the function supplied to the manipulator
   *
   */

  var addCurryStyleTests = function(manipulator, options) {
    options = options || {};
    var arity = options.arity || 1;

    it('When original function is object curried, result is considered object curried for currying purposes',
          function() {
      var f = objectCurryWithArity(arity, function(x) { return options.returns; });
      var manipulated = manipulator(f);
      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        objectCurry(fn);
      };

      expect(fn).to.not.throw();
    });


    it('When original function is bind curried, result is considered bind curried for currying purposes',
        function() {
      var obj = {};
      var f = bindWithContextAndArity(arity, obj, function(x, y) { return options.returns; });
      var manipulated = manipulator(f);
      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        bind(fn);
      };

      expect(fn).to.not.throw();
    });


    it('When original function is curried, result is considered curried for currying purposes', function() {
      var obj = {};
      var f = curryWithArity(arity, function(x) { return options.returns; });
      var manipulated = manipulator(f);
      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        bind(fn);
      };

      expect(fn).to.not.throw();
    });


    it('When original function is not curried, result is considered curried for currying purposes', function() {
      var args = ['a', 'b', 'c', 'd', 'e', 'f'];
      var obj = {};
      var fBody = 'return ' + (options.returns ? options.returns.toString() : 'undefined') + ';';
      var f = Function.apply(Object.create(Function.prototype), args.slice(0, arity).concat([fBody]));
      var manipulated = manipulator(f);
      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        curry(fn);
      };

      expect(fn).to.not.throw();
    });
  };


  /*
   * Helper function for testing function manipulating pairs of other functions. This adds tests that the results are curried
   * in the most consistent "style" as the manipulated functions. We make the following assumptions:
   *
   *  - The caller has exercised the usual case of functions being curried with "curry" or not curried
   *  - The functions being manipulated must have an arity of at least 1
   *  - The caller can supply a function which will take the functions to be manipulated and return the result
   *
   * Optionally takes values to be returned by the functions being manipulated
   *
   */

  var addDoubleCurryStyleTests = function(manipulator, f1Return, f2Return) {
    it('If both functions are object curried, then the result is too', function() {
      var context = null;
      var f1 = objectCurry(function(x) { context = this; return f1Return; });
      var f2 = objectCurry(function(x) {return f2Return; });
      var obj = {};
      obj.manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      obj.manipulated(1);

      expect(context).to.equal(obj);
      var fn = function() {
        if (!arityOf._isCurried(obj.manipulated)) throw new Error('Not curried!');
        // If the result is also objectCurried, then objectCurrying it again won't throw
        objectCurry(obj.manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is object curried, then the result is too (1)', function() {
      var context = null;
      var f1 = objectCurry(function(x) { context = this;  return f1Return; });
      var f2 = function(x) { return f2Return; };
      var obj = {};
      obj.manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      obj.manipulated(1);

      expect(context).to.equal(obj);
      var fn = function() {
        if (!arityOf._isCurried(obj.manipulated)) throw new Error('Not curried!');
        // If the result is also objectCurried, then objectCurrying it again won't throw
        objectCurry(obj.manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is object curried, then the result is too (2)', function() {
      var context = null;
      var f1 = objectCurry(function(x) { context = this;  return f1Return; });
      var f2 = curry(function(x) { return f2Return; });
      var obj = {};
      obj.manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      obj.manipulated(1);

      expect(context).to.equal(obj);
      var fn = function() {
        if (!arityOf._isCurried(obj.manipulated)) throw new Error('Not curried!');
        // If the result is also objectCurried, then objectCurrying it again won't throw
        objectCurry(obj.manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is object curried, then the result is too (3)', function() {
      var context = null;
      var f1 = objectCurry(function(x) { context = this;  return f1Return; });
      var f2 = bind({}, function(x) { return f2Return; });
      var obj = {};
      obj.manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      obj.manipulated(1);

      expect(context).to.equal(obj);
      var fn = function() {
        if (!arityOf._isCurried(obj.manipulated)) throw new Error('Not curried!');
        // If the result is also objectCurried, then objectCurrying it again won't throw
        objectCurry(obj.manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is object curried, then the result is too (4)', function() {
      var context = null;
      var f1 = function(x) { return f1Return; };
      var f2 = objectCurry(function(x) { context = this;  return f2Return; });
      var obj = {};
      obj.manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      obj.manipulated(1);

      expect(context).to.equal(obj);
      var fn = function() {
        if (!arityOf._isCurried(obj.manipulated)) throw new Error('Not curried!');
        // If the result is also objectCurried, then objectCurrying it again won't throw
        objectCurry(obj.manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is object curried, then the result is too (5)', function() {
      var context = null;
      var f1 = curry(function(x) { return f1Return; });
      var f2 = objectCurry(function(x) { context = this;  return f2Return; });
      var obj = {};
      obj.manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      obj.manipulated(1);

      expect(context).to.equal(obj);
      var fn = function() {
        if (!arityOf._isCurried(obj.manipulated)) throw new Error('Not curried!');
        // If the result is also objectCurried, then objectCurrying it again won't throw
        objectCurry(obj.manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is object curried, then the result is too (6)', function() {
      var context = null;
      var f1 = bind({}, function(x) { return f1Return; });
      var f2 = objectCurry(function(x) { context = this;  return f2Return; });
      var obj = {};
      obj.manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      obj.manipulated(1);

      expect(context).to.equal(obj);
      var fn = function() {
        if (!arityOf._isCurried(obj.manipulated)) throw new Error('Not curried!');
        // If the result is also objectCurried, then objectCurrying it again won't throw
        objectCurry(obj.manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If both functions are bound to the same context, then the result is too', function() {
      var context = null;
      var obj = {};
      var f1 = bind(obj, function(x) { return f1Return; });
      var f2 = bind(obj, function(x) { return f2Return; });
      var manipulated = manipulator(f1, f2);
      // Assume that the returned function has arity at least 1
      manipulated(1);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is also bound, then binding it again with the same context won't throw
        bind(obj, manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If both functions are bound to different contexts, then the result is curried in the standard fashion', function() {
      var obj = {};
      var obj2 = {};
      var f1 = bind(obj, function(x) { return f1Return; });
      var f2 = bind(obj2, function(x) { return f2Return; });
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is bound, the other not, then the result is curried in the standard fashion (1)', function() {
      var obj = {};
      var f1 = bind(obj, function(x) { return f1Return; });
      var f2 = function(x) { return f2Return; };
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is bound, the other not, then the result is curried in the standard fashion (2)', function() {
      var obj = {};
      var f1 = bind(obj, function(x) { return f1Return; });
      var f2 = curry(function(x) { return f2Return; });
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is bound, the other not, then the result is curried in the standard fashion (3)', function() {
      var obj = {};
      var f1 = function(x) { return f1Return; };
      var f2 = bind(obj, function(x) { return f2Return; });
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one function is bound, the other not, then the result is curried in the standard fashion (4)', function() {
      var context;
      var obj = {};
      var f1 = curry(function(x) { return f1Return; });
      var f2 = bind(obj, function(x) { return f2Return; });
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If both functions are curried, then the result is too', function() {
      var context;
      var f1 = curry(function(x) { return f1Return; });
      var f2 = curry(function(x) { return f2Return; });
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one functions is curried, the other not, then the result is curried in the standard manner (1)', function() {
      var f1 = curry(function(x) { return f1Return; });
      var f2 = function(x) { return f2Return; };
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If one functions is curried, the other not, then the result is curried in the standard manner (2)', function() {
      var f1 = function(x) { return f1Return; };
      var f2 = curry(function(x) { return f2Return; });
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });


    it('If neither functions is curried then the result is', function() {
      var f1 = function(x) { return f1Return; };
      var f2 = function(x) { return f2Return; };
      var manipulated = manipulator(f1, f2);

      var fn = function() {
        if (!arityOf._isCurried(manipulated)) throw new Error('Not curried!');
        // If the result is curried, then currying again won't throw
        curry(manipulated);
      };

      expect(fn).to.not.throw();
    });
  };


  var toExport = {
    addCurryStyleTests: addCurryStyleTests,
    addDoubleCurryStyleTests: addDoubleCurryStyleTests,
    checkFunction: checkFunction,
    checkModule:   checkModule
  };


  // Ensure our tests don't screw up the sentinel values
  Object.defineProperty(toExport, 'NO_RESTRICTIONS', {configurable: false, enumerable: true,
                                                      writable: false, value: NO_RESTRICTIONS});
  Object.defineProperty(toExport, 'ANYVALUE', {configurable: false, enumerable: true, writable: false, value: ANYVALUE});


  return toExport;
})();
//(function() {
//  "use strict";
//
//
//  // Exports useful functions for testing
//  var testUtils = function(require, exports, module) {
//    var chai = require('chai');
//    var expect = chai.expect;
//
//    var curryModule = require('../curry');
//    var getRealArity = curryModule.getRealArity;
//    var curry = curryModule.curry;
//
//    var utils = require('../utils');
//    var isObjectLike = utils.isObjectLike;
//
//
//    var isFuncTypeClass = function(tc) {
//      return /^function:\s+/.test(tc);
//    };
//
//
//    var prims = ['number', 'boolean', 'undefined', 'object', 'string', 'function'];
//    var isPrimitiveType = function(t) {
//      return prims.indexOf(t) !== -1;
//    };
//
//
//    // Maps typeclass names to the values that will be returned by typeof for an instance of the typeclass.
//    // This allows testTypeRestrictions to verify that I've specified valid validArguments values
//    var nonPrimDict = {'null': 'object', 'array': 'object', 'integer': 'number', 'positive': 'number'};
//    var nonPrimToPrim = function(nP) {
//      if (nP in nonPrimDict)
//        return nonPrimDict[nP];
//      if (isFuncTypeClass(nP))
//        return 'function';
//
//      throw new Error('testUtils typechecking: unrecognised non-primitive' + nP);
//    };
//
//
//    // Returns true when argument is the name of a typeclass that can map to actual values of more than one type
//    var isMultiTypeClass = function(restriction) {
//      return ['arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull'].indexOf(restriction) !== -1;
//    };
//
//
//    // Take an array of arrays—args—where each subarray is a list of acceptable values
//    // for the parameter at that position. Returns a new array of arrays where each subarray
//    // is an acceptable parameter list for the function.
//    var makeGoodArgs = function(args) {
//      var result = [];
//
//      if (args.length === 0)
//        return result;
//
//      var remaining = makeGoodArgs(args.slice(1));
//      args[0].forEach(function(arg) {
//        if (remaining.length > 0) {
//          remaining.forEach(function(rest) {
//            result.push([arg].concat(rest));
//          });
//        } else {
//          result.push([arg]);
//        }
//      });
//
//      return result;
//    };
//
//
//    var makeGoodArgDescriptor = function(b, a) {return {before: b, after: a};};
//
//    // Takes an array of arrays—args—where each subarray is a list of acceptable values
//    // for the parameter at that position, and the parameter position where we are going to
//    // substitute bad data. Returns an array of arg descriptor objects, with before and after
//    // properties: these are the arguments that slot in either side of the bad data.
//    var constructGoodArgsFor = function(goodArgs, paramIndex) {
//      var beforeArgs = makeGoodArgs(goodArgs.slice(0, paramIndex));
//      var afterArgs = makeGoodArgs(goodArgs.slice(paramIndex + 1));
//
//      var result = [];
//      if (beforeArgs.length > 0) {
//        beforeArgs.forEach(function(b) {
//          if (afterArgs.length > 0) {
//            afterArgs.forEach(function(a) {
//              result.push(makeGoodArgDescriptor(b, a));
//            });
//          } else {
//            result.push(makeGoodArgDescriptor(b, []));
//          }
//        });
//      } else {
//        if (afterArgs.length > 0) {
//          afterArgs.forEach(function(a) {
//            result.push(makeGoodArgDescriptor([], a));
//          });
//        } else {
//          result.push(makeGoodArgDescriptor([], []));
//        }
//      }
//
//      return result;
//    };
//
//
//    // Generates an array of possible bogus values. We want a fresh array
//    // every time, in case the function modifies values in some way.
//    var makeBogusFor = function(resSpec) {
//      var primBogus = [
//        {name: 'number', article: 'a ', value: 2, typeclasses: ['integer', 'positive']},
//        {name: 'boolean', article: 'a ', value: true, typeclasses: ['integer', 'positive']},
//        {name: 'string', article: 'a ', value: 'c',
//         typeclasses: ['integer', 'positive', 'arraylike', 'objectlike', 'objectlikeornull']},
//        {name: 'undefined', article: '', value: undefined, typeclasses: []},
//        {name: 'null', article: '', value: null, typeclasses: ['integer', 'positive', 'objectlikeornull']},
//        {name: 'function', article: 'a ', value: function() {},
//         typeclasses: ['function', 'objectlike', 'objectlikeornull']},
//        {name: 'object', article: 'an ', value: {foo: 4},
//         typeclasses: ['integer', 'positive', 'objectlike','objectlikeornull']},
//        {name: 'array', article: 'an ', value: [4, 5, 6],
//         typeclasses: ['arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull']}
//      ];
//
//      // If the restriction is a constructor function, then all of the above will be bogus
//      if (resSpec.length === 1 && typeof(resSpec[0]) === 'function')
//        return primBogus;
//
//      primBogus = primBogus.filter(function(val) {return resSpec.indexOf(val.name) === -1;});
//
//      // Add arraylike test if objects aren't allowed (need to do this seperately as they are of course objects
//      if (resSpec.indexOf('object') === -1)
//        primBogus.push({name: 'arraylike', article: 'an ', value: {'0': 1, '1': 2, 'length': 2},
//         typeclasses: ['arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull']});
//
//      // If the restriction is not a typeclass, then we're done. This assumes we already checked
//      // that typeclasses restrictions only appear in arrays of length 1
//      if (resSpec.length > 1 || !isTypeClass(resSpec[0]))
//        return primBogus;
//
//      resSpec = resSpec[0];
//
//      // Filter on the members of the typeclass
//      var toFilter = isFuncTypeClass(resSpec) ? 'function' : resSpec;
//      primBogus = primBogus.filter(function(val) {return val.typeclasses.indexOf(toFilter) === -1;});
//
//      var badObjectMaker = function(val) {
//        return {valueOf: function() {return val;}};
//      };
//
//      // Add typeclass specific bogus arguments
//
//      if (resSpec === 'integer' || resSpec === 'positive') {
//        primBogus.push({name: 'positive float', article: 'a ', value: 1.1});
//        primBogus.push({name: 'negative float', article: 'a ', value: -1.1});
//        primBogus.push({name: 'positive infinity', article: '', value: Number.POSITIVE_INFINITY});
//        primBogus.push({name: 'negative infinity', article: '', value: Number.NEGATIVE_INFINITY});
//        primBogus.push({name: 'NaN', article: '', value: NaN});
//        primBogus.push({name: 'string that coerces to NaN', article: 'a ', value: 'abc'});
//        primBogus.push({name: 'string that coerces to float', article: 'a ', value: '1.1'});
//        primBogus.push({name: 'string that coerces to negative float', article: 'a ', value: '-1.1'});
//        primBogus.push({name: 'object that coerces to float', article: 'an ', value: badObjectMaker(1.1)});
//        primBogus.push({name: 'object that coerces to negative float', article: 'an ', value: badObjectMaker(-1.1)});
//        primBogus.push({name: 'object that coerces to infinity', article: 'an ',
//                        value: badObjectMaker(Number.POSITIVE_INFINITY)});
//        primBogus.push({name: 'object that coerces to negative infinity', article: 'an ',
//                        value: badObjectMaker(Number.NEGATIVE_INFINITY)});
//        primBogus.push({name: 'object that coerces to NaN', article: 'an ', value: badObjectMaker(NaN)});
//      }
//
//      if (resSpec === 'positive') {
//        primBogus.push({name: 'negative integer', article: 'a ', value: -1});
//        primBogus.push({name: 'string that coerces to a negative integer', article: 'a ', value: '-2'});
//        primBogus.push({name: 'object that coerces to a negative integer', article: 'a ', value: badObjectMaker(-3)});
//      }
//
//
//      var bogusFuncs = [
//        function() {},
//        function(x) {},
//        function(x, y) {},
//        function(x, y, z) {},
//        function(w, x, y, z) {}
//      ];
//
//
//      var arityResults = /function:\s+arity\s+(\d+)/.exec(resSpec);
//      var i, l;
//
//      if (arityResults && arityResults.length > 0) {
//        var arity = arityResults[1] - 0;
//        for (i = 0, l = bogusFuncs.length; i < l; i++) {
//          if (i !== arity) {
//            primBogus.push({name: 'function of arity ' + i, article: 'a ', value: bogusFuncs[i]});
//            primBogus.push({name: 'curried function of arity ' + i, article: 'a ', value: curry(bogusFuncs[i])});
//          }
//        }
//      } else {
//        var minArityResults = /function:\s+minarity\s+(\d+)/.exec(resSpec);
//        if (minArityResults && minArityResults.length > 0) {
//          var minArity = minArityResults[1] - 0;
//          for (i = 0; i < minArity; i++) {
//            primBogus.push({name: 'function of arity ' + i, article: 'a ', value: bogusFuncs[i]});
//            primBogus.push({name: 'curried function of arity ' + i, article: 'a ', value: curry(bogusFuncs[i])});
//          }
//        }
//      }
//
//
//      return primBogus;
//    };
//
//
//    // If I've written a function taking 10 parameters, then something has gone terribly wrong!
//    var positions = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth'];
//
//
//    // Before testTypeRestrictions generates the type tests, it is prudent to ensure I have written the spec correctly.
//    // Specifically, we need to ensure that if the "restrictions" field says that, for example, parameter 0 can be a
//    // number or a boolean, then the "validArguments" for that parameter should contain a number and a boolean (at the
//    // same indices as their respective restrictions).
//    //
//    // The task is complicated somewhat by the function typeclasses for functions of specific arity, and the "multi"
//    // typeclasses: arraylike etc, which map to more than one type.
//    //
//    // The function below performs this verification.
//
//    var verifyRestrictions = function(name, restrictions, validArguments) {
//      restrictions.forEach(function(resSpec, i) {
//        var errorPre = name + ' spec incorrect for parameter ' + (i + 1) + ': ';
//
//        // resSpec is an array of restrictions for parameter i
//        resSpec.forEach(function(r, j) {
//          // If a function accepts a specific type of object e.g. RegExp, then that should be the only possible
//          // restriction for that position: for example, we shouldn't have a parameter that can be a RegExp or a boolean.
//          if (typeof(r) === 'function') {
//            if (resSpec.length > 1)
//              throw new Error(errorPre + 'A constructor must be the only restriction for that parameter!');
//
//            if (!(validArguments[i][j] instanceof r))
//              throw new Error(errorPre + 'The example argument is not an instance of the given constructor');
//
//            return;
//          }
//
//          if (typeof(r) !== 'string')
//            throw new Error(errorPre + 'Restriction ' + (j + 1) + ' has type ' + typeof(r));
//
//          // If the restriction is a typeclass, it should be the only one
//          if (isTypeClass(r) && resSpec.length > 1)
//            throw new Error(errorPre + 'A typeclass must be the only restriction for that parameter!');
//
//          // Sanity check the validArguments for this parameter. They should be the type I claim is permissable!
//          if (!isMultiTypeClass(r)) {
//            var t = isPrimitiveType(r) ? r : nonPrimToPrim(r);
//            if (typeof(validArguments[i][j]) !== t)
//              throw new Error(errorPre + 'valid argument ' + (j + 1) + ' has type ' + typeof(validArguments[i][j]) +
//                              ', value ' + validArguments[i][j] + ', restriction demands type ' + t);
//            return;
//          }
//
//          // We now know the restriction is a multi typeclass. For 'arraylike' and 'strictarraylike', we require that
//          // validArguments contains a value for each permissible member of the typeclass. For 'objectlike' we require
//          // only one example.
//
//          if (r === 'objectlike' || r === 'objectlikeornull') {
//            var withNull = r === 'objectlikeornull';
//            if (!isObjectLike(validArguments[i][j], withNull))
//              throw new Error(errorPre + 'validArguments ' + (j + 1) + ' (' + validArguments[i][j] + ') is not objectlike');
//
//            return;
//          }
//
//          var validArgsType = validArguments[i].map(function(x) {return Array.isArray(x) ? 'array' : typeof(x);});
//          var correctLength = r === 'arraylike' ? 3 : 2;
//
//          if (validArguments[i].length !== correctLength)
//            throw new Error(errorPre + 'Not enough examples of ' + r + ' - expected ' + correctLength + ' found ' +
//                            validArguments[i].length);
//
//          if (validArgsType.indexOf('array') === -1 || validArgsType.indexOf('object') === -1 ||
//              (correctLength === 3 && validArgsType.indexOf('string') === -1))
//            throw new Error(errorPre + 'Valid argument for ' + r + ' have wrong type');
//        });
//      });
//    };

//
//    var makeArrayLike = function() {
//      var args = [].slice.call(arguments);
//
//      var result = {};
//      if (args.length === 1 && typeof(args[0]) === 'object' && ('length' in args[0])) {
//        // We've been passed an arraylike: copy it
//        for (var k in args[0])
//          result[k] = args[0][k];
//
//        return result;
//      }
//
//      args.forEach(function(arg, i) {
//        result[i] = arg;
//      });
//
//      result.length = args.length;
//
//      // We provide every, indexOf and slice for testing convenience
//      result.every = function() {
//        return [].every.apply(this, arguments);
//      };
//
//      result.slice = function() {
//        return makeArrayLike(this);
//      };
//
//
//      result.indexOf = function(val, from) {
//        from = from || 0;
//
//        for (var i = from, l = this.length; i < l; i++)
//          if (this[i] === val)
//            return i;
//
//        return -1;
//      };
//
//
//      return result;
//    };
//
//
//    var addFunctionIsCurriedTest = function(fnUnderTest) {
//      it('Is curried', function() {
//        expect(fnUnderTest.length).to.equal(1);
//        expect(getRealArity(fnUnderTest)).to.not.equal(1);
//      });
//    };

//    // Deeply check two objects for equality (ignoring functions)
//    var checkObjectEquality = function(obj1, obj2) {
//      var obj1Keys = Object.getOwnPropertyNames(obj1);
//      var obj2Keys = Object.getOwnPropertyNames(obj2);
//
//      if (obj1Keys.length !== obj2Keys.length)
//        return false;
//
//      return obj1Keys.every(function(k, i) {
//        return checkEquality(obj1[k], obj2[k], true);
//      });
//    };
//
//
//    // Deeply check two arrays for equality (ignoring functions)
//    var checkArrayEquality = function(arr1, arr2) {
//      if (arr1.length !== arr2.length)
//        return false;
//
//      return arr1.every(function(val, i) {
//        return checkEquality(val, arr2[i], true);
//      });
//    };
//
//
//    // Check two arrays for identity of contents, ignoring order
//    var checkArrayContent = function(arr1, arr2, sortFn) {
//      if (!Array.isArray(arr1) || !Array.isArray(arr2) || arr1.length !== arr2.length)
//        return false;
//
//      var sortArgs = [];
//      if (typeof(sortFn) === 'function')
//        sortArgs.push(sortFn);
//
//      var a1 = arr1.slice();
//      var a2 = arr2.slice();
//
//      a1.sort.apply(a1, sortArgs);
//      a2.sort.apply(a2, sortArgs);
//      return a1.every(function(val, i) {
//        return val === a2[i];
//      });
//    };
//
//
//    // Deeply check two values for equality. If acceptFunctions is true,
//    // then two functions will blindly be assumed to be equal.
//    var checkEquality = function(obj1, obj2, acceptFunctions) {
//      acceptFunctions = acceptFunctions || false;
//
//      if (typeof(obj1) !== typeof(obj2))
//        return false;
//
//      // Short-circuit if we can (needed for the 'constant' tests)
//      if (obj1 === obj2)
//        return true;
//
//      var objType = typeof(obj1);
//
//      // If the initial result is a function, then we've written
//      // the test incorrectly
//      if (objType === 'function' && !acceptFunctions)
//        throw new Error('Test error: trying to compare functions!');
//
//      if (objType === 'object') {
//        if (Array.isArray(obj1)) {
//          if (!Array.isArray(obj2))
//            return false;
//
//          return checkArrayEquality(obj1, obj2);
//        } else if (obj1 === null || obj2 === null) {
//          return obj1 === obj2;
//        } else {
//          return checkObjectEquality(obj1, obj2);
//        }
//      } else if (objType === 'function') {
//        // We can't check functions, so just wing it
//        return true;
//      } else {
//        // We already know obj1 !== obj2
//        return false;
//      }
//    };
//
//
//    // Three helper functions for the test generation code below
//    var checkFunction = function(curried) {
//      return function() {
//        expect(curried).to.be.a('function');
//      };
//    };
//
//
//    var checkLength = function(curried) {
//      return function() {
//        expect(curried.length).to.equal(1);
//      };
//    };
//
//
//    module.exports = {
//      addFunctionIsCurriedTest: addFunctionIsCurriedTest,
//      checkArrayContent: checkArrayContent,
//      checkArrayEquality: checkArrayEquality,
//      checkEquality: checkEquality,
//      checkObjectEquality: checkObjectEquality,
//      exportsFunction: exportsFunction,
//      exportsProperty: exportsProperty,
//      makeArrayLike: makeArrayLike,
//    };
//  };
//
//
//  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
//  if (typeof(define) === "function") {
//    define(function(require, exports, module) {
//      testUtils(require, exports, module);
//    });
//  } else {
//    testUtils(require, exports, module);
//  }
//})();
