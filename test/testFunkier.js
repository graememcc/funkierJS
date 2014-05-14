(function() {
  "use strict";


  var testFixture = function(require, exports) {
    var chai = require('chai');
    var expect = chai.expect;

    var funkier = require('../funkier');

    // Import utility functions
    var testUtils = require('./testUtils');
    var exportsProperty = testUtils.exportsProperty;


    // Import submodules
    var base = require('../base');
    var logical = require('../logical');
    var maths = require('../maths');
    var object = require('../object');
    var string = require('../string');
    var fn = require('../fn');
    var date = require('../date');
    var pair = require('../pair');
    var maybe = require('../maybe');
    var result = require('../result');
    var combinators = require('../combinators');
    var array = require('../array');


    var imports = [{name: 'base', val: base},
                   {name: 'logical', val: logical},
                   {name: 'maths', val: maths},
                   {name: 'object', val: object},
                   {name: 'string', val: string},
                   {name: 'fn', val: fn},
                   {name: 'date', val: date},
                   {name: 'pair', val: pair},
                   {name: 'maybe', val: maybe},
                   {name: 'result', val: result},
                   {name: 'combinators', val: combinators},
                   {name: 'array', val: array}];


    describe('Funkier exports', function() {
      imports.forEach(function(importedModule) {
        var name = importedModule.name;
        var module = importedModule.val;

        // We want to check that funkier exports everything exported by the original submodule, and indeed that it
        // exports the original version
        for (var k in module) {
          if (!module.hasOwnProperty(k))
            continue;

          it('funkier.js exports ' + k, exportsProperty(funkier, k));
          it('funkier.js exports ' + k + ' from ' + name, function() {
            expect(funkier[k]).to.equal(module[k]);
          });
        }
      });
    });
  };


  // AMD/CommonJS foo: aim to allow running testsuite in browser with require.js (TODO)
  if (typeof(define) === "function") {
    define(function(require, exports, module) {
      testFixture(require, exports, module);
    });
  } else {
    testFixture(require, exports, module);
  }
})();
