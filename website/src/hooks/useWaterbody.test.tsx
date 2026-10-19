import { act, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blankState, DataContext, type DataContextType } from '../contexts/DataProvider';

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  isLoaded: vi.fn(),
  load: vi.fn(),
  queryNearestWaterBody: vi.fn(),
}));

vi.mock('@arcgis/core/geometry/operators/projectOperator', () => mocks);

vi.mock('@arcgis/core/geometry/Point', () => ({
  default: class MockPoint {
    constructor(properties: Record<string, unknown>) {
      Object.assign(this, properties);
    }
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

vi.mock('../utilities/queryNearestWaterBody', () => ({
  queryNearestWaterBody: mocks.queryNearestWaterBody,
}));

import useWaterbody from './useWaterbody';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots: Array<{ container: HTMLDivElement; root: Root }> = [];
let updateData: DataContextType['setData'];
let currentData: DataContextType['data'];

function Hook({ enabled }: { enabled: boolean }) {
  useWaterbody(enabled);

  return null;
}

function Harness({ enabled, initialData }: { enabled: boolean; initialData: DataContextType['data'] }) {
  const [data, setData] = useState(initialData);
  currentData = data;
  updateData = setData;

  return (
    <DataContext.Provider value={{ data, requestFlowpathToken: async () => '', setData }}>
      <Hook enabled={enabled} />
    </DataContext.Provider>
  );
}

async function renderHook(enabled: boolean, initialData: DataContextType['data']) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  mountedRoots.push({ container, root });

  await act(async () => {
    root.render(<Harness enabled={enabled} initialData={initialData} />);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.isLoaded.mockReturnValue(true);
  mocks.execute.mockReturnValue({ type: 'projected-point' });
});

afterEach(async () => {
  while (mountedRoots.length > 0) {
    const mountedRoot = mountedRoots.pop();

    if (!mountedRoot) {
      continue;
    }

    await act(async () => {
      mountedRoot.root.unmount();
    });
    mountedRoot.container.remove();
  }

  vi.restoreAllMocks();
});

describe('useWaterbody', () => {
  it('queries when UTM coordinates update and stores the nearest waterbody', async () => {
    const nearestWaterbody = {
      distanceInFeet: 42,
      id: 'river:123',
      name: 'Jordan River',
    };
    mocks.queryNearestWaterBody.mockResolvedValue(nearestWaterbody);

    await renderHook(true, { ...blankState });
    expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();

    await act(async () => {
      updateData((previousData) => ({
        ...previousData,
        UTM_X: 420304,
        UTM_Y: 4511432,
      }));
    });

    expect(mocks.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        x: 420304,
        y: 4511432,
        spatialReference: expect.objectContaining({ wkid: 26912 }),
      }),
      expect.objectContaining({ wkid: 3857 }),
    );
    expect(mocks.queryNearestWaterBody).toHaveBeenCalledWith({ type: 'projected-point' });
    expect(currentData).toMatchObject({
      NEAREST_WATERBODY_DISTANCE: 42,
      NEAREST_WATERBODY_ID: 'river:123',
      NEAREST_WATERBODY_NAME: 'Jordan River',
    });
  });

  it('reports when coordinates have no nearby waterbody', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue(null);

    await renderHook(true, {
      ...blankState,
      UTM_X: 420304,
      UTM_Y: 4511432,
    });

    expect(currentData).toMatchObject({
      NEAREST_WATERBODY_DISTANCE: null,
      NEAREST_WATERBODY_ID: null,
      NEAREST_WATERBODY_NAME: 'No water bodies found',
    });
  });
});
