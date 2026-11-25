import { useMutation } from '@tanstack/react-query';
import { Button, Dialog, Popover, Select, SelectItem, Spinner, useFirebaseFunctions } from '@ugrc/utah-design-system';
import { httpsCallable } from 'firebase/functions';
import { useState } from 'react';
import { DialogTrigger, type Key } from 'react-aria-components';
import { FLOWPATH_LENGTHS, type FlowpathInput, type IPolyline } from '../../functions/common/shared';
import useData from '../hooks/useDataProvider';
import useFlowPathTriggers from '../hooks/useFlowPathTriggers';
import useMapView from '../hooks/useMapView';
import { getDefinitionExpression } from '../utilities/getDefinitionExpression';

export default function FlowPath() {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { data, requestFlowpathToken } = useData();
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

      setErrorMessage(null);

      const definitionExpression = flowPathFeatureLayer.definitionExpression || getDefinitionExpression(data.ID!);

      // hide the out-of-date flow path while loading so that it is not included in the map auto zoom
      flowPathFeatureLayer.definitionExpression = '2=1';

      try {
        const token = await requestFlowpathToken();

        console.log('Fetching flow path with length:', length);
        await getFlowPath({
          id: data.ID!,
          length,
          token,
          utmX: data.UTM_X!,
          utmY: data.UTM_Y!,
        });

        // calling refresh didn't work reliably
        // updating the definition expression also triggers the map auto zoom (see MapContainer.tsx)
        flowPathFeatureLayer.definitionExpression = getDefinitionExpression(data.ID!);

        setIsOpen(false);
      } catch (error) {
        flowPathFeatureLayer.definitionExpression = definitionExpression;

        throw error;
      }
    },
    onError: (error: unknown) => {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to fetch the flow path.');
    },
  });

  useFlowPathTriggers({ dropdownValue, flowPathFeatureLayer, mapView, mutate, setDropdownValue });

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
          <div className="flex min-w-56 flex-col gap-4">
            {errorMessage ? (
              <p role="alert" className="text-sm text-red-700">
                {errorMessage}
              </p>
            ) : null}
            <Select
              label="Length"
              items={FLOWPATH_LENGTHS}
              selectedKey={dropdownValue}
              onSelectionChange={onSelectionChange}
            >
              {(item) => <SelectItem id={item.value}>{item.name}</SelectItem>}
            </Select>
          </div>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
