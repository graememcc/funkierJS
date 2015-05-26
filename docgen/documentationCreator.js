module.exports = (function() {
  "use strict";

  /*
   * The documentCreator is the core of the documentation generation system. It is responsible for parsing the files
   * of funkierJS, extracting documentation comments and producing the requested documentation from it.
   *
   * The first parameter required is an array of filenames to consider. This is assumed to come from the Grunt task.
   *
   * Next, comes an object of additional data. At a minimum, the following properties must be present:
   *   - markdownNameFile:   the filename that is to contain Markdown for the documented values ordered alphabetically
   *   - markdownCategoryFile:   the filename where Markdown for the functions documented values grouped by category
   *
   * Optionally, it may also contain the following values:
   *   - markdownNamePre: the name of a file containing Markdown to be output before the generated Markdown in the
   *                      file documenting values ordered by name
   *   - markdownNamePost: the name of a file containing Markdown to be output after the generated Markdown in the
   *                       file documenting values ordered by name
   *   - markdownCategoryPre: the name of a file containing Markdown to be output before the generated Markdown in
   *                          file documenting values grouped by category
   *   - markdownCategoryPost: the name of a file containing Markdown to be output after the generated Markdown in the
   *                           file documenting values grouped by category
   *
   */

  var makeUnique = function() { return {}; };


  var fs = require('fs');
  var collator = require('./collator');
  var esprima = require('esprima');
  var lineProcessor = require('./lineProcessor');
  var commentProcessor = require('./commentProcessor');
  var nameMarkdownMaker = require('./nameMarkdownMaker');
  var categoryMarkdownMaker = require('./categoryMarkdownMaker');


  /*
   * Iterates over the filenames, and loads the file contents into an array ready for parsing by Esprima
   *
   */

  var loadFiles = function(files) {
    return files.map(function(file) {
      return fs.readFileSync(file, {encoding: 'utf-8'});
    });
  };


  /*
   * Takes an array of arrays of strings, and feeds each one in to Esprima, and extracts all block comments
   *
   */

  var getComments = function(fileContents) {
    return fileContents.map(function(file) {
      var syntax = esprima.parse(file, {comment: true});

      return syntax.comments.filter(function(comment) {
        return comment.type === 'Block';
      }).map(function(comment) {
        return comment.value.trim().split('\n');
      });
    });
  };


  /*
   * Takes an array of arrays of comments, and filters them for comment blocks containing API documentation, removing
   * delimiters.
   *
   */

  var getAPIComments = function(blockComments) {
    return blockComments.map(lineProcessor.LineProcessor);
  };


  /*
   * Takes an array of arrays of API documentation comments, and parses them, returning an array of arrays of
   * APIFunctions and APIObjects.
   *
   */

  var parseAPIComments = function(APIComments) {
    return APIComments.map(function(perFileAPIComments) {
      return perFileAPIComments.map(commentProcessor.commentProcessor);
    });
  };


  /*
   * Outputs a file documenting all functions in alphabetical order to the filename specified in the markdownNameFile
   * property in the given options object, returning an array containing the Markdown that was produced (less any
   * additional Markdown that was supplied to bookend the output; such Markdown should be supplied in the files named
   * by the markdownByNamePre and markdownByNamePost properties in the options object.
   *
   */

  var outputMarkdownByName = function(collatedObjects, data) {
    if (data.markdownNameFile === undefined)
      throw new Error('No filename supplied for Markdown by name output');

    var pre = data.markdownByNamePre ? fs.readFileSync(data.markdownByNamePre, {encoding: 'utf-8'}) : [];
    var post = data.markdownByNamePost ? fs.readFileSync(data.markdownByNamePost, {encoding: 'utf-8'}) : [];
    return nameMarkdownMaker(collatedObjects, data.markdownNameFile, {pre: pre, post: post});
  };


  /*
   * Outputs a file documenting all functions in alphabetical order to the filename specified in the
   * markdownCategoryFile property in the given data object, returning an array containing the Markdown that was
   * produced (less any additional Markdown that was supplied to bookend the output; such Markdown should be supplied
   * in the files named by the markdownByCategoryPre and markdownByCategoryPost properties in the options object.
   *
   */

  var outputMarkdownByCategory = function(collatedObjects, data) {
    if (data.markdownCategoryFile === undefined)
      throw new Error('No filename supplied for Markdown by category output');

    var pre = data.markdownByCategoryPre ? fs.readFileSync(data.markdownByCategoryPre, {encoding: 'utf-8'}) : [];
    var post = data.markdownByCategoryPost ? fs.readFileSync(data.markdownByCategoryPost, {encoding: 'utf-8'}) : [];
    return categoryMarkdownMaker(collatedObjects, data.markdownCategoryFile, {pre: pre, post: post});
  };


  var documentCreator = function(files, data) {
    if (!Array.isArray(files) || files.length === 0)
      throw new Error('No files found');

    var contents = loadFiles(files);
    var blockComments = getComments(contents);
    var apiComments = getAPIComments(blockComments);
    var objects = parseAPIComments(apiComments);
    var collated = collator.Collator(objects);

    var markdownNameOutput = outputMarkdownByName(collated, data);
    var markdownByCategory = outputMarkdownByCategory(collated, data);
  };


  return documentCreator;
})();
