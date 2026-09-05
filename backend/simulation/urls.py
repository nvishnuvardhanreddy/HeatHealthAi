from django.urls import path
from .views import RunSimulationView

urlpatterns = [
    path('run/', RunSimulationView.as_view(), name='simulation_run'),
]
