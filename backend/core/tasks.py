import logging
from celery import shared_task
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger(__name__)

@shared_task
def fetch_weather_data():
    """Ingest latest weather observations and update forecasts."""
    from weather.services import fetch_and_record_weather
    logger.info("Executing periodic Celery task: fetch_weather_data")
    obs, curr = fetch_and_record_weather()
    return f"Weather recorded for {obs.city}: {obs.temperature}°C, {obs.humidity}% RH"

@shared_task
def update_ward_risk():
    """Recalculate thermal risk and HTSI across all wards."""
    from gis.models import Ward
    from weather.providers import get_weather_provider
    from thermal.services import calculate_htsi
    from thermal.models import ThermalRisk

    logger.info("Executing periodic Celery task: update_ward_risk")
    provider = get_weather_provider()
    weather = provider.get_current_weather(17.6868, 83.2185)

    updated_wards = 0
    for w in Ward.objects.all():
        res = calculate_htsi(
            temperature_c=weather['temperature'],
            humidity_pct=weather['humidity'],
            wind_speed_ms=weather['wind_speed'],
            solar_radiation_wm2=weather.get('solar_radiation', 800.0),
            vulnerability_score=w.vulnerability_score
        )
        w.current_htsi = res['htsi']
        w.current_risk = res['risk_level']
        w.save(update_fields=['current_htsi', 'current_risk', 'last_risk_update'])

        ThermalRisk.objects.create(
            ward_name=w.name,
            latitude=w.centroid_lat,
            longitude=w.centroid_lon,
            timestamp=timezone.now(),
            temperature=res['temperature'],
            humidity=res['humidity'],
            wind_speed=res['wind_speed'],
            solar_radiation=res['solar_radiation'],
            heat_index=res['heat_index'],
            wbgt=res['wbgt'],
            utci=res['utci'],
            htsi=res['htsi'],
            risk_level=res['risk_level'],
            vulnerability_score=w.vulnerability_score,
            is_forecast=False,
            source=weather.get('source', 'Celery Worker')
        )
        updated_wards += 1

    return f"Updated thermal risk for {updated_wards} wards."

@shared_task
def generate_predictions():
    """Run ML predictions on forecast horizon."""
    from predictions.services import get_model_status
    logger.info("Executing periodic Celery task: generate_predictions")
    status = get_model_status()
    return f"ML Model status: {status.get('status')}"

@shared_task
def check_user_risk():
    """Check active users locations and issue alerts if in high risk zone."""
    from users.models import User
    from gis.services import get_ward_for_coordinates
    from alerts.services import trigger_user_heat_alert

    logger.info("Executing periodic Celery task: check_user_risk")
    users = User.objects.filter(location_enabled=True, last_latitude__isnull=False, last_longitude__isnull=False)
    alerts_triggered = 0

    for u in users:
        ward, is_inside, _ = get_ward_for_coordinates(u.last_latitude, u.last_longitude)
        if ward and ward.current_htsi >= 60.0:
            alert, triggered = trigger_user_heat_alert(u, ward, ward.current_htsi, ward.current_risk)
            if triggered:
                alerts_triggered += 1

    return f"Evaluated {users.count()} users; triggered {alerts_triggered} thermal alerts."

@shared_task
def send_heat_alerts():
    """Evaluate and dispatch broadcast heat alerts."""
    from interventions.services import evaluate_emergency_priorities
    logger.info("Executing periodic Celery task: send_heat_alerts")
    priorities = evaluate_emergency_priorities()
    return f"Re-evaluated {len(priorities)} emergency ward priorities."

@shared_task
def cleanup_old_data():
    """Clean up expired OTPs and historical logs older than 30 days."""
    from users.models import EmailOTP, PasswordResetToken
    from alerts.models import Alert
    cutoff = timezone.now() - timedelta(days=30)
    EmailOTP.objects.filter(expires_at__lt=timezone.now()).delete()
    PasswordResetToken.objects.filter(expires_at__lt=timezone.now()).delete()
    old_alerts_count = Alert.objects.filter(created_at__lt=cutoff).count()
    Alert.objects.filter(created_at__lt=cutoff).delete()
    return f"Data cleanup finished. Removed {old_alerts_count} stale records."
