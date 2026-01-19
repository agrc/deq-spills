import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { search, type ApiErrorResponse, type SearchResponse } from '@ugrc/utilities';
import config from '../config';
import type { DataContextType } from '../contexts/DataProvider';

type StringOrNull = string | null;

const webMercatorWkid = 3857;
const utm = new SpatialReference({ wkid: 26912 });
const wgs = new SpatialReference({ wkid: 4326 });
export async function defineLocation(
  point: __esri.Point,
  address: StringOrNull = null,
  highway: StringOrNull = null,
  milemarker: StringOrNull = null,
): Promise<Omit<DataContextType['data'], 'FLOWPATH_LENGTH' | 'ID' | 'SPILL_NUMBER'>> {
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
  const agency = await queryApi(queries.agency.table, queries.agency.field, utmPoint);
  const locationData = {
    // make sure that the following properties stay in sync with the properties in salesforce/force-app/main/default/lwc/spills/spills.js
    ADDRESS: address,
    CITY: await queryApi(queries.city.table, queries.city.field, utmPoint),
    COUNTY: await queryApi(queries.county.table, queries.county.field, utmPoint),
    DD_LAT: Number(wgsPoint.y.toFixed(6)),
    DD_LONG: Number(wgsPoint.x.toFixed(6)),
    HIGHWAY: highway,
    INDIAN: agency === 'Tribal',
    MILEMARKER: milemarker,
    OWNER_AGENCY: agency,
    UTM_X: Math.round(utmPoint.x),
    UTM_Y: Math.round(utmPoint.y),
  };

  return locationData;
}

async function queryApi(table: string, field: string, point: __esri.Point): Promise<string | null> {
  const apiKey = import.meta.env.VITE_WEB_API;
  const result = await search(apiKey, table, [field], {
    geometry: `point:${JSON.stringify(point.toJSON())}`,
  });

  if ((result as ApiErrorResponse).status) {
    console.error('error querying api', result);

    return null;
  }

  if ((result as SearchResponse['result']).length === 0) {
    console.warn(`no results found for ${table} query`);

    return null;
  }

  return (result as SearchResponse['result'])[0]!.attributes[field] as string;
}
