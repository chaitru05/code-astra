import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AlertTriangle, FileCheck, CheckCircle2,
  Info, Search, RefreshCw, Cpu, Layers,
  Activity
} from "lucide-react";
import { fetchValidationSummary, fetchSeverityLabels } from "../services/qualityService";
import { LoadingState, ErrorState } from "../components/common/StateDisplays";
import DemoNotice from "../components/common/DemoNotice";
import SeverityBadge from "../components/common/SeverityBadge";
import { formatNumber } from "../utils/formatters";

// Simulated reference labels if offline
const DEMO_LABELS = [
  {
    incident_title: "Severe Waterlogging at Hindmata Flyover under heavy downpour",
    category: "FLOODING",
    ground_truth_severity: "CRITICAL",
    ward: "F/South",
    source_agency: "MCGM",
    notes: "Historically chronic flood spot during high tide + rain > 60mm/hr",
  },
  {
    incident_title: "Subway submerged at Andheri West railway underpass",
    category: "TRANSIT_DISRUPTION",
    ground_truth_severity: "CRITICAL",
    ward: "K/West",
    source_agency: "Traffic Police",
    notes: "Traffic diverted to Captain Gore Flyover",
  },
  {
    incident_title: "Tree collapse crushing overhead electric line at SV Road Bandra",
    category: "OBSTRUCTION",
    ground_truth_severity: "MAJOR",
    ward: "H/West",
    source_agency: "Fire Brigade",
    notes: "Power cut for 3 hours, one lane blocked",
  },
  {
    incident_title: "Signals non-functional at Sion Circle junction",
    category: "GRID_INFRASTRUCTURE",
    ground_truth_severity: "MAJOR",
    ward: "F/North",
    source_agency: "Traffic Police",
    notes: "Manual police dispatch required to manage gridlock",
  },
  {
    incident_title: "Water stagnation at Milan Subway Santacruz",
    category: "FLOODING",
    ground_truth_severity: "CRITICAL",
    ward: "H/East",
    source_agency: "MCGM",
    notes: "Pumps deployed at capacity",
  },
  {
    incident_title: "Pothole cratering near Kurla CST Road junction",
    category: "ROAD_DAMAGE",
    ground_truth_severity: "MODERATE",
    ward: "L",
    source_agency: "Citizen App",
    notes: "Slow vehicular movement, suspension hazard",
  },
  {
    incident_title: "BEST bus breakdown blocking northbound Western Express Highway",
    category: "TRANSIT_DISRUPTION",
    ground_truth_severity: "MAJOR",
    ward: "P/South",
    source_agency: "BEST Transit",
    notes: "Towing crane dispatched",
  },
  {
    incident_title: "Minor storm drain backflow near Dadar TT Circle",
    category: "FLOODING",
    ground_truth_severity: "MODERATE",
    ward: "G/North",
    source_agency: "MCGM",
    notes: "Controlled within 45 minutes",
  },
];

export default function DataQuality() {
  const [summary, setSummary] = useState(null);
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Filter state for reference labels
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sumData, lblData] = await Promise.all([
        fetchValidationSummary(),
        fetchSeverityLabels(100),
      ]);
      setSummary(sumData);
      setLabels(lblData.items || []);
      setIsDemo(false);
    } catch (err) {
      setError(err);
      setIsDemo(true);
      // Fallback demo summary
      setSummary({
        events_loaded: 2321,
        labelled_incidents_available: 46,
        note: "Severity labels are reference scenarios. Before calculating accuracy, match predicted incidents to labels using an explicit incident-matching procedure. Do not use labels as inference inputs.",
        rule_engine: "enabled",
        ml_model: "not required for this basic demo",
      });
      setLabels(DEMO_LABELS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const handler = () => loadData();
    window.addEventListener("urbanpulse:refresh", handler);
    return () => window.removeEventListener("urbanpulse:refresh", handler);
  }, [loadData]);

  // Unique categories for filtering
  const categories = useMemo(() => {
    const set = new Set();
    labels.forEach((l) => {
      const cat = l.category || l.event_type || l.incident_type;
      if (cat) set.add(cat);
    });
    return Array.from(set).sort();
  }, [labels]);

  const filteredLabels = useMemo(() => {
    return labels.filter((item) => {
      const sev = item.ground_truth_severity || item.severity || item.severity_label;
      if (severityFilter !== "ALL" && sev !== severityFilter) return false;

      const cat = item.category || item.event_type || item.incident_type;
      if (categoryFilter !== "ALL" && cat !== categoryFilter) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const title = (item.incident_title || item.title || "").toLowerCase();
        const ward = (item.ward || "").toLowerCase();
        const notes = (item.notes || item.description || "").toLowerCase();
        if (!title.includes(q) && !ward.includes(q) && !notes.includes(q)) return false;
      }
      return true;
    });
  }, [labels, severityFilter, categoryFilter, searchQuery]);

  if (loading) return <LoadingState message="Loading Data Quality & Validation Summary..." />;
  if (error && !isDemo) return <ErrorState error={error} onRetry={loadData} />;

  return (
    <div className="animate-fade-in">
      {isDemo && <DemoNotice message="Backend offline. Displaying benchmark baseline from validation dataset." />}

      {/* Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-xl)", flexWrap: "wrap", gap: "var(--space-md)" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
            Data Quality & Rule Validation
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
            Benchmark scenarios, heuristic verification, and dataset integrity telemetry
          </p>
        </div>

        <button className="btn btn-sm btn-secondary" onClick={loadData}>
          <RefreshCw size={14} /> Refresh Summary
        </button>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon accent">
            <Activity size={18} />
          </div>
          <span className="kpi-label">Events Loaded</span>
          <span className="kpi-value">{formatNumber(summary?.events_loaded ?? 2321)}</span>
          <span className="card-subtitle">FastAPI Ingested Records</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon info">
            <FileCheck size={18} />
          </div>
          <span className="kpi-label">Benchmark Scenarios</span>
          <span className="kpi-value">{summary?.labelled_incidents_available ?? 46}</span>
          <span className="card-subtitle">Ground Truth Labels</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
            <Cpu size={18} />
          </div>
          <span className="kpi-label">Inference Engine</span>
          <span className="kpi-value" style={{ textTransform: "capitalize", fontSize: "1.25rem" }}>
            {summary?.rule_engine || "Active"}
          </span>
          <span className="card-subtitle">Spatial-temporal clustering</span>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon warning">
            <Layers size={18} />
          </div>
          <span className="kpi-label">ML Model Status</span>
          <span className="kpi-value" style={{ fontSize: "1.05rem" }}>
            Rule-Based
          </span>
          <span className="card-subtitle">Deterministic Heuristics</span>
        </div>
      </div>

      {/* Critical Methodology Notice */}
      <div className="demo-notice" style={{
        margin: "var(--space-xl) 0",
        background: "rgba(96, 165, 250, 0.08)",
        borderColor: "rgba(96, 165, 250, 0.25)",
        color: "var(--text-primary)"
      }}>
        <Info size={20} style={{ color: "var(--info)", flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 600, color: "var(--info)", marginBottom: 4 }}>
            System Methodology & Rule-Validation Notice
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
            {summary?.note || "Severity labels are reference scenarios. Before calculating accuracy, match predicted incidents to labels using an explicit incident-matching procedure. Do not use labels as inference inputs."}
          </p>
        </div>
      </div>

      {/* Data Fusion Diagnostics Grid */}
      <div className="dashboard-grid" style={{ marginBottom: "var(--space-xl)" }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <CheckCircle2 size={16} style={{ color: "var(--success)", marginRight: 6 }} />
              Deduplication & Cross-Referencing
            </span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "var(--space-md)" }}>
            Events sharing identical location clusters within a 15-minute sliding window are merged to prevent incident score amplification.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <MetricRow label="Temporal Clustering Window" value="15 minutes" />
            <MetricRow label="Spatial Proximity Radius" value="0.75 km" />
            <MetricRow label="Duplicate Weight Penalty" value="0.25x weight" />
            <MetricRow label="Independent Confirmation Boost" value="+15% confidence" />
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <AlertTriangle size={16} style={{ color: "var(--warning)", marginRight: 6 }} />
              Contradiction & Discrepancy Resolution
            </span>
          </div>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "var(--space-md)" }}>
            Conflicting reports (e.g. road clear vs. impassable) trigger an automated DISPUTED tag and preserve full evidence provenance.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
            <MetricRow label="Conflict Threshold" value="Opposing status flags" />
            <MetricRow label="Official Agency Priority" value="1.5x over unverified citizen" />
            <MetricRow label="Disputed Incidents Quarantine" value="Flagged for manual review" />
            <MetricRow label="Hypothesis Integrity" value="Explanatory reasoning attached" />
          </div>
        </div>
      </div>

      {/* Reference Severity Labels Section */}
      <div className="card full-width">
        <div className="card-header">
          <div>
            <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <FileCheck size={16} />
              Ground Truth Reference Benchmark Scenarios
            </span>
            <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: 2 }}>
              Used exclusively for offline evaluation; never injected as inference inputs
            </div>
          </div>
          <span className="badge" style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)" }}>
            {filteredLabels.length} of {labels.length} records
          </span>
        </div>

        {/* Filters */}
        <div className="filter-bar" style={{ padding: "var(--space-md) var(--space-lg)", borderBottom: "1px solid var(--border-default)" }}>
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Search reference scenario title, ward, notes…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", maxWidth: 300 }}
            />
          </div>

          <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="MAJOR">Major</option>
            <option value="MODERATE">Moderate</option>
          </select>

          {categories.length > 0 && (
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c.replace(/_/g, " ")}</option>
              ))}
            </select>
          )}
        </div>

        {/* Labels Table */}
        <div className="data-table-container" style={{ border: "none" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference Scenario</th>
                <th>Category</th>
                <th>Ground Truth Severity</th>
                <th>Ward / Zone</th>
                <th>Source / Agency</th>
                <th>Validation Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredLabels.map((item, idx) => {
                const sev = item.ground_truth_severity || item.severity || item.severity_label || "MODERATE";
                const cat = item.category || item.event_type || item.incident_type || "General";
                return (
                  <tr key={idx}>
                    <td className="cell-primary" style={{ maxWidth: 280, fontWeight: 500 }}>
                      {item.incident_title || item.title || item.name}
                    </td>
                    <td>
                      <span className="cell-mono" style={{ fontSize: "0.75rem" }}>
                        {cat.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>
                      <SeverityBadge severity={sev} />
                    </td>
                    <td>
                      <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                        {item.ward || item.location_name || "Mumbai"}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>
                        {item.source_agency || item.source || "Historical MCGM"}
                      </span>
                    </td>
                    <td style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", maxWidth: 240 }}>
                      {item.notes || item.description || "Reference test case for causal rule validation."}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "8px 0",
      borderBottom: "1px solid var(--border-subtle)",
      fontSize: "0.8125rem"
    }}>
      <span style={{ color: "var(--text-secondary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 600, fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
        {value}
      </span>
    </div>
  );
}
