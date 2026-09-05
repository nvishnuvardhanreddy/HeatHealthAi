from django.contrib import admin
from .models import Ward, Location

@admin.register(Ward)
class WardAdmin(admin.ModelAdmin):
    list_display = ('name', 'ward_id', 'zone', 'current_htsi', 'current_risk', 'population', 'vulnerability_score')
    list_filter = ('zone', 'current_risk')
    search_fields = ('name', 'ward_id', 'zone')

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('user', 'latitude', 'longitude', 'detected_ward', 'timestamp')
    search_fields = ('user__email', 'detected_ward__name')
