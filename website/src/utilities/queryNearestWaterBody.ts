import * as geodeticDistanceOperator from '@arcgis/core/geometry/operators/geodeticDistanceOperator';

export type NearestWaterBody = {
  distanceInFeet: number;
  id: string;
  name: string | null;
};

const searchDistanceInFeet = 5280;

async function queryStreams(
  point: __esri.Point,
  streamsFeatureLayer: __esri.FeatureLayer,
): Promise<NearestWaterBody[]> {
  const result = await streamsFeatureLayer.queryFeatures({
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

async function queryRivers(point: __esri.Point, riversFeatureLayer: __esri.FeatureLayer): Promise<NearestWaterBody[]> {
  const result = await riversFeatureLayer.queryFeatures({
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

export async function queryNearestWaterBody(
  point: __esri.Point,
  streamsFeatureLayer: __esri.FeatureLayer,
  riversFeatureLayer: __esri.FeatureLayer,
): Promise<NearestWaterBody | null> {
  if (!geodeticDistanceOperator.isLoaded()) {
    await geodeticDistanceOperator.load();
  }

  const [streamCandidates, riverCandidates] = await Promise.all([
    queryStreams(point, streamsFeatureLayer),
    queryRivers(point, riversFeatureLayer),
  ]);

  const candidates = [...streamCandidates, ...riverCandidates];

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) => a.distanceInFeet - b.distanceInFeet)[0]!;
}
