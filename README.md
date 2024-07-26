# DEQ Spills Web Application & Salesforce Integration

This projects consists of two parts:

- Firebase web mapping application
- Salesforce Lightning Component

## Firebase

This web site is embedded via iframe in several DEQ web applications. See [src/index.html](src/index.html) for an example of how this is done.

Staging: <https://deqspills.dev.utah.gov/>

Production: <https://deqspills.ugrc.utah.gov/>

### Parameters

The following may be passed as URL parameters to the web application. The order below indicates the precedence if multiple values are passed.

- `UTM_X` & `UTM_Y`: This will center the map on the given UTM coordinates and show a point symbol.
- `DD_LAT` & `DD_LON`: This will center the map on the given Decimal Degrees coordinates and show a point symbol.
- `DMS_DEGREE_LAT`, `DMS_MINUTE_LAT`, `DMS_SECOND_LAT`, `DMS_DEGREE_LON`, `DMS_MINUTE_LON`, `DMS_SECOND_LON`: This will center the map on the given Degrees Minutes Seconds coordinates and show a point symbol.
- `addressStreet` & `addressZone`: This will center the map on the given address and show a point symbol. `addressZone` can be a city or zip code.
- `route` & `milepost`: This will center the map on the given route and milepost and show a point symbol.
- `BASEMERIDIAN` & `TOWNSHIP` & `RANGE` & `SECTION`: This will center the map on the given PLSS coordinates.
- `ZIP`: This will center the map on the given zip code.
- `cityName`: This will center the map on the given city.
- `countyName`: This will center the map on the given county.

Some examples:

Street address
<https://deqspills.ugrc.utah.gov/?addressStreet=123%20s%20main%20st&addressZone=slc/>

UTM coordinates
<https://deqspills.ugrc.utah.gov/?UTM_X=424333&UTM_Y=4513333/>

UTM coordinates will take precedence
<https://deqspills.ugrc.utah.gov/?UTM_X=424333&UTM_Y=4513333&DD_LAT=39.1&DD_LONG=-112.4/>

## Salesforce

This project also contains a Salesforce Lightning Component ([/salesforce](/salesforce/)) that embeds the Firebase web application via iframe in a similar way to other DEQ web applications.

Development Sandbox: <https://utahdeqorg--eid.sandbox.my.salesforce.com/>

Production Salesforce Instance: <https://utahdeqorg.lightning.force.com/>

## Development

>[!NOTE]
>For DEQ web developers developing on `localhost`: You need to define the following global variable and pass a wide-open quad word: `AGRC_testQuadWord`.

### Firebase

Pushes to `dev` and `main` branches will automatically deploy to staging and production Firebase instance respectively using the standard UGRC release and deploy actions.

### Salesforce

The Salesforce Lightning Component is developed in the `/salesforce` directory. The component is built using the [Salesforce Lightning Web Components](https://developer.salesforce.com/docs/component-library/documentation/en/lwc) framework.

#### Setup

1. Install the [Salesforce CLI](https://developer.salesforce.com/tools/sfdxcli)
1. Authenticate with the DEQ Salesforce org: `sfdx org login web --instance-url https://utahdeqorg--eid.sandbox.my.salesforce.com/ --alias spillsSandbox`
1. Right-click on `manifest/package.xml` and select `SFDX: Retrieve Source in Manifest from Org`

#### Deploy To Sandbox

1. Right-click on `lwc` folder and select `SFDX: Deploy Source to Org`
1. Go to a case record in the sandbox (e.g. <https://utahdeqorg--eid.sandbox.lightning.force.com/lightning/r/Case/5003R000007Vao4QAC/view>)
1. Click the gear icon in the upper right corner and select `Edit Page`
1. Click on the "Save" button and then go back to the page (this is a hack to make sure that salesforce gets your changes).

#### Deploy To Production

1. Setup Cog button -> Setup
1. Quick Find -> Outbound Change Sets
1. Create a new set and add the component(s) that you want to deploy
1. Upload the change set and then ask Barry to deploy your change set to production.
