define([
    'dojo/_base/declare',
    'dojo/text!app/templates/ZoomToCoord.html',
    'dojo/query',

    'agrc/widgets/locate/ZoomToCoords',

    'esri/geometry/Point',

    'app/TRSsearch',

    'dijit/form/Select',
    'dijit/form/NumberTextBox'
],

function (
    declare,
    template,
    query,

    ZoomToCoords,

    Point,

    TRSsearch
    ) {
    return declare([ZoomToCoords], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'zoom-to-coordinate',

        apiKey: null,

        // findRouteWidget: agrc.widgets.locate.FindRouteMilepost
        findRouteWidget: null,

        constructor: function () {
            console.log('app/ZoomToCoord:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      description
            console.log('app/ZoomToCoord:postCreate', arguments);

            this.trsSearchWidget = new TRSsearch({
                map: this.map,
                apiKey: this.apiKey
            }, this.trsSearchWidgetDiv);

            this.inherited(arguments);

            this._panelController.panels.trs = this.trsNode;
        },
        _onTypeChange: function (newValue) {
            // summary:
            //      Fires when the user changes the value of the drop-down.
            //      Moves the stack container to the appropriate pane.
            console.log('app/ZoomToCoord:_onTypeChange', arguments);

            var child;

            switch (newValue.srcElement.value) {
                case 'dd':
                    child = this.dd;
                    break;
                case 'dm':
                    child = this.dm;
                    break;
                case 'dms':
                    child = this.dms;
                    break;
                case 'utm':
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
            console.log('app/ZoomTo:_onZoomClick', arguments);

            if (this.typeSelect.value === 'st') {
                this.trsSearchWidget.zoom();
                return;
            }

            var coords = this.getCoords(this.typeSelect.value);
            console.log(coords);

            var point = new Point(coords.x, coords.y, this._inputSpatialReference);

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
            console.log('app/ZoomToCoord:_zoomToPoint', arguments);

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
            console.log('app/ZoomToCoord:_onProjectComplete', arguments);

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
            console.log('app/ZoomToCoord:clear', arguments);

            query('input', this.domNode).forEach(function (node) {
                node.value = '';
            });
        }
    });
});