import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import config from '../config';
import type { DataContextType } from '../contexts/DataProvider';

type StringOrNull = string | null;

const webMercatorWkid = 3857;
const utm = new SpatialReference({ wkid: 26912 });
const wgs = new SpatialReference({ wkid: 4326 });
const queryLayers = {
  agency: new FeatureLayer({ url: config.LOCATION_QUERIES.agency.url }),
  city: new FeatureLayer({ url: config.LOCATION_QUERIES.city.url }),
  county: new FeatureLayer({ url: config.LOCATION_QUERIES.county.url }),
};

export async function defineLocation(
  point: __esri.Point,
  address: StringOrNull = null,
  highway: StringOrNull = null,
  milemarker: StringOrNull = null,
): Promise<
  Omit<
    DataContextType['data'],
    | 'FLOWPATH_LENGTH'
    | 'ID'
    | 'SPILL_NUMBER'
    | 'NEAREST_WATERBODY_DISTANCE'
    | 'NEAREST_WATERBODY_ID'
    | 'NEAREST_WATERBODY_NAME'
  >
> {
  if (!projectOperator.isLoaded()) {
    await projectOperator.load();
  }

  let wgsPoint;
  let utmPoint;

  if (point.spatialReference.wkid === webMercatorWkid) {
    // point from map click or geocode
    utmPoint = projectOperator.execute(point, utm) as __esri.Point;
    wgsPoint = projectOperator.execute(point, wgs) as __esri.Point;
  } else if (point.spatialReference.wkid === utm.wkid) {
    // point from coordinates component
    utmPoint = point;
    wgsPoint = projectOperator.execute(point, wgs) as __esri.Point;
  } else {
    throw new Error(`Unsupported spatial reference: ${point.spatialReference.wkid}`);
  }

  const queries = config.LOCATION_QUERIES;
  const agency = await queryFeatureService(queryLayers.agency, queries.agency.field, utmPoint);
  const locationData = {
    // make sure that the following properties stay in sync with the properties in salesforce/force-app/main/default/lwc/spills/spills.js
    ADDRESS: address,
    CITY: await queryFeatureService(queryLayers.city, queries.city.field, utmPoint),
    COUNTY: await queryFeatureService(queryLayers.county, queries.county.field, utmPoint),
    DD_LAT: Number(wgsPoint.y.toFixed(6)),
    DD_LONG: Number(wgsPoint.x.toFixed(6)),
    HIGHWAY: highway,
    INDIAN: agency === 'BIA',
    MILEMARKER: milemarker,
    OWNER_AGENCY: agency,
    UTM_X: Math.round(utmPoint.x),
    UTM_Y: Math.round(utmPoint.y),
  };

  return locationData;
}

async function queryFeatureService(
  layer: __esri.FeatureLayer,
  field: string,
  point: __esri.Point,
): Promise<string | null> {
  let result: __esri.FeatureSet;
  try {
    result = await layer.queryFeatures({
      geometry: point,
      outFields: [field],
      returnGeometry: false,
      spatialRelationship: 'intersects',
    });
  } catch (error) {
    console.error('error querying feature service', error);
    return null;
  }

  if (result.features.length === 0) {
    console.warn(`no results found for ${layer.url} query`);

    return null;
  }

  return result.features[0]!.attributes[field] as string;
}
