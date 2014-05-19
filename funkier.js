(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var curry = require('./curry');
    var base = require('./base');
    var logical = require('./logical');
    var maths = require('./maths');
    var object = require('./object');
    var string = require('./string');
    var fn = require('./fn');
    var date = require('./date');
    var pair = require('./pair');
    var maybe = require('./maybe');
    var result = require('./result');
    var combinators = require('./combinators');
    var array = require('./array');

    var utils = require('./utils');
    var help = utils.help;

    var imports = [curry, base, logical, maths, object, string, fn, date, pair, maybe,
                   result, combinators, array];
    var exportedFns = {};

    // Export our imports
    imports.forEach(function(importedModule) {
      Object.keys(importedModule).forEach(function(k) {
        exportedFns[k] = importedModule[k];
      });
    });


    // Also export help
    exportedFns['help'] = help;


    module.exports = exportedFns;
  };


  // AMD/CommonJS foo
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      makeModule(require, exports, module);
    });
  } else {
    makeModule(require, exports, module);
  }
})();
