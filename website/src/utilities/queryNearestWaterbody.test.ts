import { beforeEach, describe, expect, it, vi } from 'vitest';
import config from '../config';
import { queryNearestWaterBody } from './queryNearestWaterBody';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  isLoaded: vi.fn(),
  load: vi.fn(),
  queryFeatures: vi.fn(),
}));

vi.mock('@arcgis/core/geometry/operators/geodeticDistanceOperator', () => mocks);

vi.mock('@arcgis/core/layers/FeatureLayer', () => ({
  default: vi.fn().mockImplementation(function MockFeatureLayer(options: { url: string }) {
    return {
      queryFeatures: (query: __esri.QueryProperties) => mocks.queryFeatures(options.url, query),
    };
  }),
}));

describe('queryNearestWaterBody', () => {
  const point = { spatialReference: { wkid: 3857 }, type: 'point' } as unknown as __esri.Point;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isLoaded.mockReturnValue(true);
  });

  it('queries streams and rivers and returns the closest candidate', async () => {
    const streamGeometry = { type: 'polyline' } as unknown as __esri.Polyline;
    const riverGeometry = { type: 'polygon' } as unknown as __esri.Polygon;

    mocks.queryFeatures.mockImplementation((url: string) => {
      if (url === config.URL.majorStreams) {
        return Promise.resolve({
          features: [
            {
              attributes: { ComID: 123, GNIS_Name: 'Dry Creek' },
              geometry: streamGeometry,
            },
          ],
        });
      }

      return Promise.resolve({
        features: [
          {
            attributes: { COM_ID: 456, NAME: 'Jordan River' },
            geometry: riverGeometry,
          },
        ],
      });
    });
    mocks.execute.mockImplementation((_, geometry: __esri.Geometry) => (geometry === streamGeometry ? 42 : 12));

    const result = await queryNearestWaterBody(point);

    expect(result).toEqual({
      distanceInFeet: 12,
      id: 'river:456',
      name: 'Jordan River',
    });
    expect(mocks.queryFeatures).toHaveBeenCalledWith(
      config.URL.majorStreams,
      expect.objectContaining({
        distance: 5280,
        geometry: point,
        outFields: ['ComID', 'GNIS_Name'],
        returnGeometry: true,
        spatialRelationship: 'intersects',
        units: 'feet',
        where: '1=1',
      }),
    );
    expect(mocks.queryFeatures).toHaveBeenCalledWith(
      config.URL.majorRivers,
      expect.objectContaining({
        outFields: ['COM_ID', 'NAME'],
      }),
    );
  });

  it('returns null when no candidates are found', async () => {
    mocks.queryFeatures.mockResolvedValue({ features: [] });

    await expect(queryNearestWaterBody(point)).resolves.toBeNull();
  });
});
