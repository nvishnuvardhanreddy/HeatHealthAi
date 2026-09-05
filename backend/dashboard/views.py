from django.db import connection
from django.conf import settings
from rest_framework import status, views, permissions
from rest_framework.response import Response

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

        return Response({
            "current_weather": weather,
            "location": {"latitude": lat, "longitude": lon, "scope": "India-wide coordinate weather"},
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
            "demo_mode": getattr(connection, 'demo_mode', True)
        }, status=status.HTTP_200_OK)
