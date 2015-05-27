(function() {
  "use strict";


  var expect = require('chai').expect;
  var LineProcessor = require('../../docgen/lineProcessor');


  /*
   * LineProcessor requires each array of comment contents to be tagged with the file it was found in. This convenience
   * function applies a fake tag to test data.
   *
   */

  var tagTestData = function(testData) {
    testData.forEach(function(arr) {
      arr.file = 'a.js';
    });

    return testData;
  };


  describe('LineProcessor', function() {
    ['apifunction', 'apiobject'].forEach(function(tag) {
      it('LineProcessor recognises a line with an <' + tag + '> opening tag', function() {
        var recognised = ['<' + tag + '>'];
        var testData = tagTestData([['foo'], ['* bar'], recognised]);
        var result = LineProcessor(testData);

        expect(result.length).to.equal(1);
      });


      it('LineProcessor recognises <' + tag + '> lines with whitespace or preceding asterisk', function() {
        var precedingWhiteSpace = ['  <' + tag + '>'];
        var trailingWhiteSpace = ['<' + tag + '>    '];
        var surroundingWhiteSpace = ['   <' + tag + '>    '];
        var commentFragment1 = ['  *  <' + tag + '>    '];
        var commentFragment2 = ['*  <' + tag + '>    '];
        var commentFragment3 = ['<' + tag + '>    *'];
        var commentFragment4 = [' * <' + tag + '>    *'];
        var testData = tagTestData([['foo'], ['bar'], precedingWhiteSpace, ['fizz'], trailingWhiteSpace, ['buzz'],
                        surroundingWhiteSpace, ['baz'], commentFragment1, commentFragment2, commentFragment3,
                        commentFragment4]);
        var result = LineProcessor(testData);

        expect(result.length).to.equal(7);
      });


      it('LineProcessor throws if <' + tag + '> is not the only item on the line', function() {
        var testData = tagTestData([['foo'], ['* bar'], ['*    <' + tag + '>    1 2 3 *']]);
        var fn = function() {
          LineProcessor(testData);
        };

        expect(fn).to.throw();
      });


      it('LineProcessor strips ' + tag + ' tag', function() {
        var precedingWhiteSpace = ['  <' + tag + '>'];
        var trailingWhiteSpace = ['<' + tag + '>    '];
        var surroundingWhiteSpace = ['   <' + tag + '>    '];
        var commentFragment1 = ['  *  <' + tag + '>    '];
        var commentFragment2 = ['*  <' + tag + '>    '];
        var commentFragment3 = ['<' + tag + '>    *'];
        var commentFragment4 = [' * <' + tag + '>    *'];
        var testData = tagTestData([precedingWhiteSpace, trailingWhiteSpace, surroundingWhiteSpace, commentFragment1,
                        commentFragment2, commentFragment3, commentFragment4].map(function(arr) {
          return arr.concat(['abc']);
        }));

        var result = LineProcessor(testData);

        expect(result.every(function(apiLines) {
          return apiLines[0].indexOf('<' + tag + '>') === -1;
        })).to.equal(true);
      });


      it('LineProcessor consumes rest of comment if no closing <' + tag + '> tag', function() {
        var testData = tagTestData([['foo'], ['* bar'], ['*     <' + tag + '>', 'abc', '', 'def', 'fizz', 'buzz']]);
        var result = LineProcessor(testData);

        expect(result[0].length).to.equal(5);
      });


      it('LineProcessor consumes to </' + tag + '> if present', function() {
        var apiLines = ['abc', '', 'def'];
        apiLines.tag = tag;
        apiLines.file = 'a.js';
        var recognised = ['  *  <' + tag + '>'].concat(apiLines).concat(['</' + tag + '>']);
        var testData = tagTestData([recognised]);
        var result = LineProcessor(testData);

        expect(result[0]).to.deep.equal(apiLines);
      });


      it('LineProcessor recognises </' + tag + '> lines with whitespace or comment asterisks', function() {
        var apiLines = ['abc', '', 'def'];
        apiLines.tag = tag;
        apiLines.file = 'a.js';
        var forms = ['  </' + tag + '>', '</' + tag + '>   ', '  </' + tag + '>', '* </' + tag + '>', ' * </' + tag + '>',
                     '</' + tag + '>   *', ' *</' + tag + '> *'];
        var testData = forms.map(function(form) {
          return ['  *<' + tag + '>  *'].concat(apiLines).concat(form);
        });
        var result = LineProcessor(tagTestData(testData));

        result.forEach(function(lines) {
          expect(lines).to.deep.equal(apiLines);
        });
      });


      it('LineProcessor throws if more than one <' + tag + '> tag in one comment', function() {
        var badForms = [[' <' + tag + '>'],
                        [' </' + tag + '>', '* <' + tag + '>'],
                        [' </' + tag + '>', '* </' + tag + '>'],
                        [' </' + tag + '>', 'baz', ' * <' + tag + '>  * ', '* </' + tag + '>']];
        badForms.forEach(function(bad) {
          var testData = tagTestData([[' <' + tag + '>'].concat(['foo']).concat(bad)]);
          var fn = function() {
            LineProcessor(testData);
          };

          expect(fn).to.throw();
        });
      });


      it('LineProcessor trims surrounding comment asterisks for ' + tag, function() {
        var testData = [['foo'], ['* bar']];
        var toBeTrimmed = ['*     <' + tag + '>', '*abc', '', '      *def * ', ' efgh     *', '* </' + tag + '>'];
        var expected = toBeTrimmed.slice(1, -1).map(function(line) {
          return line.replace(/^(\s*\*)?(.*)/, '$2');
        }).map(function(line) {
          return line.replace(/\s*(\*\s*)?$/, '');
        });

        expected.tag = tag;
        expected.file = 'a.js';
        testData[testData.length] = toBeTrimmed;
        testData = tagTestData(testData);
        var result = LineProcessor(testData);

        expect(result[0]).to.deep.equal(expected);
      });


      it('LineProcessor throws if </' + tag + '> is not the only item on the line', function() {
        var testData = tagTestData([['foo'], ['* bar'], ['* <' + tag + '>', 'abc', '*    </' + tag + '>    1 2 3 *']]);
        var fn = function() {
          LineProcessor(testData);
        };

        expect(fn).to.throw();
      });


      it('LineProcessor trims first space after a comment asterisk for ' + tag, function() {
        var testData = [['foo'], ['* bar']];
        var toBeTrimmed = ['*     <' + tag + '>', '* abc', '', '      * def * ', ' efgh     *', '* </' + tag + '>'];
        var expected = toBeTrimmed.slice(1, -1).map(function(line) {
          return line.replace(/^(\s*\*\s?)?(.*)/, '$2');
        }).map(function(line) {
          return line.replace(/\s*(\*\s*)?$/, '');
        });
        expected.tag = tag;
        expected.file = 'a.js';

        testData[testData.length] = toBeTrimmed;
        testData = tagTestData(testData);
        var result = LineProcessor(testData);

        expect(result[0]).to.deep.equal(expected);
      });


      it('LineProcessor attaches tag type to result for ' + tag, function() {
        var testData = tagTestData([['<' + tag + '>', 'foo', '</' + tag + '>']]);
        var result = LineProcessor(testData);

        expect(result[0].tag).to.equal(tag);
      });
    });


    it('LineProcessor throws if inconsistent tags in one comment', function() {
      var badForms = [[' <apifunction>', 'foo', '</apiobject>'],
                      [' <apiobject>', 'foo', '</apifunction>'],
                      [' <apifunction>', '<apiobject>', 'foo', '</apifunction>'],
                      [' <apifunction>', '<apiobject>', 'foo', '</apiobject>'],
                      [' <apiobject>', '<apifunction>', 'foo', '</apifunction>'],
                      [' <apiobject>', '<apifunction>', 'foo', '</apiobject>'],
                      [' <apifunction>', 'foo', '</apiobject>', '</apifunction>'],
                      [' <apifunction>', 'foo', '</apiobject>', '</apiobject>'],
                      [' <apiobject>', 'foo', '</apifunction>', '</apifunction>'],
                      [' <apiobject>', 'foo', '</apifunction>', '</apiobject>']];
      badForms.forEach(function(bad) {
        var fn = function() {
          LineProcessor(tagTestData([bad]));
        };

        expect(fn).to.throw();
      });
    });


    it('LineProcessor throws if multiple tags in one comment', function() {
      var badForms = [[' <apifunction>', 'foo', '</apifunction>', '<apiobject>', 'bar', '</apiobject>'],
                      [' <apiobject>', 'foo', '</apiobject>', '<apifunction>', 'bar', '</apifunction>']];
      badForms.forEach(function(bad) {
        var fn = function() {
          LineProcessor(tagTestData([bad]));
        };

        expect(fn).to.throw();
      });
    });


    it('LineProcessor throws if supplied lines do not have a filename tag (1)', function() {
      var untagged = [' <apifunction>', 'foo', '</apifunction>'];
      var fn = function() {
        LineProcessor([untagged]);
      };

      expect(fn).to.throw();
    });


    it('LineProcessor throws if supplied lines do not have a filename tag (2)', function() {
      var untagged = [' <apiobject>', 'foo', '</apiobject>'];
      var fn = function() {
        LineProcessor([untagged]);
      };

      expect(fn).to.throw();
    });


    it('LineProcessor preserves filename tag', function() {
      var tagged = [' <apifunction>', 'foo', '</apifunction>'];
      tagged.file = 'b.js';
      var result = LineProcessor([tagged]);

      expect(result[0].file).to.equal(tagged.file);
    });
  });
})();
