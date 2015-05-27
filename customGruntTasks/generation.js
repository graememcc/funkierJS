module.exports = (function() {
  "use strict";


  return function(grunt) {
    grunt.registerMultiTask('generation', function() {
      var files = this.filesSrc;
      var documentationCreator = require('../docgen/documentationCreator');

      var data = {
        markdown: this.data.docs.markdown,
        html:     this.data.docs.html
      };

      documentationCreator(files, data);
    });
  };
})();
