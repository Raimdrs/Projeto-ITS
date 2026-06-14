from django.contrib import admin
from .models import SimulationResult

@admin.register(SimulationResult)
class SimulationResultAdmin(admin.ModelAdmin):
    list_display = ['student', 'simulation_type', 'created_at']
    list_filter = ['simulation_type']
