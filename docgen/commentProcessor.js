module.exports = (function() {
  "use strict";


  /*
   * The commentProcessor module takes an array of strings, and transforms it into an APIFunction or APIObject object,
   * depending on the tag assigned by LineProcessor, verifying the rules for API function documentation layout.
   * Specifically, we expect the following:
   *
   * The first non-empty line should contain the name of the function, and nothing else
   *
   * (APIFunctions only) There should be a line containing the category of functions the function in question belongs
   * to. Such a line should begin with "Category: " followed by the category and nothing else.
   *
   * (APIFunctions only) There may optionally be a line containing synonyms for the function. Such a line should begin
   * with "Synonyms: " * followed by a list of the synonyms, separated by commas, vertical bars, or the word "or".
   *
   * (APIFunctions only) There may optionally be a line containing a list of parameters. Each such line should start
   * with "Parameter: ", be followed by the parameter name followed by a colon, and a list of the possible types of
   * the parameter, separated by commas, vertical bars, or the word "or". Multiple parameters can be documented on
   * separate lines: the expectation is that the parameter lines are in the same order as the arguments that the
   * function takes. If a parameter line provides information contradicting a previous parameter line, an exception is
   * thrown.
   *
   * (APIFunctions only) There may optionally be a line containing the possible return types. Such a line should start
   * with "Returns: ", and be followed by a list of the return types, separated by vertical bars or the word "or". If
   * given, the return type line must follow any parameter lines. Further, when there are also parameter lines, there
   * should be nothing else (except empty lines) between the parameter lines and the return line.
   *
   * The first non-empty line that is not one of the special lines mentioned above is taken to mark the start of the
   * summary: a short paragraph suitable for providing a simple description of the function's functionality. The
   * summary is assumed to continue to the next empty line (or end of input whichever comes first). The summary will be
   * reduced to a single string, with newline characters inserted between all lines other than the last.
   *
   * After the empty line, there may optionally be detailed help: further lines that illuminate details of the
   * function's behaviour. The details are assumed to continue until the last line, unless code examples are provided.
   *
   * After the summary (and optionally details), there may optionally be code examples. This is denoted by a line
   * consisting only of "Examples:". All lines from this point on will be considered as examples.
   *
   * The line containing the name establishes the indentation level for the following lines: all lines will be expected
   * to have the same amount of whitespace; this whitespace will be stripped from each line. An error will be thrown if
   * any line is encountered that has more indentation, with two exceptions:
   *
   *  - Detailed help lines other than the first may have extra indentation for aesthetic purposes: only the
   *    indentation amount established earlier will be removed
   *
   *  - Examples may be indented further: the first non-trivial line occurring after "Examples:" establishes the
   *    minimum indentation for examples lines. That level of whitespace will be stripped from each examples line.
   *
   * Any line that is found to have less indentation will cause an error.
   *
   */


  var makeUnique = function() { return {}; };


  var APIFunction = require('./APIFunction');
  var APIObject = require('./APIObject');


  // States for the state machine
  var MODE_AWAITINGNAME = makeUnique();
  var MODE_OPTIONALS = makeUnique();
  var MODE_PARAMETERS = makeUnique();
  var MODE_POSTPARAMETERS = makeUnique();
  var MODE_SUMMARY = makeUnique();
  var MODE_DETAILS = makeUnique();
  var MODE_EXAMPLES = makeUnique();

  /*
   * Processes a line suspected to contain the name of a function. Returns the current mode if the line is empty,
   * otherwise the name property of the supplied parameters object is set to the name found, and the next mode is
   * returned.
   *
   */

  var processName = function(line, params, currentMode) {
    if (/^\s*$/.test(line)) return currentMode;

    if (line.indexOf(':') !== -1)
      throw new Error('No function name specified!');

    // Test that only one word was encountered
    var nameMatch = /^\s*((?:\w|\$)+)\s*$/.exec(line);
    if (!nameMatch)
      throw new Error('Invalid line encountered!');

    params.name = nameMatch[1];

    // Calculate the global indent
    var remainingWhitespace = /^\s+/.exec(line);
    params.globalIndent = remainingWhitespace === null ? 0 : remainingWhitespace[0].length;
    return MODE_OPTIONALS;
  };


  /*
   * Processes a line suspected to contain the category of a function. Throws if the line contains
   * more than one category, and returns the category otherwise.
   *
   */

  var processCategory = function(line) {
    // The following regex will match when there is only one category present
    var categoryMatch = /^\s*(\w+)\s*$/.exec(line);
    if (categoryMatch === null)
      throw new Error('Two categories specified');

    return categoryMatch[1];
  };


  var flatMap = function(f, arr) {
    return arr.map(f).reduce(function(soFar, current) {
      return soFar.concat(current);
    }, []);
  };


  /*
   * Processes a line whose objects are split by vertical bars, the word "or" or commas
   *
   */

  var processSplitLine = function(line) {
    var splits = flatMap(function(s) { return s.split(/\s+or\s+/); }, line.split('|'));
    splits = flatMap(function(s) { return s.split(/\s*,\s*/); }, splits);
    return splits.map(function(word) { return word.trim(); });
  };


  var processSynonyms = function(line) {
    return processSplitLine(line);
  };


  var processReturnTypes = function(line) {
    return processSplitLine(line);
  };


  /*
   * Processes a line that contains a parameter definition, and adds it to the supplied array of parameter definitions.
   * Throws if the parameter definition is malformed, or contradicts or duplicates an existing definition.
   *
   */

  var processParameter = function(line, parameters) {
    // This function must locate the parameter name, and the list of parameter types. It must then scan the existing
    // parameters for conflicting or duplicated information before adding.
    var colonIndex = line.indexOf(':');
    if (colonIndex === -1)
      throw new Error('Malformed parameter line');

    var name = line.slice(0, colonIndex).replace(/^\s+/, '').replace(/\s+$/, '');
    if (parameters.some(function(param) { return param.name === name; }))
      throw new Error('Conflicting parameter definition');

    return parameters.concat([{name: name,
                               type: processSplitLine(line.slice(colonIndex + 1))}]);
  };


  /*
   * Checks whether the line is one that starts with one of the special keywords, returning that keyword if so, and
   * returning null otherwise.
   *
   */

  var getLineKeyword = function(line) {
    line = line.toLowerCase();
    var specialLineRegexes = ['category', 'parameter', 'returns', 'synonyms', 'examples'].map(function(type) {
      return new RegExp('^\\s*(' + type + ')\\s*:\\s*');
    });

    var keyword = null;
    specialLineRegexes.some(function(regexp) {
      var matches = regexp.exec(line);
      if (matches !== null) {
        keyword = matches[1];
        return true;
      }
      return false;
    });

    return keyword;
  };


  /*
   * Checks that the line has at least the minimum amount of indentation required, throwing when it does not.
   *
   */

  var checkMinimumIndent = function(line, indentLevel) {
    if (indentLevel === 0) return;
    var indentRegExp = new RegExp('^\\s{' + indentLevel + '}');
    if (!indentRegExp.test(line))
      throw new Error('Inconsistent indentation! Line \'' + line + '\' has less indentation than surrounding docs');
  };


  /*
   * Removes the global indentation from a line, throwing if there is additional indentation remaining.
   *
   */

  var removeIndent = function(line, indentLevel) {
    checkMinimumIndent(line, indentLevel);

    var orig =  line;
    line = line.slice(indentLevel);
    if (/^\s/.test(line))
      throw new Error('Inconsistent indentation! Line \'' + orig + '\' has more indentation than surrounding docs');

    return line;
  };


  /*
   * Checks whether a line from a text field could prove problematic when generating HTML from any Markdown that
   * would be generated from this comment.
   *
   * XXX This creates an unfortunate coupling between this file and the HTML generators.
   *
   */

  var checkLineForHTMLGeneration = function(line) {
    if (line.indexOf('** Usage: **') === 0 || line.indexOf('Parameters:') === 0 || line.indexOf('* Synonyms: *') === 0 ||
        line.indexOf('See ') === 0 || /^(\*\s*|-\s*){3,}/.test(line) || /^#{1,6}\s+/.test(line))
      throw new Error('Line will prove problematic for HTML generation from Markdown ' + line);
  };


  /*
   * Processes a line suspected of containing either a keyword or the summary, and fills out the appropriate field
   * and makes the appopriate mode transition.
   *
   * This function also enforces the requirements that parameters must be contiguous, and that return types must
   * immediately follow parameter descriptions, and that code examples cannot appear before the summary.
   *
   */

  var processKeywordLine = function(line, params, options, currentMode, allowProblematic) {
    if (/^\s*$/.test(line)) return currentMode;
    line = removeIndent(line, params.globalIndent);

    // The line either contains a "special line" or is the start of the summary
    var lineKeyword = getLineKeyword(line);
    if (lineKeyword) {
      line = line.slice(line.indexOf(':') + 1);

      switch (lineKeyword) {
        case 'category':
          if (params.category !== null)
            throw new Error('Duplicate category encountered!');

          params.category = processCategory(line);
          return currentMode === MODE_PARAMETERS ? MODE_POSTPARAMETERS : currentMode;

        case 'synonyms':
          if (options.synonyms !== null)
            throw new Error('Duplicate synonyms encountered!');

          options.synonyms = processSynonyms(line);
          return currentMode === MODE_PARAMETERS ? MODE_POSTPARAMETERS : currentMode;

        case 'returns':
          if (options.returnType !== null)
            throw new Error('Duplicate return types encountered!');

          if (currentMode === MODE_POSTPARAMETERS)
            throw new Error('Cannot have fields separating parameters and return type');

          options.returnType = processReturnTypes(line);
          return currentMode === MODE_PARAMETERS ? MODE_POSTPARAMETERS : currentMode;

        case 'parameter':
          if (options.returnType !== null)
            throw new Error('Parameters found after return type');

          if (options.parameters === null)
            options.parameters = [];

          if (currentMode === MODE_POSTPARAMETERS)
            throw new Error('Parameters must be contiguous');

          options.parameters = processParameter(line, options.parameters);
          return MODE_PARAMETERS;

        case 'examples':
          throw new Error('Missing summary');

        default:
          throw new Error('Unreachable!');
      }
    }

    // Otherwise this is the start of the summary
    if (!allowProblematic)
      checkLineForHTMLGeneration(line);

    params.summary = [line];
    return MODE_SUMMARY;
  };


  /*
   * Processes a line assumed to be part of the summary. If the line is empty, this will force a transition to
   * MODE_DETAILS; a transition to MODE_EXAMPLES will be made if the examples keyword is found. Any other keyword
   * will trigger an error.
   *
   */

  var processSummaryLine = function(line, params, options, allowProblematic) {
    if (/^\s*$/.test(line))
      return MODE_DETAILS;

    line = removeIndent(line, params.globalIndent);

    // When we are processing the summary, we allow code samples, but no other keywords
    var lineKeyword = getLineKeyword(line);
    if (lineKeyword) {
      if (lineKeyword === 'examples') {
        options.examples = [];
        return MODE_EXAMPLES;
      }

      throw new Error('Unexpected documentation line in summary!' + line);
    }

    if (!allowProblematic)
      checkLineForHTMLGeneration(line);

    params.summary.push(line);
    return MODE_SUMMARY;
  };


  /*
   * Processes a line containing a string that forms part of the details, and accumulating it into the 'details' field
   * of the supplied options object, whilst watching out for a line that would trigger a transition to the examples
   * state.
   *
   */

  var processDetailsLine = function(line, params, options, allowProblematic) {
    if (!(/^\s*$/.test(line))) {
      // Note: we can only use removeIndent for the first line; we allow further indents on later lines
      if (options.details === null || options.details.length === 0) {
        // First non-trivial line
        line = removeIndent(line, params.globalIndent);
      } else {
        checkMinimumIndent(line, params.globalIndent);
        line = line.slice(params.globalIndent);
      }
    }

    var lineKeyword = getLineKeyword(line);
    if (lineKeyword) {
      if (lineKeyword === 'examples') {
        // The examples keyword must be indented correctly (but account for the fact that we've already removed the
        // global indent)
        removeIndent(line, 0);

        options.examples = [];
        return  MODE_EXAMPLES;
      }

      throw new Error('Unexpected documentation line in details!' + line);
    }

    if (options.details === null) options.details = [];

    // Skip over repeated trailing empty lines at the beginning
    if (options.details.length > 0 || !(/^\s*\n?$/.test(line))) {
      if (!allowProblematic)
        checkLineForHTMLGeneration(line);

      options.details.push(line);
    }

    return MODE_DETAILS;
  };


  /*
   * Accumulates a line containing code samples into the 'examples' property of the supplied options object,
   * throwing if an unexpected keyword is encountered.
   *
   */

  var processExamplesLine = function(line, params, options, allowProblematic) {
    var lineKeyword = getLineKeyword(line);

    if (lineKeyword)
      throw new Error('Data line cannot appear in examples');

    // We ignore empty lines after the start of the examples marker
    if (/^\s*\n?$/.test(line)) {
      if (options.examples.length > 0)
        options.examples.push('');
      return MODE_EXAMPLES;
    }

    if (options.examplesIndent === null) {
      // The indent level has not been set, so this must be the first non-empty line (if it was empty we would have
      // returned early above). First, we must check that it meets the minimum indent. Note, we cannot use removeIndent
      // as this line might be establishing an example block indent, which may well be bigger.
      if (params.globalIndent > 0)
        checkMinimumIndent(line, params.globalIndent);
      line = line.slice(params.globalIndent);

      // How much indent is left? This establishes the indent for the remainder of the examples lines.
      var remainingWhitespace = /^\s+/.exec(line);
      options.examplesIndent = remainingWhitespace === null ? 0 : remainingWhitespace[0].length;
      line = line.slice(options.examplesIndent);
    } else {
      // We cannot use removeIndent, as additional indent is permissible
      checkMinimumIndent(line, params.globalIndent + options.examplesIndent);
      line = line.slice(params.globalIndent + options.examplesIndent);
    }

    if (!allowProblematic)
      checkLineForHTMLGeneration(line);

    options.examples.push(line);
    return MODE_EXAMPLES;
  };


  /*
   * Helper utility that removes empty lines from the end of an array.
   *
   */

  var trimTrailingEmptyLines = function(arr) {
    return arr.reduceRight(function(soFar, current) {
      if (soFar.length === 0 && /^\s*\n?$/.test(current))
        return soFar;
      return [current].concat(soFar);
    }, []);
  };


  return function(lines, generationOptions) {
    generationOptions = generationOptions || {allowProblematicForHTMLGeneration: true};

    var tag = lines.tag.toLowerCase();
    if (tag !== 'apifunction' && tag != 'apiobject')
      throw new Error('Unrecognised tag');

    var mode = MODE_AWAITINGNAME;

    var mandatoryParameters = {
      name: null,
      category: null,
      summary: null,
      globalIndent: 0,
    };

    // Note, that as a slight hack to avoid passing more in/out params around, we store some indent information in
    // the options object, deleting it before we pass it to the constructor

    var options = {
      details:  null,
      synonyms:  null,
      returnType:  null,
      parameters:  null,
      examples:  null,
      examplesIndent: null
    };

    var allowProblematic = generationOptions.allowProblematicForHTMLGeneration;

    lines.forEach(function(line) {
      var lineKeyword, separator;

      switch (mode) {
        case MODE_AWAITINGNAME:
          mode = processName(line, mandatoryParameters, mode);
          break;

        case MODE_OPTIONALS:
        case MODE_PARAMETERS:
        case MODE_POSTPARAMETERS:
          mode = processKeywordLine(line, mandatoryParameters, options, mode, allowProblematic);
          break;

        case MODE_SUMMARY:
          mode = processSummaryLine(line, mandatoryParameters, options, allowProblematic);
          break;

        case MODE_DETAILS:
          mode = processDetailsLine(line, mandatoryParameters, options, allowProblematic);
          break;

        case MODE_EXAMPLES:
          mode = processExamplesLine(line, mandatoryParameters, options, allowProblematic);
          break;

        default:
          throw new Error('Unreachable!');
      }
    });

    Object.keys(options).forEach(function(key) {
      if (options[key] === null)
        delete options[key];
    });

    if (mandatoryParameters.name === null)
      throw new Error('No function name found!');

    if (mandatoryParameters.category === null)
      throw new Error('No category found!');

    if (mandatoryParameters.summary === null)
      throw new Error('No summary found!');

    // Merge multiple summary lines into one. We don't want to do a join; the line may already have the requisite
    // newlines.
    var summary = mandatoryParameters.summary.reduce(function(soFar, current) {
      var separator = /\n$/.test(soFar) ? '' : '\n';
      return soFar + separator + current;
    });

    // Remove trailing empty lines at the end of details and examples
    if (options.details !== undefined)
      options.details = trimTrailingEmptyLines(options.details);
    if (options.examples !== undefined)
      options.examples = trimTrailingEmptyLines(options.examples);

    if (options.examples !== undefined && options.examples.length === 0)
      throw new Error('Examples are degenerate');

    var constructor = APIFunction;
    if (tag === 'apiobject') {
      constructor = APIObject;
      if (options.parameters || options.returnType || options.synonyms)
        throw new TypeError('APIFunction properties found in an APIObject');
    }

    // Delete temporary values
    delete options.globalIndent;
    delete options.examplesIndent;

    return constructor(mandatoryParameters.name, lines.file, mandatoryParameters.category, summary, options);
  };
})();
