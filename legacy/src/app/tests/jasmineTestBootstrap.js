var dojoConfig = {  // eslint-disable-line no-unused-vars
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
