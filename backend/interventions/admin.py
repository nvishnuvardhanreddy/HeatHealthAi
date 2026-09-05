from django.contrib import admin
from .models import Intervention, EmergencyPriority

@admin.register(Intervention)
class InterventionAdmin(admin.ModelAdmin):
    list_display = ('title', 'priority_level', 'target_category', 'min_htsi', 'is_active')
    list_filter = ('priority_level', 'target_category', 'is_active')

@admin.register(EmergencyPriority)
class EmergencyPriorityAdmin(admin.ModelAdmin):
    list_display = ('priority_rank', 'ward', 'priority_score', 'htsi', 'population', 'status')
