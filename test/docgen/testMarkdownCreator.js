(function() {
  "use strict";


  var expect = require('chai').expect;
  var APIFunction = require('../../docgen/APIFunction');
  var APIObject = require('../../docgen/APIObject');
  var MarkdownCreator = require('../../docgen/markdownCreator');


  describe('Markdown creator', function() {
    // This array is used for test generation, and this requires that details and examples are the first two entries
    var options = {
      'details':    ['Line 1', '', 'Line 2'],
      'examples':   ['var x = foo();', '', 'var y = foo();'],
      'synonyms':   ['doIt', 'alternateName'],
      'parameters': [{name: 'x', type: ['Array']}, {name: 'y', type: ['string', 'number']}],
      'returnType': ['number'],
    };
    var optionalFields = Object.keys(options);


    /*
     * Most of the tests in this file will have to advance through the output, ensuring the lines at each position
     * match their expectations. To avoid repeating verification routines ad-nauseum, we provide some "global"
     * variables and routines to assist. The test should place the output into the 'result' variable, and the position
     * within the result into the 'pos' variable (result is assumed to be an array of strings). The test can then use
     * the verifyLine routine to check that the current line matches whilst advancing the position.
     *
     * The 'result' and 'pos' variables will be reset to generic values before each test; it is the result of each
     * individual test to set them to appropriate values before the first call to verifyLine.
     *
     */

    var pos, result;


    var verifyLine = function(line) {
      expect(result[pos]).to.equal(line);
      pos += 1;
    };


    beforeEach(function() {
      pos = 0;
      result = [];
    });


    /*
     * Helper functions for verifying portions of the expected output.
     *
     */

    var verifyName = function(name) {
      pos = 0;
      verifyLine('### ' + name + ' ###');
    };


    var verifyCategory = function(category) {
      verifyLine('Category: ' + category);
      verifyLine('');
    };


    var verifySynonyms = function(synonyms) {
      synonyms = synonyms.map(function (s, i, arr) { return '`' + s + '`' + (i !== arr.length - 1 ? ' | ' : ''); });
      synonyms = synonyms.join('');
      verifyLine('*Synonyms:* ' + synonyms);
      verifyLine('');
    };


    var verifyUsage = function(name, parameters, returnType) {
      parameters = parameters || [];
      returnType = returnType || [];

      var params = parameters.map(function(p) { return p.name; }).join(', ');
      var rtn = returnType.length > 0 ? '`var result = ' : '`';
      verifyLine('**Usage:** ' + rtn + name + '(' + params + ');`');
      verifyLine('');
    };


    var verifyParameters = function(parameters) {
      verifyLine('Parameters:  ');
      parameters.forEach(function(param, i, arr) {
        var types = param.type.map(function (s, i, arr) {
          return '`' + s + '`' + (i !== arr.length - 1 ? ' | ' : '');
        });
        types = types.join('');
        verifyLine(param.name + ' ' + types + (i !== arr.length - 1 ? '  ' : ''));
      });
      verifyLine('');
    };


    var verifyReturnType = function(returnType) {
      var types = returnType.map(function(s, i, arr) { return '`' + s + '`' + (i !== arr.length - 1 ? ' | ' : ''); });
      verifyLine('Returns: ' + types.join(''));
      verifyLine('');
    };


    var verifyDetails = function(details) {
      verifyLine('');
      details.forEach(function(line) {
        verifyLine(line);
      });
    };


    var verifyExamples = function(examples) {
      verifyLine('');
      verifyLine('#### Examples ####');
      examples.forEach(function(line) {
        verifyLine('    ' + line);
      });
    };


    var testDescription = function(testNumber, testType, testOptions) {
      var catText = ('includeCategory' in testOptions && testOptions.includeCategory ? '' : 'out') + ' category';
      if (testNumber === 0)
        return 'Markdown correct when ' + testType + ' contains no optional parameters with' + catText;

      var asBin = testNumber.toString(2);
      var contents = (testType === 'APIFunction' ? optionalFields : optionalFields.slice(0, 2)).filter(function(_, i) {
        return asBin[i] === '1';
      });

      var fieldDesc;
      if (contents.length === 1)
        fieldDesc = contents[0];
      else
        fieldDesc = contents.slice(0, -1).join(', ') + ' and ' + contents[contents.length - 1];

      return 'Markdown correct when ' + testType + ' contains ' + fieldDesc + ' options with' + catText;
    };


    var makeMarkdownTest = function(testNumber, testType, testOptions) {
      return function() {
        // Build the APIFunction object
        var asBin = testNumber.toString(2);
        var apiOptions = {};
        [].forEach.call(asBin, function(elem, i) {
          if (elem === '1') {
            var prop = optionalFields[i];
            apiOptions[prop] = options[prop];
          }
        });

        var name = 'test'+testNumber;
        var category = 'Category' + testNumber;
        var summary = 'summary' + testNumber;

        var constructor = testType === 'APIFunction' ? APIFunction : APIObject;
        result = MarkdownCreator(constructor(name, 'a.js', category, summary, apiOptions), testOptions).split('\n');

        verifyName(name);

        if ('includeCategory' in testOptions && testOptions.includeCategory)
          verifyCategory(category);

        if ('synonyms' in apiOptions)
          verifySynonyms(apiOptions.synonyms);

        if (testType !== 'APIObject')
          verifyUsage(name, apiOptions.parameters, apiOptions.returnType);

        if ('parameters' in apiOptions)
          verifyParameters(apiOptions.parameters);

        if ('returnType' in apiOptions)
          verifyReturnType(apiOptions.returnType);

        verifyLine(summary);

        if ('details' in apiOptions)
          verifyDetails(apiOptions.details);

        if ('examples' in apiOptions)
          verifyExamples(apiOptions.examples);

        verifyLine('***');
      };
    };


    /*
     * We want to check the output is correct for every combination of optional fields, so we generate these tests
     * automatically.
     *
     */

    for (var i = 0, l = Math.pow(2, optionalFields.length); i < l; i++) {
      it(testDescription(i, 'APIFunction', {includeCategory: true}),
         makeMarkdownTest(i, 'APIFunction', {includeCategory: true}));
      it(testDescription(i, 'APIFunction', {includeCategory: false}),
         makeMarkdownTest(i, 'APIFunction', {includeCategory: false}));
    }


    for (i = 0, l = Math.pow(2, optionalFields.slice(0, 2).length); i < l; i++) {
      it(testDescription(i, 'APIObject', {includeCategory: true}),
         makeMarkdownTest(i, 'APIObject', {includeCategory: true}));
      it(testDescription(i, 'APIObject', {includeCategory: false}),
         makeMarkdownTest(i, 'APIObject', {includeCategory: false}));
    }


    it('Markdown correct for an object representing a synonym', function() {
      var synonymObj = {name: 'bar', synonymFor: 'foo'};
      result = MarkdownCreator(synonymObj, {}).split('\n');

      pos = 0;
      verifyName('bar');
      verifyLine('See `foo`');
      verifyLine('***');
    });


    /*
     * Generate tests that prove that MarkdownCreator throws when supplied invalid objects.
     *
     */

    var invalidArrayData = [{value: 1, type: 'number'},
                            {value: true, type: 'boolean'},
                            {value: {}, type: 'random object'},
                            {value: undefined, type: 'undefined'},
                            {value: null, type: 'null' },
                            {value: [], type: 'array'},
                            {value: 'foo', type: 'string'},
                            {value: [Function], type: 'function'}];

    invalidArrayData.forEach(function(invalid) {
      it('Throws if supplied value is of type ' + invalid.type, function() {
        var fn = function() {
          MarkdownCreator(invalid.value, {includeCategory: false});
        };

        expect(fn).to.throw();
      });


      if (invalid.type !== 'random object') {
        it('Throws if options is of type ' + invalid.type, function() {
          var fn = function() {
            MarkdownCreator(APIFunction('name', 'Cat', 'summary', {}), invalid.value);
          };

          expect(fn).to.throw();
        });
      }
    });
  });
})();
