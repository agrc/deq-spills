define([
    'app/App',

    'dojo/has',
    'dojo/request/xhr',
    'dojo/_base/Color',

    'esri/config',
    'esri/symbols/SimpleMarkerSymbol',

    'dojo/domReady!'
], function (
    App,

    has,
    xhr,
    Color,

    esriConfig,
    SimpleMarkerSymbol
) {
    esriConfig.defaults.io.corsEnabledServers.push('https://gis.trustlands.utah.gov');
    esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');

    var SITEADDRES = 'SITEADDRES';
    var SITENAME = 'SITENAME';
    var FAC_NAME = 'FAC_NAME';
    var LOCNAME = 'LOCNAME';
    var Title_EventName = 'Title_EventName';
    var FAC_ADDRES = 'FAC_ADDRES';
    var LOCSTR = 'LOCSTR';
    var Address_Location = 'Address_Location';
    var DERRID = 'DERRID';
    window.AGRCGLOBAL = {
        // app: app.App
        //      global reference to App
        app: null,

        // version: String
        //      The version number.
        version: '2.7.3',

        // apiKey: String
        //      Key for api.mapserv.utah.gov services
        //      Passed in as a parameter to the app
        apiKey: null,

        // urls: Object
        urls: {
            mapservice: window.AGRC_server.split('/').slice(0, 3).join('/') + '/arcgis/rest/services/DEQSpills/MapService/MapServer',
            landOwnership: 'https://gis.trustlands.utah.gov/server/rest/services/Ownership/UT_SITLA_Ownership_LandOwnership_WM/MapServer/0',
            referenceLayers: window.AGRC_server.split('/').slice(0, 3).join('/') + '/arcgis/rest/services/DEQSpills/ReferenceLayers/MapServer'
        },

        // labelsMinScale: Number
        //      The minimum scale beyond which the labels will not be shown
        labelsMinScale: 50000,

        zoomLevel: 12,

        queries: [
            ['BOUNDARIES.ZipCodes', ['ZIP5', 'NAME'], ['ZIP', 'ZIPCITY']],
            ['BOUNDARIES.Municipalities', ['NAME'], ['CITY']],
            ['BOUNDARIES.Counties', ['NAME'], ['COUNTY']],
            ['CADASTRE.PLSSSections_GCDB',
                ['LABEL', 'SNUM', 'BASEMERIDIAN'],
                ['TOWNSHIP/RANGE', 'SECTION', 'BASEMERIDIAN']
            ],
            ['CADASTRE.LandOwnership', ['AGENCY'], ['OWNER_AGENCY']]
        ],

        projections: {
            utm: '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
        },

        deqLayerFields: [
            DERRID,
            'SITEDESC',
            'ST_KEY',
            SITENAME,
            SITEADDRES,
            FAC_NAME,
            LOCNAME,
            Title_EventName,
            FAC_ADDRES,
            LOCSTR,
            Address_Location
        ],

        fields: {
            SITENAME: SITENAME,
            SITEADDRES: SITEADDRES
        },

        // all others layers are SITENAME
        nonStandardSiteNameLU: {
            7: FAC_NAME,
            8: FAC_NAME,
            9: LOCNAME,
            11: Title_EventName
        },

        // all other layers are SITEADDRES
        nonStandardSiteAddressLU: {
            7: FAC_ADDRES,
            8: FAC_ADDRES,
            9: LOCSTR,
            11: Address_Location
        },

        labelsLU: {
            sitename: 'SITENAME',
            siteid: DERRID,
            siteaddress: 'SITEADDRES'
        },

        symbol: new SimpleMarkerSymbol()
            .setStyle(SimpleMarkerSymbol.STYLE_CIRCLE)
            .setColor(new Color([255, 255, 0])),

        zipCityHelpText: 'For city or zip code only searches, see "Map Search..." above',
        outsideUtahMsg: 'No data is returned for points outside of the state of Utah!',

        topics: {
            labelLayer: 'deq-spills/labelLayer'
        }
    };

    if (has('agrc-build') === 'prod') {
        window.AGRCGLOBAL.quadWord = 'result-table-secure-antenna';
    } else if (has('agrc-build') === 'stage') {
        window.AGRCGLOBAL.quadWord = window.AGRC_testQuadWord;
    } else {
        xhr(require.baseUrl + 'secrets.json', {
            handleAs: 'json',
            sync: true
        }).then(function (secrets) {
            window.AGRCGLOBAL.quadWord = secrets.quadWord;
        }, function () {
            throw 'Error getting secrets!';
        });
    }

    window.AGRCMap = App;
});
