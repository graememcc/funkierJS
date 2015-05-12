// XXX Do we intend to allow these tests to be run in the browser?
(function (root, factory) {
  var dependencies = ['chai', '../../docgen/lineProcessor'];

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
}(this, function(exports, chai, LineProcessor) {
  "use strict";


  var expect = chai.expect;


  describe('LineProcessor', function() {
    LineProcessor = LineProcessor.LineProcessor;

    it('LineProcessor recognises a line with an <apifunction> opening tag', function() {
      var recognised = ['<apifunction>'];
      var testData = [['foo'], ['* bar'], recognised];
      var result = LineProcessor(testData);

      expect(result.length).to.equal(1);
    });


    it('LineProcessor recognises <apifunction> lines with whitespace or preceding asterisk', function() {
      var precedingWhiteSpace = ['  <apifunction>'];
      var trailingWhiteSpace = ['<apifunction>    '];
      var surroundingWhiteSpace = ['   <apifunction>    '];
      var commentFragment1 = ['  *  <apifunction>    '];
      var commentFragment2 = ['*  <apifunction>    '];
      var commentFragment3 = ['<apifunction>    *'];
      var commentFragment4 = [' * <apifunction>    *'];
      var testData = [['foo'], ['bar'], precedingWhiteSpace, ['fizz'], trailingWhiteSpace, ['buzz'],
                      surroundingWhiteSpace, ['baz'], commentFragment1, commentFragment2, commentFragment3,
                      commentFragment4];
      var result = LineProcessor(testData);

      expect(result.length).to.equal(7);
    });


    it('LineProcessor throws if <apifunction> is not the only item on the line', function() {
      var testData = [['foo'], ['* bar'], ['*    <apifunction>    1 2 3 *']];
      var fn = function() {
        LineProcessor(testData);
      };

      expect(fn).to.throw();
    });


    it('LineProcessor strips apifunction tag', function() {
      var precedingWhiteSpace = ['  <apifunction>'];
      var trailingWhiteSpace = ['<apifunction>    '];
      var surroundingWhiteSpace = ['   <apifunction>    '];
      var commentFragment1 = ['  *  <apifunction>    '];
      var commentFragment2 = ['*  <apifunction>    '];
      var commentFragment3 = ['<apifunction>    *'];
      var commentFragment4 = [' * <apifunction>    *'];
      var testData = [precedingWhiteSpace, trailingWhiteSpace, surroundingWhiteSpace, commentFragment1,
                      commentFragment2, commentFragment3, commentFragment4].map(function(arr) {
        return arr.concat(['abc']);
      });

      var result = LineProcessor(testData);

      expect(result.every(function(apiLines) {
        return apiLines[0].indexOf('<apifunction>') === -1;
      })).to.equal(true);
    });


    it('LineProcessor consumes rest of comment if no closing <apifunction> tag', function() {
      var testData = [['foo'], ['* bar'], ['*     <apifunction>', 'abc', '', 'def', 'fizz', 'buzz']];
      var result = LineProcessor(testData);

      expect(result[0].length).to.equal(5);
    });


    it('LineProcessor consumes to </apifunction> if present', function() {
      var apiLines = ['abc', '', 'def'];
      var recognised = ['  *  <apifunction>'].concat(apiLines).concat(['</apifunction>']);
      var testData = [recognised];
      var result = LineProcessor(testData);

      expect(result[0]).to.deep.equal(apiLines);
    });


    it('LineProcessor recognises </apifunction> lines with whitespace or comment asterisks', function() {
      var apiLines = ['abc', '', 'def'];
      var forms = ['  </apifunction>', '</apifunction>   ', '  </apifunction>', '* </apifunction>', ' * </apifunction>',
                   '</apifunction>   *', ' *</apifunction> *'];
      var testData = forms.map(function(form) {
        return ['  *<apifunction>  *'].concat(apiLines).concat(form);
      });
      var result = LineProcessor(testData);

      result.forEach(function(lines) {
        expect(lines).to.deep.equal(apiLines);
      });
    });


    it('LineProcessor throws if more than one <apifunction> tag in one comment', function() {
      var badForms = [[' <apifunction>'],
                      [' </apifunction>', '* <apifunction>'],
                      [' </apifunction>', '* </apifunction>'],
                      [' </apifunction>', 'baz', ' * <apifunction>  * ', '* </apifunction>']];
      badForms.forEach(function(bad) {
        var testData = [[' <apifunction>'].concat(['foo']).concat(bad)];
        var fn = function() {
          LineProcessor(testData);
        };

        expect(fn).to.throw();
      });
    });


    it('LineProcessor trims surrounding comment asterisks', function() {
      var testData = [['foo'], ['* bar']];
      var toBeTrimmed = ['*     <apifunction>', '*abc', '', '      *def * ', ' efgh     *', '* </apifunction>'];
      var expected = toBeTrimmed.slice(1, -1).map(function(line) {
        return line.replace(/^(\s*\*)?(.*)/, '$2');
      }).map(function(line) {
        return line.replace(/\s*(\*\s*)?$/, '');
      });

      testData[testData.length] = toBeTrimmed;
      var result = LineProcessor(testData);

      expect(result[0]).to.deep.equal(expected);
    });


    it('LineProcessor throws if </apifunction> is not the only item on the line', function() {
      var testData = [['foo'], ['* bar'], ['* <apifunction>', 'abc', '*    </apifunction>    1 2 3 *']];
      var fn = function() {
        LineProcessor(testData);
      };

      expect(fn).to.throw();
    });


    it('LineProcessor trims first space after a comment asterisk', function() {
      var testData = [['foo'], ['* bar']];
      var toBeTrimmed = ['*     <apifunction>', '* abc', '', '      * def * ', ' efgh     *', '* </apifunction>'];
      var expected = toBeTrimmed.slice(1, -1).map(function(line) {
        return line.replace(/^(\s*\*\s?)?(.*)/, '$2');
      }).map(function(line) {
        return line.replace(/\s*(\*\s*)?$/, '');
      });

      testData[testData.length] = toBeTrimmed;
      var result = LineProcessor(testData);

      expect(result[0]).to.deep.equal(expected);
    });

    // XXX Should we trim leading whitespace? That will depend on Markdown syntax and our use of it
  });
}));
