from rest_framework import serializers
from .models import Question, QuestionOption, Quiz, QuizAttempt, Attempt


class QuestionOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'order']
        # Note: is_correct is intentionally excluded to prevent cheating


class QuestionOptionWithAnswerSerializer(serializers.ModelSerializer):
    """Includes correct answer - used in results only."""
    class Meta:
        model = QuestionOption
        fields = ['id', 'text', 'is_correct', 'order']


class QuestionSerializer(serializers.ModelSerializer):
    """Question without revealing correct answer."""
    options = QuestionOptionSerializer(many=True, read_only=True)
    concept_name = serializers.CharField(source='concept.name', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'concept', 'concept_name', 'question_type', 'statement',
            'difficulty', 'options'
        ]


class QuestionWithAnswerSerializer(serializers.ModelSerializer):
    """Full question with correct answer - for results."""
    options = QuestionOptionWithAnswerSerializer(many=True, read_only=True)
    concept_name = serializers.CharField(source='concept.name', read_only=True)

    class Meta:
        model = Question
        fields = [
            'id', 'concept', 'concept_name', 'question_type', 'statement',
            'explanation', 'difficulty', 'hint', 'correct_answer', 'options'
        ]


class AttemptSerializer(serializers.ModelSerializer):
    question_data = QuestionWithAnswerSerializer(source='question', read_only=True)

    class Meta:
        model = Attempt
        fields = [
            'id', 'question', 'question_data', 'answer', 'result',
            'hint_used', 'time_seconds', 'feedback', 'created_at'
        ]


class SubmitAnswerSerializer(serializers.Serializer):
    """Serializer for submitting an answer."""
    quiz_attempt_id = serializers.IntegerField()
    question_id = serializers.IntegerField()
    answer = serializers.CharField()
    time_seconds = serializers.IntegerField(default=0)
    hint_used = serializers.BooleanField(default=False)


class QuizAttemptSerializer(serializers.ModelSerializer):
    concept_name = serializers.CharField(source='concept.name', read_only=True)
    question_attempts = AttemptSerializer(many=True, read_only=True)

    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'concept', 'concept_name', 'score', 'total_questions',
            'correct_answers', 'started_at', 'finished_at', 'is_completed',
            'question_attempts'
        ]


class StartQuizSerializer(serializers.Serializer):
    """Serializer for starting a quiz."""
    concept_slug = serializers.CharField()
    num_questions = serializers.IntegerField(default=5, min_value=1, max_value=20)
