from __future__ import annotations

import csv
import math
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = Path(os.getenv("URBANPULSE_DATA_DIR", BASE_DIR / "data"))

EVENTS_FILE = DATA_DIR / "urban_incident_events.csv"
SEVERITY_FILE = DATA_DIR / "incident_severity_labels.csv"
GROUND_TRUTH_FILE = DATA_DIR / "incident_ground_truth.csv"

app = FastAPI(
    title="UrbanPulse AI Backend",
    description="Rule-based urban incident demo API. Dataset records are simulated.",
    version="0.1.0",
)

# For local frontend development. Restrict this list before public deployment.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_events: list[dict[str, Any]] = []
_severity_labels: dict[str, dict[str, Any]] = {}
_ground_truth: dict[str, dict[str, Any]] = {}
_load_warnings: list[str] = []
_cached_incidents: list[dict[str, Any]] = []


def parse_bool(value: Any) -> bool:
    return str(value).strip().lower() in {"true", "1", "yes", "y"}


def parse_float(value: Any, default: Optional[float] = None) -> Optional[float]:
    try:
        if value is None or str(value).strip() == "":
            return default
        return float(value)
    except (TypeError, ValueError):
        return default


def parse_dt(value: Any) -> Optional[datetime]:
    if not value:
        return None
    try:
        result = datetime.fromisoformat(str(value).strip().replace("Z", "+00:00"))
        if result.tzinfo is None:
            result = result.replace(tzinfo=timezone.utc)
        return result
    except ValueError:
        return None


def read_csv(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def load_data() -> None:
    global _events, _severity_labels, _ground_truth, _load_warnings, _cached_incidents
    _load_warnings = []
    _cached_incidents = []

    raw_events = read_csv(EVENTS_FILE)
    if not raw_events:
        _load_warnings.append(
            f"No events loaded. Place urban_incident_events.csv in {DATA_DIR}"
        )

    cleaned = []
    for row in raw_events:
        event = dict(row)
        event["event_id"] = str(row.get("event_id", "")).strip()
        event["source"] = str(row.get("source", "unknown")).strip()
        event["event_type"] = str(row.get("event_type", "UNKNOWN")).strip()
        event["location_name"] = str(row.get("location_name", "Unknown location")).strip()
        event["latitude"] = parse_float(row.get("latitude"))
        event["longitude"] = parse_float(row.get("longitude"))
        event["source_reliability"] = parse_float(row.get("source_reliability"), 0.5) or 0.5
        event["is_duplicate"] = parse_bool(row.get("is_duplicate"))
        event["contradiction_flag"] = parse_bool(row.get("contradiction_flag"))
        event["event_dt"] = parse_dt(row.get("event_timestamp"))
        event["received_dt"] = parse_dt(row.get("received_timestamp"))
        event["raw_text_payload"] = str(row.get("raw_text_payload", ""))
        event["measured_value"] = str(row.get("measured_value", ""))
        cleaned.append(event)

    # Keep first occurrence of each event_id. Dataset duplicate flags are preserved,
    # because they represent reports marked as duplicates, not necessarily duplicate IDs.
    by_id = {}
    for event in cleaned:
        if event["event_id"]:
            by_id.setdefault(event["event_id"], event)
    _events = list(by_id.values())

    labels = read_csv(SEVERITY_FILE)
    _severity_labels = {
        str(row.get("incident_id", "")).strip(): row
        for row in labels if row.get("incident_id")
    }

    truth_rows = read_csv(GROUND_TRUTH_FILE)
    _ground_truth = {
        str(row.get("event_id", "")).strip(): row
        for row in truth_rows if row.get("event_id")
    }

    if not labels:
        _load_warnings.append(
            f"No severity labels loaded. Optional file expected at {SEVERITY_FILE}"
        )


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    radius = 6371.0
    p1, p2 = math.radians(lat1), math.radians(lat2)
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(p1) * math.cos(p2) * math.sin(dlon / 2) ** 2
    return 2 * radius * math.asin(math.sqrt(min(1.0, a)))


def event_is_usable(event: dict[str, Any]) -> bool:
    # Duplicate-marked records are retained in the feed, but do not count as
    # independent corroboration when scoring incidents.
    return not event["is_duplicate"]


def compatible_events(a: dict[str, Any], b: dict[str, Any]) -> bool:
    if a["event_dt"] is None or b["event_dt"] is None:
        return False
    if a["latitude"] is None or a["longitude"] is None:
        return False
    if b["latitude"] is None or b["longitude"] is None:
        return False

    minutes = abs((a["event_dt"] - b["event_dt"]).total_seconds()) / 60
    distance = haversine_km(
        a["latitude"], a["longitude"], b["latitude"], b["longitude"]
    )
    # Hackathon-friendly initial rule. Infrastructure/route topology can refine this.
    if minutes > 180 or distance > 2.5:
        return False

    ta = a["event_type"].upper()
    tb = b["event_type"].upper()
    background_a = "BACKGROUND" in ta or "ROUTINE" in ta
    background_b = "BACKGROUND" in tb or "ROUTINE" in tb
    if background_a and background_b:
        return False
    return True


def make_clusters() -> list[list[dict[str, Any]]]:
    usable = [e for e in _events if not (
        e["event_type"].upper().find("ROUTINE_BACKGROUND") >= 0
    )]
    # Greedy spatial-temporal grouping, not a trained model. Sort by event time;
    # each event joins the closest compatible existing cluster or starts a new one.
    usable.sort(key=lambda e: e["event_dt"] or datetime.min.replace(tzinfo=timezone.utc))
    clusters: list[list[dict[str, Any]]] = []

    for event in usable:
        best_idx, best_score = None, float("inf")
        for idx, cluster in enumerate(clusters):
            # Since usable is sorted by event_dt, if cluster's latest event is > 180 min away, skip
            if cluster[-1]["event_dt"] and event["event_dt"]:
                if (event["event_dt"] - cluster[-1]["event_dt"]).total_seconds() > 10800:
                    continue
            candidates = [x for x in cluster if compatible_events(event, x)]
            if not candidates:
                continue
            score = min(
                haversine_km(event["latitude"], event["longitude"], x["latitude"], x["longitude"])
                + abs((event["event_dt"] - x["event_dt"]).total_seconds()) / 3600 * 0.2
                for x in candidates
            )
            if score < best_score:
                best_idx, best_score = idx, score
        if best_idx is None:
            clusters.append([event])
        else:
            clusters[best_idx].append(event)
    return clusters


def score_cluster(cluster: list[dict[str, Any]], label: Optional[dict[str, Any]] = None) -> dict[str, Any]:
    unique_evidence = [e for e in cluster if event_is_usable(e)]
    evidence = unique_evidence or cluster
    event_types = " ".join(e["event_type"].upper() for e in evidence)
    text = " ".join(e["raw_text_payload"].lower() for e in evidence)
    values = " ".join(str(e["measured_value"]).lower() for e in evidence)
    combined = event_types + " " + text + " " + values

    # Simple transparent severity rules. They are demo heuristics, not calibrated probabilities.
    score = 0
    reasons = []
    if any(k in combined for k in ["submergence", "critical", "chemical", "fire", "overturned", "blocked / critical"]):
        score += 4
        reasons.append("A high-risk hazard keyword was detected")
    if any(k in combined for k in ["flood", "waterlogging", "inundation", "water level"]):
        score += 2
        reasons.append("Flooding or waterlogging evidence was detected")
    if any(k in combined for k in ["collision", "accident", "crash", "spill", "wire failure", "signal failure", "power failure"]):
        score += 2
        reasons.append("A transport or utility disruption was detected")
    if len(evidence) >= 5:
        score += 2
        reasons.append("Multiple non-duplicate observations support the incident")
    elif len(evidence) >= 2:
        score += 1
        reasons.append("More than one non-duplicate observation supports the incident")
    if any(e["contradiction_flag"] for e in cluster):
        score -= 1
        reasons.append("Contradictory evidence reduces confidence")

    if score >= 6:
        severity = "CRITICAL"
    elif score >= 3:
        severity = "MAJOR"
    else:
        severity = "MODERATE"

    # Confidence is an evidence-quality heuristic, not a calibrated probability.
    reliability = sum(max(0.0, min(1.0, e["source_reliability"])) for e in evidence) / max(1, len(evidence))
    independent_count = len({e["source"] for e in evidence})
    confidence = 0.35 + 0.35 * reliability + min(independent_count, 4) * 0.06
    if len(evidence) >= 3:
        confidence += 0.05
    if any(e["contradiction_flag"] for e in cluster):
        confidence -= 0.12
    confidence = round(max(0.1, min(0.95, confidence)), 2)

    latitudes = [e["latitude"] for e in evidence if e["latitude"] is not None]
    longitudes = [e["longitude"] for e in evidence if e["longitude"] is not None]
    times = [e["event_dt"] for e in cluster if e["event_dt"] is not None]
    received = [e["received_dt"] for e in cluster if e["received_dt"] is not None]
    contradictions = sum(1 for e in cluster if e["contradiction_flag"])
    duplicate_count = sum(1 for e in cluster if e["is_duplicate"])

    title = None
    known_cause = None
    if label:
        title = label.get("incident_title")
        known_cause = label.get("known_cause")
        # Ground-truth severity label is included only as a comparison/reference field,
        # never used to compute the rule-based predicted severity.
    return {
        "event_count": len(cluster),
        "independent_evidence_count": len(evidence),
        "duplicate_count": duplicate_count,
        "contradiction_count": contradictions,
        "severity": severity,
        "severity_score": score,
        "confidence": confidence,
        "reasons": reasons or ["Limited evidence; severity remains provisional"],
        "latitude": round(sum(latitudes) / len(latitudes), 6) if latitudes else None,
        "longitude": round(sum(longitudes) / len(longitudes), 6) if longitudes else None,
        "first_seen": min(times).isoformat() if times else None,
        "last_seen": max(times).isoformat() if times else None,
        "last_received": max(received).isoformat() if received else None,
        "event_ids": [e["event_id"] for e in cluster],
        "sources": sorted({e["source"] for e in cluster}),
        "sample_evidence": [
            {
                "event_id": e["event_id"],
                "source": e["source"],
                "event_type": e["event_type"],
                "event_timestamp": e["event_timestamp"],
                "received_timestamp": e["received_timestamp"],
                "location_name": e["location_name"],
                "raw_text_payload": e["raw_text_payload"],
                "is_duplicate": e["is_duplicate"],
                "contradiction_flag": e["contradiction_flag"],
            }
            for e in cluster[:12]
        ],
        "reference_label": {
            "incident_title": title,
            "known_cause": known_cause,
            "severity_level": label.get("severity_level") if label else None,
        } if label else None,
        "data_notice": "Demo dataset contains simulated observations; severity/confidence are rule-based estimates."
    }


def build_incidents() -> list[dict[str, Any]]:
    result = []
    for i, cluster in enumerate(make_clusters(), start=1):
        # Reference labels are for optional demo comparison only; never fed into scoring.
        matching_label = None
        # Do not use ground truth to cluster or score. It may be joined only for offline evaluation,
        # so this demo leaves the matching label unset unless explicitly selected by incident ID.
        scored = score_cluster(cluster, matching_label)
        result.append({
            "incident_id": f"UP-{i:04d}",
            "title": cluster[0]["event_type"].replace("_", " ").title(),
            **scored,
            "status": "DISPUTED" if scored["contradiction_count"] else (
                "INVESTIGATING" if scored["independent_evidence_count"] < 2 else "DETECTED"
            ),
        })
    return sorted(result, key=lambda x: (
        {"CRITICAL": 0, "MAJOR": 1, "MODERATE": 2}.get(x["severity"], 3),
        -(x["confidence"])
    ))


def get_incidents() -> list[dict[str, Any]]:
    global _cached_incidents
    if not _cached_incidents:
        _cached_incidents = build_incidents()
    return _cached_incidents


class EventIn(BaseModel):
    event_id: str
    source: str = "manual_demo"
    event_timestamp: str
    received_timestamp: Optional[str] = None
    location_name: str = "Manual test location"
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    event_type: str
    measured_value: str = ""
    source_reliability: float = Field(default=0.7, ge=0, le=1)
    is_duplicate: bool = False
    contradiction_flag: bool = False
    raw_text_payload: str = ""


class RouteAnalyzeIn(BaseModel):
    origin_lat: float = Field(ge=-90, le=90)
    origin_lon: float = Field(ge=-180, le=180)
    destination_lat: float = Field(ge=-90, le=90)
    destination_lon: float = Field(ge=-180, le=180)
    route_name: str = "Demo route"
    user_id: Optional[str] = None
    radius_km: float = Field(default=1.0, gt=0, le=20)


@app.on_event("startup")
def startup() -> None:
    load_data()
    get_incidents()


@app.get("/")
def root():
    return {
        "service": "UrbanPulse AI Backend",
        "status": "running",
        "docs": "/docs",
        "health": "/api/health",
        "data_notice": "Bundled dataset records are simulated, not live city feeds."
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "events_loaded": len(_events),
        "severity_labels_loaded": len(_severity_labels),
        "ground_truth_rows_loaded": len(_ground_truth),
        "data_directory": str(DATA_DIR),
        "warnings": _load_warnings,
    }


@app.post("/api/reload")
def reload_data():
    load_data()
    return health()


@app.get("/api/events")
def list_events(
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
    event_type: Optional[str] = None,
    include_duplicates: bool = True,
):
    items = _events
    if event_type:
        items = [e for e in items if event_type.lower() in e["event_type"].lower()]
    if not include_duplicates:
        items = [e for e in items if not e["is_duplicate"]]
    page = items[offset:offset + limit]
    return {
        "total": len(items),
        "limit": limit,
        "offset": offset,
        "items": [
            {k: v for k, v in e.items() if k not in {"event_dt", "received_dt"}}
            for e in page
        ],
    }


@app.post("/api/events")
def add_event(event_in: EventIn):
    global _cached_incidents
    if any(e["event_id"] == event_in.event_id for e in _events):
        raise HTTPException(status_code=409, detail="event_id already exists")
    event = event_in.model_dump()
    event["event_dt"] = parse_dt(event["event_timestamp"])
    event["received_dt"] = parse_dt(event["received_timestamp"] or datetime.now(timezone.utc).isoformat())
    if event["event_dt"] is None:
        raise HTTPException(status_code=422, detail="event_timestamp must be a valid ISO timestamp")
    event["received_timestamp"] = event["received_timestamp"] or datetime.now(timezone.utc).isoformat()
    _events.append(event)
    _cached_incidents = []  # Invalidate cache so new event is included
    return {"message": "Event accepted", "event_id": event["event_id"], "events_loaded": len(_events)}


@app.get("/api/incidents")
def list_incidents(limit: int = Query(default=100, ge=1, le=500)):
    incidents = get_incidents()
    return {
        "total": len(incidents),
        "items": incidents[:limit],
        "method": "rule-based spatial-temporal clustering; not a trained model",
    }


@app.get("/api/incidents/{incident_id}")
def get_incident(incident_id: str):
    for incident in get_incidents():
        if incident["incident_id"] == incident_id:
            return incident
    raise HTTPException(status_code=404, detail="Incident not found. Check /api/incidents for available IDs.")


@app.get("/api/incidents/{incident_id}/timeline")
def incident_timeline(incident_id: str):
    incident = get_incident(incident_id)
    events = [
        e for e in _events
        if e["event_id"] in set(incident["event_ids"])
    ]
    events.sort(key=lambda e: e["event_dt"] or datetime.min.replace(tzinfo=timezone.utc))
    return {
        "incident_id": incident_id,
        "timeline": [
            {
                "event_id": e["event_id"],
                "event_timestamp": e["event_timestamp"],
                "received_timestamp": e["received_timestamp"],
                "source": e["source"],
                "event_type": e["event_type"],
                "location_name": e["location_name"],
                "is_late_arrival": bool(
                    e["event_dt"] and e["received_dt"] and e["received_dt"] > e["event_dt"]
                ),
                "is_duplicate": e["is_duplicate"],
                "contradiction_flag": e["contradiction_flag"],
            } for e in events
        ],
    }


@app.get("/api/incidents/{incident_id}/graph")
def incident_graph(incident_id: str):
    incident = get_incident(incident_id)
    nodes = [{
        "id": incident_id,
        "type": "incident",
        "label": incident["title"],
        "severity": incident["severity"],
    }]
    edges = []
    for e in incident["sample_evidence"]:
        nodes.append({
            "id": e["event_id"],
            "type": "event",
            "label": f'{e["source"]}: {e["event_type"]}',
            "duplicate": e["is_duplicate"],
            "contradiction": e["contradiction_flag"],
        })
        edges.append({
            "source": e["event_id"],
            "target": incident_id,
            "type": "CONTRADICTS" if e["contradiction_flag"] else (
                "DUPLICATE_OF/WEIGHTED_LOW" if e["is_duplicate"] else "SUPPORTS"
            ),
        })
    return {"nodes": nodes, "edges": edges}


def point_segment_distance_km(
    p_lat: float, p_lon: float, a_lat: float, a_lon: float, b_lat: float, b_lon: float
) -> float:
    # Local equirectangular approximation suitable for a small demo area.
    mean_lat = math.radians((p_lat + a_lat + b_lat) / 3)
    px, py = p_lon * 111.32 * math.cos(mean_lat), p_lat * 111.0
    ax, ay = a_lon * 111.32 * math.cos(mean_lat), a_lat * 111.0
    bx, by = b_lon * 111.32 * math.cos(mean_lat), b_lat * 111.0
    dx, dy = bx - ax, by - ay
    denom = dx * dx + dy * dy
    t = 0 if denom == 0 else max(0, min(1, ((px-ax)*dx + (py-ay)*dy) / denom))
    return math.sqrt((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2)


@app.post("/api/routes/analyze")
def analyze_route(route: RouteAnalyzeIn):
    incidents = get_incidents()
    impacts = []
    for incident in incidents:
        if incident["latitude"] is None or incident["longitude"] is None:
            continue
        dist = point_segment_distance_km(
            incident["latitude"], incident["longitude"],
            route.origin_lat, route.origin_lon,
            route.destination_lat, route.destination_lon
        )
        if dist <= route.radius_km + 0.5 * (incident.get("event_count", 1) > 1):
            impacts.append({
                "incident_id": incident["incident_id"],
                "title": incident["title"],
                "severity": incident["severity"],
                "confidence": incident["confidence"],
                "distance_from_route_km": round(dist, 2),
                "status": incident["status"],
                "reasons": incident["reasons"],
                "event_count": incident["event_count"],
            })
    impacts.sort(key=lambda x: (
        {"CRITICAL": 0, "MAJOR": 1, "MODERATE": 2}.get(x["severity"], 3),
        x["distance_from_route_km"]
    ))
    return {
        "route_name": route.route_name,
        "user_id": route.user_id,
        "route": {
            "origin": {"latitude": route.origin_lat, "longitude": route.origin_lon},
            "destination": {"latitude": route.destination_lat, "longitude": route.destination_lon},
            "radius_km": route.radius_km,
        },
        "impact_count": len(impacts),
        "alert_level": (
            "URGENT" if any(x["severity"] == "CRITICAL" for x in impacts)
            else "WARNING" if any(x["severity"] == "MAJOR" for x in impacts)
            else "CAUTION" if impacts else "NO_MATCHING_INCIDENTS"
        ),
        "impacts": impacts,
        "explanation": (
            "Potential incidents were matched to the straight-line corridor between the supplied endpoints. "
            "This is a demo proximity check, not a road/rail routing engine."
        ),
        "data_notice": "Incident data is simulated. Verify before making real travel or safety decisions.",
    }


@app.get("/api/labels/severity")
def list_severity_labels(limit: int = Query(default=100, ge=1, le=500)):
    # Exposes the 46 reference labels for inspection only; inference endpoints do not use them.
    rows = list(_severity_labels.values())
    return {"total": len(rows), "items": rows[:limit], "purpose": "offline rule-validation reference only"}


@app.get("/api/validation/summary")
def validation_summary():
    # Simple sanity comparison is not a proper model evaluation because the rules are heuristic
    # and the clusters are not guaranteed to align one-to-one with labelled incidents.
    return {
        "events_loaded": len(_events),
        "labelled_incidents_available": len(_severity_labels),
        "note": (
            "Severity labels are reference scenarios. Before calculating accuracy, match predicted "
            "incidents to labels using an explicit incident-matching procedure. Do not use labels "
            "as inference inputs."
        ),
        "rule_engine": "enabled",
        "ml_model": "not required for this basic demo",
    }
