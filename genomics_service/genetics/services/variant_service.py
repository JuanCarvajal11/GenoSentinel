from django.db import transaction
from genetics.models import Gene, GeneticVariant
from genetics.dto.variant_dto import VariantCreateDTO, VariantUpdateDTO, VariantResponseDTO
from genetics.repositories.gene_repository import GeneRepository
from genetics.repositories.variant_repository import VariantRepository
from rest_framework.exceptions import ValidationError, NotFound
import logging

logger = logging.getLogger(__name__)


class VariantService:
    """Servicio para gestión de variantes genéticas"""
    
    @staticmethod
    def create_variant(dto: VariantCreateDTO) -> VariantResponseDTO:
        """
        Crea una nueva variante genética
        
        Args:
            dto: DTO con datos de la variante a crear
            
        Returns:
            VariantResponseDTO: DTO con datos de la variante creada
            
        Raises:
            ValidationError: Si hay errores de validación
        """
        # Validar DTO
        errors = dto.validate()
        if errors:
            logger.warning(f"Errores de validación al crear variante: {errors}")
            raise ValidationError({'errors': errors})
        
        # Validar que el gen exista
        gene = GeneRepository.find_by_id(dto.gene_id)
        if not gene:
            logger.warning(f"Intento de crear variante con gen inexistente: {dto.gene_id}")
            raise ValidationError({'gene_id': 'El gen especificado no existe'})
        
        try:
            with transaction.atomic():
                variant = VariantRepository.create(
                    gene=gene,
                    chromosome=dto.chromosome,
                    position=dto.position,
                    reference_base=dto.reference_base,
                    alternate_base=dto.alternate_base,
                    impact=dto.impact
                )
                logger.info(
                    f"Variante creada exitosamente: {variant.id} para gen {gene.symbol}"
                )
        except Exception as e:
            logger.error(f"Error al crear variante: {str(e)}")
            raise ValidationError({'error': 'Error al crear la variante'})
        
        return VariantResponseDTO.from_model(variant)
    
    @staticmethod
    def update_variant(variant_id: str, dto: VariantUpdateDTO) -> VariantResponseDTO:
        """
        Actualiza una variante genética existente
        
        Args:
            variant_id: UUID de la variante
            dto: DTO con datos a actualizar
            
        Returns:
            VariantResponseDTO: DTO con datos de la variante actualizada
            
        Raises:
            NotFound: Si la variante no existe
            ValidationError: Si hay errores de validación
        """
        # Validar DTO
        errors = dto.validate()
        if errors:
            logger.warning(f"Errores de validación al actualizar variante {variant_id}: {errors}")
            raise ValidationError({'errors': errors})
        
        # Buscar variante
        variant = VariantRepository.find_by_id(variant_id)
        if not variant:
            logger.warning(f"Intento de actualizar variante inexistente: {variant_id}")
            raise NotFound('Variante no encontrada')
        
        # Si se actualiza el gen, validar que exista
        gene = None
        if dto.gene_id is not None:
            gene = GeneRepository.find_by_id(dto.gene_id)
            if not gene:
                logger.warning(
                    f"Intento de actualizar variante {variant_id} con gen inexistente: {dto.gene_id}"
                )
                raise ValidationError({'gene_id': 'El gen especificado no existe'})
        
        try:
            with transaction.atomic():
                variant = VariantRepository.update(
                    variant=variant,
                    gene=gene,
                    chromosome=dto.chromosome,
                    position=dto.position,
                    reference_base=dto.reference_base,
                    alternate_base=dto.alternate_base,
                    impact=dto.impact
                )
                logger.info(f"Variante actualizada exitosamente: {variant_id}")
        except Exception as e:
            logger.error(f"Error al actualizar variante {variant_id}: {str(e)}")
            raise ValidationError({'error': 'Error al actualizar la variante'})
        
        return VariantResponseDTO.from_model(variant)
    
    @staticmethod
    def get_variant(variant_id: str) -> VariantResponseDTO:
        """
        Obtiene una variante por ID
        
        Args:
            variant_id: UUID de la variante
            
        Returns:
            VariantResponseDTO: DTO con datos de la variante
            
        Raises:
            NotFound: Si la variante no existe
        """
        variant = VariantRepository.find_by_id(variant_id)
        if not variant:
            logger.warning(f"Intento de obtener variante inexistente: {variant_id}")
            raise NotFound('Variante no encontrada')
        
        return VariantResponseDTO.from_model(variant)
    
    @staticmethod
    def list_variants(filters=None):
        """
        Lista todas las variantes con filtros opcionales
        
        Args:
            filters: Diccionario con filtros opcionales
                    - gene_id: Filtrar por ID de gen
                    - chromosome: Filtrar por cromosoma
                    - impact: Filtrar por tipo de impacto
                    - gene_symbol: Filtrar por símbolo de gen (búsqueda parcial)
                    - position_start: Posición inicial (con chromosome)
                    - position_end: Posición final (con chromosome)
            
        Returns:
            QuerySet o lista de variantes que coinciden con los filtros
        """
        if not filters:
            return GeneticVariant.objects.select_related('gene').all()
        
        # Filtro por gen
        if 'gene_id' in filters and filters['gene_id']:
            return VariantRepository.find_by_gene_id(filters['gene_id'])
        
        # Filtro por cromosoma y rango de posición
        if ('chromosome' in filters and filters['chromosome'] and
            'position_start' in filters and 'position_end' in filters):
            return VariantRepository.find_by_position_range(
                chromosome=filters['chromosome'],
                start_position=filters['position_start'],
                end_position=filters['position_end']
            )
        
        # Filtro por cromosoma
        if 'chromosome' in filters and filters['chromosome']:
            return VariantRepository.find_by_chromosome(filters['chromosome'])
        
        # Filtro por impacto
        if 'impact' in filters and filters['impact']:
            return VariantRepository.find_by_impact(filters['impact'])
        
        # Filtro por símbolo de gen
        if 'gene_symbol' in filters and filters['gene_symbol']:
            queryset = GeneticVariant.objects.select_related('gene').filter(
                gene__symbol__icontains=filters['gene_symbol']
            )
            return queryset
        
        return GeneticVariant.objects.select_related('gene').all()
    
    @staticmethod
    def delete_variant(variant_id: str):
        """
        Elimina una variante
        
        Args:
            variant_id: UUID de la variante a eliminar
            
        Raises:
            NotFound: Si la variante no existe
        """
        variant = VariantRepository.find_by_id(variant_id)
        if not variant:
            logger.warning(f"Intento de eliminar variante inexistente: {variant_id}")
            raise NotFound('Variante no encontrada')
        
        try:
            # Verificar si tiene reportes asociados
            report_count = variant.patient_reports.count()
            if report_count > 0:
                logger.warning(
                    f"Intento de eliminar variante {variant_id} con {report_count} reporte(s) asociado(s)"
                )
                raise ValidationError({
                    'error': f'No se puede eliminar la variante porque tiene {report_count} reporte(s) asociado(s)'
                })
            
            with transaction.atomic():
                VariantRepository.delete(variant)
                logger.info(f"Variante eliminada exitosamente: {variant_id}")
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error al eliminar variante {variant_id}: {str(e)}")
            raise ValidationError({'error': 'Error al eliminar la variante'})
    
    @staticmethod
    def get_variants_by_gene(gene_id: int):
        """
        Obtiene todas las variantes de un gen específico
        
        Args:
            gene_id: ID del gen
            
        Returns:
            Lista de variantes del gen
            
        Raises:
            NotFound: Si el gen no existe
        """
        # Verificar que el gen existe
        gene = GeneRepository.find_by_id(gene_id)
        if not gene:
            logger.warning(f"Intento de obtener variantes de gen inexistente: {gene_id}")
            raise NotFound('Gen no encontrado')
        
        variants = VariantRepository.find_by_gene_id(gene_id)
        logger.info(f"Obtenidas {len(variants)} variantes para gen {gene_id}")
        return variants
    
    @staticmethod
    def get_variants_by_impact(impact: str):
        """
        Obtiene todas las variantes con un impacto específico
        
        Args:
            impact: Tipo de impacto
            
        Returns:
            Lista de variantes con ese impacto
        """
        # Validar que el impacto es válido
        valid_impacts = ['Missense', 'Frameshift', 'Nonsense', 'Silent', 'Unknown']
        if impact not in valid_impacts:
            logger.warning(f"Intento de filtrar por impacto inválido: {impact}")
            raise ValidationError({
                'impact': f'El impacto debe ser uno de: {", ".join(valid_impacts)}'
            })
        
        variants = VariantRepository.find_by_impact(impact)
        logger.info(f"Obtenidas {len(variants)} variantes con impacto {impact}")
        return variants
    
    @staticmethod
    def get_variants_by_chromosome(chromosome: str):
        """
        Obtiene todas las variantes de un cromosoma específico
        
        Args:
            chromosome: Identificador del cromosoma
            
        Returns:
            Lista de variantes del cromosoma
        """
        variants = VariantRepository.find_by_chromosome(chromosome)
        logger.info(f"Obtenidas {len(variants)} variantes para cromosoma {chromosome}")
        return variants
    
    @staticmethod
    def get_variants_by_position(chromosome: str, position: int):
        """
        Obtiene variantes en una posición específica
        
        Args:
            chromosome: Identificador del cromosoma
            position: Posición en el cromosoma
            
        Returns:
            Lista de variantes en la posición
        """
        variants = VariantRepository.find_by_chromosome_and_position(chromosome, position)
        logger.info(
            f"Obtenidas {len(variants)} variantes en cromosoma {chromosome}, posición {position}"
        )
        return variants
    
    @staticmethod
    def get_variant_statistics():
        """
        Obtiene estadísticas de variantes
        
        Returns:
            dict: Diccionario con estadísticas
        """
        total_variants = VariantRepository.count()
        
        # Contar por impacto
        impact_counts = {}
        for impact in ['Missense', 'Frameshift', 'Nonsense', 'Silent', 'Unknown']:
            impact_counts[impact] = VariantRepository.count_by_impact(impact)
        
        # Variantes con reportes
        variants_with_reports = GeneticVariant.objects.filter(
            patient_reports__isnull=False
        ).distinct().count()
        
        statistics = {
            'total_variants': total_variants,
            'by_impact': impact_counts,
            'variants_with_reports': variants_with_reports,
            'variants_without_reports': total_variants - variants_with_reports
        }
        
        logger.info(f"Estadísticas de variantes: {statistics}")
        return statistics
    
    @staticmethod
    def search_variants_in_range(chromosome: str, start_position: int, end_position: int):
        """
        Busca variantes en un rango de posiciones
        
        Args:
            chromosome: Identificador del cromosoma
            start_position: Posición inicial
            end_position: Posición final
            
        Returns:
            Lista de variantes en el rango
            
        Raises:
            ValidationError: Si el rango es inválido
        """
        if start_position > end_position:
            raise ValidationError({
                'error': 'La posición inicial debe ser menor o igual a la posición final'
            })
        
        variants = VariantRepository.find_by_position_range(
            chromosome, start_position, end_position
        )
        logger.info(
            f"Obtenidas {len(variants)} variantes en cromosoma {chromosome}, "
            f"rango {start_position}-{end_position}"
        )
        return variants
    
    @staticmethod
    def bulk_create_variants(variants_data: list) -> list:
        """
        Crea múltiples variantes en una sola operación
        
        Args:
            variants_data: Lista de diccionarios con datos de variantes
            
        Returns:
            list: Lista de VariantResponseDTO creados
            
        Raises:
            ValidationError: Si hay errores de validación
        """
        created_variants = []
        errors = []
        
        with transaction.atomic():
            for idx, variant_data in enumerate(variants_data):
                try:
                    dto = VariantCreateDTO(**variant_data)
                    validation_errors = dto.validate()
                    
                    if validation_errors:
                        errors.append({
                            'index': idx,
                            'data': variant_data,
                            'errors': validation_errors
                        })
                        continue
                    
                    # Verificar que el gen existe
                    gene = GeneRepository.find_by_id(dto.gene_id)
                    if not gene:
                        errors.append({
                            'index': idx,
                            'data': variant_data,
                            'errors': ['Gen no encontrado']
                        })
                        continue
                    
                    variant = VariantRepository.create(
                        gene=gene,
                        chromosome=dto.chromosome,
                        position=dto.position,
                        reference_base=dto.reference_base,
                        alternate_base=dto.alternate_base,
                        impact=dto.impact
                    )
                    created_variants.append(VariantResponseDTO.from_model(variant))
                    
                except Exception as e:
                    errors.append({
                        'index': idx,
                        'data': variant_data,
                        'errors': [str(e)]
                    })
        
        if errors:
            logger.warning(f"Errores en creación masiva de variantes: {len(errors)} errores")
            raise ValidationError({
                'created': len(created_variants),
                'errors': errors
            })
        
        logger.info(f"Creación masiva exitosa: {len(created_variants)} variantes creadas")
        return created_variants