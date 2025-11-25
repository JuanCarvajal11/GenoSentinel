from django.contrib import admin
from genetics.models import Gene, GeneticVariant, PatientVariantReport


@admin.register(Gene)
class GeneAdmin(admin.ModelAdmin):
    """Configuración del administrador para Gene"""
    list_display = ['id', 'symbol', 'full_name']
    list_filter = []
    search_fields = ['symbol', 'full_name']
    ordering = ['symbol']
    
    fieldsets = (
        ('Información Básica', {
            'fields': ('symbol', 'full_name')
        }),
        ('Descripción Funcional', {
            'fields': ('function_summary',)
        }),
    )


@admin.register(GeneticVariant)
class GeneticVariantAdmin(admin.ModelAdmin):
    """Configuración del administrador para GeneticVariant"""
    list_display = ['id', 'gene', 'chromosome', 'position', 'impact']
    list_filter = ['impact', 'chromosome']
    search_fields = ['gene__symbol', 'chromosome']
    ordering = ['chromosome', 'position']
    readonly_fields = ['id']
    autocomplete_fields = ['gene']
    
    fieldsets = (
        ('Asociación con Gen', {
            'fields': ('id', 'gene')
        }),
        ('Ubicación Genómica', {
            'fields': ('chromosome', 'position')
        }),
        ('Información de la Variante', {
            'fields': ('reference_base', 'alternate_base', 'impact')
        }),
    )


@admin.register(PatientVariantReport)
class PatientVariantReportAdmin(admin.ModelAdmin):
    """Configuración del administrador para PatientVariantReport"""
    list_display = ['id', 'patient_id', 'variant', 'detection_date', 'allele_frequency']
    list_filter = ['detection_date']
    search_fields = ['patient_id', 'variant__gene__symbol']
    ordering = ['-detection_date']
    readonly_fields = ['id']
    autocomplete_fields = ['variant']
    date_hierarchy = 'detection_date'
    
    fieldsets = (
        ('Información del Reporte', {
            'fields': ('id', 'patient_id', 'variant')
        }),
        ('Datos Clínicos', {
            'fields': ('detection_date', 'allele_frequency')
        })
    )
    
    def get_queryset(self, request):
        """Optimiza las consultas incluyendo relaciones"""
        queryset = super().get_queryset(request)
        return queryset.select_related('variant__gene')