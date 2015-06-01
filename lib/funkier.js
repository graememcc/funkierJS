module.exports = (function() {
  "use strict";


  var funkier = {};

  // Imports need to be explicit for browserify to find them
  var imports = {
    base: require('./components/base'),
    curry: require('./components/curry'),
    logical: require('./components/logical'),
    maths: require('./components/maths'),
    maybe: require('./components/maybe'),
    pair: require('./components/pair'),
    result: require('./components/result'),
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
//(funcion() {
//  "use strict";
//
//
//  var makeModule = function(require, exports) {
//    var base = require('./base');
//    var logical = require('./logical');
//    var maths = require('./maths');
//    var object = require('./object');
//    var string = require('./string');
//    var fn = require('./fn');
//    var date = require('./date');
//    var pair = require('./pair');
//    var maybe = require('./maybe');
//    var result = require('./result');
//    var combinators = require('./combinators');
//    var array = require('./array');
//
//    var utils = require('./utils');
//    var help = utils.help;
//
//
//
//    // Also export help
//    exportedFns.help = help;
//
//
//    module.exports = exportedFns;
//  };
//
//
//  // AMD/CommonJS foo
//  if (typeof(define) === "function") {
//    define(function(require, exports, module) {
//      makeModule(require, exports, module);
//    });
//  } else {
//    makeModule(require, exports, module);
//  }
//})();
