import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Radio, Search, Filter, Plus, RefreshCw, AlertTriangle,
  Copy, GitPullRequest, Clock, MapPin, Eye, X, Check,
  ChevronLeft, ChevronRight, Layers, Database, Sparkles
} from "lucide-react";
import { fetchEvents, addEvent } from "../services/eventsService";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateDisplays";
import DemoNotice from "../components/common/DemoNotice";
import demoEvents from "../data/demoEvents";
import { formatTimestamp, formatShortTime, formatPercent, getErrorMessage } from "../utils/formatters";

const MUMBAI_LOCATIONS = [
  { name: "Hindmata Flyover, Dadar", lat: 19.018, lon: 72.843 },
  { name: "Andheri Subway", lat: 19.119, lon: 72.846 },
  { name: "Milan Subway, Santacruz", lat: 19.088, lon: 72.841 },
  { name: "Gandhi Market, King's Circle", lat: 19.032, lon: 72.859 },
  { name: "Sion Circle", lat: 19.039, lon: 72.862 },
  { name: "Kurla West Station Road", lat: 19.068, lon: 72.879 },
  { name: "Western Express Highway, Goregaon", lat: 19.162, lon: 72.858 },
  { name: "Eastern Freeway, Wadala", lat: 19.022, lon: 72.871 },
];

const EVENT_TYPES = [
  "WATERLOGGING",
  "TRAFFIC_CONGESTION",
  "TREE_FALL",
  "ROAD_CAVE_IN",
  "GRID_FAILURE",
  "METRO_DELAY",
  "POTHOLE_CLUSTER",
  "SIGNAL_FAILURE",
  "ACCIDENT_OBSTRUCTION",
];

const SOURCES = [
  "BMC_DISASTER_MANAGEMENT",
  "MUMBAI_TRAFFIC_POLICE",
  "CITIZEN_REPORT",
  "BEST_TRANSIT_ALERTS",
  "WEATHER_RADAR",
  "SOCIAL_MEDIA_FEED",
  "IOT_WATER_LEVEL_SENSOR",
];

export default function EventFeed() {
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);

  // Pagination & Filters
  const [limit, setLimit] = useState(50);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [includeDuplicates, setIncludeDuplicates] = useState(true);
  const [flagsOnly, setFlagsOnly] = useState(false);

  // Selection & Modal
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addFeedback, setAddFeedback] = useState(null);

  // Auto-refresh / Live polling
  const [livePolling, setLivePolling] = useState(false);

  // Add event form state
  const [formData, setFormData] = useState({
    event_id: "",
    event_type: "WATERLOGGING",
    source: "CITIZEN_REPORT",
    location_name: "Hindmata Flyover, Dadar",
    latitude: "19.018",
    longitude: "72.843",
    confidence: "0.85",
    is_duplicate: false,
    contradiction_flag: false,
    event_timestamp: new Date().toISOString(),
  });

  const loadEvents = useCallback(async (isPolling = false) => {
    if (!isPolling) setLoading(true);
    setError(null);
    try {
      const data = await fetchEvents({
        limit,
        offset,
        event_type: typeFilter !== "ALL" ? typeFilter : undefined,
        include_duplicates: includeDuplicates,
      });
      setEvents(data.items || []);
      setTotal(data.total || 0);
      setIsDemo(false);
    } catch (err) {
      setError(err);
      setIsDemo(true);
      // Client slice of demoEvents for pagination simulation
      const filteredDemo = demoEvents.filter((e) => {
        if (typeFilter !== "ALL" && !e.event_type?.toLowerCase().includes(typeFilter.toLowerCase())) return false;
        if (!includeDuplicates && e.is_duplicate) return false;
        return true;
      });
      setTotal(filteredDemo.length);
      setEvents(filteredDemo.slice(offset, offset + limit));
    } finally {
      if (!isPolling) setLoading(false);
    }
  }, [limit, offset, typeFilter, includeDuplicates]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Live polling interval
  useEffect(() => {
    if (!livePolling) return;
    const interval = setInterval(() => {
      loadEvents(true);
    }, 12000);
    return () => clearInterval(interval);
  }, [livePolling, loadEvents]);

  // Handle refresh event from global Header
  useEffect(() => {
    const handleGlobalRefresh = () => loadEvents();
    window.addEventListener("urbanpulse:refresh", handleGlobalRefresh);
    return () => window.removeEventListener("urbanpulse:refresh", handleGlobalRefresh);
  }, [loadEvents]);

  // Filter items in client for search, source, and flags
  const displayedEvents = useMemo(() => {
    return events.filter((e) => {
      if (sourceFilter !== "ALL" && e.source !== sourceFilter) return false;
      if (flagsOnly && !e.is_duplicate && !e.contradiction_flag) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const match =
          e.event_id?.toLowerCase().includes(q) ||
          e.event_type?.toLowerCase().includes(q) ||
          e.location_name?.toLowerCase().includes(q) ||
          e.source?.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [events, sourceFilter, flagsOnly, searchQuery]);

  const handleOpenAddModal = () => {
    const rnd = Math.floor(1000 + Math.random() * 9000);
    setFormData({
      event_id: `EVT-MUM-${Date.now().toString().slice(-4)}-${rnd}`,
      event_type: "WATERLOGGING",
      source: "CITIZEN_REPORT",
      location_name: "Hindmata Flyover, Dadar",
      latitude: "19.018",
      longitude: "72.843",
      confidence: "0.85",
      is_duplicate: false,
      contradiction_flag: false,
      event_timestamp: new Date().toISOString(),
    });
    setAddFeedback(null);
    setIsAddModalOpen(true);
  };

  const handleLocationPreset = (loc) => {
    setFormData((prev) => ({
      ...prev,
      location_name: loc.name,
      latitude: String(loc.lat),
      longitude: String(loc.lon),
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddFeedback(null);
    try {
      const payload = {
        event_id: formData.event_id.trim(),
        event_type: formData.event_type,
        source: formData.source,
        location_name: formData.location_name.trim(),
        latitude: parseFloat(formData.latitude) || null,
        longitude: parseFloat(formData.longitude) || null,
        confidence: parseFloat(formData.confidence) || 0.8,
        is_duplicate: Boolean(formData.is_duplicate),
        contradiction_flag: Boolean(formData.contradiction_flag),
        event_timestamp: formData.event_timestamp || new Date().toISOString(),
        received_timestamp: new Date().toISOString(),
      };

      await addEvent(payload);
      setAddFeedback({ type: "success", message: `Event ${payload.event_id} ingested successfully!` });
      setTimeout(() => {
        setIsAddModalOpen(false);
        loadEvents();
      }, 1200);
    } catch (err) {
      setAddFeedback({
        type: "error",
        message: `Failed to add event: ${getErrorMessage(err)}`,
      });
    } finally {
      setAddLoading(false);
    }
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="animate-fade-in">
      {isDemo && <DemoNotice message="FastAPI backend is unreachable. Displaying cached demo events stream." />}

      {/* Page Title & Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--space-xl)", flexWrap: "wrap", gap: "var(--space-md)" }}>
        <div>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
            Live Event Feed
          </h2>
          <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
            High-velocity raw sensor and report stream powering real-time incident reconstruction
          </p>
        </div>

        <div style={{ display: "flex", gap: "var(--space-sm)", alignItems: "center" }}>
          <button
            className={`btn btn-sm ${livePolling ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setLivePolling(!livePolling)}
            title={livePolling ? "Auto-refresh active (12s)" : "Enable live polling"}
          >
            <Radio size={14} className={livePolling ? "pulsing-dot" : ""} />
            {livePolling ? "Live Polling ON" : "Live Polling"}
          </button>

          <button className="btn btn-sm btn-secondary" onClick={() => loadEvents()} title="Refresh list">
            <RefreshCw size={14} />
          </button>

          <button className="btn btn-sm btn-primary" onClick={handleOpenAddModal}>
            <Plus size={14} />
            Ingest Event
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-input-wrapper">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            placeholder="Search event ID, type, location, source…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", maxWidth: 300 }}
          />
        </div>

        <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setOffset(0); }}>
          <option value="ALL">All Event Types</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
          ))}
        </select>

        <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="ALL">All Sources</option>
          {SOURCES.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
          ))}
        </select>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={includeDuplicates}
            onChange={(e) => { setIncludeDuplicates(e.target.checked); setOffset(0); }}
          />
          Include Duplicates
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "var(--text-secondary)", cursor: "pointer", userSelect: "none" }}>
          <input
            type="checkbox"
            checked={flagsOnly}
            onChange={(e) => setFlagsOnly(e.target.checked)}
          />
          Flagged Only
        </label>
      </div>

      {/* Main Content Area */}
      <div style={{ display: "flex", gap: "var(--space-lg)", alignItems: "flex-start" }}>
        {/* Table Container */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {loading ? (
            <LoadingState message="Fetching events from backend..." />
          ) : error && !isDemo ? (
            <ErrorState error={error} onRetry={() => loadEvents()} />
          ) : displayedEvents.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No events matched filters"
              message="Try adjusting your query parameters, enabling duplicates, or ingesting a new event."
            />
          ) : (
            <div className="card" style={{ padding: 0 }}>
              <div className="data-table-container" style={{ border: "none" }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Event ID</th>
                      <th>Timestamp</th>
                      <th>Source</th>
                      <th>Event Type</th>
                      <th>Location</th>
                      <th>Conf.</th>
                      <th>Data Flags</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedEvents.map((evt) => (
                      <tr
                        key={evt.event_id}
                        onClick={() => setSelectedEvent(evt)}
                        style={{
                          cursor: "pointer",
                          background: selectedEvent?.event_id === evt.event_id ? "var(--bg-hover)" : undefined,
                        }}
                      >
                        <td className="cell-mono" style={{ fontSize: "0.75rem" }}>
                          {evt.event_id}
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {formatShortTime(evt.event_timestamp)}
                        </td>
                        <td>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                            {evt.source}
                          </span>
                        </td>
                        <td className="cell-primary">
                          {evt.event_type?.replace(/_/g, " ")}
                        </td>
                        <td style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {evt.location_name || "—"}
                        </td>
                        <td>
                          {evt.confidence !== undefined && evt.confidence !== null
                            ? formatPercent(evt.confidence)
                            : "—"}
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--space-xs)", alignItems: "center" }}>
                            {evt.is_duplicate && (
                              <span className="flag duplicate" title="Marked as duplicate evidence">DUP</span>
                            )}
                            {evt.contradiction_flag && (
                              <span className="flag contradiction" title="Contradicts primary cluster report">CONTR</span>
                            )}
                            {!evt.is_duplicate && !evt.contradiction_flag && (
                              <span style={{ color: "var(--text-tertiary)", fontSize: "0.75rem" }}>—</span>
                            )}
                          </div>
                        </td>
                        <td>
                          <Eye size={14} style={{ color: "var(--text-tertiary)" }} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Table Footer with Pagination */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "var(--space-md) var(--space-lg)",
                borderTop: "1px solid var(--border-default)",
                fontSize: "0.8125rem",
                color: "var(--text-secondary)",
                flexWrap: "wrap",
                gap: "var(--space-md)"
              }}>
                <div>
                  Showing {offset + 1}–{Math.min(offset + limit, total)} of {total} events
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-md)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <span>Rows:</span>
                    <select
                      value={limit}
                      onChange={(e) => { setLimit(Number(e.target.value)); setOffset(0); }}
                      style={{ padding: "3px 6px", fontSize: "0.75rem" }}
                    >
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "var(--space-xs)" }}>
                    <button
                      className="icon-btn"
                      disabled={offset === 0}
                      onClick={() => setOffset(Math.max(0, offset - limit))}
                      title="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button
                      className="icon-btn"
                      disabled={offset + limit >= total}
                      onClick={() => setOffset(offset + limit)}
                      title="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Event Detail Inspector Drawer */}
        {selectedEvent && (
          <div className="panel" style={{ width: 380, flexShrink: 0 }}>
            <div className="panel-header">
              <span className="panel-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Radio size={14} />
                Event Detail
              </span>
              <button className="icon-btn" onClick={() => setSelectedEvent(null)}>
                <X size={16} />
              </button>
            </div>
            <div className="panel-body" style={{ maxHeight: "calc(100vh - 220px)", overflowY: "auto" }}>
              <div style={{ marginBottom: "var(--space-md)" }}>
                <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Event Identifier
                </div>
                <div className="cell-mono" style={{ fontSize: "0.9rem", color: "var(--accent)", marginTop: 2 }}>
                  {selectedEvent.event_id}
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-lg)" }}>
                {selectedEvent.is_duplicate && (
                  <span className="flag duplicate">Duplicate Event</span>
                )}
                {selectedEvent.contradiction_flag && (
                  <span className="flag contradiction">Contradiction Flagged</span>
                )}
                {!selectedEvent.is_duplicate && !selectedEvent.contradiction_flag && (
                  <span className="flag" style={{ background: "var(--success-bg)", color: "var(--success)" }}>
                    Clean Telemetry
                  </span>
                )}
              </div>

              <DetailRow label="Event Type" value={selectedEvent.event_type?.replace(/_/g, " ")} />
              <DetailRow label="Source" value={selectedEvent.source} />
              <DetailRow label="Location" value={selectedEvent.location_name || "—"} />
              <DetailRow
                label="Coordinates"
                value={
                  selectedEvent.latitude && selectedEvent.longitude
                    ? `${Number(selectedEvent.latitude).toFixed(4)}, ${Number(selectedEvent.longitude).toFixed(4)}`
                    : "Not specified"
                }
              />
              <DetailRow
                label="Confidence"
                value={
                  selectedEvent.confidence !== undefined
                    ? formatPercent(selectedEvent.confidence)
                    : "—"
                }
              />
              <DetailRow label="Event Timestamp" value={formatTimestamp(selectedEvent.event_timestamp)} />
              {selectedEvent.received_timestamp && (
                <DetailRow label="Received Timestamp" value={formatTimestamp(selectedEvent.received_timestamp)} />
              )}

              {/* Raw JSON View */}
              <div style={{ marginTop: "var(--space-lg)" }}>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "var(--space-xs)" }}>
                  Raw JSON Record
                </div>
                <pre style={{
                  background: "var(--bg-base)",
                  padding: "var(--space-sm)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-mono)",
                  color: "var(--text-secondary)",
                  overflowX: "auto",
                  border: "1px solid var(--border-subtle)",
                }}>
                  {JSON.stringify(selectedEvent, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ingest Event Modal */}
      {isAddModalOpen && (
        <div className="modal-backdrop" onClick={() => !addLoading && setIsAddModalOpen(false)}>
          <div className="modal-card" style={{ maxWidth: 540 }} onClick={(e) => e.stopPropagation()}>
            <div className="card-header" style={{ marginBottom: "var(--space-md)" }}>
              <span className="card-title" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Plus size={16} />
                Ingest New Urban Event
              </span>
              <button className="icon-btn" onClick={() => !addLoading && setIsAddModalOpen(false)}>
                <X size={16} />
              </button>
            </div>

            {addFeedback && (
              <div style={{
                padding: "var(--space-sm) var(--space-md)",
                borderRadius: "var(--radius-md)",
                marginBottom: "var(--space-md)",
                fontSize: "0.8125rem",
                background: addFeedback.type === "success" ? "var(--success-bg)" : "var(--critical-bg)",
                color: addFeedback.type === "success" ? "var(--success)" : "var(--critical)",
                border: `1px solid ${addFeedback.type === "success" ? "rgba(74,222,128,0.2)" : "rgba(240,100,100,0.2)"}`,
              }}>
                {addFeedback.message}
              </div>
            )}

            {/* Quick Location Presets */}
            <div style={{ marginBottom: "var(--space-md)" }}>
              <div style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "var(--space-xs)" }}>
                Quick Mumbai Location Presets:
              </div>
              <div style={{ display: "flex", gap: "var(--space-xs)", flexWrap: "wrap" }}>
                {MUMBAI_LOCATIONS.slice(0, 4).map((loc) => (
                  <button
                    key={loc.name}
                    type="button"
                    className="filter-chip"
                    style={{ fontSize: "0.7rem", padding: "2px 8px" }}
                    onClick={() => handleLocationPreset(loc)}
                  >
                    {loc.name.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAddSubmit}>
              <div className="form-group" style={{ marginBottom: "var(--space-md)" }}>
                <label className="form-label">Event ID</label>
                <input
                  type="text"
                  required
                  value={formData.event_id}
                  onChange={(e) => setFormData({ ...formData, event_id: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ marginBottom: "var(--space-md)" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Event Type</label>
                  <select
                    value={formData.event_type}
                    onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>{t.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Source</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  >
                    {SOURCES.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "var(--space-md)" }}>
                <label className="form-label">Location Name</label>
                <input
                  type="text"
                  required
                  value={formData.location_name}
                  onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
                />
              </div>

              <div className="form-row" style={{ marginBottom: "var(--space-md)" }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Confidence (0.0 - 1.0)</label>
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    max="1"
                    value={formData.confidence}
                    onChange={(e) => setFormData({ ...formData, confidence: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "var(--space-lg)", marginBottom: "var(--space-lg)" }}>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.is_duplicate}
                    onChange={(e) => setFormData({ ...formData, is_duplicate: e.target.checked })}
                  />
                  Mark as Duplicate Evidence
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "var(--text-secondary)", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={formData.contradiction_flag}
                    onChange={(e) => setFormData({ ...formData, contradiction_flag: e.target.checked })}
                  />
                  Mark as Contradiction Flagged
                </label>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-sm)" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  disabled={addLoading}
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={addLoading}
                >
                  {addLoading ? "Submitting..." : "Submit Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      padding: "6px 0",
      borderBottom: "1px solid var(--border-subtle)",
      fontSize: "0.8125rem"
    }}>
      <span style={{ color: "var(--text-tertiary)" }}>{label}</span>
      <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>{value ?? "—"}</span>
    </div>
  );
}
