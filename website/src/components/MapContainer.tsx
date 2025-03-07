import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Legend from '@arcgis/core/widgets/Legend';
import { LayerSelector, type LayerSelectorProps } from '@ugrc/utah-design-system';
import { useEffect, useRef, useState } from 'react';
import useMap from '../hooks/useMap';

import Graphic from '@arcgis/core/Graphic';
import { useGraphicManager, utahMercatorExtent } from '@ugrc/utilities/hooks';
import config from '../config';
import useData from '../hooks/useDataProvider';

type MapContainerProps = {
  onClick?: __esri.ViewImmediateClickEventHandler;
  isEmbedded?: boolean;
};

export default function MapContainer({ onClick, isEmbedded }: MapContainerProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapComponent = useRef<EsriMap | null>(null);
  const mapView = useRef<MapView>(null);
  const clickHandler = useRef<IHandle>(null);
  const [selectorOptions, setSelectorOptions] = useState<LayerSelectorProps | null>(null);
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

    const selectorOptions: LayerSelectorProps = {
      options: {
        view: mapView.current,
        quadWord: import.meta.env.VITE_DISCOVER,
        baseLayers: ['Terrain', 'Hybrid', 'Lite'],
        referenceLayers: [
          {
            label: 'Public Water System Facilities',
            function: () =>
              new FeatureLayer({
                url: config.URL.waterSystems,
                labelingInfo: [
                  {
                    labelExpressionInfo: {
                      expression: '$feature.FACNAME',
                    },
                    minScale: 200000,
                  },
                ],
              }),
          },
          {
            label: 'Land Ownership',
            function: () =>
              new FeatureLayer({
                url: config.URL.landownership,
                opacity: 0.75,
                labelingInfo: [
                  {
                    labelExpressionInfo: {
                      expression: '$feature.agency',
                    },
                    minScale: 200000,
                  },
                ],
              }),
          },
        ],
      },
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

  const { data } = useData();
  const { setGraphic } = useGraphicManager(mapView.current);
  useEffect(() => {
    if (!data.UTM_X || !data.UTM_Y) {
      return;
    }

    const graphic = new Graphic({
      geometry: {
        type: 'point',
        x: parseFloat(data.UTM_X),
        y: parseFloat(data.UTM_Y),
        spatialReference: {
          wkid: 26912,
        },
      },
      symbol: {
        type: 'simple-marker',
        color: [0, 255, 255],
        size: 10,
        outline: {
          color: [0, 0, 0],
          width: 2,
        },
      },
    });
    setGraphic(graphic);

    mapView.current?.when(() => {
      mapView.current?.goTo({
        target: graphic,
        zoom: config.DEFAULT_ZOOM_LEVEL,
      });
    });
  }, [data, setGraphic]);

  return (
    <div ref={mapNode} className="size-full">
      {selectorOptions ? <LayerSelector {...selectorOptions}></LayerSelector> : null}
    </div>
  );
}
