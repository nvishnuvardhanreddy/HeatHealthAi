import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    "temperature",
    "humidity",
    "wind_speed",
    "solar_radiation",
    "heat_index",
    "wbgt",
    "utci",
    "vulnerability_score",
    "population_density",
    "hour",
    "day_of_year",
    "heat_exposure_duration",
]

TARGET_COLUMN = "htsi"

def prepare_features_target(df: pd.DataFrame):
    """Separate features and target, impute missing values if any."""
    X = df[FEATURE_COLUMNS].copy()
    y = df[TARGET_COLUMN].copy()
    X = X.fillna(X.median())
    return X, y

def get_train_test_data(df: pd.DataFrame, test_size: float = 0.2, random_state: int = 42):
    X, y = prepare_features_target(df)
    return train_test_split(X, y, test_size=test_size, random_state=random_state)
