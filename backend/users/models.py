import hashlib
import os
import secrets
from datetime import timedelta
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone

class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if not user.username:
            user.username = email
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)
        extra_fields.setdefault('email_status', User.EmailStatus.ACTIVE)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        CITIZEN = 'CITIZEN', 'Citizen'
        GOVERNMENT_AUTHORITY = 'GOVERNMENT_AUTHORITY', 'Government Authority'
        ADMIN = 'ADMIN', 'Administrator'

    class EmailStatus(models.TextChoices):
        EMAIL_UNVERIFIED = 'EMAIL_UNVERIFIED', 'Email Unverified'
        ACTIVE = 'ACTIVE', 'Active'
        SUSPENDED = 'SUSPENDED', 'Suspended'

    email = models.EmailField('Email address', unique=True)
    role = models.CharField(max_length=30, choices=Role.choices, default=Role.CITIZEN)
    phone = models.CharField(max_length=20, blank=True, default='')
    email_status = models.CharField(max_length=30, choices=EmailStatus.choices, default=EmailStatus.EMAIL_UNVERIFIED)

    location_enabled = models.BooleanField(default=True)
    notifications_enabled = models.BooleanField(default=True)

    last_latitude = models.FloatField(null=True, blank=True)
    last_longitude = models.FloatField(null=True, blank=True)
    last_location_updated = models.DateTimeField(null=True, blank=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']

    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-date_joined']

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"

    @property
    def is_email_verified(self):
        return self.email_status == self.EmailStatus.ACTIVE

    @property
    def is_verified_authority(self):
        if self.role == self.Role.ADMIN:
            return True
        if self.role == self.Role.GOVERNMENT_AUTHORITY and self.is_email_verified:
            if hasattr(self, 'government_verification'):
                return self.government_verification.verification_status == GovernmentVerification.Status.VERIFIED
        return False


class GovernmentVerification(models.Model):
    class Status(models.TextChoices):
        NOT_APPLICABLE = 'NOT_APPLICABLE', 'Not Applicable'
        PENDING = 'PENDING', 'Pending Review'
        VERIFIED = 'VERIFIED', 'Verified'
        REJECTED = 'REJECTED', 'Rejected'

    user = models.OneToOneField(User, related_name='government_verification', on_delete=models.CASCADE)
    official_email = models.EmailField(help_text='Government email address submitted during registration')
    department = models.CharField(max_length=150, help_text='Department, ministry, or municipal corporation')
    designation = models.CharField(max_length=150, help_text='Official designation or job title')
    employee_id = models.CharField(max_length=100, blank=True, default='', help_text='Official Officer/Employee ID')
    government_domain = models.CharField(max_length=100, help_text='Detected eligible domain')
    verification_status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)

    submitted_at = models.DateTimeField(auto_now_add=True)
    verified_at = models.DateTimeField(null=True, blank=True)
    verified_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL, related_name='reviewed_verifications')
    rejection_reason = models.TextField(blank=True, default='', help_text='Mandatory explanation if rejected')
    verification_notes = models.TextField(blank=True, default='')

    class Meta:
        verbose_name = 'Government Verification'
        verbose_name_plural = 'Government Verifications'
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user.email} - {self.get_verification_status_display()}"


class VerificationAuditLog(models.Model):
    class Action(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        EMAIL_VERIFIED = 'EMAIL_VERIFIED', 'Email Verified'
        REVIEWED = 'REVIEWED', 'Reviewed'
        APPROVED = 'APPROVED', 'Approved'
        REJECTED = 'REJECTED', 'Rejected'

    government_verification = models.ForeignKey(GovernmentVerification, related_name='audit_logs', on_delete=models.CASCADE)
    action = models.CharField(max_length=30, choices=Action.choices)
    performed_by = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True, default='')

    class Meta:
        verbose_name = 'Verification Audit Log'
        verbose_name_plural = 'Verification Audit Logs'
        ordering = ['-timestamp']

    def __str__(self):
        return f"{self.government_verification.user.email} - {self.action} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class EmailOTP(models.Model):
    user = models.ForeignKey(User, related_name='email_otps', on_delete=models.CASCADE)
    otp_hash = models.CharField(max_length=128)
    salt = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    attempts = models.PositiveSmallIntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']

    @classmethod
    def generate_for_user(cls, user, validity_minutes=10):
        # Generate 6 digit numeric code
        otp_code = f"{secrets.randbelow(900000) + 100000}"
        salt = secrets.token_hex(16)
        otp_hash = hashlib.sha256((otp_code + salt).encode('utf-8')).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=validity_minutes)

        otp_instance = cls.objects.create(
            user=user,
            otp_hash=otp_hash,
            salt=salt,
            expires_at=expires_at,
        )
        return otp_instance, otp_code

    def verify_code(self, candidate_code):
        if self.is_verified:
            return False, 'OTP has already been used.'
        if timezone.now() > self.expires_at:
            return False, 'OTP has expired. Please request a new code.'
        if self.attempts >= 5:
            return False, 'Maximum verification attempts exceeded. Please request a new OTP.'

        self.attempts += 1
        candidate_hash = hashlib.sha256((candidate_code.strip() + self.salt).encode('utf-8')).hexdigest()
        if candidate_hash == self.otp_hash:
            self.is_verified = True
            self.save(update_fields=['attempts', 'is_verified'])
            return True, 'Verification successful.'
        self.save(update_fields=['attempts'])
        return False, f'Invalid OTP code. {5 - self.attempts} attempts remaining.'


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, related_name='password_reset_tokens', on_delete=models.CASCADE)
    token_hash = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)

    @classmethod
    def create_for_user(cls, user, validity_minutes=30):
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        expires_at = timezone.now() + timedelta(minutes=validity_minutes)
        cls.objects.create(
            user=user,
            token_hash=token_hash,
            expires_at=expires_at
        )
        return raw_token

    @classmethod
    def validate_token(cls, user, raw_token):
        token_hash = hashlib.sha256(raw_token.encode('utf-8')).hexdigest()
        token_obj = cls.objects.filter(
            user=user,
            token_hash=token_hash,
            is_used=False,
            expires_at__gt=timezone.now()
        ).first()
        return token_obj
