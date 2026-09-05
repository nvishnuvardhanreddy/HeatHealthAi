from rest_framework import permissions
from .models import User, GovernmentVerification

class IsCitizen(permissions.BasePermission):
    """Allows access to authenticated users."""
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)

class IsVerifiedAuthority(permissions.BasePermission):
    """
    Allows access only to authenticated users who:
    1. Have verified their email
    2. Hold role GOVERNMENT_AUTHORITY with an approved GovernmentVerification (status=VERIFIED)
       OR are platform ADMINs.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.user.role == User.Role.ADMIN or request.user.is_superuser:
            return True
        if request.user.role == User.Role.GOVERNMENT_AUTHORITY:
            if not request.user.is_email_verified:
                return False
            try:
                verification = request.user.government_verification
                return verification.verification_status == GovernmentVerification.Status.VERIFIED
            except GovernmentVerification.DoesNotExist:
                return False
        return False

class IsAdmin(permissions.BasePermission):
    """Allows access only to administrators."""
    def has_permission(self, request, view):
        return bool(
            request.user and
            request.user.is_authenticated and
            (request.user.role == User.Role.ADMIN or request.user.is_staff or request.user.is_superuser)
        )
