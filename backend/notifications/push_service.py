import json
import logging
from django.conf import settings
from pywebpush import webpush, WebPushException
from .models import NotificationSubscription

logger = logging.getLogger(__name__)

def send_push_to_user(user, title: str, body: str, data: dict = None):
    """
    Send Web Push notification to all active subscriptions of a user.
    """
    if not user:
        return False

    subs = NotificationSubscription.objects.filter(user=user, active=True)
    if not subs.exists():
        return False

    vapid_private_key = getattr(settings, 'VAPID_PRIVATE_KEY', None)
    vapid_email = getattr(settings, 'VAPID_EMAIL', 'mailto:admin@heathealthai.org')

    payload = json.dumps({
        "title": title,
        "body": body,
        "icon": "/vite.svg",
        "badge": "/vite.svg",
        "data": data or {},
        "tag": "heat-stress-alert"
    })

    sent_any = False
    for sub in subs:
        subscription_info = {
            "endpoint": sub.endpoint,
            "keys": {
                "p256dh": sub.p256dh,
                "auth": sub.auth
            }
        }
        try:
            if vapid_private_key:
                webpush(
                    subscription_info=subscription_info,
                    data=payload,
                    vapid_private_key=vapid_private_key,
                    vapid_claims={"sub": vapid_email},
                    ttl=3600
                )
            logger.info(f"Dispatched Web Push to user {user.email}")
            sent_any = True
        except WebPushException as ex:
            logger.warning(f"WebPushException for sub {sub.id}: {ex}")
            # If endpoint is invalid or expired (404/410), deactivate subscription
            if ex.response is not None and ex.response.status_code in [404, 410]:
                sub.active = False
                sub.save(update_fields=['active'])
        except Exception as e:
            logger.warning(f"Unexpected error sending push: {e}")

    return sent_any
