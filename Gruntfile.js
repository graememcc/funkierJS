module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['**/*.js', '!**/node_modules/**'],
      options: {
        newcap: false
      }
    },


    docs: {
      docs: {
        src: ['lib/components/*.js'],
        markdownNameFile: 'docs/markdown/byName.md',
        markdownCategoryFile: 'docs/markdown/byCategory.md'
      }
    },


    watch: {
      files: ['lib/**/*.js', 'test/**/*.js', 'docgen/**/*.js'],
      tasks: ['jshint', 'docs']
    }
  });


  var tasks = ['jshint', 'watch'];
  tasks.map(function(task) {
    grunt.loadNpmTasks('grunt-contrib-' + task);
  });


  grunt.registerMultiTask('docs', function() {
    var files = this.filesSrc;
    var data = {
      markdownNameFile:     this.data.markdownNameFile,
      markdownCategoryFile: this.data.markdownCategoryFile
    };

    var documentationCreator = require('./docgen/documentationCreator');
    documentationCreator(files, data);
  });


  grunt.registerTask('default', ['watch']);
};
