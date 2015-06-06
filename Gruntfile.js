module.exports = function(grunt) {

  var filesToLint = ['automation/**/*.js', 'customGruntTasks/**.*.js', 'docgen/**/*.js', 'Gruntfile.js', 'lib/**/*.js',
                     'test/**/*.js'];

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),


    templateDir: 'docs/templates',


    jshint: {
      all: {
        src: filesToLint
      },

      options: {
        newcap: false
      }
    },


    browserify: {
      standalone: {
        src: ['lib/funkier.js'],
        dest: 'dist/funkierJS.js',
        options:  {
          browserifyOptions: {
            standalone: 'funkierJS'
          }
        }
      },

      standalonetests: {
        src: ['browser_test/testsuite-raw.js'],
        dest: 'browser_test/testsuite.js',
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
            listNames: true,
            pre: '<%= templateDir %>/html/pre.html',
            preReplace: [{search: /TITLE/,   replace: 'funkierJS API'},
                         {search: /HEADING/, replace: 'funkierJS API'}],
            post: '<%= templateDir %>/html/post.html'
          },

          byCategory: {
            dest: 'docs/html/byCategory.html',
            listNames: true,
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
            listNames: true,
            pre: '<%= templateDir %>/html/pre.html',
            preReplace: [{search: /TITLE/,   replace: 'funkierJS API (version <%= pkg.version %>)'},
                         {search: /HEADING/, replace: 'funkierJS API (version <%= pkg.version %>)'}],
            post: '<%= templateDir %>/html/post.html'
          },

          byCategory: {
            dest: 'docs/<%= pkg.version %>/html/byCategory.html',
            listNames: true,
            pre: '<%= templateDir %>/html/pre.html',
            preReplace: [{search: /TITLE/,   replace: 'funkierJS API: By Category (version <%= pkg.version %>)'},
                         {search: /HEADING/, replace: 'funkierJS API: By Category (version <%= pkg.version %>)'}],
            post: '<%= templateDir %>/html/post.html'
          }
        }
      }
    },


    uglify: {
      build: {
        files: {
          'dist/funkierJS-min.js': ['dist/funkierJS.js']
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


    copy: {
      css: {
        expand: true,
        src: 'docs/css/*',
        flatten: true,
        dest: 'website/css'
      },

      docs: {
        expand: true,
        src: 'docs/html/*.html',
        flatten: true,
        dest: 'website/docs/'
      },

      versionedDocs: {
        expand: true,
        src: ['docs/<%= pkg.version %>/html/*.html'],
        flatten: true,
        dest: 'website/docs/<%= pkg.version %>/'
      }
    },


    watch: {
      build: {
        files: filesToLint,
        tasks: ['newer:jshint', 'browserify']
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

      minification: {
        files: ['dist/funkierJS.js'],
        tasks: ['uglify']
      },

      testGeneration: {
        files: ['automation/generateAPITests.js', 'Gruntfile.js', 'lib/**/*.js'],
        tasks: ['generation:autoTests']
      },

      websiteCSS: {
        files: ['docs/css/*'],
        tasks: ['copy:css']
      },

      websiteDocs: {
        files: ['docs/html/*.html'],
        tasks: ['copy:docs']
      },

      websiteVersionedDocs: {
        files: ['docs/<%= pkg.version %>/html/*.html'],
        tasks: ['copy:versionedDocs']
      }
    }
  });


  var tasks = ['copy', 'jshint', 'uglify', 'watch'];
  tasks.map(function(task) {
    grunt.loadNpmTasks('grunt-contrib-' + task);
  });
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-newer');


  grunt.loadTasks('customGruntTasks');
  grunt.registerTask('default', ['watch']);
};
