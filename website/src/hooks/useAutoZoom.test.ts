import Extent from '@arcgis/core/geometry/Extent';
import Point from '@arcgis/core/geometry/Point';
import { describe, expect, it } from 'vitest';
import config from '../config';
import { getZoomTarget } from './useAutoZoom';

const spatialReference = { wkid: 3857 };
const point = new Point({ x: 0, y: 0, spatialReference });

describe('getZoomTarget', () => {
  it('zooms to the point when there are no other features', () => {
    expect(getZoomTarget(point, [null, null])).toEqual({ target: point, zoom: config.DEFAULT_ZOOM_LEVEL });
  });

  it('fits the point, flow path, and waterbody', () => {
    const flowPath = new Extent({ xmin: 10, ymin: 10, xmax: 100, ymax: 50, spatialReference });
    const waterbody = new Extent({ xmin: -100, ymin: -20, xmax: -50, ymax: 0, spatialReference });

    const target = getZoomTarget(point, [flowPath, waterbody]) as __esri.Extent;

    expect(target.xmin).toBeLessThan(-100);
    expect(target.ymin).toBeLessThan(-20);
    expect(target.xmax).toBeGreaterThan(100);
    expect(target.ymax).toBeGreaterThan(50);
  });

  it('includes the point when it is outside of the feature extents', () => {
    const waterbody = new Extent({ xmin: 10, ymin: 10, xmax: 20, ymax: 20, spatialReference });

    const target = getZoomTarget(point, [null, waterbody]) as __esri.Extent;

    expect(target.xmin).toBeLessThan(0);
    expect(target.ymin).toBeLessThan(0);
    expect(target.xmax).toBeGreaterThan(20);
    expect(target.ymax).toBeGreaterThan(20);
  });
});
