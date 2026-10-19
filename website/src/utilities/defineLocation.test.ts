import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  isLoaded: vi.fn(),
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns null when a successful search finds no result', async () => {
    mocks.search.mockResolvedValue([]);
    vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await defineLocation(point);

    expect(result.OWNER_AGENCY).toBeNull();
    expect(result.CITY).toBeNull();
    expect(result.COUNTY).toBeNull();
    expect(result).not.toHaveProperty('NEAREST_WATERBODY_NAME');
    expect(result).not.toHaveProperty('NEAREST_WATERBODY_ID');
    expect(result).not.toHaveProperty('NEAREST_WATERBODY_DISTANCE');
  });

  it('returns null when the search API returns an error response', async () => {
    mocks.search.mockResolvedValue({ status: 500 });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const result = await defineLocation(point);
    expect(result.OWNER_AGENCY).toBeNull();
  });
});
