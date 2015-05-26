module.exports = (function() {
  "use strict";

  var fs = require('fs');
  var markdownCreator = require('./markdownCreator').MarkdownCreator;


  /*
   * The category Markdown maker, as the name suggests, produces a file containing Markdown documentation for each
   * APIFunction, synonym and APIObject found, grouped by category. The client should supply the collated functions
   * and objects, and the name of the file to output. Optionally, an options object can be supplied, with the 'pre'
   * and 'post' properties containing Markdown to be added before and after the output. (Line endings will be added
   * to the lines if required).
   *
   * Any errors thrown by Node's file-writing routines will bubble up.
   *
   */

  var categoryMarkdownMaker = function(collator, filename, options) {
    options = options || {};

    var categories = collator.getCategories();
    var fileContents = [];

    categories.forEach(function(cat) {
      var fns = collator.byCategory(cat);

      fileContents.push('## ' + cat + '##');
      fns.forEach(function(fn) {
        fileContents = fileContents.concat(markdownCreator(fn, {includeCategory: false}).split('\n'));
      });
    });

    var toWrite = (options.pre ? options.pre : []).concat(fileContents).concat(options.post ? options.post : []);
    toWrite = toWrite.map(function(s) { return /\n$/.test(s) ? s : s + '\n'; }).join('');
    fs.writeFileSync(filename, toWrite, {encoding: 'utf-8'});
    return fileContents;
  };


  return categoryMarkdownMaker;
})();
