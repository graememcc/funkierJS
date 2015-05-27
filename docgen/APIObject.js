module.exports = (function() {
  "use strict";


  /*
   * An APIObject is an object representing the documentation of an object found in the source code. The constructor
   * takes the following parameters:
   *
   *   name: the name of the object being described as a string.
   *   filename: the name of the file in which the object was found.
   *   category: all documented values are assumed to be grouped into categories. This string denotes such a
   *             category.
   *   summary: a string containing a brief overview of the object's purpose. This is assumed to be a brief
   *            paragraph. The caller must add any required line endings - see below
   *   options: an object containing additional information. See below.
   *
   * The supplied category will be transformed to uppercase the first letter of the category name. In other words,
   * categories "functions" and "Functions" are assumed to be the same category.
   *
   * As noted above, additional detail can be supplied in the options object. The following properties are recognised:
   *   details: An array of strings, each string representing a line of explanatory text. In totality, it is assumed
   *            that the details provide further explanation on usage beyond that provided by the summary line. This
   *            will be an empty array if not supplied. Any trailing line endings will be stripped: it is assumed
   *            output routines can add these where necessary. Paragraph breaks should be denoted by empty lines.
   *   examples: An array of strings, each of which represents a line of Javascript illuminating typical usage of the
   *             value. This will be an empty array if not supplied.
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


  function APIObject(name, filename, category, summary, options) {
    if (!(this instanceof APIObject))
      return new APIObject(name, filename, category, summary, options);

    if (typeof(options) !== 'object' || options === null || Array.isArray(options))
      throw new TypeError('Options is not an object!');

    this.name = name;
    this.filename = filename;
    this.summary = summary;
    this.category = category;
    this.details = options.details ? options.details : [];
    this.examples = options.examples ? options.examples : [];

    Object.freeze(this);
  }


  APIObject.prototype = Object.create(APIPrototype);


  return APIObject;
})();
