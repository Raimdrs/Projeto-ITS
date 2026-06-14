from django.db import models


class Concept(models.Model):
    """A financial education concept/topic in the knowledge graph."""
    name = models.CharField(max_length=200, verbose_name='Nome')
    slug = models.SlugField(max_length=200, unique=True)
    description = models.TextField(verbose_name='Descrição')
    icon = models.CharField(max_length=50, default='📚', verbose_name='Ícone')
    color = models.CharField(max_length=7, default='#4CAF50', verbose_name='Cor')
    order = models.IntegerField(default=0, verbose_name='Ordem')
    is_active = models.BooleanField(default=True, verbose_name='Ativo')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Conceito'
        verbose_name_plural = 'Conceitos'
        ordering = ['order']

    def __str__(self):
        return self.name

    def get_prerequisites(self):
        """Return all prerequisite concepts."""
        return Concept.objects.filter(
            id__in=self.prerequisite_for.values_list('prerequisite_id', flat=True)
        )

    def get_dependents(self):
        """Return all concepts that depend on this one."""
        return Concept.objects.filter(
            id__in=self.prerequisites.values_list('concept_id', flat=True)
        )


class ConceptPrerequisite(models.Model):
    """Defines prerequisite relationships between concepts (directed graph)."""
    concept = models.ForeignKey(
        Concept, on_delete=models.CASCADE,
        related_name='prerequisite_for',
        verbose_name='Conceito'
    )
    prerequisite = models.ForeignKey(
        Concept, on_delete=models.CASCADE,
        related_name='prerequisites',
        verbose_name='Pré-requisito'
    )

    class Meta:
        verbose_name = 'Pré-requisito'
        verbose_name_plural = 'Pré-requisitos'
        unique_together = ['concept', 'prerequisite']

    def __str__(self):
        return f"{self.prerequisite.name} → {self.concept.name}"


class Lesson(models.Model):
    """Educational content for a concept."""
    concept = models.ForeignKey(Concept, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=300, verbose_name='Título')
    content = models.TextField(verbose_name='Conteúdo Teórico')
    practical_examples = models.TextField(blank=True, default='', verbose_name='Exemplos Práticos')
    key_points = models.TextField(blank=True, default='', verbose_name='Pontos-Chave')
    order = models.IntegerField(default=0, verbose_name='Ordem')
    estimated_minutes = models.IntegerField(default=15, verbose_name='Tempo Estimado (min)')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Aula'
        verbose_name_plural = 'Aulas'
        ordering = ['concept', 'order']

    def __str__(self):
        return f"{self.concept.name} - {self.title}"
