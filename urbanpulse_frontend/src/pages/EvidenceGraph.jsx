import { useState, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import { GitFork, Info, ZoomIn, Eye, AlertTriangle } from "lucide-react";
import { fetchIncidents, fetchIncidentGraph } from "../services/incidentsService";
import { LoadingState, ErrorState, EmptyState } from "../components/common/StateDisplays";
import DemoNotice from "../components/common/DemoNotice";
import SeverityBadge from "../components/common/SeverityBadge";
import demoIncidents from "../data/demoIncidents";

const SEVERITY_COLORS = { CRITICAL: "#F06464", MAJOR: "#F5B942", MODERATE: "#60A5FA" };
const EDGE_COLORS = { SUPPORTS: "#4ADE80", CONTRADICTS: "#F06464", "DUPLICATE_OF/WEIGHTED_LOW": "#F5B942" };

// Custom node component
function CustomNode({ data }) {
  const isIncident = data.nodeType === "incident";
  const color = isIncident
    ? SEVERITY_COLORS[data.severity] || "#A3E635"
    : data.contradiction ? "#F06464"
    : data.duplicate ? "#F5B942"
    : "#A0A89F";

  return (
    <div
      style={{
        background: "var(--bg-surface)",
        border: `2px solid ${color}`,
        borderRadius: isIncident ? "var(--radius-lg)" : "var(--radius-md)",
        padding: isIncident ? "12px 16px" : "8px 12px",
        minWidth: isIncident ? 140 : 120,
        maxWidth: 200,
        textAlign: "center",
        boxShadow: isIncident ? `0 0 12px ${color}33` : "var(--shadow-sm)",
        cursor: "pointer",
      }}
    >
      <div style={{ fontSize: isIncident ? "0.8rem" : "0.7rem", fontWeight: isIncident ? 700 : 500, color: "var(--text-primary)", lineHeight: 1.3 }}>
        {data.label}
      </div>
      {isIncident && data.severity && (
        <div style={{ marginTop: 6 }}>
          <SeverityBadge severity={data.severity} />
        </div>
      )}
      {!isIncident && (
        <div style={{ fontSize: "0.6rem", color: "var(--text-tertiary)", marginTop: 3 }}>
          {data.duplicate ? "⚠ Duplicate" : data.contradiction ? "⛔ Contradicts" : "Event"}
        </div>
      )}
    </div>
  );
}

const nodeTypes = { custom: CustomNode };

/**
 * Transform backend graph data into ReactFlow nodes/edges.
 */
function transformGraphData(graphData) {
  const { nodes: apiNodes, edges: apiEdges } = graphData;

  // Position nodes: incident in center, events in circle around it
  const incidentNode = apiNodes.find((n) => n.type === "incident");
  const eventNodes = apiNodes.filter((n) => n.type === "event");

  const cx = 400, cy = 300;
  const radius = 220;
  const nodes = [];

  if (incidentNode) {
    nodes.push({
      id: incidentNode.id,
      type: "custom",
      position: { x: cx - 70, y: cy - 30 },
      data: {
        label: incidentNode.label,
        severity: incidentNode.severity,
        nodeType: "incident",
      },
    });
  }

  eventNodes.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / eventNodes.length - Math.PI / 2;
    nodes.push({
      id: node.id,
      type: "custom",
      position: {
        x: cx + radius * Math.cos(angle) - 60,
        y: cy + radius * Math.sin(angle) - 20,
      },
      data: {
        label: node.label,
        nodeType: "event",
        duplicate: node.duplicate,
        contradiction: node.contradiction,
      },
    });
  });

  const edges = apiEdges.map((e, i) => ({
    id: `e-${i}`,
    source: e.source,
    target: e.target,
    type: "default",
    animated: e.type === "SUPPORTS",
    style: {
      stroke: EDGE_COLORS[e.type] || "#A0A89F",
      strokeWidth: 2,
    },
    label: e.type?.replace(/_/g, " "),
    labelStyle: { fontSize: 9, fill: "var(--text-tertiary)" },
    labelBgStyle: { fill: "var(--bg-base)", opacity: 0.8 },
  }));

  return { nodes, edges };
}

export default function EvidenceGraph() {
  const [incidents, setIncidents] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);
  const [graphLoading, setGraphLoading] = useState(false);
  const [error, setError] = useState(null);
  const [graphError, setGraphError] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [selectedNode, setSelectedNode] = useState(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Load incident list
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchIncidents(100);
        setIncidents(data.items || []);
        if (data.items?.length > 0) {
          setSelectedId(data.items[0].incident_id);
        }
      } catch {
        setIsDemo(true);
        setIncidents(demoIncidents);
        if (demoIncidents.length > 0) {
          setSelectedId(demoIncidents[0].incident_id);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load graph for selected incident
  useEffect(() => {
    if (!selectedId || isDemo) return;
    (async () => {
      setGraphLoading(true);
      setGraphError(null);
      try {
        const graphData = await fetchIncidentGraph(selectedId);
        const { nodes: n, edges: e } = transformGraphData(graphData);
        setNodes(n);
        setEdges(e);
      } catch (err) {
        setGraphError(err);
        setNodes([]);
        setEdges([]);
      } finally {
        setGraphLoading(false);
      }
    })();
  }, [selectedId, isDemo, setNodes, setEdges]);

  // Build demo graph
  useEffect(() => {
    if (isDemo && selectedId) {
      const inc = demoIncidents.find((i) => i.incident_id === selectedId);
      if (inc) {
        const demoGraphData = {
          nodes: [
            { id: inc.incident_id, type: "incident", label: inc.title, severity: inc.severity },
            { id: "demo-ev-1", type: "event", label: "BMC: Waterlogging", duplicate: false, contradiction: false },
            { id: "demo-ev-2", type: "event", label: "Citizen: Flood Report", duplicate: true, contradiction: false },
            { id: "demo-ev-3", type: "event", label: "Traffic: Road Block", duplicate: false, contradiction: true },
          ],
          edges: [
            { source: "demo-ev-1", target: inc.incident_id, type: "SUPPORTS" },
            { source: "demo-ev-2", target: inc.incident_id, type: "DUPLICATE_OF/WEIGHTED_LOW" },
            { source: "demo-ev-3", target: inc.incident_id, type: "CONTRADICTS" },
          ],
        };
        const { nodes: n, edges: e } = transformGraphData(demoGraphData);
        setNodes(n);
        setEdges(e);
      }
    }
  }, [isDemo, selectedId, setNodes, setEdges]);

  const onNodeClick = useCallback((_, node) => {
    setSelectedNode(node.data);
  }, []);

  if (loading) return <LoadingState message="Loading evidence graph…" />;

  return (
    <div className="animate-fade-in">
      {isDemo && <DemoNotice message="Showing illustrative demo graph. This is not derived from live evidence." />}

      <div style={{ marginBottom: "var(--space-xl)" }}>
        <h2 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "var(--space-xs)" }}>
          Evidence Graph
        </h2>
        <p style={{ color: "var(--text-tertiary)", fontSize: "0.8125rem" }}>
          Interactive visualization of incident-event-source relationships
        </p>
      </div>

      {/* Incident Selector */}
      <div className="filter-bar">
        <div className="form-group" style={{ flex: 1, maxWidth: 400 }}>
          <label className="form-label">Select Incident</label>
          <select
            value={selectedId}
            onChange={(e) => { setSelectedId(e.target.value); setSelectedNode(null); }}
            style={{ width: "100%" }}
          >
            {incidents.map((inc) => (
              <option key={inc.incident_id} value={inc.incident_id}>
                {inc.incident_id} — {inc.title} ({inc.severity})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Graph */}
      <div className="graph-container" style={{ height: 520 }}>
        {graphLoading ? (
          <LoadingState message="Loading graph data…" />
        ) : graphError ? (
          <ErrorState error={graphError} message="Failed to load graph for this incident." />
        ) : nodes.length === 0 ? (
          <EmptyState icon={GitFork} title="No graph data" message="Select an incident to view its evidence graph." />
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background color="var(--border-subtle)" gap={20} size={1} />
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.data?.nodeType === "incident") return SEVERITY_COLORS[node.data?.severity] || "#A3E635";
                if (node.data?.contradiction) return "#F06464";
                if (node.data?.duplicate) return "#F5B942";
                return "#A0A89F";
              }}
              maskColor="rgba(16, 19, 16, 0.7)"
            />
          </ReactFlow>
        )}
      </div>

      {/* Legend + Selected Node */}
      <div style={{ display: "flex", gap: "var(--space-lg)", marginTop: "var(--space-lg)", flexWrap: "wrap" }}>
        <div className="legend" style={{ flex: 1 }}>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#4ADE80" }} />
            Supports
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#F06464" }} />
            Contradicts
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#F5B942" }} />
            Duplicate / Low Weight
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#F06464", border: "2px solid #F06464" }} />
            Critical
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#F5B942", border: "2px solid #F5B942" }} />
            Major
          </div>
          <div className="legend-item">
            <span className="legend-dot" style={{ background: "#60A5FA", border: "2px solid #60A5FA" }} />
            Moderate
          </div>
        </div>

        {selectedNode && (
          <div className="panel" style={{ minWidth: 280 }}>
            <div className="panel-header">
              <span className="panel-title">
                <Eye size={14} style={{ marginRight: 6 }} />
                Node Details
              </span>
            </div>
            <div className="panel-body">
              <DetailRow label="Label" value={selectedNode.label} />
              <DetailRow label="Type" value={selectedNode.nodeType === "incident" ? "Incident" : "Event"} />
              {selectedNode.severity && <DetailRow label="Severity" value={selectedNode.severity} />}
              {selectedNode.duplicate !== undefined && <DetailRow label="Duplicate" value={selectedNode.duplicate ? "Yes" : "No"} />}
              {selectedNode.contradiction !== undefined && <DetailRow label="Contradiction" value={selectedNode.contradiction ? "Yes" : "No"} />}
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
