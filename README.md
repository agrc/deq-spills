[![Build Status](https://travis-ci.org/agrc/deq-spills.svg?branch=master)](https://travis-ci.org/agrc/deq-spills)
deq-spills
==========

Embedded widget written for deq spills application.

See [src/embed-demo.html](src/embed-demo.html) for an example of how to embed this widget and get data from it.

### API
#### constructor
`new AGRCMap(options, node)`  
parameter: `options`  
type: `object`  
properties (for examples check out [embed-demo.html](src/embed-demo.html)):  

|name|type|description|
|---|---|---|
|`apiKey`|`string`|your api key|
|`layers`|`number[]`|The indices of the layers that you want to show in the map. They should correspond with the layers in the [map service](http://mapserv.utah.gov/arcgis/rest/services/DEQSpills/MapService/MapServer).|
|`countyName`|`string`|Name of the county that you want to zoom to.|
|`cityName`|`string`|Name of the city that you want to zoom to.|
|`zip`|`number`|The zip code that you want to zoom to.|
|`UTM_X`/`UTM_Y`|`number`|The coords (in UTM) of the point that you want to initialize the map with.|
|`DD_LAT`/`DD_LONG`|`number`|The coords (in decimal degrees) of the point that you want to initialize the map with.|
|`DMS_DEGREE_LAT`/`DMS_MINUTE_LAT`/`DMS_SECOND_LAT` `DMS_DEGREE_LONG`/`DMS_MINUTE_LONG`/`DMS_SECOND_LONG`|`number`|The coords (in degrees, minutes, seconds) of the point that you want to initialize the map with.|
|`addressStreet`|`string`|Address that you want to zoom to. Requires `addressZone`.|
|`addressZone`|`string`|Zip or city of `addressStreet`.|
|`route`|`string`|The UDOT route that you want to zoom to.|
|`milepost`|`string`|Milepost of `route` that you want to zoom to.|
|`BASEMERIDIAN`/`TOWNSHIP`/`RANGE`/`SECTION`|`string`|The TRS that you want to zoom to.
|`labels`|`string[]`|A array of labels that you want to show in the map. Accepted values are: `sitename`, `siteaddress` and `siteid`.

### Location Data Returned
property: `BASEMERIDIAN`  
type: `string`  
source: `SGID10.CADASTRE.PLSSSections_GCDB:BASEMERIDIAN`  

property: `CITY`  
type: `string`  
source: `SGID10.BOUNDARIES.Municipalities:NAME`  

property: `COUNTY`  
type: `string`  
source: `SGID10.BOUNDARIES.Counties:NAME`  

property: `DD_LAT`  
type: `number`  
source: point on map  

property: `DD_LONG`  
type: `number`  
source: point on map  

property: `DERRID`  
type: `string`  
source: `DERRID` of point graphic that was clicked on the map  

property: `DMS_LAT`  
type: `number`  
source: point on map  

property: `DMS_LONG`  
type: `number`  
source: point on map  

property: `INDIAN`  
type: `boolean`  
source: `SGID10.CADASTRE.LandOwnership:AGENCY == 'Tribal'`  

property: `OWNER_AGENCY`  
type: `string`  
source: `SGID10.CADASTRE.LandOwnership:AGENCY`  

property: `RANGE`  
type: `string`  
source: `SGID10.CADASTRE.PLSSSections_GCDB:LABEL` (partial)  

property: `SECTION`  
type: `number`  
source: `SGID10.CADASTRE.PLSSSections_GCDB:SNUM`

property: `SITEDESC`  
type: `string`  
source: `SITEDESC` of point graphic that was clicked on the map  

property: `ST_KEY`  
type: `number`  
source: `ST_KEY` of point graphic that was clicked on the map  

property: `TOWNSHIP`  
type: `string`  
source: `SGID10.CADASTRE.PLSSSections_GCDB:LABEL` (partial)  

property: `UTM_X`  
type: `string`  
source: point on map  

property: `UTM_Y`  
type: `string`  
source: point on map  

property: `ZIP`  
type: `string`  
source: `SGID10.BOUNDARIES.ZipCodes:ZIP5`  

property: `ZIPCITY`  
type: `string`  
source: `SGID10.BOUNDARIES.ZipCodes:NAME`  

property: `SITENAME`  
type: `string`  
source: `SITENAME` of the point graphic that was clicked. This may be mapped from a [different field](src/app/config.js) for some datasets.

property: `SITEADDRES`  
type: `string`  
source: `SITEADDRES` of the point graphic that was clicked. This may be mapped from a [different field](src/app/config.js) for some datasets.
