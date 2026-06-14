from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from student.views import get_or_create_student
from student.models import ConceptMastery
from .models import SimulationResult
from .serializers import (
    BudgetSerializer, EmergencyFundSerializer, CompoundInterestSerializer,
    InvestmentComparisonSerializer, FinancialPlanSerializer
)
from .calculators import (
    calculate_budget, calculate_emergency_fund, calculate_compound_interest,
    calculate_investment_comparison, calculate_financial_plan
)


class BudgetSimulationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = BudgetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = calculate_budget(
            serializer.validated_data['income'],
            serializer.validated_data['expenses']
        )

        # Save simulation
        profile = get_or_create_student(request.user)
        SimulationResult.objects.create(
            student=profile,
            simulation_type='budget',
            parameters=serializer.validated_data,
            results=results
        )

        # Award practical bonus for related concept
        self._award_practical_bonus(profile, 'orcamento-pessoal')

        return Response(results)

    def _award_practical_bonus(self, profile, concept_slug):
        try:
            from domain.models import Concept
            concept = Concept.objects.get(slug=concept_slug)
            mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=concept)
            mastery.add_practical_bonus()
        except Exception:
            pass


class EmergencyFundSimulationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = EmergencyFundSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = calculate_emergency_fund(**serializer.validated_data)

        profile = get_or_create_student(request.user)
        SimulationResult.objects.create(
            student=profile,
            simulation_type='emergency_fund',
            parameters=serializer.validated_data,
            results=results
        )

        # Award practical bonus
        try:
            from domain.models import Concept
            concept = Concept.objects.get(slug='reserva-de-emergencia')
            mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=concept)
            mastery.add_practical_bonus()
        except Exception:
            pass

        return Response(results)


class CompoundInterestSimulationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CompoundInterestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = calculate_compound_interest(
            serializer.validated_data['principal'],
            serializer.validated_data['annual_rate'],
            serializer.validated_data['months'],
            serializer.validated_data.get('monthly_contribution', 0)
        )

        profile = get_or_create_student(request.user)
        SimulationResult.objects.create(
            student=profile,
            simulation_type='compound_interest',
            parameters=serializer.validated_data,
            results=results
        )

        try:
            from domain.models import Concept
            concept = Concept.objects.get(slug='juros-compostos')
            mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=concept)
            mastery.add_practical_bonus()
        except Exception:
            pass

        return Response(results)


class InvestmentSimulationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = InvestmentComparisonSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = calculate_investment_comparison(**serializer.validated_data)

        profile = get_or_create_student(request.user)
        SimulationResult.objects.create(
            student=profile,
            simulation_type='investment',
            parameters=serializer.validated_data,
            results=results
        )

        try:
            from domain.models import Concept
            concept = Concept.objects.get(slug='investimentos')
            mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=concept)
            mastery.add_practical_bonus()
        except Exception:
            pass

        return Response(results)


class FinancialPlanSimulationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = FinancialPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        results = calculate_financial_plan(
            serializer.validated_data['income'],
            serializer.validated_data['goals']
        )

        profile = get_or_create_student(request.user)
        SimulationResult.objects.create(
            student=profile,
            simulation_type='financial_plan',
            parameters=serializer.validated_data,
            results=results
        )

        try:
            from domain.models import Concept
            concept = Concept.objects.get(slug='planejamento-financeiro')
            mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=concept)
            mastery.add_practical_bonus()
        except Exception:
            pass

        return Response(results)
