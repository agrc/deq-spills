/* jshint camelcase:false */
define([
    'app/App',

    'esri/symbols/SimpleMarkerSymbol',

    'dojo/_base/Color',


    'dojo/domReady!'

],

function (
    App,

    SimpleMarkerSymbol,

    Color
    ) {
    window.AGRCGLOBAL = {
        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '2.1.1',

        // apiKey: String
        //      Key for api.mapserv.utah.gov services
        //      Passed in as a parameter to the app
        apiKey: null,

        // urls: Object
        urls: {
            mapservice: window.AGRC_server.split('/').slice(0, 3).join('/') +
                '/arcgis/rest/services/DEQSpills/MapServer'
        },

        queries: [
            ['BOUNDARIES.ZipCodes', ['ZIP5', 'NAME'], ['ZIP', 'ZIPCITY']],
            ['BOUNDARIES.Municipalities', ['NAME'], ['CITY']],
            ['BOUNDARIES.Counties', ['NAME'], ['COUNTY']],
            ['CADASTRE.PLSSSections_GCDB',
                ['LABEL', 'SNUM', 'BASEMERIDIAN'],
                ['TOWNSHIP/RANGE', 'SECTION', 'BASEMERIDIAN']
            ]
        ],

        projections: {
            utm: '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
        },

        deqLayerFields: ['DERRID', 'SITEDESC', 'ST_KEY'],

        symbol: new SimpleMarkerSymbol()
            .setStyle(SimpleMarkerSymbol.STYLE_CIRCLE)
            .setColor(new Color([255, 255, 0])),

        zipCityHelpText: 'For city or zip code only searches, see "Map Search..." above',
        outsideUtahMsg: 'No data is returned for points outside of the state of Utah!'
    };

    window.AGRCMap = App;

    if (window.agrcOnLoad) {
        window.agrcOnLoad();
    }
});