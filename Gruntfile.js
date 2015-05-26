module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['**/*.js', '!**/node_modules/**'],
      options: {
        newcap: false
      }
    },


    docs: {
      all: {
        src: ['lib/components/*.js'],
        docs: {
          markdown: {
            byName: {dest: 'docs/markdown/byName.md', pre: 'docs/templates/markdownNamePre.md' },
            byCategory: { dest: 'docs/markdown/byCategory.md', pre: 'docs/templates/markdownCategoryPre.md' }
          },

          html: {
            byName: {
              dest: 'docs/html/byName.html',
              pre: 'docs/templates/HTMLNamePre.html',
              post: 'docs/templates/HTMLNamePost.html'
            },

            byCategory: {
              dest: 'docs/html/byCategory.html',
              pre: 'docs/templates/HTMLCategoryPre.html',
              post: 'docs/templates/HTMLCategoryPost.html'
            }
          }
        }
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
    var documentationCreator = require('./docgen/documentationCreator');
    documentationCreator(files, this.data.docs.markdown, this.data.docs.html);
  });


  grunt.registerTask('default', ['watch']);
};
