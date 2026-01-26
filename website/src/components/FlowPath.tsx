import Polyline from '@arcgis/core/geometry/Polyline';
import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, Popover, Select, SelectItem, Spinner, useFirebaseFunctions } from '@ugrc/utah-design-system';
import { httpsCallable } from 'firebase/functions';
import { useEffect, useState } from 'react';
import { DialogTrigger, type Key } from 'react-aria-components';
import { FIELDS, FLOWPATH_LENGTHS, type FlowpathInput, type IPolyline } from '../../functions/common/shared';
import useData from '../hooks/useDataProvider';
import useMapView from '../hooks/useMapView';

export function getDefinitionExpression(id: string): string {
  return `${FIELDS.SALESFORCE_ID} = '${id}'`;
}

export default function FlowPath() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { data, setData } = useData();
  const { functions } = useFirebaseFunctions();
  const getFlowPath = httpsCallable<FlowpathInput, IPolyline>(functions, 'getFlowPath');
  const { mapView, flowPathFeatureLayer } = useMapView();
  const [dropdownValue, setDropdownValue] = useState<number>(FLOWPATH_LENGTHS[0]!.value);

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ length }: { length: number }) => {
      if (!flowPathFeatureLayer) {
        throw new Error('Flow Path Feature Layer is not available');
      }

      if (length === null) {
        throw new Error('Flow Path length is not set');
      }

      console.log('Fetching flow path with length:', length);

      const result = await getFlowPath({
        id: data.ID!,
        length,
        utmX: data.UTM_X!,
        utmY: data.UTM_Y!,
      });

      const geometry = Polyline.fromJSON(result.data);

      mapView!.goTo(geometry.extent!.expand(1.1));

      // append "AND 1=1" to existing definition expression to break any caching
      flowPathFeatureLayer.definitionExpression = `${flowPathFeatureLayer.definitionExpression} AND 1=1`;

      setIsOpen(false);
    },
  });

  // initialize
  useEffect(() => {
    if (!flowPathFeatureLayer || !mapView || !data.ID) {
      return;
    }

    flowPathFeatureLayer.when(() => {
      flowPathFeatureLayer
        .queryFeatures({
          cacheHint: false,
          where: getDefinitionExpression(data.ID!),
          returnGeometry: true,
          outFields: [FIELDS.LENGTH],
        })
        .then((results) => {
          if (results.features.length > 0) {
            const graphic = results.features[0];
            const initialLength = graphic!.attributes[FIELDS.LENGTH] as number;
            setDropdownValue(initialLength);
            console.log('Flowpath loaded from feature service with length:', initialLength);
          } else {
            setDropdownValue(FLOWPATH_LENGTHS[0]!.value);
            mutate({ length: FLOWPATH_LENGTHS[0]!.value });
          }
        });
    });
  }, [data.ID, data.UTM_X, data.UTM_Y, flowPathFeatureLayer, mapView, mutate, setData]);

  const onSelectionChange = (value: Key | null) => {
    setDropdownValue(value as number);
    mutate({ length: value as number });
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
          {length === null ? (
            <div className="flex justify-center p-5">
              <Spinner />
            </div>
          ) : (
            <Select
              label="Length"
              items={FLOWPATH_LENGTHS}
              selectedKey={dropdownValue}
              onSelectionChange={onSelectionChange}
            >
              {(item) => <SelectItem id={item.value}>{item.name}</SelectItem>}
            </Select>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
