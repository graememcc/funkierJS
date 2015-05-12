(function (root, factory) {
  var dependencies = ['./APIFunction'];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else {
    // Assume CommonJS. The docgen system is node only (although we support requireJS to run the tests in a browser)

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  }
}(this, function(exports, APIFunction) {
  "use strict";


  APIFunction = APIFunction.APIFunction;


  /*
   * The MarkdownCreator function takes an APIFunction object (or an object denoting a synonym) describing a function,
   * and produces a fragment of Markdown suitable for inclusion in Markdown documentation. The function takes two
   * parameters: the APIFunction/synonym object being described, and an object containing options.
   *
   * The function throws if the first parameter is not an APIFunction object, and does not have the required properties
   * for a synonym object. Likewise, it throws if the second parameter is not an object.
   *
   * A synonm object is an object with two mandatory properties: 'name' and 'synonymFor'. 'name' should be the name
   * under which the function can be invoked, and 'synonymFor' the name of the function which will really be invoked.
   *
   * The synonym object is provided for smoother developer ergonomics: the client can map over an array containing both
   * APIFunctions and their synonyms in one fell swoop, instead of having to handle the two separately and somehow
   * merge the results.
   *
   * When presented with a synonym object, the output will contain a heading for the synonym name, and some
   * explanatory text directing the reader to the documentation for the real function. The link will be to a named
   * anchor within the same page, whose name is the same as that of the real function.
   *
   * Otherwise, the object is an APIFunction. Again, the output will first contain a heading with the function name.
   * This might optionally be followed by the category of the function: this behaviour can be controlled by setting
   * the 'includeCategory' property of the options object to the appropriate boolean value. (This is useful if the
   * client is producing documentation which groups the functions by category; there is little sense then of repeating
   * the category in the function's documentation.
   *
   * If the function can be invoked with alternate names, these synonyms will be listed on the next line.
   *
   * A usage line will follow, noting the names of any formal parameters to the function, as found in the 'parameters'
   * property of the supplied APIFunction.
   *
   * If the function takes 1 or more parameters, a table will follow. Each row contains the parameter's name, followed
   * by a list of acceptable types for the parameter.
   *
   * Next, if the function returns a result, a list of types returned will be output.
   *
   * Following this, the summary of the function's functionality will be added. If the APIFunction's 'details' property
   * contains additional explanatory notes, these will immediately follow.
   *
   * Finally, any code examples will be appended, formatted as a Markdown code block.
   *
   * The output will be a single string, with line endings denoted by the newline character. The function's output will
   * be wrapped in an HTML5 section tag.
   *
   * Lists of types, function names and parameter names will be formatted with Markdown inline code formatting.
   * Further, they will be wrapped in HTML unordered list tags; it is assumed that they will be displayed on one line,
   * so Markdown list formatting cannot be used. It is assumed if converting to HTML that the client will provide
   * appropriate CSS to display the list elements inline.
   *
   * Types and return values may be values that are expected to be documented elsewhere. In that case, one can add a
   * 'toLink' array property to the options object. Any values in the parameter and return type lists that match a
   * value in the 'toLink' array will be formatted as a link. The link will be to a named anchor assumed to be
   * elsewhere within the same Markdown document, and will have the same name as the string being linked.
   *
   */

  var isRealObject = function(obj) {
    return typeof(obj) === 'object' && obj !== null && !Array.isArray(obj);
  };


  var isSynonymObject = function(obj) {
    return isRealObject(obj) && !(obj instanceof APIFunction) && ('synonymFor' in obj) && ('name' in obj);
  };


  /*
   * Add a line to the 'result' array describing the category of functions that the function being described belongs to.
   *
   */

  var printCategory = function(category, result) {
    result.push('Category: ' + category);
    result.push('');
  };


  /*
   * Prints the list of synonyms for the function; each alternate name is marked up as a list entry in an unordered
   * list. Assumes the array is non-empty.
   *
   */

  var printSynonyms = function(synonyms, result) {
    var synonymText = synonyms.map(function(s) {
      return '<li>`' + s + '`</li>';
    });
    result.push('*Synonyms:* <ul class="synonymsList">' + synonymText.join(', ') + '</ul>');
    result.push('');
  };


  /*
   * Given a string "type", apply inline code Markdown markup to it and return it inside a list item HTML tag.
   * In addition, if the string exactly matches one of the entries in the toLink array, then it will additionally
   * be marked up as a link to a named anchor with the same name in the same page.
   *
   */

  var linkTypeIfRequired = function(toLink, type) {
    if (toLink.indexOf(type) !== -1)
      return '<li>[`' + type + '`](#' + type + ')</li>';

    return '<li>`' + type + '`</li>';
  };


  /*
   * Print a row of a table describing the formal parameters of a function. See the comment for the function
   * printParameters below.
   *
   */

  var printAParam = function(result, toLink, param) {
    result.push('      <tr>');
    result.push('        <td>`' + param.name + '`</td>');
    var paramTypeText = param.type.map(linkTypeIfRequired.bind(null, toLink)).join(' | ');
    result.push('        <td><ul class="typeList">' + paramTypeText + '</ul></td>');
    result.push('      </tr>');
  };


  /*
   * Prints an example of a typical invocation of the function being described, illustrating also the names of the
   * formal parameters (if any).
   *
   * For example, if a function is named foo and has formal parameters x and y, the line "result = foo(x, y);" will be
   * printed.
   *
   * The resulting line will be contained in Markdown markup for inline code. The line will be added to the end of the
   * given 'result' array.
   *
   */

  var printUsageLine = function(name, parameters, returnType, result) {
    var rtn = returnType.length > 0 ? '`var result = ' : '`';
    var params = parameters.map(function(p) { return p.name; }).join(', ');
    result.push('** Usage: ** ' + rtn + name + '(' + params + ');`');
  };


  /*
   * Prints a table containing the formal parameters of a function.
   *
   * Each row will contain two data cells: the first containing the name of the parameter, the second a list of the
   * acceptable types for the parameter.
   *
   * The name and parameter types will be marked up with the Markdown tags for inline code. If a string exactly
   * matching the name of one of the types appears in the 'toLink' array, then that string will be further marked
   * up as a link. The link will be to a named anchor with the same name in the same page; there is currently no way to
   * override this.
   *
   * The array of parameters should be non-empty. The resulting lines are appended to the provided 'result' array.
   */

  var printParameters = function(parameters, result, toLink) {
    result.push('<div class="usage">');
    result.push('  <table class="usageTable">');
    result.push('    <tbody>');
    parameters.forEach(printAParam.bind(null, result, toLink));
    result.push('    </tbody>');
    result.push('  </table>');
    result.push('</div>');
  };


  /*
   * Prints a line describing the possible types that can be returned from a function. If any of the types are
   * exactly match the types in the 'toLink' array, then that string will be marked up as a link to a named anchor
   * of the same name within the current page.
   *
   * The returnType array is assumed to be non-empty. The generated line will be appended to the given 'result' array.
   */

  var printReturnType = function(returnType, result, toLink) {
    var returnDetail = returnType.map(linkTypeIfRequired.bind(null, toLink)).join(' | ');
    result.push('Returns: <ul class="typeList">' + returnDetail + '</ul>');
    result.push('');
  };


  /*
   * Prints the detailed instructions for the function usage. No formatting is applied, however any extant formatting
   * in the original comment will be retained.
   *
   * The details array is assumed to be non-empty. The lines will be appended to the provided 'result' array.
   *
   */

  var printDetails = function(details, result) {
    result.push('');
    details.forEach(function(line) { result.push(line); });
  };


  /*
   * Prints the code examples for this function, first applying the Markdown indent for code block formatting for each
   * line.
   *
   * The examples array is assumed to be non-empty. The generated lines will be added to the provided 'result' array.
   *
   *
   */

  var printExamples = function(examples, result) {
    result.push('');
    result.push('#### Examples ####');
    examples.forEach(function(line) { result.push('    ' + line); });
  };


  var markdownCreator = function(apiFunction, options) {
    if (!isRealObject(apiFunction) || !((apiFunction instanceof APIFunction) || isSynonymObject(apiFunction)))
      throw new Error('Invalid APIFunction object');

    if (!isRealObject(options))
      throw new Error('Invalid markdown options');

    var result = [];

    // All function names should be <h3> anchors
    result.push('<a name = "' + apiFunction.name + '"><section></a>');
    result.push('### ' + apiFunction.name + ' ###');

    // Bail early for synonyms
    if ('synonymFor' in apiFunction) {
      result.push('See [`' + apiFunction.synonymFor + '`](#' + apiFunction.synonymFor + ')');
      result.push('</section>');
      return result.join('\n');
    }

    // It doesn't make sense to print the category in the "By category" listing, so check to see if the supplied
    // options prevent it being printed
    if ('includeCategory' in options && options.includeCategory)
      printCategory(apiFunction.category, result);

    // List any synonyms
    if (apiFunction.synonyms.length > 0)
      printSynonyms(apiFunction.synonyms, result);

    printUsageLine(apiFunction.name, apiFunction.parameters, apiFunction.returnType, result);
    if (apiFunction.parameters.length === 0 && apiFunction.returnType.length === 0)
      result.push('');

    // Print a table of the parameters and their allowable types, linking any types specified in the options
    if (apiFunction.parameters.length > 0)
      printParameters(apiFunction.parameters, result,
                      ('toLink' in options && Array.isArray(options.toLink) ? options.toLink : []));

    // Print the possible return types, linking any types specified in the options
    if (apiFunction.returnType.length > 0)
      printReturnType(apiFunction.returnType, result,
                      ('toLink' in options && Array.isArray(options.toLink) ? options.toLink : []));

    result.push(apiFunction.summary);

    // Append any details
    if (apiFunction.details.length > 0)
      printDetails(apiFunction.details, result);

    // Append any code examples, applying the 4-space formatting required by Markdown to recognise code blocks
    if (apiFunction.examples.length > 0)
      printExamples(apiFunction.examples, result);

    result.push('</section>');
    return result.join('\n');
  };


  exports.MarkdownCreator = markdownCreator;
}));
