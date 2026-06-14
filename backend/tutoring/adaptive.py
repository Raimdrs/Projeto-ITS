"""
Adaptive Learning Module — Recommends next content based on student model.

Implements:
- Prerequisite-aware content recommendation
- Difficulty-based review suggestions
- ZDP (Zone of Proximal Development) detection
"""
from domain.models import Concept, ConceptPrerequisite
from student.models import ConceptMastery


def get_recommendation(student_profile):
    """
    Get personalized learning recommendation for the student.

    Algorithm:
    1. Find concepts in difficulty (mastery < 50%) and recommend prerequisite review
    2. Find available concepts (prerequisites met, not yet mastered)
    3. Prioritize concepts with some progress (ZDP)
    4. If all mastered, recommend practice and simulations
    """
    all_concepts = Concept.objects.filter(is_active=True).order_by('order')
    masteries = {
        cm.concept_id: cm
        for cm in ConceptMastery.objects.filter(student=student_profile)
    }

    recommendations = []
    reviews = []
    available = []
    in_progress = []

    for concept in all_concepts:
        mastery = masteries.get(concept.id)
        mastery_level = mastery.mastery_level if mastery else 0
        is_mastered = mastery.is_mastered if mastery else False

        if is_mastered:
            continue

        # Check prerequisites
        prereqs = ConceptPrerequisite.objects.filter(concept=concept)
        prereqs_met = True
        unmet_prereqs = []

        for prereq in prereqs:
            prereq_mastery = masteries.get(prereq.prerequisite_id)
            if not prereq_mastery or not prereq_mastery.is_mastered:
                prereqs_met = False
                unmet_prereqs.append({
                    'concept_id': prereq.prerequisite_id,
                    'concept_name': prereq.prerequisite.name,
                    'concept_slug': prereq.prerequisite.slug,
                    'mastery_level': prereq_mastery.mastery_level if prereq_mastery else 0
                })

        if not prereqs_met:
            # This concept is blocked — recommend reviewing prerequisites
            for up in unmet_prereqs:
                if up not in reviews:
                    reviews.append(up)
            continue

        if mastery_level > 0:
            in_progress.append({
                'concept_id': concept.id,
                'concept_name': concept.name,
                'concept_slug': concept.slug,
                'mastery_level': mastery_level,
                'reason': 'Conceito em progresso — continue estudando!'
            })
        else:
            available.append({
                'concept_id': concept.id,
                'concept_name': concept.name,
                'concept_slug': concept.slug,
                'mastery_level': 0,
                'reason': 'Novo conceito disponível para estudo.'
            })

    # Build recommendation
    result = {
        'next_concept': None,
        'reviews': [],
        'available': available,
        'in_progress': in_progress,
        'message': '',
    }

    # Priority 1: Concepts in difficulty (low mastery, some attempts)
    difficulty_concepts = []
    for concept in all_concepts:
        mastery = masteries.get(concept.id)
        if mastery and mastery.mastery_level < 50 and mastery.attempts_count >= 3:
            # Find prerequisites that need review
            prereqs = ConceptPrerequisite.objects.filter(concept=concept)
            prereq_reviews = []
            for prereq in prereqs:
                prereq_mastery = masteries.get(prereq.prerequisite_id)
                if prereq_mastery and prereq_mastery.mastery_level < 80:
                    prereq_reviews.append({
                        'concept_name': prereq.prerequisite.name,
                        'concept_slug': prereq.prerequisite.slug,
                        'mastery_level': prereq_mastery.mastery_level
                    })
            difficulty_concepts.append({
                'concept_name': concept.name,
                'concept_slug': concept.slug,
                'mastery_level': mastery.mastery_level,
                'prereq_reviews': prereq_reviews,
                'reason': f'Dificuldade detectada em {concept.name}. Revise os pré-requisitos.'
            })

    result['difficulty_concepts'] = difficulty_concepts

    # Priority 2: Continue in-progress concepts
    if in_progress:
        result['next_concept'] = in_progress[0]
        result['message'] = f'Continue estudando: {in_progress[0]["concept_name"]}'

    # Priority 3: Start new available concept
    elif available:
        result['next_concept'] = available[0]
        result['message'] = f'Novo conceito disponível: {available[0]["concept_name"]}'

    # Priority 4: Review prerequisites
    elif reviews:
        result['reviews'] = reviews
        result['message'] = 'Revise os conceitos base antes de avançar.'

    else:
        result['message'] = '🎉 Parabéns! Você dominou todos os conceitos! Continue praticando com simulações.'

    return result


def check_concept_access(student_profile, concept):
    """Check if a student has met all prerequisites for a concept."""
    prereqs = ConceptPrerequisite.objects.filter(concept=concept)

    if not prereqs.exists():
        return True  # No prerequisites

    for prereq in prereqs:
        mastery = ConceptMastery.objects.filter(
            student=student_profile, concept=prereq.prerequisite
        ).first()
        if not mastery or not mastery.is_mastered:
            return False

    return True
