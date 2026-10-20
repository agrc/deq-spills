import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { useEffect } from 'react';
import useData from '../hooks/useDataProvider';
import { queryNearestWaterBody } from '../utilities/queryNearestWaterBody';
import { getWaterbodyEnabled } from '../utilities/urlParameters';

const utmWkid = 26912;
const webMercatorWkid = 3857;
const webMercator = new SpatialReference({ wkid: webMercatorWkid });

export default function useWaterbody() {
  const { data, setData } = useData();

  useEffect(() => {
    if (data.UTM_X === null || data.UTM_Y === null) {
      return;
    }
    function computeWebMercatorPoint() {
      const utmPoint = new Point({
        x: Number(data.UTM_X),
        y: Number(data.UTM_Y),
        spatialReference: { wkid: utmWkid },
      });
      const webMercatorPoint = projectOperator.execute(utmPoint, webMercator) as __esri.Point;
      return webMercatorPoint;
    }
    const isWaterbodyEnabled = getWaterbodyEnabled();
    if (!isWaterbodyEnabled) {
      return;
    }
    console.log('Waterbody: change detected in UTM');
    async function fetchNearestWaterBody() {
      if (!projectOperator.isLoaded()) {
        await projectOperator.load();
      }

      const webMercatorPoint = computeWebMercatorPoint();
      const nearestWaterBody = await queryNearestWaterBody(webMercatorPoint);
      const toReturn = {
        NEAREST_WATERBODY_DISTANCE: nearestWaterBody?.distanceInFeet ?? null,
        NEAREST_WATERBODY_ID: nearestWaterBody?.id ?? null,
        NEAREST_WATERBODY_NAME: !isWaterbodyEnabled
          ? null
          : nearestWaterBody === null
            ? 'No water bodies found'
            : (nearestWaterBody?.name || 'Unnamed water body'),
      };
      console.log('nearest waterbody: sending info to Salesforce', {
        enabled: isWaterbodyEnabled,
        name: toReturn.NEAREST_WATERBODY_NAME,
        id: toReturn.NEAREST_WATERBODY_ID,
        distanceInFeet: toReturn.NEAREST_WATERBODY_DISTANCE,
      });

      setData((prevData) => {
        if (prevData.UTM_X !== data.UTM_X || prevData.UTM_Y !== data.UTM_Y) {
          return prevData;
        }
        return {
          ...prevData,
          ...toReturn,
        };
      });
    }
    fetchNearestWaterBody();
  }, [data.UTM_X, data.UTM_Y, setData]);
}
