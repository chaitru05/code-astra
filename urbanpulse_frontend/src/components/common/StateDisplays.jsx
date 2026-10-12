import { AlertTriangle, RefreshCw } from "lucide-react";
import { getErrorMessage } from "../../utils/formatters";

export function LoadingState({ message = "Loading data…" }) {
  return (
    <div className="loading-container">
      <div className="loading-spinner" />
      <p className="loading-text">{message}</p>
    </div>
  );
}

export function ErrorState({ error, onRetry, message }) {
  return (
    <div className="error-container">
      <AlertTriangle className="error-icon" />
      <p className="error-title">Something went wrong</p>
      <p className="error-message">{message || getErrorMessage(error)}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={14} /> Try Again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon: Icon, title = "No data found", message }) {
  return (
    <div className="empty-container">
      {Icon && <Icon className="empty-icon" />}
      <p className="empty-title">{title}</p>
      {message && <p className="empty-message">{message}</p>}
    </div>
  );
}
