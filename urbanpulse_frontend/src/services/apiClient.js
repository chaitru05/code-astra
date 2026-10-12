import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to support runtime API base URL overrides from Settings
apiClient.interceptors.request.use((config) => {
  const customBase = typeof window !== "undefined" ? localStorage.getItem("urbanpulse_api_base") : null;
  if (customBase) {
    config.baseURL = customBase;
  }
  return config;
});

// Response interceptor — never silently return fake data
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred";
    console.error("[UrbanPulse API Error]", message, error);
    return Promise.reject(error);
  }
);

export default apiClient;
