require([
    'app/MapLayers',

    'dojo/_base/window',
    'dojo/_base/array',
    'dojo/query',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    win,
    array,
    query,

    domConstruct
) {
    describe('app/MapLayers', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var layers = [0,2,4];

        beforeEach(function () {
            window.AGRC = {
                widget: {
                    map: {
                        addLayer: function () {},
                        addLoaderToLayer: function () {}
                    }
                }
            };
            widget = new WidgetUnderTest({
                layers: layers
            }, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a MapLayers', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('createCheckboxes', function () {
            it('creates the correct number of checkboxes', function () {
                // widget.createCheckboxes(layers);

                expect(query('input', widget.domNode).length).toBe(3);
            });
        });
    });
});
