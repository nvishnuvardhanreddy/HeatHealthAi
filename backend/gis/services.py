import json
import math
import os
from pathlib import Path
from django.conf import settings
from shapely.geometry import shape, Point
from .models import Ward
from thermal.services import calculate_htsi

DEFAULT_GEOJSON_PATH = Path(settings.BASE_DIR).parent / 'data' / 'geojson' / 'visakhapatnam_wards.geojson'

def load_wards_from_geojson(file_path=None):
    """
    Load or synchronize Ward models from the GeoJSON file.
    Idempotent operation: updates existing wards or creates missing ones.
    """
    target_path = Path(file_path) if file_path else DEFAULT_GEOJSON_PATH
    if not target_path.exists():
        raise FileNotFoundError(f"GeoJSON file not found at: {target_path}")

    with open(target_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    loaded_count = 0
    for feat in data.get('features', []):
        props = feat.get('properties', {})
        geom = feat.get('geometry', {})
        ward_id = props.get('ward_id')
        name = props.get('name')

        if not ward_id or not geom:
            continue

        poly = shape(geom)
        centroid = poly.centroid

        ward, created = Ward.objects.update_or_create(
            ward_id=ward_id,
            defaults={
                'name': name,
                'zone': props.get('zone', 'Central Zone'),
                'city': props.get('city', 'Visakhapatnam'),
                'population': props.get('population', 50000),
                'population_density': props.get('population_density', 5000),
                'vulnerability_score': props.get('vulnerability_score', 50.0),
                'outdoor_worker_ratio': props.get('outdoor_worker_ratio', 0.30),
                'healthcare_access_score': props.get('healthcare_access_score', 60.0),
                'green_cover_percent': props.get('green_cover_percent', 20.0),
                'primary_exposure': props.get('primary_exposure', ''),
                'geometry_geojson': geom,
                'centroid_lat': round(centroid.y, 6),
                'centroid_lon': round(centroid.x, 6),
            }
        )
        loaded_count += 1

    return loaded_count


def haversine_distance_km(lat1, lon1, lat2, lon2):
    """Calculate Great Circle distance between two points in kilometers."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


def get_ward_for_coordinates(lat: float, lon: float):
    """
    Perform point-in-polygon lookup using Shapely across all Wards.
    Returns:
        (ward, is_inside, distance_to_zone_km)
    """
    pt = Point(lon, lat)
    wards = Ward.objects.all()

    if not wards.exists():
        load_wards_from_geojson()
        wards = Ward.objects.all()

    # 1. Exact Point-in-Polygon check
    for w in wards:
        try:
            poly = shape(w.geometry_geojson)
            if poly.contains(pt) or poly.touches(pt):
                return w, True, 0.0
        except Exception:
            continue

    # 2. If outside all polygons, find closest ward by centroid distance
    closest_ward = None
    min_dist = float('inf')
    for w in wards:
        d = haversine_distance_km(lat, lon, w.centroid_lat, w.centroid_lon)
        if d < min_dist:
            min_dist = d
            closest_ward = w

    return closest_ward, False, min_dist


def get_all_wards_geojson():
    """
    Format all Wards as a GeoJSON FeatureCollection with live/cached thermal attributes.
    """
    wards = Ward.objects.all()
    if not wards.exists():
        load_wards_from_geojson()
        wards = Ward.objects.all()

    features = []
    for w in wards:
        feat = {
            "type": "Feature",
            "properties": {
                "id": w.id,
                "ward_id": w.ward_id,
                "name": w.name,
                "zone": w.zone,
                "city": w.city,
                "population": w.population,
                "population_density": w.population_density,
                "vulnerability_score": w.vulnerability_score,
                "outdoor_worker_ratio": w.outdoor_worker_ratio,
                "healthcare_access_score": w.healthcare_access_score,
                "green_cover_percent": w.green_cover_percent,
                "primary_exposure": w.primary_exposure,
                "htsi": w.current_htsi,
                "risk_level": w.current_risk,
                "centroid": [w.centroid_lat, w.centroid_lon],
                "last_updated": w.last_risk_update.isoformat() if w.last_risk_update else None
            },
            "geometry": w.geometry_geojson
        }
        features.append(feat)

    return {
        "type": "FeatureCollection",
        "name": "Visakhapatnam_Wards_Risk",
        "features": features
    }
