(function() {
  "use strict";


  var makeModule = function(require, exports) {
    var base = require('./base');
    var logical = require('./logical');

    var imports = [base, logical];
    var exportedFns = {};

    // Export our imports
    imports.forEach(function(importedModule) {
      // Can't use Object.keys in some versions of node
      for (var k in importedModule) {
        if (!importedModule.hasOwnProperty(k))
          continue;

        exportedFns[k] = importedModule[k];
      }
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
