from django.db import models
from django.contrib.auth.models import User
from domain.models import Concept


class StudentProfile(models.Model):
    """Student profile with overall progress tracking."""
    LEVEL_CHOICES = [
        ('iniciante', 'Iniciante'),
        ('intermediario', 'Intermediário'),
        ('avancado', 'Avançado'),
        ('expert', 'Expert'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='iniciante', verbose_name='Nível')
    overall_progress = models.FloatField(default=0.0, verbose_name='Progresso Geral (%)')
    total_study_minutes = models.IntegerField(default=0, verbose_name='Tempo Total de Estudo (min)')
    total_questions_answered = models.IntegerField(default=0, verbose_name='Total de Questões Respondidas')
    total_correct_answers = models.IntegerField(default=0, verbose_name='Total de Respostas Corretas')
    streak_days = models.IntegerField(default=0, verbose_name='Dias Consecutivos')
    last_activity = models.DateTimeField(auto_now=True, verbose_name='Última Atividade')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Perfil do Aluno'
        verbose_name_plural = 'Perfis dos Alunos'

    def __str__(self):
        return f"Aluno: {self.user.username} ({self.level})"

    def update_overall_progress(self):
        """Recalculate overall progress based on concept mastery."""
        total_concepts = Concept.objects.filter(is_active=True).count()
        if total_concepts == 0:
            return
        mastered = self.concept_masteries.filter(is_mastered=True).count()
        total_mastery = sum(
            cm.mastery_level for cm in self.concept_masteries.all()
        )
        self.overall_progress = round(total_mastery / total_concepts, 1)

        # Update level based on progress
        if self.overall_progress >= 80:
            self.level = 'expert'
        elif self.overall_progress >= 50:
            self.level = 'avancado'
        elif self.overall_progress >= 20:
            self.level = 'intermediario'
        else:
            self.level = 'iniciante'
        self.save()

    def get_accuracy_rate(self):
        """Return the accuracy rate as a percentage."""
        if self.total_questions_answered == 0:
            return 0
        return round((self.total_correct_answers / self.total_questions_answered) * 100, 1)


class ConceptMastery(models.Model):
    """Tracks student mastery level for each concept."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='concept_masteries')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='masteries')
    mastery_level = models.FloatField(default=0.0, verbose_name='Nível de Domínio (%)')
    is_mastered = models.BooleanField(default=False, verbose_name='Dominado')
    attempts_count = models.IntegerField(default=0, verbose_name='Tentativas')
    correct_count = models.IntegerField(default=0, verbose_name='Acertos')
    last_activity = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Domínio de Conceito'
        verbose_name_plural = 'Domínios de Conceitos'
        unique_together = ['student', 'concept']

    def __str__(self):
        return f"{self.student.user.username} - {self.concept.name}: {self.mastery_level}%"

    def update_mastery(self, result, hint_used=False):
        """
        Update mastery level based on answer result.
        Rules:
        - correct: +20%
        - partial: +10%
        - incorrect: -10%
        - hint_used: -5% (additional penalty)
        """
        if result == 'correct':
            self.mastery_level = min(100, self.mastery_level + 20)
            self.correct_count += 1
        elif result == 'partial':
            self.mastery_level = min(100, self.mastery_level + 10)
        elif result == 'incorrect':
            self.mastery_level = max(0, self.mastery_level - 10)

        if hint_used:
            self.mastery_level = max(0, self.mastery_level - 5)

        self.attempts_count += 1
        self.is_mastered = self.mastery_level >= 80
        self.save()

        # Update overall progress
        self.student.update_overall_progress()

    def add_practical_bonus(self):
        """Add +15% for completing a practical activity."""
        self.mastery_level = min(100, self.mastery_level + 15)
        self.is_mastered = self.mastery_level >= 80
        self.save()
        self.student.update_overall_progress()


class Achievement(models.Model):
    """Gamification achievements / badges."""
    ACHIEVEMENT_TYPES = [
        ('first_lesson', 'Primeira Aula'),
        ('concept_mastered', 'Conceito Dominado'),
        ('perfect_quiz', 'Quiz Perfeito'),
        ('streak_3', '3 Dias Consecutivos'),
        ('streak_7', '7 Dias Consecutivos'),
        ('streak_30', '30 Dias Consecutivos'),
        ('all_basics', 'Conceitos Básicos'),
        ('half_done', 'Metade do Caminho'),
        ('all_done', 'Conclusão Total'),
        ('simulation_pro', 'Mestre das Simulações'),
        ('speed_learner', 'Aprendiz Rápido'),
        ('persistent', 'Persistente'),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='achievements')
    achievement_type = models.CharField(max_length=30, choices=ACHIEVEMENT_TYPES, verbose_name='Tipo')
    name = models.CharField(max_length=100, verbose_name='Nome')
    description = models.TextField(verbose_name='Descrição')
    icon = models.CharField(max_length=10, default='🏆', verbose_name='Ícone')
    earned_at = models.DateTimeField(auto_now_add=True, verbose_name='Conquistado em')

    class Meta:
        verbose_name = 'Conquista'
        verbose_name_plural = 'Conquistas'
        unique_together = ['student', 'achievement_type']

    def __str__(self):
        return f"{self.student.user.username} - {self.name}"


class StudySession(models.Model):
    """Tracks individual study sessions."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='study_sessions')
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='study_sessions', null=True)
    duration_minutes = models.IntegerField(default=0, verbose_name='Duração (min)')
    activity_type = models.CharField(max_length=20, default='lesson', verbose_name='Tipo de Atividade')
    date = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Sessão de Estudo'
        verbose_name_plural = 'Sessões de Estudo'
        ordering = ['-date']


class LearningGoal(models.Model):
    """Student-defined learning goals."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='learning_goals')
    description = models.CharField(max_length=300, verbose_name='Descrição')
    target_date = models.DateField(verbose_name='Data Alvo', null=True, blank=True)
    completed = models.BooleanField(default=False, verbose_name='Concluída')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Meta de Aprendizagem'
        verbose_name_plural = 'Metas de Aprendizagem'
        ordering = ['-created_at']
