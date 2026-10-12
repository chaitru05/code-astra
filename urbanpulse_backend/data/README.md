# Multimodal Urban Incident Intelligence Engine: Datasets (Reconciled Inventory)

This directory contains the production-ready datasets for training, evaluating, and demonstrating the **CodeAstra Multimodal Urban Incident Intelligence Engine** across the Mumbai Western Suburbs corridor (**Dahisar - Borivali - Kandivali - Malad - Goregaon - Jogeshwari - Andheri - Versova**).

> [!NOTE]
> **Data Authenticity Notice:** The geographical network, station names, railway lines, metro lines, road arteries, and transit stops correspond to **real physical infrastructure facts of Mumbai**. All numerical sensor measurements (rainfall rate, water level, traffic speed), journey durations, citizen complaints, and incident simulations are **synthetic and calibrated for machine learning training and incident reconstruction benchmarking**. Target-label columns (`is_duplicate`, `contradiction_flag`, `ground_truth_incident_id`, `known_or_suspected_cause`) are strictly segregated from input feature sets to prevent data leakage.

---

## 1. Exact Reconciled Inventory

| No. | File Name | Exact Rows | Purpose & Modalities | Primary ML Model / Use |
|---|---|---|---|---|
| 1 | `urban_incident_events.csv` | **2,321** | Central raw heterogeneous event stream with `event_timestamp` vs `received_timestamp` (simulating latency / out-of-order delivery), duplicates, and contradictory noise. | Incident Ingestion & Replay Lab |
| 2 | `incident_ground_truth.csv` | **2,321** | Ground-truth mapping connecting each event to its incident cluster, scenario type, and causal status (`PARENT_TRIGGER`, `PRIMARY_OBSERVATION`, `CORRELATED_EFFECT`, etc.). | Incident Correlation & Evidence Graph |
| 3 | `event_pair_correlation.csv` | **3,680** | **Pairwise dataset for Model 1** ($E_1, E_2$) with features: `time_diff_sec`, `geo_distance_km`, `same_source`, `reliability_product`, `text_similarity`, and ground-truth `is_same_incident`. | **Model 1: Incident Correlation Classifier** |
| 4 | `telemetry_anomalies.csv` | **1,200** | Multi-sensor numerical stream (rainfall, water depth, road velocity, transit headway, voltage) with controlled injected anomalies. | **Model 2: Anomaly Detection Engine** |
| 5 | `route_impact_labels.csv` | **591** | User commute disruption labels (`HIGH_DISRUPTION`, `MODERATE_HIGH_DISRUPTION`, `MINIMAL_IMPACT`) with expected delays and confidence scores. | **Model 3: Route Impact Classifier** |
| 6 | `citizen_emergency_reports.csv` | **477** | Citizen complaint posts (Twitter/X, BMC Disaster App) and Maharashtra Police 112 CAD emergency dispatch call logs with urgency scores and text payloads. | NLP Ingestion & Crowdsourced Fusion |
| 7 | `public_transport_status.csv` | **364** | Real Western Railway suburban train schedules (14 real 90xxx series local trains) and Metro Lines 2A, 7, and 1 status feeds. | Transit Delay Forecasting |
| 8 | `route_recommendations.csv` | **291** | Commuter rerouting decisions: compares disrupted planned mode vs recommended resilient mode, time saved, transfer interchanges, and evidence-based explanations. | Multimodal Route Recommendation |
| 9 | `incident_severity_labels.csv` | **46** | Incident clusters across 14 simulated days with severity scores (Level 1–5), confidence scores, affected radius, and impact metrics. | Severity & Confidence Engine |
| 10 | `weather_events.csv` | **2,016** | 14-day weather sensor logs from BMC AWS and ultrasonic flood gauges (rainfall mm/hr, accumulation, waterlogging cm). | Environmental Feature Extraction |
| 11 | `traffic_incidents.csv` | **1,680** | Doppler traffic radars across WEH Pathanwadi Flyover, Mithchowki Junction, Malad Subway, and JVLR bottlenecks. | Road Congestion Modeling |
| 12 | `multimodal_stations_geo.csv` | **70** | Exact GPS coordinates for Western Railway stations (Dahisar to Bandra), Metro 2A (Yellow), Metro 7 (Red), Metro 1 (Blue), and key road nodes. | Spatial Graph Node Embeddings |
| 13 | `route_network.csv` | **41** | Multimodal road, rail, and metro segments with infrastructure types, distance (km), typical speeds, and flood-prone flags. | Multimodal Route Graph |
| 14 | `user_profiles.csv` | **25** | Profiles for primary student persona (`USR_001`: Ashokvan $\to$ RGIT Versova) and 24 diverse Mumbai commuters across all transit modes. | Personalized Commute Fingerprint |
| 15 | `sensor_metadata.csv` | **20** | Physical sensor inventory (AWS, ultrasonic gauges, Doppler radars, track circuits, SCADA feeds) with reliability weights. | Sensor Fusion Weight Matrix |
| 16 | `baseline_travel_times.csv` | **18** | Baseline undisrupted durations across Morning Peak, Afternoon, Evening Peak, and Night slots. | Baseline ETA Model |

---

## 2. The 3 Core Machine Learning Models

1. **Model 1: Incident Correlation Classifier**
   * **Dataset:** `event_pair_correlation.csv`
   * **Features:** `time_diff_sec`, `geo_distance_km`, `same_source`, `reliability_product`, `text_similarity`.
   * **Target:** `is_same_incident` (Binary 0/1).
   * **Classifiers:** Logistic Regression baseline vs Random Forest vs XGBoost.
2. **Model 2: Multimodal Anomaly Detection Engine**
   * **Dataset:** `telemetry_anomalies.csv`
   * **Features:** `rainfall_intensity_mm_hr`, `water_level_cm`, `traffic_speed_kmh`, `transit_headway_min`, `sensor_supply_voltage_v`.
   * **Models:** Isolation Forest + Domain-specific rate-of-change thresholds.
3. **Model 3: Personalized Route Impact Classifier**
   * **Dataset:** `route_impact_labels.csv` + `route_network.csv` + `user_profiles.csv`
   * **Features:** Incident severity, spatial overlap distance, mode type, flood exposure, time of day.
   * **Target:** `impact_label` (`HIGH_DISRUPTION`, `MODERATE_HIGH_DISRUPTION`, `MINIMAL_IMPACT`).
   * **Split Strategy:** Incident-stratified group split (prevents cross-incident data leakage).
   * **Classifiers:** Weighted Random Forest / XGBoost with Precision-Recall optimization.
