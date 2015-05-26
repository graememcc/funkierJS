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
        markdownNamePre: 'docs/templates/markdownNamePre.md',
        markdownCategoryFile: 'docs/markdown/byCategory.md',
        markdownCategoryPre: 'docs/templates/markdownCategoryPre.md',
      }
    },


    watch: {
      files: ['lib/**/*.js', 'test/**/*.js', 'docgen/**/*.js', 'Gruntfile.js'],
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
      markdownCategoryFile: this.data.markdownCategoryFile,
      markdownByNamePre:     this.data.markdownNamePre,
      markdownByCategoryPre: this.data.markdownCategoryPre
    };

    var documentationCreator = require('./docgen/documentationCreator');
    documentationCreator(files, data);
  });


  grunt.registerTask('default', ['watch']);
};
