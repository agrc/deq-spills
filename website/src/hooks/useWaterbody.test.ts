import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { blankState, DataContext } from '../contexts/DataProvider';
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

function renderWaterbodyHook() {
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      DataContext.Provider,
      {
        value: {
          data: { ...blankState, ...coordinates },
          requestFlowpathToken: async () => '',
          setData: () => undefined,
        },
      },
      children,
    );

  return renderHook(() => useWaterbody(), { wrapper });
}

describe('useWaterbody', () => {
  afterEach(() => {
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
    mocks.queryNearestWaterBody.mockReset();
  });

  it('logs when the waterbody lookup is enabled with UTM coordinates', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue(null);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    window.history.pushState({}, '', '?waterbody=true');
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
    window.history.pushState({}, '', '?waterbody=true');

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

  /*
    Next tests (delete me):
    - it sets the waterbody name to 'No waterbody found' when no waterbody is found, but leaves ID and distance null.
    - it should exit immediately if no waterbody is found, not even logging
    - it should return 'Unnamed water body' when a waterbody has no name
  */
});
