import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import type { DataContext } from '../contexts/DataProvider';

const webMercatorWkid = 3857;
const utm = new SpatialReference({ wkid: 26912 });
const wgs = new SpatialReference({ wkid: 4326 });
export async function defineLocation(point: __esri.Point): Promise<DataContext['data']> {
  if (!projectOperator.isLoaded()) {
    await projectOperator.load();
  }

  let wgsPoint;
  let utmPoint;

  if (point.spatialReference.wkid === webMercatorWkid) {
    // point from map click
    utmPoint = projectOperator.execute(point, utm) as __esri.Point;
    wgsPoint = projectOperator.execute(point, wgs) as __esri.Point;
  } else if (point.spatialReference.wkid === utm.wkid) {
    // point from coordinates component
    utmPoint = point;
    wgsPoint = projectOperator.execute(point, wgs) as __esri.Point;
  } else {
    throw new Error(`Unsupported spatial reference: ${point.spatialReference.wkid}`);
  }

  const locationData: DataContext['data'] = {
    ADDRESS: null,
    CITY: null,
    COUNTY: null,
    DD_LAT: Number(wgsPoint.y.toFixed(6)),
    DD_LONG: Number(wgsPoint.x.toFixed(6)),
    HIGHWAY: null,
    INDIAN: false,
    MILEMARKER: null,
    OWNER_AGENCY: null,
    UTM_X: Math.round(utmPoint.x),
    UTM_Y: Math.round(utmPoint.y),
    ZIP: null,
  };

  return locationData;
}
