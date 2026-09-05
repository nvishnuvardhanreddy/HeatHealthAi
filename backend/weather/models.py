from django.db import models

class WeatherObservation(models.Model):
    ward = models.ForeignKey('gis.Ward', null=True, blank=True, on_delete=models.SET_NULL, related_name='weather_observations')
    city = models.CharField(max_length=100, default='Visakhapatnam')
    latitude = models.FloatField()
    longitude = models.FloatField()
    timestamp = models.DateTimeField(db_index=True)

    temperature = models.FloatField(help_text='Temperature in °C')
    humidity = models.FloatField(help_text='Relative humidity in %')
    wind_speed = models.FloatField(help_text='Wind speed in m/s')
    solar_radiation = models.FloatField(default=0.0, help_text='Direct/Global solar radiation W/m²')
    pressure = models.FloatField(null=True, blank=True, help_text='Surface pressure in hPa')
    cloud_cover = models.FloatField(null=True, blank=True, help_text='Cloud cover percentage')
    apparent_temperature = models.FloatField(null=True, blank=True)

    source = models.CharField(max_length=50, default='Open-Meteo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['ward', 'timestamp']),
        ]

    def __str__(self):
        return f"{self.city} [{self.timestamp.strftime('%Y-%m-%d %H:%M')}]: {self.temperature}°C, {self.humidity}% RH ({self.source})"


class WeatherForecast(models.Model):
    ward = models.ForeignKey('gis.Ward', null=True, blank=True, on_delete=models.SET_NULL, related_name='weather_forecasts')
    city = models.CharField(max_length=100, default='Visakhapatnam')
    forecast_time = models.DateTimeField(db_index=True)

    temperature = models.FloatField()
    humidity = models.FloatField()
    wind_speed = models.FloatField()
    solar_radiation = models.FloatField(default=0.0)
    apparent_temperature = models.FloatField(null=True, blank=True)

    source = models.CharField(max_length=50, default='Open-Meteo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['forecast_time']

    def __str__(self):
        return f"Forecast {self.city} @ {self.forecast_time.strftime('%Y-%m-%d %H:%M')}: {self.temperature}°C"
