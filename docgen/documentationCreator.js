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
  var path = require('path');
  var collator = require('./collator');
  var esprima = require('esprima');
  var lineProcessor = require('./lineProcessor');
  var commentProcessor = require('./commentProcessor');
  var nameMarkdownMaker = require('./nameMarkdownMaker');
  var categoryMarkdownMaker = require('./categoryMarkdownMaker');
  var HTMLMaker = require('./HTMLMaker');


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
    return blockComments.map(lineProcessor);
  };


  /*
   * Takes an array of arrays of API documentation comments, and parses them, returning an array of arrays of
   * APIFunctions and APIObjects.
   *
   */

  var parseAPIComments = function(APIComments) {
    return APIComments.map(function(perFileAPIComments) {
      return perFileAPIComments.map(commentProcessor);
    });
  };


  /*
   * Outputs a file documenting all functions in alphabetical order to the filename specified in the dest property of
   * the given data object, returning an array containing the Markdown that was produced (less any additional Markdown
   * that was supplied to bookend the output; such Markdown should be supplied in the files named by the pre and
   * post properties in the data object.
   *
   */

  var outputMarkdownByName = function(collatedObjects, data) {
    if (data.dest === undefined)
      throw new Error('No filename supplied for Markdown by name output');

    var pre = data.pre ? fs.readFileSync(data.pre, {encoding: 'utf-8'}).split('\n') : [];
    var post = data.post ? fs.readFileSync(data.post, {encoding: 'utf-8'}).split('\n') : [];
    return nameMarkdownMaker(collatedObjects, data.dest, {pre: pre, post: post});
  };


  /*
   * Outputs a file documenting all functions in alphabetical order to the filename specified in the dest property of
   * the given data object, returning an array containing the Markdown that was produced (less any additional Markdown
   * that was supplied to bookend the output; such Markdown should be supplied in the files named by the pre and
   * post properties in the data object.
   *
   */

  var outputMarkdownByCategory = function(collatedObjects, data) {
    if (data.dest === undefined)
      throw new Error('No filename supplied for Markdown by category output');

    var pre = data.pre ?  fs.readFileSync(data.pre, {encoding: 'utf-8'}).split('\n') : [];
    var post = data.post ?  fs.readFileSync(data.post, {encoding: 'utf-8'}).split('\n') : [];
    return categoryMarkdownMaker(collatedObjects, data.dest, {pre: pre, post: post});
  };


  /*
   * Outputs a file documenting all functions in alphabetical order to the filename specified in the HTMLNameFile
   * property in the given options object. Note, on its own, this will only prodce an HTML fragment; supply additional
   * HTML in the files named by the HTMLByNamePre and HTMLByNamePost properties in the options object.
   *
   * The data object may additionally contain a toLink property, detailing type strings that should be formatted as
   * links when encountered (see the HTMLMaker documentation for details).
   *
   */

  var outputHTMLByName = function(collatedObjects, markdown, data) {
    if (data.byName.dest === undefined)
      throw new Error('No filename supplied for HTML by name output');
    if (data.byCategory.dest === undefined)
      throw new Error('No category filename supplied for HTML by name output');

    // Calculate the relative filename
    var relative = path.relative(path.dirname(data.byName.dest), path.dirname(data.byCategory.dest)) +
                   path.basename(data.byCategory.dest);

    var pre = data.byName.pre ? fs.readFileSync(data.byName.pre, {encoding: 'utf-8'}).split('\n') : [];
    var post = data.byName.post ? fs.readFileSync(data.byName.post, {encoding: 'utf-8'}).split('\n') : [];
    HTMLMaker(collatedObjects, markdown, data.byName.dest, {pre: pre, post: post, categoryFile: relative,
                                                            typesToLink: data.toLink});
  };


  /*
   * Outputs a file documenting all functions grouped by category to the filename specified in the dest property in the
   * given data object. Note, on its own, this will only prodce an HTML fragment; supply additional HTML in the files
   * named by the pre and post properties in the data object.
   *
   * The data object may additionally contain a toLink property, detailing type strings that should be formatted as
   * links when encountered (see the HTMLMaker documentation for details).
   *
   */

  var outputHTMLByCategory = function(collatedObjects, markdown, data) {
    if (data.dest === undefined)
      throw new Error('No category filename supplied for HTML by category output');

    var pre = data.pre ? fs.readFileSync(data.pre, {encoding: 'utf-8'}).split('\n') : [];
    var post = data.post ? fs.readFileSync(data.post, {encoding: 'utf-8'}).split('\n') : [];
    HTMLMaker(collatedObjects, markdown, data.dest, {pre: pre, post: post, isCategory: true, typesToLink: data.toLink});
  };


  var documentCreator = function(files, markdownData, htmlData) {
    if (!Array.isArray(files) || files.length === 0)
      throw new Error('No files found');

    var contents = loadFiles(files);
    var blockComments = getComments(contents);
    var apiComments = getAPIComments(blockComments);
    var objects = parseAPIComments(apiComments);
    var collated = collator(objects);

    var markdownNameOutput = outputMarkdownByName(collated, markdownData.byName);
    var markdownByCategory = outputMarkdownByCategory(collated, markdownData.byCategory);

    outputHTMLByName(collated, markdownNameOutput, htmlData);
    // Don't assume we're allowed to mutate the given options object
    var htmlByCategoryData = Object.create(htmlData.byCategory, {'toLink': {value: htmlData.toLink}});
    outputHTMLByCategory(collated, markdownByCategory , htmlByCategoryData);
  };


  return documentCreator;
})();
