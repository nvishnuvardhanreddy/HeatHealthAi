from django.urls import path
from .views import WardGeoJSONView, WardRiskListView, WardHotspotsView, LocationUpdateView, LocationRiskCheckView

urlpatterns = [
    path('wards/', WardGeoJSONView.as_view(), name='gis_wards_geojson'),
    path('wards/geojson/', WardGeoJSONView.as_view(), name='gis_wards_geojson_alias'),
    path('ward-risk/', WardRiskListView.as_view(), name='gis_ward_risk_list'),
    path('hotspots/', WardHotspotsView.as_view(), name='gis_hotspots'),
    path('location/update/', LocationUpdateView.as_view(), name='location_update'),
    path('location/check-risk/', LocationRiskCheckView.as_view(), name='location_check_risk'),
]
