from django.urls import path
from .views import HealthCheckView, CitizenDashboardView, AuthorityDashboardView, AdminSystemStatsView

urlpatterns = [
    path('health/', HealthCheckView.as_view(), name='health_check'),
    path('dashboard/citizen/', CitizenDashboardView.as_view(), name='dashboard_citizen'),
    path('dashboard/authority/', AuthorityDashboardView.as_view(), name='dashboard_authority'),
    path('dashboard/admin/', AdminSystemStatsView.as_view(), name='dashboard_admin'),
]
