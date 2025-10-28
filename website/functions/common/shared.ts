export { type IPolyline } from '@esri/arcgis-rest-request';

export const FLOWPATH_LENGTHS = [
  {
    name: '1/2 mile',
    value: 0.5,
  },
  {
    name: '1 mile',
    value: 1,
  },
  {
    name: '2 miles',
    value: 2,
  },
  {
    name: '5 miles',
    value: 5,
  },
  {
    name: '10 miles',
    value: 10,
  },
  {
    name: '15 miles',
    value: 15,
  },
];

export type FlowpathInput = {
  length: (typeof FLOWPATH_LENGTHS)[number]['value']; // miles
  utmX: number;
  utmY: number;
};
