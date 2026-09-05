import sys
from pathlib import Path
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Executes the HeatHealthAI Machine Learning training pipeline and serializes the RandomForest model artifact.'

    def handle(self, *args, **options):
        ml_dir = Path(settings.BASE_DIR).parent / 'ml'
        if str(ml_dir) not in sys.path:
            sys.path.insert(0, str(ml_dir))

        from train_model import train
        self.stdout.write(self.style.NOTICE("Initiating ML Model Training Pipeline..."))
        model, meta = train()
        metrics = meta.get('metrics', {})
        self.stdout.write(self.style.SUCCESS(f"Training Complete! Test MAE: {metrics.get('mae')}, Test R²: {metrics.get('r2')}"))
