const config = {
  DEFAULT_ZOOM_LEVEL: 16,
  MIN_DESKTOP_WIDTH: 768,
  WEB_MERCATOR_WKID: 3857,
  MARKER_FILL_COLOR: [234, 202, 0, 0.5] as [number, number, number, number],
  MARKER_OUTLINE_COLOR: [77, 42, 84, 1] as [number, number, number, number],
  URL: {
    landownership: 'https://gis.trustlands.utah.gov/mapping/rest/services/Land_Ownership/FeatureServer/0',
    waterSystems:
      'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Public_Water_System_Sources/FeatureServer/0',
  },
  LOCATION_QUERIES: {
    city: {
      table: 'boundaries.municipal_boundaries',
      field: 'name',
    },
    county: {
      table: 'boundaries.county_boundaries',
      field: 'name',
    },
    agency: {
      table: 'cadastre.land_ownership',
      field: 'agency',
    },
  },
};

export default config;
