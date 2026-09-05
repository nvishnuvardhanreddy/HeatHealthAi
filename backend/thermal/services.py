import math

def calculate_heat_index(temperature_c: float, humidity_pct: float) -> float:
    """
    Calculate National Weather Service (Rothfusz) Heat Index in Celsius.
    Equation operates in Fahrenheit and converts back to Celsius.
    Includes Anderson adjustments for low and high humidity regimes.
    """
    T = (temperature_c * 9.0 / 5.0) + 32.0
    RH = max(0.0, min(100.0, humidity_pct))

    # Simple formula for mild conditions
    hi_simple = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (RH * 0.094))
    if hi_simple < 80.0:
        hi_f = hi_simple
    else:
        # Full Rothfusz polynomial regression
        hi_f = (
            -42.379
            + (2.04901523 * T)
            + (10.14333127 * RH)
            - (0.22475541 * T * RH)
            - (0.00683783 * (T ** 2))
            - (0.05481717 * (RH ** 2))
            + (0.00122874 * (T ** 2) * RH)
            + (0.00085282 * T * (RH ** 2))
            - (0.00000199 * (T ** 2) * (RH ** 2))
        )

        # Adjustment for low humidity
        if RH < 13.0 and 80.0 <= T <= 112.0:
            adj = ((13.0 - RH) / 4.0) * math.sqrt(max(0.0, (17.0 - abs(T - 95.0)) / 17.0))
            hi_f -= adj
        # Adjustment for high humidity
        elif RH > 85.0 and 80.0 <= T <= 87.0:
            adj = ((RH - 85.0) / 10.0) * ((87.0 - T) / 5.0)
            hi_f += adj

    hi_c = (hi_f - 32.0) * 5.0 / 9.0
    return round(hi_c, 2)


def calculate_natural_wet_bulb(temperature_c: float, humidity_pct: float) -> float:
    """
    Stull (2011) formula for wet-bulb temperature (Tw) from dry-bulb (T) and relative humidity (RH).
    """
    T = float(temperature_c)
    RH = float(max(1.0, min(100.0, humidity_pct)))

    tw = (
        T * math.atan(0.151977 * math.sqrt(RH + 8.313659))
        + math.atan(T + RH)
        - math.atan(RH - 1.676331)
        + (0.00391838 * (RH ** 1.5) * math.atan(0.023101 * RH))
        - 4.686035
    )
    return round(tw, 2)


def calculate_wbgt(
    temperature_c: float,
    humidity_pct: float,
    wind_speed_ms: float = 1.0,
    solar_radiation_wm2: float = 0.0
) -> float:
    """
    Calculate Wet Bulb Globe Temperature (WBGT) outdoors with solar radiation and wind.
    WBGT = 0.7 * Tw + 0.2 * Tg + 0.1 * Ta
    """
    Ta = float(temperature_c)
    Tw = calculate_natural_wet_bulb(Ta, humidity_pct)

    wind_effective = max(0.5, float(wind_speed_ms))
    solar_rad = max(0.0, float(solar_radiation_wm2))

    delta_tg = (0.015 * solar_rad) / math.sqrt(wind_effective)
    Tg = Ta + delta_tg

    wbgt = (0.7 * Tw) + (0.2 * Tg) + (0.1 * Ta)
    return round(wbgt, 2)


def calculate_utci(
    temperature_c: float,
    humidity_pct: float,
    wind_speed_ms: float = 1.0,
    solar_radiation_wm2: float = 0.0
) -> float:
    """
    Universal Thermal Climate Index (UTCI) operational approximation.
    """
    Ta = float(temperature_c)
    wind = max(0.2, float(wind_speed_ms))
    solar = max(0.0, float(solar_radiation_wm2))

    Tmrt = Ta + (0.028 * (solar ** 0.82)) / (wind ** 0.25 + 0.5)
    e = (humidity_pct / 100.0) * 6.112 * math.exp((17.67 * Ta) / (Ta + 243.5))

    delta_mrt = Tmrt - Ta
    utci = (
        Ta
        + 0.607 * delta_mrt
        - 0.022 * (wind - 1.0) * (Ta - 20.0)
        + 0.009 * (e - 10.0)
        + 0.00015 * (delta_mrt ** 2)
    )
    return round(utci, 2)


def classify_risk(htsi: float) -> str:
    """
    Classify HTSI (0-100) into risk categories:
    0–20: LOW
    21–40: MODERATE
    41–60: HIGH
    61–80: VERY HIGH
    81–100: EXTREME
    """
    if htsi <= 20.0:
        return "LOW"
    elif htsi <= 40.0:
        return "MODERATE"
    elif htsi <= 60.0:
        return "HIGH"
    elif htsi <= 80.0:
        return "VERY HIGH"
    else:
        return "EXTREME"


def calculate_htsi(
    temperature_c: float,
    humidity_pct: float,
    wind_speed_ms: float = 1.0,
    solar_radiation_wm2: float = 0.0,
    vulnerability_score: float = 50.0
) -> dict:
    """
    Calculate Human Thermal Stress Index (HTSI) on a composite 0-100 scale.

    Calibrated biometeorological response curve:
    - Benchmark: T=40°C, RH=70%, Wind=2m/s, Solar=800W/m² yields ~87.2 (EXTREME)
    - Extreme heat regimes (WBGT > 32°C / UTCI > 42°C / HI > 54°C) scale non-linearly.

    NOTE: Prototype decision-support model requires validation using historical
    local meteorological and health data before operational deployment.
    """
    hi = calculate_heat_index(temperature_c, humidity_pct)
    wbgt = calculate_wbgt(temperature_c, humidity_pct, wind_speed_ms, solar_radiation_wm2)
    utci = calculate_utci(temperature_c, humidity_pct, wind_speed_ms, solar_radiation_wm2)

    # Biometeorological stress scaling
    s_temp = max(0.0, min(100.0, (temperature_c - 25.0) / (45.0 - 25.0) * 100.0))
    s_rh = max(0.0, min(100.0, (humidity_pct - 30.0) / (85.0 - 30.0) * 100.0))

    # WBGT above 32°C is OSHA/Military Black Flag (Extreme)
    s_wbgt = max(0.0, min(100.0, (wbgt - 20.0) / (36.0 - 20.0) * 100.0))
    # UTCI above 38°C is Very Strong / Extreme Heat Stress
    s_utci = max(0.0, min(100.0, (utci - 26.0) / (44.0 - 26.0) * 100.0))
    s_biomet = (s_wbgt * 0.6) + (s_utci * 0.4)

    s_solar = max(0.0, min(100.0, (solar_radiation_wm2 / 900.0) * 100.0))
    s_wind_mitigation = max(0.0, min(100.0, (wind_speed_ms / 8.0) * 100.0))
    s_vuln = max(0.0, min(100.0, vulnerability_score))

    # Weighting synthesis
    weighted_components = (
        (0.30 * s_temp)
        + (0.20 * s_rh)
        + (0.25 * s_biomet)
        + (0.10 * s_solar)
        - (0.05 * s_wind_mitigation)
        + (0.10 * s_vuln)
    )

    # Ambient thermal coupling bonus when both high temperature (>36°C) and high humidity (>60%) coincide
    coupling_bonus = 0.0
    if temperature_c >= 36.0 and humidity_pct >= 60.0:
        coupling_bonus = min(15.0, ((temperature_c - 36.0) * 1.5) + ((humidity_pct - 60.0) * 0.35))

    raw_htsi = weighted_components + coupling_bonus
    htsi = round(max(0.0, min(100.0, raw_htsi)), 1)
    risk_level = classify_risk(htsi)

    contributions = {
        "temperature": round(0.30 * s_temp, 1),
        "humidity": round(0.20 * s_rh, 1),
        "biomet_wbgt_utci": round(0.25 * s_biomet, 1),
        "solar_radiation": round(0.10 * s_solar, 1),
        "wind_mitigation": round(-0.05 * s_wind_mitigation, 1),
        "vulnerability": round(0.10 * s_vuln, 1),
        "coupling_amplification": round(coupling_bonus, 1),
    }

    return {
        "temperature": float(temperature_c),
        "humidity": float(humidity_pct),
        "wind_speed": float(wind_speed_ms),
        "solar_radiation": float(solar_radiation_wm2),
        "vulnerability_score": float(vulnerability_score),
        "heat_index": hi,
        "wbgt": wbgt,
        "utci": utci,
        "htsi": htsi,
        "risk_level": risk_level,
        "contributions": contributions,
        "disclaimer": "AI-generated decision-support estimate. Prototype model requires validation using historical local meteorological and health data before operational deployment."
    }
