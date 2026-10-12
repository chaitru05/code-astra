# UrbanPulse AI — Basic Backend

This is a hackathon/demo backend for event ingestion, simple incident clustering, rule-based severity/confidence, timelines, evidence graph JSON, and route-corridor impact checks.

**Data authenticity:** supplied CSV rows are simulated. The backend does not connect to live BMC, railway, metro, police, or traffic feeds. Severity/confidence are transparent heuristics, not calibrated probabilities. Route analysis checks a straight-line corridor and is not a real road/rail route planner.

## 1. Requirements

- Python 3.10 or newer recommended
- pip

## 2. Put the CSV files here

Copy these files from your dataset package into `data/`:

- `urban_incident_events.csv` (required)
- `incident_severity_labels.csv` (optional; used for reference inspection only)
- `incident_ground_truth.csv` (optional; loaded for offline reference only)

Do **not** put `incident_ground_truth.csv` into inference/scoring logic.

## 3. Install and run

### Windows PowerShell / CMD

```bash
cd urbanpulse_backend
py -m venv .venv
.venv\\Scripts\\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
uvicorn main:app --reload
```

If `py` is unavailable, use `python` instead.

Open:
- API health: http://127.0.0.1:8000/api/health
- Interactive API testing: http://127.0.0.1:8000/docs

## 4. Terminal tests (PowerShell)

In a second terminal while server is running:

```powershell
Invoke-RestMethod http://127.0.0.1:8000/api/health
Invoke-RestMethod http://127.0.0.1:8000/api/events?limit=3
Invoke-RestMethod http://127.0.0.1:8000/api/incidents?limit=5
Invoke-RestMethod http://127.0.0.1:8000/api/labels/severity?limit=3
```

To test adding an event:

```powershell
$body = @{
  event_id = "MANUAL_TEST_001"
  source = "terminal_test"
  event_timestamp = "2026-07-15T08:10:00"
  received_timestamp = "2026-07-15T08:12:00"
  location_name = "Malad Subway"
  latitude = 19.1862
  longitude = 72.8462
  event_type = "WATERLOGGING_REPORT"
  measured_value = "Water level rising"
  source_reliability = 0.8
  is_duplicate = $false
  contradiction_flag = $false
  raw_text_payload = "Waterlogging reported near Malad Subway"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/events -ContentType "application/json" -Body $body
Invoke-RestMethod http://127.0.0.1:8000/api/incidents?limit=5
```

To analyze a route corridor:

```powershell
$route = @{
  origin_lat = 19.2150
  origin_lon = 72.8540
  destination_lat = 19.1215
  destination_lon = 72.8445
  route_name = "Borivali to Andheri demo"
  user_id = "USR_DEMO"
  radius_km = 1.0
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8000/api/routes/analyze -ContentType "application/json" -Body $route
```

### macOS/Linux (curl)

```bash
curl http://127.0.0.1:8000/api/health
curl "http://127.0.0.1:8000/api/events?limit=3"
curl "http://127.0.0.1:8000/api/incidents?limit=5"
curl -X POST http://127.0.0.1:8000/api/events \
  -H "Content-Type: application/json" \
  -d '{"event_id":"MANUAL_TEST_001","source":"terminal_test","event_timestamp":"2026-07-15T08:10:00","received_timestamp":"2026-07-15T08:12:00","location_name":"Malad Subway","latitude":19.1862,"longitude":72.8462,"event_type":"WATERLOGGING_REPORT","measured_value":"Water level rising","source_reliability":0.8,"is_duplicate":false,"contradiction_flag":false,"raw_text_payload":"Waterlogging reported near Malad Subway"}'
```

## 5. Important endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Confirms server and data load |
| GET | `/api/events` | Browse ingested events |
| POST | `/api/events` | Add a test/new event |
| POST | `/api/reload` | Reload CSVs after replacing files |
| GET | `/api/incidents` | Rebuild rule-based incidents |
| GET | `/api/incidents/UP-0001` | Inspect one incident |
| GET | `/api/incidents/UP-0001/timeline` | Chronological evidence |
| GET | `/api/incidents/UP-0001/graph` | Nodes and edges for graph UI |
| POST | `/api/routes/analyze` | Basic route corridor impact |
| GET | `/api/labels/severity` | Inspect severity reference labels |
| GET | `/api/validation/summary` | Validation caveats |

## 6. How to know it works

- `/api/health` returns `"status": "ok"` and a nonzero `events_loaded`.
- `/api/events` returns rows from your CSV.
- `/api/incidents` returns incident objects with severity, confidence, reasons, evidence counts, and event IDs.
- `POST /api/events` returns `"Event accepted"`.
- `/api/docs` shows all endpoints and lets you send requests without another terminal tool.

## 7. Limitations to fix after first smoke test

The first clustering is greedy spatial-temporal grouping (within 2.5 km and 180 minutes). It is intentionally simple and can over-merge/under-merge incidents. Route impact is a straight-line corridor check, not road geometry or transit-line matching. Improve these only after the API smoke test passes.
