module.exports = function(grunt) {

  //INITIAL CONFIGURATION
  grunt.initConfig({
    dirs: grunt.file.readJSON('config/cfg.json'),
    paths: {
      export: {
        all: '<%= dirs.export %>',
        css: '<%= dirs.export %>/css',
        font: '<%= dirs.export %>/fonts',
        img: '<%= dirs.export %>/img',
        js: '<%= dirs.export %>/js',
        svg: '<%= dirs.export %>/svg'
      }
    },
    clean: {
      export: [
        '<%= paths.export.all %>/**/*',
        '<%= paths.export.all %>/*',
        '!<%= paths.export.all %>/json'
      ],
      css: ['<%= paths.export.css %>/*'],
      html: [ '<%= paths.export.all %>/*.html'],
      img: ['<%= paths.export.img %>/*'],
      js: ['<%= paths.export.js %>/*'],
      minJs: ['<%= paths.export.js %>/app.anno.js','<%= paths.export.js %>/common.anno.js']
    },
    concat: {
      js: {src: ['src/dev/javascripts/common/*.js'],dest: '<%= paths.export.js %>/common.js'}
    },
    connect: {
      server: {options: { port: 7777,base: '<%= paths.export.all %>' }}
    },
    concurrent: {
      options: {logConcurrentOutput: true},
      watch: {tasks: ['watch:cssDev','watch:htmlDev','watch:jsDev']}
    },
    copy: {
      libFont: {
        expand: true, flatten: true,
        src: [
          'src/lib/fonts/*',
          'bower_components/bootstrap/dist/fonts/*',
          'bower_components/material-design-icons/iconfont/MaterialIcons-Regular.*'
        ],
        dest: '<%= paths.export.font %>', filter: 'isFile'
      },
      libJs: {
        expand: true, flatten: true,
        src: [
          'src/lib/javascripts/*',
          'bower_components/jquery/dist/jquery.min.js',
          'bower_components/jquery-ui/jquery-ui.min.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/angular-resource/angular-resource.min.js',
          'bower_components/angular-sanitize/angular-sanitize.min.js',
          'bower_components/bootstrap/dist/js/bootstrap.min.js',
          'bower_components/arrive/minified/arrive.min.js',
          'bower_components/highcharts/highstock.js',
          'bower_components/highcharts/modules/exporting.js',
          'bower_components/highcharts-ng/dist/highcharts-ng.min.js',
          'bower_components/angular-ui-sortable/sortable.min.js',
          'bower_components/ng-file-upload/ng-file-upload.min.js',
          'bower_components/angular-tree-control/angular-tree-control.js',
          'bower_components/angular-tree-control/tree-control.js'
        ],
        dest: '<%= paths.export.js %>', filter: 'isFile'},
      libCss: {
        expand: true, flatten: true,
        src: [
          'src/lib/stylesheets/*',
          'bower_components/bootstrap/dist/css/bootstrap.min.css',
          'bower_components/angular-tree-control/css/tree-control.css',
          'bower_components/angular-tree-control/css/tree-control-attribute.css'
        ],
        dest: '<%= paths.export.css %>', filter: 'isFile'},
      js: {expand: true, flatten: true, src: ['src/dev/javascripts/pages/*'], dest: '<%= paths.export.js %>', filter: 'isFile'},
      img: {
        expand: true, flatten: true,
        src: [
          'src/dev/images/*',
          'bower_components/angular-tree-control/images/*'
        ],
        dest: '<%= paths.export.img %>', filter: 'isFile'
      },
      svg: {expand: true, flatten: true, src: ['src/dev/vectors/*'], dest: '<%= paths.export.svg %>', filter: 'isFile'}
    },
    haml: {
      build: {
        options: {language: 'coffee'},
        files:
          grunt.file.expandMapping(['src/dev/markups/*.haml'], '<%= dirs.export %>/', {
          rename: function(base, path) { return base + path.replace('src/dev/markups/','').replace(/\.haml$/,'.html'); }
        })
      }
    },
    imagemin: {
      all: {
        files: [{
          expand: true, flatten: true,
          src: [
            'src/dev/images/*.{jpg,gif,png}',
            'bower_components/angular-tree-control/images/*'
          ],
          dest: '<%= paths.export.img %>'
        }]
      }
    },
    jshint: {
      options: {
        esversion: 6,
        reporter: require('jshint-stylish')
      },
      dev: ['src/dev/javascripts/common/*.js','src/dev/javascripts/pages/*.js']
    },
    ngAnnotate: {
      options: {singleQuotes: true},
      export: { files: {
        '<%= paths.export.js %>/app.anno.js':['<%= paths.export.js %>/app.js'],
        '<%= paths.export.js %>/common.anno.js':['<%= paths.export.js %>/common.js']
      }}
    },
    sass: {
      dev: {
        files: {'<%= paths.export.css %>/style.css' : 'src/dev/stylesheets/application.sass'},
        options: {sourceMap: true, style: 'expanded'}
      },
      export: {
        files: {'<%= paths.export.css %>/style.css' : 'src/dev/stylesheets/application.sass'},
        options: {sourceMap: false, style: 'expanded'}
      }
    },
    sasslint: {
      options: {configFile: 'config/grunt-sass-lint.yml'},
      target: ['src/dev/stylesheets/common/*.sass','src/dev/stylesheets/pages/*.sass']
    },
    uglify: {
      export: { files: {
        '<%= paths.export.js %>/app.js':['<%= paths.export.js %>/app.anno.js'],
        '<%= paths.export.js %>/common.js':['<%= paths.export.js %>/common.anno.js']
      }}
    },
    watch: {
      cssDev: {
        files: ['src/dev/stylesheets/**/*','src/dev/stylesheets/application.sass'], tasks: ['watch-css']
      },
      htmlDev: {
        files: ['src/dev/markups/*','src/dev/markups/**/*'], tasks: ['watch-html']
      },
      jsDev:{
        files: ['src/dev/javascripts/**/*'], tasks: ['watch-js']
      }
    }
  });

  grunt.loadNpmTasks("grunt-concurrent");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-contrib-connect");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-imagemin");
  grunt.loadNpmTasks("grunt-contrib-jshint");
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-haml");
  grunt.loadNpmTasks('grunt-ng-annotate');
  grunt.loadNpmTasks("grunt-sass");
  grunt.loadNpmTasks("grunt-sass-lint");

  // LINT
  grunt.registerTask('lint',['jshint:dev']);

  //COPY-LIB
  grunt.registerTask('copy-lib',['copy:libFont','copy:libJs','copy:libCss']);

  // MOVE
  grunt.registerTask('move-js',['copy:js','concat:js']);
  grunt.registerTask('move',['copy-lib','move-js','sass:dev','haml:build','copy:img','copy:svg']);
  grunt.registerTask('move-rel',['copy-lib','move-js','sass:export','haml:build','imagemin:all','copy:svg']);

  //WATCH
  grunt.registerTask('watch-css',['clean:css','copy:libCss','sass:dev']);
  grunt.registerTask('watch-html',['clean:html','haml:build']);
  grunt.registerTask('watch-js',['jshint:dev','clean:js','copy:libJs','move-js']);
  grunt.registerTask('watch-all',['watch:cssDev','watch:htmlDev','watch:jsDev']);

  // PREFINAL
  grunt.registerTask('dev-build',['clean:export','move']);
  grunt.registerTask('rel-build',['clean:export','move-rel']);
  grunt.registerTask('dev-mode',['connect','concurrent:watch']);
  grunt.registerTask('rel-mode',['ngAnnotate:export','uglify:export','clean:minJs']);

  //FINAL TASK
  grunt.registerTask('dev',['lint','dev-build','dev-mode']);
  grunt.registerTask('rel',['lint','rel-build','rel-mode']);
};
