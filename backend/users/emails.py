import logging
from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)

def send_otp_email(user, otp_code):
    """Send 6-digit email OTP for account verification."""
    subject = "[HeatHealthAI] Verify Your Email Address"
    message = f"""Hello {user.first_name or user.email},

Thank you for registering on HeatHealthAI — Localized Human Thermal Stress Early Warning, Prediction & GIS Platform.

Your 6-digit Email Verification Code is:

    {otp_code}

This code will expire in 10 minutes. Please enter it on the verification screen to activate your account.

If you did not request this registration, please disregard this message.

—
HeatHealthAI Automated Thermal Intelligence System
Prototype Decision Support Platform
"""
    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
        )
        logger.info(f"Sent OTP email to {user.email}")
        return True
    except Exception as e:
        logger.warning(f"Could not send email to {user.email}: {e}. (Console fallback active in DEBUG)")
        print(f"\n================ [EMAIL CONSOLE FALLBACK] ================\nTO: {user.email}\nSUBJECT: {subject}\nOTP CODE: {otp_code}\n========================================================\n")
        return True

def send_gov_verification_submitted_email(user, gov_verification):
    subject = "[HeatHealthAI] Government Authority Verification Request Submitted"
    message = f"""Hello {user.first_name or user.email},

Your request for Government Authority status on HeatHealthAI has been registered and is now under administrative review.

Submitted Credentials:
- Official Email: {gov_verification.official_email}
- Department: {gov_verification.department}
- Designation: {gov_verification.designation}
- Employee ID: {gov_verification.employee_id or 'N/A'}
- Eligible Domain Detected: {gov_verification.government_domain}

Status: PENDING ADMINISTRATIVE REVIEW

Important Notice:
Eligibility check via government email domain does not automatically grant authority privileges. A platform administrator must manually review and verify your credentials before authority dashboard access is enabled.

—
HeatHealthAI Governance System
"""
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
    except Exception as e:
        logger.warning(f"Failed to send submission email: {e}")

def send_gov_verification_decision_email(gov_verification, approved=True, reason=""):
    user = gov_verification.user
    if approved:
        subject = "[HeatHealthAI] Approved: Government Authority Access Granted"
        message = f"""Hello {user.first_name or user.email},

Congratulations. Your application for verified Government Authority on HeatHealthAI has been APPROVED by an administrator.

You now have full access to:
- Ward-Level Hotspots & Thermal Risk Maps
- Pre-Emptive Intervention Triggers
- Emergency Prioritization Matrix
- Automated Heat Action Plans

Login to access your authority command center:
Dashboard: /authority

—
HeatHealthAI Administration
"""
    else:
        subject = "[HeatHealthAI] Update: Government Authority Verification Status"
        message = f"""Hello {user.first_name or user.email},

Your request for Government Authority access has been REJECTED following administrative review.

Reason Provided by Administrator:
{reason or 'Insufficient official credentials or domain eligibility verification failure.'}

You may continue to use HeatHealthAI with standard Citizen privileges, or contact the administration with valid government identification documents.

—
HeatHealthAI Administration
"""
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=True)
    except Exception as e:
        logger.warning(f"Failed to send verification decision email: {e}")

def send_password_reset_email(user, reset_token):
    subject = "[HeatHealthAI] Password Reset Request"
    message = f"""Hello {user.first_name or user.email},

We received a request to reset your password for HeatHealthAI.

Your password reset token is:

    {reset_token}

This token expires in 30 minutes. Use it on the password reset page to create a new password.

If you did not request a password reset, please ignore this email.

—
HeatHealthAI Security
"""
    try:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user.email], fail_silently=False)
        return True
    except Exception as e:
        logger.warning(f"Could not send reset email: {e}")
        print(f"\n================ [PASSWORD RESET TOKEN] ================\nTO: {user.email}\nRESET TOKEN: {reset_token}\n========================================================\n")
        return True
