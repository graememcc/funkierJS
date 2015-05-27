module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['**/*.js', '!**/node_modules/**'],
      options: {
        newcap: false
      }
    },


    generation: {
      docs: {
        src: ['lib/components/*.js'],
        docs: {
          markdown: {
            byName: {dest: 'docs/markdown/byName.md', pre: 'docs/templates/markdownNamePre.md' },
            byCategory: { dest: 'docs/markdown/byCategory.md', pre: 'docs/templates/markdownCategoryPre.md' }
          },

          html: {
            byName: {
              dest: 'docs/html/index.html',
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
      lint: {
        files: ['customGruntTasks/generation.js', 'docgen/**/*.js', 'Gruntfile.js', 'lib/**/*.js', 'test/**/*.js'],
        tasks: ['jshint']
      },

      helpGeneration: {
        files: ['customGruntTasks/generation.js', 'docs/templates/*', 'docgen/**/*.js', 'lib/**/*.js'],
        tasks: ['generation:docs']
      }
    }
  });


  var tasks = ['jshint', 'watch'];
  tasks.map(function(task) {
    grunt.loadNpmTasks('grunt-contrib-' + task);
  });


  grunt.loadTasks('customGruntTasks');
  grunt.registerTask('default', ['watch']);
};
