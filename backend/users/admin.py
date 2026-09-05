from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, GovernmentVerification, VerificationAuditLog, EmailOTP, PasswordResetToken

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'first_name', 'last_name', 'role', 'email_status', 'is_staff', 'date_joined')
    list_filter = ('role', 'email_status', 'is_staff', 'is_superuser')
    search_fields = ('email', 'first_name', 'last_name', 'phone')
    ordering = ('-date_joined',)
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('first_name', 'last_name', 'phone')}),
        ('Role & Status', {'fields': ('role', 'email_status', 'location_enabled', 'notifications_enabled')}),
        ('Location Tracking', {'fields': ('last_latitude', 'last_longitude', 'last_location_updated')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

class AuditLogInline(admin.TabularInline):
    model = VerificationAuditLog
    extra = 0
    readonly_fields = ('action', 'performed_by', 'timestamp', 'notes')

@admin.register(GovernmentVerification)
class GovernmentVerificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'official_email', 'department', 'designation', 'government_domain', 'verification_status', 'submitted_at', 'verified_at')
    list_filter = ('verification_status', 'government_domain')
    search_fields = ('user__email', 'official_email', 'department', 'designation', 'employee_id')
    readonly_fields = ('submitted_at',)
    inlines = [AuditLogInline]

@admin.register(VerificationAuditLog)
class VerificationAuditLogAdmin(admin.ModelAdmin):
    list_display = ('government_verification', 'action', 'performed_by', 'timestamp')
    list_filter = ('action',)
    search_fields = ('government_verification__official_email', 'notes')

@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at', 'expires_at', 'attempts', 'is_verified')
    list_filter = ('is_verified',)
