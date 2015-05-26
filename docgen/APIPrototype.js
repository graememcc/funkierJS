module.exports = (function() {
  "use strict";


  /*
   * We wish to document various functions and objects in funkierJS. The documentation of these types of objects
   * contain some commonality, which is factored out here, to avoid repeating the verification in both files.
   *
   * See the APIFunction and APIObject files for details.
   *
   */


  /*
   * Process an array of lines, removing trailing line endings, and splitting on any other line endings. Returns an
   * empty array when passed undefined.
   *
   */

  var processLineArray = function(arr) {
    if (arr === undefined)
      return [];

    // Note: whitespace might be significant for examples, so we cannot use trim
    var result = arr.reduce(function(soFar, current) {
      // We must delete any trailing newlines first
      var lines = current.replace(/\s*$/, '').split('\n');

      // Trim trailing whitespace from the remaining lines
      return soFar.concat(lines.map(function(s) { return s.replace(/\s*$/, ''); }));
    }, []);

    Object.freeze(result);
    return result;
  };


  var verifyStringArray = function(val, paramName) {
    if (!Array.isArray(val))
      throw new TypeError('Invalid parameter: ' + paramName + ' is not an array');

    if (!val.every(function(s) { return typeof(s) === 'string'; }))
      throw new TypeError('Invalid parameter: ' + paramName + ' contains a non-string member');
  };


  var verifyString = function(val, paramName) {
    if (typeof(val) !== 'string')
      throw new TypeError('Invalid parameter: ' + paramName + ' is not a string!');
  };


  var verifyNameCat = function(val, self, otherProp) {
    var other = self[otherProp];
    if (other === undefined) return;
    if (val.toLowerCase() === other.toLowerCase())
      throw new Error('name and category cannot match (even approximately)');
  };


  return {
    get name() { return this.__name; },
    set name(val) { verifyString(val, 'name'); verifyNameCat(val, this, '__category'); this.__name = val; },

    get category() { return this.__category; },
    set category(val) {
      verifyString(val, 'category');
      verifyNameCat(val, this, '__name');
      this.__category = val[0].toUpperCase() + val.slice(1);
    },

    get summary() { return this.__summary; },
    set summary(val) { verifyString(val, 'summary'); this.__summary = val.trim(); },

    get details() {
      if (this.__details === undefined) {
        this.__details = [];
        Object.freeze(this.__details);
      }
      return this.__details;
    },
    set details(arr) { verifyStringArray(arr, 'details'); this.__details = processLineArray(arr); },

    get examples() {
      if (this.__examples === undefined) {
        this.__examples = [];
        Object.freeze(this.__examples);
      }
      return this.__examples;
    },
    set examples(arr) { verifyStringArray(arr, 'examples'); this.__examples = processLineArray(arr); },
  };
})();
