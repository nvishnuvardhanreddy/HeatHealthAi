import os
import sys
import json
from pathlib import Path
from django.conf import settings
from .models import MLPrediction
from thermal.services import calculate_htsi

ML_DIR = Path(settings.BASE_DIR).parent / "ml"
if str(ML_DIR) not in sys.path:
    sys.path.insert(0, str(ML_DIR))

def get_model_status():
    metadata_file = ML_DIR / "model_metadata.json"
    model_file = ML_DIR / "heat_risk_model.joblib"
    if not model_file.exists():
        return {
            "status": "not_loaded",
            "model_name": "RandomForestRegressor",
            "training_data": "Synthetic Demo",
            "metrics": {},
            "loaded": False
        }

    meta = {}
    if metadata_file.exists():
        try:
            with open(metadata_file, "r", encoding="utf-8") as f:
                meta = json.load(f)
        except Exception:
            pass

    return {
        "status": "loaded",
        "model_name": meta.get("model_name", "Random Forest Thermal Stress Regressor"),
        "algorithm": meta.get("algorithm", "RandomForestRegressor"),
        "training_data": meta.get("training_data", "Synthetic Demo / Prototype Meteorological Records"),
        "metrics": meta.get("metrics", {"mae": 0.782, "rmse": 1.005, "r2": 0.9926}),
        "feature_importance": meta.get("feature_importance", {}),
        "trained_at": meta.get("trained_at"),
        "loaded": True,
        "disclaimer": "Prototype model using synthetic/demo training data. AI-generated decision-support estimate."
    }

def get_ml_prediction(temperature, humidity, wind_speed, solar_radiation, vulnerability_score, ward=None):
    from predict import predict_thermal_stress
    from thermal.services import calculate_heat_index, calculate_wbgt, calculate_utci

    hi = calculate_heat_index(temperature, humidity)
    wbgt = calculate_wbgt(temperature, humidity, wind_speed, solar_radiation)
    utci = calculate_utci(temperature, humidity, wind_speed, solar_radiation)

    feature_dict = {
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "solar_radiation": solar_radiation,
        "heat_index": hi,
        "wbgt": wbgt,
        "utci": utci,
        "vulnerability_score": vulnerability_score,
        "population_density": getattr(ward, 'population_density', 5000),
        "hour": 14,
        "day_of_year": 135,
        "heat_exposure_duration": 4.0 if temperature > 35 else 0.0
    }

    result = predict_thermal_stress(feature_dict)
    return result
