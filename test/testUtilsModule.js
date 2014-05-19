(function() {
  // Deliberate outer scope here: we want a non-strict scope where "this" points to the global

  var global = this;
  var print = this.window === undefined ? this.print : undefined; // SpiderMonkey JS shell

  return function() {
    "use strict";


    var testFixture = function(require, exports) {
      var chai = require('chai');
      var expect = chai.expect;

      var utils = require('../utils');

      var testUtils = require('./testUtils');
      var describeModule = testUtils.describeModule;
      var describeFunction = testUtils.describeFunction;


      var expectedObjects = [];
      var expectedFunctions = ['valueStringifier', 'isArrayLike', 'checkArrayLike', 'isObjectLike',
                               'checkIntegral', 'checkPositiveIntegral', 'checkObjectLike', 'defineFunction', 'help'];
      describeModule('utils', utils, expectedObjects, expectedFunctions);


      var vsSpec = {
        name: 'valueStringifier',
        arity: 1
      };


      describeFunction(vsSpec, utils.valueStringifier, function(valueStringifier) {
        var f = function() {};
        var o = {};
        var tests = [
          {name: 'number', value: 1, result: '1'},
          {name: 'boolean', value: true, result: 'true'},
          {name: 'string', value: 'a', result: '\'a\''},
          {name: 'function', value: f, result: f.toString()},
          {name: 'object', value: o, result: '{' + o.toString() + '}'},
          {name: 'object with toString', value: {toString: function() {return '***';}},
                                         result: '{***}'},
          {name: 'array', value: [1, 2], result: '[1, 2]'},
          {name: 'undefined', value: undefined, result: 'undefined'},
          {name: 'null', value: null, result: 'null'}
        ];


        tests.forEach(function(t) {
          var name = t.name;

          it('Behaves correctly for ' + name, function() {
            var s = valueStringifier(t.value);
            var expected = t.result;

            expect(s).to.equal(expected);
          });
        });
      });


      var arrayLikeTests = [
        {name: 'number', value: 1, result: false},
        {name: 'boolean', value: true, result: false},
        {name: 'string', value: 'a', result: true},
        {name: 'function', value: function() {}, result: false},
        {name: 'object', value: {}, result: false},
        {name: 'array', value: [1, 2], result: true},
        {name: 'undefined', value: undefined, result: false},
        {name: 'null', value: null, result: false},
        {name: 'arrayLike', value: {'0': 'a', '1': 'b', 'length': 2}, result: true}
      ];


      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter
      describe('isArrayLike', function() {
        var isArrayLike = utils.isArrayLike;


        arrayLikeTests.forEach(function(t) {
          var name = t.name;

          it('Behaves correctly for ' + name, function() {
            var b = isArrayLike(t.value);
            var expected = t.result;

            expect(b).to.equal(expected);
          });
        });


        it('Behaves correctly with string when noStrings parameter explicitly false', function() {
          expect(isArrayLike('a', false)).to.be.true;
        });


        it('Behaves correctly with string when noStrings parameter explicitly true', function() {
          expect(isArrayLike('a', true)).to.be.false;
        });
      });



      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter
      describe('checkArrayLike', function() {
        var checkArrayLike = utils.checkArrayLike;


        var shouldFail = arrayLikeTests.filter(function(test) {return test.result === false;});
        var shouldPass = arrayLikeTests.filter(function(test) {return test.result === true;});

        shouldFail.forEach(function(test) {
          var name = test.name;


          it('Behaves correctly for ' + name, function() {
            var fn = function() {
              checkArrayLike(test.value);
            };

            expect(fn).to.throw(TypeError);
          });


          it('Returns correct exception for ' + name, function() {
            var message = 'This was an error';
            var fn = function() {
              checkArrayLike(test.value, {message: message});
            };

            expect(fn).to.throw(message);
          });
        });


        shouldPass.forEach(function(test) {
          var name = test.name;


          it('Doesn\'t throw for ' + name, function() {
            var fn = function() {
              checkArrayLike(test.value);
            };

            expect(fn).to.not.throw(TypeError);
          });


          it('Behaves correctly when dontSlice in options ' + name, function() {
            var v = checkArrayLike(test.value, {dontSlice: true});

            expect(v).to.equal(test.value);
          });


          it('Behaves correctly when dontSlice explicitly false in options ' + name, function() {
            var v = checkArrayLike(test.value, {dontSlice: false});

            if (name === 'string') {
              expect(v).to.equal(test.value);
            } else {
              expect(v).to.not.equal(test.value);
              // Need to manually check deep equality due to arraylikes being transformed to arrays
              for (var i = 0, l = test.value.length; i < l; i++)
                expect(v[i]).to.equal(test.value[i]);
            }
          });


          it('Behaves correctly when dontSlice not in options ' + name, function() {
            var v = checkArrayLike(test.value);

            if (name === 'string') {
              expect(v).to.equal(test.value);
            } else {
              expect(v).to.not.equal(test.value);
              // Need to manually check deep equality due to arraylikes being transformed to arrays
              for (var i = 0, l = test.value.length; i < l; i++)
                expect(v[i]).to.equal(test.value[i]);
            }
          });
        });


        it('Doesn\'t accept strings when relevant parameter passed in (1)', function() {
          var fn = function() {
            checkArrayLike('abc', {noStrings: true});
          };

          expect(fn).to.throw(TypeError);
        });


        it('Doesn\'t accept strings when relevant parameter passed in (2)', function() {
          var message = 'Noooo, no strings here!';
          var fn = function() {
            checkArrayLike('abc', {noStrings: true, message: message});
          };

          expect(fn).to.throw(message);
        });


        it('Accepts strings when relevant parameter explicitly passed in', function() {
          var s = checkArrayLike('abc', {noStrings: false});

          expect(s).to.equal('abc');
        });
      });


      var objectLikeTests = [
        {name: 'number', value: 1, result: false},
        {name: 'boolean', value: true, result: false},
        {name: 'string', value: 'a', result: true},
        {name: 'function', value: function() {}, result: true},
        {name: 'object', value: {}, result: true},
        {name: 'array', value: [1, 2], result: true},
        {name: 'undefined', value: undefined, result: false},
        {name: 'null', value: null, result: false}
      ];


      describe('isObjectLike', function() {
        var isObjectLike = utils.isObjectLike;


        objectLikeTests.forEach(function(t) {
          var name = t.name;

          it('Behaves correctly for ' + name, function() {
            var b = isObjectLike(t.value);
            var expected = t.result;

            expect(b).to.equal(expected);
          });
        });


        var addOptionTests = function(allowNull, strict) {
          it('Behaves correctly for null when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike(null, {allowNull: allowNull, strict: strict})).to.equal(allowNull);
          });


          it('Behaves correctly for function when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike(function() {}, {allowNull: allowNull, strict: strict})).to.equal(!strict);
          });


          it('Behaves correctly for string when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike('a', {allowNull: allowNull, strict: strict})).to.equal(!strict);
          });


          it('Behaves correctly for array when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike([1], {allowNull: allowNull, strict: strict})).to.equal(!strict);
          });


          it('Behaves correctly for object when allowNull ' + allowNull + ' and strict ' + strict, function() {
            expect(isObjectLike({}, {allowNull: allowNull, strict: strict})).to.be.true;
          });
        };


        addOptionTests(false, false);
        addOptionTests(false, true);
        addOptionTests(true, false);
        addOptionTests(true, true);
      });


      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter
      describe('checkObjectLike', function() {
        var checkObjectLike = utils.checkObjectLike;


        var shouldFail = objectLikeTests.filter(function(test) {return test.result === false;});
        var shouldPass = objectLikeTests.filter(function(test) {return test.result === true;});

        shouldFail.forEach(function(test) {
          var name = test.name;


          it('Behaves correctly for ' + name, function() {
            var fn = function() {
              checkObjectLike(test.value);
            };

            expect(fn).to.throw(TypeError);
          });


          it('Returns correct exception for ' + name, function() {
            var message = 'This was an error';
            var fn = function() {
              checkObjectLike(test.value, {message: message});
            };

            expect(fn).to.throw(message);
          });
        });


        shouldPass.forEach(function(test) {
          var name = test.name;


          it('Doesn\'t throw for ' + name, function() {
            var fn = function() {
              checkObjectLike(test.value);
            };

            expect(fn).to.not.throw(TypeError);
          });


          it('Returns its argument for ' + name, function() {
            expect(checkObjectLike(test.value)).to.equal(test.value);
          });
        });


        it('Doesn\'t accept null when relevant parameter explicitly passed in (1)', function() {
          var fn = function() {
            checkObjectLike(null, {allowNull: false});
          };

          expect(fn).to.throw(TypeError);
        });


        it('Doesn\'t accept null when relevant parameter explicitly passed in (2)', function() {
          var message = 'Noooo, no null here!';
          var fn = function() {
            checkObjectLike(null, {allowNull: false, message: message});
          };

          expect(fn).to.throw(message);
        });


        it('Accepts null when relevant parameter passed in', function() {
          var o = checkObjectLike(null, {allowNull: true});

          expect(o).to.equal(null);
        });


        var addStrictTests = function(type, val) {
          it('Accepts ' + type + ' when strict parameter explicitly false', function() {
            var o = checkObjectLike(val, {strict: false});

            expect(o).to.equal(val);
          });


          it('Doesn\'t accept ' + type + ' when strict parameter true (1)', function() {
            var fn = function() {
              checkObjectLike(val, {strict: true});
            };

            expect(fn).to.throw(TypeError);
          });


          it('Doesn\'t accept ' + type + ' when relevant strict parameter true (2)', function() {
            var message = 'Noooo, only objects here!';
            var fn = function() {
              checkObjectLike(val, {strict: true, message: message});
            };

            expect(fn).to.throw(message);
          });
        };


        addStrictTests('function', function() {});
        addStrictTests('string', 'abc');
      });


      // The following arrays are for generating tests that exercise checkIntegral/checkPositiveIntegral

      var notNumericTests = [
        {name: 'string', value: 'a'},
        {name: 'function', value: function() {}},
        {name: 'object', value: {}},
        {name: 'array', value: [1, 2]},
        {name: 'undefined', value: undefined}
      ];


      var nonIntegralTests = [
        {name: 'NaN', value: NaN, result: false},
        {name: 'negative infinity', value: Number.NEGATIVE_INFINITY, result: false},
        {name: 'positive infinity', value: Number.POSITIVE_INFINITY, result: false},
        {name: 'negative float', value: -1.1, result: false},
        {name: 'float', value: 2.2, result: false},
        {name: 'string containing float', value: '0.1', result: false},
        {name: 'object evaluating to float', value: {valueOf: function() {return 1.1;}}, result: false},
      ];


      var positiveIntegralTests = [
        {name: 'integer', value: 2, result: true},
        {name: 'null', value: null, result: true}, // null coerces to 0
        {name: 'true', value: true, result: true}, // booleans should coerce to numbers
        {name: 'false', value: false, result: true},
        {name: 'string containing positive integer', value: '1', result: true},
        {name: 'object evaluating to positive integer', value: {valueOf: function() {return 2;}}, result: true},
      ];


      var negativeIntegralTests = [
        {name: 'negative integer', value: -5, result: false},
        {name: 'string containing negative integer', value: '-1', result: true},
        {name: 'object evaluating to negative integer', value: {valueOf: function() {return -3;}}, result: true},
      ];


      // All the tests for the numeric tests will have the same shape, and use the same data
      var addNumericTests = function(fnUnderTest, positiveOnly) {
        var addOne = function(name, value, ok) {
          it('Behaves correctly for ' + name, function() {
            var result = null;
            var fn = function() {
              result = fnUnderTest(value);
            };

            if (!ok) {
              expect(fn).to.throw(TypeError);
            } else {
              expect(fn).to.not.throw(TypeError);
              expect(result).to.equal(value - 0);
            }
          });


          if (ok)
            return;


          it('Returns correct exception for ' + name, function() {
            var message = 'This was an error';
            var fn = function() {
              fnUnderTest(value, message);
            };

            expect(fn).to.throw(message);
          });
        };


        notNumericTests.forEach(function(t) {
          addOne(t.name, t.value, false);
        });


        nonIntegralTests.forEach(function(t) {
          addOne(t.name, t.value, false);
        });


        positiveIntegralTests.forEach(function(t) {
          addOne(t.name, t.value, true);
        });


        negativeIntegralTests.forEach(function(t) {
          addOne(t.name, t.value, !positiveOnly);
        });
      };


      // We deliberately use describe rather than our own describeFunction here
      // due to the optional parameter
      describe('checkIntegral', function() {
        var checkIntegral = utils.checkIntegral;


        addNumericTests(checkIntegral, false);
      });


      describe('checkPositiveIntegral', function() {
        var checkPositiveIntegral = utils.checkPositiveIntegral;


        addNumericTests(checkPositiveIntegral, true);
      });


      describe('defineFunction', function() {
        var defineFunction = utils.defineFunction;


        var addThrowsIfMoreThanOneTests = function(type, value) {
          it('Throws when more than one ' + type + '(1)', function() {
            var args = [];
            args.push('name: testFunc');
            args.push('signature: a: any');
            args.push(type === 'plugin' ? 'plugin: foo' : 'classification: foo');
            args.push(value);
            args.push('explanatory text');
            args.push(function() {});

            var fn = function() {
              defineFunction.apply(null, args);
            };

            expect(fn).to.throw(TypeError);
          });



          it('Throws when more than one ' + type + '(2)', function() {
            var args = [];
            args.push('name: testFunc');
            args.push('signature: a: any');
            args.push(type === 'plugin' ? 'plugin: foo' : 'classification: foo');
            args.push('explanatory text');
            args.push(value);
            args.push(function() {});

            var fn = function() {
              defineFunction.apply(null, args);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var addThrowsIfNoneTest = function(type) {
          it('Throws when no ' + type, function() {
            var args = [];
            if (type !== 'name')
              args.push('name: testFunc');
            if (type !== 'signature')
              args.push('signature: a: any');
            if (type !== 'plugin' && type !== 'classification')
              args.push(type === 'plugin' ? 'plugin: foo' : 'classification: foo');
            args.push('explanatory text');
            if (type !== 'function')
              args.push(function() {});

            var fn = function() {
              defineFunction.apply(null, args);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var addThrowsIfFnNotLastTest = function(isPlugin) {
          it('Throws when function not last (isPlugin: ' + isPlugin + ')', function() {
            var args = [];
            args.push(function() {});
            args.push('name: testFunc');
            args.push('signature: a: any');
            args.push(isPlugin ? 'plugin: foo' : 'classification: foo');

            var fn = function() {
              defineFunction.apply(null, args);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var addThrowsWithNonStringTest = function(message, value, isPlugin) {
          it('Throws when a value is a ' + message + ' (plugin: ' + isPlugin + ')', function() {
            var args = [];
            args.push(function() {});
            args.push('name: testFunc');
            args.push('signature: a: any');
            args.push(isPlugin ? 'plugin: foo' : 'classification: foo');
            args.push(value);
            args.push(function() {});

            var fn = function() {
              defineFunction.apply(null, args);
            };

            expect(fn).to.throw(TypeError);
          });
        };


        var addIgnoresCapitalisationTests = function() {
          var addOne = function(toCapitalise, isPlugin) {
            var message = toCapitalise.join(' and ');
            var capName = toCapitalise.indexOf('name') !== -1;
            var capSig = toCapitalise.indexOf('signature') !== -1;
            var capClassification = toCapitalise.indexOf('classification') !== -1;
            var capPlugin = toCapitalise.indexOf('plugin') !== -1;

            it('Doesn\'t throw when ' + message + ' capitalised (plugin: ' + isPlugin + ')', function() {
              var args = [];
              args.push((capName ? 'NaMe' : 'name') + ': testFunc');
              args.push((capSig ? 'SIGNATURE' : 'signature') + ': a: any');
              args.push((isPlugin ? (capPlugin ? 'plUGIN' : 'plugin') :
                          (capClassification? 'CLASSIFICATION' : 'classification')) + ': foo');
              args.push('Some text');
              args.push(function() {});

              var fn = function() {
                defineFunction.apply(null, args);
              };

              expect(fn).to.not.throw(TypeError);
            });
          };

          var options1 = ['name', 'signature', 'classification'];
          for (var i = 1; i < Math.pow(2, options1.length); i++) {
            var asBin = i.toString(2);
            while (asBin.length < options1.length)
              asBin = '0' + asBin;

            addOne(options1.filter(function(_, i) {return asBin[i] === '1';}), false);
          }

          var options2 = ['name', 'signature', 'plugin'];
          for (var i = 1; i < Math.pow(2, options1.length); i++) {
            var asBin = i.toString(2);
            while (asBin.length < options1.length)
              asBin = '0' + asBin;

            addOne(options1.filter(function(_, i) {return asBin[i] === '1';}), true);
          }
        };


        addIgnoresCapitalisationTests();


        var extraNoneTests = [
          {type: 'name', value: 'name: bar'},
          {type: 'signature', value: 'signature: b: any'},
          {type: 'classification', value: 'classification: fizz'},
          {type: 'plugin', value: 'plugin: buzz'},
          {type: 'function', value: function() {}}
        ];


        extraNoneTests.forEach(function(test) {
          addThrowsIfMoreThanOneTests(test.type, test.value);
          addThrowsIfNoneTest(test.type);
        });


        addThrowsIfFnNotLastTest(false);
        addThrowsIfFnNotLastTest(true);


        var nonStrings = [
          {name: 'number', value: 1},
          {name: 'boolean', value: true},
          {name: 'object', value: {}},
          {name: 'array', value: [1, 2]},
          {name: 'undefined', value: undefined},
          {name: 'null', value: null}
        ];


        nonStrings.forEach(function(test) {
          addThrowsWithNonStringTest(test.name, test.value, false);
          addThrowsWithNonStringTest(test.name, test.value, true);
        });


        it('Throws when called with both classification and plugin', function() {
          var args = [];
          args.push('name: testFunc');
          args.push('signature: a: any');
          args.push('classification: foo');
          args.push('plugin: bar');
          args.push(function() {});

          var fn = function() {
            defineFunction.apply(null, args);
          };

          expect(fn).to.throw(TypeError);
        });


        it('Throws when called with no arguments', function() {
          var fn = function() {
            defineFunction();
          };

          expect(fn).to.throw(TypeError);
        });


        it('Doesn\'t throw if called with just a function', function() {
          var fn = function() {
            defineFunction(function() {});
          };

          expect(fn).to.not.throw(TypeError);
        });


        it('Returns the function', function() {
          var fn = function() {};
          var result = defineFunction(fn);

          expect(result).to.equal(fn);
        });
      });


      describe('help', function() {
        var defineFunction = utils.defineFunction;
        var help = utils.help;
        var resetHelpCache = utils.resetHelpCache;


        beforeEach(function() {
          resetHelpCache();
        });


        var monkeyPatchOutput = function(writerFn) {
          var shellPrint = null;
          var consoleLog = null;

          // If node's stdout is available, use that
          if (print !== undefined) {
            shellPrint = print;
            global.print = writerFn;
          } else {
            consoleLog = console.log;
            console.log = writerFn;
          }

          // Return a function that allows the caller to restore the environment
          return function() {
            if (print !== undefined) {
              global.print = shellPrint;
            } else {
              console.log = consoleLog;
            }
          };
        };


        it('Uses best available output method for this environment', function() {
          var called = false;
          var text = [];
          var writer = function() {
            called = true;
            [].forEach.call(arguments, function(val) {
              text.push(val);
            });
          };


          // Define a function with help text
          // XXX Remove signature when we've fixed defineFunction
          var ourText = 'ELEPHANT';
          var f = defineFunction(
            'name: f',
            'classification: testing',
            'signature: a',
            ourText,
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);

          // Restore things so mocha can write out as normal
          restorer();

          // Now we want called to be true, but we also want to confirm it was our text that was printed
          expect(called).to.be.true;
          expect(text.indexOf(ourText)).to.not.equal(-1);
        });


        it('Prints something when function not found', function() {
          var called = false;
          var text = [];
          var writer = function() {
            called = true;
            [].forEach.call(arguments, function(val) {
              text.push(val);
            });
          };


          // Define a function that is not registered with help
          var f = function() {};
          var restorer = monkeyPatchOutput(writer);
          help(f);

          // Restore things so mocha can write out as normal
          restorer();

          // Now we want called to be true, but we also want to confirm it was our text
          expect(called).to.be.true;
          expect(text.length).to.be.greaterThan(0);
        });


        it('Prints different help for different functions', function() {
          var called = false;
          var text = [];
          var makeWriter = function(text) {
            return function() {
              [].forEach.call(arguments, function(val) {
                text.push(val);
              });
            };
          };

          var f1Text = [];
          var f1Writer = makeWriter(f1Text);
          var f2Text = [];
          var f2Writer = makeWriter(f2Text);

          var f1 = defineFunction(
            'name: f1',
            'signature: b',
            'classification: test',
            '',
            'This is the text for f1',
            function() {}
          );
          var f2 = defineFunction(
            'name: f2',
            'signature: b',
            'classification: test',
            '',
            'This, however, is the text for f2',
            'It should be different.',
            function() {}
          );

          var restorer = monkeyPatchOutput(f1Writer);
          help(f1);
          restorer();
          restorer = monkeyPatchOutput(f2Writer);
          help(f2);
          restorer();

          expect(f1Text.length).to.be.greaterThan(0);
          expect(f2Text.length).to.be.greaterThan(0);
          expect(f1Text).to.not.deep.equal(f2Text);
        });


        var addPrintsNameSigTest = function(message, name, sig) {
          it('First line of output contains name and signature', function() {
            var text = [];
            var writer =  function() {
              [].forEach.call(arguments, function(val) {
                text.push(val);
                });
            };

            var f = defineFunction(
              'name: ' + name,
              'signature: ' + sig,
              'classification: test',
              '',
              'This is the text for f',
              function() {}
            );

            var restorer = monkeyPatchOutput(writer);
            help(f);
            restorer();

            var firstText = text[0];
            expect(firstText).to.equal(name + '(' + sig + ')');
          });
        };


        addPrintsNameSigTest('(1)', 'funky', 'a: number, b: array');
        addPrintsNameSigTest('(2)', 'fizzBuzz', 'a: object');


        it('Signature stripped of formatting characters', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: [[Pair]]',
            'classification: test',
            '',
            'This is the text for f',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          var firstText = text[0];
          expect(firstText).to.equal('foo(a: Pair)');
        });


        it('One trailing line empty line after signature (1)', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: [[Pair]]',
            'classification: test',
            '',
            'This is the text for f',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          expect(text[1]).to.equal('');
          expect(text[2]).to.not.equal('');
        });


        it('One trailing line empty line after signature (2)', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: [[Pair]]',
            'classification: test',
            'This is the text for f',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          expect(text[1]).to.equal('');
          expect(text[2]).to.not.equal('');
        });


        it('One trailing line empty line after signature (3)', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: [[Pair]]',
            'classification: test',
            '',
            '',
            'This is the text for f',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          expect(text[1]).to.equal('');
          expect(text[2]).to.not.equal('');
        });


        it('Suppresses duplicate empty lines within empty text', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: [[Pair]]',
            'classification: test',
            '',
            'Line 2 above. This is line 3',
            '',
            '',
            'Line 4 above. This is line 5',
            '',
            '',
            'Line 6 above. This is line 7',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          expect(text.length).to.equal(7);
        });


        var addTextCorrectTest = function(message, textArr) {
          it('Text correct ' + message, function() {
            var text = [];
            var writer =  function() {
              [].forEach.call(arguments, function(val) {
                text.push(val);
                });
            };

            var f = defineFunction.apply(null,
              ['name: foo',
              'signature: a: string',
              'classification: test'].concat(textArr).concat([function() {}]));

            var restorer = monkeyPatchOutput(writer);
            help(f);
            restorer();

            var textCorrect = text.every(function(t, i) {
              if (i === 0 || i === 1)
                return true; // skip signature and trailing line

              return t === textArr[i - 2];
            });
            expect(textCorrect).to.be.true;
          });
        };


        addTextCorrectTest('(1)', ['Line 1']);
        addTextCorrectTest('(2)', ['Line 1', '', 'Line 2', '', 'Line 3']);


        it('Handles newline characters in strings correctly', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: number',
            'classification: test',
            '',
            'Line 2 above. This is line 3.\nThis is line 4',
            '',
            'Line 5 above. This is line 6\nThis is line 7',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          expect(text.length).to.equal(7);
        });


        it('Suppresses duplicate newlines generated by newline character', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: number',
            'classification: test',
            '',
            'Line 2 above. This is line 3.\n\n\nThis is line 5',
            '',
            'Line 6 above. This is line 7\n\n\nThis is line 9',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          expect(text.length).to.equal(9);
        });


        it('Removes special formatting in explanatory text', function() {
          var text = [];
          var writer =  function() {
            [].forEach.call(arguments, function(val) {
              text.push(val);
              });
          };

          var f = defineFunction(
            'name: foo',
            'signature: a: number',
            'classification: test',
            '',
            'This is line 2 with [[formatting]]',
            function() {}
          );

          var restorer = monkeyPatchOutput(writer);
          help(f);
          restorer();

          expect(text[2]).to.equal('This is line 2 with formatting');
        });
      });
    };


    // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
    if (typeof(define) === "function") {
      define(function(require, exports, module) {
        testFixture(require, exports, module);
      });
    } else {
      testFixture(require, exports, module);
    }
  }();
})();
