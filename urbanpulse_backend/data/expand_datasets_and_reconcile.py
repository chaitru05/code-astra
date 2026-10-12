import csv
import os
import random
import math
from datetime import datetime, timedelta

DATASET_DIR = r"c:\Users\Sahil\OneDrive\Desktop\Main-Projects\CodeAstra\datasets"
random.seed(42)

# ============================================================
# 1. CREATE CITIZEN COMPLAINTS & EMERGENCY 112 REPORTS DATASET
# ============================================================
print("Creating citizen_emergency_reports.csv...")

CHANNELS = ["TWITTER_X", "BMC_DISASTER_PORTAL", "112_POLICE_CAD", "MUMBAI_TRAFFIC_POLICE_WHATSAPP", "BEST_COMMUTER_HELPLINE"]
CATEGORIES = ["WATERLOGGING", "ROAD_ACCIDENT", "TRAIN_DELAY", "TRAFFIC_SIGNAL_OUTAGE", "TREE_FALL_ROAD_BLOCK", "OVERCROWDED_PLATFORM"]

LOCATIONS = [
    ("Malad Subway", 19.1862, 72.8462, "WATERLOGGING"),
    ("Pathanwadi Flyover WEH Malad", 19.1802, 72.8582, "ROAD_ACCIDENT"),
    ("Borivali Station West PF 3/4", 19.2290, 72.8569, "TRAIN_DELAY"),
    ("Mithchowki Junction Kandivali Link Rd", 19.2015, 72.8375, "TRAFFIC_SIGNAL_OUTAGE"),
    ("Andheri Subway East-West Link", 19.1215, 72.8445, "WATERLOGGING"),
    ("JVLR Junction WEH Jogeshwari", 19.1415, 72.8562, "ROAD_ACCIDENT"),
    ("D.N. Nagar Metro Interchange", 19.1308, 72.8322, "OVERCROWDED_PLATFORM"),
    ("SV Road near Malad Natraj Market", 19.1855, 72.8475, "WATERLOGGING"),
    ("Kandivali Station West", 19.2045, 72.8522, "TRAIN_DELAY"),
    ("Milan Subway Santacruz", 19.0885, 72.8420, "WATERLOGGING"),
]

CITIZEN_REPORTS = []
rep_id = 1

for day_idx in range(14):
    sim_date = datetime(2026, 7, 15) + timedelta(days=day_idx)
    is_heavy_rain = (day_idx in [0, 3, 6, 9])
    num_reports = random.randint(45, 75) if is_heavy_rain else random.randint(15, 30)

    for _ in range(num_reports):
        loc = random.choice(LOCATIONS)
        channel = random.choice(CHANNELS)
        cat = loc[3] if random.random() < 0.75 else random.choice(CATEGORIES)
        
        hr = random.choice([7, 8, 8, 9, 9, 10, 11, 14, 17, 18, 19])
        mn = random.randint(0, 59)
        sec = random.randint(0, 59)
        t_rep = datetime(sim_date.year, sim_date.month, sim_date.day, hr, mn, sec)
        
        urgency = random.randint(3, 5) if is_heavy_rain or "ACCIDENT" in cat else random.randint(1, 3)
        sentiment = "ANGRY_DISTRESSED" if urgency >= 4 else "INFORMATIVE"
        
        # Realistic natural language complaint texts
        if cat == "WATERLOGGING":
            texts = [
                f"Water reached knee level at {loc[0]}! Cars getting stuck, please deploy pumps ASAP! @mybmc",
                f"Severe waterlogging at {loc[0]}. Autos refusing to go towards west. Avoid this entire route!",
                f"Drainage completely overflowing near {loc[0]}. Water entered BEST bus floorboards.",
                f"Traffic diverted because {loc[0]} is completely flooded under 2 feet water."
            ]
        elif cat == "ROAD_ACCIDENT":
            texts = [
                f"Serious collision on {loc[0]}! 2 cars rammed into divider, ambulance needed urgently!",
                f"Bumper to bumper jam because of multi-vehicle crash on {loc[0]}. Standstill since 30 mins.",
                f"Oil spill on wet road causing vehicle skidding at {loc[0]}. Police please clear the lane.",
                f"Accident vehicle blocking central lane at {loc[0]}. Southbound traffic moving at snail speed."
            ]
        elif cat == "TRAIN_DELAY":
            texts = [
                f"Not a single train moving from {loc[0]} towards Churchgate! Fast line halted. #MumbaiLocal",
                f"Stranded at {loc[0]} for 45 minutes. Indicator showing delay with no announcement.",
                f"Overhead wire sparking seen near track section. Locals running with 35-minute delay.",
                f"Massive crowd building up on Platform 3 and 4 at {loc[0]} due to delayed services."
            ]
        elif cat == "TRAFFIC_SIGNAL_OUTAGE":
            texts = [
                f"Traffic lights totally blacked out at {loc[0]}! Complete gridlock from all 4 directions.",
                f"Power cut tripped signals at {loc[0]}. Wardens needed to manually control junction.",
                f"Chaos at {loc[0]}, no signal lights working. Buses and trucks blocking intersection."
            ]
        elif cat == "OVERCROWDED_PLATFORM":
            texts = [
                f"Unprecedented rush at {loc[0]}. Metro entry gates regulated due to platform congestion.",
                f"Stampede-like crowd at {loc[0]} interchange. Please add extra security marshals."
            ]
        else:
            texts = [f"Large tree branch fallen across road near {loc[0]}. Only one lane passable."]

        text = random.choice(texts)
        res_stat = "DISPATCHED" if urgency >= 4 else ("IN_PROGRESS" if random.random() < 0.5 else "LOGGED")

        CITIZEN_REPORTS.append([
            f"REP_{rep_id:05d}", t_rep.strftime("%Y-%m-%d %H:%M:%S"), channel,
            loc[0], loc[1], loc[2], cat, urgency, sentiment, res_stat, text
        ])
        rep_id += 1

with open(os.path.join(DATASET_DIR, "citizen_emergency_reports.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "report_id", "timestamp", "channel", "location_name", "latitude", "longitude",
        "category", "urgency_score", "sentiment", "resolution_status", "report_text"
    ])
    for row in CITIZEN_REPORTS:
        writer.writerow(row)

print(f"Created citizen_emergency_reports.csv ({len(CITIZEN_REPORTS)} reports).")

# ============================================================
# 2. CREATE EVENT-PAIR DATASET FOR INCIDENT CORRELATION (MODEL 1)
# ============================================================
print("Creating event_pair_correlation.csv...")

# Load urban incident events and ground truth
events = []
with open(os.path.join(DATASET_DIR, "urban_incident_events.csv"), "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        events.append(r)

gt_map = {}
with open(os.path.join(DATASET_DIR, "incident_ground_truth.csv"), "r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for r in reader:
        gt_map[r["event_id"]] = r["ground_truth_incident_id"]

def haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

# Generate balanced pairs (Positive pairs from same incident, Negative pairs from different incidents / background)
PAIR_RECORDS = []
pair_id = 1

# Group events by incident
by_inc = {}
for e in events:
    inc_id = gt_map.get(e["event_id"], "INC_NONE")
    by_inc.setdefault(inc_id, []).append(e)

# Positive Pairs: Sample from same incident (excluding INC_NONE)
for inc_id, ev_list in by_inc.items():
    if inc_id == "INC_NONE" or len(ev_list) < 2:
        continue
    # Sample up to 40 pairs per incident
    sample_k = min(len(ev_list) * (len(ev_list) - 1) // 2, 40)
    for _ in range(sample_k):
        e1, e2 = random.sample(ev_list, 2)
        dt1 = datetime.strptime(e1["event_timestamp"], "%Y-%m-%d %H:%M:%S")
        dt2 = datetime.strptime(e2["event_timestamp"], "%Y-%m-%d %H:%M:%S")
        time_diff = abs((dt2 - dt1).total_seconds())
        geo_dist = round(haversine_km(float(e1["latitude"]), float(e1["longitude"]), float(e2["latitude"]), float(e2["longitude"])), 3)
        same_src = 1 if e1["source"] == e2["source"] else 0
        rel_prod = round(float(e1["source_reliability"]) * float(e2["source_reliability"]), 3)
        
        # Text Jaccard token similarity (without any label leakage!)
        tokens1 = set(e1["raw_text_payload"].lower().split())
        tokens2 = set(e2["raw_text_payload"].lower().split())
        jaccard = round(len(tokens1 & tokens2) / max(1, len(tokens1 | tokens2)), 3)
        
        PAIR_RECORDS.append([
            f"PAIR_{pair_id:06d}", e1["event_id"], e2["event_id"],
            round(time_diff, 1), geo_dist, same_src, rel_prod, jaccard,
            1  # is_same_incident: TRUE
        ])
        pair_id += 1

num_pos = len(PAIR_RECORDS)

# Negative Pairs: Sample pairs across different incidents or background noise
all_inc_ids = [k for k in by_inc.keys() if k != "INC_NONE"]
for _ in range(num_pos):  # Balanced 1:1 ratio
    inc_a, inc_b = random.sample(all_inc_ids, 2)
    e1 = random.choice(by_inc[inc_a])
    e2 = random.choice(by_inc[inc_b]) if random.random() < 0.8 else random.choice(by_inc.get("INC_NONE", by_inc[inc_b]))
    
    dt1 = datetime.strptime(e1["event_timestamp"], "%Y-%m-%d %H:%M:%S")
    dt2 = datetime.strptime(e2["event_timestamp"], "%Y-%m-%d %H:%M:%S")
    time_diff = abs((dt2 - dt1).total_seconds())
    geo_dist = round(haversine_km(float(e1["latitude"]), float(e1["longitude"]), float(e2["latitude"]), float(e2["longitude"])), 3)
    same_src = 1 if e1["source"] == e2["source"] else 0
    rel_prod = round(float(e1["source_reliability"]) * float(e2["source_reliability"]), 3)
    
    tokens1 = set(e1["raw_text_payload"].lower().split())
    tokens2 = set(e2["raw_text_payload"].lower().split())
    jaccard = round(len(tokens1 & tokens2) / max(1, len(tokens1 | tokens2)), 3)
    
    PAIR_RECORDS.append([
        f"PAIR_{pair_id:06d}", e1["event_id"], e2["event_id"],
        round(time_diff, 1), geo_dist, same_src, rel_prod, jaccard,
        0  # is_same_incident: FALSE
    ])
    pair_id += 1

with open(os.path.join(DATASET_DIR, "event_pair_correlation.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "pair_id", "event_id_1", "event_id_2", "time_diff_sec", "geo_distance_km",
        "same_source", "reliability_product", "text_similarity", "is_same_incident"
    ])
    for row in PAIR_RECORDS:
        writer.writerow(row)

print(f"Created event_pair_correlation.csv ({len(PAIR_RECORDS)} pairs: {num_pos} pos, {num_pos} neg).")

# ============================================================
# 3. CREATE CONTROLLED ANOMALY BENCHMARK DATASET (MODEL 2)
# ============================================================
print("Creating telemetry_anomalies.csv...")

ANOMALY_RECORDS = []
anom_id = 1

# Generate 1,200 numerical telemetry samples with known injected anomalies
# Features: [rainfall_rate_mm_hr, water_level_cm, traffic_speed_kmh, transit_headway_min, sensor_voltage_v]
for i in range(1200):
    is_anomaly = 1 if random.random() < 0.15 else 0  # 15% anomaly rate
    
    if is_anomaly:
        # Anomaly scenario: e.g. Extreme flood (water level > 70cm, speed < 5kmh) OR Sensor fault (0V voltage)
        atype = random.choice(["FLASH_FLOOD_SPIKE", "GRIDLOCK_VELOCITY_COLLAPSE", "SENSOR_VOLTAGE_FAULT", "HEADWAY_PARALYSIS"])
        if atype == "FLASH_FLOOD_SPIKE":
            rain = round(random.uniform(75.0, 120.0), 1)
            water = round(random.uniform(65.0, 110.0), 1)
            speed = round(random.uniform(1.0, 6.0), 1)
            headway = round(random.uniform(25.0, 50.0), 1)
            volt = round(random.uniform(11.8, 12.2), 2)
        elif atype == "GRIDLOCK_VELOCITY_COLLAPSE":
            rain = round(random.uniform(10.0, 35.0), 1)
            water = round(random.uniform(5.0, 20.0), 1)
            speed = round(random.uniform(0.5, 3.5), 1)
            headway = round(random.uniform(15.0, 30.0), 1)
            volt = round(random.uniform(11.9, 12.3), 2)
        elif atype == "SENSOR_VOLTAGE_FAULT":
            rain = round(random.uniform(0.0, 20.0), 1)
            water = round(random.uniform(0.0, 10.0), 1)
            speed = round(random.uniform(30.0, 60.0), 1)
            headway = round(random.uniform(3.0, 6.0), 1)
            volt = round(random.uniform(0.0, 3.2), 2)  # Brownout/fault
        else:
            rain = round(random.uniform(20.0, 45.0), 1)
            water = round(random.uniform(15.0, 35.0), 1)
            speed = round(random.uniform(12.0, 25.0), 1)
            headway = round(random.uniform(40.0, 75.0), 1)  # Train halted
            volt = round(random.uniform(11.8, 12.2), 2)
    else:
        atype = "NORMAL_TELEMETRY"
        rain = round(random.uniform(0.0, 30.0), 1)
        water = round(random.uniform(2.0, 25.0), 1)
        speed = round(random.uniform(25.0, 65.0), 1)
        headway = round(random.uniform(3.0, 7.0), 1)
        volt = round(random.uniform(11.9, 12.4), 2)

    ANOMALY_RECORDS.append([
        f"TEL_{anom_id:05d}", f"2026-07-15 08:{i%60:02d}:00",
        rain, water, speed, headway, volt, is_anomaly, atype
    ])
    anom_id += 1

with open(os.path.join(DATASET_DIR, "telemetry_anomalies.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "telemetry_id", "timestamp", "rainfall_intensity_mm_hr", "water_level_cm",
        "traffic_speed_kmh", "transit_headway_min", "sensor_supply_voltage_v",
        "is_anomaly", "anomaly_type"
    ])
    for row in ANOMALY_RECORDS:
        writer.writerow(row)

print(f"Created telemetry_anomalies.csv ({len(ANOMALY_RECORDS)} records).")

# ============================================================
# 4. RECONCILE DATASET INVENTORY COUNTS
# ============================================================
# Count all rows across all CSV files in datasets directory
counts = {}
for fname in sorted(os.listdir(DATASET_DIR)):
    if fname.endswith(".csv"):
        fpath = os.path.join(DATASET_DIR, fname)
        with open(fpath, "r", encoding="utf-8") as f:
            counts[fname] = sum(1 for _ in f) - 1

print("\n--- EXACT RECONCILED INVENTORY COUNTS ---")
for k, v in counts.items():
    print(f"{k}: {v} rows")
