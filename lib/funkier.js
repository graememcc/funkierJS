module.exports = (function() {
  "use strict";


  var funkier = {};

  // Imports need to be explicit for browserify to find them
  var imports = {
    array: require('./components/array'),
    base: require('./components/base'),
    categories: require('./components/categories'),
    curry: require('./components/curry'),
    date: require('./components/date'),
    fn: require('./components/fn'),
    logical: require('./components/logical'),
    object: require('./components/object'),
    maths: require('./components/maths'),
    maybe: require('./components/maybe'),
    pair: require('./components/pair'),
    result: require('./components/result'),
    string: require('./components/string'),
    types: require('./components/types')
  };


  // Export our imports
  Object.keys(imports).forEach(function(mod) {
    var m = imports[mod];
    Object.keys(m).forEach(function(k) {
      if (k[0] === '_') return;

      funkier[k] = m[k];
    });
  });


  // Install auto-generated help
  require('./help')(funkier);


  return funkier;
})();
