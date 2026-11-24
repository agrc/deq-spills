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

async function queryLakes(point: __esri.Point, lakesFeatureLayer: __esri.FeatureLayer): Promise<NearestWaterBody[]> {
  const result = await lakesFeatureLayer.queryFeatures({
    geometry: point,
    spatialRelationship: 'intersects',
    distance: searchDistanceInFeet,
    units: 'feet',
    returnGeometry: true,
    outFields: ['Permanent_Identifier', 'GNIS_Name'],
    where: '1=1',
  });

  return result.features.map((feature) => ({
    distanceInFeet: Math.round(
      geodeticDistanceOperator.execute(point, feature.geometry!, {
        unit: 'feet',
      }),
    ),
    id: `lake:${feature.attributes.Permanent_Identifier}`,
    name: feature.attributes.GNIS_Name ?? null,
  }));
}

export async function queryNearestWaterBody(
  point: __esri.Point,
  streamsFeatureLayer: __esri.FeatureLayer,
  riversFeatureLayer: __esri.FeatureLayer,
  lakesFeatureLayer: __esri.FeatureLayer,
): Promise<NearestWaterBody | null> {
  if (!geodeticDistanceOperator.isLoaded()) {
    await geodeticDistanceOperator.load();
  }

  const [streamCandidates, riverCandidates, lakeCandidates] = await Promise.all([
    queryStreams(point, streamsFeatureLayer),
    queryRivers(point, riversFeatureLayer),
    queryLakes(point, lakesFeatureLayer),
  ]);

  const candidates = [...streamCandidates, ...riverCandidates, ...lakeCandidates];

  if (candidates.length === 0) {
    return null;
  }

  return candidates.sort((a, b) => a.distanceInFeet - b.distanceInFeet)[0]!;
}
