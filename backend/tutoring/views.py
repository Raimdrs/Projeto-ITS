from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from student.views import get_or_create_student
from .adaptive import get_recommendation
from .feedback import generate_quiz_summary_feedback
from learning.models import QuizAttempt, Attempt


class RecommendationView(APIView):
    """Get personalized learning recommendations."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student(request.user)
        recommendation = get_recommendation(profile)
        return Response(recommendation)


class AttemptFeedbackView(APIView):
    """Get detailed feedback for a specific attempt."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, attempt_id):
        profile = get_or_create_student(request.user)
        try:
            attempt = Attempt.objects.get(id=attempt_id, student=profile)
            return Response({
                'feedback': attempt.feedback,
                'result': attempt.result,
                'question': attempt.question.statement,
                'answer': attempt.answer,
            })
        except Attempt.DoesNotExist:
            return Response({'error': 'Tentativa não encontrada.'}, status=404)
