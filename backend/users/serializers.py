import re
from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from .models import User, GovernmentVerification, VerificationAuditLog, EmailOTP

def validate_government_email_domain(email):
    """
    Safely validate that email belongs to an approved government domain.
    E.g., if allowed is ['gov.in', 'nic.in', 'ap.gov.in'], then:
    - user@gov.in -> matches
    - officer@ap.gov.in -> matches
    - officer@revenue.ap.gov.in -> matches
    - user@fakegov.in -> rejected
    - user@gov.in.attacker.com -> rejected
    """
    allowed_domains = getattr(settings, 'GOVERNMENT_EMAIL_DOMAINS', ['gov.in', 'nic.in', 'ap.gov.in'])
    if not email or '@' not in email:
        return False, None

    domain = email.strip().split('@')[-1].lower()
    for allowed in allowed_domains:
        allowed = allowed.strip().lower()
        if domain == allowed or domain.endswith('.' + allowed):
            return True, allowed
    return False, None


class GovernmentVerificationSerializer(serializers.ModelSerializer):
    verified_by_email = serializers.ReadOnlyField(source='verified_by.email')

    class Meta:
        model = GovernmentVerification
        fields = [
            'id', 'official_email', 'department', 'designation', 'employee_id',
            'government_domain', 'verification_status', 'submitted_at',
            'verified_at', 'verified_by_email', 'rejection_reason', 'verification_notes'
        ]
        read_only_fields = ['id', 'government_domain', 'verification_status', 'submitted_at', 'verified_at', 'verified_by_email']


class VerificationAuditLogSerializer(serializers.ModelSerializer):
    performed_by_email = serializers.ReadOnlyField(source='performed_by.email')

    class Meta:
        model = VerificationAuditLog
        fields = ['id', 'action', 'performed_by_email', 'timestamp', 'notes']


class UserProfileSerializer(serializers.ModelSerializer):
    government_verification = GovernmentVerificationSerializer(read_only=True)
    is_email_verified = serializers.BooleanField(read_only=True)
    is_verified_authority = serializers.BooleanField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'email', 'first_name', 'last_name', 'phone', 'role',
            'email_status', 'is_email_verified', 'is_verified_authority',
            'location_enabled', 'notifications_enabled',
            'last_latitude', 'last_longitude', 'last_location_updated',
            'government_verification', 'date_joined'
        ]
        read_only_fields = ['id', 'email', 'role', 'email_status', 'date_joined']


class UserRegistrationSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, required=True)
    email = serializers.EmailField(required=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True, default='')
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=['CITIZEN', 'GOVERNMENT_AUTHORITY'], default='CITIZEN')

    # Government Authority fields
    official_email = serializers.EmailField(required=False, allow_blank=True)
    department = serializers.CharField(max_length=150, required=False, allow_blank=True)
    designation = serializers.CharField(max_length=150, required=False, allow_blank=True)
    employee_id = serializers.CharField(max_length=100, required=False, allow_blank=True)

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email address already exists.")
        return value

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})

        validate_password(data['password'])

        if data['role'] == 'GOVERNMENT_AUTHORITY':
            official_email = data.get('official_email') or data.get('email')
            if not official_email:
                raise serializers.ValidationError({"official_email": "Official government email is required for authority registration."})

            is_valid, detected_domain = validate_government_email_domain(official_email)
            if not is_valid:
                allowed_str = ", ".join(getattr(settings, 'GOVERNMENT_EMAIL_DOMAINS', ['gov.in', 'nic.in', 'ap.gov.in']))
                raise serializers.ValidationError({
                    "official_email": f"Invalid government email domain. Domain must match one of the authorized government domains ({allowed_str}). Note: Email domain validation is an eligibility prerequisite and does not automatically prove employment."
                })
            data['detected_gov_domain'] = detected_domain
            data['official_email'] = official_email

            if not data.get('department'):
                raise serializers.ValidationError({"department": "Department is required for government authority accounts."})
            if not data.get('designation'):
                raise serializers.ValidationError({"designation": "Designation is required for government authority accounts."})

        return data

    def create(self, validated_data):
        full_name = validated_data.get('full_name', '').strip()
        names = full_name.split(' ', 1)
        first_name = names[0]
        last_name = names[1] if len(names) > 1 else ''

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            username=validated_data['email'],
            first_name=first_name,
            last_name=last_name,
            phone=validated_data.get('phone', ''),
            role=validated_data['role'],
            email_status=User.EmailStatus.ACTIVE
        )

        if validated_data['role'] == 'GOVERNMENT_AUTHORITY':
            gov_verif = GovernmentVerification.objects.create(
                user=user,
                official_email=validated_data['official_email'],
                department=validated_data['department'],
                designation=validated_data['designation'],
                employee_id=validated_data.get('employee_id', ''),
                government_domain=validated_data['detected_gov_domain'],
                verification_status=GovernmentVerification.Status.PENDING,
                verification_notes="Registered with eligible domain. Awaiting administrative review."
            )
            VerificationAuditLog.objects.create(
                government_verification=gov_verif,
                action=VerificationAuditLog.Action.SUBMITTED,
                performed_by=user,
                notes="Initial registration submitted by user with domain check."
            )

        return user


class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    otp = serializers.CharField(max_length=10, required=True)


class ResendVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        email = data.get('email', '').strip().lower()
        password = data.get('password')

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid email or password.")

        if user.email_status == User.EmailStatus.SUSPENDED:
            raise serializers.ValidationError("This account has been suspended. Please contact platform administration.")

        data['user'] = user
        return data


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    token = serializers.CharField(required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        validate_password(data['new_password'])
        return data


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords do not match."})
        validate_password(data['new_password'])
        return data
