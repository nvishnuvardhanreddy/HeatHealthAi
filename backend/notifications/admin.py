from django.contrib import admin
from .models import NotificationSubscription

@admin.register(NotificationSubscription)
class NotificationSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'endpoint', 'active', 'created_at')
    list_filter = ('active',)
