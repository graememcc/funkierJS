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


  var typeclasses = [/*arraylike', 'integer', */ 'function: arity 1', 'function: minarity 1', 'function: minarity 2',
                     'natural', /*'objectlike', 'objectlikeornull', */'positive', 'strictArrayLike', 'strictNatural'];

  var isTypeClass = function(restriction) {
    if (typeclasses.indexOf(restriction) !== -1)
      return true;

    return false;
  };


  /*
   * Certain typeclasses demand more than one example of their ilk. We call these multiTypeClasses. They are as
   * follows:
   *   strictArrayLike: values can be arrays, or array-like objects with length and equivalent numeric parmeters
   *                    but not strings
   *
   */

  var isMultiTypeClass = function(restriction) {
    return restriction === 'strictArrayLike';
//    return ['arraylike', 'strictarraylike', 'objectlike', 'objectlikeornull'].indexOf(restriction) !== -1;
  };


  var verifyMultiTypeClassRestriction = function(typeClass, values, failBecause) {
    var expectedTypesForClass = {
      'strictArrayLike': ['array', 'object']
    };

    var typesFound = values.map(function(v) {
      var verifier = restrictionVerifiers[typeClass];
      if (verifier === undefined)
        failBecause('No verifier for typeclass ' + typeClass);

      if (!verifier(v))
        failBecause('type is incorrect found ' + typeof(v) + ' but restriction demands ' + typeClass);

      return Array.isArray(v) ? 'array' : (v === null ? 'null' : typeof(v));
    });

    var typesRequired = expectedTypesForClass[typeClass];
    if (typesRequired === undefined)
      failBecause('Typeclass ' + typeClass + ' is incorrectly defined. Please fix verifyMultiTypeClassRestriction');

    if (typesFound.length !== typesFound.length)
      failBecause('Mismatch in terms of number of examples provided for ' + typeClass + ' typeclass. Expected ' +
                  typesRequired.length + ' but found ' + typesFound.length);

    typesFound.sort();
    typesRequired.sort();
    typesFound.forEach(function(t, i) {
      if (t !== typesRequired[i])
        failBecause('Unexpected type ' + t + ' found');
    });
  };



  var primitiveTypeOf = {
    'function': 'function',
    'function: arity 1': 'function',
    'function: arity 2': 'function',
    'function: minarity 1': 'function',
    'function: minarity 2': 'function',
    'function: maxarity 2': 'function',
    'natural':  'number',
    'objectlike': 'object',
    'positive':  'number',
    'strictNatural':  'number',
    'string': 'string'
  };


  var restrictionVerifiers = {
    'function': function(f) { return typeof(f) === 'function'; },
    'function: arity 1': function(f) { return typeof(f) === 'function' && f.length === 1; },
    'function: arity 2': function(f) { return typeof(f) === 'function' && f.length === 2; },
    'function: minarity 1': function(f) { return typeof(f) === 'function' && f.length >= 1; },
    'function: minarity 2': function(f) { return typeof(f) === 'function' && f.length >= 2; },
    'function: maxarity 2': function(f) { return typeof(f) === 'function' && f.length <= 2; },
    'natural': function(n) { return (n - 0) >= 0 && (n - 0) !== Number.POSITIVE_INFINITY; },
    'objectlike': function(o) { return (typeof(o) === 'object' && o !== null) || typeof(o) === 'function' ||
                                        typeof(o) === 'string';},
    'positive': function(n) { return (n - 0) > 0 && (n - 0) !== Number.POSITIVE_INFINITY; },
    'strictArrayLike': function(a) { return typeof(a) !== 'string' &&
                                     (Array.isArray(a) || (('0' in a) && ('length' in a))); },
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

        // If the restriction is a typeclass, it should be the only one
        if (isTypeClass(expectedType) && typeRestrictions.length > 1)
          failBecause('A typeclass must be the only restriction for that parameter!');

        if (isMultiTypeClass(expectedType))
          return;

        if (typeof(typicalValue) !== primitiveTypeOf[expectedType])
          failBecause('Sample argument ' + (j + 1) + ' has type ' + typeof(typicalValue) +
                      ', restriction demands ' + expectedType);

        if (!restrictionVerifiers[expectedType](typicalValue))
            failBecause('Typical value ' + (j + 1) + ' for parameter ' + (i + 1) + ' is not of type ' + expectedType);
      });

      // For a multi typeclass, examples should have been provided for each possible type in the typeclass
      if (isMultiTypeClass(typeRestrictions[0]))
        verifyMultiTypeClassRestriction(typeRestrictions[0], typicalArguments[i], failBecause);
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
      {type: 'number',    value: 2,             typeclasses: [/*'integer',*/ 'natural', 'positive', 'strictNatural']},
      {type: 'boolean',   value: true,          typeclasses: [/*'integer',*/ 'natural', 'positive']},
      {type: 'string',    value: 'x',
         typeclasses: [/* 'integer', */ 'natural', 'positive', /* 'arraylike',*/ 'objectlike'/*, 'objectlikeornull' */]},
      {type: 'undefined', value: undefined,     typeclasses: []},
      {type: 'null',      value: null,          typeclasses: [/*'integer',*/ 'natural', /*'objectlikeornull' */]},
      {type: 'function',  value: function() {}, typeclasses: ['function: maxarity 2', 'objectlike', /*'objectlikeornull' */]},
      {type: 'object',    value: {foo: 4},      typeclasses: [/*'integer', */ 'natural', 'positive', 'objectlike'/*,'objectlikeornull' */]},
      {type: 'array',     value: [4, 5, 6],     typeclasses: [/*'arraylike', */ 'natural', 'objectlike', 'positive', 'strictArrayLike', /*'objectlikeornull' */]}
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
      'function: arity 2':    [{type: 'function with arity 0', value: function() {}},
                               {type: 'function with arity 1', value: function(x) {}},
                               {type: 'function with arity 3', value: function(x, y, z) {}}],
      'function: minarity 1': [{type: 'function with arity 0', value: function() {}}],
      'function: minarity 2': [{type: 'function with arity 0', value: function() {}},
                               {type: 'function with arity 1', value: function(x) {}}],
      'function: maxarity 2': [{type: 'function with arity 3', value: function(x, y, z) {}},
                               {type: 'function with arity 4', value: function(w, x, y, z) {}}],
      natural: naturalCommon,
      objectlike: [],
      positive: naturalCommon.concat([{type: 'zero', value: 0}]),
      strictArrayLike: [],
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


  var makeArrayLike = function() {
    var args = [].slice.call(arguments);

    var result = {};
    if (args.length === 1 && typeof(args[0]) === 'object' && ('length' in args[0])) {
      // We've been passed an arraylike: copy it
      for (var k in args[0])
        result[k] = args[0][k];

      return result;
    }

    args.forEach(function(arg, i) {
      result[i] = arg;
    });

    result.length = args.length;

    // We provide every, indexOf and slice for testing convenience
    result.every = function() {
      return [].every.apply(this, arguments);
    };

    result.slice = function() {
      return makeArrayLike(this);
    };

    result.indexOf = function(val, from) {
      from = from || 0;

      for (var i = from, l = this.length; i < l; i++)
        if (this[i] === val)
          return i;

      return -1;
    };

    return result;
  };


  var toExport = {
    addCurryStyleTests: addCurryStyleTests,
    addDoubleCurryStyleTests: addDoubleCurryStyleTests,
    checkFunction: checkFunction,
    checkModule:   checkModule,
    makeArrayLike: makeArrayLike
  };


  // Ensure our tests don't screw up the sentinel values
  Object.defineProperty(toExport, 'NO_RESTRICTIONS', {configurable: false, enumerable: true,
                                                      writable: false, value: NO_RESTRICTIONS});
  Object.defineProperty(toExport, 'ANYVALUE', {configurable: false, enumerable: true, writable: false, value: ANYVALUE});


  return toExport;
})();
