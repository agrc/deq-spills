import { createContext, useState } from 'react';

type MapContextType = {
  setMapView: (view: __esri.MapView) => void;
  mapView: __esri.MapView | null;
};
export const MapContext = createContext<MapContextType | null>(null);

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [mapView, setMapView] = useState<__esri.MapView | null>(null);

  return <MapContext.Provider value={{ setMapView, mapView }}>{children}</MapContext.Provider>;
};
