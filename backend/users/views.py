from django.utils import timezone
from rest_framework import status, views, permissions
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User, GovernmentVerification, VerificationAuditLog, EmailOTP, PasswordResetToken
from .serializers import (
    UserRegistrationSerializer,
    EmailVerificationSerializer,
    ResendVerificationSerializer,
    LoginSerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
    ChangePasswordSerializer,
    UserProfileSerializer,
    GovernmentVerificationSerializer,
    VerificationAuditLogSerializer
)
from .permissions import IsAdmin
from .emails import (
    send_otp_email,
    send_gov_verification_submitted_email,
    send_gov_verification_decision_email,
    send_password_reset_email
)


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.save()

        # Generate OTP
        otp_instance, otp_code = EmailOTP.generate_for_user(user)
        send_otp_email(user, otp_code)

        if user.role == User.Role.GOVERNMENT_AUTHORITY and hasattr(user, 'government_verification'):
            send_gov_verification_submitted_email(user, user.government_verification)

        return Response({
            "message": "Registration successful. Please enter the 6-digit OTP sent to your email to verify your account.",
            "email": user.email,
            "role": user.role,
            "requires_government_verification": (user.role == User.Role.GOVERNMENT_AUTHORITY)
        }, status=status.HTTP_201_CREATED)


class VerifyEmailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        otp = serializer.validated_data['otp'].strip()

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email not found."}, status=status.HTTP_404_NOT_FOUND)

        latest_otp = EmailOTP.objects.filter(user=user, is_verified=False).order_by('-created_at').first()
        if not latest_otp:
            return Response({"detail": "No pending OTP verification found. Please request a new code."}, status=status.HTTP_400_BAD_REQUEST)

        success, msg = latest_otp.verify_code(otp)
        if not success:
            return Response({"detail": msg}, status=status.HTTP_400_BAD_REQUEST)

        user.email_status = User.EmailStatus.ACTIVE
        user.save(update_fields=['email_status'])

        # If government authority, log email verification in audit trail
        if hasattr(user, 'government_verification'):
            VerificationAuditLog.objects.create(
                government_verification=user.government_verification,
                action=VerificationAuditLog.Action.EMAIL_VERIFIED,
                performed_by=user,
                notes="Government official email successfully verified via OTP."
            )

        refresh = RefreshToken.for_user(user)
        user_serializer = UserProfileSerializer(user)

        return Response({
            "message": "Email verified successfully.",
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            },
            "user": user_serializer.data
        }, status=status.HTTP_200_OK)


class ResendVerificationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"detail": "User with this email not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_email_verified:
            return Response({"detail": "Email is already verified. You may log in directly."}, status=status.HTTP_400_BAD_REQUEST)

        # Check cooldown (60 seconds)
        recent_otp = EmailOTP.objects.filter(user=user).order_by('-created_at').first()
        if recent_otp and (timezone.now() - recent_otp.created_at).total_seconds() < 60:
            remaining = int(60 - (timezone.now() - recent_otp.created_at).total_seconds())
            return Response({"detail": f"Please wait {remaining} seconds before requesting a new OTP."}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        otp_instance, otp_code = EmailOTP.generate_for_user(user)
        send_otp_email(user, otp_code)

        return Response({"message": "A new 6-digit verification code has been dispatched to your email."}, status=status.HTTP_200_OK)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']

        if not user.is_email_verified:
            return Response({
                "detail": "Email is not verified. Please verify your email before logging in.",
                "requires_email_verification": True,
                "email": user.email
            }, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        user_serializer = UserProfileSerializer(user)

        return Response({
            "message": "Login successful.",
            "tokens": {
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            },
            "user": user_serializer.data
        }, status=status.HTTP_200_OK)


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()
            except Exception:
                pass
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        user = User.objects.filter(email=email).first()
        if user:
            raw_token = PasswordResetToken.create_for_user(user)
            send_password_reset_email(user, raw_token)

        return Response({
            "message": "If an account exists with this email, a password reset token has been dispatched."
        }, status=status.HTTP_200_OK)


class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email'].strip().lower()
        token = serializer.validated_data['token'].strip()
        new_password = serializer.validated_data['new_password']

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"detail": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST)

        token_obj = PasswordResetToken.validate_token(user, token)
        if not token_obj:
            return Response({"detail": "Invalid or expired reset token."}, status=status.HTTP_400_BAD_REQUEST)

        token_obj.is_used = True
        token_obj.save(update_fields=['is_used'])

        user.set_password(new_password)
        user.save(update_fields=['password'])

        return Response({"message": "Password has been successfully updated. You may now log in."}, status=status.HTTP_200_OK)


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({"errors": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        user = request.user
        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"detail": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])

        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        user = request.user
        if 'location_enabled' in request.data:
            user.location_enabled = bool(request.data['location_enabled'])
        if 'notifications_enabled' in request.data:
            user.notifications_enabled = bool(request.data['notifications_enabled'])
        if 'phone' in request.data:
            user.phone = str(request.data['phone'])
        user.save()
        return Response(UserProfileSerializer(user).data, status=status.HTTP_200_OK)


# --- ADMIN GOVERNMENT VERIFICATION VIEWS ---

class AdminVerificationListView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get('status')
        queryset = GovernmentVerification.objects.select_related('user', 'verified_by').prefetch_related('audit_logs').all()
        if status_filter:
            queryset = queryset.filter(verification_status=status_filter.upper())

        data = []
        for v in queryset:
            audit_logs = VerificationAuditLogSerializer(v.audit_logs.all(), many=True).data
            item = GovernmentVerificationSerializer(v).data
            item['applicant_name'] = f"{v.user.first_name} {v.user.last_name}".strip()
            item['applicant_email'] = v.user.email
            item['audit_logs'] = audit_logs
            data.append(item)

        return Response(data, status=status.HTTP_200_OK)


class AdminVerificationReviewView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk, action):
        try:
            verif = GovernmentVerification.objects.get(pk=pk)
        except GovernmentVerification.DoesNotExist:
            return Response({"detail": "Verification request not found."}, status=status.HTTP_404_NOT_FOUND)

        action = action.lower()
        notes = request.data.get('notes', '')

        if action == 'approve':
            verif.verification_status = GovernmentVerification.Status.VERIFIED
            verif.verified_at = timezone.now()
            verif.verified_by = request.user
            verif.verification_notes = notes
            verif.rejection_reason = ''
            verif.save()

            VerificationAuditLog.objects.create(
                government_verification=verif,
                action=VerificationAuditLog.Action.APPROVED,
                performed_by=request.user,
                notes=notes or "Application reviewed and approved by administrator."
            )
            send_gov_verification_decision_email(verif, approved=True)

            return Response({
                "message": f"Government verification for {verif.user.email} has been approved.",
                "verification": GovernmentVerificationSerializer(verif).data
            }, status=status.HTTP_200_OK)

        elif action == 'reject':
            reason = request.data.get('reason', '').strip()
            if not reason:
                return Response({"detail": "A specific rejection reason is mandatory when rejecting a verification request."}, status=status.HTTP_400_BAD_REQUEST)

            verif.verification_status = GovernmentVerification.Status.REJECTED
            verif.verified_at = timezone.now()
            verif.verified_by = request.user
            verif.rejection_reason = reason
            verif.verification_notes = notes
            verif.save()

            VerificationAuditLog.objects.create(
                government_verification=verif,
                action=VerificationAuditLog.Action.REJECTED,
                performed_by=request.user,
                notes=f"Rejected. Reason: {reason}. Notes: {notes}"
            )
            send_gov_verification_decision_email(verif, approved=False, reason=reason)

            return Response({
                "message": f"Government verification for {verif.user.email} has been rejected.",
                "verification": GovernmentVerificationSerializer(verif).data
            }, status=status.HTTP_200_OK)

        return Response({"detail": "Invalid action. Supported actions: 'approve', 'reject'."}, status=status.HTTP_400_BAD_REQUEST)
