from django.urls import path
from . import views

urlpatterns = [
    path('', views.ConceptListView.as_view(), name='concept-list'),
    path('<slug:slug>/', views.ConceptDetailView.as_view(), name='concept-detail'),
    path('<slug:slug>/lessons/', views.LessonDetailView.as_view(), name='concept-lessons'),
]
