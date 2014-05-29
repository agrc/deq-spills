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
                location: 'bootstrap/dist/js',
                main: 'bootstrap'
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