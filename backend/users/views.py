from django.conf import settings
from django.utils import timezone

from rest_framework import permissions, status, views
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .emails import (
    send_gov_verification_decision_email,
    send_gov_verification_submitted_email,
    send_otp_email,
    send_password_reset_email,
)
from .models import (
    EmailOTP,
    GovernmentVerification,
    PasswordResetToken,
    User,
    VerificationAuditLog,
)
from .permissions import IsAdmin
from .serializers import (
    ChangePasswordSerializer,
    EmailVerificationSerializer,
    ForgotPasswordSerializer,
    GovernmentVerificationSerializer,
    LoginSerializer,
    ResendVerificationSerializer,
    ResetPasswordSerializer,
    UserProfileSerializer,
    UserRegistrationSerializer,
    VerificationAuditLogSerializer,
)


class RegisterView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create the user first (always committed — email failure is recoverable)
        user = serializer.save()
        _, otp_code = EmailOTP.generate_for_user(user)

        email_sent = send_otp_email(user, otp_code)

        if (
            user.role == User.Role.GOVERNMENT_AUTHORITY
            and hasattr(user, "government_verification")
        ):
            send_gov_verification_submitted_email(
                user,
                user.government_verification,
            )

        response_data = {
            "message": (
                "Registration successful. Check your email for the OTP."
                if email_sent
                else (
                    "Account created, but the verification email could not be "
                    "sent. Please use the \"Resend OTP\" option on the next page."
                )
            ),
            "email": user.email,
            "role": user.role,
            "requires_government_verification": (
                user.role == User.Role.GOVERNMENT_AUTHORITY
            ),
            "email_delivery_failed": not email_sent,
        }

        if getattr(settings, 'DEMO_MODE', False) or not email_sent:
            response_data["demo_otp"] = otp_code

        return Response(response_data, status=status.HTTP_201_CREATED)


class VerifyEmailView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = EmailVerificationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"].strip().lower()
        otp = serializer.validated_data["otp"].strip()

        user = User.objects.filter(email=email).first()

        if not user:
            return Response(
                {"detail": "User with this email was not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        latest_otp = (
            EmailOTP.objects.filter(
                user=user,
                is_verified=False,
            )
            .order_by("-created_at")
            .first()
        )

        if not latest_otp:
            return Response(
                {
                    "detail": (
                        "No pending OTP verification found. "
                        "Please request a new code."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        success, message = latest_otp.verify_code(otp)

        if not success:
            return Response(
                {"detail": message},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.email_status = User.EmailStatus.ACTIVE
        user.save(update_fields=["email_status"])

        if hasattr(user, "government_verification"):
            VerificationAuditLog.objects.create(
                government_verification=user.government_verification,
                action=VerificationAuditLog.Action.EMAIL_VERIFIED,
                performed_by=user,
                notes="Official email verified using OTP.",
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Email verified successfully.",
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class ResendVerificationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResendVerificationSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email=email).first()

        if not user:
            return Response(
                {"detail": "User with this email was not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        if user.is_email_verified:
            return Response(
                {"detail": "Email is already verified. You may log in."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        recent_otp = (
            EmailOTP.objects.filter(user=user)
            .order_by("-created_at")
            .first()
        )

        if recent_otp:
            elapsed = (
                timezone.now() - recent_otp.created_at
            ).total_seconds()

            if elapsed < 60:
                remaining = max(1, int(60 - elapsed))
                return Response(
                    {
                        "detail": (
                            f"Please wait {remaining} seconds before "
                            "requesting another OTP."
                        )
                    },
                    status=status.HTTP_429_TOO_MANY_REQUESTS,
                )

        _, otp_code = EmailOTP.generate_for_user(user)

        email_sent = send_otp_email(user, otp_code)

        resp_data = {
            "message": "A new OTP was sent to your email." if email_sent else "A new OTP was generated.",
            "email_delivery_failed": not email_sent,
        }
        if getattr(settings, 'DEMO_MODE', False) or not email_sent:
            resp_data["demo_otp"] = otp_code

        if not email_sent and not getattr(settings, 'DEMO_MODE', False):
            resp_data["detail"] = "The OTP email could not be delivered."
            return Response(resp_data, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        return Response(resp_data, status=status.HTTP_200_OK)


class LoginView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.validated_data["user"]

        if not user.is_email_verified:
            return Response(
                {
                    "detail": (
                        "Email is not verified. "
                        "Please verify your email first."
                    ),
                    "requires_email_verification": True,
                    "email": user.email,
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful.",
                "tokens": {
                    "access": str(refresh.access_token),
                    "refresh": str(refresh),
                },
                "user": UserProfileSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")

        if refresh_token:
            try:
                RefreshToken(refresh_token).blacklist()
            except Exception:
                pass

        return Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )


class ForgotPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email=email).first()

        if user:
            reset_token = PasswordResetToken.create_for_user(user)
            send_password_reset_email(user, reset_token)

        return Response(
            {
                "message": (
                    "If an account exists with this email, "
                    "a password reset message has been sent."
                )
            },
            status=status.HTTP_200_OK,
        )


class ResetPasswordView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        email = serializer.validated_data["email"].strip().lower()
        token = serializer.validated_data["token"].strip()
        new_password = serializer.validated_data["new_password"]

        user = User.objects.filter(email=email).first()

        if not user:
            return Response(
                {"detail": "Invalid or expired reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_object = PasswordResetToken.validate_token(user, token)

        if not token_object:
            return Response(
                {"detail": "Invalid or expired reset token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token_object.is_used = True
        token_object.save(update_fields=["is_used"])

        user.set_password(new_password)
        user.save(update_fields=["password"])

        return Response(
            {"message": "Password updated successfully."},
            status=status.HTTP_200_OK,
        )


class ChangePasswordView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(
                {"errors": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = request.user

        if not user.check_password(
            serializer.validated_data["old_password"]
        ):
            return Response(
                {"detail": "Current password is incorrect."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(serializer.validated_data["new_password"])
        user.save(update_fields=["password"])

        return Response(
            {"message": "Password changed successfully."},
            status=status.HTTP_200_OK,
        )


class UserProfileView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(
            UserProfileSerializer(request.user).data,
            status=status.HTTP_200_OK,
        )

    def patch(self, request):
        user = request.user

        if "location_enabled" in request.data:
            user.location_enabled = bool(request.data["location_enabled"])

        if "notifications_enabled" in request.data:
            user.notifications_enabled = bool(
                request.data["notifications_enabled"]
            )

        if "phone" in request.data:
            user.phone = str(request.data["phone"])

        user.save()

        return Response(
            UserProfileSerializer(user).data,
            status=status.HTTP_200_OK,
        )


class AdminVerificationListView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        status_filter = request.query_params.get("status")

        queryset = (
            GovernmentVerification.objects
            .select_related("user", "verified_by")
            .prefetch_related("audit_logs")
            .all()
        )

        if status_filter:
            queryset = queryset.filter(
                verification_status=status_filter.upper()
            )

        data = []

        for verification in queryset:
            item = GovernmentVerificationSerializer(
                verification
            ).data

            item["applicant_name"] = (
                f"{verification.user.first_name} "
                f"{verification.user.last_name}"
            ).strip()

            item["applicant_email"] = verification.user.email
            item["audit_logs"] = VerificationAuditLogSerializer(
                verification.audit_logs.all(),
                many=True,
            ).data

            data.append(item)

        return Response(data, status=status.HTTP_200_OK)


class AdminVerificationReviewView(views.APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk, action):
        verification = GovernmentVerification.objects.filter(
            pk=pk
        ).first()

        if not verification:
            return Response(
                {"detail": "Verification request not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        action = action.lower()
        notes = str(request.data.get("notes", "")).strip()

        if action == "approve":
            verification.verification_status = (
                GovernmentVerification.Status.VERIFIED
            )
            verification.verified_at = timezone.now()
            verification.verified_by = request.user
            verification.verification_notes = notes
            verification.rejection_reason = ""
            verification.save()

            VerificationAuditLog.objects.create(
                government_verification=verification,
                action=VerificationAuditLog.Action.APPROVED,
                performed_by=request.user,
                notes=notes or "Approved by administrator.",
            )

            send_gov_verification_decision_email(
                verification,
                approved=True,
            )

            return Response(
                {
                    "message": (
                        f"Government verification for "
                        f"{verification.user.email} approved."
                    ),
                    "verification": GovernmentVerificationSerializer(
                        verification
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        if action == "reject":
            reason = str(request.data.get("reason", "")).strip()

            if not reason:
                return Response(
                    {
                        "detail": (
                            "A rejection reason is required."
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            verification.verification_status = (
                GovernmentVerification.Status.REJECTED
            )
            verification.verified_at = timezone.now()
            verification.verified_by = request.user
            verification.rejection_reason = reason
            verification.verification_notes = notes
            verification.save()

            VerificationAuditLog.objects.create(
                government_verification=verification,
                action=VerificationAuditLog.Action.REJECTED,
                performed_by=request.user,
                notes=f"Rejected: {reason}. {notes}",
            )

            send_gov_verification_decision_email(
                verification,
                approved=False,
                reason=reason,
            )

            return Response(
                {
                    "message": (
                        f"Government verification for "
                        f"{verification.user.email} rejected."
                    ),
                    "verification": GovernmentVerificationSerializer(
                        verification
                    ).data,
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "detail": (
                    "Invalid action. Use 'approve' or 'reject'."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )