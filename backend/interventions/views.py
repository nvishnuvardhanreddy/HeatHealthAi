from rest_framework import status, views, permissions
from rest_framework.response import Response
from .models import Intervention, EmergencyPriority
from .services import evaluate_emergency_priorities, seed_default_interventions
from gis.models import Ward

class InterventionListView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        seed_default_interventions()
        interventions = Intervention.objects.filter(is_active=True).order_by('-min_htsi')
        data = [
            {
                "id": i.id,
                "title": i.title,
                "description": i.description,
                "min_htsi": i.min_htsi,
                "max_htsi": i.max_htsi,
                "priority_level": i.priority_level,
                "target_category": i.target_category,
                "is_active": i.is_active
            }
            for i in interventions
        ]
        return Response(data, status=status.HTTP_200_OK)


class EmergencyPrioritiesView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        priorities = evaluate_emergency_priorities()
        data = []
        for p in priorities:
            data.append({
                "rank": p["priority_rank"],
                "ward_name": p["ward_name"],
                "ward_id": p["ward_id"],
                "zone": p["zone"],
                "htsi": p["htsi"],
                "risk_level": p["risk_level"],
                "priority_score": p["priority_score"],
                "population": p["population"],
                "population_density": p["population_density"],
                "vulnerability_score": p["vulnerability_score"],
                "outdoor_worker_ratio": p["outdoor_worker_ratio"],
                "recommended_actions": p["matched_actions"]
            })
        return Response(data, status=status.HTTP_200_OK)


class HeatActionPlanView(views.APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        priorities = evaluate_emergency_priorities()
        peak_priority = priorities[0] if priorities else None

        wards = Ward.objects.all()
        total_exposed = sum(w.population for w in wards if w.current_htsi >= 60.0)
        extreme_exposed = sum(w.population for w in wards if w.current_htsi >= 80.0)
        max_htsi = max([w.current_htsi for w in wards], default=85.0)

        # Hospital preparedness status
        if max_htsi >= 80.0:
            hospital_status = "LEVEL 3: CRITICAL SURGE - Emergency Heat Stroke Wards Active"
            response_level = "RED ALERT (EXTREME THERMAL EMERGENCY)"
        elif max_htsi >= 60.0:
            hospital_status = "LEVEL 2: ELEVATED ALERT - Rehydration Supplies & Extra Staff Standby"
            response_level = "ORANGE WARNING (SEVERE THERMAL STRESS)"
        else:
            hospital_status = "LEVEL 1: NORMAL MONITORING"
            response_level = "YELLOW ADVISORY"

        return Response({
            "response_level": response_level,
            "peak_htsi": max_htsi,
            "peak_risk_ward": peak_priority["ward_name"] if peak_priority else "Gajuwaka",
            "population_at_risk": total_exposed,
            "population_at_extreme_risk": extreme_exposed,
            "hospital_preparedness_indicator": hospital_status,
            "emergency_priority_score": peak_priority["priority_score"] if peak_priority else 575.2,
            "priority_zones": [p["ward_name"] for p in priorities[:3]],
            "recommended_actions": peak_priority["matched_actions"] if peak_priority else [],
            "disclaimer": "AI-generated decision-support recommendations. Local authority standard operating procedures must be verified."
        }, status=status.HTTP_200_OK)
