import random
from django.utils import timezone
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from domain.models import Concept
from student.models import StudentProfile, ConceptMastery, StudySession
from student.views import get_or_create_student
from .models import Question, QuestionOption, QuizAttempt, Attempt
from .serializers import (
    QuestionSerializer, SubmitAnswerSerializer, QuizAttemptSerializer, StartQuizSerializer
)


class StartQuizView(APIView):
    """Start a new adaptive quiz for a concept."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = StartQuizSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        concept_slug = serializer.validated_data['concept_slug']
        num_questions = serializer.validated_data.get('num_questions', 5)

        try:
            concept = Concept.objects.get(slug=concept_slug, is_active=True)
        except Concept.DoesNotExist:
            return Response({'error': 'Conceito não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        profile = get_or_create_student(request.user)
        mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=concept)

        # Adaptive question selection based on mastery level
        questions = list(Question.objects.filter(concept=concept, is_active=True))

        if mastery.mastery_level < 30:
            # Prioritize easy questions
            questions.sort(key=lambda q: q.difficulty)
        elif mastery.mastery_level < 60:
            # Mix of difficulties
            random.shuffle(questions)
        else:
            # Prioritize hard questions
            questions.sort(key=lambda q: -q.difficulty)

        selected = questions[:num_questions]

        if not selected:
            return Response({'error': 'Nenhuma questão disponível para este conceito.'}, status=status.HTTP_404_NOT_FOUND)

        # Create quiz attempt
        quiz_attempt = QuizAttempt.objects.create(
            student=profile,
            concept=concept,
            total_questions=len(selected)
        )

        # Return questions without answers
        questions_data = QuestionSerializer(selected, many=True).data

        return Response({
            'quiz_attempt_id': quiz_attempt.id,
            'concept': concept.name,
            'total_questions': len(selected),
            'questions': questions_data
        })


class SubmitAnswerView(APIView):
    """Submit an answer for a quiz question."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = SubmitAnswerSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        profile = get_or_create_student(request.user)

        try:
            quiz_attempt = QuizAttempt.objects.get(
                id=serializer.validated_data['quiz_attempt_id'],
                student=profile,
                is_completed=False
            )
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Tentativa de quiz não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            question = Question.objects.get(id=serializer.validated_data['question_id'])
        except Question.DoesNotExist:
            return Response({'error': 'Questão não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        answer = serializer.validated_data['answer']
        hint_used = serializer.validated_data.get('hint_used', False)
        time_seconds = serializer.validated_data.get('time_seconds', 0)

        # Evaluate answer
        result = self._evaluate_answer(question, answer)

        # Generate feedback
        from tutoring.feedback import generate_feedback
        feedback = generate_feedback(question, result, hint_used)

        # Create attempt record
        attempt = Attempt.objects.create(
            student=profile,
            question=question,
            quiz_attempt=quiz_attempt,
            answer=answer,
            result=result,
            hint_used=hint_used,
            time_seconds=time_seconds,
            feedback=feedback
        )

        # Update concept mastery
        mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=question.concept)
        mastery.update_mastery(result, hint_used)

        # Update student stats
        profile.total_questions_answered += 1
        if result == 'correct':
            profile.total_correct_answers += 1
            quiz_attempt.correct_answers += 1
        quiz_attempt.save()
        profile.save()

        # Check if quiz is complete
        answers_count = quiz_attempt.question_attempts.count()
        is_quiz_complete = answers_count >= quiz_attempt.total_questions

        if is_quiz_complete:
            quiz_attempt.is_completed = True
            quiz_attempt.finished_at = timezone.now()
            quiz_attempt.score = round(
                (quiz_attempt.correct_answers / quiz_attempt.total_questions) * 100, 1
            ) if quiz_attempt.total_questions > 0 else 0
            quiz_attempt.save()

            # Record study session
            StudySession.objects.create(
                student=profile,
                concept=question.concept,
                duration_minutes=max(1, sum(
                    a.time_seconds for a in quiz_attempt.question_attempts.all()
                ) // 60),
                activity_type='quiz'
            )

            # Check achievements
            from tutoring.engine import check_achievements
            check_achievements(profile, quiz_attempt)

        return Response({
            'result': result,
            'feedback': feedback,
            'is_correct': result == 'correct',
            'correct_answer': self._get_correct_answer(question),
            'explanation': question.explanation,
            'mastery_level': mastery.mastery_level,
            'is_quiz_complete': is_quiz_complete,
            'quiz_score': quiz_attempt.score if is_quiz_complete else None,
        })

    def _evaluate_answer(self, question, answer):
        """Evaluate the student's answer."""
        if question.question_type in ('multiple_choice', 'true_false'):
            # Check if selected option is correct
            try:
                selected_option = QuestionOption.objects.get(id=int(answer), question=question)
                return 'correct' if selected_option.is_correct else 'incorrect'
            except (QuestionOption.DoesNotExist, ValueError):
                return 'incorrect'

        elif question.question_type == 'fill_blank':
            correct = question.correct_answer.strip().lower()
            student = answer.strip().lower()
            if student == correct:
                return 'correct'
            # Partial match
            elif correct in student or student in correct:
                return 'partial'
            return 'incorrect'

        elif question.question_type == 'math_problem':
            try:
                correct_val = float(question.correct_answer.replace(',', '.'))
                student_val = float(answer.replace(',', '.'))
                if abs(correct_val - student_val) < 0.01:
                    return 'correct'
                elif abs(correct_val - student_val) / max(abs(correct_val), 1) < 0.1:
                    return 'partial'
                return 'incorrect'
            except ValueError:
                return 'incorrect'

        elif question.question_type == 'case_study':
            # Case studies are evaluated by keyword matching
            correct_keywords = [kw.strip().lower() for kw in question.correct_answer.split(',')]
            student_answer = answer.strip().lower()
            matches = sum(1 for kw in correct_keywords if kw in student_answer)
            ratio = matches / len(correct_keywords) if correct_keywords else 0
            if ratio >= 0.8:
                return 'correct'
            elif ratio >= 0.4:
                return 'partial'
            return 'incorrect'

        return 'incorrect'

    def _get_correct_answer(self, question):
        """Return the correct answer for display."""
        if question.question_type in ('multiple_choice', 'true_false'):
            correct_option = question.options.filter(is_correct=True).first()
            return correct_option.text if correct_option else ''
        return question.correct_answer


class GetHintView(APIView):
    """Get a hint for a question (with mastery penalty)."""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        question_id = request.data.get('question_id')
        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            return Response({'error': 'Questão não encontrada.'}, status=status.HTTP_404_NOT_FOUND)

        profile = get_or_create_student(request.user)
        mastery, _ = ConceptMastery.objects.get_or_create(student=profile, concept=question.concept)

        # Apply hint penalty
        mastery.mastery_level = max(0, mastery.mastery_level - 5)
        mastery.save()

        hint = question.hint if question.hint else 'Releia o conteúdo da aula e tente novamente.'

        return Response({
            'hint': hint,
            'mastery_level': mastery.mastery_level,
        })


class QuizResultView(APIView):
    """Get detailed results for a quiz attempt."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        profile = get_or_create_student(request.user)
        try:
            quiz_attempt = QuizAttempt.objects.get(id=pk, student=profile)
        except QuizAttempt.DoesNotExist:
            return Response({'error': 'Resultado não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = QuizAttemptSerializer(quiz_attempt)
        return Response(serializer.data)


class ConceptQuestionsView(APIView):
    """Get questions for a specific concept (exercise mode)."""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, slug):
        try:
            concept = Concept.objects.get(slug=slug)
        except Concept.DoesNotExist:
            return Response({'error': 'Conceito não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        questions = Question.objects.filter(concept=concept, is_active=True)
        serializer = QuestionSerializer(questions, many=True)
        return Response(serializer.data)
