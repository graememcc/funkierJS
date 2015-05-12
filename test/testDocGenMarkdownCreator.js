// XXX Do we intend to allow these tests to be run in the browser?
(function (root, factory) {
  var dependencies = ['chai', '../docgen/APIFunction', '../docgen/markdownCreator.js'];

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
}(this, function(exports, chai, APIFunction, MarkdownCreator) {
  "use strict";


  var expect = chai.expect;
  APIFunction = APIFunction.APIFunction;
  MarkdownCreator = MarkdownCreator.MarkdownCreator;


  describe('Markdown creator', function() {
    var options = {
      'synonyms':   ['doIt', 'alternateName'],
      'parameters': [{name: 'x', type: ['Array']}, {name: 'y', type: ['string', 'number']}],
      'returnType': ['number'],
      'details':    ['Line 1', '', 'Line 2'],
      'examples':   ['var x = foo();', '', 'var y = foo();']
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
      verifyLine('<a name = "' + name + '"><section></a>');
      verifyLine('### ' + name + ' ###');
    };


    var verifyCategory = function(category) {
      verifyLine('Category: ' + category);
      verifyLine('');
    };


    var verifySynonyms = function(synonyms) {
      synonyms = synonyms.map(function (s) { return '<li>`' + s + '`</li>'; }).join(', ');
      verifyLine('*Synonyms:* <ul class="synonymsList">' + synonyms + '</ul>');
      verifyLine('');
    };


    var verifyUsage = function(name, parameters, returnType) {
      parameters = parameters || [];
      returnType = returnType || [];

      var params = parameters.map(function(p) { return p.name; }).join(', ');
      var rtn = returnType.length > 0 ? '`var result = ' : '`';
      verifyLine('** Usage: ** ' + rtn + name + '(' + params + ');`');
    };


    var verifyParameters = function(parameters, toLink) {
      toLink = toLink || [];

      verifyLine('<div class="usage">');
      verifyLine('  <table class="usageTable">');
      verifyLine('    <tbody>');
      parameters.forEach(function(param) {
        verifyLine('      <tr>');
        verifyLine('        <td>`' + param.name + '`</td>');

        var paramTypeText = '<ul class="typeList">' + param.type.map(function(type) {
          if (toLink.indexOf(type) !== -1)
            return '<li>[`' + type + '`](#' + type + ')</li>';
          return '<li>`' + type + '`</li>';
        }).join(' | ') + '</ul>';

        verifyLine('        <td>' + paramTypeText + '</td>');
        verifyLine('      </tr>');
      });

      verifyLine('    </tbody>');
      verifyLine('  </table>');
      verifyLine('</div>');
    };


    var verifyReturnType = function(returnType, toLink) {
      toLink = toLink || [];

      var returnDetail = returnType.map(function(s) {
        if (toLink.indexOf(s) !== -1)
          return '<li>[`' + s + '`](#' + s + ')</li>';
        return '<li>`' + s + '`</li>';
      }).join(' | ');

      verifyLine('Returns: <ul class="typeList">' + returnDetail + '</ul>');
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


    var testDescription = function(testNumber, testOptions) {
      var catText = ('includeCategory' in testOptions && testOptions.includeCategory ? '' : 'out') + ' category';
      if (testNumber === 0)
        return 'Markdown correct when APIFunction contains no optional parameters with' + catText;

      var asBin = testNumber.toString(2);
      var contents = optionalFields.filter(function(_, i) { return asBin[i] === '1'; });

      var fieldDesc;
      if (contents.length === 1)
        fieldDesc = contents[0];
      else
        fieldDesc = contents.slice(0, -1).join(', ') + ' and ' + contents[contents.length - 1];

      return 'Markdown correct when APIFunction contains ' + fieldDesc + ' options with' + catText;
    };


    var makeMarkdownTest = function(testNumber, testOptions) {
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

        result = MarkdownCreator(APIFunction(name, category, summary, apiOptions), testOptions).split('\n');

        verifyName(name);

        if ('includeCategory' in testOptions && testOptions.includeCategory)
          verifyCategory(category);

        if ('synonyms' in apiOptions)
          verifySynonyms(apiOptions.synonyms);

        verifyUsage(name, apiOptions.parameters, apiOptions.returnType);

        if ('parameters' in apiOptions)
          verifyParameters(apiOptions.parameters);

        if ('returnType' in apiOptions)
          verifyReturnType(apiOptions.returnType);

        if (!('parameters' in apiOptions) && !('returnType' in apiOptions))
          verifyLine('');

        verifyLine(summary);

        if ('details' in apiOptions)
          verifyDetails(apiOptions.details);

        if ('examples' in apiOptions)
          verifyExamples(apiOptions.examples);

        verifyLine('</section>');
      };
    };


    /*
     * We want to check the output is correct for every combination of optional fields, so we generate these tests
     * automatically.
     *
     */

    for (var i = 0, l = Math.pow(2, optionalFields.length); i < l; i++) {
      it(testDescription(i, {includeCategory: true}), makeMarkdownTest(i, {includeCategory: true}));
      it(testDescription(i, {includeCategory: false}), makeMarkdownTest(i, {includeCategory: false}));
    }


    it('Markdown correct for an object representing a synonym', function() {
      var synonymObj = {name: 'bar', synonymFor: 'foo'};
      result = MarkdownCreator(synonymObj, {}).split('\n');

      pos = 0;
      verifyName('bar');
      verifyLine('See [`foo`](#foo)');
      verifyLine('</section>');
    });


    var makeLinkTest = function(testOptions) {
      return function() {
        // Build the APIFunction object
        var apiOptions = {parameters: [{name: 'x', type: ['number', 'LinkType']},
                                       {name: 'y', type: ['string']},
                                       {name: 'z', type: ['LinkType', 'Object']}],
                          returnType: ['LinkType', 'foo', 'number']};

        var name = 'test';
        var category = 'Category';
        var summary = 'summary';

        var opts = Object.create(testOptions);
        opts.toLink = ['LinkType', 'foo'];
        result = MarkdownCreator(APIFunction(name, category, summary, apiOptions), opts).split('\n');

        verifyName(name);

        if ('includeCategory' in testOptions && testOptions.includeCategory)
          verifyCategory(category);

        verifyUsage(name, apiOptions.parameters, apiOptions.returnType);
        verifyParameters(apiOptions.parameters, opts.toLink);
        verifyReturnType(apiOptions.returnType, opts.toLink);
        verifyLine(summary);
      };
    };


    it('Types in parameters and return types linked correctly (with category)', makeLinkTest({includeCategory: true}));
    it('Types in parameters and return types linked correctly (without category)', makeLinkTest({includeCategory: false}));


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
}));
