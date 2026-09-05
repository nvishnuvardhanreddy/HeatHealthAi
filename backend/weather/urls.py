from django.urls import path
from .views import CurrentWeatherView, WeatherForecastView

urlpatterns = [
    path('current/', CurrentWeatherView.as_view(), name='weather_current'),
    path('forecast/', WeatherForecastView.as_view(), name='weather_forecast'),
]
