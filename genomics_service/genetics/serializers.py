from rest_framework import serializers
from genetics.models import Gene, GeneticVariant, PatientVariantReport


class GeneSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Gene"""
    
    class Meta:
        model = Gene
        fields = ['id', 'symbol', 'full_name', 'function_summary']
        read_only_fields = ['id']


class GeneCreateSerializer(serializers.Serializer):
    """Serializador para crear genes"""
    symbol = serializers.CharField(max_length=50, required=True)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    function_summary = serializers.CharField(required=False, allow_blank=True)


class GeneUpdateSerializer(serializers.Serializer):
    """Serializador para actualizar genes"""
    symbol = serializers.CharField(max_length=50, required=False)
    full_name = serializers.CharField(max_length=255, required=False, allow_blank=True)
    function_summary = serializers.CharField(required=False, allow_blank=True)


class VariantSerializer(serializers.ModelSerializer):
    """Serializador para el modelo GeneticVariant"""
    gene_symbol = serializers.CharField(source='gene.symbol', read_only=True)
    
    class Meta:
        model = GeneticVariant
        fields = [
            'id', 'gene_id', 'gene_symbol', 'chromosome', 'position',
            'reference_base', 'alternate_base', 'impact'
        ]
        read_only_fields = ['id']


class VariantCreateSerializer(serializers.Serializer):
    """Serializador para crear variantes genéticas"""
    gene_id = serializers.IntegerField(required=True)
    chromosome = serializers.CharField(max_length=10, required=False, allow_blank=True)
    position = serializers.IntegerField(required=False, allow_null=True)
    reference_base = serializers.CharField(max_length=1, required=False, allow_blank=True)
    alternate_base = serializers.CharField(max_length=1, required=False, allow_blank=True)
    impact = serializers.ChoiceField(
        choices=['Missense', 'Frameshift', 'Nonsense', 'Silent', 'Unknown'],
        default='Unknown'
    )


class VariantUpdateSerializer(serializers.Serializer):
    """Serializador para actualizar variantes genéticas"""
    gene_id = serializers.IntegerField(required=False)
    chromosome = serializers.CharField(max_length=10, required=False, allow_blank=True)
    position = serializers.IntegerField(required=False, allow_null=True)
    reference_base = serializers.CharField(max_length=1, required=False, allow_blank=True)
    alternate_base = serializers.CharField(max_length=1, required=False, allow_blank=True)
    impact = serializers.ChoiceField(
        choices=['Missense', 'Frameshift', 'Nonsense', 'Silent', 'Unknown'],
        required=False
    )


class ReportSerializer(serializers.ModelSerializer):
    """Serializador para el modelo PatientVariantReport"""
    gene_symbol = serializers.CharField(source='variant.gene.symbol', read_only=True)
    chromosome = serializers.CharField(source='variant.chromosome', read_only=True)
    position = serializers.IntegerField(source='variant.position', read_only=True)
    impact = serializers.CharField(source='variant.impact', read_only=True)
    patient_name = serializers.CharField(read_only=True, required=False)
    
    class Meta:
        model = PatientVariantReport
        fields = [
            'id', 'patient_id', 'patient_name', 'variant_id', 'gene_symbol',
            'chromosome', 'position', 'impact', 'detection_date',
            'allele_frequency'
        ]
        read_only_fields = ['id']


class ReportCreateSerializer(serializers.Serializer):
    """Serializador para crear reportes de variantes de pacientes"""
    patient_id = serializers.UUIDField(required=True)
    variant_id = serializers.UUIDField(required=True)
    detection_date = serializers.DateField(required=True)
    allele_frequency = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        allow_null=True
    )


class ReportUpdateSerializer(serializers.Serializer):
    """Serializador para actualizar reportes de variantes de pacientes"""
    detection_date = serializers.DateField(required=False)
    allele_frequency = serializers.DecimalField(
        max_digits=5,
        decimal_places=2,
        required=False,
        allow_null=True
    )


class ErrorResponseSerializer(serializers.Serializer):
    """Serializador para respuestas de error"""
    errors = serializers.ListField(child=serializers.CharField())


class MessageResponseSerializer(serializers.Serializer):
    """Serializador para respuestas de mensajes"""
    message = serializers.CharField()