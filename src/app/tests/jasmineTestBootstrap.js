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
/* jshint -W106 */
window.AGRC_server = 'http://test.mapserv.utah.gov/DEQSpills/blah';
/* jshint +W106 */

// for jasmine-favicon-reporter
// jasmine.getEnv().addReporter(new JasmineFaviconReporter());
