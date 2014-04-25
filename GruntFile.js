module.exports = function(grunt) {
    'use strict';

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        jasmine: {
            app: {
                src: ['src/EmbeddedMapLoader.js'],
                options: {
                    specs: [
                        'src/app/tests/spec/*.js',
                        'src/agrc/modules/tests/spec/SpecSGIDQuery.js'
                    ]
                }
            }
        },
        jshint: {
            files: ['src/app/**/*.js'],
            options: {
                jshintrc: '.jshintrc'
            }
        },
        watch: {
            files: [
                'src/app/**/*.js',
                '/src/agrc/modules/tests/spec/SpecSGIDQuery.js'
            ],
            tasks: ['jasmine:app:build', 'jshint']
        },
        connect: {
            uses_defaults: {}
        }
    });

    grunt.loadNpmTasks('grunt-contrib-jasmine');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    grunt.registerTask('default', ['jasmine:app:build', 'jshint', 'connect', 'watch']);
};