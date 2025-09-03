import * as projectOperator from '@arcgis/core/geometry/operators/projectOperator.js';
import Polyline from '@arcgis/core/geometry/Polyline.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import { type IPolyline } from '@esri/arcgis-rest-request';
import { setGlobalOptions } from 'firebase-functions';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions/v2';
import { onCall } from 'firebase-functions/v2/https';
import { type FlowpathInput } from '../common/shared.js';
import { clipPolylineToLength, tracePath } from './flowpath.js';

const AGOL_API_KEY = defineSecret('AGOL_API_KEY');
setGlobalOptions({ maxInstances: 10 });

const WEB_MERCATOR_WKID = 3857;
const UTM_WKID = 26912;
const MILES_TO_METERS = 1609.34;

export const getFlowPath = onCall<FlowpathInput, Promise<IPolyline>>(
  {
    secrets: [AGOL_API_KEY],
  },
  async (request): Promise<IPolyline> => {
    logger.info('getFlowPath', { data: request.data });

    const { length: desiredMiles, utmX, utmY } = request.data;

    // trace path returns UTM for accuracy in subsequent length calculations
    const traceFeature = await tracePath(utmX, utmY, AGOL_API_KEY.value());
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
      output = clipPolylineToLength(traceGeometry, desiredMeters);
    }

    if (!projectOperator.isLoaded()) {
      await projectOperator.load();
    }
    const projected = projectOperator.execute(new Polyline(output), new SpatialReference({ wkid: WEB_MERCATOR_WKID }));

    // TODO: write to hosted feature service in DEQ AGOL

    return projected.toJSON();
  },
);
