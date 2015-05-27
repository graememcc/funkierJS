module.exports = (function() {
  "use strict";


  var APIFunction = require('./APIFunction');
  var APIObject = require('./APIObject');


  /*
   * A collator object is used to describe all the documented values found by the documentation generation system,
   * and allows a client to query them in various interesting ways. It takes as input an array of arrays, each array
   * containing APIFunction and APIObject objects (the assumption being that all the values in the same array originate
   * from the same source file) and returns an object with the following methods:
   *
   *  - getNames: returns an array, sorted in lexicograohical order, of the names of all the values encountered. This
   *              includes entries for each synonym where values have synonyms.
   *
   *  - getCategories: returns an array, sorted in lexicograohical order, of all the categories the documented values
   *                   were ascribed to. Each category shall appear only once, regardless of how many objects were
   *                   found.
   *
   *  - getFileNames: returns an array, sorted in lexicograohical order, of all the filenames that were found to contain
   *                  the documented values.
   *
   *  - byName: returns an array of all the documented values found, sorted by name. Where a value has synonyms, there
   *            will be an entry for the synonym: this will be an object with three properties:
   *              * name: the name of the synonym
   *              * filename: the filename in which it was found
   *              * synonymFor: the value that is aliased
   *
   *            All other values will be the original APIFunction and APIObjects created from parsing the documentation
   *            comments.
   *
   *  - byCategory: given the name of a category from the array returned by getCategories, returns an array containing
   *                all the values belonging to this category. As with 'byName' above, this will include additional
   *                objects to represent synonyms of other values. See the comment for 'byName' above regarding the
   *                form of such objects. The array is sorted by the name of the values.
   *
   * The collator imposes some constraints on the data it is provided with. It will throw if any of the following occur:
   *
   *  - Two objects represent a value with the same name
   *
   *  - The synonym of one documentation object matches the name or synonym of another
   *
   *  - The lowercase equivalent of the name or synonym of an object matches the name of a category
   *
   */

  var sort = function(a, b) {
    var name1 = a.name;
    var name2 = b.name;
    return name1 < name2 ? -1 : (name1 === name2 ? 0 : 1);
  };


  var Collator = function(arrays) {
    if (!(this instanceof Collator))
      return new Collator(arrays);

    if (!Array.isArray(arrays)) throw new Error('Value must be an array');

    var values = {};
    var namesFound = [];
    var filesFound = [];
    var all = [];

    arrays.forEach(function(arr) {
      if (!Array.isArray(arrays)) throw new Error('Value must contain only arrays');

      arr.forEach(function(val) {
        if (!(val instanceof APIFunction) && !(val instanceof APIObject))
          throw new Error('Non-APIFunction/APIObject value found');

        var cat = val.category;
        if (namesFound.indexOf(cat) !== -1)
          throw new Error('Category matches an earlier function name');

        if (namesFound.indexOf(val.name) !== -1)
          throw new Error('Duplicate name found');

        if ('synonyms' in val) {
          val.synonyms.forEach(function(syn) {
            if (namesFound.indexOf(syn) !== -1)
              throw new Error('Duplicate name found');
          });
        }

        var filename = val.filename;
        if (filesFound.indexOf(filename) === -1) filesFound.push(filename);

        var existingCategories = Object.keys(values);
        var alreadyHaveNameAsCategory = function(s) {
          return existingCategories.some(function(t) {
            return s.toLowerCase() === t.toLowerCase();
          });
        };

        if (alreadyHaveNameAsCategory(val.name) ||
            (Array.isArray(val.synonyms) && val.synonyms.some(alreadyHaveNameAsCategory)))
          throw new Error('Name matches a category');

        if (values[cat] === undefined) values[cat] = [];

        namesFound.push(val.name);
        if ('synonyms' in val) {
          val.synonyms.forEach(function(syn) {
            namesFound.push(syn);
            var synonymInfo = {name: syn, filename: filename, synonymFor: val.name};
            Object.freeze(synonymInfo);
            values[cat].push(synonymInfo);
            all.push(synonymInfo);
          });
        }

        values[cat].push(val);
        all.push(val);
      });
    });

    var keys = Object.keys(values);
    keys.sort();
    Object.freeze(keys);
    keys.forEach(function(k) {
      values[k].sort(sort);
      Object.freeze(values[k]);
    });

    this._categories = keys;
    all.sort(sort);

    Object.freeze(all);
    this._byName = all;

    Object.freeze(values);
    this._byCategory = values;

    namesFound.sort();
    Object.freeze(namesFound);
    this._names = namesFound;

    filesFound.sort();
    Object.freeze(filesFound);
    this._files = filesFound;

    Object.freeze(this);
  };


  Collator.prototype.getNames = function() {
    return this._names;
  };


  Collator.prototype.getCategories = function() {
    return this._categories;
  };


  Collator.prototype.getFileNames = function() {
    return this._files;
  };


  Collator.prototype.byName = function() {
    return this._byName;
  };


  Collator.prototype.byCategory = function(cat) {
    var byCat = this._byCategory[cat];
    return byCat === undefined ? [] : byCat;
  };


  return Collator;
})();
