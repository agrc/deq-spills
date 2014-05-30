define([
    'app/App'

],

function (
    App
    ) {
    window.AGRCGLOBAL = {
        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '0.1.0',

        // apiKey: String
        //      Key for api.mapserv.utah.gov services
        //      Passed in as a parameter to the app
        apiKey: null,

        // urls: Object
        urls: {
            mapservice: '/arcgis/rest/services/DEQSpills/MapServer'
        },

        queries: [
            ['BOUNDARIES.ZipCodes', ['ZIP5'], ['ZIP']],
            ['BOUNDARIES.Municipalities', ['NAME'], ['CITY']],
            ['BOUNDARIES.Counties', ['NAME'], ['COUNTY']],
            ['CADASTRE.PLSSSections_GCDB', ['TOWNSHIP', 'RANGE', 'SECTION'], ['TOWNSHIP', 'RANGE', 'SECTION']]
        ],

        projections: {
            utm: '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
        }
    };

    window.AGRCMap = App;

    if (window.agrcOnLoad) {
        window.agrcOnLoad();
    }
});