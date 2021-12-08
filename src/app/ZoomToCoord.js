define([
    'dojo/_base/declare',
    'dojo/text!app/templates/ZoomToCoord.html',
    'dojo/query',
    'dojo/aspect',

    'agrc/widgets/locate/ZoomToCoords',

    'app/TRSsearch',

    'dijit/form/Select',
    'dijit/form/NumberTextBox'
], function (
    declare,
    template,
    query,
    aspect,

    ZoomToCoords,

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

            var that = this;

            this.trsSearchWidget = new TRSsearch({
                map: this.map,
                apiKey: this.apiKey
            }, this.trsSearchWidgetDiv);
            aspect.after(this, '_updateView', function (evt) {
                if (evt.target.value === 'trs') {
                    that._enableZoom(null, null, true);
                }
            }, true);

            this.inherited(arguments);

            this._panelController.visible = this.ddNode;

            this._panelController.panels.trs = this.trsNode;
        },
        zoom: function () {
            // summary:
            //      overridden
            console.log('app/ZoomToCoord::zoom', arguments);

            if (this._panelController.visible === this.trsNode) {
                this.trsSearchWidget.zoom();
            } else {
                this.inherited(arguments);
            }
        },
        clear: function () {
            // summary:
            //      clears the text boxes
            console.log('app/ZoomToCoord:clear', arguments);

            query('input, select', this.domNode).val('');
            // query('select', this.domNode).val('');

            // reset base meridian to SL
            this.trsSearchWidget.slNode.checked = true;
        }
    });
});
