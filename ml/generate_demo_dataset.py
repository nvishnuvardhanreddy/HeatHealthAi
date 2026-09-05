import os
import math
import random
import pandas as pd
import numpy as np
from pathlib import Path

# Thermal helper
def calc_heat_index(T, RH):
    T_f = (T * 9/5) + 32
    hi_f = -42.379 + 2.04901523*T_f + 10.14333127*RH - 0.22475541*T_f*RH - 0.00683783*(T_f**2) - 0.05481717*(RH**2) + 0.00122874*(T_f**2)*RH + 0.00085282*T_f*(RH**2) - 0.00000199*(T_f**2)*(RH**2)
    return (hi_f - 32) * 5/9

def calc_wbgt(T, RH, wind, solar):
    tw = T * math.atan(0.151977 * math.sqrt(RH + 8.313659)) + math.atan(T + RH) - math.atan(RH - 1.676331) + 0.00391838 * (RH**1.5) * math.atan(0.023101*RH) - 4.686035
    tg = T + (0.015 * solar) / max(0.5, math.sqrt(wind))
    return (0.7 * tw) + (0.2 * tg) + (0.1 * T)

def calc_utci(T, RH, wind, solar):
    tmrt = T + (0.028 * (solar**0.82)) / (wind**0.25 + 0.5)
    e = (RH / 100.0) * 6.112 * math.exp((17.67 * T) / (T + 243.5))
    delta_mrt = tmrt - T
    return T + 0.607*delta_mrt - 0.022*(wind - 1.0)*(T - 20.0) + 0.009*(e - 10.0)

def generate_dataset(num_samples=3000, output_file=None):
    """
    Generate realistic synthetic biometeorological dataset for Visakhapatnam climate.
    """
    np.random.seed(42)
    random.seed(42)

    data = []
    base_hours = np.random.randint(0, 24, size=num_samples)
    base_days = np.random.randint(90, 180, size=num_samples)

    for i in range(num_samples):
        hour = int(base_hours[i])
        day = int(base_days[i])

        # Diurnal temperature cycle
        solar_factor = max(0.0, math.sin(max(0, hour - 6) / 12.0 * math.pi)) if 6 <= hour <= 18 else 0.0
        ambient_temp = 28.0 + (solar_factor * 13.5) + np.random.normal(0, 1.8)
        ambient_temp = float(np.clip(ambient_temp, 26.0, 46.0))

        # Relative humidity inversely correlated with temperature
        rh = 85.0 - (solar_factor * 35.0) + np.random.normal(0, 4.0)
        rh = float(np.clip(rh, 40.0, 96.0))

        wind = float(np.clip(np.random.gamma(shape=2.5, scale=1.0), 0.5, 8.5))
        solar = float(np.clip((solar_factor * 950.0) + np.random.normal(0, 40.0), 0.0, 1050.0))

        # Demographic vulnerability
        vuln_score = float(np.clip(np.random.choice([38.0, 45.0, 62.0, 72.0, 78.0]) + np.random.normal(0, 3.0), 20.0, 95.0))
        pop_density = float(np.random.choice([3100, 4200, 4900, 8500, 9200]))

        # Exposure duration (cumulative high-temp hours)
        heat_exposure_duration = float(np.clip(max(0, hour - 10) if ambient_temp > 35 else 0, 0, 8))

        hi = calc_heat_index(ambient_temp, rh)
        wbgt = calc_wbgt(ambient_temp, rh, wind, solar)
        utci = calc_utci(ambient_temp, rh, wind, solar)

        # Ground truth target: Composite HTSI (0-100)
        s_temp = np.clip((ambient_temp - 20) / (48 - 20) * 100, 0, 100)
        s_rh = np.clip((rh - 20) / (95 - 20) * 100, 0, 100)
        s_wbgt = np.clip((wbgt - 18) / (38 - 18) * 100, 0, 100)
        s_utci = np.clip((utci - 20) / (46 - 20) * 100, 0, 100)
        s_biomet = (s_wbgt * 0.5) + (s_utci * 0.5)
        s_solar = np.clip(solar / 1000 * 100, 0, 100)
        s_wind = np.clip(wind / 10 * 100, 0, 100)
        s_vuln = np.clip(vuln_score, 0, 100)

        target_htsi = (
            (0.30 * s_temp)
            + (0.20 * s_rh)
            + (0.25 * s_biomet)
            + (0.10 * s_solar)
            - (0.05 * s_wind)
            + (0.10 * s_vuln)
            + np.random.normal(0, 0.75) # Realistic noise
        )
        target_htsi = float(np.clip(target_htsi, 5.0, 98.0))

        data.append({
            "temperature": round(ambient_temp, 2),
            "humidity": round(rh, 2),
            "wind_speed": round(wind, 2),
            "solar_radiation": round(solar, 2),
            "heat_index": round(hi, 2),
            "wbgt": round(wbgt, 2),
            "utci": round(utci, 2),
            "vulnerability_score": round(vuln_score, 2),
            "population_density": round(pop_density, 1),
            "hour": hour,
            "day_of_year": day,
            "heat_exposure_duration": round(heat_exposure_duration, 1),
            "htsi": round(target_htsi, 2)
        })

    df = pd.DataFrame(data)
    if output_file is None:
        output_file = Path(__file__).resolve().parent / "heat_stress_dataset.csv"
    df.to_csv(output_file, index=False)
    print(f"Generated {len(df)} synthetic samples at: {output_file}")
    return df

if __name__ == "__main__":
    generate_dataset()
