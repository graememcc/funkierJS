module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      all: ['automation/**/*.js', 'customGruntTasks/**.*.js', 'docgen/**/*.js', 'Gruntfile.js', 'lib/**/*.js',
            'test/**/*.js'],
      options: {
        newcap: false
      }
    },


    generation: {
      docs: {
        src: ['lib/components/*.js'],
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
      },


      autoTests: {
        src: ['lib/components/*.js'],
        additional: {
          makeTests: { file: 'automation/generateAPITests.js', options: { dest: 'test/funkierJS/testAPI.js' } }
        }
      }
    },


    watch: {
      lint: {
        files: ['automation/**/*.js', 'customGruntTasks/**.*.js', 'docgen/**/*.js', 'Gruntfile.js', 'lib/**/*.js',
              'test/**/*.js'],
        tasks: ['jshint']
      },

      helpGeneration: {
        files: ['customGruntTasks/generation.js', 'docs/templates/*', 'docgen/**/*.js', 'lib/**/*.js'],
        tasks: ['generation:docs']
      },

      testGeneration: {
        files: ['automation/generateAPITests.js', 'lib/**/*.js'],
        tasks: ['generation:autoTests']
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
