from django.contrib import admin
from .models import Concept, ConceptPrerequisite, Lesson


class ConceptPrerequisiteInline(admin.TabularInline):
    model = ConceptPrerequisite
    fk_name = 'concept'
    extra = 1


class LessonInline(admin.StackedInline):
    model = Lesson
    extra = 0


@admin.register(Concept)
class ConceptAdmin(admin.ModelAdmin):
    list_display = ['name', 'slug', 'order', 'is_active']
    list_filter = ['is_active']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ConceptPrerequisiteInline, LessonInline]


@admin.register(ConceptPrerequisite)
class ConceptPrerequisiteAdmin(admin.ModelAdmin):
    list_display = ['concept', 'prerequisite']


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'concept', 'order', 'estimated_minutes']
    list_filter = ['concept']
