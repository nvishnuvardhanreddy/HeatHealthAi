import json
import logging
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from pathlib import Path
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

class BaseWeatherProvider(ABC):
    @abstractmethod
    def get_current_weather(self, lat: float, lon: float) -> dict:
        pass

    @abstractmethod
    def get_forecast(self, lat: float, lon: float) -> dict:
        pass


class OpenMeteoProvider(BaseWeatherProvider):
    """
    Real-time meteorological provider using Open-Meteo High-Resolution Weather API.
    Does not require API keys, supports hourly & daily biometeorological parameters.
    """
    BASE_URL = "https://api.open-meteo.com/v1/forecast"

    def get_current_weather(self, lat: float, lon: float) -> dict:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": [
                "temperature_2m",
                "relative_humidity_2m",
                "apparent_temperature",
                "wind_speed_10m",
                "direct_normal_irradiance",
                "surface_pressure",
                "cloud_cover",
            ],
            "timezone": "auto",
        }
        try:
            resp = requests.get(self.BASE_URL, params=params, timeout=5)
            resp.raise_for_status()
            data = resp.json()
            curr = data.get("current", {})

            return {
                "temperature": float(curr.get("temperature_2m", 35.0)),
                "humidity": float(curr.get("relative_humidity_2m", 65.0)),
                "wind_speed": float(curr.get("wind_speed_10m", 2.0)),
                "solar_radiation": float(curr.get("direct_normal_irradiance", 450.0) or 0.0),
                "apparent_temperature": float(curr.get("apparent_temperature", 40.0)),
                "pressure": float(curr.get("surface_pressure", 1010.0)),
                "cloud_cover": float(curr.get("cloud_cover", 20.0)),
                "timestamp": curr.get("time"),
                "source": "LIVE WEATHER (Open-Meteo)",
                "is_live": True,
            }
        except Exception as e:
            logger.warning(f"Open-Meteo live query failed: {e}. Falling back to demo data.")
            fallback = DemoWeatherProvider().get_current_weather(lat, lon)
            fallback["warning"] = "Live weather temporarily unavailable. Fallback demo data served."
            return fallback

    def get_forecast(self, lat: float, lon: float) -> dict:
        params = {
            "latitude": lat,
            "longitude": lon,
            "hourly": [
                "temperature_2m",
                "relative_humidity_2m",
                "wind_speed_10m",
                "direct_normal_irradiance",
                "apparent_temperature",
            ],
            "daily": [
                "temperature_2m_max",
                "temperature_2m_min",
                "wind_speed_10m_max",
                "relative_humidity_2m_mean",
            ],
            "timezone": "auto",
            "forecast_days": 7,
        }
        try:
            resp = requests.get(self.BASE_URL, params=params, timeout=6)
            resp.raise_for_status()
            data = resp.json()

            hourly = data.get("hourly", {})
            times = hourly.get("time", [])
            temps = hourly.get("temperature_2m", [])
            rhs = hourly.get("relative_humidity_2m", [])
            winds = hourly.get("wind_speed_10m", [])
            solars = hourly.get("direct_normal_irradiance", [])

            hourly_list = []
            for i in range(min(48, len(times))):
                hourly_list.append({
                    "time": times[i],
                    "temperature": temps[i],
                    "humidity": rhs[i],
                    "wind_speed": winds[i],
                    "solar_radiation": solars[i] if solars[i] is not None else 0.0,
                })

            daily = data.get("daily", {})
            d_times = daily.get("time", [])
            d_max = daily.get("temperature_2m_max", [])
            d_min = daily.get("temperature_2m_min", [])
            d_wind = daily.get("wind_speed_10m_max", [])
            d_rh = daily.get("relative_humidity_2m_mean", [])

            daily_list = []
            for i in range(min(5, len(d_times))):
                daily_list.append({
                    "date": d_times[i],
                    "temp_max": d_max[i],
                    "temp_min": d_min[i],
                    "wind_avg": d_wind[i],
                    "humidity_avg": d_rh[i],
                    "solar_peak": 800.0,
                    "condition": "Extreme Heat Stress" if d_max[i] >= 40 else "High Heat Stress",
                })

            return {
                "hourly": hourly_list,
                "daily": daily_list,
                "source": "FORECAST (Open-Meteo)",
                "is_live": True,
            }
        except Exception as e:
            logger.warning(f"Open-Meteo forecast failed: {e}. Falling back to demo data.")
            fallback = DemoWeatherProvider().get_forecast(lat, lon)
            fallback["warning"] = "Live forecast temporarily unavailable. Fallback demo data served."
            return fallback


class DemoWeatherProvider(BaseWeatherProvider):
    """
    Synthetic/Demonstration weather provider. Used when DEMO_MODE=True or when offline.
    """
    SAMPLE_PATH = Path(settings.BASE_DIR).parent / 'data' / 'sample_weather' / 'vizag_sample_weather.json'

    def _read_sample_file(self):
        if self.SAMPLE_PATH.exists():
            with open(self.SAMPLE_PATH, 'r', encoding='utf-8') as f:
                return json.load(f)
        # In-memory realistic baseline
        return {
            "current": {
                "temperature": 40.0,
                "relative_humidity": 70.0,
                "wind_speed": 2.0,
                "solar_radiation": 800.0,
                "apparent_temperature": 52.4,
                "pressure": 1008.0,
                "cloud_cover": 10.0,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
            "forecast_hourly": [],
            "forecast_daily": []
        }

    def get_current_weather(self, lat: float, lon: float) -> dict:
        data = self._read_sample_file()
        curr = dict(data.get("current", {}))
        if "relative_humidity" in curr and "humidity" not in curr:
            curr["humidity"] = curr["relative_humidity"]
        elif "humidity" in curr and "relative_humidity" not in curr:
            curr["relative_humidity"] = curr["humidity"]
        curr["source"] = "DEMO DATA"
        curr["is_live"] = False
        return curr

    def get_forecast(self, lat: float, lon: float) -> dict:
        data = self._read_sample_file()
        return {
            "hourly": data.get("forecast_hourly", []),
            "daily": data.get("forecast_daily", []),
            "source": "DEMO DATA (Forecast)",
            "is_live": False,
        }


def get_weather_provider() -> BaseWeatherProvider:
    """Factory returning weather provider based on settings.
    INDIA_WIDE_MODE=True (default) always uses live Open-Meteo.
    DEMO_MODE=True with INDIA_WIDE_MODE=False uses demo data.
    """
    if getattr(settings, 'INDIA_WIDE_MODE', True):
        return OpenMeteoProvider()
    if not getattr(settings, 'DEMO_MODE', True):
        return OpenMeteoProvider()
    return DemoWeatherProvider()
