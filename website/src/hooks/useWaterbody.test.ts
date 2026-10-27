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

type WaterbodyLayers = {
  mapView: __esri.MapView;
  streamsFeatureLayer: __esri.FeatureLayer;
  riversFeatureLayer: __esri.FeatureLayer;
};

function renderWaterbodyHook(
  setData: DataContextType['setData'] = () => undefined,
  initialCoordinates = coordinates,
  initialLayers: WaterbodyLayers | null = { mapView, streamsFeatureLayer, riversFeatureLayer },
  initialData: Partial<DataContextType['data']> = {},
) {
  let currentCoordinates = initialCoordinates;
  let currentLayers = initialLayers;
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      DataContext.Provider,
      {
        value: {
          data: { ...blankState, ...currentCoordinates, ...initialData },
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
    rerenderWithCoordinates: (nextCoordinates: typeof coordinates) => {
      currentCoordinates = nextCoordinates;
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

    beforeEach(() => {
      logSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
      setData = vi.fn<DataContextType['setData']>();
    });

    it('does not query the API when a nonexistent waterbody ID is passed into the URL', async () => {
      window.history.pushState(
        {},
        '',
        '?embedded=false&readonly=true&flowpath=true&waterbody=true&SPILL_NUMBER=00037919&UTM_X=437156&UTM_Y=4454301&NEAREST_WATERBODY_ID=test:666',
      );
      renderWaterbodyHook(setData, coordinates, undefined, { NEAREST_WATERBODY_ID: 'test:666' });

      await waitFor(() => {
        expect(logSpy).toHaveBeenCalledWith('Waterbody: gate, fetching from SF instead of API');
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
      });
    });

    it('fetches from the API when embedded is false due to no Salesforce integration', async () => {
      window.history.pushState(
        {},
        '',
        '?embedded=false&readonly=true&flowpath=true&waterbody=true&SPILL_NUMBER=00037919&UTM_X=437156&UTM_Y=4454301',
      );
      renderWaterbodyHook(setData, coordinates);

      await waitFor(() => {
        expect(logSpy).toHaveBeenCalledWith('Waterbody: fetching nearest waterbody from API');
        expect(mocks.queryNearestWaterBody).toHaveBeenCalled();
      });
    });

    // Clicking to place the spill on the map triggers an API query
    it('queries the API every time when embedded and no coordinates are specified in the URL', async () => {
      window.history.pushState({}, '', '?embedded=true&readonly=false&flowpath=true&waterbody=true');
      renderWaterbodyHook(setData, coordinates);

      await waitFor(() => {
        expect(logSpy).toHaveBeenCalledWith('Waterbody: fetching nearest waterbody from API');
        expect(mocks.queryNearestWaterBody).toHaveBeenCalled();
      });
    });
    // Duty-officer case:
    it('fetches from Salesforce instead of the API when embedded and coordinates are sent to the iframe', async () => {
      window.history.pushState({}, '', '?embedded=true&flowpath=true&waterbody=true');
      renderWaterbodyHook(setData, { UTM_X: 420304, UTM_Y: 4511432 }, undefined, {
        ID: 'a0123456789ABCDE',
        NEAREST_WATERBODY_ID: 'stream:83629887',
      });

      await waitFor(() => {
        expect(logSpy).toHaveBeenCalledWith('Waterbody: gate, fetching from SF instead of API');
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
        expect(setData).not.toHaveBeenCalled();
      });
    });

    it('queries Salesforce instead of the API when the NEAREST_WATERBODY_ID URL parameter represents a valid waterbody in Salesforce', async () => {
      window.history.pushState(
        {},
        '',
        '?embedded=false&readonly=true&flowpath=true&waterbody=true&SPILL_NUMBER=00037919&UTM_X=437156&UTM_Y=4454301&NEAREST_WATERBODY_ID=stream:83629887',
      );
      renderWaterbodyHook(setData, coordinates, undefined, { NEAREST_WATERBODY_ID: 'stream:83629887' });

      await waitFor(() => {
        expect(logSpy).toHaveBeenCalledWith('Waterbody: gate, fetching from SF instead of API');
        expect(mocks.queryNearestWaterBody).not.toHaveBeenCalled();
        expect(setData).not.toHaveBeenCalled();
      });
    });
  });
});
