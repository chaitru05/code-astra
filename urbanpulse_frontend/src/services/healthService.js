import apiClient from "./apiClient";

export async function checkHealth() {
  const { data } = await apiClient.get("/health");
  return data;
}

export async function reloadData() {
  const { data } = await apiClient.post("/reload");
  return data;
}
