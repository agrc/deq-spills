const config = {
  DEFAULT_ZOOM_LEVEL: 16,
  MIN_DESKTOP_WIDTH: 768,
  WEB_MERCATOR_WKID: 3857,
  MARKER_FILL_COLOR: [234, 202, 0, 0.5] as [number, number, number, number],
  MARKER_OUTLINE_COLOR: [77, 42, 84, 1] as [number, number, number, number],
  URL: {
    landownership: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership/FeatureServer/0',
    waterSystems:
      'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Public_Water_System_Sources/FeatureServer/0',
  },
};

export default config;

// old config
// define([
//     'app/App',

//     'dojo/has',
//     'dojo/request/xhr',
//     'dojo/_base/Color',

//     'esri/config',
//     'esri/symbols/SimpleMarkerSymbol',

//     'dojo/domReady!'
// ], function (
//     App,

//     has,
//     xhr,
//     Color,

//     esriConfig,
//     SimpleMarkerSymbol
// ) {
//     esriConfig.defaults.io.corsEnabledServers.push('gis.trustlands.utah.gov');
//     esriConfig.defaults.io.corsEnabledServers.push('api.mapserv.utah.gov');
//     esriConfig.defaults.io.corsEnabledServers.push('discover.agrc.utah.gov');

//     var SITEADDRES = 'SITEADDRES';
//     var SITENAME = 'SITENAME';
//     var FAC_NAME = 'FAC_NAME';
//     var LOCNAME = 'LOCNAME';
//     var Title_EventName = 'Title_EventName';
//     var FAC_ADDRES = 'FAC_ADDRES';
//     var LOCSTR = 'LOCSTR';
//     var Address_Location = 'Address_Location';
//     var DERRID = 'DERRID';
//     window.AGRCGLOBAL = {
//         // app: app.App
//         //      global reference to App
//         app: null,

//         // version: String
//         //      The version number.
//         version: '2.7.3',

//         // apiKey: String
//         //      Key for api.mapserv.utah.gov services
//         //      Passed in as a parameter to the app
//         apiKey: null,

//         // urls: Object
//         urls: {
//             mapservice: 'https://mapserv.utah.gov/arcgis/rest/services/DEQSpills/MapService/MapServer',
//             landOwnership: 'https://gis.trustlands.utah.gov/hosting/rest/services/Hosted/Land_Ownership_WM_VectorTile/VectorTileServer',
//             referenceLayers: 'https://mapserv.utah.gov/arcgis/rest/services/DEQSpills/ReferenceLayers/MapServer'
//         },

//         // labelsMinScale: Number
//         //      The minimum scale beyond which the labels will not be shown
//         labelsMinScale: 50000,

//         zoomLevel: 12,

//         queries: [
//             ['boundaries.zip_code_areas', ['zip5', 'name'], ['ZIP', 'ZIPCITY']],
//             ['boundaries.municipal_boundaries', ['name'], ['CITY']],
//             ['boundaries.county_boundaries', ['name'], ['COUNTY']],
//             ['cadastre.plss_sections_gcdb',
//                 ['label', 'snum', 'basemeridian'],
//                 ['TOWNSHIP/RANGE', 'SECTION', 'BASEMERIDIAN']
//             ],
//             ['cadastre.land_ownership', ['agency'], ['OWNER_AGENCY']]
//         ],

//         projections: {
//             utm: '+proj=utm +zone=12 +ellps=GRS80 +datum=NAD83 +units=m +no_defs'
//         },

//         deqLayerFields: [
//             DERRID,
//             'SITEDESC',
//             'ST_KEY',
//             SITENAME,
//             SITEADDRES,
//             FAC_NAME,
//             LOCNAME,
//             Title_EventName,
//             FAC_ADDRES,
//             LOCSTR,
//             Address_Location
//         ],

//         fields: {
//             SITENAME: SITENAME,
//             SITEADDRES: SITEADDRES
//         },

//         // all others layers are SITENAME
//         nonStandardSiteNameLU: {
//             7: FAC_NAME,
//             8: FAC_NAME,
//             9: LOCNAME,
//             11: Title_EventName
//         },

//         // all other layers are SITEADDRES
//         nonStandardSiteAddressLU: {
//             7: FAC_ADDRES,
//             8: FAC_ADDRES,
//             9: LOCSTR,
//             11: Address_Location
//         },

//         labelsLU: {
//             sitename: 'SITENAME',
//             siteid: DERRID,
//             siteaddress: 'SITEADDRES'
//         },

//         symbol: new SimpleMarkerSymbol()
//             .setStyle(SimpleMarkerSymbol.STYLE_CIRCLE)
//             .setColor(new Color([255, 255, 0])),

//         zipCityHelpText: 'For city or zip code only searches, see "Map Search..." above',
//         outsideUtahMsg: 'No data is returned for points outside of the state of Utah!',

//         topics: {
//             labelLayer: 'deq-spills/labelLayer'
//         }
//     };

//     if (window.location.hostname === 'localhost' && window.AGRC_testQuadWord) {
//         // allow deq dev to define quad word for their testing on localhost...
//         window.AGRCGLOBAL.quadWord = window.AGRC_testQuadWord;
//     } else {
//         if (has('agrc-build') === 'prod') {
//             window.AGRCGLOBAL.quadWord = 'result-table-secure-antenna';
//         } else if (has('agrc-build') === 'stage') {
//             // *.dev.utah.gov & *.deq.utah.gov (their dev servers)
//             window.AGRCGLOBAL.quadWord = 'orca-brown-door-concert';
//         } else if (!window.dojoConfig || !window.dojoConfig.isJasmineTestRunner) {
//             xhr(require.baseUrl + 'secrets.json', {
//                 handleAs: 'json',
//                 sync: true
//             }).then(function (secrets) {
//                 window.AGRCGLOBAL.quadWord = secrets.quadWord;
//             }, function () {
//                 throw 'Error getting secrets!';
//             });
//         }
//     }

//     window.AGRCMap = App;
// });
