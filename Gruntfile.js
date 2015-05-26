module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['**/*.js', '!**/node_modules/**'],
      options: {
        newcap: false
      }
    },


    generation: {
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
      tasks: ['jshint', 'generation']
    }
  });


  var tasks = ['jshint', 'watch'];
  tasks.map(function(task) {
    grunt.loadNpmTasks('grunt-contrib-' + task);
  });


  grunt.loadTasks('customGruntTasks');
  grunt.registerTask('default', ['watch']);
};
