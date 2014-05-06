/* jshint camelcase:false */
define([
    'dojo/text!app/templates/App.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/string',
    'dojo/aspect',
    'dojo/query',

    'dijit/registry',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/Graphic',
    'esri/geometry/Polygon',
    'esri/SpatialReference',
    'esri/geometry/Point',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/locate/FindRouteMilepost',
    'agrc/modules/WebAPI',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMapSelector',

    'agrc/widgets/locate/FindAddress',
    'app/ZoomToCoord',


    'dojo/NodeList-manipulate'
],

function (
    template,

    declare,
    lang,
    dom,
    domClass,
    domConstruct,
    string,
    aspect,
    query,

    registry,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Graphic,
    Polygon,
    SpatialReference,
    Point,

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

        // findRouteMilepostWidget: agrc.widgets.locate.FindRouteMilepost
        findRouteMilepostWidget: null,

        zoomTypes: {
            county: {
                name: 'county',
                fcName: 'SGID10.BOUNDARIES.Counties',
                fldName: 'NAME',
                errTxt: 'County: ${0} not found!',
                type: 'polygon'
            },
            citytown: {
                name: 'citytown',
                fcName: 'SGID10.SOCIETY.UDOTMAP_CityLocations',
                fldName: 'NAME',
                errTxt: 'City/Town: ${0} not found!',
                type: 'point'
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
            if (!params || !params.apiKey) {
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

            var that = this;

            // call this before creating the map to make sure that the map container is
            // the correct size
            this.inherited(arguments);

            this.initMap();

            this.map.on('load', function () {
                that.parseParams();
            });
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
                    that.zoomWidget._updateView({target: {value: 'utm'}});
                    query('input[name="x"]', that.zoomWidget.utmNode)[0].value = that.UTM_X;
                    query('input[name="y"]', that.zoomWidget.utmNode)[0].value = that.UTM_Y;
                    that.zoomWidget.zoom();
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

            var that = this;
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
            aspect.after(this.findAddressWidget, 'onFind', function (result) {
                that.defineLocation(result.location);
            }, true);
            this.findRouteMilepostWidget = new FindRouteMilepost({
                map: this.map,
                inline: true,
                apiKey: this.apiKey
            }, this.findRouteDiv);
            this.findRouteMilepostWidget.startup();
            aspect.after(this.findRouteMilepostWidget, 'onFind', function (location) {
                that.defineLocation(location);
            }, true);
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

            this.own(
                aspect.after(this.zoomWidget, '_projectionComplete', function (response) {
                    that.addGraphic(response.geometries[0]);
                }, true),
                aspect.around(this.zoomWidget, '_getPoint', function (_getPoint) {
                    var pnt = lang.hitch(that.zoomWidget, _getPoint)();
                    if (!isNaN(pnt.x) && pnt.spatialReference.wkid === that.map.spatialReference.wkid) {
                        that.addGraphic(pnt);
                    }
                })
            );
        },
        defineLocation: function (location) {
            // summary:
            //      fires the event
            // location: Object
            console.log('app/App::defineLocation', arguments);
        
            this.emit('location-defined', {
                UTM_X: location.x,
                UTM_Y: location.y
            });
        },
        onMapClick: function (evt) {// summary:
            //      description
            // evt: Event Object
            console.log(this.declaredClass + '::onMapClick', arguments);

            this.addGraphic(evt.mapPoint);

            this.defineLocation(evt.mapPoint);
        },
        addGraphic: function (point) {
            // summary:
            //      adds the point as a graphic to the map, clear any pre-existing graphics
            // point: Point
            console.log('app/App::addGraphic', arguments);
        
            this.findRouteMilepostWidget.graphicsLayer.clear();
            this.findAddressWidget.graphicsLayer.clear();
            this.map.graphics.clear();
            this.map.graphics.add(new Graphic(point, this.findRouteMilepostWidget.symbol));
            this.zoomWidget.clear();
        },
        zoomToFeature: function (name, type) {
            // summary:
            //      queries the feature from sde and zooms to the extent
            // name: String
            // type: Object
            console.log('app/App:zoomToFeature', arguments);

            var that = this;
            if (!this.webAPI) {
                this.webAPI = new WebAPI({
                    apiKey: this.apiKey
                });
            }

            this.webAPI.search(type.fcName, ['shape@envelope'], {
                predicate: type.fldName + ' = \'' + name + '\''
            }).then(function (results) {
                var geo = results[0].geometry;
                if (type.type === 'point') {
                    var pnt = new Point(geo.rings[0][0], new SpatialReference(26912));
                    that.map.centerAndZoom(pnt, 9);
                } else {
                    var p = new Polygon(results[0].geometry);
                    p.setSpatialReference(new SpatialReference(26912));
                    that.map.setExtent(p.getExtent());
                }
            }, function () {
                that.showError(string.substitute(type.errTxt, [name]));
            });
        },
        showError: function (errMsg) {
            // summary:
            //      shows an alert dialog with the error message
            // errMsg: String
            console.log(this.declaredClass + '::showError', arguments);

            this.errMsg.innerHTML = errMsg;
            domClass.remove(this.errMsg, 'hidden');
        },
        zoomToAddress: function (street, zone) {
            // summary:
            //
            // street: String
            // zone: String
            console.log('app/App:zoomToAddress', arguments);
            var that = this;

            this.findAddressWidget.txtAddress.value = street;
            this.findAddressWidget.txtZone.value = zone;

            this.findAddressWidget._invokeWebService({
                street: street,
                zone: zone
            }).then(lang.hitch(that.findAddressWidget, '_onFind'), function () {
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

            this.findRouteMilepostWidget.routeTxt.value = route;
            this.findRouteMilepostWidget.milepostTxt.value = milepost;

            this.findRouteMilepostWidget._onFindClick().then(null, function () {
                delete that.route;
                delete that.milepost;

                that.parseParams();
            });
        },
        clearAllFields: function () {
            // summary:
            //      clears all text boxes
            console.log('app/App:clearAllFields', arguments);

            query('input[type="text"]', this.zoomWidget.domNode).val('');

            this.findAddressWidget.txtAddress.value = '';
            this.findAddressWidget.txtZone.value = '';

            this.findRouteMilepostWidget.routeTxt.value = '';
            this.findRouteMilepostWidget.milepostTxt.value = '';

            this.magicZoom.textBox.value = '';

            var ts = this.zoomWidget.trsSearchWidget;
            query('input[type="radio"]', ts.domNode).val(false);
            query('select', ts.domNode).val('');
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