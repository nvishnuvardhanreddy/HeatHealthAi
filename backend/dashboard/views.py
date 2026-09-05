from django.conf import settings
from django.db import connection
from rest_framework import status, views, permissions
from rest_framework.response import Response

INDIA_CITIES = [
    # (lat, lon, city_name, state, category)
    # Metros & Capital Regions
    (28.6139, 77.2090, 'New Delhi', 'Delhi'),
    (19.0760, 72.8777, 'Mumbai', 'Maharashtra'),
    (12.9716, 77.5946, 'Bengaluru', 'Karnataka'),
    (22.5726, 88.3639, 'Kolkata', 'West Bengal'),
    (17.3850, 78.4867, 'Hyderabad', 'Telangana'),
    (13.0827, 80.2707, 'Chennai', 'Tamil Nadu'),
    (23.0225, 72.5714, 'Ahmedabad', 'Gujarat'),
    (18.5204, 73.8567, 'Pune', 'Maharashtra'),

    # Andhra Pradesh & Telangana
    (17.6868, 83.2185, 'Visakhapatnam', 'Andhra Pradesh'),
    (16.5062, 80.6480, 'Vijayawada', 'Andhra Pradesh'),
    (16.3067, 80.4365, 'Guntur', 'Andhra Pradesh'),
    (15.8281, 78.0373, 'Kurnool', 'Andhra Pradesh'),
    (14.6819, 77.6006, 'Anantapur', 'Andhra Pradesh'),
    (14.4673, 78.8242, 'Kadapa', 'Andhra Pradesh'),
    (15.4889, 78.4836, 'Nandyal', 'Andhra Pradesh'),
    (14.4426, 79.9865, 'Nellore', 'Andhra Pradesh'),
    (17.0005, 81.8040, 'Rajahmundry', 'Andhra Pradesh'),
    (16.9891, 82.2475, 'Kakinada', 'Andhra Pradesh'),
    (16.5500, 79.5500, 'Rentachintala', 'Andhra Pradesh'), # Historic heat hotspot
    (17.9689, 79.5941, 'Warangal', 'Telangana'),
    (18.7562, 79.5139, 'Ramagundam', 'Telangana'), # Coal basin heat pocket
    (18.4386, 79.1288, 'Karimnagar', 'Telangana'),
    (17.2473, 80.1514, 'Khammam', 'Telangana'),
    (19.6641, 78.5320, 'Adilabad', 'Telangana'),

    # Northern & Northwestern Arid / Heat Hotspots
    (27.1311, 72.3644, 'Phalodi', 'Rajasthan'), # Recorded 51.0°C
    (28.2900, 74.9600, 'Churu', 'Rajasthan'), # Extreme desert temperature swings
    (25.7521, 71.3967, 'Barmer', 'Rajasthan'), # Thar desert boundary
    (26.9157, 70.9083, 'Jaisalmer', 'Rajasthan'),
    (26.2389, 73.0243, 'Jodhpur', 'Rajasthan'),
    (25.1800, 75.8300, 'Kota', 'Rajasthan'),
    (26.4499, 74.6399, 'Ajmer', 'Rajasthan'),
    (28.0229, 73.3119, 'Bikaner', 'Rajasthan'),
    (26.9124, 75.7873, 'Jaipur', 'Rajasthan'),
    (24.5854, 73.7125, 'Udaipur', 'Rajasthan'),

    # Uttar Pradesh, Bihar, Jharkhand & Gangetic Plain
    (26.8467, 80.9462, 'Lucknow', 'Uttar Pradesh'),
    (26.4499, 80.3319, 'Kanpur', 'Uttar Pradesh'),
    (25.3176, 82.9739, 'Varanasi', 'Uttar Pradesh'),
    (25.4358, 81.8463, 'Prayagraj (Allahabad)', 'Uttar Pradesh'),
    (27.1767, 78.0081, 'Agra', 'Uttar Pradesh'),
    (25.4800, 80.3400, 'Banda', 'Uttar Pradesh'), # Bundelkhand heat core
    (25.4484, 78.5685, 'Jhansi', 'Uttar Pradesh'),
    (28.3670, 79.4304, 'Bareilly', 'Uttar Pradesh'),
    (28.8386, 78.7733, 'Moradabad', 'Uttar Pradesh'),
    (25.5941, 85.1376, 'Patna', 'Bihar'),
    (24.7914, 85.0002, 'Gaya', 'Bihar'),
    (26.1209, 85.3647, 'Muzaffarpur', 'Bihar'),
    (25.2425, 86.9842, 'Bhagalpur', 'Bihar'),
    (23.3441, 85.3096, 'Ranchi', 'Jharkhand'),
    (23.7957, 86.4304, 'Dhanbad', 'Jharkhand'),
    (24.0384, 84.0700, 'Medininagar (Daltonganj)', 'Jharkhand'), # Palamu drought zone

    # Central India & Vidarbha Heat Belt
    (21.1458, 79.0882, 'Nagpur', 'Maharashtra'),
    (19.9615, 79.2961, 'Chandrapur', 'Maharashtra'), # Coal & thermal industrial belt
    (20.7453, 78.6022, 'Wardha', 'Maharashtra'),
    (20.7002, 77.0082, 'Akola', 'Maharashtra'),
    (20.9320, 77.7523, 'Amravati', 'Maharashtra'),
    (22.7196, 75.8577, 'Indore', 'Madhya Pradesh'),
    (23.2599, 77.4126, 'Bhopal', 'Madhya Pradesh'),
    (23.1815, 79.9864, 'Jabalpur', 'Madhya Pradesh'),
    (26.2183, 78.1828, 'Gwalior', 'Madhya Pradesh'),
    (23.1765, 75.7885, 'Ujjain', 'Madhya Pradesh'),
    (21.2514, 81.6296, 'Raipur', 'Chhattisgarh'),
    (22.0797, 82.1409, 'Bilaspur', 'Chhattisgarh'),

    # Odisha & Eastern Heat Pockets
    (20.2961, 85.8245, 'Bhubaneswar', 'Odisha'),
    (20.4625, 85.8828, 'Cuttack', 'Odisha'),
    (20.3000, 83.1500, 'Titlagarh', 'Odisha'), # Legendary Tatapani cauldron
    (20.7100, 83.4800, 'Balangir', 'Odisha'),
    (20.8400, 85.1500, 'Angul', 'Odisha'),
    (21.4669, 83.9812, 'Sambalpur', 'Odisha'),

    # Western India & Gujarat
    (21.1702, 72.8311, 'Surat', 'Gujarat'),
    (22.3072, 73.1812, 'Vadodara', 'Gujarat'),
    (22.3039, 70.8022, 'Rajkot', 'Gujarat'),
    (23.2420, 69.6669, 'Bhuj (Kutch)', 'Gujarat'), # Rann of Kutch border

    # Southern India
    (11.0168, 76.9558, 'Coimbatore', 'Tamil Nadu'),
    (9.9252, 78.1198, 'Madurai', 'Tamil Nadu'),
    (10.7905, 78.7047, 'Tiruchirappalli', 'Tamil Nadu'),
    (11.6643, 78.1460, 'Salem', 'Tamil Nadu'),
    (8.7139, 77.7567, 'Tirunelveli', 'Tamil Nadu'),
    (9.2876, 79.3129, 'Rameswaram', 'Tamil Nadu'),
    (8.0883, 77.5385, 'Kanyakumari', 'Tamil Nadu'),
    (15.3173, 75.7139, 'Hubballi-Dharwad', 'Karnataka'),
    (12.2958, 76.6394, 'Mysuru', 'Karnataka'),
    (12.9141, 74.8560, 'Mangaluru', 'Karnataka'),
    (15.8497, 74.4977, 'Belagavi', 'Karnataka'),
    (15.1394, 76.9214, 'Ballari', 'Karnataka'),
    (10.8505, 76.2711, 'Thrissur', 'Kerala'),
    (8.5241, 76.9366, 'Thiruvananthapuram', 'Kerala'),
    (9.9312, 76.2673, 'Kochi', 'Kerala'),
    (11.2588, 75.7804, 'Kozhikode', 'Kerala'),

    # Northern Plains & Hills
    (30.7333, 76.7794, 'Chandigarh', 'Chandigarh'),
    (31.6340, 74.8723, 'Amritsar', 'Punjab'),
    (30.9010, 75.8573, 'Ludhiana', 'Punjab'),
    (31.3260, 75.5762, 'Jalandhar', 'Punjab'),
    (34.0837, 74.7973, 'Srinagar', 'Jammu & Kashmir'),
    (32.7266, 74.8570, 'Jammu', 'Jammu & Kashmir'),
    (34.1526, 77.5771, 'Leh', 'Ladakh'), # High altitude desert & UV
    (34.5539, 76.1349, 'Kargil', 'Ladakh'),
    (31.1048, 77.1734, 'Shimla', 'Himachal Pradesh'),
    (32.2432, 77.1892, 'Manali', 'Himachal Pradesh'),
    (30.3165, 78.0322, 'Dehradun', 'Uttarakhand'),

    # Northeast & Island Territories
    (26.1445, 91.7362, 'Guwahati', 'Assam'),
    (27.4728, 94.9120, 'Dibrugarh', 'Assam'),
    (25.2986, 91.7330, 'Cherrapunji', 'Meghalaya'), # High humidity thermal zone
    (25.5788, 91.8933, 'Shillong', 'Meghalaya'),
    (27.0844, 93.6053, 'Itanagar', 'Arunachal Pradesh'),
    (27.3389, 88.6065, 'Gangtok', 'Sikkim'),
    (23.8315, 91.2868, 'Agartala', 'Tripura'),
    (25.6751, 94.1086, 'Kohima', 'Nagaland'),
    (23.7271, 92.7176, 'Aizawl', 'Mizoram'),
    (11.6234, 92.7265, 'Port Blair', 'Andaman and Nicobar Islands'),
    (10.5667, 72.6417, 'Kavaratti', 'Lakshadweep'),
]

def _get_nearest_city(lat: float, lon: float) -> tuple[str, str]:
    """Return (city_name, state) for the nearest major Indian city."""
    best, best_dist = INDIA_CITIES[0], float('inf')
    for entry in INDIA_CITIES:
        d = (lat - entry[0]) ** 2 + (lon - entry[1]) ** 2
        if d < best_dist:
            best_dist = d
            best = entry
    return best[2], best[3]

from users.permissions import IsVerifiedAuthority, IsAdmin
from gis.models import Ward
from weather.providers import get_weather_provider, OpenMeteoProvider
from thermal.services import calculate_htsi
from predictions.services import get_model_status
from interventions.services import evaluate_emergency_priorities
from alerts.models import Alert
from users.models import User, GovernmentVerification

class HealthCheckView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        # 1. Database check
        db_status = "disconnected"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            db_status = "connected"
        except Exception:
            db_status = "error"

        # 2. Weather service check
        weather_status = "available"
        try:
            provider = get_weather_provider()
            weather_status = "available" if provider else "unavailable"
        except Exception:
            weather_status = "unavailable"

        # 3. ML Model check
        ml_meta = get_model_status()
        ml_status = "loaded" if ml_meta.get("loaded") else "unavailable"

        payload = {
            "status": "ok" if (db_status == "connected" and ml_status == "loaded") else "degraded",
            "database": db_status,
            "weather_service": weather_status,
            "ml_model": ml_status,
            "demo_mode": getattr(connection, 'demo_mode', True),
            "disclaimer": "HeatHealthAI Decision Support Prototype"
        }
        return Response(payload, status=status.HTTP_200_OK)


class CitizenDashboardView(views.APIView):
    """Aggregated endpoint for citizen dashboard view."""
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = float(request.query_params.get('lat', 17.6868))
        lon = float(request.query_params.get('lon', 83.2185))

        # Keep the curated Visakhapatnam scenario for the demo location, but
        # use coordinate-based live weather for other locations in India.
        demo_distance = ((lat - 17.6868) ** 2 + (lon - 83.2185) ** 2) ** 0.5
        if getattr(settings, 'INDIA_WIDE_MODE', True) or (getattr(settings, 'DEMO_MODE', True) and demo_distance > 1.0):
            provider = OpenMeteoProvider()
        else:
            provider = get_weather_provider()
        weather = provider.get_current_weather(lat, lon)
        forecast = provider.get_forecast(lat, lon)

        thermal = calculate_htsi(
            temperature_c=weather['temperature'],
            humidity_pct=weather['humidity'],
            wind_speed_ms=weather['wind_speed'],
            solar_radiation_wm2=weather.get('solar_radiation', 800.0),
            vulnerability_score=50.0
        )

        # Wards & Hotspots
        wards = Ward.objects.all().order_by('-current_htsi')
        hotspots = [
            {
                "name": w.name,
                "ward_id": w.ward_id,
                "htsi": w.current_htsi,
                "risk_level": w.current_risk,
                "population": w.population
            }
            for w in wards[:5]
        ]

        # Active alert for user
        active_alert = None
        if request.user and request.user.is_authenticated:
            alert = Alert.objects.filter(user=request.user).order_by('-created_at').first()
            if alert:
                active_alert = {
                    "id": alert.id,
                    "title": alert.title,
                    "risk_level": alert.risk_level,
                    "htsi": alert.htsi,
                    "message": alert.message,
                    "recommended_actions": alert.recommended_actions,
                    "created_at": alert.created_at.isoformat()
                }

        city_name, state_name = _get_nearest_city(lat, lon)
        return Response({
            "city": city_name,
            "state": state_name,
            "coordinates": {"latitude": lat, "longitude": lon},
            "scope": "India-wide coordinate weather",
            "current_weather": weather,
            "thermal_stress": thermal,
            "hotspots": hotspots,
            "hourly_48h": forecast.get("hourly", [])[:24],
            "daily_5d": forecast.get("daily", [])[:5],
            "active_alert": active_alert,
            "data_source": weather.get("source", "DEMO DATA"),
            "map_scope": "Visakhapatnam demo ward boundaries" if demo_distance <= 1.0 else "No local ward boundary dataset loaded for this location"
        }, status=status.HTTP_200_OK)


class AuthorityDashboardView(views.APIView):
    """Secured endpoint for Verified Government Authorities."""
    permission_classes = [IsVerifiedAuthority]

    def get(self, request):
        wards = Ward.objects.all()
        extreme_wards = wards.filter(current_htsi__gte=80.0)
        very_high_wards = wards.filter(current_htsi__gte=60.0, current_htsi__lt=80.0)

        total_population_at_risk = sum(w.population for w in wards if w.current_htsi >= 60.0)
        extreme_population = sum(w.population for w in extreme_wards)

        priorities = evaluate_emergency_priorities()

        return Response({
            "portal": "HEATHEALTHAI Government Authority Portal",
            "authority_status": "VERIFIED GOVERNMENT AUTHORITY",
            "official_user": request.user.email,
            "summary_metrics": {
                "total_wards_monitored": wards.count(),
                "extreme_risk_wards_count": extreme_wards.count(),
                "very_high_risk_wards_count": very_high_wards.count(),
                "population_exposed_high_risk": total_population_at_risk,
                "population_in_extreme_danger": extreme_population,
            },
            "extreme_wards": [
                {"name": w.name, "ward_id": w.ward_id, "htsi": w.current_htsi, "population": w.population}
                for w in extreme_wards
            ],
            "emergency_priorities": priorities[:5],
            "alert_statistics": {
                "total_alerts_issued_24h": Alert.objects.count(),
                "extreme_alerts_count": Alert.objects.filter(risk_level='EXTREME').count(),
            },
            "security_note": "Government authority users cannot view exact GPS locations or private individual citizen profiles. Aggregated ward-level data displayed."
        }, status=status.HTTP_200_OK)


class AdminSystemStatsView(views.APIView):
    """Secured endpoint for Admin dashboard."""
    permission_classes = [IsAdmin]

    def get(self, request):
        pending_verifications = GovernmentVerification.objects.filter(verification_status=GovernmentVerification.Status.PENDING).count()
        verified_authorities = GovernmentVerification.objects.filter(verification_status=GovernmentVerification.Status.VERIFIED).count()
        total_users = User.objects.count()
        total_wards = Ward.objects.count()

        return Response({
            "total_users": total_users,
            "pending_verifications": pending_verifications,
            "verified_authorities": verified_authorities,
            "total_wards": total_wards,
            "ml_status": get_model_status(),
            "demo_mode": getattr(settings, 'DEMO_MODE', True)
        }, status=status.HTTP_200_OK)
