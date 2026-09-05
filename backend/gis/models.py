from django.db import models
from django.conf import settings

class Ward(models.Model):
    ward_id = models.CharField(max_length=50, unique=True, db_index=True)
    name = models.CharField(max_length=100, db_index=True)
    zone = models.CharField(max_length=100, default='Central Zone')
    city = models.CharField(max_length=100, default='India')

    population = models.PositiveIntegerField(default=50000)
    population_density = models.PositiveIntegerField(default=5000, help_text='People per sq km')
    vulnerability_score = models.FloatField(default=50.0, help_text='0-100 demographic vulnerability score')
    outdoor_worker_ratio = models.FloatField(default=0.30, help_text='Fraction of population working outdoors')
    healthcare_access_score = models.FloatField(default=60.0, help_text='0-100 rating')
    green_cover_percent = models.FloatField(default=20.0, help_text='Percentage green canopy cover')
    primary_exposure = models.TextField(blank=True, default='')

    # GeoJSON geometry representation: {"type": "Polygon", "coordinates": [...]}
    geometry_geojson = models.JSONField(help_text='GeoJSON polygon or multipolygon geometry')
    centroid_lat = models.FloatField()
    centroid_lon = models.FloatField()

    # Cached current risk statistics
    current_htsi = models.FloatField(default=45.0)
    current_risk = models.CharField(max_length=20, default='HIGH')
    last_risk_update = models.DateTimeField(auto_now=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.ward_id}) - Risk: {self.current_risk} ({self.current_htsi})"


class Location(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='location_history')
    latitude = models.FloatField()
    longitude = models.FloatField()
    accuracy = models.FloatField(null=True, blank=True)
    detected_ward = models.ForeignKey(Ward, null=True, blank=True, on_delete=models.SET_NULL)
    city = models.CharField(max_length=100, default='India')
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        ward_name = self.detected_ward.name if self.detected_ward else 'Unknown'
        return f"Loc ({self.latitude:.4f}, {self.longitude:.4f}) -> {ward_name} at {self.timestamp.strftime('%Y-%m-%d %H:%M')}"
