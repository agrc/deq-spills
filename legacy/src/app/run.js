(function () {
    var config = {
        baseUrl: (
            typeof window !== 'undefined' &&
            window.dojoConfig &&
            window.dojoConfig.isJasmineTestRunner
        ) ? '/src' : './',
        packages: [
            'agrc',
            'app',
            'dgrid',
            'dijit',
            'dojo',
            'dojox',
            'esri',
            'ijit',
            'moment',
            'put-selector',
            'xstyle',
            {
                name: 'layer-selector',
                location: 'layer-selector',
                main: 'LayerSelector'
            }, {
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
                location: 'proj4/dist',
                main: 'proj4-src'
            }, {
                name: 'es5shim',
                location: 'es5-shim',
                main: 'es5-shim'
            }
        ]
    };
    require(config, [
        'esri/config',

        'jquery',

        'app/config',
        'dojo/domReady!'
    ], function (esriConfig) {
        esriConfig.defaults.io.corsEnabledServers.push('mapserv.utah.gov');

        if (window.agrcOnLoad) {
            window.agrcOnLoad();
        }
    });
}());
