from django.db import models

class MLPrediction(models.Model):
    ward = models.ForeignKey('gis.Ward', null=True, blank=True, on_delete=models.SET_NULL, related_name='ml_predictions')
    prediction_time = models.DateTimeField(db_index=True)
    predicted_htsi = models.FloatField()
    predicted_risk = models.CharField(max_length=30)
    confidence_score = models.FloatField(default=0.88)
    feature_importance_json = models.JSONField(default=dict)
    model_version = models.CharField(max_length=50, default='RandomForest-v1.0')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-prediction_time']

    def __str__(self):
        ward_name = self.ward.name if self.ward else 'Regional'
        return f"Pred {ward_name} @ {self.prediction_time.strftime('%Y-%m-%d %H:%M')}: {self.predicted_htsi} ({self.predicted_risk})"
