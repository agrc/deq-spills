import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import type { DataContext } from '../contexts/DataProvider';

const utm = new SpatialReference({ wkid: 26912 });
const wgs = new SpatialReference({ wkid: 4326 });
export async function defineLocation(point: __esri.Point): Promise<DataContext['data']> {
  if (!projectOperator.isLoaded()) {
    await projectOperator.load();
  }

  const utmPoint = projectOperator.execute(point, utm) as __esri.Point;
  const wgsPoint = projectOperator.execute(point, wgs) as __esri.Point;

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
