import os
import sys
import json
import django

sys.path.insert(0, os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

client = Client()

print("=" * 80)
print("COMPREHENSIVE VERIFICATION FOR MERGED HEATHEALTHAI PROJECT")
print("=" * 80)

# 1. Test Root and Static Assets
resp_html = client.get('/')
assert resp_html.status_code == 200, f"HTML status: {resp_html.status_code}"
assert b"HeatHealthAI" in resp_html.content, "HTML missing branding"
assert b"analysisForm" in resp_html.content, "HTML missing analysisForm"
assert b"simulateBtn" in resp_html.content, "HTML missing simulateBtn"
print("[OK] Dashboard 1 Frontend HTML loads with complete UI components.")

resp_css = client.get('/style.css')
assert resp_css.status_code == 200, f"CSS status: {resp_css.status_code}"
assert len(resp_css.content) > 10000, "CSS content too small"
print("[OK] Dashboard 1 Complete CSS Stylesheet loads.")

resp_js = client.get('/app.js')
assert resp_js.status_code == 200, f"JS status: {resp_js.status_code}"
assert b"analyzeLocation" in resp_js.content, "JS missing analyzeLocation"
print("[OK] Dashboard 1 Complete JS Application loads.")

# 2. Test Geocoding for multiple Indian cities
cities = ["Visakhapatnam", "Kakinada", "Hyderabad", "Delhi", "Mumbai"]
for city in cities:
    resp = client.get(f'/geocode?q={city}')
    assert resp.status_code == 200, f"Geocode status for {city}: {resp.status_code}"
    data = resp.json()
    assert data.get("found") is True, f"Geocode found is false for {city}"
    print(f"[OK] Geocode: {city} -> lat={data['latitude']}, lon={data['longitude']}, name={data['name']}")

# 3. Test Live Risk API
resp_risk = client.get('/risk?latitude=17.6868&longitude=83.2185&location=Visakhapatnam')
assert resp_risk.status_code == 200, f"Risk status: {resp_risk.status_code}"
risk_data = resp_risk.json()
assert "risk" in risk_data, "Missing risk block"
assert "thermal" in risk_data, "Missing thermal block"
assert "environment" in risk_data, "Missing environment block"
assert "health" in risk_data, "Missing health block"
assert "alert" in risk_data, "Missing alert block"
assert "drivers" in risk_data and len(risk_data["drivers"]) >= 5, "Missing drivers"
print(f"[OK] Live Risk: HTSI={risk_data['risk']['score']}, Level={risk_data['risk']['level']}, WBGT={risk_data['thermal']['wbgt']}C, Mortality={risk_data['health']['mortality']}%, Hosp={risk_data['health']['hospitalization']}%")

# 4. Test 5-Day Forecast API
resp_fc = client.get('/forecast?latitude=17.6868&longitude=83.2185')
assert resp_fc.status_code == 200, f"Forecast status: {resp_fc.status_code}"
fc_data = resp_fc.json()
assert "forecast" in fc_data and len(fc_data["forecast"]) == 5, "Forecast does not have 5 days"
print(f"[OK] 5-Day Forecast: 5 days returned. Day 1 Temp={fc_data['forecast'][0]['temperature']}C, HTSI={fc_data['forecast'][0]['htsi']}")

# 5. Test 48-Hour Hourly API
resp_hr = client.get('/hourly?latitude=17.6868&longitude=83.2185')
assert resp_hr.status_code == 200, f"Hourly status: {resp_hr.status_code}"
hr_data = resp_hr.json()
assert "hourly" in hr_data and len(hr_data["hourly"]) >= 24, "Hourly missing 24+ records"
print(f"[OK] Hourly Forecast: {len(hr_data['hourly'])} hours returned. H1 Temp={hr_data['hourly'][0]['temperature']}C, WBGT={hr_data['hourly'][0]['wbgt']}C, HTSI={hr_data['hourly'][0]['htsi']}")

# 6. Test Hotspots API
resp_hs = client.get('/hotspots?latitude=17.6868&longitude=83.2185')
assert resp_hs.status_code == 200, f"Hotspots status: {resp_hs.status_code}"
hs_data = resp_hs.json()
assert "hotspots" in hs_data and len(hs_data["hotspots"]) >= 5, "Hotspots missing records"
print(f"[OK] Hotspots: {len(hs_data['hotspots'])} hotspots identified. Top={hs_data['hotspots'][0]['name']}, HTSI={hs_data['hotspots'][0]['htsi']}")

# 7. Test Impact Forecast API
resp_if = client.get('/impact-forecast?latitude=17.6868&longitude=83.2185&location=Visakhapatnam')
assert resp_if.status_code == 200, f"Impact forecast status: {resp_if.status_code}"
if_data = resp_if.json()
assert "trend" in if_data and "direction" in if_data["trend"], "Missing trend direction"
assert "peak" in if_data, "Missing peak data"
assert "forecast" in if_data and len(if_data["forecast"]) == 5, "Missing 5-day impact data"
print(f"[OK] Impact Forecast: Trend={if_data['trend']['direction']} ({if_data['trend']['change']:+} HTSI), Peak Day={if_data['peak']['label']} ({if_data['peak']['htsi']} HTSI)")

# 8. Test Vulnerability API
resp_vuln = client.get('/vulnerability?latitude=17.6868&longitude=83.2185&location=Visakhapatnam')
assert resp_vuln.status_code == 200, f"Vulnerability status: {resp_vuln.status_code}"
vuln_data = resp_vuln.json()
areas = vuln_data.get("areas", [])
assert len(areas) >= 5, "Vulnerability areas missing"
print(f"[OK] Vulnerability: {len(areas)} areas evaluated. Top area={areas[0]['name']}, Score={areas[0]['priority_score']}, Elderly={areas[0]['elderly_percent']}%, OutdoorWorkers={areas[0]['outdoor_worker_percent']}%")

# 9. Test Action Plan API
resp_ap = client.get('/action-plan?latitude=17.6868&longitude=83.2185&htsi=85.0&priority=CRITICAL&mortality=35.0&hospitalization=45.0&population=48200')
assert resp_ap.status_code == 200, f"Action Plan status: {resp_ap.status_code}"
ap_data = resp_ap.json()
assert ap_data["activation_level"] == "ACTIVATE", f"Activation level unexpected: {ap_data['activation_level']}"
assert len(ap_data["actions"]) >= 3, "Missing action plan directives"
print(f"[OK] Heat Action Plan: Level={ap_data['activation_level']}, Trigger HTSI={ap_data['trigger_htsi']}, Pop={ap_data['estimated_population']}, Actions Count={len(ap_data['actions'])}")

# 10. Test Emergency Priority API
resp_ep = client.get('/emergency-priority?latitude=17.6868&longitude=83.2185&location=Visakhapatnam&htsi=85.0')
assert resp_ep.status_code == 200, f"Emergency Priority status: {resp_ep.status_code}"
ep_data = resp_ep.json()
assert len(ep_data.get("areas", [])) >= 5, "Missing emergency priority areas"
print(f"[OK] Emergency Priority: {len(ep_data['areas'])} areas ranked. Rank 1={ep_data['areas'][0]['name']}, Score={ep_data['areas'][0]['priority_score']}")

# 11. Test What-If Simulation API (GET & POST)
resp_sim_get = client.get('/simulate?temperature=42&humidity=75&wind=1.5&solar=850')
assert resp_sim_get.status_code == 200, f"Sim GET status: {resp_sim_get.status_code}"
sim_get_data = resp_sim_get.json()
assert sim_get_data["risk"] == "EXTREME", f"Sim GET risk unexpected: {sim_get_data['risk']}"
print(f"[OK] What-If Simulation GET: HTSI={sim_get_data['htsi']}, Risk={sim_get_data['risk']}, WBGT={sim_get_data['wbgt']}C, Mortality={sim_get_data['health']['mortality']}%, Hosp={sim_get_data['health']['hospitalization']}%")

resp_sim_post = client.post('/simulate', data={'temperature': 42.0, 'humidity': 75.0, 'wind': 1.5, 'solar': 850.0}, content_type='application/json')
assert resp_sim_post.status_code == 200, f"Sim POST status: {resp_sim_post.status_code}"
sim_post_data = resp_sim_post.json()
assert sim_post_data["risk"] == "EXTREME", f"Sim POST risk unexpected: {sim_post_data['risk']}"
print(f"[OK] What-If Simulation POST: HTSI={sim_post_data['htsi']}, Risk={sim_post_data['risk']}, Message={sim_post_data['message'][:50]}...")

# 12. Test System Health Status
resp_health = client.get('/health')
assert resp_health.status_code == 200, f"Health status: {resp_health.status_code}"
health_data = resp_health.json()
assert health_data["status"] == "ok", f"Health status not ok: {health_data['status']}"
assert health_data["database"] == "connected", "DB not connected"
assert health_data["ml_model"] == "loaded", "ML not loaded"
print(f"[OK] System Health: Status={health_data['status']}, Database={health_data['database']}, ML Model={health_data['ml_model']} ({health_data['model_name']})")

print("=" * 80)
print(">>> ALL 12 INTEGRATION CHECKS PASSED WITH 100% ACCURACY! <<<")
print("================================================================================")
