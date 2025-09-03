import {
  ApiKeyManager,
  Job,
  JOB_STATUSES,
  type IFeature,
  type IFeatureSet,
  type IPolyline,
  type Position,
} from '@esri/arcgis-rest-request';

const UTM_WKID = 26912;

export function clipPolylineToLength(polyline: IPolyline, desiredLength: number): IPolyline {
  // loop through coordinates in paths until we exceed the desired length
  let totalLength = 0;
  const newCoordinates: Position[] = [];

  const coordinates = polyline.paths[0];
  if (!coordinates) {
    throw new Error('No coordinates in polyline');
  }

  let tooFarCoordinate;
  for (let i = 0; i < coordinates.length; i++) {
    if (i === 0) {
      newCoordinates.push(coordinates[i]!);
      continue;
    }

    const currentCoordinates = coordinates[i]!;
    const previousCoordinates = coordinates[i - 1]!;
    const segmentLength = Math.sqrt(
      Math.pow(currentCoordinates[0] - previousCoordinates[0], 2) +
        Math.pow(currentCoordinates[1] - previousCoordinates[1], 2),
    );

    totalLength += segmentLength;

    if (totalLength > desiredLength) {
      tooFarCoordinate = currentCoordinates;
      break;
    } else {
      newCoordinates.push(currentCoordinates);
    }
  }

  if (!tooFarCoordinate) {
    throw new Error('Desired length exceeds polyline length');
  }

  // find point between lastCoordinate and the last coordinate of newCoordinates that makes the total length equal to desiredLength
  const lastCoordinate = newCoordinates[newCoordinates.length - 1]!;
  const segmentLength = Math.sqrt(
    Math.pow(tooFarCoordinate[0] - lastCoordinate[0], 2) + Math.pow(tooFarCoordinate[1] - lastCoordinate[1], 2),
  );
  const desiredSegmentLength = desiredLength - totalLength + segmentLength;
  const clippedCoordinate: Position = [
    lastCoordinate[0] + ((tooFarCoordinate[0] - lastCoordinate[0]) * desiredSegmentLength) / segmentLength,
    lastCoordinate[1] + ((tooFarCoordinate[1] - lastCoordinate[1]) * desiredSegmentLength) / segmentLength,
  ];

  newCoordinates.push(clippedCoordinate);

  if (!polyline.spatialReference || polyline.spatialReference.wkid == null) {
    throw new Error('Polyline is missing a valid spatialReference');
  }
  return {
    paths: [newCoordinates],
    spatialReference: { wkid: polyline.spatialReference.wkid },
  };
}

const FINEST_RESOLUTION = 'Finest';
const TRACE_DOWNSTREAM_URL = 'https://hydro.arcgis.com/arcgis/rest/services/Tools/Hydrology/GPServer/TraceDownstream';
const OUTPUT_RESULT_NAME = 'OutputTraceLine';
export async function tracePath(utmX: number, utmY: number, apiKey: string): Promise<IFeature> {
  const featureSet = {
    displayFieldName: '',
    geometryType: 'esriGeometryPoint',
    spatialReference: {
      wkid: 102100,
      latestWkid: 3857,
    },
    fields: [],
    features: [
      {
        geometry: {
          type: 'point',
          x: utmX,
          y: utmY,
          spatialReference: { wkid: UTM_WKID },
        },
        attributes: {},
      },
    ],
  };

  const params = {
    InputPoints: featureSet,
    DataSourceResolution: FINEST_RESOLUTION,
    'env:outSR': UTM_WKID,
    returnZ: true,
  };

  const accessToken = ApiKeyManager.fromKey(apiKey);
  const job = await Job.submitJob({
    authentication: accessToken,
    params,
    pollingRate: 1000,
    startMonitoring: true,
    url: TRACE_DOWNSTREAM_URL,
  });
  const jobInfo = await job.waitForCompletion();

  if (jobInfo.status !== JOB_STATUSES.Success) {
    throw new Error(
      `Flowpath job failed with status: ${jobInfo.status}, messages: ${JSON.stringify(jobInfo.messages)}`,
    );
  }

  const result = await job.getResult(OUTPUT_RESULT_NAME);
  const outFeatureSet = result.value as IFeatureSet;

  if (!outFeatureSet?.features?.length || outFeatureSet.features.length === 0) {
    throw new Error('No flowpath features returned from the service.');
  }

  const traceFeature = outFeatureSet.features[0]!;

  return traceFeature;
}
