from django.db import transaction
from genetics.models import Gene
from genetics.dto.gene_dto import GeneCreateDTO, GeneUpdateDTO, GeneResponseDTO
from genetics.repositories.gene_repository import GeneRepository
from rest_framework.exceptions import ValidationError, NotFound
import logging

logger = logging.getLogger(__name__)


class GeneService:
    """Servicio para gestión de genes oncológicos"""
    
    @staticmethod
    def create_gene(dto: GeneCreateDTO) -> GeneResponseDTO:
        """
        Crea un nuevo gen
        
        Args:
            dto: DTO con datos del gen a crear
            
        Returns:
            GeneResponseDTO: DTO con datos del gen creado
            
        Raises:
            ValidationError: Si hay errores de validación
        """
        # Validar DTO
        errors = dto.validate()
        if errors:
            logger.warning(f"Errores de validación al crear gen: {errors}")
            raise ValidationError({'errors': errors})
        
        # Validar que no exista un gen con el mismo símbolo
        if GeneRepository.exists_by_symbol(dto.symbol):
            logger.warning(f"Intento de crear gen duplicado: {dto.symbol}")
            raise ValidationError({'symbol': 'Ya existe un gen con este símbolo'})
        
        try:
            with transaction.atomic():
                gene = GeneRepository.create(
                    symbol=dto.symbol,
                    full_name=dto.full_name,
                    function_summary=dto.function_summary
                )
                logger.info(f"Gen creado exitosamente: {gene.symbol} (ID: {gene.id})")
        except Exception as e:
            logger.error(f"Error al crear gen: {str(e)}")
            raise ValidationError({'error': 'Error al crear el gen'})
        
        return GeneResponseDTO.from_model(gene)
    
    @staticmethod
    def update_gene(gene_id: int, dto: GeneUpdateDTO) -> GeneResponseDTO:
        """
        Actualiza un gen existente
        
        Args:
            gene_id: ID del gen a actualizar
            dto: DTO con datos a actualizar
            
        Returns:
            GeneResponseDTO: DTO con datos del gen actualizado
            
        Raises:
            NotFound: Si el gen no existe
            ValidationError: Si hay errores de validación
        """
        # Validar DTO
        errors = dto.validate()
        if errors:
            logger.warning(f"Errores de validación al actualizar gen {gene_id}: {errors}")
            raise ValidationError({'errors': errors})
        
        # Buscar gen
        gene = GeneRepository.find_by_id(gene_id)
        if not gene:
            logger.warning(f"Intento de actualizar gen inexistente: {gene_id}")
            raise NotFound('Gen no encontrado')
        
        # Si se actualiza el símbolo, validar que no exista otro gen con ese símbolo
        if dto.symbol and dto.symbol != gene.symbol:
            if GeneRepository.exists_by_symbol(dto.symbol):
                logger.warning(f"Intento de actualizar gen {gene_id} con símbolo duplicado: {dto.symbol}")
                raise ValidationError({'symbol': 'Ya existe un gen con este símbolo'})
        
        try:
            with transaction.atomic():
                gene = GeneRepository.update(
                    gene=gene,
                    symbol=dto.symbol,
                    full_name=dto.full_name,
                    function_summary=dto.function_summary
                )
                logger.info(f"Gen actualizado exitosamente: {gene.symbol} (ID: {gene.id})")
        except Exception as e:
            logger.error(f"Error al actualizar gen {gene_id}: {str(e)}")
            raise ValidationError({'error': 'Error al actualizar el gen'})
        
        return GeneResponseDTO.from_model(gene)
    
    @staticmethod
    def get_gene(gene_id: int) -> GeneResponseDTO:
        """
        Obtiene un gen por ID
        
        Args:
            gene_id: ID del gen
            
        Returns:
            GeneResponseDTO: DTO con datos del gen
            
        Raises:
            NotFound: Si el gen no existe
        """
        gene = GeneRepository.find_by_id(gene_id)
        if not gene:
            logger.warning(f"Intento de obtener gen inexistente: {gene_id}")
            raise NotFound('Gen no encontrado')
        
        return GeneResponseDTO.from_model(gene)
    
    @staticmethod
    def list_genes(filters=None):
        """
        Lista todos los genes con filtros opcionales
        
        Args:
            filters: Diccionario con filtros opcionales
                    - symbol: Filtrar por símbolo (búsqueda parcial)
                    - full_name: Filtrar por nombre (búsqueda parcial)
                    - query: Búsqueda general en símbolo y nombre
            
        Returns:
            QuerySet: Genes que coinciden con los filtros
        """
        if not filters:
            return Gene.objects.all()
        
        # Si hay una búsqueda general
        if 'query' in filters and filters['query']:
            genes = GeneRepository.search(filters['query'])
            return genes
        
        # Filtros específicos
        queryset = Gene.objects.all()
        
        if 'symbol' in filters and filters['symbol']:
            genes = GeneRepository.search_by_symbol(filters['symbol'])
            return genes
        
        if 'full_name' in filters and filters['full_name']:
            genes = GeneRepository.search_by_name(filters['full_name'])
            return genes
        
        return queryset
    
    @staticmethod
    def delete_gene(gene_id: int):
        """
        Elimina un gen
        
        Args:
            gene_id: ID del gen a eliminar
            
        Raises:
            NotFound: Si el gen no existe
        """
        gene = GeneRepository.find_by_id(gene_id)
        if not gene:
            logger.warning(f"Intento de eliminar gen inexistente: {gene_id}")
            raise NotFound('Gen no encontrado')
        
        try:
            # Verificar si tiene variantes asociadas
            variant_count = gene.variants.count()
            if variant_count > 0:
                logger.warning(
                    f"Intento de eliminar gen {gene_id} con {variant_count} variantes asociadas"
                )
                raise ValidationError({
                    'error': f'No se puede eliminar el gen porque tiene {variant_count} variante(s) asociada(s)'
                })
            
            with transaction.atomic():
                symbol = gene.symbol
                GeneRepository.delete(gene)
                logger.info(f"Gen eliminado exitosamente: {symbol} (ID: {gene_id})")
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"Error al eliminar gen {gene_id}: {str(e)}")
            raise ValidationError({'error': 'Error al eliminar el gen'})
    
    @staticmethod
    def search_genes_by_symbol(symbol: str):
        """
        Busca genes por símbolo (búsqueda parcial)
        
        Args:
            symbol: Patrón a buscar en el símbolo
            
        Returns:
            Lista de genes que coinciden
        """
        if not symbol or len(symbol.strip()) == 0:
            return []
        
        genes = GeneRepository.search_by_symbol(symbol.strip())
        logger.info(f"Búsqueda de genes por símbolo '{symbol}': {len(genes)} resultados")
        return genes
    
    @staticmethod
    def get_gene_statistics():
        """
        Obtiene estadísticas de genes
        
        Returns:
            dict: Diccionario con estadísticas
        """
        total_genes = GeneRepository.count()
        
        # Contar genes con variantes
        genes_with_variants = Gene.objects.filter(variants__isnull=False).distinct().count()
        
        statistics = {
            'total_genes': total_genes,
            'genes_with_variants': genes_with_variants,
            'genes_without_variants': total_genes - genes_with_variants
        }
        
        logger.info(f"Estadísticas de genes: {statistics}")
        return statistics
    
    @staticmethod
    def bulk_create_genes(genes_data: list) -> list:
        """
        Crea múltiples genes en una sola operación
        
        Args:
            genes_data: Lista de diccionarios con datos de genes
                       Ejemplo: [{'symbol': 'BRCA1', 'full_name': '...', 'function_summary': '...'}]
            
        Returns:
            list: Lista de GeneResponseDTO creados
            
        Raises:
            ValidationError: Si hay errores de validación
        """
        created_genes = []
        errors = []
        
        with transaction.atomic():
            for idx, gene_data in enumerate(genes_data):
                try:
                    dto = GeneCreateDTO(**gene_data)
                    validation_errors = dto.validate()
                    
                    if validation_errors:
                        errors.append({
                            'index': idx,
                            'data': gene_data,
                            'errors': validation_errors
                        })
                        continue
                    
                    # Verificar duplicados
                    if GeneRepository.exists_by_symbol(dto.symbol):
                        errors.append({
                            'index': idx,
                            'data': gene_data,
                            'errors': [f'Gen con símbolo {dto.symbol} ya existe']
                        })
                        continue
                    
                    gene = GeneRepository.create(
                        symbol=dto.symbol,
                        full_name=dto.full_name,
                        function_summary=dto.function_summary
                    )
                    created_genes.append(GeneResponseDTO.from_model(gene))
                    
                except Exception as e:
                    errors.append({
                        'index': idx,
                        'data': gene_data,
                        'errors': [str(e)]
                    })
        
        if errors:
            logger.warning(f"Errores en creación masiva de genes: {len(errors)} errores")
            raise ValidationError({
                'created': len(created_genes),
                'errors': errors
            })
        
        logger.info(f"Creación masiva exitosa: {len(created_genes)} genes creados")
        return created_genes