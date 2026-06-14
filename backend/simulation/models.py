from django.db import models
from student.models import StudentProfile


class SimulationResult(models.Model):
    """Stores results of financial simulations."""
    SIMULATION_TYPES = [
        ('budget', 'Orçamento Mensal'),
        ('emergency_fund', 'Reserva de Emergência'),
        ('compound_interest', 'Juros Compostos'),
        ('investment', 'Investimentos'),
        ('financial_plan', 'Planejamento Financeiro'),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='simulations')
    simulation_type = models.CharField(max_length=20, choices=SIMULATION_TYPES)
    parameters = models.JSONField(default=dict, verbose_name='Parâmetros')
    results = models.JSONField(default=dict, verbose_name='Resultados')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Resultado de Simulação'
        verbose_name_plural = 'Resultados de Simulações'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.user.username} - {self.get_simulation_type_display()}"
