import { useState, useEffect, useCallback } from "react";
import {
  Activity, AlertTriangle, Shield, Copy, GitPullRequest,
  MapPin, Clock, ChevronRight, ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { fetchEvents } from "../services/eventsService";
import { fetchIncidents } from "../services/incidentsService";
import { LoadingState, ErrorState } from "../components/common/StateDisplays";
import DemoNotice from "../components/common/DemoNotice";
import SeverityBadge from "../components/common/SeverityBadge";
import demoEvents from "../data/demoEvents";
import demoIncidents from "../data/demoIncidents";
import demoSeverity from "../data/demoSeverity";
import { formatShortTime, formatNumber } from "../utils/formatters";
import { MAP_PROVIDERS, DEFAULT_MAP_PROVIDER } from "../utils/mapProviders";

const MUMBAI_CENTER = [19.076, 72.8777];
const SEVERITY_COLORS = { CRITICAL: "#F06464", MAJOR: "#F5B942", MODERATE: "#60A5FA" };

export default function CommandCenter() {
  const navigate = useNavigate();
  const [mapProvider, setMapProvider] = useState(DEFAULT_MAP_PROVIDER);
  const [events, setEvents] = useState(null);
  const [incidents, setIncidents] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setIsDemo(false);
    try {
      const [evtData, incData] = await Promise.all([
        fetchEvents({ limit: 20, offset: 0 }),
        fetchIncidents(100),
      ]);
      setEvents(evtData);
      setIncidents(incData);
    } catch (err) {
      setError(err);
      // Fallback to demo
      setIsDemo(true);
      setEvents({ total: demoEvents.length, items: demoEvents });
      setIncidents({ total: demoIncidents.length, items: demoIncidents });
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

  if (loading) return <LoadingState message="Loading Command Center…" />;
  if (error && !isDemo) return <ErrorState error={error} onRetry={loadData} />;

  const totalEvents = events?.total ?? 0;
  const eventItems = events?.items ?? [];
  const incidentItems = incidents?.items ?? [];
  const totalIncidents = incidents?.total ?? 0;
  const criticalCount = incidentItems.filter((i) => i.severity === "CRITICAL").length;
  const duplicateCount = eventItems.filter((e) => e.is_duplicate).length;
  const contradictionCount = eventItems.filter((e) => e.contradiction_flag).length;

  // Severity distribution for chart
  const severityDist = isDemo ? demoSeverity : [
    { name: "Critical", value: incidentItems.filter((i) => i.severity === "CRITICAL").length, color: SEVERITY_COLORS.CRITICAL },
    { name: "Major", value: incidentItems.filter((i) => i.severity === "MAJOR").length, color: SEVERITY_COLORS.MAJOR },
    { name: "Moderate", value: incidentItems.filter((i) => i.severity === "MODERATE").length, color: SEVERITY_COLORS.MODERATE },
  ];

  // Source distribution
  const sourceMap = {};
  eventItems.forEach((e) => {
    const src = e.source || "unknown";
    sourceMap[src] = (sourceMap[src] || 0) + 1;
  });
  const sourceData = Object.entries(sourceMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  // Map provider
  const activeProvider = MAP_PROVIDERS[mapProvider] || MAP_PROVIDERS.darkOsm;

  // Incidents with coordinates for map
  const mappableIncidents = incidentItems.filter((i) => i.latitude && i.longitude);

  return (
    <div className="animate-fade-in">
      {isDemo && <DemoNotice />}

      {/* Page Title */}
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
          Command Center
        </h2>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
          Real-time operational overview of urban incident intelligence
        </p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <KpiCard icon={Activity} iconClass="accent" label="Total Events" value={formatNumber(totalEvents)} />
        <KpiCard icon={Shield} iconClass="info" label="Reconstructed Incidents" value={formatNumber(totalIncidents)} />
        <KpiCard icon={AlertTriangle} iconClass="critical" label="Critical Incidents" value={formatNumber(criticalCount)} />
        <KpiCard icon={Copy} iconClass="warning" label="Duplicate-Flagged" value={formatNumber(duplicateCount)} subtitle="In current page" />
        <KpiCard icon={GitPullRequest} iconClass="critical" label="Contradiction-Flagged" value={formatNumber(contradictionCount)} subtitle="In current page" />
      </div>

      {/* Main Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Map */}
        <div className="card full-width">
          <div className="card-header" style={{ flexWrap: "wrap", gap: "var(--space-sm)" }}>
            <span className="card-title">
              <MapPin size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Mumbai Incident Map
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)", flexWrap: "wrap" }}>
              <span style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>
                {mappableIncidents.length} incidents with coordinates
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                {Object.values(MAP_PROVIDERS).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`filter-chip ${mapProvider === p.id ? "active" : ""}`}
                    style={{ padding: "2px 8px", fontSize: "0.7rem" }}
                    onClick={() => setMapProvider(p.id)}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className={`map-container ${activeProvider.containerClass}`} style={{ height: 380 }}>
            <MapContainer center={MUMBAI_CENTER} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
              <TileLayer
                key={activeProvider.id}
                attribution={activeProvider.attribution}
                url={activeProvider.url}
                maxZoom={activeProvider.maxZoom}
              />
              {mappableIncidents.map((inc) => {
                const color = SEVERITY_COLORS[inc.severity] || "#60A5FA";
                return (
                  <CircleMarker
                    key={inc.incident_id}
                    center={[inc.latitude, inc.longitude]}
                    radius={inc.severity === "CRITICAL" ? 10 : inc.severity === "MAJOR" ? 8 : 6}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.6,
                      weight: 2,
                    }}
                  >
                    <Popup>
                      <div style={{ fontFamily: "var(--font-sans)", minWidth: 180 }}>
                        <strong style={{ fontSize: "0.875rem" }}>{inc.title}</strong>
                        <div style={{ fontSize: "0.75rem", color: "#666", marginTop: 4 }}>
                          {inc.incident_id} • {inc.severity}
                        </div>
                        <div style={{ fontSize: "0.75rem", marginTop: 4 }}>
                          Events: {inc.event_count} • Confidence: {(inc.confidence * 100).toFixed(0)}%
                        </div>
                        {inc.first_seen && (
                          <div style={{ fontSize: "0.7rem", color: "#888", marginTop: 4 }}>
                            First seen: {formatShortTime(inc.first_seen)}
                          </div>
                        )}
                        <button
                          className="btn btn-sm btn-primary"
                          style={{ marginTop: 8, width: "100%" }}
                          onClick={() => navigate("/incidents")}
                        >
                          View Details <ChevronRight size={12} />
                        </button>
                      </div>
                    </Popup>
                  </CircleMarker>
                );
              })}
            </MapContainer>
          </div>
        </div>

        {/* Severity Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Severity Distribution</span>
          </div>
          <div className="chart-container" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {severityDist.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Event Sources</span>
          </div>
          <div className="chart-container" style={{ height: 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis type="number" tick={{ fill: "var(--text-tertiary)", fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} width={100} />
                <Tooltip
                  contentStyle={{
                    background: "var(--bg-elevated)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--text-primary)",
                  }}
                />
                <Bar dataKey="value" fill="var(--accent)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Events Table */}
        <div className="card full-width">
          <div className="card-header">
            <span className="card-title">
              <Clock size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Recent Events
            </span>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate("/event-feed")}>
              View All <ExternalLink size={12} />
            </button>
          </div>
          <div className="data-table-container" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Time</th>
                  <th>Flags</th>
                </tr>
              </thead>
              <tbody>
                {eventItems.slice(0, 8).map((evt) => (
                  <tr key={evt.event_id}>
                    <td className="cell-mono">{evt.event_id?.slice(0, 12)}</td>
                    <td>{evt.source}</td>
                    <td className="cell-primary">{evt.event_type?.replace(/_/g, " ")}</td>
                    <td>{evt.location_name || "—"}</td>
                    <td>{formatShortTime(evt.event_timestamp)}</td>
                    <td>
                      {evt.is_duplicate && <span className="flag duplicate">DUP</span>}
                      {evt.contradiction_flag && <span className="flag contradiction" style={{ marginLeft: 4 }}>CONTR</span>}
                      {!evt.is_duplicate && !evt.contradiction_flag && <span style={{ color: "var(--text-tertiary)" }}>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Incident List */}
        <div className="card full-width">
          <div className="card-header">
            <span className="card-title">
              <Shield size={14} style={{ marginRight: 6, verticalAlign: "middle" }} />
              Active Incidents
            </span>
            <button className="btn btn-sm btn-secondary" onClick={() => navigate("/incidents")}>
              Explorer <ExternalLink size={12} />
            </button>
          </div>
          <div className="data-table-container" style={{ border: "none" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Events</th>
                  <th>Status</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {incidentItems.slice(0, 10).map((inc) => (
                  <tr key={inc.incident_id} style={{ cursor: "pointer" }} onClick={() => navigate("/incidents")}>
                    <td className="cell-mono">{inc.incident_id}</td>
                    <td className="cell-primary">{inc.title}</td>
                    <td><SeverityBadge severity={inc.severity} /></td>
                    <td>{inc.confidence ? `${(inc.confidence * 100).toFixed(0)}%` : "—"}</td>
                    <td>{inc.event_count}</td>
                    <td>
                      <span className={`flag ${inc.status === "DISPUTED" ? "contradiction" : inc.status === "INVESTIGATING" ? "duplicate" : ""}`}
                        style={inc.status === "DETECTED" ? { background: "var(--success-bg)", color: "var(--success)", padding: "2px 6px", borderRadius: "var(--radius-sm)", fontSize: "0.65rem", fontWeight: 600, textTransform: "uppercase" } : {}}>
                        {inc.status}
                      </span>
                    </td>
                    <td>{formatShortTime(inc.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, iconClass, label, value, subtitle }) {
  return (
    <div className="kpi-card">
      <div className={`kpi-icon ${iconClass}`}>
        <Icon size={18} />
      </div>
      <span className="kpi-label">{label}</span>
      <span className="kpi-value">{value}</span>
      {subtitle && <span className="card-subtitle">{subtitle}</span>}
    </div>
  );
}
