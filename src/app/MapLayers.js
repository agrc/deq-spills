define([
    'dojo/text!./templates/MapLayers.html',

    'dojo/_base/declare',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/string',
    'dojo/dom-construct',
    'dojo/query',

    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',

    './LayerToggle',


    'jquery',
    'bootstrap'
], function(
    template,

    declare,
    array,
    lang,
    string,
    domConstruct,
    query,

    _WidgetBase,
    _TemplatedMixin,

    LayerToggle
) {
    return declare([_WidgetBase, _TemplatedMixin], {
        // description:
        //      Shows symbology and allows users to toggle layer visibility.

        templateString: template,
        baseClass: 'map-layers',


        // Properties to be sent into constructor

        // btn: Button Element
        //      The button associated with the popover
        btn: null,

        // layers: Number[]
        //      The layers that you want checkboxes created for
        layers: null,

        postCreate: function() {
            // summary:
            //      Overrides method of same name in dijit._Widget.
            // tags:
            //      private
            console.log('app.MapLayers::postCreate', arguments);

            $(this.btn).popover({
                content: this.domNode,
                container: 'body',
                html: true
            });

            this.createCheckboxes(this.layers);

            this.inherited(arguments);
        },
        createCheckboxes: function (layers) {
            // summary:
            //      initializes the checkboxes
            // layers: Number[]
            console.log('app/MapLayers:createCheckboxes', arguments);

            var that = this;

            array.forEach(layers, function (l) {
                new LayerToggle({
                    index: l
                }, domConstruct.create('div', null, that.domNode));
            });
        }
    });
});
