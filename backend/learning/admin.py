from django.contrib import admin
from .models import Question, QuestionOption, Quiz, QuizAttempt, Attempt


class QuestionOptionInline(admin.TabularInline):
    model = QuestionOption
    extra = 4


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['concept', 'question_type', 'difficulty', 'statement_preview', 'is_active']
    list_filter = ['concept', 'question_type', 'difficulty', 'is_active']
    search_fields = ['statement']
    inlines = [QuestionOptionInline]

    def statement_preview(self, obj):
        return obj.statement[:80] + '...' if len(obj.statement) > 80 else obj.statement
    statement_preview.short_description = 'Enunciado'


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ['title', 'concept', 'num_questions', 'is_adaptive']
    list_filter = ['concept', 'is_adaptive']


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'concept', 'score', 'is_completed', 'started_at']
    list_filter = ['is_completed', 'concept']


@admin.register(Attempt)
class AttemptAdmin(admin.ModelAdmin):
    list_display = ['student', 'question', 'result', 'hint_used', 'created_at']
    list_filter = ['result', 'hint_used']
