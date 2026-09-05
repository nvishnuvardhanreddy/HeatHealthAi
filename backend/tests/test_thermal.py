from django.test import TestCase
from thermal.services import (
    calculate_heat_index,
    calculate_wbgt,
    calculate_utci,
    calculate_htsi,
    classify_risk
)

class ThermalStressCalculationTests(TestCase):
    """
    Test suite for biometeorological indices and Human Thermal Stress Index (HTSI).
    """

    def test_benchmark_scenario(self):
        """
        Required test scenario (Section 84 & 95):
        Temperature = 40°C, Humidity = 70%, Wind = 2 m/s, Solar = 800 W/m²
        """
        res = calculate_htsi(
            temperature_c=40.0,
            humidity_pct=70.0,
            wind_speed_ms=2.0,
            solar_radiation_wm2=800.0,
            vulnerability_score=50.0
        )

        self.assertGreater(res['heat_index'], 45.0)
        self.assertGreater(res['wbgt'], 30.0)
        self.assertGreater(res['utci'], 40.0)
        self.assertGreaterEqual(res['htsi'], 80.0)
        self.assertEqual(res['risk_level'], 'EXTREME')

    def test_heat_index_rothfusz(self):
        # Mild conditions (<80°F / 26.6°C)
        hi_mild = calculate_heat_index(22.0, 50.0)
        self.assertAlmostEqual(hi_mild, 22.0, delta=2.0)

        # High heat & humidity
        hi_high = calculate_heat_index(38.0, 75.0)
        self.assertGreater(hi_high, 50.0)

    def test_wbgt_bounds(self):
        wbgt_low = calculate_wbgt(25.0, 40.0, wind_speed_ms=3.0, solar_radiation_wm2=200.0)
        wbgt_high = calculate_wbgt(42.0, 80.0, wind_speed_ms=1.0, solar_radiation_wm2=900.0)
        self.assertLess(wbgt_low, wbgt_high)
        self.assertGreater(wbgt_high, 34.0)

    def test_risk_classification_tiers(self):
        self.assertEqual(classify_risk(15.0), 'LOW')
        self.assertEqual(classify_risk(30.0), 'MODERATE')
        self.assertEqual(classify_risk(55.0), 'HIGH')
        self.assertEqual(classify_risk(75.0), 'VERY HIGH')
        self.assertEqual(classify_risk(88.0), 'EXTREME')
