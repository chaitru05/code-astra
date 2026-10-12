import { useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import { Route, Navigation, MapPin, Info } from "lucide-react";
import { analyzeRoute } from "../services/routesService";
import { ErrorState, EmptyState } from "../components/common/StateDisplays";
import SeverityBadge from "../components/common/SeverityBadge";
import demoRoutes from "../data/demoRoutes";
import { getErrorMessage } from "../utils/formatters";
import { MAP_PROVIDERS, DEFAULT_MAP_PROVIDER } from "../utils/mapProviders";
import L from "leaflet";

// Fix Leaflet default marker icon in bundled builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const ALERT_COLORS = { URGENT: "#F06464", WARNING: "#F5B942", CAUTION: "#60A5FA", NO_MATCHING_INCIDENTS: "#4ADE80" };

export default function JourneyImpact() {
  const [mapProvider, setMapProvider] = useState(DEFAULT_MAP_PROVIDER);
  const [form, setForm] = useState({
    origin_lat: String(demoRoutes[2].origin_lat),
    origin_lon: String(demoRoutes[2].origin_lon),
    destination_lat: String(demoRoutes[2].destination_lat),
    destination_lon: String(demoRoutes[2].destination_lon),
    route_name: demoRoutes[2].name,
    radius_km: "1.0",
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePreset = (preset) => {
    setForm({
      origin_lat: String(preset.origin_lat),
      origin_lon: String(preset.origin_lon),
      destination_lat: String(preset.destination_lat),
      destination_lon: String(preset.destination_lon),
      route_name: preset.name,
      radius_km: "1.0",
    });
    setResult(null);
    setError(null);
  };

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await analyzeRoute({
        origin_lat: parseFloat(form.origin_lat),
        origin_lon: parseFloat(form.origin_lon),
        destination_lat: parseFloat(form.destination_lat),
        destination_lon: parseFloat(form.destination_lon),
        route_name: form.route_name || "Route Analysis",
        radius_km: parseFloat(form.radius_km) || 1.0,
      });
      setResult(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [form]);

  const updateField = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const hasCoords = form.origin_lat && form.origin_lon && form.destination_lat && form.destination_lon;
  const originPos = hasCoords ? [parseFloat(form.origin_lat), parseFloat(form.origin_lon)] : null;
  const destPos = hasCoords ? [parseFloat(form.destination_lat), parseFloat(form.destination_lon)] : null;
  const mapCenter = hasCoords
    ? [(parseFloat(form.origin_lat) + parseFloat(form.destination_lat)) / 2, (parseFloat(form.origin_lon) + parseFloat(form.destination_lon)) / 2]
    : [19.076, 72.8777];

  return (
    <div className="animate-fade-in">
      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
          Journey Impact Analysis
        </h2>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
          Analyze potential incident impact on routes across Mumbai
        </p>
      </div>

      <div className="dashboard-grid">
        {/* Form */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">
              <Navigation size={14} style={{ marginRight: 6 }} />
              Route Parameters
            </span>
          </div>

          {/* Presets */}
          <div style={{ marginBottom: "var(--space-lg)" }}>
            <label className="form-label" style={{ marginBottom: "var(--space-sm)", display: "block" }}>Quick Presets (Click to autofill)</label>
            <div style={{ display: "flex", gap: "var(--space-sm)", flexWrap: "wrap" }}>
              {demoRoutes.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  className={`filter-chip ${form.route_name === r.name ? "active" : ""}`}
                  onClick={() => handlePreset(r)}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group" style={{ marginBottom: "var(--space-md)" }}>
              <label className="form-label">Route Name</label>
              <input type="text" value={form.route_name} onChange={(e) => updateField("route_name", e.target.value)} placeholder="e.g., Morning Commute" />
            </div>

            <div className="form-row" style={{ marginBottom: "var(--space-md)" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Origin Latitude</label>
                <input type="number" step="any" value={form.origin_lat} onChange={(e) => updateField("origin_lat", e.target.value)} placeholder="19.076" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Origin Longitude</label>
                <input type="number" step="any" value={form.origin_lon} onChange={(e) => updateField("origin_lon", e.target.value)} placeholder="72.877" required />
              </div>
            </div>

            <div className="form-row" style={{ marginBottom: "var(--space-md)" }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Destination Latitude</label>
                <input type="number" step="any" value={form.destination_lat} onChange={(e) => updateField("destination_lat", e.target.value)} placeholder="19.120" required />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Destination Longitude</label>
                <input type="number" step="any" value={form.destination_lon} onChange={(e) => updateField("destination_lon", e.target.value)} placeholder="72.846" required />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "var(--space-lg)", maxWidth: 200 }}>
              <label className="form-label">Search Radius (km)</label>
              <input type="number" step="0.1" min="0.1" max="20" value={form.radius_km} onChange={(e) => updateField("radius_km", e.target.value)} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={loading || !hasCoords} style={{ width: "100%" }}>
              {loading ? "Analyzing…" : "Analyze Route"}
            </button>
          </form>
        </div>

        {/* Map */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: "wrap", gap: "var(--space-sm)" }}>
            <span className="card-title">
              <MapPin size={14} style={{ marginRight: 6 }} />
              Route Visualization
            </span>
            <div style={{ display: "flex", gap: 4 }}>
              {Object.values(MAP_PROVIDERS).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`filter-chip ${mapProvider === p.id ? "active" : ""}`}
                  style={{ padding: "2px 8px", fontSize: "0.68rem" }}
                  onClick={() => setMapProvider(p.id)}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          <div className={`map-container ${MAP_PROVIDERS[mapProvider]?.containerClass || "dark-osm-tiles"}`} style={{ height: 380 }}>
            <MapContainer center={mapCenter} zoom={hasCoords ? 12 : 11} style={{ height: "100%", width: "100%" }} key={`${mapCenter[0]}-${mapCenter[1]}`}>
              <TileLayer
                key={mapProvider}
                attribution={MAP_PROVIDERS[mapProvider]?.attribution}
                url={MAP_PROVIDERS[mapProvider]?.url}
                maxZoom={MAP_PROVIDERS[mapProvider]?.maxZoom}
              />
              {originPos && <Marker position={originPos}><Popup>Origin</Popup></Marker>}
              {destPos && <Marker position={destPos}><Popup>Destination</Popup></Marker>}
              {originPos && destPos && (
                <Polyline positions={[originPos, destPos]} color="var(--accent)" weight={3} dashArray="8 4" />
              )}
            </MapContainer>
          </div>
        </div>

        {/* Results */}
        {(result || error) && (
          <div className="card full-width">
            {error ? (
              <ErrorState error={error} message={`Route analysis failed: ${getErrorMessage(error)}`} />
            ) : result ? (
              <>
                <div className="card-header">
                  <span className="card-title">
                    <Route size={14} style={{ marginRight: 6 }} />
                    Analysis Results — {result.route_name}
                  </span>
                  <span
                    className="severity-badge"
                    style={{
                      background: `${ALERT_COLORS[result.alert_level]}20`,
                      color: ALERT_COLORS[result.alert_level],
                      border: `1px solid ${ALERT_COLORS[result.alert_level]}40`,
                    }}
                  >
                    {result.alert_level?.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Proximity Warning */}
                <div className="demo-notice" style={{ marginBottom: "var(--space-lg)", background: "var(--info-bg)", borderColor: "rgba(96,165,250,0.25)", color: "var(--info)" }}>
                  <Info size={16} className="demo-notice-icon" />
                  <div>
                    <strong>Proximity-based impact estimate</strong> — not a verified road or rail route.
                    {result.explanation && <> {result.explanation}</>}
                  </div>
                </div>

                {result.data_notice && (
                  <p style={{ fontSize: "0.75rem", color: "var(--text-tertiary)", marginBottom: "var(--space-md)", fontStyle: "italic" }}>
                    {result.data_notice}
                  </p>
                )}

                <div style={{ display: "flex", gap: "var(--space-lg)", marginBottom: "var(--space-lg)", flexWrap: "wrap" }}>
                  <div className="kpi-card" style={{ flex: 1, minWidth: 140 }}>
                    <span className="kpi-label">Impacted Incidents</span>
                    <span className="kpi-value">{result.impact_count}</span>
                  </div>
                  <div className="kpi-card" style={{ flex: 1, minWidth: 140 }}>
                    <span className="kpi-label">Search Radius</span>
                    <span className="kpi-value">{result.route?.radius_km} km</span>
                  </div>
                  <div className="kpi-card" style={{ flex: 1, minWidth: 140 }}>
                    <span className="kpi-label">Alert Level</span>
                    <span className="kpi-value" style={{ color: ALERT_COLORS[result.alert_level], fontSize: "1.2rem" }}>
                      {result.alert_level?.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Affected Incidents */}
                {result.impacts?.length > 0 ? (
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Incident ID</th>
                          <th>Title</th>
                          <th>Severity</th>
                          <th>Confidence</th>
                          <th>Distance (km)</th>
                          <th>Events</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.impacts.map((imp) => (
                          <tr key={imp.incident_id}>
                            <td className="cell-mono">{imp.incident_id}</td>
                            <td className="cell-primary">{imp.title}</td>
                            <td><SeverityBadge severity={imp.severity} /></td>
                            <td>{imp.confidence ? `${(imp.confidence * 100).toFixed(0)}%` : "—"}</td>
                            <td>{imp.distance_from_route_km} km</td>
                            <td>{imp.event_count}</td>
                            <td>{imp.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <EmptyState
                    icon={Route}
                    title="No incidents near this route"
                    message="No active incidents were found within the search radius. This does not guarantee a clear route."
                  />
                )}
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
