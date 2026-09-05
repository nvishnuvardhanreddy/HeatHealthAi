import os
import json
from pathlib import Path
import joblib
import pandas as pd
from preprocessing import FEATURE_COLUMNS

CURRENT_DIR = Path(__file__).resolve().parent
MODEL_PATH = CURRENT_DIR / "heat_risk_model.joblib"
METADATA_PATH = CURRENT_DIR / "model_metadata.json"

_cached_model = None
_cached_metadata = None

def get_model():
    global _cached_model, _cached_metadata
    if _cached_model is None:
        if not MODEL_PATH.exists():
            from train_model import train
            _cached_model, _cached_metadata = train()
        else:
            _cached_model = joblib.load(MODEL_PATH)
            if METADATA_PATH.exists():
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    _cached_metadata = json.load(f)
    return _cached_model, _cached_metadata

def predict_thermal_stress(features_dict: dict) -> dict:
    """
    Predict HTSI given a feature dictionary and return explainable drivers.
    """
    model, metadata = get_model()

    # Align feature vector
    row = {col: float(features_dict.get(col, 0.0)) for col in FEATURE_COLUMNS}
    df_in = pd.DataFrame([row])

    pred = float(model.predict(df_in)[0])
    pred = round(max(0.0, min(100.0, pred)), 1)

    # Risk level classification
    if pred <= 20.0:
        risk = "LOW"
    elif pred <= 40.0:
        risk = "MODERATE"
    elif pred <= 60.0:
        risk = "HIGH"
    elif pred <= 80.0:
        risk = "VERY HIGH"
    else:
        risk = "EXTREME"

    # Global and local feature contributions
    feat_importances = metadata.get("feature_importance", {}) if metadata else {}

    return {
        "predicted_htsi": pred,
        "predicted_risk": risk,
        "features_evaluated": row,
        "feature_importance": feat_importances,
        "model_info": {
            "name": metadata.get("model_name", "RandomForest Regressor") if metadata else "Random Forest",
            "metrics": metadata.get("metrics", {}) if metadata else {},
            "training_data": metadata.get("training_data", "Synthetic Demo") if metadata else "Synthetic Demo",
            "disclaimer": "Prototype model using synthetic/demo training data. AI-generated decision-support estimate."
        }
    }
