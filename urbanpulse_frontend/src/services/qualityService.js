import apiClient from "./apiClient";

/**
 * GET /api/validation/summary
 * Response: { events_loaded, labelled_incidents_available, note, rule_engine, ml_model }
 */
export async function fetchValidationSummary() {
  const { data } = await apiClient.get("/validation/summary");
  return data;
}

/**
 * GET /api/labels/severity
 * Response: { total, items, purpose }
 */
export async function fetchSeverityLabels(limit = 100) {
  const { data } = await apiClient.get("/labels/severity", { params: { limit } });
  return data;
}
