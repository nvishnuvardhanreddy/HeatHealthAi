from django.contrib import admin
from .models import Simulation

@admin.register(Simulation)
class SimulationAdmin(admin.ModelAdmin):
    list_display = ('user', 'input_temperature', 'input_humidity', 'calculated_htsi', 'calculated_risk_level', 'htsi_difference', 'timestamp')
