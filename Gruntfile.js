module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    templateDir: 'docs/templates',


    jshint: {
      all: ['automation/**/*.js', 'customGruntTasks/**.*.js', 'docgen/**/*.js', 'Gruntfile.js', 'lib/**/*.js',
            'test/**/*.js'],

      options: {
        newcap: false
      }
    },


    generation: {
      autoTests: {
        src: ['lib/components/*.js'],
        additional: {
          makeTests: { file: 'automation/generateAPITests.js', options: { dest: 'test/funkierJS/testAPI.js' } }
        }
      },


      docs: {
        src: ['lib/components/*.js'],

        markdown: {
          byName: {dest: 'docs/markdown/byName.md', pre: '<%= templateDir %>/markdown/pre.md',
                   preReplace: [{search: /TITLE/, replace: 'funkierJS API'}]},

          byCategory: { dest: 'docs/markdown/byCategory.md', pre: '<%= templateDir %>/markdown/pre.md',
                        preReplace:
                          [{search: /TITLE/, replace: 'funkierJS API: By Category'}]}
        },

        html: {
          byName: {
            dest: 'docs/html/index.html',
            pre: '<%= templateDir %>/html/pre.html',
            preReplace: [{search: /TITLE/,   replace: 'funkierJS API'},
                         {search: /HEADING/, replace: 'funkierJS API'}],
            post: '<%= templateDir %>/html/post.html'
          },

          byCategory: {
            dest: 'docs/html/byCategory.html',
            pre: '<%= templateDir %>/html/pre.html',
            preReplace: [{search: /TITLE/,   replace: 'funkierJS API: By Category'},
                         {search: /HEADING/, replace: 'funkierJS API: By Category'}],
            post: '<%= templateDir %>/html/post.html'
          }
        },

        additional: {
          makeOnlineHelp: { file: 'automation/generateHelp.js', options: { dest: 'lib/help.js' } }
        }
      },


      versionedDocs: {
        src: ['lib/components/*.js'],

        markdown: {
          byName: {dest: 'docs/<%= pkg.version %>/markdown/byName.md',
                   pre: '<%= templateDir %>/markdown/pre.md',
                   preReplace: [{search: /TITLE/,   replace: 'funkierJS API (version <%= pkg.version %>)'},
                                {search: /HEADING/, replace: 'funkierJS API (version <%= pkg.version %>)'}]},

          byCategory: { dest: 'docs/<%= pkg.version %>/markdown/byCategory.md',
                        pre: '<%= templateDir %>/markdown/pre.md',
                        preReplace:
                          [{search: /TITLE/,   replace: 'funkierJS API: By Category (version <%= pkg.version %>)'},
                           {search: /HEADING/, replace: 'funkierJS API (version <%= pkg.version %>)'}]},
        },

        html: {
          byName: {
            dest: 'docs/<%= pkg.version %>/html/index.html',
            pre: '<%= templateDir %>/html/pre.html',
            preReplace: [{search: /TITLE/,   replace: 'funkierJS API (version <%= pkg.version %>)'},
                         {search: /HEADING/, replace: 'funkierJS API (version <%= pkg.version %>)'}],
            post: '<%= templateDir %>/html/post.html'
          },

          byCategory: {
            dest: 'docs/<%= pkg.version %>/html/byCategory.html',
            pre: '<%= templateDir %>/html/pre.html',
            preReplace: [{search: /TITLE/,   replace: 'funkierJS API: By Category (version <%= pkg.version %>)'},
                         {search: /HEADING/, replace: 'funkierJS API: By Category (version <%= pkg.version %>)'}],
            post: '<%= templateDir %>/html/post.html'
          }
        }
      }
    },


    bump: {
      options: {
        files: ['package.json', 'docs/templates/*/categoryV*', 'docs/templates/*/nameV*'],
        commit: true,
        commitMessage: 'Release v%VERSION%',
        createTag: true,
        push: false,
        gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
        globalReplace: true,
        regExp: /(['"]?version['"]?[ ]*:?[ ]*['"]?)(\d+\.\d+\.\d+(-\.\d+)?(-\d+)?)[\d||A-a|.|-]*(['"]?)/i
      }
    },


    watch: {
      lint: {
        files: ['automation/**/*.js', 'customGruntTasks/**.*.js', 'docgen/**/*.js', 'Gruntfile.js', 'lib/**/*.js',
              'test/**/*.js'],
        tasks: ['jshint']
      },

      docVersionGeneration: {
        files: ['automation/generateHelp.js', 'customGruntTasks/generation.js',
                '<%= templateDir %>/*/post*', '<%= templateDir %>/*/pre*', 'docgen/**/*.js',
                'Gruntfile.js'],
        tasks: ['generation:versionedDocs']
      },

      helpGeneration: {
        files: ['automation/generateHelp.js', 'customGruntTasks/generation.js', '<%= templateDir %>/*/post*',
                '<%= templateDir %>/*/pre*', 'docgen/**/*.js',  'Gruntfile.js', 'lib/components/**.*js'],
        tasks: ['generation:docs']
      },

      testGeneration: {
        files: ['automation/generateAPITests.js', 'Gruntfile.js', 'lib/**/*.js'],
        tasks: ['generation:autoTests']
      }
    }
  });


  var tasks = ['jshint', 'watch'];
  tasks.map(function(task) {
    grunt.loadNpmTasks('grunt-contrib-' + task);
  });
  grunt.loadNpmTasks('grunt-bump');


  grunt.loadTasks('customGruntTasks');
  grunt.registerTask('default', ['watch']);
};
