import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  isLoaded: vi.fn(),
  queryNearestWaterBody: vi.fn(),
  search: vi.fn(),
}));

vi.mock('@arcgis/core/geometry/operators/projectOperator', () => mocks);

vi.mock('@arcgis/core/geometry/SpatialReference', () => ({
  default: class MockSpatialReference {
    wkid: number;

    constructor({ wkid }: { wkid: number }) {
      this.wkid = wkid;
    }
  },
}));

vi.mock('@ugrc/utilities', () => ({ search: mocks.search }));
vi.mock('./queryNearestWaterBody', () => ({ queryNearestWaterBody: mocks.queryNearestWaterBody }));

import { defineLocation } from './defineLocation';

describe('defineLocation', () => {
  const point = {
    spatialReference: { wkid: 3857 },
    x: 100,
    y: 200,
  } as unknown as __esri.Point;

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isLoaded.mockReturnValue(true);
    mocks.execute.mockImplementation((input: { x: number; y: number }, spatialReference: { wkid: number }) => ({
      x: input.x,
      y: input.y,
      spatialReference,
      toJSON: () => ({ x: input.x, y: input.y }),
    }));
    mocks.search.mockImplementation(async (_apiKey: string, _table: string, fields: string[]) => {
      const field = fields[0]!;

      return [{ attributes: { [field]: 'Agency' } }];
    });
    mocks.queryNearestWaterBody.mockResolvedValue(null);
  });

  it('sets the waterbody name when no waterbody is found, while leaving ID and distance null', async () => {
    const result = await defineLocation(point, null, null, null, true);

    expect(result.NEAREST_WATERBODY_NAME).toBe('No water bodies found');
    expect(result.NEAREST_WATERBODY_ID).toBeNull();
    expect(result.NEAREST_WATERBODY_DISTANCE).toBeNull();
  });

  it('leaves the waterbody name null when waterbody searching is disabled', async () => {
    const result = await defineLocation(point);

    expect(result.NEAREST_WATERBODY_NAME).toBeNull();
    expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
  });

  it('returns null for lookup fields when a search request rejects', async () => {
    mocks.search.mockRejectedValue(new TypeError("Cannot read properties of undefined (reading 'status')"));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await defineLocation(point);

    expect(result.OWNER_AGENCY).toBeNull();
    expect(result.CITY).toBeNull();
    expect(result.COUNTY).toBeNull();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
