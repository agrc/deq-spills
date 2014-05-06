/* jshint camelcase: false */
module.exports = function(grunt) {
    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/embed-demo.html',
        'src/ChangeLog.html'
    ];
    var gruntFile = 'GruntFile.js';
    var internFile = 'tests/intern.js';
    var jshintFiles = [jsFiles, gruntFile, internFile, 'src/matchers/**/*.js'];
    var replaceFiles = [{
        expand: true,
        flatten: true,
        src: 'src/EmbeddedMapLoader.js',
        dest: 'dist/'
    }];
    var replaceCommonPattern = {
        match: /\/\/ start replace[\w\W]*\/\/ end replace/,
        replacement: 'document.write(\'<script type=\\\'text/javascript\\\' ' +
            'src=\\\'\' + server + \'/dojo/dojo.js\\\'data-dojo-config="deps:[\\\'app/run\\\']"></script>\');'
    };
    var processhtmlFiles = {'dist/embed-demo.html': ['src/embed-demo.html']};

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            app: {
                src: ['src/app/run.js'],
                options: {
                    specs: ['src/app/**/Spec*.js', 'src/matchers/**/Spec*.js'],
                    vendor: [
                        'src/app/tests/jasmineTestBootstrap.js',
                        'src/dojo/dojo.js'
                    ],
                    host: 'http://localhost:8000'
                }
            }
        },
        jshint: {
            files: jshintFiles,
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            jshint: {
                files: jshintFiles,
                tasks: ['jshint', 'jasmine:app:build']
            },
            src: {
                files: jshintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            }
        },
        connect: {
            uses_defaults: {}
        },
        dojo: {
            app: {
                options: {
                    dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                    releaseDir: '../dist',
                    require: 'src/app/run.js', // Optional: Module to require for the build (Default: nothing)
                    basePath: './src',
                    profile: 'profiles/build.profile.js'
                }
            }
        },
        imagemin: { // Task
            dynamic: { // Another target
                options: { // Target options
                    optimizationLevel: 3
                },
                files: [{
                    expand: true, // Enable dynamic expansion
                    cwd: 'src/', // Src matches are relative to this path
                    src: ['**/*.{png,jpg,gif}'], // Actual patterns to match
                    dest: 'dist/' // Destination path prefix
                }]
            }
        },
        copy: {
            main: {
                src: 'src/ChangeLog.html',
                dest: 'dist/ChangeLog.html'
            }
        },
        processhtml: {
            options: {},
            prod: {files: processhtmlFiles},
            stage: {files: processhtmlFiles},
            dev: {files: processhtmlFiles}
        },
        clean: ['dist'],
        replace: {
            prod: {
                options: {
                    patterns: [{
                        match: /\/\/ start server replace[\w\W]*\/\/ end server replace/g,
                        replacement: 'var server = \'http://mapserv.utah.gov/DEQSpills\';'
                    }].concat(replaceCommonPattern)
                },
                files: replaceFiles
            },
            stage: {
                options: {
                    patterns: [{
                        match: /\/\/ start server replace[\w\W]*\/\/ end server replace/g,
                        replacement: 'var server = \'http://test.mapserv.utah.gov/DEQSpills\';'
                    }].concat(replaceCommonPattern)
                },
                files: replaceFiles
            },
            dev: {
                options: {
                    patterns: [replaceCommonPattern]
                },
                files: replaceFiles
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-dojo');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-replace');

    grunt.registerTask('default', ['jasmine:app:build', 'jshint', 'connect', 'watch']);
    grunt.registerTask('travis', ['jshint', 'connect', 'jasmine:app']);
    grunt.registerTask('build',
        ['clean', 'dojo:app', 'imagemin:dynamic', 'copy', 'processhtml:prod', 'replace:prod']);
    grunt.registerTask('stage-build',
        ['clean', 'dojo:app', 'imagemin:dynamic', 'copy', 'processhtml:stage', 'replace:stage']);
    grunt.registerTask('dev-build',
        ['clean', 'dojo:app', 'imagemin:dynamic', 'copy', 'processhtml:dev', 'replace:dev']);
};