module.exports = (function() {
  "use strict";

  var fs = require('fs');
  var marked = require('marked');
  var makeMarkdownRenderer = require('./markdownRenderer');


  /*
   * The HTML maker takes Markdown produced by one of the two Markdown producing functions, and produces an HTML
   * fragment from it. The function takes the collator (for linking purposes), the previously produced markdown,
   * the filename to write to, and an options object.
   *
   * The options object may contain a property named 'isCategory', in which case the generator will assume that the
   * page to be generated is the values grouped by category. Otherwise, it must contain a categoryFile property
   * containing a relative filename that will contain the "by category" output.
   *
   * When outputting lines referring to a category, the above information will be used to ensure that the links
   * point to the correct HTML page.
   *
   * Additionally, one may supply an optional list of strings that should be linked. If the lowercase equivalent
   * of any of these strings matches the lowercase equivalent of a value in a type list (for example in a list
   * of return types or parameters) then it will link to an anchor on the same page whose name equals the lowercase
   * version. Note, there is currently no facility to link to other pages, or to mix case. For convenience, all the
   * known function and object names are automatically added.
   *
   * Any errors thrown by Node's file-writing routines will bubble up.
   *
   */


  var HTMLMaker = function(collator, markdown, filename, options) {
    options = options || {};

    // Pull together the names of all the options, and functions in order to link them
    var typesToLink = Array.isArray(options.typesToLink) ? options.typesToLink : [];
    typesToLink = typesToLink.concat(collator.getNames());

    var renderer = makeMarkdownRenderer(typesToLink, {isCategory: options.isCategory,
                                                      categoryFile: options.categoryFile});
    var fileContents = marked(markdown.join('\n'), {renderer: renderer}).split('\n');

    // The last category section will not be closed by the renderer, it doesn't have enough information
    // about the page structure to do so.

    var post = options.isCategory ? ['</section>'] : [];
    var toWrite = (options.pre ? options.pre : []).concat(fileContents).concat(post);
    toWrite = toWrite.concat(options.post ? options.post : []);
    toWrite = toWrite.map(function(s) { return /\n$/.test(s) ? s : s + '\n'; }).join('');
    fs.writeFileSync(filename, toWrite, {encoding: 'utf-8'});
  };


  return HTMLMaker;
})();
