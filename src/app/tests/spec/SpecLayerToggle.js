require([
    'app/LayerToggle',

    'dojo/_base/window',

    'dojo/dom-construct'
], function(
    WidgetUnderTest,

    win,

    domConstruct
) {
    describe('app/LayerToggle', function() {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        window.AGRC = {widget: {map: {addLayer: function () {}}}};

        beforeEach(function() {
            widget = new WidgetUnderTest({url: 'blah'}, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        afterEach(function() {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function() {
            it('should create a LayerToggle', function() {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
    });
});