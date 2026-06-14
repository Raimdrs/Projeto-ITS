from django.db import models
from domain.models import Concept
from student.models import StudentProfile


class Question(models.Model):
    """Question bank for assessments."""
    QUESTION_TYPES = [
        ('multiple_choice', 'Múltipla Escolha'),
        ('true_false', 'Verdadeiro/Falso'),
        ('fill_blank', 'Preenchimento'),
        ('math_problem', 'Problema Matemático'),
        ('case_study', 'Estudo de Caso'),
    ]

    DIFFICULTY_LEVELS = [
        (1, 'Fácil'),
        (2, 'Médio'),
        (3, 'Difícil'),
    ]

    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='questions')
    question_type = models.CharField(max_length=20, choices=QUESTION_TYPES, verbose_name='Tipo')
    statement = models.TextField(verbose_name='Enunciado')
    explanation = models.TextField(verbose_name='Explicação', blank=True, default='')
    difficulty = models.IntegerField(choices=DIFFICULTY_LEVELS, default=1, verbose_name='Dificuldade')
    hint = models.TextField(blank=True, default='', verbose_name='Dica')
    correct_answer = models.CharField(max_length=500, blank=True, default='', verbose_name='Resposta Correta')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Questão'
        verbose_name_plural = 'Questões'
        ordering = ['concept', 'difficulty']

    def __str__(self):
        return f"[{self.concept.name}] {self.statement[:60]}..."


class QuestionOption(models.Model):
    """Options for multiple choice questions."""
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='options')
    text = models.CharField(max_length=500, verbose_name='Texto')
    is_correct = models.BooleanField(default=False, verbose_name='Correta')
    order = models.IntegerField(default=0)

    class Meta:
        verbose_name = 'Opção'
        verbose_name_plural = 'Opções'
        ordering = ['order']

    def __str__(self):
        return f"{self.text[:40]} ({'✓' if self.is_correct else '✗'})"


class Quiz(models.Model):
    """A quiz composed of questions for a concept."""
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='quizzes')
    title = models.CharField(max_length=300, verbose_name='Título')
    description = models.TextField(blank=True, default='', verbose_name='Descrição')
    num_questions = models.IntegerField(default=5, verbose_name='Número de Questões')
    time_limit_minutes = models.IntegerField(default=15, verbose_name='Tempo Limite (min)')
    is_adaptive = models.BooleanField(default=True, verbose_name='Adaptativo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Quiz'
        verbose_name_plural = 'Quizzes'

    def __str__(self):
        return f"Quiz: {self.title}"


class QuizAttempt(models.Model):
    """A student's attempt at a quiz."""
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts', null=True, blank=True)
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='quiz_attempts')
    score = models.FloatField(default=0.0, verbose_name='Pontuação (%)')
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    started_at = models.DateTimeField(auto_now_add=True)
    finished_at = models.DateTimeField(null=True, blank=True)
    is_completed = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Tentativa de Quiz'
        verbose_name_plural = 'Tentativas de Quiz'
        ordering = ['-started_at']


class Attempt(models.Model):
    """Individual question attempt within a quiz."""
    RESULT_CHOICES = [
        ('correct', 'Correta'),
        ('partial', 'Parcialmente Correta'),
        ('incorrect', 'Incorreta'),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='attempts')
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='attempts')
    quiz_attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='question_attempts', null=True)
    answer = models.TextField(verbose_name='Resposta do Aluno')
    result = models.CharField(max_length=10, choices=RESULT_CHOICES, verbose_name='Resultado')
    hint_used = models.BooleanField(default=False, verbose_name='Usou Dica')
    time_seconds = models.IntegerField(default=0, verbose_name='Tempo (s)')
    feedback = models.TextField(blank=True, default='', verbose_name='Feedback')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tentativa'
        verbose_name_plural = 'Tentativas'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.user.username} - {self.question} - {self.result}"
