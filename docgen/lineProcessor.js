(function (root, factory) {
  var dependencies = [];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else {
    // Assume CommonJS. The docgen system is node only (although we support requireJS to run the tests in a browser)

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  }
}(this, function(exports) {
  "use strict";


  /*
   * The LineProcessor takes an array of arrays of lines, as output by '.split'.ting on the comments property returned
   * by Esprima. It then filters these to the portions tagged as API documentation, removing any comment cruft in the
   * process.
   *
   * It enforces the following requirements:
   *   - A comment block contains only one <apifunction> delimiter, and it is the only item present on the line (modulo
   *     whitespace and preceding / trailing comment formatting asterisks)
   *   - A comment block contains at most one </apifunction> delimiter, and it is the only item present on the line
   *     (modulo whitespace and preceding / trailing comment formatting asterisks)
   *
   */

  var LineProcessor = function(comments) {
    var result = [];

    comments.forEach(function(commentLines) {
      if (commentLines.some(function(lines) {
        return lines.indexOf('<apifunction>') !== -1;
      })) {
        result.push(processLines(commentLines));
      }
    });

    return result;
  };


  var processLines = function(lines) {
    // We assume the caller has checked for the presence of an opening delimiter
    var opened = false;
    var closed = false;
    return lines.reduce(function(result, line) {
      if (line.indexOf('<apifunction>') !== -1) {
        // Remove the opening delimiter, or throw if we have more than one, or it is not the only item on the line
        if (opened || closed || !/^\s*(\*\s*)?<apifunction>\s*(\*\s*)?$/.test(line))
          throw new Error('Duplicate API documentation opening tag!');

        opened = true;
      } else if (line.indexOf('</apifunction>') !== -1) {
        // Remove the closing delimiter, or throw if we have more than one, we have not found encountered an opening
        // delimiter or it is not the only item on the line
        if (!opened || closed || !/^\s*(\*\s*)?<\/apifunction>\s*(\*\s*)?$/.test(line))
          throw new Error('Invalid API documentation closing tag!');

        closed = true;
      } else if (opened && !closed) {
        // This line lies between the opening and closing delimiters. Strip any trailing whitespace, any comment
        // formatting asterisks, and add it to the result. (It is OK if later lines are malformed: we'll throw when
        // we encounter them).
        var match = /^(\s*\*\s?)?(.+)/.exec(line);
        result.push(match !== null ? match[2].replace(/\s*(\*\s*)?$/, '') : line);
      }

      return result;
    }, []);
  };


  exports.LineProcessor = LineProcessor;
}));
