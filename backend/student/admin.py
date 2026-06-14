from django.contrib import admin
from .models import StudentProfile, ConceptMastery, Achievement, StudySession, LearningGoal


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'level', 'overall_progress', 'total_study_minutes', 'streak_days']
    list_filter = ['level']
    search_fields = ['user__username']


@admin.register(ConceptMastery)
class ConceptMasteryAdmin(admin.ModelAdmin):
    list_display = ['student', 'concept', 'mastery_level', 'is_mastered', 'attempts_count']
    list_filter = ['is_mastered', 'concept']


@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['student', 'name', 'achievement_type', 'earned_at']
    list_filter = ['achievement_type']


@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ['student', 'concept', 'duration_minutes', 'activity_type', 'date']


@admin.register(LearningGoal)
class LearningGoalAdmin(admin.ModelAdmin):
    list_display = ['student', 'description', 'target_date', 'completed']
    list_filter = ['completed']
