import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
    vi.spyOn(console, 'log').mockImplementation(() => {});
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sets the waterbody name when no waterbody is found, while leaving ID and distance null', async () => {
    const result = await defineLocation(point, null, null, null, true);

    expect(result.NEAREST_WATERBODY_NAME).toBe('No water bodies found');
    expect(result.NEAREST_WATERBODY_ID).toBeNull();
    expect(result.NEAREST_WATERBODY_DISTANCE).toBeNull();
    expect(console.log).toHaveBeenCalledWith('nearest waterbody: sending info to Salesforce', {
      enabled: true,
      name: 'No water bodies found',
      id: null,
      distanceInFeet: null,
    });
  });

  it('leaves the waterbody name null when waterbody searching is disabled', async () => {
    const result = await defineLocation(point);

    expect(result.NEAREST_WATERBODY_NAME).toBeNull();
    expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('nearest waterbody: sending info to Salesforce', {
      enabled: false,
      name: null,
      id: null,
      distanceInFeet: null,
    });
  });

  it('logs the final waterbody fields when a waterbody is found', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue({
      name: 'Jordan River',
      id: 'river:123',
      distanceInFeet: 42,
    });

    const result = await defineLocation(point, null, null, null, true);

    expect(console.log).toHaveBeenCalledWith('nearest waterbody: sending info to Salesforce', {
      enabled: true,
      name: result.NEAREST_WATERBODY_NAME,
      id: result.NEAREST_WATERBODY_ID,
      distanceInFeet: result.NEAREST_WATERBODY_DISTANCE,
    });
  });

  it('returns null when a successful search finds no result', async () => {
    mocks.search.mockResolvedValue([]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await defineLocation(point);

    expect(result.OWNER_AGENCY).toBeNull();
    expect(result.CITY).toBeNull();
    expect(result.COUNTY).toBeNull();
  });

it('returns null when the search API returns an error response', async () => {
    mocks.search.mockResolvedValue({ status: 500 });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await defineLocation(point);
    expect(result.OWNER_AGENCY).toBeNull();
  });
});
