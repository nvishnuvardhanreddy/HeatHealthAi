import json
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone

from users.models import User, GovernmentVerification, VerificationAuditLog
from gis.models import Ward
from gis.services import load_wards_from_geojson
from vulnerability.models import VulnerabilityProfile
from thermal.models import ThermalRisk
from thermal.services import calculate_htsi
from interventions.services import seed_default_interventions, evaluate_emergency_priorities
from weather.services import fetch_and_record_weather

class Command(BaseCommand):
    help = 'Seeds demonstration wards, weather, vulnerability, thermal risk, emergency priorities, and test accounts.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("===> [1/6] Seeding Visakhapatnam Ward Boundaries from GeoJSON..."))
        count = load_wards_from_geojson()
        self.stdout.write(self.style.SUCCESS(f"     Successfully loaded/updated {count} Wards."))

        self.stdout.write(self.style.NOTICE("===> [2/6] Seeding Demographic & Vulnerability Profiles..."))
        pop_file = Path(settings.BASE_DIR).parent / 'data' / 'sample_population' / 'vizag_wards_population.json'
        if pop_file.exists():
            with open(pop_file, 'r', encoding='utf-8') as f:
                pop_data = json.load(f)

            for item in pop_data:
                ward = Ward.objects.filter(ward_id=item['ward_id']).first()
                if ward:
                    vp, _ = VulnerabilityProfile.objects.update_or_create(
                        ward=ward,
                        defaults={
                            'total_population': item['total_population'],
                            'elderly_population': item['elderly_population'],
                            'children_under_5': item['children_under_5'],
                            'outdoor_workers': item['outdoor_workers'],
                            'informal_settlement_ratio': item['informal_settlement_ratio'],
                            'cooling_access_ratio': item['cooling_access_ratio'],
                            'water_supply_stress': item['water_supply_stress'],
                            'hospital_beds_per_1000': item['hospital_beds_per_1000'],
                        }
                    )
                    vp.calculate_score()
                    vp.save()
                    ward.vulnerability_score = vp.vulnerability_score
                    ward.save(update_fields=['vulnerability_score'])
            self.stdout.write(self.style.SUCCESS("     Vulnerability profiles synchronized."))

        self.stdout.write(self.style.NOTICE("===> [3/6] Computing Ward-Level Baseline Thermal Stress & Hotspots..."))
        # Presentation benchmark conditions: Temp 40°C, RH 70%, Wind 2.0m/s, Solar 800W/m²
        for ward in Ward.objects.all():
            res = calculate_htsi(
                temperature_c=40.0 + (0.5 if 'Gajuwaka' in ward.name else (0.2 if 'Madhurawada' in ward.name else -0.3)),
                humidity_pct=70.0 + (3.0 if 'Bheemunipatnam' in ward.name else 0.0),
                wind_speed_ms=2.0 if 'Bheemunipatnam' not in ward.name else 3.2,
                solar_radiation_wm2=800.0,
                vulnerability_score=ward.vulnerability_score
            )
            ward.current_htsi = res['htsi']
            ward.current_risk = res['risk_level']
            ward.save(update_fields=['current_htsi', 'current_risk', 'last_risk_update'])

            ThermalRisk.objects.create(
                ward_name=ward.name,
                latitude=ward.centroid_lat,
                longitude=ward.centroid_lon,
                timestamp=timezone.now(),
                temperature=res['temperature'],
                humidity=res['humidity'],
                wind_speed=res['wind_speed'],
                solar_radiation=res['solar_radiation'],
                heat_index=res['heat_index'],
                wbgt=res['wbgt'],
                utci=res['utci'],
                htsi=res['htsi'],
                risk_level=res['risk_level'],
                vulnerability_score=ward.vulnerability_score,
                is_forecast=False,
                source='DEMO BENCHMARK'
            )
        self.stdout.write(self.style.SUCCESS("     Ward thermal stress indexed."))

        self.stdout.write(self.style.NOTICE("===> [4/6] Seeding Interventions & Emergency Prioritization Matrix..."))
        seed_default_interventions()
        priorities = evaluate_emergency_priorities()
        self.stdout.write(self.style.SUCCESS(f"     Calculated {len(priorities)} emergency prioritized wards."))

        self.stdout.write(self.style.NOTICE("===> [5/6] Ingesting Baseline Weather Observation..."))
        fetch_and_record_weather()
        self.stdout.write(self.style.SUCCESS("     Weather observation recorded."))

        self.stdout.write(self.style.NOTICE("===> [6/6] Creating Standard Role Demonstration Accounts..."))
        # 1. Superuser / Admin
        admin_user, _ = User.objects.get_or_create(
            email='admin@heathealthai.org',
            defaults={
                'username': 'admin@heathealthai.org',
                'first_name': 'System',
                'last_name': 'Administrator',
                'role': User.Role.ADMIN,
                'email_status': User.EmailStatus.ACTIVE,
                'is_staff': True,
                'is_superuser': True
            }
        )
        admin_user.set_password('Admin123!')
        admin_user.save()

        # 2. Verified Government Authority
        gov_verified_user, _ = User.objects.get_or_create(
            email='officer.vizag@ap.gov.in',
            defaults={
                'username': 'officer.vizag@ap.gov.in',
                'first_name': 'Ramesh',
                'last_name': 'Varma',
                'phone': '+91 98480 12345',
                'role': User.Role.GOVERNMENT_AUTHORITY,
                'email_status': User.EmailStatus.ACTIVE
            }
        )
        gov_verified_user.set_password('Officer123!')
        gov_verified_user.save()

        verif_obj, _ = GovernmentVerification.objects.update_or_create(
            user=gov_verified_user,
            defaults={
                'official_email': 'officer.vizag@ap.gov.in',
                'department': 'Greater Visakhapatnam Municipal Corporation (GVMC)',
                'designation': 'Chief Disaster Management Officer',
                'employee_id': 'AP-GVMC-DM-884',
                'government_domain': 'ap.gov.in',
                'verification_status': GovernmentVerification.Status.VERIFIED,
                'verified_at': timezone.now(),
                'verified_by': admin_user,
                'verification_notes': 'Official identity and department mandate verified.'
            }
        )
        VerificationAuditLog.objects.get_or_create(
            government_verification=verif_obj,
            action=VerificationAuditLog.Action.APPROVED,
            defaults={'performed_by': admin_user, 'notes': 'Verified during initial system setup.'}
        )

        # 3. Pending Government Authority
        gov_pending_user, _ = User.objects.get_or_create(
            email='commissioner.urban@gov.in',
            defaults={
                'username': 'commissioner.urban@gov.in',
                'first_name': 'Ananya',
                'last_name': 'Sharma',
                'phone': '+91 94401 56789',
                'role': User.Role.GOVERNMENT_AUTHORITY,
                'email_status': User.EmailStatus.ACTIVE
            }
        )
        gov_pending_user.set_password('Pending123!')
        gov_pending_user.save()

        pending_verif, _ = GovernmentVerification.objects.update_or_create(
            user=gov_pending_user,
            defaults={
                'official_email': 'commissioner.urban@gov.in',
                'department': 'Ministry of Housing and Urban Affairs',
                'designation': 'Joint Commissioner (Urban Resilience)',
                'employee_id': 'MOHUA-2026-901',
                'government_domain': 'gov.in',
                'verification_status': GovernmentVerification.Status.PENDING,
                'verification_notes': 'Registered with valid government domain. Awaiting administrative review.'
            }
        )
        VerificationAuditLog.objects.get_or_create(
            government_verification=pending_verif,
            action=VerificationAuditLog.Action.SUBMITTED,
            defaults={'performed_by': gov_pending_user, 'notes': 'Application submitted.'}
        )

        # 4. Standard Citizen
        citizen_user, _ = User.objects.get_or_create(
            email='citizen@example.com',
            defaults={
                'username': 'citizen@example.com',
                'first_name': 'Kiran',
                'last_name': 'Kumar',
                'phone': '+91 91234 56780',
                'role': User.Role.CITIZEN,
                'email_status': User.EmailStatus.ACTIVE
            }
        )
        citizen_user.set_password('Citizen123!')
        citizen_user.save()

        self.stdout.write(self.style.SUCCESS("     Demonstration accounts ready:"))
        self.stdout.write("     - Admin:        admin@heathealthai.org      / Admin123!")
        self.stdout.write("     - Verified Gov: officer.vizag@ap.gov.in     / Officer123!")
        self.stdout.write("     - Pending Gov:  commissioner.urban@gov.in   / Pending123!")
        self.stdout.write("     - Citizen:      citizen@example.com         / Citizen123!")
        self.stdout.write(self.style.SUCCESS("===> Demo data seeding complete!"))
