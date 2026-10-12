import apiClient from "./apiClient";

/**
 * POST /api/routes/analyze
 * Request: { origin_lat, origin_lon, destination_lat, destination_lon, route_name, radius_km }
 * Response: { route_name, route, impact_count, alert_level, impacts, explanation, data_notice }
 */
export async function analyzeRoute({ origin_lat, origin_lon, destination_lat, destination_lon, route_name = "Route Analysis", radius_km = 1.0 }) {
  const { data } = await apiClient.post("/routes/analyze", {
    origin_lat,
    origin_lon,
    destination_lat,
    destination_lon,
    route_name,
    radius_km,
  });
  return data;
}
