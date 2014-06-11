/* global JasmineFaviconReporter */
/*jshint unused:false*/
var dojoConfig = {
    // isDebug: false,
    isJasmineTestRunner: true,
    packages: [{
        name: 'matchers',
        location: 'matchers/src'
    },{
        name: 'stubmodule',
        location: 'stubmodule/src',
        main: 'stub-module'
    }],
    has: {
        'dojo-undef-api': true
    }
};

window.AGRCGLOBAL = {
    urls: {
        mapservice: 'blah'
    }
};

// for jasmine-favicon-reporter
// jasmine.getEnv().addReporter(new JasmineFaviconReporter());