import json
import math
import logging
from datetime import datetime, timezone
from pathlib import Path
import requests
from django.conf import settings
from django.db import connection
from django.http import HttpResponse, JsonResponse
from rest_framework import status, views, permissions
from rest_framework.response import Response

from thermal.services import calculate_htsi, calculate_heat_index, calculate_wbgt, calculate_utci, classify_risk
from weather.providers import get_weather_provider, OpenMeteoProvider
from predictions.services import get_ml_prediction, get_model_status
from gis.models import Ward
from interventions.models import Intervention
from interventions.services import evaluate_emergency_priorities, seed_default_interventions
from dashboard.views import INDIA_CITIES, _get_nearest_city

logger = logging.getLogger(__name__)

# Fallback coordinates: Visakhapatnam (Vizag)
DEFAULT_LAT = 17.6868
DEFAULT_LON = 83.2185
DEFAULT_LOCATION = "Visakhapatnam"

def get_risk_emoji(level: str) -> str:
    level = str(level).upper()
    if level == "EXTREME":
        return "🔴"
    elif level in ("VERY HIGH", "URGENT"):
        return "🟠"
    elif level in ("HIGH", "PREPARE"):
        return "🟠"
    elif level in ("MODERATE", "WATCH"):
        return "🟡"
    return "🟢"


# =====================================================================
# 1. HEALTH CHECK VIEW (/health, /api/health/)
# =====================================================================
class UnifiedHealthCheckView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        db_status = "connected"
        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
        except Exception:
            db_status = "error"

        weather_status = "available"
        try:
            provider = get_weather_provider()
            weather_status = "available" if provider else "unavailable"
        except Exception:
            weather_status = "unavailable"

        ml_status = get_model_status()

        return Response({
            "status": "ok" if db_status == "connected" else "degraded",
            "database": db_status,
            "weather_service": weather_status,
            "ml_model": ml_status.get("status", "loaded"),
            "model_name": ml_status.get("model_name", "RandomForestRegressor"),
            "disclaimer": "HeatHealthAI Decision Support Platform"
        }, status=status.HTTP_200_OK)


# =====================================================================
# 2. GEOCODING & REVERSE GEOCODING (/geocode, /reverse-geocode)
# =====================================================================
class GeocodeView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        query = str(request.query_params.get('q', '')).strip()
        if not query:
            return Response({"found": False, "detail": "Query parameter 'q' is required."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Check local catalog first (exact & case-insensitive partial match)
        q_lower = query.lower()
        for lat, lon, city, state in INDIA_CITIES:
            if q_lower == city.lower() or q_lower in city.lower() or city.lower() in q_lower:
                return Response({
                    "found": True,
                    "name": city,
                    "latitude": lat,
                    "longitude": lon,
                    "display_name": f"{city}, {state}, India"
                }, status=status.HTTP_200_OK)

        # 2. Query Open-Meteo Geocoding API
        try:
            url = "https://geocoding-api.open-meteo.com/v1/search"
            resp = requests.get(url, params={"name": query, "count": 1, "language": "en", "format": "json"}, timeout=4)
            if resp.ok:
                results = resp.json().get("results", [])
                if results:
                    top = results[0]
                    name = top.get("name", query)
                    country = top.get("country", "India")
                    admin1 = top.get("admin1", "")
                    display = f"{name}, {admin1}, {country}".replace(", ,", ",")
                    return Response({
                        "found": True,
                        "name": name,
                        "latitude": float(top.get("latitude")),
                        "longitude": float(top.get("longitude")),
                        "display_name": display
                    }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.warning(f"Geocoding lookup failed for '{query}': {e}")

        return Response({
            "found": False,
            "name": query,
            "detail": f"Could not resolve '{query}' to coordinates."
        }, status=status.HTTP_200_OK)


class ReverseGeocodeView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            return Response({"found": False, "detail": "Valid latitude and longitude required."}, status=status.HTTP_400_BAD_REQUEST)

        # Check nearest city in local catalog
        city, state = _get_nearest_city(lat, lon)
        best_entry = min(INDIA_CITIES, key=lambda entry: (lat - entry[0]) ** 2 + (lon - entry[1]) ** 2)
        dist_sq = (lat - best_entry[0]) ** 2 + (lon - best_entry[1]) ** 2

        if dist_sq < 9.0:
            return Response({
                "found": True,
                "name": city,
                "display_name": f"{city}, {state}, India"
            }, status=status.HTTP_200_OK)

        # Reverse geocode for distant / global coordinates
        try:
            url = "https://api.bigdatacloud.net/data/reverse-geocode-client"
            resp = requests.get(url, params={"latitude": lat, "longitude": lon, "localityLanguage": "en"}, timeout=3)
            if resp.ok:
                data = resp.json()
                name = data.get("city") or data.get("locality") or data.get("principalSubdivision") or f"Location ({lat:.4f}, {lon:.4f})"
                country = data.get("countryName", "")
                display = f"{name}, {country}".strip(", ")
                return Response({
                    "found": True,
                    "name": name,
                    "display_name": display
                }, status=status.HTTP_200_OK)
        except Exception:
            pass

        return Response({
            "found": True,
            "name": f"Sector ({lat:.4f}, {lon:.4f})",
            "display_name": f"Coordinates ({lat:.4f}, {lon:.4f})"
        }, status=status.HTTP_200_OK)


# =====================================================================
# 3. LIVE RISK INTELLIGENCE VIEW (/risk, /api/risk, /api/predictions/current/)
# =====================================================================
class UnifiedRiskView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            lat, lon = DEFAULT_LAT, DEFAULT_LON

        location_name = request.query_params.get('location', request.query_params.get('city'))
        if not location_name:
            location_name, _ = _get_nearest_city(lat, lon)

        # 1. Fetch live meteorological observations from Open-Meteo
        provider = OpenMeteoProvider()
        weather = provider.get_current_weather(lat, lon)
        temp = float(weather.get('temperature', 35.0))
        humidity = float(weather.get('humidity', 65.0))
        wind = float(weather.get('wind_speed', 2.0))
        solar = float(weather.get('solar_radiation', 600.0) or 600.0)
        apparent = float(weather.get('apparent_temperature', temp + 4.0))

        # 2. Find closest ward / vulnerability profile
        vulnerability_score = 55.0
        ward = Ward.objects.filter(city__icontains="Visakhapatnam").first() if "visakhapatnam" in location_name.lower() else None
        if ward:
            vulnerability_score = ward.vulnerability_score

        # 3. Compute deterministic biometeorological indices
        thermal = calculate_htsi(
            temperature_c=temp,
            humidity_pct=humidity,
            wind_speed_ms=wind,
            solar_radiation_wm2=solar,
            vulnerability_score=vulnerability_score
        )

        # 4. Predict via Machine Learning Model (RandomForestRegressor)
        try:
            ml_res = get_ml_prediction(
                temperature=temp,
                humidity=humidity,
                wind_speed=wind,
                solar_radiation=solar,
                vulnerability_score=vulnerability_score,
                ward=ward
            )
            ml_htsi = ml_res.get("predicted_htsi", thermal["htsi"])
        except Exception as e:
            logger.warning(f"ML prediction error: {e}")
            ml_htsi = thermal["htsi"]

        # Composite calibrated HTSI
        final_htsi = round(0.5 * thermal["htsi"] + 0.5 * ml_htsi, 1)
        risk_level = classify_risk(final_htsi)
        emoji = get_risk_emoji(risk_level)

        # 5. Epidemiological Health Risk Indicators (0-100 scale)
        # Mortality indicator reflects heat-related excess mortality risk index
        mortality_raw = max(0.0, ((final_htsi - 30.0) / 70.0) ** 1.35 * 65.0 + (vulnerability_score / 100.0) * 20.0 + max(0.0, (thermal["wbgt"] - 28.0) * 3.0))
        mortality_indicator = round(min(100.0, max(0.0, mortality_raw)), 1)

        # Hospitalization indicator reflects emergency admission and severe dehydration surge
        hosp_raw = max(0.0, ((final_htsi - 25.0) / 75.0) ** 1.2 * 72.0 + (vulnerability_score / 100.0) * 22.0 + max(0.0, (temp - 32.0) * 1.8))
        hospitalization_indicator = round(min(100.0, max(0.0, hosp_raw)), 1)

        if final_htsi >= 80.0 or mortality_indicator >= 35.0:
            health_priority = "CRITICAL"
        elif final_htsi >= 60.0 or mortality_indicator >= 20.0:
            health_priority = "URGENT"
        elif final_htsi >= 40.0:
            health_priority = "HIGH"
        elif final_htsi >= 25.0:
            health_priority = "WATCH"
        else:
            health_priority = "ROUTINE"

        # 6. Explainable Drivers Breakdown (0-100%)
        # Scale contributions so they represent relative driver percentages
        c_temp = min(100.0, max(10.0, (temp / 45.0) * 100.0))
        c_rh = min(100.0, max(10.0, humidity))
        c_solar = min(100.0, max(10.0, (solar / 900.0) * 100.0))
        c_biomet = min(100.0, max(10.0, (thermal["wbgt"] / 36.0) * 100.0))
        c_wind = min(100.0, max(5.0, (wind / 10.0) * 100.0))
        c_vuln = min(100.0, max(10.0, vulnerability_score))

        drivers = [
            {"name": "Air Temperature", "value": round(c_temp, 0), "impact": f"{temp:.1f}°C ambient heat"},
            {"name": "Relative Humidity", "value": round(c_rh, 0), "impact": f"{humidity:.0f}% atmospheric moisture"},
            {"name": "Solar Radiation", "value": round(c_solar, 0), "impact": f"{solar:.0f} W/m² direct irradiance"},
            {"name": "Biomet WBGT / UTCI", "value": round(c_biomet, 0), "impact": f"{thermal['wbgt']:.1f}°C wet bulb globe temp"},
            {"name": "Wind Mitigation", "value": round(c_wind, 0), "impact": f"{wind:.1f} m/s convective cooling"},
            {"name": "Vulnerability Factor", "value": round(c_vuln, 0), "impact": f"{vulnerability_score:.0f}/100 demographic vulnerability"}
        ]

        # 7. Automated Emergency Alert Directives
        if risk_level == "EXTREME":
            alert_title = "🔴 CRITICAL HEAT HEALTH EMERGENCY"
            alert_status = "CRITICAL"
            alert_priority = "IMMEDIATE DISPATCH"
            alert_msg = f"Life-threatening thermal stress detected across {location_name}. Dangerous physiological strain. Activate cooling shelters and emergency medical standby."
            alert_actions = [
                "Open all municipal air-conditioned cooling centers immediately",
                "Deploy mobile hydration paramedic ambulances to high-density areas",
                "Enforce mandatory labor moratorium for outdoor workers (11:00-16:00)",
                "Broadcast public warning across municipal SMS and WhatsApp channels"
            ]
        elif risk_level == "VERY HIGH" or risk_level == "HIGH":
            alert_title = "🟠 HIGH HEAT STRESS WARNING"
            alert_status = "WARNING"
            alert_priority = "URGENT RESPONSE"
            alert_msg = f"High thermal danger in {location_name}. Heat exhaustion and dehydration risks elevated for outdoor workers, children, and elderly citizens."
            alert_actions = [
                "Verify continuous municipal drinking water tanker distribution",
                "Ensure medical staff readiness for heat-related illnesses",
                "Adjust work-rest cycles for construction and field personnel",
                "Issue public hydration and cooling advisories"
            ]
        elif risk_level == "MODERATE":
            alert_title = "🟡 MODERATE HEAT ADVISORY"
            alert_status = "WATCH"
            alert_priority = "MONITORING"
            alert_msg = f"Moderate thermal conditions in {location_name}. Sustained direct solar exposure may cause fatigue and heat cramps."
            alert_actions = [
                "Promote regular hydration and shaded rest intervals",
                "Monitor high-density and elderly populated wards",
                "Keep municipal emergency reserves on standby"
            ]
        else:
            alert_title = "🟢 NORMAL CONDITIONS"
            alert_status = "NORMAL"
            alert_priority = "ROUTINE MONITORING"
            alert_msg = f"Thermal conditions in {location_name} are within safe ranges for human health."
            alert_actions = [
                "Standard meteorological monitoring in progress"
            ]

        now_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

        response_data = {
            "location": location_name,
            "coordinates": {"latitude": lat, "longitude": lon},
            "updated": now_str,
            "risk": {
                "score": final_htsi,
                "level": risk_level,
                "emoji": emoji,
                "message": alert_msg
            },
            "thermal": {
                "htsi": final_htsi,
                "heat_index": thermal["heat_index"],
                "wbgt": thermal["wbgt"],
                "utci": thermal["utci"]
            },
            "environment": {
                "temperature": temp,
                "humidity": humidity,
                "wind": wind,
                "solar": solar,
                "apparent": apparent
            },
            "health": {
                "mortality": mortality_indicator,
                "hospitalization": hospitalization_indicator,
                "priority_level": health_priority
            },
            "vulnerability": {
                "score": vulnerability_score,
                "level": "HIGH" if vulnerability_score >= 60 else "MODERATE"
            },
            "alert": {
                "title": alert_title,
                "status": alert_status,
                "priority": alert_priority,
                "message": alert_msg,
                "actions": alert_actions
            },
            "drivers": drivers,
            "source": weather.get("source", "LIVE WEATHER (Open-Meteo)")
        }

        return Response(response_data, status=status.HTTP_200_OK)


# =====================================================================
# 4. 5-DAY WEATHER FORECAST VIEW (/forecast, /api/forecast)
# =====================================================================
class UnifiedForecastView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            lat, lon = DEFAULT_LAT, DEFAULT_LON

        provider = OpenMeteoProvider()
        forecast_raw = provider.get_forecast(lat, lon)
        daily_list = forecast_raw.get("daily", [])

        results = []
        for i, d in enumerate(daily_list[:5]):
            temp_max = float(d.get("temp_max", 36.0))
            temp_min = float(d.get("temp_min", 26.0))
            humidity = float(d.get("humidity_avg", 65.0))
            wind = float(d.get("wind_avg", 2.0))
            solar = float(d.get("solar_peak", 800.0))

            thermal = calculate_htsi(
                temperature_c=temp_max,
                humidity_pct=humidity,
                wind_speed_ms=wind,
                solar_radiation_wm2=solar,
                vulnerability_score=50.0
            )

            htsi_val = thermal["htsi"]
            risk_val = thermal["risk_level"]
            emoji = get_risk_emoji(risk_val)

            results.append({
                "date": d.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
                "temperature": temp_max,
                "max": temp_max,
                "min": temp_min,
                "apparent": round(thermal["heat_index"], 1),
                "htsi": htsi_val,
                "rain": float(d.get("rain", 0.0) or 0.0),
                "risk": risk_val,
                "emoji": emoji
            })

        return Response({
            "forecast": results,
            "source": forecast_raw.get("source", "Open-Meteo")
        }, status=status.HTTP_200_OK)


# =====================================================================
# 5. 48-HOUR HOURLY FORECAST VIEW (/hourly, /api/hourly)
# =====================================================================
class UnifiedHourlyView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            lat, lon = DEFAULT_LAT, DEFAULT_LON

        provider = OpenMeteoProvider()
        forecast_raw = provider.get_forecast(lat, lon)
        hourly_list = forecast_raw.get("hourly", [])

        results = []
        for h in hourly_list[:48]:
            t = float(h.get("temperature", 34.0))
            rh = float(h.get("humidity", 65.0))
            w_ms = float(h.get("wind_speed", 2.0))
            w_kmh = round(w_ms * 3.6, 1)
            solar = float(h.get("solar_radiation", 0.0) or 0.0)

            thermal = calculate_htsi(
                temperature_c=t,
                humidity_pct=rh,
                wind_speed_ms=w_ms,
                solar_radiation_wm2=solar,
                vulnerability_score=50.0
            )

            htsi_val = thermal["htsi"]
            risk_val = thermal["risk_level"]

            results.append({
                "time": h.get("time", ""),
                "temperature": round(t, 1),
                "humidity": round(rh, 0),
                "wind": w_kmh,
                "wbgt": round(thermal["wbgt"], 1),
                "htsi": htsi_val,
                "risk": risk_val,
                "emoji": get_risk_emoji(risk_val)
            })

        return Response({
            "hourly": results,
            "source": forecast_raw.get("source", "Open-Meteo")
        }, status=status.HTTP_200_OK)


# =====================================================================
# 6. WARD-LEVEL HOTSPOTS VIEW (/hotspots, /api/hotspots)
# =====================================================================
class UnifiedHotspotsView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            lat, lon = DEFAULT_LAT, DEFAULT_LON

        provider = OpenMeteoProvider()
        weather = provider.get_current_weather(lat, lon)
        base_temp = float(weather.get('temperature', 36.0))
        base_rh = float(weather.get('humidity', 65.0))
        base_wind = float(weather.get('wind_speed', 2.0))
        base_solar = float(weather.get('solar_radiation', 700.0) or 700.0)

        wards = list(Ward.objects.all())
        results = []

        if wards and abs(lat - DEFAULT_LAT) < 1.0 and abs(lon - DEFAULT_LON) < 1.0:
            # Real Visakhapatnam Wards with individual micro-climate calculations
            for w in wards:
                # Slight micro-climate adjustments based on ward urban characteristics
                density_factor = min(3.0, w.population_density / 5000.0)
                ward_temp = base_temp + (0.5 if "Industrial" in w.zone or "Gajuwaka" in w.name else 0.0) + (0.3 * density_factor)
                ward_rh = max(30.0, base_rh + (2.0 if "Coastal" in w.zone else -2.0))
                ward_solar = base_solar + (50.0 if "Industrial" in w.zone else 0.0)

                thermal = calculate_htsi(
                    temperature_c=ward_temp,
                    humidity_pct=ward_rh,
                    wind_speed_ms=base_wind,
                    solar_radiation_wm2=ward_solar,
                    vulnerability_score=w.vulnerability_score
                )

                htsi_val = thermal["htsi"]
                risk_val = thermal["risk_level"]

                results.append({
                    "name": w.name,
                    "ward_id": w.ward_id,
                    "zone": w.zone,
                    "latitude": w.centroid_lat,
                    "longitude": w.centroid_lon,
                    "temperature": round(ward_temp, 1),
                    "humidity": round(ward_rh, 0),
                    "htsi": htsi_val,
                    "risk": risk_val,
                    "emoji": get_risk_emoji(risk_val),
                    "population": w.population,
                    "vulnerability_score": w.vulnerability_score
                })
        else:
            # Dynamically compute urban sectors around the queried coordinates
            city_name, _ = _get_nearest_city(lat, lon)
            sector_offsets = [
                ("Central Commercial District", 0.005, 0.005, 1.2, 1.1, 48000, 65.0),
                ("Industrial & Logistics Zone", -0.012, 0.015, 1.8, 1.25, 52000, 72.0),
                ("High-Density Residential Sector", 0.015, -0.010, 0.8, 1.15, 61000, 68.0),
                ("Suburban Outer Ring", -0.020, -0.018, -0.5, 0.95, 34000, 45.0),
                ("Transit Hub & Railway Corridor", 0.008, -0.004, 1.4, 1.2, 43000, 60.0),
                ("Green Belt / Urban Park Buffer", 0.018, 0.020, -1.2, 0.85, 22000, 35.0)
            ]

            for name_suffix, dlat, dlon, t_diff, solar_mult, pop, vuln in sector_offsets:
                w_temp = base_temp + t_diff
                w_solar = base_solar * solar_mult
                thermal = calculate_htsi(
                    temperature_c=w_temp,
                    humidity_pct=base_rh,
                    wind_speed_ms=base_wind,
                    solar_radiation_wm2=w_solar,
                    vulnerability_score=vuln
                )
                htsi_val = thermal["htsi"]
                risk_val = thermal["risk_level"]

                results.append({
                    "name": f"{city_name} - {name_suffix}",
                    "latitude": round(lat + dlat, 5),
                    "longitude": round(lon + dlon, 5),
                    "temperature": round(w_temp, 1),
                    "humidity": round(base_rh, 0),
                    "htsi": htsi_val,
                    "risk": risk_val,
                    "emoji": get_risk_emoji(risk_val),
                    "population": pop,
                    "vulnerability_score": vuln
                })

        # Sort hotspots by highest HTSI
        results.sort(key=lambda x: x["htsi"], reverse=True)
        return Response({"hotspots": results}, status=status.HTTP_200_OK)


# =====================================================================
# 7. 5-DAY HUMAN IMPACT FORECAST (/impact-forecast, /api/impact-forecast)
# =====================================================================
class UnifiedImpactForecastView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            lat, lon = DEFAULT_LAT, DEFAULT_LON

        location_name = request.query_params.get('location', request.query_params.get('city'))
        if not location_name:
            location_name, _ = _get_nearest_city(lat, lon)

        provider = OpenMeteoProvider()
        forecast_raw = provider.get_forecast(lat, lon)
        daily_list = forecast_raw.get("daily", [])

        vulnerability_score = 55.0

        rows = []
        labels = ["Day 1 · Today", "Day 2 · Tomorrow", "Day 3", "Day 4", "Day 5"]

        for i, d in enumerate(daily_list[:5]):
            label = labels[i] if i < len(labels) else f"Day {i+1}"
            date_str = d.get("date", datetime.now(timezone.utc).strftime("%Y-%m-%d"))
            temp_max = float(d.get("temp_max", 36.0))
            humidity = float(d.get("humidity_avg", 65.0))
            wind = float(d.get("wind_avg", 2.0))
            solar = float(d.get("solar_peak", 800.0))

            thermal = calculate_htsi(
                temperature_c=temp_max,
                humidity_pct=humidity,
                wind_speed_ms=wind,
                solar_radiation_wm2=solar,
                vulnerability_score=vulnerability_score
            )
            htsi_val = thermal["htsi"]
            risk_val = thermal["risk_level"]

            # Epidemiological metrics
            m_ind = round(min(100.0, max(0.0, ((htsi_val - 30.0) / 70.0) ** 1.35 * 65.0 + (vulnerability_score / 100.0) * 20.0 + max(0.0, (thermal["wbgt"] - 28.0) * 3.0))), 0)
            h_ind = round(min(100.0, max(0.0, ((htsi_val - 25.0) / 75.0) ** 1.2 * 72.0 + (vulnerability_score / 100.0) * 22.0 + max(0.0, (temp_max - 32.0) * 1.8))), 0)

            if htsi_val >= 80.0:
                p_level = "CRITICAL"
                action_text = "ACTIVATE COOLING SHELTERS & MORATORIUM"
            elif htsi_val >= 60.0:
                p_level = "URGENT"
                action_text = "WATER TANKERS & HEALTH ADVISORY"
            elif htsi_val >= 40.0:
                p_level = "HIGH"
                action_text = "HYDRATION STANDS & WORKER WATCH"
            elif htsi_val >= 25.0:
                p_level = "WATCH"
                action_text = "MONITOR REGIONAL TEMPERATURES"
            else:
                p_level = "ROUTINE"
                action_text = "STANDARD MONITORING"

            rows.append({
                "label": label,
                "date": date_str,
                "day_index": i + 1,
                "temperature": round(temp_max, 1),
                "max": round(temp_max, 1),
                "humidity": round(humidity, 0),
                "wbgt": round(thermal["wbgt"], 1),
                "htsi": htsi_val,
                "thermal_risk": risk_val,
                "risk": risk_val,
                "emoji": get_risk_emoji(risk_val),
                "priority_level": p_level,
                "hospitalization_indicator": h_ind,
                "mortality_indicator": m_ind,
                "action": action_text
            })

        # Calculate trajectory trend and peak day
        if rows:
            first_htsi = rows[0]["htsi"]
            last_htsi = rows[-1]["htsi"]
            change = round(last_htsi - first_htsi, 1)

            if change >= 8.0:
                direction = "RAPIDLY RISING"
            elif change >= 2.0:
                direction = "RISING"
            elif change <= -2.0:
                direction = "FALLING"
            else:
                direction = "STABLE"

            peak_row = max(rows, key=lambda x: x["htsi"])
        else:
            direction = "STABLE"
            change = 0.0
            peak_row = None

        early_warning = {
            "status": peak_row["thermal_risk"] if peak_row else "MONITOR",
            "label": f"{peak_row['thermal_risk']} FORECAST" if peak_row and peak_row['htsi'] >= 60.0 else "FORECAST MONITORING",
            "days_ahead": peak_row["day_index"] if peak_row else 1,
            "action": peak_row["action"] if peak_row else "MONITOR"
        }

        return Response({
            "trend": {
                "direction": direction,
                "change": change
            },
            "peak": peak_row,
            "early_warning": early_warning,
            "earlyWarning": early_warning,
            "vulnerability_score": vulnerability_score,
            "forecast": rows,
            "warning": "Forecast models convert weather into Human Thermal Stress Index. Historical calibration recommended before emergency operations."
        }, status=status.HTTP_200_OK)


# =====================================================================
# 8. POPULATION VULNERABILITY VIEW (/vulnerability, /api/vulnerability)
# =====================================================================
class UnifiedVulnerabilityView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            lat, lon = DEFAULT_LAT, DEFAULT_LON

        location_name = request.query_params.get('location', request.query_params.get('city'))
        if not location_name:
            location_name, _ = _get_nearest_city(lat, lon)

        provider = OpenMeteoProvider()
        weather = provider.get_current_weather(lat, lon)
        temp = float(weather.get('temperature', 36.0))
        humidity = float(weather.get('humidity', 65.0))
        wind = float(weather.get('wind_speed', 2.0))
        solar = float(weather.get('solar_radiation', 700.0) or 700.0)

        wards = list(Ward.objects.all())
        results = []

        if wards and abs(lat - DEFAULT_LAT) < 1.0 and abs(lon - DEFAULT_LON) < 1.0:
            for w in wards:
                thermal = calculate_htsi(
                    temperature_c=temp,
                    humidity_pct=humidity,
                    wind_speed_ms=wind,
                    solar_radiation_wm2=solar,
                    vulnerability_score=w.vulnerability_score
                )
                htsi_val = thermal["htsi"]
                risk_val = thermal["risk_level"]

                vuln_level = "CRITICAL" if w.vulnerability_score >= 75.0 else ("HIGH" if w.vulnerability_score >= 60.0 else "MODERATE")
                p_score = round((htsi_val * (w.population / 1000.0) * w.vulnerability_score) / 100.0, 1)

                if htsi_val >= 80.0 or w.vulnerability_score >= 75.0:
                    p_level = "CRITICAL"
                elif htsi_val >= 60.0 or w.vulnerability_score >= 60.0:
                    p_level = "URGENT"
                elif htsi_val >= 40.0:
                    p_level = "HIGH"
                else:
                    p_level = "WATCH"

                elderly_pct = round(12.0 + (w.vulnerability_score * 0.1), 0)
                worker_pct = round(w.outdoor_worker_ratio * 100.0, 0)

                results.append({
                    "name": w.name,
                    "ward_id": w.ward_id,
                    "population": w.population,
                    "elderly_percent": elderly_pct,
                    "outdoor_worker_percent": worker_pct,
                    "exposure": round(min(100.0, htsi_val * 1.05), 0),
                    "vulnerability_score": w.vulnerability_score,
                    "vulnerability_level": vuln_level,
                    "thermal_risk": risk_val,
                    "htsi": htsi_val,
                    "priority_level": p_level,
                    "priority_score": p_score
                })
        else:
            city_name, _ = _get_nearest_city(lat, lon)
            zones = [
                ("Industrial & Port Area", 48200, 14.0, 62.0, 78.0, 1.2),
                ("High-Density Old City Sector", 55400, 22.0, 48.0, 72.0, 1.1),
                ("Informal Settlement Colony", 38600, 18.0, 58.0, 84.0, 1.3),
                ("Central Commercial Market", 41200, 15.0, 52.0, 64.0, 1.0),
                ("Coastal Worker Habitation", 32100, 16.0, 45.0, 58.0, 0.9),
                ("Suburban Residential Colony", 29500, 19.0, 28.0, 42.0, 0.7)
            ]

            for z_name, pop, elderly, worker, vuln, exp_mult in zones:
                thermal = calculate_htsi(
                    temperature_c=temp,
                    humidity_pct=humidity,
                    wind_speed_ms=wind,
                    solar_radiation_wm2=solar,
                    vulnerability_score=vuln
                )
                htsi_val = thermal["htsi"]
                risk_val = thermal["risk_level"]

                vuln_level = "CRITICAL" if vuln >= 75.0 else ("HIGH" if vuln >= 60.0 else "MODERATE")
                p_score = round((htsi_val * (pop / 1000.0) * vuln) / 100.0, 1)

                if htsi_val >= 80.0 or vuln >= 75.0:
                    p_level = "CRITICAL"
                elif htsi_val >= 60.0 or vuln >= 60.0:
                    p_level = "URGENT"
                elif htsi_val >= 40.0:
                    p_level = "HIGH"
                else:
                    p_level = "WATCH"

                results.append({
                    "name": f"{city_name} - {z_name}",
                    "population": pop,
                    "elderly_percent": elderly,
                    "outdoor_worker_percent": worker,
                    "exposure": round(min(100.0, htsi_val * exp_mult), 0),
                    "vulnerability_score": vuln,
                    "vulnerability_level": vuln_level,
                    "thermal_risk": risk_val,
                    "htsi": htsi_val,
                    "priority_level": p_level,
                    "priority_score": p_score
                })

        results.sort(key=lambda x: x["priority_score"], reverse=True)
        return Response({"areas": results, "zones": results}, status=status.HTTP_200_OK)


# =====================================================================
# 9. AUTOMATED HEAT ACTION PLAN (/action-plan, /api/action-plan)
# =====================================================================
class UnifiedActionPlanView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            htsi = float(request.query_params.get('htsi', 50.0))
        except (ValueError, TypeError):
            htsi = 50.0

        try:
            population = int(float(request.query_params.get('population', 35600)))
        except (ValueError, TypeError):
            population = 35600

        try:
            mortality = float(request.query_params.get('mortality', 20.0))
        except (ValueError, TypeError):
            mortality = 20.0

        try:
            hospitalization = float(request.query_params.get('hospitalization', 30.0))
        except (ValueError, TypeError):
            hospitalization = 30.0

        # Evaluate NDMA/IMD response level
        if htsi >= 80.0 or mortality >= 35.0:
            level = "ACTIVATE"
            actions = [
                "Open all municipal 24/7 air-conditioned cooling centers",
                "Deploy paramedical dehydration and heat-stroke response vans",
                "Enforce mandatory outdoor labor moratorium (11:00 to 16:00)",
                "Disclose water tanker schedules and distribute ORS packets in informal settlements",
                "Prioritize power grid resilience to prevent residential blackout surges"
            ]
        elif htsi >= 60.0 or mortality >= 20.0:
            level = "PREPARE"
            actions = [
                "Alert hospital emergency departments to prep extra hydration beds",
                "Deploy drinking water tankers to high-density transit corridors",
                "Instruct construction contractors to implement shaded rest breaks",
                "Issue public heat advisory via municipal communication channels"
            ]
        elif htsi >= 40.0:
            level = "WATCH"
            actions = [
                "Maintain continuous meteorological and ward-level thermal surveillance",
                "Verify functional status of public water kiosks and shaded canopies",
                "Monitor vulnerable elderly and outdoor workforce clusters"
            ]
        else:
            level = "ROUTINE"
            actions = [
                "Routine biometeorological monitoring in progress",
                "Standard municipal healthcare preparedness"
            ]

        return Response({
            "activation_level": level,
            "trigger_htsi": round(htsi, 1),
            "estimated_population": population,
            "hospitalization_indicator": round(hospitalization, 0),
            "mortality_indicator": round(mortality, 0),
            "actions": actions
        }, status=status.HTTP_200_OK)


# =====================================================================
# 10. EMERGENCY PRIORITIZATION VIEW (/emergency-priority, /api/emergency-priority)
# =====================================================================
class UnifiedEmergencyPriorityView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        try:
            lat = float(request.query_params.get('latitude', request.query_params.get('lat', DEFAULT_LAT)))
            lon = float(request.query_params.get('longitude', request.query_params.get('lon', DEFAULT_LON)))
        except (ValueError, TypeError):
            lat, lon = DEFAULT_LAT, DEFAULT_LON

        try:
            htsi = float(request.query_params.get('htsi', 55.0))
        except (ValueError, TypeError):
            htsi = 55.0

        location_name = request.query_params.get('location', request.query_params.get('city'))
        if not location_name:
            location_name, _ = _get_nearest_city(lat, lon)

        wards = list(Ward.objects.all())
        areas = []

        if wards and abs(lat - DEFAULT_LAT) < 1.0 and abs(lon - DEFAULT_LON) < 1.0:
            for w in wards:
                score = round((w.current_htsi * (w.population / 1000.0) * w.vulnerability_score) / 100.0, 1)
                if w.current_htsi >= 80.0 or w.vulnerability_score >= 75.0:
                    p_level = "CRITICAL"
                elif w.current_htsi >= 60.0 or w.vulnerability_score >= 60.0:
                    p_level = "URGENT"
                elif w.current_htsi >= 40.0:
                    p_level = "HIGH"
                else:
                    p_level = "WATCH"

                areas.append({
                    "name": w.name,
                    "population": w.population,
                    "vulnerability": w.vulnerability_score,
                    "exposure": round(min(100.0, w.current_htsi * 1.05), 0),
                    "priority_level": p_level,
                    "priority_score": score
                })
        else:
            city_name, _ = _get_nearest_city(lat, lon)
            mock_areas = [
                ("Gajuwaka Industrial Belt", 48200, 72.0, 85.0),
                ("Madhurawada Tech Hub", 35600, 55.0, 68.0),
                ("Old Town Dense Market", 51200, 68.0, 78.0),
                ("MVP Colony Residential", 22100, 42.0, 52.0),
                ("Bheemunipatnam Coastal Zone", 31800, 58.0, 64.0)
            ]
            for name, pop, vuln, exp in mock_areas:
                eff_htsi = max(htsi, exp)
                score = round((eff_htsi * (pop / 1000.0) * vuln) / 100.0, 1)
                if eff_htsi >= 80.0 or vuln >= 75.0:
                    p_level = "CRITICAL"
                elif eff_htsi >= 60.0 or vuln >= 60.0:
                    p_level = "URGENT"
                elif eff_htsi >= 40.0:
                    p_level = "HIGH"
                else:
                    p_level = "WATCH"

                areas.append({
                    "name": f"{city_name} - {name}",
                    "population": pop,
                    "vulnerability": vuln,
                    "exposure": exp,
                    "priority_level": p_level,
                    "priority_score": score
                })

        areas.sort(key=lambda x: x["priority_score"], reverse=True)
        for rank, a in enumerate(areas, start=1):
            a["rank"] = rank

        return Response({"areas": areas}, status=status.HTTP_200_OK)


# =====================================================================
# 11. WHAT-IF SCENARIO SIMULATION VIEW (/simulate, /api/simulate)
# =====================================================================
class UnifiedSimulationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def handle_simulation(self, temp, humidity, wind, solar, vuln=50.0):
        # 1. Thermal Calculations
        thermal = calculate_htsi(
            temperature_c=temp,
            humidity_pct=humidity,
            wind_speed_ms=wind,
            solar_radiation_wm2=solar,
            vulnerability_score=vuln
        )

        # 2. ML Inference
        try:
            ml_res = get_ml_prediction(
                temperature=temp,
                humidity=humidity,
                wind_speed=wind,
                solar_radiation=solar,
                vulnerability_score=vuln
            )
            ml_htsi = ml_res.get("predicted_htsi", thermal["htsi"])
        except Exception:
            ml_htsi = thermal["htsi"]

        final_htsi = round(0.5 * thermal["htsi"] + 0.5 * ml_htsi, 1)
        risk_level = classify_risk(final_htsi)
        emoji = get_risk_emoji(risk_level)

        # 3. Health Impact Projections
        mortality_raw = max(0.0, ((final_htsi - 30.0) / 70.0) ** 1.35 * 65.0 + (vuln / 100.0) * 20.0 + max(0.0, (thermal["wbgt"] - 28.0) * 3.0))
        hosp_raw = max(0.0, ((final_htsi - 25.0) / 75.0) ** 1.2 * 72.0 + (vuln / 100.0) * 22.0 + max(0.0, (temp - 32.0) * 1.8))

        mortality = round(min(100.0, max(0.0, mortality_raw)), 1)
        hospitalization = round(min(100.0, max(0.0, hosp_raw)), 1)

        if final_htsi >= 80.0:
            msg = "Extreme thermal stress. Danger of heat stroke and severe physiological strain with continued physical exposure."
        elif final_htsi >= 60.0:
            msg = "High thermal danger. Rapid onset of heat exhaustion and severe dehydration likely without hydration and shade."
        elif final_htsi >= 40.0:
            msg = "Moderate heat conditions. Elevated fatigue and cardiovascular stress possible with strenuous activity."
        else:
            msg = "Conditions within tolerable thermal safety ranges for healthy individuals."

        return {
            "htsi": final_htsi,
            "risk": risk_level,
            "emoji": emoji,
            "heat_index": thermal["heat_index"],
            "wbgt": thermal["wbgt"],
            "utci": thermal["utci"],
            "health": {
                "hospitalization": hospitalization,
                "mortality": mortality
            },
            "message": msg
        }

    def get(self, request):
        try:
            temp = float(request.query_params.get('temperature', 40.0))
            humidity = float(request.query_params.get('humidity', 70.0))
            wind = float(request.query_params.get('wind', 2.0))
            solar = float(request.query_params.get('solar', 700.0))
            vuln = float(request.query_params.get('vulnerability', 50.0))
        except (ValueError, TypeError):
            return Response({"detail": "Invalid numeric simulation parameters."}, status=status.HTTP_400_BAD_REQUEST)

        data = self.handle_simulation(temp, humidity, wind, solar, vuln)
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            temp = float(request.data.get('temperature', 40.0))
            humidity = float(request.data.get('humidity', 70.0))
            wind = float(request.data.get('wind', request.data.get('wind_speed', 2.0)))
            solar = float(request.data.get('solar', request.data.get('solar_radiation', 700.0)))
            vuln = float(request.data.get('vulnerability', request.data.get('vulnerability_score', 50.0)))
        except (ValueError, TypeError):
            return Response({"detail": "Invalid numeric simulation parameters."}, status=status.HTTP_400_BAD_REQUEST)

        data = self.handle_simulation(temp, humidity, wind, solar, vuln)
        return Response(data, status=status.HTTP_200_OK)


# =====================================================================
# 12. FRONTEND SINGLE-PAGE APP VIEW (Serves Dashboard 1 UI directly)
# =====================================================================
def serve_dashboard1_index(request):
    """Serve Dashboard 1 index.html at root '/'"""
    # Look in static or frontend or templates directory
    candidates = [
        Path(settings.BASE_DIR) / 'templates' / 'index.html',
        Path(settings.BASE_DIR).parent / 'frontend' / 'index.html',
        Path(settings.BASE_DIR) / 'staticfiles' / 'index.html',
        Path(settings.BASE_DIR).parent / 'dashboard1_index.html',
    ]
    for p in candidates:
        if p.exists():
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/html; charset=utf-8')

    return HttpResponse("<h1>HeatHealthAI Dashboard</h1><p>Frontend file loading...</p>", content_type='text/html')

def serve_dashboard1_css(request):
    """Serve Dashboard 1 style.css directly"""
    candidates = [
        Path(settings.BASE_DIR) / 'static' / 'style.css',
        Path(settings.BASE_DIR).parent / 'frontend' / 'style.css',
        Path(settings.BASE_DIR) / 'staticfiles' / 'style.css',
        Path(settings.BASE_DIR).parent / 'dashboard1_style.css',
    ]
    for p in candidates:
        if p.exists():
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='text/css; charset=utf-8')
    return HttpResponse("/* style.css not found */", content_type='text/css')

def serve_dashboard1_js(request):
    """Serve Dashboard 1 app.js directly"""
    candidates = [
        Path(settings.BASE_DIR) / 'static' / 'app.js',
        Path(settings.BASE_DIR).parent / 'frontend' / 'app.js',
        Path(settings.BASE_DIR) / 'staticfiles' / 'app.js',
        Path(settings.BASE_DIR).parent / 'dashboard1_app.js',
    ]
    for p in candidates:
        if p.exists():
            with open(p, 'r', encoding='utf-8') as f:
                content = f.read()
            return HttpResponse(content, content_type='application/javascript; charset=utf-8')
    return HttpResponse("// app.js not found", content_type='application/javascript')
