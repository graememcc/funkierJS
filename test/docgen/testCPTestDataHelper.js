(function() {
  "use strict";


  var expect = require('chai').expect;
  var CPTestDataHelper = require('./CPTestDataHelper');


  /*
   * Caution: over-engineering at work.
   *
   * The comment processor needs to test various combinations of input with different fields present or not present.
   * The array manipulation gradually became harder and harder to read, making it difficult to understand the intent
   * of the test. Hence, it was time to introduce some abstraction and add an interface for manipulating the test
   * input.
   *
   * Naturally, this test input itself needs tests.
   *
   */

  describe('CommentProcessor test data creator', function() {
    var standardProps = CPTestDataHelper.standardProps;
    var createTestData = CPTestDataHelper.createTestData;
    var testData;


    beforeEach(function() {
      testData = createTestData();
    });


    var expectedFunctions = ['getPreviousProperty', 'getNextProperty', 'getPropertyLength', 'removeProperty',
                             'moveBefore', 'moveAfter', 'getPropertyValue', 'replaceProperty', 'applyToAll'];


    describe('Initial status', function() {
      it('Test data should be an array', function() {
        expect(Array.isArray(testData)).to.equal(true);
      });


      it('Test data initially returned has all required fields', function() {
        var hasAllProps = standardProps.every(function(prop) {
          return testData[prop] !== undefined;
        });

        expect(hasAllProps).to.equal(true);
      });


      it('Test data\'s properties are all numbers', function() {
        var allPropsAreNumbers = standardProps.every(function(prop) {
          return typeof(testData[prop]) === 'number';
        });

        expect(allPropsAreNumbers).to.equal(true);
      });


      it('Test data\'s properties are in range', function() {
        var allPropsInRange = standardProps.every(function(prop) {
          return testData[prop] < testData.length;
        });

        expect(allPropsInRange).to.equal(true);
      });


      it('Test data has standard functions', function() {
        var hasAllFunctions = expectedFunctions.every(function(prop) {
          return testData[prop] !== undefined && typeof(testData[prop]) === 'function';
        });

        expect(hasAllFunctions).to.equal(true);
      });


      it('Test data is tagged as an apifunction', function() {
        expect(testData.tag.toLowerCase()).to.equal('apifunction');
      });


      it('Test data has a file tag', function() {
        expect(testData.file).to.equal('a.js');
      });
    });


    describe('getNextProperty', function() {
      it('Behaves as expected with the initial setup for non-terminal properties', function() {
        var allNonTerminalPropsOK = standardProps.slice(0, -1).every(function(prop, i) {
          // Assumption: standard props are listed in ascending order
          return testData.getNextProperty(prop) === standardProps[i + 1];
        });

        expect(allNonTerminalPropsOK).to.equal(true);
      });


      it('Behaves as expected with the initial setup for the terminal property', function() {
        // Assumption: examples is the last property
        expect(testData.getNextProperty('examples')).to.equal(undefined);
      });


      it('Behaves as expected when a property has been removed (1)', function() {
        var result = testData.removeProperty(standardProps[1]);
        expect(result.getNextProperty(standardProps[0])).to.equal(standardProps[2]);
      });


      it('Behaves as expected when a property has been removed (2)', function() {
        var result = testData.removeProperty(standardProps[standardProps.length - 1]);
        expect(result.getNextProperty(standardProps[standardProps.length - 2])).to.equal(undefined);
      });


      it('Behaves as expected when a property has been moved', function() {
        var propToMove = standardProps[2];
        var nextProp = testData.getNextProperty(propToMove);
        // Assumption: standardProps[2] was not the last property - sanity check
        expect(nextProp).to.not.equal(undefined);

        var result = testData.moveAfter(propToMove, nextProp);

        expect(result.getNextProperty(propToMove)).to.equal(testData.getNextProperty(nextProp));
      });


      it('Throws if the array doesn\'t have the required property', function() {
        var propToRemove = standardProps[1];
        var result = testData.removeProperty(propToRemove);
        var fn = function() {
          result.getNextProperty(propToRemove);
        };

        expect(fn).to.throw();
      });
    });


    describe('getPreviousProperty', function() {
      it('Behaves as expected with the initial setup for non-terminal properties', function() {
        var allNonTerminalPropsOK = standardProps.slice(1).every(function(prop, i) {
          // Assumption: standard props are listed in ascending order
          return testData.getPreviousProperty(prop) === standardProps[i];
        });

        expect(allNonTerminalPropsOK).to.equal(true);
      });


      it('Behaves as expected with the initial setup for the terminal property', function() {
        // Assumption: name is the last property
        expect(testData.getPreviousProperty('name')).to.equal(undefined);
      });


      it('Behaves as expected when a property has been removed (1)', function() {
        var result = testData.removeProperty(standardProps[1]);
        expect(result.getPreviousProperty(standardProps[2])).to.equal(standardProps[0]);
      });


      it('Behaves as expected when a property has been removed (2)', function() {
        var result = testData.removeProperty(standardProps[0]);
        expect(result.getPreviousProperty(standardProps[1])).to.equal(undefined);
      });


      it('Behaves as expected when a property has been moved', function() {
        var propToMove = standardProps[2];
        var previousProp = testData.getPreviousProperty(propToMove);
        // Assumption: standardProps[2] was not the first property - sanity check
        expect(previousProp).to.not.equal(undefined);

        var result = testData.moveBefore(propToMove, previousProp);

        expect(result.getPreviousProperty(propToMove)).to.equal(testData.getPreviousProperty(previousProp));
      });


      it('Throws if the array doesn\'t have the required property', function() {
        var propToRemove = standardProps[1];
        var result = testData.removeProperty(propToRemove);
        var fn = function() {
          result.getPreviousProperty(propToRemove);
        };

        expect(fn).to.throw();
      });
    });


    describe('getPropertyLength', function() {
      standardProps.slice(0, -1).forEach(function(prop, i) {
        it('Non-terminal properties have the correct properties reported', function() {
          // Assumption: the standard properties are in occurrence order
          expect(testData.getPropertyLength(prop)).to.equal(testData[standardProps[i + 1]] - testData[prop]);
        });
      });


      it('Non-terminal properties have the correct length reported after property removal', function() {
        var propToDelete = standardProps[2];
        var prev = testData.getPreviousProperty(propToDelete);

        // Sanity check
        expect(propToDelete).to.not.equal(undefined);
        expect(prev).to.not.equal(undefined);

        var result = testData.removeProperty(propToDelete);
        expect(result.getPropertyLength(prev)).to.equal(testData.getPropertyLength(prev));
      });


      it('Terminal properties have the correct length reported (1)', function() {
        // Assumption: the standard properties are in occurrence order
        var lastProp = standardProps[standardProps.length - 1];
        expect(testData.getPropertyLength(lastProp)).to.equal(testData.length - testData[lastProp]);
      });


      it('Terminal properties have the correct length reported (1)', function() {
        // Assumption: the standard properties are in occurrence order
        var lastProp = standardProps[standardProps.length - 1];
        var newLast = testData.getPreviousProperty(lastProp);

        // Sanity check
        expect(newLast).to.not.equal(undefined);

        var result = testData.removeProperty(lastProp);
        expect(testData.getPropertyLength(newLast)).to.equal(result.length - result[newLast]);
      });


      it('Throws if the array doesn\'t have the required property', function() {
        var propToRemove = standardProps[1];
        var result = testData.removeProperty(propToRemove);
        var fn = function() {
          result.getPropertyLength(propToRemove);
        };

        expect(fn).to.throw();
      });
    });


    describe('removeProperty', function() {
      standardProps.forEach(function(propToRemove, propIndex) {
        it('Returned result has the expected properties', function() {
          var result = testData.removeProperty(propToRemove);

          var hasAllProps = standardProps.every(function(prop) {
            if (prop === propToRemove) return true;

            return result[prop] !== undefined;
          });

          expect(hasAllProps).to.equal(true);
        });


        it('Returned result has standard functions', function() {
          var result = testData.removeProperty(propToRemove);

          var hasAllFunctions = expectedFunctions.every(function(prop) {
            return result[prop] !== undefined && typeof(result[prop]) === 'function';
          });

          expect(hasAllFunctions).to.equal(true);
        });


        it(propToRemove + ' is undefined after removal', function() {
          var result = testData.removeProperty(propToRemove);

          expect(result[propToRemove]).to.equal(undefined);
        });


        it(propToRemove + ' in original is unaffected', function() {
          var result = testData.removeProperty(propToRemove);

          expect(testData[propToRemove]).to.not.equal(undefined);
        });


        standardProps.slice(0, propIndex).forEach(function(beforeProp) {
          it(beforeProp + ' unchanged by removal of property lying after it', function() {
            var result = testData.removeProperty(propToRemove);

            expect(result[beforeProp]).to.equal(testData[beforeProp]);
          });
        });


        standardProps.slice(propIndex + 1).forEach(function(afterProp) {
          it(afterProp + ' correctly offset after removal of property lying after it', function() {
            var delta = testData.getPropertyLength(propToRemove);
            var result = testData.removeProperty(propToRemove);

            expect(result[afterProp]).to.equal(testData[afterProp] - delta);
          });
        });


        standardProps.forEach(function(p) {
          if (propToRemove == p) return;


          it(p + ' is correct after removal of ' + propToRemove, function() {
            var result = testData.removeProperty(propToRemove);

            expect(testData.getPropertyValue(p)).to.deep.equal(result.getPropertyValue(p));
          });
        });


        it('Throws if the array doesn\'t have the ' + propToRemove + ' property', function() {
          var intermediate = testData.removeProperty(propToRemove);
          var fn = function() {
            intermediate.removeProperty(propToRemove);
          };

          expect(fn).to.throw();
        });


        it('Result is an independent array', function() {
          var result = testData.removeProperty(propToRemove);
          expect(result === testData).to.equal(false);
        });
      });


      it('Property removal works correctly on result', function() {
        var intermediate = testData.removeProperty(standardProps[0]);
        var result = intermediate.removeProperty(standardProps[1]);
        var delta = testData[standardProps[2]];

        var allOK = standardProps.slice(2).every(function(prop) {
          return result[prop] === testData[prop] - delta;
        });

        expect(allOK).to.equal(true);
      });


      it('File is correctly transferred', function() {
        var result = testData.removeProperty(standardProps[1]);
        expect(result.file).to.equal(testData.file);
      });


      it('Tag is correctly transferred (1)', function() {
        var result = testData.removeProperty(standardProps[1]);
        expect(result.tag).to.equal(testData.tag);
      });


      it('Tag is correctly transferred (2)', function() {
        testData.tag = 'apiobject';
        var result = testData.removeProperty(standardProps[1]);
        expect(result.tag).to.equal(testData.tag);
      });
    });


    describe('moveBefore', function() {

      /*
       * We want to test the following cases:
       *   - when the new location lies before the original location
       *   - when the new location lies after the original location
       *
       * The following array allows us to generate the relevant tests automatically
       *
       */

      var tests = [
        {desc: 'new location lies before original location',
         getNewLocation: function(prop) { return testData.getPreviousProperty(testData.getPreviousProperty(prop)); }},
        {desc: 'new location lies after original location',
         getNewLocation: function(prop) { return testData.getNextProperty(testData.getNextProperty(prop)); }}
      ];


      tests.forEach(function(test) {
        it('Returned result has the expected properties when ' + test.desc, function() {
          var propToMove = standardProps[3];

          // Sanity check
          expect(test.getNewLocation(propToMove)).to.not.equal(undefined);

          var result = testData.moveBefore(propToMove, test.getNewLocation(propToMove));
          var hasAllProps = standardProps.every(function(prop) {
            if (result[prop] === undefined) {
            }
            return result[prop] !== undefined;
          });

          expect(hasAllProps).to.equal(true);
        });


        it('Items lying before are unperturbed when ' + test.desc, function() {
          var propToMove = standardProps[3];
          var newLocation = test.getNewLocation(propToMove);

          // Sanity check
          expect(newLocation).to.not.equal(undefined);

          var result = testData.moveBefore(propToMove, newLocation);

          var unperturbedLimit = testData[newLocation] < testData[propToMove] ? newLocation : propToMove;
          var prop = testData.getPreviousProperty(unperturbedLimit);

          while (prop !== undefined) {
            expect(result[prop]).to.equal(testData[prop]);
            prop = testData.getPreviousProperty(prop);
          }
        });


        it('Items lying after are unperturbed when ' + test.desc, function() {
          var propToMove = standardProps[3];
          var newLocation = test.getNewLocation(propToMove);

          // Sanity check
          expect(newLocation).to.not.equal(undefined);

          var result = testData.moveBefore(propToMove, newLocation);
          var unperturbedLimit = testData[newLocation] < testData[propToMove] ? propToMove : newLocation;
          var prop = testData.getNextProperty(unperturbedLimit);

          while (prop !== undefined) {
            expect(result[prop]).to.equal(testData[prop]);
            prop = testData.getNextProperty(prop);
          }
        });


        it('Moved properties are correct when ' + test.desc, function() {
          var propToMove = standardProps[3];
          var newLocation = testData.getPreviousProperty(propToMove);

          // Sanity check
          expect(newLocation).to.not.equal(undefined);
          var result = testData.moveBefore(propToMove, newLocation);

          var oldIndex = testData[propToMove];
          var moveIndex = testData[newLocation];

          var first = Math.min(standardProps.indexOf(propToMove), standardProps.indexOf(newLocation));
          var second = Math.max(standardProps.indexOf(testData.getNextProperty(propToMove)),
                                standardProps.indexOf(testData.getNextProperty(newLocation)));

          var propLength = testData.getPropertyLength(propToMove);
          var movedPropDelta = (moveIndex < oldIndex) ? 0 : -propLength;
          var delta = (moveIndex < oldIndex ? 1 : -1) * propLength;
          var newLocationDelta = moveIndex < oldIndex ? propLength : 0;

          var propsOK = standardProps.slice(first, second).every(function(p) {
            var current = testData[p];

            if (p === propToMove)
              return result[p] === moveIndex + movedPropDelta;
            else if (p === newLocation)
              return result[p] === moveIndex + newLocationDelta;
            else
              return result[p] === testData[p] + delta;
          });

          expect(propsOK).to.equal(true);
        });


        standardProps.forEach(function(p) {
          it(p + ' is correct after move', function() {
            var propToMove = standardProps[3];
            var newLocation = testData.getPreviousProperty(propToMove);

            // Sanity check
            expect(newLocation).to.not.equal(undefined);
            var result = testData.moveBefore(propToMove, newLocation);

            expect(testData.getPropertyValue(p)).to.deep.equal(result.getPropertyValue(p));
          });
        });
      });


      it('Works for moving to an earlier adjacent position (ie swapping positions)', function() {
        var propToMove = standardProps[3];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveBefore(propToMove, newLocation);

        expect(result[propToMove]).to.equal(testData[newLocation]);
        expect(result[newLocation]).to.equal(testData[newLocation] + testData.getPropertyLength(propToMove));
      });


      it('Throws if the array doesn\'t have the property to be moved', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var intermediate = testData.removeProperty(propToMove);
        var fn = function() {
          intermediate.moveProperty(propToMove, newLocation);
        };

        expect(fn).to.throw();
      });


      it('Throws if the array doesn\'t have the new location for the property', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var intermediate = testData.removeProperty(newLocation);
        var fn = function() {
          intermediate.moveProperty(propToMove, newLocation);
        };

        expect(fn).to.throw();
      });


      it('Moving to the same location is effectively an identity operation', function() {
        var propToMove = standardProps[1];
        var newLocation = testData.getNextProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveBefore(propToMove, newLocation);
        expect(result).to.deep.equal(testData);
      });


      it('Works when moving before position zero', function() {
        // Assumes that the standard props are in occurrence order
        expect(testData[standardProps[0]]).to.equal(0);

        var newLocation = standardProps[0];
        var propToMove = standardProps[1];
        var result = testData.moveBefore(propToMove, newLocation);

        expect(result[propToMove]).to.equal(0);
        expect(result[newLocation]).to.equal(testData.getPropertyLength(propToMove));
      });


      it('Result has standard functions', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveBefore(propToMove, newLocation);

        var hasAllFunctions = expectedFunctions.every(function(prop) {
          return result[prop] !== undefined && typeof(result[prop]) === 'function';
        });

        expect(hasAllFunctions).to.equal(true);
      });


      it('Result is an independent array', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveBefore(propToMove, newLocation);
        expect(result === testData).to.equal(false);
      });


      it('File is correctly transferred', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveBefore(propToMove, newLocation);
        expect(result.file).to.equal(testData.file);
      });


      it('Tag is correctly transferred (1)', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveBefore(propToMove, newLocation);
        expect(result.tag).to.equal(testData.tag);
      });


      it('Tag is correctly transferred (2)', function() {
        testData.tag = 'apiobject';
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveBefore(propToMove, newLocation);
        expect(result.tag).to.equal(testData.tag);
      });
    });


    describe('moveAfter', function() {

      /*
       * We want to test the following cases:
       *   - when the new location lies before the original location
       *   - when the new location lies after the original location
       *
       * The following array allows us to generate the relevant tests automatically
       *
       */

      var tests = [
        {desc: 'new location lies before original location',
         getNewLocation: function(prop) { return testData.getPreviousProperty(testData.getPreviousProperty(prop)); }},
        {desc: 'new location lies after original location',
         getNewLocation: function(prop) { return testData.getNextProperty(testData.getNextProperty(prop)); }}
      ];


      tests.forEach(function(test) {
        it('Returned result has the expected properties when ' + test.desc, function() {
          var propToMove = standardProps[3];

          // Sanity check
          expect(test.getNewLocation(propToMove)).to.not.equal(undefined);

          var result = testData.moveAfter(propToMove, test.getNewLocation(propToMove));
          var hasAllProps = standardProps.every(function(prop) {
            if (result[prop] === undefined) {
            }
            return result[prop] !== undefined;
          });

          expect(hasAllProps).to.equal(true);
        });


        it('Items lying before are unperturbed when ' + test.desc, function() {
          var propToMove = standardProps[3];
          var newLocation = test.getNewLocation(propToMove);

          // Sanity check
          expect(newLocation).to.not.equal(undefined);

          var result = testData.moveAfter(propToMove, newLocation);

          var unperturbedLimit = testData[newLocation] < testData[propToMove] ? newLocation : propToMove;
          var prop = testData.getPreviousProperty(unperturbedLimit);

          while (prop !== undefined) {
            expect(result[prop]).to.equal(testData[prop]);
            prop = testData.getPreviousProperty(prop);
          }
        });


        it('Items lying after are unperturbed when ' + test.desc, function() {
          var propToMove = standardProps[3];
          var newLocation = test.getNewLocation(propToMove);

          // Sanity check
          expect(newLocation).to.not.equal(undefined);

          var result = testData.moveAfter(propToMove, newLocation);
          var unperturbedLimit = testData[newLocation] < testData[propToMove] ? propToMove : newLocation;
          var prop = testData.getNextProperty(unperturbedLimit);

          while (prop !== undefined) {
            expect(result[prop]).to.equal(testData[prop]);
            prop = testData.getNextProperty(prop);
          }
        });


        it('Moved properties are correct when ' + test.desc, function() {
          var propToMove = standardProps[2];
          var newLocation = test.getNewLocation(propToMove);

          // Sanity check
          expect(newLocation).to.not.equal(undefined);
          var result = testData.moveAfter(propToMove, newLocation);

          var oldIndex = testData[propToMove];
          var moveIndex = testData[newLocation];

          var first = Math.min(standardProps.indexOf(propToMove), standardProps.indexOf(newLocation));
          var second = Math.max(standardProps.indexOf(testData.getNextProperty(propToMove)),
                                standardProps.indexOf(testData.getNextProperty(newLocation)));

          var propLength = testData.getPropertyLength(propToMove);
          var movedPropDelta = testData.getPropertyLength(newLocation) - (moveIndex < oldIndex ? 0 : propLength);
          var delta = (moveIndex < oldIndex ? 1 : -1) * propLength;
          var newLocationDelta = moveIndex < oldIndex ? 0 : -propLength;

          var propsOK = standardProps.slice(first, second).every(function(p) {
            var current = testData[p];

            if (p === propToMove)
              return result[p] === moveIndex + movedPropDelta;
            else if (p === newLocation)
              return result[p] === moveIndex + newLocationDelta;
            else
              return result[p] === testData[p] + delta;
          });

          expect(propsOK).to.equal(true);
        });


        standardProps.forEach(function(p) {
          it(p + ' is correct after move', function() {
            var propToMove = standardProps[3];
            var newLocation = testData.getPreviousProperty(propToMove);

            // Sanity check
            expect(newLocation).to.not.equal(undefined);
            var result = testData.moveAfter(propToMove, newLocation);

            expect(testData.getPropertyValue(p)).to.deep.equal(result.getPropertyValue(p));
          });
        });
      });


      it('Works for moving to a later adjacent position (ie swapping positions)', function() {
        var propToMove = standardProps[3];
        var newLocation = testData.getNextProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveAfter(propToMove, newLocation);

        expect(result[propToMove]).to.equal(testData[propToMove] + testData.getPropertyLength(newLocation));
        expect(result[newLocation]).to.equal(testData[propToMove]);
      });


      it('Throws if the array doesn\'t have the property to be moved', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getNextProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var intermediate = testData.removeProperty(propToMove);
        var fn = function() {
          intermediate.moveProperty(propToMove, newLocation);
        };

        expect(fn).to.throw();
      });


      it('Throws if the array doesn\'t have the new location for the property', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getNextProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var intermediate = testData.removeProperty(newLocation);
        var fn = function() {
          intermediate.moveProperty(propToMove, newLocation);
        };

        expect(fn).to.throw();
      });


      it('Moving to the same location is effectively an identity operation', function() {
        var propToMove = standardProps[1];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveAfter(propToMove, newLocation);
        expect(result).to.deep.equal(testData);
      });


      it('Works when moving after last position', function() {
        // Assumes that the standard props are in occurrence order
        expect(testData.getNextProperty(standardProps[standardProps.length - 1])).to.equal(undefined);

        var newLocation = standardProps[standardProps.length - 1];
        var newLocationLength = testData.getPropertyLength(newLocation);
        var propToMove = standardProps[1];
        var propToMoveLength = testData.getPropertyLength(propToMove);
        var result = testData.moveAfter(propToMove, newLocation);

        expect(result[propToMove]).to.equal(testData.length - propToMoveLength);
        expect(result[newLocation]).to.equal(testData.length - propToMoveLength - newLocationLength);
      });


      it('Result has standard functions', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getNextProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveAfter(propToMove, newLocation);

        var hasAllFunctions = expectedFunctions.every(function(prop) {
          return result[prop] !== undefined && typeof(result[prop]) === 'function';
        });

        expect(hasAllFunctions).to.equal(true);
      });


      it('Result is an independent array', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getNextProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveAfter(propToMove, newLocation);
        expect(result === testData).to.equal(false);
      });


      it('File is correctly transferred', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveAfter(propToMove, newLocation);
        expect(result.file).to.equal(testData.file);
      });


      it('Tag is correctly transferred (1)', function() {
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveAfter(propToMove, newLocation);
        expect(result.tag).to.equal(testData.tag);
      });


      it('Tag is correctly transferred (2)', function() {
        testData.tag = 'apiobject';
        var propToMove = standardProps[2];
        var newLocation = testData.getPreviousProperty(propToMove);

        // Sanity check
        expect(newLocation).to.not.equal(undefined);
        var result = testData.moveAfter(propToMove, newLocation);
        expect(result.tag).to.equal(testData.tag);
      });
    });


    describe('getPropertyValue', function() {
      standardProps.forEach(function(prop) {
        it('Properties have the correct values reported', function() {
          var nextProp = testData.getNextProperty(prop);
          var sliceEnd = nextProp !== undefined ? testData[nextProp] : testData.length;
          expect(testData.getPropertyValue(prop)).to.deep.equal(testData.slice(testData[prop], sliceEnd));
        });
      });


      it('Throws if the array doesn\'t have the required property', function() {
        var propToRemove = standardProps[1];
        var result = testData.removeProperty(propToRemove);
        var fn = function() {
          result.getPropertyValue(propToRemove);
        };

        expect(fn).to.throw();
      });
    });


    describe('replaceProperty', function() {
      it('Has correct value after updating', function() {
        var newSynonyms = ['new synonyms line 1', 'new synonyms line 2'];
        var result = testData.replaceProperty('synonyms', newSynonyms);

        expect(result.getPropertyValue('synonyms')).to.deep.equal(newSynonyms);
      });


      it('Has correct length after updating', function() {
        // Assumption: synonyms does not normally have length 2
        expect(testData.getPropertyLength('synonyms')).to.not.equal(3);

        var newSynonyms = ['new synonyms line 1', 'new synonyms line 2', ''];
        var result = testData.replaceProperty('synonyms', newSynonyms);

        expect(result.getPropertyLength('synonyms')).to.equal(newSynonyms.length);
      });


      it('Unaffected indices unperturbed', function() {
        var lyingBefore = standardProps.filter(function(prop) {
          return testData[prop] <= testData.synonyms;
        });

        var newSynonyms = ['new synonyms line 1', 'new synonyms line 2'];

        var result = testData.replaceProperty('synonyms', newSynonyms);
        var allUnchanged = lyingBefore.every(function(prop) {
          return result[prop] === testData[prop];
        });

        expect(allUnchanged).to.equal(true);
      });


      it('Relevant indices updated after updating', function() {
        var lyingAfter = standardProps.filter(function(prop) {
          return testData[prop] > testData.synonyms;
        });

        var newSynonyms = ['new synonyms line 1', 'new synonyms line 2', 'new synonyms line 3'];
        var delta = newSynonyms.length - testData.getPropertyLength('synonyms');
        // Assumption: synonyms does not normally have length 3
        expect(delta).to.not.equal(0);

        var result = testData.replaceProperty('synonyms', newSynonyms);
        var allMoved = lyingAfter.every(function(prop) {
          return result[prop] === testData[prop] + delta;
        });

        expect(allMoved).to.equal(true);
      });


      it('Throws if the array doesn\'t have the required property', function() {
        var propToRemove = standardProps[1];
        var result = testData.removeProperty(propToRemove);
        var fn = function() {
          result.replaceProperty(propToRemove, ['foo']);
        };

        expect(fn).to.throw();
      });


      it('Accepts strings', function() {
        // Assumption: details is normally longer than one line
        expect(testData.getPropertyLength('details')).to.not.equal(0);
        var newDetails = 'foo';

        var lyingBefore = standardProps.filter(function(prop) {
          return testData[prop] <= testData.details;
        });

        var lyingAfter = standardProps.filter(function(prop) {
          return testData[prop] > testData.details;
        });

        var newSynonyms = ['new synonyms line 1', 'new synonyms line 2'];
        var delta = testData.getPropertyLength('details') - 1;

        var result = testData.replaceProperty('details', newDetails);

        expect(result.getPropertyValue('details')).to.deep.equal([newDetails]);
        expect(result.getPropertyLength('details')).to.equal(1);

        var allMoved = lyingAfter.every(function(prop) {
          return result[prop] === testData[prop] - delta;
        });

        expect(allMoved).to.equal(true);

        var allUnchanged = lyingBefore.every(function(prop) {
          return result[prop] === testData[prop];
        });

        expect(allUnchanged).to.equal(true);
      });


      it('Result is an independent array', function() {
        var result = testData.replaceProperty(standardProps[0], 'foo');
        expect(result === testData).to.equal(false);
      });


      it('File is correctly transferred', function() {
        var result = testData.replaceProperty(standardProps[0], 'foo');
        expect(result.file).to.equal(testData.file);
      });


      it('Tag is correctly transferred (1)', function() {
        var result = testData.replaceProperty(standardProps[0], 'foo');
        expect(result.tag).to.equal(testData.tag);
      });


      it('Tag is correctly transferred (2)', function() {
        testData.tag = 'apiobject';
        var result = testData.replaceProperty(standardProps[0], 'foo');
        expect(result.tag).to.equal(testData.tag);
      });
    });


    describe('applyToAll', function() {
      it('Returned result has the expected properties', function() {
        var result = testData.applyToAll(function(x) { return x; });

        var hasAllProps = standardProps.every(function(prop) {
          return result[prop] !== undefined;
        });

        expect(hasAllProps).to.equal(true);
      });


      it('Returned result has standard functions', function() {
        var result = testData.applyToAll(function(x) { return x; });

        var hasAllFunctions = expectedFunctions.every(function(prop) {
          return result[prop] !== undefined && typeof(result[prop]) === 'function';
        });

        expect(hasAllFunctions).to.equal(true);
      });


      it('Called with all properties (1)', function() {
        var calledWith = {};
        standardProps.forEach(function(p) { calledWith[p] = false; });
        var f = function(x, prop) { calledWith[prop] = true; };
        var result = testData.applyToAll(f);
        var calledForAll = standardProps.every(function(p) { return calledWith[p]; });

        expect(calledForAll).to.equal(true);
      });


      it('Called with all properties (2)', function() {
        var calledWith = {};
        standardProps.forEach(function(p) { calledWith[p] = null; });
        var f = function(x, prop) { calledWith[prop] = x; };
        var result = testData.applyToAll(f);
        var calledWithCorrectData  = standardProps.every(function(p) {
          var val = testData.getPropertyValue(p);
          return Array.isArray(calledWith[p]) && val.every(function(s, i) { return calledWith[p][i] === s; });
        });

        expect(calledWithCorrectData).to.equal(true);
      });


      it('Called with all properties (3)', function() {
        var calledWith = {};
        standardProps.forEach(function(p) { calledWith[p] = false; });
        var f = function(x, prop) { calledWith[prop] = true; };
        var result = testData.removeProperty(standardProps[1]).applyToAll(f);
        var calledForAll = standardProps.every(function(p) {
          return p === standardProps[1] ? !calledWith[p] : calledWith[p];
        });

        expect(calledForAll).to.equal(true);
      });


      it('Result is an independent array', function() {
        var result = testData.applyToAll(function(x) { return x; });
        expect(result === testData).to.equal(false);
      });


      it('File is correctly transferred', function() {
        var result = testData.applyToAll(function(x) { return x; });
        expect(result.file).to.equal(testData.file);
      });


      it('Tag is correctly transferred (1)', function() {
        var result = testData.applyToAll(function(x) { return x; });
        expect(result.tag).to.equal(testData.tag);
      });


      it('Tag is correctly transferred (2)', function() {
        testData.tag = 'apiobject';
        var result = testData.applyToAll(function(x) { return x; });
        expect(result.tag).to.equal(testData.tag);
      });
    });
  });
})();
