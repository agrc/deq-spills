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
  const previousWaterbodyId = useRef<typeof data.NEAREST_WATERBODY_ID | null>(null);

  useEffect(() => {
    if (data.ID === null) {
      console.log('Data ID is null');
    }
    if (
      // data.ID === null ||
      data.UTM_X === null ||
      data.UTM_Y === null ||
      mapView === null ||
      streamsFeatureLayer === null ||
      riversFeatureLayer === null
    ) {
      return;
    }
    // function hasLocationGoneFromNonNullToDifferentNonNull() {
    //   return (
    //     previousCoordinates.current !== null &&
    //     data.UTM_X !== null &&
    //     data.UTM_Y !== null &&
    //     (previousCoordinates.current.x !== data.UTM_X || previousCoordinates.current.y !== data.UTM_Y)
    //   );
    // }
    function hasLocationGoneFromNullToNonNull() {
      return previousCoordinates.current === null && data.UTM_X !== null && data.UTM_Y !== null;
    }

    // const coordinatesChanged =
    //   previousCoordinates.current?.x !== data.UTM_X || previousCoordinates.current?.y !== data.UTM_Y;
    const newAndPreviousCoordinatesEqual =
      previousCoordinates.current?.x === data.UTM_X && previousCoordinates.current?.y === data.UTM_Y;

    function gateExecution() {
      // The click-only page (embedded true, readonly false, waterbody true) never has a data.ID set at any point.
      if (data.ID !== null && (hasLocationGoneFromNullToNonNull() || newAndPreviousCoordinatesEqual)) {
        return true;
      }
      // console.log('RETURNING FALSE: Has the location gone from null to non-null?', hasLocationGoneFromNullToNonNull());
      // console.log('What did the coordinates change to?', { x: data.UTM_X, y: data.UTM_Y });
      // console.log('Previous coordinates were:', previousCoordinates.current);
      return false;
    }
    // Just console log for now:
    // the clicker page isn't executing this.
    // console.log('Has loc gone from non-null to other non-null?', hasLocationGoneFromNonNullToDifferentNonNull());

    // if (hasLocationGoneFromNullToNonNull()) {
    //   // is waterbody ID set? if it's null, we want to fetch, right? well....no.
    //   // the problem is that waterbodyID is null at the beginning EVEN IF it exists in SF, and
    //   //  I don't know how to differentiate
    //   console.log("Location was null and now isn't, and waterbody ID is " + data.NEAREST_WATERBODY_ID);
    // }

    console.log('Would we gate execution?', gateExecution());

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
    // if (gateExecution()) {
    //   console.log('Waterbody: not refetching');
    //   return;
    // }
    // previousCoordinates.current = { x: data.UTM_X, y: data.UTM_Y };
    console.log('Would we gate execution down below?', gateExecution());
    if (gateExecution()) {
      previousCoordinates.current = { x: data.UTM_X, y: data.UTM_Y };

      if (data.NEAREST_WATERBODY_ID !== null && previousWaterbodyId.current === null) {
        console.log('Waterbody: gate, fetching from SF instead of API');
        return;
      }
    }
    previousCoordinates.current = { x: data.UTM_X, y: data.UTM_Y };
    previousWaterbodyId.current = data.NEAREST_WATERBODY_ID;

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
