module.exports = (function() {
  "use strict";


  return function(grunt) {
    grunt.registerMultiTask('generation', function() {
      var files = this.filesSrc;
      var documentationCreator = require('../docgen/documentationCreator');

      var options = {
        markdown: this.data.markdown,
        html:     this.data.html
      };


      ['markdown', 'html'].forEach(function(variant) {
        ['byName', 'byCategory'].forEach(function(docType) {
          ['pre', 'post'].forEach(function(position) {
            if (options[variant] && options[variant][docType] && options[variant][docType][position] &&
                options[variant][docType][position + 'Replace']) {
              var prop = position + 'Replace';
              var file = grunt.file.read(options[variant][docType][position]);
              options[variant][docType][prop].forEach(function(sr) {
                file = file.replace(sr.search, sr.replace);
              });
              options[variant][docType][position] = file.split('\n');
            }
          });
        });
      });

      if (this.data.additional)
        options.additional = this.data.additional;

      documentationCreator(files, options);
    });
  };
})();
