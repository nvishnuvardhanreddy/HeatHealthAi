import os
import sys
import django

sys.path.insert(0, os.path.abspath('backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client

client = Client()

endpoints = [
    ('/', 200, 'HTML Frontend'),
    ('/style.css', 200, 'CSS Stylesheet'),
    ('/app.js', 200, 'JS Application'),
    ('/health', 200, 'Health check'),
    ('/api/health/', 200, 'API Health check'),
    ('/geocode?q=Visakhapatnam', 200, 'Geocode search'),
    ('/geocode?q=Kakinada', 200, 'Geocode search Kakinada'),
    ('/reverse-geocode?latitude=17.6868&longitude=83.2185', 200, 'Reverse geocode'),
    ('/risk?latitude=17.6868&longitude=83.2185&location=Visakhapatnam', 200, 'Live Risk Calculation'),
    ('/forecast?latitude=17.6868&longitude=83.2185', 200, '5-Day Forecast'),
    ('/hourly?latitude=17.6868&longitude=83.2185', 200, '48-Hour Hourly'),
    ('/hotspots?latitude=17.6868&longitude=83.2185', 200, 'Ward Hotspots'),
    ('/impact-forecast?latitude=17.6868&longitude=83.2185&location=Visakhapatnam', 200, 'Human Impact Forecast'),
    ('/vulnerability?latitude=17.6868&longitude=83.2185&location=Visakhapatnam', 200, 'Vulnerability Matrix'),
    ('/action-plan?latitude=17.6868&longitude=83.2185&htsi=85.2&priority=CRITICAL&mortality=35&hospitalization=45&population=48200', 200, 'Heat Action Plan'),
    ('/emergency-priority?latitude=17.6868&longitude=83.2185&location=Visakhapatnam&htsi=85.2', 200, 'Emergency Prioritisation'),
    ('/simulate?temperature=42&humidity=75&wind=1.5&solar=850', 200, 'What-If Simulation GET'),
]

print("=" * 70)
print("TESTING ALL UNIFIED HEATHEALTHAI ENDPOINTS")
print("=" * 70)

all_passed = True
for url, expected_status, label in endpoints:
    try:
        resp = client.get(url)
        is_ok = resp.status_code == expected_status
        status_str = f"[{'PASS' if is_ok else 'FAIL'}]"
        print(f"{status_str} {label:30} -> {url[:45]:45} (HTTP {resp.status_code})")
        if not is_ok:
            all_passed = False
            print(f"       Response content: {resp.content[:300]}")
    except Exception as e:
        print(f"[FAIL] {label:30} -> {url[:45]:45} Exception: {e}")
        all_passed = False

# Also test POST simulation
try:
    resp_post = client.post('/simulate', data={'temperature': 41.5, 'humidity': 72.0, 'wind': 2.0, 'solar': 780.0}, content_type='application/json')
    is_ok = resp_post.status_code == 200
    print(f"[{'PASS' if is_ok else 'FAIL'}] {'What-If Simulation POST':30} -> {'/simulate':45} (HTTP {resp_post.status_code})")
    if not is_ok:
        all_passed = False
except Exception as e:
    print(f"[FAIL] What-If Simulation POST Exception: {e}")
    all_passed = False

print("=" * 70)
if all_passed:
    print(">>> ALL UNIFIED ENDPOINTS TESTED SUCCESSFULLY! 100% OPERATIONAL <<<")
else:
    print(">>> SOME ENDPOINTS FAILED. CHECK DETAILS ABOVE. <<<")
print("=" * 70)
