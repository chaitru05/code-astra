import { RefreshCw, Menu, Database } from "lucide-react";

export default function Header({
  title,
  description,
  healthStatus,
  onRefresh,
  refreshing,
  onMobileMenuToggle,
}) {
  const statusLabel =
    healthStatus === "online" ? "API Connected" :
    healthStatus === "offline" ? "API Offline" : "Checking…";

  const statusClass =
    healthStatus === "online" ? "online" :
    healthStatus === "offline" ? "offline" : "demo";

  return (
    <header className="header">
      <div className="header-left">
        <button className="header-mobile-toggle icon-btn" onClick={onMobileMenuToggle}>
          <Menu size={20} />
        </button>
        <div>
          <div className="header-page-title">{title}</div>
          {description && <div className="header-page-desc">{description}</div>}
        </div>
      </div>

      <div className="header-right">
        {/* Dataset Provenance */}
        <span className="status-badge demo" title="Dataset contains synthetic demo data">
          <Database size={10} />
          Demo Dataset
        </span>

        {/* API Status */}
        <span className={`status-badge ${statusClass}`}>
          <span className="status-dot" />
          {statusLabel}
        </span>

        {/* Refresh */}
        <button
          className="icon-btn"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh data"
        >
          <RefreshCw size={16} className={refreshing ? "spinning" : ""} style={refreshing ? { animation: "spin 0.8s linear infinite" } : {}} />
        </button>
      </div>
    </header>
  );
}
