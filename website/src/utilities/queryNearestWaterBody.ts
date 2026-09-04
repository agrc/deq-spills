import * as geodeticDistanceOperator from '@arcgis/core/geometry/operators/geodeticDistanceOperator';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';
import config from '../config';

export type NearestWaterBody = {
  distanceInFeet: number;
  id: string;
  name: string | null;
};

const searchDistanceInFeet = 5280;

const streamsLayer = new FeatureLayer({
  url: config.URL.majorStreams,
  outFields: ['ComID', 'GNIS_Name'],
});

const riversLayer = new FeatureLayer({
  url: config.URL.majorRivers,
  outFields: ['COM_ID', 'NAME'],
});

async function queryStreams(point: __esri.Point): Promise<NearestWaterBody[]> {
  const result = await streamsLayer.queryFeatures({
    geometry: point,
    spatialRelationship: 'intersects',
    distance: searchDistanceInFeet,
    units: 'feet',
    returnGeometry: true,
    outFields: ['ComID', 'GNIS_Name'],
    where: '1=1',
  });

  return result.features.map((feature) => ({
    distanceInFeet: Math.round(
      geodeticDistanceOperator.execute(point, feature.geometry!, {
        unit: 'feet',
      }),
    ),
    id: `stream:${feature.attributes.ComID}`,
    name: feature.attributes.GNIS_Name ?? null,
  }));
}

async function queryRivers(point: __esri.Point): Promise<NearestWaterBody[]> {
  const result = await riversLayer.queryFeatures({
    geometry: point,
    spatialRelationship: 'intersects',
    distance: searchDistanceInFeet,
    units: 'feet',
    returnGeometry: true,
    outFields: ['COM_ID', 'NAME'],
    where: '1=1',
  });

  return result.features.map((feature) => ({
    distanceInFeet: Math.round(
      geodeticDistanceOperator.execute(point, feature.geometry!, {
        unit: 'feet',
      }),
    ),
    id: `river:${feature.attributes.COM_ID}`,
    name: feature.attributes.NAME ?? null,
  }));
}

export async function queryNearestWaterBody(point: __esri.Point): Promise<NearestWaterBody | null> {
  if (!geodeticDistanceOperator.isLoaded()) {
    await geodeticDistanceOperator.load();
  }

  const [streamCandidates, riverCandidates] = await Promise.all([queryStreams(point), queryRivers(point)]);

  const candidates = [...streamCandidates, ...riverCandidates];

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) => a.distanceInFeet - b.distanceInFeet)[0]!;
}
