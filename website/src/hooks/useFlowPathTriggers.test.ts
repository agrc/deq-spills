import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FLOWPATH_LENGTHS } from '../../functions/common/shared';
import { blankState, DataContext, type DataContextType } from '../contexts/DataProvider';
import useFlowPathTriggers from './useFlowPathTriggers';

const defaultLength = FLOWPATH_LENGTHS[0]!.value;
const recordId = 'a0123456789ABCDE';
const coordinates = { UTM_X: 437052, UTM_Y: 4454335 };
const noCoordinates = { UTM_X: null, UTM_Y: null };
const mapView = {} as __esri.MapView;

function createLayer(savedLength?: number) {
  const queryFeatures = vi.fn().mockResolvedValue({
    features: savedLength === undefined ? [] : [{ attributes: { LENGTH: savedLength } }],
  });
  const layer = {
    queryFeatures,
    when: (callback: () => unknown) => Promise.resolve(callback()),
  } as unknown as __esri.FeatureLayer;

  return { layer, queryFeatures };
}

type State = {
  data: Partial<DataContextType['data']>;
  dropdownValue: number;
  flowPathFeatureLayer: __esri.FeatureLayer | null;
  isInitialDataLoaded: boolean;
  mapView: __esri.MapView | null;
};

function renderTriggers(initialState: Partial<State>) {
  let state: State = {
    data: {},
    dropdownValue: defaultLength,
    flowPathFeatureLayer: null,
    isInitialDataLoaded: true,
    mapView,
    ...initialState,
  };
  const mutate = vi.fn();
  const setDropdownValue = vi.fn();

  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      DataContext.Provider,
      {
        value: {
          data: { ...blankState, ...state.data },
          isInitialDataLoaded: state.isInitialDataLoaded,
          requestFlowpathToken: async () => '',
          setData: () => undefined,
        },
      },
      children,
    );

  const hook = renderHook(
    () =>
      useFlowPathTriggers({
        dropdownValue: state.dropdownValue,
        flowPathFeatureLayer: state.flowPathFeatureLayer,
        mapView: state.mapView,
        mutate,
        setDropdownValue,
      }),
    { wrapper },
  );

  return {
    mutate,
    setDropdownValue,
    rerender: (nextState: Partial<State>) => {
      state = { ...state, ...nextState, data: { ...state.data, ...nextState.data } };
      hook.rerender();
    },
  };
}

describe('useFlowPathTriggers', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('waits for the initial Salesforce data before querying the saved flow path', async () => {
      const { layer, queryFeatures } = createLayer(2);
      const { mutate, rerender, setDropdownValue } = renderTriggers({
        flowPathFeatureLayer: layer,
        isInitialDataLoaded: false,
      });

      expect(queryFeatures).not.toHaveBeenCalled();

      // Salesforce sends the ID and coordinates in a single message
      rerender({ data: { ID: recordId, ...coordinates }, isInitialDataLoaded: true });

      await waitFor(() => expect(setDropdownValue).toHaveBeenCalledWith(2));
      expect(queryFeatures).toHaveBeenCalledOnce();
      expect(mutate).not.toHaveBeenCalled();
    });

    it('waits for the flow path layer and map view', async () => {
      const { layer, queryFeatures } = createLayer(2);
      const { rerender, setDropdownValue } = renderTriggers({
        data: { ID: recordId, ...coordinates },
        mapView: null,
      });

      rerender({ flowPathFeatureLayer: layer });
      expect(queryFeatures).not.toHaveBeenCalled();

      rerender({ mapView });

      await waitFor(() => expect(setDropdownValue).toHaveBeenCalledWith(2));
      expect(queryFeatures).toHaveBeenCalledOnce();
    });

    it('uses the saved flow path without recomputing it', async () => {
      const { layer } = createLayer(5);
      const { mutate, setDropdownValue } = renderTriggers({
        data: { ID: recordId, ...coordinates },
        flowPathFeatureLayer: layer,
      });

      await waitFor(() => expect(setDropdownValue).toHaveBeenCalledWith(5));
      expect(mutate).not.toHaveBeenCalled();
    });

    it('computes a flow path with the default length when none is saved', async () => {
      const { layer } = createLayer();
      const { mutate, setDropdownValue } = renderTriggers({
        data: { ID: recordId, ...coordinates },
        flowPathFeatureLayer: layer,
      });

      await waitFor(() => expect(mutate).toHaveBeenCalledWith({ length: defaultLength }));
      expect(setDropdownValue).toHaveBeenCalledWith(defaultLength);
    });

    it('logs an error and does not compute a flow path when the saved flow path query fails', async () => {
      const error = new Error('query failed');
      const { layer, queryFeatures } = createLayer();
      queryFeatures.mockRejectedValue(error);
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { mutate } = renderTriggers({ data: { ID: recordId, ...coordinates }, flowPathFeatureLayer: layer });

      await waitFor(() => expect(errorSpy).toHaveBeenCalledWith('Error loading flow path:', error));
      expect(mutate).not.toHaveBeenCalled();
    });

    it('does nothing without a Salesforce record ID', async () => {
      const { layer, queryFeatures } = createLayer();
      const { mutate, rerender } = renderTriggers({
        data: noCoordinates,
        flowPathFeatureLayer: layer,
        isInitialDataLoaded: false,
      });

      rerender({ data: coordinates });

      await waitFor(() => {
        expect(queryFeatures).not.toHaveBeenCalled();
        expect(mutate).not.toHaveBeenCalled();
      });
    });
  });

  describe('records without a location', () => {
    it('does not query or compute until the spill is placed', async () => {
      const { layer, queryFeatures } = createLayer();
      const { mutate } = renderTriggers({ data: { ID: recordId, ...noCoordinates }, flowPathFeatureLayer: layer });

      await waitFor(() => {
        expect(queryFeatures).not.toHaveBeenCalled();
        expect(mutate).not.toHaveBeenCalled();
      });
    });

    it('computes a flow path when the spill is first placed', async () => {
      const { layer } = createLayer();
      const { mutate, rerender } = renderTriggers({
        data: { ID: recordId, ...noCoordinates },
        flowPathFeatureLayer: layer,
      });

      rerender({ data: coordinates });

      await waitFor(() => expect(mutate).toHaveBeenCalledOnce());
      expect(mutate).toHaveBeenCalledWith({ length: defaultLength });
    });

    it('recomputes a saved flow path with its saved length when the spill is first placed', async () => {
      const { layer } = createLayer(10);
      const { mutate, rerender, setDropdownValue } = renderTriggers({
        data: { ID: recordId, ...noCoordinates },
        flowPathFeatureLayer: layer,
      });

      rerender({ data: coordinates });

      await waitFor(() => expect(mutate).toHaveBeenCalledOnce());
      expect(mutate).toHaveBeenCalledWith({ length: 10 });
      expect(setDropdownValue).toHaveBeenCalledWith(10);
    });
  });

  describe('after initialization', () => {
    it('recomputes the flow path with the selected length when the spill is moved', async () => {
      const { layer } = createLayer(2);
      const { mutate, rerender, setDropdownValue } = renderTriggers({
        data: { ID: recordId, ...coordinates },
        flowPathFeatureLayer: layer,
      });

      await waitFor(() => expect(setDropdownValue).toHaveBeenCalledWith(2));
      rerender({ dropdownValue: 2 });
      expect(mutate).not.toHaveBeenCalled();

      rerender({ data: { UTM_X: 500000, UTM_Y: 4500000 } });

      expect(mutate).toHaveBeenCalledOnce();
      expect(mutate).toHaveBeenCalledWith({ length: 2 });
    });

    it('does not recompute when other data changes at the same location', async () => {
      const { layer } = createLayer(2);
      const { mutate, rerender, setDropdownValue } = renderTriggers({
        data: { ID: recordId, ...coordinates },
        flowPathFeatureLayer: layer,
      });

      await waitFor(() => expect(setDropdownValue).toHaveBeenCalled());
      rerender({ data: { NEAREST_WATERBODY_ID: 'stream:83629887' } });

      expect(mutate).not.toHaveBeenCalled();
    });
  });
});
