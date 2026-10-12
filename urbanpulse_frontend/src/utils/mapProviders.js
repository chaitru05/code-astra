/**
 * Map Tile Providers with ZERO API Key requirements.
 * Fully public, reliable, and free for demo/production use.
 */
export const MAP_PROVIDERS = {
  darkOsm: {
    id: "darkOsm",
    name: "Dark Tactical (OSM)",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    containerClass: "dark-osm-tiles",
  },
  esriDark: {
    id: "esriDark",
    name: "Esri Dark Gray",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
    attribution: 'Tiles &copy; Esri &mdash; DeLorme, NAVTEQ',
    maxZoom: 16,
    containerClass: "esri-dark-tiles",
  },
  osmStandard: {
    id: "osmStandard",
    name: "Standard OSM",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    containerClass: "standard-osm-tiles",
  },
};

export const DEFAULT_MAP_PROVIDER = "darkOsm";
