var amdTag = function (filename, mid) {
    return (/.*\.js$/).test(filename);
};
/* eslint no-unused-vars: 0 */
var profile = {
    basePath: '../src',
    action: 'release',
    cssOptimize: 'comments',
    mini: true,
    optimize: false,
    layerOptimize: false,
    selectorEngine: 'acme',
    layers: {
        'dojo/dojo': {
            include: [
                'dojo/i18n',
                'dojo/domReady',
                'app/run',
                'dojox/gfx/filters',
                'dojox/gfx/svg',
                'dojox/gfx/svgext',
                'esri/layers/LabelLayer',
                'esri/layers/VectorTileLayerImpl',
                'esri/PopupInfo',
                'esri/tasks/RelationshipQuery',
                'xstyle/core/load-css'
            ],
            includeLocales: ['en-us'],
            customBase: true,
            boot: true
        }
    },
    staticHasFeatures: {
        'dojo-trace-api': 0,
        'dojo-log-api': 0,
        'dojo-publish-privates': 0,
        'dojo-sync-loader': 0,
        'dojo-xhr-factory': 0,
        'dojo-test-sniff': 0
    },
    packages: [{
        name: 'proj4',
        resourceTags: {
            amd: amdTag
        }
    }, {
        name: 'moment',
        location: 'moment',
        main: 'moment',
        trees: [
          // don't bother with .hidden, tests, min, src, and templates
          ['.', '.', /(\/\.)|(~$)|(test|txt|src|min|templates)/]
        ],
        resourceTags: {
            amd: function (filename) {
                return /\.js$/.test(filename);
            }
        }
    }, 'mustache', 'dgrid1', 'dstore'],
    // this is to make sure that the widget templates get built into the layer file.
    userConfig: {
        packages: ['app', 'dijit', 'dojox', 'agrc', 'ijit', 'esri', 'layer-selector']
    }
};
