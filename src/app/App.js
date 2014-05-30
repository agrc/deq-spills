/* jshint camelcase:false */
define([
    'dojo/text!app/templates/App.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/string',
    'dojo/aspect',
    'dojo/query',
    'dojo/promise/all',

    'dijit/registry',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',

    'esri/Graphic',
    'esri/geometry/Polygon',
    'esri/SpatialReference',
    'esri/geometry/Point',
    'esri/layers/ArcGISDynamicMapServiceLayer',

    'agrc/widgets/map/BaseMap',
    'agrc/widgets/locate/FindRouteMilepost',
    'agrc/modules/WebAPI',
    'agrc/widgets/locate/MagicZoom',
    'agrc/widgets/map/BaseMapSelector',
    'agrc/widgets/locate/FindAddress',

    'app/ZoomToCoord',
    'app/MapLayers',

    'proj4',


    'dojo/NodeList-manipulate'
],

function (
    template,

    declare,
    lang,
    array,
    dom,
    domClass,
    domConstruct,
    string,
    aspect,
    query,
    all,

    registry,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,

    Graphic,
    Polygon,
    SpatialReference,
    Point,
    ArcGISDynamicMapServiceLayer,

    BaseMap,
    FindRouteMilepost,
    WebAPI,
    MagicZoom,
    BaseMapSelector,
    FindAddress,

    ZoomToCoord,
    MapLayers,

    proj4
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

        // deqMapServiceLayer: ArcGISDynamicMapServiceLayer
        deqMapServiceLayer: null,

        // api: WebAPI
        api: null,


        // properties passed in via the constructor

        // layers: Number[]
        //      The map service layer indices of the layers that you want
        //      to make available in the layers popup
        layers: null,

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

            this.api = new WebAPI({apiKey: params.apiKey});
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
                that.mapLayers = new MapLayers({
                    btn: that.layersBtn,
                    layers: that.layers
                });
                
                that.parseParams();
            });
        },
        parseParams: function () {
            // summary:
            //      description
            console.log('app/App:parseParams', arguments);

            if (this.UTM_X && this.UTM_Y) {
                this.zoomWidget.typeSelect.selectedIndex = 3;
                this.zoomWidget.typeSelect.value = 'utm';
                this.zoomWidget._updateView({target: {value: 'utm'}});
                query('input[name="x"]', this.zoomWidget.utmNode)[0].value = this.UTM_X;
                query('input[name="y"]', this.zoomWidget.utmNode)[0].value = this.UTM_Y;
                this.zoomWidget.zoom();
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
                inline: true,
                symbol: window.AGRCGLOBAL.symbol
            }, this.findAddressDiv);
            this.findAddressWidget.startup();
            aspect.after(this.findAddressWidget, 'onFind', function (result) {
                that.defineLocation(result.location);
            }, true);
            this.findRouteMilepostWidget = new FindRouteMilepost({
                map: this.map,
                inline: true,
                apiKey: this.apiKey,
                symbol: window.AGRCGLOBAL.symbol
            }, this.findRouteDiv);
            this.findRouteMilepostWidget.startup();
            aspect.after(this.findRouteMilepostWidget, 'onFind', function (location) {
                that.defineLocation(location);
            }, true);
            this.zoomWidget = new ZoomToCoord({
                map: this.map,
                apiKey: this.apiKey,
                symbol: window.AGRCGLOBAL.symbol
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

            this.map.on('click', lang.hitch(this, 'onMapClick'));

            this.own(
                aspect.after(this.zoomWidget, '_projectionComplete', function (response) {
                    that.addGraphic(response.geometries[0]);
                    that.defineLocation(response.geometies[0]);
                }, true),
                aspect.around(this.zoomWidget, '_getPoint', function (_getPoint) {
                    return function () {
                        var pnt = lang.hitch(that.zoomWidget, _getPoint)();
                        if (pnt && !isNaN(pnt.x) && pnt.spatialReference.wkid === that.map.spatialReference.wkid) {
                            that.addGraphic(pnt);
                            that.defineLocation(pnt);
                        }
                        
                        return pnt;
                    };
                })
            );
        },
        defineLocation: function (location) {
            // summary:
            //      fires the event
            // location: Object
            console.log('app/App::defineLocation', arguments);
        
            var that = this;
            var promises = [];
            var noFeatFound = 'no feature found';

            this.map.showLoader();

            array.forEach(window.AGRCGLOBAL.queries, function (q) {
                promises.push(
                    that.api.search('SGID10.' + q[0], q[1], {
                        geometry: 'point:[' + location.x + ',' + location.y + ']'
                    }).then(function (data) {
                        array.forEach(q[2], function (f, i) {
                            if (data.length) {
                                location[f] = data[0].attributes[q[1][i]];
                            } else {
                                location[f] = noFeatFound;
                            }
                        });
                    }, function () {
                        array.forEach(q[2], function (f) {
                            location[f] = noFeatFound;
                        });
                    })
                );
            });

            // keep backward compatibility
            location.UTM_X = location.x;
            location.UTM_Y = location.y;

            // decimal degrees
            var ll = proj4(window.AGRCGLOBAL.projections.utm, proj4.WGS84, [location.x, location.y]);
            location.DD_LONG = ll[0];
            location.DD_LAT = ll[1];

            // degrees, minutes, seconds
            var convertToDMS = function (dd) {
                var deg = dd | 0; // truncate dd to get degrees
                var frac = Math.abs(dd - deg); // get fractional part
                var min = (frac * 60) | 0; // multiply fraction by 60 and truncate
                var sec = frac * 3600 - min * 60;
                return deg + "d " + min + "' " + sec + "\"";
            };
            location.DMS_LONG = convertToDMS(location.DD_LONG);
            location.DMS_LAT = convertToDMS(location.DD_LAT);

            all(promises).always(function () {
                that.emit('location-defined', location);
                that.map.hideLoader();
            });
        },
        onMapClick: function (evt) {
            // summary:
            //      description
            // evt: Event Object
            console.log('app/App:onMapClick', arguments);

            if (!evt.graphic) {
                this.addGraphic(evt.mapPoint);
                this.defineLocation(evt.mapPoint);
            } else {
                this.addGraphic(evt.graphic.geometry);
                // defineLocation is called from LayerToggle:onClick
            }
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
            console.log('app/App:showError', arguments);

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