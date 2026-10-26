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

export default function useWaterbody(
  mapView: __esri.MapView | null,
  streamsFeatureLayer: __esri.FeatureLayer | null,
  riversFeatureLayer: __esri.FeatureLayer | null,
) {
  const { data, setData } = useData();

  const previousCoordinates = useRef<{ x: typeof data.UTM_X; y: typeof data.UTM_Y } | null>(null);
  const previousWaterbodyID = useRef<typeof data.NEAREST_WATERBODY_ID | null>(null);

  useEffect(() => {
    if (
      data.UTM_X === null ||
      data.UTM_Y === null ||
      mapView === null ||
      streamsFeatureLayer === null ||
      riversFeatureLayer === null
    ) {
      return;
    }
    function hasLocationGoneFromNullToNonNull() {
      return previousCoordinates.current === null && data.UTM_X !== null && data.UTM_Y !== null;
    }
    const newAndPreviousCoordinatesEqual =
      previousCoordinates.current?.x === data.UTM_X && previousCoordinates.current?.y === data.UTM_Y;

    function spillHasNotMoved() {
      // The click-only page (embedded true, readonly false, waterbody true) never has a data.ID set at any point.
      if (data.ID !== null && (hasLocationGoneFromNullToNonNull() || newAndPreviousCoordinatesEqual)) {
        return true;
      }
      return false;
    }

    function waterbodyIDAlreadySet() {
      return data.NEAREST_WATERBODY_ID !== null && previousWaterbodyID.current === null;
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
    if (spillHasNotMoved() && waterbodyIDAlreadySet()) {
      previousCoordinates.current = { x: data.UTM_X, y: data.UTM_Y };
      console.log('Waterbody: gate, fetching from SF instead of API');
      return;
    }
    previousCoordinates.current = { x: data.UTM_X, y: data.UTM_Y };
    previousWaterbodyID.current = data.NEAREST_WATERBODY_ID;
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
    data.ID,
    data.NEAREST_WATERBODY_ID,
    mapView,
    streamsFeatureLayer,
    riversFeatureLayer,
    setData,
  ]);
}
