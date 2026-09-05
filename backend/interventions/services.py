from django.utils import timezone
from .models import Intervention, EmergencyPriority
from gis.models import Ward

DEFAULT_INTERVENTIONS = [
    {
        "title": "Activate Municipal Air-Conditioned Cooling Shelters",
        "description": "Open public halls, transit stations, and community centers as designated 24/7 cooling centers with shaded resting areas and hydration.",
        "min_htsi": 80.0,
        "max_htsi": 100.0,
        "priority_level": Intervention.PriorityLevel.CRITICAL,
        "target_category": Intervention.Category.COOLING
    },
    {
        "title": "Enforce Mandatory Outdoor Labour Moratorium (11 AM – 4 PM)",
        "description": "Mandate cessation of strenuous outdoor construction, shipyard welding, road maintenance, and delivery work during peak thermal radiation window.",
        "min_htsi": 75.0,
        "max_htsi": 100.0,
        "priority_level": Intervention.PriorityLevel.CRITICAL,
        "target_category": Intervention.Category.LABOUR
    },
    {
        "title": "Hospital Heat-Stroke Ward Surge Protocol & Ice Packs Distribution",
        "description": "Activate dedicated heat-related illness stabilization beds, prep IV rehydration fluids, and deploy emergency mobile paramedic cooling vans.",
        "min_htsi": 75.0,
        "max_htsi": 100.0,
        "priority_level": Intervention.PriorityLevel.HIGH,
        "target_category": Intervention.Category.HEALTH
    },
    {
        "title": "Emergency Drinking Water Tanker Deployment to Slums & Markets",
        "description": "Deploy pressurized municipal water tankers and ORS (Oral Rehydration Salts) distribution kiosks across informal settlements and dense bazaars.",
        "min_htsi": 70.0,
        "max_htsi": 100.0,
        "priority_level": Intervention.PriorityLevel.HIGH,
        "target_category": Intervention.Category.WATER
    },
    {
        "title": "Continuous Power Grid Voltage Support & Cool Roof Water Sprinkling",
        "description": "Ensure zero scheduled power cuts to healthcare and residential feeder lines; initiate rooftop evaporative water misting on key industrial structures.",
        "min_htsi": 65.0,
        "max_htsi": 100.0,
        "priority_level": Intervention.PriorityLevel.MEDIUM,
        "target_category": Intervention.Category.POWER
    },
    {
        "title": "Public Heat Stress Advisory & Media Broadcasts",
        "description": "Broadcast hourly heat index updates and safety protocols across municipal sirens, FM radio, WhatsApp citizen channels, and transit display boards.",
        "min_htsi": 40.0,
        "max_htsi": 100.0,
        "priority_level": Intervention.PriorityLevel.LOW,
        "target_category": Intervention.Category.ADVISORY
    }
]

def seed_default_interventions():
    """Seed standard pre-emptive heat action interventions."""
    for item in DEFAULT_INTERVENTIONS:
        Intervention.objects.get_or_create(
            title=item["title"],
            defaults=item
        )

def evaluate_emergency_priorities():
    """
    Evaluate all wards to determine emergency response urgency:
    Priority Score = (HTSI * Population Density * Vulnerability Score) / 1000
    Ranks wards in descending order of urgency.
    """
    wards = Ward.objects.all()
    if not wards.exists():
        return []

    seed_default_interventions()
    active_interventions = list(Intervention.objects.filter(is_active=True))

    evaluated = []
    for w in wards:
        htsi = w.current_htsi
        pop_density = w.population_density
        vuln = w.vulnerability_score

        # Urgency formula
        raw_score = (htsi * (pop_density / 100.0) * vuln) / 100.0
        priority_score = round(raw_score, 1)

        # Matched actions based on HTSI
        matched_actions = [
            i.title for i in active_interventions if i.min_htsi <= htsi <= i.max_htsi
        ]

        evaluated.append({
            "ward": w,
            "ward_name": w.name,
            "ward_id": w.ward_id,
            "zone": w.zone,
            "htsi": htsi,
            "risk_level": w.current_risk,
            "population": w.population,
            "population_density": pop_density,
            "vulnerability_score": vuln,
            "outdoor_worker_ratio": w.outdoor_worker_ratio,
            "priority_score": priority_score,
            "matched_actions": matched_actions
        })

    # Sort descending by priority score
    evaluated.sort(key=lambda x: x["priority_score"], reverse=True)

    results = []
    EmergencyPriority.objects.all().delete()

    for rank, item in enumerate(evaluated, start=1):
        ep = EmergencyPriority.objects.create(
            ward=item["ward"],
            htsi=item["htsi"],
            population=item["population"],
            population_density=item["population_density"],
            vulnerability_score=item["vulnerability_score"],
            priority_score=item["priority_score"],
            priority_rank=rank,
            recommended_actions=item["matched_actions"]
        )
        item["priority_rank"] = rank
        results.append(item)

    return results
