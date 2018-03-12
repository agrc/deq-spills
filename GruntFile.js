module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    var jsFiles = 'src/app/**/*.js';
    var otherFiles = [
        'src/app/**/*.html',
        'src/app/**/*.css',
        'src/embed-demo.html',
        'src/ChangeLog.html',
        'src/web.config'
    ];
    var gruntFile = 'GruntFile.js';
    var internFile = 'tests/intern.js';
    var eslintFiles = [jsFiles, gruntFile, internFile, 'src/EmbeddedMapLoader.js'];
    var replaceFiles = [{
        expand: true,
        flatten: true,
        src: 'src/EmbeddedMapLoader.js',
        dest: 'dist/'
    }];
    var secrets;
    try {
        secrets = grunt.file.readJSON('secrets.json');
    } catch (e) {
        // swallow for build server
        secrets = {
            stageHost: '',
            prodHost: '',
            username: '',
            password: ''
        };
    }
    var replaceCommonPatterns = [{
        match: /\/\/ start replace[\w\W]*\/\/ end replace/,
        replacement: 'document.write(\'<script type=\\\'text/javascript\\\' ' +
            'src=\\\'\' + window.AGRC_server + dojoPath + \'\\\' ' +
            'data-dojo-config="deps:[\\\'app/run\\\']"></script>\');'
    },{
        match: /bootstrap\/dist\/css/,
        replacement: 'bootstrap/css'
    }, {
        match: /<test quad word from src\/secrets\.json>/,
        replacement: secrets.testQuadWord
    }];
    var processhtmlFiles = {'dist/embed-demo.html': ['src/embed-demo.html']};
    var bumpFiles = [
        'package.json',
        'bower.json',
        'src/app/config.js',
        'src/app/package.json'
    ];
    var deployExcludes = [
        '!util/**',
        '!**/*consoleStripped.js',
        '!build-report.txt'
    ];
    var deployDir = 'wwwroot/DEQSpills';

    grunt.initConfig({
        bump: {
            options: {
                files: bumpFiles,
                commitFiles: bumpFiles.concat('src/ChangeLog.html'),
                push: false
            }
        },
        cachebreaker: {
            main: {
                options: {
                    match: [
                        'dojo.js',
                        'app/resources/App.css',
                        'bootstrap/css/bootstrap.css'
                    ]
                },
                files: {
                    src: ['dist/EmbeddedMapLoader.js']
                }
            }
        },
        clean: {
            build: ['dist'],
            deploy: ['deploy']
        },
        compress: {
            options: {
                archive: 'deploy/dist.zip'
            },
            main: {
                files: [{
                    src: ['**'].concat(deployExcludes),
                    dest: './',
                    cwd: 'dist/',
                    expand: true
                }]
            }
        },
        connect: {
            uses_defaults: {}
        },
        copy: {
            main: {
                expand: true,
                cwd: 'src/',
                src: ['ChangeLog.html', 'web.config'],
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
        replace: {
            prod: {
                options: {
                    patterns: [{
                        match: /\/\/ start server replace[\w\W]*\/\/ end server replace/g,
                        replacement: 'window.AGRC_server = \'//mapserv.utah.gov/DEQSpills\';'
                    }].concat(replaceCommonPatterns)
                },
                files: replaceFiles
            },
            stage: {
                options: {
                    patterns: [{
                        match: /\/\/ start server replace[\w\W]*\/\/ end server replace/g,
                        replacement: 'window.AGRC_server = \'//test.mapserv.utah.gov/DEQSpills\';'
                    }].concat(replaceCommonPatterns)
                },
                files: replaceFiles
            },
            dev: {
                options: {
                    patterns: replaceCommonPatterns
                },
                files: replaceFiles
            }
        },
        secrets: secrets,
        sftp: {
            stage: {
                files: {
                    './': 'deploy/dist.zip'
                },
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                files: {
                    './': 'deploy/dist.zip'
                },
                options: {
                    host: '<%= secrets.prodHost %>'
                }
            },
            options: {
                path: './' + deployDir + '/',
                srcBasePath: 'deploy/',
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                showProgress: true,
                readyTimeout: 120000
            }
        },
        sshexec: {
            options: {
                username: '<%= secrets.username %>',
                password: '<%= secrets.password %>',
                readyTimeout: 120000
            },
            stage: {
                command: ['cd ' + deployDir, 'unzip -o dist.zip', 'rm dist.zip'].join(';'),
                options: {
                    host: '<%= secrets.stageHost %>'
                }
            },
            prod: {
                command: ['cd ' + deployDir, 'unzip -o dist.zip', 'rm dist.zip'].join(';'),
                options: {
                    host: '<%= secrets.prodHost %>'
                }
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
    grunt.registerTask('travis', [
        'eslint',
        'connect',
        'jasmine:app'
    ]);

    grunt.registerTask('build-prod', [
        'clean:build',
        'imagemin:dynamic',
        'dojo:prod',
        'copy',
        'processhtml:prod',
        'replace:prod',
        'cachebreaker'
    ]);
    grunt.registerTask('deploy-prod', [
        'clean:deploy',
        'compress:main',
        'sftp:prod',
        'sshexec:prod'
    ]);

    grunt.registerTask('build-stage', [
        'clean:build',
        'imagemin:dynamic',
        'dojo:stage',
        'copy',
        'processhtml:stage',
        'replace:stage',
        'cachebreaker'
    ]);
    grunt.registerTask('deploy-stage', [
        'clean:deploy',
        'compress:main',
        'sftp:stage',
        'sshexec:stage'
    ]);

    grunt.registerTask('build-dev', [
        'clean:build',
        'dojo:prod',
        'imagemin:dynamic',
        'copy',
        'processhtml:dev',
        'replace:dev'
    ]);
};
