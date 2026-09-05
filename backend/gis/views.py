from django.conf import settings
from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Ward, Location
from .services import get_all_wards_geojson, get_ward_for_coordinates
from weather.providers import get_weather_provider, OpenMeteoProvider
from thermal.services import calculate_htsi
from alerts.services import trigger_user_heat_alert

INDIA_LATITUDE_RANGE = (6.0, 37.5)
INDIA_LONGITUDE_RANGE = (68.0, 98.0)


def _validate_india_coordinates(lat, lon):
    return (INDIA_LATITUDE_RANGE[0] <= lat <= INDIA_LATITUDE_RANGE[1]
            and INDIA_LONGITUDE_RANGE[0] <= lon <= INDIA_LONGITUDE_RANGE[1])

class WardGeoJSONView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        geojson_data = get_all_wards_geojson()
        return Response(geojson_data, status=status.HTTP_200_OK)


class WardRiskListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        wards = Ward.objects.all().order_by('-current_htsi')
        data = []
        for w in wards:
            data.append({
                "id": w.id,
                "ward_id": w.ward_id,
                "name": w.name,
                "zone": w.zone,
                "city": w.city,
                "population": w.population,
                "population_density": w.population_density,
                "vulnerability_score": w.vulnerability_score,
                "outdoor_worker_ratio": w.outdoor_worker_ratio,
                "htsi": w.current_htsi,
                "risk_level": w.current_risk,
                "centroid": [w.centroid_lat, w.centroid_lon],
                "last_risk_update": w.last_risk_update.isoformat() if w.last_risk_update else None
            })
        return Response(data, status=status.HTTP_200_OK)


class WardHotspotsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        hotspots = Ward.objects.all().order_by('-current_htsi')[:5]
        data = [
            {
                "ward_id": h.ward_id,
                "name": h.name,
                "zone": h.zone,
                "htsi": h.current_htsi,
                "risk_level": h.current_risk,
                "population": h.population,
                "vulnerability_score": h.vulnerability_score
            }
            for h in hotspots
        ]
        return Response(data, status=status.HTTP_200_OK)


class LocationUpdateView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            lat = float(request.data.get('latitude'))
            lon = float(request.data.get('longitude'))
        except (TypeError, ValueError):
            return Response({"detail": "Valid 'latitude' and 'longitude' required."}, status=status.HTTP_400_BAD_REQUEST)
        if not _validate_india_coordinates(lat, lon):
            return Response({"detail": "Coordinates must be within India for nationwide HeatHealthAI coverage."}, status=status.HTTP_400_BAD_REQUEST)

        accuracy = request.data.get('accuracy')

        user = request.user if request.user and request.user.is_authenticated else None
        ward, is_inside, distance_km = get_ward_for_coordinates(lat, lon)

        # Record Location history
        loc = Location.objects.create(
            user=user,
            latitude=lat,
            longitude=lon,
            accuracy=accuracy,
            detected_ward=ward,
            city='India'
        )

        # Update user profile coordinates if logged in
        if user:
            user.last_latitude = lat
            user.last_longitude = lon
            user.last_location_updated = loc.timestamp
            user.save(update_fields=['last_latitude', 'last_longitude', 'last_location_updated'])

        # Check thermal risk for this location
        if is_inside and ward:
            htsi = ward.current_htsi
            risk_level = ward.current_risk
        else:
            provider = OpenMeteoProvider() if getattr(settings, 'INDIA_WIDE_MODE', True) or not getattr(settings, 'DEMO_MODE', True) else get_weather_provider()
            weather = provider.get_current_weather(lat, lon)
            thermal = calculate_htsi(weather['temperature'], weather['humidity'], weather['wind_speed'], weather.get('solar_radiation', 0.0), 50.0)
            htsi = thermal['htsi']
            risk_level = thermal['risk_level']

        alert_created = None
        if user:
            alert_created, triggered = trigger_user_heat_alert(user, ward, htsi, risk_level)

        return Response({
            "message": "Location updated successfully.",
            "latitude": lat,
            "longitude": lon,
            "ward": ward.name if is_inside and ward else "India (ward boundary unavailable)",
            "zone": ward.zone if is_inside and ward else "India",
            "is_inside_ward": is_inside,
            "distance_to_ward_centroid_km": distance_km,
            "current_htsi": htsi,
            "current_risk": risk_level,
            "alert_triggered": bool(alert_created)
        }, status=status.HTTP_200_OK)


class LocationRiskCheckView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            lat = float(request.data.get('latitude', 17.6868))
            lon = float(request.data.get('longitude', 83.2185))
        except (TypeError, ValueError):
            return Response({"detail": "Valid latitude and longitude required."}, status=status.HTTP_400_BAD_REQUEST)
        if not _validate_india_coordinates(lat, lon):
            return Response({"detail": "Coordinates must be within India for nationwide HeatHealthAI coverage."}, status=status.HTTP_400_BAD_REQUEST)

        ward, is_inside, distance_km = get_ward_for_coordinates(lat, lon)
        if is_inside and ward:
            htsi = ward.current_htsi
            risk_level = ward.current_risk
        else:
            provider = OpenMeteoProvider() if getattr(settings, 'INDIA_WIDE_MODE', True) or not getattr(settings, 'DEMO_MODE', True) else get_weather_provider()
            weather = provider.get_current_weather(lat, lon)
            thermal = calculate_htsi(weather['temperature'], weather['humidity'], weather['wind_speed'], weather.get('solar_radiation', 0.0), 50.0)
            htsi = thermal['htsi']
            risk_level = thermal['risk_level']
        inside_risk_zone = (htsi >= 60.0 or risk_level in ['HIGH', 'VERY HIGH', 'EXTREME'])

        return Response({
            "inside_risk_zone": inside_risk_zone,
            "ward": ward.name if is_inside and ward else "India (ward boundary unavailable)",
            "risk_level": risk_level,
            "htsi": htsi,
            "distance_to_high_risk_zone": round(distance_km, 2) if not is_inside else 0.0,
            "alert_required": (htsi >= 60.0)
        }, status=status.HTTP_200_OK)
