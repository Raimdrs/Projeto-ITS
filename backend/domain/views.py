from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Concept, Lesson
from .serializers import ConceptListSerializer, ConceptDetailSerializer, LessonSerializer
from student.models import ConceptMastery


class ConceptListView(generics.ListAPIView):
    """List all concepts with student mastery info."""
    serializer_class = ConceptListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Concept.objects.filter(is_active=True).prefetch_related('lessons')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)

        # Enrich with student mastery data
        masteries = {
            cm.concept_id: {
                'mastery_level': cm.mastery_level,
                'is_mastered': cm.is_mastered
            }
            for cm in ConceptMastery.objects.filter(student__user=request.user)
        }

        # Check if paginated
        data_list = response.data.get('results', []) if isinstance(response.data, dict) and 'results' in response.data else response.data

        for concept_data in data_list:
            mastery = masteries.get(concept_data['id'], {'mastery_level': 0, 'is_mastered': False})
            concept_data['mastery_level'] = mastery['mastery_level']
            concept_data['is_mastered'] = mastery['is_mastered']

            # Check if prerequisites are met
            prereqs_met = True
            for prereq in concept_data.get('prerequisites', []):
                prereq_mastery = masteries.get(prereq['id'], {'mastery_level': 0, 'is_mastered': False})
                if not prereq_mastery['is_mastered']:
                    prereqs_met = False
                    break
            concept_data['prerequisites_met'] = prereqs_met

            # Determine status
            if mastery['is_mastered']:
                concept_data['status'] = 'mastered'
            elif mastery['mastery_level'] > 0:
                concept_data['status'] = 'in_progress'
            elif prereqs_met:
                concept_data['status'] = 'available'
            else:
                concept_data['status'] = 'locked'

        return response


class ConceptDetailView(generics.RetrieveAPIView):
    """Get concept details with lessons."""
    serializer_class = ConceptDetailSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'slug'

    def get_queryset(self):
        return Concept.objects.filter(is_active=True).prefetch_related('lessons')

    def retrieve(self, request, *args, **kwargs):
        response = super().retrieve(request, *args, **kwargs)

        # Add mastery info
        try:
            from student.models import StudentProfile
            profile = StudentProfile.objects.get(user=request.user)
            mastery = ConceptMastery.objects.filter(
                student=profile,
                concept__slug=kwargs['slug']
            ).first()
            response.data['mastery_level'] = mastery.mastery_level if mastery else 0
            response.data['is_mastered'] = mastery.is_mastered if mastery else False
        except Exception:
            response.data['mastery_level'] = 0
            response.data['is_mastered'] = False

        return response


class LessonDetailView(generics.ListAPIView):
    """Get lessons for a specific concept."""
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        slug = self.kwargs.get('slug')
        return Lesson.objects.filter(concept__slug=slug).order_by('order')
