"""
Tutoring Engine — Core adaptive logic for the ITS.

Handles:
- Achievement checking
- Level progression
- Study streak tracking
"""
from django.utils import timezone
from student.models import Achievement, ConceptMastery


def check_achievements(student_profile, quiz_attempt=None):
    """Check and award achievements based on student progress."""
    achievements_earned = []

    def award(achievement_type, name, description, icon='🏆'):
        if not Achievement.objects.filter(student=student_profile, achievement_type=achievement_type).exists():
            Achievement.objects.create(
                student=student_profile,
                achievement_type=achievement_type,
                name=name,
                description=description,
                icon=icon
            )
            achievements_earned.append(name)

    # First lesson / first quiz
    if student_profile.total_questions_answered >= 1:
        award('first_lesson', 'Primeiro Passo', 'Respondeu sua primeira questão!', '🎯')

    # Perfect quiz
    if quiz_attempt and quiz_attempt.is_completed and quiz_attempt.score == 100:
        award('perfect_quiz', 'Perfeição', 'Completou um quiz com 100% de acerto!', '💯')

    # Concept mastered
    mastered_count = ConceptMastery.objects.filter(student=student_profile, is_mastered=True).count()
    if mastered_count >= 1:
        award('concept_mastered', 'Mestre do Conceito', 'Dominou seu primeiro conceito!', '🌟')

    # Half done
    from domain.models import Concept
    total = Concept.objects.filter(is_active=True).count()
    if total > 0 and mastered_count >= total // 2:
        award('half_done', 'Metade do Caminho', 'Dominou metade dos conceitos!', '🚀')

    # All done
    if total > 0 and mastered_count >= total:
        award('all_done', 'Mestre Financeiro', 'Dominou todos os conceitos!', '👑')

    # Streak achievements
    if student_profile.streak_days >= 3:
        award('streak_3', 'Consistente', '3 dias consecutivos de estudo!', '🔥')
    if student_profile.streak_days >= 7:
        award('streak_7', 'Dedicado', '7 dias consecutivos de estudo!', '⚡')
    if student_profile.streak_days >= 30:
        award('streak_30', 'Imparável', '30 dias consecutivos de estudo!', '💎')

    # Persistent - answered 50+ questions
    if student_profile.total_questions_answered >= 50:
        award('persistent', 'Persistente', 'Respondeu mais de 50 questões!', '💪')

    # Speed learner - mastered a concept in < 5 attempts
    fast_mastery = ConceptMastery.objects.filter(
        student=student_profile, is_mastered=True, attempts_count__lte=5
    ).exists()
    if fast_mastery:
        award('speed_learner', 'Aprendiz Rápido', 'Dominou um conceito em 5 tentativas ou menos!', '⚡')

    return achievements_earned
