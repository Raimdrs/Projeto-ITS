"""
Feedback Generation Module — Personalized feedback based on pedagogical theories.

Implements:
- Behaviorist: Immediate feedback with motivational messages
- Cognitivist: Graduated hints respecting prerequisites
- Constructivist: Contextual problem connections
- Sociointeractionist: Scaffolded support within ZDP
"""
import random


# Motivational messages by result type (Behaviorist approach)
CORRECT_MESSAGES = [
    "🎉 Excelente! Você acertou!",
    "✅ Muito bem! Resposta correta!",
    "🌟 Perfeito! Continue assim!",
    "💪 Isso aí! Você está mandando bem!",
    "🏆 Correto! Seu domínio está crescendo!",
    "🔥 Incrível! Resposta certeira!",
    "⭐ Fantástico! Você está no caminho certo!",
]

PARTIAL_MESSAGES = [
    "🟡 Quase lá! Sua resposta está parcialmente correta.",
    "📝 Bom raciocínio! Mas a resposta pode ser melhorada.",
    "🔄 Você está no caminho certo, mas faltou um detalhe.",
    "💡 Boa tentativa! Revise o conceito para completar seu entendimento.",
]

INCORRECT_MESSAGES = [
    "❌ Não foi dessa vez, mas não desanime!",
    "📚 Resposta incorreta. Vamos revisar o conceito juntos.",
    "🔄 Errar faz parte do aprendizado. Tente novamente!",
    "💪 Não desista! Revise o material e tente de novo.",
    "🎯 Ainda não é a resposta certa. Que tal reler a aula?",
]

HINT_MESSAGES = [
    "💡 Dica utilizada. Lembre-se: usar dicas pode ajudar no aprendizado, mas tente resolver sozinho primeiro!",
]


def generate_feedback(question, result, hint_used=False):
    """
    Generate personalized feedback for a question attempt.

    Args:
        question: The Question instance
        result: 'correct', 'partial', or 'incorrect'
        hint_used: Whether a hint was used

    Returns:
        Feedback string
    """
    parts = []

    # Motivational message (Behaviorist)
    if result == 'correct':
        parts.append(random.choice(CORRECT_MESSAGES))
    elif result == 'partial':
        parts.append(random.choice(PARTIAL_MESSAGES))
    else:
        parts.append(random.choice(INCORRECT_MESSAGES))

    # Hint usage note
    if hint_used:
        parts.append(random.choice(HINT_MESSAGES))

    # Explanation (Cognitivist - understanding why)
    if result != 'correct' and question.explanation:
        parts.append(f"\n📖 Explicação: {question.explanation}")

    # Constructivist - connect to real-world context
    if result == 'correct':
        contextual_tips = {
            'receita-e-despesa': 'Entender receitas e despesas é o primeiro passo para controlar suas finanças!',
            'orcamento-pessoal': 'Um bom orçamento é a base de uma vida financeira saudável.',
            'planejamento-financeiro': 'Planejar é essencial para alcançar seus objetivos financeiros.',
            'reserva-de-emergencia': 'Ter uma reserva de emergência traz segurança e tranquilidade.',
            'porcentagem': 'Porcentagens estão em todo lugar: descontos, juros, impostos!',
            'juros-simples': 'Juros simples são a base para entender como o dinheiro cresce.',
            'juros-compostos': 'Juros compostos são o "oitavo maravilha do mundo" segundo Einstein!',
            'inflacao': 'Entender inflação é crucial para proteger seu poder de compra.',
            'risco-e-retorno': 'Todo investimento envolve uma relação entre risco e retorno.',
            'investimentos': 'Investir é fazer seu dinheiro trabalhar para você!',
            'diversificacao-de-carteira': 'Diversificar é não colocar todos os ovos na mesma cesta.',
        }
        slug = question.concept.slug
        if slug in contextual_tips:
            parts.append(f"\n💡 {contextual_tips[slug]}")

    # Sociointeractionist - scaffolded support for incorrect answers
    if result == 'incorrect':
        parts.append("\n🔍 Sugestão: Releia o conteúdo da aula antes de tentar novamente.")
        parts.append("Procure identificar os conceitos-chave e como eles se relacionam.")

    return '\n'.join(parts)


def generate_quiz_summary_feedback(quiz_attempt):
    """Generate summary feedback for a completed quiz."""
    score = quiz_attempt.score

    if score == 100:
        return "🏆 PERFEITO! Você acertou todas as questões! Seu domínio neste conceito é impressionante."
    elif score >= 80:
        return f"🌟 Excelente! Você acertou {score}% das questões. Você está próximo de dominar este conceito!"
    elif score >= 60:
        return f"📈 Bom trabalho! {score}% de acerto. Continue praticando para fortalecer seu conhecimento."
    elif score >= 40:
        return f"📚 Você acertou {score}% das questões. Recomendo revisitar a aula teórica e os exemplos práticos."
    else:
        return f"🔄 Você acertou {score}% das questões. Não desanime! Revise o conteúdo e tente novamente. A prática leva à perfeição!"
