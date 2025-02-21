import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import LayerSelector from '@ugrc/layer-selector';
import { useEffect, useRef, useState } from 'react';
import useMap from './hooks/useMap';

import '@ugrc/layer-selector/src/LayerSelector.css';
import { utahMercatorExtent } from '@ugrc/utilities/hooks';

const urls = {
  landownership:
    'https://gis.trustlands.utah.gov/hosting/rest/services/Hosted/Land_Ownership_WM_VectorTile/VectorTileServer',
  liteVector:
    'https://www.arcgis.com/sharing/rest/content/items/77202507796a4d5796b7d8e6871e352e/resources/styles/root.json',
};

type LayerFactory = {
  Factory: new () => __esri.Layer;
  url: string;
  id: string;
  opacity: number;
};
type SelectorOptions = {
  view: MapView;
  quadWord: string;
  baseLayers: Array<string | { token: string; selected: boolean } | LayerFactory>;
  overlays?: Array<string | LayerFactory>;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
};

type MapContainerProps = {
  onClick?: __esri.ViewImmediateClickEventHandler;
  isEmbedded?: boolean;
};

export default function MapContainer({ onClick, isEmbedded }: MapContainerProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapComponent = useRef<EsriMap | null>(null);
  const mapView = useRef<MapView>(null);
  const clickHandler = useRef<IHandle>(null);
  const [selectorOptions, setSelectorOptions] = useState<SelectorOptions | null>(null);
  const { setMapView } = useMap();

  // setup the Map
  useEffect(() => {
    if (!mapNode.current || !setMapView) {
      return;
    }

    mapComponent.current = new EsriMap();

    mapView.current = new MapView({
      container: mapNode.current,
      map: mapComponent.current,
      extent: utahMercatorExtent,
      navigation: {
        mouseWheelZoomEnabled: isEmbedded,
      },
    });

    setMapView(mapView.current);

    const selectorOptions: SelectorOptions = {
      view: mapView.current,
      quadWord: import.meta.env.VITE_DISCOVER,
      baseLayers: ['Terrain', 'Hybrid', 'Lite'],
      overlays: [
        {
          // @ts-expect-error - layer selector types are messed up
          Factory: 'FeatureLayer',
          id: 'Public Water System Facilities',
          url: 'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Public_Water_System_Sources/FeatureServer/0',
          labelingInfo: [
            {
              labelExpressionInfo: {
                expression: '$feature.FACNAME',
              },
              minScale: 200000,
            },
          ],
        },
        {
          Factory: VectorTileLayer,
          url: urls.landownership,
          id: 'Land Ownership',
          opacity: 0.75,
        },
      ],
      position: 'top-right',
    };

    setSelectorOptions(selectorOptions);

    return () => {
      mapView.current?.destroy();
      mapComponent.current?.destroy();
    };
  }, [isEmbedded, setMapView]);

  // add click event handlers
  useEffect(() => {
    if (onClick) {
      clickHandler.current = mapView.current!.on('immediate-click', onClick);
    }

    return () => {
      clickHandler.current?.remove();
    };
  }, [onClick, mapView]);

  return (
    <div ref={mapNode} className="size-full">
      {selectorOptions?.view && <LayerSelector {...selectorOptions}></LayerSelector>}
    </div>
  );
}
