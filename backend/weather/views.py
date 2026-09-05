from rest_framework import status, views, permissions
from rest_framework.response import Response
from .providers import get_weather_provider
from thermal.services import calculate_htsi
from dashboard.views import _get_nearest_city

def _get_city_label(lat: float, lon: float) -> str:
    """Return nearest Indian city name for the given coordinates."""
    city, state = _get_nearest_city(lat, lon)
    return f"{city}, {state}"


class CurrentWeatherView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = float(request.query_params.get('lat', 17.6868))
        lon = float(request.query_params.get('lon', 83.2185))

        provider = get_weather_provider()
        weather = provider.get_current_weather(lat, lon)

        # Compute thermal indices on the fly
        thermal = calculate_htsi(
            temperature_c=weather['temperature'],
            humidity_pct=weather['humidity'],
            wind_speed_ms=weather['wind_speed'],
            solar_radiation_wm2=weather.get('solar_radiation', 600.0),
            vulnerability_score=50.0
        )

        city_name = _get_city_label(lat, lon)
        return Response({
            "city": city_name,
            "coordinates": {"latitude": lat, "longitude": lon},
            "weather": weather,
            "thermal_indices": {
                "heat_index": thermal["heat_index"],
                "wbgt": thermal["wbgt"],
                "utci": thermal["utci"],
                "htsi": thermal["htsi"],
                "risk_level": thermal["risk_level"]
            },
            "is_live": weather.get("is_live", False),
            "source": weather.get("source", "Open-Meteo")
        }, status=status.HTTP_200_OK)


class WeatherForecastView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = float(request.query_params.get('lat', 17.6868))
        lon = float(request.query_params.get('lon', 83.2185))

        provider = get_weather_provider()
        forecast = provider.get_forecast(lat, lon)

        # Enrich hourly with HTSI and risk
        hourly_enriched = []
        for h in forecast.get('hourly', []):
            thermal = calculate_htsi(
                temperature_c=h['temperature'],
                humidity_pct=h['humidity'],
                wind_speed_ms=h.get('wind_speed', 2.0),
                solar_radiation_wm2=h.get('solar_radiation', 0.0),
                vulnerability_score=50.0
            )
            h_copy = dict(h)
            h_copy['heat_index'] = thermal['heat_index']
            h_copy['wbgt'] = thermal['wbgt']
            h_copy['utci'] = thermal['utci']
            h_copy['htsi'] = thermal['htsi']
            h_copy['risk_level'] = thermal['risk_level']
            hourly_enriched.append(h_copy)

        # Enrich daily with peak HTSI
        daily_enriched = []
        for d in forecast.get('daily', []):
            thermal = calculate_htsi(
                temperature_c=d['temp_max'],
                humidity_pct=d.get('humidity_avg', 70.0),
                wind_speed_ms=d.get('wind_avg', 2.0),
                solar_radiation_wm2=d.get('solar_peak', 800.0),
                vulnerability_score=50.0
            )
            d_copy = dict(d)
            d_copy['heat_index'] = thermal['heat_index']
            d_copy['wbgt'] = thermal['wbgt']
            d_copy['utci'] = thermal['utci']
            d_copy['peak_htsi'] = thermal['htsi']
            d_copy['peak_risk'] = thermal['risk_level']
            daily_enriched.append(d_copy)

        return Response({
            "hourly_48h": hourly_enriched,
            "daily_5d": daily_enriched,
            "source": forecast.get("source", "Open-Meteo"),
            "is_live": forecast.get("is_live", False)
        }, status=status.HTTP_200_OK)
