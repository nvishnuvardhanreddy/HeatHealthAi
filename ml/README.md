# HeatHealthAI Machine Learning Pipeline

## Overview
The HeatHealthAI ML pipeline predicts localized **Human Thermal Stress Index (HTSI)** (0–100 continuous scale) and classifies thermal risk into five operational tiers: `LOW`, `MODERATE`, `HIGH`, `VERY HIGH`, and `EXTREME`.

## Features
The model ingests 12 localized biometeorological, environmental, and demographic attributes:
1. `temperature`: Dry-bulb air temperature (°C)
2. `humidity`: Relative humidity (%)
3. `wind_speed`: 10-meter wind velocity (m/s)
4. `solar_radiation`: Direct & global surface solar irradiance (W/m²)
5. `heat_index`: Rothfusz NWS Heat Index (°C)
6. `wbgt`: Wet Bulb Globe Temperature (°C)
7. `utci`: Universal Thermal Climate Index (°C)
8. `vulnerability_score`: Demographic and socio-economic vulnerability (0–100)
9. `population_density`: Inhabitants per square kilometer
10. `hour`: Hour of day (0–23)
11. `day_of_year`: Day of year (diurnal and seasonal cycle)
12. `heat_exposure_duration`: Cumulative consecutive hours above 35°C

## Algorithm & Validation
- **Model**: `RandomForestRegressor` (120 estimators, max depth 14)
- **Validation**: 80/20 train/test holdout split.
- **Genuine Metrics**: Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and $R^2$ coefficient of determination are strictly computed on the unseen test partition and saved to `model_metadata.json`.

## Explainable AI (XAI)
Feature importance rankings describe which meteorological and demographic factors drive thermal stress danger (e.g. Temperature, Biomet Indices, Humidity, Solar Irradiance, and Vulnerability).

## Scientific & Data Disclaimer
Prototype model using synthetic/demo training data. AI-generated decision-support estimate. Requires validation using historical local meteorological and health data before operational deployment.
