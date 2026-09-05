from django.contrib import admin
from .models import Alert

@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ('title', 'alert_type', 'risk_level', 'htsi', 'user', 'ward', 'is_read', 'created_at')
    list_filter = ('alert_type', 'risk_level', 'is_read')
