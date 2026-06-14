"""
Financial Calculators for simulations.
"""


def calculate_budget(income, expenses):
    """
    Calculate monthly budget analysis.
    
    Args:
        income: Total monthly income
        expenses: Dict of expense categories and amounts
    """
    total_expenses = sum(expenses.values())
    balance = income - total_expenses
    savings_rate = (balance / income * 100) if income > 0 else 0

    # Categorize expenses using 50/30/20 rule
    needs_limit = income * 0.50
    wants_limit = income * 0.30
    savings_limit = income * 0.20

    return {
        'income': income,
        'total_expenses': round(total_expenses, 2),
        'balance': round(balance, 2),
        'savings_rate': round(savings_rate, 1),
        'expense_breakdown': expenses,
        'recommendation': {
            'needs_limit': round(needs_limit, 2),
            'wants_limit': round(wants_limit, 2),
            'savings_limit': round(savings_limit, 2),
        },
        'status': 'positivo' if balance > 0 else 'negativo',
        'message': _budget_message(savings_rate),
    }


def calculate_emergency_fund(monthly_expenses, months=6, current_savings=0, monthly_contribution=0):
    """Calculate emergency fund projection."""
    target = monthly_expenses * months
    remaining = max(0, target - current_savings)

    if monthly_contribution > 0:
        months_to_goal = remaining / monthly_contribution
    else:
        months_to_goal = float('inf')

    # Monthly projection
    projection = []
    accumulated = current_savings
    for m in range(1, min(int(months_to_goal) + 2, 61)):
        accumulated += monthly_contribution
        projection.append({
            'month': m,
            'accumulated': round(accumulated, 2),
            'target': round(target, 2),
            'percentage': round(min(100, (accumulated / target * 100)), 1) if target > 0 else 100,
        })
        if accumulated >= target:
            break

    return {
        'target': round(target, 2),
        'current_savings': round(current_savings, 2),
        'remaining': round(remaining, 2),
        'monthly_contribution': round(monthly_contribution, 2),
        'months_to_goal': round(months_to_goal, 1) if months_to_goal != float('inf') else None,
        'projection': projection,
        'coverage_months': months,
    }


def calculate_compound_interest(principal, rate, periods, monthly_contribution=0):
    """
    Calculate compound interest growth.
    
    Args:
        principal: Initial investment
        rate: Annual interest rate (as percentage, e.g., 12 for 12%)
        periods: Number of months
        monthly_contribution: Additional monthly investment
    """
    monthly_rate = rate / 100 / 12
    projection = []
    total = principal
    total_invested = principal

    for month in range(1, periods + 1):
        interest = total * monthly_rate
        total = total + interest + monthly_contribution
        total_invested += monthly_contribution

        if month % max(1, periods // 24) == 0 or month == periods or month == 1:
            projection.append({
                'month': month,
                'total': round(total, 2),
                'invested': round(total_invested, 2),
                'interest_earned': round(total - total_invested, 2),
            })

    total_interest = total - total_invested

    return {
        'final_amount': round(total, 2),
        'total_invested': round(total_invested, 2),
        'total_interest': round(total_interest, 2),
        'interest_percentage': round((total_interest / total_invested * 100), 1) if total_invested > 0 else 0,
        'monthly_rate': round(monthly_rate * 100, 4),
        'projection': projection,
    }


def calculate_investment_comparison(principal, monthly_contribution, months):
    """Compare different investment options."""
    investments = [
        {'name': 'Poupança', 'annual_rate': 6.17, 'risk': 'Baixo'},
        {'name': 'CDB 100% CDI', 'annual_rate': 13.25, 'risk': 'Baixo'},
        {'name': 'Tesouro IPCA+', 'annual_rate': 11.5, 'risk': 'Médio'},
        {'name': 'Fundo Multimercado', 'annual_rate': 15.0, 'risk': 'Médio'},
        {'name': 'Ações (Ibovespa)', 'annual_rate': 18.0, 'risk': 'Alto'},
    ]

    results = []
    for inv in investments:
        calc = calculate_compound_interest(principal, inv['annual_rate'], months, monthly_contribution)
        results.append({
            'name': inv['name'],
            'risk': inv['risk'],
            'annual_rate': inv['annual_rate'],
            'final_amount': calc['final_amount'],
            'total_interest': calc['total_interest'],
            'interest_percentage': calc['interest_percentage'],
        })

    return {
        'principal': principal,
        'monthly_contribution': monthly_contribution,
        'months': months,
        'comparisons': sorted(results, key=lambda x: x['final_amount'], reverse=True),
    }


def calculate_financial_plan(income, goals):
    """
    Create a financial plan based on income and goals.
    
    Args:
        income: Monthly income
        goals: List of {name, target_amount, priority}
    """
    # Allocate savings (20% of income)
    monthly_savings = income * 0.20

    plan = []
    for goal in goals:
        target = goal.get('target_amount', 0)
        priority = goal.get('priority', 'média')

        # Allocate based on priority
        allocation_pct = {'alta': 0.50, 'média': 0.30, 'baixa': 0.20}.get(priority, 0.30)
        monthly_allocation = monthly_savings * allocation_pct
        months_needed = target / monthly_allocation if monthly_allocation > 0 else float('inf')

        plan.append({
            'name': goal.get('name', 'Meta'),
            'target_amount': round(target, 2),
            'priority': priority,
            'monthly_allocation': round(monthly_allocation, 2),
            'months_needed': round(months_needed, 1) if months_needed != float('inf') else None,
        })

    return {
        'monthly_income': income,
        'monthly_savings': round(monthly_savings, 2),
        'savings_rate': 20.0,
        'goals': plan,
    }


def _budget_message(savings_rate):
    """Generate budget advice based on savings rate."""
    if savings_rate >= 30:
        return "🌟 Excelente! Você está economizando mais de 30% da sua renda. Continue assim!"
    elif savings_rate >= 20:
        return "✅ Muito bom! Você está na meta dos 20% de economia recomendados."
    elif savings_rate >= 10:
        return "📈 Bom começo! Tente aumentar sua taxa de economia para 20%."
    elif savings_rate > 0:
        return "⚠️ Sua economia está abaixo do ideal. Tente reduzir despesas não essenciais."
    else:
        return "🚨 Atenção! Você está gastando mais do que ganha. É urgente revisar seu orçamento."
