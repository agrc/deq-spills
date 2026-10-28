import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { useEffect, useRef } from 'react';
import useData from '../hooks/useDataProvider';
import { queryNearestWaterBody } from '../utilities/queryNearestWaterBody';
import { getWaterbodyEnabled } from '../utilities/urlParameters';

const utmWkid = 26912;
const webMercatorWkid = 3857;
const webMercator = new SpatialReference({ wkid: webMercatorWkid });

type Location = { x: number; y: number };
type InitialLocation = Location & { waterbodyId: string | null };

function isSameLocation(a: Location | null, b: Location) {
  return a !== null && a.x === b.x && a.y === b.y;
}

export default function useWaterbody(
  mapView: __esri.MapView | null,
  streamsFeatureLayer: __esri.FeatureLayer | null,
  riversFeatureLayer: __esri.FeatureLayer | null,
) {
  const { data, isInitialDataLoaded, setData } = useData();

  // undefined: initial data not loaded yet; null: initial data had no location
  const initialLocation = useRef<InitialLocation | null | undefined>(undefined);
  const lastHandledLocation = useRef<Location | null>(null);

  useEffect(() => {
    if (isInitialDataLoaded && initialLocation.current === undefined) {
      initialLocation.current =
        data.UTM_X !== null && data.UTM_Y !== null
          ? { x: data.UTM_X, y: data.UTM_Y, waterbodyId: data.NEAREST_WATERBODY_ID }
          : null;
    }

    if (
      data.UTM_X === null ||
      data.UTM_Y === null ||
      mapView === null ||
      streamsFeatureLayer === null ||
      riversFeatureLayer === null
    ) {
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

    const location = { x: data.UTM_X, y: data.UTM_Y };
    // re-runs caused by NEAREST_WATERBODY_ID being updated should not trigger another query
    if (isSameLocation(lastHandledLocation.current, location)) {
      return;
    }
    const isFirstLocation = lastHandledLocation.current === null;
    lastHandledLocation.current = location;

    // the initial location from Salesforce or the URL already has a waterbody, so don't recompute it
    if (
      isFirstLocation &&
      initialLocation.current &&
      initialLocation.current.waterbodyId !== null &&
      isSameLocation(initialLocation.current, location)
    ) {
      console.log('Waterbody: gate, fetching from SF instead of API');
      return;
    }

    console.log('Waterbody: fetching nearest waterbody from API');
    async function fetchNearestWaterBodyFromAPI() {
      if (!projectOperator.isLoaded()) {
        await projectOperator.load();
      }

      const webMercatorPoint = computeWebMercatorPoint();
      const nearestWaterBody = await queryNearestWaterBody(webMercatorPoint, streamsFeatureLayer!, riversFeatureLayer!);
      const waterbodyInfo = {
        NEAREST_WATERBODY_DISTANCE: nearestWaterBody?.distanceInFeet ?? null,
        NEAREST_WATERBODY_ID: nearestWaterBody?.id ?? null,
        NEAREST_WATERBODY_NAME: !isWaterbodyEnabled
          ? null
          : nearestWaterBody === null
            ? 'No water bodies found'
            : nearestWaterBody?.name || 'Unnamed water body',
      };
      console.log('nearest waterbody: sending info to Salesforce', {
        enabled: isWaterbodyEnabled,
        name: waterbodyInfo.NEAREST_WATERBODY_NAME,
        id: waterbodyInfo.NEAREST_WATERBODY_ID,
        distanceInFeet: waterbodyInfo.NEAREST_WATERBODY_DISTANCE,
      });

      setData((prevData) => {
        // Sends data to Salesforce.
        // Race guard: ensure that the UTM coordinates haven't changed since the fetch started
        if (prevData.UTM_X !== data.UTM_X || prevData.UTM_Y !== data.UTM_Y) {
          return prevData;
        }
        return {
          ...prevData,
          ...waterbodyInfo,
        };
      });
    }
    void fetchNearestWaterBodyFromAPI().catch((error) => {
      console.error('Error querying nearest waterbody:', error);
    });
  }, [
    data.UTM_X,
    data.UTM_Y,
    data.NEAREST_WATERBODY_ID,
    isInitialDataLoaded,
    mapView,
    streamsFeatureLayer,
    riversFeatureLayer,
    setData,
  ]);
}
