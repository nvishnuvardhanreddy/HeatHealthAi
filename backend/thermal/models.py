from django.db import models

class ThermalRisk(models.Model):
    class RiskLevel(models.TextChoices):
        LOW = 'LOW', 'Low'
        MODERATE = 'MODERATE', 'Moderate'
        HIGH = 'HIGH', 'High'
        VERY_HIGH = 'VERY HIGH', 'Very High'
        EXTREME = 'EXTREME', 'Extreme'

    ward_name = models.CharField(max_length=100, db_index=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(db_index=True)

    temperature = models.FloatField(help_text='Dry-bulb temperature in °C')
    humidity = models.FloatField(help_text='Relative humidity in %')
    wind_speed = models.FloatField(default=1.0, help_text='Wind speed in m/s')
    solar_radiation = models.FloatField(default=0.0, help_text='Surface solar radiation in W/m²')

    heat_index = models.FloatField()
    wbgt = models.FloatField()
    utci = models.FloatField()
    htsi = models.FloatField(db_index=True)
    risk_level = models.CharField(max_length=20, choices=RiskLevel.choices, db_index=True)

    vulnerability_score = models.FloatField(default=50.0)
    is_forecast = models.BooleanField(default=False)
    source = models.CharField(max_length=50, default='Open-Meteo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['ward_name', 'timestamp']),
            models.Index(fields=['risk_level', 'htsi']),
        ]

    def __str__(self):
        return f"{self.ward_name} [{self.timestamp.strftime('%Y-%m-%d %H:%M')}]: HTSI {self.htsi} ({self.risk_level})"
