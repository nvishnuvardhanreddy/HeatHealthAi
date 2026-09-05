from django.contrib import admin
from .models import WeatherObservation, WeatherForecast

@admin.register(WeatherObservation)
class WeatherObservationAdmin(admin.ModelAdmin):
    list_display = ('city', 'temperature', 'humidity', 'wind_speed', 'solar_radiation', 'source', 'timestamp')
    list_filter = ('source',)

@admin.register(WeatherForecast)
class WeatherForecastAdmin(admin.ModelAdmin):
    list_display = ('city', 'forecast_time', 'temperature', 'humidity', 'source')
