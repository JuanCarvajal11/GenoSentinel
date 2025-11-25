import uuid
from django.db import models


class Gene(models.Model):
    """Modelo para catalogar genes de interés oncológico"""
    id = models.AutoField(primary_key=True)
    symbol = models.CharField(max_length=50, unique=True, db_index=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    function_summary = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'gene'
        managed = False  # Django no gestionará esta tabla
        ordering = ['symbol']
        verbose_name = 'Gen'
        verbose_name_plural = 'Genes'

    def __str__(self):
        return f"{self.symbol} - {self.full_name}" if self.full_name else self.symbol


class GeneticVariant(models.Model):
    """Modelo para registrar mutaciones genéticas específicas"""
    
    IMPACT_CHOICES = [
        ('Missense', 'Missense'),
        ('Frameshift', 'Frameshift'),
        ('Nonsense', 'Nonsense'),
        ('Silent', 'Silent'),
        ('Unknown', 'Unknown'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    gene = models.ForeignKey(
        Gene, 
        on_delete=models.CASCADE, 
        related_name='variants',
        db_column='gene_id'
    )
    chromosome = models.CharField(max_length=10, blank=True, null=True)
    position = models.IntegerField(blank=True, null=True)
    reference_base = models.CharField(max_length=1, blank=True, null=True)
    alternate_base = models.CharField(max_length=1, blank=True, null=True)
    impact = models.CharField(
        max_length=20, 
        choices=IMPACT_CHOICES, 
        default='Unknown'
    )

    class Meta:
        db_table = 'genetic_variant'
        ordering = ['chromosome', 'position']
        verbose_name = 'Variante Genética'
        verbose_name_plural = 'Variantes Genéticas'
        indexes = [
            models.Index(fields=['chromosome', 'position']),
            models.Index(fields=['gene', 'impact']),
        ]

    def __str__(self):
        return f"{self.gene.symbol} - Chr{self.chromosome}:{self.position}"


from genetics.models import GeneticVariant
from django.db import models
import uuid

class PatientVariantReport(models.Model):
    """Modelo para asociar variantes genéticas a pacientes específicos"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Cambiado de UUIDField a ForeignKey
    patient = models.ForeignKey(
        'Patient',  # Asegúrate de que exista tu modelo Patient en tu app
        on_delete=models.CASCADE,
        related_name='variant_reports',
        db_column='patient_id'
    )

    variant = models.ForeignKey(
        GeneticVariant, 
        on_delete=models.CASCADE,
        related_name='patient_reports',
        db_column='variant_id'
    )
    detection_date = models.DateField()
    allele_frequency = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        blank=True,
        null=True
    )

    class Meta:
        db_table = 'patient_variant_report'
        ordering = ['-detection_date']
        verbose_name = 'Reporte de Variante del Paciente'
        verbose_name_plural = 'Reportes de Variantes de Pacientes'
        indexes = [
            models.Index(fields=['patient', 'detection_date']),
            models.Index(fields=['variant', 'patient']),
        ]

    def __str__(self):
        return f"Paciente {self.patient_id} - {self.variant.gene.symbol} ({self.detection_date})"

    

class Patient(models.Model):
    """Modelo local de paciente"""
    id = models.CharField(primary_key=True, max_length=36)  # UUID
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    birth_date = models.DateField()
    gender = models.CharField(
        max_length=10,
        choices=[('M', 'Masculino'), ('F', 'Femenino'), ('Otro', 'Otro')],
        default='Otro'
    )
    status = models.CharField(
        max_length=20,
        choices=[('Activo', 'Activo'), ('Seguimiento', 'Seguimiento'), ('Inactivo', 'Inactivo')],
        default='Activo'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.id})"