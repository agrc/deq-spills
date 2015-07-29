deq-spills
==========

Embedded widget written for deq spills application.

See [src/embed-demo.html](src/embed-demo.html) for an example of how to embed this widget and get data from it.

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
