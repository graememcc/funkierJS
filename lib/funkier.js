module.exports = (function() {
  "use strict";


  var funkier = {};
  var imports = ['curry', /*base, */ 'logical', 'maths', /*object, string, fn, date, pair, maybe,
                 result, combinators, array */];

  // Export our imports
  imports.forEach(function(mod) {
    var m = require('./components/' + mod);
    Object.keys(m).forEach(function(k) {
      funkier[k] = m[k];
    });
  });

  // Intall auto-generated help
  require('./help')(funkier);


  return funkier;
})();
//(function() {
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
