from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Alert

class AlertListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        if request.user and request.user.is_authenticated:
            alerts = Alert.objects.filter(user=request.user).order_by('-created_at')[:20]
            if not alerts.exists():
                alerts = Alert.objects.all().order_by('-created_at')[:10]
        else:
            alerts = Alert.objects.all().order_by('-created_at')[:10]

        data = []
        for a in alerts:
            data.append({
                "id": a.id,
                "title": a.title,
                "alert_type": a.alert_type,
                "risk_level": a.risk_level,
                "htsi": a.htsi,
                "ward": a.ward.name if a.ward else "Visakhapatnam District",
                "message": a.message,
                "recommended_actions": a.recommended_actions,
                "is_read": a.is_read,
                "created_at": a.created_at.isoformat()
            })
        return Response(data, status=status.HTTP_200_OK)


class AlertMarkReadView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            alert = Alert.objects.get(pk=pk, user=request.user)
            alert.is_read = True
            alert.save(update_fields=['is_read'])
            return Response({"message": "Alert marked as read."}, status=status.HTTP_200_OK)
        except Alert.DoesNotExist:
            return Response({"detail": "Alert not found."}, status=status.HTTP_404_NOT_FOUND)
