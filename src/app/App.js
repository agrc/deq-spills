/* jshint camelcase:false */
define([
    'dojo/text!app/templates/App.html',

    'dojo/_base/declare',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/string',
    'dojo/aspect',

    'dijit/registry',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    
    'agrc/widgets/map/BaseMap',
    'agrc/widgets/locate/FindRouteMilepost',
    'agrc/modules/WebAPI',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMapSelector',
    
    'agrc/widgets/locate/FindAddress',
    'app/ZoomToCoord'
],

function (
    template,

    declare,
    dom,
    domClass,
    domConstruct,
    string,
    aspect,
    
    registry,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    BaseMap,
    FindRouteMilepost,
    WebAPI,
    MagicZoom,
    BaseMapSelector,

    FindAddress,
    ZoomToCoord
    ) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin],
        {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'agrc-app',

        // zoomWidget: app.ZoomToCoords
        zoomWidget: null,

        // findWidget: agrc.widgets.locate.FindRouteMilepost
        findWidget: null,

        zoomTypes: {
            county: {
                name: 'county',
                fcName: 'SGID10.BOUNDARIES.Counties',
                fldName: 'NAME',
                errTxt: 'County: ${0} not found!'
            },
            citytown: {
                name: 'citytown',
                fcName: 'SGID10.SOCIETY.UDOTMAP_CityLocations',
                fldName: 'NAME',
                errTxt: 'City/Town: ${0} not found!'
            }
        },

        // missingAddressErrTxt: String
        missingAddressErrTxt: 'Must provide both addressStreet and addressZone parameters!',

        // missingRouteMilepostTxt: String
        missingRouteMilepostTxt: 'Must provide both route and milepost parameters!',

        // map: agrc.widgets.map.Basemap
        map: null,

        // noApiKeyErrorTxt: String
        noApiKeyErrorTxt: 'Must provide an apiKey parameter!',


        // properties passed in via the constructor

        // UTM_X: Number
        //      passed in to initialize the widget with coords
        UTM_X: null,

        // UTM_Y: Number
        //      see UTM_X description
        UTM_Y: null,

        // countyName: String
        //      populate if you want to zoom to a county on init
        countyName: null,

        // cityName: String
        //      populate if you want to zoom to a city/town on init
        cityName: null,

        // addressStreet: String
        //      The street address
        //      Must also populate addressZone
        addressStreet: null,

        // addressZone: String
        //      Zip or City
        addressZone: null,

        // route: String
        //      Route
        route: null,

        // milepost: String
        //      Milepost
        milepost: null,

        // apiKey: String
        apiKey: null,

        constructor: function (params) {
            // summary:
            //      first function to fire after page loads
            console.log('app/App:constructor', arguments);

            window.AGRC = {
                widget: this
            };
            if (!params.apiKey) {
                throw this.noApiKeyErrorTxt;
            }
            window.AGRCGLOBAL.apiKey = params.apiKey;
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app/App:postCreate', arguments);

            domClass.add(this.domNode, 'claro');

            this.wireEvents();
        },
        wireEvents: function () {
            // summary:
            //      wires events for this widget
            console.log('app/App:wireEvents', arguments);

            this.connect(this.clearBtn, 'onclick', 'clearAllFields');
        },
        startup: function () {
            // summary:
            //      Fires after postCreate when all of the child widgets are finished laying out.
            console.log('app/App:startup', arguments);

            // call this before creating the map to make sure that the map container is
            // the correct size
            this.inherited(arguments);

            this.initMap();

            this.parseParams();
        },
        parseParams: function () {
            // summary:
            //      description
            console.log('app/App:parseParams', arguments);
            var that = this;

            if (this.UTM_X && this.UTM_Y) {
                this.connect(this.map, 'onLoad', function () {
                    that.zoomWidget.typeSelect.selectedIndex = 3;
                    that.zoomWidget.typeSelect.value = 'utm';
                    that.zoomWidget._onTypeChange({
                        srcElement: {
                            value: 'utm'
                        }
                    });
                    that.zoomWidget.x_utm.set('value', that.UTM_X);
                    that.zoomWidget.y_utm.set('value', that.UTM_Y);
                    that.zoomWidget._onZoomClick();
                });
            } else if (this.addressStreet && !this.addressZone ||
                !this.addressStreet && this.addressZone) {
                throw this.missingAddressErrTxt;
            } else if (this.addressStreet && this.addressZone) {
                this.zoomToAddress(this.addressStreet, this.addressZone);
            } else if (this.route && !this.milepost ||
                !this.route && this.milepost) {
                throw this.missingRouteMilepostTxt;
            } else if (this.route && this.milepost) {
                this.zoomToRouteMilepost(this.route, this.milepost);
            } else if (this.cityName) {
                this.zoomToFeature(this.cityName, this.zoomTypes.citytown);
            } else if (this.countyName) {
                this.zoomToFeature(this.countyName, this.zoomTypes.county);
            }
        },
        initMap: function () {
            // summary:
            //      Sets up the map
            console.log('app/App:initMap', arguments);
            this.map = new BaseMap(this.mapDiv, {useDefaultBaseMap: false});
            this.bms = new BaseMapSelector({
                map: this.map,
                id: 'claro',
                position: 'BL',
                defaultThemeLabel: 'Terrain'
            });
            this.bms.startup();

            this.findAddressWidget = new FindAddress({
                map: this.map,
                apiKey: this.apiKey,
                inline: true
            }, this.findAddressDiv);
            this.findAddressWidget.startup();
            this.findWidget = new FindRouteMilepost({
                map: this.map,
                inline: true,
                apiKey: this.apiKey
            }, this.findRouteDiv);
            this.findWidget.startup();
            this.zoomWidget = new ZoomToCoord({
                map: this.map, 
                apiKey: this.apiKey
            }, this.zoomCoordsDiv);
            this.zoomWidget.startup();
            this.magicZoom = new MagicZoom({
                promptMessage: 'Please type a city, town, or county...',
                mapServiceURL: 'http://mapserv.utah.gov/arcgis/rest/services/BaseMaps/Hillshade/MapServer',
                searchLayerIndex: 3,
                searchField: 'Name',
                map: this.map
            }, this.magicZoomDiv);
            this.magicZoom.startup();

            this.connect(this.map, 'onClick', 'onMapClick');
        },
        onMapClick: function (evt) {// summary:
            //      description
            // evt: Event Object
            console.log(this.declaredClass + '::onMapClick', arguments);

            this.findWidget.graphicsLayer.clear();

            this.findWidget._onXHRSuccess({
                result: {
                    location: {
                        x: evt.mapPoint.x,
                        y: evt.mapPoint.y
                    }
                }
            }, true);

            this.zoomWidget.clear();
        },
        zoomToFeature: function (name, type) {
            // summary:
            //      queries the feature from sde and zooms to the extent
            // name: String
            // type: Object
            console.log(this.declaredClass + '::zoomToCounty', arguments);

            var that = this;
            if (!this.webAPI) {
                this.webAPI = new WebAPI({
                    apiKey: AGRC.apiKey
                });
            }

            this.webAPI.search(type.fcName, 'shape@envelope', {
                predicate: type.fldName + ' = ' + name
            }).then(function (response) {
                if (response.status === 200) {
                    that.map.setExtent(response.results[0].geometry);
                } else {
                    that.showError(string.substitute(type.errTxt, [name]));
                }
            }, function () {
                that.showError(string.substitute(type.errTxt, [name]));
            });
        },
        showError: function (/*errMsg*/) {
            // summary:
            //      shows an alert dialog with the error message
            // errMsg: String
            console.log(this.declaredClass + '::showError', arguments);

            // window.alert(errMsg);
        },
        zoomToAddress: function (street, zone) {
            // summary:
            //
            // street: String
            // zone: String
            console.log('app/App:zoomToAddress', arguments);
            var that = this;

            this.findAddressWidget.txt_address.value = street;
            this.findAddressWidget.txt_zone.value = zone;

            this.findAddressWidget.geocodeAddress().then(null, function () {
                delete that.addressStreet;
                delete that.addressZone;

                that.parseParams();
            });
        },
        zoomToRouteMilepost: function (route, milepost) {
            // route: String
            // milepost: String
            console.log('app/App:zoomToRouteMilepost', arguments);
            var that = this;

            this.findWidget.routeTxt.value = route;
            this.findWidget.milepostTxt.value = milepost;

            this.findWidget._onFindClick().then(null, function () {
                delete that.route;
                delete that.milepost;

                that.parseParams();
            });
        },
        clearAllFields: function () {
            // summary:
            //      clears all text boxes
            console.log('app/App:clearAllFields', arguments);

            this.zoomWidget.w_deg_dd.set('Value', '');
            this.zoomWidget.n_deg_dd.set('Value', '');
            this.zoomWidget.w_deg_dm.set('Value', '');
            this.zoomWidget.w_min_dm.set('Value', '');
            this.zoomWidget.n_deg_dm.set('Value', '');
            this.zoomWidget.n_min_dm.set('Value', '');
            this.zoomWidget.w_sec_dms.set('Value', '');
            this.zoomWidget.n_deg_dms.set('Value', '');
            this.zoomWidget.n_min_dms.set('Value', '');
            this.zoomWidget.n_sec_dms.set('Value', '');
            this.zoomWidget.x_utm.set('Value', '');
            this.zoomWidget.y_utm.set('Value', '');

            this.findAddressWidget.txt_address.value = '';
            this.findAddressWidget.txt_zone.value = '';

            this.findWidget.routeTxt.value = '';
            this.findWidget.milepostTxt.value = '';

            this.magicZoom.textBox.textbox.value = '';

            var ts = this.zoomWidget.trsSearchWidget;
            ts._slRB.set('Checked', true);
            ts._townshipDD.set('Value', '');
            ts._rangeDD.set('Value', '');
            ts._sectionDD.set('Value', '');
        },
        destroyRecursive: function () {
            // summary:
            //      description
            console.log('app/App:destroyRecursive', arguments);

            this.bms.destroyRecursive();
            domConstruct.destroy(this.bms.domNode);

            this.inherited(arguments);
        }
    });
});