(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var base = require('./base');
    var logical = require('./logical');
    var maths = require('./maths');

    var imports = [base, logical, maths];
    var exportedFns = {};

    // Export our imports
    imports.forEach(function(importedModule) {
      Object.keys(importedModule).forEach(function(k) {
        exportedFns[k] = importedModule[k];
      });
    });


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
