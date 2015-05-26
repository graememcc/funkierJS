module.exports = (function() {
  "use strict";


  /*
   * The LineProcessor takes an array of arrays of lines, as output by '.split'.ting on the comments property returned
   * by Esprima. It then filters these to the portions tagged as API documentation, removing any comment cruft in the
   * process.
   *
   * It enforces the following requirements:
   *   - A comment block contains only one <apifunction> or <apiobject> delimiter, and it is the only item present on
   *     the line (modulo whitespace and preceding / trailing comment formatting asterisks)
   *   - A comment block contains at most one </apifunction> or <apiobject> delimiter, and it is the only item present
   *     on the line (modulo whitespace and preceding / trailing comment formatting asterisks)
   *   - The tags are consistent
   *
   */

  var LineProcessor = function(comments) {
    var result = [];

    comments.forEach(function(commentLines) {
      var typeFound;

      if (commentLines.some(function(line) {
        // We are relying on the early exit properties of some
        typeFound = null;

        if (line.indexOf('<apifunction>') !== -1)
          typeFound = 'apifunction';
        else if (line.indexOf('<apiobject>') !== -1)
          typeFound = 'apiobject';

        return typeFound !== null;
      })) {
        result.push(processLines(commentLines, typeFound));
      }
    });

    return result;
  };


  var regexps = {
    'apifunction' : {
      opening: /<apifunction>/, closing: /<\/apifunction>/, opposite: /<\/?apiobject>/
    },
    'apiobject' : {
      opening: /<apiobject>/, closing: /<\/apiobject>/, opposite: /<\/?apifunction>/
    }
  };


  var processLines = function(lines, tagFound) {
    // We assume the caller has checked for the presence of an opening delimiter
    var opened = false;
    var closed = false;
    var openingRegExp = regexps[tagFound].opening;
    var closingRegExp = regexps[tagFound].closing;
    var oppositeRegExp = regexps[tagFound].opposite;

    var result = lines.reduce(function(result, line) {
      if (openingRegExp.test(line)) {
        // Remove the opening delimiter, or throw if we have more than one, or it is not the only item on the line
        if (opened || closed || !(new RegExp('^\\s*(\\*\\s*)?<' + tagFound + '>\\s*(\\*\\s*)?$')).test(line))
          throw new Error('Duplicate API documentation opening tag!');

        opened = true;
      } else if (closingRegExp.test(line)) {
        // Remove the closing delimiter, or throw if we have more than one, we have not found encountered an opening
        // delimiter or it is not the only item on the line
        if (!opened || closed || !(new RegExp('^\\s*(\\*\\s*)?</' + tagFound + '>\\s*(\\*\\s*)?$')).test(line))
          throw new Error('Invalid API documentation closing tag!');

        closed = true;
      } else if (oppositeRegExp.test(line)) {
        throw new Error('Inconsistent tag found!');
      } else if (opened && !closed) {
        // This line lies between the opening and closing delimiters. Strip any trailing whitespace, any comment
        // formatting asterisks, and add it to the result. (It is OK if later lines are malformed: we'll throw when
        // we encounter them).
        var match = /^(\s*\*\s?)?(.+)/.exec(line);
        result.push(match !== null ? match[2].replace(/\s*(\*\s*)?$/, '') : line);
      }

      return result;
    }, []);

    result.tag = tagFound;
    return result;
  };


  return LineProcessor;
})();
