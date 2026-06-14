from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from student.views import get_or_create_student
from .adaptive import get_recommendation
from .feedback import generate_quiz_summary_feedback
from .ai_service import get_tutor_response
from learning.models import QuizAttempt, Attempt
from domain.models import Lesson


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

class AITutorChatView(APIView):
    """Chat with AI Tutor about a specific lesson."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        concept_slug = request.data.get('concept_slug')
        message = request.data.get('message')
        chat_history = request.data.get('history', [])

        if not concept_slug or not message:
            return Response({'error': 'Parâmetros inválidos.'}, status=400)

        try:
            lesson = Lesson.objects.filter(concept__slug=concept_slug).first()
            if not lesson:
                return Response({'error': 'Aula não encontrada.'}, status=404)

            # Call AI
            response_text = get_tutor_response(
                lesson_title=lesson.title,
                lesson_content=lesson.content,
                user_message=message,
                chat_history=chat_history
            )

            return Response({'reply': response_text})
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
