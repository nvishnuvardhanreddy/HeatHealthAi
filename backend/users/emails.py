import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _send_email(subject, message, recipient):
    try:
        sent = send_mail(
            subject=subject,
            message=message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )
        return sent == 1
    except Exception:
        logger.exception("Email delivery failed for %s", recipient)
        return False


def send_otp_email(user, otp_code):
    return _send_email(
        "[HeatHealthAI] Verify Your Email Address",
        f"""Hello {user.first_name or user.email},

Your HeatHealthAI verification code is:

{otp_code}

This code expires in 10 minutes.
""",
        user.email,
    )


def send_gov_verification_submitted_email(user, verification):
    return _send_email(
        "[HeatHealthAI] Government Verification Submitted",
        f"""Hello {user.first_name or user.email},

Your government authority verification request was submitted.

Department: {verification.department}
Designation: {verification.designation}
Status: Pending administrative review.

Email-domain eligibility does not automatically grant government privileges.
""",
        user.email,
    )


def send_gov_verification_decision_email(
    verification,
    approved=True,
    reason="",
):
    user = verification.user

    if approved:
        subject = "[HeatHealthAI] Government Verification Approved"
        message = """Your government authority verification was approved.

You can now access the verified authority dashboard.
"""
    else:
        subject = "[HeatHealthAI] Government Verification Rejected"
        message = f"""Your government authority verification was rejected.

Reason:
{reason or "Administrative verification was unsuccessful."}
"""

    return _send_email(subject, message, user.email)


def send_password_reset_email(user, reset_token):
    return _send_email(
        "[HeatHealthAI] Password Reset",
        f"""Hello {user.first_name or user.email},

Your password reset token is:

{reset_token}

This token expires in 30 minutes.
""",
        user.email,
    )