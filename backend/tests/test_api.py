from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from gis.models import Ward
from gis.services import load_wards_from_geojson

class RestApiIntegrationTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        load_wards_from_geojson()

    def setUp(self):
        self.client = APIClient()

    def test_health_check_endpoint(self):
        res = self.client.get('/api/health/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('database', res.data)
        self.assertIn('weather_service', res.data)
        self.assertIn('ml_model', res.data)
        self.assertEqual(res.data['database'], 'connected')

    def test_gis_wards_geojson(self):
        res = self.client.get('/api/gis/wards/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['type'], 'FeatureCollection')
        self.assertGreaterEqual(len(res.data['features']), 5)

    def test_weather_endpoints(self):
        curr_res = self.client.get('/api/weather/current/?lat=17.6868&lon=83.2185')
        self.assertEqual(curr_res.status_code, status.HTTP_200_OK)
        self.assertIn('thermal_indices', curr_res.data)
        self.assertIn('htsi', curr_res.data['thermal_indices'])

        fc_res = self.client.get('/api/weather/forecast/?lat=17.6868&lon=83.2185')
        self.assertEqual(fc_res.status_code, status.HTTP_200_OK)
        self.assertIn('hourly_48h', fc_res.data)
        self.assertIn('daily_5d', fc_res.data)

    def test_ml_predictions_and_explainability(self):
        pred_res = self.client.get('/api/predictions/current/')
        self.assertEqual(pred_res.status_code, status.HTTP_200_OK)
        self.assertIn('predicted_htsi', pred_res.data)
        self.assertIn('predicted_risk', pred_res.data)

        xai_res = self.client.get('/api/predictions/explain/')
        self.assertEqual(xai_res.status_code, status.HTTP_200_OK)
        self.assertIn('drivers', xai_res.data)
        self.assertIn('interpretation', xai_res.data)

    def test_simulation_run(self):
        sim_data = {
            "temperature": 42.0,
            "humidity": 75.0,
            "wind_speed": 1.0,
            "solar_radiation": 900.0,
            "vulnerability_score": 70.0
        }
        res = self.client.post('/api/simulation/run/', sim_data, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('simulated', res.data)
        self.assertIn('comparison', res.data)
        self.assertGreater(res.data['simulated']['htsi'], 80.0)
        self.assertEqual(res.data['simulated']['risk_level'], 'EXTREME')

    def test_location_check_risk(self):
        res = self.client.post('/api/location/check-risk/', {
            "latitude": 17.6904,
            "longitude": 83.2091
        }, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('risk_level', res.data)
        self.assertIn('inside_risk_zone', res.data)

    def test_push_subscribe(self):
        sub_payload = {
            "endpoint": "https://fcm.googleapis.com/fcm/send/sample-token-12345",
            "keys": {
                "p256dh": "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcDnVwXGZCYzxG3IZgOY89cx2JX0-mW97y4-f6p6d8qD4",
                "auth": "tBHItJI5svbpez7KI4CCXg"
            }
        }
        res = self.client.post('/api/notifications/subscribe/', sub_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
