from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from domain.models import Concept
from .models import StudentProfile, ConceptMastery, Achievement, StudySession, LearningGoal
from .serializers import (
    StudentProfileSerializer, ConceptMasterySerializer, AchievementSerializer,
    StudySessionSerializer, LearningGoalSerializer, StudentStatsSerializer
)


def get_or_create_student(user):
    """Helper to get or create student profile."""
    profile, created = StudentProfile.objects.get_or_create(user=user)
    if created:
        # Initialize concept masteries for all active concepts
        for concept in Concept.objects.filter(is_active=True):
            ConceptMastery.objects.get_or_create(student=profile, concept=concept)
    return profile


class StudentProgressView(APIView):
    """Get student overall progress."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student(request.user)
        serializer = StudentProfileSerializer(profile)
        return Response(serializer.data)


class ConceptMasteryListView(APIView):
    """Get mastery levels for all concepts."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student(request.user)
        masteries = ConceptMastery.objects.filter(student=profile).select_related('concept')
        serializer = ConceptMasterySerializer(masteries, many=True)
        return Response(serializer.data)


class AchievementListView(APIView):
    """Get all student achievements."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student(request.user)
        achievements = Achievement.objects.filter(student=profile).order_by('-earned_at')
        serializer = AchievementSerializer(achievements, many=True)
        return Response(serializer.data)


class StudyHistoryView(APIView):
    """Get study session history."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student(request.user)
        sessions = StudySession.objects.filter(student=profile).select_related('concept')[:50]
        serializer = StudySessionSerializer(sessions, many=True)
        return Response(serializer.data)


class LearningGoalView(APIView):
    """CRUD for learning goals."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student(request.user)
        goals = LearningGoal.objects.filter(student=profile)
        serializer = LearningGoalSerializer(goals, many=True)
        return Response(serializer.data)

    def post(self, request):
        profile = get_or_create_student(request.user)
        serializer = LearningGoalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(student=profile)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def put(self, request):
        goal_id = request.data.get('id')
        profile = get_or_create_student(request.user)
        try:
            goal = LearningGoal.objects.get(id=goal_id, student=profile)
            serializer = LearningGoalSerializer(goal, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except LearningGoal.DoesNotExist:
            return Response({'error': 'Meta não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

    def delete(self, request):
        goal_id = request.query_params.get('id')
        profile = get_or_create_student(request.user)
        try:
            goal = LearningGoal.objects.get(id=goal_id, student=profile)
            goal.delete()
            return Response({'message': 'Meta removida.'})
        except LearningGoal.DoesNotExist:
            return Response({'error': 'Meta não encontrada.'}, status=status.HTTP_404_NOT_FOUND)


class StudentStatsView(APIView):
    """Comprehensive student statistics for dashboard."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_or_create_student(request.user)
        masteries = ConceptMastery.objects.filter(student=profile).select_related('concept')
        total_concepts = Concept.objects.filter(is_active=True).count()

        concepts_mastered = masteries.filter(is_mastered=True).count()
        concepts_in_progress = masteries.filter(mastery_level__gt=0, is_mastered=False).count()

        # Concepts in difficulty (mastery < 40% with at least 3 attempts)
        concepts_in_difficulty = [
            {
                'concept_name': cm.concept.name,
                'concept_slug': cm.concept.slug,
                'mastery_level': cm.mastery_level,
                'attempts': cm.attempts_count
            }
            for cm in masteries.filter(mastery_level__lt=40, attempts_count__gte=3)
        ]

        recent_sessions = StudySession.objects.filter(student=profile).select_related('concept')[:10]
        achievements = Achievement.objects.filter(student=profile).order_by('-earned_at')

        data = {
            'profile': StudentProfileSerializer(profile).data,
            'concepts_mastered': concepts_mastered,
            'concepts_in_progress': concepts_in_progress,
            'concepts_total': total_concepts,
            'concepts_in_difficulty': concepts_in_difficulty,
            'recent_sessions': StudySessionSerializer(recent_sessions, many=True).data,
            'achievements': AchievementSerializer(achievements, many=True).data,
            'mastery_data': ConceptMasterySerializer(masteries, many=True).data,
        }
        return Response(data)
