from django.urls import path
from . import views

urlpatterns = [
    path('start/', views.StartQuizView.as_view(), name='quiz-start'),
    path('answer/', views.SubmitAnswerView.as_view(), name='quiz-answer'),
    path('hint/', views.GetHintView.as_view(), name='quiz-hint'),
    path('<int:pk>/result/', views.QuizResultView.as_view(), name='quiz-result'),
    path('questions/<slug:slug>/', views.ConceptQuestionsView.as_view(), name='concept-questions'),
]
