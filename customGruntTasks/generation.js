module.exports = (function() {
  "use strict";


  return function(grunt) {
    grunt.registerMultiTask('generation', function() {
      var files = this.filesSrc;
      var documentationCreator = require('../docgen/documentationCreator');

      var options = {
        markdown: this.data[this.target].markdown,
        html:     this.data[this.target].html
      };

      if (this.data[this.target].additional)
        options.additional = this.data[this.target].additional;

      documentationCreator(files, options);
    });
  };
})();
