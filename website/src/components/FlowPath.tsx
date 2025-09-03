import Polyline from '@arcgis/core/geometry/Polyline';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, Popover, Select, SelectItem, Spinner, useFirebaseFunctions } from '@ugrc/utah-design-system';
import { useMapReady } from '@ugrc/utilities/hooks';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useRef, useState } from 'react';
import { DialogTrigger, type Key } from 'react-aria-components';
import { FIELDS, FLOWPATH_LENGTHS, type FlowpathInput, type IPolyline } from '../../functions/common/shared';
import useData from '../hooks/useDataProvider';
import useMapView from '../hooks/useMapView';

export default function FlowPath() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data, setData } = useData();
  const { functions } = useFirebaseFunctions();
  const getFlowPath = httpsCallable<FlowpathInput, IPolyline>(functions, 'getFlowPath');
  const { mapView } = useMapView();
  const mapReady = useMapReady(mapView);
  const featureLayer = useRef<__esri.FeatureLayer | null>(null);
  const [length, setLength] = useState<number>(FLOWPATH_LENGTHS[0]!.value);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const result = await getFlowPath({
        id: data.ID!,
        length,
        utmX: data.UTM_X!,
        utmY: data.UTM_Y!,
      });

      const geometry = Polyline.fromJSON(result.data);

      mapView!.goTo(geometry.extent!.expand(1.1));

      featureLayer.current!.definitionExpression = `${featureLayer.current?.definitionExpression} AND 1=1`;

      setIsOpen(false);
    },
  });

  // initialize
  useEffect(() => {
    if (!mapReady || !mapView || !mapView.map || featureLayer.current) {
      return;
    }

    featureLayer.current = new FeatureLayer({
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
      definitionExpression: `${FIELDS.SALESFORCE_ID} = '${data.ID}'`,
      legendEnabled: false,
    });
    featureLayer.current.when(() => {
      featureLayer
        .current!.queryFeatures({
          where: '1=1',
          returnGeometry: true,
          outFields: [FIELDS.LENGTH],
        })
        .then((results) => {
          if (results.features.length > 0) {
            const graphic = results.features[0];
            mapView.goTo(graphic!.geometry!.extent!.expand(1.1));
            const length = graphic!.attributes[FIELDS.LENGTH] as number;
            setLength(length);
            console.log('Flowpath loaded from feature service with length:', length);
          } else {
            mutate();
          }
        });
    });
    mapView.map.add(featureLayer.current);
  }, [data.ID, data.UTM_X, data.UTM_Y, mapReady, mapView, mutate, setData]);

  useEffect(() => {
    if (featureLayer.current && data.UTM_X !== null && data.UTM_Y !== null) {
      mutate();
    }
  }, [data.UTM_X, data.UTM_Y, mutate]);

  const onSelectionChange = (value: Key | null) => {
    setLength(value as number);
    mutate();
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button variant="secondary">
        Flow Path{' '}
        {isPending ? (
          <div className="ml-3 size-5">
            <Spinner />
          </div>
        ) : null}
      </Button>
      <Popover showArrow>
        <Dialog>
          <Select label="Length" items={FLOWPATH_LENGTHS} selectedKey={length} onSelectionChange={onSelectionChange}>
            {(item) => <SelectItem id={item.value}>{item.name}</SelectItem>}
          </Select>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
