from dataclasses import dataclass
from typing import Optional
from uuid import UUID


@dataclass
class VariantCreateDTO:
    """DTO para crear una nueva variante genética"""
    gene_id: int
    chromosome: Optional[str] = None
    position: Optional[int] = None
    reference_base: Optional[str] = None
    alternate_base: Optional[str] = None
    impact: str = 'Unknown'

    def validate(self):
        """Valida los datos del DTO"""
        errors = []
        
        if not self.gene_id:
            errors.append("El ID del gen es requerido")
        
        if self.chromosome and len(self.chromosome) > 10:
            errors.append("El cromosoma no puede exceder 10 caracteres")
        
        if self.position is not None and self.position < 0:
            errors.append("La posición debe ser un número positivo")
        
        if self.reference_base and len(self.reference_base) > 1:
            errors.append("La base de referencia debe ser un solo carácter")
        
        if self.alternate_base and len(self.alternate_base) > 1:
            errors.append("La base alternativa debe ser un solo carácter")
        
        valid_impacts = ['Missense', 'Frameshift', 'Nonsense', 'Silent', 'Unknown']
        if self.impact not in valid_impacts:
            errors.append(f"El impacto debe ser uno de: {', '.join(valid_impacts)}")
        
        return errors


@dataclass
class VariantUpdateDTO:
    """DTO para actualizar una variante genética"""
    gene_id: Optional[int] = None
    chromosome: Optional[str] = None
    position: Optional[int] = None
    reference_base: Optional[str] = None
    alternate_base: Optional[str] = None
    impact: Optional[str] = None

    def validate(self):
        """Valida los datos del DTO"""
        errors = []
        
        if self.chromosome is not None and len(self.chromosome) > 10:
            errors.append("El cromosoma no puede exceder 10 caracteres")
        
        if self.position is not None and self.position < 0:
            errors.append("La posición debe ser un número positivo")
        
        if self.reference_base is not None and len(self.reference_base) > 1:
            errors.append("La base de referencia debe ser un solo carácter")
        
        if self.alternate_base is not None and len(self.alternate_base) > 1:
            errors.append("La base alternativa debe ser un solo carácter")
        
        if self.impact is not None:
            valid_impacts = ['Missense', 'Frameshift', 'Nonsense', 'Silent', 'Unknown']
            if self.impact not in valid_impacts:
                errors.append(f"El impacto debe ser uno de: {', '.join(valid_impacts)}")
        
        return errors


@dataclass
class VariantResponseDTO:
    """DTO para respuestas de variante genética"""
    id: str
    gene_id: int
    gene_symbol: str
    chromosome: Optional[str]
    position: Optional[int]
    reference_base: Optional[str]
    alternate_base: Optional[str]
    impact: str

    @classmethod
    def from_model(cls, variant):
        """Crea un DTO desde un modelo GeneticVariant"""
        return cls(
            id=str(variant.id),
            gene_id=variant.gene.id,
            gene_symbol=variant.gene.symbol,
            chromosome=variant.chromosome,
            position=variant.position,
            reference_base=variant.reference_base,
            alternate_base=variant.alternate_base,
            impact=variant.impact,
        )