import apiClient from "./apiClient";

/**
 * GET /api/events
 * Response: { total, limit, offset, items: [...] }
 */
export async function fetchEvents({ limit = 50, offset = 0, event_type, include_duplicates = true } = {}) {
  const params = { limit, offset, include_duplicates };
  if (event_type) params.event_type = event_type;
  const { data } = await apiClient.get("/events", { params });
  return data;
}

/**
 * POST /api/events
 */
export async function addEvent(event) {
  const { data } = await apiClient.post("/events", event);
  return data;
}
