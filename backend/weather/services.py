from django.utils import timezone
from .models import WeatherObservation, WeatherForecast
from .providers import get_weather_provider

def fetch_and_record_weather(lat: float = 17.6868, lon: float = 83.2185, ward=None):
    """
    Fetch current meteorological metrics and store an observation record.
    """
    provider = get_weather_provider()
    curr = provider.get_current_weather(lat, lon)

    obs = WeatherObservation.objects.create(
        ward=ward,
        city='Visakhapatnam',
        latitude=lat,
        longitude=lon,
        timestamp=timezone.now(),
        temperature=curr['temperature'],
        humidity=curr['humidity'],
        wind_speed=curr['wind_speed'],
        solar_radiation=curr.get('solar_radiation', 0.0),
        apparent_temperature=curr.get('apparent_temperature'),
        pressure=curr.get('pressure'),
        cloud_cover=curr.get('cloud_cover'),
        source=curr.get('source', 'Open-Meteo')
    )
    return obs, curr
