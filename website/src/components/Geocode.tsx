import Point from '@arcgis/core/geometry/Point';
import {
  Banner,
  Button,
  Dialog,
  Popover,
  Select,
  SelectItem,
  Spinner,
  TextField,
  useGeocoding,
} from '@ugrc/utah-design-system';
import { useState } from 'react';
import { DialogTrigger } from 'react-aria-components';
import useData from '../hooks/useDataProvider';
import { defineLocation } from '../utilities/defineLocation';

type SearchType = 'single-address' | 'route-milepost';

export default function Geocode() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchType, setSearchType] = useState<SearchType>('single-address');
  const { setData } = useData();
  const [error, setError] = useState<string | null>(null);

  const clearAndClose = () => {
    setIsOpen(false);
  };

  const onSuccess = async (result: __esri.GraphicProperties) => {
    const point = new Point(result.geometry as __esri.PointProperties);

    let location;
    if (searchType === 'single-address') {
      location = await defineLocation(point, `${firstInput}, ${secondInput}`);
    } else {
      location = await defineLocation(point, null, firstInput, secondInput);
    }

    setData(location);
    setIsOpen(false);
  };

  const onError = (error: string | { message: string }) => setError(typeof error === 'string' ? error : error.message);

  const { getFirstFieldProps, getSecondFieldProps, getButtonProps, status, firstInput, secondInput } = useGeocoding({
    apiKey: import.meta.env.VITE_WEB_API,
    events: {
      success: onSuccess,
      // @ts-expect-error geocode types are messed up
      error: onError,
    },
    type: searchType,
  });

  const onOpenChange = (open: boolean) => {
    setError(null);
    setIsOpen(open);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={onOpenChange}>
      <Button variant="secondary">Address or Route/Milepost</Button>
      <Popover showArrow>
        <Dialog className="flex flex-col space-y-2">
          <Select
            label="Search by"
            onSelectionChange={(key) => setSearchType(key as SearchType)}
            selectedKey={searchType}
          >
            <SelectItem id="single-address">Street Address</SelectItem>
            <SelectItem id="route-milepost">Route & Milepost</SelectItem>
          </Select>
          <TextField {...getFirstFieldProps()} />
          <TextField {...getSecondFieldProps()} />
          <div className="flex w-full justify-end gap-2 pt-2">
            <Button type="button" variant="accent" onPress={clearAndClose}>
              Cancel
            </Button>
            <Button {...getButtonProps()}>{status === 'pending' ? <Spinner /> : 'Search'}</Button>
          </div>
          {error ? <Banner>{error}</Banner> : null}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
