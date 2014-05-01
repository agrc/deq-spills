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
        apiKey: null
    };

    window.AGRCMap = App;

    if (window.agrcOnLoad) {
        window.agrcOnLoad();
    }
});