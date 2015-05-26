module.exports = (function() {
  "use strict";


  /*
   * An APIFunction is an object representing the documentation of a function found in the source code. The constructor
   * takes the following parameters:
   *
   *   name: the name of the function being described as a string.
   *   category: all documented functions are assumed to be grouped into categories. This string denotes such a
   *             category.
   *   summary: a string containing a brief overview of the function's functionality. This is assumed to be a brief
   *            paragraph. The caller must add any required line endings - see below
   *   options: an object containing additional information. See below.
   *
   * The supplied category will be transformed to uppercase the first letter of the category name. In other words,
   * categories "functions" and "Functions" are assumed to be the same category.
   *
   * As noted above, additional detail can be supplied in the options object. The following properties are recognised:
   *   synonyms: An array of strings representing alternate names that can be used to invoke the function. This will
   *             be an empty array if not supplied.
   *   returnType: An array of strings representing the possible types that might be returned by an invocation of the
   *               function. This will be an empty array if not supplied.
   *   details: An array of strings, each string representing a line of explanatory text. In totality, it is assumed
   *            that the details provide further explanation on function usage beyond that provided by the summary
   *            line. This will be an empty array if not supplied. Any trailing line endings will be stripped: it is
   *            assumed output routines can add these where necessary. Paragraph breaks should be denoted by empty
   *            lines.
   *   examples: An array of strings, each of which represents a line of Javascript illuminating typical usage of the
   *             function. This will be an empty array if not supplied.
   *   parameters: See below. This will be an empty array if not supplied.
   *
   * The parameters option should be an array of parameters objects. Each such object should have the following
   * properties:
   *   name: A string containing the name of the parameter
   *   type: A non-empty array containing the possible types that the parameter can take
   *
   * It is intended that when output to the console, the summary string will be output verbatim: thus it is incumbent
   * on the client to insert appropriate line endings to ensure that line length is appropriate. Note however that the
   * trailing line length will be stripped, as it is assumed the console output function will add this.
   *
   * Similarly, each entry in the details array is assumed to be a paragraph. It is intended that the in-app help
   * outputs each paragraph separately, but the client must add line-endings to the individual strings to control line
   * length.
   *
   * Each line of the examples array is assumed to be a line that should be output in a code block. It is assumed that
   * when converted to Markdown line endings will be added as required, so line endings will be automatically stripped.
   *
   * Newline characters within each examples or details line (in other words, not occurring at the end) will cause the
   * line to be split at that point.
   *
   */


  var APIPrototype = require('./APIPrototype');


  var verifyParameterProperty = function(elem) {
    var isString = function(s) {
      return typeof(s) === 'string';
    };

    var isObject = elem !== null && !Array.isArray(elem);
    if (!isObject) return false;

    return typeof(elem.name) === 'string' && Array.isArray(elem.type) && elem.type.length > 0 &&
           elem.type.every(isString);
  };


  var verifyOptions = function(options) {
    if (typeof(options) !== 'object' || options === null || Array.isArray(options))
      throw new TypeError('Invalid parameter: options is not an object');

    var optionals = ['returnType',  'synonyms', 'parameters'];
    var optionTypes = ['string', 'string', 'object'];

    var failPoint = -1;
    var optionalsOK = optionals.every(function(optProp, i) {
      var opt = options[optProp];
      if (opt !== undefined && (!Array.isArray(opt) || !opt.every(function(elem) {
        return typeof(elem) === optionTypes[i];
      }))) {
        failPoint = i;
        return false;
      }

      return true;
    });

    if (!optionalsOK)
      throw new TypeError(optionals[failPoint] + ' is invalid!');

    if (options.parameters !== undefined)
      optionalsOK = options.parameters.every(verifyParameterProperty);

    if (!optionalsOK)
      throw new TypeError('Invalid optional parameter!');
  };


  function APIFunction(name, category, summary, options) {
    if (!(this instanceof APIFunction))
      return new APIFunction(name, category, summary, options);

    verifyOptions(options);

    this.name = name;
    this.summary = summary;
    this.category = category;
    this.details = options.details ? options.details : [];
    this.examples = options.examples ? options.examples : [];

    this.returnType = options.returnType ? options.returnType.slice() : [];
    this.synonyms = options.synonyms ? options.synonyms.slice() : [];
    this.parameters = options.parameters ? options.parameters.map(function(param) {
      var paramType = param.type.slice();
      Object.freeze(paramType);
      return {name: param.name, type: paramType};
    }) : [];

    ['returnType', 'synonyms', 'parameters'].forEach(function(prop) {
      Object.freeze(this[prop]);
    }, this);

    this.parameters.forEach(function(param) {
      Object.freeze(param);
    });

    Object.freeze(this);
  }


  APIFunction.prototype = Object.create(APIPrototype);


  return APIFunction;
})();
