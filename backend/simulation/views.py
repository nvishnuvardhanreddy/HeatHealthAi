from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Simulation
from thermal.services import calculate_htsi, classify_risk

class RunSimulationView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        try:
            temp = float(request.data.get('temperature', 42.0))
            rh = float(request.data.get('humidity', 75.0))
            wind = float(request.data.get('wind_speed', 1.0))
            solar = float(request.data.get('solar_radiation', 900.0))
            vuln = float(request.data.get('vulnerability_score', 65.0))
        except (ValueError, TypeError):
            return Response({"detail": "Invalid numeric simulation parameters."}, status=status.HTTP_400_BAD_REQUEST)

        # 1. Calculate simulated conditions
        sim_result = calculate_htsi(
            temperature_c=temp,
            humidity_pct=rh,
            wind_speed_ms=wind,
            solar_radiation_wm2=solar,
            vulnerability_score=vuln
        )

        # 2. Baseline comparison (standard reference baseline 40°C, 70% RH, 2m/s, 800W/m², 50 vuln)
        baseline_result = calculate_htsi(
            temperature_c=40.0,
            humidity_pct=70.0,
            wind_speed_ms=2.0,
            solar_radiation_wm2=800.0,
            vulnerability_score=50.0
        )

        htsi_diff = round(sim_result['htsi'] - baseline_result['htsi'], 1)

        # Save simulation run if user logged in
        user = request.user if request.user and request.user.is_authenticated else None
        sim_obj = Simulation.objects.create(
            user=user,
            input_temperature=temp,
            input_humidity=rh,
            input_wind_speed=wind,
            input_solar_radiation=solar,
            input_vulnerability=vuln,
            calculated_heat_index=sim_result['heat_index'],
            calculated_wbgt=sim_result['wbgt'],
            calculated_utci=sim_result['utci'],
            calculated_htsi=sim_result['htsi'],
            calculated_risk_level=sim_result['risk_level'],
            baseline_htsi=baseline_result['htsi'],
            htsi_difference=htsi_diff
        )

        return Response({
            "simulation_id": sim_obj.id,
            "inputs": {
                "temperature": temp,
                "humidity": rh,
                "wind_speed": wind,
                "solar_radiation": solar,
                "vulnerability_score": vuln
            },
            "simulated": {
                "heat_index": sim_result['heat_index'],
                "wbgt": sim_result['wbgt'],
                "utci": sim_result['utci'],
                "htsi": sim_result['htsi'],
                "risk_level": sim_result['risk_level'],
                "contributions": sim_result['contributions']
            },
            "baseline": {
                "temperature": 40.0,
                "humidity": 70.0,
                "htsi": baseline_result['htsi'],
                "risk_level": baseline_result['risk_level']
            },
            "comparison": {
                "htsi_difference": htsi_diff,
                "risk_escalated": (sim_result['htsi'] > baseline_result['htsi']),
                "direction": "INCREASE" if htsi_diff > 0 else ("DECREASE" if htsi_diff < 0 else "UNCHANGED")
            },
            "disclaimer": "AI-generated decision-support estimate. Prototype model requires validation using historical local meteorological and health data."
        }, status=status.HTTP_200_OK)
