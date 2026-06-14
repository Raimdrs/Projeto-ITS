from django.urls import path
from . import views

urlpatterns = [
    path('progress/', views.StudentProgressView.as_view(), name='student-progress'),
    path('mastery/', views.ConceptMasteryListView.as_view(), name='student-mastery'),
    path('achievements/', views.AchievementListView.as_view(), name='student-achievements'),
    path('history/', views.StudyHistoryView.as_view(), name='student-history'),
    path('goals/', views.LearningGoalView.as_view(), name='student-goals'),
    path('stats/', views.StudentStatsView.as_view(), name='student-stats'),
]
