import csv
import os
import random
from datetime import datetime, timedelta

DATASET_DIR = r"c:\Users\Sahil\OneDrive\Desktop\Main-Projects\CodeAstra\datasets"
os.makedirs(DATASET_DIR, exist_ok=True)

random.seed(42)

# ==========================================
# 1. GEO NODES & STATIONS (REAL MUMBAI DATA)
# ==========================================
WR_STATIONS = [
    {"name": "Dahisar Railway Station", "code": "DIC", "lat": 19.2501, "lon": 72.8593, "type": "RAILWAY"},
    {"name": "Borivali Railway Station", "code": "BVI", "lat": 19.2290, "lon": 72.8569, "type": "RAILWAY"},
    {"name": "Kandivali Railway Station", "code": "KND", "lat": 19.2045, "lon": 72.8522, "type": "RAILWAY"},
    {"name": "Malad Railway Station", "code": "MDD", "lat": 19.1868, "lon": 72.8488, "type": "RAILWAY"},
    {"name": "Goregaon Railway Station", "code": "GMN", "lat": 19.1645, "lon": 72.8493, "type": "RAILWAY"},
    {"name": "Ram Mandir Railway Station", "code": "RMAR", "lat": 19.1517, "lon": 72.8475, "type": "RAILWAY"},
    {"name": "Jogeshwari Railway Station", "code": "JOS", "lat": 19.1359, "lon": 72.8490, "type": "RAILWAY"},
    {"name": "Andheri Railway Station", "code": "ADH", "lat": 19.1197, "lon": 72.8464, "type": "RAILWAY"},
    {"name": "Vile Parle Railway Station", "code": "VLP", "lat": 19.0999, "lon": 72.8438, "type": "RAILWAY"},
    {"name": "Santa Cruz Railway Station", "code": "STC", "lat": 19.0818, "lon": 72.8407, "type": "RAILWAY"},
    {"name": "Bandra Railway Station", "code": "BA", "lat": 19.0544, "lon": 72.8406, "type": "RAILWAY"},
]

METRO_2A_STATIONS = [
    {"name": "Dahisar East Metro Station", "code": "M2A_01", "lat": 19.2555, "lon": 72.8624, "type": "METRO_2A"},
    {"name": "Anand Nagar Metro Station", "code": "M2A_02", "lat": 19.2505, "lon": 72.8540, "type": "METRO_2A"},
    {"name": "Rushi Sankul Metro Station", "code": "M2A_03", "lat": 19.2458, "lon": 72.8492, "type": "METRO_2A"},
    {"name": "I.C. Colony Metro Station", "code": "M2A_04", "lat": 19.2408, "lon": 72.8471, "type": "METRO_2A"},
    {"name": "Eksar Metro Station", "code": "M2A_05", "lat": 19.2345, "lon": 72.8458, "type": "METRO_2A"},
    {"name": "Borivali West Metro Station", "code": "M2A_08", "lat": 19.2272, "lon": 72.8455, "type": "METRO_2A"},
    {"name": "Kandivali West Metro Station", "code": "M2A_10", "lat": 19.2085, "lon": 72.8423, "type": "METRO_2A"},
    {"name": "Dahanukarwadi Metro Station", "code": "M2A_11", "lat": 19.2025, "lon": 72.8398, "type": "METRO_2A"},
    {"name": "Valnai Metro Station", "code": "M2A_12", "lat": 19.1942, "lon": 72.8385, "type": "METRO_2A"},
    {"name": "Malad West Metro Station", "code": "M2A_13", "lat": 19.1865, "lon": 72.8380, "type": "METRO_2A"},
    {"name": "Lower Malad Metro Station", "code": "M2A_14", "lat": 19.1762, "lon": 72.8368, "type": "METRO_2A"},
    {"name": "Pahadi Goregaon Metro Station", "code": "M2A_15", "lat": 19.1685, "lon": 72.8365, "type": "METRO_2A"},
    {"name": "Goregaon West Metro Station", "code": "M2A_16", "lat": 19.1601, "lon": 72.8362, "type": "METRO_2A"},
    {"name": "Oshiwara Metro Station", "code": "M2A_17", "lat": 19.1510, "lon": 72.8359, "type": "METRO_2A"},
    {"name": "Lower Oshiwara Metro Station", "code": "M2A_18", "lat": 19.1415, "lon": 72.8335, "type": "METRO_2A"},
    {"name": "Andheri West (D.N. Nagar) Metro Station", "code": "M2A_19", "lat": 19.1308, "lon": 72.8322, "type": "METRO_2A"},
]

METRO_7_STATIONS = [
    {"name": "Dahisar East Metro Station", "code": "M7_01", "lat": 19.2555, "lon": 72.8624, "type": "METRO_7"},
    {"name": "Ovaripada Metro Station", "code": "M7_02", "lat": 19.2435, "lon": 72.8640, "type": "METRO_7"},
    {"name": "National Park (Borivali E) Metro Station", "code": "M7_03", "lat": 19.2301, "lon": 72.8631, "type": "METRO_7"},
    {"name": "Devipada Metro Station", "code": "M7_04", "lat": 19.2205, "lon": 72.8629, "type": "METRO_7"},
    {"name": "Magathane Metro Station", "code": "M7_05", "lat": 19.2132, "lon": 72.8633, "type": "METRO_7"},
    {"name": "Mahindra & Mahindra Metro Station", "code": "M7_06", "lat": 19.2045, "lon": 72.8615, "type": "METRO_7"},
    {"name": "Bandongri Metro Station", "code": "M7_07", "lat": 19.1972, "lon": 72.8608, "type": "METRO_7"},
    {"name": "Pushpa Park Metro Station", "code": "M7_08", "lat": 19.1895, "lon": 72.8595, "type": "METRO_7"},
    {"name": "Pathanwadi Metro Station", "code": "M7_09", "lat": 19.1795, "lon": 72.8585, "type": "METRO_7"},
    {"name": "Dindoshi Metro Station", "code": "M7_10", "lat": 19.1725, "lon": 72.8578, "type": "METRO_7"},
    {"name": "Aarey Metro Station", "code": "M7_11", "lat": 19.1628, "lon": 72.8572, "type": "METRO_7"},
    {"name": "Goregaon East Metro Station", "code": "M7_12", "lat": 19.1525, "lon": 72.8568, "type": "METRO_7"},
    {"name": "JVLR Junction Metro Station", "code": "M7_13", "lat": 19.1402, "lon": 72.8560, "type": "METRO_7"},
    {"name": "Shankarwadi Metro Station", "code": "M7_14", "lat": 19.1285, "lon": 72.8552, "type": "METRO_7"},
    {"name": "Gundavali (Andheri E) Metro Station", "code": "M7_15", "lat": 19.1172, "lon": 72.8548, "type": "METRO_7"},
]

METRO_1_STATIONS = [
    {"name": "Versova Metro Station", "code": "M1_01", "lat": 19.1315, "lon": 72.8172, "type": "METRO_1"},
    {"name": "D.N. Nagar Metro Station", "code": "M1_02", "lat": 19.1308, "lon": 72.8322, "type": "METRO_1"},
    {"name": "Azad Nagar Metro Station", "code": "M1_03", "lat": 19.1288, "lon": 72.8378, "type": "METRO_1"},
    {"name": "Andheri Metro Station", "code": "M1_04", "lat": 19.1205, "lon": 72.8468, "type": "METRO_1"},
    {"name": "Western Express Highway Metro Station", "code": "M1_05", "lat": 19.1165, "lon": 72.8555, "type": "METRO_1"},
    {"name": "Chakala Metro Station", "code": "M1_06", "lat": 19.1118, "lon": 72.8635, "type": "METRO_1"},
    {"name": "Airport Road Metro Station", "code": "M1_07", "lat": 19.1105, "lon": 72.8732, "type": "METRO_1"},
    {"name": "Marol Naka Metro Station", "code": "M1_08", "lat": 19.1098, "lon": 72.8835, "type": "METRO_1"},
]

ROAD_NODES = [
    {"name": "Ashokvan (Borivali East)", "code": "RD_ASHOKVAN", "lat": 19.2372, "lon": 72.8695, "type": "ROAD_ORIGIN"},
    {"name": "Borivali National Park WEH Flyover", "code": "RD_WEH_BVI", "lat": 19.2295, "lon": 72.8625, "type": "ROAD_JUNCTION"},
    {"name": "Kandivali Samata Nagar WEH", "code": "RD_WEH_KND", "lat": 19.2052, "lon": 72.8618, "type": "ROAD_JUNCTION"},
    {"name": "Pathanwadi Flyover WEH (Malad)", "code": "RD_WEH_MLD", "lat": 19.1802, "lon": 72.8582, "type": "ROAD_BOTTLENECK"},
    {"name": "Oberoi Mall Flyover (Goregaon E)", "code": "RD_WEH_OBEROI", "lat": 19.1665, "lon": 72.8575, "type": "ROAD_JUNCTION"},
    {"name": "JVLR Junction WEH (Jogeshwari E)", "code": "RD_WEH_JVLR", "lat": 19.1415, "lon": 72.8562, "type": "ROAD_BOTTLENECK"},
    {"name": "Andheri WEH Flyover", "code": "RD_WEH_ADH", "lat": 19.1185, "lon": 72.8545, "type": "ROAD_JUNCTION"},
    {"name": "Mithchowki Junction (Kandivali W Link Rd)", "code": "RD_LINK_MITH", "lat": 19.2015, "lon": 72.8375, "type": "ROAD_BOTTLENECK"},
    {"name": "Inorbit Mall Junction (Malad W Link Rd)", "code": "RD_LINK_INORB", "lat": 19.1782, "lon": 72.8370, "type": "ROAD_JUNCTION"},
    {"name": "Infinity Mall Junction (Andheri W)", "code": "RD_LINK_INF", "lat": 19.1408, "lon": 72.8330, "type": "ROAD_JUNCTION"},
    {"name": "D.N. Nagar Junction (Andheri W)", "code": "RD_DN_NAGAR_JNC", "lat": 19.1305, "lon": 72.8320, "type": "ROAD_JUNCTION"},
    {"name": "Malad Subway", "code": "RD_SUB_MALAD", "lat": 19.1862, "lon": 72.8462, "type": "FLOOD_SUBWAY"},
    {"name": "Andheri Subway", "code": "RD_SUB_ANDHERI", "lat": 19.1215, "lon": 72.8445, "type": "FLOOD_SUBWAY"},
    {"name": "Milan Subway (Santacruz)", "code": "RD_SUB_MILAN", "lat": 19.0885, "lon": 72.8420, "type": "FLOOD_SUBWAY"},
    {"name": "Rajiv Gandhi Institute of Technology (RGIT Versova)", "code": "RD_DEST_RGIT", "lat": 19.1342, "lon": 72.8145, "type": "DESTINATION"},
    {"name": "NESCO IT Park (Goregaon East)", "code": "RD_DEST_NESCO", "lat": 19.1555, "lon": 72.8542, "type": "DESTINATION"},
    {"name": "Kokilaben Hospital (Andheri West)", "code": "RD_DEST_KOKILA", "lat": 19.1312, "lon": 72.8252, "type": "DESTINATION"},
    {"name": "Bhavan's College (Andheri West)", "code": "RD_DEST_BHAVANS", "lat": 19.1245, "lon": 72.8355, "type": "DESTINATION"},
    {"name": "SEEPZ / MIDC (Andheri East)", "code": "RD_DEST_SEEPZ", "lat": 19.1225, "lon": 72.8795, "type": "DESTINATION"},
    {"name": "Mithibai College (Vile Parle West)", "code": "RD_DEST_MITHIBAI", "lat": 19.1028, "lon": 72.8372, "type": "DESTINATION"}
]

# Write multimodal_stations_geo.csv
with open(os.path.join(DATASET_DIR, "multimodal_stations_geo.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["station_or_node_code", "name", "category", "latitude", "longitude"])
    for s in WR_STATIONS:
        writer.writerow([s["code"], s["name"], s["type"], s["lat"], s["lon"]])
    for s in METRO_2A_STATIONS:
        writer.writerow([s["code"], s["name"], s["type"], s["lat"], s["lon"]])
    for s in METRO_7_STATIONS:
        writer.writerow([s["code"], s["name"], s["type"], s["lat"], s["lon"]])
    for s in METRO_1_STATIONS:
        writer.writerow([s["code"], s["name"], s["type"], s["lat"], s["lon"]])
    for s in ROAD_NODES:
        writer.writerow([s["code"], s["name"], s["type"], s["lat"], s["lon"]])

print("1. multimodal_stations_geo.csv created.")

# ==========================================
# 2. SENSOR METADATA
# ==========================================
SENSORS = [
    {"sensor_id": "BMC_AWS_BORIVALI", "sensor_type": "AUTOMATED_WEATHER_STATION", "agency": "BMC", "lat": 19.2310, "lon": 72.8580, "location": "Borivali Ward R/Central Office", "polling_sec": 60, "reliability": 0.98},
    {"sensor_id": "BMC_AWS_KANDIVALI", "sensor_type": "AUTOMATED_WEATHER_STATION", "agency": "BMC", "lat": 19.2065, "lon": 72.8510, "location": "Kandivali R/South Ward Office", "polling_sec": 60, "reliability": 0.97},
    {"sensor_id": "BMC_AWS_MALAD", "sensor_type": "AUTOMATED_WEATHER_STATION", "agency": "BMC", "lat": 19.1855, "lon": 72.8475, "location": "Malad P/North Ward Office", "polling_sec": 60, "reliability": 0.96},
    {"sensor_id": "BMC_AWS_GOREGAON", "sensor_type": "AUTOMATED_WEATHER_STATION", "agency": "BMC", "lat": 19.1620, "lon": 72.8490, "location": "Goregaon P/South Ward Office", "polling_sec": 60, "reliability": 0.97},
    {"sensor_id": "BMC_AWS_ANDHERI_W", "sensor_type": "AUTOMATED_WEATHER_STATION", "agency": "BMC", "lat": 19.1230, "lon": 72.8360, "location": "Andheri West K/West Ward", "polling_sec": 60, "reliability": 0.98},
    {"sensor_id": "BMC_FLD_MALAD_SUB", "sensor_type": "ULTRASONIC_FLOOD_GAUGE", "agency": "BMC_DISASTER_MANAGEMENT", "lat": 19.1862, "lon": 72.8462, "location": "Malad Subway Invert", "polling_sec": 30, "reliability": 0.99},
    {"sensor_id": "BMC_FLD_ANDHERI_SUB", "sensor_type": "ULTRASONIC_FLOOD_GAUGE", "agency": "BMC_DISASTER_MANAGEMENT", "lat": 19.1215, "lon": 72.8445, "location": "Andheri Subway Invert", "polling_sec": 30, "reliability": 0.99},
    {"sensor_id": "BMC_FLD_MILAN_SUB", "sensor_type": "ULTRASONIC_FLOOD_GAUGE", "agency": "BMC_DISASTER_MANAGEMENT", "lat": 19.0885, "lon": 72.8420, "location": "Milan Subway Invert", "polling_sec": 30, "reliability": 0.99},
    {"sensor_id": "WR_TRK_FLD_MDD", "sensor_type": "RAIL_TRACK_SUBMERGENCE_SENSOR", "agency": "WESTERN_RAILWAY", "lat": 19.1870, "lon": 72.8490, "location": "Western Railway Km 28/4 Malad Track", "polling_sec": 15, "reliability": 0.99},
    {"sensor_id": "WR_TRK_FLD_GMN", "sensor_type": "RAIL_TRACK_SUBMERGENCE_SENSOR", "agency": "WESTERN_RAILWAY", "lat": 19.1630, "lon": 72.8490, "location": "Western Railway Km 24/8 Goregaon Track", "polling_sec": 15, "reliability": 0.99},
    {"sensor_id": "WR_SIG_MDD_JOS", "sensor_type": "RAILWAY_TRACK_CIRCUIT_MONITOR", "agency": "WESTERN_RAILWAY", "lat": 19.1550, "lon": 72.8480, "location": "WR Auto Signalling Relay Section 22", "polling_sec": 10, "reliability": 0.99},
    {"sensor_id": "WR_OHE_SCADA_BVI", "sensor_type": "TRACTION_POWER_SCADA", "agency": "WESTERN_RAILWAY", "lat": 19.2250, "lon": 72.8550, "location": "Borivali 25kV Traction Substation", "polling_sec": 5, "reliability": 0.99},
    {"sensor_id": "MTP_RADAR_WEH_PATHAN", "sensor_type": "DOPPLER_TRAFFIC_RADAR", "agency": "MUMBAI_TRAFFIC_POLICE", "lat": 19.1802, "lon": 72.8582, "location": "WEH Pathanwadi Northbound/Southbound Flyover", "polling_sec": 20, "reliability": 0.95},
    {"sensor_id": "MTP_RADAR_WEH_JVLR", "sensor_type": "DOPPLER_TRAFFIC_RADAR", "agency": "MUMBAI_TRAFFIC_POLICE", "lat": 19.1415, "lon": 72.8562, "location": "WEH JVLR Interchange Flyover", "polling_sec": 20, "reliability": 0.95},
    {"sensor_id": "MTP_RADAR_LINK_MITH", "sensor_type": "DOPPLER_TRAFFIC_RADAR", "agency": "MUMBAI_TRAFFIC_POLICE", "lat": 19.2015, "lon": 72.8375, "location": "Mithchowki Signal Junction", "polling_sec": 20, "reliability": 0.94},
    {"sensor_id": "MTP_RADAR_LINK_INORB", "sensor_type": "DOPPLER_TRAFFIC_RADAR", "agency": "MUMBAI_TRAFFIC_POLICE", "lat": 19.1782, "lon": 72.8370, "location": "Inorbit Mall Signal Junction", "polling_sec": 20, "reliability": 0.95},
    {"sensor_id": "MMRDA_METRO_OCC_2A", "sensor_type": "METRO_SCADA_FEED", "agency": "MMMOCL", "lat": 19.2025, "lon": 72.8398, "location": "Metro Line 2A Operations Control", "polling_sec": 10, "reliability": 0.99},
    {"sensor_id": "MMRDA_METRO_OCC_7", "sensor_type": "METRO_SCADA_FEED", "agency": "MMMOCL", "lat": 19.1525, "lon": 72.8568, "location": "Metro Line 7 Operations Control", "polling_sec": 10, "reliability": 0.99},
    {"sensor_id": "CITIZEN_SOCIAL_STREAM", "sensor_type": "NLP_SOCIAL_FEED_AGGREGATOR", "agency": "X_POLICE_BMC_MENTIONS", "lat": 19.1700, "lon": 72.8500, "location": "Mumbai Western Suburbs Virtual Feed", "polling_sec": 15, "reliability": 0.65},
    {"sensor_id": "EMERGENCY_112_CAD", "sensor_type": "POLICE_112_DISPATCH_CALL_STREAM", "agency": "MAHARASHTRA_112", "lat": 19.1800, "lon": 72.8500, "location": "North Mumbai Control Room Dispatch", "polling_sec": 10, "reliability": 0.88}
]

with open(os.path.join(DATASET_DIR, "sensor_metadata.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["sensor_id", "sensor_type", "agency", "latitude", "longitude", "location_name", "polling_frequency_sec", "nominal_reliability"])
    for s in SENSORS:
        writer.writerow([s["sensor_id"], s["sensor_type"], s["agency"], s["lat"], s["lon"], s["location"], s["polling_sec"], s["reliability"]])

print("2. sensor_metadata.csv created.")

# ==========================================
# 3. EXPANDED USER PROFILES (25 PROFILES)
# ==========================================
USERS = [
    # Primary Student Persona
    {"user_id": "USR_001", "name": "Sahil K. (Student Persona)", "user_type": "College Student", "origin_name": "Ashokvan, Borivali East", "origin_lat": 19.2372, "origin_lon": 72.8695, "destination_name": "Rajiv Gandhi Institute of Technology (RGIT, Versova)", "destination_lat": 19.1342, "destination_lon": 72.8145, "usual_departure_time": "08:15:00", "target_arrival_time": "09:15:00", "preferred_modes": "Bike,Train,Metro", "travel_preferences": "Punctuality for lectures, Weather-safe, Budget-friendly student pass"},
    {"user_id": "USR_002", "name": "Priya Nair", "user_type": "Software Engineer", "origin_name": "Mahavir Nagar, Kandivali West", "origin_lat": 19.2105, "origin_lon": 72.8390, "destination_name": "NESCO IT Park, Goregaon East", "destination_lat": 19.1555, "destination_lon": 72.8542, "usual_departure_time": "08:45:00", "target_arrival_time": "09:30:00", "preferred_modes": "Metro,Car,Train", "travel_preferences": "Air-conditioned comfort, Avoid bumper-to-bumper traffic"},
    {"user_id": "USR_003", "name": "Dr. Rajesh Mehta", "user_type": "Cardiologist (Emergency)", "origin_name": "Gorai 2, Borivali West", "origin_lat": 19.2355, "origin_lon": 72.8320, "destination_name": "Kokilaben Dhirubhai Ambani Hospital, Andheri West", "destination_lat": 19.1312, "destination_lon": 72.8252, "usual_departure_time": "07:45:00", "target_arrival_time": "08:35:00", "preferred_modes": "Car,Metro", "travel_preferences": "Fastest response time, Guaranteed arrival, Emergency priority"},
    {"user_id": "USR_004", "name": "Rohan Varma", "user_type": "Degree Student", "origin_name": "Dahisar East (Anand Nagar)", "origin_lat": 19.2550, "origin_lon": 72.8630, "destination_name": "Bhavan's College, Andheri West", "destination_lat": 19.1245, "destination_lon": 72.8355, "usual_departure_time": "08:10:00", "target_arrival_time": "09:10:00", "preferred_modes": "Train,Metro,Bike", "travel_preferences": "Fast transit, Direct train preferred on non-rainy days"},
    {"user_id": "USR_005", "name": "Ananya Iyer", "user_type": "Management Consultant", "origin_name": "Lokhandwala Complex, Kandivali East", "origin_lat": 19.2040, "origin_lon": 72.8710, "destination_name": "SEEPZ / MIDC, Andheri East", "destination_lat": 19.1225, "destination_lon": 72.8795, "usual_departure_time": "08:30:00", "target_arrival_time": "09:30:00", "preferred_modes": "Metro,Cab,Bike", "travel_preferences": "Reliable schedule, Metro Line 7 to Gundavali"},
    {"user_id": "USR_006", "name": "Vikram Malhotra", "user_type": "Creative Director", "origin_name": "Yari Road, Versova, Andheri West", "origin_lat": 19.1360, "origin_lon": 72.8110, "destination_name": "NESCO / Film City, Goregaon East", "destination_lat": 19.1555, "destination_lon": 72.8542, "usual_departure_time": "09:30:00", "target_arrival_time": "10:30:00", "preferred_modes": "Car,Metro,Auto", "travel_preferences": "Comfort, Avoid waterlogged subways"},
    {"user_id": "USR_007", "name": "Sneha Patil", "user_type": "Investment Analyst", "origin_name": "Dindoshi, Malad East", "origin_lat": 19.1740, "origin_lon": 72.8620, "destination_name": "Andheri East Financial District", "destination_lat": 19.1170, "destination_lon": 72.8550, "usual_departure_time": "08:20:00", "target_arrival_time": "09:05:00", "preferred_modes": "Metro,Two-Wheeler", "travel_preferences": "Punctuality, Minimum walking transfer"},
    {"user_id": "USR_008", "name": "Aditya Deshmukh", "user_type": "Junior College Student", "origin_name": "Charkop Sector 8, Kandivali West", "origin_lat": 19.2150, "origin_lon": 72.8250, "destination_name": "Mithibai College, Vile Parle West", "destination_lat": 19.1028, "destination_lon": 72.8372, "usual_departure_time": "07:30:00", "target_arrival_time": "08:30:00", "preferred_modes": "Train,Metro,Bus", "travel_preferences": "Low budget, Strict morning lecture attendance"},
    {"user_id": "USR_009", "name": "Meera Joshi", "user_type": "High School Teacher", "origin_name": "Borivali West (Shimpoli)", "origin_lat": 19.2240, "origin_lon": 72.8420, "destination_name": "St. Xavier's High School, Vile Parle", "destination_lat": 19.1010, "destination_lon": 72.8420, "usual_departure_time": "06:45:00", "target_arrival_time": "07:35:00", "preferred_modes": "Train,Bus", "travel_preferences": "Earliest arrival, Rain-safe"},
    {"user_id": "USR_010", "name": "Arjun Singhania", "user_type": "Corporate Lawyer", "origin_name": "Eksar, Borivali West", "origin_lat": 19.2340, "origin_lon": 72.8460, "destination_name": "Bandra Kurla Complex (BKC)", "destination_lat": 19.0600, "destination_lon": 72.8650, "usual_departure_time": "08:00:00", "target_arrival_time": "09:15:00", "preferred_modes": "Car,Train", "travel_preferences": "Direct highway or AC train local"},
    {"user_id": "USR_011", "name": "Kavita Rao", "user_type": "Biotech Researcher", "origin_name": "National Park, Borivali East", "origin_lat": 19.2290, "origin_lon": 72.8650, "destination_name": "MIDC Andheri East", "destination_lat": 19.1200, "destination_lon": 72.8700, "usual_departure_time": "08:40:00", "target_arrival_time": "09:30:00", "preferred_modes": "Metro,Car", "travel_preferences": "Metro Line 7 uninterrupted commute"},
    {"user_id": "USR_012", "name": "Farhan Qureshi", "user_type": "Architecture Student", "origin_name": "Malad West (Orlem)", "origin_lat": 19.1920, "origin_lon": 72.8400, "destination_name": "Balwant Sheth School of Architecture, Vile Parle", "destination_lat": 19.1040, "destination_lon": 72.8360, "usual_departure_time": "08:05:00", "target_arrival_time": "08:55:00", "preferred_modes": "Bike,Train", "travel_preferences": "Bike with portfolio case; switch to train during rain"},
    {"user_id": "USR_013", "name": "Tanvi Sawant", "user_type": "Fintech Product Manager", "origin_name": "Thakur Village, Kandivali East", "origin_lat": 19.2080, "origin_lon": 72.8720, "destination_name": "Mindspace Malad West", "destination_lat": 19.1780, "destination_lon": 72.8360, "usual_departure_time": "09:00:00", "target_arrival_time": "09:40:00", "preferred_modes": "Auto,Bike,Metro", "travel_preferences": "Short cross-suburb commute"},
    {"user_id": "USR_014", "name": "Siddharth Sen", "user_type": "Data Scientist", "origin_name": "D.N. Nagar, Andheri West", "origin_lat": 19.1308, "origin_lon": 72.8322, "destination_name": "Mindspace Airoli (via JVLR)", "destination_lat": 19.1550, "destination_lon": 72.9900, "usual_departure_time": "08:15:00", "target_arrival_time": "09:45:00", "preferred_modes": "Car,Bus", "travel_preferences": "JVLR highway status critical"},
    {"user_id": "USR_015", "name": "Pooja Hegde", "user_type": "Fashion Designer", "origin_name": "Lokhandwala, Andheri West", "origin_lat": 19.1410, "origin_lon": 72.8290, "destination_name": "Bandra West Linking Road", "destination_lat": 19.0620, "destination_lon": 72.8340, "usual_departure_time": "10:30:00", "target_arrival_time": "11:15:00", "preferred_modes": "Car,Auto", "travel_preferences": "SV Road congestion sensitive"},
    {"user_id": "USR_016", "name": "Nikhil Agarwal", "user_type": "Chartered Accountant", "origin_name": "Kandivali West (Poisar)", "origin_lat": 19.2150, "origin_lon": 72.8480, "destination_name": "Fort / Churchgate Commercial", "destination_lat": 18.9320, "destination_lon": 72.8280, "usual_departure_time": "07:50:00", "target_arrival_time": "08:50:00", "preferred_modes": "Train", "travel_preferences": "WR Fast train local only"},
    {"user_id": "USR_017", "name": "Ayesha Khan", "user_type": "Medical Intern", "origin_name": "Jogeshwari West (Millat Nagar)", "origin_lat": 19.1400, "origin_lon": 72.8380, "destination_name": "Cooper Hospital, Juhu / Vile Parle", "destination_lat": 19.1090, "destination_lon": 72.8360, "usual_departure_time": "07:15:00", "target_arrival_time": "07:45:00", "preferred_modes": "Auto,Bike", "travel_preferences": "Short hop, avoids submerged underpasses"},
    {"user_id": "USR_018", "name": "Gaurav Bansal", "user_type": "Operations Manager", "origin_name": "Goregaon East (Aarey Colony)", "origin_lat": 19.1620, "origin_lon": 72.8680, "destination_name": "Chakala MIDC", "destination_lat": 19.1120, "destination_lon": 72.8640, "usual_departure_time": "08:45:00", "target_arrival_time": "09:20:00", "preferred_modes": "Bike,Metro", "travel_preferences": "WEH Southbound monitoring"},
    {"user_id": "USR_019", "name": "Ritu Sharma", "user_type": "Journalist", "origin_name": "Versova Beach Road", "origin_lat": 19.1320, "origin_lon": 72.8120, "destination_name": "Times of India Bldg, CST", "destination_lat": 18.9410, "destination_lon": 72.8340, "usual_departure_time": "08:30:00", "target_arrival_time": "09:40:00", "preferred_modes": "Metro,Train", "travel_preferences": "Metro Line 1 -> Andheri WR Fast train"},
    {"user_id": "USR_020", "name": "Devendra Tawde", "user_type": "Government Clerk (Mantralaya)", "origin_name": "Dahisar West", "origin_lat": 19.2520, "origin_lon": 72.8520, "destination_name": "Churchgate Station", "destination_lat": 18.9320, "destination_lon": 72.8270, "usual_departure_time": "08:15:00", "target_arrival_time": "09:25:00", "preferred_modes": "Train", "travel_preferences": "WR 1st Class pass holder"},
    {"user_id": "USR_021", "name": "Karan Chhabra", "user_type": "Hotelier", "origin_name": "Borivali West (I.C. Colony)", "origin_lat": 19.2410, "origin_lon": 72.8470, "destination_name": "Domestic Airport Terminal 1, Santacruz", "destination_lat": 19.0980, "destination_lon": 72.8520, "usual_departure_time": "06:30:00", "target_arrival_time": "07:25:00", "preferred_modes": "Car,Metro", "travel_preferences": "Highway speed and flyover clearance"},
    {"user_id": "USR_022", "name": "Simran Kaur", "user_type": "Graphic Designer", "origin_name": "Kandivali West (Mahavir Nagar)", "origin_lat": 19.2105, "origin_lon": 72.8390, "destination_name": "RGIT Versova Campus", "destination_lat": 19.1342, "destination_lon": 72.8145, "usual_departure_time": "08:20:00", "target_arrival_time": "09:15:00", "preferred_modes": "Metro,Bike", "travel_preferences": "Direct student route via Metro 2A"},
    {"user_id": "USR_023", "name": "Manish Parekh", "user_type": "Diamond Merchant", "origin_name": "Malad East (Pathanwadi)", "origin_lat": 19.1800, "origin_lon": 72.8620, "destination_name": "Bharat Diamond Bourse, BKC", "destination_lat": 19.0650, "destination_lon": 72.8680, "usual_departure_time": "09:15:00", "target_arrival_time": "10:15:00", "preferred_modes": "Car,Metro", "travel_preferences": "WEH traffic reliability"},
    {"user_id": "USR_024", "name": "Deepa Sundaram", "user_type": "Pharmacy Student", "origin_name": "Jogeshwari East", "origin_lat": 19.1380, "origin_lon": 72.8540, "destination_name": "SNDT Women's University, Juhu", "destination_lat": 19.0920, "destination_lon": 72.8300, "usual_departure_time": "07:45:00", "target_arrival_time": "08:30:00", "preferred_modes": "Bus,Auto", "travel_preferences": "Subway flooding alert essential"},
    {"user_id": "USR_025", "name": "Harshvardhan Rane", "user_type": "Fitness Coach", "origin_name": "Andheri West (Four Bungalows)", "origin_lat": 19.1290, "origin_lon": 72.8250, "destination_name": "Gold's Gym, Kandivali West", "destination_lat": 19.2080, "destination_lon": 72.8380, "usual_departure_time": "06:00:00", "target_arrival_time": "06:45:00", "preferred_modes": "Bike,Metro", "travel_preferences": "Early morning reverse-commute"}
]

with open(os.path.join(DATASET_DIR, "user_profiles.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["user_id", "name", "user_type", "origin_name", "origin_lat", "origin_lon", "destination_name", "destination_lat", "destination_lon", "usual_departure_time", "target_arrival_time", "preferred_transport_modes", "travel_preferences"])
    for u in USERS:
        writer.writerow([u["user_id"], u["name"], u["user_type"], u["origin_name"], u["origin_lat"], u["origin_lon"], u["destination_name"], u["destination_lat"], u["destination_lon"], u["usual_departure_time"], u["target_arrival_time"], u["preferred_modes"], u["travel_preferences"]])

print("3. user_profiles.csv created (25 profiles).")

# ==========================================
# 4. EXPANDED ROUTE NETWORK (45 SEGMENTS)
# ==========================================
ROUTES_DATA = [
    # USR_001 (Student: Ashokvan to RGIT Versova)
    ("RT_USR001_BIKE_WEH", "USR_001", "Bike", "SEG_01_01", 1, "Ashokvan (Borivali E)", "WEH National Park Junction", 19.2372, 72.8695, 19.2295, 72.8625, "Arterial Road", 1.8, 30.0, False),
    ("RT_USR001_BIKE_WEH", "USR_001", "Bike", "SEG_01_02", 2, "WEH National Park Junction", "WEH Pathanwadi Flyover (Malad)", 19.2295, 72.8625, 19.1802, 72.8582, "Highway Flyover", 6.2, 45.0, False),
    ("RT_USR001_BIKE_WEH", "USR_001", "Bike", "SEG_01_03", 3, "WEH Pathanwadi Flyover", "JVLR Junction WEH (Jogeshwari)", 19.1802, 72.8582, 19.1415, 72.8562, "Highway", 4.8, 40.0, False),
    ("RT_USR001_BIKE_WEH", "USR_001", "Bike", "SEG_01_04", 4, "JVLR Junction WEH", "SV Road / Jogeshwari West", 19.1415, 72.8562, 19.1360, 72.8420, "Arterial Connector", 1.9, 25.0, True),
    ("RT_USR001_BIKE_WEH", "USR_001", "Bike", "SEG_01_05", 5, "SV Road Jogeshwari", "RGIT Versova Campus", 19.1360, 72.8420, 19.1342, 72.8145, "City Arterial", 3.4, 28.0, False),

    ("RT_USR001_BIKE_LINK", "USR_001", "Bike", "SEG_02_01", 1, "Ashokvan (Borivali E)", "Borivali West Link Road", 19.2372, 72.8695, 19.2272, 72.8455, "Arterial Road", 3.2, 25.0, False),
    ("RT_USR001_BIKE_LINK", "USR_001", "Bike", "SEG_02_02", 2, "Borivali West Link Road", "Mithchowki Junction Kandivali", 19.2272, 72.8455, 19.2015, 72.8375, "Major Arterial", 3.5, 30.0, False),
    ("RT_USR001_BIKE_LINK", "USR_001", "Bike", "SEG_02_03", 3, "Mithchowki Junction", "Inorbit Mall Link Rd (Malad)", 19.2015, 72.8375, 19.1782, 72.8370, "Major Arterial", 2.8, 32.0, False),
    ("RT_USR001_BIKE_LINK", "USR_001", "Bike", "SEG_02_04", 4, "Inorbit Mall Link Rd", "Infinity Mall / DN Nagar", 19.1782, 72.8370, 19.1305, 72.8320, "Major Arterial", 5.4, 30.0, False),
    ("RT_USR001_BIKE_LINK", "USR_001", "Bike", "SEG_02_05", 5, "DN Nagar Junction", "RGIT Versova Campus", 19.1305, 72.8320, 19.1342, 72.8145, "City Road", 2.1, 25.0, False),

    ("RT_USR001_TRAIN", "USR_001", "Train", "SEG_03_01", 1, "Ashokvan (Borivali E)", "Borivali Railway Station (PF 3/4/5)", 19.2372, 72.8695, 19.2290, 72.8569, "Auto / Feeder Walk", 1.6, 18.0, False),
    ("RT_USR001_TRAIN", "USR_001", "Train", "SEG_03_02", 2, "Borivali Railway Station", "Kandivali Railway Station", 19.2290, 72.8569, 19.2045, 72.8522, "Rail Track (WR Slow/Fast)", 3.1, 65.0, False),
    ("RT_USR001_TRAIN", "USR_001", "Train", "SEG_03_03", 3, "Kandivali Railway Station", "Malad Railway Station", 19.2045, 72.8522, 19.1868, 72.8488, "Rail Track (WR Slow/Fast)", 2.3, 60.0, True),
    ("RT_USR001_TRAIN", "USR_001", "Train", "SEG_03_04", 4, "Malad Railway Station", "Andheri Railway Station", 19.1868, 72.8488, 19.1197, 72.8464, "Rail Track (WR Slow/Fast)", 7.8, 70.0, False),
    ("RT_USR001_TRAIN", "USR_001", "Train", "SEG_03_05", 5, "Andheri Railway Station (West)", "RGIT Versova Campus", 19.1197, 72.8464, 19.1342, 72.8145, "Auto-rickshaw / BEST 249", 3.8, 18.0, False),

    ("RT_USR001_METRO_2A", "USR_001", "Metro", "SEG_04_01", 1, "Ashokvan (Borivali E)", "Borivali West Metro Station (L2A)", 19.2372, 72.8695, 19.2272, 72.8455, "Auto Feeder Link", 3.1, 20.0, False),
    ("RT_USR001_METRO_2A", "USR_001", "Metro", "SEG_04_02", 2, "Borivali West Metro Station", "D.N. Nagar Metro Station", 19.2272, 72.8455, 19.1308, 72.8322, "Elevated Viaduct (Line 2A)", 11.2, 42.0, False),
    ("RT_USR001_METRO_2A", "USR_001", "Metro", "SEG_04_03", 3, "D.N. Nagar Metro Station (L1 interchange)", "Versova Metro Station (L1)", 19.1308, 72.8322, 19.1315, 72.8172, "Elevated Viaduct (Line 1)", 1.6, 40.0, False),
    ("RT_USR001_METRO_2A", "USR_001", "Metro", "SEG_04_04", 4, "Versova Metro Station", "RGIT Versova Campus", 19.1315, 72.8172, 19.1342, 72.8145, "Walk", 0.4, 4.5, False),

    ("RT_USR001_METRO_7_1", "USR_001", "Metro", "SEG_05_01", 1, "Ashokvan (Borivali E)", "National Park Metro Station (L7)", 19.2372, 72.8695, 19.2301, 72.8631, "Walk / Cycle", 1.1, 8.0, False),
    ("RT_USR001_METRO_7_1", "USR_001", "Metro", "SEG_05_02", 2, "National Park Metro Station", "Gundavali Metro Station (L7)", 19.2301, 72.8631, 19.1172, 72.8548, "Elevated Viaduct (Line 7)", 12.8, 45.0, False),
    ("RT_USR001_METRO_7_1", "USR_001", "Metro", "SEG_05_03", 3, "Gundavali (FOB Interchange)", "WEH Station to Versova Metro (L1)", 19.1172, 72.8548, 19.1315, 72.8172, "Elevated Viaduct (Line 1)", 4.8, 38.0, False),
    ("RT_USR001_METRO_7_1", "USR_001", "Metro", "SEG_05_04", 4, "Versova Metro Station", "RGIT Versova Campus", 19.1315, 72.8172, 19.1342, 72.8145, "Walk", 0.4, 4.5, False),

    # USR_002: Kandivali W to NESCO IT Park
    ("RT_USR002_METRO", "USR_002", "Metro", "SEG_06_01", 1, "Mahavir Nagar Kandivali W", "Kandivali West Metro (L2A)", 19.2105, 72.8390, 19.2085, 72.8423, "Walk", 0.4, 4.5, False),
    ("RT_USR002_METRO", "USR_002", "Metro", "SEG_06_02", 2, "Kandivali West Metro", "Pahadi Goregaon Metro", 19.2085, 72.8423, 19.1685, 72.8365, "Elevated Viaduct (Line 2A)", 4.9, 42.0, False),
    ("RT_USR002_METRO", "USR_002", "Metro", "SEG_06_03", 3, "Pahadi Goregaon Metro", "NESCO IT Park Goregaon E", 19.1685, 72.8365, 19.1555, 72.8542, "Auto across Goregaon Flyover", 2.4, 25.0, False),

    ("RT_USR002_CAR_SUBWAY", "USR_002", "Car", "SEG_07_01", 1, "Mahavir Nagar Kandivali W", "Malad Subway", 19.2105, 72.8390, 19.1862, 72.8462, "SV Road Connector", 3.2, 22.0, True),
    ("RT_USR002_CAR_SUBWAY", "USR_002", "Car", "SEG_07_02", 2, "Malad Subway", "NESCO IT Park Goregaon E", 19.1862, 72.8462, 19.1555, 72.8542, "WEH Access Slip", 3.8, 30.0, False),

    # USR_003: Gorai to Kokilaben Hospital
    ("RT_USR003_METRO", "USR_003", "Metro", "SEG_08_01", 1, "Gorai 2 Borivali W", "Borivali West Metro", 19.2355, 72.8320, 19.2272, 72.8455, "Auto Link", 1.8, 22.0, False),
    ("RT_USR003_METRO", "USR_003", "Metro", "SEG_08_02", 2, "Borivali West Metro", "Andheri West (DN Nagar)", 19.2272, 72.8455, 19.1308, 72.8322, "Elevated Viaduct (Line 2A)", 11.2, 42.0, False),
    ("RT_USR003_METRO", "USR_003", "Metro", "SEG_08_03", 3, "DN Nagar Metro", "Kokilaben Hospital", 19.1308, 72.8322, 19.1312, 72.8252, "Auto / Walk", 0.9, 15.0, False),

    # USR_004: Dahisar to Bhavan's College
    ("RT_USR004_TRAIN", "USR_004", "Train", "SEG_09_01", 1, "Dahisar East", "Dahisar Railway Station", 19.2550, 72.8630, 19.2501, 72.8593, "Walk", 0.7, 4.5, False),
    ("RT_USR004_TRAIN", "USR_004", "Train", "SEG_09_02", 2, "Dahisar Railway Station", "Andheri Railway Station", 19.2501, 72.8593, 19.1197, 72.8464, "Rail Track (WR Fast)", 15.2, 72.0, True),
    ("RT_USR004_TRAIN", "USR_004", "Train", "SEG_09_03", 3, "Andheri Railway Station", "Bhavan's College", 19.1197, 72.8464, 19.1245, 72.8355, "Auto / Walk", 1.4, 18.0, False),

    # USR_008: Charkop to Mithibai College
    ("RT_USR008_TRAIN", "USR_008", "Train", "SEG_10_01", 1, "Charkop Sector 8", "Kandivali Station West", 19.2150, 72.8250, 19.2045, 72.8522, "BEST Bus 224", 3.2, 18.0, False),
    ("RT_USR008_TRAIN", "USR_008", "Train", "SEG_10_02", 2, "Kandivali Railway Station", "Vile Parle Railway Station", 19.2045, 72.8522, 19.0999, 72.8438, "Rail Track (WR Slow)", 11.8, 55.0, True),
    ("RT_USR008_TRAIN", "USR_008", "Train", "SEG_10_03", 3, "Vile Parle Station West", "Mithibai College", 19.0999, 72.8438, 19.1028, 72.8372, "Walk", 0.6, 4.5, False),

    # USR_022: Kandivali to RGIT Versova (Student Metro Route)
    ("RT_USR022_METRO", "USR_022", "Metro", "SEG_11_01", 1, "Mahavir Nagar Kandivali W", "Kandivali West Metro (L2A)", 19.2105, 72.8390, 19.2085, 72.8423, "Walk", 0.4, 4.5, False),
    ("RT_USR022_METRO", "USR_022", "Metro", "SEG_11_02", 2, "Kandivali West Metro", "D.N. Nagar Metro (L2A)", 19.2085, 72.8423, 19.1308, 72.8322, "Elevated Viaduct (Line 2A)", 8.9, 42.0, False),
    ("RT_USR022_METRO", "USR_022", "Metro", "SEG_11_03", 3, "D.N. Nagar Metro", "Versova Metro Station (L1)", 19.1308, 72.8322, 19.1315, 72.8172, "Elevated Viaduct (Line 1)", 1.6, 40.0, False),
    ("RT_USR022_METRO", "USR_022", "Metro", "SEG_11_04", 4, "Versova Metro", "RGIT Versova Campus", 19.1315, 72.8172, 19.1342, 72.8145, "Walk", 0.4, 4.5, False),
]

with open(os.path.join(DATASET_DIR, "route_network.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["route_id", "user_id", "transport_mode", "segment_id", "segment_sequence", "from_node", "to_node", "from_lat", "from_lon", "to_lat", "to_lon", "infrastructure_type", "distance_km", "typical_speed_kmh", "is_flood_prone"])
    for r in ROUTES_DATA:
        writer.writerow(r)

print("4. route_network.csv created.")

# ==========================================
# 5. BASELINE TRAVEL TIMES
# ==========================================
BASELINES = [
    ("RT_USR001_BIKE_WEH", "Bike", "Morning Peak (07:30-10:30)", 52.0, 7.5, 42.0, 75.0, 15.0),
    ("RT_USR001_BIKE_WEH", "Bike", "Afternoon Off-Peak (11:00-16:00)", 38.0, 4.0, 32.0, 48.0, 10.0),
    ("RT_USR001_BIKE_WEH", "Bike", "Evening Peak (17:30-21:00)", 58.0, 8.5, 45.0, 85.0, 20.0),
    ("RT_USR001_BIKE_LINK", "Bike", "Morning Peak (07:30-10:30)", 48.0, 5.5, 40.0, 65.0, 12.0),
    ("RT_USR001_BIKE_LINK", "Bike", "Evening Peak (17:30-21:00)", 54.0, 6.5, 44.0, 72.0, 15.0),
    ("RT_USR001_TRAIN", "Train", "Morning Peak (07:30-10:30)", 44.0, 4.0, 38.0, 55.0, 10.0),
    ("RT_USR001_TRAIN", "Train", "Afternoon Off-Peak (11:00-16:00)", 39.0, 3.0, 34.0, 46.0, 8.0),
    ("RT_USR001_TRAIN", "Train", "Evening Peak (17:30-21:00)", 46.0, 5.0, 39.0, 60.0, 12.0),
    ("RT_USR001_METRO_2A", "Metro", "Morning Peak (07:30-10:30)", 50.0, 2.5, 46.0, 56.0, 6.0),
    ("RT_USR001_METRO_2A", "Metro", "Afternoon Off-Peak (11:00-16:00)", 48.0, 2.0, 45.0, 53.0, 5.0),
    ("RT_USR001_METRO_2A", "Metro", "Evening Peak (17:30-21:00)", 51.0, 2.5, 47.0, 58.0, 6.0),
    ("RT_USR001_METRO_7_1", "Metro", "Morning Peak (07:30-10:30)", 55.0, 3.0, 50.0, 62.0, 8.0),
    ("RT_USR002_METRO", "Metro", "Morning Peak (07:30-10:30)", 26.0, 2.0, 23.0, 31.0, 5.0),
    ("RT_USR002_CAR_SUBWAY", "Car", "Morning Peak (07:30-10:30)", 35.0, 6.0, 28.0, 50.0, 12.0),
    ("RT_USR003_METRO", "Metro", "Morning Peak (07:30-10:30)", 32.0, 2.5, 28.0, 38.0, 6.0),
    ("RT_USR004_TRAIN", "Train", "Morning Peak (07:30-10:30)", 42.0, 4.0, 36.0, 52.0, 10.0),
    ("RT_USR008_TRAIN", "Train", "Morning Peak (07:30-10:30)", 38.0, 3.5, 33.0, 48.0, 10.0),
    ("RT_USR022_METRO", "Metro", "Morning Peak (07:30-10:30)", 36.0, 2.0, 33.0, 42.0, 5.0),
]

with open(os.path.join(DATASET_DIR, "baseline_travel_times.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["route_id", "transport_mode", "time_of_day_slot", "baseline_duration_min", "variability_std_min", "min_duration_min", "max_duration_min", "buffer_allowance_min"])
    for b in BASELINES:
        writer.writerow(b)

print("5. baseline_travel_times.csv created.")

# ==========================================
# 6. INCIDENTS (MULTI-DAY 14-DAY SIMULATION EPISODES)
# ==========================================
# Generate 48 realistic ground-truth incident clusters across 14 simulated days (July 15 - July 28, 2026)
# Covering: Urban Flooding, Road Accident, Public Transport Disruption, Utility Failure, Compound Incidents.
INCIDENTS_CATALOG = []

INCIDENT_TEMPLATES = [
    ("Urban Flooding", "Severe Track Submergence at Malad-Kandivali Section", 19.1868, 72.8488, 2.2, "Western Railway Slow & Fast Tracks (Borivali-Malad), Malad Subway, SV Road", "CRITICAL_LEVEL_4", 85000, 4.5, 0.96, "Cloudburst rainfall exceeding 82mm/hr with high tide backflow"),
    ("Road Accident", "Multi-Vehicle Collision on WEH Pathanwadi Flyover Southbound", 19.1802, 72.8582, 1.2, "Western Express Highway (Pathanwadi Flyover Southbound)", "MAJOR_LEVEL_3", 32000, 3.2, 0.91, "Oil tanker brake failure skidded across 3 lanes in wet conditions"),
    ("Public Transport Disruption", "Overhead OHE Wire Sag & Point Signal Failure at Borivali Interlocking", 19.2150, 72.8540, 1.8, "Western Railway Suburban Track Point 104B, Platform 3 & 4 Borivali", "MAJOR_LEVEL_3", 60000, 3.8, 0.94, "Lightning strike causing surge tripping in 25kV traction substation"),
    ("Utility Failure", "BEST Power Substation Trip & Traffic Signal Failure at Mithchowki Junction", 19.2015, 72.8375, 0.8, "Mithchowki 4-Way Traffic Junction, New Link Road Kandivali", "MODERATE_LEVEL_2", 18000, 2.5, 0.89, "Underground feeder cable short circuit following trench seepage"),
    ("Urban Flooding", "Andheri Subway Inundation & SV Road Diversion", 19.1215, 72.8445, 1.5, "Andheri Subway East-West Link, SV Road Andheri West", "MAJOR_LEVEL_3", 42000, 3.5, 0.95, "Storm water drain backflow with 60mm/hr intense rain"),
    ("Road Accident", "Overturned Container Truck on JVLR WEH Junction Flyover", 19.1415, 72.8562, 1.6, "Jogeshwari JVLR Flyover connecting WEH", "CRITICAL_LEVEL_4", 55000, 4.2, 0.93, "Commercial trailer jackknifing across junction entrance ramp"),
    ("Public Transport Disruption", "Track Circuit Failure between Goregaon and Ram Mandir Stations", 19.1580, 72.8480, 1.4, "Western Railway Up & Down Slow Tracks (Goregaon-Ram Mandir)", "MAJOR_LEVEL_3", 48000, 3.4, 0.92, "Cable insulation breakdown due to water logging in track duct"),
    ("Road Accident", "BEST Electric Bus Breakdown Blocking Inorbit Link Road Junction", 19.1782, 72.8370, 0.9, "New Link Road Malad West Inorbit Junction", "MODERATE_LEVEL_2", 22000, 2.2, 0.88, "Battery thermal sensor shutdown immobilizing bus in middle lane"),
    ("Utility Failure", "High Tension Cable Snap & Streetlight Blackout on S.V. Road Goregaon", 19.1645, 72.8460, 1.1, "S.V. Road Goregaon West Station Approach", "MODERATE_LEVEL_2", 15000, 2.1, 0.87, "Tree branch falling on overhead low-tension distribution line"),
    ("Urban Flooding", "Milan Subway Waterlogging & Traffic Standstill", 19.0885, 72.8420, 1.2, "Milan Subway Santacruz West Link", "MAJOR_LEVEL_3", 35000, 3.1, 0.96, "Subway sump pump failure during 75mm/hr rain spell"),
    ("Public Transport Disruption", "Metro Line 2A Traction Power Supply Trip at Dahanukarwadi", 19.2025, 72.8398, 1.0, "Metro Line 2A Overhead Viaduct between Kandivali and Dahanukarwadi", "MODERATE_LEVEL_2", 25000, 2.8, 0.95, "Grid voltage fluctuation tripping receiving substation transformer"),
    ("Road Accident", "Spilled Chemical Drum on Malad Link Road near Chincholi Bunder", 19.1830, 72.8375, 1.0, "New Link Road Malad West (Northbound & Southbound)", "MAJOR_LEVEL_3", 28000, 3.0, 0.90, "Hazardous material spill requiring fire brigade foam wash"),
]

inc_count = 1
for day_idx in range(14):
    sim_date = datetime(2026, 7, 15) + timedelta(days=day_idx)
    # 3 to 4 incidents per day
    daily_picks = random.sample(INCIDENT_TEMPLATES, k=random.randint(3, 4))
    for tpl in daily_picks:
        inc_id = f"INC_MUM_202607{15+day_idx:02d}_{inc_count:02d}"
        hour = random.choice([7, 8, 8, 9, 12, 17, 18, 19])
        minute = random.choice([5, 15, 25, 35, 45, 55])
        st_dt = datetime(sim_date.year, sim_date.month, sim_date.day, hour, minute, 0)
        duration_hrs = random.uniform(1.2, 3.5)
        end_dt = st_dt + timedelta(hours=duration_hrs)

        INCIDENTS_CATALOG.append({
            "incident_id": inc_id,
            "scenario": tpl[0],
            "title": f"{tpl[1]} (Day {day_idx+1})",
            "start_time": st_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "end_time": end_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "st_dt": st_dt,
            "end_dt": end_dt,
            "lat": round(tpl[2] + random.uniform(-0.002, 0.002), 4),
            "lon": round(tpl[3] + random.uniform(-0.002, 0.002), 4),
            "radius_km": tpl[4],
            "affected_infra": tpl[5],
            "severity_level": tpl[6],
            "commuters_affected": int(tpl[7] * random.uniform(0.85, 1.2)),
            "economic_impact": round(tpl[8] * random.uniform(0.9, 1.1), 1),
            "confidence_score": round(tpl[9] + random.uniform(-0.03, 0.03), 2),
            "known_cause": tpl[10]
        })
        inc_count += 1

# Write incident_severity_labels.csv
with open(os.path.join(DATASET_DIR, "incident_severity_labels.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "incident_id", "scenario_type", "incident_title", "start_time", "end_time",
        "centroid_lat", "centroid_lon", "affected_radius_km", "affected_infrastructure",
        "severity_level", "estimated_commuters_affected", "economic_impact_score",
        "confidence_score", "known_cause"
    ])
    for inc in INCIDENTS_CATALOG:
        writer.writerow([
            inc["incident_id"], inc["scenario"], inc["title"], inc["start_time"], inc["end_time"],
            inc["lat"], inc["lon"], inc["radius_km"], inc["affected_infra"],
            inc["severity_level"], inc["commuters_affected"], inc["economic_impact"],
            inc["confidence_score"], inc["known_cause"]
        ])

print(f"6. incident_severity_labels.csv created ({len(INCIDENTS_CATALOG)} incidents).")

# ==========================================
# 7. WEATHER EVENTS (OVER 14 DAYS - ~2,000 RECORDS)
# ==========================================
WEATHER_RECORDS = []
weather_id_counter = 1

WEATHER_STATIONS_SUBSET = [
    ("Borivali West / Dahisar Belt", 19.2310, 72.8580, "BMC_AWS_BORIVALI"),
    ("Kandivali R/South Ward", 19.2065, 72.8510, "BMC_AWS_KANDIVALI"),
    ("Malad Subway Invert", 19.1862, 72.8462, "BMC_FLD_MALAD_SUB"),
    ("Goregaon P/South Ward", 19.1620, 72.8490, "BMC_AWS_GOREGAON"),
    ("Andheri West (Four Bungalows/Versova)", 19.1230, 72.8360, "BMC_AWS_ANDHERI_W"),
    ("Andheri Subway Invert", 19.1215, 72.8445, "BMC_FLD_ANDHERI_SUB"),
]

for day_idx in range(14):
    sim_date = datetime(2026, 7, 15) + timedelta(days=day_idx)
    # Heavy rain days: Day 0 (Jul 15), Day 3 (Jul 18), Day 6 (Jul 21), Day 9 (Jul 24)
    is_heavy_rain_day = (day_idx in [0, 3, 6, 9])
    
    # 24 time steps per day (every 30 mins from 06:00 to 18:00)
    for step in range(24):
        t = datetime(sim_date.year, sim_date.month, sim_date.day, 6, 0, 0) + timedelta(minutes=step * 30)
        is_peak_morning = (7 <= t.hour <= 10)
        
        for loc_name, lat, lon, s_id in WEATHER_STATIONS_SUBSET:
            if is_heavy_rain_day and is_peak_morning:
                rain = round(random.uniform(65, 95), 1)
                wl = round(random.uniform(40, 85), 1) if "Subway" in loc_name else round(random.uniform(20, 45), 1)
                risk = "Severe" if wl > 50 else "High"
                cond = "Cloudburst Rain" if rain > 80 else "Heavy Rain"
            elif is_heavy_rain_day:
                rain = round(random.uniform(30, 60), 1)
                wl = round(random.uniform(20, 45), 1) if "Subway" in loc_name else round(random.uniform(10, 25), 1)
                risk = "High" if wl > 30 else "Moderate"
                cond = "Heavy Rain"
            else:
                rain = round(random.uniform(5, 25), 1)
                wl = round(random.uniform(5, 18), 1)
                risk = "Low" if wl < 10 else "Moderate"
                cond = "Moderate Rain" if rain > 15 else "Light Showers"
            
            accum = round(rain * 1.8 + random.uniform(5, 15), 1)
            
            WEATHER_RECORDS.append([
                f"WTH_{weather_id_counter:05d}", t.strftime("%Y-%m-%d %H:%M:%S"), loc_name,
                lat, lon, rain, accum, wl, risk, cond, s_id
            ])
            weather_id_counter += 1

with open(os.path.join(DATASET_DIR, "weather_events.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "weather_event_id", "timestamp", "location_name", "latitude", "longitude",
        "rainfall_intensity_mm_hr", "accumulated_rainfall_3hr_mm", "waterlogging_depth_cm",
        "waterlogging_risk_level", "weather_condition", "sensor_id"
    ])
    for row in WEATHER_RECORDS:
        writer.writerow(row)

print(f"7. weather_events.csv created ({len(WEATHER_RECORDS)} records).")

# ==========================================
# 8. TRAFFIC INCIDENTS (OVER 14 DAYS - ~1,600 RECORDS)
# ==========================================
TRAFFIC_RECORDS = []
trf_id = 1

BOTTLENECK_LOCATIONS = [
    ("Malad Subway (East-West link)", 19.1862, 72.8462, "Malad Subway & SV Road Link"),
    ("Pathanwadi Flyover WEH (Southbound)", 19.1802, 72.8582, "Western Express Highway (Southbound)"),
    ("Mithchowki Junction (Link Road)", 19.2015, 72.8375, "New Link Road Kandivali"),
    ("JVLR Junction WEH Flyover", 19.1415, 72.8562, "Jogeshwari-Vikhroli Link Road / WEH"),
    ("Inorbit Mall Junction (Malad W Link Rd)", 19.1782, 72.8370, "New Link Road Malad"),
    ("Andheri Subway (East-West link)", 19.1215, 72.8445, "Andheri Subway Connector"),
]

for day_idx in range(14):
    sim_date = datetime(2026, 7, 15) + timedelta(days=day_idx)
    for step in range(20):
        t = datetime(sim_date.year, sim_date.month, sim_date.day, 7, 0, 0) + timedelta(minutes=step * 35)
        for loc_name, lat, lon, aff_rd in BOTTLENECK_LOCATIONS:
            # Correlate with active incidents on that day
            day_incidents = [inc for inc in INCIDENTS_CATALOG if inc["st_dt"].date() == sim_date.date() and inc["st_dt"] <= t <= inc["end_dt"]]
            
            near_inc = None
            for inc in day_incidents:
                dist = ((inc["lat"] - lat)**2 + (inc["lon"] - lon)**2)**0.5 * 111.0
                if dist < inc["radius_km"]:
                    near_inc = inc
                    break
            
            if near_inc:
                cong = "Standstill" if "CRITICAL" in near_inc["severity_level"] else "Heavy Congestion"
                itype = near_inc["scenario"]
                rstat = "Completely Closed" if "Flooding" in itype and "Subway" in loc_name else "Partially Blocked"
                spd = round(random.uniform(2.5, 9.0), 1)
                del_m = round(random.uniform(25.0, 50.0), 1)
            else:
                cong = "Moderate" if (8 <= t.hour <= 10 or 17 <= t.hour <= 19) else "Smooth"
                itype = "Routine Traffic Flow"
                rstat = "Normal Operations"
                spd = round(random.uniform(28.0, 50.0), 1)
                del_m = round(random.uniform(2.0, 8.0), 1)

            TRAFFIC_RECORDS.append([
                f"TRF_{trf_id:05d}", t.strftime("%Y-%m-%d %H:%M:%S"), loc_name,
                lat, lon, cong, itype, rstat, spd, del_m, aff_rd
            ])
            trf_id += 1

with open(os.path.join(DATASET_DIR, "traffic_incidents.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "traffic_incident_id", "timestamp", "location_name", "latitude", "longitude",
        "congestion_level", "incident_type", "road_status", "average_speed_kmh",
        "estimated_delay_min", "affected_road"
    ])
    for row in TRAFFIC_RECORDS:
        writer.writerow(row)

print(f"8. traffic_incidents.csv created ({len(TRAFFIC_RECORDS)} records).")

# ==========================================
# 9. PUBLIC TRANSPORT STATUS (OVER 14 DAYS - ~1,500 RECORDS)
# ==========================================
PUB_TRANS_RECORDS = []
pts_id = 1

REAL_WR_TRAIN_IDS = [
    ("90142", "Virar - Churchgate Fast"), ("90150", "Borivali - Churchgate Slow"),
    ("90158", "Borivali - Churchgate Fast"), ("90166", "Bhayandar - Churchgate Fast"),
    ("90172", "Borivali - Churchgate AC Fast"), ("90180", "Borivali - Churchgate Slow"),
    ("90188", "Virar - Churchgate Fast"), ("90194", "Borivali - Churchgate Fast"),
    ("90202", "Borivali - Churchgate Slow"), ("90210", "Dahanu Road - Churchgate Fast"),
    ("90218", "Borivali - Churchgate Fast"), ("90226", "Borivali - Churchgate Slow"),
    ("90234", "Virar - Churchgate Fast"), ("90242", "Borivali - Churchgate Fast")
]

for day_idx in range(14):
    sim_date = datetime(2026, 7, 15) + timedelta(days=day_idx)
    # Check if there is WR disruption on this day
    day_rail_inc = [inc for inc in INCIDENTS_CATALOG if inc["st_dt"].date() == sim_date.date() and ("Submergence" in inc["title"] or "Traction" in inc["title"] or "Track Circuit" in inc["title"])]
    
    for tr_id, tr_desc in REAL_WR_TRAIN_IDS:
        sched_hr = 7 + (int(tr_id[-2:]) % 3)
        sched_mn = int(tr_id[-2:]) * 2 % 60
        t_sched = datetime(sim_date.year, sim_date.month, sim_date.day, sched_hr, sched_mn, 0)
        
        # Check disruption active during train run
        active_inc = next((inc for inc in day_rail_inc if inc["st_dt"] <= t_sched <= inc["end_dt"]), None)
        if active_inc:
            del_m = random.randint(28, 55)
            stat = "Suspended / Halted at Outer Signal" if del_m > 45 else "Delayed / Regulated at Kandivali"
            is_c = True if del_m > 48 else False
            desc = f"{active_inc['known_cause']} in Borivali-Malad corridor"
        else:
            del_m = random.randint(1, 6)
            stat = "Running Normally"
            is_c = False
            desc = "Routine punctuality nominal"

        PUB_TRANS_RECORDS.append([
            f"PTS_{pts_id:05d}", t_sched.strftime("%Y-%m-%d %H:%M:%S"), "Western Railway Suburban",
            "WR_MAIN_LINE", tr_id, f"Borivali - Malad - Andheri Section ({tr_desc})",
            19.1868, 72.8488, stat, del_m, is_c, desc
        ])
        pts_id += 1

    # Metro Lines 2A & 7 & 1 daily runs
    for m_line, m_name, lat, lon in [("METRO_2A", "Line 2A (Yellow Line)", 19.1865, 72.8380), ("METRO_7", "Line 7 (Red Line)", 19.1725, 72.8578), ("METRO_1", "Line 1 (Blue Line)", 19.1308, 72.8322)]:
        for m_step in range(4):
            t_m = datetime(sim_date.year, sim_date.month, sim_date.day, 8, 0, 0) + timedelta(minutes=m_step * 20)
            m_del = random.randint(1, 4)
            PUB_TRANS_RECORDS.append([
                f"PTS_{pts_id:05d}", t_m.strftime("%Y-%m-%d %H:%M:%S"), m_name,
                m_line, f"{m_line}_RAKE_{m_step+1:02d}", f"{m_name} Corridor",
                lat, lon, "Running Normally (Resilient Elevated Viaduct)", m_del, False,
                "Elevated viaduct unaffected by surface waterlogging"
            ])
            pts_id += 1

with open(os.path.join(DATASET_DIR, "public_transport_status.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "status_id", "timestamp", "transport_mode", "line_or_route_id", "train_or_vehicle_id",
        "station_or_segment", "latitude", "longitude", "service_status", "delay_min",
        "cancellation_flag", "cause_description"
    ])
    for row in PUB_TRANS_RECORDS:
        writer.writerow(row)

print(f"9. public_transport_status.csv created ({len(PUB_TRANS_RECORDS)} records).")

# ==========================================
# 10. CENTRAL STREAM & GROUND TRUTH (EXPANDED TO ~3,200 EVENTS)
# ==========================================
URBAN_EVENTS = []
GROUND_TRUTH_MAPPING = []
evt_counter = 1

def add_event(source, event_dt, lag_sec, loc_name, lat, lon, evt_type, val, rel, is_dup, is_contra, text,
              inc_id, scen_type, rel_status, lab_type, cause):
    global evt_counter
    evt_id = f"EVT_{evt_counter:05d}"
    recv_dt = event_dt + timedelta(seconds=lag_sec)
    
    URBAN_EVENTS.append([
        evt_id, source, event_dt.strftime("%Y-%m-%d %H:%M:%S"), recv_dt.strftime("%Y-%m-%d %H:%M:%S"),
        loc_name, lat, lon, evt_type, val, rel, is_dup, is_contra, text
    ])
    
    GROUND_TRUTH_MAPPING.append([
        evt_id, inc_id, scen_type, rel_status, lab_type, cause
    ])
    evt_counter += 1

# For each of the 48 incidents, generate 45-65 multimodal heterogeneous events:
# (sensor reading, loco telemetry, citizen tweets, emergency CAD calls, CCTV radar)
# Include out-of-order received timestamps, duplicates, and contradictory observations!
for inc in INCIDENTS_CATALOG:
    inc_id = inc["incident_id"]
    scen = inc["scenario"]
    st = inc["st_dt"]
    c_lat, c_lon = inc["lat"], inc["lon"]
    cause = inc["known_cause"]

    # 1. Parent Trigger Event
    if "Flooding" in scen:
        add_event("BMC_FLD_MALAD_SUB", st, 15, "Malad Subway Invert", c_lat, c_lon, "WATERLOGGING_DEPTH", "68 cm", 0.99, False, False, f"Automatic sensor: Invert water level {68}cm. Flood pumps triggered.", inc_id, scen, "PARENT_TRIGGER", "Waterlogging Inundation", cause)
    elif "Accident" in scen:
        add_event("MTP_RADAR_WEH_PATHAN", st, 20, "WEH Flyover North/South", c_lat, c_lon, "SPEED_COLLAPSE", "Speed dropped from 48 km/h to 3 km/h", 0.96, False, False, "Sudden deceleration anomaly across 2 lanes on flyover peak.", inc_id, scen, "PARENT_TRIGGER", "Traffic Crash Blockage", cause)
    elif "Disruption" in scen:
        add_event("WR_OHE_SCADA_BVI", st, 10, "Substation Traction Feeder", c_lat, c_lon, "TRACTION_POWER_LOSS", "25kV Feeder Trip 0V", 0.99, False, False, "SCADA Alarm: Breaker tripped on high transient surge.", inc_id, scen, "PARENT_TRIGGER", "Traction Power Failure", cause)
    else:
        add_event("MTP_RADAR_LINK_MITH", st, 25, "Mithchowki Signal Controller", c_lat, c_lon, "SIGNAL_POWER_OUTAGE", "Traffic controller offline 0V", 0.96, False, False, "Underground phase lost; junction signal dark.", inc_id, scen, "PARENT_TRIGGER", "Traffic Light Dark", cause)

    # 2. Primary Observations (10 to 15 events over the episode duration)
    num_primary = random.randint(12, 18)
    for p in range(num_primary):
        p_dt = st + timedelta(minutes=p * 5 + random.randint(1, 4))
        lag = random.randint(10, 450)  # Up to 7.5 mins delivery lag
        lat_o = round(c_lat + random.uniform(-0.005, 0.005), 4)
        lon_o = round(c_lon + random.uniform(-0.005, 0.005), 4)
        
        if "Flooding" in scen:
            val = f"{round(random.uniform(50, 110), 1)} cm water depth"
            txt = f"BMC depth gauge / track float: {val}. Pumping operations ongoing."
            src = random.choice(["BMC_FLD_MALAD_SUB", "WR_TRK_FLD_MDD", "BMC_AWS_MALAD"])
            etype = "WATERLOGGING_MEASUREMENT"
        elif "Accident" in scen:
            val = f"{round(random.uniform(3.0, 8.0), 1)} km/h"
            txt = f"Radar R-{p}: Severe bottleneck velocity {val}. Tailback extends 2.5km."
            src = "MTP_RADAR_WEH_PATHAN"
            etype = "RADAR_SPEED_DROP"
        elif "Disruption" in scen:
            val = f"Delayed by {random.randint(25, 55)} mins"
            txt = f"WR Loco telemetry: train held at outer signal due to signalling aspect red."
            src = "WR_LOCO_TELEMETRY"
            etype = "TRAIN_LOCO_HALT"
        else:
            val = "Box blockage index 0.92"
            txt = f"CCTV AI stream: 4-way conflict deadlock without signal lights."
            src = "MTP_RADAR_LINK_MITH"
            etype = "INTERSECTION_DEADLOCK"

        add_event(src, p_dt, lag, "Incident Impact Zone", lat_o, lon_o, etype, val, 0.95, False, False, txt, inc_id, scen, "PRIMARY_OBSERVATION", f"{scen} Observation", cause)

    # 3. Correlated Effects (Secondary impacts: 112 calls, traffic diversion: 10 to 15 events)
    num_corr = random.randint(10, 15)
    for c in range(num_corr):
        c_dt = st + timedelta(minutes=c * 6 + 10)
        lag = random.randint(30, 600)
        add_event(
            random.choice(["EMERGENCY_112_CAD", "CITIZEN_SOCIAL_STREAM", "MTP_RADAR_WEH_JVLR"]),
            c_dt, lag, "Correlated Spillover Zone",
            round(c_lat + random.uniform(-0.008, 0.008), 4), round(c_lon + random.uniform(-0.008, 0.008), 4),
            "CORRELATED_SPILLOVER", "Downstream Congestion / Transit Delay", 0.88, False, False,
            f"112 / Police dispatch: Traffic diversion and emergency vehicle transit requested for {inc_id}.",
            inc_id, scen, "CORRELATED_EFFECT", "Secondary Disruption", cause
        )

    # 4. Duplicate Citizen Reports (10 to 15 events)
    num_dup = random.randint(10, 15)
    for d in range(num_dup):
        d_dt = st + timedelta(minutes=d * 4 + 8)
        lag = random.randint(120, 900)  # Up to 15 min citizen report lag!
        add_event(
            "CITIZEN_SOCIAL_STREAM", d_dt, lag, "Local Neighborhood",
            round(c_lat + random.uniform(-0.004, 0.004), 4), round(c_lon + random.uniform(-0.004, 0.004), 4),
            "CITIZEN_REPORT_TEXT", "Severe delay / blockage reported", 0.65, True, False,
            f"@mumbaitrafficpolice Huge issue near {inc['affected_infra'][:30]}! Stuck here for 40 mins!",
            inc_id, scen, "DUPLICATE_REPORT", "Crowdsourced Feedback", cause
        )

    # 5. Contradictory Evidence (3 to 5 events - crucial for Feature 4 & 7: contradict assessment)
    for k in range(random.randint(3, 5)):
        k_dt = st + timedelta(minutes=k * 15 + 12)
        lag = random.randint(60, 400)
        add_event(
            "CITIZEN_SOCIAL_STREAM", k_dt, lag, "Periphery Zone",
            round(c_lat + random.uniform(-0.005, 0.005), 4), round(c_lon + random.uniform(-0.005, 0.005), 4),
            "CONTRADICTORY_CLAIM", "Claiming clear road / on-time train", 0.42, True, True,
            f"No traffic at all near {inc['affected_infra'][:25]}, road is totally clear guys!",
            inc_id, scen, "CONTRADICTORY_NOISE", "False Normal Status", "Unreliable spectator noise"
        )

# Add 250 Unrelated Background Noise Events
for b in range(250):
    b_day = random.randint(0, 13)
    b_dt = datetime(2026, 7, 15) + timedelta(days=b_day, hours=random.randint(6, 21), minutes=random.randint(0, 59))
    b_node = random.choice(ROAD_NODES)
    add_event(
        random.choice(["BMC_AWS_ANDHERI_W", "MTP_RADAR_WEH_JVLR", "MMRDA_METRO_OCC_2A", "CITIZEN_SOCIAL_STREAM"]),
        b_dt, random.randint(10, 180), b_node["name"], b_node["lat"], b_node["lon"],
        "ROUTINE_BACKGROUND_TELEMETRY", "Nominal Speed / Clear Skies", 0.95, False, False,
        f"Routine reading at {b_node['name']}. Normal traffic and environmental parameters.",
        "INC_NONE", "None", "UNRELATED_BACKGROUND", "Nominal Activity", "Routine urban telemetry"
    )

with open(os.path.join(DATASET_DIR, "urban_incident_events.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "event_id", "source", "event_timestamp", "received_timestamp", "location_name",
        "latitude", "longitude", "event_type", "measured_value", "source_reliability",
        "is_duplicate", "contradiction_flag", "raw_text_payload"
    ])
    for row in URBAN_EVENTS:
        writer.writerow(row)

print(f"10. urban_incident_events.csv created ({len(URBAN_EVENTS)} events).")

with open(os.path.join(DATASET_DIR, "incident_ground_truth.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "event_id", "ground_truth_incident_id", "scenario_type", "relationship_status",
        "labelled_incident_type", "known_or_suspected_cause"
    ])
    for row in GROUND_TRUTH_MAPPING:
        writer.writerow(row)

print(f"11. incident_ground_truth.csv created ({len(GROUND_TRUTH_MAPPING)} rows).")

# ==========================================
# 11. ROUTE IMPACT LABELS (OVER 800 LABELED SCENARIOS)
# ==========================================
ROUTE_IMPACTS = []
imp_id = 1

for inc in INCIDENTS_CATALOG:
    # Check impact on each user route
    for route in ROUTES_DATA:
        r_id = route[0]
        u_id = route[1]
        mode = route[2]
        r_lat, r_lon = route[7], route[8]
        dist = ((inc["lat"] - r_lat)**2 + (inc["lon"] - r_lon)**2)**0.5 * 111.0

        if dist < inc["radius_km"] + 1.0:
            if "CRITICAL" in inc["severity_level"] and ("Flooding" in inc["scenario"] or "Accident" in inc["scenario"]):
                status = "BLOCKED / CRITICAL_DELAY"
                delay = round(random.uniform(40.0, 70.0), 1)
                lbl = "HIGH_DISRUPTION"
            else:
                status = "HEAVY_DELAY"
                delay = round(random.uniform(20.0, 42.0), 1)
                lbl = "MODERATE_HIGH_DISRUPTION"
            conf = round(inc["confidence_score"] - random.uniform(0.01, 0.05), 2)
            ROUTE_IMPACTS.append([
                f"IMP_{imp_id:05d}", u_id, inc["incident_id"], r_id, status, delay, conf, lbl
            ])
            imp_id += 1

# If fewer than 850 impacts, supplement with resilient unaffected routes (MINIMAL_IMPACT)
for u in USERS[:15]:
    for inc in INCIDENTS_CATALOG[:20]:
        ROUTE_IMPACTS.append([
            f"IMP_{imp_id:05d}", u["user_id"], inc["incident_id"], "RT_USR001_METRO_2A", "CLEAR / MINIMAL_DELAY",
            round(random.uniform(2.0, 5.0), 1), 0.96, "MINIMAL_IMPACT"
        ])
        imp_id += 1

with open(os.path.join(DATASET_DIR, "route_impact_labels.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "impact_id", "user_id", "incident_id", "route_id", "affected_status",
        "expected_delay_min", "confidence_score", "impact_label"
    ])
    for row in ROUTE_IMPACTS:
        writer.writerow(row)

print(f"12. route_impact_labels.csv created ({len(ROUTE_IMPACTS)} records).")

# ==========================================
# 12. ROUTE RECOMMENDATIONS (OVER 450 SCENARIOS)
# ==========================================
RECOMMENDATIONS = []
rec_id = 1

for imp in ROUTE_IMPACTS:
    if ("DISRUPTION" in imp[7]) and rec_id <= 600:
        u_id = imp[1]
        inc_id = imp[2]
        r_id = imp[3]
        delay = float(imp[5])
        
        if "TRAIN" in r_id:
            plan_m = "Western Railway Suburban Local"
            rec_m = "Metro Line 2A (Dahisar-DN Nagar) + Metro Line 1"
            rec_r = "RT_USR001_METRO_2A"
            norm_t = 44.0
            rec_t = 50.0
            trf = "Walk/Auto to Borivali West Metro -> Metro Line 2A to D.N. Nagar -> Auto to Campus"
            expl = f"Western Railway tracks disrupted by incident {inc_id}. High waterlogging on rails; switch to elevated Metro Line 2A for safe, on-time lecture arrival."
        elif "WEH" in r_id:
            plan_m = "Bike via Western Express Highway"
            rec_m = "Bike via New Link Road (Shimpoli-Mithchowki)"
            rec_r = "RT_USR001_BIKE_LINK"
            norm_t = 52.0
            rec_t = 54.0
            trf = "Divert from Ashokvan via Shimpoli to New Link Road -> South towards Versova"
            expl = f"Expressway heavily congested due to {inc_id}. Reroute via New Link Road or take Metro Line 2A to save {round(max(5.0, delay - 12))} minutes."
        elif "SUBWAY" in r_id:
            plan_m = "Road Vehicle via Subway"
            rec_m = "Metro Line 2A Elevated Transit"
            rec_r = "RT_USR002_METRO"
            norm_t = 35.0
            rec_t = 26.0
            trf = "Board Metro 2A at Kandivali West -> Pahadi Goregaon -> Auto to destination"
            expl = f"Subway waterlogged and impassable ({inc_id}). Abandon surface road; elevated Metro is running on schedule."
        else:
            plan_m = "Surface Road Transport"
            rec_m = "Metro Line 7 (Elevated WEH Corridor)"
            rec_r = "RT_USR001_METRO_7_1"
            norm_t = 40.0
            rec_t = 38.0
            trf = "National Park Metro 7 -> Gundavali -> Line 1"
            expl = f"Road traffic gridlocked by {inc_id}. Elevated Metro Line 7 provides unaffected travel."

        disr_t = norm_t + delay
        saved_t = round(disr_t - rec_t, 1)

        RECOMMENDATIONS.append([
            f"REC_{rec_id:05d}", u_id, inc_id, "Ashokvan, Borivali East", "RGIT Versova / Suburban Destination",
            plan_m, r_id, norm_t, disr_t, rec_m, rec_r, rec_t, saved_t, trf, expl
        ])
        rec_id += 1

with open(os.path.join(DATASET_DIR, "route_recommendations.csv"), "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow([
        "recommendation_id", "user_id", "active_incident_ids", "origin", "destination",
        "planned_mode", "planned_route_id", "planned_normal_travel_time_min", "planned_disrupted_travel_time_min",
        "recommended_mode", "recommended_route_id", "recommended_travel_time_min", "time_saved_min",
        "transfer_points", "operator_explanation"
    ])
    for row in RECOMMENDATIONS:
        writer.writerow(row)

print(f"13. route_recommendations.csv created ({len(RECOMMENDATIONS)} records).")
print("\n>>> ALL 13 DATASETS FULLY EXPANDED AND SYNCHRONIZED FOR ML TRAINING! <<<")
