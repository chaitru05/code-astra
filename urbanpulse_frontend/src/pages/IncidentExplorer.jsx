import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Search, Filter, ChevronRight, ChevronDown, ChevronUp,
  Clock, Users, AlertTriangle, Shield, X, FileText,
} from "lucide-react";
import { fetchIncidents, fetchIncidentById, fetchIncidentTimeline } from "../services/incidentsService";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateDisplays";
import DemoNotice from "../components/common/DemoNotice";
import SeverityBadge from "../components/common/SeverityBadge";
import demoIncidents from "../data/demoIncidents";
import { formatTimestamp, formatShortTime, formatNumber, formatPercent, truncate } from "../utils/formatters";

export default function IncidentExplorer() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [method, setMethod] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Detail panel
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [timeline, setTimeline] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsDemo(false);
    try {
      const data = await fetchIncidents(200);
      setIncidents(data.items || []);
      setMethod(data.method || "");
    } catch (err) {
      setError(err);
      setIsDemo(true);
      setIncidents(demoIncidents);
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

  // Unique types for filter
  const incidentTypes = useMemo(() => {
    const types = new Set(incidents.map((i) => i.title));
    return Array.from(types).sort();
  }, [incidents]);
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Filtered list
  const filtered = useMemo(() => {
    return incidents.filter((inc) => {
      if (severityFilter !== "ALL" && inc.severity !== severityFilter) return false;
      if (statusFilter !== "ALL" && inc.status !== statusFilter) return false;
      if (typeFilter !== "ALL" && inc.title !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          inc.incident_id?.toLowerCase().includes(q) ||
          inc.title?.toLowerCase().includes(q) ||
          inc.sources?.some((s) => s.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [incidents, severityFilter, statusFilter, typeFilter, searchQuery]);

  const openDetail = useCallback(async (inc) => {
    setSelectedIncident(inc);
    setTimeline(null);
    if (!isDemo) {
      setDetailLoading(true);
      try {
        const tl = await fetchIncidentTimeline(inc.incident_id);
        setTimeline(tl.timeline || []);
      } catch {
        setTimeline([]);
      } finally {
        setDetailLoading(false);
      }
    }
  }, [isDemo]);

  if (loading) return <LoadingState message="Loading incidents…" />;
  if (error && !isDemo) return <ErrorState error={error} onRetry={loadData} />;

  return (
    <div className="animate-fade-in">
      {isDemo && <DemoNotice />}

      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
          Incident Explorer
        </h2>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
          {method && <span>Method: {method} • </span>}
          {filtered.length} of {incidents.length} incidents shown
        </p>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search by ID, title, source…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", maxWidth: 320 }}
          />
        </div>

        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="MAJOR">Major</option>
          <option value="MODERATE">Moderate</option>
        </select>

        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          {incidentTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="DETECTED">Detected</option>
          <option value="INVESTIGATING">Investigating</option>
          <option value="DISPUTED">Disputed</option>
        </select>
      </div>

      <div style={{ display: "flex", gap: "var(--space-lg)" }}>
        {/* Incident List */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 ? (
            <EmptyState icon={Search} title="No incidents match" message="Try adjusting your filters or search query." />
          ) : (
            <div className="data-table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>Confidence</th>
                    <th>Events</th>
                    <th>Status</th>
                    <th>Contradictions</th>
                    <th>Last Seen</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inc) => (
                    <tr
                      key={inc.incident_id}
                      onClick={() => openDetail(inc)}
                      style={{
                        cursor: "pointer",
                        background: selectedIncident?.incident_id === inc.incident_id ? "var(--bg-hover)" : undefined,
                      }}
                    >
                      <td className="cell-mono">{inc.incident_id}</td>
                      <td className="cell-primary">{inc.title}</td>
                      <td><SeverityBadge severity={inc.severity} /></td>
                      <td>{formatPercent(inc.confidence)}</td>
                      <td>{inc.event_count}</td>
                      <td>
                        <StatusLabel status={inc.status} />
                      </td>
                      <td>
                        {inc.contradiction_count > 0 ? (
                          <span className="flag contradiction">{inc.contradiction_count}</span>
                        ) : "—"}
                      </td>
                      <td>{formatShortTime(inc.last_seen)}</td>
                      <td><ChevronRight size={14} style={{ color: "var(--text-tertiary)" }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedIncident && (
          <div className="panel" style={{ width: 400, flexShrink: 0 }}>
            <div className="panel-header">
              <span className="panel-title">{selectedIncident.incident_id}</span>
              <button className="icon-btn" onClick={() => setSelectedIncident(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="panel-body" style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "var(--space-sm)" }}>
                {selectedIncident.title}
              </h3>

              <div style={{ display: "flex", gap: "var(--space-sm)", marginBottom: "var(--space-lg)", flexWrap: "wrap" }}>
                <SeverityBadge severity={selectedIncident.severity} />
                <StatusLabel status={selectedIncident.status} />
              </div>

              <DetailRow label="Confidence" value={formatPercent(selectedIncident.confidence)} />
              <DetailRow label="Total Events" value={selectedIncident.event_count} />
              <DetailRow label="Independent Evidence" value={selectedIncident.independent_evidence_count} />
              <DetailRow label="Duplicates" value={selectedIncident.duplicate_count} />
              <DetailRow label="Contradictions" value={selectedIncident.contradiction_count} />
              <DetailRow label="First Seen" value={formatTimestamp(selectedIncident.first_seen)} />
              <DetailRow label="Last Seen" value={formatTimestamp(selectedIncident.last_seen)} />
              <DetailRow label="Sources" value={selectedIncident.sources?.join(", ") || "—"} />

              {/* Reasons (hypotheses) */}
              {selectedIncident.reasons?.length > 0 && (
                <div style={{ marginTop: "var(--space-lg)" }}>
                  <h4 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-sm)" }}>
                    Severity Reasoning (Hypotheses)
                  </h4>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginBottom: "var(--space-sm)", fontStyle: "italic" }}>
                    These are rule-based hypotheses, not confirmed causes.
                  </p>
                  <ul style={{ paddingLeft: "var(--space-lg)", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {selectedIncident.reasons.map((r, i) => (
                      <li key={i} style={{ marginBottom: 4 }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Reference label */}
              {selectedIncident.reference_label?.incident_title && (
                <div style={{ marginTop: "var(--space-lg)", padding: "var(--space-md)", background: "var(--bg-elevated)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                  <h4 style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-tertiary)", marginBottom: "var(--space-xs)" }}>
                    Reference Label (Demo Only)
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                    {selectedIncident.reference_label.incident_title}
                  </p>
                </div>
              )}

              {/* Timeline */}
              <div style={{ marginTop: "var(--space-xl)" }}>
                <h4 style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-md)", display: "flex", alignItems: "center", gap: "var(--space-sm)" }}>
                  <Clock size={14} /> Event Timeline
                </h4>
                {detailLoading ? (
                  <LoadingState message="Loading timeline…" />
                ) : timeline && timeline.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
                    {timeline.map((tl, i) => (
                      <div
                        key={tl.event_id || i}
                        style={{
                          padding: "var(--space-sm) var(--space-md)",
                          background: "var(--bg-elevated)",
                          borderRadius: "var(--radius-md)",
                          borderLeft: `3px solid ${tl.contradiction_flag ? "var(--critical)" : tl.is_duplicate ? "var(--warning)" : "var(--accent)"}`,
                          fontSize: "0.8rem",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                          <span className="cell-primary">{tl.event_type?.replace(/_/g, " ")}</span>
                          <span style={{ color: "var(--text-tertiary)", fontSize: "0.7rem" }}>
                            {formatShortTime(tl.event_timestamp)}
                          </span>
                        </div>
                        <div style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>
                          {tl.source} • {tl.location_name}
                        </div>
                        <div style={{ display: "flex", gap: "var(--space-xs)", marginTop: 4 }}>
                          {tl.is_duplicate && <span className="flag duplicate">Duplicate</span>}
                          {tl.contradiction_flag && <span className="flag contradiction">Contradiction</span>}
                          {tl.is_late_arrival && <span className="flag" style={{ background: "var(--info-bg)", color: "var(--info)" }}>Late</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                    {isDemo ? "Timeline unavailable in demo mode." : "No timeline data available."}
                  </p>
                )}
              </div>

              {/* Data notice */}
              {selectedIncident.data_notice && (
                <p style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "var(--space-lg)", fontStyle: "italic" }}>
                  {selectedIncident.data_notice}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid var(--border-subtle)", fontSize: "0.8125rem" }}>
      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{value ?? "—"}</span>
    </div>
  );
}

function StatusLabel({ status }) {
  const styles = {
    DETECTED: { background: "var(--success-bg)", color: "var(--success)" },
    INVESTIGATING: { background: "var(--warning-bg)", color: "var(--warning)" },
    DISPUTED: { background: "var(--critical-bg)", color: "var(--critical)" },
  };
  const s = styles[status] || { background: "var(--bg-elevated)", color: "var(--text-secondary)" };
  return (
    <span className="flag" style={s}>{status || "UNKNOWN"}</span>
  );
}
