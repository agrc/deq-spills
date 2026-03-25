import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator.js';
import Polyline from '@arcgis/core/geometry/Polyline.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import { type IPolyline } from '@esri/arcgis-rest-request';
import { setGlobalOptions } from 'firebase-functions';
import { defineSecret, defineString } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { FIELDS, type FlowpathInput } from '../common/shared.js';
import { clipPolylineToLength, getFeature, tracePath, writeToFeatureService } from './flowpath.js';
import { type FlowpathJwtConfig, verifyFlowpathJwt } from './verifyFlowpathJwt.js';

const AGOL_API_KEY = defineSecret('AGOL_API_KEY');
const FEATURE_SERVICE_URL = defineString('FEATURE_SERVICE_URL');
const FLOWPATH_JWT_AUDIENCE = defineString('FLOWPATH_JWT_AUDIENCE', {
  default: 'https://spillsmap.dev.utah.gov',
});
const FLOWPATH_JWT_EXPECTED_KID = defineString('FLOWPATH_JWT_EXPECTED_KID', {
  default: 'FirebaseMapCert',
});
const FLOWPATH_JWT_ISSUER = defineString('FLOWPATH_JWT_ISSUER', {
  default: '00D5g000001XoYyEAK',
});
const FLOWPATH_JWT_JWKS_URL = defineString('FLOWPATH_JWT_JWKS_URL', {
  default: 'https://utahdeqorg--eid.sandbox.my.salesforce.com/id/keys',
});

setGlobalOptions({ maxInstances: 10 });

const WEB_MERCATOR_WKID = 3857;
const UTM_WKID = 26912;
const MILES_TO_METERS = 1609.34;

const flowPathDependencies = {
  getFeature,
  tracePath,
  verifyFlowpathJwt,
  writeToFeatureService,
};

export type FlowPathDependencies = typeof flowPathDependencies;

export function getFlowpathJwtConfig(): FlowpathJwtConfig {
  return {
    audience: FLOWPATH_JWT_AUDIENCE.value(),
    expectedKid: FLOWPATH_JWT_EXPECTED_KID.value(),
    issuer: FLOWPATH_JWT_ISSUER.value(),
    jwksUrl: FLOWPATH_JWT_JWKS_URL.value(),
  };
}

export async function handleGetFlowPath(
  requestData: FlowpathInput,
  dependencies: FlowPathDependencies = flowPathDependencies,
  jwtConfig: FlowpathJwtConfig = getFlowpathJwtConfig(),
): Promise<IPolyline> {
  const { token, length: desiredMiles, utmX, utmY, id } = requestData;

  logger.info('getFlowPath', {
    data: {
      id,
      length: desiredMiles,
      utmX,
      utmY,
    },
  });

  if (!token) {
    throw new HttpsError('unauthenticated', 'A Salesforce JWT token is required.');
  }

  try {
    await dependencies.verifyFlowpathJwt(token, id, jwtConfig);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'JWT verification failed.';

    logger.warn('Flowpath token verification failed', { id, message });

    throw new HttpsError('permission-denied', message);
  }

  const existingFeature = await dependencies.getFeature(id, AGOL_API_KEY.value(), FEATURE_SERVICE_URL.value());
  if (
    existingFeature &&
    existingFeature.attributes[FIELDS.LENGTH] === desiredMiles &&
    existingFeature.attributes[FIELDS.UTM_X] === utmX &&
    existingFeature.attributes[FIELDS.UTM_Y] === utmY
  ) {
    logger.info(
      'Existing feature found with matching length and coordinates. Returning existing flowpath from feature service',
    );

    existingFeature.geometry!.spatialReference = { wkid: WEB_MERCATOR_WKID };

    return existingFeature.geometry as IPolyline;
  }

  // trace path returns UTM for accuracy in subsequent length calculations
  logger.debug('Tracing new flowpath...');
  const traceFeature = await dependencies.tracePath(utmX, utmY, AGOL_API_KEY.value());
  const traceLength = traceFeature.attributes.Shape_Length as number;
  const traceGeometry = {
    ...(traceFeature.geometry as IPolyline),
    spatialReference: { wkid: UTM_WKID },
  };

  let output: IPolyline;
  const desiredMeters = desiredMiles * MILES_TO_METERS;
  if (traceLength < desiredMeters) {
    logger.warn(`Flowpath is shorter than desired length: ${traceLength} < ${desiredMeters}`);

    output = traceGeometry;
  } else {
    logger.debug('Clipping flowpath to desired length...');
    output = clipPolylineToLength(traceGeometry, desiredMeters);
  }

  if (!projectOperator.isLoaded()) {
    await projectOperator.load();
  }
  logger.debug('Projecting flowpath to Web Mercator...');
  const projected = projectOperator.execute(new Polyline(output), new SpatialReference({ wkid: WEB_MERCATOR_WKID }));

  logger.debug('Writing flowpath to feature service...');
  await dependencies.writeToFeatureService(
    projected,
    desiredMiles,
    id,
    utmX,
    utmY,
    AGOL_API_KEY.value(),
    FEATURE_SERVICE_URL.value(),
    existingFeature?.attributes?.OBJECTID,
  );

  return projected.toJSON();
}

export const getFlowPath = onCall<FlowpathInput, Promise<IPolyline>>(
  {
    secrets: [AGOL_API_KEY],
  },
  async (request): Promise<IPolyline> => handleGetFlowPath(request.data),
);
