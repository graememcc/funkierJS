module.exports = (function() {
  "use strict";


  return function(grunt) {
    grunt.registerMultiTask('generation', function() {
      var files = this.filesSrc;
      var documentationCreator = require('../docgen/documentationCreator');
      documentationCreator(files, this.data.docs.markdown, this.data.docs.html);
    });
  };
})();
