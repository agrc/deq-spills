define([
    'dojo/_base/declare', 
    'dojo/text!app/templates/ZoomToCoord.html',
    'agrc/widgets/locate/ZoomToCoords',
    'app/TRSsearch',
    'dojo/query',

    'dijit/form/Select',
    'dijit/form/NumberTextBox'
],

function (
    declare, 
    template,
    ZoomToCoords,
    TRSsearch,
    query
    ) {
    return declare('app.ZoomToCoord', [ZoomToCoords], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'zoom-to-coord',

        // findRouteWidget: agrc.widgets.locate.FindRouteMilepost
        findRouteWidget: null,

        constructor: function () {
            console.log(this.declaredClass + "::constructor", arguments);
        },
        postCreate: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::postCreate', arguments);
        
            this.trsSearchWidget = new TRSsearch({
                map: this.map
            }, this.trsSearchWidgetDiv);

            this.inherited(arguments);
        },
        _wireEvents: function () {
            // summary:
            //    Wires events.
            // tags:
            //    private
            console.info(this.declaredClass + '::' + arguments.callee.nom);

            this.connect(this.zoomButton, 'onclick', this._onZoomClick);
            this.connect(this._geoService, 'onError', this._onGeoServiceError);
            this.connect(this._geoService, 'onProjectComplete', this._onProjectComplete);
            this.connect(this.typeSelect, "onchange", this._onTypeChange);
        },
        _onTypeChange: function (newValue) {
            // summary:
            //      Fires when the user changes the value of the drop-down.
            //      Moves the stack container to the appropriate pane.
            console.info(this.declaredClass + "::" + arguments.callee.nom);

            var child;

            switch (newValue.srcElement.value) {
                case "dd":
                    child = this.dd;
                    break;
                case "dm":
                    child = this.dm;
                    break;
                case "dms":
                    child = this.dms;
                    break;
                case "utm":
                    child = this.utm;
                    break;
                case 'st':
                    child = this.st;
                    break;
            }

            this.stackContainer.selectChild(child);
        },
        _onZoomClick: function () {
            // summary:
            //      Fires when the user clicks on the Zoom button
            console.info(this.declaredClass + '::' + arguments.callee.nom);

            if (this.typeSelect.value === 'st') {
                this.trsSearchWidget.zoom();
                return;
            }

            var coords = this.getCoords(this.typeSelect.value);
            console.log(coords);

            var point = new esri.geometry.Point(coords.x, coords.y, this._inputSpatialReference);

            if (point.spatialReference !== this.map.spatialReference) {
                this._geoService.project([point], this.map.spatialReference);
            }
            else {
                this._zoomToPoint(point);
            }
        },
        _zoomToPoint: function (point) {
            // summary:
            //      Zoom to the point created 
            // description:
            //      clears old map graphics and centers and zooms on the input point
            // tags:
            //      private
            console.info(this.declaredClass + "::" + arguments.callee.nom);

            this.findRouteWidget.graphicsLayer.clear();
        
            this.findRouteWidget._onXHRSuccess({
                result: {
                    location: {
                        x: point.x,
                        y: point.y
                    }
                },
                status: 200
            });
        },
        _onProjectComplete: function (geometries) {
            // summary:
            //      Handles the callback from the project function on the geometry service
            // geometries: Geometry[]
            //      An array of the projected geometries.
            console.info(this.declaredClass + '::' + arguments.callee.nom);

            var newPoint = geometries[0];

            // check for bad point
            if (isNaN(newPoint.x)) {
                alert('Bad point returned. Please check your coordinates.');
                return;
            }

            this._zoomToPoint(newPoint);
        },
        clear: function () {
            // summary:
            //      clears the text boxes
            console.log(this.declaredClass + "::clear", arguments);
        
            query('input', this.domNode).forEach(function (node) {
                node.value = '';
            });
        }
    });
});