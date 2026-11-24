import { beforeEach, describe, expect, it, vi } from 'vitest';
import { queryNearestWaterBody } from './queryNearestWaterBody';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  isLoaded: vi.fn(),
  load: vi.fn(),
  queryRivers: vi.fn(),
  queryStreams: vi.fn(),
  queryLakes: vi.fn(),
}));

vi.mock('@arcgis/core/geometry/operators/geodeticDistanceOperator', () => mocks);

describe('queryNearestWaterBody', () => {
  const point = { spatialReference: { wkid: 3857 }, type: 'point' } as unknown as __esri.Point;
  const riversFeatureLayer = { queryFeatures: mocks.queryRivers } as unknown as __esri.FeatureLayer;
  const streamsFeatureLayer = { queryFeatures: mocks.queryStreams } as unknown as __esri.FeatureLayer;
  const lakesFeatureLayer = { queryFeatures: mocks.queryLakes } as unknown as __esri.FeatureLayer;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isLoaded.mockReturnValue(true);
  });

  it('queries streams, lakes, and rivers and returns the closest candidate', async () => {
    const streamGeometry = { type: 'polyline' } as unknown as __esri.Polyline;
    const riverGeometry = { type: 'polygon' } as unknown as __esri.Polygon;
    const lakeGeometry = { type: 'polygon' } as unknown as __esri.Polygon;

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
    mocks.queryLakes.mockResolvedValue({
      features: [
        {
          attributes: { Permanent_Identifier: 789, GNIS_Name: 'Great Lake' },
          geometry: lakeGeometry,
        },
      ],
    });
    mocks.execute.mockImplementation((_, geometry: __esri.Geometry) =>
      geometry === streamGeometry ? 42 : geometry === riverGeometry ? 12 : 100,
    );

    const result = await queryNearestWaterBody(point, streamsFeatureLayer, riversFeatureLayer, lakesFeatureLayer);

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
    expect(mocks.queryLakes).toHaveBeenCalledWith(
      expect.objectContaining({
        outFields: ['Permanent_Identifier', 'GNIS_Name'],
      }),
    );
  });

  it('returns null when no candidates are found', async () => {
    mocks.queryStreams.mockResolvedValue({ features: [] });
    mocks.queryRivers.mockResolvedValue({ features: [] });
    mocks.queryLakes.mockResolvedValue({ features: [] });

    await expect(
      queryNearestWaterBody(point, streamsFeatureLayer, riversFeatureLayer, lakesFeatureLayer),
    ).resolves.toBeNull();
  });
});
