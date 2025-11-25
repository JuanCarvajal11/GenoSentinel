from typing import Optional, List
from genetics.models import Gene
from django.db.models import Q


class GeneRepository:
    """Repositorio para operaciones de acceso a datos de genes"""
    
    @staticmethod
    def create(symbol: str, full_name: Optional[str] = None, 
               function_summary: Optional[str] = None) -> Gene:
        """
        Crea un nuevo gen en la base de datos
        
        Args:
            symbol: Símbolo del gen
            full_name: Nombre completo del gen
            function_summary: Resumen de la función del gen
            
        Returns:
            Gene: Instancia del gen creado
        """
        gene = Gene.objects.create(
            symbol=symbol,
            full_name=full_name,
            function_summary=function_summary
        )
        return gene
    
    @staticmethod
    def find_by_id(gene_id: int) -> Optional[Gene]:
        """
        Busca un gen por su ID
        
        Args:
            gene_id: ID del gen
            
        Returns:
            Gene o None si no existe
        """
        try:
            return Gene.objects.get(pk=gene_id)
        except Gene.DoesNotExist:
            return None
    
    @staticmethod
    def find_by_symbol(symbol: str) -> Optional[Gene]:
        """
        Busca un gen por su símbolo (exacto)
        
        Args:
            symbol: Símbolo del gen
            
        Returns:
            Gene o None si no existe
        """
        try:
            return Gene.objects.get(symbol=symbol)
        except Gene.DoesNotExist:
            return None
    
    @staticmethod
    def exists_by_symbol(symbol: str) -> bool:
        """
        Verifica si existe un gen con el símbolo dado
        
        Args:
            symbol: Símbolo del gen
            
        Returns:
            bool: True si existe, False en caso contrario
        """
        return Gene.objects.filter(symbol=symbol).exists()
    
    @staticmethod
    def find_all() -> List[Gene]:
        """
        Obtiene todos los genes
        
        Returns:
            Lista de genes
        """
        return list(Gene.objects.all())
    
    @staticmethod
    def search_by_symbol(symbol_pattern: str) -> List[Gene]:
        """
        Busca genes por patrón en el símbolo (búsqueda parcial)
        
        Args:
            symbol_pattern: Patrón a buscar en el símbolo
            
        Returns:
            Lista de genes que coinciden
        """
        return list(Gene.objects.filter(symbol__icontains=symbol_pattern))
    
    @staticmethod
    def search_by_name(name_pattern: str) -> List[Gene]:
        """
        Busca genes por patrón en el nombre completo
        
        Args:
            name_pattern: Patrón a buscar en el nombre
            
        Returns:
            Lista de genes que coinciden
        """
        return list(Gene.objects.filter(full_name__icontains=name_pattern))
    
    @staticmethod
    def search(query: str) -> List[Gene]:
        """
        Busca genes por patrón en símbolo o nombre completo
        
        Args:
            query: Texto a buscar
            
        Returns:
            Lista de genes que coinciden
        """
        return list(Gene.objects.filter(
            Q(symbol__icontains=query) | Q(full_name__icontains=query)
        ))
    
    @staticmethod
    def update(gene: Gene, symbol: Optional[str] = None,
               full_name: Optional[str] = None,
               function_summary: Optional[str] = None) -> Gene:
        """
        Actualiza un gen existente
        
        Args:
            gene: Instancia del gen a actualizar
            symbol: Nuevo símbolo (opcional)
            full_name: Nuevo nombre completo (opcional)
            function_summary: Nuevo resumen funcional (opcional)
            
        Returns:
            Gene: Instancia actualizada
        """
        if symbol is not None:
            gene.symbol = symbol
        if full_name is not None:
            gene.full_name = full_name
        if function_summary is not None:
            gene.function_summary = function_summary
        
        gene.save()
        return gene
    
    @staticmethod
    def delete(gene: Gene) -> None:
        """
        Elimina un gen de la base de datos
        
        Args:
            gene: Instancia del gen a eliminar
        """
        gene.delete()
    
    @staticmethod
    def delete_by_id(gene_id: int) -> bool:
        """
        Elimina un gen por su ID
        
        Args:
            gene_id: ID del gen a eliminar
            
        Returns:
            bool: True si se eliminó, False si no existía
        """
        deleted, _ = Gene.objects.filter(pk=gene_id).delete()
        return deleted > 0
    
    @staticmethod
    def count() -> int:
        """
        Cuenta el número total de genes
        
        Returns:
            int: Número de genes
        """
        return Gene.objects.count()
    
    @staticmethod
    def paginate(page: int = 1, page_size: int = 10):
        """
        Obtiene genes paginados
        
        Args:
            page: Número de página (1-indexed)
            page_size: Tamaño de página
            
        Returns:
            QuerySet: Genes de la página especificada
        """
        start = (page - 1) * page_size
        end = start + page_size
        return Gene.objects.all()[start:end]