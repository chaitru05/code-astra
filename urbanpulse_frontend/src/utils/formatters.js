/**
 * Format an ISO timestamp to a short readable form.
 */
export function formatTimestamp(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

/**
 * Format a date for a compact display (e.g., tables).
 */
export function formatShortTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "—";
  }
}

/**
 * Return a CSS class suffix for a severity level.
 */
export function severityClass(severity) {
  switch (String(severity).toUpperCase()) {
    case "CRITICAL": return "critical";
    case "MAJOR": return "major";
    case "MODERATE": return "moderate";
    default: return "moderate";
  }
}

/**
 * Truncate text to maxLen characters.
 */
export function truncate(text, maxLen = 80) {
  if (!text) return "";
  return text.length > maxLen ? text.slice(0, maxLen) + "…" : text;
}

/**
 * Safe number formatting.
 */
export function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString("en-IN");
}

/**
 * Percentage formatting.
 */
export function formatPercent(n) {
  if (n === null || n === undefined) return "—";
  return (Number(n) * 100).toFixed(0) + "%";
}

/**
 * Get error message from an Axios error or generic error.
 */
export function getErrorMessage(error) {
  if (!error) return "Unknown error";
  if (error.response?.data?.detail) return error.response.data.detail;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.message === "Network Error") return "Unable to connect to the backend server";
  return error.message || "An unexpected error occurred";
}
