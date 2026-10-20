import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { blankState, DataContext, type DataContextType } from '../contexts/DataProvider';
import useWaterbody from './useWaterbody';

const mocks = vi.hoisted(() => ({
  queryNearestWaterBody: vi.fn(),
}));

vi.mock('../utilities/queryNearestWaterBody', () => ({
  queryNearestWaterBody: mocks.queryNearestWaterBody,
}));

vi.mock('@arcgis/core/geometry/operators/projectOperator', () => ({
  execute: (point: unknown) => point,
  isLoaded: () => true,
  load: vi.fn(),
}));

const coordinates = { UTM_X: 437156, UTM_Y: 4454301 };

function renderWaterbodyHook(setData: DataContextType['setData'] = () => undefined) {
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      DataContext.Provider,
      {
        value: {
          data: { ...blankState, ...coordinates },
          requestFlowpathToken: async () => '',
          setData,
        },
      },
      children,
    );

  return renderHook(() => useWaterbody(), { wrapper });
}

describe('useWaterbody', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '?waterbody=true');
  });

  afterEach(() => {
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
    mocks.queryNearestWaterBody.mockReset();
  });

  it('logs when the waterbody lookup is enabled with UTM coordinates', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue(null);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    renderWaterbodyHook();

    expect(logSpy).toHaveBeenCalledWith('Waterbody: change detected in UTM');
    await waitFor(() => {
      expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce();
      expect(mocks.queryNearestWaterBody).toHaveBeenCalledWith(
        expect.objectContaining({
          x: coordinates.UTM_X,
          y: coordinates.UTM_Y,
          spatialReference: expect.objectContaining({ wkid: 26912 }),
        }),
      );
    });
  });

  it('logs the waterbody fields before they are sent to salesforce if a waterbody is found', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue({
      distanceInFeet: 125,
      id: 'river:123',
      name: 'Provo River',
    });
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    renderWaterbodyHook();

    await waitFor(() =>
      expect(logSpy).toHaveBeenCalledWith('nearest waterbody: sending info to Salesforce', {
        enabled: true,
        name: 'Provo River',
        id: 'river:123',
        distanceInFeet: 125,
      }),
    );
  });

  it('sets the waterbody name to "No water bodies found" when none are nearby, but leaves ID and distance null', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue(null);

    const setData = vi.fn<DataContextType['setData']>();
    renderWaterbodyHook(setData);

    await waitFor(() => expect(setData).toHaveBeenCalledOnce());

    const updateData = setData.mock.calls[0]?.[0];
    expect(typeof updateData).toBe('function');
    if (typeof updateData === 'function') {
      const updatedData = updateData({ ...blankState, ...coordinates });

      expect(updatedData.NEAREST_WATERBODY_NAME).toBe('No water bodies found');
      expect(updatedData.NEAREST_WATERBODY_ID).toBeNull();
      expect(updatedData.NEAREST_WATERBODY_DISTANCE).toBeNull();
    }
  });

  /*
    Next tests (delete me):
    - it should exit immediately if no waterbody is found, not even logging
    - it should return 'Unnamed water body' when a waterbody has no name
  */
});
