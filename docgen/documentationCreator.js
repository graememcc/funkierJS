module.exports = (function() {
  "use strict";

  /*
   * The documentCreator is the core of the documentation generation system. It is responsible for parsing the files
   * of funkierJS, extracting documentation comments and producing the requested documentation from it.
   *
   * The first parameter required is an array of filenames to consider. This is assumed to come from the Grunt task.
   *
   * Next, come an object of options. The following might be present:
   *
   * - markdown: An object possibly containing two additional objects controlling generation of markdown documentation:
   *   - byName: an object which, if present and valid, will trigger creation of a A-Z documentation reference.
   *   - byCategory: an object which, if present and valid, will trigger creation of documentation where the documented
   *                 values are grouped by category.
   * - html: An object possibly containing two additional objects controlling generation of HTML documentation:
   *   - byName: an object which, if present and valid, will trigger creation of a A-Z documentation reference.
   *   - byCategory: an object which, if present and valid, will trigger creation of documentation where the documented
   *                 values are grouped by category.
   *   - toLink: an optional array of strings that, if their lowercase equivalents are found in a list of types when
   *             generating HTML documentation, will trigger creation of links to a named anchor '#s' on the page being
   *             generated, where s is the lowercase equivalent of the matching string. Note: it is not currently
   *             possible to modify case sensitivity of the matching, or to link to locations other than the page being
   *             generated. As a convenience, all documented functions and objects will be linked, so there is no need
   *             to provide those names in this array.
   *
   * As noted above, both the "html" and "markdown" objects can contain "byName" and "byCategory" option objects. Those
   * objects can contain the following properties:
   *
   * - dest: The filename where output will be written. If not present, the type of output in question will not be
   *         generated
   * - pre:  An optional filename whose contents will be prepended to the file being generated
   * - post:  An optional filename whose contents will be appended to the file being generated
   *
   * When generating HTML "by name", lines denoting the category a value belongs to will contain a link to the "by
   * category" documentation. This imposes some additional requirements when generating HTML A-Z documentation. One
   * of the following must be true:
   *   - the html.byCategory object is present and has a valid 'dest' field naming the "by category" file to be
   *     generated
   *   - the html.byName object has an additional field 'categoryFile', naming the "by category" documentation file
   *
   * When both conditions hold, a check will ensure that the definitions are consistent: i.e. point to the same file.
   *
   */

  var fs = require('fs');
  var path = require('path');
  var collator = require('./collator');
  var esprima = require('esprima');
  var marked = require('marked');

  var lineProcessor = require('./lineProcessor');
  var commentProcessor = require('./commentProcessor');
  var markdownCreator = require('./markdownCreator');
  var markdownRenderer = require('./markdownRenderer');


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
   * If the given filename is defined, read the file contents into an array, and split on line endings. Otherwise
   * return an empty array.
   *
   */

  var readSurroundingFile = function(name) {
    return name ? fs.readFileSync(name, {encoding: 'utf-8'}).split('\n') : [];
  };


  /*
   * Ensures every line in the given array of strings has an explicit line ending, and then flattens
   * the array into one string.
   *
   */

  var flattenFile = function(lines) {
    return lines.map(function(line) {
      return /\n$/.test(line) ? line : line + '\n';
    }).join('');
  };


  /*
   * Produces markdown for the "A-Z" documentation of the known objects, returning an array of strings.
   *
   */

  var produceMarkdownByName = function(collatedObjects) {
    var categories = collatedObjects.getCategories();
    var fileContents = [];

    categories.forEach(function(cat) {
      var fns = collatedObjects.byName();

      fns.forEach(function(fn) {
        fileContents = fileContents.concat(markdownCreator(fn, {includeCategory: true}).split('\n'));
      });
    });

    return fileContents;
  };


  /*
   * Produces markdown for the "A-Z" documentation of the known objects, returning an array of strings.
   *
   */

  var produceMarkdownByCategory = function(collatedObjects) {
    var categories = collatedObjects.getCategories();
    var fileContents = [];

    categories.forEach(function(cat) {
      var fns = collatedObjects.byName();

      fileContents.push('## ' + cat + '##');
      fns.forEach(function(fn) {
        fileContents = fileContents.concat(markdownCreator(fn, {includeCategory: false}).split('\n'));
      });
    });

    return fileContents;
  };


  /*
   * Outputs a file containing the given contents, bookended by the contents of the 'pre' and 'post' files optionally
   * named in the data object.
   *
   */

  var outputFile = function(contents, data) {
    if (data.dest === undefined)
      throw new Error('No filename supplied for Markdown by name output');

    var pre = readSurroundingFile(data.pre);
    var post = readSurroundingFile(data.post);

    var toWrite = pre.concat(contents).concat(post);
    fs.writeFileSync(data.dest, flattenFile(toWrite), {encoding: 'utf-8'});
  };


  /*
   * Generates HTML from the given markdown, and outputs it to the file denoted by the 'dest' field in data, bookended
   * by the contents of the filenames optionally provided in data.pre and data.post.
   *
   */

  var outputHTML = function(markdown, data, generationOptions) {
    if (data.dest === undefined)
      throw new Error('No filename supplied for Markdown by name output');

    var pre = readSurroundingFile(data.pre);
    var post = (generationOptions.isCategory ? ['</section>'] : []).concat(readSurroundingFile(data.post));

    var categoryFile = null;
    if (generationOptions.categoryFile) {
      // The client provided options will include the absolute filename; for linking we will compute the relative
      // filename
      categoryFile = path.relative(path.dirname(data.dest), path.dirname(generationOptions.categoryFile)) +
                     path.basename(generationOptions.categoryFile);
    }

    var renderer = markdownRenderer(data.toLink, {isCategory: generationOptions.isCategory,
                                                  categoryFile: categoryFile});
    var fileContents = marked(markdown.join('\n'), {renderer: renderer}).split('\n');
    var toWrite = pre.concat(fileContents).concat(post);
    fs.writeFileSync(data.dest, flattenFile(toWrite), {encoding: 'utf-8'});
  };


  var documentCreator = function(files, data) {
    if (!Array.isArray(files) || files.length === 0)
      throw new Error('No files found');

    var contents = loadFiles(files);
    var blockComments = getComments(contents);
    var apiComments = getAPIComments(blockComments);
    var objects = parseAPIComments(apiComments);
    var collated = collator(objects);

    var byNameMarkdown = null;
    if ((data.markdown && data.markdown.byName && data.markdown.byName.dest) ||
        (data.html && data.html.byName && data.html.byName.dest))
      byNameMarkdown = produceMarkdownByName(collated);

    var byCategoryMarkdown = null;
    if ((data.markdown && data.markdown.byCategory && data.markdown.byCategory.dest) ||
        (data.html && data.html.byCategory && data.html.byCategory.dest))
      byCategoryMarkdown = produceMarkdownByCategory(collated);

    if (data.markdown && data.markdown.byName && data.markdown.byName.dest)
      outputFile(byNameMarkdown, data.markdown.byName);

    if (data.markdown && data.markdown.byCategory && data.markdown.byCategory.dest)
      outputFile(byCategoryMarkdown, data.markdown.byCategory);

    if (data.html) {
      var typesToLink = collated.getNames();
      if (Array.isArray(data.html.toLink))
        typesToLink = typesToLink.concat(data.html.toLink);

      if (data.html.byName && data.html.byName.dest) {
        // First we must establish the location of the category file
        var categoryFile = data.html.byCategory ? data.html.byCategory.dest : undefined;

        if (categoryFile !== undefined && data.html.byName.categoryFile &&
            data.html.byName.categoryFile !== categoryFile)
          throw new Error('Inconsistent category file locations found');

        // Don't assume we're allowed to mutate the given options object
        var byNameData = Object.create(data.html.byName, {'toLink': {value: typesToLink}});
        outputHTML(byNameMarkdown, byNameData, {categoryFile: categoryFile});
      }

      if (data.html.byCategory && data.html.byCategory.dest) {
        // Don't assume we're allowed to mutate the given options object
        var byCategoryData = Object.create(data.html.byCategory, {'toLink': {value: typesToLink}});
        outputHTML(byCategoryMarkdown, byCategoryData, {isCategory: true});
      }
    }
  };


  return documentCreator;
})();
