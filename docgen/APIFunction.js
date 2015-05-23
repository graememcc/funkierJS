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

    if (options.parameters !== undefined) {
      optionalsOK = optionalsOK && options.parameters.every(function(elem) {
        var isObject = elem !== null && !Array.isArray(elem);
        return isObject && typeof(elem.name) === 'string' && Array.isArray(elem.type) && elem.type.every(function(s) {
          return typeof(s) === 'string';
        });
      });
    }

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
