define([
    'dojo/_base/declare', 
    'agrc/widgets/locate/FindAddress',
    'dojo/text!app/templates/FindAddress.html',
    'dojo/string',
    'dojo/Deferred'

],

function (
    declare, 
    FindAddress,
    template,
    string,
    Deferred
    ) {
    // summary:
    //      Inherits from agrc/widgets/locate/FindAddress. Created a project specific one to get a better template.
    return declare('app/FindAddress', 
        [FindAddress], {
        widgetsInTemplate: false,
        templateString: template,

        _validate: function () {
            // summary:
            //      validates the widget
            // description:
            //      makes sure the street and zone have valid data
            // tags:
            //      private
            // returns:
            //      bool
            console.info(this.declaredClass + "::" + arguments.callee.nom);

            var ok = true;

            // hide error message
            dojo.style(this.errorMsg, 'display', 'none');

            // check for valid address and zone
            if (this.txt_address.value.length === 0) {
                ok = false;
            }

            if (this.txt_zone.value.length === 0) {
                ok = false;
            }

            return ok;
        },
        geocodeAddress: function () {
            // summary:
            //      Geocodes the address if the text boxes validate.
            // returns: Deferred
            console.info(this.declaredClass + '::' + arguments.callee.nom);

            if (this._validate()) {
                dojo.publish('agrc.widgets.locate.FindAddress.OnFindStart');

                var that = this;

                // this.btn_geocode.makeBusy();

                if (this.map) {
                    if (this._graphic) {
                        this.graphicsLayer.remove(this._graphic);
                    }
                }

                var address = this.txt_address.value;
                var zone = this.txt_zone.value;

                var deferred = this._invokeWebService({ address: address, zone: zone });
                var def = new Deferred();

                dojo.when(deferred, function (response) {
                    if (response.status !== 200) {
                        that._onError();
                        def.reject();
                    }
                    that._onFind(response);
                }, function () {
                    that._onError();
                    def.reject();
                });

                return def;
            }
            else {
                // this.btn_geocode.cancel();
            }
        },
        _onFind: function (result) {
            // summary:
            //      handles a successful geocode
            // description:
            //      zooms the map if there is one. publishes the result
            // tags:
            //      private
            console.info(this.declaredClass + "::" + arguments.callee.nom);


            if (this.map) {
                var point = new esri.geometry.Point(result.result.location.x, result.result.location.y, this.map.spatialReference);

                if (this.map.getLevel() > -1) {
                    this.map.centerAndZoom(point, this.zoomLevel);
                }
                else {
                    this.map.centerAndZoom(point, esri.geometry.getScale(this.map.extent, this.map.width, this.map.spatialReference.wkid) / this.zoomLevel);
                }

                this._graphic = new esri.Graphic(point, this.symbol);
                this.graphicsLayer.add(this._graphic);
            }

            this.onFind(result);
            // this.btn_geocode.cancel();

            dojo.publish("agrc.widgets.locate.FindAddress.OnFind", [result]);
        },
        _invokeWebService: function (args) {
            // summary:
            //      calls the web service
            // description:
            //      sends the request to the wsut webservice
            // tags:
            //      private
            // returns:
            //     Deferred 
            console.info(this.declaredClass + "::" + arguments.callee.nom);

            var url = 'http://api.mapserv.utah.gov/api/v1/Geocode/${street}/${zone}?apiKey=${key}';

            var params = {
                callbackParamName: "callback",
                url: string.substitute(url, {
                    street: args.address,
                    zone: args.zone,
                    key: AGRCGLOBAL.apiKey
                }),
                handleAs: "json",
                timeout: this._timeout,
                preventCache: true
            };

            return dojo.io.script.get(params);
        },
        _onError: function (err) {
            // summary:
            //      handles script io geocoding error
            // description:
            //      publishes error
            // tags:
            //      private
            // returns:
            //       
            console.info(this.declaredClass + "::" + arguments.callee.nom);

            dojo.style(this.errorMsg, 'display', 'inline');

            // re-enable find button
            // this.btn_geocode.cancel();

            dojo.publish('agrc.widgets.locate.FindAddress.OnFindError', [err]);
        }
    });
});