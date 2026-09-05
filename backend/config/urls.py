from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView
from dashboard.views import HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Health check endpoint
    path('api/health/', HealthCheckView.as_view(), name='health_check'),

    # API App Routes
    path('api/auth/', include('users.urls')),
    path('api/gis/', include('gis.urls')),
    path('api/', include('gis.urls')), # Provides /api/location/update/ & /api/location/check-risk/
    path('api/weather/', include('weather.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/simulation/', include('simulation.urls')),
    path('api/alerts/', include('alerts.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/', include('interventions.urls')), # Provides /api/interventions/, /api/emergency/priorities/, /api/action-plan/
    path('api/', include('dashboard.urls')),

    # API Documentation (drf-spectacular / OpenAPI)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
