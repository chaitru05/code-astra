import apiClient from "./apiClient";

/**
 * GET /api/incidents
 * Response: { total, items: [...], method }
 */
export async function fetchIncidents(limit = 100) {
  const { data } = await apiClient.get("/incidents", { params: { limit } });
  return data;
}

/**
 * GET /api/incidents/:id
 */
export async function fetchIncidentById(incidentId) {
  const { data } = await apiClient.get(`/incidents/${incidentId}`);
  return data;
}

/**
 * GET /api/incidents/:id/timeline
 * Response: { incident_id, timeline: [...] }
 */
export async function fetchIncidentTimeline(incidentId) {
  const { data } = await apiClient.get(`/incidents/${incidentId}/timeline`);
  return data;
}

/**
 * GET /api/incidents/:id/graph
 * Response: { nodes: [...], edges: [...] }
 */
export async function fetchIncidentGraph(incidentId) {
  const { data } = await apiClient.get(`/incidents/${incidentId}/graph`);
  return data;
}
