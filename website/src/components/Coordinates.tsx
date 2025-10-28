import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator';
import Point from '@arcgis/core/geometry/Point';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import { Button, Dialog, Popover, Select, SelectItem, TextField } from '@ugrc/utah-design-system';
import { useState } from 'react';
import { DialogTrigger } from 'react-aria-components';
import useData from '../hooks/useDataProvider';
import { defineLocation } from '../utilities/defineLocation';

const utm = new SpatialReference({ wkid: 26912 });
export const blankValues = {
  dd: {
    latitude: '',
    longitude: '',
  },
  dm: {
    latitudeDegrees: '',
    latitudeMinutes: '',
    longitudeDegrees: '',
    longitudeMinutes: '',
  },
  dms: {
    latitudeDegrees: '',
    latitudeMinutes: '',
    latitudeSeconds: '',
    longitudeDegrees: '',
    longitudeMinutes: '',
    longitudeSeconds: '',
  },
  utm: {
    x: '',
    y: '',
  },
} as const;
const constraints = {
  longitude: [109, 114],
  latitude: [36.9, 42.1],
  minutes: [0, 60],
  seconds: [0, 60],
  utmX: [200000, 700000],
  utmY: [4000000, 4654000],
} as const;

export function getDDCoordinates(
  type: Omit<CoordinateType, 'utm'>,
  values: CoordinateValues,
): { x: number; y: number } {
  let xy;
  switch (type) {
    case 'dd': {
      xy = {
        x: -Math.abs(Number(values.dd.longitude)),
        y: Number(values.dd.latitude),
      };
      break;
    }
    case 'dm': {
      xy = {
        x: -Math.abs(Number(values.dm.longitudeDegrees) + Number(values.dm.longitudeMinutes) / 60),
        y: Number(values.dm.latitudeDegrees) + Number(values.dm.latitudeMinutes) / 60,
      };
      break;
    }
    case 'dms': {
      xy = {
        x: -Math.abs(
          Number(values.dms.longitudeDegrees) +
            Number(values.dms.longitudeMinutes) / 60 +
            Number(values.dms.longitudeSeconds) / 3600,
        ),
        y:
          Number(values.dms.latitudeDegrees) +
          Number(values.dms.latitudeMinutes) / 60 +
          Number(values.dms.latitudeSeconds) / 3600,
      };
      break;
    }
    default:
      throw new Error(`Invalid coordinate type: ${type}`);
  }

  return xy;
}

async function getUtmPoint(type: CoordinateType, values: CoordinateValues): Promise<Point> {
  if (type === 'utm') {
    return new Point({
      x: Number(values.utm.x),
      y: Number(values.utm.y),
      spatialReference: utm,
    });
  }

  const ddPoint = new Point({
    ...getDDCoordinates(type, values),
    spatialReference: { wkid: 4326 },
  });

  if (!projectOperator.isLoaded()) {
    await projectOperator.load();
  }

  return projectOperator.execute(ddPoint, utm) as Point;
}

export function hasPopulatedValues(values: CoordinateValues, type: CoordinateType): boolean {
  switch (type) {
    case 'dd':
      return values.dd.latitude !== '' && values.dd.longitude !== '';
    case 'dm':
      return (
        values.dm.latitudeDegrees !== '' &&
        values.dm.latitudeMinutes !== '' &&
        values.dm.longitudeDegrees !== '' &&
        values.dm.longitudeMinutes !== ''
      );
    case 'dms':
      return (
        values.dms.latitudeDegrees !== '' &&
        values.dms.latitudeMinutes !== '' &&
        values.dms.latitudeSeconds !== '' &&
        values.dms.longitudeDegrees !== '' &&
        values.dms.longitudeMinutes !== '' &&
        values.dms.longitudeSeconds !== ''
      );
    case 'utm':
      return values.utm.x !== '' && values.utm.y !== '';
    default:
      throw new Error(`Invalid coordinate type: ${type}`);
  }
}

function InputContainer({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-2 sm:flex-row">{children}</div>;
}

type CoordinateType = 'dd' | 'dm' | 'dms' | 'utm';
type CoordinateValues = {
  dd: {
    latitude: string;
    longitude: string;
  };
  dm: {
    latitudeDegrees: string;
    latitudeMinutes: string;
    longitudeDegrees: string;
    longitudeMinutes: string;
  };
  dms: {
    latitudeDegrees: string;
    latitudeMinutes: string;
    latitudeSeconds: string;
    longitudeDegrees: string;
    longitudeMinutes: string;
    longitudeSeconds: string;
  };
  utm: {
    x: string;
    y: string;
  };
};

export default function Coordinates() {
  const [coordinateType, setCoordinateType] = useState<CoordinateType>('dd');
  const [values, setValues] = useState<CoordinateValues>(blankValues);
  const [isOpen, setIsOpen] = useState(false);
  const { setData } = useData();

  const getHandleChange = (type: CoordinateType, name: string) => (newValue: string) => {
    setValues((previousValues) => ({
      ...previousValues,
      [type]: {
        ...previousValues[type],
        [name]: newValue,
      },
    }));
  };

  function getValidateRange([min, max]: readonly [number, number]) {
    return (value: string) => {
      const num = Number(value);

      if (num > max) {
        return `Value must be less than ${max}`;
      }
      if (num < min) {
        return `Value must be greater than ${min}`;
      }

      return null;
    };
  }

  const getCoordinateInputs = (type: CoordinateType) => {
    switch (type) {
      case 'dd':
        return (
          <>
            <TextField
              isRequired
              label="Longitude (W)"
              type="number"
              value={values.dd.longitude}
              onChange={getHandleChange('dd', 'longitude')}
              validate={(value) => getValidateRange(constraints.longitude)(Math.abs(Number(value)).toString())}
            />
            <TextField
              isRequired
              label="Latitude (N)"
              type="number"
              value={values.dd.latitude}
              onChange={getHandleChange('dd', 'latitude')}
              validate={getValidateRange(constraints.latitude)}
            />
          </>
        );
      case 'dm':
        return (
          <>
            <InputContainer>
              <TextField
                isRequired
                label="Longitude (W)"
                type="number"
                value={values.dm.longitudeDegrees}
                onChange={getHandleChange('dm', 'longitudeDegrees')}
                validate={getValidateRange(constraints.longitude)}
              />
              <TextField
                isRequired
                label="Minutes"
                type="number"
                value={values.dm.longitudeMinutes}
                onChange={getHandleChange('dm', 'longitudeMinutes')}
                validate={getValidateRange(constraints.minutes)}
              />
            </InputContainer>
            <InputContainer>
              <TextField
                isRequired
                label="Latitude (N)"
                type="number"
                value={values.dm.latitudeDegrees}
                onChange={getHandleChange('dm', 'latitudeDegrees')}
                validate={getValidateRange(constraints.latitude)}
              />
              <TextField
                isRequired
                label="Minutes"
                type="number"
                value={values.dm.latitudeMinutes}
                onChange={getHandleChange('dm', 'latitudeMinutes')}
                validate={getValidateRange(constraints.minutes)}
              />
            </InputContainer>
          </>
        );
      case 'dms':
        return (
          <>
            <InputContainer>
              <TextField
                isRequired
                label="Longitude (W)"
                type="number"
                value={values.dms.longitudeDegrees}
                onChange={getHandleChange('dms', 'longitudeDegrees')}
                validate={getValidateRange(constraints.longitude)}
              />
              <TextField
                isRequired
                label="Minutes"
                type="number"
                value={values.dms.longitudeMinutes}
                onChange={getHandleChange('dms', 'longitudeMinutes')}
                validate={getValidateRange(constraints.minutes)}
              />
              <TextField
                isRequired
                label="Seconds"
                type="number"
                value={values.dms.longitudeSeconds}
                onChange={getHandleChange('dms', 'longitudeSeconds')}
                validate={getValidateRange(constraints.seconds)}
              />
            </InputContainer>
            <InputContainer>
              <TextField
                isRequired
                label="Latitude (N)"
                type="number"
                value={values.dms.latitudeDegrees}
                onChange={getHandleChange('dms', 'latitudeDegrees')}
                validate={getValidateRange(constraints.latitude)}
              />
              <TextField
                isRequired
                label="Minutes"
                type="number"
                value={values.dms.latitudeMinutes}
                onChange={getHandleChange('dms', 'latitudeMinutes')}
                validate={getValidateRange(constraints.minutes)}
              />
              <TextField
                isRequired
                label="Seconds"
                type="number"
                value={values.dms.latitudeSeconds}
                onChange={getHandleChange('dms', 'latitudeSeconds')}
                validate={getValidateRange(constraints.seconds)}
              />
            </InputContainer>
          </>
        );
      case 'utm':
        return (
          <>
            <TextField isRequired label="X" type="number" value={values.utm.x} onChange={getHandleChange('utm', 'x')} />
            <TextField isRequired label="Y" type="number" value={values.utm.y} onChange={getHandleChange('utm', 'y')} />
          </>
        );
      default:
        throw new Error(`Invalid coordinate type: ${type}`);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const point = await getUtmPoint(coordinateType, values);
    const locationData = await defineLocation(point);
    setData((prevData) => ({ ...prevData, ...locationData }));
    clearAndClose();
  };

  const clearAndClose = () => {
    setValues(blankValues);
    setIsOpen(false);
  };

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <Button variant="secondary">Coordinates</Button>
      <Popover showArrow>
        <Dialog>
          <form onSubmit={handleSubmit} className="space-y-2">
            <Select
              label="Coordinate type"
              onSelectionChange={(key) => setCoordinateType(key as CoordinateType)}
              selectedKey={coordinateType}
            >
              <SelectItem id="dd">Decimal Degrees</SelectItem>
              <SelectItem id="dm">Degrees, Minutes</SelectItem>
              <SelectItem id="dms">Degrees, Minutes, Seconds</SelectItem>
              <SelectItem id="utm">UTM</SelectItem>
            </Select>
            {getCoordinateInputs(coordinateType)}
            <div className="flex w-full justify-end gap-2 pt-2">
              <Button type="button" variant="accent" onPress={clearAndClose}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" isDisabled={!hasPopulatedValues(values, coordinateType)}>
                Submit
              </Button>
            </div>
          </form>
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
