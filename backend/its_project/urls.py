"""
URL configuration for its_project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/concepts/', include('domain.urls')),
    path('api/student/', include('student.urls')),
    path('api/quiz/', include('learning.urls')),
    path('api/tutor/', include('tutoring.urls')),
    path('api/simulations/', include('simulation.urls')),
]
