from django.urls import path
from . import views

urlpatterns = [
    path('recommendation/', views.RecommendationView.as_view(), name='tutor-recommendation'),
    path('feedback/<int:attempt_id>/', views.AttemptFeedbackView.as_view(), name='tutor-feedback'),
]
