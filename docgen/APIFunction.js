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
   * An APIFunction is an object representing the documentation of a function found in the source code. The constructor
   * takes the following parameters:
   *
   *   name: the name of the function being described as a string.
   *   category: all documented functions are assumed to be grouped into categories. This string denotes such a
   *             category.
   *   summary: a string containing a brief overview of the function's functionality. This is assumed to be a brief
   *            paragraph. The caller must add any required line endings.
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
   *   details: An array of strings, each string representing a paragraph of further information about function usage.
   *            This will be an empty array if not supplied. The caller must add any required line endings.
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
   * on the client to insert appropriate line endings to ensure that the output looks acceptable.
   *
   * Similarly, each entry in the details array is assumed to be a paragraph. It is intended that the in-app help
   * outputs each paragraph separately, but the client must add line-endings to the individual strings to control line
   * length.
   *
   */


  var verifyParameterProperty = function(elem) {
    var isString = function(s) {
      return typeof(s) === 'string';
    };

    var isObject = elem !== null && !Array.isArray(elem);
    if (!isObject) return false;

    return typeof(elem.name) === 'string' && Array.isArray(elem.type) && elem.type.length > 0 &&
           elem.type.every(isString);
  };


  var verifyParameters = function(name, category, summary, options) {
    var argumentTypes = ['string', 'string', 'string', 'object'];
    var typesOK = [].every.call(arguments, function(arg, i) {
      return typeof(arg) === argumentTypes[i];
    });

    typesOK = typesOK && !Array.isArray(options) && options !== null;
    if (!typesOK)
      throw new TypeError('Invalid parameter!');

    var optionals = ['details', 'examples', 'returnType',  'synonyms', 'parameters'];
    var optionTypes = ['string', 'string', 'string', 'string',  'object'];

    var optionalsOK = optionals.every(function(optProp, i) {
      var opt = options[optProp];
      return opt === undefined || (Array.isArray(opt) && opt.every(function(elem) {
        return typeof(elem) === optionTypes[i];
      }));
    });

    if (optionalsOK && options.parameters !== undefined)
      optionalsOK = options.parameters.every(verifyParameterProperty);

    if (!optionalsOK)
      throw new TypeError('Invalid parameter!');
  };


  function APIFunction(name, category, summary, options) {
    if (!(this instanceof APIFunction))
      return new APIFunction(name, category, summary, options);

    verifyParameters(name, category, summary, options);

    this.name = name;
    this.summary = summary;
    this.category = category[0].toUpperCase() + category.slice(1);

    this.details = options.details ? options.details.slice() : [];
    this.returnType = options.returnType ? options.returnType.slice() : [];
    this.examples = options.examples ? options.examples.slice() : [];
    this.synonyms = options.synonyms ? options.synonyms.slice() : [];
    this.parameters = options.parameters ? options.parameters.map(function(param) {
      var paramType = param.type.slice();
      Object.freeze(paramType);
      return {name: param.name, type: paramType};
    }) : [];

    ['details', 'returnType', 'examples', 'synonyms', 'parameters'].forEach(function(prop) {
      Object.freeze(this[prop]);
    }, this);

    this.parameters.forEach(function(param) {
      Object.freeze(param);
    });

    Object.freeze(this);
  }


  exports.APIFunction = APIFunction;
}));
