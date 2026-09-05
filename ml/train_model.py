import os
import json
from datetime import datetime, timezone
from pathlib import Path
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

from generate_demo_dataset import generate_dataset
from preprocessing import FEATURE_COLUMNS, get_train_test_data

CURRENT_DIR = Path(__file__).resolve().parent
DATASET_PATH = CURRENT_DIR / "heat_stress_dataset.csv"
MODEL_PATH = CURRENT_DIR / "heat_risk_model.joblib"
METADATA_PATH = CURRENT_DIR / "model_metadata.json"

def train():
    print("=" * 60)
    print("HeatHealthAI: Training Thermal Stress Machine Learning Model")
    print("=" * 60)

    if not DATASET_PATH.exists():
        print("Dataset not found. Generating synthetic demo dataset...")
        df = generate_dataset(num_samples=3500, output_file=DATASET_PATH)
    else:
        print(f"Loading dataset from: {DATASET_PATH}")
        df = pd.read_csv(DATASET_PATH)

    print(f"Total dataset records: {len(df)}")
    X_train, X_test, y_train, y_test = get_train_test_data(df)
    print(f"Training samples: {len(X_train)}, Testing samples: {len(X_test)}")

    print("\nTraining RandomForestRegressor...")
    model = RandomForestRegressor(
        n_estimators=120,
        max_depth=14,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # Evaluate on holdout test set
    y_pred = model.predict(X_test)
    mae = float(mean_absolute_error(y_test, y_pred))
    mse = float(mean_squared_error(y_test, y_pred))
    rmse = float(np.sqrt(mse))
    r2 = float(r2_score(y_test, y_pred))

    print("\n--- Model Validation Metrics (Computed on Holdout Test Set) ---")
    print(f"Mean Absolute Error (MAE) : {mae:.3f}")
    print(f"Root Mean Squared Error (RMSE): {rmse:.3f}")
    print(f"Coefficient of Determination (R²): {r2:.4f}")

    # Feature Importance analysis (Explainable AI)
    importances = model.feature_importances_
    feat_imp = {}
    for col, imp in sorted(zip(FEATURE_COLUMNS, importances), key=lambda x: x[1], reverse=True):
        feat_imp[col] = round(float(imp), 4)

    print("\n--- Feature Importance Ranking ---")
    for feat, score in feat_imp.items():
        bar = "#" * int(score * 40)
        print(f"{feat:24} {score:.4f} {bar}")

    # Save model artifact
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel artifact serialized to: {MODEL_PATH}")

    # Save metadata
    metadata = {
        "model_name": "RandomForest Thermal Stress Regressor",
        "algorithm": "RandomForestRegressor",
        "n_estimators": 120,
        "max_depth": 14,
        "features": FEATURE_COLUMNS,
        "metrics": {
            "mae": round(mae, 3),
            "rmse": round(rmse, 3),
            "r2": round(r2, 4)
        },
        "feature_importance": feat_imp,
        "training_data": "Synthetic Demo / Prototype Meteorological Records (Visakhapatnam)",
        "trained_at": datetime.now(timezone.utc).isoformat(),
        "disclaimer": "Prototype model using synthetic/demo training data. Requires validation using historical local meteorological and health data before operational deployment."
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)
    print(f"Model metadata saved to: {METADATA_PATH}")
    print("=" * 60)
    return model, metadata

if __name__ == "__main__":
    train()
