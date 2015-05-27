module.exports = (function() {
  "use strict";


  var APIFunction = require('./APIFunction');
  var APIObject = require('./APIObject');


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
            var synonymInfo = {name: syn, filename: val.filename, synonymFor: val.name};
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

    Object.freeze(this);
  };


  Collator.prototype.getNames = function() {
    return this._names;
  };


  Collator.prototype.getCategories = function() {
    return this._categories;
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
