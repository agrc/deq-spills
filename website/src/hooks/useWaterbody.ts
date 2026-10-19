import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { useEffect } from 'react';
import { queryNearestWaterBody } from '../utilities/queryNearestWaterBody';
import useData from './useDataProvider';

const utm = new SpatialReference({ wkid: 26912 });
const webMercator = new SpatialReference({ wkid: 3857 });

export default function useWaterbody(enabled: boolean) {
  const { data, setData } = useData();

  useEffect(() => {
    let isCurrent = true;

    if (
      !enabled ||
      data.UTM_X === null ||
      !Number.isFinite(data.UTM_X) ||
      data.UTM_Y === null ||
      !Number.isFinite(data.UTM_Y)
    ) {
      setData((previousData) => {
        if (
          previousData.NEAREST_WATERBODY_DISTANCE === null &&
          previousData.NEAREST_WATERBODY_ID === null &&
          previousData.NEAREST_WATERBODY_NAME === null
        ) {
          return previousData;
        }

        return {
          ...previousData,
          NEAREST_WATERBODY_DISTANCE: null,
          NEAREST_WATERBODY_ID: null,
          NEAREST_WATERBODY_NAME: null,
        };
      });

      return () => {
        isCurrent = false;
      };
    }

    setData((previousData) => {
      if (
        previousData.NEAREST_WATERBODY_DISTANCE === null &&
        previousData.NEAREST_WATERBODY_ID === null &&
        previousData.NEAREST_WATERBODY_NAME === null
      ) {
        return previousData;
      }

      return {
        ...previousData,
        NEAREST_WATERBODY_DISTANCE: null,
        NEAREST_WATERBODY_ID: null,
        NEAREST_WATERBODY_NAME: null,
      };
    });

    const utmX = data.UTM_X;
    const utmY = data.UTM_Y;
    const loadWaterbody = async () => {
      try {
        if (!projectOperator.isLoaded()) {
          await projectOperator.load();
        }

        const utmPoint = new Point({
          x: utmX,
          y: utmY,
          spatialReference: utm,
        });
        const webMercatorPoint = projectOperator.execute(utmPoint, webMercator) as __esri.Point;
        const nearestWaterbody = await queryNearestWaterBody(webMercatorPoint);

        if (!isCurrent) {
          return;
        }

        setData((previousData) => ({
          ...previousData,
          NEAREST_WATERBODY_DISTANCE: nearestWaterbody?.distanceInFeet ?? null,
          NEAREST_WATERBODY_ID: nearestWaterbody?.id ?? null,
          NEAREST_WATERBODY_NAME:
            nearestWaterbody === null ? 'No water bodies found' : (nearestWaterbody.name ?? 'Unnamed water body'),
        }));
      } catch (error) {
        if (isCurrent) {
          console.error('Error querying nearest waterbody:', error);
        }
      }
    };

    void loadWaterbody();

    return () => {
      isCurrent = false;
    };
  }, [data.UTM_X, data.UTM_Y, enabled, setData]);
}
