from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import NotificationSubscription

class PushSubscribeView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        endpoint = request.data.get('endpoint')
        keys = request.data.get('keys', {})
        p256dh = keys.get('p256dh')
        auth = keys.get('auth')

        if not endpoint or not p256dh or not auth:
            return Response({"detail": "Invalid push subscription object. Required keys: endpoint, keys.p256dh, keys.auth"}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user if request.user and request.user.is_authenticated else None
        user_agent = request.META.get('HTTP_USER_AGENT', '')

        sub, created = NotificationSubscription.objects.update_or_create(
            endpoint=endpoint,
            defaults={
                'user': user,
                'p256dh': p256dh,
                'auth': auth,
                'user_agent': user_agent[:250],
                'active': True
            }
        )

        return Response({
            "message": "Web Push subscription registered successfully.",
            "subscription_id": sub.id,
            "created": created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
