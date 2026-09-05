from django.urls import path
from .views import InterventionListView, EmergencyPrioritiesView, HeatActionPlanView

urlpatterns = [
    path('interventions/', InterventionListView.as_view(), name='interventions_list'),
    path('emergency/priorities/', EmergencyPrioritiesView.as_view(), name='emergency_priorities'),
    path('action-plan/', HeatActionPlanView.as_view(), name='heat_action_plan'),
]
