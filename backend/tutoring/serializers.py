from rest_framework import serializers


class RecommendationSerializer(serializers.Serializer):
    next_concept = serializers.DictField(allow_null=True)
    reviews = serializers.ListField()
    available = serializers.ListField()
    in_progress = serializers.ListField()
    difficulty_concepts = serializers.ListField()
    message = serializers.CharField()
