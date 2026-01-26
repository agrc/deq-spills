import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Legend from '@arcgis/core/widgets/Legend';
import { LayerSelector, type LayerSelectorProps } from '@ugrc/utah-design-system';
import { useEffect, useRef, useState } from 'react';

import Graphic from '@arcgis/core/Graphic';
import { useGraphicManager, utahMercatorExtent } from '@ugrc/utilities/hooks';
import { FIELDS } from '../../functions/common/shared';
import config from '../config';
import useData from '../hooks/useDataProvider';
import useMapView from '../hooks/useMapView';
import { defineLocation } from '../utilities/defineLocation';
import { getDefinitionExpression } from '../utilities/getDefinitionExpression';

type MapContainerProps = {
  isEmbedded: boolean;
  isReadOnly: boolean;
  flowPathEnabled: boolean;
};

export default function MapContainer({ isEmbedded, isReadOnly, flowPathEnabled }: MapContainerProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapComponent = useRef<EsriMap | null>(null);
  const mapView = useRef<MapView>(null);
  const [selectorOptions, setSelectorOptions] = useState<LayerSelectorProps | null>(null);
  const { setMapView, setFlowPathFeatureLayer, flowPathFeatureLayer } = useMapView();
  const { data, setData } = useData();

  // setup the Map
  useEffect(() => {
    if (!mapNode.current) {
      return;
    }

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

      if (flowPathEnabled) {
        const flowPathFeatureLayer = new FeatureLayer({
          url: import.meta.env.VITE_FLOWPATHS_PUBLIC_SERVICE_URL,
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-line',
              color: [0, 0, 255, 0.5],
              width: 4,
              style: 'solid',
            },
          },
          definitionExpression: '1=0', // start with no features
          legendEnabled: false,
        });

        mapView.current!.map!.add(flowPathFeatureLayer);
        setFlowPathFeatureLayer(flowPathFeatureLayer);
      }
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
  }, [flowPathEnabled, setFlowPathFeatureLayer, setMapView]);

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

    mapNode.current!.style.cursor = 'crosshair';

    return () => {
      handle?.remove();
    };
  }, [isEmbedded, isReadOnly, setData]);

  // update graphic and update flow paths layer
  const { setGraphic } = useGraphicManager(mapView.current);
  const coordinatesChanged = useRef(false);
  useEffect(() => {
    if (!data.UTM_X || !data.UTM_Y || (flowPathEnabled && !flowPathFeatureLayer)) {
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

    // this should only happen once when the coordinates change from null to a value, if they change after that, FlowPaths.tsx takes care of zooming
    if (flowPathEnabled && flowPathFeatureLayer && coordinatesChanged.current === false) {
      flowPathFeatureLayer.definitionExpression = getDefinitionExpression(data.ID!);
      flowPathFeatureLayer
        .when(() => {
          flowPathFeatureLayer
            .queryFeatures({
              cacheHint: false,
              returnGeometry: true,
              outFields: [FIELDS.LENGTH],
              where: flowPathFeatureLayer!.definitionExpression,
            })
            .then((results) => {
              if (results.features.length > 0) {
                const flowPathGraphic = results.features[0];
                mapView.current!.goTo(flowPathGraphic!.geometry!.extent!.expand(1.1));
              } else {
                mapView.current?.goTo({
                  target: graphic,
                  zoom: config.DEFAULT_ZOOM_LEVEL,
                });
              }
            })
            .catch((error) => {
              console.error('Error querying flow path features:', error);
            });
        })
        .catch((error) => {
          console.error('Error loading flow path feature layer:', error);
        });
    } else {
      mapView.current?.when(() => {
        mapView.current?.goTo({
          target: graphic,
          zoom: config.DEFAULT_ZOOM_LEVEL,
        });
      });
    }
    coordinatesChanged.current = true;
  }, [data.ID, data.UTM_X, data.UTM_Y, flowPathEnabled, flowPathFeatureLayer, setGraphic]);

  return (
    <div ref={mapNode} className="flex-1">
      {selectorOptions ? <LayerSelector {...selectorOptions}></LayerSelector> : null}
    </div>
  );
}
