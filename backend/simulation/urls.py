from django.urls import path
from . import views

urlpatterns = [
    path('budget/', views.BudgetSimulationView.as_view(), name='sim-budget'),
    path('emergency-fund/', views.EmergencyFundSimulationView.as_view(), name='sim-emergency'),
    path('compound-interest/', views.CompoundInterestSimulationView.as_view(), name='sim-compound'),
    path('investment/', views.InvestmentSimulationView.as_view(), name='sim-investment'),
    path('financial-plan/', views.FinancialPlanSimulationView.as_view(), name='sim-financial-plan'),
]
