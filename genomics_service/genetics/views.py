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
    """
    ViewSet para gestionar genes.
    
    Proporciona operaciones CRUD completas para genes genéticos,
    incluyendo búsqueda por símbolo.
    """
    queryset = Gene.objects.all()
    serializer_class = GeneSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return GeneCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return GeneUpdateSerializer
        return GeneSerializer
    
    @swagger_auto_schema(
        operation_summary="Crear un nuevo gen",
        operation_description="Crea un nuevo gen en el sistema con su símbolo, nombre y cromosoma asociado.",
        request_body=GeneCreateSerializer,
        responses={
            201: openapi.Response(
                description="Gen creado exitosamente",
                schema=GeneSerializer
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            )
        },
        tags=['Genes']
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
        operation_summary="Listar todos los genes",
        operation_description="Obtiene una lista paginada de todos los genes registrados en el sistema.",
        responses={
            200: openapi.Response(
                description="Lista de genes obtenida exitosamente",
                schema=GeneSerializer(many=True)
            )
        },
        tags=['Genes']
    )
    def list(self, request):
        return super().list(request)
    
    @swagger_auto_schema(
        operation_summary="Obtener un gen específico",
        operation_description="Recupera los detalles completos de un gen específico por su ID.",
        responses={
            200: openapi.Response(
                description="Gen encontrado exitosamente",
                schema=GeneSerializer
            ),
            404: openapi.Response(
                description="Gen no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Genes']
    )
    def retrieve(self, request, pk=None):
        return super().retrieve(request, pk)
    
    @swagger_auto_schema(
        operation_summary="Actualizar un gen (completo)",
        operation_description="Actualiza todos los campos de un gen existente. Se requieren todos los campos.",
        request_body=GeneUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Gen actualizado exitosamente",
                schema=GeneSerializer
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            ),
            404: openapi.Response(
                description="Gen no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Genes']
    )
    def update(self, request, pk=None):
        serializer = GeneUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = GeneUpdateDTO(**serializer.validated_data)
        gene_response = GeneService.update_gene(pk, dto)
        
        return Response(GeneSerializer(Gene.objects.get(pk=gene_response.id)).data)
    
    @swagger_auto_schema(
        operation_summary="Actualizar un gen (parcial)",
        operation_description="Actualiza uno o más campos de un gen existente. Solo se requieren los campos a modificar.",
        request_body=GeneUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Gen actualizado exitosamente",
                schema=GeneSerializer
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            ),
            404: openapi.Response(
                description="Gen no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Genes']
    )
    def partial_update(self, request, pk=None):
        serializer = GeneUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        dto = GeneUpdateDTO(**serializer.validated_data)
        gene_response = GeneService.update_gene(pk, dto)
        
        return Response(GeneSerializer(Gene.objects.get(pk=gene_response.id)).data)
    
    @swagger_auto_schema(
        operation_summary="Eliminar un gen",
        operation_description="Elimina permanentemente un gen del sistema. Esta acción no se puede deshacer.",
        responses={
            204: openapi.Response(description="Gen eliminado exitosamente"),
            404: openapi.Response(
                description="Gen no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Genes']
    )
    def destroy(self, request, pk=None):
        GeneService.delete_gene(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @swagger_auto_schema(
        operation_summary="Buscar genes por símbolo",
        operation_description="Busca genes que coincidan con el símbolo proporcionado. La búsqueda es case-insensitive y permite coincidencias parciales.",
        manual_parameters=[
            openapi.Parameter(
                'symbol',
                openapi.IN_QUERY,
                description="Símbolo del gen a buscar (ej: BRCA1, TP53)",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                description="Búsqueda completada exitosamente",
                schema=GeneSerializer(many=True)
            )
        },
        tags=['Genes']
    )
    @action(detail=False, methods=['get'])
    def search(self, request):
        symbol = request.query_params.get('symbol', '')
        
        # DEBUG: Prints temporales
        print("=" * 60)
        print(f"🔍 VISTA - Query params recibidos: {dict(request.query_params)}")
        print(f"🔍 VISTA - Symbol extraído: '{symbol}'")
        print(f"🔍 VISTA - Tipo: {type(symbol)}, Longitud: {len(symbol)}")
        print("=" * 60)
        
        genes = GeneService.search_genes_by_symbol(symbol)
        
        print(f"✅ VISTA - Genes del servicio: {len(genes)} genes encontrados")
        print(f"✅ VISTA - Símbolos: {[g.symbol for g in genes]}")
        
        serialized_data = GeneSerializer(genes, many=True).data
        
        print(f"✅ VISTA - Datos serializados: {serialized_data}")
        print(f"✅ VISTA - Tipo de respuesta: {type(serialized_data)}")
        print("=" * 60)
        
        return Response(serialized_data)


class VariantViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar variantes genéticas.
    
    Proporciona operaciones CRUD completas para variantes genéticas,
    incluyendo filtrado por gen e impacto clínico.
    """
    queryset = GeneticVariant.objects.select_related('gene').all()
    serializer_class = VariantSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return VariantCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return VariantUpdateSerializer
        return VariantSerializer
    
    @swagger_auto_schema(
        operation_summary="Crear una nueva variante genética",
        operation_description="Registra una nueva variante genética asociada a un gen específico, incluyendo su posición, impacto clínico y frecuencia alélica.",
        request_body=VariantCreateSerializer,
        responses={
            201: openapi.Response(
                description="Variante creada exitosamente",
                schema=VariantSerializer
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            )
        },
        tags=['Variantes']
    )
    def create(self, request):
        serializer = VariantCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = VariantCreateDTO(**serializer.validated_data)
        variant_response = VariantService.create_variant(dto)
        
        return Response(
            VariantSerializer(GeneticVariant.objects.get(pk=variant_response.id)).data,
            status=status.HTTP_201_CREATED
        )
    
    @swagger_auto_schema(
        operation_summary="Listar todas las variantes",
        operation_description="Obtiene una lista paginada de todas las variantes genéticas registradas, incluyendo información del gen asociado.",
        responses={
            200: openapi.Response(
                description="Lista de variantes obtenida exitosamente",
                schema=VariantSerializer(many=True)
            )
        },
        tags=['Variantes']
    )
    def list(self, request):
        return super().list(request)
    
    @swagger_auto_schema(
        operation_summary="Obtener una variante específica",
        operation_description="Recupera los detalles completos de una variante genética por su ID, incluyendo el gen asociado.",
        responses={
            200: openapi.Response(
                description="Variante encontrada exitosamente",
                schema=VariantSerializer
            ),
            404: openapi.Response(
                description="Variante no encontrada",
                schema=MessageResponseSerializer
            )
        },
        tags=['Variantes']
    )
    def retrieve(self, request, pk=None):
        return super().retrieve(request, pk)
    
    @swagger_auto_schema(
        operation_summary="Actualizar una variante (completo)",
        operation_description="Actualiza todos los campos de una variante existente. Se requieren todos los campos.",
        request_body=VariantUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Variante actualizada exitosamente",
                schema=VariantSerializer
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            ),
            404: openapi.Response(
                description="Variante no encontrada",
                schema=MessageResponseSerializer
            )
        },
        tags=['Variantes']
    )
    def update(self, request, pk=None):
        serializer = VariantUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        dto = VariantUpdateDTO(**serializer.validated_data)
        VariantService.update_variant(pk, dto)
        
        return Response(
            VariantSerializer(GeneticVariant.objects.get(pk=pk)).data
        )
    
    @swagger_auto_schema(
        operation_summary="Actualizar una variante (parcial)",
        operation_description="Actualiza uno o más campos de una variante existente. Solo se requieren los campos a modificar.",
        request_body=VariantUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Variante actualizada exitosamente",
                schema=VariantSerializer
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            ),
            404: openapi.Response(
                description="Variante no encontrada",
                schema=MessageResponseSerializer
            )
        },
        tags=['Variantes']
    )
    def partial_update(self, request, pk=None):
        serializer = VariantUpdateSerializer(data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        dto = VariantUpdateDTO(**serializer.validated_data)
        VariantService.update_variant(pk, dto)
        
        return Response(
            VariantSerializer(GeneticVariant.objects.get(pk=pk)).data
        )
    
    @swagger_auto_schema(
        operation_summary="Eliminar una variante",
        operation_description="Elimina permanentemente una variante genética del sistema. Esta acción no se puede deshacer.",
        responses={
            204: openapi.Response(description="Variante eliminada exitosamente"),
            404: openapi.Response(
                description="Variante no encontrada",
                schema=MessageResponseSerializer
            )
        },
        tags=['Variantes']
    )
    def destroy(self, request, pk=None):
        VariantService.delete_variant(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    @swagger_auto_schema(
        operation_summary="Obtener variantes por gen",
        operation_description="Recupera todas las variantes genéticas asociadas a un gen específico.",
        responses={
            200: openapi.Response(
                description="Variantes encontradas exitosamente",
                schema=VariantSerializer(many=True)
            ),
            404: openapi.Response(
                description="Gen no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Variantes']
    )
    @action(detail=False, methods=['get'], url_path='by-gene/(?P<gene_id>[0-9]+)')
    def by_gene(self, request, gene_id=None):
        variants = VariantService.get_variants_by_gene(gene_id)
        return Response(VariantSerializer(variants, many=True).data)
    
    @swagger_auto_schema(
        operation_summary="Filtrar variantes por impacto clínico",
        operation_description="Obtiene todas las variantes filtradas por su nivel de impacto clínico (High, Moderate, Low, Unknown).",
        manual_parameters=[
            openapi.Parameter(
                'impact',
                openapi.IN_QUERY,
                description="Nivel de impacto clínico (High, Moderate, Low, Unknown)",
                type=openapi.TYPE_STRING,
                required=True,
                enum=['High', 'Moderate', 'Low', 'Unknown']
            )
        ],
        responses={
            200: openapi.Response(
                description="Variantes filtradas exitosamente",
                schema=VariantSerializer(many=True)
            )
        },
        tags=['Variantes']
    )
    @action(detail=False, methods=['get'])
    def by_impact(self, request):
        impact = request.query_params.get('impact', 'Unknown')
        variants = VariantService.get_variants_by_impact(impact)
        return Response(VariantSerializer(variants, many=True).data)


class ReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar reportes de variantes en pacientes.
    
    Proporciona operaciones CRUD completas para reportes de variantes genéticas
    detectadas en pacientes, incluyendo enriquecimiento con datos del paciente.
    """
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
    
    @swagger_auto_schema(
        operation_summary="Crear un nuevo reporte de variante",
        operation_description="Registra una nueva detección de variante genética en un paciente específico, incluyendo la fecha de detección y frecuencia alélica.",
        request_body=ReportCreateSerializer,
        responses={
            201: openapi.Response(
                description="Reporte creado exitosamente",
                schema=ReportSerializer,
                examples={
                    'application/json': {
                        'id': 1,
                        'patient_id': '550e8400-e29b-41d4-a716-446655440000',
                        'patient_name': 'Juan Pérez',
                        'variant_id': 5,
                        'gene_symbol': 'BRCA1',
                        'chromosome': '17',
                        'position': 43044295,
                        'impact': 'High',
                        'detection_date': '2024-01-15',
                        'allele_frequency': 0.45
                    }
                }
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            )
        },
        tags=['Reportes']
    )
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

    @swagger_auto_schema(
        operation_summary="Obtener un reporte específico",
        operation_description="Recupera los detalles completos de un reporte de variante, incluyendo información del paciente y la variante genética detectada.",
        responses={
            200: openapi.Response(
                description="Reporte encontrado exitosamente",
                schema=ReportSerializer
            ),
            404: openapi.Response(
                description="Reporte no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Reportes']
    )
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

    @swagger_auto_schema(
        operation_summary="Listar reportes con filtros",
        operation_description="Obtiene una lista de reportes enriquecida con datos de pacientes. Permite filtrar por ID de paciente, variante o gen.",
        manual_parameters=[
            openapi.Parameter(
                'patient_id',
                openapi.IN_QUERY,
                description="ID del paciente (UUID)",
                type=openapi.TYPE_STRING,
                required=False
            ),
            openapi.Parameter(
                'variant_id',
                openapi.IN_QUERY,
                description="ID de la variante genética",
                type=openapi.TYPE_INTEGER,
                required=False
            ),
            openapi.Parameter(
                'gene_id',
                openapi.IN_QUERY,
                description="ID del gen",
                type=openapi.TYPE_INTEGER,
                required=False
            )
        ],
        responses={
            200: openapi.Response(
                description="Lista de reportes obtenida exitosamente",
                schema=ReportSerializer(many=True)
            )
        },
        tags=['Reportes']
    )
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

    @swagger_auto_schema(
        operation_summary="Actualizar un reporte",
        operation_description="Actualiza los campos modificables de un reporte existente (fecha de detección y frecuencia alélica).",
        request_body=ReportUpdateSerializer,
        responses={
            200: openapi.Response(
                description="Reporte actualizado exitosamente",
                schema=ReportSerializer
            ),
            400: openapi.Response(
                description="Datos de entrada inválidos",
                schema=ErrorResponseSerializer
            ),
            404: openapi.Response(
                description="Reporte no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Reportes']
    )
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

    @swagger_auto_schema(
        operation_summary="Eliminar un reporte",
        operation_description="Elimina permanentemente un reporte de variante del sistema. Esta acción no se puede deshacer.",
        responses={
            204: openapi.Response(description="Reporte eliminado exitosamente"),
            404: openapi.Response(
                description="Reporte no encontrado",
                schema=MessageResponseSerializer
            )
        },
        tags=['Reportes']
    )
    def destroy(self, request, pk=None):
        self.report_service.delete_report(pk)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        operation_summary="Obtener reportes de un paciente",
        operation_description="Recupera todos los reportes de variantes genéticas detectadas en un paciente específico, enriquecidos con datos del paciente.",
        responses={
            200: openapi.Response(
                description="Reportes del paciente obtenidos exitosamente",
                schema=ReportSerializer(many=True)
            ),
            404: openapi.Response(
                description="Paciente no encontrado o sin reportes",
                schema=MessageResponseSerializer
            )
        },
        tags=['Reportes']
    )
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