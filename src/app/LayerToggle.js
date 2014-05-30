define([
    'dojo/text!./templates/LayerToggle.html',

    'dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/_base/array',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    'dojox/gfx',

    'esri/layers/FeatureLayer'

], function(
    template,

    declare,
    lang,
    array,

    _WidgetBase,
    _TemplatedMixin,

    gfx,

    FeatureLayer
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Toggles a feature layer

        templateString: template,
        baseClass: 'layer-toggle',

        // Properties to be sent into constructor

        // url: String
        //      url to feature layer
        url: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.LayerToggle::postCreate', arguments);

            var that = this;

            this.layer = new FeatureLayer(this.url, {
                visible: true,
                outFields: window.AGRCGLOBAL.deqLayerFields
            });
            window.AGRC.widget.map.addLayer(this.layer);
            window.AGRC.widget.map.addLoaderToLayer(this.layer);
            this.layer.on('load', function () {
                that.nameSpan.innerHTML = that.layer.name;

                var symbol = that.layer.renderer.symbol;
                var surface = gfx.createSurface(that.surface, 13, 13);
                surface.createCircle({
                    cx: 7,
                    cy: 7,
                    r: 5
                }).setFill(symbol.color).setStroke(symbol.outline.color);
            });
            this.layer.on('click', lang.hitch(this, 'onLayerClick'));

            this.inherited(arguments);
        },
        onChange: function () {
            // summary:
            //      fires when the user toggles the checkbox
            console.log('app/MapLayers:onChange', arguments);

            this.layer.setVisibility(this.checkbox.checked);
        },
        onLayerClick: function (evt) {
            // summary:
            //      fires when the user clicks on a graphic from this feature layer
            // evt: Event Object
            console.log('app/LayerToggle:onLayerClick', arguments);

            var g = evt.graphic;
            var location = {
                x: g.geometry.x,
                y: g.geometry.y
            };
            array.forEach(window.AGRCGLOBAL.deqLayerFields, function (f) {
                location[f] = g.attributes[f];
            });

            window.AGRC.widget.defineLocation(location);
        }
    });
});