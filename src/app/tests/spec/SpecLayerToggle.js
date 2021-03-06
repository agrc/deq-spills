require([
    'app/LayerToggle',

    'dojo/_base/window',

    'dojo/dom-construct'
], function (
    WidgetUnderTest,

    win,

    domConstruct
) {
    describe('app/LayerToggle', function () {
        var widget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var defineLocationSpy;

        beforeEach(function () {
            defineLocationSpy = jasmine.createSpy('defineLocation');
            window.AGRC = {widget: {
                map: {
                    addLayer: function () {},
                    addLoaderToLayer: function () {}
                },
                defineLocation: defineLocationSpy
            }};
            widget = new WidgetUnderTest({index: 1}, domConstruct.create('div', null, win.body()));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a LayerToggle', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });
        describe('onLayerClick', function () {
            it('attaches default fields to location', function () {
                var x = 1;
                var y = 2;
                var derrid = 'blah';
                var sitedesc = 'blah2';
                var stKey = 'blah3';
                var sitename = 'blah4';
                var siteaddres = 'blah5';

                widget.onLayerClick({
                    graphic: {
                        geometry: {
                            x: x,
                            y: y
                        },
                        attributes: {
                            DERRID: derrid,
                            SITEDESC: sitedesc,
                            ST_KEY: stKey,
                            SITENAME: sitename,
                            SITEADDRES: siteaddres
                        }
                    }
                });

                var loc = defineLocationSpy.calls.mostRecent().args[0];
                expect(loc.x).toEqual(x);
                expect(loc.y).toEqual(y);
                expect(loc.DERRID).toEqual(derrid);
                expect(loc.SITEDESC).toEqual(sitedesc);
                expect(loc.ST_KEY).toEqual(stKey);
                expect(loc.SITENAME).toEqual(sitename);
                expect(loc.SITEADDRES).toEqual(siteaddres);
            });
            it('finds non-standard fields', function () {
                var x = 1;
                var y = 2;
                var derrid = 'blah';
                var sitedesc = 'blah2';
                var stKey = 'blah3';
                var sitename = 'blah4';
                var siteaddres = 'blah5';
                window.AGRCGLOBAL.nonStandardSiteNameLU[99] = 'TESTFIELD';
                window.AGRCGLOBAL.nonStandardSiteAddressLU[99] = 'TESTFIELD2';

                widget.index = 99;
                widget.onLayerClick({
                    graphic: {
                        geometry: {
                            x: x,
                            y: y
                        },
                        attributes: {
                            DERRID: derrid,
                            SITEDESC: sitedesc,
                            ST_KEY: stKey,
                            TESTFIELD: sitename,
                            TESTFIELD2: siteaddres
                        }
                    }
                });

                var loc = defineLocationSpy.calls.mostRecent().args[0];
                expect(loc.x).toEqual(x);
                expect(loc.y).toEqual(y);
                expect(loc.DERRID).toEqual(derrid);
                expect(loc.SITEDESC).toEqual(sitedesc);
                expect(loc.ST_KEY).toEqual(stKey);
                expect(loc.SITENAME).toEqual(sitename);
                expect(loc.SITEADDRES).toEqual(siteaddres);
            });
        });
        describe('getLabelText', function () {
            it('returns default fields', function () {
                expect(widget.getLabelText(['sitename'], 1))
                    .toEqual('{SITENAME}');

                expect(widget.getLabelText(['sitename', 'siteid'], 1))
                    .toEqual('{SITENAME} - {DERRID}');
            });
            it('returns non-standard fields', function () {
                expect(widget.getLabelText(['sitename', 'siteaddress'], 7))
                    .toEqual('{FAC_NAME} - {FAC_ADDRES}');
            });
        });
    });
});
