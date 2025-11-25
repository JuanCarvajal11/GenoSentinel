from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from genetics.models import Gene, GeneticVariant, PatientVariantReport
from genetics.serializers import (
    GeneSerializer, GeneCreateSerializer, GeneUpdateSerializer,
    VariantSerializer, VariantCreateSerializer, VariantUpdateSerializer,
    ReportSerializer, ReportCreateSerializer, ReportUpdateSerializer,
    ErrorResponseSerializer, MessageResponseSerializer
)
from genetics.services.gene_service import GeneService
from genetics.services.variant_service import VariantService
from genetics.services.report_service import ReportService
from genetics.dto.gene_dto import GeneCreateDTO, GeneUpdateDTO
from genetics.dto.variant_dto import VariantCreateDTO, VariantUpdateDTO
from genetics.dto.report_dto import ReportCreateDTO, ReportUpdateDTO

from rest_framework.exceptions import ValidationError


class GeneViewSet(viewsets.ModelViewSet):
    queryset = Gene.objects.all()
    serializer_class = GeneSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GeneCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GeneUpdateSerializer
        return GeneSerializer
    
    @swagger_auto_schema(
        operation_description="Crear un nuevo gen",
        request_body=GeneCreateSerializer,
        responses={201: GeneSerializer, 400: ErrorResponseSerializer}
    )
    def create(self, request):
        serializer = GeneCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = GeneCreateDTO(**serializer.validated_data)
        gene_response = GeneService.create_gene(dto)
        
        return Response(
            GeneSerializer(Gene.objects.get(pk=gene_response.id)).data,
            status=status.HTTP_201_CREATED
        )
    
    @swagger_auto_schema(
        operation_description="Actualizar un gen existente",
        request_body=GeneUpdateSerializer,
        responses={200: GeneSerializer, 400: ErrorResponseSerializer, 404: MessageResponseSerializer}
    )
    def update(self, request, pk=None):
        serializer = GeneUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = GeneUpdateDTO(**serializer.validated_data)
        gene_response = GeneService.update_gene(pk, dto)
        
        return Response(GeneSerializer(Gene.objects.get(pk=gene_response.id)).data)
    
    def partial_update(self, request, pk=None):
        serializer = GeneUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        dto = GeneUpdateDTO(**serializer.validated_data)
        gene_response = GeneService.update_gene(pk, dto)
        
        return Response(GeneSerializer(Gene.objects.get(pk=gene_response.id)).data)
    
    def destroy(self, request, pk=None):
        GeneService.delete_gene(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        symbol = request.query_params.get('symbol', '')
        genes = GeneService.search_genes_by_symbol(symbol)
        return Response(GeneSerializer(genes, many=True).data)


class VariantViewSet(viewsets.ModelViewSet):
    queryset = GeneticVariant.objects.select_related('gene').all()
    serializer_class = VariantSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VariantCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VariantUpdateSerializer
        return VariantSerializer
    
    def create(self, request):
        serializer = VariantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = VariantCreateDTO(**serializer.validated_data)
        variant_response = VariantService.create_variant(dto)
        
        return Response(
            VariantSerializer(GeneticVariant.objects.get(pk=variant_response.id)).data,
            status=status.HTTP_201_CREATED
        )
    
    def update(self, request, pk=None):
        serializer = VariantUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = VariantUpdateDTO(**serializer.validated_data)
        VariantService.update_variant(pk, dto)
        
        return Response(
            VariantSerializer(GeneticVariant.objects.get(pk=pk)).data
        )
    
    def partial_update(self, request, pk=None):
        serializer = VariantUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        dto = VariantUpdateDTO(**serializer.validated_data)
        VariantService.update_variant(pk, dto)
        
        return Response(
            VariantSerializer(GeneticVariant.objects.get(pk=pk)).data
        )
    
    def destroy(self, request, pk=None):
        VariantService.delete_variant(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @action(detail=False, methods=['get'], url_path='by-gene/(?P<gene_id>[0-9]+)')
    def by_gene(self, request, gene_id=None):
        variants = VariantService.get_variants_by_gene(gene_id)
        return Response(VariantSerializer(variants, many=True).data)
    
    @action(detail=False, methods=['get'])
    def by_impact(self, request):
        impact = request.query_params.get('impact', 'Unknown')
        variants = VariantService.get_variants_by_impact(impact)
        return Response(VariantSerializer(variants, many=True).data)


class ReportViewSet(viewsets.ModelViewSet):
    queryset = PatientVariantReport.objects.select_related('variant__gene').all()
    serializer_class = ReportSerializer

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.report_service = ReportService()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ReportCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ReportUpdateSerializer
        return ReportSerializer
    
    def create(self, request):
        serializer = ReportCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data.copy()
        data['patient_id'] = str(data['patient_id'])
        data['variant_id'] = str(data['variant_id'])
        data['detection_date'] = data['detection_date'].isoformat()

        dto = ReportCreateDTO(**data)
        report_response = self.report_service.create_report(dto)

        response_data = {
            'id': report_response.id,
            'patient_id': report_response.patient_id,
            'patient_name': report_response.patient_name,
            'variant_id': report_response.variant_id,
            'gene_symbol': report_response.gene_symbol,
            'chromosome': report_response.chromosome,
            'position': report_response.position,
            'impact': report_response.impact,
            'detection_date': report_response.detection_date,
            'allele_frequency': report_response.allele_frequency
        }

        return Response(response_data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        report_response = self.report_service.get_report(pk)

        response_data = {
            'id': report_response.id,
            'patient_id': report_response.patient_id,
            'patient_name': report_response.patient_name,
            'variant_id': report_response.variant_id,
            'gene_symbol': report_response.gene_symbol,
            'chromosome': report_response.chromosome,
            'position': report_response.position,
            'impact': report_response.impact,
            'detection_date': report_response.detection_date,
            'allele_frequency': report_response.allele_frequency
        }

        return Response(response_data)

    def list(self, request):
        filters = {}
        if 'patient_id' in request.query_params:
            filters['patient_id'] = request.query_params['patient_id']
        if 'variant_id' in request.query_params:
            filters['variant_id'] = request.query_params['variant_id']
        if 'gene_id' in request.query_params:
            filters['gene_id'] = request.query_params['gene_id']

        reports = self.report_service.list_reports(filters)
        enriched = self.report_service.enrich_reports_with_patient_data(reports)

        response_data = [{
            'id': r.id,
            'patient_id': r.patient_id,
            'patient_name': r.patient_name,
            'variant_id': r.variant_id,
            'gene_symbol': r.gene_symbol,
            'chromosome': r.chromosome,
            'position': r.position,
            'impact': r.impact,
            'detection_date': r.detection_date,
            'allele_frequency': r.allele_frequency
        } for r in enriched]

        return Response(response_data)

    def update(self, request, pk=None):
        serializer = ReportUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data.copy()
        if 'detection_date' in data:
            data['detection_date'] = data['detection_date'].isoformat()

        dto = ReportUpdateDTO(**data)
        report_response = self.report_service.update_report(pk, dto)

        response_data = {
            'id': report_response.id,
            'patient_id': report_response.patient_id,
            'patient_name': report_response.patient_name,
            'variant_id': report_response.variant_id,
            'gene_symbol': report_response.gene_symbol,
            'chromosome': report_response.chromosome,
            'position': report_response.position,
            'impact': report_response.impact,
            'detection_date': report_response.detection_date,
            'allele_frequency': report_response.allele_frequency
        }

        return Response(response_data)

    def destroy(self, request, pk=None):
        self.report_service.delete_report(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], url_path='by-patient/(?P<patient_id>[0-9a-f-]+)')
    def by_patient(self, request, patient_id=None):
        reports = self.report_service.get_patient_reports(patient_id)
        enriched = self.report_service.enrich_reports_with_patient_data(reports)

        response_data = [{
            'id': r.id,
            'patient_id': r.patient_id,
            'patient_name': r.patient_name,
            'variant_id': r.variant_id,
            'gene_symbol': r.gene_symbol,
            'chromosome': r.chromosome,
            'position': r.position,
            'impact': r.impact,
            'detection_date': r.detection_date,
            'allele_frequency': r.allele_frequency
        } for r in enriched]

        return Response(response_data)
