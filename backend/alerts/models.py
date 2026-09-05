from django.db import models
from django.conf import settings

class Alert(models.Model):
    class AlertType(models.TextChoices):
        EXTREME_HEAT = 'EXTREME_HEAT', 'Extreme Heat Emergency'
        VERY_HIGH_HEAT = 'VERY_HIGH_HEAT', 'Very High Heat Warning'
        HIGH_HEAT = 'HIGH_HEAT', 'High Heat Advisory'
        ESCALATION = 'ESCALATION', 'Rapid Risk Escalation Alert'
        ACTION_RECOMMENDATION = 'ACTION_RECOMMENDATION', 'Protective Action Protocol'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.CASCADE, related_name='alerts')
    ward = models.ForeignKey('gis.Ward', null=True, blank=True, on_delete=models.SET_NULL, related_name='alerts')
    alert_type = models.CharField(max_length=40, choices=AlertType.choices, default=AlertType.HIGH_HEAT)
    risk_level = models.CharField(max_length=20, default='HIGH')
    htsi = models.FloatField()
    title = models.CharField(max_length=200)
    message = models.TextField()
    recommended_actions = models.JSONField(default=list)
    is_read = models.BooleanField(default=False)
    is_sent_push = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        target = self.user.email if self.user else (self.ward.name if self.ward else 'Broadcast')
        return f"[{self.risk_level}] {self.title} -> {target} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"
