define([
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!./templates/LayerToggle.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/gfx',

    'esri/layers/FeatureLayer'
], function(
    _TemplatedMixin,
    _WidgetBase,

    template,
    topic,
    array,
    declare,
    lang,

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

        // index: Number
        //      the layer index number
        index: null,

        // labels: String[]
        //      the labels that this layer should show
        labels: null,

        constructor: function (options) {
            // summary:
            //      description
            // options: {index: Number}
            console.log('app.LayerToggle:constructor', arguments);

            this.url = window.AGRCGLOBAL.urls.mapservice + '/' + options.index;

            this.inherited(arguments);
        },
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

            if (this.labels && this.labels.length > 0) {
                topic.publish(
                    window.AGRCGLOBAL.topics.labelLayer,
                    this.layer,
                    this.getLabelText(this.labels, this.index)
                );
            }

            this.inherited(arguments);
        },
        getLabelText: function (labels, index) {
            // summary:
            //      returns a format string for the labels
            // labels: String[]
            // index: Number
            console.log('app/MapLayers:getLabelText', arguments);

            var config = window.AGRCGLOBAL;
            var fields = array.map(labels, function (lbl) {
                var field = config.labelsLU[lbl];
                if (field === config.fields.SITENAME &&
                    config.nonStandardSiteNameLU[index]) {
                    field = config.nonStandardSiteNameLU[index];
                } else if (field === config.fields.SITEADDRES &&
                    config.nonStandardSiteAddressLU[index]) {
                    field = config.nonStandardSiteAddressLU[index];
                }
                return '{' + field + '}';
            });

            return fields.join(' - ');
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
            var that = this;
            array.forEach(window.AGRCGLOBAL.deqLayerFields, function (f) {
                var nonStandardLU;
                if (f === window.AGRCGLOBAL.fields.SITENAME) {
                    nonStandardLU = window.AGRCGLOBAL.nonStandardSiteNameLU;
                } else if (f === window.AGRCGLOBAL.fields.SITEADDRES) {
                    nonStandardLU = window.AGRCGLOBAL.nonStandardSiteAddressLU;
                }
                var field;
                if (nonStandardLU) {
                    field = nonStandardLU[that.index] || f;
                } else {
                    field = f;
                }
                location[f] = g.attributes[field];
            });

            window.AGRC.widget.defineLocation(location);
        }
    });
});
