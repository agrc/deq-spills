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
const mapView = {} as __esri.MapView;
const streamsFeatureLayer = { queryFeatures: vi.fn() } as unknown as __esri.FeatureLayer;
const riversFeatureLayer = { queryFeatures: vi.fn() } as unknown as __esri.FeatureLayer;

type Coordinates = Pick<DataContextType['data'], 'UTM_X' | 'UTM_Y'>;

type WaterbodyLayers = {
  mapView: __esri.MapView;
  streamsFeatureLayer: __esri.FeatureLayer;
  riversFeatureLayer: __esri.FeatureLayer;
};

function renderWaterbodyHook(
  setData: DataContextType['setData'] = () => undefined,
  initialCoordinates: Coordinates = coordinates,
  initialLayers: WaterbodyLayers | null = { mapView, streamsFeatureLayer, riversFeatureLayer },
  initialData: Partial<DataContextType['data']> = {},
  initialIsInitialDataLoaded = true,
) {
  let currentCoordinates = initialCoordinates;
  let currentData = initialData;
  let currentIsInitialDataLoaded = initialIsInitialDataLoaded;
  let currentLayers = initialLayers;
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      DataContext.Provider,
      {
        value: {
          data: { ...blankState, ...currentCoordinates, ...currentData },
          isInitialDataLoaded: currentIsInitialDataLoaded,
          requestFlowpathToken: async () => '',
          setData,
        },
      },
      children,
    );

  const hook = renderHook(
    () =>
      useWaterbody(
        currentLayers?.mapView ?? null,
        currentLayers?.streamsFeatureLayer ?? null,
        currentLayers?.riversFeatureLayer ?? null,
      ),
    { wrapper },
  );

  return {
    ...hook,
    rerenderWithCoordinates: (nextCoordinates: Coordinates) => {
      currentCoordinates = nextCoordinates;
      hook.rerender();
    },
    rerenderWithData: (nextData: Partial<DataContextType['data']>, nextIsInitialDataLoaded = true) => {
      currentData = { ...currentData, ...nextData };
      currentIsInitialDataLoaded = nextIsInitialDataLoaded;
      hook.rerender();
    },
    rerenderWithLayers: (nextLayers: WaterbodyLayers | null) => {
      currentLayers = nextLayers;
      hook.rerender();
    },
  };
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

  it('does not execute if waterbody lookup is disabled', async () => {
    window.history.pushState({}, '', '?waterbody=false');
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const setData = vi.fn<DataContextType['setData']>();
    renderWaterbodyHook(setData);

    await waitFor(() => {
      expect(logSpy).not.toHaveBeenCalledWith('Waterbody: change detected in UTM');
      expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
    });
  });

  it('logs when the waterbody lookup is enabled with UTM coordinates', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue(null);
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    renderWaterbodyHook();

    expect(logSpy).toHaveBeenCalledWith('Waterbody: fetching nearest waterbody from API');
    await waitFor(() => {
      expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce();
      expect(mocks.queryNearestWaterBody).toHaveBeenCalledWith(
        expect.objectContaining({
          x: coordinates.UTM_X,
          y: coordinates.UTM_Y,
          spatialReference: expect.objectContaining({ wkid: 26912 }),
        }),
        streamsFeatureLayer,
        riversFeatureLayer,
      );
    });
  });

  it('waits for the waterbody layers before looking up the nearest waterbody', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue(null);
    const setData = vi.fn<DataContextType['setData']>();
    const { rerenderWithLayers } = renderWaterbodyHook(setData, coordinates, null);

    expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
    expect(setData).not.toHaveBeenCalled();

    rerenderWithLayers({ mapView, streamsFeatureLayer, riversFeatureLayer });

    await waitFor(() => expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce());
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

  it('returns "Unnamed water body" when a waterbody\'s name is null', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue({
      distanceInFeet: 200,
      id: 'lake:456',
      name: null,
    });

    const setData = vi.fn<DataContextType['setData']>();
    renderWaterbodyHook(setData);

    await waitFor(() => expect(setData).toHaveBeenCalledOnce());

    const updateData = setData.mock.calls[0]?.[0];
    expect(typeof updateData).toBe('function');
    if (typeof updateData === 'function') {
      const updatedData = updateData({ ...blankState, ...coordinates });

      expect(updatedData.NEAREST_WATERBODY_NAME).toBe('Unnamed water body');
      expect(updatedData.NEAREST_WATERBODY_ID).toBe('lake:456');
      expect(updatedData.NEAREST_WATERBODY_DISTANCE).toBe(200);
    }
  });

  it('returns "Unnamed water body" when a waterbody\'s name is empty', async () => {
    mocks.queryNearestWaterBody.mockResolvedValue({
      distanceInFeet: 200,
      id: 'lake:456',
      name: '',
    });

    const setData = vi.fn<DataContextType['setData']>();
    renderWaterbodyHook(setData);

    await waitFor(() => expect(setData).toHaveBeenCalledOnce());

    const updateData = setData.mock.calls[0]?.[0];
    expect(typeof updateData).toBe('function');
    if (typeof updateData === 'function') {
      const updatedData = updateData({ ...blankState, ...coordinates });

      expect(updatedData.NEAREST_WATERBODY_NAME).toBe('Unnamed water body');
      expect(updatedData.NEAREST_WATERBODY_ID).toBe('lake:456');
      expect(updatedData.NEAREST_WATERBODY_DISTANCE).toBe(200);
    }
  });

  it('reloads the waterbody data when coordinates change', async () => {
    const firstWaterbody = {
      distanceInFeet: 100,
      id: 'stream:123',
      name: 'First Stream',
    };
    const secondWaterbody = {
      distanceInFeet: 250,
      id: 'stream:456',
      name: 'Second Stream',
    };
    mocks.queryNearestWaterBody.mockResolvedValueOnce(firstWaterbody).mockResolvedValueOnce(secondWaterbody);

    const setData = vi.fn<DataContextType['setData']>();
    const { rerenderWithCoordinates } = renderWaterbodyHook(setData);

    await waitFor(() => expect(setData).toHaveBeenCalledOnce());
    expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce();
    expect(mocks.queryNearestWaterBody).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        x: coordinates.UTM_X,
        y: coordinates.UTM_Y,
        spatialReference: expect.objectContaining({ wkid: 26912 }),
      }),
      streamsFeatureLayer,
      riversFeatureLayer,
    );

    const newCoordinates = { UTM_X: 500000, UTM_Y: 4500000 };
    rerenderWithCoordinates(newCoordinates);

    await waitFor(() => expect(setData).toHaveBeenCalledTimes(2));
    expect(mocks.queryNearestWaterBody).toHaveBeenCalledTimes(2);
    expect(mocks.queryNearestWaterBody).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        x: newCoordinates.UTM_X,
        y: newCoordinates.UTM_Y,
        spatialReference: expect.objectContaining({ wkid: 26912 }),
      }),
      streamsFeatureLayer,
      riversFeatureLayer,
    );

    const updateData = setData.mock.calls[1]?.[0];
    expect(typeof updateData).toBe('function');
    if (typeof updateData === 'function') {
      const updatedData = updateData({ ...blankState, ...newCoordinates });

      expect(updatedData.NEAREST_WATERBODY_NAME).toBe(secondWaterbody.name);
      expect(updatedData.NEAREST_WATERBODY_ID).toBe(secondWaterbody.id);
      expect(updatedData.NEAREST_WATERBODY_DISTANCE).toBe(secondWaterbody.distanceInFeet);
    }
  });

  describe('useWaterbody: API query decisions', () => {
    let logSpy: ReturnType<typeof vi.spyOn>;
    let setData: ReturnType<typeof vi.fn<DataContextType['setData']>>;
    const gateMessage = 'Waterbody: gate, fetching from SF instead of API';
    const salesforceData = { ID: 'a0123456789ABCDE', NEAREST_WATERBODY_ID: 'stream:83629887' };

    beforeEach(() => {
      logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      setData = vi.fn<DataContextType['setData']>();
    });

    describe('standalone (data from URL parameters)', () => {
      it('queries the API when coordinates are passed without a waterbody ID', async () => {
        window.history.pushState(
          {},
          '',
          '?embedded=false&readonly=true&flowpath=true&waterbody=true&SPILL_NUMBER=00037919&UTM_X=437156&UTM_Y=4454301',
        );
        renderWaterbodyHook(setData, coordinates);

        await waitFor(() => {
          expect(logSpy).toHaveBeenCalledWith('Waterbody: fetching nearest waterbody from API');
          expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce();
        });
      });

      it('does not query the API when coordinates and a waterbody ID are passed', async () => {
        window.history.pushState(
          {},
          '',
          '?embedded=false&readonly=true&flowpath=true&waterbody=true&SPILL_NUMBER=00037919&UTM_X=437156&UTM_Y=4454301&NEAREST_WATERBODY_ID=stream:83629887',
        );
        renderWaterbodyHook(setData, coordinates, undefined, { NEAREST_WATERBODY_ID: 'stream:83629887' });

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(gateMessage));
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
        expect(setData).not.toHaveBeenCalled();
      });

      it('does not validate a waterbody ID passed in the URL', async () => {
        window.history.pushState(
          {},
          '',
          '?embedded=false&readonly=true&flowpath=true&waterbody=true&SPILL_NUMBER=00037919&UTM_X=437156&UTM_Y=4454301&NEAREST_WATERBODY_ID=test:666',
        );
        renderWaterbodyHook(setData, coordinates, undefined, { NEAREST_WATERBODY_ID: 'test:666' });

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(gateMessage));
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
      });

      it('does nothing when no coordinates are passed', async () => {
        window.history.pushState({}, '', '?embedded=false&waterbody=true');
        renderWaterbodyHook(setData, { UTM_X: null, UTM_Y: null });

        await waitFor(() => {
          expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
          expect(setData).not.toHaveBeenCalled();
        });
      });
    });

    describe('embedded with Salesforce record data (duty officer)', () => {
      it('does not query the API when the initial data includes coordinates and a waterbody ID', async () => {
        window.history.pushState({}, '', '?embedded=true&flowpath=true&waterbody=true');
        renderWaterbodyHook(setData, { UTM_X: 420304, UTM_Y: 4511432 }, undefined, salesforceData);

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(gateMessage));
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
        expect(setData).not.toHaveBeenCalled();
      });

      it('waits for Salesforce data and does not query the API when it includes a waterbody ID', async () => {
        window.history.pushState({}, '', '?embedded=true&flowpath=true&waterbody=true');
        const { rerenderWithData } = renderWaterbodyHook(setData, { UTM_X: null, UTM_Y: null }, undefined, {}, false);

        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();

        // Salesforce sends the ID, coordinates, and waterbody ID in a single message
        rerenderWithData({ ...salesforceData, UTM_X: 420304, UTM_Y: 4511432 }, true);

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(gateMessage));
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
      });

      it('does not query the API when the map layers finish loading after the Salesforce data', async () => {
        window.history.pushState({}, '', '?embedded=true&flowpath=true&waterbody=true');
        const { rerenderWithData, rerenderWithLayers } = renderWaterbodyHook(
          setData,
          { UTM_X: null, UTM_Y: null },
          null,
          {},
          false,
        );

        rerenderWithData({ ...salesforceData, UTM_X: 420304, UTM_Y: 4511432 }, true);
        rerenderWithLayers({ mapView, streamsFeatureLayer, riversFeatureLayer });

        await waitFor(() => expect(logSpy).toHaveBeenCalledWith(gateMessage));
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
      });

      it('queries the API when Salesforce data loads with coordinates but no waterbody ID', async () => {
        window.history.pushState({}, '', '?embedded=true&flowpath=true&waterbody=true');
        renderWaterbodyHook(setData, { UTM_X: 420304, UTM_Y: 4511432 }, undefined, { ID: 'a0123456789ABCDE' });

        await waitFor(() => expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce());
      });

      it('queries the API when the spill is placed on a record that had no coordinates', async () => {
        window.history.pushState({}, '', '?embedded=true&flowpath=true&waterbody=true');
        const { rerenderWithCoordinates } = renderWaterbodyHook(
          setData,
          { UTM_X: null, UTM_Y: null },
          undefined,
          salesforceData,
        );

        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();

        rerenderWithCoordinates({ UTM_X: 420304, UTM_Y: 4511432 });

        await waitFor(() => expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce());
      });

      it('queries the API after the spill is moved away from and back to its initial location', async () => {
        window.history.pushState({}, '', '?embedded=true&flowpath=true&waterbody=true');
        const { rerenderWithCoordinates } = renderWaterbodyHook(setData, coordinates, undefined, salesforceData);

        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();

        rerenderWithCoordinates({ UTM_X: 500000, UTM_Y: 4500000 });
        await waitFor(() => expect(mocks.queryNearestWaterBody).toHaveBeenCalledTimes(1));

        rerenderWithCoordinates(coordinates);
        await waitFor(() => expect(mocks.queryNearestWaterBody).toHaveBeenCalledTimes(2));
      });
    });

    describe('embedded without Salesforce record data (click-only)', () => {
      it('queries the API when the spill is placed on the map', async () => {
        window.history.pushState({}, '', '?embedded=true&readonly=false&flowpath=true&waterbody=true');
        renderWaterbodyHook(setData, coordinates, undefined, {}, false);

        await waitFor(() => {
          expect(logSpy).toHaveBeenCalledWith('Waterbody: fetching nearest waterbody from API');
          expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce();
        });
      });

      it('queries the API even if a waterbody ID is present before any Salesforce data has loaded', async () => {
        window.history.pushState({}, '', '?embedded=true&readonly=false&flowpath=true&waterbody=true');
        renderWaterbodyHook(setData, coordinates, undefined, { NEAREST_WATERBODY_ID: 'stream:83629887' }, false);

        await waitFor(() => expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce());
      });

      it('does not query the API again when the waterbody ID is updated for the same location', async () => {
        mocks.queryNearestWaterBody.mockResolvedValue({ distanceInFeet: 10, id: 'stream:1', name: 'Stream' });
        window.history.pushState({}, '', '?embedded=true&readonly=false&flowpath=true&waterbody=true');
        const { rerenderWithData } = renderWaterbodyHook(setData, coordinates, undefined, {}, false);

        await waitFor(() => expect(setData).toHaveBeenCalledOnce());
        rerenderWithData({ NEAREST_WATERBODY_ID: 'stream:1' }, false);

        await waitFor(() => expect(mocks.queryNearestWaterBody).toHaveBeenCalledOnce());
      });
    });

    describe('query results', () => {
      it('discards a result if the spill moved while the query was running', async () => {
        mocks.queryNearestWaterBody.mockResolvedValue({ distanceInFeet: 10, id: 'stream:1', name: 'Stream' });
        renderWaterbodyHook(setData, coordinates);

        await waitFor(() => expect(setData).toHaveBeenCalledOnce());

        const updateData = setData.mock.calls[0]?.[0];
        expect(typeof updateData).toBe('function');
        if (typeof updateData === 'function') {
          const movedData = { ...blankState, UTM_X: 500000, UTM_Y: 4500000 };

          expect(updateData(movedData)).toBe(movedData);
        }
      });

      it('logs an error and does not update data when the query fails', async () => {
        const error = new Error('query failed');
        mocks.queryNearestWaterBody.mockRejectedValue(error);
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        renderWaterbodyHook(setData, coordinates);

        await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Error querying nearest waterbody:', error));
        expect(setData).not.toHaveBeenCalled();
      });
    });
  });
});
