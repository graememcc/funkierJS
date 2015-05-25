// XXX Do we intend to allow these tests to be run in the browser
(function (root, factory) {
  var dependencies = ['chai', './CPTestDataHelper', '../../docgen/APIFunction', '../../docgen/APIObject',
                      '../../docgen/commentProcessor'];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else if (typeof exports === 'object') {
    // CommonJS

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  } else {
    // Browser globals

    root.commonJsStrict = root.commonJsStrict || {};
    factory.apply(null, [root].concat(dependencies.map(function(dep) {
      if (dep.slice(0, 2) == './') dep = dep.slice(2);
      if (dep.slice(0, 3) == '../') dep = dep.slice(3);
      return root[dep] || root.commonJsStrict[dep];
    })));
  }
}(this, function(exports, chai, CPTestDataHelper, APIFunction, APIObject, commentProcessor) {
  "use strict";


  var expect = chai.expect;
  var createTestData = CPTestDataHelper.createTestData;
  APIFunction = APIFunction.APIFunction;
  APIObject = APIObject.APIObject;


  var testData;
  beforeEach(function() {
    testData = createTestData();
  });


  /*
   * Helper function for transforming automatically generated test data into the form required for APIObject
   * construction if required.
   *
   */

  var makeType = function(testData, type) {
    type = type.toLowerCase();
    if (type === 'apifunction') return testData;

    testData = testData.removeProperty('parameters').removeProperty('synonyms').removeProperty('returns');
    testData.tag = 'apiobject';
    return testData;
  };



  describe('commentProcessor', function() {
    commentProcessor = commentProcessor.commentProcessor;


    describe('Behaviour', function() {
      describe('Common behaviours', function() {
        ['APIFunction', 'APIObject'].forEach(function(type) {
          it('Throws if data not tagged when data has shape of ' + type, function() {
            testData = makeType(testData, type);
            delete testData.tag;
            var fn = function() {
              commentProcessor(testData);
            };

            expect(fn).to.throw();
          });



          it('Throws if first non-degenerate line contains more than one word for ' + type, function() {
            var testData = ['  myvar some more text', '', 'A badly written comment'];
            testData.tag = type.toLowerCase();
            var fn = function() {
              commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          /*
           * Generate tests that ensure comments where the function name is not first are rejected. We don't explicitly check
           * for the summary line, as we can assume it will be a line containing more than one word; another test detects
           * whether such lines are rejected.
           *
           */

          ['category', 'examples'].forEach(function(field) {
            it('Throws when ' + field + ' appears before the function name for ' + type, function() {
              testData = makeType(testData, type);
              testData = testData.moveBefore(field, 'name');
              var fn = function() {
                commentProcessor(testData);
              };

              expect(fn).to.throw();
            });
          });


          it('Throws if category field contains more than one word for ' + type, function() {
            testData = makeType(testData, type);
            testData = testData.replaceProperty('category', 'Category: foo bar');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if category field missing for ' + type, function() {
            testData = makeType(testData, type);
            testData = testData.removeProperty('category');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if summary missing for ' + type, function() {
            testData = makeType(testData, type);
            // Need to remove both summary and details, or details will be detected as the summary
            testData = testData.removeProperty('summary').removeProperty('details');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          /*
           * Generate tests that ensure comments containing multiple magic fields are rejected. We don't explicitly check
           * cases where the name is duplicated - a second name line would be regarded as a summary line, so this scenario
           * will be exercised by the tests looking for out-of-order fields.
           *
           * Duplicated code examples are tested separately
           *
           */

          ['category', 'examples'].forEach(function(field) {
            it('Throws if ' + field + ' field is duplicated for ' + type, function() {
              testData = makeType(testData, type);
              var fieldData = testData.getPropertyValue(field);
              testData = testData.replaceProperty(field, fieldData.concat(fieldData));
              var fn = function() {
                 commentProcessor(testData);
              };

              expect(fn).to.throw();
            });
          });


          it('Throws if code examples are duplicated (2) for ' + type, function() {
            testData = makeType(testData, type);
            testData = testData.concat(['Examples: ']);
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if category field appears after the summary and details for ' + type, function() {
            testData = makeType(testData, type);
            testData = testData.moveAfter('category', 'details');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if category field appears after the summary and before details for ' + type, function() {
            testData = makeType(testData, type);
            testData = testData.moveBefore('category', 'details');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if code examples before summary for ' + type, function() {
            testData = makeType(testData, type);
            testData = testData.moveBefore('examples', 'summary');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if code examples are degenerate for ' + type, function() {
            testData = makeType(testData, type);
            testData = testData.replaceProperty('examples', ['Examples:']);
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          ['details', 'examples'].forEach(function(field) {
            it('Does not throw if ' + field + ' not present', function() {
              testData = makeType(testData, type);
              testData = testData.removeProperty(field);
              var fn = function() {
                commentProcessor(testData);
              };

              expect(fn).to.not.throw();
            });
          });
        });
      });


      describe('APIFunction specific', function() {

        /*
         * Generate tests that ensure comments where the function name is not first are rejected. We don't explicitly check
         * for the summary line, as we can assume it will be a line containing more than one word; another test detects
         * whether such lines are rejected.
         *
         */

        ['parameter', 'return type', 'synonyms'].forEach(function(field) {
          it('Throws when ' + field + ' appears before the function name', function() {
            testData = testData.moveBefore(field, 'name');
            var fn = function() {
              commentProcessor(testData);
            };

            expect(fn).to.throw();
          });
        });


        /*
         * Generate tests that ensure comments containing multiple magic fields are rejected. We don't explicitly check
         * cases where the name is duplicated - a second name line would be regarded as a summary line, so this scenario
         * will be exercised by the tests looking for out-of-order fields.
         *
         * Note that for the parameter field, we precisely test that two lines containing the exact same parameter
         * information is repeated. Another test checks to ensure that lines containing the same parameter name but
         * conflicting information is rejected.
         *
         * Duplicated code examples are tested separately
         *
         */

        ['parameter', 'return type', 'synonyms'].forEach(function(field) {
          it('Throws if ' + field + ' field is duplicated', function() {
            var fieldData = testData.getPropertyValue(field);
            testData = testData.replaceProperty(field, fieldData.concat(fieldData));
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });
        });


        it('Throws if parameter testData contain conflicting information', function() {
          var badParams = ['Parameter: x: number', 'Parameter: x: string'];
          testData = testData.replaceProperty('parameter', badParams);
          var fn = function() {
             commentProcessor(testData);
          };

          expect(fn).to.throw();
        });


        /*
         * Generate tests that ensure comments where information fields appear after the summary are rejected.
         *
         */

        ['parameter', 'return type', 'synonyms'].forEach(function(field) {
          it('Throws if ' + field + ' field appears after the summary and details', function() {
            testData = testData.moveAfter(field, 'details');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if ' + field + ' field appears after the summary and before details', function() {
            testData = testData.moveBefore(field, 'details');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });
        });


        /*
         * Generate tests that ensure comments containing certain fields between parameter and return type fields are rejected.
         *
         */

        ['category', 'synonyms', 'examples'].forEach(function(field) {
          it('Throws if ' + field + ' field appears between the parameters and return type', function() {
            testData = testData.moveAfter(field, 'parameter');
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });


          it('Throws if ' + field + ' field appears between parameters fields', function() {
            var fieldData = testData.getPropertyValue(field);
            var params = ['Parameter: x: number', 'Parameter: y: string'];
            params.splice.apply(params, [1, 0].concat(fieldData));
            testData = testData.replaceProperty('parameter', params);
            var fn = function() {
               commentProcessor(testData);
            };

            expect(fn).to.throw();
          });
        });


        it('More than one parameter OK', function() {
          testData = testData.replaceProperty('parameter', ['Parameter: x: string', 'Parameter: y: number']);
          var fn = function() {
             commentProcessor(testData);
          };

          expect(fn).to.not.throw();
        });


        it('Fields are case insensitive', function() {
          var tag = testData.tag;
          testData = testData.map(function(s) { return s.toUpperCase(); });
          testData.tag = tag;
          var fn = function() {
            commentProcessor(testData);
          };

          expect(fn).to.not.throw();
        });


        it('Does not throw if no parameters or return type present', function() {
          testData = testData.removeProperty('parameter').removeProperty('return type');
          var fn = function() {
            commentProcessor(testData);
          };

          expect(fn).to.not.throw();
        });


        ['parameter', 'return type', 'synonyms'].forEach(function(field) {
          it('Does not throw if ' + field + ' not present', function() {
            testData = testData.removeProperty(field);
            var fn = function() {
              commentProcessor(testData);
            };

            expect(fn).to.not.throw();
          });
        });
      });


      describe('APIObject specific behaviours', function() {
        it('Throws if data is tagged as apiobject, and parameters present', function() {
          testData.tag = 'apiobject';
          testData = testData.removeProperty('returns').removeProperty('synonyms');
          var fn = function() {
            commentProcessor(testData);
          };

          expect(fn).to.throw();
        });


        it('Throws if data is tagged as apiobject, and return type present', function() {
          testData.tag = 'apiobject';
          testData = testData.removeProperty('parameters').removeProperty('synonyms');
          var fn = function() {
            commentProcessor(testData);
          };

          expect(fn).to.throw();
        });


        it('Throws if data is tagged as apiobject, and synonyms present', function() {
          testData.tag = 'apiobject';
          testData = testData.removeProperty('parameters').removeProperty('synonyms');
          var fn = function() {
            commentProcessor(testData);
          };

          expect(fn).to.throw();
        });


        it('Fields are case insensitive', function() {
          testData = makeType(testData, 'apiobject');
          testData = testData.map(function(s) { return s.toUpperCase(); });
          testData.tag = 'apiobject';
          var fn = function() {
            commentProcessor(testData);
          };

          expect(fn).to.not.throw();
        });
      });
    });


    describe('Results', function() {
      var props;

      beforeEach(function() {
        // We reset everything each time to confirm there is no state being transmitted between tests through
        // these variables. We assume mocha runs the global beforeEach first setting resetting testData.

        // Helper function that transforms a line of the form <keyword>: data, returning only the data portion
        var afterColon = function(line) {
          if (Array.isArray(line)) line = line.join('');
          return line.split(':')[1].trim();
        };

        // Note that category is recaptalised by APIFunction
        var category = afterColon(testData.getPropertyValue('category'));
        category = category[0].toUpperCase() + category.slice(1);

        // TODO: There are some implicit assumptions here about the test data: document them
        props = {
          name:  testData.getPropertyValue('name')[0].trim(''),
          category:  category,
          parameterName:  afterColon(testData.getPropertyValue('parameter')),
          parameterType:  testData.getPropertyValue('parameter').join('').split(':')[2].trim(),
          returnType:  [afterColon(testData.getPropertyValue('return type'))],
          synonyms:  afterColon(testData.getPropertyValue('synonyms')).split(',').map(function(s) {return s.trim();}),
          summary:  testData.getPropertyValue('summary').slice(0, -1).join('\n'),
          details:  testData.getPropertyValue('details'),
          examples:  testData.getPropertyValue('examples').slice(1)
        };
      });


      describe('Common results', function() {
        ['apifunction', 'apiobject'].forEach(function(dataType) {
          ['name', 'category', 'summary'].forEach(function(property) {
            it(property + ' is correct for ' + dataType, function() {
              testData = makeType(testData, dataType);

              expect(commentProcessor(testData)[property]).to.equal(props[property]);
            });
          });


          it('Multiple details correct for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var details = ['details line 1', 'details line 2', 'details line 3', 'details line 4'];
            testData = testData.replaceProperty('details', details);
            expect(commentProcessor(testData).details).to.deep.equal(details);
          });


          it('Multiple examples correct for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var examples = ['var x = foo();', '// blah blah', '', 'var g = 1;'];
            testData = testData.replaceProperty('examples', ['Examples:'].concat(examples));
            expect(commentProcessor(testData).examples).to.deep.equal(examples);
          });


          it('Multiple summary lines are merged into one for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var summary = ['Summary line 1.', 'Summary line 2.', 'Summary line 3.', ''];
            testData = testData.replaceProperty('summary', summary);
            expect(commentProcessor(testData).summary).to.deep.equal(summary.slice(0, -1).join('\n'));
          });


          it('Multiple summary lines merging doesn\'t add unneccesary newlines for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var summary = ['Summary line 1.\n', 'Summary line 2.', 'Summary line 3.', ''];
            testData = testData.replaceProperty('summary', summary);
            expect(commentProcessor(testData).summary).to.deep.equal(summary[0] + summary.slice(1, -1).join('\n'));
          });


          it('Trailing empty lines after examples are ignored for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var examples = ['var x = foo();'];
            testData = testData.replaceProperty('examples', ['Examples:'].concat(examples).concat([' ', '']));
            expect(commentProcessor(testData).examples).to.deep.equal(examples);
          });


          it('Trailing empty lines between examples marker and first examples lines are ignored ' + dataType,
             function() {
            testData = makeType(testData, dataType);

            var examples = ['var x = foo();', '', 'var y = foo();'];
            testData = testData.replaceProperty('examples', ['Examples:', '', ' '].concat(examples));
            expect(commentProcessor(testData).examples).to.deep.equal(examples);
          });


          it('Trailing empty lines between details and examples marker are ignored ' + dataType, function() {
            testData = makeType(testData, dataType);

            var details = ['details line 1', '', 'details line 2'];
            var examples = ['var x = foo();', '', 'var y = foo();'];
            testData = testData.replaceProperty('details', details.concat([' ', '']));
            testData = testData.replaceProperty('examples', ['Examples:'].concat(examples));
            expect(commentProcessor(testData).details).to.deep.equal(details);
            expect(commentProcessor(testData).examples).to.deep.equal(examples);
          });


          it('Ignores multiple empty lines between summary and details ' + dataType, function() {
            testData = makeType(testData, dataType);

            var summary = 'Summary';
            testData = testData.replaceProperty('summary', [summary, '', '', ' ']);
            var result = commentProcessor(testData);
            expect(result.summary).to.equal(summary);
            expect(result.details).to.deep.equal(props.details);
          });


          it('Ignores multiple empty lines between summary and examples for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var summary = 'Summary';
            testData = testData.removeProperty('details').replaceProperty('summary', [summary, '', '', ' ']);
            var result = commentProcessor(testData);
            expect(result.summary).to.equal(summary);
            expect(result.examples).to.deep.equal(props.examples);
          });


          it('Ignores multiple empty lines at end of summary when no examples or details present for ' + dataType,
             function() {
            testData = makeType(testData, dataType);

            var summary = 'Summary';
            testData = testData.removeProperty('details').removeProperty('examples');
            testData = testData.replaceProperty('summary', [summary, '', '', ' ']);
            var result = commentProcessor(testData);
            expect(result.summary).to.equal(summary);
          });


          it('A line consisting only of whitespace can demarcate the summary and details for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var summary = 'Summary';
            testData = testData.replaceProperty('summary', [summary, '  ']);
            var result = commentProcessor(testData);
            expect(result.summary).to.deep.equal(summary);
            expect(result.details).to.deep.equal(props.details);
          });


          ['details', 'examples'].forEach(function(propName) {
            it(propName + ' correct for ' + dataType, function() {
              testData = makeType(testData, dataType);

              expect(commentProcessor(testData)[propName]).to.deep.equal(props[propName]);
            });


            it(propName + ' correct when not supplied for ' + dataType, function() {
              testData = makeType(testData, dataType);

              var prop = (propName !== 'return type' ? propName : 'returnType');
              testData = testData.removeProperty(prop);
              expect(commentProcessor(testData)[prop]).to.deep.equal([]);
            });
          });


          it('category is case insensitive for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var existing = testData.getPropertyValue('category');
            var newData = testData.replaceProperty('category', existing.map(function(s) {
              return s.replace('Category', 'CATEGORY');
            }));

            expect(commentProcessor(newData).category).to.deep.equal(commentProcessor(testData).category);
          });


          // TODO: Decide upon our approach to whitespace for examples
          it('category is whitespace insensitive for ' + dataType, function() {
            testData = makeType(testData, dataType);

            var existing = testData.getPropertyValue('category');
            var newData = testData.replaceProperty('category', existing.map(function(s) {
              return '  ' + s.replace(':', '  :  ');
            }));

            expect(commentProcessor(newData).category).to.deep.equal(commentProcessor(testData).category);
          });


          it('Correct constructor used for ' + dataType, function() {
            var expectedConstructor = {
              apifunction: APIFunction,
              apiobject: APIObject
            };

            testData = makeType(testData, dataType);
            expect(commentProcessor(testData)).to.be.an.instanceof(expectedConstructor[testData.tag]);
          });
        });
      });


      describe('APIFunction specific results', function() {
        it('Parameters correct', function() {
          var expected = [{name: props.parameterName, type: [props.parameterType]}];
          expect(commentProcessor(testData).parameters).to.deep.equal(expected);
        });


        [' | ', ', ', ' or '].forEach(function(separator, _, separators) {
          it('Parameter with multiple types correct when separated by "' + separator + '"', function() {
            var params = ['string', 'number', 'object'];
            var expected = [{name: 'x', type: params}];
            var paramString = 'Parameter: ' + expected[0].name + ': ' + expected[0].type.join(separator);
            testData = testData.replaceProperty('parameters', paramString);
            expect(commentProcessor(testData).parameters).to.deep.equal(expected);
          });


          it('Synonyms with multiple variants correct when separated by "' + separator + '"', function() {
            var synonyms = ['doIt', 'doOther', 'funcName'];
            testData = testData.replaceProperty('synonyms', 'Synonyms: ' + synonyms.join(separator));
            expect(commentProcessor(testData).synonyms).to.deep.equal(synonyms);
          });


          it('Multiple return types correct when separated by "' + separator + '"', function() {
            var returnTypes = ['string', 'number', 'object'];
            testData = testData.replaceProperty('return type', 'Returns: ' + returnTypes.join(separator));
            expect(commentProcessor(testData).returnType).to.deep.equal(returnTypes);
          });


          separators.forEach(function(separator2) {
            if (separator2 === separator) return;

            it('Parameter with multiple types correct with mixed separators "' + separator + '" and "' +
               separator2 + '"', function() {
              var paramTypes = ['string', 'number', 'object'];
              var params = paramTypes.slice(0, 2).join(separator) + separator2 + paramTypes[2];
              testData = testData.replaceProperty('parameters', 'Parameter: ' + props.parameterName + ': ' + params);
              var expected = [{name: props.parameterName, type: paramTypes}];
              expect(commentProcessor(testData).parameters).to.deep.equal(expected);
            });


            it('Synonyms with multiple variants correct when separated by "' + separator + '"', function() {
              var synonyms = ['doIt', 'doOther', 'funcName'];
              var synString = synonyms.slice(0, 2).join(separator) + separator2 + synonyms[2];
              testData = testData.replaceProperty('synonyms', 'Synonyms: ' + synString);
              expect(commentProcessor(testData).synonyms).to.deep.equal(synonyms);
            });


            it('Multiple return types correct when separated by "' + separator + '"', function() {
              var returnTypes = ['string', 'number', 'object'];
              var rtnString = returnTypes.slice(0, 2).join(separator) + separator2 + returnTypes[2];
              testData = testData.replaceProperty('return type', 'Returns: ' + rtnString);
              expect(commentProcessor(testData).returnType).to.deep.equal(returnTypes);
            });
          });
        });


        it('Multiple parameters correct', function() {
          var expected = [{name: 'x', type: ['number']}, {name: 'y', type: ['string']}];
          var params = expected.reduce(function (soFar, current) {
            return soFar.concat(['Parameter: ' + current.name + ': ' + current.type.join(' | ')]);
          }, []);
          testData = testData.replaceProperty('parameters', params);
          expect(commentProcessor(testData).parameters).to.deep.equal(expected);
        });


        ['synonyms', 'parameters', 'return type'].forEach(function(propName) {
          if (propName !== 'parameters') {
            it(propName + ' correct', function() {
              var prop = (propName !== 'return type' ? propName : 'returnType');
              expect(commentProcessor(testData)[prop]).to.deep.equal(props[prop]);
            });


            it(propName + ' correct when not supplied', function() {
              var prop = (propName !== 'return type' ? propName : 'returnType');
              testData = testData.removeProperty(prop);
              expect(commentProcessor(testData)[prop]).to.deep.equal([]);
            });
          }


          it(propName + ' is case insensitive', function() {
            var prop = (propName !== 'return type' ? propName : 'returns');
            var existing = testData.getPropertyValue(propName);
            var newData = testData.replaceProperty(prop, existing.map(function(s) {
              return s.replace(prop[0].toUpperCase() + prop.slice(1), prop.toUpperCase());
            }));

            expect(commentProcessor(newData)[prop]).to.deep.equal(commentProcessor(testData)[prop]);
          });


          it(propName + ' is whitespace insensitive', function() {
            var prop = (propName !== 'return type' ? propName : 'returns');
            var existing = testData.getPropertyValue(propName);
            var newData = testData.replaceProperty(propName, existing.map(function(s) {
                return '  ' + s.replace(':', '  :  ');
            }));

            expect(commentProcessor(newData)[prop]).to.deep.equal(commentProcessor(testData)[prop]);
          });
        });


        ['', ' '].forEach(function(empty, i) {
          it('Empty lines between fields are ignored (' + (i + 1) + ')', function() {
            ['name', 'category', 'synonyms', 'parameters', 'returns'].forEach(function(prop) {
              var existing = testData.getPropertyValue(prop);
              testData = testData.replaceProperty(prop, existing.concat([empty]));
            });

            var result = commentProcessor(testData);
            var allProps = ['name', 'category', 'synonyms', 'returnType', 'summary', 'details', 'examples'];
            allProps.forEach(function(propName) {
              expect(result[propName]).to.deep.equal(props[propName]);
            });

            expect(result.parameters).to.deep.equal([{name: props.parameterName, type: [props.parameterType]}]);
          });
        });
      });


      describe('APIObject specific results', function() {
        ['', ' '].forEach(function(empty, i) {
          it('Empty lines between fields are ignored (' + (i + 1) + ')', function() {
            ['name', 'category'].forEach(function(prop) {
              var existing = testData.getPropertyValue(prop);
              testData = testData.replaceProperty(prop, existing.concat([empty]));
            });

            ['returns', 'parameters', 'synonyms'].forEach(function(p) {
              testData = testData.removeProperty(p);
            });
            testData.tag = 'apiobject';

            var result = commentProcessor(testData);
            var allProps = ['name', 'category', 'summary', 'details', 'examples'];
            allProps.forEach(function(propName) {
              expect(result[propName]).to.deep.equal(props[propName]);
            });
          });
        });
      });
    });
  });
}));
