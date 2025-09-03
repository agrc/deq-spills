import Graphic from '@arcgis/core/Graphic';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import { useQuery } from '@tanstack/react-query';
import { Button, Dialog, Popover, Select, SelectItem, Spinner, useFirebaseFunctions } from '@ugrc/utah-design-system';
import { useMapReady } from '@ugrc/utilities/hooks';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useRef, useState } from 'react';
import { DialogTrigger } from 'react-aria-components';
import type { Key } from 'react-stately';
import { FLOWPATH_LENGTHS, type FlowpathInput, type IPolyline } from '../../functions/common/shared';
import type { NumberOrNull } from '../contexts/DataProvider';
import useData from '../hooks/useDataProvider';
import useMapView from '../hooks/useMapView';

export default function FlowPath() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data, setData } = useData();
  const { functions } = useFirebaseFunctions();
  const getFlowPath = httpsCallable<FlowpathInput, IPolyline>(functions, 'getFlowPath');
  const { mapView } = useMapView();
  const mapReady = useMapReady(mapView);
  const graphicsLayer = useRef<__esri.GraphicsLayer | null>(null);

  const query = useQuery({
    queryKey: ['flowpath', data.FLOWPATH_LENGTH, data.UTM_X, data.UTM_Y],
    enabled: data.FLOWPATH_LENGTH !== null && data.UTM_X !== null && data.UTM_Y !== null && mapReady,
    queryFn: async () => {
      const result = await getFlowPath({
        // these should be defined because of the enabled config above
        length: data.FLOWPATH_LENGTH!,
        utmX: data.UTM_X!,
        utmY: data.UTM_Y!,
      });

      const graphic = new Graphic({
        geometry: {
          ...result.data,
          type: 'polyline',
        },
        symbol: {
          type: 'simple-line',
          color: [0, 0, 255, 0.5],
          width: 4,
          style: 'solid',
        },
      });
      return graphic;
    },
    staleTime: Infinity,
  });

  useEffect(() => {
    if (!mapReady || !mapView || !mapView.map || graphicsLayer.current) {
      return;
    }

    graphicsLayer.current = new GraphicsLayer();
    mapView.map.add(graphicsLayer.current);
  }, [mapReady, mapView]);

  useEffect(() => {
    // TODO: this will likely turn into refreshing a feature layer once we start storing geometries in AGOL
    if (!query.data) {
      graphicsLayer.current?.removeAll();
    } else {
      graphicsLayer.current?.add(query.data);
      mapView?.goTo(query.data?.geometry?.extent?.expand(1.1));
    }
  }, [query.data, mapView]);

  const onLengthChange = (length: Key | null) => {
    setData((prev) => ({
      ...prev,
      FLOWPATH_LENGTH: length as NumberOrNull,
    }));
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button variant="secondary">
        Flow Path{' '}
        {query.isLoading ? (
          <div className="ml-3 size-5">
            <Spinner />
          </div>
        ) : null}
      </Button>
      <Popover showArrow>
        <Dialog>
          <Select
            label="Length"
            items={FLOWPATH_LENGTHS}
            selectedKey={data.FLOWPATH_LENGTH}
            onSelectionChange={onLengthChange}
          >
            {(item) => <SelectItem id={item.value}>{item.name}</SelectItem>}
          </Select>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
