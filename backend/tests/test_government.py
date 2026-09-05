from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from users.models import User, GovernmentVerification, VerificationAuditLog

class GovernmentVerificationWorkflowTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser(
            email='admin@heathealthai.org',
            password='AdminPassword123!'
        )

    def test_government_email_domain_validation(self):
        # 1. Reject spoofed / invalid domains
        invalid_emails = [
            "hacker@fakegov.in",
            "attacker@gov.in.malicious.com",
            "user@gmail.com",
            "officer@gov.in.net"
        ]
        for inv_email in invalid_emails:
            res = self.client.post('/api/auth/register/', {
                "full_name": "Test Officer",
                "email": inv_email,
                "password": "Password123!",
                "confirm_password": "Password123!",
                "role": "GOVERNMENT_AUTHORITY",
                "official_email": inv_email,
                "department": "Disaster Response",
                "designation": "Inspector"
            }, format='json')
            self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

        # 2. Accept valid government email domains
        valid_res = self.client.post('/api/auth/register/', {
            "full_name": "Suresh Babu",
            "email": "suresh.babu@ap.gov.in",
            "password": "Password123!",
            "confirm_password": "Password123!",
            "role": "GOVERNMENT_AUTHORITY",
            "official_email": "suresh.babu@ap.gov.in",
            "department": "AP Disaster Management Authority",
            "designation": "Executive Officer",
            "employee_id": "AP-DMA-101"
        }, format='json')
        self.assertEqual(valid_res.status_code, status.HTTP_201_CREATED)

        user = User.objects.get(email="suresh.babu@ap.gov.in")
        verif = GovernmentVerification.objects.get(user=user)
        self.assertEqual(verif.verification_status, GovernmentVerification.Status.PENDING)

    def test_two_stage_verification_and_rbac(self):
        # Create unverified government user
        gov_user = User.objects.create_user(
            email="collector@ap.gov.in",
            password="Collector123!",
            role=User.Role.GOVERNMENT_AUTHORITY,
            email_status=User.EmailStatus.ACTIVE
        )
        verif = GovernmentVerification.objects.create(
            user=gov_user,
            official_email="collector@ap.gov.in",
            department="District Administration",
            designation="District Collector",
            government_domain="ap.gov.in",
            verification_status=GovernmentVerification.Status.PENDING
        )

        # 1. PENDING authority cannot access authority dashboard
        self.client.force_authenticate(user=gov_user)
        pending_res = self.client.get('/api/dashboard/authority/')
        self.assertEqual(pending_res.status_code, status.HTTP_403_FORBIDDEN)

        # 2. Admin reviews and approves
        self.client.force_authenticate(user=self.admin)
        approve_res = self.client.post(f'/api/auth/admin/verifications/{verif.id}/approve/', {
            "notes": "Verified against official gazette notification."
        }, format='json')
        self.assertEqual(approve_res.status_code, status.HTTP_200_OK)

        verif.refresh_from_db()
        self.assertEqual(verif.verification_status, GovernmentVerification.Status.VERIFIED)
        self.assertEqual(verif.verified_by, self.admin)

        # 3. VERIFIED authority CAN now access authority dashboard
        self.client.force_authenticate(user=gov_user)
        auth_res = self.client.get('/api/dashboard/authority/')
        self.assertEqual(auth_res.status_code, status.HTTP_200_OK)
        self.assertEqual(auth_res.data.get('authority_status'), "VERIFIED GOVERNMENT AUTHORITY")

        # 4. Authority CANNOT access admin dashboard
        admin_res = self.client.get('/api/dashboard/admin/')
        self.assertEqual(admin_res.status_code, status.HTTP_403_FORBIDDEN)

    def test_government_rejection_flow(self):
        gov_user = User.objects.create_user(
            email="applicant@nic.in",
            password="Password123!",
            role=User.Role.GOVERNMENT_AUTHORITY,
            email_status=User.EmailStatus.ACTIVE
        )
        verif = GovernmentVerification.objects.create(
            user=gov_user,
            official_email="applicant@nic.in",
            department="Transport",
            designation="Clerk",
            government_domain="nic.in",
            verification_status=GovernmentVerification.Status.PENDING
        )

        self.client.force_authenticate(user=self.admin)

        # Rejection without reason fails
        bad_reject = self.client.post(f'/api/auth/admin/verifications/{verif.id}/reject/', {}, format='json')
        self.assertEqual(bad_reject.status_code, status.HTTP_400_BAD_REQUEST)

        # Rejection with mandatory reason succeeds
        good_reject = self.client.post(f'/api/auth/admin/verifications/{verif.id}/reject/', {
            "reason": "Department ID document unverified.",
            "notes": "Contact department head."
        }, format='json')
        self.assertEqual(good_reject.status_code, status.HTTP_200_OK)

        verif.refresh_from_db()
        self.assertEqual(verif.verification_status, GovernmentVerification.Status.REJECTED)
        self.assertEqual(verif.rejection_reason, "Department ID document unverified.")
