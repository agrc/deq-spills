import { beforeEach, describe, expect, it, vi } from 'vitest';
import { queryNearestWaterBody } from './queryNearestWaterBody';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  isLoaded: vi.fn(),
  load: vi.fn(),
  queryRivers: vi.fn(),
  queryStreams: vi.fn(),
}));

vi.mock('@arcgis/core/geometry/operators/geodeticDistanceOperator', () => mocks);

describe('queryNearestWaterBody', () => {
  const point = { spatialReference: { wkid: 3857 }, type: 'point' } as unknown as __esri.Point;
  const riversFeatureLayer = { queryFeatures: mocks.queryRivers } as unknown as __esri.FeatureLayer;
  const streamsFeatureLayer = { queryFeatures: mocks.queryStreams } as unknown as __esri.FeatureLayer;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isLoaded.mockReturnValue(true);
  });

  it('queries streams and rivers and returns the closest candidate', async () => {
    const streamGeometry = { type: 'polyline' } as unknown as __esri.Polyline;
    const riverGeometry = { type: 'polygon' } as unknown as __esri.Polygon;

    mocks.queryStreams.mockResolvedValue({
      features: [
        {
          attributes: { ComID: 123, GNIS_Name: 'Dry Creek' },
          geometry: streamGeometry,
        },
      ],
    });
    mocks.queryRivers.mockResolvedValue({
      features: [
        {
          attributes: { COM_ID: 456, NAME: 'Jordan River' },
          geometry: riverGeometry,
        },
      ],
    });
    mocks.execute.mockImplementation((_, geometry: __esri.Geometry) => (geometry === streamGeometry ? 42 : 12));

    const result = await queryNearestWaterBody(point, streamsFeatureLayer, riversFeatureLayer);

    expect(result).toEqual({
      distanceInFeet: 12,
      id: 'river:456',
      name: 'Jordan River',
    });
    expect(mocks.queryStreams).toHaveBeenCalledWith(
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
    expect(mocks.queryRivers).toHaveBeenCalledWith(
      expect.objectContaining({
        outFields: ['COM_ID', 'NAME'],
      }),
    );
  });

  it('returns null when no candidates are found', async () => {
    mocks.queryStreams.mockResolvedValue({ features: [] });
    mocks.queryRivers.mockResolvedValue({ features: [] });

    await expect(queryNearestWaterBody(point, streamsFeatureLayer, riversFeatureLayer)).resolves.toBeNull();
  });
});
