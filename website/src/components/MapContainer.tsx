import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Legend from '@arcgis/core/widgets/Legend';
import LayerSelector from '@ugrc/layer-selector';
import { useEffect, useRef, useState } from 'react';
import useMap from './hooks/useMap';

import '@ugrc/layer-selector/src/LayerSelector.css';
import { utahMercatorExtent } from '@ugrc/utilities/hooks';
import config from '../config';

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
    });

    mapView.current.when(() => {
      const legend = new Legend({
        view: mapView.current!,
        basemapLegendVisible: true,
        visible: false,
      });

      mapView.current!.ui.add(legend, 'bottom-right');

      legend.activeLayerInfos.on('after-changes', () => {
        if (legend.activeLayerInfos.length === 0) {
          legend.visible = false;
        } else {
          legend.visible = true;
        }
      });
    });

    setMapView(mapView.current);

    const selectorOptions: SelectorOptions = {
      view: mapView.current,
      quadWord: import.meta.env.VITE_DISCOVER,
      baseLayers: ['Terrain', 'Hybrid', 'Lite'],
      overlays: [
        {
          Factory: FeatureLayer,
          id: 'Public Water System Facilities',
          url: config.URL.waterSystems,
          // @ts-expect-error - layer selector types are messed up
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
          Factory: FeatureLayer,
          url: config.URL.landownership,
          id: 'Land Ownership',
          opacity: 0.75,
          // @ts-expect-error - layer selector types are messed up
          labelingInfo: [
            {
              labelExpressionInfo: {
                expression: '$feature.agency',
              },
              minScale: 200000,
            },
          ],
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
