from django.contrib import admin
from .models import MLPrediction

@admin.register(MLPrediction)
class MLPredictionAdmin(admin.ModelAdmin):
    list_display = ('ward', 'prediction_time', 'predicted_htsi', 'predicted_risk', 'confidence_score', 'created_at')
