from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView,
    VerifyEmailView,
    ResendVerificationView,
    LoginView,
    LogoutView,
    ForgotPasswordView,
    ResetPasswordView,
    ChangePasswordView,
    UserProfileView,
    AdminVerificationListView,
    AdminVerificationReviewView
)

urlpatterns = [
    # Public Auth
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('verify-email/', VerifyEmailView.as_view(), name='auth_verify_email'),
    path('resend-verification/', ResendVerificationView.as_view(), name='auth_resend_verification'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='auth_forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='auth_reset_password'),
    path('change-password/', ChangePasswordView.as_view(), name='auth_change_password'),
    path('me/', UserProfileView.as_view(), name='auth_me'),

    # Admin Government Verification Endpoints
    path('admin/verifications/', AdminVerificationListView.as_view(), name='admin_verifications_list'),
    path('admin/verifications/<int:pk>/<str:action>/', AdminVerificationReviewView.as_view(), name='admin_verification_review'),
]
