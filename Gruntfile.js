module.exports = function(grunt) {
  grunt.initConfig({
    templateDir: 'docs/templates',


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
          byName: {dest: 'docs/markdown/byName.md', pre: '<%= templateDir %>/markdown/namePre.md' },
          byCategory: { dest: 'docs/markdown/byCategory.md', pre: '<%= templateDir %>/markdown/categoryPre.md' }
        },

        html: {
          byName: {
            dest: 'docs/html/index.html',
            pre: '<%= templateDir %>/html/namePre.html',
            post: '<%= templateDir %>/html/namePost.html'
          },

          byCategory: {
            dest: 'docs/html/byCategory.html',
            pre: '<%= templateDir %>/html/categoryPre.html',
            post: '<%= templateDir %>/html/categoryPost.html'
          }
        },

        additional: {
          makeOnlineHelp: { file: 'automation/generateHelp.js', options: { dest: 'lib/help.js' } }
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
        files: ['automation/generateHelp.js', 'customGruntTasks/generation.js', '<%= templateDir %>/*/categoryP*',
                '<%= templateDir %>/*/nameP*', 'docgen/**/*.js',  'Gruntfile.js', 'lib/components/**.*js'],
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
