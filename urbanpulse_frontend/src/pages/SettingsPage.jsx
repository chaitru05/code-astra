import { useState, useEffect } from "react";
import {
  Settings, Server, Map, Bell, Sliders, Shield,
  RefreshCw, Check, AlertCircle, Database, Info, RotateCcw
} from "lucide-react";
import { checkHealth } from "../services/healthService";
import ConfirmDialog from "../components/common/ConfirmDialog";

const MUMBAI_ZONES = [
  { name: "Entire Mumbai Metropolitan", center: [19.076, 72.8777], zoom: 11 },
  { name: "South Mumbai / Island City (Colaba - Dadar)", center: [18.96, 72.82], zoom: 13 },
  { name: "Western Suburbs (Bandra - Borivali)", center: [19.12, 72.84], zoom: 12 },
  { name: "Eastern Suburbs (Kurla - Mulund)", center: [19.09, 72.92], zoom: 12 },
  { name: "Navi Mumbai & Harbor Corridor", center: [19.03, 73.02], zoom: 12 },
];

export default function SettingsPage() {
  const envApiUrl = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem("urbanpulse_api_base") || envApiUrl
  );
  const [refreshInterval, setRefreshInterval] = useState(
    localStorage.getItem("urbanpulse_refresh_interval") || "30"
  );
  const [defaultZone, setDefaultZone] = useState(
    localStorage.getItem("urbanpulse_default_zone") || "Entire Mumbai Metropolitan"
  );
  const [minSeverityAlert, setMinSeverityAlert] = useState(
    localStorage.getItem("urbanpulse_min_severity") || "MAJOR"
  );
  const [defaultIncludeDuplicates, setDefaultIncludeDuplicates] = useState(
    localStorage.getItem("urbanpulse_include_dup") !== "false"
  );

  // Ping test
  const [pingStatus, setPingStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [pingLatency, setPingLatency] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const testConnection = async () => {
    setPingStatus("testing");
    setPingLatency(null);
    const start = performance.now();
    try {
      await checkHealth();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
      setPingStatus("success");
    } catch {
      setPingStatus("error");
    }
  };

  const handleSaveSettings = () => {
    localStorage.setItem("urbanpulse_api_base", apiUrl.trim());
    localStorage.setItem("urbanpulse_refresh_interval", refreshInterval);
    localStorage.setItem("urbanpulse_default_zone", defaultZone);
    localStorage.setItem("urbanpulse_min_severity", minSeverityAlert);
    localStorage.setItem("urbanpulse_include_dup", String(defaultIncludeDuplicates));

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);

    // Trigger health update & app refresh
    window.dispatchEvent(new CustomEvent("urbanpulse:refresh"));
  };

  const handleResetSettings = () => {
    localStorage.removeItem("urbanpulse_api_base");
    localStorage.removeItem("urbanpulse_refresh_interval");
    localStorage.removeItem("urbanpulse_default_zone");
    localStorage.removeItem("urbanpulse_min_severity");
    localStorage.removeItem("urbanpulse_include_dup");

    setApiUrl(envApiUrl);
    setRefreshInterval("30");
    setDefaultZone("Entire Mumbai Metropolitan");
    setMinSeverityAlert("MAJOR");
    setDefaultIncludeDuplicates(true);
    setShowResetConfirm(false);

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
    window.dispatchEvent(new CustomEvent("urbanpulse:refresh"));
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
          Platform Settings & Configuration
        </h2>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
          Configure API endpoints, operational preferences, and regional monitoring boundaries
        </p>
      </div>

      {saveSuccess && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-sm)",
          padding: "var(--space-sm) var(--space-md)",
          borderRadius: "var(--radius-md)",
          background: "var(--success-bg)",
          color: "var(--success)",
          border: "1px solid rgba(74,222,128,0.25)",
          marginBottom: "var(--space-lg)",
          fontSize: "0.8125rem"
        }}>
          <Check size={16} />
          Settings saved successfully and dispatched to running services.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-xl)" }}>
        {/* API Backend Configuration */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Server size={16} />
              Backend API Gateway Configuration
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: "var(--space-md)" }}>
            <label className="form-label">FastAPI Base URL</label>
            <div style={{ display: "flex", gap: "var(--space-sm)" }}>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://127.0.0.1:8000/api"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={testConnection}
                disabled={pingStatus === "testing"}
              >
                {pingStatus === "testing" ? (
                  <>Testing...</>
                ) : (
                  <>Test Connection</>
                )}
              </button>
            </div>
            <span className="card-subtitle" style={{ marginTop: 4 }}>
              Default environment value: <code style={{ color: "var(--text-secondary)" }}>{envApiUrl}</code>
            </span>
          </div>

          {/* Ping status feedback */}
          {pingStatus && (
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "var(--space-sm) var(--space-md)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.8rem",
              marginBottom: "var(--space-md)",
              background: pingStatus === "success" ? "var(--success-bg)" : "var(--critical-bg)",
              color: pingStatus === "success" ? "var(--success)" : "var(--critical)",
              border: `1px solid ${pingStatus === "success" ? "rgba(74,222,128,0.2)" : "rgba(240,100,100,0.2)"}`
            }}>
              {pingStatus === "success" ? (
                <>
                  <Check size={14} /> Connected successfully to FastAPI backend ({pingLatency} ms)
                </>
              ) : (
                <>
                  <AlertCircle size={14} /> Could not reach backend at {apiUrl}. Check if the server is running on port 8000.
                </>
              )}
            </div>
          )}

          <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
            <button
              type="button"
              className="filter-chip"
              style={{ fontSize: "0.75rem" }}
              onClick={() => setApiUrl("http://127.0.0.1:8000/api")}
            >
              Preset: 127.0.0.1:8000
            </button>
            <button
              type="button"
              className="filter-chip"
              style={{ fontSize: "0.75rem" }}
              onClick={() => setApiUrl("http://localhost:8000/api")}
            >
              Preset: localhost:8000
            </button>
          </div>
        </div>

        {/* Operational & Regional Preferences */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Map size={16} />
              Mumbai Operational Monitoring Zones
            </span>
          </div>

          <div className="form-group" style={{ marginBottom: "var(--space-lg)" }}>
            <label className="form-label">Primary Monitoring Focus</label>
            <select
              value={defaultZone}
              onChange={(e) => setDefaultZone(e.target.value)}
              style={{ width: "100%", maxWidth: 400 }}
            >
              {MUMBAI_ZONES.map((z) => (
                <option key={z.name} value={z.name}>{z.name}</option>
              ))}
            </select>
            <span className="card-subtitle" style={{ marginTop: 4 }}>
              Sets the initial map viewport center coordinates for Command Center and Route views.
            </span>
          </div>

          <div className="form-row" style={{ marginBottom: "var(--space-md)" }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Auto-Refresh Interval</label>
              <select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(e.target.value)}
              >
                <option value="0">Disabled (Manual only)</option>
                <option value="15">Every 15 seconds</option>
                <option value="30">Every 30 seconds</option>
                <option value="60">Every 60 seconds</option>
              </select>
            </div>

            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Minimum Alert Severity</label>
              <select
                value={minSeverityAlert}
                onChange={(e) => setMinSeverityAlert(e.target.value)}
              >
                <option value="CRITICAL">Critical Only</option>
                <option value="MAJOR">Major & Critical</option>
                <option value="MODERATE">All (Moderate, Major, Critical)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: "var(--space-md)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8125rem", color: "var(--text-secondary)", cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={defaultIncludeDuplicates}
                onChange={(e) => setDefaultIncludeDuplicates(e.target.checked)}
              />
              Show duplicate-flagged evidence records by default across lists
            </label>
          </div>
        </div>

        {/* System & Dataset Telemetry */}
        <div className="card">
          <div className="card-header">
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Database size={16} />
              System Architecture & Provenance
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <InfoRow label="Platform Name" value="UrbanPulse AI — Urban Incident Fusion & Causal Intelligence" />
            <InfoRow label="Coverage Territory" value="Mumbai Metropolitan Region (MMR), Maharashtra, India" />
            <InfoRow label="Backend Architecture" value="FastAPI + Pydantic v2 Rule-Based Inference Engine" />
            <InfoRow label="Frontend Engine" value="React 19 + Vite 8 + React-Router 7 + Leaflet + Recharts + XYFlow" />
            <InfoRow label="Dataset Footprint" value="2,321 Simulated Multi-Source Telemetry Events" />
            <InfoRow label="Validation Scenarios" value="46 Reference Incident Severity Labels" />
            <InfoRow label="Map Tile Source" value="CARTO Dark Matter (OpenStreetMap contributors)" />
          </div>

          <div className="demo-notice" style={{ marginTop: "var(--space-lg)", marginBottom: 0 }}>
            <Info size={16} className="demo-notice-icon" />
            <div>
              <strong>Simulated Data Notice:</strong> All incident and telemetry events are generated synthetic benchmarks designed for testing urban incident reconstruction algorithms. Not intended for actual life safety or real-time navigation.
            </div>
          </div>
        </div>

        {/* Save / Reset Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "var(--space-md)" }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ color: "var(--critical)" }}
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={14} />
            Reset to Defaults
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveSettings}
          >
            <Check size={14} />
            Save Preferences
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={showResetConfirm}
        title="Reset Configuration"
        message="Are you sure you want to restore default API endpoints and operational preferences?"
        onConfirm={handleResetSettings}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "1px solid var(--border-subtle)",
      fontSize: "0.8125rem"
    }}>
      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span style={{ color: "var(--text-secondary)", fontWeight: 500, fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}>
        {value}
      </span>
    </div>
  );
}
