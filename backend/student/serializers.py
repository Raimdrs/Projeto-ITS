from rest_framework import serializers
from .models import StudentProfile, ConceptMastery, Achievement, StudySession, LearningGoal


class ConceptMasterySerializer(serializers.ModelSerializer):
    concept_name = serializers.CharField(source='concept.name', read_only=True)
    concept_slug = serializers.CharField(source='concept.slug', read_only=True)
    concept_icon = serializers.CharField(source='concept.icon', read_only=True)
    concept_color = serializers.CharField(source='concept.color', read_only=True)

    class Meta:
        model = ConceptMastery
        fields = [
            'id', 'concept', 'concept_name', 'concept_slug', 'concept_icon', 'concept_color',
            'mastery_level', 'is_mastered', 'attempts_count', 'correct_count', 'last_activity'
        ]


class AchievementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['id', 'achievement_type', 'name', 'description', 'icon', 'earned_at']


class StudySessionSerializer(serializers.ModelSerializer):
    concept_name = serializers.CharField(source='concept.name', read_only=True)

    class Meta:
        model = StudySession
        fields = ['id', 'concept', 'concept_name', 'duration_minutes', 'activity_type', 'date']


class LearningGoalSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningGoal
        fields = ['id', 'description', 'target_date', 'completed', 'created_at']


class StudentProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    accuracy_rate = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'username', 'email', 'level', 'overall_progress',
            'total_study_minutes', 'total_questions_answered',
            'total_correct_answers', 'streak_days', 'accuracy_rate',
            'last_activity', 'created_at'
        ]

    def get_accuracy_rate(self, obj):
        return obj.get_accuracy_rate()


class StudentStatsSerializer(serializers.Serializer):
    """Comprehensive student statistics."""
    profile = StudentProfileSerializer()
    concepts_mastered = serializers.IntegerField()
    concepts_in_progress = serializers.IntegerField()
    concepts_total = serializers.IntegerField()
    concepts_in_difficulty = serializers.ListField()
    recent_sessions = StudySessionSerializer(many=True)
    achievements = AchievementSerializer(many=True)
    mastery_data = ConceptMasterySerializer(many=True)
