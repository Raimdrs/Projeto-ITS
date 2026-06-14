from rest_framework import serializers
from .models import SimulationResult


class SimulationResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = SimulationResult
        fields = ['id', 'simulation_type', 'parameters', 'results', 'created_at']


class BudgetSerializer(serializers.Serializer):
    income = serializers.FloatField(min_value=0)
    expenses = serializers.DictField(child=serializers.FloatField())


class EmergencyFundSerializer(serializers.Serializer):
    monthly_expenses = serializers.FloatField(min_value=0)
    months = serializers.IntegerField(default=6, min_value=1, max_value=24)
    current_savings = serializers.FloatField(default=0, min_value=0)
    monthly_contribution = serializers.FloatField(default=0, min_value=0)


class CompoundInterestSerializer(serializers.Serializer):
    principal = serializers.FloatField(min_value=0)
    annual_rate = serializers.FloatField(min_value=0)
    months = serializers.IntegerField(min_value=1, max_value=600)
    monthly_contribution = serializers.FloatField(default=0, min_value=0)


class InvestmentComparisonSerializer(serializers.Serializer):
    principal = serializers.FloatField(min_value=0)
    monthly_contribution = serializers.FloatField(default=0, min_value=0)
    months = serializers.IntegerField(min_value=1, max_value=600)


class FinancialPlanSerializer(serializers.Serializer):
    income = serializers.FloatField(min_value=0)
    goals = serializers.ListField(child=serializers.DictField())
