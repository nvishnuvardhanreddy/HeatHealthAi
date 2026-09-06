from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

from dashboard.unified_views import (
    serve_dashboard1_index,
    serve_dashboard1_css,
    serve_dashboard1_js,
    UnifiedHealthCheckView,
    GeocodeView,
    ReverseGeocodeView,
    UnifiedRiskView,
    UnifiedForecastView,
    UnifiedHourlyView,
    UnifiedHotspotsView,
    UnifiedImpactForecastView,
    UnifiedVulnerabilityView,
    UnifiedActionPlanView,
    UnifiedEmergencyPriorityView,
    UnifiedSimulationView,
)

urlpatterns = [
    # ---------------------------------------------------------
    # Frontend SPA Routes (Dashboard 1 UI)
    # ---------------------------------------------------------
    path('', serve_dashboard1_index, name='frontend_index'),
    path('style.css', serve_dashboard1_css, name='frontend_css'),
    path('app.js', serve_dashboard1_js, name='frontend_js'),

    # ---------------------------------------------------------
    # Unified Root Endpoints (Expected by Dashboard 1 Frontend)
    # ---------------------------------------------------------
    path('health', UnifiedHealthCheckView.as_view(), name='root_health'),
    path('geocode', GeocodeView.as_view(), name='root_geocode'),
    path('reverse-geocode', ReverseGeocodeView.as_view(), name='root_reverse_geocode'),
    path('risk', UnifiedRiskView.as_view(), name='root_risk'),
    path('forecast', UnifiedForecastView.as_view(), name='root_forecast'),
    path('hourly', UnifiedHourlyView.as_view(), name='root_hourly'),
    path('hotspots', UnifiedHotspotsView.as_view(), name='root_hotspots'),
    path('impact-forecast', UnifiedImpactForecastView.as_view(), name='root_impact_forecast'),
    path('vulnerability', UnifiedVulnerabilityView.as_view(), name='root_vulnerability'),
    path('action-plan', UnifiedActionPlanView.as_view(), name='root_action_plan'),
    path('emergency-priority', UnifiedEmergencyPriorityView.as_view(), name='root_emergency_priority'),
    path('simulate', UnifiedSimulationView.as_view(), name='root_simulate'),

    # ---------------------------------------------------------
    # Unified API Endpoints (Prefix /api/)
    # ---------------------------------------------------------
    path('api/health/', UnifiedHealthCheckView.as_view(), name='api_health_slash'),
    path('api/health', UnifiedHealthCheckView.as_view(), name='api_health'),
    path('api/geocode/', GeocodeView.as_view(), name='api_geocode_slash'),
    path('api/geocode', GeocodeView.as_view(), name='api_geocode'),
    path('api/reverse-geocode/', ReverseGeocodeView.as_view(), name='api_reverse_geocode_slash'),
    path('api/reverse-geocode', ReverseGeocodeView.as_view(), name='api_reverse_geocode'),
    path('api/risk/', UnifiedRiskView.as_view(), name='api_risk_slash'),
    path('api/risk', UnifiedRiskView.as_view(), name='api_risk'),
    path('api/forecast/', UnifiedForecastView.as_view(), name='api_forecast_slash'),
    path('api/forecast', UnifiedForecastView.as_view(), name='api_forecast'),
    path('api/hourly/', UnifiedHourlyView.as_view(), name='api_hourly_slash'),
    path('api/hourly', UnifiedHourlyView.as_view(), name='api_hourly'),
    path('api/hotspots/', UnifiedHotspotsView.as_view(), name='api_hotspots_slash'),
    path('api/hotspots', UnifiedHotspotsView.as_view(), name='api_hotspots'),
    path('api/impact-forecast/', UnifiedImpactForecastView.as_view(), name='api_impact_forecast_slash'),
    path('api/impact-forecast', UnifiedImpactForecastView.as_view(), name='api_impact_forecast'),
    path('api/vulnerability/', UnifiedVulnerabilityView.as_view(), name='api_vulnerability_slash'),
    path('api/vulnerability', UnifiedVulnerabilityView.as_view(), name='api_vulnerability'),
    path('api/action-plan/', UnifiedActionPlanView.as_view(), name='api_action_plan_slash'),
    path('api/action-plan', UnifiedActionPlanView.as_view(), name='api_action_plan'),
    path('api/emergency-priority/', UnifiedEmergencyPriorityView.as_view(), name='api_emergency_priority_slash'),
    path('api/emergency-priority', UnifiedEmergencyPriorityView.as_view(), name='api_emergency_priority'),
    path('api/simulate/', UnifiedSimulationView.as_view(), name='api_simulate_slash'),
    path('api/simulate', UnifiedSimulationView.as_view(), name='api_simulate'),

    # ---------------------------------------------------------
    # Django REST Framework App Routes (Dashboard 2 Backend Services)
    # ---------------------------------------------------------
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/gis/', include('gis.urls')),
    path('api/location/', include('gis.urls')),
    path('api/weather/', include('weather.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/simulation/', include('simulation.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/interventions/', include('interventions.urls')),
    path('api/', include('interventions.urls')),
    path('api/dashboard/', include('dashboard.urls')),

    # ---------------------------------------------------------
    # API Schema & Documentation (drf-spectacular / OpenAPI)
    # ---------------------------------------------------------
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
