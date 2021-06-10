module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/index.html',
        'src/ChangeLog.html'
    ];
    var gruntFile = 'GruntFile.js';
    var eslintFiles = [jsFiles, gruntFile, 'src/EmbeddedMapLoader.js'];
    var processhtmlFiles = {'dist/index.html': ['src/index.html']};
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/config.js',
        'src/app/package.json'
    ];

    grunt.initConfig({
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat('src/ChangeLog.html'),
                push: false
            }
        },
        clean: {
            build: ['dist']
        },
        connect: {
            uses_defaults: {}
        },
        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: ['ChangeLog.html', 'EmbeddedMapLoader.js'],
                dest: 'dist/'
            }
        },
        dojo: {
            prod: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/prod.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            stage: {
                options: {
                    // You can also specify options to be used in all your tasks
                    profiles: ['profiles/stage.build.profile.js', 'profiles/build.profile.js'] // Profile for build
                }
            },
            options: {
                dojo: 'src/dojo/dojo.js', // Path to dojo.js file in dojo source
                releaseDir: '../dist',
                require: 'src/app/run.js', // Optional: Module to require for the build (Default: nothing)
                basePath: './src'
            }
        },
        imagemin: {
            dynamic: {
                options: {
                    optimizationLevel: 3
                },
                files: [{
                    expand: true,
                    cwd: 'src/',
                    // exclude tests because some images in dojox throw errors
                    src: ['**/*.{png,jpg,gif}', '!**/tests/**/*.*'],
                    dest: 'src/'
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
        eslint: {
            main: {
                src: eslintFiles
            },
            options: {
                configFile: '.eslintrc'
            }
        },
        pkg: grunt.file.readJSON('package.json'),
        processhtml: {
            options: {},
            prod: {files: processhtmlFiles},
            stage: {files: processhtmlFiles},
            dev: {files: processhtmlFiles}
        },
        uglify: {
            options: {
                preserveComments: false,
                sourceMap: true,
                compress: {
                    drop_console: true,
                    passes: 2,
                    dead_code: true
                }
            },
            stage: {
                options: {
                    compress: {
                        drop_console: false
                    }
                },
                src: ['dist/dojo/dojo.js'],
                dest: 'dist/dojo/dojo.js'
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'dist',
                    src: ['**/*.js', '!proj4/**/*.js'],
                    dest: 'dist'
                }]
            }
        },
        watch: {
            eslint: {
                files: eslintFiles,
                tasks: ['eslint', 'jasmine:app:build']
            },
            src: {
                files: eslintFiles.concat(otherFiles),
                options: {
                    livereload: true
                }
            }
        }
    });

    grunt.registerTask('default', [
        'jasmine:app:build',
        'eslint',
        'connect',
        'watch'
    ]);
    grunt.registerTask('test', [
        'eslint',
        'connect',
        'jasmine:app'
    ]);

    grunt.registerTask('build-prod', [
        'clean:build',
        'imagemin:dynamic',
        'dojo:prod',
        'uglify:prod',
        'copy',
        'processhtml:prod'
    ]);

    grunt.registerTask('build-stage', [
        'clean:build',
        'imagemin:dynamic',
        'dojo:stage',
        'uglify:stage',
        'copy',
        'processhtml:stage'
    ]);

    grunt.registerTask('build-dev', [
        'clean:build',
        'dojo:prod',
        'imagemin:dynamic',
        'copy',
        'processhtml:dev'
    ]);
};
