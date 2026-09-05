from django.db import models

class Intervention(models.Model):
    class PriorityLevel(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        CRITICAL = 'CRITICAL', 'Critical'

    class Category(models.TextChoices):
        COOLING = 'COOLING', 'Cooling Shelters & Mist Stations'
        HEALTH = 'HEALTH', 'Hospital & Ambulance Surge'
        LABOUR = 'LABOUR', 'Outdoor Work Restrictions'
        WATER = 'WATER', 'Drinking Water Deployment'
        POWER = 'POWER', 'Grid Readiness & Cool Roofs'
        ADVISORY = 'ADVISORY', 'Public Warnings & Media'

    title = models.CharField(max_length=200)
    description = models.TextField()
    min_htsi = models.FloatField(default=40.0, help_text='Trigger threshold minimum HTSI')
    max_htsi = models.FloatField(default=100.0)
    priority_level = models.CharField(max_length=20, choices=PriorityLevel.choices, default=PriorityLevel.HIGH)
    target_category = models.CharField(max_length=30, choices=Category.choices, default=Category.COOLING)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-min_htsi', 'priority_level']

    def __str__(self):
        return f"[{self.priority_level}] {self.title} (HTSI >= {self.min_htsi})"


class EmergencyPriority(models.Model):
    ward = models.ForeignKey('gis.Ward', related_name='emergency_priorities', on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)
    htsi = models.FloatField()
    population = models.PositiveIntegerField()
    population_density = models.PositiveIntegerField()
    vulnerability_score = models.FloatField()
    priority_score = models.FloatField(help_text='Computed Emergency Urgency Score')
    priority_rank = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=50, default='ACTIVE')
    recommended_actions = models.JSONField(default=list)

    class Meta:
        ordering = ['priority_rank', '-priority_score']

    def __str__(self):
        return f"Rank #{self.priority_rank}: {self.ward.name} - Urgency Score {self.priority_score:.1f}"
