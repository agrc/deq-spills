import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Legend from '@arcgis/core/widgets/Legend';
import { LayerSelector, type LayerSelectorProps } from '@ugrc/utah-design-system';
import { useEffect, useRef, useState } from 'react';

import Graphic from '@arcgis/core/Graphic';
import { useGraphicManager, utahMercatorExtent } from '@ugrc/utilities/hooks';
import config from '../config';
import useData from '../hooks/useDataProvider';
import useMapView from '../hooks/useMapView';
import { defineLocation } from '../utilities/defineLocation';

type MapContainerProps = {
  isEmbedded: boolean;
  isReadOnly: boolean;
};

export default function MapContainer({ isEmbedded, isReadOnly }: MapContainerProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapComponent = useRef<EsriMap | null>(null);
  const mapView = useRef<MapView>(null);
  const [selectorOptions, setSelectorOptions] = useState<LayerSelectorProps | null>(null);
  const { setMapView } = useMapView();

  // setup the Map
  useEffect(() => {
    if (!mapNode.current) {
      return;
    }

    // TODO: add flow paths feature layer
    mapComponent.current = new EsriMap();

    mapView.current = new MapView({
      container: mapNode.current,
      map: mapComponent.current,
      extent: utahMercatorExtent,
    });
    mapView.current.constraints.snapToZoom = false;

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
        basemaps: ['Terrain', 'Hybrid', 'Lite'],
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

  const { data, setData } = useData();

  // add click event handlers
  useEffect(() => {
    if (!isEmbedded || isReadOnly || !mapView.current) {
      return;
    }
    const handle = mapView.current!.on('click', async (event) => {
      if (
        !window.confirm('Are you sure that you would like to update the event location to match the clicked location?')
      ) {
        return;
      }
      const newData = await defineLocation(event.mapPoint);
      setData((prevData) => ({
        ...prevData,
        ...newData,
      }));
    });

    return () => {
      handle?.remove();
    };
  }, [isEmbedded, isReadOnly, mapView, setData]);

  // add graphic
  const { setGraphic } = useGraphicManager(mapView.current);
  useEffect(() => {
    if (!data.UTM_X || !data.UTM_Y) {
      return;
    }

    const graphic = new Graphic({
      geometry: {
        type: 'point',
        x: data.UTM_X,
        y: data.UTM_Y,
        spatialReference: {
          wkid: 26912,
        },
      },
      symbol: {
        type: 'simple-marker',
        color: [255, 255, 0],
        size: 11,
        outline: {
          color: [0, 0, 0],
          width: 1,
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

  // TODO: update flow paths layer def query when the current incident changes

  return (
    <div ref={mapNode} className="flex-1">
      {selectorOptions ? <LayerSelector {...selectorOptions}></LayerSelector> : null}
    </div>
  );
}
