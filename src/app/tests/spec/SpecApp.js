/* globals AGRCGLOBAL */
/* jshint camelcase:false */
require([
    'app/App',
    'dojo/dom-construct',
    'dojo/_base/window',
    // 'agrc/modules/SGIDQuery',
    'dojo/Deferred',
    'dojo/_base/lang'

],

function (
    App,
    domConstruct,
    win,
    // sgidQuery,
    Deferred,
    lang
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
                }).toThrow(App.noApiKeyErrorTxt);
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
                testWidget2.startup();

                expect(testWidget2.zoomToFeature)
                    .toHaveBeenCalledWith(countyName, testWidget2.zoomTypes.county);
            });
            it('calls zoomToFeature if cityName is passed', function () {
                var cityName = 'blah';
                var testWidget2 = createWidget({cityName: cityName});
                spyOn(testWidget2, 'zoomToFeature');
                testWidget2.startup();

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
                testWidget2.startup();

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
                testWidget2.startup();

                expect(testWidget2.zoomToRouteMilepost)
                    .toHaveBeenCalledWith(rt, mp);
            });
            it('throws error if only one address parameter is passed', function () {
                var testWidget2 = createWidget({
                    addressStreet: 'blah'
                });
                expect(function () {
                    testWidget2.startup();
                }).toThrow(testWidget2.missingAddressTxt);
            });
            it('throws error if only one route/milepost parameter is passed', function () {
                var testWidget2 = createWidget({
                    route: 'blah'
                });
                expect(function () {
                    testWidget2.startup();
                }).toThrow(testWidget2.missingRouteMilepostTxt);
            });
            it('implements the correct init params hierarchy', function () {
                // should be XY -> Address/Rt Milepost -> City -> County -> Zoom to state
                var testWidget2;
                function destroy() {
                    testWidget2.destroyRecursive(false);
                    testWidget2 = null;
                }
                function create(params) {
                    testWidget2 = createWidget(params);
                    spyOn(testWidget2, 'connect');
                    spyOn(testWidget2, 'zoomToAddress');
                    spyOn(testWidget2, 'zoomToRouteMilepost');
                    spyOn(testWidget2, 'zoomToFeature');
                    testWidget2.startup();
                }

                // countyName
                var countyName = 'blah1';
                var params = {countyName: countyName};
                create(params);
                expect(testWidget2.connect.callCount).toBe(1);
                expect(testWidget2.zoomToAddress).not.toHaveBeenCalled();
                expect(testWidget2.zoomToRouteMilepost).not.toHaveBeenCalled();
                expect(testWidget2.zoomToFeature.calls[0].args[0]).toEqual(countyName);
                destroy();

                // cityName
                var cityName = 'blah2';
                lang.mixin(params, {cityName: cityName});
                create(params);
                expect(testWidget2.connect.callCount).toBe(1);
                expect(testWidget2.zoomToAddress).not.toHaveBeenCalled();
                expect(testWidget2.zoomToRouteMilepost).not.toHaveBeenCalled();
                expect(testWidget2.zoomToFeature.calls[0].args[0]).toEqual(cityName);
                destroy();

                // route milepost
                var route = 'blah5';
                var milepost = 'blah6';
                lang.mixin(params, {
                    route: route,
                    milepost: milepost
                });
                create(params);
                expect(testWidget2.connect.callCount).toBe(1);
                expect(testWidget2.zoomToAddress).not.toHaveBeenCalled();
                expect(testWidget2.zoomToRouteMilepost).toHaveBeenCalledWith(route, milepost);
                expect(testWidget2.zoomToFeature).not.toHaveBeenCalled();
                destroy();

                // address
                var street = 'blah3';
                var zone = 'blah4';
                lang.mixin(params, {
                    addressStreet: street,
                    addressZone: zone
                });
                create(params);
                expect(testWidget2.connect.callCount).toBe(1);
                expect(testWidget2.zoomToAddress).toHaveBeenCalledWith(street, zone);
                expect(testWidget2.zoomToRouteMilepost).not.toHaveBeenCalled();
                expect(testWidget2.zoomToFeature).not.toHaveBeenCalled();
                destroy();

                // XY
                lang.mixin(params, {
                    UTM_X: 1,
                    UTM_Y: 2
                });
                create(params);
                expect(testWidget2.connect.callCount).toBe(2);
                expect(testWidget2.zoomToAddress).not.toHaveBeenCalled();
                expect(testWidget2.zoomToRouteMilepost).not.toHaveBeenCalled();
                expect(testWidget2.zoomToFeature).not.toHaveBeenCalled();
                destroy();
            });
        });
        describe('zoomToFeature', function () {
            // it('calls SGIDQuery::getFeatureGeometry', function () {
            //     spyOn(sgidQuery, 'getFeatureGeometry').andReturn(new Deferred());
            //     var value = 'blah';

            //     testWidget.zoomToFeature(value, testWidget.zoomTypes.county);

            //     expect(sgidQuery.getFeatureGeometry).toHaveBeenCalledWith(
            //         testWidget.zoomTypes.county.fcName, testWidget.zoomTypes.county.fldName, value);
            // });
            // it('call show error when no feature is found', function () {
            //     var def = new Deferred();
            //     spyOn(sgidQuery, 'getFeatureGeometry').andReturn(def);
            //     spyOn(testWidget, 'showError');

            //     testWidget.zoomToFeature('blah', testWidget.zoomTypes.county);
            //     def.reject('blah');

            //     expect(testWidget.showError).toHaveBeenCalledWith('County: blah not found!');
            // });
            // it('zooms the map if successful', function () {
            //     var value = 'blah';
            //     spyOn(testWidget.map, 'setExtent');
            //     var def = new Deferred();
            //     spyOn(sgidQuery, 'getFeatureGeometry').andReturn(def);

            //     testWidget.zoomToFeature('KANE', testWidget.zoomTypes.county);
            //     def.resolve(value);

            //     expect(testWidget.map.setExtent).toHaveBeenCalledWith(value);
            // });
            // it('works with city/towns', function () {
            //     spyOn(sgidQuery, 'getFeatureGeometry').andReturn(new Deferred());
            //     var value = 'blah';

            //     testWidget.zoomToFeature(value, testWidget.zoomTypes.citytown);

            //     expect(sgidQuery.getFeatureGeometry).toHaveBeenCalledWith(
            //         testWidget.zoomTypes.citytown.fcName, testWidget.zoomTypes.citytown.fldName, value);
            // });
        });
        describe('showError', function () {
            it('calls alert with the message', function () {
                var value = 'blah';
                spyOn(window, 'alert');

                testWidget.showError(value);

                expect(window.alert).toHaveBeenCalledWith(value);
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

                expect(widget.txt_address.value).toEqual(add);
                expect(widget.txt_zone.value).toEqual(zone);
            });
            it('call geocodeAddress', function () {
                spyOn(widget, 'geocodeAddress').andReturn(new Deferred());

                testWidget.zoomToAddress(add, zone);

                expect(widget.geocodeAddress).toHaveBeenCalled();
            });
            it('removes the address params and refires parseParams on error', function () {
                var def = new Deferred();
                spyOn(testWidget, 'parseParams');
                spyOn(testWidget.findAddressWidget, 'geocodeAddress').andReturn(def);

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
                widget = testWidget.findWidget;
            });
            it('sets the address and zone values in the find address widget', function () {
                testWidget.zoomToRouteMilepost(route, milepost);

                expect(widget.routeTxt.value).toEqual(route);
                expect(widget.milepostTxt.value).toEqual(milepost);
            });
            it('call _onFindClick', function () {
                spyOn(widget, '_onFindClick').andReturn(new Deferred());

                testWidget.zoomToRouteMilepost(route, milepost);

                expect(widget._onFindClick).toHaveBeenCalled();
            });
            it('removes the address params and refires parseParams on error', function () {
                var def = new Deferred();
                spyOn(testWidget, 'parseParams');
                spyOn(testWidget.findWidget, '_onFindClick').andReturn(def);

                testWidget.zoomToRouteMilepost(route, milepost);
                def.reject();

                expect(testWidget.parseParams).toHaveBeenCalled();
                expect(testWidget.route).toBeNull();
                expect(testWidget.milepost).toBeNull();
            });
        });
        describe('clearAllFields', function () {
            it('clear all input fields', function () {
                testWidget.zoomWidget.w_deg_dm.value = 'blah';
                testWidget.findAddressWidget.txt_address.value = 'blah';
                testWidget.magicZoom.textBox.textbox.value = 'blah';

                testWidget.clearAllFields();

                expect(isNaN(testWidget.zoomWidget.w_deg_dm.get('Value'))).toBe(true);
                expect(testWidget.findAddressWidget.txt_address.value).toEqual('');
                expect(testWidget.magicZoom.textBox.textbox.value).toEqual('');
            });
        });
    });
});