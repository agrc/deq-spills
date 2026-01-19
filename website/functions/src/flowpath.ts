import type Polyline from '@arcgis/core/geometry/Polyline.js';
import {
  applyEdits,
  queryFeatures,
  type IApplyEditsOptions,
  type IQueryFeaturesResponse,
} from '@esri/arcgis-rest-feature-service';
import {
  ApiKeyManager,
  Job,
  JOB_STATUSES,
  type IFeature,
  type IFeatureSet,
  type IPolyline,
  type Position,
} from '@esri/arcgis-rest-request';
import { FIELDS, type FlowpathInput } from '../common/shared.js';

const UTM_WKID = 26912;

function getAuthentication(apiKey: string) {
  return ApiKeyManager.fromKey(apiKey);
}

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

  const job = await Job.submitJob({
    authentication: getAuthentication(apiKey),
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

export async function getFeature(id: string, apiKey: string, url: string): Promise<IFeature | null> {
  const response = (await queryFeatures({
    authentication: getAuthentication(apiKey),
    url,
    where: `${FIELDS.SALESFORCE_ID} = '${id}'`,
    outFields: ['*'],
    f: 'json',
  })) as IQueryFeaturesResponse;

  if (response.features.length > 0) {
    return response.features[0]!;
  } else {
    return null;
  }
}

export async function writeToFeatureService(
  polyline: Polyline,
  length: FlowpathInput['length'],
  id: string,
  utmX: number,
  utmY: number,
  apiKey: string,
  url: string,
  existingOid?: number,
): Promise<void> {
  const params: IApplyEditsOptions = {
    authentication: getAuthentication(apiKey),
    url,
  };
  const feature = {
    geometry: polyline.toJSON(),
    attributes: {
      [FIELDS.LENGTH]: length,
      [FIELDS.SALESFORCE_ID]: id,
      [FIELDS.UTM_X]: utmX,
      [FIELDS.UTM_Y]: utmY,
    },
  };

  if (existingOid != null) {
    params.updates = [
      {
        geometry: feature.geometry,
        attributes: {
          ...feature.attributes,
          OBJECTID: existingOid,
        },
      },
    ];
  } else {
    params.adds = [feature];
  }

  const response = await applyEdits(params);

  if (response.addResults?.[0]?.error || response.updateResults?.[0]?.error) {
    const error = response.addResults?.[0]?.error || response.updateResults?.[0]?.error;
    throw new Error(`Error writing to feature service: ${JSON.stringify(error)}`);
  }
}
