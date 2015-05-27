module.exports = (function() {
  "use strict";

  var fs = require('fs');
  var path = require('path');

  var APIFunction = require('../docgen/APIFunction');
  var APIObject = require('../docgen/APIObject');


  var preamble = [
    'module.exports = (function() {',
    '  "use strict";',
    '',
    '',
    '  /* NOTE: THIS FILE IS AUTOMATICALLY GENERATED. DO NOT EDIT MANUALLY */',
    '',
    '',
    '  return function(funkier) {',
    '    var helpFn = function(value) {',
    '      switch (value) {',
    '        case helpFn:',
    '          console.log(\'help:\');',
    '          console.log(\'Displays useful help for funkierJS API values\');',
    '          console.log(\'\');',
    '          console.log(\'Usage: help(f);\');',
    '          console.log(\'\');',
    '          console.log(\'Find full help online at https://graememcc.github.io/funkierJS/docs/\');',
    '          break;',
    ''];




  var postscript = [
    '        default:',
    '          console.log(\'No help available\');', 
    '      }',
    '    };',
    '',
    '    funkier.help = helpFn;',
    '  };',
    '})();'];


  return function(collated, options) {
    var buffer = preamble;
    
    var byName = collated.byName();

    byName.forEach(function(documentedValue) {
      if ('synonymFor' in documentedValue) return;

      var pushPostscript = function() {
        buffer.push('          break;');
        buffer.push('');
      };

      buffer.push('        case funkier.' + documentedValue.name + ':');
      buffer.push('          console.log(\'' + documentedValue.name + ':\');');
      documentedValue.summary.split('\n').forEach(function(line) {
        buffer.push('          console.log(\'' + line + '\');');
      });
      buffer.push('          console.log(\'\');');
      if (documentedValue instanceof APIFunction) {
        var params = 'Usage: ' + (documentedValue.returnType ? 'var x = ' : '') + documentedValue.name;
        params = params + '(' + documentedValue.parameters.map(function(p) { return p.name; }).join(', ');
        buffer.push('          console.log(\'' + params + ')\');');
        buffer.push('          console.log(\'\');');
      }
      buffer.push('          console.log(\'See https://graememcc.github.io/funkierJS/docs/index.html#' +
                  documentedValue.name.toLowerCase() + '\');');
      pushPostscript();
    });

    buffer = buffer.concat(postscript).map(function(s) {
      return /\n$/.test(s) ? s : s + '\n';
    });

    buffer = buffer.join('');

    fs.writeFileSync(options.dest, buffer, {encoding: 'utf-8'});
  };
})();
