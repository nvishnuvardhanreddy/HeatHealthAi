from rest_framework import status, views, permissions
from rest_framework.response import Response
from .services import get_model_status, get_ml_prediction
from weather.providers import get_weather_provider

class CurrentPredictionView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        lat = float(request.query_params.get('lat', 17.6868))
        lon = float(request.query_params.get('lon', 83.2185))

        weather = get_weather_provider().get_current_weather(lat, lon)
        prediction = get_ml_prediction(
            temperature=weather['temperature'],
            humidity=weather['humidity'],
            wind_speed=weather['wind_speed'],
            solar_radiation=weather.get('solar_radiation', 600.0),
            vulnerability_score=55.0
        )
        return Response(prediction, status=status.HTTP_200_OK)


class ModelExplainabilityView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        status_info = get_model_status()
        labels = {
            "wbgt": "Wet Bulb Globe Temperature (WBGT)",
            "utci": "Universal Thermal Climate Index (UTCI)",
            "temperature": "Dry-Bulb Ambient Temperature",
            "humidity": "Relative Humidity",
            "vulnerability_score": "Demographic Vulnerability",
            "wind_speed": "Wind Velocity (Cooling Offset)",
            "solar_radiation": "Solar Radiation Irradiance",
            "heat_index": "Heat Index",
            "population_density": "Population Density",
            "hour": "Hour of Day",
            "day_of_year": "Day of Year",
            "heat_exposure_duration": "Heat Exposure Duration",
        }
        importance = status_info.get("feature_importance", {})
        drivers = []
        for feature, score in sorted(importance.items(), key=lambda item: item[1], reverse=True):
            if score <= 0:
                continue
            percentage = round(float(score) * 100, 1)
            drivers.append({
                "factor": labels.get(feature, feature.replace("_", " ").title()),
                "importance": float(score),
                "percentage": percentage,
                "impact": "Highest Driver" if not drivers else ("High Driver" if percentage >= 10 else "Contributing Factor"),
            })
        if not drivers:
            drivers = [{"factor": "Model feature importance unavailable", "importance": 0.0, "percentage": 0.0, "impact": "Unavailable"}]

        return Response({
            "title": "WHAT IS DRIVING THE DANGER?",
            "subtitle": "Random Forest feature importance from the loaded model artifact",
            "model_status": status_info,
            "drivers": drivers,
            "interpretation": "Thermal stress danger is predominantly driven by the non-linear coupling of air temperature and high relative humidity (Wet-Bulb Globe Temperature), amplified by daytime solar irradiance and population vulnerability.",
            "disclaimer": "AI-generated decision-support estimate. Prototype model requires validation using historical local meteorological and health data before operational deployment."
        }, status=status.HTTP_200_OK)
