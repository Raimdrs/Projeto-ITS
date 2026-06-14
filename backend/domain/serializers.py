from rest_framework import serializers
from .models import Concept, ConceptPrerequisite, Lesson


class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ['id', 'title', 'content', 'practical_examples', 'key_points', 'order', 'estimated_minutes']


class ConceptPrerequisiteSerializer(serializers.ModelSerializer):
    prerequisite_name = serializers.CharField(source='prerequisite.name', read_only=True)
    prerequisite_slug = serializers.CharField(source='prerequisite.slug', read_only=True)

    class Meta:
        model = ConceptPrerequisite
        fields = ['id', 'prerequisite', 'prerequisite_name', 'prerequisite_slug']


class ConceptListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for concept listing."""
    prerequisites = serializers.SerializerMethodField()
    lesson_count = serializers.SerializerMethodField()

    class Meta:
        model = Concept
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'order', 'prerequisites', 'lesson_count']

    def get_prerequisites(self, obj):
        prereqs = ConceptPrerequisite.objects.filter(concept=obj).select_related('prerequisite')
        return [{'id': p.prerequisite.id, 'name': p.prerequisite.name, 'slug': p.prerequisite.slug} for p in prereqs]

    def get_lesson_count(self, obj):
        return obj.lessons.count()


class ConceptDetailSerializer(serializers.ModelSerializer):
    """Full serializer for concept detail page."""
    prerequisites = serializers.SerializerMethodField()
    lessons = LessonSerializer(many=True, read_only=True)

    class Meta:
        model = Concept
        fields = ['id', 'name', 'slug', 'description', 'icon', 'color', 'order', 'prerequisites', 'lessons']

    def get_prerequisites(self, obj):
        prereqs = ConceptPrerequisite.objects.filter(concept=obj).select_related('prerequisite')
        return [{'id': p.prerequisite.id, 'name': p.prerequisite.name, 'slug': p.prerequisite.slug} for p in prereqs]
