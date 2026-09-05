#!/usr/bin/env bash
# Exit on error
set -o errexit

echo "===> Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

echo "===> Collecting static files..."
python backend/manage.py collectstatic --no-input

echo "===> Running database migrations..."
python backend/manage.py migrate

echo "===> Training ML model and synchronizing demonstration data..."
python backend/manage.py train_risk_model
python backend/manage.py seed_demo_data

echo "===> HeatHealthAI Backend Build Complete!"
