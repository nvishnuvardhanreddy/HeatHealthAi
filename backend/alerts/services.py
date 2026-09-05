from datetime import timedelta
from django.conf import settings
from django.utils import timezone
from .models import Alert
from notifications.push_service import send_push_to_user

RISK_RANKS = {
    'LOW': 1,
    'MODERATE': 2,
    'HIGH': 3,
    'VERY HIGH': 4,
    'EXTREME': 5
}

def get_recommendations_for_htsi(htsi: float, risk_level: str):
    if htsi >= 80.0 or risk_level == 'EXTREME':
        return [
            "Avoid prolonged or unshaded outdoor exposure immediately.",
            "Drink plenty of water and oral rehydration salts (ORS) frequently, even before feeling thirsty.",
            "Seek air-conditioned or designated municipal cooling centers.",
            "Check on elderly neighbors, outdoor laborers, and children.",
            "Watch for heat exhaustion symptoms: dizziness, rapid pulse, profuse sweating, confusion."
        ]
    elif htsi >= 60.0 or risk_level == 'VERY HIGH':
        return [
            "Limit heavy physical outdoor exertion between 11:00 AM and 4:00 PM.",
            "Wear loose, lightweight, light-colored cotton clothing and broad-brimmed hats.",
            "Ensure pets and livestock have shaded shelter and abundant water.",
            "Keep curtains or blinds closed during the hottest daylight hours."
        ]
    elif htsi >= 40.0 or risk_level == 'HIGH':
        return [
            "Stay adequately hydrated throughout the day.",
            "Schedule unavoidable outdoor tasks for early morning or post-sunset hours.",
            "Monitor local heat advisories and weather updates."
        ]
    else:
        return [
            "Normal thermal comfort conditions. Maintain regular hydration."
        ]

def trigger_user_heat_alert(user, ward, htsi: float, risk_level: str):
    """
    Check if an alert should be issued to the user considering:
    1. Minimum risk threshold (HTSI >= 40 / HIGH)
    2. Cooldown period (ALERT_COOLDOWN_MINUTES)
    3. Escalation override (e.g. HIGH -> VERY HIGH or VERY HIGH -> EXTREME)
    """
    if htsi < 40.0 and risk_level not in ['HIGH', 'VERY HIGH', 'EXTREME']:
        return None, False

    cooldown_minutes = getattr(settings, 'ALERT_COOLDOWN_MINUTES', 120)
    cutoff_time = timezone.now() - timedelta(minutes=cooldown_minutes)

    last_alert = Alert.objects.filter(user=user).order_by('-created_at').first()

    is_escalation = False
    if last_alert:
        last_rank = RISK_RANKS.get(last_alert.risk_level, 0)
        curr_rank = RISK_RANKS.get(risk_level, 0)

        # Escalation condition: higher severity risk than previous alert
        if curr_rank > last_rank:
            is_escalation = True
        elif last_alert.created_at >= cutoff_time:
            # Under cooldown with equal or lower risk -> suppress duplicate alert
            return None, False

    # Determine alert type & title
    if is_escalation:
        alert_type = Alert.AlertType.ESCALATION
        title = f"RISK ESCALATION ALERT: {risk_level} Thermal Stress"
    elif risk_level == 'EXTREME':
        alert_type = Alert.AlertType.EXTREME_HEAT
        title = "EXTREME HEAT EMERGENCY ALERT"
    elif risk_level == 'VERY HIGH':
        alert_type = Alert.AlertType.VERY_HIGH_HEAT
        title = "VERY HIGH HEAT WARNING"
    else:
        alert_type = Alert.AlertType.HIGH_HEAT
        title = "HIGH HEAT STRESS ADVISORY"

    ward_name = ward.name if ward else "your current location"
    message = (
        f"Your current area ({ward_name}) is experiencing {risk_level} thermal stress conditions. "
        f"Localized Human Thermal Stress Index is currently {htsi:.1f}/100."
    )

    recs = get_recommendations_for_htsi(htsi, risk_level)

    alert = Alert.objects.create(
        user=user,
        ward=ward,
        alert_type=alert_type,
        risk_level=risk_level,
        htsi=htsi,
        title=title,
        message=message,
        recommended_actions=recs,
        is_sent_push=False
    )

    # Trigger Web Push notification if user has active push subscription
    push_sent = send_push_to_user(
        user=user,
        title=f"HeatHealthAI: {title}",
        body=f"{ward_name}: HTSI {htsi:.1f}/100 ({risk_level}). Tap to view action protocols.",
        data={"alert_id": alert.id, "htsi": htsi, "risk_level": risk_level}
    )

    if push_sent:
        alert.is_sent_push = True
        alert.save(update_fields=['is_sent_push'])

    return alert, True
