import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import EsriMap from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import Legend from '@arcgis/core/widgets/Legend';
import { LayerSelector, type LayerSelectorProps } from '@ugrc/utah-design-system';
import { useEffect, useRef, useState } from 'react';

import * as reactiveUtils from '@arcgis/core/core/reactiveUtils';
import Graphic from '@arcgis/core/Graphic';
import { useGraphicManager, utahMercatorExtent } from '@ugrc/utilities/hooks';
import config from '../config';
import useAutoZoom, { queryLayerExtent } from '../hooks/useAutoZoom';
import useData from '../hooks/useDataProvider';
import useMapView from '../hooks/useMapView';
import useWaterbody from '../hooks/useWaterbody';
import { defineLocation } from '../utilities/defineLocation';
import { getDefinitionExpression } from '../utilities/getDefinitionExpression';

type MapContainerProps = {
  isEmbedded: boolean;
  isReadOnly: boolean;
  flowPathEnabled: boolean;
  waterbodyEnabled: boolean;
};

const WATERBODY_COLOR = [64, 224, 208, 0.5];

export default function MapContainer({ isEmbedded, isReadOnly, flowPathEnabled, waterbodyEnabled }: MapContainerProps) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const mapComponent = useRef<EsriMap | null>(null);
  const mapView = useRef<MapView>(null);
  const [selectorOptions, setSelectorOptions] = useState<LayerSelectorProps | null>(null);
  const [waterbodyLayers, setWaterbodyLayers] = useState<{
    streams: FeatureLayer;
    rivers: FeatureLayer;
  } | null>(null);
  const { setMapView, setFlowPathFeatureLayer, flowPathFeatureLayer } = useMapView();
  const { data, setData } = useData();
  const { isPending: isWaterbodySearchPending } = useWaterbody(
    mapView.current,
    waterbodyLayers?.streams ?? null,
    waterbodyLayers?.rivers ?? null,
  );
  const [flowPathExtent, setFlowPathExtent] = useState<{ extent: __esri.Extent | null; isPending: boolean }>({
    extent: null,
    isPending: false,
  });
  // the id is stored with the extent so that we know when the extent is out of date
  const [waterbodyExtent, setWaterbodyExtent] = useState<{ id: string | null; extent: __esri.Extent | null }>({
    id: null,
    extent: null,
  });

  // setup the Map
  useEffect(() => {
    if (!mapNode.current) {
      return;
    }

    let isCurrent = true;
    setWaterbodyLayers(null);

    mapComponent.current = new EsriMap();

    mapView.current = new MapView({
      container: mapNode.current,
      map: mapComponent.current,
      extent: utahMercatorExtent,
    });
    mapView.current.constraints.snapToZoom = false;

    mapView.current.when(() => {
      if (!isCurrent) {
        return;
      }

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

      if (waterbodyEnabled) {
        const streams = new FeatureLayer({
          url: config.URL.majorStreams,
          outFields: ['ComID', 'GNIS_Name'],
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-line',
              color: WATERBODY_COLOR,
              width: 4,
              style: 'solid',
            },
          },
          definitionExpression: '1=0', // start with no features
          legendEnabled: false,
        });

        const rivers = new FeatureLayer({
          url: config.URL.majorRivers,
          outFields: ['COM_ID', 'NAME'],
          renderer: {
            type: 'simple',
            symbol: {
              type: 'simple-fill',
              color: WATERBODY_COLOR,
              outline: {
                color: WATERBODY_COLOR,
                width: 4,
              },
            },
          },
          definitionExpression: '1=0', // start with no features
          legendEnabled: false,
        });

        mapView.current!.map!.addMany([streams, rivers]);
        void Promise.all([streams.when(), rivers.when()])
          .then(() => {
            if (isCurrent) {
              setWaterbodyLayers({ streams, rivers });
            }
          })
          .catch((error) => {
            console.error('Error loading waterbody feature layers:', error);
          });
      }
    });

    setMapView(mapView.current);

    const selectorOptions: LayerSelectorProps = {
      options: {
        view: mapView.current,
        quadWord: import.meta.env.VITE_DISCOVER,
        basemaps: ['Terrain', 'Hybrid', 'Lite', 'High Contrast'],
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
          {
            label: 'Streams',
            function: () =>
              new FeatureLayer({
                url: config.URL.majorStreams,
                outFields: ['ComID', 'GNIS_Name'],
                labelingInfo: [
                  {
                    labelExpressionInfo: {
                      expression: '$feature.GNIS_Name',
                    },
                    minScale: 200000,
                  },
                ],
              }),
          },
          {
            label: 'Rivers',
            function: () =>
              new FeatureLayer({
                url: config.URL.majorRivers,
                outFields: ['COM_ID', 'NAME'],
                labelingInfo: [
                  {
                    labelExpressionInfo: {
                      expression: '$feature.NAME',
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
      isCurrent = false;
      mapView.current?.destroy();
      mapComponent.current?.destroy();
    };
  }, [flowPathEnabled, setFlowPathFeatureLayer, setMapView, waterbodyEnabled]);

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
      const newData = await defineLocation(event.mapPoint, null, null, null);
      setData((prevData) => ({
        ...prevData,
        ...newData,
      }));
    });

    mapNode.current!.style.cursor = 'crosshair';

    return () => {
      handle?.remove();
    };
  }, [isEmbedded, isReadOnly, setData, waterbodyEnabled]);

  // highlight the nearest water body, since its id tells us whether it came from the streams or rivers layer
  useEffect(() => {
    if (!waterbodyEnabled || !waterbodyLayers || !mapView.current) {
      return;
    }

    const waterbodyId = data.NEAREST_WATERBODY_ID ?? null;
    const [type, id] = waterbodyId?.split(':') ?? [];
    const streamsWhere = type === 'stream' ? `ComID = ${id}` : '1=0';
    const riversWhere = type === 'river' ? `COM_ID = ${id}` : '1=0';

    waterbodyLayers.streams.definitionExpression = streamsWhere;
    waterbodyLayers.rivers.definitionExpression = riversWhere;

    const layer = type === 'stream' ? waterbodyLayers.streams : type === 'river' ? waterbodyLayers.rivers : null;
    if (!layer) {
      setWaterbodyExtent({ id: waterbodyId, extent: null });

      return;
    }

    let isCurrent = true;
    queryLayerExtent(layer, type === 'stream' ? streamsWhere : riversWhere, mapView.current.spatialReference)
      .catch((error) => {
        console.error('Error querying nearest waterbody extent:', error);

        return null;
      })
      .then((extent) => {
        if (isCurrent) {
          setWaterbodyExtent({ id: waterbodyId, extent });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [data.NEAREST_WATERBODY_ID, waterbodyEnabled, waterbodyLayers]);

  // track the extent of the flow path that is currently displayed, the definition expression is updated
  // anytime the flow path is loaded or recomputed (see FlowPath.tsx)
  useEffect(() => {
    if (!flowPathFeatureLayer || !mapView.current) {
      setFlowPathExtent({ extent: null, isPending: false });

      return;
    }

    const view = mapView.current;
    let latestRequestId = 0;
    const handle = reactiveUtils.watch(
      () => flowPathFeatureLayer.definitionExpression,
      (expression) => {
        const requestId = ++latestRequestId;
        setFlowPathExtent((previous) => ({ ...previous, isPending: true }));

        queryLayerExtent(flowPathFeatureLayer, expression ?? '1=0', view.spatialReference)
          .catch((error) => {
            console.error('Error querying flow path extent:', error);

            return null;
          })
          .then((extent) => {
            if (requestId === latestRequestId) {
              setFlowPathExtent({ extent, isPending: false });
            }
          });
      },
      { initial: true },
    );

    return () => {
      latestRequestId++;
      handle.remove();
    };
  }, [flowPathFeatureLayer]);

  const currentWaterbodyId = waterbodyEnabled && waterbodyLayers ? (data.NEAREST_WATERBODY_ID ?? null) : null;
  useAutoZoom({
    mapView: mapView.current,
    utmX: data.UTM_X,
    utmY: data.UTM_Y,
    flowPathExtent: flowPathExtent.extent,
    waterbodyExtent: waterbodyExtent.id === currentWaterbodyId ? waterbodyExtent.extent : null,
    isPending:
      (flowPathEnabled && (!flowPathFeatureLayer || flowPathExtent.isPending)) ||
      (waterbodyEnabled && (!waterbodyLayers || isWaterbodySearchPending || waterbodyExtent.id !== currentWaterbodyId)),
  });

  // update the spill location graphic
  const { setGraphic } = useGraphicManager(mapView.current);
  useEffect(() => {
    if (!data.UTM_X || !data.UTM_Y) {
      return;
    }

    setGraphic(
      new Graphic({
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
      }),
    );
  }, [data.UTM_X, data.UTM_Y, setGraphic]);

  // show the saved flow path once the record has a location, after that FlowPath.tsx updates the layer
  const hasShownSavedFlowPath = useRef(false);
  useEffect(() => {
    if (hasShownSavedFlowPath.current || !flowPathFeatureLayer || !data.ID || !data.UTM_X || !data.UTM_Y) {
      return;
    }

    hasShownSavedFlowPath.current = true;
    flowPathFeatureLayer.definitionExpression = getDefinitionExpression(data.ID);
  }, [data.ID, data.UTM_X, data.UTM_Y, flowPathFeatureLayer]);

  return (
    <div ref={mapNode} className="flex-1">
      {selectorOptions ? <LayerSelector {...selectorOptions}></LayerSelector> : null}
    </div>
  );
}
