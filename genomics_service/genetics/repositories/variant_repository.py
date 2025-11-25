from typing import Optional, List
from uuid import UUID
from genetics.models import Gene, GeneticVariant
from django.db.models import Q


class VariantRepository:
    """Repositorio para operaciones de acceso a datos de variantes genéticas"""
    
    @staticmethod
    def create(gene: Gene, chromosome: Optional[str] = None,
               position: Optional[int] = None,
               reference_base: Optional[str] = None,
               alternate_base: Optional[str] = None,
               impact: str = 'Unknown') -> GeneticVariant:
        """
        Crea una nueva variante genética
        
        Args:
            gene: Instancia del gen asociado
            chromosome: Cromosoma
            position: Posición en el cromosoma
            reference_base: Base de referencia
            alternate_base: Base alternativa
            impact: Tipo de impacto
            
        Returns:
            GeneticVariant: Instancia de la variante creada
        """
        variant = GeneticVariant.objects.create(
            gene=gene,
            chromosome=chromosome,
            position=position,
            reference_base=reference_base,
            alternate_base=alternate_base,
            impact=impact
        )
        return variant
    
    @staticmethod
    def find_by_id(variant_id: str) -> Optional[GeneticVariant]:
        """
        Busca una variante por su ID
        
        Args:
            variant_id: UUID de la variante
            
        Returns:
            GeneticVariant o None si no existe
        """
        try:
            return GeneticVariant.objects.select_related('gene').get(pk=variant_id)
        except GeneticVariant.DoesNotExist:
            return None
    
    @staticmethod
    def find_all() -> List[GeneticVariant]:
        """
        Obtiene todas las variantes
        
        Returns:
            Lista de variantes
        """
        return list(GeneticVariant.objects.select_related('gene').all())
    
    @staticmethod
    def find_by_gene(gene: Gene) -> List[GeneticVariant]:
        """
        Busca variantes por gen
        
        Args:
            gene: Instancia del gen
            
        Returns:
            Lista de variantes del gen
        """
        return list(GeneticVariant.objects.select_related('gene').filter(gene=gene))
    
    @staticmethod
    def find_by_gene_id(gene_id: int) -> List[GeneticVariant]:
        """
        Busca variantes por ID de gen
        
        Args:
            gene_id: ID del gen
            
        Returns:
            Lista de variantes del gen
        """
        return list(GeneticVariant.objects.select_related('gene').filter(gene_id=gene_id))
    
    @staticmethod
    def find_by_chromosome(chromosome: str) -> List[GeneticVariant]:
        """
        Busca variantes por cromosoma
        
        Args:
            chromosome: Número/nombre del cromosoma
            
        Returns:
            Lista de variantes en el cromosoma
        """
        return list(GeneticVariant.objects.select_related('gene').filter(
            chromosome=chromosome
        ))
    
    @staticmethod
    def find_by_chromosome_and_position(chromosome: str, position: int) -> List[GeneticVariant]:
        """
        Busca variantes por cromosoma y posición
        
        Args:
            chromosome: Número/nombre del cromosoma
            position: Posición en el cromosoma
            
        Returns:
            Lista de variantes en la posición
        """
        return list(GeneticVariant.objects.select_related('gene').filter(
            chromosome=chromosome,
            position=position
        ))
    
    @staticmethod
    def find_by_impact(impact: str) -> List[GeneticVariant]:
        """
        Busca variantes por tipo de impacto
        
        Args:
            impact: Tipo de impacto (Missense, Frameshift, etc.)
            
        Returns:
            Lista de variantes con el impacto especificado
        """
        return list(GeneticVariant.objects.select_related('gene').filter(impact=impact))
    
    @staticmethod
    def find_by_gene_and_impact(gene_id: int, impact: str) -> List[GeneticVariant]:
        """
        Busca variantes por gen e impacto
        
        Args:
            gene_id: ID del gen
            impact: Tipo de impacto
            
        Returns:
            Lista de variantes que coinciden
        """
        return list(GeneticVariant.objects.select_related('gene').filter(
            gene_id=gene_id,
            impact=impact
        ))
    
    @staticmethod
    def find_by_position_range(chromosome: str, start_position: int, 
                               end_position: int) -> List[GeneticVariant]:
        """
        Busca variantes en un rango de posiciones
        
        Args:
            chromosome: Cromosoma
            start_position: Posición inicial
            end_position: Posición final
            
        Returns:
            Lista de variantes en el rango
        """
        return list(GeneticVariant.objects.select_related('gene').filter(
            chromosome=chromosome,
            position__gte=start_position,
            position__lte=end_position
        ))
    
    @staticmethod
    def update(variant: GeneticVariant, gene: Optional[Gene] = None,
               chromosome: Optional[str] = None,
               position: Optional[int] = None,
               reference_base: Optional[str] = None,
               alternate_base: Optional[str] = None,
               impact: Optional[str] = None) -> GeneticVariant:
        """
        Actualiza una variante existente
        
        Args:
            variant: Instancia de la variante a actualizar
            gene: Nuevo gen (opcional)
            chromosome: Nuevo cromosoma (opcional)
            position: Nueva posición (opcional)
            reference_base: Nueva base de referencia (opcional)
            alternate_base: Nueva base alternativa (opcional)
            impact: Nuevo impacto (opcional)
            
        Returns:
            GeneticVariant: Instancia actualizada
        """
        if gene is not None:
            variant.gene = gene
        if chromosome is not None:
            variant.chromosome = chromosome
        if position is not None:
            variant.position = position
        if reference_base is not None:
            variant.reference_base = reference_base
        if alternate_base is not None:
            variant.alternate_base = alternate_base
        if impact is not None:
            variant.impact = impact
        
        variant.save()
        return variant
    
    @staticmethod
    def delete(variant: GeneticVariant) -> None:
        """
        Elimina una variante
        
        Args:
            variant: Instancia de la variante a eliminar
        """
        variant.delete()
    
    @staticmethod
    def delete_by_id(variant_id: str) -> bool:
        """
        Elimina una variante por su ID
        
        Args:
            variant_id: UUID de la variante
            
        Returns:
            bool: True si se eliminó, False si no existía
        """
        deleted, _ = GeneticVariant.objects.filter(pk=variant_id).delete()
        return deleted > 0
    
    @staticmethod
    def count() -> int:
        """
        Cuenta el número total de variantes
        
        Returns:
            int: Número de variantes
        """
        return GeneticVariant.objects.count()
    
    @staticmethod
    def count_by_gene(gene_id: int) -> int:
        """
        Cuenta variantes de un gen específico
        
        Args:
            gene_id: ID del gen
            
        Returns:
            int: Número de variantes del gen
        """
        return GeneticVariant.objects.filter(gene_id=gene_id).count()
    
    @staticmethod
    def count_by_impact(impact: str) -> int:
        """
        Cuenta variantes por tipo de impacto
        
        Args:
            impact: Tipo de impacto
            
        Returns:
            int: Número de variantes con ese impacto
        """
        return GeneticVariant.objects.filter(impact=impact).count()
    
    @staticmethod
    def paginate(page: int = 1, page_size: int = 10):
        """
        Obtiene variantes paginadas
        
        Args:
            page: Número de página (1-indexed)
            page_size: Tamaño de página
            
        Returns:
            QuerySet: Variantes de la página especificada
        """
        start = (page - 1) * page_size
        end = start + page_size
        return GeneticVariant.objects.select_related('gene').all()[start:end]