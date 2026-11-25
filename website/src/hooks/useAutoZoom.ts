import Extent from '@arcgis/core/geometry/Extent';
import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import Point from '@arcgis/core/geometry/Point';
import { useEffect } from 'react';
import config from '../config';

// allows related updates (e.g. new location + flow path/waterbody queries starting) to settle into a single zoom
export const AUTO_ZOOM_DEBOUNCE_MS = 100;
const EXTENT_EXPAND_FACTOR = 1.2;
const utmWkid = 26912;

type UseAutoZoomOptions = {
  mapView: __esri.MapView | null;
  utmX: number | null;
  utmY: number | null;
  // must be in the same spatial reference as the map view
  flowPathExtent: __esri.Extent | null;
  waterbodyExtent: __esri.Extent | null;
  // skip zooming while any of the features are still being loaded to avoid zooming to stale or partial extents
  isPending: boolean;
};

export function getZoomTarget(point: __esri.Point, featureExtents: (__esri.Extent | null)[]): __esri.GoToTarget2D {
  const extents = featureExtents.filter((extent): extent is __esri.Extent => extent !== null);

  if (extents.length === 0) {
    return { target: point, zoom: config.DEFAULT_ZOOM_LEVEL };
  }

  const pointExtent = new Extent({
    xmin: point.x,
    ymin: point.y,
    xmax: point.x,
    ymax: point.y,
    spatialReference: point.spatialReference,
  });

  return extents.reduce((union, extent) => union.union(extent), pointExtent).expand(EXTENT_EXPAND_FACTOR);
}

// Zooms the map to fit the spill location along with the flow path and nearest waterbody anytime any of them change.
export default function useAutoZoom({
  mapView,
  utmX,
  utmY,
  flowPathExtent,
  waterbodyExtent,
  isPending,
}: UseAutoZoomOptions) {
  useEffect(() => {
    if (!mapView || utmX === null || utmY === null || isPending) {
      return;
    }

    let isCurrent = true;

    const timeout = setTimeout(async () => {
      try {
        await mapView.when();
        if (!projectOperator.isLoaded()) {
          await projectOperator.load();
        }

        if (!isCurrent) {
          return;
        }

        const point = projectOperator.execute(
          new Point({ x: utmX, y: utmY, spatialReference: { wkid: utmWkid } }),
          mapView.spatialReference,
        ) as __esri.Point;

        await mapView.goTo(getZoomTarget(point, [flowPathExtent, waterbodyExtent]));
      } catch (error) {
        if ((error as Error)?.name !== 'AbortError') {
          console.error('Error zooming to features:', error);
        }
      }
    }, AUTO_ZOOM_DEBOUNCE_MS);

    return () => {
      isCurrent = false;
      clearTimeout(timeout);
    };
  }, [flowPathExtent, isPending, mapView, utmX, utmY, waterbodyExtent]);
}

export async function queryLayerExtent(
  layer: __esri.FeatureLayer,
  where: string,
  outSpatialReference: __esri.SpatialReference,
): Promise<__esri.Extent | null> {
  await layer.when();
  const result = await layer.queryExtent({ where, outSpatialReference, cacheHint: false });

  return result.count > 0 && result.extent ? result.extent : null;
}
