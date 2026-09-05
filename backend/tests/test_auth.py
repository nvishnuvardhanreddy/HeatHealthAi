from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User, EmailOTP, PasswordResetToken

class AuthenticationWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_citizen_registration_and_otp_verification(self):
        # 1. Register Citizen
        reg_data = {
            "full_name": "Priya Sharma",
            "email": "priya.sharma@example.com",
            "phone": "+91 9988776655",
            "password": "SecurePassword123!",
            "confirm_password": "SecurePassword123!",
            "role": "CITIZEN"
        }
        res = self.client.post('/api/auth/register/', reg_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="priya.sharma@example.com")
        self.assertFalse(user.is_email_verified)
        self.assertEqual(user.email_status, User.EmailStatus.EMAIL_UNVERIFIED)

        # 2. Login before verification should be blocked
        login_res = self.client.post('/api/auth/login/', {
            "email": "priya.sharma@example.com",
            "password": "SecurePassword123!"
        }, format='json')
        self.assertEqual(login_res.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(login_res.data.get('requires_email_verification'))

        # 3. Verify OTP
        otp_obj = EmailOTP.objects.filter(user=user).latest('created_at')

        # Test invalid OTP
        bad_verify = self.client.post('/api/auth/verify-email/', {
            "email": user.email,
            "otp": "000000"
        }, format='json')
        self.assertEqual(bad_verify.status_code, status.HTTP_400_BAD_REQUEST)

        # Retrieve matching code for test verification by generating known code
        new_otp, code = EmailOTP.generate_for_user(user)
        good_verify = self.client.post('/api/auth/verify-email/', {
            "email": user.email,
            "otp": code
        }, format='json')
        self.assertEqual(good_verify.status_code, status.HTTP_200_OK)
        self.assertIn('tokens', good_verify.data)

        user.refresh_from_db()
        self.assertTrue(user.is_email_verified)
        self.assertEqual(user.email_status, User.EmailStatus.ACTIVE)

        # 4. Login after verification should succeed
        login_res2 = self.client.post('/api/auth/login/', {
            "email": "priya.sharma@example.com",
            "password": "SecurePassword123!"
        }, format='json')
        self.assertEqual(login_res2.status_code, status.HTTP_200_OK)
        self.assertIn('access', login_res2.data['tokens'])

    def test_password_reset_flow(self):
        user = User.objects.create_user(
            email="reset.user@example.com",
            password="OldPassword123!",
            email_status=User.EmailStatus.ACTIVE
        )

        # Request reset token
        req_res = self.client.post('/api/auth/forgot-password/', {"email": user.email}, format='json')
        self.assertEqual(req_res.status_code, status.HTTP_200_OK)

        raw_token = PasswordResetToken.create_for_user(user)

        # Reset with token
        reset_res = self.client.post('/api/auth/reset-password/', {
            "email": user.email,
            "token": raw_token,
            "new_password": "NewSecretPassword123!",
            "confirm_password": "NewSecretPassword123!"
        }, format='json')
        self.assertEqual(reset_res.status_code, status.HTTP_200_OK)

        # Verify old password fails, new password succeeds
        user.refresh_from_db()
        self.assertFalse(user.check_password("OldPassword123!"))
        self.assertTrue(user.check_password("NewSecretPassword123!"))
