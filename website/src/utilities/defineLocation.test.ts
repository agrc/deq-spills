import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  isLoaded: vi.fn(),
  queryFeatures: vi.fn(),
}));

vi.mock('@arcgis/core/geometry/operators/projectOperator', () => mocks);
vi.mock('@arcgis/core/layers/FeatureLayer', () => ({
  default: class MockFeatureLayer {
    queryFeatures = mocks.queryFeatures;
  },
}));

vi.mock('@arcgis/core/geometry/SpatialReference', () => ({
  default: class MockSpatialReference {
    wkid: number;

    constructor({ wkid }: { wkid: number }) {
      this.wkid = wkid;
    }
  },
}));

import config from '../config';
import { defineLocation } from './defineLocation';

describe('defineLocation', () => {
  const point = {
    spatialReference: { wkid: 3857 },
    x: 100,
    y: 200,
  } as unknown as __esri.Point;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    mocks.isLoaded.mockReturnValue(true);
    mocks.execute.mockImplementation((input: { x: number; y: number }, spatialReference: { wkid: number }) => ({
      x: input.x,
      y: input.y,
      spatialReference,
      toJSON: () => ({ x: input.x, y: input.y }),
    }));
    mocks.queryFeatures.mockImplementation(async (query: { outFields: string[] }) => {
      const field = query.outFields[0]!;

      return { features: [{ attributes: { [field]: 'Agency' } }] };
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when a feature service has no matching result', async () => {
    mocks.queryFeatures.mockResolvedValue({ features: [] });
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await defineLocation(point);

    expect(result.OWNER_AGENCY).toBeNull();
    expect(result.CITY).toBeNull();
    expect(result.COUNTY).toBeNull();
  });

  it('returns null when a feature service request fails', async () => {
    mocks.queryFeatures.mockRejectedValue(new Error('Feature service request failed'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await defineLocation(point);
    expect(result.OWNER_AGENCY).toBeNull();
  });

  it('queries the configured feature services with their respective fields', async () => {
    await defineLocation(point);

    expect(config.LOCATION_QUERIES).toEqual({
      city: {
        url: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahMunicipalBoundaries/FeatureServer/0',
        field: 'Name',
      },
      county: {
        url: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahCountyBoundaries/FeatureServer/0',
        field: 'NAME',
      },
      agency: {
        url: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_Agency_Web_Mercator/FeatureServer/0',
        field: 'land_owner',
      },
    });
    expect(mocks.queryFeatures).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ outFields: ['land_owner'], geometry: expect.anything() }),
    );
    expect(mocks.queryFeatures).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ outFields: ['Name'], geometry: expect.anything() }),
    );
    expect(mocks.queryFeatures).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ outFields: ['NAME'], geometry: expect.anything() }),
    );
  });
});
