from django.contrib import admin
from .models import ThermalRisk

@admin.register(ThermalRisk)
class ThermalRiskAdmin(admin.ModelAdmin):
    list_display = ('ward_name', 'htsi', 'risk_level', 'temperature', 'humidity', 'wbgt', 'utci', 'timestamp')
    list_filter = ('risk_level', 'is_forecast')
    search_fields = ('ward_name',)
