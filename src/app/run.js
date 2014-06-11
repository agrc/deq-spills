(function () {
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
            ) ? '/src': './',
        packages: [
            'agrc',
            'app',
            'dijit',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            {
                name: 'spin',
                location: 'spinjs',
                main: 'spin'
            }, {
                name: 'jquery',
                location: 'jquery/dist',
                main: 'jquery'
            }, {
                name: 'bootstrap',
                location: 'bootstrap/dist',
                main: 'js/bootstrap'
            }, {
                name: 'proj4',
                location: 'proj4',
                main: 'proj4'
            }, {
                name: 'es5shim',
                location: 'es5-shim',
                main: 'es5-shim'
            }
        ]
    };
    require(config, [
        'esri/config',

        'app/config',
        'dojo/domReady!'
    ],

    function (esriConfig) {
        esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');
    });
})();