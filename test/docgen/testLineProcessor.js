(function() {
  "use strict";


  var expect = require('chai').expect;
  var LineProcessor = require('../../docgen/lineProcessor');


  describe('LineProcessor', function() {
    ['apifunction', 'apiobject'].forEach(function(tag) {
      it('LineProcessor recognises a line with an <' + tag + '> opening tag', function() {
        var recognised = ['<' + tag + '>'];
        var testData = [['foo'], ['* bar'], recognised];
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
        var testData = [['foo'], ['bar'], precedingWhiteSpace, ['fizz'], trailingWhiteSpace, ['buzz'],
                        surroundingWhiteSpace, ['baz'], commentFragment1, commentFragment2, commentFragment3,
                        commentFragment4];
        var result = LineProcessor(testData);

        expect(result.length).to.equal(7);
      });


      it('LineProcessor throws if <' + tag + '> is not the only item on the line', function() {
        var testData = [['foo'], ['* bar'], ['*    <' + tag + '>    1 2 3 *']];
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
        var testData = [precedingWhiteSpace, trailingWhiteSpace, surroundingWhiteSpace, commentFragment1,
                        commentFragment2, commentFragment3, commentFragment4].map(function(arr) {
          return arr.concat(['abc']);
        });

        var result = LineProcessor(testData);

        expect(result.every(function(apiLines) {
          return apiLines[0].indexOf('<' + tag + '>') === -1;
        })).to.equal(true);
      });


      it('LineProcessor consumes rest of comment if no closing <' + tag + '> tag', function() {
        var testData = [['foo'], ['* bar'], ['*     <' + tag + '>', 'abc', '', 'def', 'fizz', 'buzz']];
        var result = LineProcessor(testData);

        expect(result[0].length).to.equal(5);
      });


      it('LineProcessor consumes to </' + tag + '> if present', function() {
        var apiLines = ['abc', '', 'def'];
        apiLines.tag = tag;
        var recognised = ['  *  <' + tag + '>'].concat(apiLines).concat(['</' + tag + '>']);
        var testData = [recognised];
        var result = LineProcessor(testData);

        expect(result[0]).to.deep.equal(apiLines);
      });


      it('LineProcessor recognises </' + tag + '> lines with whitespace or comment asterisks', function() {
        var apiLines = ['abc', '', 'def'];
        apiLines.tag = tag;
        var forms = ['  </' + tag + '>', '</' + tag + '>   ', '  </' + tag + '>', '* </' + tag + '>', ' * </' + tag + '>',
                     '</' + tag + '>   *', ' *</' + tag + '> *'];
        var testData = forms.map(function(form) {
          return ['  *<' + tag + '>  *'].concat(apiLines).concat(form);
        });
        var result = LineProcessor(testData);

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
          var testData = [[' <' + tag + '>'].concat(['foo']).concat(bad)];
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
        testData[testData.length] = toBeTrimmed;
        var result = LineProcessor(testData);

        expect(result[0]).to.deep.equal(expected);
      });


      it('LineProcessor throws if </' + tag + '> is not the only item on the line', function() {
        var testData = [['foo'], ['* bar'], ['* <' + tag + '>', 'abc', '*    </' + tag + '>    1 2 3 *']];
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

        testData[testData.length] = toBeTrimmed;
        var result = LineProcessor(testData);

        expect(result[0]).to.deep.equal(expected);
      });


      it('LineProcessor attaches tag type to result for ' + tag, function() {
        var testData = [['<' + tag + '>', 'foo', '</' + tag + '>']];
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
          LineProcessor([bad]);
        };

        expect(fn).to.throw();
      });
    });


    it('LineProcessor throws if multiple tags in one comment', function() {
      var badForms = [[' <apifunction>', 'foo', '</apifunction>', '<apiobject>', 'bar', '</apiobject>'],
                      [' <apiobject>', 'foo', '</apiobject>', '<apifunction>', 'bar', '</apifunction>']];
      badForms.forEach(function(bad) {
        var fn = function() {
          LineProcessor([bad]);
        };

        expect(fn).to.throw();
      });
    });
    // XXX Should we trim leading whitespace? That will depend on Markdown syntax and our use of it
  });
})();
