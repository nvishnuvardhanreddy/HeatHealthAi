from django.urls import path
from .views import CurrentPredictionView, ModelExplainabilityView

urlpatterns = [
    path('current/', CurrentPredictionView.as_view(), name='prediction_current'),
    path('explain/', ModelExplainabilityView.as_view(), name='prediction_explain'),
]
