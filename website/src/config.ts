const config = {
  DEFAULT_ZOOM_LEVEL: 16,
  MIN_DESKTOP_WIDTH: 768,
  WEB_MERCATOR_WKID: 3857,
  MARKER_FILL_COLOR: [234, 202, 0, 0.5] as [number, number, number, number],
  MARKER_OUTLINE_COLOR: [77, 42, 84, 1] as [number, number, number, number],
  URL: {
    landownership:
      'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_Agency_Web_Mercator/FeatureServer/0',
    waterSystems:
      'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Public_Water_System_Sources/FeatureServer/0',
    majorStreams:
      'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahMajor_Streams/FeatureServer/0',
    majorRivers:
      'https://services1.arcgis.com/99lidPhWCzftIe9K/ArcGIS/rest/services/UtahMajorRiversPoly/FeatureServer/0',
    majorLakes: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahLakesNHD/FeatureServer/0',
  },
  LOCATION_QUERIES: {
    city: {
      url: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahMunicipalBoundaries/FeatureServer/0',
      field: 'Name',
    },
    county: {
      url: 'https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahCountyBoundaries/FeatureServer/0',
      field: 'NAME',
    },
    agency: {
      url: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership_Agency_Web_Mercator/FeatureServer/0',
      field: 'land_owner',
    },
  },
};

export default config;
