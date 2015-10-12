/* jshint camelcase: false */
module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

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
    var replaceCommonPatterns = [{
        match: /\/\/ start replace[\w\W]*\/\/ end replace/,
        replacement: 'document.write(\'<script type=\\\'text/javascript\\\' ' +
            'src=\\\'\' + window.AGRC_server + \'/dojo/dojo.js\\\'' +
            'data-dojo-config="deps:[\\\'app/run\\\']"></script>\');'
    },{
        match: /bootstrap\/dist\/css/,
        replacement: 'bootstrap/css'
    }];
    var processhtmlFiles = {'dist/embed-demo.html': ['src/embed-demo.html']};

    grunt.initConfig({
        clean: ['dist'],
        connect: {
            uses_defaults: {}
        },
        copy: {
            main: {
                src: 'src/ChangeLog.html',
                dest: 'dist/ChangeLog.html'
            }
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
        pkg: grunt.file.readJSON('package.json'),
        processhtml: {
            options: {},
            prod: {files: processhtmlFiles},
            stage: {files: processhtmlFiles},
            dev: {files: processhtmlFiles}
        },
        replace: {
            prod: {
                options: {
                    patterns: [{
                        match: /\/\/ start server replace[\w\W]*\/\/ end server replace/g,
                        replacement: 'window.AGRC_server = \'http://mapserv.utah.gov/DEQSpills\';'
                    }].concat(replaceCommonPatterns)
                },
                files: replaceFiles
            },
            stage: {
                options: {
                    patterns: [{
                        match: /\/\/ start server replace[\w\W]*\/\/ end server replace/g,
                        replacement: 'window.AGRC_server = \'http://test.mapserv.utah.gov/DEQSpills\';'
                    }].concat(replaceCommonPatterns)
                },
                files: replaceFiles
            },
            dev: {
                options: {
                    patterns: replaceCommonPatterns
                },
                files: replaceFiles
            },
            esri_slurp: {}
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
        }
    });

    grunt.registerTask('default', ['jasmine:app:build', 'jshint', 'connect', 'watch']);
    grunt.registerTask('travis', ['esri_slurp', 'jshint', 'connect', 'jasmine:app']);
    grunt.registerTask('build-prod',
        ['clean', 'dojo:app', 'imagemin:dynamic', 'copy', 'processhtml:prod', 'replace:prod']);
    grunt.registerTask('build-stage',
        ['clean', 'dojo:app', 'imagemin:dynamic', 'copy', 'processhtml:stage', 'replace:stage']);
    grunt.registerTask('build-dev',
        ['clean', 'dojo:app', 'imagemin:dynamic', 'copy', 'processhtml:dev', 'replace:dev']);
};
