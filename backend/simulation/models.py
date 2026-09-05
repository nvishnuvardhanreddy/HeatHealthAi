from django.db import models
from django.conf import settings

class Simulation(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='simulations')
    name = models.CharField(max_length=150, default='Custom Heat Scenario')
    timestamp = models.DateTimeField(auto_now_add=True)

    input_temperature = models.FloatField()
    input_humidity = models.FloatField()
    input_wind_speed = models.FloatField(default=1.5)
    input_solar_radiation = models.FloatField(default=600.0)
    input_vulnerability = models.FloatField(default=50.0)

    calculated_heat_index = models.FloatField()
    calculated_wbgt = models.FloatField()
    calculated_utci = models.FloatField()
    calculated_htsi = models.FloatField()
    calculated_risk_level = models.CharField(max_length=30)

    baseline_htsi = models.FloatField(default=0.0)
    htsi_difference = models.FloatField(default=0.0)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"Sim [{self.input_temperature}°C, {self.input_humidity}% RH] -> HTSI {self.calculated_htsi} ({self.calculated_risk_level})"
