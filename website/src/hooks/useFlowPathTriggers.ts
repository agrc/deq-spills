import { useEffect, useRef } from 'react';
import { FIELDS, FLOWPATH_LENGTHS } from '../../functions/common/shared';
import { getDefinitionExpression } from '../utilities/getDefinitionExpression';
import useData from './useDataProvider';

type UseFlowPathTriggersOptions = {
  dropdownValue: number;
  flowPathFeatureLayer: __esri.FeatureLayer | null;
  mapView: __esri.MapView | null;
  mutate: (variables: { length: number }) => void;
  setDropdownValue: (value: number) => void;
};

function getCoordinatesKey(x: number | null, y: number | null) {
  return x !== null && y !== null ? `${x},${y}` : null;
}

// Decides when the flow path should be loaded from the feature service or recomputed.
export default function useFlowPathTriggers({
  dropdownValue,
  flowPathFeatureLayer,
  mapView,
  mutate,
  setDropdownValue,
}: UseFlowPathTriggersOptions) {
  const { data, isInitialDataLoaded } = useData();

  // undefined: initial data not loaded yet; null: initial data had no location
  const initialCoordinates = useRef<string | null | undefined>(undefined);
  const lastHandledCoordinates = useRef<string | null>(null);
  const hasInitialized = useRef(false);

  const coordinates = getCoordinatesKey(data.UTM_X, data.UTM_Y);

  // initialize once the Salesforce record has loaded and has a location
  useEffect(() => {
    if (isInitialDataLoaded && initialCoordinates.current === undefined) {
      initialCoordinates.current = coordinates;
    }

    if (
      hasInitialized.current ||
      !isInitialDataLoaded ||
      !flowPathFeatureLayer ||
      !mapView ||
      !data.ID ||
      coordinates === null
    ) {
      return;
    }

    hasInitialized.current = true;
    lastHandledCoordinates.current = coordinates;
    const id = data.ID;
    // the spill was placed after the record loaded without a location, so any saved flow path is out of date
    const isNewLocation = coordinates !== initialCoordinates.current;

    void flowPathFeatureLayer
      .when(() =>
        flowPathFeatureLayer.queryFeatures({
          cacheHint: false,
          where: getDefinitionExpression(id),
          returnGeometry: true,
          outFields: [FIELDS.LENGTH],
        }),
      )
      .then((results: __esri.FeatureSet) => {
        const savedLength = results.features[0]?.attributes[FIELDS.LENGTH] as number | undefined;
        const length = savedLength ?? FLOWPATH_LENGTHS[0]!.value;
        setDropdownValue(length);

        if (savedLength !== undefined && !isNewLocation) {
          console.log('Flowpath loaded from feature service with length:', savedLength);

          return;
        }

        mutate({ length });
      })
      .catch((error: unknown) => {
        console.error('Error loading flow path:', error);
      });
  }, [coordinates, data.ID, flowPathFeatureLayer, isInitialDataLoaded, mapView, mutate, setDropdownValue]);

  // recompute when the spill is moved after initialization
  useEffect(() => {
    if (!hasInitialized.current || !data.ID || coordinates === null) {
      return;
    }

    if (lastHandledCoordinates.current !== coordinates) {
      lastHandledCoordinates.current = coordinates;
      mutate({ length: dropdownValue });
    }
  }, [coordinates, data.ID, dropdownValue, mutate]);
}
