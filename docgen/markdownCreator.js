(function (root, factory) {
  var dependencies = ['./APIObject', './APIFunction'];

  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.

    define(['exports'].concat(dependencies), factory);
  } else {
    // Assume CommonJS. The docgen system is node only (although we support requireJS to run the tests in a browser)

    factory.apply(null, [exports].concat(dependencies.map(function(dep) { return require(dep); })));
  }
}(this, function(exports, APIObject, APIFunction) {
  "use strict";


  APIFunction = APIFunction.APIFunction;
  APIObject = APIObject.APIObject;


  /*
   * The MarkdownCreator function takes an APIFunction or APIObject object (or an object denoting a synonym) describing
   * a synonym, and produces a fragment of Markdown suitable for inclusion in Markdown documentation. The function takes
   * two parameters: the APIFunction/APIObject/synonym object being described, and an object containing options.
   *
   * The function throws if the first parameter is not an APIFunction/APIObject object, or does not have the required
   * properties for a synonym object. Likewise, it throws if the second parameter is not an object.
   *
   * A synonym object is an object with two mandatory properties: 'name' and 'synonymFor'. 'name' should be the name
   * under which the function can be invoked, and 'synonymFor' the name of the function which will really be invoked.
   *
   * The synonym object is provided for smoother developer ergonomics: the client can map over an array containing
   * APIFunctions, APIObjects and their synonyms in one fell swoop, instead of having to handle the two separately and
   * somehow merge the results.
   *
   * When presented with a synonym object, the output will contain a heading for the synonym name, and some
   * explanatory text directing the reader to the documentation for the real function. The link will be to a named
   * anchor within the same page, whose name is the same as that of the real function.
   *
   * Otherwise, the object is an APIFunction/APIObject. Again, the output will first contain a heading with the object
   * name. This might optionally be followed by the category of the object: this behaviour can be controlled by setting
   * the 'includeCategory' property of the options object to the appropriate boolean value. (This is useful if the
   * client is producing documentation which groups the values by category; there is little sense then of repeating
   * the category in the function's documentation.
   *
   * If the object is a function can be invoked with alternate names, these synonyms will be listed on the next line.
   *
   * If the object is a function, a usage line will follow, noting the names of any formal parameters to the function,
   * as found in the 'parameters' property of the supplied APIFunction.
   *
   * If the object is a function, and takes 1 or more parameters, a paragraph will follow, with each line containg the
   * name of one parameter, followed by a list of acceptable types for the parameter.
   *
   * Next, if the object is a function returning a result, a list of types returned will be output.
   *
   * Following this, the summary of the function or object's functionality will be added. If the value's 'details'
   * property contains additional explanatory notes, these will immediately follow.
   *
   * Finally, any code examples will be appended, formatted as a Markdown code block.
   *
   * The output will be a single string, with line endings denoted by the newline character. The function's output will
   * be wrapped in an HTML5 section tag.
   *
   * Lists of types, function names and parameter names will be formatted with Markdown inline code formatting.
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
    result.push('* Synonyms:* ' + synonyms.map(printAType));
    result.push('');
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
    result.push('** Usage:** ' + rtn + name + '(' + params + ');`');
  };


  /*
   * Helper function for printing types separated by pipe characters, and enclosed in Markdown markup for inline
   * code. This function is intended to be invoked by a map call; the parameters are the standard ones supplied to
   * a mapping function.
   *
   */

  var printAType = function(type, i, arr) {
    return '`' + type + '`' + (i !== arr.length ? ' | ' : '');
  };


  /*
   * Prints a paragraph detailing the formal parameters of a function.
   *
   * After an initial line denoting the start of parameter output, each line will contain the name of the parameter,
   * followed by the types accepted, with each type separated by pipe (|) characters, and enclosed in Markdown markup
   * for inline code.
   *
   * The array of parameters should be non-empty. The resulting lines are appended to the provided 'result' array.
   */

  var printParameters = function(parameters, result) {
    var printAParam = function(param, i, arr) {
      result.push(param.name + ' ' + param.type.map(printAType).join('') + (i !== arr.length ? '  ' : ''));
    };
    result.push('Parameters:  ');
    parameters.forEach(printAParam);
    result.push('');
  };


  /*
   * Prints a line describing the possible types that can be returned from a function. Each type will be separated by a
   * pipe character, and will be enclosed in Markdown markup for inline code.
   *
   * The returnType array is assumed to be non-empty. The generated line will be appended to the given 'result' array.
   */

  var printReturnType = function(returnType, result, toLink) {
    result.push('Returns: ' + returnType.map(printAType).join(''));
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
    if (!isRealObject(apiFunction) ||
        !((apiFunction instanceof APIFunction) || (apiFunction instanceof APIObject) || isSynonymObject(apiFunction)))
      throw new Error('Invalid object');

    if (!isRealObject(options))
      throw new Error('Invalid markdown options');

    var result = [];

    // All function names should be <h3> anchors
    result.push('### ' + apiFunction.name + ' ###');

    // Bail early for synonyms
    if ('synonymFor' in apiFunction) {
      result.push('See [`' + apiFunction.synonymFor + '`](#' + apiFunction.synonymFor + ')');
      result.push('***');
      return result.join('\n');
    }

    // It doesn't make sense to print the category in the "By category" listing, so check to see if the supplied
    // options prevent it being printed
    if ('includeCategory' in options && options.includeCategory)
      printCategory(apiFunction.category, result);

    if (!(apiFunction instanceof APIObject)) {
      // List any synonyms
      if (apiFunction.synonyms.length > 0)
        printSynonyms(apiFunction.synonyms, result);

      printUsageLine(apiFunction.name, apiFunction.parameters, apiFunction.returnType, result);
      if (apiFunction.parameters.length === 0 && apiFunction.returnType.length === 0)
        result.push('');

      // Print a table of the parameters and their allowable types, linking any types specified in the options
      if (apiFunction.parameters.length > 0)
        printParameters(apiFunction.parameters, result);

      // Print the possible return types, linking any types specified in the options
      if (apiFunction.returnType.length > 0)
        printReturnType(apiFunction.returnType, result);
    }

    result.push(apiFunction.summary);

    // Append any details
    if (apiFunction.details.length > 0)
      printDetails(apiFunction.details, result);

    // Append any code examples, applying the 4-space formatting required by Markdown to recognise code blocks
    if (apiFunction.examples.length > 0)
      printExamples(apiFunction.examples, result);

    result.push('***');
    return result.join('\n');
  };


  exports.MarkdownCreator = markdownCreator;
}));
