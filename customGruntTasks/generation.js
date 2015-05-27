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

      if (this.data.additional)
        options.additional = this.data.additional;

      documentationCreator(files, options);
    });
  };
})();
