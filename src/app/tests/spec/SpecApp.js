/* globals AGRCGLOBAL */
/* jshint camelcase:false */
require([
    'app/App',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/dom-class',
    // 'agrc/modules/SGIDQuery',
    'dojo/Deferred',
    'dojo/_base/lang',
    'dojo/query'

],

function (
    App,
    domConstruct,
    win,
    domClass,
    // sgidQuery,
    Deferred,
    lang,
    query
    ) {
    describe('app/App', function () {
        var testWidget;
        var apiKey = 'AGRC-711483DB443447';
        function createWidget(params) {
            var defaultParams = {
                apiKey: apiKey
            };
            return new App(lang.mixin(defaultParams, params),
                domConstruct.create('div', null, win.body()));
        }
        beforeEach(function () {
            testWidget = createWidget();
            testWidget.startup();
        });
        afterEach(function () {
            testWidget.destroyRecursive(false);
            testWidget = null;
        });

        describe('constructor', function () {
            it('creates a valid object', function () {
                expect(testWidget).toEqual(jasmine.any(App));
            });
            it('set\'s AGRCGLOBAL.apiKey', function () {
                expect(AGRCGLOBAL.apiKey).toEqual(apiKey);
            });
            it('throws an error if no apiKey is passed', function () {
                expect(function () {
                    new App();
                }).toThrow(testWidget.noApiKeyErrorTxt);
            });
        });
        describe('postCreate', function () {
            it('calls wireEvents', function () {
                spyOn(testWidget, 'wireEvents');

                testWidget.postCreate();

                expect(testWidget.wireEvents).toHaveBeenCalled();
            });
        });
        describe('wireEvents', function () {
            it('wires the clear button', function () {
                spyOn(testWidget, 'clearAllFields');

                testWidget.clearBtn.click();

                expect(testWidget.clearAllFields).toHaveBeenCalled();
            });
        });
        describe('startup', function () {
            beforeEach(function () {
                testWidget.destroyRecursive();
            });
            it('calls zoomToFeature if countyName is passed', function () {
                var countyName = 'blah';
                var testWidget2 = createWidget({countyName: countyName});
                spyOn(testWidget2, 'zoomToFeature');
                testWidget2.parseParams();

                expect(testWidget2.zoomToFeature)
                    .toHaveBeenCalledWith(countyName, testWidget2.zoomTypes.county);
            });
            it('calls zoomToFeature if cityName is passed', function () {
                var cityName = 'blah';
                var testWidget2 = createWidget({cityName: cityName});
                spyOn(testWidget2, 'zoomToFeature');
                testWidget2.parseParams();

                expect(testWidget2.zoomToFeature)
                    .toHaveBeenCalledWith(cityName, testWidget2.zoomTypes.citytown);
            });
            it('calls find address if addressStreet and addressZone are passed', function () {
                var street = 'blah';
                var zone = 'blah2';
                var testWidget2 = createWidget({
                    addressStreet: street,
                    addressZone: zone
                });
                spyOn(testWidget2, 'zoomToAddress');
                testWidget2.parseParams();

                expect(testWidget2.zoomToAddress)
                    .toHaveBeenCalledWith(street, zone);
            });
            it('calls find routeMilepost if route and milepost are passed', function () {
                var rt = 'blah';
                var mp = '2';
                var testWidget2 = createWidget({
                    route: rt,
                    milepost: mp
                });
                spyOn(testWidget2, 'zoomToRouteMilepost');
                testWidget2.parseParams();

                expect(testWidget2.zoomToRouteMilepost)
                    .toHaveBeenCalledWith(rt, mp);
            });
            it('throws error if only one address parameter is passed', function () {
                var testWidget2 = createWidget({
                    addressStreet: 'blah'
                });
                expect(function () {
                    testWidget2.parseParams();
                }).toThrow(testWidget2.missingAddressErrTxt);
            });
            it('throws error if only one route/milepost parameter is passed', function () {
                var testWidget2 = createWidget({
                    route: 'blah'
                });
                expect(function () {
                    testWidget2.parseParams();
                }).toThrow(testWidget2.missingRouteMilepostTxt);
            });
        });
        describe('zoomToFeature', function () {
        });
        describe('showError', function () {
            it('calls alert with the message', function () {
                var value = 'blah';
                spyOn(window, 'alert');

                testWidget.showError(value);

                expect(testWidget.errMsg.innerHTML).toEqual(value);
                expect(domClass.contains(testWidget.errMsg, 'hidden')).toBe(false);
            });
        });
        describe('zoomToAddress', function () {
            var add;
            var zone;
            var widget;
            beforeEach(function () {
                add = '2932 banbury rd';
                zone = '84121';
                widget = testWidget.findAddressWidget;
            });
            it('sets the address and zone values in the find address widget', function () {
                testWidget.zoomToAddress(add, zone);

                expect(widget.txtAddress.value).toEqual(add);
                expect(widget.txtZone.value).toEqual(zone);
            });
            it('call _invokeWebService', function () {
                spyOn(widget, '_invokeWebService').and.returnValue(new Deferred());

                testWidget.zoomToAddress(add, zone);

                expect(widget._invokeWebService).toHaveBeenCalled();
            });
            it('removes the address params and refires parseParams on error', function () {
                var def = new Deferred();
                spyOn(testWidget, 'parseParams');
                spyOn(testWidget.findAddressWidget, '_invokeWebService').and.returnValue(def);

                testWidget.zoomToAddress(add, zone);
                def.reject();

                expect(testWidget.parseParams).toHaveBeenCalled();
                expect(testWidget.addressStreet).toBeNull();
                expect(testWidget.addressZone).toBeNull();
            });
        });
        describe('zoomToRouteMilepost', function () {
            var route;
            var milepost;
            var widget;
            beforeEach(function () {
                route = '15';
                milepost = '300';
                widget = testWidget.findRouteMilepostWidget;
            });
            it('sets the address and zone values in the find address widget', function () {
                testWidget.zoomToRouteMilepost(route, milepost);

                expect(widget.routeTxt.value).toEqual(route);
                expect(widget.milepostTxt.value).toEqual(milepost);
            });
            it('call _onFindClick', function () {
                spyOn(widget, '_onFindClick').and.returnValue(new Deferred());

                testWidget.zoomToRouteMilepost(route, milepost);

                expect(widget._onFindClick).toHaveBeenCalled();
            });
            it('removes the address params and refires parseParams on error', function () {
                var def = new Deferred();
                spyOn(testWidget, 'parseParams');
                spyOn(testWidget.findRouteMilepostWidget, '_onFindClick').and.returnValue(def);

                testWidget.zoomToRouteMilepost(route, milepost);
                def.reject();

                expect(testWidget.parseParams).toHaveBeenCalled();
                expect(testWidget.route).toBeNull();
                expect(testWidget.milepost).toBeNull();
            });
        });
        describe('clearAllFields', function () {
            it('clear all input fields', function () {
                var zoomTextbox = query('input[type="text"]', testWidget.zoomWidget.domNode)[0];
                zoomTextbox.value = 'blah';
                testWidget.findAddressWidget.txtAddress.value = 'blah';
                testWidget.magicZoom.textBox.value = 'blah';

                testWidget.clearAllFields();

                expect(zoomTextbox.value).toBe('');
                expect(testWidget.findAddressWidget.txtAddress.value).toEqual('');
                expect(testWidget.magicZoom.textBox.value).toEqual('');
            });
        });
        describe('onMapClick', function () {
            it('doesnt do anything if a graphic was clicked', function () {
                spyOn(testWidget, 'addGraphic');
                spyOn(testWidget, 'defineLocation');

                testWidget.onMapClick({graphic: {}});

                expect(testWidget.addGraphic).toHaveBeenCalled();
                expect(testWidget.defineLocation).not.toHaveBeenCalled();
            });
        });
    });
});