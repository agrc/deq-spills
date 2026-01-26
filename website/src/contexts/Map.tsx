import { createContext, useState } from 'react';

type MapContextType = {
  setMapView: (view: __esri.MapView) => void;
  mapView: __esri.MapView | null;
  setFlowPathFeatureLayer: (layer: __esri.FeatureLayer) => void;
  flowPathFeatureLayer: __esri.FeatureLayer | null;
};
export const MapContext = createContext<MapContextType | null>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapView, setMapView] = useState<__esri.MapView | null>(null);
  const [flowPathFeatureLayer, setFlowPathFeatureLayer] = useState<__esri.FeatureLayer | null>(null);

  return (
    <MapContext.Provider value={{ setMapView, mapView, setFlowPathFeatureLayer, flowPathFeatureLayer }}>
      {children}
    </MapContext.Provider>
  );
};
