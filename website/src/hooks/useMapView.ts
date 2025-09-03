import { useContext } from 'react';
import { MapContext } from '../contexts/Map';

export default function useMapView() {
  const context = useContext(MapContext);

  if (context === null) {
    throw new Error('useMapView must be used within a MapProvider');
  }

  return context;
}
